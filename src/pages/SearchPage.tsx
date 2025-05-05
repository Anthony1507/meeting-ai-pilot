
import React, { useState } from "react";
import { useMeeting } from "@/contexts/MeetingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search } from "lucide-react";

export default function SearchPage() {
  const { messages } = useMeeting();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Filter messages that are from the AI assistant and contain the search query
  const searchResults = searchQuery
    ? messages.filter(
        (message) =>
          message.type === "ai" &&
          message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
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
      <span className={`text-xs px-2 py-1 rounded-full border ${style}`}>
        {label}
      </span>
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
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buscar Decisiones</h1>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            placeholder="Busca por palabras clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </form>

        <div className="space-y-4">
          {hasSearched ? (
            <>
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchResults.length} resultado(s) encontrado(s)
                  </p>
                  {searchResults.map((message) => (
                    <div
                      key={message.id}
                      className="bg-card p-4 rounded-lg border animate-fade-in"
                    >
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
                          {format(message.timestamp, "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-line">
                        {highlightSearchTerm(message.content, searchQuery)}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No se encontraron resultados para "{searchQuery}"
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Busca en las notas y decisiones de tus reuniones anteriores
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
