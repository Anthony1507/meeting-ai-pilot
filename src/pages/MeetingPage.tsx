
import React, { useRef, useState, useEffect } from "react";
import { useMeeting } from "@/contexts/MeetingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AudioRecorder } from "@/components/AudioRecorder";
import { FileAttachment } from "@/components/FileAttachment";
import { MessageItem } from "@/components/MessageItem";

export default function MeetingPage() {
  const { messages, addMessage, activeMeeting, isLoading, startMeeting, endMeeting } = useMeeting();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
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

  const handleTranscription = async (transcription: string) => {
    if (!user) return;
    
    setIsProcessingAudio(true);
    try {
      await addMessage({
        type: "user",
        content: transcription,
        sender: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
      });
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleFileAttachment = async (fileName: string) => {
    if (!user) return;
    
    await addMessage({
      type: "user",
      content: `He adjuntado un archivo: ${fileName}`,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
  };

  const handleStartMeeting = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una reunión.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await startMeeting(
        "Sprint Planning #12",
        "Planificación del sprint número 12",
        [user.id]
      );
      
      toast({
        title: "Reunión iniciada",
        description: "La reunión ha comenzado correctamente.",
      });
    } catch (error) {
      console.error('Error starting meeting:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la reunión.",
        variant: "destructive",
      });
    }
  };

  const handleEndMeeting = async () => {
    try {
      await endMeeting();
      
      toast({
        title: "Reunión finalizada",
        description: "La reunión ha sido finalizada y se ha generado un resumen.",
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
      toast({
        title: "Error",
        description: "No se pudo finalizar la reunión.",
        variant: "destructive",
      });
    }
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
          <FileAttachment 
            onAttach={handleFileAttachment} 
            disabled={isLoading || isProcessingAudio} 
          />
          <Input
            placeholder="Escribe un mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
            disabled={isLoading || isProcessingAudio}
          />
          <AudioRecorder 
            onTranscription={handleTranscription} 
            disabled={isLoading || isProcessingAudio} 
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || isProcessingAudio || !inputValue.trim()}
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
            disabled={isLoading}
          >
            Finalizar reunión
          </Button>
        </div>
      </div>
    </div>
  );
}
