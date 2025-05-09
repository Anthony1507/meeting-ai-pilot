
// IMPORTANTE: Este archivo debe ser desplegado como Edge Function en Supabase
// Aquí es donde debes configurar tu API key de IA para transcripción

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Configuración de Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autorización
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { filePath } = await req.json();

    if (!filePath) {
      throw new Error('No se proporcionó una ruta de archivo');
    }

    // Obtener el archivo del Storage de Supabase
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('audio-recordings')
      .download(filePath);

    if (fileError) {
      throw new Error(`Error obteniendo archivo: ${fileError.message}`);
    }

    // Utilizar la API de Gemini para transcripción de audio
    const formData = new FormData();
    formData.append('file', new Blob([fileData], { type: 'audio/webm' }), 'audio.webm');

    // Usamos Gemini API para transcribir
    const { data, error } = await supabaseClient.functions.invoke('generate-with-gemini', {
      body: { 
        prompt: `
          Transcribe el siguiente audio. Responde solo con la transcripción, sin añadir ningún texto adicional.
          [AUDIO]
        `,
        audio: fileData // Enviamos el audio como blob
      },
    });

    if (error) {
      throw new Error(`Error de transcripción: ${error.message}`);
    }

    return new Response(JSON.stringify({ 
      transcription: data?.text || "No se pudo transcribir el audio" 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
      }
    });
  }
});
