import { readFileSync } from "fs";
import { Laddro, LaddroAPIError } from "@laddro/career-sdk";
import { getApiKey, getBaseUrl, getConfig, saveConfig } from "./config.js";
import { error, printJSON, printTable, savePDF } from "./output.js";

function client(): Laddro {
  const apiKey = getApiKey();
  if (!apiKey) error("No API key. Run: laddro login <key>");
  return new Laddro({ apiKey, baseUrl: getBaseUrl() });
}

function publicClient(): Laddro {
  return new Laddro({ baseUrl: getBaseUrl() });
}

export async function login(args: string[]): Promise<void> {
  const key = args[0];
  if (!key) error("Usage: laddro login <api-key>");
  const config = getConfig();
  config.apiKey = key;
  saveConfig(config);
  console.log("API key saved to ~/.laddro/config.json");
}

export async function logout(): Promise<void> {
  const config = getConfig();
  delete config.apiKey;
  saveConfig(config);
  console.log("API key removed.");
}

export async function resumes(args: string[]): Promise<void> {
  const c = client();
  const list = await c.resumes.list({ limit: 20 });
  printTable(
    list.items.map((r) => ({
      id: r.resumeId,
      title: r.title,
      default: r.isDefault ? "✓" : "",
      updated: r.updatedAt.split("T")[0],
    })),
    ["id", "title", "default", "updated"],
  );
  if (list.total > list.items.length) {
    console.log(`\n(showing ${list.items.length} of ${list.total})`);
  }
}

export async function tailor(args: string[]): Promise<void> {
  const c = client();
  const flags = parseFlags(args);
  const positionName = flags.positional[0];
  if (!positionName) error("Usage: laddro tailor <position> --job-url <url> [--output <file>]");

  const outputFile = flags.get("output") || flags.get("o") || "tailored.pdf";

  console.log(`Tailoring for: ${positionName}`);

  const pdf = await c.tailor.run({
    resumeId: flags.get("resume") || undefined,
    positionName,
    jobDescription: flags.get("job-description") || undefined,
    jobUrl: flags.get("job-url") || flags.get("job") || undefined,
    mode: (flags.get("mode") as "standard" | "new") || undefined,
    language: flags.get("language") || undefined,
    templateId: flags.get("template") || undefined,
  });

  savePDF(pdf, outputFile);
}

export async function exportResume(args: string[]): Promise<void> {
  const c = client();
  const flags = parseFlags(args);
  const resumeId = flags.positional[0];
  if (!resumeId) error("Usage: laddro export <resume-id> [--template GRAPHITE] [--output <file>]");

  const outputFile = flags.get("output") || flags.get("o") || "resume.pdf";

  const pdf = await c.export.pdf({
    resumeId,
    templateId: flags.get("template") || undefined,
    colorId: flags.get("color") || undefined,
    font: flags.get("font") || undefined,
    locale: flags.get("locale") || undefined,
  });

  savePDF(pdf, outputFile);
}

export async function coverLetter(args: string[]): Promise<void> {
  const c = client();
  const subcommand = args[0];

  if (subcommand === "list" || !subcommand) {
    const list = await c.coverLetters.list({ limit: 20 });
    printTable(
      list.items.map((cl) => ({
        id: cl.coverLetterId,
        title: cl.title,
        updated: cl.updatedAt.split("T")[0],
      })),
      ["id", "title", "updated"],
    );
    return;
  }

  if (subcommand === "generate") {
    const flags = parseFlags(args.slice(1));
    const positionName = flags.positional[0];
    if (!positionName) error("Usage: laddro cover-letter generate <position> --job-url <url>");

    const outputFile = flags.get("output") || flags.get("o") || "cover-letter.pdf";

    console.log(`Generating cover letter for: ${positionName}`);
    const pdf = await c.coverLetters.generate({
      resumeId: flags.get("resume") || undefined,
      positionName,
      jobDescription: flags.get("job-description") || undefined,
      jobUrl: flags.get("job-url") || flags.get("job") || undefined,
      language: flags.get("language") || undefined,
      templateId: flags.get("template") || undefined,
    });

    savePDF(pdf, outputFile);
    return;
  }

  error(`Unknown subcommand: cover-letter ${subcommand}. Use: list, generate`);
}

