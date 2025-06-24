
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { profileSchema, sanitizeHtml } from '@/utils/validation';
import { getSafeErrorMessage, SecureError } from '@/utils/security';
import { User, Calendar, Star } from 'lucide-react';

const SecureProfileSection = () => {
  const { requireAuth } = useSecureAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    zodiac_sign: '',
    birth_date: '',
  });

  const zodiacSigns = [
    { value: 'aries', label: '♈ Aries' },
    { value: 'taurus', label: '♉ Taurus' },
    { value: 'gemini', label: '♊ Gemini' },
    { value: 'cancer', label: '♋ Cancer' },
    { value: 'leo', label: '♌ Leo' },
    { value: 'virgo', label: '♍ Virgo' },
    { value: 'libra', label: '♎ Libra' },
    { value: 'scorpio', label: '♏ Scorpio' },
    { value: 'sagittarius', label: '♐ Sagittarius' },
    { value: 'capricorn', label: '♑ Capricorn' },
    { value: 'aquarius', label: '♒ Aquarius' },
    { value: 'pisces', label: '♓ Pisces' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = requireAuth();
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw new SecureError(error.message);

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          zodiac_sign: data.zodiac_sign || '',
          birth_date: data.birth_date || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateProfile = (): boolean => {
    try {
      profileSchema.parse(profile);
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

  const handleSave = async () => {
    if (!validateProfile()) return;

    try {
      const userId = requireAuth();
      setSaving(true);

      // Sanitize inputs
      const sanitizedProfile = {
        full_name: sanitizeHtml(profile.full_name),
        email: profile.email.trim().toLowerCase(),
        zodiac_sign: profile.zodiac_sign || null,
        birth_date: profile.birth_date || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...sanitizedProfile,
        });

      if (error) throw new SecureError(error.message);

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
              maxLength={100}
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Enter your email"
              maxLength={255}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Astrological Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="zodiac_sign">Zodiac Sign</Label>
            <Select value={profile.zodiac_sign} onValueChange={(value) => setProfile({ ...profile, zodiac_sign: value })}>
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

          <div>
            <Label htmlFor="birth_date">Birth Date</Label>
            <Input
              id="birth_date"
              type="date"
              value={profile.birth_date}
              onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              className={errors.birth_date ? 'border-red-500' : ''}
            />
            {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
};

export default SecureProfileSection;
