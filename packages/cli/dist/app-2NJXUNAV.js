import {
  analyzeProject,
  exportConfig,
  generateDocs,
  getConfigs,
  getExistingFiles,
  isAuthenticated,
  parseFiles,
  pushConfig,
  saveAuth,
  scanForConfigs,
  startBrowserAuthFlow,
  writeExportFiles
} from "./chunk-HMLWCRDQ.js";

// src/dashboard/app.tsx
import { useCallback as useCallback5 } from "react";
import { render, Box as Box10, useApp, useStdout } from "ink";

// src/dashboard/components/header.tsx
import { Box, Text } from "ink";

// src/dashboard/constants.ts
var ASCII_LOGO = `    _   ___ _____ _   _  _ _____
   /_\\ / __|_   _/_\\ | \\| |_   _|
  / _ \\ (__  | |/ _ \\| .\` | | |
 /_/ \\_\\___| |_/_/ \\_\\_|\\_| |_|`;
var TAGLINE = "Configure AI coding agents";
var VERSION = "0.1.0";
var MENU_ITEMS = [
  {
    id: "analyze",
    label: "Analyze Project",
    description: "Scan project structure and tools",
    requiresAuth: false
  },
  {
    id: "docs",
    label: "Generate Docs",
    description: "Generate documentation with AI",
    requiresAuth: true
  },
  {
    id: "init",
    label: "Pull Config",
    description: "Pull a config from Actant",
    requiresAuth: true
  },
  {
    id: "push",
    label: "Push Config",
    description: "Push local config to Actant",
    requiresAuth: true
  },
  {
    id: "list",
    label: "My Configs",
    description: "List saved configurations",
    requiresAuth: true
  },
  {
    id: "login",
    label: "Login",
    description: "Authenticate with actant.io",
    requiresAuth: false,
    separator: true
  }
];

// src/dashboard/components/header.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function Header({ authenticated, compact }) {
  if (compact) {
    return /* @__PURE__ */ jsxs(Box, { flexDirection: "row", justifyContent: "space-between", children: [
      /* @__PURE__ */ jsx(Text, { bold: true, children: "ACTANT" }),
      /* @__PURE__ */ jsx(Text, { dimColor: true, children: authenticated ? "authenticated" : "not logged in" })
    ] });
  }
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    /* @__PURE__ */ jsxs(Box, { flexDirection: "row", justifyContent: "space-between", children: [
      /* @__PURE__ */ jsx(Text, { bold: true, children: ASCII_LOGO }),
      /* @__PURE__ */ jsx(Text, { dimColor: true, children: authenticated ? "authenticated" : "not logged in" })
    ] }),
    /* @__PURE__ */ jsx(Text, { dimColor: true, children: TAGLINE })
  ] });
}

// src/dashboard/components/menu.tsx
import React, { useState } from "react";
import { Box as Box2, Text as Text2, useInput } from "ink";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function Menu({ onSelect, onQuit, authenticated }) {
  const [cursor, setCursor] = useState(0);
  const visibleItems = authenticated ? MENU_ITEMS.filter((item) => item.id !== "login") : MENU_ITEMS;
  useInput((input, key) => {
    if (input === "q") {
      onQuit();
      return;
    }
    if (input === "k" || key.upArrow) {
      setCursor((prev) => prev > 0 ? prev - 1 : visibleItems.length - 1);
      return;
    }
    if (input === "j" || key.downArrow) {
      setCursor((prev) => prev < visibleItems.length - 1 ? prev + 1 : 0);
      return;
    }
    if (key.return) {
      const item = visibleItems[cursor];
      if (item) {
        onSelect(item.id);
      }
    }
  });
  return /* @__PURE__ */ jsx2(Box2, { flexDirection: "column", paddingTop: 1, paddingBottom: 1, children: visibleItems.map((item, index) => {
    const isSelected = index === cursor;
    return /* @__PURE__ */ jsxs2(React.Fragment, { children: [
      item.separator && /* @__PURE__ */ jsx2(Box2, { marginTop: 1 }),
      /* @__PURE__ */ jsxs2(Box2, { children: [
        /* @__PURE__ */ jsx2(Text2, { color: isSelected ? "cyan" : void 0, children: isSelected ? " > " : "   " }),
        /* @__PURE__ */ jsx2(Text2, { bold: isSelected, color: isSelected ? "cyan" : void 0, children: item.label.padEnd(20) }),
        /* @__PURE__ */ jsx2(Text2, { dimColor: true, children: item.description })
      ] })
    ] }, item.id);
  }) });
}

