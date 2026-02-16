import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
import { saveAuth, isAuthenticated } from "../../lib/auth.js";
import { startBrowserAuthFlow } from "../../lib/auth-flow.js";

interface LoginScreenProps {
  onBack: () => void;
  onAuthChange: () => void;
}

export function LoginScreen({ onBack, onAuthChange }: LoginScreenProps) {
  const [status, setStatus] = useState<"checking" | "waiting" | "done" | "error">("checking");
  const [error, setError] = useState("");

  useInput((input, key) => {
    if (key.escape || (input === "q" && status !== "waiting")) {
      onBack();
    }
  });

  useEffect(() => {
    if (isAuthenticated()) {
      setStatus("done");
      return;
    }

    setStatus("waiting");
    startBrowserAuthFlow()
      .then((tokens) => {
        saveAuth(tokens);
        onAuthChange();
        setStatus("done");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Authentication failed");
        setStatus("error");
      });
  }, [onAuthChange]);

  if (status === "checking") {
    return (
      <Box flexDirection="column" padding={1}>
        <Spinner label="Checking auth status..." />
      </Box>
    );
  }

  if (status === "waiting") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Login</Text>
        <Box marginTop={1}>
          <Spinner label="Waiting for browser authentication..." />
        </Box>
        <Box marginTop={1}>
          <Text dimColor>A browser window should open. Complete login there.</Text>
        </Box>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green">Authenticated successfully.</Text>
      <Box marginTop={1}>
        <Text dimColor>Press ESC to go back</Text>
      </Box>
    </Box>
  );
}
