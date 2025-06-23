import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

  @ApiProperty({
    name: 'password',
    description: 'password of the user',
    type: 'string',
    example: 'mysecretpassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
