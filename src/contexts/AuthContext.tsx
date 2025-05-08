
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, SignInCredentials, SignUpCredentials } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: SignInCredentials) => Promise<boolean>;
  register: (credentials: SignUpCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función auxiliar para obtener avatar por defecto
const getDefaultAvatar = (name: string) => {
  // Genera un avatar basado en las iniciales o usa un servicio como ui-avatars
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Verificar usuario al inicio
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Transformamos los datos del usuario a nuestro formato
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            name: currentUser.user_metadata?.name || 'Usuario',
            avatar: currentUser.user_metadata?.avatar_url || getDefaultAvatar(currentUser.user_metadata?.name || 'Usuario'),
            role: currentUser.user_metadata?.role || 'Usuario',
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async ({ email, password }: SignInCredentials) => {
    try {
      setIsLoading(true);
      const { user: authUser } = await authService.signIn({ email, password });
      
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || 'Usuario',
          avatar: authUser.user_metadata?.avatar_url || getDefaultAvatar(authUser.user_metadata?.name || 'Usuario'),
          role: authUser.user_metadata?.role || 'Usuario',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error de autenticación",
        description: "Credenciales incorrectas o problemas en el servidor.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ email, password, name }: SignUpCredentials) => {
    try {
      setIsLoading(true);
      const { user: authUser } = await authService.signUp({ email, password, name });
      
      if (authUser) {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Por favor, verifica tu email.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error de registro",
        description: "No se pudo crear la cuenta. Intenta nuevamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error al cerrar sesión",
        description: "Hubo un problema al cerrar sesión.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
