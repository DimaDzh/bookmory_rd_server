import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import {
  GoogleBooksVolume,
  GoogleBooksSearchResponse,
  GoogleBooksSearchParams,
  GoogleBooksConfig,
} from '../interfaces/google-books.interface';

@Injectable()
export class GoogleBooksService {
  private readonly logger = new Logger(GoogleBooksService.name);
  private readonly config: GoogleBooksConfig;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {
    this.config = {
      baseUrl: 'https://www.googleapis.com/books/v1',
      apiKey: this.configService.get<string>('GOOGLE_BOOKS_API_KEY'),
      timeout: 10000,
    };

    // Log whether API key is configured (for debugging)
    if (
      this.config.apiKey &&
      this.config.apiKey !== 'your-google-books-api-key'
    ) {
      this.logger.log(
        'Google Books API key configured - higher rate limits available',
      );
    } else {
      this.logger.log(
        'Google Books API running without key - using free tier limits',
      );
    }
  }

  /**
   * Search for books using Google Books API with Redis caching
   */
  async searchBooks(
    params: GoogleBooksSearchParams,
  ): Promise<GoogleBooksSearchResponse> {
    // Create cache key from search parameters
    const cacheKey = `google-books:search:${JSON.stringify(params)}`;

    try {
      // Try to get from cache first
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const cachedResult = (await this.cacheManager.get(cacheKey)) as
        | GoogleBooksSearchResponse
        | undefined;
      if (cachedResult) {
        this.logger.debug(`Cache hit for search: ${params.query}`);
        return cachedResult;
      }

      this.logger.debug(`Cache miss for search: ${params.query}`);
      const url = this.buildSearchUrl(params);
      this.logger.debug(`Searching books with URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BookMory/1.0',
        },
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        this.logger.error(
          `Google Books API error: ${response.status} ${response.statusText}`,
        );
        throw new HttpException(
          `Failed to fetch books from Google Books API: ${response.statusText}`,
          this.getHttpStatusFromApiError(response.status),
        );
      }

      const data = (await response.json()) as GoogleBooksSearchResponse;
      this.logger.debug(
        `Successfully fetched ${data.totalItems} books, returned ${data.items?.length || 0} items`,
      );

      // Cache the result for 5 minutes (300 seconds)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.cacheManager.set(cacheKey, data, 300);
      this.logger.debug(`Cached search result for: ${params.query}`);

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.error('Google Books API request timeout');
        throw new HttpException(
          'Request to Google Books API timed out',
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      this.logger.error('Error searching books:', error);
      throw new HttpException(
        'Error searching books',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a specific book by its Google Books volume ID with Redis caching
   */
  async getBookById(volumeId: string): Promise<GoogleBooksVolume> {
    // Create cache key for individual book
    const cacheKey = `google-books:volume:${volumeId}`;

    try {
      // Try to get from cache first
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const cachedResult = (await this.cacheManager.get(cacheKey)) as
        | GoogleBooksVolume
        | undefined;
      if (cachedResult) {
        this.logger.debug(`Cache hit for book: ${volumeId}`);
        return cachedResult;
      }

      this.logger.debug(`Cache miss for book: ${volumeId}`);
      const url = this.buildVolumeUrl(volumeId);
      this.logger.debug(`Fetching book with ID: ${volumeId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BookMory/1.0',
        },
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(`Book not found: ${volumeId}`);
          throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
        }

        this.logger.error(
          `Google Books API error: ${response.status} ${response.statusText}`,
        );
        throw new HttpException(
          `Failed to fetch book from Google Books API: ${response.statusText}`,
          this.getHttpStatusFromApiError(response.status),
        );
      }

      const data = (await response.json()) as GoogleBooksVolume;
      this.logger.debug(`Successfully fetched book: ${data.volumeInfo.title}`);

      // Cache the result for 10 minutes (600 seconds) - books change less frequently
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await this.cacheManager.set(cacheKey, data, 600);
      this.logger.debug(`Cached book result for: ${volumeId}`);

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.error('Google Books API request timeout');
        throw new HttpException(
          'Request to Google Books API timed out',
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      this.logger.error('Error fetching book details:', error);
      throw new HttpException(
        'Error fetching book details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Build search URL with parameters
   */
  private buildSearchUrl(params: GoogleBooksSearchParams): string {
    const baseUrl = `${this.config.baseUrl}/volumes`;
    const searchParams = new URLSearchParams();

    // Required parameter
    searchParams.append('q', params.query);

    // Optional parameters
    if (params.maxResults) {
      searchParams.append(
        'maxResults',
        Math.min(params.maxResults, 40).toString(),
      );
    }

    if (params.startIndex !== undefined) {
      searchParams.append('startIndex', params.startIndex.toString());
    }

    if (params.langRestrict) {
      searchParams.append('langRestrict', params.langRestrict);
    }

    if (params.printType) {
      searchParams.append('printType', params.printType);
    }

    if (params.orderBy) {
      searchParams.append('orderBy', params.orderBy);
    }

    if (params.filter) {
      searchParams.append('filter', params.filter);
    }

    if (params.projection) {
      searchParams.append('projection', params.projection);
    }

    // Add API key if available and not the placeholder value
    if (
      this.config.apiKey &&
      this.config.apiKey !== 'your-google-books-api-key'
    ) {
      searchParams.append('key', this.config.apiKey);
    }

    return `${baseUrl}?${searchParams.toString()}`;
  }

  /**
   * Build volume URL for specific book
   */
  private buildVolumeUrl(volumeId: string): string {
    const baseUrl = `${this.config.baseUrl}/volumes/${encodeURIComponent(volumeId)}`;

    // Add API key if available and not the placeholder value
    if (
      this.config.apiKey &&
      this.config.apiKey !== 'your-google-books-api-key'
    ) {
      return `${baseUrl}?key=${this.config.apiKey}`;
    }

    return baseUrl;
  }

  /**
   * Map Google Books API error status to appropriate HTTP status
   */
  private getHttpStatusFromApiError(apiStatus: number): HttpStatus {
    switch (apiStatus) {
      case 400:
        return HttpStatus.BAD_REQUEST;
      case 403:
        return HttpStatus.FORBIDDEN;
      case 404:
        return HttpStatus.NOT_FOUND;
      case 429:
        return HttpStatus.TOO_MANY_REQUESTS;
      case 500:
      case 502:
      case 503:
        return HttpStatus.BAD_GATEWAY;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Check if the service is properly configured
   * Returns true even without API key as the service works with free tier
   */
  isConfigured(): boolean {
    return !!this.config.baseUrl;
  }

  /**
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return !!(
      this.config.apiKey && this.config.apiKey !== 'your-google-books-api-key'
    );
  }

  /**
   * Advanced search with more parameters
   */
  async advancedSearch(params: {
    title?: string;
    author?: string;
    publisher?: string;
    subject?: string;
    isbn?: string;
    maxResults?: number;
    startIndex?: number;
    orderBy?: 'newest' | 'relevance';
    filter?: 'ebooks' | 'free-ebooks' | 'full' | 'paid-ebooks' | 'partial';
    printType?: 'all' | 'books' | 'magazines';
    langRestrict?: string;
  }): Promise<GoogleBooksSearchResponse> {
    // Build advanced query string
    const queryParts: string[] = [];

    if (params.title) {
      queryParts.push(`intitle:"${params.title}"`);
    }

    if (params.author) {
      queryParts.push(`inauthor:"${params.author}"`);
    }

    if (params.publisher) {
      queryParts.push(`inpublisher:"${params.publisher}"`);
    }

    if (params.subject) {
      queryParts.push(`subject:"${params.subject}"`);
    }

    if (params.isbn) {
      queryParts.push(`isbn:${params.isbn}`);
    }

    const query = queryParts.join(' ');

    if (!query) {
      throw new HttpException(
        'At least one search parameter must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const searchParams: GoogleBooksSearchParams = {
      query,
      maxResults: params.maxResults,
      startIndex: params.startIndex,
      orderBy: params.orderBy,
      filter: params.filter,
      printType: params.printType,
      langRestrict: params.langRestrict,
      projection: 'full',
    };

    return this.searchBooks(searchParams);
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig() {
    return {
      baseUrl: this.config.baseUrl,
      hasApiKey: this.hasApiKey(),
      timeout: this.config.timeout,
      usingFreeTier: !this.hasApiKey(),
    };
  }
}