// src/dashboard/components/footer.tsx
import { Box as Box3, Text as Text3 } from "ink";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function Footer() {
  return /* @__PURE__ */ jsxs3(Box3, { flexDirection: "row", justifyContent: "space-between", children: [
    /* @__PURE__ */ jsxs3(Text3, { dimColor: true, children: [
      "v",
      VERSION,
      " \xB7 actant.io"
    ] }),
    /* @__PURE__ */ jsx3(Text3, { dimColor: true, children: "\u2191\u2193 navigate  \u21B5 select  q quit" })
  ] });
}

// src/dashboard/hooks/use-navigation.ts
import { useState as useState2, useCallback } from "react";
function useNavigation() {
  const [screen, setScreen] = useState2("menu");
  const navigate = useCallback((target) => {
    setScreen(target);
  }, []);
  const goBack = useCallback(() => {
    setScreen("menu");
  }, []);
  return { screen, navigate, goBack };
}

// src/dashboard/hooks/use-auth-status.ts
import { useState as useState3, useEffect } from "react";
function useAuthStatus() {
  const [authenticated, setAuthenticated] = useState3(() => isAuthenticated());
  const refresh = () => {
    setAuthenticated(isAuthenticated());
  };
  useEffect(() => {
    const interval = setInterval(refresh, 2e3);
    return () => clearInterval(interval);
  }, []);
  return { authenticated, refresh };
}

// src/dashboard/screens/analyze-screen.tsx
import { useState as useState4, useEffect as useEffect2 } from "react";
import { Box as Box4, Text as Text4, useInput as useInput2 } from "ink";
import { Spinner } from "@inkjs/ui";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function AnalyzeScreen({ onBack }) {
  const [status, setStatus] = useState4("loading");
  const [analysis, setAnalysis] = useState4(null);
  const [error, setError] = useState4("");
  useInput2((input, key) => {
    if (key.escape || input === "q") {
      onBack();
    }
  });
  useEffect2(() => {
    analyzeProject(process.cwd()).then((result) => {
      setAnalysis(result);
      setStatus("done");
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStatus("error");
    });
  }, []);
  if (status === "loading") {
    return /* @__PURE__ */ jsx4(Box4, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx4(Spinner, { label: "Analyzing project..." }) });
  }
  if (status === "error") {
    return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs4(Text4, { color: "red", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Press ESC to go back" })
    ] });
  }
  if (!analysis) return null;
  return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", padding: 1, children: [
    /* @__PURE__ */ jsx4(Text4, { bold: true, children: "Project Analysis" }),
    /* @__PURE__ */ jsxs4(Box4, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Name:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.name })
      ] }),
      analysis.framework && /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Framework:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.framework })
      ] }),
      analysis.language && /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Language:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.language })
      ] }),
      analysis.testFramework && /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Tests:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.testFramework })
      ] }),
      analysis.ciPlatform && /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "CI:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.ciPlatform })
      ] }),
      /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Docker:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.hasDocker ? "yes" : "no" })
      ] }),
      /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Files:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.fileTree.length })
      ] }),
      /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Key files:".padEnd(16) }),
        /* @__PURE__ */ jsx4(Text4, { children: analysis.keyFiles.length })
      ] })
    ] }),
    analysis.envVars.length > 0 && /* @__PURE__ */ jsxs4(Box4, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx4(Text4, { bold: true, dimColor: true, children: "Environment Variables" }),
      analysis.envVars.slice(0, 10).map((v, i) => /* @__PURE__ */ jsxs4(Text4, { dimColor: true, children: [
        "  ",
        v
      ] }, `${i}-${v}`)),
      analysis.envVars.length > 10 && /* @__PURE__ */ jsxs4(Text4, { dimColor: true, children: [
        "  ...and ",
        analysis.envVars.length - 10,
        " more"
      ] })
    ] }),
    analysis.packageScripts && /* @__PURE__ */ jsxs4(Box4, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsx4(Text4, { bold: true, dimColor: true, children: "Scripts" }),
      Object.entries(analysis.packageScripts).slice(0, 8).map(([name, cmd]) => /* @__PURE__ */ jsxs4(Text4, { children: [
        /* @__PURE__ */ jsxs4(Text4, { dimColor: true, children: [
          "  ",
          name.padEnd(16)
        ] }),
        /* @__PURE__ */ jsx4(Text4, { children: cmd.length > 50 ? cmd.slice(0, 47) + "..." : cmd })
      ] }, name))
    ] }),
    /* @__PURE__ */ jsx4(Box4, { marginTop: 1, children: /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "Press ESC to go back" }) })
  ] });
}

