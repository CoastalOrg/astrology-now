
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
    console.log('Generate Horoscope function called');
    
    // Validate API key
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('OpenAI API key is present:', openAIApiKey ? 'Yes' : 'No');
    console.log('API key length:', openAIApiKey ? openAIApiKey.length : 0);
    console.log('API key starts with sk-:', openAIApiKey ? openAIApiKey.startsWith('sk-') : false);

    const { zodiacSign } = await req.json();
    console.log('Request payload:', { zodiacSign });

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

    console.log('Making first request to OpenAI API for horoscope...');

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

    console.log('Horoscope API response status:', horoscopeResponse.status);
    console.log('Horoscope API response ok:', horoscopeResponse.ok);

    if (!horoscopeResponse.ok) {
      const errorText = await horoscopeResponse.text();
      console.error('OpenAI API error response (horoscope):', errorText);
      console.error('Response status:', horoscopeResponse.status);
      console.error('Response headers:', Object.fromEntries(horoscopeResponse.headers.entries()));
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate horoscope',
          details: `OpenAI API returned ${horoscopeResponse.status}: ${errorText}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Making second request to OpenAI API for insights...');

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

    console.log('Insights API response status:', insightsResponse.status);
    console.log('Insights API response ok:', insightsResponse.ok);

    if (!insightsResponse.ok) {
      const errorText = await insightsResponse.text();
      console.error('OpenAI API error response (insights):', errorText);
      console.error('Response status:', insightsResponse.status);
      console.error('Response headers:', Object.fromEntries(insightsResponse.headers.entries()));
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate insights',
          details: `OpenAI API returned ${insightsResponse.status}: ${errorText}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const horoscopeData = await horoscopeResponse.json();
    const insightsData = await insightsResponse.json();

    console.log('Horoscope data keys:', Object.keys(horoscopeData));
    console.log('Insights data keys:', Object.keys(insightsData));
    console.log('Horoscope choices length:', horoscopeData.choices ? horoscopeData.choices.length : 0);
    console.log('Insights choices length:', insightsData.choices ? insightsData.choices.length : 0);

    if (!horoscopeData.choices || horoscopeData.choices.length === 0) {
      console.error('No horoscope choices returned from OpenAI API');
      return new Response(
        JSON.stringify({ error: 'No horoscope generated by AI' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!insightsData.choices || insightsData.choices.length === 0) {
      console.error('No insights choices returned from OpenAI API');
      return new Response(
        JSON.stringify({ error: 'No insights generated by AI' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const horoscope = horoscopeData.choices[0].message.content;
    const insights = insightsData.choices[0].message.content;

    console.log('Horoscope length:', horoscope ? horoscope.length : 0);
    console.log('Insights length:', insights ? insights.length : 0);

    return new Response(
      JSON.stringify({ horoscope, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-horoscope function:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate horoscope',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
