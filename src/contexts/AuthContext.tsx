import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>; 
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; 
  updateUserProfile: ({ name }: { name: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          setUser({
            id: authUser.id,
            name: authUser.user_metadata.name || 'Usuario',
            email: authUser.email || '',
            avatar: authUser.user_metadata.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.user_metadata.name || 'Usuario')}`,
          });
        }
      } catch (error) {
        console.error('Error obteniendo usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.name || 'Usuario',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.user_metadata.name || 'Usuario')}`,
        });
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata.name || 'Usuario',
          email: data.user.email || '',
          avatar: data.user.user_metadata.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.user_metadata.name || 'Usuario')}`,
        });

        toast({
          title: "Inicio de sesión exitoso",
          description: "Has iniciado sesión correctamente",
        });

        navigate('/meeting');
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      throw error;
    }
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    return signIn(email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          },
        },
      });

      if (error) {
        toast({
          title: "Error al registrarse",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Registro exitoso",
        description: "Te has registrado correctamente. Ahora puedes iniciar sesión.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const logout = async () => {
    return signOut();
  };

  const updateUserProfile = async ({ name }: { name: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        },
      });

      if (error) {
        toast({
          title: "Error al actualizar perfil",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (user) {
        setUser({
          ...user,
          name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        });
      }

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        login,
        signUp,
        signOut,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};
