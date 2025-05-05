
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { FileText, MessageCircle, CheckSquare, Search, Menu } from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  
  // Menu items configuration
  const menuItems = [
    {
      to: "/meeting",
      icon: MessageCircle,
      label: "Reunión activa",
    },
    {
      to: "/summary",
      icon: FileText,
      label: "Resúmenes",
    },
    {
      to: "/log",
      icon: FileText,
      label: "Bitácora",
    },
    {
      to: "/tasks",
      icon: CheckSquare,
      label: "Tareas asignadas",
    },
    {
      to: "/search",
      icon: Search,
      label: "Buscar decisiones",
    },
  ];

  return (
    <ShadcnSidebar className="border-r">
      <SidebarRail className="cursor-pointer" />
      <SidebarHeader className="pb-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center">
            <Logo />
          </div>
          <SidebarTrigger className="md:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.to}
                tooltip={item.label}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 w-full ${isActive ? "text-primary font-medium" : ""}`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">CollabCopilot v1.0</p>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
