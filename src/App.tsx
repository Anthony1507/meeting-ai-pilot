
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MeetingProvider } from "@/contexts/MeetingContext";
import LandingPage from "./pages/LandingPage";
import MeetingPage from "./pages/MeetingPage";
import LogPage from "./pages/LogPage";
import TasksPage from "./pages/TasksPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/MainLayout";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// App Routes Component to use AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="meeting" element={<MeetingPage />} />
        <Route path="log" element={<LogPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <MeetingProvider>
              <AppRoutes />
            </MeetingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
