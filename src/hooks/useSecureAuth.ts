
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { validateUserSession, SECURITY_CONFIG } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

export const useSecureAuth = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [lastActivity, setLastActivity] = useState(Date.now());

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

  return {
    user,
    requireAuth,
    isAuthenticated: !!user,
  };
};
