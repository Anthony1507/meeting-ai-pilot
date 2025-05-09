
import React from 'react';
import { format } from "date-fns";
import { Message } from "@/contexts/MeetingContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/ai.service";
import { playAudioFromBase64 } from "@/utils/audio-utils";

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { toast } = useToast();
  
  const handleReaction = (messageId: string) => {
    toast({
      title: "Reacción añadida",
      description: "Has reaccionado a este mensaje",
    });
  };
  
  const handlePlayAudio = async (text: string) => {
    try {
      toast({
        title: "Generando audio",
        description: "Convirtiendo texto a voz...",
      });
      
      const base64Audio = await aiService.textToSpeech({
        text: text,
      });
      
      if (base64Audio) {
        toast({
          title: "Reproduciendo audio",
          description: "Escuchando mensaje...",
        });
        await playAudioFromBase64(base64Audio);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el audio.",
        variant: "destructive",
      });
    }
  };
  
  if (message.type === "ai") {
    return (
      <div className="message-ai animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="min-w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="font-medium">CollabCopilot</span>
              <span className="text-xs text-muted-foreground">
                {format(message.timestamp, "HH:mm")}
              </span>
            </div>
            <div className="text-sm whitespace-pre-line">{message.content}</div>
            {message.category && (
              <Badge variant="outline" className="mt-2 text-xs" style={{
                backgroundColor: message.category === 'task' ? 'rgba(249, 115, 22, 0.1)' : 
                               message.category === 'definition' ? 'rgba(139, 92, 246, 0.1)' :
                               message.category === 'blocker' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(47, 127, 229, 0.1)',
                color: message.category === 'task' ? 'rgb(249, 115, 22)' : 
                     message.category === 'definition' ? 'rgb(139, 92, 246)' :
                     message.category === 'blocker' ? 'rgb(239, 68, 68)' : 'rgb(47, 127, 229)',
              }}>
                {message.category === 'task' ? 'Tarea' : 
                 message.category === 'definition' ? 'Definición' :
                 message.category === 'blocker' ? 'Bloqueante' : 'General'}
              </Badge>
            )}
            <div className="flex gap-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs" 
                onClick={() => handleReaction(message.id)}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Confirmar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => handlePlayAudio(message.content)}
              >
                🔊 Escuchar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-user animate-fade-in">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar} />
          <AvatarFallback>
            {message.sender?.name
              ? message.sender.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="font-medium">{message.sender?.name}</span>
            <span className="text-xs text-muted-foreground">
              {format(message.timestamp, "HH:mm")}
            </span>
          </div>
          <div className="text-sm">{message.content}</div>
        </div>
      </div>
    </div>
  );
};
