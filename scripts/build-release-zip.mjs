#!/usr/bin/env node
/**
 * Build the distributable zip for the offline installer.
 *
 * Layout produced:
 *
 *   dist/dsh-context-compression-selector-<version>/
 *     install.cmd
 *     README.md
 *     vendor/...                       (6 packages)
 *   dist/dsh-context-compression-selector-<version>.zip
 *
 * The zip is written with PowerShell's Compress-Archive so the archive uses
 * Windows path separators and stores the correct UTF-8 flag for the Chinese
 * text some of the vendored readme files contain.
 *
 * Usage: node scripts/build-release-zip.mjs
 */

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const PKG = join(ROOT, "release-package");
const VENDOR = join(PKG, "vendor");

const VERSION = JSON.parse(
  readFileSync(join(VENDOR, "dsh-context-compression-selector", "package.json"), "utf8"),
).version;

const NAME = `dsh-context-compression-selector-${VERSION}`;
const DIST = join(ROOT, "dist");
const STAGE = join(DIST, NAME);
const ZIP = join(DIST, `${NAME}.zip`);

function step(message) {
  process.stdout.write(`build: ${message}\n`);
}

// ---- 0. inputs -------------------------------------------------------------

const REQUIRED = [
  "dsh-context-compression-selector",
  "dsh-context-compression-selector-runtime",
  "js-yaml",
  "@deepseek-ai/dsh-compaction-basic",
  "@deepseek-ai/dsh-command-compact",
  "@huggingface/tokenizers",
];

const missing = REQUIRED.filter((p) => !existsSync(join(VENDOR, p, "package.json")));
if (missing.length > 0) {
  process.stderr.write(`build: vendor is missing: ${missing.join(", ")}\n`);
  process.stderr.write("build: run the vendor sync first.\n");
  process.exit(1);
}
for (const extra of ["install.cmd", "README.md"]) {
  if (!existsSync(join(PKG, extra))) {
    process.stderr.write(`build: ${PKG}\\${extra} not found\n`);
    process.exit(1);
  }
}

// ---- 1. stage --------------------------------------------------------------

// A previous run's stage directory would silently merge into this one.
if (existsSync(STAGE)) {
  step(`removing stale stage ${STAGE}`);
  rmSync(STAGE, { recursive: true, force: true });
}
mkdirSync(STAGE, { recursive: true });

step(`staging ${NAME}`);
cpSync(join(PKG, "install.cmd"), join(STAGE, "install.cmd"));
cpSync(join(PKG, "README.md"), join(STAGE, "README.md"));
cpSync(VENDOR, join(STAGE, "vendor"), { recursive: true });

// A stray node_modules inside a vendored package would bloat the zip and, worse,
// drag in dependencies the host is supposed to inject.
const stray = [];
for (const pkg of REQUIRED) {
  if (existsSync(join(STAGE, "vendor", pkg, "node_modules"))) stray.push(pkg);
}
if (stray.length > 0) {
  process.stderr.write(`build: vendored packages contain node_modules: ${stray.join(", ")}\n`);
  process.exit(1);
}

// ---- 2. zip ----------------------------------------------------------------

if (existsSync(ZIP)) rmSync(ZIP, { force: true });

step(`compressing -> ${ZIP}`);
const ps = join(process.env.SystemRoot ?? "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
execFileSync(
  ps,
  [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    `Compress-Archive -Path '${join(STAGE, "*")}' -DestinationPath '${ZIP}' -CompressionLevel Optimal -Force`,
  ],
  { stdio: "inherit" },
);

if (!existsSync(ZIP)) {
  process.stderr.write("build: Compress-Archive did not produce a zip\n");
  process.exit(1);
}

// ---- 3. report -------------------------------------------------------------

const sizeMb = (statSync(ZIP).size / 1024 / 1024).toFixed(2);

step(`done: ${ZIP}  (${sizeMb} MB)`);
process.stdout.write(`\nDistribute the zip. Users unpack it and double-click install.cmd.\n`);
