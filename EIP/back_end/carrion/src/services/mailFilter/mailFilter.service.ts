import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { CreateJobApplyDto } from 'src/jobApply/dto/jobApply.dto';
import { JobApplyService } from 'src/jobApply/jobApply.service';
import { ApplicationStatus } from 'src/jobApply/enum/application-status.enum';
import { ExtractedJobDataDto } from './dto/extracted-job-data.dto';
import { convert } from 'html-to-text';
import {
  GmailMessage,
  GmailMessagePart,
  GmailHeader,
} from 'src/webhooks/mail/gmail.types';
import {
  JobApplyParams,
  UpdateJobApply,
} from 'src/jobApply/interface/jobApply.interface';
import { OutlookMessage } from 'src/webhooks/mail/outlook.types';
import { createHash } from 'crypto';

function extractJsonFromString(str: string): any | null {
  if (!str) return null;
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch (e) {
    Logger.warn(
      `Failed to parse JSON directly: ${e.message}`,
      'MailFilterService-JSONUtil',
    );
    return null;
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
  
  // Deduplication system
  private processedEmails = new Set<string>();
  private readonly EMAIL_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(private readonly jobApplyService: JobApplyService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Clean up processed emails cache every 20 minutes
    setInterval(() => {
      this.processedEmails.clear();
      this.logger.log('Cleared email deduplication cache');
    }, 20 * 60 * 1000);
  }

  /**
   * Generate a unique hash for email content to detect duplicates
   */
  private generateEmailHash(
    emailText: string,
    userId: string,
    emailSubject?: string,
    emailSender?: string,
  ): string {
    const content = `${userId}|${emailSubject || ''}|${emailSender || ''}|${emailText}`;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Check if email has already been processed recently
   */
  private isEmailAlreadyProcessed(emailHash: string): boolean {
    return this.processedEmails.has(emailHash);
  }

  /**
   * Mark email as processed
   */
  private markEmailAsProcessed(emailHash: string): void {
    this.processedEmails.add(emailHash);
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
      return `[Decoding error:: ${encoded.substring(0, 20)}...]`;
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

    // Generate hash for deduplication
    const emailHash = this.generateEmailHash(bodyText, userId, subject, sender);
    
    // Check if email was already processed
    if (this.isEmailAlreadyProcessed(emailHash)) {
      this.logger.warn(
        `Skipping already processed Gmail email. Subject: "${subject}", Sender: "${sender}", MessageId: ${gmailMessage.id}`,
      );
      return 'Email already processed - skipped';
    }

    // Mark as being processed
    this.markEmailAsProcessed(emailHash);

    try {
      return this.processEmailWithExtractedData(
        bodyText,
        userId,
        subject,
        sender,
      );
    } catch (error) {
      this.logger.error(
        `Erreur avec l'API OpenAI ou lors du traitement: ${error.message}`,
        error.stack,
      );
      return error.message;
    }
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
    **La toute première tâches que tu dois faire et que tu dois valider avant pouvoir faire la prochaines étapes, c'est de t'affirmer que le contenu que je t'envoies est bien une conversation de recrutement, si ce n'est pas le cas renvoies moi directement un objet null.**
    **Si tu considère que le mail n'est pas un mail professionel de procédure de recrutement, renvoie null.**
    **FAIS BIEN ATTENTION AU MAIL LINKEDIN, SI CE N'EST PAS UNE PROCÉDURE DE RECRUTEMENT, NE TRAITE PAS LES MAILS DE LINKEDIN QUI PARLE DE RELATIONS, DE POSTULATIONS A LEUR PAGE D'EMPLOIE, IL FAUT BIEN QUE CE SOIT UN PROCESSUS DE RECRUTEMENT ET NON PAS AUTRE CHOSE.**
    SI LES TROIS CONDITIONS AU DESSUS SONT VALIDÉES ET SEULEMENT SI ELLES SONT VALIDÉES ta tâches devient: Extraire des informations précises d'un email lié à une candidature d'emploi et de déterminer le statut actuel de cette candidature.
    Réponds IMPÉRATIVEMENT au format JSON structuré comme suit :
    {
      "company": "Nom de l'entreprise (string, mandatory)",
      "title": "Intitulé du poste (string, mandatory)",
      "location": "Lieu du poste, le plus précis possible (string, optionnel)",
      "salary": "Salaire proposé (string, ex: '50000 EUR annuel' ou '3000 EUR mensuel', optionnel)",
      "contractType": "Type de contrat - UTILISE EXCLUSIVEMENT L'UNE DE CES 5 VALEURS: 'Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'. SI AUCUNE NE CORRESPOND OU SI NON SPÉCIFIÉ, UTILISE null.",
      "status": "Statut de la candidature parmi (${Object.values(ApplicationStatus).join(', ')}). Choisis le statut le plus pertinent.",
      "interviewDate": "Date et heure de l'entretien au format ISO 8601 (YYYY-MM-DDTHH:mm:ssZ) si mentionnée (string, optionnel)",
    }
    **TYPES DE CONTRAT AUTORISÉS UNIQUEMENT**: Tu DOIS utiliser EXCLUSIVEMENT ces 5 valeurs pour contractType:
    - "Full-time" (pour CDI, temps plein, permanent)
    - "Part-time" (pour temps partiel)
    - "Internship" (pour stage, alternance, apprentissage)
    - "Contract" (pour CDD, mission temporaire)
    - "Freelance" (pour freelance, consultant)
    **SI LE TYPE DE CONTRAT N'EST PAS CLAIR OU NE CORRESPOND À AUCUNE DE CES 5 CATÉGORIES, UTILISE null.**
    **SI TU NE TROUVES PAS DE DATA N'ESSAYES PAS DE COMBLER L'OBJETS, IL FAUT QUE LES TITLES SOIENT DES TRUCS QUI EXISTES DÉJÀ PAS DES MOTS COMME "JOB APPLICATION" OU D'AUTRE SOTTISE, SI TU N'EN TROUVE PAS RENVOIE MOI NULL. VERIFIE BIEN QUE LE MAIL ET LES PROPOSITIONS SONT POUR L'UTILISATEUR ET NON LES INFORMATIONS DU SENDER. PAR EXEMPLE SI LE RECRUTEUR SE PRÉSENTE NE FAIT PAS L'ERREUR DE RÉCUPERER SES INFORMATIONS POUR ME LES RENVOYER ET DE FAIRE EN SORTE QUE CES INFORMATIONS SOIT DONNÉES À L'UTILISATEUR.**
    **Analyse bien le corps du mail, le sujet, l'objet, le mail de l'expéditeur, le footer, il faut que tu t'assures que ce soit bien une conversation de recrutement, il ne faut pas que tu tombes dans les pièges des mails commerciaux, de spam, de mails sociaux de linkedin, analyse bien, si cela parle de plusieurs personnes en même temps, pour vendre quelques choses, de spam, il faut que tu sois sur que c'est bien une conversation de recrutement.**
    Sur le json que tu me renvoies je veux les informations en anglais: le type de contrat et le title.
    **Il faut obligatoirement que tu me trouves la société, le title et le status. dans le fil d'actualités des messages, dans l'objets, dans le footer, le corps, ou encore d'autre type de metadata que je te renvoies comme le mail de l'expéditeur, on peut souvent retrouver le nom la société.**
    Si tu n'arrives pas à trouver la société,**N'HÉSITE PAS À FAIRE DES RECHERCHES, CELA PEUT ÊTRE UNE ÉCOLE, UNE SOCIÉTÉ, UNE ASSOCIATION, etc. MAIS FAIS BIEN ATTENTION FAIS DES RECHERCHES SUR INTERNET POUR VOIR SI CELA EXISTE, JE NE VEUX PAS DE MOT ALÉATOIRE POUR COMBLER L'OBJET JSON** CEPENDANT FAIS BIEN ATTENTION, EST IL NÉCESSAIRE DE METTRES DES BRANCHES DE LA SOCIÉTÉ DANS LE TITLE ?
    Si une information n'est pas présente, mets la valeur à null ou ne l'inclus pas si optionnel (sauf pour 'company, title et status' qui sont obligatoires).
    Analyse attentivement le sujet, le mail de l'expéditeur, le corps du mail, les signatures, l'objet aussi, regarder aussi si c'est une réponse à un mail.
    Si tu considère que le mail n'est pas un mail professionel de procédure de recrutement, renvoie null.
    Pour ce qui est des informations, renvoies moi le contractType et le title en anglais, il faut que tu me renvoies toujours la même choses alors essaye de suivre un patterne ou une convention de titre de LinkedIn, **Ne me rajoutes pas le type de contrat dans le titre, CE QUI VEUT DIRE NE ME RAJOUTE PAS DES CHOSES COMME: "Full-Time", "Internship" DANS LE TITLE. CEPENDANT TU PEUX METTRE LE POSTE "INTERN" "APPRENTICE"**
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
      // };

      if (!parsedData) {
        this.logger.error('Failed to parse JSON from OpenAI response.');
        return 'Erreur lors du parsing du JSON de la réponse OpenAI.';
      } else if (!parsedData.title || !parsedData.company) {
        this.logger.warn(
          `Didn't create jobApply for this mail: ${emailSender + ' ' + emailSubject}`,
        );
        return;
      }

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
        contractType: parsedData.contractType
          ? parsedData.contractType
          : undefined,
        location: parsedData.location ? parsedData.location : undefined,
      };

      // Enhanced logging for duplicate detection debugging
      this.logger.log(
        `Checking for duplicates with params: ${JSON.stringify(jobApplyParam)}`,
      );

      const existingJobApply = await this.jobApplyService.getJobApplyByParam(
        userId,
        jobApplyParam,
      );

      if (existingJobApply) {
        this.logger.warn(
          `Job apply already exists for user ${userId} with title ${parsedData.title} and company ${parsedData.company}. Updating status.`,
        );
        this.logger.log(
          `Existing job apply details: ${JSON.stringify({
            id: existingJobApply.id,
            title: existingJobApply.title,
            company: existingJobApply.company,
            contractType: existingJobApply.contractType,
            location: existingJobApply.location,
          })}`,
        );

        const updateJobApply: UpdateJobApply = {
          location: parsedData.location,
          salary: Number.parseInt(parsedData.salary),
          status: parsedData.status,
          interviewDate:
            parsedData.interviewDate &&
            parsedData.interviewDate !== 'null' &&
            parsedData.interviewDate.trim() !== ''
              ? new Date(parsedData.interviewDate)
              : null,
          contractType: parsedData.contractType,
        };

        await this.jobApplyService.updateJobApplyByMail(
          existingJobApply.id,
          userId,
          updateJobApply,
        );
        return existingJobApply.id;
      }

      this.logger.log(
        `No existing job apply found. Creating new one with params: ${JSON.stringify(jobApplyParam)}`,
      );

      return this.createJobApply(parsedData, userId);
    } catch (error) {
      this.logger.error(
        `Erreur avec l'API OpenAI ou lors du traitement: ${error.message}`,
        error.stack,
      );
      return error.message;
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
      contractType: parsedData.contractType
        ? parsedData.contractType
        : undefined,
      interviewDate:
        parsedData.interviewDate &&
        parsedData.interviewDate !== 'null' &&
        parsedData.interviewDate.trim() !== ''
          ? new Date(parsedData.interviewDate)
          : undefined,
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

  async processEmailAndCreateJobApplyFromOutlook(
    outlookMessage: OutlookMessage,
    userId: string,
  ): Promise<string> {
    if (!outlookMessage) {
      this.logger.error('Received invalid or empty outlookMessage object');
      throw new BadRequestException('Invalid email data provided.');
    }

    const subject = outlookMessage.subject || '';
    const sender = `${outlookMessage.from?.emailAddress?.name || ''} <${outlookMessage.from?.emailAddress?.address || ''}>`;

    // Extract text content from Outlook message body
    let bodyText = this.extractTextFromOutlookMessage(outlookMessage);

    if (!bodyText && outlookMessage.bodyPreview) {
      this.logger.warn(
        `No main body extracted for message ${outlookMessage.id}, using bodyPreview.`,
      );
      bodyText = outlookMessage.bodyPreview;
    }

    if (!bodyText) {
      this.logger.error(
        `Could not extract text body for message ${outlookMessage.id}`,
      );
      throw new BadRequestException(
        'Could not extract readable text from the email.',
      );
    }

    // Generate hash for deduplication
    const emailHash = this.generateEmailHash(bodyText, userId, subject, sender);
    
    // Check if email was already processed
    if (this.isEmailAlreadyProcessed(emailHash)) {
      this.logger.warn(
        `Skipping already processed Outlook email. Subject: "${subject}", Sender: "${sender}", MessageId: ${outlookMessage.id}`,
      );
      return 'Email already processed - skipped';
    }

    // Mark as being processed
    this.markEmailAsProcessed(emailHash);

    try {
      return this.processEmailWithExtractedData(
        bodyText,
        userId,
        subject,
        sender,
      );
    } catch (error) {
      this.logger.error(
        `Error with OpenAI API or during processing: ${error.message}`,
        error.stack,
      );
      return error.message;
    }
  }

  /**
   * Extract readable text content from Outlook message
   */
  private extractTextFromOutlookMessage(
    outlookMessage: OutlookMessage,
  ): string {
    if (!outlookMessage.body?.content) {
      return outlookMessage.bodyPreview || '';
    }

    let content = outlookMessage.body.content;

    // If HTML content, convert to plain text
    if (outlookMessage.body.contentType === 'html') {
      content = convert(content, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' },
          { selector: 'script', format: 'skip' },
          { selector: 'style', format: 'skip' },
        ],
      });
    }

    return content.trim();
  }
}
