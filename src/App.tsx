import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import StudentWellbeing from "./pages/StudentWellbeing";
import TeacherAssessment from "./pages/TeacherAssessment";
import AlertsPage from "./pages/AlertsPage";
import StudentsPage from "./pages/StudentsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import FichasPage from "./pages/FichasPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Student: only their own wellbeing */}
              <Route
                path="/wellbeing"
                element={
                  <ProtectedRoute allowedRoles={["estudiante"]}>
                    <StudentWellbeing />
                  </ProtectedRoute>
                }
              />
              {/* Teacher: assessment only */}
              <Route
                path="/teacher-assessment"
                element={
                  <ProtectedRoute allowedRoles={["docente"]}>
                    <TeacherAssessment />
                  </ProtectedRoute>
                }
              />
              {/* Teacher, Dupla, Inspector, Orientador: view students */}
              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={["docente", "psicologo", "trabajador_social", "inspector_general", "orientador"]}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />
              {/* Admin, Dupla, Inspector: aggregated reports */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={["administrador", "psicologo", "trabajador_social", "inspector_general"]}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              {/* Dupla, Inspector: full alerts management; Orientador: view only authorized */}
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute allowedRoles={["psicologo", "trabajador_social", "inspector_general", "orientador"]}>
                    <AlertsPage />
                  </ProtectedRoute>
                }
              />
              {/* Fichas module: Dupla/Inspector full, Admin stats only, Teachers/Orientador with shared access */}
              <Route
                path="/fichas"
                element={
                  <ProtectedRoute allowedRoles={["psicologo", "trabajador_social", "administrador", "docente", "inspector_general", "orientador"]}>
                    <FichasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              {/* Student profile: Dupla/Inspector has full access, Teacher/Orientador limited access */}
              <Route
                path="/students/:studentId"
                element={
                  <ProtectedRoute allowedRoles={["docente", "psicologo", "trabajador_social", "inspector_general", "orientador"]}>
                    <StudentProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
