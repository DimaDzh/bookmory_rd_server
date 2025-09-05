import { ApiProperty } from '@nestjs/swagger';

export enum ReadingStatus {
  WANT_TO_READ = 'WANT_TO_READ',
  READING = 'READING',
  FINISHED = 'FINISHED',
  PAUSED = 'PAUSED',
  DNF = 'DNF', // Did Not Finish
}

export class BookInfoDto {
  @ApiProperty({ example: 'cuid123' })
  id: string;

  @ApiProperty({ example: 'The Great Gatsby' })
  title: string;

  @ApiProperty({ example: 'F. Scott Fitzgerald' })
  author: string;

  @ApiProperty({ example: '9780743273565', required: false })
  isbn?: string;

  @ApiProperty({ example: 'A classic American novel', required: false })
  description?: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    required: false,
  })
  coverUrl?: string;

  @ApiProperty({ example: 180 })
  totalPages: number;

  @ApiProperty({ example: 'dNJzDwAAQBAJ', required: false })
  googleBooksId?: string;

  @ApiProperty({ example: 'en', required: false })
  language?: string;

  @ApiProperty({ example: 'Scribner', required: false })
  publisher?: string;

  @ApiProperty({ example: '2004-09-30T00:00:00.000Z', required: false })
  publishedDate?: string;

  @ApiProperty({ example: ['Fiction', 'Classics'], required: false })
  genres?: string[];
}

export class UserBookResponseDto {
  @ApiProperty({ example: 'cuid123' })
  id: string;

  @ApiProperty({ example: 'user123' })
  userId: string;

  @ApiProperty({ example: 'book123' })
  bookId: string;

  @ApiProperty({ example: 'READING', enum: ReadingStatus })
  status: ReadingStatus;

  @ApiProperty({ example: 150 })
  currentPage: number;

  @ApiProperty({
    example: 'Great book! Really enjoying it.',
    required: false,
  })
  review?: string;

  @ApiProperty({ example: false })
  isFavorite: boolean;

  @ApiProperty({ example: '2025-08-25T10:00:00.000Z', required: false })
  startedAt?: string;

  @ApiProperty({ example: '2025-08-30T15:30:00.000Z', required: false })
  finishedAt?: string;

  @ApiProperty({ example: '2025-08-20T09:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-08-25T14:30:00.000Z' })
  updatedAt: string;

  @ApiProperty({ type: BookInfoDto })
  book: BookInfoDto;

  @ApiProperty({
    example: 83.33,
    description: 'Reading progress percentage',
  })
  progressPercentage: number;
}

export class LibraryStatsDto {
  @ApiProperty({ example: 25, description: 'Total books in library' })
  totalBooks: number;

  @ApiProperty({ example: 5, description: 'Books currently reading' })
  currentlyReading: number;

  @ApiProperty({ example: 15, description: 'Books finished' })
  finished: number;

  @ApiProperty({ example: 3, description: 'Books want to read' })
  wantToRead: number;

  @ApiProperty({ example: 1, description: 'Books paused' })
  paused: number;

  @ApiProperty({ example: 1, description: 'Books did not finish' })
  didNotFinish: number;

  @ApiProperty({ example: 8, description: 'Favorite books' })
  favorites: number;

  @ApiProperty({ example: 2450, description: 'Total pages read' })
  totalPagesRead: number;
}
