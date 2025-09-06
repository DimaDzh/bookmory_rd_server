import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({
    example: 'Hello World! BookMory API is running.',
    description: 'Health check message',
  })
  message: string;

  @ApiProperty({
    example: '1.0.0',
    description: 'API version',
  })
  version: string;

  @ApiProperty({
    example: '2025-09-06T10:00:00.000Z',
    description: 'Current server timestamp',
  })
  timestamp: string;

  @ApiProperty({
    example: 'healthy',
    description: 'Service status',
  })
  status: string;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error message or array of validation errors',
    oneOf: [
      { type: 'string', example: 'Bad Request' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['email must be an email'],
      },
    ],
  })
  message: string | string[];

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type',
  })
  error: string;

  @ApiProperty({
    example: '2025-09-06T10:00:00.000Z',
    description: 'Error timestamp',
    required: false,
  })
  timestamp?: string;

  @ApiProperty({
    example: '/api/auth/login',
    description: 'Request path',
    required: false,
  })
  path?: string;
}
