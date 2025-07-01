import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({
    example: 'NewSecureP@ssw0rd!',
    description: 'The new user password (at least 8 characters)',
  })
  password: string;
}
