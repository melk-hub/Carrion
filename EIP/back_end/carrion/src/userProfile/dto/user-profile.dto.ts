import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class UserProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  personalDescription?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  portfolioLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobSought?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contractSought?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locationSought?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sector?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resume?: string;
}
