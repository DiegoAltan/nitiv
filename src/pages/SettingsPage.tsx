import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Moon,
  Sun,
  Monitor,
  Mail,
  Shield,
  LogOut,
  Save,
  Palette,
  UserCog,
  Home,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "dark" | "system";

const themeOptions: { value: ThemeOption; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

const allRoles: { value: AppRole; label: string; description: string; colorClass: string }[] = [
  { value: "estudiante", label: "Estudiante", description: "Registro de bienestar personal", colorClass: "bg-[hsl(var(--role-estudiante))]" },
  { value: "docente", label: "Docente", description: "Evaluación de estudiantes", colorClass: "bg-[hsl(var(--role-docente))]" },
  { value: "psicologo", label: "Psicólogo/a", description: "Dupla psicosocial", colorClass: "bg-[hsl(var(--role-psicologo))]" },
  { value: "trabajador_social", label: "Trabajador/a Social", description: "Dupla psicosocial", colorClass: "bg-[hsl(var(--role-trabajador-social))]" },
  { value: "administrador", label: "Administrador", description: "Gestión completa", colorClass: "bg-[hsl(var(--role-administrador))]" },
];

const roleBorderColors: Record<string, string> = {
  estudiante: "border-[hsl(var(--role-estudiante))]",
  docente: "border-[hsl(var(--role-docente))]",
  psicologo: "border-[hsl(var(--role-psicologo))]",
  trabajador_social: "border-[hsl(var(--role-trabajador-social))]",
  administrador: "border-[hsl(var(--role-administrador))]",
};

export default function SettingsPage() {
  const { profile, signOut, roles, activeRole, switchRole, canSwitchRole, isStudent } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentRole = activeRole || roles[0];

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setEmail(profile.email || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast({
      title: "Perfil actualizado",
      description: "Los cambios han sido guardados correctamente",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSwitchRole = (role: AppRole) => {
    switchRole(role);
    toast({
      title: "Perfil cambiado",
      description: `Ahora estás viendo como: ${allRoles.find(r => r.value === role)?.label}`,
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      administrador: "Administrador",
      psicologo: "Psicólogo/a",
      trabajador_social: "Trabajador/a Social",
      docente: "Docente",
      estudiante: "Estudiante",
    };
    return labels[role] || role;
  };

  return (
    <AppLayout title="Configuración" subtitle="Ajustes de tu cuenta y preferencias">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Dashboard Button for Students */}
        {isStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="card-elevated bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Mi Bienestar</p>
                      <p className="text-sm text-muted-foreground">Volver al registro de bienestar</p>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/")} className="gap-2">
                    <Home className="w-4 h-4" />
                    Ir al Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <User className="w-5 h-5 text-primary" />
                Perfil
              </CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xl font-bold">
                  {fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="font-semibold text-lg">{fullName}</p>
                  <div className="flex gap-2 mt-1">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {getRoleLabel(role)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Switcher Section (Dev Mode) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-elevated border-2 border-dashed border-warning/50 bg-warning-light/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <UserCog className="w-5 h-5 text-warning" />
                Cambiar Perfil (Modo Desarrollo)
              </CardTitle>
              <CardDescription>
                Prueba la aplicación con diferentes roles de usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canSwitchRole ? (
                <p className="text-sm text-muted-foreground">
                  El cambio de perfil está disponible solo durante el desarrollo.
                </p>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allRoles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleSwitchRole(role.value)}
                    className={cn(
                      "flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden",
                      currentRole === role.value
                        ? `${roleBorderColors[role.value]} bg-card shadow-md`
                        : "border-border hover:border-muted-foreground/30 bg-card"
                    )}
                  >
                    {/* Color indicator */}
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", role.colorClass)} />
                      <span
                        className={cn(
                          "font-semibold",
                          currentRole === role.value ? "text-foreground" : "text-foreground"
                        )}
                      >
                        {role.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                    {currentRole === role.value && (
                      <div className={cn(
                        "absolute top-0 right-0 px-2 py-0.5 text-xs font-medium text-white rounded-bl-lg",
                        role.colorClass
                      )}>
                        Activo
                      </div>
                    )}
                  </button>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Palette className="w-5 h-5 text-primary" />
                Apariencia
              </CardTitle>
              <CardDescription>Personaliza la interfaz de la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Tema de la aplicación</Label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        theme === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <option.icon
                        className={cn(
                          "w-6 h-6",
                          theme === option.value ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          theme === option.value ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Bell className="w-5 h-5 text-primary" />
                Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo deseas recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones en el navegador
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Notificaciones por email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe alertas importantes en tu correo
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Resumen semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe un resumen cada lunes con el estado del bienestar
                  </p>
                </div>
                <Switch
                  checked={weeklySummary}
                  onCheckedChange={setWeeklySummary}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <Shield className="w-5 h-5 text-primary" />
                Seguridad
              </CardTitle>
              <CardDescription>Opciones de seguridad de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="w-4 h-4" />
                Cambiar contraseña
              </Button>

              <Separator />

              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
