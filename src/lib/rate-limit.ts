/**
 * Simple in-memory rate limiter for API routes.
 * In production, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

/**
 * Check if a request should be rate limited.
 * Returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 30, windowSeconds: 60 }
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
    };
  }

  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Create a rate-limited API response when the limit is exceeded.
 */
export function rateLimitResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retryAfter: resetIn,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": resetIn.toString(),
      },
    }
  );
}