// src/dashboard/screens/docs-screen.tsx
import { useState as useState5, useEffect as useEffect3, useCallback as useCallback2 } from "react";
import { Box as Box5, Text as Text5, useInput as useInput3 } from "ink";
import { Spinner as Spinner2 } from "@inkjs/ui";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function DocsScreen({ onBack }) {
  const [step, setStep] = useState5("analyzing");
  const [analysis, setAnalysis] = useState5(null);
  const [docs, setDocs] = useState5(null);
  const [error, setError] = useState5("");
  useInput3((input, key) => {
    if (key.escape) {
      onBack();
      return;
    }
    if (step === "preview" && key.return) {
      writeDocs();
      return;
    }
    if (step === "preview" && input === "q") {
      onBack();
    }
  });
  const writeDocs = useCallback2(() => {
    if (!docs) return;
    setStep("writing");
    try {
      const files = Object.entries(docs.docs).map(([filePath, content]) => ({
        path: filePath,
        content
      }));
      writeExportFiles(files, process.cwd());
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to write files");
      setStep("error");
    }
  }, [docs]);
  useEffect3(() => {
    const cwd = process.cwd();
    analyzeProject(cwd).then((result) => {
      setAnalysis(result);
      setStep("generating");
      const repoContext = {
        name: result.name,
        language: result.language,
        framework: result.framework,
        fileTree: result.fileTree.slice(0, 100),
        packageScripts: result.packageScripts,
        dependencies: result.dependencies,
        ciPlatform: result.ciPlatform,
        testFramework: result.testFramework,
        hasDocker: result.hasDocker,
        envVars: result.envVars
      };
      return generateDocs({ repoContext });
    }).then((result) => {
      setDocs(result);
      setStep("preview");
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to generate docs");
      setStep("error");
    });
  }, []);
  if (step === "analyzing") {
    return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx5(Text5, { bold: true, children: "Generate Docs" }),
      /* @__PURE__ */ jsx5(Box5, { marginTop: 1, children: /* @__PURE__ */ jsx5(Spinner2, { label: "Analyzing project..." }) })
    ] });
  }
  if (step === "generating") {
    return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx5(Text5, { bold: true, children: "Generate Docs" }),
      analysis && /* @__PURE__ */ jsxs5(Text5, { dimColor: true, children: [
        "Project: ",
        analysis.name,
        " (",
        analysis.framework ?? analysis.language ?? "unknown",
        ")"
      ] }),
      /* @__PURE__ */ jsx5(Box5, { marginTop: 1, children: /* @__PURE__ */ jsx5(Spinner2, { label: "Generating documentation with AI..." }) })
    ] });
  }
  if (step === "error") {
    return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs5(Text5, { color: "red", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx5(Text5, { dimColor: true, children: "Press ESC to go back" })
    ] });
  }
  if (step === "preview" && docs) {
    const files = Object.entries(docs.docs);
    return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx5(Text5, { bold: true, children: "Generate Docs" }),
      /* @__PURE__ */ jsxs5(Box5, { marginTop: 1, flexDirection: "column", children: [
        /* @__PURE__ */ jsxs5(Text5, { children: [
          "Generated ",
          files.length,
          " file",
          files.length !== 1 ? "s" : "",
          ":"
        ] }),
        files.map(([filePath, content]) => /* @__PURE__ */ jsxs5(Text5, { children: [
          /* @__PURE__ */ jsxs5(Text5, { dimColor: true, children: [
            "  ",
            filePath
          ] }),
          /* @__PURE__ */ jsxs5(Text5, { dimColor: true, children: [
            " (",
            content.split("\n").length,
            " lines)"
          ] })
        ] }, filePath))
      ] }),
      /* @__PURE__ */ jsx5(Box5, { marginTop: 1, children: /* @__PURE__ */ jsx5(Text5, { dimColor: true, children: "Press \u21B5 to write files, ESC to cancel" }) })
    ] });
  }
  if (step === "writing") {
    return /* @__PURE__ */ jsx5(Box5, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx5(Spinner2, { label: "Writing files..." }) });
  }
  if (step === "done" && docs) {
    const fileCount = Object.keys(docs.docs).length;
    return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs5(Text5, { color: "green", children: [
        "Wrote ",
        fileCount,
        " file",
        fileCount !== 1 ? "s" : "",
        " successfully."
      ] }),
      /* @__PURE__ */ jsx5(Box5, { marginTop: 1, children: /* @__PURE__ */ jsx5(Text5, { dimColor: true, children: "Press ESC to go back" }) })
    ] });
  }
  return null;
}

