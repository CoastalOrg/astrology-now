
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { Star, MessageSquare, User, LogOut, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, signOut } = useAuth();

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

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-light text-slate-800">Astrology Now</h1>
        </div>
        <p className="text-sm text-slate-600">Welcome back, {user?.email?.split('@')[0]}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:text-slate-800"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
