import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddDocumentDto {
  @ApiProperty({
    description: 'Name of the document to add',
    example: 'CV_John_Doe.pdf',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Document name cannot be empty' })
  @Length(1, 255, {
    message: 'Document name must be between 1 and 255 characters',
  })
  document: string;
}
