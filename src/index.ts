#!/usr/bin/env node

import { LaddroAPIError } from "@laddro/career-sdk";
import * as commands from "./commands.js";

const [command, ...args] = process.argv.slice(2);

async function run() {
  switch (command) {
    case "login":
      return commands.login(args);
    case "logout":
      return commands.logout();
    case "resumes":
      return commands.resumes(args);
    case "tailor":
      return commands.tailor(args);
    case "export":
      return commands.exportResume(args);
    case "parse":
      return commands.parse(args);
    case "cover-letter":
      return commands.coverLetter(args);
    case "templates":
      return commands.templates(args);
    case "settings":
      return commands.settings(args);
    case "help":
    case "--help":
    case "-h":
    case undefined:
      return commands.help();
    default:
      console.error(`Unknown command: ${command}`);
      console.error("Run 'laddro help' for usage.");
      process.exit(1);
  }
}

run().catch((err) => {
  if (err instanceof LaddroAPIError) {
    console.error(`error: ${err.message} (${err.status})`);
  } else {
    console.error(`error: ${err.message || err}`);
  }
  process.exit(1);
});
