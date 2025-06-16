import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class OAuthUserDto extends UserDto {
  @ApiProperty({
    description: "The user's first name",
    example: 'John',
    type: 'string',
    required: true,
  })
  firstName: string;

  @ApiProperty({
    description: "The user's last name",
    example: 'Doe',
    type: 'string',
    required: true,
  })
  lastName: string;

  @ApiProperty({
    description: "The user's username",
    example: 'JohnnyJohnnyDoeDoe',
    type: 'string',
    required: true,
  })
  username: string;

  @ApiProperty({
    description: "The user's birthdate",
    example: '1990-01-01',
    type: 'string',
    required: false,
  })
  birthDate?: string;

  @ApiProperty({
    description: "The user's email",
    example: 'johndoe@example.com',
    type: 'string',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: "The user's password",
    example: "password123 (empty because it's oauth",
    type: 'string',
    required: true,
  })
  password: string;
}
