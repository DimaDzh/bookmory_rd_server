import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        statusCode: 401,
      });
    }

    const token = authHeader.substring(7);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'default-secret',
      });
      req.user = decoded as JwtPayload;
      next();
    } catch {
      return res.status(401).json({
        message: 'Invalid token.',
        statusCode: 401,
      });
    }
  }
}
