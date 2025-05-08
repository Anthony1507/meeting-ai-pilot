
// IMPORTANTE: Aquí es donde debes colocar tus APIs de IA
// Puedes usar OpenAI, Anthropic, Google AI, etc.

// Para mayor seguridad, no debes poner tus claves API directamente en el código.
// Deberías usar secrets de Supabase Edge Functions o servicios serverless.

// Ejemplo con una Edge Function de Supabase
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

export const aiService = {
  async generateMeetingSummary({ messages }: AISummaryParams) {
    try {
      // Aquí llamamos a la Supabase Edge Function que procesará la solicitud
      // usando tu API key de forma segura en el servidor
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { messages },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      throw error;
    }
  },

  async detectTasksAndDefinitions({ text }: AIDetectionParams) {
    try {
      // Esta Edge Function analizaría el texto para detectar tareas, definiciones y bloqueantes
      const { data, error } = await supabase.functions.invoke('detect-elements', {
        body: { text },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error detecting elements:', error);
      throw error;
    }
  },

  async generateTranscription(audioBlob: Blob) {
    try {
      // Primero subimos el archivo de audio a Supabase Storage
      const fileName = `recording-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Luego procesamos la transcripción usando una Edge Function
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions
        .invoke('transcribe-audio', {
          body: { filePath: uploadData.path },
        });

      if (transcriptionError) throw transcriptionError;
      return transcriptionData.transcription;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  },
};
