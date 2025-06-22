import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../enum/application-status.enum';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEnum,
  IsDate,
  IsOptional,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class JobApplyDto {
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  location: string;

  @IsNumber()
  @IsOptional()
  @MaxLength(20)
  salary: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  interviewDate?: Date;

  @IsNotEmpty()
  @MaxLength(255)
  contractType: string;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
}

export class UpdateJobApplyDto {
  @ApiProperty({
    name: 'title',
    description: 'Title of job',
    type: 'string',
    example: 'Computer engineer senior H/F',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  title: string;

  @ApiProperty({
    name: 'company',
    description: 'Company name',
    type: 'string',
    example: 'Chanel',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  company: string;

  @ApiProperty({
    name: 'location',
    description: 'Location of job',
    type: 'string',
    example: 'Paris',
  })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  location: string;

  @ApiProperty({
    name: 'salary',
    description: 'Salary of job',
    type: 'number',
    example: '10000',
  })
  @IsOptional()
  @IsNumber()
  salary: number;

  @ApiProperty({
    name: 'imageUrl',
    description: 'imageUrl aws db',
    type: 'string',
    example: 'https://test.fr',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @ApiProperty({
    name: 'status',
    description: 'Status of job',
    type: 'string',
    example: 'PENDING',
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({
    name: 'contractType',
    description: 'Contract Type of job',
    type: 'string',
    example: 'Internship',
  })
  @IsNotEmpty()
  @MaxLength(255)
  contractType: string;

  @ApiProperty({
    name: 'interviewDate',
    description: 'Interview Date of job',
    type: Date,
    example: '2025-06-09 09:08:22',
  })
  @IsOptional()
  @IsDate()
  @MaxLength(255)
  interviewDate?: Date;
}

export class CreateJobApplyDto {
  @ApiProperty({
    name: 'title',
    description: 'Title of job',
    type: 'string',
    example: 'Computer engineer senior H/F',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  title: string;

  @ApiProperty({
    name: 'company',
    description: 'Company name',
    type: 'string',
    example: 'Chanel',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  company: string;

  @ApiProperty({
    name: 'location',
    description: 'Location of job',
    type: 'string',
    example: 'Paris',
  })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  location: string;

  @ApiProperty({
    name: 'salary',
    description: 'Salary of job',
    type: 'number',
    example: '10000',
  })
  @IsOptional()
  @IsNumber()
  salary: number;

  @ApiProperty({
    name: 'imageUrl',
    description: 'imageUrl aws db',
    type: 'string',
    example: 'https://test.fr',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @ApiProperty({
    name: 'status',
    description: 'Status of job',
    type: 'string',
    example: 'PENDING',
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({
    name: 'contractType',
    description: 'Contract Type of job',
    type: 'string',
    example: 'Internship',
  })
  @IsNotEmpty()
  @MaxLength(255)
  contractType: string;

  @ApiProperty({
    name: 'interviewDate',
    description: 'Interview Date of job',
    type: Date,
    example: '2025-06-09 09:08:22',
  })
  @IsOptional()
  @IsDate()
  @MaxLength(255)
  interviewDate?: Date;
}