// src/dashboard/screens/init-screen.tsx
import { useState as useState6, useEffect as useEffect4, useCallback as useCallback3 } from "react";
import { Box as Box6, Text as Text6, useInput as useInput4 } from "ink";
import { Spinner as Spinner3 } from "@inkjs/ui";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var AGENT_OPTIONS = [
  { id: "claude-code", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
  { id: "windsurf", label: "Windsurf" },
  { id: "cline", label: "Cline" },
  { id: "opencode", label: "OpenCode" }
];
function InitScreen({ onBack }) {
  const [step, setStep] = useState6("loading");
  const [configs, setConfigs] = useState6([]);
  const [configCursor, setConfigCursor] = useState6(0);
  const [agentCursor, setAgentCursor] = useState6(0);
  const [selectedConfig, setSelectedConfig] = useState6(null);
  const [exportResult, setExportResult] = useState6(null);
  const [conflicts, setConflicts] = useState6([]);
  const [error, setError] = useState6("");
  useInput4((input, key) => {
    if (key.escape) {
      if (step === "select-agent") {
        setStep("select-config");
        return;
      }
      onBack();
      return;
    }
    if (step === "select-config") {
      if (input === "k" || key.upArrow) {
        setConfigCursor((p) => p > 0 ? p - 1 : configs.length - 1);
      } else if (input === "j" || key.downArrow) {
        setConfigCursor((p) => p < configs.length - 1 ? p + 1 : 0);
      } else if (key.return && configs[configCursor]) {
        setSelectedConfig(configs[configCursor]);
        setStep("select-agent");
      }
      return;
    }
    if (step === "select-agent") {
      if (input === "k" || key.upArrow) {
        setAgentCursor((p) => p > 0 ? p - 1 : AGENT_OPTIONS.length - 1);
      } else if (input === "j" || key.downArrow) {
        setAgentCursor((p) => p < AGENT_OPTIONS.length - 1 ? p + 1 : 0);
      } else if (key.return) {
        doExport();
      }
      return;
    }
    if (step === "preview" && key.return) {
      writeFiles();
    }
  });
  const doExport = useCallback3(() => {
    if (!selectedConfig) return;
    const agent = AGENT_OPTIONS[agentCursor];
    if (!agent) return;
    setStep("exporting");
    exportConfig(selectedConfig.id, agent.id).then((result) => {
      setExportResult(result);
      const existing = getExistingFiles(result.files, process.cwd());
      setConflicts(existing);
      setStep("preview");
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Export failed");
      setStep("error");
    });
  }, [selectedConfig, agentCursor]);
  const writeFiles = useCallback3(() => {
    if (!exportResult) return;
    setStep("writing");
    try {
      writeExportFiles(exportResult.files, process.cwd());
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to write files");
      setStep("error");
    }
  }, [exportResult]);
  useEffect4(() => {
    getConfigs().then((result) => {
      setConfigs(result);
      setStep(result.length > 0 ? "select-config" : "error");
      if (result.length === 0) setError("No configs found.");
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to fetch configs");
      setStep("error");
    });
  }, []);
  if (step === "loading") {
    return /* @__PURE__ */ jsx6(Box6, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx6(Spinner3, { label: "Fetching configs..." }) });
  }
  if (step === "error") {
    return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs6(Text6, { color: "red", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: "Press ESC to go back" })
    ] });
  }
  if (step === "select-config") {
    return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx6(Text6, { bold: true, children: "Pull Config \u2014 Select a config" }),
      /* @__PURE__ */ jsx6(Box6, { marginTop: 1, flexDirection: "column", children: configs.map((config, i) => {
        const selected = i === configCursor;
        const name = config.name.length > 30 ? config.name.slice(0, 27) + "..." : config.name;
        return /* @__PURE__ */ jsxs6(Box6, { children: [
          /* @__PURE__ */ jsx6(Text6, { color: selected ? "cyan" : void 0, children: selected ? " > " : "   " }),
          /* @__PURE__ */ jsx6(Text6, { bold: selected, color: selected ? "cyan" : void 0, children: name }),
          /* @__PURE__ */ jsxs6(Text6, { dimColor: true, children: [
            " (",
            config.target_agent,
            ")"
          ] })
        ] }, config.id);
      }) }),
      /* @__PURE__ */ jsx6(Box6, { marginTop: 1, children: /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: "\u2191\u2193 select  \u21B5 confirm  ESC back" }) })
    ] });
  }
  if (step === "select-agent") {
    return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx6(Text6, { bold: true, children: "Pull Config \u2014 Select target agent" }),
      /* @__PURE__ */ jsxs6(Text6, { dimColor: true, children: [
        "Config: ",
        selectedConfig?.name
      ] }),
      /* @__PURE__ */ jsx6(Box6, { marginTop: 1, flexDirection: "column", children: AGENT_OPTIONS.map((agent, i) => {
        const selected = i === agentCursor;
        return /* @__PURE__ */ jsxs6(Box6, { children: [
          /* @__PURE__ */ jsx6(Text6, { color: selected ? "cyan" : void 0, children: selected ? " > " : "   " }),
          /* @__PURE__ */ jsx6(Text6, { bold: selected, color: selected ? "cyan" : void 0, children: agent.label })
        ] }, agent.id);
      }) }),
      /* @__PURE__ */ jsx6(Box6, { marginTop: 1, children: /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: "\u2191\u2193 select  \u21B5 confirm  ESC back" }) })
    ] });
  }
  if (step === "exporting") {
    return /* @__PURE__ */ jsx6(Box6, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx6(Spinner3, { label: "Exporting config..." }) });
  }
  if (step === "preview" && exportResult) {
    return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx6(Text6, { bold: true, children: "Pull Config \u2014 Preview" }),
      /* @__PURE__ */ jsx6(Box6, { marginTop: 1, flexDirection: "column", children: exportResult.files.map((file) => {
        const isConflict = conflicts.includes(file.path);
        return /* @__PURE__ */ jsxs6(Text6, { children: [
          /* @__PURE__ */ jsxs6(Text6, { dimColor: true, children: [
            "  ",
            file.path
          ] }),
          isConflict && /* @__PURE__ */ jsx6(Text6, { color: "yellow", children: " (overwrite)" })
        ] }, file.path);
      }) }),
      exportResult.warnings.length > 0 && /* @__PURE__ */ jsx6(Box6, { marginTop: 1, flexDirection: "column", children: exportResult.warnings.map((w, i) => /* @__PURE__ */ jsxs6(Text6, { color: "yellow", children: [
        "  ",
        w
      ] }, i)) }),
      /* @__PURE__ */ jsx6(Box6, { marginTop: 1, children: /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: "Press \u21B5 to write files, ESC to cancel" }) })
    ] });
  }
  if (step === "writing") {
    return /* @__PURE__ */ jsx6(Box6, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx6(Spinner3, { label: "Writing files..." }) });
  }
  if (step === "done" && exportResult) {
    return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs6(Text6, { color: "green", children: [
        "Wrote ",
        exportResult.files.length,
        " file",
        exportResult.files.length !== 1 ? "s" : "",
        " successfully."
      ] }),
      /* @__PURE__ */ jsx6(Box6, { marginTop: 1, children: /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: "Press ESC to go back" }) })
    ] });
  }
  return null;
}

