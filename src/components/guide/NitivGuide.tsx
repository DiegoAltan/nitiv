import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useGuide } from "@/contexts/GuideContext";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarDisplay } from "./AvatarDisplay";
import { useGuideMessages } from "./useGuideMessages";

export function NitivGuide() {
  const { enabled, character } = useGuide();
  const { profile } = useAuth();
  const { currentMessage, messages, dismiss } = useGuideMessages();
  const [expanded, setExpanded] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  if (!enabled || !profile) return null;

  const displayMessage = messages[messageIndex] || currentMessage;
  const charName = character === "vigo" ? "Vigo" : "Niti";

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 md:bottom-6">
      {/* Message bubble */}
      <AnimatePresence>
        {expanded && displayMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="max-w-[300px] rounded-2xl border border-border bg-card p-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-primary">{charName}</span>
              <button
                onClick={() => {
                  dismiss(displayMessage.id);
                  if (messages.length <= 1) setExpanded(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {displayMessage.text}
            </p>
            {messages.length > 1 && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                <button
                  onClick={() => setMessageIndex(i => Math.max(0, i - 1))}
                  disabled={messageIndex === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  {messageIndex + 1} / {messages.length}
                </span>
                <button
                  onClick={() => setMessageIndex(i => Math.min(messages.length - 1, i + 1))}
                  disabled={messageIndex >= messages.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar button */}
      <div className="relative">
        {/* Notification dot */}
        {!expanded && messages.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center z-10"
          >
            {messages.length}
          </motion.div>
        )}
        <div className="rounded-full bg-card shadow-lg border border-border p-1">
          <AvatarDisplay
            character={character}
            emotion={displayMessage?.emotion || "neutral"}
            size={52}
            onClick={() => setExpanded(!expanded)}
          />
        </div>
      </div>
    </div>
  );
}
