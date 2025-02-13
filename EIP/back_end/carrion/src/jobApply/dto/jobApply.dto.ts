import { ApiProperty } from '@nestjs/swagger';
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

  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  location: string;

  @IsNotEmpty()
  @IsNumber()
  @MaxLength(20)
  salary: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @IsEnum(['ON', 'OFF', 'PENDING'])
  status: 'ON' | 'OFF' | 'PENDING';

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
}

export class CreateJobApplyDto {
  @ApiProperty({
    name: 'Title',
    description: 'Title of job',
    type: 'string',
    example: 'Computer engineer senior H/F',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  title: string;

  @ApiProperty({
    name: 'Company',
    description: 'Company name',
    type: 'string',
    example: 'Chanel',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  company: string;

  @ApiProperty({
    name: 'Location',
    description: 'Location of job',
    type: 'string',
    example: 'Paris',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  location: string;

  @ApiProperty({
    name: 'Salary',
    description: 'Salary of job',
    type: 'number',
    example: '10000',
  })
  @IsNotEmpty()
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
    name: 'Status',
    description: 'Status of job',
    type: 'string',
    example: 'PENDING',
  })
  @IsEnum(['ON', 'OFF', 'PENDING'])
  status: 'ON' | 'OFF' | 'PENDING';
}
