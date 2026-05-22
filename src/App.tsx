import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "@/views/Index";
import NotFound from "@/views/NotFound";
import Tasks from "@/views/Tasks";
import Notes from "@/views/Notes";
import Links from "@/views/Links";
import CalendarPage from "@/views/CalendarPage";
import Settings from "@/views/Settings";
import Projects from "@/views/Projects";
import ProjectWorkspace from "@/views/ProjectWorkspace";
import Accounts from "@/views/Accounts";
import { WorkOSProvider } from "./components/workos/WorkOSProvider";
import Auth from "@/views/Auth";
import Landing from "@/views/Landing";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }
  return user ? <Index /> : <Landing />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WorkOSProvider>
              <Routes>
                <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
                <Route path="/" element={<RootRoute />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<ProjectWorkspace />} />
                      <Route path="/notes" element={<Notes />} />
                      <Route path="/links" element={<Links />} />
                      <Route path="/accounts" element={<Accounts />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProtectedRoute>
                } />
              </Routes>
            </WorkOSProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
