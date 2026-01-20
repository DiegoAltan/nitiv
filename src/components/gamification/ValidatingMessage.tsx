import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useStudentProgress } from "@/hooks/useStudentProgress";

interface ValidatingMessageProps {
  showAfterSubmit?: boolean;
}

export function ValidatingMessage({ showAfterSubmit = false }: ValidatingMessageProps) {
  const { getValidatingMessage } = useStudentProgress();
  
  const message = getValidatingMessage();

  if (!showAfterSubmit) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20"
    >
      <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <p className="text-sm text-foreground/80">{message}</p>
    </motion.div>
  );
}
