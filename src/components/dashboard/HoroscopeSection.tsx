
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type ZodiacSign = Database['public']['Enums']['zodiac_sign'];

const zodiacSigns = [
  { value: 'aries' as ZodiacSign, label: 'Aries ♈', emoji: '♈' },
  { value: 'taurus' as ZodiacSign, label: 'Taurus ♉', emoji: '♉' },
  { value: 'gemini' as ZodiacSign, label: 'Gemini ♊', emoji: '♊' },
  { value: 'cancer' as ZodiacSign, label: 'Cancer ♋', emoji: '♋' },
  { value: 'leo' as ZodiacSign, label: 'Leo ♌', emoji: '♌' },
  { value: 'virgo' as ZodiacSign, label: 'Virgo ♍', emoji: '♍' },
  { value: 'libra' as ZodiacSign, label: 'Libra ♎', emoji: '♎' },
  { value: 'scorpio' as ZodiacSign, label: 'Scorpio ♏', emoji: '♏' },
  { value: 'sagittarius' as ZodiacSign, label: 'Sagittarius ♐', emoji: '♐' },
  { value: 'capricorn' as ZodiacSign, label: 'Capricorn ♑', emoji: '♑' },
  { value: 'aquarius' as ZodiacSign, label: 'Aquarius ♒', emoji: '♒' },
  { value: 'pisces' as ZodiacSign, label: 'Pisces ♓', emoji: '♓' },
];

const HoroscopeSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | ''>('');
  const [horoscope, setHoroscope] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
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
        setUserProfile(data);
        if (data.zodiac_sign) {
          setSelectedSign(data.zodiac_sign);
          fetchTodaysHoroscope(data.zodiac_sign);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTodaysHoroscope = async (sign: ZodiacSign) => {
    if (!sign || !user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('horoscope_readings')
        .select('*')
        .eq('user_id', user.id)
        .eq('reading_date', today)
        .eq('zodiac_sign', sign)
        .maybeSingle();

      if (error) {
        console.error('Error fetching horoscope:', error);
        return;
      }

      setHoroscope(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateHoroscope = async () => {
    if (!selectedSign || !user) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('generate-horoscope', {
        body: { zodiacSign: selectedSign }
      });

      if (response.error) {
        throw response.error;
      }

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('horoscope_readings')
        .upsert({
          user_id: user.id,
          zodiac_sign: selectedSign,
          reading_date: today,
          daily_horoscope: response.data.horoscope,
          ai_insights: response.data.insights,
        })
        .select()
        .single();

      if (error) throw error;

      setHoroscope(data);
      
      // Update user profile with selected zodiac sign
      if (selectedSign !== userProfile?.zodiac_sign) {
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            zodiac_sign: selectedSign,
          });
        setUserProfile({ ...userProfile, zodiac_sign: selectedSign });
      }

      toast({
        title: "Horoscope Generated!",
        description: "Your daily horoscope has been created.",
      });
    } catch (error: any) {
      console.error('Error generating horoscope:', error);
      toast({
        title: "Error",
        description: "Failed to generate horoscope. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedZodiacInfo = zodiacSigns.find(sign => sign.value === selectedSign);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-slate-800 mb-2">Daily Horoscope</h2>
          <p className="text-slate-600">Discover what the stars have in store for you today</p>
        </div>
        <div className="text-4xl">
          {selectedZodiacInfo?.emoji || '✨'}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            Select Your Zodiac Sign
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedSign} onValueChange={(value: ZodiacSign) => setSelectedSign(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your zodiac sign" />
            </SelectTrigger>
            <SelectContent>
              {zodiacSigns.map((sign) => (
                <SelectItem key={sign.value} value={sign.value}>
                  {sign.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={generateHoroscope}
            disabled={!selectedSign || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {horoscope ? 'Refresh Horoscope' : 'Generate Horoscope'}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {horoscope && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Your Daily Reading
              </CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {new Date(horoscope.reading_date).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Today's Horoscope</h4>
              <p className="text-slate-700 leading-relaxed">{horoscope.daily_horoscope}</p>
            </div>
            
            {horoscope.ai_insights && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-slate-800 mb-2">AI Insights</h4>
                <p className="text-slate-600 leading-relaxed">{horoscope.ai_insights}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HoroscopeSection;
