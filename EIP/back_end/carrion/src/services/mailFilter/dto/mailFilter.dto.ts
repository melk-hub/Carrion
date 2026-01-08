import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import type { GmailMessage } from '@/webhooks/mail/gmail.types';

export class ExtractInfoDto {
  @ApiProperty({
    name: 'text',
    description:
      'The text to extract information from, typically an email job offer.',
    type: 'string',
    example:
      'Hello JohnDoe733, We are pleased to offer you the position of Software Developer at Carrion&Corp at Paris. Please find the attached offer letter and benefits package. We look forward to working with you.',
  })
  @IsNotEmpty()
  @IsString()
  text: GmailMessage;
}
