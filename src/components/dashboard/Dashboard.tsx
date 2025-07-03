
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import HoroscopeSection from './HoroscopeSection';
import AiChatSection from './AiChatSection';
import SecureProfileSection from './SecureProfileSection';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, User, LogOut, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { requireAuth } = useSecureAuth();
  const [activeSection, setActiveSection] = useState('horoscope');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      requireAuth();
      console.log('Dashboard user:', user?.email);
    } catch (error) {
      console.error('Authentication error in dashboard:', error);
    }
  }, [user, requireAuth]);

  const menuItems = [
    {
      id: 'horoscope',
      label: 'Daily Horoscope',
      icon: Star,
    },
    {
      id: 'ai-chat',
      label: 'Ask AI',
      icon: MessageSquare,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'horoscope':
        return <HoroscopeSection />;
      case 'ai-chat':
        return <AiChatSection />;
      case 'profile':
        return <SecureProfileSection />;
      default:
        return <HoroscopeSection />;
    }
  };

  const handleMenuItemClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal/10 to-rose/10">
      {/* Header with Hamburger Menu */}
      <header className="bg-gradient-to-r from-teal/20 to-steel/20 backdrop-blur-sm border-b border-teal/30 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-steel" />
            <h1 className="text-xl font-light text-steel">Astrology Now</h1>
          </div>
          
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 hover:bg-teal/20">
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className="block w-5 h-0.5 bg-steel mb-1"></span>
                  <span className="block w-5 h-0.5 bg-steel mb-1"></span>
                  <span className="block w-5 h-0.5 bg-steel"></span>
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-gradient-to-br from-teal/10 to-rose/10 border-teal/30">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-steel" />
                    <span className="text-steel">Navigation</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-8 space-y-2">
                <div className="text-sm text-steel/80 mb-4">
                  Welcome back, {user?.email?.split('@')[0]}
                </div>
                
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={`w-full justify-start h-12 ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-teal/20 to-rose/20 text-steel border border-teal/30"
                          : "hover:bg-teal/10 text-steel/80 hover:text-steel"
                      }`}
                      onClick={() => handleMenuItemClick(item.id)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-teal/20">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-steel/80 hover:text-steel hover:bg-rose/10"
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderActiveSection()}
      </main>
    </div>
  );
};

export default Dashboard;
