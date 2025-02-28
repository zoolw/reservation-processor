import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !this.isValidApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid API Key');
    }
    next();
  }

  private isValidApiKey(apiKey: string | string[]): boolean {
    return apiKey === process.env.API_KEY;
  }
}
