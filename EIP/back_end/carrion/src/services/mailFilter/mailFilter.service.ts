import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { CreateJobApplyDto } from 'src/jobApply/dto/jobApply.dto';
import {
  JobApplyParams,
  JobApplyService,
  UpdateJobApply,
} from 'src/jobApply/jobApply.service';
import { ApplicationStatus } from 'src/jobApply/enum/application-status.enum';
import { ExtractedJobDataDto } from './dto/extracted-job-data.dto';
import {
  GmailMessage,
  GmailMessagePart,
  GmailHeader,
} from 'src/webhooks/gmail/gmail.types';
import { convert } from 'html-to-text';

function extractJsonFromString(str: string): any | null {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch (e) {
    throw new Error(`Failed to parse JSON directly: ${e.message}`);
  }
  const match = str.match(/```json\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e2) {
      Logger.warn(
        `Failed to parse JSON from markdown block: ${e2.message}`,
        'MailFilterService-JSONUtil',
      );
      return null;
    }
  }
  Logger.warn(
    `Failed to parse JSON directly and no markdown block found. Input was: ${str.substring(0, 100)}...`,
    'MailFilterService-JSONUtil',
  );
  return null;
}

@Injectable()
export class MailFilterService {
  private readonly logger = new Logger(MailFilterService.name);
  private openai: OpenAI;

  constructor(private readonly jobApplyService: JobApplyService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private decodeBase64Url(encoded?: string): string {
    if (!encoded) return '';
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      return Buffer.from(base64, 'base64').toString('utf-8');
    } catch (error) {
      this.logger.error('Failed to decode Base64URL string:', error);
      return `[Erreur de décodage: ${encoded.substring(0, 20)}...]`;
    }
  }

  private getHeaderValue(
    headers: GmailHeader[] | undefined,
    name: string,
  ): string | undefined {
    if (!headers) return undefined;
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    return header ? header.value : undefined;
  }

  private extractTextFromGmailPart(part: GmailMessagePart): string {
    let textContent = '';

    if (part.mimeType === 'text/plain' && part.body?.data) {
      textContent = this.decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      const htmlContent = this.decodeBase64Url(part.body.data);
      textContent = convert(htmlContent, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
        ],
      });
    } else if (part.mimeType.startsWith('multipart/') && part.parts) {
      if (part.mimeType === 'multipart/alternative') {
        const plainPart = part.parts.find((p) => p.mimeType === 'text/plain');
        if (plainPart) return this.extractTextFromGmailPart(plainPart);

        const htmlPart = part.parts.find((p) => p.mimeType === 'text/html');
        if (htmlPart) return this.extractTextFromGmailPart(htmlPart);
      }
      for (const subPart of part.parts) {
        const contentDisposition = this.getHeaderValue(
          subPart.headers,
          'Content-Disposition',
        );
        if (
          subPart.filename ||
          (contentDisposition && contentDisposition.startsWith('attachment'))
        ) {
          continue;
        }
        const subPartText = this.extractTextFromGmailPart(subPart);
        if (subPartText) {
          textContent += subPartText + '\n\n';
        }
      }
    }
    return textContent.trim();
  }

  async processEmailAndCreateJobApplyFromGmail(
    gmailMessage: GmailMessage,
    userId: string,
  ): Promise<string> {
    if (!gmailMessage || !gmailMessage.payload) {
      this.logger.error('Received invalid or empty gmailMessage object');
      throw new BadRequestException('Invalid email data provided.');
    }

    const subject = this.getHeaderValue(
      gmailMessage.payload.headers,
      'Subject',
    );

    const sender = this.getHeaderValue(gmailMessage.payload.headers, 'From');
    let bodyText = this.extractTextFromGmailPart(gmailMessage.payload);

    if (!bodyText && gmailMessage.snippet) {
      this.logger.warn(
        `No main body extracted for message ${gmailMessage.id}, using snippet.`,
      );
      bodyText = gmailMessage.snippet;
    }

    if (!bodyText) {
      this.logger.error(
        `Could not extract text body for message ${gmailMessage.id}`,
      );
      throw new BadRequestException(
        'Could not extract readable text from the email.',
      );
    }

    return this.processEmailWithExtractedData(
      bodyText,
      userId,
      subject,
      sender,
    );
  }

  private async processEmailWithExtractedData(
    emailText: string,
    userId: string,
    emailSubject?: string,
    emailSender?: string,
  ): Promise<string> {
    this.logger.log(
      `Processing email for user ${userId}. Subject: "${emailSubject}", Sender: "${emailSender}"`,
    );

    let emailContext = `Email Body:\n${emailText}\n`;
    if (emailSubject) {
      emailContext += `\nEmail Subject: ${emailSubject}\n`;
    }
    if (emailSender) {
      emailContext += `\nEmail Sender: ${emailSender}\n`;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Tu es un assistant expert en recrutement et en analyse d'emails de candidature.
    Ta tâche est d'extraire des informations précises d'un email lié à une candidature d'emploi et de déterminer le statut actuel de cette candidature.
    Réponds IMPÉRATIVEMENT au format JSON structuré comme suit :
    {
      "company": "Nom de l'entreprise (string), tu peux potentiellement le trouver dans l'envoie du mail ou dans le footer ou dans l'objet",
      "title": "Intitulé du poste (string)",
      "location": "Lieu du poste, le plus précis possible (string, optionnel)",
      "salary": "Salaire proposé (string, ex: '50000 EUR annuel' ou '3000 EUR mensuel', optionnel)",
      "contractType": "Type de contrat (ex: 'CDI', 'CDD', 'Stage', 'Alternance', 'Temps plein', 'Temps partiel', 'Freelance')",
      "status": "Statut de la candidature parmi (${Object.values(ApplicationStatus).join(', ')}). Choisis le statut le plus pertinent.",
      "interviewDate": "Date et heure de l'entretien au format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ) si mentionnée (string, optionnel)",
      "offerReference": "Numéro de référence de l'offre ou ID de candidature si présent (string, optionnel)"
    }
    Si une information n'est pas présente, mets la valeur à null ou ne l'inclus pas si optionnel (sauf pour 'status' qui est obligatoires).
    Analyse attentivement le sujet, l'expéditeur, le corps du mail, les signatures, l'objet aussi, regarder aussi si c'est une réponse à un mail.
    Si tu considère que le mail n'est pas un mail professionel de procédure de recrutement, renvoie null.
    Pour ce qui est des informations que tu me renvoies renvoies moi le contractType et le title en anglais, avec le bon titre, il faut que tu me renvoies toujours la même choses alors essaye de suivre un patterne ou une convention de titre.

    Guide pour déterminer 'status' (ON, OFF, PENDING):
    - PENDING: La candidature a été envoyée ou est en cours d'examen initial, mais aucune décision claire ou étape majeure (comme un entretien) n'est encore confirmée.
      Mots-clés typiques: 'candidature', 'postuler', 'CV' (envoi initial par l'utilisateur), 'remerciement de candidature', 'bien reçu', 'examinons votre profil', 'accusé de réception', 'test technique' (avant résultat), 'reviendrons vers vous', 'en cours d'évaluation après entretien/test'.
    - ON: Il y a une progression positive claire et active dans le processus.
      Mots-clés typiques: 'entretien planifié', 'interview', 'rendez-vous confirmé', 'invitation à un entretien', 'offre d'emploi', 'proposition de contrat', 'félicitations nous vous offrons', 'rejoindre notre équipe', 'j'accepte votre offre' (réponse du candidat à une offre), 'négociation en cours'.
    - OFF: La candidature est terminée, soit par un refus, soit par un retrait.
      Mots-clés typiques: 'ne donnerons pas suite', 'malheureusement', 'pas retenu', 'regrettons de vous informer', 'décline votre offre' (réponse du candidat), 'retire ma candidature' (par le candidat).
    Si l'email est une réponse (Re:, TR:), considère le contexte. Si le poste ou l'entreprise ne sont pas dans cet email spécifique mais étaient clairement établis dans un email précédent auquel celui-ci répond, essaie de les inférer si possible ou laisse les champs vides.
    L'information la plus importante est 'status'. Sois précis.
    `,
          },
          {
            role: 'user',
            content: emailContext,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      const rawResponse = response.choices[0].message.content;
      if (!rawResponse) {
        this.logger.error('OpenAI returned an empty response content.');
        throw new Error('OpenAI returned an empty response.');
      }
      this.logger.debug(`OpenAI raw response: ${rawResponse}`);

      const parsedData: ExtractedJobDataDto | null =
        extractJsonFromString(rawResponse);
      // DEBUG: À garder si on veut tester avec de la fake data psq openAI ça coute cher hein
      // const parsedData: ExtractedJobDataDto = {
      //   company: 'Epitech',
      //   title: 'ML Engineer',
      //   location: 'Paris',
      //   salary: '1000',
      //   contractType: 'CDI',
      //   status: ApplicationStatus.ON,
      //   interviewDate: null,
      //   offerReference: null,
      // };

      if (!parsedData) {
        this.logger.error(
          'Failed to parse JSON from OpenAI response.',
          rawResponse,
        );
        throw new Error('Erreur lors du parsing du JSON de la réponse OpenAI.');
      }

      this.logger.debug(`OpenAI parsed data: ${JSON.stringify(parsedData)}`);

      if (
        !parsedData.status ||
        !Object.values(ApplicationStatus).includes(
          parsedData.status as ApplicationStatus,
        )
      ) {
        this.logger.warn(
          `Invalid or missing status from OpenAI: '${parsedData.status}'. Defaulting to PENDING.`,
        );
        parsedData.status = ApplicationStatus.PENDING;
      }

      const jobApplyParam: JobApplyParams = {
        title: parsedData.title,
        company: parsedData.company,
        contractType: parsedData.contractType,
        location: parsedData.location ? parsedData.location : undefined,
      };

      const existingJobApply = await this.jobApplyService.getJobApplyByParam(
        userId,
        jobApplyParam,
      );

      if (existingJobApply) {
        this.logger.warn(
          `Job apply already exists for user ${userId} with title ${parsedData.title} and company ${parsedData.company}. Updating status.`,
        );

        const updateJobApply: UpdateJobApply = {
          ...(parsedData.location ? { Location: parsedData.location } : {}),
          ...(parsedData.salary
            ? { salary: Number.parseInt(parsedData.salary) }
            : {}),
          ...(parsedData.status !== existingJobApply.status
            ? { status: parsedData.status }
            : {}),
          ...(parsedData.interviewDate
            ? { interviewDate: new Date(parsedData.interviewDate) }
            : {}),
        };

        await this.jobApplyService.updateJobApplyByMail(
          existingJobApply.id,
          parsedData.status,
          updateJobApply,
        );
        return existingJobApply.id;
      }

      return this.createJobApply(parsedData, userId);
    } catch (error) {
      this.logger.error(
        `Erreur avec l'API OpenAI ou lors du traitement: ${error.message}`,
        error.stack,
      );
      throw new Error(`Erreur lors de l'analyse de l'email: ${error.message}`);
    }
  }

  async createJobApply(
    parsedData: ExtractedJobDataDto,
    userId: string,
  ): Promise<string> {
    const jobApplyDto: CreateJobApplyDto = {
      title: parsedData.title || 'Titre non spécifié',
      company: parsedData.company || 'Entreprise non spécifiée',
      location: parsedData.location ? parsedData.location : undefined,
      salary: parsedData.salary
        ? Number.parseInt(parsedData.salary.replace(/\s/g, ''))
        : undefined,
      status: parsedData.status as ApplicationStatus,
      contractType: parsedData.contractType,
      interviewDate: parsedData.interviewDate
        ? new Date(parsedData.interviewDate)
        : undefined,
      ...(parsedData.offerReference && {
        offerReference: parsedData.offerReference,
      }),
    };

    this.logger.log(
      `Creating job apply entry with DTO: ${JSON.stringify(jobApplyDto)}`,
    );
    const createdJobApply = await this.jobApplyService.createJobApply(
      userId,
      jobApplyDto,
    );
    return `Job application processed successfully (ID: ${createdJobApply.id}).`;
  }
}
