import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BarChart3,
  Bell,
  Settings,
  Heart,
  Brain,
  FileText,
  CalendarDays,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Shuffle,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mi Bienestar", href: "/wellbeing", icon: Heart, roles: ["estudiante"] },
  { name: "Evaluación", href: "/teacher-assessment", icon: ClipboardCheck, roles: ["docente", "moderador"] },
  { name: "Estudiantes", href: "/students", icon: Users, roles: ["docente", "psicologo", "trabajador_social", "inspector_general", "orientador", "moderador"] },
  { name: "Fichas", href: "/fichas", icon: FileText, roles: ["psicologo", "trabajador_social", "administrador", "docente", "inspector_general", "orientador", "moderador"] },
  { name: "Actividades", href: "/activities", icon: CalendarDays },
  { name: "Clima", href: "/classroom-climate", icon: Cloud, roles: ["docente", "psicologo", "trabajador_social", "administrador", "inspector_general", "orientador", "moderador"] },
  { name: "Reportes", href: "/reports", icon: BarChart3, roles: ["administrador", "psicologo", "trabajador_social", "inspector_general", "moderador"] },
  { name: "Alertas", href: "/alerts", icon: Bell, roles: ["psicologo", "trabajador_social", "inspector_general", "orientador", "moderador"] },
];

const roleLabels: Record<AppRole, string> = {
  estudiante: "Estudiante",
  docente: "Docente",
  psicologo: "Psicólogo",
  trabajador_social: "Trabajador Social",
  administrador: "Administrador",
  inspector_general: "Inspector General",
  orientador: "Orientador",
  moderador: "Moderador",
};

const roleColors: Record<AppRole, string> = {
  estudiante: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  docente: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  psicologo: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  trabajador_social: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  administrador: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  inspector_general: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  orientador: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  moderador: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300",
};

const allRoles: AppRole[] = [
  "estudiante",
  "docente",
  "psicologo",
  "trabajador_social",
  "administrador",
  "inspector_general",
  "orientador",
  "moderador",
];

export function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, activeRole, signOut, switchRole, isStudent } = useAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true;
    if (!activeRole) return false;
    return item.roles.includes(activeRole);
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleRoleSwitch = (role: AppRole) => {
    console.log("TopNavigation: switching to role:", role);
    switchRole(role);
    toast({
      title: "Rol cambiado",
      description: `Ahora estás viendo como ${roleLabels[role]}`,
    });
    // Use window.location to force a full navigation refresh
    window.location.href = "/";
  };

  const NavItems = ({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) => (
    <>
      {filteredNavigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              mobile ? "w-full" : "",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
            {item.name === "Alertas" && (
              <span className="ml-auto bg-destructive/20 text-destructive text-xs font-bold px-1.5 py-0.5 rounded-full">
                3
              </span>
            )}
          </NavLink>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-gradient-hero hidden sm:block">
            Nitiv
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center gap-1 flex-1">
            <NavItems />
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Role Switcher - Always visible for testing */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Cambiar rol</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-xs text-muted-foreground mb-1">
                  Probar como otro perfil
                </p>
              </div>
              <DropdownMenuSeparator />
              {allRoles.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={cn(
                    "cursor-pointer",
                    role === activeRole && "bg-primary/10"
                  )}
                >
                  <Badge className={cn("mr-2", roleColors[role])}>
                    {roleLabels[role]}
                  </Badge>
                  {role === activeRole && (
                    <span className="ml-auto text-xs text-muted-foreground">Actual</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Role Badge */}
          {activeRole && (
            <Badge className={cn("hidden md:flex", roleColors[activeRole])}>
              {roleLabels[activeRole]}
            </Badge>
          )}

          {/* Notifications (Students only) */}
          {isStudent && <NotificationsDropdown />}

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="w-4 h-4 mr-2" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{profile?.full_name}</p>
                        {activeRole && (
                          <Badge className={cn("text-xs mt-1", roleColors[activeRole])}>
                            {roleLabels[activeRole]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Role Switcher */}
                  <div className="p-4 border-b border-border">
                    <p className="text-xs text-muted-foreground mb-2">Cambiar perfil para probar:</p>
                    <div className="flex flex-wrap gap-1">
                      {allRoles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === activeRole ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer text-xs",
                            role === activeRole && roleColors[role]
                          )}
                          onClick={() => {
                            handleRoleSwitch(role);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {roleLabels[role]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItems mobile onItemClick={() => setMobileMenuOpen(false)} />
                  </nav>
                  
                  <div className="p-4 border-t border-border space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/settings");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}