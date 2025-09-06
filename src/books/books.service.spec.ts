import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { GoogleBooksService } from '../integrations/google-books/google-books.service';

describe('BooksService', () => {
  let service: BooksService;
  let googleBooksService: GoogleBooksService;

  const mockGoogleBooksService = {
    searchBooks: jest.fn(),
    getBookById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: GoogleBooksService,
          useValue: mockGoogleBooksService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    googleBooksService = module.get<GoogleBooksService>(GoogleBooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchBooks', () => {
    it('should search books and return formatted response', async () => {
      const mockResponse = {
        kind: 'books#volumes',
        totalItems: 1,
        items: [
          {
            id: 'test-book-id',
            kind: 'books#volume',
            selfLink: 'https://test.com',
            volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author'],
              description: 'Test Description',
              industryIdentifiers: [],
              pageCount: 300,
              categories: ['Fiction'],
              imageLinks: {
                thumbnail: 'https://test.com/image.jpg',
              },
              publishedDate: '2023-01-01',
              publisher: 'Test Publisher',
              language: 'en',
            },
          },
        ],
      };

      mockGoogleBooksService.searchBooks.mockResolvedValue(mockResponse);

      const result = await service.searchBooks('test query');

      expect(result).toEqual(mockResponse);
      expect(mockGoogleBooksService.searchBooks).toHaveBeenCalledWith({
        query: 'test query',
        maxResults: 10,
        startIndex: 0,
        projection: 'full',
      });
    });

    it('should handle custom parameters', async () => {
      const mockResponse = {
        kind: 'books#volumes',
        totalItems: 0,
        items: [],
      };

      mockGoogleBooksService.searchBooks.mockResolvedValue(mockResponse);

      await service.searchBooks('test', 5, 10);

      expect(mockGoogleBooksService.searchBooks).toHaveBeenCalledWith({
        query: 'test',
        maxResults: 5,
        startIndex: 10,
        projection: 'full',
      });
    });
  });

  describe('getBookById', () => {
    it('should get book by ID and return formatted response', async () => {
      const mockResponse = {
        id: 'test-book-id',
        kind: 'books#volume',
        selfLink: 'https://test.com',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Test Author'],
          description: 'Test Description',
          industryIdentifiers: [],
          pageCount: 300,
          categories: ['Fiction'],
          imageLinks: {
            thumbnail: 'https://test.com/image.jpg',
          },
          publishedDate: '2023-01-01',
          publisher: 'Test Publisher',
          language: 'en',
        },
      };

      mockGoogleBooksService.getBookById.mockResolvedValue(mockResponse);

      const result = await service.getBookById('test-book-id');

      expect(result).toEqual(mockResponse);
      expect(mockGoogleBooksService.getBookById).toHaveBeenCalledWith(
        'test-book-id',
      );
    });
  });
});
