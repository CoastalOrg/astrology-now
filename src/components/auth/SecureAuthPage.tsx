import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authSchema } from '@/utils/validation';
import { getSafeErrorMessage, SecureError, checkRateLimit, logSecurityEvent, generateCSRFToken } from '@/utils/security';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
const SecureAuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState('');
  const {
    toast
  } = useToast();

  // Generate CSRF token on component mount
  useEffect(() => {
    setCsrfToken(generateCSRFToken());
  }, []);
  const validateForm = (): boolean => {
    try {
      authSchema.parse({
        email,
        password
      });
      if (isSignUp && password !== confirmPassword) {
        setErrors({
          confirmPassword: 'Passwords do not match'
        });
        return false;
      }
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Rate limiting check
    const rateLimitKey = `auth:${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, 5)) {
      toast({
        title: "Too Many Attempts",
        description: "Please wait 15 minutes before trying again.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      if (isSignUp) {
        const {
          error
        } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              full_name: '',
              // Will be updated in profile
              csrf_token: csrfToken
            }
          }
        });
        if (error) throw new SecureError(error.message);
        logSecurityEvent('USER_SIGNUP_SUCCESS', {
          email: sanitizedEmail
        });
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account."
        });
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password
        });
        if (error) {
          logSecurityEvent('USER_LOGIN_FAILED', {
            email: sanitizedEmail,
            error: error.message
          });
          throw new SecureError(error.message);
        }
        logSecurityEvent('USER_LOGIN_SUCCESS', {
          email: sanitizedEmail
        });
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to your account."
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleTestLogin = () => {
    setEmail('myhoroscope001@gmail.com');
    setPassword('Test001');
    setIsSignUp(false);
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="w-full bg-slate-50">
          <CardHeader className="text-center bg-violet-200 rounded-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <CardTitle className="text-2xl">Astrology Now</CardTitle>
            </div>
            <CardDescription>
              {isSignUp ? 'Create your cosmic account' : 'Welcome back to your cosmic journey'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="bg-violet-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden CSRF token */}
              <input type="hidden" name="csrf_token" value={csrfToken} />
              
              <div>
                <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} autoComplete="email" className={errors.email ? 'border-red-500' : ''} />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={128} autoComplete={isSignUp ? "new-password" : "current-password"} className={errors.password ? 'border-red-500' : ''} />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              {isSignUp && <div>
                  <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required maxLength={128} autoComplete="new-password" className={errors.confirmPassword ? 'border-red-500' : ''} />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>}
              
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" disabled={loading}>
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            
            <div className="text-center mt-4">
              <Button variant="link" onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
              setPassword('');
              setConfirmPassword('');
              setCsrfToken(generateCSRFToken()); // Generate new CSRF token
            }} className="text-purple-600 hover:text-purple-700">
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials Section */}
        <Card className="bg-blue-50/95 backdrop-blur-sm border-2 border-blue-200 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-800">Test Account Available</h3>
              </div>
              <div className="bg-white/70 rounded-lg p-4 space-y-2">
                <div className="text-base text-blue-800">
                  <p><strong>Email:</strong> myhoroscope001@gmail.com</p>
                  <p><strong>Password:</strong> Test001</p>
                </div>
              </div>
              <Button onClick={handleTestLogin} className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-base font-semibold">
                <Sparkles className="h-4 w-4 mr-2" />
                Fill Test Credentials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default SecureAuthPage;