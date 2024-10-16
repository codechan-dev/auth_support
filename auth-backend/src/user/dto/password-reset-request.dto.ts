// src/user/dto/password-reset-request.dto.ts

import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetRequestDto {
  @ApiProperty({
    description: 'Email of the user requesting password reset',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;
}