export async function parse(args: string[]): Promise<void> {
  const c = client();
  const flags = parseFlags(args);
  const filePath = flags.positional[0];
  if (!filePath) error("Usage: laddro parse <file.pdf> [--template GRAPHITE] [--output <file>]");

  const outputFile = flags.get("output") || flags.get("o") || "parsed.pdf";
  const fileBuffer = readFileSync(filePath);

  console.log(`Parsing: ${filePath}`);
  const pdf = await c.resumes.parse({
    file: fileBuffer,
    filename: filePath.split("/").pop(),
    templateId: flags.get("template") || undefined,
    locale: flags.get("locale") || undefined,
    colorId: flags.get("color") || undefined,
    font: flags.get("font") || undefined,
  });

  savePDF(pdf, outputFile);
}

export async function templates(args: string[]): Promise<void> {
  const c = publicClient();
  const templateId = args[0];

  if (templateId) {
    const detail = await c.templates.get(templateId);
    printJSON(detail);
    return;
  }

  const list = await c.templates.list();
  printTable(
    list.map((t) => ({
      id: t.id,
      name: t.name,
      ats: t.atsScore,
      layout: t.layoutType,
    })),
    ["id", "name", "ats", "layout"],
  );
}

export async function settings(args: string[]): Promise<void> {
  const c = client();
  const subcommand = args[0];

  if (subcommand === "set") {
    const flags = parseFlags(args.slice(1));
    const provider = flags.get("provider");
    const apiKey = flags.get("key");
    if (!provider || !apiKey) error("Usage: laddro settings set --provider <name> --key <key> [--model <id>]");

    const result = await c.settings.updateModel({
      provider,
      model: flags.get("model") || undefined,
      apiKey,
    });
    console.log(`AI provider set: ${result.ai?.provider} / ${result.ai?.model}`);
    return;
  }

  if (subcommand === "remove") {
    await c.settings.deleteModel();
    console.log("AI settings removed. Using Laddro defaults.");
    return;
  }

  const result = await c.settings.get();
  if (result.ai) {
    printJSON(result.ai);
  } else {
    console.log("No AI provider configured. Using Laddro defaults.");
  }
}

export function help(): void {
  console.log(`laddro - Laddro Career API CLI

Commands:
  login <api-key>           Save API key
  logout                    Remove saved API key
  resumes                   List your resumes
  tailor <position>         Tailor resume for a job
  export <resume-id>        Export resume as PDF
  parse <file.pdf>          Parse and render a PDF resume
  cover-letter list         List cover letters
  cover-letter generate     Generate a cover letter
  templates [id]            Browse templates
  settings                  View AI settings
  settings set              Configure BYOK provider
  settings remove           Remove AI config
  help                      Show this help

Flags (vary by command):
  --job-url, --job          Job posting URL
  --job-description         Job description text
  --resume                  Resume ID (uses default otherwise)
  --template                Template ID (e.g. GRAPHITE)
  --output, -o              Output file path
  --language                Output language code
  --mode                    Tailor mode (standard|new)
  --provider                AI provider name
  --model                   AI model ID
  --key                     AI provider API key

Environment:
  LADDRO_API_KEY            API key (overrides config file)
  LADDRO_BASE_URL           Custom API URL
`);
}

interface Flags {
  positional: string[];
  get(key: string): string | undefined;
}

function parseFlags(args: string[]): Flags {
  const positional: string[] = [];
  const flags = new Map<string, string>();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, "true");
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const key = arg.slice(1);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, "true");
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, get: (key) => flags.get(key) };
}
