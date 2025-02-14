import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, isNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    name: 'username',
    description: 'username of the user',
    type: 'string',
    example: 'JohnDoe733',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    name: 'firstName',
    description: 'First name of the user',
    type: 'string',
    example: 'John',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    name: 'lastName',
    description: 'Last name of the user',
    type: 'string',
    example: 'Doe',
  })
  @IsOptional()
  lastName: string;

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

  @ApiProperty({
    name: 'birthDate',
    description: 'Birthdate of the user',
    format: 'date',
    example: '1995-06-15',
  })
  @IsOptional()
  @IsDateString()
  @IsString()
  birthDate: string;
}

export class LoginDto {
  @ApiProperty({
    name: 'identifier',
    description: 'email of the user or username',
    type: 'string',
    example: 'carrion@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

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