// src/dashboard/screens/push-screen.tsx
import { useState as useState7, useEffect as useEffect5, useCallback as useCallback4 } from "react";
import { Box as Box7, Text as Text7, useInput as useInput5 } from "ink";
import { Spinner as Spinner4 } from "@inkjs/ui";
import path from "path";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function PushScreen({ onBack }) {
  const [step, setStep] = useState7("scanning");
  const [parsed, setParsed] = useState7(null);
  const [fileCount, setFileCount] = useState7(0);
  const [result, setResult] = useState7(null);
  const [error, setError] = useState7("");
  useInput5((input, key) => {
    if (key.escape || input === "q" && step !== "pushing") {
      onBack();
      return;
    }
    if (step === "preview" && key.return) {
      doPush();
    }
  });
  const doPush = useCallback4(() => {
    if (!parsed) return;
    setStep("pushing");
    const data = {
      targetAgent: parsed.targetAgent,
      name: parsed.name,
      description: parsed.description,
      files: [{
        path: `${parsed.targetAgent}-config`,
        content: JSON.stringify(parsed, null, 2)
      }]
    };
    pushConfig(data).then((res) => {
      setResult(res);
      setStep("done");
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Push failed");
      setStep("error");
    });
  }, [parsed]);
  useEffect5(() => {
    const cwd = process.cwd();
    const scanResult = scanForConfigs(cwd);
    if (!scanResult) {
      setError("No agent config files found in this directory.");
      setStep("error");
      return;
    }
    const name = path.basename(cwd);
    const config = parseFiles(scanResult.agentType, scanResult.files, name);
    setParsed(config);
    setFileCount(scanResult.files.length);
    setStep("preview");
  }, []);
  if (step === "scanning") {
    return /* @__PURE__ */ jsx7(Box7, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx7(Spinner4, { label: "Scanning for config files..." }) });
  }
  if (step === "error") {
    return /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs7(Text7, { color: "red", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Press ESC to go back" })
    ] });
  }
  if (step === "preview" && parsed) {
    return /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx7(Text7, { bold: true, children: "Push Config \u2014 Preview" }),
      /* @__PURE__ */ jsxs7(Box7, { marginTop: 1, flexDirection: "column", children: [
        /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Agent:".padEnd(16) }),
          /* @__PURE__ */ jsx7(Text7, { children: parsed.targetAgent })
        ] }),
        /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Name:".padEnd(16) }),
          /* @__PURE__ */ jsx7(Text7, { children: parsed.name })
        ] }),
        /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Files scanned:".padEnd(16) }),
          /* @__PURE__ */ jsx7(Text7, { children: fileCount })
        ] }),
        parsed.instructions.content && /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Instructions:".padEnd(16) }),
          /* @__PURE__ */ jsxs7(Text7, { children: [
            parsed.instructions.content.split("\n").length,
            " lines"
          ] })
        ] }),
        parsed.mcpServers.length > 0 && /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "MCP Servers:".padEnd(16) }),
          /* @__PURE__ */ jsx7(Text7, { children: parsed.mcpServers.length })
        ] }),
        parsed.rules.length > 0 && /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Rules:".padEnd(16) }),
          /* @__PURE__ */ jsx7(Text7, { children: parsed.rules.length })
        ] }),
        parsed.skills.length > 0 && /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Skills:".padEnd(16) }),
          /* @__PURE__ */ jsx7(Text7, { children: parsed.skills.length })
        ] })
      ] }),
      /* @__PURE__ */ jsx7(Box7, { marginTop: 1, children: /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Press \u21B5 to push, ESC to cancel" }) })
    ] });
  }
  if (step === "pushing") {
    return /* @__PURE__ */ jsx7(Box7, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx7(Spinner4, { label: "Pushing config to Actant..." }) });
  }
  if (step === "done" && result) {
    return /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx7(Text7, { color: "green", children: "Config pushed successfully." }),
      /* @__PURE__ */ jsxs7(Box7, { marginTop: 1, flexDirection: "column", children: [
        /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "ID:".padEnd(8) }),
          /* @__PURE__ */ jsx7(Text7, { children: result.id })
        ] }),
        /* @__PURE__ */ jsxs7(Text7, { children: [
          /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "URL:".padEnd(8) }),
          /* @__PURE__ */ jsx7(Text7, { children: result.url })
        ] })
      ] }),
      /* @__PURE__ */ jsx7(Box7, { marginTop: 1, children: /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Press ESC to go back" }) })
    ] });
  }
  return null;
}

