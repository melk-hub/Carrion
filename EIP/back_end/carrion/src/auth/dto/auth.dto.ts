import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty({
    description: 'User firstname',
    example: 'Marco',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  firstname: string;
  @ApiProperty({
    description: 'User lastname',
    example: 'Polo',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  lastname: string;
  @ApiProperty({
    description: 'User username',
    example: 'Polo2024',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  username: string;
  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'password123',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}

export class SignInDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User username', example: ' ' })
  username: string;
  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
