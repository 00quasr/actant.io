import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { MENU_ITEMS } from "../constants.js";
import type { ScreenId } from "../constants.js";

interface MenuProps {
  onSelect: (screen: ScreenId) => void;
  onQuit: () => void;
  authenticated: boolean;
}

export function Menu({ onSelect, onQuit, authenticated }: MenuProps) {
  const [cursor, setCursor] = useState(0);

  const visibleItems = authenticated
    ? MENU_ITEMS.filter((item) => item.id !== "login")
    : MENU_ITEMS;

  useInput((input, key) => {
    if (input === "q") {
      onQuit();
      return;
    }
    if (input === "k" || key.upArrow) {
      setCursor((prev) => (prev > 0 ? prev - 1 : visibleItems.length - 1));
      return;
    }
    if (input === "j" || key.downArrow) {
      setCursor((prev) => (prev < visibleItems.length - 1 ? prev + 1 : 0));
      return;
    }
    if (key.return) {
      const item = visibleItems[cursor];
      if (item) {
        onSelect(item.id as ScreenId);
      }
    }
  });

  return (
    <Box flexDirection="column" paddingTop={1} paddingBottom={1}>
      {visibleItems.map((item, index) => {
        const isSelected = index === cursor;
        return (
          <React.Fragment key={item.id}>
            {item.separator && <Box marginTop={1} />}
            <Box>
              <Text color={isSelected ? "cyan" : undefined}>{isSelected ? " > " : "   "}</Text>
              <Text bold={isSelected} color={isSelected ? "cyan" : undefined}>
                {item.label.padEnd(20)}
              </Text>
              <Text dimColor>{item.description}</Text>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
}
