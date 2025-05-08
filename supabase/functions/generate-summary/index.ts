
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

    const { messages } = await req.json();

    // Crear el prompt para el resumen
    const systemPrompt = `Eres un asistente especializado en resumir reuniones. 
    Genera un resumen conciso y estructurado de la siguiente reunión, destacando:
    1. Temas principales discutidos
    2. Decisiones tomadas
    3. Tareas asignadas (si las hay)
    4. Puntos pendientes para futuras reuniones
    
    Responde en español.`;

    // Llamada a la API de OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
    });

    // Obtener el resumen
    const summary = response.choices[0].message.content || 'No se pudo generar un resumen.';

    return new Response(JSON.stringify({ summary }), {
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
