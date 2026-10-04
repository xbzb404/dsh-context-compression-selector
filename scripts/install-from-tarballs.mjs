#!/usr/bin/env node
/**
 * Install the context-compression selector Bundle into a DeepSeek Harness profile
 * from the release tarballs shipped alongside this script.
 *
 * Why a script instead of `dsh plugin add github:owner/repo`:
 *
 * `pnpm` resolves a package's own dependencies from the registry only — it never
 * resolves a sibling directory inside the same checkout. The selector depends on
 * an exact version of its runtime (`dsh-context-compression-selector-runtime`),
 * and that prerelease is not on npm. So the second `add` always re-resolves the
 * dependency from the registry and fails with ERR_PNPM_NO_MATCHING_VERSION.
 *
 * Pinning the dependency with a `pnpm` override to the local tarball is the only
 * supported way to install the pair without publishing. This script performs the
 * two `add` calls plus that override, and verifies the result.
 *
 * Usage:
 *   node install-from-tarballs.mjs [--profile <name>] [--registry <url>] [--dry-run]
 *
 * Run it with the Node binary that ships with DeepSeek Harness (the profile's
 * package manager expects the same major version).
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---- configuration ---------------------------------------------------------

function parseArgs(argv) {
  const options = { profile: "desktop", registry: undefined, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--profile") options.profile = argv[++i];
    else if (arg === "--registry") options.registry = argv[++i];
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "usage: node install-from-tarballs.mjs [--profile <name>] [--registry <url>] [--dry-run]\n",
      );
      process.exit(0);
    } else {
      process.stderr.write(`install: unknown argument ${JSON.stringify(arg)}\n`);
      process.exit(2);
    }
  }
  if (options.profile === undefined || options.profile === "") {
    process.stderr.write("install: --profile needs a name\n");
    process.exit(2);
  }
  if (options.registry === undefined) options.registry = "https://registry.npmmirror.com";
  return options;
}

/** Directory holding the tarballs. Released side by side with this script. */
function tarballDir() {
  const name = "dsh-context-compression-selector-0.2.0-rc.1.tgz";
  const candidates = [
    process.env.TARBALL_DIR,
    HERE,
    join(HERE, "release-artifacts"),
    join(HERE, "release"),
    join(HERE, "..", "release-artifacts"),
    join(HERE, "..", "release"),
  ];
  for (const candidate of candidates) {
    if (candidate !== undefined && existsSync(join(candidate, name))) return candidate;
  }
  throw new Error(
    "install: cannot find the release tarballs. Put this script next to " +
      "dsh-context-compression-selector-*.tgz and dsh-context-compression-selector-runtime-*.tgz, " +
      "or point TARBALL_DIR at the directory holding them.",
  );
}

/** The Harness-managed pnpm, so the profile is installed with a matching toolchain. */
function packageManager() {
  if (process.env.PNPM_BIN !== undefined && existsSync(process.env.PNPM_BIN)) {
    return process.env.PNPM_BIN;
  }
  const runtimeBin = join(homedir(), ".dsh", "dsh-runtimes", "dsh-primary-runtime", "dependencies");
  const candidates = [
    join(runtimeBin, "pnpm", "bin", "pnpm.cjs"),
    join(runtimeBin, "pnpm", "bin", "pnpm.mjs"),
  ];
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  return "pnpm"; // fall back to PATH
}

/**
 * Build the command used to invoke pnpm.
 *
 * A `pnpm.cjs` path is a CommonJS script, not a native executable — spawning it
 * directly fails with EFTYPE on Windows. Run it through the current Node binary
 * instead. A bare `pnpm` on PATH is already an executable shim and is used as-is.
 */
function packageManagerCommand(pnpm) {
  if (/\.(cjs|mjs|js)$/u.test(pnpm)) return { file: process.execPath, prefix: [pnpm] };
  return { file: pnpm, prefix: [] };
}

// ---- profile helpers -------------------------------------------------------

