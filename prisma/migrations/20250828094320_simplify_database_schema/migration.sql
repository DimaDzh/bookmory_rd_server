/*
  Warnings:

  - You are about to drop the column `added_by_id` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `user_books` table. All the data in the column will be lost.
  - You are about to drop the column `readingSessions` on the `user_books` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."books" DROP CONSTRAINT "books_added_by_id_fkey";

-- DropIndex
DROP INDEX "public"."users_username_key";

-- AlterTable
ALTER TABLE "public"."books" DROP COLUMN "added_by_id";

-- AlterTable
ALTER TABLE "public"."user_books" DROP COLUMN "rating",
DROP COLUMN "readingSessions";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "avatar",
DROP COLUMN "username";
