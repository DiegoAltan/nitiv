import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AvatarCharacter = "vigo" | "niti";
export type AvatarEmotion = "happy" | "thinking" | "alert" | "neutral";

interface GuideContextType {
  character: AvatarCharacter;
  setCharacter: (c: AvatarCharacter) => void;
  enabled: boolean;
  setEnabled: (e: boolean) => void;
  hasChosenAvatar: boolean;
  setHasChosenAvatar: (v: boolean) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

const GUIDE_CHAR_KEY = "nitiv_guide_character";
const GUIDE_ENABLED_KEY = "nitiv_guide_enabled";
const GUIDE_CHOSEN_KEY = "nitiv_guide_chosen";

export function GuideProvider({ children }: { children: ReactNode }) {
  const [character, setCharacterState] = useState<AvatarCharacter>(
    () => (localStorage.getItem(GUIDE_CHAR_KEY) as AvatarCharacter) || "niti"
  );
  const [enabled, setEnabledState] = useState(
    () => localStorage.getItem(GUIDE_ENABLED_KEY) !== "false"
  );
  const [hasChosenAvatar, setHasChosenAvatarState] = useState(
    () => localStorage.getItem(GUIDE_CHOSEN_KEY) === "true"
  );

  const setCharacter = (c: AvatarCharacter) => {
    setCharacterState(c);
    localStorage.setItem(GUIDE_CHAR_KEY, c);
  };

  const setEnabled = (e: boolean) => {
    setEnabledState(e);
    localStorage.setItem(GUIDE_ENABLED_KEY, String(e));
  };

  const setHasChosenAvatar = (v: boolean) => {
    setHasChosenAvatarState(v);
    localStorage.setItem(GUIDE_CHOSEN_KEY, String(v));
  };

  return (
    <GuideContext.Provider value={{ character, setCharacter, enabled, setEnabled, hasChosenAvatar, setHasChosenAvatar }}>
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error("useGuide must be used within GuideProvider");
  return ctx;
}
