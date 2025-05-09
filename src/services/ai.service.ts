
import { supabase } from '@/lib/supabase';

export interface AISummaryParams {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AIDetectionParams {
  text: string;
}

export interface TextToSpeechParams {
  text: string;
  voiceId?: string;
}

export const aiService = {
  async generateMeetingSummary({ messages }: AISummaryParams) {
    try {
      // Fallback en caso de error de la API
      let summary = "No se pudo generar un resumen debido a errores de comunicación con la API.";
      
      try {
        // Use Gemini API through our edge function
        const { data, error } = await supabase.functions.invoke('generate-with-gemini', {
          body: { 
            prompt: `
              Eres un asistente especializado en resumir reuniones. 
              Genera un resumen conciso y estructurado de la siguiente reunión, destacando:
              1. Temas principales discutidos
              2. Decisiones tomadas
              3. Tareas asignadas (si las hay)
              4. Puntos pendientes para futuras reuniones
              
              Conversación:
              ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
              
              Responde en español.
            ` 
          },
        });

        if (error) {
          console.error('Error from Gemini API:', error);
          throw error;
        }
        
        if (data && data.text) {
          summary = data.text;
        }
      } catch (apiError) {
        console.error('API error, using fallback summary:', apiError);
        // El fallback ya está configurado
      }
      
      return { summary };
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      throw error;
    }
  },

  async detectTasksAndDefinitions({ text }: AIDetectionParams) {
    try {
      // Fallback en caso de error de la API
      const fallbackResponse = {
        response: "He detectado tu mensaje, pero no puedo procesarlo en este momento debido a un problema de conexión.",
        category: "general" as const,
        tasks: []
      };
      
      try {
        // Use Gemini API through our edge function
        const { data, error } = await supabase.functions.invoke('generate-with-gemini', {
          body: { 
            prompt: `
              Analiza el siguiente texto de una reunión y extrae:
              
              1. Si detectas alguna tarea, devuelve la información en formato compatible con:
              {
                title: string;
                description?: string;
                assignee?: { id: string; name: string; };
                dueDate?: string; // ISO format
              }
              
              2. Si detectas una definición o aclaración importante, clasifícala como "definition"
              
              3. Si detectas un problema o bloqueante, clasifícala como "blocker"
              
              4. Si no detectas nada de lo anterior, clasifícala como "general"
              
              Identifica la categoría principal del mensaje (task, definition, blocker, general)
              
              Texto a analizar:
              "${text}"
              
              Responde con un JSON que contenga:
              {
                "response": "Tu respuesta asistente en español",
                "category": "task|definition|blocker|general",
                "tasks": [] // Array de tareas si hay alguna
              }
            ` 
          },
        });

        if (error) {
          console.error('Error from Gemini API:', error);
          throw error;
        }
        
        // Parse the text response as JSON since Gemini will return a formatted JSON string
        try {
          if (data && data.text) {
            return JSON.parse(data.text);
          }
          return fallbackResponse;
        } catch (jsonError) {
          console.error('Error parsing JSON from Gemini response:', jsonError);
          return fallbackResponse;
        }
      } catch (apiError) {
        console.error('API error, using fallback response:', apiError);
        return fallbackResponse;
      }
    } catch (error) {
      console.error('Error detecting elements:', error);
      throw error;
    }
  },

  async textToSpeech({ text, voiceId = "CwhRBWXzGAHq8TQ4Fs17" }: TextToSpeechParams) {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId },
      });

      if (error) throw error;
      return data.audio; // Base64 encoded audio
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  },

  async generateTranscription(audioBlob: Blob) {
    try {
      // Primero, subir el archivo de audio a Supabase Storage
      const fileName = `audio-${Date.now()}.webm`;
      const filePath = `recordings/${fileName}`;
      
      // Crear el bucket si no existe
      const { error: bucketError } = await supabase.storage.createBucket('audio-recordings', {
        public: false,
        fileSizeLimit: 50000000, // 50MB
      });

      if (bucketError && !bucketError.message.includes('already exists')) {
        throw bucketError;
      }
      
      // Subir archivo
      const { error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
        });

      if (uploadError) throw uploadError;

      // Llamar a la función transcribe-audio
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { filePath },
      });

      if (error) throw error;

      // Eliminar el archivo después de transcribirlo
      await supabase.storage
        .from('audio-recordings')
        .remove([filePath]);

      return data.transcription;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }
};
