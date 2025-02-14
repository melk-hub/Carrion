import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { CreateJobApplyDto } from 'src/jobApply/dto/jobApply.dto';
import { JobApplyService } from 'src/jobApply/jobApply.service';

@Injectable()
export class MailFilterService {
  private openai: OpenAI;
  private readonly jobApply: JobApplyService;

  constructor(jobApply: JobApplyService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.jobApply = jobApply;
  }

  async getInformationFromText(text: string, userId: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that extracts keywords from emails.',
          },
          {
            role: 'assistant',
            content: `Extrait les mots-clés suivants de cet email : nom de l'entreprise, poste, salaire, lieu(le plus precis possible). La reponse doit etre sous format json avec les cles en miniscule {{entreprise: '', poste: ''}} Email : {email_body}.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      let parsedData;
      try {
        const rawResponse = response.choices[0].message.content.trim();
        const cleanResponse = rawResponse.replace(/^```json\n|\n```$/g, '');
        parsedData = JSON.parse(cleanResponse);
      } catch (error) {
        throw new Error('Erreur lors du parsing du JSON de la réponse OpenAI');
      }
      const jobApplyDto = {
        title: parsedData.poste || 'Titre non spécifié',
        company: parsedData.entreprise || 'Entreprise non spécifiée',
        location: parsedData.lieu || 'Lieu non spécifié',
        salary: parsedData.salaire ? parseFloat(parsedData.salaire) : 0,
        imageUrl: '',
        status: 'PENDING',
      };
      await this.jobApply.createJobApply(userId, jobApplyDto as CreateJobApplyDto);
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error(`Erreur avec l\'API OpenAI :`, error);
      throw new Error(`Erreur lors de l\'appel à l\'API OpenAI`);
    }
  }
}
