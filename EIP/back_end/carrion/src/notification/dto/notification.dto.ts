export class NotificationDto {
  id: string;
  company: string;
  jobTitle: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'DEFAULT';
  message: string;
  read: boolean;
  hoursAgo: number;
}
