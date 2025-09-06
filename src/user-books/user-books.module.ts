import { Module } from '@nestjs/common';
import { UserBooksController } from './user-books.controller';
import { UserBooksService } from './user-books.service';
import { PrismaModule } from '../database/prisma.module';
import { GoogleBooksModule } from '../integrations/google-books/google-books.module';

@Module({
  imports: [PrismaModule, GoogleBooksModule],
  controllers: [UserBooksController],
  providers: [UserBooksService],
  exports: [UserBooksService],
})
export class UserBooksModule {}
