
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  MessageSquare,
  FileText,
  ClipboardList,
  Search,
  Layers,
  Settings,
  User,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    {
      name: "Meeting",
      href: "/meeting",
      icon: MessageSquare,
    },
    {
      name: "Summary",
      href: "/summary",
      icon: FileText,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: ClipboardList,
    },
    {
      name: "Log History",
      href: "/log",
      icon: Layers,
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
    },
  ];

  return (
    <div className="hidden md:flex h-full w-[260px] flex-col border-r px-2 py-4">
      <div className="mx-2">
        <Logo />
      </div>
      <div className="flex-1 space-y-1 mt-6">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              location.pathname === item.href
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between px-3">
          <ThemeToggle />
          <Link to="/profile">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="border-t pt-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User size={14} className="text-foreground" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{user?.name || "Usuario"}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user?.email || "usuario@ejemplo.com"}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
