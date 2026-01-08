import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@/auth/decorators/public.decorator';
import { AuthService } from '../../auth.service';

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
    } catch (error) {
      // Si l'authentification échoue, essayer de rafraîchir le token
      const refreshToken = request.cookies?.['refresh_token'];

      if (refreshToken) {
        try {
          // Tenter de rafraîchir le token
          const tokens = await this.authService.refreshTokens(refreshToken);

          if (tokens) {
            // Mettre à jour les cookies avec les nouveaux tokens
            response.cookie('access_token', tokens.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours au lieu de 1
            });

            if (tokens.refreshToken) {
              response.cookie('refresh_token', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 jours
              });
            }

            // Attacher l'utilisateur à la requête
            const user = await this.authService.validateJwtUser(tokens.userId);
            request.user = user;

            return true;
          }
        } catch (refreshError) {
          // Log uniquement en mode debug, pas pour les erreurs normales d'expiration
          if (process.env.NODE_ENV === 'development') {
            console.log('Token refresh failed:', refreshError.message);
          }
        }
      }

      // Si tout échoue, lever l'exception d'origine
      throw new UnauthorizedException('Token expired and refresh failed');
    }
  }
}
