/**
 * Performance configuration for MailFilter service
 * Dynamically adjusts concurrency limits based on user count and system performance
 */

export interface PerformanceConfig {
  concurrencyLimit: number;
  maxApiCallsPerMinute: number;
  adjustmentInterval: number; // milliseconds
  errorThreshold: number; // percentage
  latencyThreshold: number; // milliseconds
}

export class DynamicPerformanceConfig {
  private static readonly USER_SCALE_LIMITS = {
    small: { maxUsers: 100, concurrency: 5, apiCallsPerMin: 300 },
    medium: { maxUsers: 500, concurrency: 10, apiCallsPerMin: 600 },
    large: { maxUsers: 1000, concurrency: 15, apiCallsPerMin: 900 },
    enterprise: { maxUsers: 5000, concurrency: 25, apiCallsPerMin: 1500 },
    massive: { maxUsers: Infinity, concurrency: 35, apiCallsPerMin: 2500 }
  };

  /**
   * Calculate optimal concurrency for given user count
   */
  static getOptimalConfig(userCount: number): PerformanceConfig {
    // Find appropriate scale
    const scale = Object.values(this.USER_SCALE_LIMITS).find(
      s => userCount <= s.maxUsers
    ) || this.USER_SCALE_LIMITS.massive;

    return {
      concurrencyLimit: scale.concurrency,
      maxApiCallsPerMinute: scale.apiCallsPerMin,
      adjustmentInterval: 5 * 60 * 1000, // 5 minutes
      errorThreshold: 0.05, // 5%
      latencyThreshold: 2000 // 2 seconds
    };
  }

  /**
   * Adjust config based on real-time metrics
   */
  static adjustConfig(
    currentConfig: PerformanceConfig, 
    metrics: {
      errorRate: number;
      avgLatency: number;
      queueSize: number;
    }
  ): PerformanceConfig {
    let newConcurrency = currentConfig.concurrencyLimit;

    // Reduce if performance is poor
    if (metrics.errorRate > currentConfig.errorThreshold || 
        metrics.avgLatency > currentConfig.latencyThreshold) {
      newConcurrency = Math.max(3, Math.floor(newConcurrency * 0.8));
    }
    // Increase if performing well and queue is building up
    else if (metrics.errorRate < 0.01 && 
             metrics.avgLatency < 500 && 
             metrics.queueSize > 10 &&
             newConcurrency < 50) {
      newConcurrency = Math.min(50, Math.floor(newConcurrency * 1.2));
    }

    return {
      ...currentConfig,
      concurrencyLimit: newConcurrency
    };
  }

  /**
   * Recommendations for 1000 users with different email volumes
   */
  static getRecommendationsFor1000Users() {
    return {
      conservative: { // 20 emails/user/day, 15% job-related
        estimatedLoad: '3,000 emails/day = 6 emails/minute peak',
        recommendedConcurrency: 10,
        reasoning: 'Conservative approach with safety margin'
      },
      moderate: { // 50 emails/user/day, 20% job-related  
        estimatedLoad: '10,000 emails/day = 21 emails/minute peak',
        recommendedConcurrency: 15,
        reasoning: 'Balanced performance for typical enterprise load'
      },
      intensive: { // 100 emails/user/day, 25% job-related
        estimatedLoad: '25,000 emails/day = 52 emails/minute peak',
        recommendedConcurrency: 25,
        reasoning: 'High-performance setup for heavy email users'
      },
      monitoring: {
        recommendation: 'Start with 15, monitor and auto-adjust',
        keyMetrics: ['Error rate < 5%', 'Avg latency < 2s', 'ClaudeAI calls < 900/min']
      }
    };
  }
} 