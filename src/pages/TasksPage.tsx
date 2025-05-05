
import React, { useState } from "react";
import { useMeeting } from "@/contexts/MeetingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Check, Clock, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TasksPage() {
  const { tasks, updateTaskStatus } = useMeeting();
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  const handleStatusChange = (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    updateTaskStatus(taskId, newStatus);
    setShowConfirmation(taskId);
    setTimeout(() => setShowConfirmation(null), 2000);
  };

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <Card className={`mb-3 ${showConfirmation === task.id ? "ring-2 ring-primary" : ""}`}>
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
              <span className="text-muted-foreground">Sin asignar</span>
            )}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{format(task.dueDate, "dd/MM/yyyy")}</span>
            </div>
          )}
        </div>
        {showConfirmation === task.id && (
          <div className="mt-3 text-xs text-primary flex items-center gap-1 bg-primary/10 p-2 rounded">
            <Check className="h-3 w-3" />
            <span>Estado actualizado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tareas Asignadas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-5 w-1 rounded bg-meeting-task"></div>
                Pendientes
                <span className="bg-secondary text-muted-foreground text-xs rounded-full px-2">
                  {pendingTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay tareas pendientes
                </p>
              ) : (
                pendingTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-5 w-1 rounded bg-meeting-definition"></div>
                En Progreso
                <span className="bg-secondary text-muted-foreground text-xs rounded-full px-2">
                  {inProgressTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {inProgressTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay tareas en progreso
                </p>
              ) : (
                inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-5 w-1 rounded bg-primary"></div>
                Completadas
                <span className="bg-secondary text-muted-foreground text-xs rounded-full px-2">
                  {completedTasks.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay tareas completadas
                </p>
              ) : (
                completedTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
