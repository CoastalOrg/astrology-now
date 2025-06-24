
// Security utilities and constants
export const SECURITY_CONFIG = {
  MAX_PROFILE_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_QUESTION_LENGTH: 1000,
  MAX_AI_RESPONSE_LENGTH: 5000,
  RATE_LIMIT_REQUESTS: 10,
  RATE_LIMIT_WINDOW_MS: 60000,
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
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

// CSP header configuration
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: In production, remove unsafe-* directives
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://ozhoheblmcnxdgbqjrnr.supabase.co wss://ozhoheblmcnxdgbqjrnr.supabase.co",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'"
  ].join('; ');
};
