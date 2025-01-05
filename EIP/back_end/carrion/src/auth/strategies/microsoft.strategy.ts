import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { VerifyCallback } from 'passport-jwt';
import { Strategy } from 'passport-microsoft'
import microsoftOauthConfig from '../config/microsoft-oauth.config';
import { AuthService } from '../auth.service';
import { Profile } from 'passport';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    @Inject(microsoftOauthConfig.KEY)
    private microsoftConfig: ConfigType<typeof microsoftOauthConfig>,
    private authService: AuthService
  ) {
    super({
      clientID: microsoftConfig.clientID,
      clientSecret: microsoftConfig.clientSecret,
      callbackURL: microsoftConfig.callbackURL,
      scope: ['user.read'],
    });
  }

  async validate( accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    console.log({ profile });
    const user = await this.authService.validateOAuthUser({
      username: profile.name.givenName,
      email: profile.emails[0].value,
      password: '',
    });
    return user;
  }
}
