import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserBooksService } from './user-books.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AddBookToLibraryDto } from './dto/add-book-to-library.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import {
  UserBookResponseDto,
  LibraryStatsDto,
} from './dto/user-book-response.dto';

@ApiTags('user-books')
@Controller('user-books')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserBooksController {
  constructor(private readonly userBooksService: UserBooksService) {}

  @ApiOperation({
    summary: 'Add a book to user library from Google Books search',
    description:
      'Add a book to user library using Google Books volume ID. The book will be fetched from Google Books API and saved to database only when user adds it.',
  })
  @ApiResponse({
    status: 201,
    description: 'Book added to library successfully',
    type: UserBookResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Book already exists in library',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found in Google Books API',
  })
  @Post()
  async addBookToLibrary(
    @GetUser() user: UserPayload,
    @Body() addBookDto: AddBookToLibraryDto,
  ): Promise<UserBookResponseDto> {
    return this.userBooksService.addBookToLibrary(user.id, addBookDto);
  }

  @ApiOperation({ summary: 'Get user library with optional filters' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by reading status',
  })
  @ApiQuery({
    name: 'isFavorite',
    required: false,
    type: Boolean,
    description: 'Filter by favorite status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'User library retrieved successfully',
  })
  @Get()
  async getUserLibrary(
    @GetUser() user: UserPayload,
    @Query('status') status?: string,
    @Query('isFavorite') isFavorite?: boolean,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.userBooksService.getUserLibrary(
      user.id,
      status,
      isFavorite,
      page,
      limit,
    );
  }

  @ApiOperation({ summary: 'Get library statistics' })
  @ApiResponse({
    status: 200,
    description: 'Library statistics retrieved successfully',
    type: LibraryStatsDto,
  })
  @Get('stats')
  async getLibraryStats(
    @GetUser() user: UserPayload,
  ): Promise<LibraryStatsDto> {
    return this.userBooksService.getLibraryStats(user.id);
  }

  @ApiOperation({ summary: 'Get specific book from user library' })
  @ApiParam({
    name: 'bookId',
    description:
      'Internal Book ID (use the ID returned from user library, not Google Books ID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Book retrieved successfully',
    type: UserBookResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found in library',
  })
  @Get(':bookId')
  async getUserBook(
    @GetUser() user: UserPayload,
    @Param('bookId') bookId: string,
  ): Promise<UserBookResponseDto> {
    return this.userBooksService.getUserBook(user.id, bookId);
  }

  @ApiOperation({ summary: 'Update reading progress for a book' })
  @ApiParam({
    name: 'bookId',
    description:
      'Internal Book ID (use the ID returned from user library, not Google Books ID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    type: UserBookResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found in library',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid progress data',
  })
  @Patch(':bookId/progress')
  async updateProgress(
    @GetUser() user: UserPayload,
    @Param('bookId') bookId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ): Promise<UserBookResponseDto> {
    return this.userBooksService.updateProgress(
      user.id,
      bookId,
      updateProgressDto,
    );
  }

  @ApiOperation({ summary: 'Remove book from library' })
  @ApiParam({
    name: 'bookId',
    description:
      'Internal Book ID (use the ID returned from user library, not Google Books ID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Book removed from library successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found in library',
  })
  @Delete(':bookId')
  async removeBookFromLibrary(
    @GetUser() user: UserPayload,
    @Param('bookId') bookId: string,
  ): Promise<{ message: string }> {
    await this.userBooksService.removeBookFromLibrary(user.id, bookId);
    return { message: 'Book removed from library successfully' };
  }
}
