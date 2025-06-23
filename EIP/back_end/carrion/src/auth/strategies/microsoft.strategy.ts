import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { Strategy, Profile } from 'passport-microsoft';
import microsoftOauthConfig from '../config/microsoft-oauth.config';
import { AuthService } from '../auth.service';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    @Inject(microsoftOauthConfig.KEY)
    private microsoftConfig: ConfigType<typeof microsoftOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: microsoftConfig.clientID,
      clientSecret: microsoftConfig.clientSecret,
      callbackURL: microsoftConfig.callbackURL,
      scope: [
        'openid',
        'profile',
        'offline_access',
        'User.Read',
        'Mail.Read',
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/User.Read',
      ],
      prompt: 'consent',
      accessType: 'offline',
      responseType: 'code',
      responseMode: 'query',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    try {
      const user = await this.authService.validateOAuthUser({
        username: profile.username ?? profile.name.givenName,
        email: profile.emails[0].value,
        password: '',
        hasProfile: false,
      });
      return { ...user, accessToken, refreshToken };
    } catch (error) {
      console.error('erreur:', error);
      return;
    }
  }
}
