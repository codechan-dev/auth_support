// src/user/dto/register.dto.ts

import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Username of the new user',
    example: 'john_doe',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description: 'Email address of the new user',
    example: 'john_doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Full name of the new user',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Mobile number of the new user',
    example: '1234567890',
  })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Mobile number must be exactly 10 digits' })
  mobileNumber: string;

  @ApiProperty({
    description: 'Password for the new user',
    example: 'StrongPassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).+$/, {
    message:
      'Password too weak. It must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;
}
