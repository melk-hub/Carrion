import { registerAs } from '@nestjs/config';

export default registerAs('microsoftOAuth', () => ({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: process.env.MICROSOFT_REDIRECT_URI,
}));
