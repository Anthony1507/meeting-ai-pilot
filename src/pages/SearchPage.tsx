
import React, { useState, useEffect } from "react";
import { useMeeting } from "@/contexts/MeetingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search, Filter, Calendar, Tag, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const { messages } = useMeeting();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar mensajes basado en criterios múltiples
  useEffect(() => {
    if (!hasSearched) return;
    
    let filtered = messages.filter(message => message.type === "ai");
    
    // Filtrar por consulta de búsqueda
    if (searchQuery) {
      filtered = filtered.filter(message => 
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrar por categoría
    if (category && category !== "all") {
      filtered = filtered.filter(message => message.category === category);
    }
    
    // Filtrar por fecha
    if (dateFilter) {
      const today = new Date();
      const filterDate = new Date();
      
      switch(dateFilter) {
        case "today":
          filtered = filtered.filter(message => {
            const messageDate = new Date(message.timestamp);
            return messageDate.toDateString() === today.toDateString();
          });
          break;
        case "yesterday":
          filterDate.setDate(today.getDate() - 1);
          filtered = filtered.filter(message => {
            const messageDate = new Date(message.timestamp);
            return messageDate.toDateString() === filterDate.toDateString();
          });
          break;
        case "week":
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(message => {
            const messageDate = new Date(message.timestamp);
            return messageDate >= filterDate;
          });
          break;
        case "month":
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter(message => {
            const messageDate = new Date(message.timestamp);
            return messageDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }
    
    // Ordenar resultados por fecha (más reciente primero)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setSearchResults(filtered);
  }, [searchQuery, category, dateFilter, messages, hasSearched]);

  // Obtener resultados actuales para paginación
  const getCurrentResults = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return searchResults.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setHasSearched(true);
    
    // Mostrar notificación de búsqueda
    toast({
      title: searchQuery ? `Búsqueda: "${searchQuery}"` : "Mostrando todos los resultados",
      description: `Se encontraron ${searchResults.length} resultados`,
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategory(undefined);
    setDateFilter(undefined);
    setHasSearched(false);
    setSearchResults([]);
    setCurrentPage(1);
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

  // Highlight search terms in the message content
  const highlightSearchTerm = (content: string, term: string) => {
    if (!term) return content;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = content.split(regex);

    return parts.map((part, i) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Extraer contexto de la conversación
  const getMessageContext = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return [];
    
    // Obtener hasta 2 mensajes antes y después para contexto
    const startIdx = Math.max(0, messageIndex - 2);
    const endIdx = Math.min(messages.length - 1, messageIndex + 2);
    
    return messages.slice(startIdx, endIdx + 1).filter(m => m.id !== messageId);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Buscar Decisiones</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Busca por palabras clave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <SelectValue placeholder="Todas las categorías" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="task">Tareas</SelectItem>
                    <SelectItem value="definition">Definiciones</SelectItem>
                    <SelectItem value="blocker">Bloqueantes</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <SelectValue placeholder="Cualquier fecha" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier fecha</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="min-w-[100px]">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                {hasSearched && (
                  <Button variant="outline" onClick={resetFilters}>
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {hasSearched ? (
        <div className="space-y-4">
          {searchResults.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Ordenado por más reciente
                  </span>
                </div>
              </div>

              <Tabs defaultValue="list" className="mb-6">
                <TabsList>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                  <TabsTrigger value="detailed">Detallado</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="mt-4">
                  <div className="space-y-4">
                    {getCurrentResults().map((message) => (
                      <Card key={message.id} className="animate-fade-in hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
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
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.timestamp), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-line">
                            {highlightSearchTerm(message.content, searchQuery)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="detailed" className="mt-4">
                  {getCurrentResults().map((message) => {
                    const context = getMessageContext(message.id);
                    
                    return (
                      <Card key={message.id} className="mb-4 animate-fade-in hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white">
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
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium">CollabCopilot</div>
                                <div className="flex items-center gap-2 mt-1">
                                  {renderCategoryBadge(message.category)}
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(message.timestamp), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-secondary/30 p-4 rounded-lg my-3">
                            <p className="text-sm whitespace-pre-line font-medium">
                              {highlightSearchTerm(message.content, searchQuery)}
                            </p>
                          </div>
                          
                          {context.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground mb-2">
                                Contexto de la conversación:
                              </p>
                              <div className="space-y-2 bg-background/80 p-3 rounded-lg border">
                                {context.map((msg) => (
                                  <div key={msg.id} className="text-xs">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      {msg.type === "ai" ? (
                                        <span className="font-medium">CollabCopilot</span>
                                      ) : (
                                        <span className="font-medium">{msg.sender?.name}</span>
                                      )}
                                      <span>·</span>
                                      <span>{format(new Date(msg.timestamp), "HH:mm")}</span>
                                    </div>
                                    <p className="mt-1 truncate max-w-lg">
                                      {msg.content.length > 100 
                                        ? `${msg.content.substring(0, 100)}...` 
                                        : msg.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
              </Tabs>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-3 opacity-30" />
              <p className="text-xl font-medium mb-2">
                No se encontraron resultados
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery ? (
                  <>No hay mensajes que coincidan con "<strong>{searchQuery}</strong>". Prueba con diferentes palabras clave o filtros.</>
                ) : (
                  <>No hay mensajes que coincidan con los filtros seleccionados. Intenta con otros criterios de búsqueda.</>
                )}
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-6">
                Limpiar búsqueda
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg">
          <div className="max-w-md mx-auto">
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h2 className="text-2xl font-medium mb-4">
              Busca en las decisiones y notas
            </h2>
            <p className="text-muted-foreground mb-8">
              Encuentra fácilmente información importante, tareas, definiciones y bloqueantes de reuniones anteriores. Usa palabras clave o filtra por categorías y fechas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-card rounded-lg border">
                <Tag className="h-5 w-5 mb-2 text-primary" />
                <h3 className="font-medium mb-1">Filtrar por categoría</h3>
                <p className="text-sm text-muted-foreground">Localiza tareas, definiciones y bloqueantes</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <Calendar className="h-5 w-5 mb-2 text-primary" />
                <h3 className="font-medium mb-1">Filtrar por fecha</h3>
                <p className="text-sm text-muted-foreground">Busca por hoy, ayer o la última semana</p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <Filter className="h-5 w-5 mb-2 text-primary" />
                <h3 className="font-medium mb-1">Resultados detallados</h3>
                <p className="text-sm text-muted-foreground">Ver el contexto completo de cada resultado</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
