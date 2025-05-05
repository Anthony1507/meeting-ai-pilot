
import React, { useState } from "react";
import { useMeeting } from "@/contexts/MeetingContext";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Share2, Calendar, Clock, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

// Define the meeting summary interface
interface MeetingSummary {
  id: string;
  title: string;
  date: Date;
  duration: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  keyPoints: Array<string>;
  decisions: Array<string>;
  actionItems: Array<{
    text: string;
    assignee?: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  nextSteps: Array<string>;
}

// Sample meeting summaries data
const sampleSummaries: MeetingSummary[] = [
  {
    id: "summary-1",
    title: "Sprint Planning #12",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    duration: "1h 15m",
    participants: [
      {
        id: "1",
        name: "Ana Martínez",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      {
        id: "2",
        name: "Carlos Rodríguez",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      {
        id: "3",
        name: "Laura Gómez",
        avatar: "https://i.pravatar.cc/150?img=5",
      }
    ],
    keyPoints: [
      "Revisión de objetivos del sprint anterior",
      "Definición de métricas para el dashboard",
      "Discusión sobre autenticación OAuth para servicio de pagos"
    ],
    decisions: [
      "El dashboard incluirá tanto valores absolutos como gráficos comparativos para todas las métricas",
      "Se priorizará la integración del servicio de pagos antes del sistema de notificaciones"
    ],
    actionItems: [
      {
        text: "Implementar OAuth 2.0 para servicio de pagos",
        assignee: {
          id: "1",
          name: "Ana Martínez",
          avatar: "https://i.pravatar.cc/150?img=1",
        }
      },
      {
        text: "Completar maquetas del dashboard con métricas definidas",
        assignee: {
          id: "2",
          name: "Carlos Rodríguez",
          avatar: "https://i.pravatar.cc/150?img=3",
        }
      },
      {
        text: "Asignar responsables para el sistema de notificaciones"
      }
    ],
    nextSteps: [
      "Daily standup mañana a las 10:00",
      "Review del sprint en 2 semanas"
    ]
  },
  {
    id: "summary-2",
    title: "Revisión de Diseño UI",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    duration: "45m",
    participants: [
      {
        id: "2",
        name: "Carlos Rodríguez",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      {
        id: "4",
        name: "Miguel Santos",
        avatar: "https://i.pravatar.cc/150?img=12",
      }
    ],
    keyPoints: [
      "Análisis de prototipos para la nueva versión",
      "Discusión sobre paleta de colores",
      "Responsividad en dispositivos móviles"
    ],
    decisions: [
      "Se utilizará una paleta basada en tonos azules con acentos naranja",
      "Se priorizará el enfoque mobile-first"
    ],
    actionItems: [
      {
        text: "Finalizar maquetas de alta fidelidad",
        assignee: {
          id: "4",
          name: "Miguel Santos",
          avatar: "https://i.pravatar.cc/150?img=12",
        }
      },
      {
        text: "Crear biblioteca de componentes en Figma"
      }
    ],
    nextSteps: [
      "Presentación al equipo completo el viernes"
    ]
  },
  {
    id: "summary-3",
    title: "Daily Standup",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    duration: "20m",
    participants: [
      {
        id: "1",
        name: "Ana Martínez",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      {
        id: "2",
        name: "Carlos Rodríguez",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      {
        id: "3",
        name: "Laura Gómez",
        avatar: "https://i.pravatar.cc/150?img=5",
      }
    ],
    keyPoints: [
      "Actualización de progreso diario",
      "Identificación de bloqueantes"
    ],
    decisions: [
      "Posponer la implementación de notificaciones push hasta resolver problemas técnicos"
    ],
    actionItems: [
      {
        text: "Investigar alternativas para el servicio de notificaciones",
        assignee: {
          id: "3",
          name: "Laura Gómez",
          avatar: "https://i.pravatar.cc/150?img=5",
        }
      }
    ],
    nextSteps: [
      "Próximo standup mañana a la misma hora"
    ]
  }
];

export default function SummaryPage() {
  const [summaries] = useState<MeetingSummary[]>(sampleSummaries);
  const [selectedSummary, setSelectedSummary] = useState<MeetingSummary | null>(sampleSummaries[0]);
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Descargando resumen",
      description: "El resumen se está descargando como PDF",
    });
  };

  const handleShare = () => {
    toast({
      title: "Compartir resumen",
      description: "Opciones para compartir abiertas",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resúmenes de reuniones</h1>
        <div className="flex gap-2">
          <Button variant="outline">Filtrar</Button>
          <Button>Nueva reunión</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">Reuniones recientes</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona una reunión para ver su resumen completo
            </p>
          </div>
          
          {summaries.map((summary) => (
            <Card 
              key={summary.id}
              className={`cursor-pointer hover:shadow-md transition-all ${
                selectedSummary?.id === summary.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedSummary(summary)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{summary.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {format(summary.date, "dd/MM/yy")}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {summary.duration}
                  <span className="mx-1">•</span>
                  <Users className="h-3 w-3" />
                  {summary.participants.length} participantes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm pb-3">
                <div className="line-clamp-2 text-muted-foreground">
                  {summary.keyPoints[0]}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex -space-x-2">
                  {summary.participants.slice(0, 3).map((participant) => (
                    <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {summary.participants.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      +{summary.participants.length - 3}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {selectedSummary && (
          <div className="lg:col-span-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedSummary.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(selectedSummary.date, "dd MMMM yyyy")}
                      <span className="mx-1">•</span>
                      <Clock className="h-4 w-4" />
                      {selectedSummary.duration}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" /> PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-1" /> Compartir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Participantes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSummary.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>
                            {participant.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{participant.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Tabs defaultValue="summary">
                  <TabsList>
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                    <TabsTrigger value="actions">Acciones ({selectedSummary.actionItems.length})</TabsTrigger>
                    <TabsTrigger value="decisions">Decisiones ({selectedSummary.decisions.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="space-y-6 mt-4">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" /> Puntos clave
                      </h3>
                      <ul className="list-disc pl-6 space-y-2">
                        {selectedSummary.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-sm">{point}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Decisiones tomadas</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        {selectedSummary.decisions.map((decision, idx) => (
                          <li key={idx} className="text-sm">{decision}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Próximos pasos</h3>
                      <ul className="list-disc pl-6 space-y-2">
                        {selectedSummary.nextSteps.map((step, idx) => (
                          <li key={idx} className="text-sm">{step}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="space-y-4 mt-4">
                    {selectedSummary.actionItems.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between">
                          <div className="flex items-start gap-2">
                            <div className="bg-primary/20 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium text-primary">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium">{item.text}</p>
                              {item.assignee && (
                                <div className="flex items-center mt-2">
                                  <Avatar className="h-5 w-5 mr-1">
                                    <AvatarImage src={item.assignee.avatar} />
                                    <AvatarFallback>
                                      {item.assignee.name.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    Asignado a {item.assignee.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Ver tarea
                          </Button>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="decisions" className="space-y-4 mt-4">
                    {selectedSummary.decisions.map((decision, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <div className="bg-secondary rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                          <div>
                            <p>{decision}</p>
                            <Badge variant="outline" className="mt-2 text-xs bg-primary/10">
                              Decisión
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
