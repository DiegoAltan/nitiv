import { motion, AnimatePresence } from "framer-motion";
import { useGuide } from "@/contexts/GuideContext";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarSelector } from "./AvatarSelector";

export function AvatarOnboarding() {
  const { hasChosenAvatar, enabled } = useGuide();
  const { profile } = useAuth();

  if (hasChosenAvatar || !enabled || !profile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-display text-foreground">
              ¡Elige tu Guía Nitiv!
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Tu compañero te acompañará en toda la plataforma con consejos y recordatorios personalizados.
            </p>
          </div>
          <AvatarSelector />
          <p className="text-xs text-muted-foreground text-center mt-4">
            Puedes cambiar tu guía en cualquier momento desde Configuración.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
