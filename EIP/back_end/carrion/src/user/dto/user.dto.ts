import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { passwordRegEX } from 'src/utils/constants';

export class UserDto {
  @ApiProperty({
    name: 'username',
    description: 'username of the user',
    type: 'string',
    example: 'JohnDoe733',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    name: 'email',
    description: 'email of the user',
    type: 'string',
    example: 'carrion@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide.' })
  @MinLength(8, {
    message: 'The password need to be at least 8 character long',
  })
  @Matches(passwordRegEX, {
    message:
      'The password need at least one digit, one letter and one special caractère (@$!%*#?&).',
  })
  password: string;
}
