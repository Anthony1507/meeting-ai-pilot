
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ELEVENLABS_API_KEY } from "../env.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId = "CaJslL1xziwefCeTNzHv" } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from ElevenLabs API:', errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for transmission
    const base64Audio = btoa(
      String.fromCharCode.apply(null, new Uint8Array(audioBuffer))
    );

    return new Response(
      JSON.stringify({ audio: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
