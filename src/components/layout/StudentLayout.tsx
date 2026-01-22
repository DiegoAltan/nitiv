import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Settings, Brain, CalendarDays, Heart, LayoutDashboard } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StudentLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const studentNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mi Bienestar", href: "/wellbeing", icon: Heart },
  { name: "Actividades", href: "/activities", icon: CalendarDays },
];

export function StudentLayout({ children, title, subtitle }: StudentLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header for students */}
      <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo - Clickable to go to Dashboard */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-sm">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gradient-hero hidden sm:block">
              Nitiv
            </span>
          </NavLink>
          
          {/* Desktop Navigation for Students */}
          {!isMobile && (
            <nav className="flex items-center gap-1 ml-4">
              {studentNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Settings icon */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-hero flex items-center justify-center shadow-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-white">
                      {profile?.full_name?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "U"}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{profile?.full_name || "Usuario"}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <Badge variant="secondary" className="text-xs w-fit mt-1">
                    Estudiante
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Mi perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </motion.div>
          
          {children}
        </div>
      </main>
      
      {/* Bottom nav for mobile students */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-pb">
          <div className="flex items-center justify-around h-16 px-2">
            {[...studentNavigation, { name: "Ajustes", href: "/settings", icon: Settings }].map((item) => {
              const isActive = location.pathname === item.href;
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
      )}
    </div>
  );
}
