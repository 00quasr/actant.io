import React from "react";
import { Box, Text } from "ink";
import { VERSION } from "../constants.js";

export function Footer() {
  return (
    <Box flexDirection="row" justifyContent="space-between">
      <Text dimColor>v{VERSION} · actant.io</Text>
      <Text dimColor>↑↓ navigate  ↵ select  q quit</Text>
    </Box>
  );
}
