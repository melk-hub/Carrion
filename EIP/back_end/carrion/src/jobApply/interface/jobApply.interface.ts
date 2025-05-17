import { ApplicationStatus } from '../enum/application-status.enum';

export interface JobApplyParams {
  title: string;
  company: string;
  contractType: string;
  location?: string;
}

export interface UpdateJobApply {
  title?: string;
  company?: string;
  location?: string;
  salary?: number;
  imageUrl?: string;
  status?: ApplicationStatus;
  contractType?: string;
  interviewDate?: Date;
}
