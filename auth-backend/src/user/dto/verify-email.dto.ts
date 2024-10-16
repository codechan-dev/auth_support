// src/user/dto/verify-email.dto.ts

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Verification token sent to the user\'s email',
    example: 'some-unique-token',
  })
  @IsString()
  token: string;
}