// src/dashboard/screens/list-screen.tsx
import { useState as useState8, useEffect as useEffect6 } from "react";
import { Box as Box8, Text as Text8, useInput as useInput6 } from "ink";
import { Spinner as Spinner5 } from "@inkjs/ui";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function ListScreen({ onBack }) {
  const [status, setStatus] = useState8("loading");
  const [configs, setConfigs] = useState8([]);
  const [error, setError] = useState8("");
  useInput6((input, key) => {
    if (key.escape || input === "q") {
      onBack();
    }
  });
  useEffect6(() => {
    getConfigs().then((result) => {
      setConfigs(result);
      setStatus("done");
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to fetch configs");
      setStatus("error");
    });
  }, []);
  if (status === "loading") {
    return /* @__PURE__ */ jsx8(Box8, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx8(Spinner5, { label: "Fetching configs..." }) });
  }
  if (status === "error") {
    return /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs8(Text8, { color: "red", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: "Press ESC to go back" })
    ] });
  }
  if (configs.length === 0) {
    return /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx8(Text8, { bold: true, children: "My Configs" }),
      /* @__PURE__ */ jsx8(Box8, { marginTop: 1, children: /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: 'No configs found. Use "Push Config" to create one.' }) }),
      /* @__PURE__ */ jsx8(Box8, { marginTop: 1, children: /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: "Press ESC to go back" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", padding: 1, children: [
    /* @__PURE__ */ jsxs8(Text8, { bold: true, children: [
      "My Configs (",
      configs.length,
      ")"
    ] }),
    /* @__PURE__ */ jsxs8(Box8, { marginTop: 1, flexDirection: "column", children: [
      /* @__PURE__ */ jsxs8(Text8, { children: [
        /* @__PURE__ */ jsx8(Text8, { bold: true, children: "  Name".padEnd(28) }),
        /* @__PURE__ */ jsx8(Text8, { bold: true, children: "Agent".padEnd(16) }),
        /* @__PURE__ */ jsx8(Text8, { bold: true, children: "Updated" })
      ] }),
      configs.map((config) => {
        const name = config.name.length > 24 ? config.name.slice(0, 21) + "..." : config.name;
        const date = new Date(config.updated_at).toLocaleDateString();
        return /* @__PURE__ */ jsxs8(Text8, { children: [
          /* @__PURE__ */ jsxs8(Text8, { children: [
            "  ",
            name.padEnd(26)
          ] }),
          /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: config.target_agent.padEnd(16) }),
          /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: date })
        ] }, config.id);
      })
    ] }),
    /* @__PURE__ */ jsx8(Box8, { marginTop: 1, children: /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: "Press ESC to go back" }) })
  ] });
}

