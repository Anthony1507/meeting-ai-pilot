
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

      if (error) throw error;
      return { summary: data.text };
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      throw error;
    }
  },

  async detectTasksAndDefinitions({ text }: AIDetectionParams) {
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

      if (error) throw error;
      
      // Parse the text response as JSON since Gemini will return a formatted JSON string
      try {
        return JSON.parse(data.text);
      } catch (jsonError) {
        console.error('Error parsing JSON from Gemini response:', jsonError);
        // Fallback response
        return {
          response: data.text,
          category: "general",
          tasks: []
        };
      }
    } catch (error) {
      console.error('Error detecting elements:', error);
      throw error;
    }
  },

  async textToSpeech({ text, voiceId }: TextToSpeechParams) {
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
      // First, convert the audio blob to a base64 string
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result?.toString().split(',')[1];
          resolve(base64 || '');
        };
        reader.readAsDataURL(audioBlob);
      });

      // Second, use Google Speech-to-Text via our Gemini edge function
      const { data, error } = await supabase.functions.invoke('generate-with-gemini', {
        body: { 
          prompt: `
            Transcribe el siguiente audio. Responde solo con la transcripción, sin añadir ningún texto adicional.
            [AUDIO]: ${base64Audio}
          ` 
        },
      });

      if (error) throw error;
      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }
};
