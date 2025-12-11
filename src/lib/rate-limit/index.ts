/**
 * Simple in-memory rate limiter for Next.js API routes
 * For production use, consider Redis-based solutions like @upstash/ratelimit
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  resetTime?: number;
  error?: string;
}

// In-memory store for rate limiting
// In production, use Redis or a database
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request
 * Uses IP address for identification
 */
export function getClientIdentifier(request: NextRequest): string {
  // Get IP address from various headers (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = request.headers.get('x-client-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // Use the first available IP
  const ip = forwarded?.split(',')[0]?.trim() ||
             realIp ||
             clientIp ||
             cfConnectingIp ||
             'unknown';

  // Include user agent for additional uniqueness (optional)
  const userAgent = request.headers.get('user-agent') || '';
  const path = new URL(request.url).pathname;

  // Create a key that includes IP, user agent hash, and path
  // This prevents one user from affecting rate limits for different endpoints
  const key = `${ip}:${simpleHash(userAgent)}:${path}`;
  return key;
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { windowMs, maxRequests } = options;
  const now = Date.now();

  // Clean up expired entries occasionally
  if (Math.random() < 0.01) { // 1% chance to cleanup
    cleanupExpiredEntries();
  }

  let clientData = rateLimitStore.get(identifier);

  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    clientData = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(identifier, clientData);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: clientData.resetTime
    };
  }

  // Increment counter
  clientData.count++;

  if (clientData.count > maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: clientData.resetTime,
      error: options.message || `Rate limit exceeded. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds.`
    };
  }

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - clientData.count,
    resetTime: clientData.resetTime
  };
}

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const identifier = getClientIdentifier(request);
    const result = checkRateLimit(identifier, options);

    if (!result.success) {
      // Rate limit exceeded
      const response = NextResponse.json(
        {
          error: result.error,
          retryAfter: Math.ceil((result.resetTime! - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetTime! - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': result.limit!.toString(),
            'X-RateLimit-Remaining': result.remaining!.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime!).toISOString(),
          }
        }
      );
      return response;
    }

    // Add rate limit headers to successful response
    const response = await handler();

    // Clone the response to add headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    // Add rate limit headers
    newResponse.headers.set('X-RateLimit-Limit', result.limit!.toString());
    newResponse.headers.set('X-RateLimit-Remaining', result.remaining!.toString());
    newResponse.headers.set('X-RateLimit-Reset', new Date(result.resetTime!).toISOString());

    return newResponse as NextResponse;
  };
}

/**
 * Pre-configured rate limiters for different endpoint types
 */
export const rateLimiters = {
  // Stricter limits for authentication endpoints
  auth: createRateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again later.'
  }),

  // Moderate limits for API endpoints
  api: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many requests. Please slow down.'
  }),

  // Generous limits for read-only endpoints
  readOnly: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120, // 120 requests per minute
    message: 'Too many requests. Please try again in a minute.'
  }),

  // Strict limits for expensive operations
  expensive: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: 'This operation is resource-intensive. Please wait before trying again.'
  })
};

/**
 * Apply rate limiting to a Next.js API route
 */
export function withRateLimit(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  limiter: ReturnType<typeof createRateLimitMiddleware>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    return limiter(request, () => handler(request, context));
  };
}