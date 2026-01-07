import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        return req['cookies']['access_token'];
      },
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthJwtPayload, req: Request) {
    const userId = payload.sub;
    const refreshToken = req['cookies']?.['refresh_token'] || '';
    if (refreshToken && refreshToken !== '') {
      await this.authService.validateRefreshToken(userId, refreshToken);
    }
    return this.authService.validateJwtUser(userId);
  }
}
