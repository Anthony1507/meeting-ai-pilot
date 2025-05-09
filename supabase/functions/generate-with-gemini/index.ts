
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Obtener la API key de Gemini desde las variables de entorno
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, audio } = await req.json()

    if (!prompt) {
      throw new Error('No prompt provided')
    }

    // Llamar a la API de Gemini
    let endpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent'
    const headers = {
      'Content-Type': 'application/json',
      'x-goog-api-key': geminiApiKey
    }

    // Construir el cuerpo de la solicitud
    const requestBody: any = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    }

    // Si hay audio, agregarlo a la solicitud
    if (audio) {
      requestBody.contents[0].parts.push({
        inlineData: {
          data: btoa(String.fromCharCode(...new Uint8Array(audio))),
          mimeType: "audio/webm"
        }
      })
    }

    const response = await fetch(`${endpoint}?key=${geminiApiKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorResponse = await response.text()
      console.error('Error response from Gemini API:', errorResponse)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract the response text
    let text = ''
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts
      if (parts && parts.length > 0) {
        text = parts.map((part: any) => part.text).join('')
      }
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in generate-with-gemini function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
