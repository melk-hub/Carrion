import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsEnum,
  IsDate,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class JobApplyDto {
  @IsUUID()
  id: string;

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
