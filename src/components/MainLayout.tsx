
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./Logo";

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-4 bg-background">
          <div className="flex items-center">
            <Logo className="md:hidden" />
            <h1 className="ml-4 text-lg font-medium hidden md:block">Proyecto: Dashboard Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span className="text-sm hidden md:block">{user?.name}</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={logout}>
                Salir
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
