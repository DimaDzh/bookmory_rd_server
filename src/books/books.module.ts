import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { GoogleBooksModule } from '../integrations/google-books/google-books.module';

@Module({
  imports: [GoogleBooksModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
