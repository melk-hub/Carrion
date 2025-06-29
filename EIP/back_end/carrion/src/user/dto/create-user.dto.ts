import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class CreateUserDto extends UserDto {
  @ApiProperty({
    name: 'hasProfile',
    description: 'Did the user complete the information window',
    type: 'boolean',
    example: false,
    default: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  hasProfile: boolean = false;

  @ApiProperty({
    name: 'firstName',
    description: 'Did the user complete the information window',
    type: 'boolean',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    name: 'lastName',
    description: 'Did the user complete the information window',
    type: 'boolean',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
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

  @ApiProperty({
    name: 'rememberMe',
    description: 'remember the user variable',
    type: 'boolean',
    example: true,
  })
  @IsBoolean()
  rememberMe: boolean;
}
