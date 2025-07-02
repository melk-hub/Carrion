import { Injectable } from '@nestjs/common';

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  isBlocked: boolean;
}

@Injectable()
export class RateLimiterUtils {
  private static readonly store = new Map<string, RateLimitEntry>();

  // Configuration par défaut
  private static readonly DEFAULT_CONFIG = {
    maxAttempts: 5, // 5 tentatives max
    windowMs: 15 * 60 * 1000, // Dans une fenêtre de 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Blocage pendant 30 minutes
  };

  /**
   * Vérifie si une IP/utilisateur est rate-limité
   */
  static isRateLimited(
    identifier: string,
    config = RateLimiterUtils.DEFAULT_CONFIG,
  ): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry) {
      return false;
    }

    // Si l'utilisateur est bloqué, vérifier si le blocage a expiré
    if (entry.isBlocked) {
      if (now - entry.lastAttempt > config.blockDurationMs) {
        // Le blocage a expiré, réinitialiser
        this.store.delete(identifier);
        return false;
      }
      return true; // Toujours bloqué
    }

    // Vérifier si la fenêtre de temps a expiré
    if (now - entry.firstAttempt > config.windowMs) {
      // Fenêtre expirée, réinitialiser
      this.store.delete(identifier);
      return false;
    }

    return false;
  }

  /**
   * Enregistre une tentative (succès ou échec)
   */
  static recordAttempt(
    identifier: string,
    isSuccess: boolean,
    config = RateLimiterUtils.DEFAULT_CONFIG,
  ): void {
    const now = Date.now();

    if (isSuccess) {
      // Succès : réinitialiser le compteur
      this.store.delete(identifier);
      return;
    }

    // Échec : incrémenter le compteur
    const entry = this.store.get(identifier);

    if (!entry) {
      // Première tentative échouée
      this.store.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
        isBlocked: false,
      });
      return;
    }

    // Vérifier si la fenêtre a expiré
    if (now - entry.firstAttempt > config.windowMs) {
      // Nouvelle fenêtre
      this.store.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
        isBlocked: false,
      });
      return;
    }

    // Incrémenter dans la fenêtre actuelle
    entry.attempts++;
    entry.lastAttempt = now;

    // Vérifier si le seuil est atteint
    if (entry.attempts >= config.maxAttempts) {
      entry.isBlocked = true;
    }

    this.store.set(identifier, entry);
  }

  /**
   * Obtient les informations de rate limiting pour un identifier
   */
  static getRateLimitInfo(identifier: string): {
    isLimited: boolean;
    attemptsRemaining: number;
    resetTime: number | null;
    blockRemainingMs: number | null;
  } {
    const entry = this.store.get(identifier);
    const config = this.DEFAULT_CONFIG;

    if (!entry) {
      return {
        isLimited: false,
        attemptsRemaining: config.maxAttempts,
        resetTime: null,
        blockRemainingMs: null,
      };
    }

    const now = Date.now();

    if (entry.isBlocked) {
      const blockRemainingMs = config.blockDurationMs - (now - entry.lastAttempt);
      return {
        isLimited: true,
        attemptsRemaining: 0,
        resetTime: entry.lastAttempt + config.blockDurationMs,
        blockRemainingMs: Math.max(0, blockRemainingMs),
      };
    }

    const windowRemainingMs = config.windowMs - (now - entry.firstAttempt);
    return {
      isLimited: false,
      attemptsRemaining: Math.max(0, config.maxAttempts - entry.attempts),
      resetTime: windowRemainingMs > 0 ? entry.firstAttempt + config.windowMs : null,
      blockRemainingMs: null,
    };
  }

  /**
   * Nettoie les entrées expirées (à appeler périodiquement)
   */
  static cleanup(): void {
    const now = Date.now();
    const config = this.DEFAULT_CONFIG;

    for (const [identifier, entry] of this.store.entries()) {
      const timeSinceLastAttempt = now - entry.lastAttempt;

      // Supprimer les entrées expirées
      if (
        timeSinceLastAttempt > config.blockDurationMs ||
        (!entry.isBlocked && timeSinceLastAttempt > config.windowMs)
      ) {
        this.store.delete(identifier);
      }
    }
  }

  /**
   * Obtient des statistiques globales
   */
  static getStats(): {
    totalEntries: number;
    blockedEntries: number;
    activeWindows: number;
  } {
    let blockedEntries = 0;
    let activeWindows = 0;

    for (const entry of this.store.values()) {
      if (entry.isBlocked) {
        blockedEntries++;
      } else {
        activeWindows++;
      }
    }

    return {
      totalEntries: this.store.size,
      blockedEntries,
      activeWindows,
    };
  }

  /**
   * Réinitialise complètement le rate limiter (pour les tests)
   */
  static reset(): void {
    this.store.clear();
  }
} 