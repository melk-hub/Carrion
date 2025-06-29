import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
  override handleRequest(err, user, info, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();
    const frontUrl = process.env.FRONT;

    if (!frontUrl) {
      console.error('FATAL: FRONT environment variable is not set.');
      throw new InternalServerErrorException('Server configuration error.');
    }

    if (err instanceof ConflictException) {
      const message = encodeURIComponent(err.message);
      const redirectUrl = `${frontUrl}/profile?error=conflict&message=${message}`;
      response.redirect(redirectUrl);
      return { redirected: true };
    }

    const request = context.switchToHttp().getRequest();
    if (request.query && request.query.error === 'access_denied') {
      const loginUrl = `${frontUrl}/profile?error=permission_denied`;
      response.redirect(loginUrl);
      return { redirected: true };
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Microsoft authentication failed');
    }

    return user;
  }
}
