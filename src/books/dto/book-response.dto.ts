import { ApiProperty } from '@nestjs/swagger';

export class VolumeInfoDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  title: string;

  @ApiProperty({ example: ['F. Scott Fitzgerald'] })
  authors?: string[];

  @ApiProperty({ example: 'A classic American novel' })
  description?: string;

  @ApiProperty({ example: '978-0-7432-7356-5' })
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;

  @ApiProperty({ example: 180 })
  pageCount?: number;

  @ApiProperty({ example: ['Fiction'] })
  categories?: string[];

  @ApiProperty({ example: 'http://books.google.com/books/content?id=...' })
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
  };

  @ApiProperty({ example: '2004-09-30' })
  publishedDate?: string;

  @ApiProperty({ example: 'Scribner' })
  publisher?: string;

  @ApiProperty({ example: 'en' })
  language?: string;
}

export class BookResponseDto {
  @ApiProperty({ example: 'dNJzDwAAQBAJ' })
  id: string;

  @ApiProperty({ example: 'books#volume' })
  kind?: string;

  @ApiProperty({
    example: 'https://www.googleapis.com/books/v1/volumes/dNJzDwAAQBAJ',
  })
  selfLink?: string;

  @ApiProperty()
  volumeInfo: VolumeInfoDto;
}

export class BooksSearchResponseDto {
  @ApiProperty({ example: 'books#volumes' })
  kind: string;

  @ApiProperty({ example: 1000 })
  totalItems: number;

  @ApiProperty({ type: [BookResponseDto] })
  items?: BookResponseDto[];
}
