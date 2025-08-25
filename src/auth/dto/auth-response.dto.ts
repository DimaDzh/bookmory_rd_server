import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({ example: 'Bearer', description: 'Token type' })
  tokenType: string;

  @ApiProperty({
    example: '7d',
    description:
      'Token expiration time (e.g., "7d", "24h", "3600s", or 3600 for seconds)',
  })
  expiresIn: string | number;

  @ApiProperty({
    example: '2025-08-25T12:00:00Z',
    description: 'Token expiration date',
  })
  expiresAt: string;
}
