import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BarChart3,
  Bell,
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight,
  Brain,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  // Student only
  { name: "Mi Bienestar", href: "/wellbeing", icon: Heart, roles: ["estudiante"] },
  // Teacher, Dupla, Admin
  { name: "Evaluación Docente", href: "/teacher-assessment", icon: ClipboardCheck, roles: ["docente"] },
  { name: "Estudiantes", href: "/students", icon: Users, roles: ["docente", "psicologo", "trabajador_social"] },
  // Dupla, Admin, Teachers with shared access
  { name: "Fichas/Registros", href: "/fichas", icon: FileText, roles: ["psicologo", "trabajador_social", "administrador", "docente"] },
  // Dupla and Admin
  { name: "Reportes", href: "/reports", icon: BarChart3, roles: ["administrador", "psicologo", "trabajador_social"] },
  { name: "Alertas", href: "/alerts", icon: Bell, roles: ["psicologo", "trabajador_social"] },
];

const bottomNavigation = [
  { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { roles } = useAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => roles.includes(role as any));
  });

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="font-display font-extrabold text-xl text-gradient-hero">
                Nitiv
              </h1>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-hero text-white shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
              {isActive && item.name === "Alertas" && (
                <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
              location.pathname === item.href
                ? "bg-gradient-hero text-white shadow-md"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
}