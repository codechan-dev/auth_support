// src/user/dto/email-verification.dto.ts

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailVerificationDto {
  @ApiProperty({
    description: 'Verification token sent to the user\'s email',
    example: 'unique-verification-token',
  })
  @IsString()
  token: string;
}
