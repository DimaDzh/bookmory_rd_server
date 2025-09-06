import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty({ example: 'uuid-string', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'First name', required: false })
  firstName?: string | null;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  lastName?: string | null;

  @ApiProperty({ example: 'user', description: 'User role' })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({ example: 'Bearer', description: 'Token type' })
  token_type: string;

  @ApiProperty({
    example: '7d',
    description:
      'Token expiration time (e.g., "7d", "24h", "3600s", or 3600 for seconds)',
  })
  expires_in: string | number;

  @ApiProperty({
    example: '2025-08-25T12:00:00Z',
    description: 'Token expiration date',
  })
  expires_at: string;

  @ApiProperty({ type: UserDto, description: 'User information' })
  user: UserDto;
}
