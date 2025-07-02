import { Injectable } from '@nestjs/common';

@Injectable()
export class CookieUtils {
  /**
   * Convertit une durée JWT (ex: "15m", "1h", "7d") en millisecondes
   */
  static parseJwtDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid JWT duration format: ${duration}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unsupported JWT duration unit: ${unit}`);
    }
  }

  /**
   * Calcule la durée du cookie access_token basée sur JWT_EXPIRE_IN
   */
  static getAccessTokenMaxAge(rememberMe: boolean = false): number {
    const jwtExpiry = process.env.JWT_EXPIRE_IN || '15m';
    const refreshExpiry = process.env.REFRESH_JWT_EXPIRE_IN || '30d';

    if (rememberMe) {
      // Si rememberMe, utiliser la durée du refresh token
      return this.parseJwtDuration(refreshExpiry);
    }

    // Sinon, utiliser la durée du JWT avec une petite marge
    return this.parseJwtDuration(jwtExpiry) + 5 * 60 * 1000; // +5 minutes de marge
  }

  /**
   * Calcule la durée du cookie refresh_token basée sur REFRESH_JWT_EXPIRE_IN
   */
  static getRefreshTokenMaxAge(): number {
    const refreshExpiry = process.env.REFRESH_JWT_EXPIRE_IN || '30d';
    return this.parseJwtDuration(refreshExpiry);
  }

  /**
   * Options communes pour les cookies sécurisés
   */
  static getSecureCookieOptions(maxAge: number, path?: string) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge,
      ...(path && { path }),
    };
  }

  /**
   * Options pour le cookie access_token
   */
  static getAccessTokenCookieOptions(rememberMe: boolean = false) {
    const maxAge = this.getAccessTokenMaxAge(rememberMe);
    return this.getSecureCookieOptions(maxAge);
  }

  /**
   * Options pour le cookie refresh_token
   */
  static getRefreshTokenCookieOptions() {
    const maxAge = this.getRefreshTokenMaxAge();
    return this.getSecureCookieOptions(maxAge, '/auth');
  }

  /**
   * Options pour supprimer les cookies
   */
  static getClearCookieOptions(path?: string) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      ...(path && { path }),
    };
  }
}