import { motion } from "framer-motion";
import { AvatarCharacter, AvatarEmotion } from "@/contexts/GuideContext";

interface AvatarDisplayProps {
  character: AvatarCharacter;
  emotion: AvatarEmotion;
  size?: number;
  onClick?: () => void;
}

// SVG-based 2D avatars with emotional expressions
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

  const ev = eyeVariants[emotion];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Head - square-ish for pragmatic personality */}
      <rect x="15" y="12" width="70" height="72" rx="18" fill="hsl(243, 75%, 59%)" />
      <rect x="18" y="15" width="64" height="66" rx="15" fill="hsl(243, 60%, 96%)" />
      
      {/* Hair - neat, sharp */}
      <rect x="15" y="8" width="70" height="18" rx="6" fill="hsl(222, 47%, 25%)" />
      
      {/* Eyes */}
      <motion.g animate={{ y: ev.leftY }} transition={{ duration: 0.3 }}>
        <rect x="30" y="38" width="12" height="10" rx="3" fill="hsl(222, 47%, 11%)" />
      </motion.g>
      <motion.g animate={{ y: ev.rightY }} transition={{ duration: 0.3 }}>
        <rect x="58" y="38" width="12" height="10" rx="3" fill="hsl(222, 47%, 11%)" />
      </motion.g>

      {/* Eyebrows */}
      <motion.line x1="28" y1="33" x2="44" y2="33" stroke="hsl(222, 47%, 25%)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ rotate: ev.browAngle }} style={{ transformOrigin: "36px 33px" }} />
      <motion.line x1="56" y1="33" x2="72" y2="33" stroke="hsl(222, 47%, 25%)" strokeWidth="2.5" strokeLinecap="round"
        animate={{ rotate: -ev.browAngle }} style={{ transformOrigin: "64px 33px" }} />

      {/* Mouth */}
      <motion.path d={mouthPaths[emotion]} stroke="hsl(222, 47%, 25%)" strokeWidth="2.5" strokeLinecap="round" fill="none"
        transition={{ duration: 0.3 }} />

      {/* Glasses - pragmatic look */}
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

  const blushOpacity = emotion === "happy" ? 0.5 : 0;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Head - round, soft */}
      <circle cx="50" cy="48" r="38" fill="hsl(152, 55%, 50%)" />
      <circle cx="50" cy="48" r="35" fill="hsl(152, 60%, 95%)" />

      {/* Hair - soft, flowing */}
      <ellipse cx="50" cy="22" rx="34" ry="16" fill="hsl(38, 60%, 45%)" />
      <ellipse cx="28" cy="30" rx="10" ry="12" fill="hsl(38, 60%, 45%)" />
      <ellipse cx="72" cy="30" rx="10" ry="12" fill="hsl(38, 60%, 45%)" />

      {/* Eyes - big, round, expressive */}
      <motion.circle cx="38" cy="44" fill="hsl(222, 47%, 11%)"
        animate={{ r: eyeSize[emotion] }} transition={{ duration: 0.3 }} />
      <motion.circle cx="62" cy="44" fill="hsl(222, 47%, 11%)"
        animate={{ r: eyeSize[emotion] }} transition={{ duration: 0.3 }} />

      {/* Eye sparkles */}
      <circle cx="36" cy="42" r="1.5" fill="white" />
      <circle cx="60" cy="42" r="1.5" fill="white" />

      {/* Blush */}
      <motion.ellipse cx="30" cy="52" rx="6" ry="3" fill="hsl(0, 70%, 80%)"
        animate={{ opacity: blushOpacity }} transition={{ duration: 0.4 }} />
      <motion.ellipse cx="70" cy="52" rx="6" ry="3" fill="hsl(0, 70%, 80%)"
        animate={{ opacity: blushOpacity }} transition={{ duration: 0.4 }} />

      {/* Mouth */}
      <motion.path d={mouthPaths[emotion]} stroke="hsl(222, 47%, 30%)" strokeWidth="2" strokeLinecap="round" fill="none"
        transition={{ duration: 0.3 }} />

      {/* Heart accessory */}
      <path d="M 73 28 C 73 25 77 25 77 28 C 77 25 81 25 81 28 C 81 32 77 35 77 35 C 77 35 73 32 73 28 Z"
        fill="hsl(0, 72%, 63%)" opacity="0.8" />
    </svg>
  );
}

export function AvatarDisplay({ character, emotion, size = 56, onClick }: AvatarDisplayProps) {
  return (
    <motion.div
      className="cursor-pointer select-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -3, 0] }}
      transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
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
