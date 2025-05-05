
import React from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/LoginForm";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b py-4 px-6 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Reuniones más inteligentes y productivas
          </h1>
          <p className="text-lg mb-6 text-muted-foreground">
            CollabCopilot es tu asistente de IA para reuniones, registra
            decisiones, crea tareas y hace seguimiento de tu equipo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="font-semibold">
              <Link to="/meeting">Probar demo ahora</Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center mt-8 md:mt-0">
          <div className="relative">
            <div className="absolute -top-12 -right-8 w-56 bg-primary/90 dark:bg-primary/70 p-4 rounded-lg shadow-lg text-white dark:text-primary-foreground z-10">
              <p className="text-sm">
                "He resumido los puntos clave de la reunión y he creado 3 tareas para el equipo."
              </p>
            </div>
            <div className="rounded-lg overflow-hidden border shadow-lg w-full max-w-md">
              <img
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Reunión virtual"
                className="w-full object-cover h-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 bg-secondary/50">
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
