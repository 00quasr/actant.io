import React from "react";
import { Box, Text } from "ink";
import { ASCII_LOGO, TAGLINE } from "../constants.js";

interface HeaderProps {
  authenticated: boolean;
  compact: boolean;
}

export function Header({ authenticated, compact }: HeaderProps) {
  if (compact) {
    return (
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold>ACTANT</Text>
        <Text dimColor>{authenticated ? "authenticated" : "not logged in"}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold>{ASCII_LOGO}</Text>
        <Text dimColor>{authenticated ? "authenticated" : "not logged in"}</Text>
      </Box>
      <Text dimColor>{TAGLINE}</Text>
    </Box>
  );
}
