
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryDisclosure } from '@/components/ui/history-disclosure';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  const [horoscopeHistory, setHoroscopeHistory] = useState<any[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasExistingHoroscope, setHasExistingHoroscope] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchHoroscopeHistory();
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
      setHasExistingHoroscope(!!data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerateClick = async () => {
    if (!selectedSign || !user) return;

    // Check if horoscope already exists for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingHoroscope } = await supabase
      .from('horoscope_readings')
      .select('id')
      .eq('user_id', user.id)
      .eq('reading_date', today)
      .eq('zodiac_sign', selectedSign)
      .maybeSingle();

    if (existingHoroscope) {
      setShowConfirmDialog(true);
    } else {
      generateHoroscope();
    }
  };

  const generateHoroscope = async () => {
    if (!selectedSign || !user) return;

    setLoading(true);
    setShowConfirmDialog(false);
    
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
        }, {
          onConflict: 'user_id,reading_date'
        })
        .select()
        .single();

      if (error) throw error;

      setHoroscope(data);
      setHasExistingHoroscope(true);
      
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

      // Refresh horoscope history
      fetchHoroscopeHistory();

      toast({
        title: "Horoscope Generated!",
        description: hasExistingHoroscope ? "Your horoscope has been updated for today." : "Your daily horoscope has been created.",
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

  const fetchHoroscopeHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('horoscope_readings')
        .select('*')
        .eq('user_id', user.id)
        .neq('reading_date', new Date().toISOString().split('T')[0])
        .order('reading_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching horoscope history:', error);
        return;
      }

      setHoroscopeHistory(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const selectedZodiacInfo = zodiacSigns.find(sign => sign.value === selectedSign);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-nova-text-primary mb-2">Daily Horoscope</h2>
          <p className="text-nova-text-secondary">Discover what the stars have in store for you today</p>
        </div>
        <div className="text-4xl">
          {selectedZodiacInfo?.emoji || '✨'}
        </div>
      </div>

      <Card className="card-nova">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-nova-text-primary">
            <Star className="h-5 w-5 text-nova-action" />
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
            onClick={handleGenerateClick}
            disabled={!selectedSign || loading}
            className="btn-nova w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {hasExistingHoroscope ? 'Generate New Horoscope' : 'Generate Horoscope'}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {horoscope && (
        <Card className="card-nova">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-nova-text-primary">
                <Sparkles className="h-5 w-5 text-nova-action" />
                Your Daily Reading
              </CardTitle>
              <Badge variant="secondary" className="bg-nova-action/20 text-nova-action">
                {new Date(horoscope.reading_date).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-nova-text-primary mb-2">Today's Horoscope</h4>
              <p className="text-nova-text-secondary leading-relaxed">{horoscope.daily_horoscope}</p>
            </div>
            
            {horoscope.ai_insights && (
              <div className="border-t border-white/20 pt-4">
                <h4 className="font-medium text-nova-text-primary mb-2">AI Insights</h4>
                <p className="text-nova-text-secondary leading-relaxed">{horoscope.ai_insights}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {horoscopeHistory.length > 0 && (
        <Card className="card-nova">
          <CardContent className="pt-6">
            <HistoryDisclosure
              title="Previous Horoscopes"
              items={horoscopeHistory.map(reading => ({
                id: reading.id,
                title: `${zodiacSigns.find(s => s.value === reading.zodiac_sign)?.label} - ${new Date(reading.reading_date).toLocaleDateString()}`,
                preview: reading.daily_horoscope?.slice(0, 120) + '...' || 'No horoscope text available',
                content: reading.daily_horoscope + (reading.ai_insights ? '\n\nAI Insights: ' + reading.ai_insights : ''),
                timestamp: reading.created_at,
                badge: {
                  label: zodiacSigns.find(s => s.value === reading.zodiac_sign)?.emoji || '✨',
                  variant: 'secondary' as const
                }
              }))}
              emptyMessage="No previous horoscopes yet. Generate your first one above!"
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate New Horoscope?</AlertDialogTitle>
            <AlertDialogDescription>
              You've already viewed your horoscope for today. I understand - life changes by the minute. Are you sure you want to generate another horoscope for today?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={generateHoroscope}>
              Yes, Generate New Horoscope
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HoroscopeSection;
