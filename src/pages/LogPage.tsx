
import React from "react";
import { useMeeting, Message } from "@/contexts/MeetingContext";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function LogPage() {
  const { filteredMessages, activeFilter, setActiveFilter } = useMeeting();
  
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
      <span className={`text-xs px-2 py-1 rounded-full border ${style}`}>
        {label}
      </span>
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bitácora de Proyecto</h1>
        <div className="flex gap-2">
          <Button
            variant={activeFilter === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(undefined)}
          >
            Todos
          </Button>
          <Button
            variant={activeFilter === "task" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("task")}
            className="text-meeting-task"
          >
            Tareas
          </Button>
          <Button
            variant={activeFilter === "definition" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("definition")}
            className="text-meeting-definition"
          >
            Definiciones
          </Button>
          <Button
            variant={activeFilter === "blocker" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("blocker")}
            className="text-meeting-blocker"
          >
            Bloqueantes
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {aiMessages.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No hay registros disponibles</p>
          </div>
        ) : (
          aiMessages.map((message, index) => (
            <React.Fragment key={message.id}>
              {renderDateHeader(message.timestamp, index, aiMessages)}
              <div className="bg-card p-4 rounded-lg border animate-fade-in">
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
                    {format(message.timestamp, "HH:mm")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
