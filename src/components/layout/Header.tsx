import { Bell, Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const roleLabels: Record<string, string> = {
  administrador: "Administrador",
  psicologo: "Psicólogo/a",
  trabajador_social: "Trabajador/a Social",
  docente: "Docente",
  estudiante: "Estudiante",
};

export function Header({ title, subtitle }: HeaderProps) {
  const { profile, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const primaryRole = roles[0];
  const roleLabel = primaryRole ? roleLabels[primaryRole] : "Usuario";

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar estudiante..."
            className="w-64 pl-10 bg-background/50 rounded-xl border-border/50"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-alert rounded-full animate-pulse" />
        </Button>

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
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                <div className="flex gap-1 mt-1">
                  {roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {roleLabels[role]}
                    </Badge>
                  ))}
                </div>
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
  );
}