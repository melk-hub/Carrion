import {
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override handleRequest(err, user, info, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.query && request.query.error === 'access_denied') {
      const frontendUrl = process.env.FRONT;

      if (!frontendUrl) {
        console.error(
          'FATAL: FRONT environment variable is not set. Cannot redirect on OAuth failure.',
        );
        throw new InternalServerErrorException(
          'Server configuration error: Frontend URL for redirect is not defined.',
        );
      }

      const loginUrl = `${frontendUrl}/`;
      response.redirect(loginUrl);

      return { redirected: true };
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
