
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export function UserProfile() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpdateProfile = async () => {
    if (!name.trim() || !user) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateUserProfile({ name });
      
      setIsEditing(false);
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Perfil de usuario</CardTitle>
        <CardDescription>
          Administra la información de tu perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-2xl">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-medium text-lg">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            {isEditing ? (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            ) : (
              <div className="px-3 py-2 border rounded-md bg-muted/20">
                {user?.name}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="px-3 py-2 border rounded-md bg-muted/20">
              {user?.email}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setName(user?.name || "");
                setIsEditing(false);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateProfile}
              disabled={isLoading || !name.trim() || name === user?.name}
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Editar perfil
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
