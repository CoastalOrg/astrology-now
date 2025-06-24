
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  validateUserSession, 
  SECURITY_CONFIG, 
  checkRateLimit, 
  logSecurityEvent 
} from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

export const useSecureAuth = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionNonce, setSessionNonce] = useState<string>('');

  // Generate session nonce on mount
  useEffect(() => {
    const nonce = crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    setSessionNonce(nonce);
  }, []);

  // Track user activity for session timeout
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Check for session timeout
  useEffect(() => {
    if (!user) return;

    const checkSessionTimeout = () => {
      const timeSinceActivity = Date.now() - lastActivity;
      
      if (timeSinceActivity > SECURITY_CONFIG.SESSION_TIMEOUT_MS) {
        logSecurityEvent('SESSION_TIMEOUT', { 
          userId: user.id,
          timeSinceActivity 
        });
        
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
        signOut();
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, lastActivity, signOut, toast]);

  const requireAuth = (): string => {
    if (!user?.id) {
      throw new Error('Authentication required');
    }
    validateUserSession(user.id);
    return user.id;
  };

  const checkUserRateLimit = (action: string): boolean => {
    if (!user?.id) return false;
    
    const identifier = `${user.id}:${action}`;
    const allowed = checkRateLimit(identifier);
    
    if (!allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        userId: user.id, 
        action 
      });
      
      toast({
        title: "Rate Limit Exceeded",
        description: "Please wait before trying again.",
        variant: "destructive",
      });
    }
    
    return allowed;
  };

  return {
    user,
    requireAuth,
    isAuthenticated: !!user,
    sessionNonce,
    checkUserRateLimit,
  };
};
