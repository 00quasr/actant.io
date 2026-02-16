import { useState, useEffect } from "react";
import { isAuthenticated } from "../../lib/auth.js";

export function useAuthStatus() {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  const refresh = () => {
    setAuthenticated(isAuthenticated());
  };

  useEffect(() => {
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  return { authenticated, refresh };
}
