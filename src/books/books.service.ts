import { Injectable } from '@nestjs/common';
import { GoogleBooksService } from '../integrations/google-books/google-books.service';
import { GoogleBooksSearchParams } from '../integrations/interfaces/google-books.interface';
import {
  BooksSearchResponseDto,
  BookResponseDto,
} from './dto/book-response.dto';

@Injectable()
export class BooksService {
  constructor(private readonly googleBooksService: GoogleBooksService) {}

  async searchBooks(
    query: string,
    maxResults: number = 10,
    startIndex: number = 0,
  ): Promise<BooksSearchResponseDto> {
    const searchParams: GoogleBooksSearchParams = {
      query,
      maxResults,
      startIndex,
      projection: 'full',
    };

    const response = await this.googleBooksService.searchBooks(searchParams);

    // Transform Google Books response to our DTO format
    return {
      kind: response.kind,
      totalItems: response.totalItems,
      items: response.items?.map((item) => ({
        id: item.id,
        kind: item.kind,
        selfLink: item.selfLink,
        volumeInfo: {
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors,
          description: item.volumeInfo.description,
          industryIdentifiers: item.volumeInfo.industryIdentifiers,
          pageCount: item.volumeInfo.pageCount,
          categories: item.volumeInfo.categories,
          imageLinks: item.volumeInfo.imageLinks,
          publishedDate: item.volumeInfo.publishedDate,
          publisher: item.volumeInfo.publisher,
          language: item.volumeInfo.language,
        },
      })),
    };
  }

  async getBookById(id: string): Promise<BookResponseDto> {
    const response = await this.googleBooksService.getBookById(id);

    // Transform Google Books response to our DTO format
    return {
      id: response.id,
      kind: response.kind,
      selfLink: response.selfLink,
      volumeInfo: {
        title: response.volumeInfo.title,
        authors: response.volumeInfo.authors,
        description: response.volumeInfo.description,
        industryIdentifiers: response.volumeInfo.industryIdentifiers,
        pageCount: response.volumeInfo.pageCount,
        categories: response.volumeInfo.categories,
        imageLinks: response.volumeInfo.imageLinks,
        publishedDate: response.volumeInfo.publishedDate,
        publisher: response.volumeInfo.publisher,
        language: response.volumeInfo.language,
      },
    };
  }
}
