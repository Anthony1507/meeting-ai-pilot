import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/LoginForm";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  ChevronRight, 
  ExternalLink, 
  MessageSquareText, 
  ListChecks, 
  Clock, 
  BarChart2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  const { toast } = useToast();
  const [aiMessage, setAiMessage] = useState(
    "He resumido los puntos clave de la reunión y he creado 3 tareas para el equipo."
  );

  // Simulate AI typing with different messages
  const simulateAiTyping = () => {
    const messages = [
      "He resumido los puntos clave de la reunión y he creado 3 tareas para el equipo.",
      "Detecté un posible bloqueante en el proyecto de onboarding que requiere atención.",
      "Según la discusión, acabo de actualizar la documentación con las nuevas definiciones.",
      "Basado en la charla, he priorizado las siguientes tareas para el sprint."
    ];
    
    const nextIndex = (messages.indexOf(aiMessage) + 1) % messages.length;
    setAiMessage("");
    
    let i = 0;
    const typeMessage = setInterval(() => {
      setAiMessage((prev) => prev + messages[nextIndex].charAt(i));
      i++;
      if (i >= messages[nextIndex].length) {
        clearInterval(typeMessage);
      }
    }, 50);
  };

  const handleTryDemo = () => {
    toast({
      title: "¡Bienvenido a la demo!",
      description: "Inicia sesión con cualquiera de los usuarios de prueba"
    });
  };

  const handleLearnMore = () => {
    toast({
      title: "Más información",
      description: "Gracias por tu interés en CollabCopilot"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b py-4 px-6 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="hidden md:flex">
            Contacto
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
        <div className="flex flex-col justify-center">
          <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium animate-fade-in">
            ✨ IA para equipos de trabajo
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in">
            Reuniones más inteligentes y productivas
          </h1>
          <p className="text-lg mb-6 text-muted-foreground animate-fade-in">
            CollabCopilot es tu asistente de IA para reuniones, registra
            decisiones, crea tareas y hace seguimiento de tu equipo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button size="lg" asChild className="font-semibold" onClick={handleTryDemo}>
              <Link to="/meeting">
                Probar demo ahora
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="font-semibold" onClick={handleLearnMore}>
              Conocer más
            </Button>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Transcripción automática</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Gestión de tareas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Resúmenes inteligentes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Búsqueda avanzada</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center mt-8 md:mt-0">
          <div className="relative">
            <div className="absolute -top-12 -right-8 md:-top-16 md:-right-12 w-56 md:w-64 bg-primary/90 dark:bg-primary/70 p-4 rounded-lg shadow-lg text-white dark:text-primary-foreground z-10 animate-fade-in cursor-pointer" onClick={simulateAiTyping}>
              <p className="text-sm">{aiMessage || "..."}</p>
            </div>
            <Card className="rounded-lg overflow-hidden border shadow-lg w-full max-w-md hover:shadow-xl transition-all">
              <CardContent className="p-0">
                <img
                  src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Reunión virtual"
                  className="w-full object-cover h-64"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Sprint Planning #12</h3>
                    <Badge variant="outline" className="text-xs">En curso</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                      <span>15 mensajes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
                      <span>4 tareas creadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Iniciada hace 45 minutos</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Separator />

      <div className="py-10 px-6 md:p-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">¿Por qué elegir CollabCopilot?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transforma la manera en que tu equipo colabora y gestiona información en las reuniones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquareText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comunicación mejorada</h3>
              <p className="text-muted-foreground text-sm">
                Registra automáticamente las conversaciones y extrae información clave para mantener a todos en sintonía.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ListChecks className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestión eficiente</h3>
              <p className="text-muted-foreground text-sm">
                Convierte conversaciones en tareas accionables, asígnales dueños y realiza seguimiento sin esfuerzo.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Análisis profundo</h3>
              <p className="text-muted-foreground text-sm">
                Obtén insights sobre patrones de reuniones, productividad y puntos de mejora para tu equipo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6 md:p-10 bg-secondary/50">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">Prueba la demo ahora</h3>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

// Helper component
const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      variant === "outline" ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"
    } ${className}`}>
      {children}
    </span>
  );
};
