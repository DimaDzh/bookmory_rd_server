import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class SearchBooksDto {
  @ApiProperty({
    example: 'javascript programming',
    description: 'Search query for books',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  q: string;

  @ApiProperty({
    example: 10,
    description: 'Maximum number of results to return (1-40)',
    required: false,
  })
  @IsOptional()
  maxResults?: number;

  @ApiProperty({
    example: 0,
    description: 'Index of the first result to return',
    required: false,
  })
  @IsOptional()
  startIndex?: number;
}
