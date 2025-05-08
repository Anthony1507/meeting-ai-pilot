
import React, { useState, useEffect } from "react";
import { useMeeting, Message } from "@/contexts/MeetingContext";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Filter, Calendar, Download, Share2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LogPage() {
  const { filteredMessages, activeFilter, setActiveFilter, isLoading } = useMeeting();
  const { toast } = useToast();
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  
  const toggleMessageExpand = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const handleExportLog = () => {
    // Crear un archivo CSV o PDF con los mensajes filtrados
    const filteredData = aiMessages.map(msg => ({
      timestamp: format(msg.timestamp, "yyyy-MM-dd HH:mm:ss"),
      category: msg.category || "general",
      content: msg.content.replace(/"/g, '""') // Escapar comillas para CSV
    }));
    
    // Crear encabezados CSV
    const headers = ["Fecha", "Categoría", "Contenido"];
    
    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        `"${row.timestamp}"`,
        `"${row.category}"`,
        `"${row.content}"`
      ].join(','))
    ].join('\n');
    
    // Crear un blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bitacora_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportando bitácora",
      description: "El archivo se ha descargado correctamente",
    });
  };

  const handleShareLog = () => {
    // Simular compartir el enlace
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Compartir bitácora",
          description: "Enlace copiado al portapapeles",
        });
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive",
        });
      });
  };
  
  const renderCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    const styles = {
      task: "bg-meeting-task/20 text-meeting-task border-meeting-task/30",
      definition: "bg-meeting-definition/20 text-meeting-definition border-meeting-definition/30",
      blocker: "bg-meeting-blocker/20 text-meeting-blocker border-meeting-blocker/30",
      general: "bg-primary/20 text-primary border-primary/30",
    };
    
    const labels = {
      task: "Tarea",
      definition: "Definición",
      blocker: "Bloqueante",
      general: "General",
    };
    
    const style = styles[category as keyof typeof styles] || styles.general;
    const label = labels[category as keyof typeof labels] || "General";
    
    return (
      <Badge variant="outline" className={`${style}`}>
        {label}
      </Badge>
    );
  };

  const renderDateHeader = (date: Date, index: number, messages: Message[]) => {
    if (index === 0) {
      return (
        <div className="text-sm text-center my-4 text-muted-foreground">
          {format(date, "EEEE, d 'de' MMMM", { locale: es })}
        </div>
      );
    }
    
    const prevDate = messages[index - 1].timestamp;
    if (date.toDateString() !== prevDate.toDateString()) {
      return (
        <div className="text-sm text-center my-4 text-muted-foreground">
          {format(date, "EEEE, d 'de' MMMM", { locale: es })}
        </div>
      );
    }
    
    return null;
  };

  const messages = filteredMessages(activeFilter);
  const aiMessages = messages.filter((msg) => msg.type === "ai" && msg.category);

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    toast({
      title: filter ? `Mostrando ${
        filter === "task" ? "tareas" : 
        filter === "definition" ? "definiciones" : 
        filter === "blocker" ? "bloqueantes" : "general"
      }` : "Mostrando todos los registros",
      description: `${aiMessages.filter(msg => !filter || msg.category === filter).length} elementos encontrados`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando bitácora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bitácora de Proyecto</h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFilterChange(undefined)}>
                Todos los registros
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("task")}>
                Tareas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("definition")}>
                Definiciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("blocker")}>
                Bloqueantes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange("general")}>
                General
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleExportLog}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleShareLog}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={activeFilter === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange(undefined)}
        >
          Todos
        </Button>
        <Button
          variant={activeFilter === "task" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("task")}
          className={activeFilter === "task" ? "" : "text-meeting-task"}
        >
          Tareas
        </Button>
        <Button
          variant={activeFilter === "definition" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("definition")}
          className={activeFilter === "definition" ? "" : "text-meeting-definition"}
        >
          Definiciones
        </Button>
        <Button
          variant={activeFilter === "blocker" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("blocker")}
          className={activeFilter === "blocker" ? "" : "text-meeting-blocker"}
        >
          Bloqueantes
        </Button>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {aiMessages.length === 0 ? (
          <div className="text-center p-8 bg-secondary/20 rounded-lg border">
            <Filter className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-30" />
            <p className="text-lg font-medium mb-1">No hay registros disponibles</p>
            <p className="text-muted-foreground">
              {activeFilter ? 'Prueba con otro filtro o revisa los mensajes de la reunión' : 'No se han encontrado registros en la bitácora'}
            </p>
          </div>
        ) : (
          aiMessages.map((message, index) => (
            <React.Fragment key={message.id}>
              {renderDateHeader(message.timestamp, index, aiMessages)}
              <Card className="p-4 rounded-lg border animate-fade-in hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-ai flex items-center justify-center text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                    </div>
                    {renderCategoryBadge(message.category)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(message.timestamp, "HH:mm")}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => toggleMessageExpand(message.id)}
                    >
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedMessages.has(message.id) ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                <div className={`${message.content.length > 150 && !expandedMessages.has(message.id) ? 'line-clamp-3' : ''}`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
                
                {message.content.length > 150 && !expandedMessages.has(message.id) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1 h-6 text-xs text-muted-foreground"
                    onClick={() => toggleMessageExpand(message.id)}
                  >
                    Ver más
                  </Button>
                )}
                
                {expandedMessages.has(message.id) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleShareLog}>
                        <Share2 className="h-3 w-3 mr-1" />
                        Compartir
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        Añadir comentario
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
