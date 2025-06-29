import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override handleRequest(err, user, info, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse();
    const frontUrl = process.env.FRONT;

    if (err instanceof ConflictException) {
      const message = encodeURIComponent(err.message);
      const redirectUrl = `${frontUrl}/profile?error=conflict&message=${message}`;
      response.redirect(redirectUrl);
      return { redirected: true };
    }

    if (err || !user) {
      const errorMessage = info?.message || 'Google authentication failed';
      throw err || new UnauthorizedException(errorMessage);
    }
    return user;
  }
}
