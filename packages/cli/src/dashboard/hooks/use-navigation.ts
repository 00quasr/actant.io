import { useState, useCallback } from "react";
import type { ScreenId } from "../constants.js";

export function useNavigation() {
  const [screen, setScreen] = useState<ScreenId>("menu");

  const navigate = useCallback((target: ScreenId) => {
    setScreen(target);
  }, []);

  const goBack = useCallback(() => {
    setScreen("menu");
  }, []);

  return { screen, navigate, goBack };
}
