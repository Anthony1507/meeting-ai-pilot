
import React, { useRef, useState, useEffect } from "react";
import { useMeeting, Message } from "@/contexts/MeetingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Mic, Paperclip, ThumbsUp, MicOff } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { aiService } from "@/services/ai.service";

export default function MeetingPage() {
  const { messages, addMessage, activeMeeting, isLoading, startMeeting, endMeeting } = useMeeting();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    await addMessage({
      type: "user",
      content: inputValue.trim(),
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
    
    setInputValue("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        
        try {
          toast({
            title: "Procesando audio",
            description: "Transcribiendo grabación...",
          });
          
          const transcription = await aiService.generateTranscription(blob);
          
          if (transcription && user) {
            toast({
              title: "Transcripción completada",
              description: transcription.substring(0, 50) + "...",
            });
            
            await addMessage({
              type: "user",
              content: transcription,
              sender: {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
              },
            });
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          toast({
            title: "Error",
            description: "No se pudo transcribir el audio.",
            variant: "destructive",
          });
        }
      };

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
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Grabación detenida",
        description: "Procesando audio...",
      });
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAttachClick = () => {
    toast({
      title: "Adjuntar archivo",
      description: "Función de adjuntar archivo en desarrollo",
    });
  };

  const handleReaction = (messageId: string) => {
    toast({
      title: "Reacción añadida",
      description: "Has reaccionado a este mensaje",
    });
  };

  const handleStartMeeting = async () => {
    try {
      await startMeeting(
        "Sprint Planning #12",
        "Planificación del sprint número 12",
        [user?.id as string]
      );
      
      toast({
        title: "Reunión iniciada",
        description: "La reunión ha comenzado correctamente.",
      });
    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  };

  const handleEndMeeting = async () => {
    try {
      await endMeeting();
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  };

  const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    if (message.type === "ai") {
      return (
        <div className="message-ai animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="min-w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white">
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
                .split(" ")
                .map((n) => n[0])
                .join("")}
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

  if (!activeMeeting) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="max-w-md text-center p-6">
          <h2 className="text-2xl font-bold mb-4">No hay reunión activa</h2>
          <p className="text-muted-foreground mb-6">
            Para comenzar una nueva reunión, haz clic en el botón de abajo.
          </p>
          <Button onClick={handleStartMeeting} disabled={isLoading}>
            {isLoading ? "Iniciando..." : "Iniciar nueva reunión"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-4">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{activeMeeting.title}</h2>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-sm text-muted-foreground">
            En curso • Iniciada hace {Math.floor((new Date().getTime() - activeMeeting.createdAt.getTime()) / (1000 * 60))} minutos
          </p>
          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary text-xs">
            {activeMeeting.participants.length} participantes
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button 
            type="button" 
            size="icon" 
            variant="ghost"
            onClick={handleAttachClick}
            className="text-muted-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            disabled={isLoading || isRecording}
          />
          <Button 
            type="button" 
            size="icon" 
            variant={isRecording ? "destructive" : "outline"}
            className={isRecording ? "animate-pulse" : ""}
            onClick={handleMicClick}
            disabled={isLoading}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || isRecording || !inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="mt-3 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEndMeeting}
            className="text-destructive"
          >
            Finalizar reunión
          </Button>
        </div>
      </div>
    </div>
  );
}
