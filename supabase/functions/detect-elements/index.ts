
// IMPORTANTE: Este archivo debe ser desplegado como Edge Function en Supabase
// Aquí es donde debes configurar tu API key de IA

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

    const { text } = await req.json();

    // Crear el prompt para detectar elementos
    const systemPrompt = `Eres un asistente de reuniones que analiza el contenido de mensajes para detectar información importante.
    
    Analiza el siguiente mensaje y determina si contiene:
    1. Tareas o acciones a realizar
    2. Definiciones o aclaraciones de conceptos
    3. Bloqueantes o problemas a resolver
    
    Si encuentras alguno de estos elementos, devuelve:
    - Una respuesta explicativa y útil al mensaje
    - Una categoría para la respuesta (task, definition, blocker o general)
    - Las tareas detectadas con su título, descripción, asignatario (si se menciona) y fecha límite (si se menciona)
    
    Responde en español y sé conciso.`;

    // Llamada a la API de OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // Procesar la respuesta
    const responseContent = JSON.parse(response.choices[0].message.content || '{}');
    
    return new Response(JSON.stringify(responseContent), {
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
