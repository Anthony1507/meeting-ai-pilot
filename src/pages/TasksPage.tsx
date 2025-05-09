
import React, { useState } from "react";
import { useMeeting, Task } from "@/contexts/MeetingContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, AlertCircle, XCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

export default function TasksPage() {
  const { tasks, addTask, updateTaskStatus } = useMeeting();
  const { toast } = useToast();
  const [view, setView] = useState<"cards" | "list">("cards");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  const handleUpdateStatus = (taskId: string, status: Task["status"]) => {
    updateTaskStatus(taskId, status);
    
    toast({
      title: "Estado actualizado",
      description: `La tarea ha sido movida a ${
        status === "pending"
          ? "pendientes"
          : status === "in-progress"
          ? "en progreso"
          : "completadas"
      }`,
    });
  };

  const handleAddTask = () => {
    setIsDialogOpen(true);
  };

  const handleCreateTask = async (task: {
    title: string;
    description: string;
    dueDate?: Date;
  }) => {
    try {
      await addTask({
        title: task.title,
        description: task.description,
        status: "pending",
        dueDate: task.dueDate,
      });
      
      toast({
        title: "Tarea creada",
        description: `"${task.title}" ha sido añadida a la lista.`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la tarea.",
        variant: "destructive",
      });
      throw error; // Re-throw for the component to handle
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">{task.title}</CardTitle>
            <StatusBadge status={task.status} />
          </div>
          <CardDescription className="text-sm">
            {task.dueDate && (
              <div className="flex items-center mt-1 text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  Fecha límite: {format(task.dueDate, "dd/MM/yyyy")}
                </span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">{task.description}</p>
          {task.assignee && (
            <div className="flex items-center mt-3">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={task.assignee.avatar} />
                <AvatarFallback>
                  {task.assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{task.assignee.name}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <div className="text-xs text-muted-foreground">
            Creada el {format(task.createdAt, "dd/MM/yyyy")}
          </div>
          <div className="flex space-x-2">
            {task.status !== "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleUpdateStatus(task.id, "pending")}
              >
                Pendiente
              </Button>
            )}
            {task.status !== "in-progress" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleUpdateStatus(task.id, "in-progress")}
              >
                En progreso
              </Button>
            )}
            {task.status !== "completed" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleUpdateStatus(task.id, "completed")}
              >
                Completada
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const StatusBadge = ({ status }: { status: Task["status"] }) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="h-3 w-3 mr-1" />
            En progreso
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completada
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tareas del proyecto</h1>
        <Button onClick={handleAddTask}>
          <Plus className="mr-1 h-4 w-4" /> Nueva tarea
        </Button>
      </div>
      
      <div className="mb-6">
        <p className="text-muted-foreground mb-2">
          Estas son todas las tareas extraídas de las reuniones y las asignadas manualmente.
        </p>
        <div className="flex items-center">
          <Button
            variant={view === "cards" ? "default" : "outline"}
            size="sm"
            className="mr-2"
            onClick={() => setView("cards")}
          >
            Cards
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            Lista
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            En progreso ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className={view === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <XCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No hay tareas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No hay tareas creadas aún. Puedes crear una nueva tarea o hablar en una reunión para que se detecten automáticamente.
                </p>
                <Button onClick={handleAddTask}>
                  <Plus className="mr-1 h-4 w-4" /> Nueva tarea
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <div className={view === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <XCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No hay tareas pendientes</h3>
                <p className="text-sm text-muted-foreground">
                  No hay tareas pendientes en este momento
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress" className="space-y-4">
          <div className={view === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <XCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No hay tareas en progreso</h3>
                <p className="text-sm text-muted-foreground">
                  No hay tareas en progreso en este momento
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <div className={view === "cards" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="text-center p-8 bg-muted/50 rounded-lg">
                <XCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No hay tareas completadas</h3>
                <p className="text-sm text-muted-foreground">
                  Las tareas completadas aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateTaskDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateTask={handleCreateTask}
      />
    </div>
  );
}
