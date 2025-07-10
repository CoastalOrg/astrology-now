
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryDisclosure } from '@/components/ui/history-disclosure';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Sparkles, Clock } from 'lucide-react';
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

const AiChatSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState<ZodiacSign | ''>('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchConversations();
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
          setSelectedZodiac(data.zodiac_sign);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const askAI = async () => {
    if (!question.trim() || !user) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('ask-astrology-ai', {
        body: { 
          question: question.trim(),
          zodiacSign: selectedZodiac || null
        }
      });

      if (response.error) {
        throw response.error;
      }

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          question: question.trim(),
          ai_response: response.data.response,
          zodiac_context: selectedZodiac || null,
        })
        .select()
        .single();

      if (error) throw error;

      setConversations([data, ...conversations]);
      setQuestion('');

      toast({
        title: "Answer received!",
        description: "The AI has provided insights about your question.",
      });
    } catch (error: any) {
      console.error('Error asking AI:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-nova-text-primary mb-2">Ask AI</h2>
          <p className="text-nova-text-secondary">Get personalized astrological insights and guidance</p>
        </div>
        <MessageSquare className="h-8 w-8 text-nova-action" />
      </div>

      <Card className="card-nova">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-nova-text-primary">
            <Sparkles className="h-5 w-5 text-nova-action" />
            Ask Your Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedZodiac} onValueChange={(value: ZodiacSign) => setSelectedZodiac(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Optional: Select zodiac sign for context" />
            </SelectTrigger>
            <SelectContent>
              {zodiacSigns.map((sign) => (
                <SelectItem key={sign.value} value={sign.value}>
                  {sign.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <Textarea
              placeholder="Ask about love, career, health, or any astrological topic..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-nova-text-secondary">Maximum 200 characters</span>
              <span className={`${question.length > 180 ? 'text-nova-error' : 'text-nova-text-secondary'}`}>
                {question.length}/200
              </span>
            </div>
          </div>

          <Button
            onClick={askAI}
            disabled={!question.trim() || loading}
            className="btn-nova w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Getting insights...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Ask AI
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {conversations.length > 0 && (
        <Card className="card-nova">
          <CardContent className="pt-6">
            <HistoryDisclosure
              title="Recent Conversations"
              items={conversations.map(conversation => ({
                id: conversation.id,
                title: conversation.question,
                preview: conversation.ai_response.slice(0, 100) + '...',
                content: conversation.ai_response,
                timestamp: conversation.created_at,
                badge: conversation.zodiac_context ? {
                  label: zodiacSigns.find(s => s.value === conversation.zodiac_context)?.label || '',
                  variant: 'secondary' as const
                } : undefined
              }))}
              emptyMessage="No conversations yet. Ask your first question above!"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiChatSection;
