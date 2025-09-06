import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import {
  BooksSearchResponseDto,
  BookResponseDto,
} from './dto/book-response.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @ApiOperation({
    summary: 'Search for books using Google Books API',
    description:
      'Search books from Google Books API. Use the volume ID from results to add books to your library.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    example: 'javascript programming',
  })
  @ApiQuery({
    name: 'maxResults',
    description: 'Maximum number of results (1-40)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'startIndex',
    description: 'Index of first result to return',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Books search results',
    type: BooksSearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid search parameters',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway - Google Books API error',
  })
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('maxResults', new DefaultValuePipe(10), ParseIntPipe)
    maxResults: number,
    @Query('startIndex', new DefaultValuePipe(0), ParseIntPipe)
    startIndex: number,
  ): Promise<BooksSearchResponseDto> {
    return this.booksService.searchBooks(query, maxResults, startIndex);
  }

  @ApiOperation({
    summary: 'Get a specific book by Google Books ID',
    description:
      'Get book details from Google Books API. Use this to preview book before adding to library.',
  })
  @ApiParam({
    name: 'id',
    description: 'Google Books volume ID',
    example: 'dNJzDwAAQBAJ',
  })
  @ApiResponse({
    status: 200,
    description: 'Book details',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiResponse({
    status: 502,
    description: 'Bad Gateway - Google Books API error',
  })
  @Get(':id')
  async getBook(@Param('id') id: string): Promise<BookResponseDto> {
    return this.booksService.getBookById(id);
  }
}
