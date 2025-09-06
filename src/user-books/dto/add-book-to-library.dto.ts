import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum ReadingStatus {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  FINISHED = 'FINISHED',
  PAUSED = 'PAUSED',
  DNF = 'DNF', // Did Not Finish
}

export class AddBookToLibraryDto {
  @ApiProperty({
    example: 'dNJzDwAAQBAJ',
    description: 'Google Books volume ID (obtained from books search)',
  })
  @IsString()
  bookId: string;

  @ApiProperty({
    example: 'WANT_TO_READ',
    enum: ReadingStatus,
    description: 'Initial reading status for the book',
    required: false,
  })
  @IsOptional()
  @IsEnum(ReadingStatus)
  status?: ReadingStatus;

  @ApiProperty({
    example: false,
    description: 'Mark book as favorite',
    required: false,
  })
  @IsOptional()
  isFavorite?: boolean;
}
