
import React from 'react';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import AuthPage from '@/components/auth/AuthPage';
import Dashboard from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Zap, Brain, Diamond, Rocket, Eye } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Star size={Math.random() * 8 + 4} className="text-yellow-300" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Main Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            ASTROLOGY NOW!
          </h1>
          <p className="text-2xl md:text-3xl mb-4 font-semibold text-yellow-300">
            🌟 UNLOCK THE SECRETS OF THE UNIVERSE! 🌟
          </p>
          <p className="text-xl md:text-2xl mb-8 text-purple-200">
            The REVOLUTIONARY cosmic app that GUARANTEES to transform your destiny!
          </p>
        </div>

        {/* Exaggerated Claims Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 border-yellow-400 border-2">
            <CardContent className="p-6 text-center">
              <Brain className="mx-auto mb-4 text-yellow-400" size={48} />
              <h3 className="text-xl font-bold mb-2 text-yellow-300">AI FORTUNE TELLER</h3>
              <p className="text-purple-200">
                Our MYSTICAL AI has read over 10 BILLION horoscopes and can predict your future with 
                <span className="text-yellow-400 font-bold"> 99.9% ACCURACY!</span>*
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-800/50 to-purple-800/50 border-yellow-400 border-2">
            <CardContent className="p-6 text-center">
              <Diamond className="mx-auto mb-4 text-yellow-400" size={48} />
              <h3 className="text-xl font-bold mb-2 text-yellow-300">INSTANT WEALTH PREDICTION</h3>
              <p className="text-purple-200">
                Discover EXACTLY when you'll become rich! Our cosmic calculator has helped 
                <span className="text-yellow-400 font-bold"> 50,000+ users</span> find their fortune!*
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-800/50 to-indigo-800/50 border-yellow-400 border-2">
            <CardContent className="p-6 text-center">
              <Rocket className="mx-auto mb-4 text-yellow-400" size={48} />
              <h3 className="text-xl font-bold mb-2 text-yellow-300">LOVE LIFE BOOSTER</h3>
              <p className="text-purple-200">
                Find your PERFECT SOULMATE using our ancient stellar algorithms! 
                <span className="text-yellow-400 font-bold"> 95% SUCCESS RATE</span> guaranteed!*
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-800/50 to-blue-800/50 border-yellow-400 border-2">
            <CardContent className="p-6 text-center">
              <Eye className="mx-auto mb-4 text-yellow-400" size={48} />
              <h3 className="text-xl font-bold mb-2 text-yellow-300">THIRD EYE ACTIVATION</h3>
              <p className="text-purple-200">
                Unlock your PSYCHIC POWERS in just 7 days! See the future, read minds, 
                <span className="text-yellow-400 font-bold"> BECOME OMNISCIENT!</span>*
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-800/50 to-pink-800/50 border-yellow-400 border-2">
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-4 text-yellow-400" size={48} />
              <h3 className="text-xl font-bold mb-2 text-yellow-300">COSMIC ENERGY BOOST</h3>
              <p className="text-purple-200">
                Harness the POWER OF THE STARS! Increase your energy by 
                <span className="text-yellow-400 font-bold"> 500%</span> and achieve SUPERHUMAN abilities!*
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-800/50 to-orange-800/50 border-yellow-400 border-2">
            <CardContent className="p-6 text-center">
              <Star className="mx-auto mb-4 text-yellow-400" size={48} />
              <h3 className="text-xl font-bold mb-2 text-yellow-300">DESTINY REWRITER</h3>
              <p className="text-purple-200">
                CHANGE YOUR FATE with our patented Star-Alignment Technology™! 
                <span className="text-yellow-400 font-bold"> REWRITE REALITY</span> itself!*
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6 animate-pulse">
            🚨 LIMITED TIME: FREE COSMIC CONSULTATION! 🚨
          </p>
          <p className="text-lg mb-8 text-purple-200">
            Don't let another day pass without knowing your TRUE DESTINY!
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            UNLOCK MY DESTINY NOW! ⭐
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-purple-300 opacity-60">
            *Results not guaranteed. For entertainment purposes only. 
            Individual cosmic alignment may vary. Side effects may include increased happiness, 
            spontaneous enlightenment, and an irresistible urge to check your horoscope daily.
          </p>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show Hero section if user is not authenticated
  if (!user) {
    return (
      <>
        <HeroSection />
        <AuthPage />
      </>
    );
  }

  return <Dashboard />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
