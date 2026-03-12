import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BarChart3,
  Bell,
  Settings,
  Heart,
  FileText,
  CalendarDays,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Bienestar", href: "/wellbeing", icon: Heart, roles: ["estudiante"] },
  { name: "Actividades", href: "/activities", icon: CalendarDays },
  { name: "Evaluación", href: "/teacher-assessment", icon: ClipboardCheck, roles: ["docente", "moderador"] },
  { name: "Estudiantes", href: "/students", icon: Users, roles: ["docente", "psicologo", "trabajador_social", "inspector_general", "orientador", "moderador"] },
  { name: "Fichas", href: "/fichas", icon: FileText, roles: ["psicologo", "trabajador_social", "administrador", "docente", "inspector_general", "orientador", "moderador"] },
  { name: "Reportes", href: "/reports", icon: BarChart3, roles: ["administrador", "psicologo", "trabajador_social", "inspector_general", "moderador"] },
  { name: "Alertas", href: "/alerts", icon: Bell, roles: ["psicologo", "trabajador_social", "inspector_general", "orientador", "moderador"] },
  { name: "Ajustes", href: "/settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const { activeRole } = useAuth();
  const isMobile = useIsMobile();

  // Only show on mobile
  if (!isMobile) return null;

  // Filter navigation based on role
  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    if (!activeRole) return false;
    return item.roles.includes(activeRole);
  });

  // Limit to 5 items for mobile bottom nav (including settings)
  const maxItems = 5;
  const visibleItems = filteredNavigation.slice(0, maxItems - 1);
  const settingsItem = navigation.find(n => n.href === "/settings");
  
  // Always include settings at the end
  if (settingsItem && !visibleItems.find(v => v.href === "/settings")) {
    visibleItems.push(settingsItem);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/" && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium truncate max-w-[60px]",
                isActive && "text-primary font-semibold"
              )}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
