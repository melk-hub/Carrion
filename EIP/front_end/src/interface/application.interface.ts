export interface Application {
  id: string;
  title: string;
  company: string;
  status: 'APPLIED' | 'PENDING' | 'REJECTED_BY_COMPANY' | 'INTERVIEW_SCHEDULED' | 'OFFER_RECEIVED';
  location?: string;
  salary?: number;
  contractType?: string;
  interviewDate?: string;
  imageUrl?: string;
  createdAt: string;
}