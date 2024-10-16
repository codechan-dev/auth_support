// src/user/dto/password-reset.dto.ts

import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({
    description: 'Password reset token sent to the user\'s email',
    example: 'unique-reset-token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'NewStrongPassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/, {
    message:
      'Password too weak. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  newPassword: string;
}
