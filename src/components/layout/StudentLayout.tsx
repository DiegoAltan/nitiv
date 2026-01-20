import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Settings, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface StudentLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const roleLabels: Record<string, string> = {
  estudiante: "Estudiante",
};

export function StudentLayout({ children, title, subtitle }: StudentLayoutProps) {
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header for students without sidebar */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-extrabold text-xl text-gradient-hero">
              Nitiv
            </h1>
          </div>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Settings icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => navigate("/settings")}
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Configuración</TooltipContent>
          </Tooltip>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 rounded-xl hover:bg-muted/50 px-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {profile?.full_name?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "U"}
                    </span>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{profile?.full_name || "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">Estudiante</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
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
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-6 max-w-7xl mx-auto"
      >
        {children}
      </motion.main>
    </div>
  );
}
