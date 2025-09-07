// Rate limiter implementation

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator: (userId: string, endpoint: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private static readonly DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
    keyGenerator: (userId: string, endpoint: string) => `${userId}:${endpoint}`,
  };

  private static readonly AI_DIAGNOSIS_CONFIG: RateLimitConfig = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 AI diagnoses per hour
    keyGenerator: (userId: string) => `ai-diagnosis:${userId}`,
  };

  private static readonly EMERGENCY_CONFIG: RateLimitConfig = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 emergency requests per minute
    keyGenerator: (userId: string) => `emergency:${userId}`,
  };

  private static requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();

  /**
   * Check if request is allowed based on rate limit
   */
  static async checkRateLimit(
    userId: string,
    endpoint: string = "default",
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const key = finalConfig.keyGenerator(userId, endpoint);
    const now = Date.now();

    // Get current request count for this key
    const current = this.requestCounts.get(key);

    if (!current || current.resetTime < now) {
      // First request in window or window has expired
      this.requestCounts.set(key, {
        count: 1,
        resetTime: now + finalConfig.windowMs,
      });

      return {
        allowed: true,
        remaining: finalConfig.maxRequests - 1,
        resetTime: now + finalConfig.windowMs,
      };
    }

    if (current.count >= finalConfig.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      };
    }

    // Increment count
    current.count++;
    this.requestCounts.set(key, current);

    return {
      allowed: true,
      remaining: finalConfig.maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  /**
   * Check AI diagnosis rate limit
   */
  static async checkAIDiagnosisLimit(userId: string): Promise<RateLimitResult> {
    return this.checkRateLimit(
      userId,
      "ai-diagnosis",
      this.AI_DIAGNOSIS_CONFIG
    );
  }

  /**
   * Check emergency request rate limit
   */
  static async checkEmergencyLimit(userId: string): Promise<RateLimitResult> {
    return this.checkRateLimit(userId, "emergency", this.EMERGENCY_CONFIG);
  }

  /**
   * Get rate limit status for user
   */
  static async getRateLimitStatus(
    userId: string,
    endpoint: string = "default"
  ): Promise<RateLimitResult> {
    const key = this.DEFAULT_CONFIG.keyGenerator(userId, endpoint);
    const current = this.requestCounts.get(key);
    const now = Date.now();

    if (!current || current.resetTime < now) {
      return {
        allowed: true,
        remaining: this.DEFAULT_CONFIG.maxRequests,
        resetTime: now + this.DEFAULT_CONFIG.windowMs,
      };
    }

    return {
      allowed: current.count < this.DEFAULT_CONFIG.maxRequests,
      remaining: Math.max(0, this.DEFAULT_CONFIG.maxRequests - current.count),
      resetTime: current.resetTime,
    };
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  static resetRateLimit(userId: string, endpoint: string = "default"): void {
    const key = this.DEFAULT_CONFIG.keyGenerator(userId, endpoint);
    this.requestCounts.delete(key);
  }

  /**
   * Clean up expired rate limit entries
   */
  static cleanupExpiredEntries(): void {
    const now = Date.now();

    for (const [key, value] of this.requestCounts.entries()) {
      if (value.resetTime < now) {
        this.requestCounts.delete(key);
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  static getStats(): {
    totalKeys: number;
    activeWindows: number;
    expiredWindows: number;
  } {
    const now = Date.now();
    let activeWindows = 0;
    let expiredWindows = 0;

    for (const value of this.requestCounts.values()) {
      if (value.resetTime >= now) {
        activeWindows++;
      } else {
        expiredWindows++;
      }
    }

    return {
      totalKeys: this.requestCounts.size,
      activeWindows,
      expiredWindows,
    };
  }
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  RateLimiter.cleanupExpiredEntries();
}, 5 * 60 * 1000);
