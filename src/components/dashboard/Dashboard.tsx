
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Sidebar from './Sidebar';
import HoroscopeSection from './HoroscopeSection';
import AiChatSection from './AiChatSection';
import ProfileSection from './ProfileSection';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('horoscope');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log('Dashboard user:', user?.email);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-slate-600">Loading your cosmic dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the main App component
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'horoscope':
        return <HoroscopeSection />;
      case 'ai-chat':
        return <AiChatSection />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <HoroscopeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="flex h-screen">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-light text-slate-800">Astrology Now</h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-slate-600 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-slate-600 mt-1 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-slate-600 mt-1 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4">
              <div className="space-y-2">
                {[
                  { id: 'horoscope', label: 'Daily Horoscope' },
                  { id: 'ai-chat', label: 'Ask AI' },
                  { id: 'profile', label: 'Profile' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 mt-16 lg:mt-0">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
