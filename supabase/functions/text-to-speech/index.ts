
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Obtener la API key de ElevenLabs desde las variables de entorno
const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voiceId = "CwhRBWXzGAHq8TQ4Fs17" } = await req.json()

    if (!text) {
      throw new Error('No text provided')
    }

    // Llamar a la API de ElevenLabs
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    })

    if (!response.ok) {
      const errorResponse = await response.text()
      console.error('Error response from ElevenLabs API:', errorResponse)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    // Obtener el audio como ArrayBuffer
    const audioBuffer = await response.arrayBuffer()
    
    // Convertir a base64 para enviar en la respuesta JSON
    const base64Audio = btoa(
      String.fromCharCode.apply(null, new Uint8Array(audioBuffer))
    )

    return new Response(JSON.stringify({ audio: base64Audio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
