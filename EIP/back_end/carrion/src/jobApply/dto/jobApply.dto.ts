import {
  IsNotEmpty,
  IsString,
  IsInt,
  MaxLength,
  IsEnum,
  IsDate,
  IsOptional,
} from 'class-validator';

export class JobApplyDto {
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  company: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  location: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  salary: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @IsEnum(['TRUE', 'FALSE'])
  status: 'TRUE' | 'FALSE';

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;
}