// src/dashboard/screens/login-screen.tsx
import { useState as useState9, useEffect as useEffect7 } from "react";
import { Box as Box9, Text as Text9, useInput as useInput7 } from "ink";
import { Spinner as Spinner6 } from "@inkjs/ui";
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
function LoginScreen({ onBack, onAuthChange }) {
  const [status, setStatus] = useState9("checking");
  const [error, setError] = useState9("");
  useInput7((input, key) => {
    if (key.escape || input === "q" && status !== "waiting") {
      onBack();
    }
  });
  useEffect7(() => {
    if (isAuthenticated()) {
      setStatus("done");
      return;
    }
    setStatus("waiting");
    startBrowserAuthFlow().then((tokens) => {
      saveAuth(tokens);
      onAuthChange();
      setStatus("done");
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setStatus("error");
    });
  }, [onAuthChange]);
  if (status === "checking") {
    return /* @__PURE__ */ jsx9(Box9, { flexDirection: "column", padding: 1, children: /* @__PURE__ */ jsx9(Spinner6, { label: "Checking auth status..." }) });
  }
  if (status === "waiting") {
    return /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsx9(Text9, { bold: true, children: "Login" }),
      /* @__PURE__ */ jsx9(Box9, { marginTop: 1, children: /* @__PURE__ */ jsx9(Spinner6, { label: "Waiting for browser authentication..." }) }),
      /* @__PURE__ */ jsx9(Box9, { marginTop: 1, children: /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: "A browser window should open. Complete login there." }) })
    ] });
  }
  if (status === "error") {
    return /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", padding: 1, children: [
      /* @__PURE__ */ jsxs9(Text9, { color: "red", children: [
        "Error: ",
        error
      ] }),
      /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: "Press ESC to go back" })
    ] });
  }
  return /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", padding: 1, children: [
    /* @__PURE__ */ jsx9(Text9, { color: "green", children: "Authenticated successfully." }),
    /* @__PURE__ */ jsx9(Box9, { marginTop: 1, children: /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: "Press ESC to go back" }) })
  ] });
}

