
import React from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "./Logo";

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r bg-sidebar h-screen flex flex-col overflow-y-auto">
      <div className="p-4">
        <Logo />
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/meeting"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <span className="mr-1">📋</span>
              <span>Reunión activa</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/log"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <span className="mr-1">📄</span>
              <span>Bitácora</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <span className="mr-1">✅</span>
              <span>Tareas asignadas</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <span className="mr-1">🔍</span>
              <span>Buscar decisiones</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>CollabCopilot v1.0</p>
      </div>
    </aside>
  );
};
