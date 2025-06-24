
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zodiacSign } = await req.json();

    if (!zodiacSign) {
      return new Response(
        JSON.stringify({ error: 'Zodiac sign is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const prompt = `Generate a personalized daily horoscope for ${zodiacSign}. 
    Make it insightful, positive, and practical. Include advice about love, career, and personal growth. 
    Keep it between 100-150 words. Write in a warm, encouraging tone.`;

    const insightsPrompt = `Based on the ${zodiacSign} zodiac sign, provide 2-3 key astrological insights 
    for today. Focus on planetary influences, energy patterns, and how they might affect this person's day. 
    Keep it concise but meaningful, around 50-75 words.`;

    // Generate horoscope
    const horoscopeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a skilled astrologer providing daily horoscope readings.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    // Generate insights
    const insightsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert astrologer providing astrological insights.' },
          { role: 'user', content: insightsPrompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const horoscopeData = await horoscopeResponse.json();
    const insightsData = await insightsResponse.json();

    if (!horoscopeResponse.ok || !insightsResponse.ok) {
      throw new Error('Failed to generate content');
    }

    const horoscope = horoscopeData.choices[0].message.content;
    const insights = insightsData.choices[0].message.content;

    return new Response(
      JSON.stringify({ horoscope, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-horoscope function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate horoscope' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
