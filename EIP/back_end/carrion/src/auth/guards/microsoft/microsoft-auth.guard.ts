import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
  override handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.query && request.query.error === 'access_denied') {
      const frontendUrl = process.env.FRONT;

      if (!frontendUrl) {
        console.error('FATAL: FRONT environment variable is not set.');
        throw new InternalServerErrorException('Server configuration error.');
      }

      const loginUrl = `${frontendUrl}?error=permission_denied`;
      response.redirect(loginUrl);

      return { redirected: true };
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Microsoft authentication failed');
    }

    return user;
  }
}
