import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const roles: { value: AppRole; label: string; description: string; icon: string }[] = [
  { value: "estudiante", label: "Estudiante", description: "Registro de bienestar personal", icon: "🎓" },
  { value: "docente", label: "Docente", description: "Evaluación de estudiantes", icon: "📚" },
  { value: "psicologo", label: "Psicólogo/a", description: "Seguimiento psicosocial", icon: "🧠" },
  { value: "trabajador_social", label: "Trabajador/a Social", description: "Seguimiento psicosocial", icon: "🤝" },
  { value: "inspector_general", label: "Inspector General", description: "Convivencia escolar", icon: "🏫" },
  { value: "orientador", label: "Orientador/a", description: "Orientación estudiantil", icon: "🧭" },
  { value: "administrador", label: "Administrador", description: "Gestión del sistema", icon: "⚙️" },
  { value: "moderador", label: "Moderador", description: "Acceso total (dueño)", icon: "👑" },
];

export default function AuthPage() {
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleEnter = async () => {
    if (!fullName.trim()) {
      toast({ title: "Ingresa tu nombre", variant: "destructive" });
      return;
    }
    if (!selectedRole) {
      toast({ title: "Selecciona tu profesión", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Generate deterministic credentials from name+role
    const slug = fullName.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");
    const email = `${slug}.${selectedRole}@nitiv-test.com`;
    const password = "nitiv-test-2024";

    try {
      // Try sign in first
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        // If login fails, create account
        const { error: signUpError } = await signUp(email, password, fullName.trim(), selectedRole);
        if (signUpError) {
          toast({
            title: "Error",
            description: signUpError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }
      toast({
        title: "¡Bienvenido/a!",
        description: `Entrando como ${roles.find(r => r.value === selectedRole)?.label}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al ingresar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern-auth">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pattern-auth p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-hero flex items-center justify-center shadow-elevated relative"
          >
            <Brain className="w-10 h-10 text-white" />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-warning" />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-display font-extrabold text-gradient-hero"
          >
            Nitiv
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mt-2"
          >
            Bienestar estudiantil inteligente
          </motion.p>
        </div>

        <Card className="card-glass border-0 shadow-elevated backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-display">Ingresa a la plataforma</CardTitle>
            <CardDescription>Escribe tu nombre y selecciona tu profesión</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name input */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && selectedRole && handleEnter()}
                  className="pl-10 rounded-xl bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Role grid */}
            <div className="space-y-2">
              <Label>Profesión</Label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <motion.button
                    key={role.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                      selectedRole === role.value
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border/50 bg-background/30 hover:border-border hover:bg-background/50"
                    )}
                  >
                    <span className="text-xl mt-0.5">{role.icon}</span>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        selectedRole === role.value ? "text-primary" : "text-foreground"
                      )}>
                        {role.label}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{role.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Enter button */}
            <Button
              onClick={handleEnter}
              disabled={loading || !fullName.trim() || !selectedRole}
              className="w-full bg-gradient-hero hover:opacity-90 rounded-xl h-12 text-base font-semibold shadow-lg"
              size="lg"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Modo de prueba — se creará una cuenta temporal automáticamente
            </p>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Plataforma de bienestar estudiantil
        </motion.p>
      </motion.div>
    </div>
  );
}
