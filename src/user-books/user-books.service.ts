import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GoogleBooksService } from '../integrations/google-books/google-books.service';
import { AddBookToLibraryDto } from './dto/add-book-to-library.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import {
  UserBookResponseDto,
  LibraryStatsDto,
} from './dto/user-book-response.dto';

@Injectable()
export class UserBooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleBooksService: GoogleBooksService,
  ) {}

  /**
   * Add a book to user's library from Google Books search
   */
  async addBookToLibrary(
    userId: string,
    addBookDto: AddBookToLibraryDto,
  ): Promise<UserBookResponseDto> {
    // First, check if book already exists in our database by Google Books ID
    let book = await this.prisma.book.findUnique({
      where: {
        googleBooksId: addBookDto.bookId,
      },
    });

    // Check if book already exists in user's library
    if (book) {
      const existingUserBook = await this.prisma.userBook.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: book.id,
          },
        },
      });

      if (existingUserBook) {
        throw new ConflictException('Book already exists in your library');
      }
    }

    // If book doesn't exist in our database, fetch from Google Books API and create it
    if (!book) {
      const googleBook = await this.googleBooksService.getBookById(
        addBookDto.bookId,
      );

      // Create book in our database (only when user adds it)
      book = await this.prisma.book.create({
        data: {
          title: googleBook.volumeInfo.title,
          author: googleBook.volumeInfo.authors?.join(', ') || 'Unknown Author',
          isbn: googleBook.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10',
          )?.identifier,
          description: googleBook.volumeInfo.description,
          coverUrl: googleBook.volumeInfo.imageLinks?.thumbnail,
          totalPages: googleBook.volumeInfo.pageCount || 0,
          googleBooksId: googleBook.id,
          language: googleBook.volumeInfo.language,
          publisher: googleBook.volumeInfo.publisher,
          publishedDate: googleBook.volumeInfo.publishedDate
            ? new Date(googleBook.volumeInfo.publishedDate)
            : null,
          genres: googleBook.volumeInfo.categories || [],
          metadata: googleBook as any,
          addedById: userId,
        },
      });
    }

    // Add book to user's library
    const userBook = await this.prisma.userBook.create({
      data: {
        userId,
        bookId: book.id,
        status: (addBookDto.status as any) || 'WANT_TO_READ',
        isFavorite: addBookDto.isFavorite || false,
        startedAt: addBookDto.status === 'READING' ? new Date() : null,
      },
      include: {
        book: true,
      },
    });

    return this.mapToUserBookResponse(userBook);
  }

  /**
   * Get user's library with filters
   */
  async getUserLibrary(
    userId: string,
    status?: string,
    isFavorite?: boolean,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    books: UserBookResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    const [userBooks, total] = await Promise.all([
      this.prisma.userBook.findMany({
        where,
        include: {
          book: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.userBook.count({ where }),
    ]);

    return {
      books: userBooks.map((userBook) => this.mapToUserBookResponse(userBook)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get specific book from user's library
   */
  async getUserBook(
    userId: string,
    bookId: string,
  ): Promise<UserBookResponseDto> {
    // Find user book by internal book ID (since book must be added to DB first)
    const userBook = await this.prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      include: {
        book: true,
      },
    });

    if (!userBook) {
      throw new NotFoundException('Book not found in your library');
    }

    return this.mapToUserBookResponse(userBook);
  }

  /**
   * Update reading progress
   */
  async updateProgress(
    userId: string,
    bookId: string,
    updateDto: UpdateProgressDto,
  ): Promise<UserBookResponseDto> {
    const userBook = await this.prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      include: {
        book: true,
      },
    });

    if (!userBook) {
      throw new NotFoundException('Book not found in your library');
    }

    // Validate current page doesn't exceed total pages
    if (
      updateDto.currentPage !== undefined &&
      updateDto.currentPage > userBook.book.totalPages
    ) {
      throw new BadRequestException(
        `Current page cannot exceed total pages (${userBook.book.totalPages})`,
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (updateDto.currentPage !== undefined) {
      updateData.currentPage = updateDto.currentPage;

      // Auto-update status based on progress
      if (updateDto.currentPage === 0) {
        updateData.status = 'WANT_TO_READ';
        updateData.startedAt = null;
      } else if (updateDto.currentPage >= userBook.book.totalPages) {
        updateData.status = 'FINISHED';
        updateData.finishedAt = new Date();
      } else if (userBook.status === 'WANT_TO_READ') {
        updateData.status = 'READING';
        updateData.startedAt = new Date();
      }
    }

    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;

      // Set timestamps based on status
      if (updateDto.status === 'READING' && !userBook.startedAt) {
        updateData.startedAt = new Date();
      } else if (updateDto.status === 'FINISHED') {
        updateData.finishedAt = new Date();
        if (updateDto.currentPage === undefined) {
          updateData.currentPage = userBook.book.totalPages;
        }
      } else if (updateDto.status === 'WANT_TO_READ') {
        updateData.startedAt = null;
        updateData.finishedAt = null;
        if (updateDto.currentPage === undefined) {
          updateData.currentPage = 0;
        }
      }
    }

    if (updateDto.rating !== undefined) {
      updateData.rating = updateDto.rating;
    }

    if (updateDto.review !== undefined) {
      updateData.review = updateDto.review;
    }

    if (updateDto.isFavorite !== undefined) {
      updateData.isFavorite = updateDto.isFavorite;
    }

    const updatedUserBook = await this.prisma.userBook.update({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      data: updateData,
      include: {
        book: true,
      },
    });

    return this.mapToUserBookResponse(updatedUserBook);
  }

  /**
   * Remove book from user's library
   */
  async removeBookFromLibrary(userId: string, bookId: string): Promise<void> {
    const userBook = await this.prisma.userBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!userBook) {
      throw new NotFoundException('Book not found in your library');
    }

    await this.prisma.userBook.delete({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
  }

  /**
   * Get user's library statistics
   */
  async getLibraryStats(userId: string): Promise<LibraryStatsDto> {
    const [totalBooks, statusCounts, favorites, averageRating, totalPagesRead] =
      await Promise.all([
        this.prisma.userBook.count({
          where: { userId },
        }),
        this.prisma.userBook.groupBy({
          by: ['status'],
          where: { userId },
          _count: {
            status: true,
          },
        }),
        this.prisma.userBook.count({
          where: {
            userId,
            isFavorite: true,
          },
        }),
        this.prisma.userBook.aggregate({
          where: {
            userId,
            rating: { not: null },
          },
          _avg: {
            rating: true,
          },
        }),
        this.prisma.userBook.aggregate({
          where: { userId },
          _sum: {
            currentPage: true,
          },
        }),
      ]);

    const statusMap = statusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalBooks,
      currentlyReading: statusMap['READING'] || 0,
      finished: statusMap['FINISHED'] || 0,
      wantToRead: statusMap['WANT_TO_READ'] || 0,
      paused: statusMap['PAUSED'] || 0,
      didNotFinish: statusMap['DNF'] || 0,
      favorites,
      averageRating: Number(averageRating._avg.rating?.toFixed(1)) || 0,
      totalPagesRead: totalPagesRead._sum.currentPage || 0,
    };
  }

  /**
   * Map Prisma model to response DTO
   */
  private mapToUserBookResponse(userBook: any): UserBookResponseDto {
    const progressPercentage =
      userBook.book.totalPages > 0
        ? Math.round((userBook.currentPage / userBook.book.totalPages) * 100)
        : 0;

    return {
      id: userBook.id,
      userId: userBook.userId,
      bookId: userBook.bookId,
      status: userBook.status,
      currentPage: userBook.currentPage,
      rating: userBook.rating,
      review: userBook.review,
      isFavorite: userBook.isFavorite,
      startedAt: userBook.startedAt?.toISOString(),
      finishedAt: userBook.finishedAt?.toISOString(),
      createdAt: userBook.createdAt.toISOString(),
      updatedAt: userBook.updatedAt.toISOString(),
      book: {
        id: userBook.book.id,
        title: userBook.book.title,
        author: userBook.book.author,
        isbn: userBook.book.isbn,
        description: userBook.book.description,
        coverUrl: userBook.book.coverUrl,
        totalPages: userBook.book.totalPages,
        googleBooksId: userBook.book.googleBooksId,
        language: userBook.book.language,
        publisher: userBook.book.publisher,
        publishedDate: userBook.book.publishedDate?.toISOString(),
        genres: userBook.book.genres,
      },
      progressPercentage,
    };
  }
}
