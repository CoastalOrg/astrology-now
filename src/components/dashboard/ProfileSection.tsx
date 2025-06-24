
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Save, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ZodiacSign = Database['public']['Enums']['zodiac_sign'];

const zodiacSigns = [
  { value: 'aries' as ZodiacSign, label: 'Aries ♈' },
  { value: 'taurus' as ZodiacSign, label: 'Taurus ♉' },
  { value: 'gemini' as ZodiacSign, label: 'Gemini ♊' },
  { value: 'cancer' as ZodiacSign, label: 'Cancer ♋' },
  { value: 'leo' as ZodiacSign, label: 'Leo ♌' },
  { value: 'virgo' as ZodiacSign, label: 'Virgo ♍' },
  { value: 'libra' as ZodiacSign, label: 'Libra ♎' },
  { value: 'scorpio' as ZodiacSign, label: 'Scorpio ♏' },
  { value: 'sagittarius' as ZodiacSign, label: 'Sagittarius ♐' },
  { value: 'capricorn' as ZodiacSign, label: 'Capricorn ♑' },
  { value: 'aquarius' as ZodiacSign, label: 'Aquarius ♒' },
  { value: 'pisces' as ZodiacSign, label: 'Pisces ♓' },
];

const ProfileSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    zodiac_sign: '' as ZodiacSign | '',
    birth_date: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user?.email || '',
          zodiac_sign: data.zodiac_sign || '',
          birth_date: data.birth_date || '',
        });
      } else {
        setProfile(prev => ({
          ...prev,
          email: user?.email || '',
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          zodiac_sign: profile.zodiac_sign || null,
          birth_date: profile.birth_date || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-slate-800 mb-2">Profile</h2>
          <p className="text-slate-600">Manage your personal information and preferences</p>
        </div>
        <User className="h-8 w-8 text-purple-600" />
      </div>

      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zodiac_sign">Zodiac Sign</Label>
              <Select
                value={profile.zodiac_sign}
                onValueChange={(value: ZodiacSign) => handleInputChange('zodiac_sign', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your zodiac sign" />
                </SelectTrigger>
                <SelectContent>
                  {zodiacSigns.map((sign) => (
                    <SelectItem key={sign.value} value={sign.value}>
                      {sign.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Birth Date</Label>
              <Input
                id="birth_date"
                type="date"
                value={profile.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={saveProfile}
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Profile
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600 mb-1">Member since</p>
              <p className="font-medium text-slate-800">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">User ID</p>
              <p className="font-mono text-xs text-slate-600 break-all">
                {user?.id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
