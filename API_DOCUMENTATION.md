# BookMory API Documentation

## Overview

BookMory is a personal library management system that allows users to search, organize, and track their reading progress. The API is built with NestJS and provides endpoints for user authentication, book search via Google Books API, personal library management, and reading progress tracking.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.bookmory.app`

## Documentation

Interactive API documentation is available at:

- **Development**: `http://localhost:3000/api/docs`
- **Production**: `https://api.bookmory.app/docs`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check

- `GET /` - Health check endpoint

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile
- `GET /auth/validate` - Validate JWT token

### Users

- `POST /users` - Create a new user account
- `GET /users` - Get all users (Admin/Moderator only)
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID (Admin/Moderator only)
- `PATCH /users/me` - Update current user profile
- `PATCH /users/:id` - Update user by ID (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Books (Google Books Integration)

- `GET /books/search` - Search for books using Google Books API
- `GET /books/:id` - Get a specific book by Google Books ID

### User Books (Personal Library)

- `POST /user-books` - Add a book to user library from Google Books search
- `GET /user-books` - Get user library with optional filters
- `GET /user-books/stats` - Get library statistics
- `GET /user-books/:bookId` - Get specific book from user library
- `PATCH /user-books/:bookId/progress` - Update reading progress for a book
- `DELETE /user-books/:bookId` - Remove book from library

## Data Models

### User

```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "USER | ADMIN | MODERATOR",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Book

```json
{
  "id": "string",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "description": "string",
  "coverUrl": "string",
  "totalPages": "number",
  "googleBooksId": "string",
  "language": "string",
  "publisher": "string",
  "publishedDate": "string",
  "genres": ["string"]
}
```

### User Book

```json
{
  "id": "string",
  "userId": "string",
  "bookId": "string",
  "status": "WANT_TO_READ | READING | FINISHED | PAUSED | DNF",
  "currentPage": "number",
  "review": "string",
  "isFavorite": "boolean",
  "startedAt": "string",
  "finishedAt": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "book": "Book",
  "progressPercentage": "number"
}
```

## Reading Status

- `WANT_TO_READ` - User wants to read this book
- `READING` - Currently reading
- `FINISHED` - Completed reading
- `PAUSED` - Temporarily stopped reading
- `DNF` - Did Not Finish

## User Roles

- `USER` - Regular user (default)
- `MODERATOR` - Can manage users
- `ADMIN` - Full administrative access

## Error Handling

The API returns structured error responses:

```json
{
  "statusCode": 400,
  "message": "Error description or array of validation errors",
  "error": "Bad Request",
  "timestamp": "2025-09-06T10:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Current limits:

- 100 requests per minute per IP for unauthenticated endpoints
- 1000 requests per minute per user for authenticated endpoints

## CORS

CORS is enabled for:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- Production domains (configured per environment)

## Google Books Integration

The API integrates with Google Books API to:

- Search for books by title, author, or ISBN
- Retrieve detailed book information
- Fetch book covers and metadata

Note: Books are only stored in the database when a user adds them to their library.

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (for caching)

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run start:dev`

### Environment Variables

```
DATABASE_URL=postgresql://username:password@localhost:5432/bookmory
JWT_SECRET=your-jwt-secret
GOOGLE_BOOKS_API_KEY=your-google-books-api-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Support

For support and questions, please contact:

- Email: support@bookmory.app
- GitHub: https://github.com/DimaDzh/bookmory_rd_client

## License

MIT License - see LICENSE file for details.
