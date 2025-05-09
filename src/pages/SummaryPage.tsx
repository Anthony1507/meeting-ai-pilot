
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { meetingService } from "@/services/meeting.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Calendar, Clock } from "lucide-react";
import { Message } from "@/types/meeting.types";

interface MeetingSummary {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  status: string;
  summaryMessage?: Message;
}

export default function SummaryPage() {
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMeetings = async () => {
      try {
        setIsLoading(true);
        
        // Obtener todas las reuniones completadas
        const allMeetings = await meetingService.getMeetings();
        const completedMeetings = allMeetings.filter(
          (meeting) => meeting.status === "completed"
        );
        
        // Para cada reunión completada, obtener sus mensajes
        const meetingsWithSummaries: MeetingSummary[] = [];
        
        for (const meeting of completedMeetings) {
          const messages = await meetingService.getMessages(meeting.id);
          
          // Buscar el último mensaje tipo AI que es el resumen
          const summaryMessage = [...messages]
            .reverse()
            .find((msg) => msg.type === "ai" && msg.category === "general");
          
          meetingsWithSummaries.push({
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            createdAt: new Date(meeting.created_at),
            status: meeting.status,
            summaryMessage: summaryMessage ? {
              id: summaryMessage.id,
              type: summaryMessage.type as Message["type"],
              content: summaryMessage.content,
              timestamp: new Date(summaryMessage.timestamp),
              category: summaryMessage.category as Message["category"],
              sender: summaryMessage.sender,
            } : undefined,
          });
        }
        
        setMeetings(meetingsWithSummaries);
      } catch (error) {
        console.error('Error loading meetings:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los resúmenes de reuniones.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMeetings();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Resúmenes de reuniones</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded-md w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded-md w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded-md w-full"></div>
                  <div className="h-4 bg-muted rounded-md w-full"></div>
                  <div className="h-4 bg-muted rounded-md w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Resúmenes de reuniones</h1>
        <Card className="p-6 text-center">
          <CardTitle className="mb-2">No hay reuniones finalizadas</CardTitle>
          <CardDescription>
            Los resúmenes de reuniones aparecerán aquí una vez que finalices alguna reunión.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Resúmenes de reuniones</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{meeting.title}</CardTitle>
                  {meeting.description && (
                    <CardDescription>{meeting.description}</CardDescription>
                  )}
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Finalizada
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(meeting.createdAt, "PPP", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(meeting.createdAt, "p", { locale: es })}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Resumen</h4>
                    <p className="text-sm text-muted-foreground">
                      {meeting.summaryMessage ? meeting.summaryMessage.content : "No se generó resumen para esta reunión."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
