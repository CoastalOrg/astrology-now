
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Star, Moon } from 'lucide-react';

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully."
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account."
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    setEmail('myhoroscope001@gmail.com');
    setPassword('Test001');
  };

  return (
    <div className="min-h-screen bg-nova-primary flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="w-full max-w-md space-y-6">
        <Card className="card-nova border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              <div className="relative">
                <Star className="h-8 w-8 text-nova-action" />
                <Sparkles className="h-4 w-4 text-nova-action absolute -top-1 -right-1" />
              </div>
              <Moon className="h-6 w-6 text-nova-text-secondary" />
            </div>
            <CardTitle className="font-light text-nova-text-primary text-2xl">
              ASTROLOGY NOW
              <br />
              <span className="text-lg">Your Daily Horoscope and Personal Astrology Consultant</span>
            </CardTitle>
            <p className="text-nova-text-secondary text-xl">Discover Your Cosmic Journey</p>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input 
                      id="signin-email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input 
                      id="signin-password" 
                      type="password" 
                      placeholder="Enter your password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className="h-11" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="btn-nova w-full h-11" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      required 
                      className="h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="Create a password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className="h-11" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="btn-nova w-full h-11" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Separate Test Credentials Section */}
        <Card className="card-nova border-2 border-nova-action/50 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-nova-action" />
                <h3 className="text-lg font-bold text-nova-text-primary">Test Account Available</h3>
              </div>
              <div className="bg-white/10 rounded-lg p-4 space-y-2">
                <div className="text-base text-nova-text-primary">
                  <p><strong>Email:</strong> myhoroscope001@gmail.com</p>
                  <p><strong>Password:</strong> Test001</p>
                </div>
              </div>
              <Button 
                onClick={handleTestLogin}
                className="btn-nova w-full h-12 text-base font-semibold"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Fill Test Credentials
              </Button>
              <p className="text-sm text-nova-text-secondary">
                Click the button above to automatically fill the login form with test credentials
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