// src/dashboard/app.tsx
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
function Dashboard() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const { screen, navigate, goBack } = useNavigation();
  const { authenticated, refresh: refreshAuth } = useAuthStatus();
  const compact = (stdout?.columns ?? 80) < 60;
  const handleQuit = useCallback5(() => {
    exit();
  }, [exit]);
  const handleSelect = useCallback5(
    (target) => {
      navigate(target);
    },
    [navigate]
  );
  if (screen === "analyze") {
    return /* @__PURE__ */ jsx10(AnalyzeScreen, { onBack: goBack });
  }
  if (screen === "docs") {
    return /* @__PURE__ */ jsx10(DocsScreen, { onBack: goBack });
  }
  if (screen === "init") {
    return /* @__PURE__ */ jsx10(InitScreen, { onBack: goBack });
  }
  if (screen === "push") {
    return /* @__PURE__ */ jsx10(PushScreen, { onBack: goBack });
  }
  if (screen === "list") {
    return /* @__PURE__ */ jsx10(ListScreen, { onBack: goBack });
  }
  if (screen === "login") {
    return /* @__PURE__ */ jsx10(LoginScreen, { onBack: goBack, onAuthChange: refreshAuth });
  }
  return /* @__PURE__ */ jsxs10(Box10, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx10(Header, { authenticated, compact }),
    /* @__PURE__ */ jsx10(
      Menu,
      {
        onSelect: handleSelect,
        onQuit: handleQuit,
        authenticated
      }
    ),
    /* @__PURE__ */ jsx10(Footer, {})
  ] });
}
async function launchDashboard() {
  if (!process.stdin.isTTY) {
    console.error("Dashboard requires an interactive terminal. Use subcommands (e.g. `actant analyze`) for non-interactive use.");
    process.exit(1);
  }
  const instance = render(/* @__PURE__ */ jsx10(Dashboard, {}));
  await instance.waitUntilExit();
}
export {
  launchDashboard
};
