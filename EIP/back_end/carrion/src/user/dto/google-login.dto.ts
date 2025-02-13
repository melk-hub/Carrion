import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'The authorization code returned by Google',
    example: '',
  })
  code: string;
}
