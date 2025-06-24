
// Security utilities and constants
export const SECURITY_CONFIG = {
  MAX_PROFILE_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_QUESTION_LENGTH: 1000,
  MAX_AI_RESPONSE_LENGTH: 5000,
  RATE_LIMIT_REQUESTS: 10,
  RATE_LIMIT_WINDOW_MS: 60000,
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN_MS: 15 * 60 * 1000, // 15 minutes
  NONCE_LENGTH: 32,
};

// Secure error handling
export class SecureError extends Error {
  public readonly isSecure: boolean = true;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'SecureError';
    this.statusCode = statusCode;
  }
}

// Safe error messages for production
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof SecureError) {
    return error.message;
  }

  // Log the actual error for debugging but don't expose it to users
  console.error('Unexpected error:', error);
  
  return 'An unexpected error occurred. Please try again later.';
};

// Input sanitization for database operations
export const sanitizeForDatabase = (input: string): string => {
  return input
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
    .trim()
    .slice(0, 1000); // Reasonable length limit
};

// Validate user session
export const validateUserSession = (userId: string | undefined): boolean => {
  if (!userId) {
    throw new SecureError('Authentication required', 401);
  }
  
  // Additional session validation could go here
  return true;
};

// Generate cryptographically secure nonce
export const generateNonce = (): string => {
  const array = new Uint8Array(SECURITY_CONFIG.NONCE_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Enhanced CSP header configuration with nonce support
export const getCSPHeader = (nonce?: string): string => {
  const scriptSrc = nonce 
    ? `'self' 'nonce-${nonce}'`
    : "'self' 'unsafe-inline' 'unsafe-eval'"; // Fallback for development

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://ozhoheblmcnxdgbqjrnr.supabase.co wss://ozhoheblmcnxdgbqjrnr.supabase.co",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

// Additional security headers
export const getSecurityHeaders = (nonce?: string): Record<string, string> => {
  return {
    'Content-Security-Policy': getCSPHeader(nonce),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};

// Rate limiting with progressive backoff
interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  isBlocked: boolean;
}

const rateLimitStore = new Map<string, RateLimitState>();

export const checkRateLimit = (identifier: string, maxAttempts: number = SECURITY_CONFIG.RATE_LIMIT_REQUESTS): boolean => {
  const now = Date.now();
  const state = rateLimitStore.get(identifier);

  if (!state) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
      isBlocked: false
    });
    return true;
  }

  // Reset if window has passed
  if (now - state.firstAttempt > SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
      isBlocked: false
    });
    return true;
  }

  // Check if still in cooldown period
  if (state.isBlocked && now - state.lastAttempt < SECURITY_CONFIG.LOGIN_COOLDOWN_MS) {
    return false;
  }

  // Increment attempts
  state.attempts++;
  state.lastAttempt = now;

  if (state.attempts > maxAttempts) {
    state.isBlocked = true;
    return false;
  }

  return true;
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return generateNonce();
};

// Validate CSRF token
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken) {
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
};

// Security logging utility
export const logSecurityEvent = (event: string, details: Record<string, any> = {}) => {
  console.warn(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};
