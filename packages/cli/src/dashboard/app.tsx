import React, { useCallback } from "react";
import { render, Box, useApp, useStdout } from "ink";
import { Header } from "./components/header.js";
import { Menu } from "./components/menu.js";
import { Footer } from "./components/footer.js";
import { useNavigation } from "./hooks/use-navigation.js";
import { useAuthStatus } from "./hooks/use-auth-status.js";
import { AnalyzeScreen } from "./screens/analyze-screen.js";
import { DocsScreen } from "./screens/docs-screen.js";
import { InitScreen } from "./screens/init-screen.js";
import { PushScreen } from "./screens/push-screen.js";
import { ListScreen } from "./screens/list-screen.js";
import { LoginScreen } from "./screens/login-screen.js";
import type { ScreenId } from "./constants.js";

function Dashboard() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const { screen, navigate, goBack } = useNavigation();
  const { authenticated, refresh: refreshAuth } = useAuthStatus();

  const compact = (stdout?.columns ?? 80) < 60;

  const handleQuit = useCallback(() => {
    exit();
  }, [exit]);

  const handleSelect = useCallback(
    (target: ScreenId) => {
      navigate(target);
    },
    [navigate]
  );

  if (screen === "analyze") {
    return <AnalyzeScreen onBack={goBack} />;
  }
  if (screen === "docs") {
    return <DocsScreen onBack={goBack} />;
  }
  if (screen === "init") {
    return <InitScreen onBack={goBack} />;
  }
  if (screen === "push") {
    return <PushScreen onBack={goBack} />;
  }
  if (screen === "list") {
    return <ListScreen onBack={goBack} />;
  }
  if (screen === "login") {
    return <LoginScreen onBack={goBack} onAuthChange={refreshAuth} />;
  }

  return (
    <Box flexDirection="column">
      <Header authenticated={authenticated} compact={compact} />
      <Menu
        onSelect={handleSelect}
        onQuit={handleQuit}
        authenticated={authenticated}
      />
      <Footer />
    </Box>
  );
}

export async function launchDashboard(): Promise<void> {
  if (!process.stdin.isTTY) {
    console.error("Dashboard requires an interactive terminal. Use subcommands (e.g. `actant analyze`) for non-interactive use.");
    process.exit(1);
  }
  const instance = render(<Dashboard />);
  await instance.waitUntilExit();
}
