import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleBooksService } from './google-books.service';

@Module({
  imports: [ConfigModule],
  providers: [GoogleBooksService],
  exports: [GoogleBooksService],
})
export class GoogleBooksModule {}
