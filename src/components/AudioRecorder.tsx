
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blobToBase64, setupMediaRecorder } from '@/utils/audio-utils';
import { aiService } from "@/services/ai.service";

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  disabled: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscription, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder = setupMediaRecorder(
        stream,
        async (blob) => {
          try {
            setIsProcessing(true);
            toast({
              title: "Procesando audio",
              description: "Transcribiendo grabación...",
            });
            
            const base64Audio = await blobToBase64(blob);
            const transcription = await aiService.generateTranscription(blob);
            
            if (transcription) {
              toast({
                title: "Transcripción completada",
                description: transcription.substring(0, 50) + "...",
              });
              
              onTranscription(transcription);
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            toast({
              title: "Error",
              description: "No se pudo transcribir el audio.",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        },
        () => {
          toast({
            title: "Grabación detenida",
            description: "Procesando audio...",
          });
        }
      );
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "Grabando audio",
        description: "Habla claramente...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Button 
      type="button" 
      size="icon" 
      variant={isRecording ? "destructive" : "outline"}
      className={isRecording ? "animate-pulse" : ""}
      onClick={handleMicClick}
      disabled={disabled || isProcessing}
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};
