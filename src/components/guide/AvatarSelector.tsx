import { motion } from "framer-motion";
import { useGuide, AvatarCharacter } from "@/contexts/GuideContext";
import { AvatarDisplay } from "./AvatarDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const avatars: { id: AvatarCharacter; name: string; desc: string; personality: string }[] = [
  {
    id: "vigo",
    name: "Vigo",
    desc: "Directo y pragmático",
    personality: "Tono ejecutivo, breve y orientado a la acción. Ideal si prefieres información clara y concisa.",
  },
  {
    id: "niti",
    name: "Niti",
    desc: "Empático y cercano",
    personality: "Tono suave, con lenguaje de apoyo y validación emocional. Ideal si prefieres un acompañamiento cálido.",
  },
];

interface AvatarSelectorProps {
  onSelect?: () => void;
  compact?: boolean;
}

export function AvatarSelector({ onSelect, compact }: AvatarSelectorProps) {
  const { character, setCharacter, setHasChosenAvatar } = useGuide();

  const handleSelect = (id: AvatarCharacter) => {
    setCharacter(id);
    setHasChosenAvatar(true);
    onSelect?.();
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {avatars.map((av) => (
          <button
            key={av.id}
            onClick={() => handleSelect(av.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              character === av.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <AvatarDisplay character={av.id} emotion="happy" size={48} />
            <span className="font-semibold text-sm">{av.name}</span>
            <span className="text-xs text-muted-foreground text-center">{av.desc}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {avatars.map((av) => (
        <motion.button
          key={av.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelect(av.id)}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all text-center",
            character === av.id
              ? "border-primary bg-primary/5 shadow-md"
              : "border-border hover:border-primary/40 bg-card"
          )}
        >
          <AvatarDisplay character={av.id} emotion="happy" size={80} />
          <div>
            <h3 className="text-lg font-bold text-foreground">{av.name}</h3>
            <p className="text-sm font-medium text-primary">{av.desc}</p>
          </div>
          <p className="text-xs text-muted-foreground">{av.personality}</p>
          {character === av.id && (
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              Seleccionado
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}
