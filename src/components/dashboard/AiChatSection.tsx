
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Sparkles, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

const zodiacSigns = [
  { value: 'aries', label: 'Aries ♈' },
  { value: 'taurus', label: 'Taurus ♉' },
  { value: 'gemini', label: 'Gemini ♊' },
  { value: 'cancer', label: 'Cancer ♋' },
  { value: 'leo', label: 'Leo ♌' },
  { value: 'virgo', label: 'Virgo ♍' },
  { value: 'libra', label: 'Libra ♎' },
  { value: 'scorpio', label: 'Scorpio ♏' },
  { value: 'sagittarius', label: 'Sagittarius ♐' },
  { value: 'capricorn', label: 'Capricorn ♑' },
  { value: 'aquarius', label: 'Aquarius ♒' },
  { value: 'pisces', label: 'Pisces ♓' },
];

const AiChatSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState<string>('');
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
          <h2 className="text-2xl font-light text-slate-800 mb-2">Ask AI</h2>
          <p className="text-slate-600">Get personalized astrological insights and guidance</p>
        </div>
        <MessageSquare className="h-8 w-8 text-purple-600" />
      </div>

      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Ask Your Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedZodiac} onValueChange={setSelectedZodiac}>
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

          <Textarea
            placeholder="Ask about love, career, health, or any astrological topic..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="resize-none"
          />

          <Button
            onClick={askAI}
            disabled={!question.trim() || loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="border-l-4 border-purple-200 pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800">Q: {conversation.question}</p>
                    {conversation.zodiac_context && (
                      <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {zodiacSigns.find(s => s.value === conversation.zodiac_context)?.label}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    <strong>A:</strong> {conversation.ai_response}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(conversation.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiChatSection;