function profileDir(name) {
  const home = process.env.DSH_HOME ?? join(homedir(), ".dsh");
  return join(home, "profiles", name);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * Write the `overrides` entry that pins the runtime dependency to the local
 * tarball. pnpm 11 reads overrides from pnpm-workspace.yaml only — the
 * `pnpm` field in package.json is ignored and warns.
 */
function pinRuntimeOverride(dir, runtimeSpec) {
  const workspacePath = join(dir, "pnpm-workspace.yaml");
  const marker = "dsh-context-compression-selector-runtime:";
  let lines = existsSync(workspacePath) ? readFileSync(workspacePath, "utf8").split("\n") : ["packages:", "  - .", ""];
  if (!lines.some((line) => line.trim() === "packages:")) {
    lines.unshift("packages:", "  - .", "");
  }
  // Drop any previous override for this package so the script is re-runnable.
  lines = lines.filter((line) => !line.trim().startsWith(marker));
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  if (!lines.some((line) => line.trim() === "overrides:")) lines.push("", "overrides:");
  lines.push(`  ${marker} ${runtimeSpec}`, "");
  writeFileSync(workspacePath, lines.join("\n"));
  return workspacePath;
}

/**
 * Register the selector in `dsh.profile.bundles`.
 *
 * `dsh plugin add` performs this step itself whenever a newly installed package
 * declares `dsh.bundle`. This script talks to pnpm directly, so it has to do the
 * same thing or the plugin installs as an inert dependency.
 */
function registerBundle(dir) {
  const manifestPath = join(dir, "package.json");
  const manifest = readJson(manifestPath);
  const name = "dsh-context-compression-selector";
  manifest.dsh ??= {};
  manifest.dsh.profile ??= {};
  const bundles = (manifest.dsh.profile.bundles ??= []);
  if (bundles.includes(name)) return false;
  bundles.push(name);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return true;
}

// ---- main ------------------------------------------------------------------

const options = parseArgs(process.argv.slice(2));

if (options.profile.toLowerCase() === "desktop") {
  // Desktop's profile is owned by the Electron application. Editing it from a
  // script races the app; the supported path is the app's own plugin manager.
  process.stderr.write(
    "install: warning: the \"desktop\" profile is managed by the DeepSeek Harness " +
      "application. Quit the app before running this script, and reinstall through " +
      "the app's plugin manager if it rewrites the profile.\n",
  );
}

const dir = profileDir(options.profile);
const manifestPath = join(dir, "package.json");
if (!existsSync(manifestPath)) {
  process.stderr.write(
    `install: no profile at ${dir}. Open DeepSeek Harness once to initialize "${options.profile}", then retry.\n`,
  );
  process.exit(1);
}

const tarballs = tarballDir();
const runtimeTgz = join(tarballs, "dsh-context-compression-selector-runtime-0.2.0-rc.1.tgz");
const selectorTgz = join(tarballs, "dsh-context-compression-selector-0.2.0-rc.1.tgz");
const pnpm = packageManager();
const runner = packageManagerCommand(pnpm);

const steps = [
  { label: "runtime tarball", spec: `file:${runtimeTgz}` },
  { label: "selector tarball", spec: `file:${selectorTgz}` },
];

process.stdout.write(`install: profile   ${dir}\n`);
process.stdout.write(`install: tarballs  ${tarballs}\n`);
process.stdout.write(`install: pnpm      ${pnpm}\n`);
process.stdout.write(`install: registry  ${options.registry}\n\n`);

// Back up the manifest before touching it.
const stamp = new Date().toISOString().replace(/[:.]/gu, "-");
copyFileSync(manifestPath, `${manifestPath}.bak-${stamp}`);
process.stdout.write(`install: backed up package.json -> package.json.bak-${stamp}\n`);

// Pin the runtime before the first add so both steps see a resolvable version.
const workspacePath = pinRuntimeOverride(dir, `file:${runtimeTgz}`);
process.stdout.write(`install: pinned runtime override in ${workspacePath}\n\n`);

if (options.dryRun) {
  process.stdout.write("install: --dry-run, stopping before pnpm runs.\n");
  process.exit(0);
}

for (const step of steps) {
  process.stdout.write(`install: adding ${step.label}\n`);
  const args = ["add", "--ignore-scripts", `--registry=${options.registry}`, step.spec];
  try {
    const output = execFileSync(runner.file, [...runner.prefix, ...args], {
      cwd: dir,
      encoding: "utf8",
      stdio: "pipe",
    });
    process.stdout.write(
      output
        .split("\n")
        .filter((line) => line.trim() !== "")
        .slice(-4)
        .join("\n") + "\n",
    );
  } catch (error) {
    process.stderr.write(`install: FAILED on ${step.label}\n\n`);
    const detail = [error.stdout, error.stderr, error.message]
      .filter((part) => typeof part === "string" && part.trim() !== "")
      .join("\n");
    process.stderr.write(detail.trim() + "\n\n");
    process.stderr.write(
      `install: package.json was backed up to package.json.bak-${stamp}; restore it with:\n` +
        `  cp "${manifestPath}.bak-${stamp}" "${manifestPath}"\n`,
    );
    process.exit(1);
  }
}

// ---- verify ----------------------------------------------------------------

if (registerBundle(dir)) {
  process.stdout.write("\ninstall: registered the Bundle in dsh.profile.bundles\n");
}

const manifest = readJson(manifestPath);
const installed = manifest.dependencies ?? {};
const bundles = manifest.dsh?.profile?.bundles ?? [];
const problems = [];

if (installed["dsh-context-compression-selector"] === undefined) problems.push("selector dependency missing");
if (installed["dsh-context-compression-selector-runtime"] === undefined) problems.push("runtime dependency missing");
if (!bundles.includes("dsh-context-compression-selector")) {
  problems.push(
    "selector is not listed in dsh.profile.bundles. pnpm installed the package but the " +
      "Bundle registration step did not run; add \"dsh-context-compression-selector\" " +
      "to dsh.profile.bundles in profile package.json.",
  );
}
const selectorDir = join(dir, "node_modules", "dsh-context-compression-selector");
const runtimeDir = join(dir, "node_modules", "dsh-context-compression-selector-runtime");
// Both packages publish their build output at the tarball root as lib/.
if (!existsSync(join(selectorDir, "lib", "index.js"))) problems.push("selector entry lib/index.js missing");
if (!existsSync(join(selectorDir, "cordis.patch.yml"))) problems.push("selector cordis.patch.yml missing");
if (!existsSync(join(runtimeDir, "lib", "index.js"))) problems.push("runtime entry lib/index.js missing");
if (!existsSync(join(runtimeDir, "assets"))) problems.push("runtime tokenizer assets missing");

process.stdout.write("\ninstall: verification\n");
if (problems.length === 0) {
  process.stdout.write("  dependencies      ok\n");
  process.stdout.write("  bundle listing    ok\n");
  process.stdout.write("  entry files       ok\n");
  process.stdout.write(`\ninstall: done. Restart DeepSeek Harness and pick a "· Context compression" preset.\n`);
  process.exit(0);
}
for (const problem of problems) process.stderr.write(`  ✗ ${problem}\n`);
process.stderr.write(`\ninstall: incomplete. Restore package.json.bak-${stamp} if you want to roll back.\n`);
process.exit(1);
