// src/user/dto/login.dto.ts

import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'StrongPassword123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  password: string;
}
