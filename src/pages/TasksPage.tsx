
import React, { useState } from "react";
import { useMeeting } from "@/contexts/MeetingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Check, Clock, MoreHorizontal, Plus, ChevronDown, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function TasksPage() {
  const { tasks, updateTaskStatus } = useMeeting();
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  const handleStatusChange = (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    updateTaskStatus(taskId, newStatus);
    setShowConfirmation(taskId);
    
    toast({
      title: "Estado actualizado",
      description: `Tarea marcada como ${newStatus === "pending" ? "pendiente" : 
                   newStatus === "in-progress" ? "en progreso" : "completada"}`,
    });
    
    setTimeout(() => setShowConfirmation(null), 2000);
  };

  const handleAssignToMe = (taskId: string) => {
    toast({
      title: "Tarea asignada",
      description: "La tarea ha sido asignada a ti",
    });
  };

  const handleAddNewTask = (column: string) => {
    toast({
      title: "Nueva tarea",
      description: `Crear nueva tarea en ${column === "pending" ? "Pendientes" : 
                   column === "in-progress" ? "En progreso" : "Completadas"}`,
    });
  };

  const handleToggleDetails = (taskId: string) => {
    setActiveDropdown(activeDropdown === taskId ? null : taskId);
  };

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <Card className={`mb-3 ${showConfirmation === task.id ? "ring-2 ring-primary animate-pulse" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <h3 className="font-medium mb-1 flex-1">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== "pending" && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "pending")}>
                  Marcar como pendiente
                </DropdownMenuItem>
              )}
              {task.status !== "in-progress" && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "in-progress")}>
                  Marcar en progreso
                </DropdownMenuItem>
              )}
              {task.status !== "completed" && (
                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "completed")}>
                  Marcar como completada
                </DropdownMenuItem>
              )}
              {!task.assignee && (
                <DropdownMenuItem onClick={() => handleAssignToMe(task.id)}>
                  Asignar a mí
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleToggleDetails(task.id)}>
                {activeDropdown === task.id ? "Ocultar detalles" : "Ver detalles"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback>
                    {task.assignee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assignee.name}</span>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleAssignToMe(task.id)}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Asignar
              </Button>
            )}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{format(task.dueDate, "dd/MM/yyyy")}</span>
            </div>
          )}
        </div>
        
        {activeDropdown === task.id && (
          <div className="mt-3 pt-3 border-t text-xs">
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Creado:</span> {format(task.createdAt, "dd/MM/yyyy HH:mm")}
              </div>
              {task.fromMessageId && (
                <div>
                  <span className="font-medium">Origen:</span> Extraído de la reunión
                </div>
              )}
            </div>
          </div>
        )}
        
        {showConfirmation === task.id && (
          <div className="mt-3 text-xs text-primary flex items-center gap-1 bg-primary/10 p-2 rounded">
            <Check className="h-3 w-3" />
            <span>Estado actualizado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const TaskColumn = ({ title, color, tasks, status }: { 
    title: string, 
    color: string, 
    tasks: typeof tasks, 
    status: "pending" | "in-progress" | "completed" 
  }) => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-5 w-1 rounded bg-${color}`} style={{ backgroundColor: color }}></div>
              {title}
              <span className="bg-secondary text-muted-foreground text-xs rounded-full px-2">
                {tasks.length}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => handleAddNewTask(status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay tareas {status === "pending" ? "pendientes" : 
                          status === "in-progress" ? "en progreso" : "completadas"}
            </p>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tareas Asignadas</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn 
          title="Pendientes" 
          color="meeting-task" 
          tasks={pendingTasks} 
          status="pending" 
        />
        
        <TaskColumn 
          title="En Progreso" 
          color="meeting-definition" 
          tasks={inProgressTasks} 
          status="in-progress" 
        />
        
        <TaskColumn 
          title="Completadas" 
          color="primary" 
          tasks={completedTasks} 
          status="completed" 
        />
      </div>
    </div>
  );
}
