import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsString,
  IsBoolean,
} from 'class-validator';

export enum ReadingStatus {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  FINISHED = 'FINISHED',
  PAUSED = 'PAUSED',
  DNF = 'DNF', // Did Not Finish
}

export class UpdateProgressDto {
  @ApiProperty({
    example: 150,
    description: 'Current page number',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentPage?: number;

  @ApiProperty({
    example: 'READING',
    enum: ReadingStatus,
    description: 'Reading status',
    required: false,
  })
  @IsOptional()
  @IsEnum(ReadingStatus)
  status?: ReadingStatus;

  @ApiProperty({
    example: 4,
    description: 'Rating from 1 to 5 stars',
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    example: 'Great book! Really enjoyed the character development.',
    description: 'User review of the book',
    required: false,
  })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiProperty({
    example: true,
    description: 'Mark book as favorite',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
