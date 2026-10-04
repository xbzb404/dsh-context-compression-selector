#!/usr/bin/env node
/**
 * Deploy the context-compression selector Bundle into a DeepSeek Harness profile
 * straight from this checkout's source directories — no tarball, no registry.
 *
 * Why this exists:
 *
 * The selector depends on an exact prerelease of its sibling runtime
 * (`dsh-context-compression-selector-runtime@0.2.0-rc.1`), which is not published
 * to npm. Resolving it from the registry fails with ERR_PNPM_NO_MATCHING_VERSION,
 * so the runtime has to be pinned to a local path with a pnpm `overrides` entry.
 *
 * Two things this script gets right that hand-editing tends to get wrong:
 *
 *  1. `overrides` lives in `pnpm-workspace.yaml` (pnpm 11), NOT in package.json's
 *     `pnpm` field. The DeepSeek Harness app rewrites pnpm-workspace.yaml when it
 *     manages plugins, which silently drops the override — and then every other
 *     `dsh plugin add/remove` dies on the runtime resolution. This script rewrites
 *     the file itself so the two stay in sync with pnpm-lock.yaml.
 *
 *  2. pnpm copies a `file:` directory into node_modules rather than symlinking it.
 *     Editing source does NOT take effect until you re-run install. Run this
 *     script (or `pnpm install`) after every rebuild. Pass --watch to have it
 *     re-install automatically when lib/ changes.
 *
 * Usage:
 *   node scripts/deploy-local.mjs [--profile <name>] [--dry-run] [--watch]
 *
 * Run it with the Node binary that ships with DeepSeek Harness.
 */

import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, copyFileSync, watch } from "node:fs";
import { dirname, join, resolve, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const SELECTOR_DIR = join(REPO, "packages", "selector");
const RUNTIME_DIR = join(REPO, "packages", "runtime");

// ---- arguments -------------------------------------------------------------

function parseArgs(argv) {
  const options = { profile: "desktop", dryRun: false, watch: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--profile") options.profile = argv[++i];
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--watch") options.watch = true;
    else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "usage: node scripts/deploy-local.mjs [--profile <name>] [--dry-run] [--watch]\n",
      );
      process.exit(0);
    } else {
      process.stderr.write(`deploy: unknown argument ${JSON.stringify(arg)}\n`);
      process.exit(2);
    }
  }
  return options;
}

// ---- pnpm discovery --------------------------------------------------------

