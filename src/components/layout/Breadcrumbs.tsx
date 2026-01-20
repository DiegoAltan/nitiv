import { useLocation, Link } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/contexts/AuthContext";

interface RouteConfig {
  path: string;
  label: string;
  roles?: string[];
}

const routeLabels: RouteConfig[] = [
  { path: "/", label: "Dashboard" },
  { path: "/wellbeing", label: "Mi Bienestar", roles: ["estudiante"] },
  { path: "/teacher-assessment", label: "Evaluación Docente", roles: ["docente"] },
  { path: "/students", label: "Estudiantes", roles: ["docente", "psicologo", "trabajador_social"] },
  { path: "/fichas", label: "Fichas/Registros", roles: ["psicologo", "trabajador_social", "administrador", "docente"] },
  { path: "/reports", label: "Reportes", roles: ["administrador", "psicologo", "trabajador_social"] },
  { path: "/alerts", label: "Alertas", roles: ["psicologo", "trabajador_social"] },
  { path: "/settings", label: "Configuración" },
];

export function Breadcrumbs() {
  const location = useLocation();
  const { activeRole } = useAuth();
  
  // Parse current path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  // Build breadcrumb items
  const breadcrumbItems: { path: string; label: string; isLast: boolean }[] = [];
  
  // Always add home/dashboard
  if (location.pathname !== "/") {
    breadcrumbItems.push({ path: "/", label: "Dashboard", isLast: false });
  }
  
  // Add current route
  if (pathSegments.length > 0) {
    const currentPath = `/${pathSegments[0]}`;
    const routeConfig = routeLabels.find(r => r.path === currentPath);
    
    if (routeConfig) {
      breadcrumbItems.push({
        path: currentPath,
        label: routeConfig.label,
        isLast: pathSegments.length === 1,
      });
    }
    
    // Handle dynamic routes like /students/:id
    if (pathSegments.length > 1) {
      const dynamicSegment = pathSegments[1];
      
      // Student profile page
      if (pathSegments[0] === "students" && dynamicSegment) {
        breadcrumbItems.push({
          path: location.pathname,
          label: "Perfil del Estudiante",
          isLast: true,
        });
        // Update previous item to not be last
        if (breadcrumbItems.length > 1) {
          breadcrumbItems[breadcrumbItems.length - 2].isLast = false;
        }
      }
    }
  } else {
    // Home page
    breadcrumbItems.push({ path: "/", label: "Dashboard", isLast: true });
  }

  // Don't show breadcrumbs on dashboard
  if (location.pathname === "/") {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={item.path}>
            {index > 0 && <BreadcrumbSeparator />}
            {item.isLast ? (
              <BreadcrumbPage className="flex items-center gap-1.5">
                {index === 0 && <Home className="w-3.5 h-3.5" />}
                {item.label}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link to={item.path} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  {index === 0 && <Home className="w-3.5 h-3.5" />}
                  {item.label}
                </Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
