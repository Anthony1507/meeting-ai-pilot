
import React, { createContext, useContext, useState } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: "1",
    email: "usuario1@copilot.com",
    password: "123456",
    name: "Ana Martínez",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "Developer",
  },
  {
    id: "2",
    email: "usuario2@copilot.com",
    password: "abcdef",
    name: "Carlos Rodríguez",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "Product Manager",
  },
  {
    id: "3",
    email: "scrum@copilot.com",
    password: "copilot23",
    name: "Laura Gómez",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "Scrum Master",
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Simulate API call with timeout
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (foundUser) {
          // Remove password from user object for security
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
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
