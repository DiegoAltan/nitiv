import { motion, AnimatePresence } from "framer-motion";
import { AvatarCharacter, AvatarEmotion } from "@/contexts/GuideContext";

interface AvatarDisplayProps {
  character: AvatarCharacter;
  emotion: AvatarEmotion;
  size?: number;
  onClick?: () => void;
}

const breathingVariants = {
  neutral: {
    scale: [1, 1.04, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    y: [0, -4, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
  thinking: {
    rotate: [0, 2, -2, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  alert: {
    scale: [1, 1.06, 1],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
};

function VigaAvatar({ emotion, size }: { emotion: AvatarEmotion; size: number }) {
  const eyeVariants: Record<AvatarEmotion, { leftY: number; rightY: number; browAngle: number }> = {
    happy: { leftY: -2, rightY: -2, browAngle: -5 },
    thinking: { leftY: 0, rightY: 2, browAngle: 10 },
    alert: { leftY: -3, rightY: -3, browAngle: -15 },
    neutral: { leftY: 0, rightY: 0, browAngle: 0 },
  };

  const mouthPaths: Record<AvatarEmotion, string> = {
    happy: "M 35 62 Q 50 72 65 62",
    thinking: "M 38 65 Q 50 62 62 65",
    alert: "M 40 64 Q 50 58 60 64",
    neutral: "M 38 64 L 62 64",
  };

  const glowColors: Record<AvatarEmotion, string> = {
    happy: "hsl(45, 93%, 58%)",
    thinking: "hsl(243, 75%, 59%)",
    alert: "hsl(0, 72%, 63%)",
    neutral: "hsl(220, 14%, 80%)",
  };

  const ev = eyeVariants[emotion];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Glow ring */}
      <motion.rect
        x="12" y="9" width="76" height="78" rx="20"
        stroke={glowColors[emotion]}
        strokeWidth="1.5"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Head */}
      <rect x="15" y="12" width="70" height="72" rx="18" fill="hsl(243, 75%, 59%)" />
      <motion.rect
        x="18" y="15" width="64" height="66" rx="15"
        fill="hsl(243, 60%, 96%)"
        animate={{ fill: emotion === "alert" ? ["hsl(243, 60%, 96%)", "hsl(0, 70%, 96%)", "hsl(243, 60%, 96%)"] : "hsl(243, 60%, 96%)" }}
        transition={{ duration: 1.5, repeat: emotion === "alert" ? Infinity : 0 }}
      />
      {/* Hair */}
      <rect x="15" y="8" width="70" height="18" rx="6" fill="hsl(222, 47%, 25%)" />
      {/* Eyes */}
      <motion.g animate={{ y: ev.leftY }} transition={{ duration: 0.4, type: "spring" }}>
        <rect x="30" y="38" width="12" height="10" rx="3" fill="hsl(222, 47%, 11%)" />
        {/* Eye glint */}
        <motion.rect x="34" y="39" width="3" height="3" rx="1" fill="white"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }} />
      </motion.g>
      <motion.g animate={{ y: ev.rightY }} transition={{ duration: 0.4, type: "spring" }}>
        <rect x="58" y="38" width="12" height="10" rx="3" fill="hsl(222, 47%, 11%)" />
        <motion.rect x="62" y="39" width="3" height="3" rx="1" fill="white"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }} />
      </motion.g>
      {/* Eyebrows */}
      <motion.line x1="28" y1="33" x2="44" y2="33" stroke="hsl(222, 47%, 25%)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ rotate: ev.browAngle }} transition={{ duration: 0.4, type: "spring" }}
        style={{ transformOrigin: "36px 33px" }} />
      <motion.line x1="56" y1="33" x2="72" y2="33" stroke="hsl(222, 47%, 25%)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ rotate: -ev.browAngle }} transition={{ duration: 0.4, type: "spring" }}
        style={{ transformOrigin: "64px 33px" }} />
      {/* Mouth */}
      <AnimatePresence mode="wait">
        <motion.path
          key={emotion}
          d={mouthPaths[emotion]}
          stroke="hsl(222, 47%, 25%)" strokeWidth="2.5" strokeLinecap="round" fill="none"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>
      {/* Glasses */}
      <rect x="26" y="34" width="20" height="16" rx="4" stroke="hsl(222, 47%, 30%)" strokeWidth="1.5" fill="none" />
      <rect x="54" y="34" width="20" height="16" rx="4" stroke="hsl(222, 47%, 30%)" strokeWidth="1.5" fill="none" />
      <line x1="46" y1="42" x2="54" y2="42" stroke="hsl(222, 47%, 30%)" strokeWidth="1.5" />
    </svg>
  );
}

