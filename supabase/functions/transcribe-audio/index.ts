
// IMPORTANTE: Este archivo debe ser desplegado como Edge Function en Supabase
// Aquí es donde debes configurar tu API key de IA para transcripción

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { OpenAI } from 'https://esm.sh/openai@4.33.0';

// Configuración de Supabase y OpenAI
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// IMPORTANTE: Aquí es donde debes configurar tu API key de OpenAI
// No coloques la clave directamente aquí, usa las variables de entorno de Supabase
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    // Verificar autorización
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { filePath } = await req.json();

    // Obtener el archivo del Storage de Supabase
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('audio-recordings')
      .download(filePath);

    if (fileError) {
      throw new Error(`Error obteniendo archivo: ${fileError.message}`);
    }

    // Convertir el archivo a una forma que OpenAI pueda procesar
    const audioBlob = new Blob([fileData], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');

    // Llamar directamente a la API de transcripción de OpenAI
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: formData
    });

    const transcriptionData = await transcriptionResponse.json();

    return new Response(JSON.stringify({ 
      transcription: transcriptionData.text 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
