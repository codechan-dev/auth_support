// src/user/dto/user-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userid: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Mobile number of the user',
    example: '+1234567890',
  })
  mobile_number: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Indicates if the user has verified their email',
    example: false,
  })
  email_verified: boolean;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2024-10-15T07:35:45.123Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2024-10-16T08:40:30.456Z',
  })
  updated_at: Date;
}
