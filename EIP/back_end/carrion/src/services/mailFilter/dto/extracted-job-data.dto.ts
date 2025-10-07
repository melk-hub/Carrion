import { ApplicationStatus } from '@/jobApply/enum/application-status.enum';

export class ExtractedJobDataDto {
  company: string;
  title: string;
  location?: string;
  salary?: string;
  contractType: string;
  status: ApplicationStatus;
  interviewDate?: string;
  offerReference?: string;
}