function NitiAvatar({ emotion, size }: { emotion: AvatarEmotion; size: number }) {
  const eyeSize: Record<AvatarEmotion, number> = {
    happy: 4,
    thinking: 5,
    alert: 6,
    neutral: 5,
  };

  const mouthPaths: Record<AvatarEmotion, string> = {
    happy: "M 35 60 Q 50 72 65 60",
    thinking: "M 42 64 Q 50 60 58 64",
    alert: "M 42 62 Q 50 68 58 62",
    neutral: "M 40 63 Q 50 67 60 63",
  };

  const blushOpacity = emotion === "happy" ? 0.5 : emotion === "alert" ? 0.3 : 0;

  const glowColors: Record<AvatarEmotion, string> = {
    happy: "hsl(45, 93%, 58%)",
    thinking: "hsl(152, 55%, 50%)",
    alert: "hsl(0, 72%, 63%)",
    neutral: "hsl(152, 40%, 75%)",
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Glow ring */}
      <motion.circle
        cx="50" cy="48" r="40"
        stroke={glowColors[emotion]}
        strokeWidth="1.5"
        fill="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Head */}
      <circle cx="50" cy="48" r="38" fill="hsl(152, 55%, 50%)" />
      <circle cx="50" cy="48" r="35" fill="hsl(152, 60%, 95%)" />
      {/* Hair */}
      <ellipse cx="50" cy="22" rx="34" ry="16" fill="hsl(38, 60%, 45%)" />
      <ellipse cx="28" cy="30" rx="10" ry="12" fill="hsl(38, 60%, 45%)" />
      <ellipse cx="72" cy="30" rx="10" ry="12" fill="hsl(38, 60%, 45%)" />
      {/* Eyes */}
      <motion.circle cx="38" cy="44" fill="hsl(222, 47%, 11%)"
        animate={{ r: eyeSize[emotion] }}
        transition={{ duration: 0.4, type: "spring" }} />
      <motion.circle cx="62" cy="44" fill="hsl(222, 47%, 11%)"
        animate={{ r: eyeSize[emotion] }}
        transition={{ duration: 0.4, type: "spring" }} />
      {/* Eye sparkles */}
      <motion.circle cx="36" cy="42" r="1.5" fill="white"
        animate={{ opacity: [0.7, 1, 0.7], y: [0, -0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="60" cy="42" r="1.5" fill="white"
        animate={{ opacity: [0.7, 1, 0.7], y: [0, -0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
      {/* Blush */}
      <motion.ellipse cx="30" cy="52" rx="6" ry="3" fill="hsl(0, 70%, 80%)"
        animate={{ opacity: blushOpacity }} transition={{ duration: 0.5 }} />
      <motion.ellipse cx="70" cy="52" rx="6" ry="3" fill="hsl(0, 70%, 80%)"
        animate={{ opacity: blushOpacity }} transition={{ duration: 0.5 }} />
      {/* Mouth */}
      <AnimatePresence mode="wait">
        <motion.path
          key={emotion}
          d={mouthPaths[emotion]}
          stroke="hsl(222, 47%, 30%)" strokeWidth="2" strokeLinecap="round" fill="none"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>
      {/* Heart accessory - pulses */}
      <motion.path
        d="M 73 28 C 73 25 77 25 77 28 C 77 25 81 25 81 28 C 81 32 77 35 77 35 C 77 35 73 32 73 28 Z"
        fill="hsl(0, 72%, 63%)"
        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "77px 30px" }}
      />
    </svg>
  );
}

export function AvatarDisplay({ character, emotion, size = 56, onClick }: AvatarDisplayProps) {
  return (
    <motion.div
      className="cursor-pointer select-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={breathingVariants[emotion]}
      onClick={onClick}
    >
      {character === "vigo" ? (
        <VigaAvatar emotion={emotion} size={size} />
      ) : (
        <NitiAvatar emotion={emotion} size={size} />
      )}
    </motion.div>
  );
}