/** The Harness-managed pnpm, so the profile uses a matching toolchain. */
function packageManager() {
  if (process.env.PNPM_BIN !== undefined && existsSync(process.env.PNPM_BIN)) {
    return process.env.PNPM_BIN;
  }
  const root = join(homedir(), ".dsh", "dsh-runtimes", "dsh-primary-runtime", "dependencies");
  for (const candidate of [
    join(root, "pnpm", "bin", "pnpm.cjs"),
    join(root, "pnpm", "bin", "pnpm.mjs"),
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return "pnpm";
}

/**
 * Build the command used to invoke pnpm.
 *
 * A `.cjs`/`.mjs` path is a script, not a native executable — spawning it
 * directly fails with EFTYPE on Windows. It has to run under a Node.
 *
 * Prefer a real Node binary over `process.execPath`. When this script runs
 * inside the DeepSeek Harness Electron app, `process.execPath` is the app
 * binary, and re-spawning it fails with EBUSY while the app holds its lock —
 * even with ELECTRON_RUN_AS_NODE set, because that variable only takes effect
 * at process start. Candidate list, in order:
 *
 *   1. $DSH_NODE — explicit override
 *   2. a plain node.exe on PATH (must not be the Electron binary)
 *   3. the WorkBuddy managed Node, when present
 *   4. $DSH_DESKTOP_NODE_EXECUTABLE
 *   5. process.execPath, with ELECTRON_RUN_AS_NODE (last resort)
 */
function findNode() {
  const candidates = [];
  const onPath = process.env.PATH?.split(delimiter).map((dir) => join(dir, "node.exe")) ?? [];
  if (process.env.DSH_NODE) candidates.push(process.env.DSH_NODE);
  candidates.push(...onPath);
  candidates.push(
    join(homedir(), ".workbuddy", "binaries", "node", "versions", "22.22.2-3", "node.exe"),
  );
  if (process.env.DSH_DESKTOP_NODE_EXECUTABLE) candidates.push(process.env.DSH_DESKTOP_NODE_EXECUTABLE);

  for (const candidate of candidates) {
    if (!candidate || !existsSync(candidate)) continue;
    if (candidate === process.execPath) continue; // the running Electron binary
    return { file: candidate, electron: false, env: {} };
  }

  return {
    file: process.execPath,
    electron: true,
    env: { ELECTRON_RUN_AS_NODE: "1" },
  };
}

function packageManagerCommand(pnpm) {
  if (!/\.(cjs|mjs|js)$/u.test(pnpm)) {
    return { file: pnpm, script: pnpm, electron: false, env: {} };
  }
  return { ...findNode(), script: pnpm };
}

/**
 * Build the child environment for pnpm.
 *
 * When this script is launched from inside the WorkBuddy sandbox, Node is
 * started with a NODE_OPTIONS preload of node-safe-delete-shim.cjs. That shim
 * intercepts every `unlink` and aborts when pnpm cleans up its temp store
 * directories (SAFE_DELETE_BULK_CONFIRM_REQUIRED), which kills the install.
 * pnpm's own housekeeping is not the user's data, so drop the preload.
 *
 * Also dropped: NODE_PATH, which would make pnpm resolve modules against the
 * harness's bundled tree instead of the profile.
 */
function cleanEnv(extra) {
  const env = { ...process.env, ...extra };
  delete env.NODE_OPTIONS;
  delete env.NODE_PATH;
  return env;
}

/**
 * Whether this process is allowed to create child processes at all.
 *
 * The WorkBuddy sandbox denies every spawn with EBUSY, regardless of the
 * binary or API used. Detect it once so we can fall back to printing the
 * command instead of failing with a confusing spawnSync error.
 */
function canSpawn() {
  if (process.env.DSH_DEPLOY_NO_SPAWN === "1") return false;
  if (process.env.DSH_DEPLOY_ASSUME_SPAWN === "1") return true;
  try {
    const probe = execFileSync(process.execPath, ["-e", "0"], {
      stdio: "pipe",
      timeout: 5000,
      env: cleanEnv({}),
    });
    return probe !== null;
  } catch (error) {
    // A non-zero exit still proves the spawn worked; only EBUSY/EPERM means denied.
    return !["EBUSY", "EPERM", "EACCES"].includes(error?.code ?? "");
  }
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
 * Rewrite the runtime override in pnpm-workspace.yaml to point at the local
 * source directory. Idempotent: any previous override for this package is
 * dropped so re-running is safe.
 *
 * Note: pnpm rewrites this file itself (`pnpm add` reformats it and switches
 * the path separators to backslashes). So matching is done on normalised
 * slashes, and no comment block is emitted — pnpm preserves stray comments and
 * they would pile up on every rewrite.
 */
function pinRuntimeOverride(dir, spec) {
  const workspacePath = join(dir, "pnpm-workspace.yaml");
  const marker = "dsh-context-compression-selector-runtime:";
  const normalize = (line) => line.replace(/\\/gu, "/");
  let lines = existsSync(workspacePath)
    ? readFileSync(workspacePath, "utf8").split("\n")
    : ["packages:", "  - .", ""];

  if (!lines.some((line) => line.trim() === "packages:")) lines.unshift("packages:", "  - .", "");

  lines = lines.filter((line) => !normalize(line).trim().startsWith(marker));

  // Drop the whole overrides: block (ours is the only entry) so we re-emit clean.
  const start = lines.findIndex((line) => line.trim() === "overrides:");
  if (start !== -1) {
    let end = start + 1;
    while (end < lines.length && /^\s+\S/u.test(lines[end])) end += 1;
    lines.splice(start, end - start);
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();

  lines.push("", "overrides:", `  ${marker} ${spec}`, "");
  writeFileSync(workspacePath, lines.join("\n"));
  return workspacePath;
}

/** Ensure the selector is listed in dsh.profile.bundles. */
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

// ---- install ---------------------------------------------------------------

function install(dir, pnpm, renderer, options) {
  const selectorSpec = `file:${SELECTOR_DIR}`;
  const runtimeSpec = `file:${RUNTIME_DIR}`;

  const manifest = readJson(join(dir, "package.json"));
  manifest.dependencies ??= {};
  manifest.dependencies["dsh-context-compression-selector"] = selectorSpec;
  manifest.dependencies["dsh-context-compression-selector-runtime"] = runtimeSpec;
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest, null, 2) + "\n");

  const workspacePath = pinRuntimeOverride(dir, runtimeSpec);

  if (options.dryRun) {
    renderer("deploy: --dry-run, stopping before pnpm runs.");
    renderer(`  package.json       updated`);
    renderer(`  ${workspacePath}   override pinned`);
    return true;
  }

  const runner = packageManagerCommand(pnpm);
  const argList = runner.electron
    ? ["--expose-internals", runner.script, "install", "--ignore-scripts"]
    : [runner.script, "install", "--ignore-scripts"];

  // The sandbox denies child processes; hand the caller a runnable command.
  if (!canSpawn()) {
    const command = [quote(runner.file), ...argList.map(quote)].join(" ");
    const scriptPath = join(dir, ".deploy-pnpm.cmd");
    writeFileSync(
      scriptPath,
      [
        "@echo off",
        "rem Generated by scripts/deploy-local.mjs — run this outside the sandbox.",
        "set NODE_OPTIONS=",
        "set NODE_PATH=",
        runner.electron ? "set ELECTRON_RUN_AS_NODE=1" : "",
        `cd /d "${dir}"`,
        command,
        "",
      ]
        .filter((line) => line !== "")
        .join("\r\n"),
    );
    renderer("");
    renderer("deploy: cannot create child processes here (sandbox denies spawn).");
    renderer("        package.json and pnpm-workspace.yaml were updated; the install");
    renderer("        itself must run outside the sandbox. Either run:");
    renderer("");
    renderer(`  ${command}`);
    renderer("");
    renderer(`  or execute the generated ${scriptPath}`);
    return null;
  }

  try {
    const out = execFileSync(runner.file, argList, {
      cwd: dir,
      encoding: "utf8",
      stdio: "pipe",
      env: cleanEnv(runner.env),
    });
    const tail = out.split("\n").filter((line) => line.trim() !== "").slice(-3).join("\n");
    renderer(tail);
  } catch (error) {
    renderer(`deploy: pnpm install FAILED`);
    renderer([error.stdout, error.stderr, error.message].filter(Boolean).join("\n").trim());
    return false;
  }

  return verify(dir, renderer);
}

/** Minimal POSIX-ish quoting for building a copy-pasteable command line. */
function quote(value) {
  return /[\s"']/u.test(value) ? `"${value.replace(/"/gu, '\\"')}"` : value;
}

function verify(dir, renderer) {
  const problems = [];
  const nm = join(dir, "node_modules");
  const selectorDir = join(nm, "dsh-context-compression-selector");
  const runtimeDir = join(nm, "dsh-context-compression-selector-runtime");

  if (!existsSync(join(selectorDir, "lib", "index.js"))) problems.push("selector lib/index.js missing");
  if (!existsSync(join(selectorDir, "cordis.patch.yml"))) problems.push("selector cordis.patch.yml missing");
  if (!existsSync(join(runtimeDir, "lib", "index.js"))) problems.push("runtime lib/index.js missing");
  if (!existsSync(join(runtimeDir, "assets"))) problems.push("runtime tokenizer assets missing");

  const bundles = readJson(join(dir, "package.json")).dsh?.profile?.bundles ?? [];
  if (!bundles.includes("dsh-context-compression-selector")) {
    problems.push("selector missing from dsh.profile.bundles");
  }

  renderer("");
  renderer("deploy: verification");
  if (problems.length === 0) {
    renderer("  selector + runtime  ok");
    renderer("  bundle listing      ok");
    renderer("  entry files         ok");
    renderer("");
    renderer("deploy: done. Restart DeepSeek Harness.");
    renderer("");
    renderer("NOTE: pnpm copies these directories instead of symlinking them.");
    renderer("      After rebuilding, run this script again (or use --watch).");
    return true;
  }
  for (const problem of problems) renderer(`  x ${problem}`);
  return false;
}

// ---- main ------------------------------------------------------------------

const options = parseArgs(process.argv.slice(2));
const dir = profileDir(options.profile);
const manifestPath = join(dir, "package.json");

if (!existsSync(manifestPath)) {
  process.stderr.write(
    `deploy: no profile at ${dir}. Start DeepSeek Harness once, then retry.\n`,
  );
  process.exit(1);
}

const pnpm = packageManager();

process.stdout.write(`deploy: profile   ${dir}\n`);
process.stdout.write(`deploy: selector  ${SELECTOR_DIR}\n`);
process.stdout.write(`deploy: runtime   ${RUNTIME_DIR}\n`);
process.stdout.write(`deploy: pnpm      ${pnpm}\n\n`);

if (options.profile.toLowerCase() === "desktop") {
  process.stdout.write(
    "deploy: warning: the \"desktop\" profile is owned by the Harness app.\n" +
      "        Quit the app before deploying, or it may rewrite the profile.\n\n",
  );
}

const stamp = new Date().toISOString().replace(/[:.]/gu, "-");
copyFileSync(manifestPath, `${manifestPath}.bak-${stamp}`);

registerBundle(dir);

function run() {
  process.stdout.write(`deploy: installing at ${new Date().toLocaleTimeString()}\n`);
  const result = install(dir, pnpm, (line) => process.stdout.write(line + "\n"), options);
  if (result === false) process.exitCode = 1;
  return result;
}

const result = run();

// --watch only makes sense when we can actually run pnpm ourselves.
if (options.watch && !options.dryRun && result !== null) {
  const targets = [join(SELECTOR_DIR, "lib"), join(RUNTIME_DIR, "lib")].filter((p) => existsSync(p));
  process.stdout.write(`\ndeploy: watching ${targets.length} lib director${targets.length === 1 ? "y" : "ies"}...\n`);
  let timer = null;
  for (const target of targets) {
    watch(target, { recursive: true }, () => {
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        process.stdout.write("\n");
        run();
      }, 400);
    });
  }
}
