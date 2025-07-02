import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { AuthService } from '../../auth.service';
import { CookieUtils } from '../../utils/cookie.utils';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    try {
      // Essayer d'abord l'authentification normale
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      // Si l'authentification échoue, essayer de rafraîchir le token
      const refreshToken = request.cookies?.['refresh_token'];

      if (refreshToken) {
        try {
          // Tenter de rafraîchir le token
          const tokens = await this.authService.refreshTokens(refreshToken);

          if (tokens) {
            // Mettre à jour les cookies avec les nouveaux tokens
            response.cookie(
              'access_token',
              tokens.accessToken,
              CookieUtils.getAccessTokenCookieOptions(false), // refresh = pas rememberMe
            );

            if (tokens.refreshToken) {
              response.cookie(
                'refresh_token',
                tokens.refreshToken,
                CookieUtils.getRefreshTokenCookieOptions(),
              );
            }

            // Attacher l'utilisateur à la requête
            const user = await this.authService.validateJwtUser(tokens.userId);
            request.user = user;

            return true;
          }
        } catch (refreshError) {
          console.log('Token refresh failed:', refreshError.message);
        }
      }

      // Si tout échoue, lever l'exception d'origine
      throw new UnauthorizedException('Token expired and refresh failed');
    }
  }
}
