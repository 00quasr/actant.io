#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { listCommand } from "./commands/list.js";
import { pushCommand } from "./commands/push.js";
import { analyzeCommand } from "./commands/analyze.js";
import { docsCommand } from "./commands/docs.js";

const program = new Command();
program
  .name("actant")
  .description("CLI for actant.io \u2014 configure AI coding agents")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(listCommand);
program.addCommand(pushCommand);
program.addCommand(analyzeCommand);
program.addCommand(docsCommand);

program.parse();
