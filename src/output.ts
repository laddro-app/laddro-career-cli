import { writeFileSync } from "fs";

export function printJSON(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(rows: Record<string, unknown>[], columns?: string[]): void {
  if (rows.length === 0) {
    console.log("(no results)");
    return;
  }
  const keys = columns || Object.keys(rows[0]);
  const widths = keys.map((k) =>
    Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length))
  );

  const header = keys.map((k, i) => k.padEnd(widths[i])).join("  ");
  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  console.log(header);
  console.log(sep);
  for (const row of rows) {
    const line = keys.map((k, i) => String(row[k] ?? "").padEnd(widths[i])).join("  ");
    console.log(line);
  }
}

export function savePDF(data: ArrayBuffer | bytes, outputPath: string): void {
  writeFileSync(outputPath, Buffer.from(data as ArrayBuffer));
  console.log(`Saved: ${outputPath}`);
}

export function error(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

type bytes = Uint8Array;
