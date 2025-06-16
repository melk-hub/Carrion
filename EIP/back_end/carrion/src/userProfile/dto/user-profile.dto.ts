import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsOptional, IsString } from 'class-validator';

export class UserProfileDto {
  @ApiProperty({
    name: 'firstName',
    description: 'first name of the user',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    name: 'lastName',
    description: 'last name of the user',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    name: 'birthDate',
    description: 'Date of birth of the user',
    format: 'date',
    example: '2000-01-01',
  })
  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @ApiProperty({
    name: 'school',
    description: 'School the user attend',
    type: 'string',
    example: 'Epitech',
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({
    name: 'city',
    description: 'City the user live',
    type: 'string',
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    name: 'phoneNumber',
    description: 'Phone number of the user',
    type: 'string',
    example: '0600000000',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    name: 'personalDescription',
    description: 'Personal description of the user',
    type: 'string',
    example: 'I am a student at Epitech',
  })
  @IsOptional()
  @IsString()
  personalDescription?: string;

  @ApiProperty({
    name: 'portfolioLink',
    description: 'Link to the portfolio of the user',
    type: 'string',
    example: 'https://github.pages.john_doe/',
  })
  @IsOptional()
  @IsString()
  portfolioLink?: string;

  @ApiProperty({
    name: 'linkedin',
    description: 'Name of the linkedin account of the user',
    type: 'string',
    example: 'john-doe',
  })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({
    name: 'goal',
    description: 'Goal of the user',
    type: 'string',
    example: 'I want to be a game developer',
  })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({
    name: 'jobSought',
    description: 'Job the user is looking for',
    type: 'array',
    example: 'Game developer',
  })
  @IsOptional()
  @IsString()
  jobSought?: string;

  @ApiProperty({
    name: 'locationSought',
    description: 'Location the user want to find work at',
    type: 'array',
    example: '[Paris, Annecy, Genève]',
  })
  @IsOptional()
  @IsArray()
  locationSought?: string[];

  @ApiProperty({
    name: 'sector',
    description: 'Sector the user want to work in',
    type: 'array',
    example: '[AI, Cloud, Business]',
  })
  @IsOptional()
  @IsArray()
  sector?: string[];

  @ApiProperty({
    name: 'contractType',
    description: 'Contract type the user want',
    type: 'array',
    example: '[Full-time, Part-time, Internship]',
  })
  @IsOptional()
  @IsArray()
  contractSought?: string[];

  @ApiProperty({
    name: 'resume',
    description: "Info to access user' resume",
    type: 'string',
    example: 'Not implemented yet',
  })
  @IsOptional()
  @IsString()
  resume?: string;
}
