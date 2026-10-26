#!/usr/bin/env node
/**
 * Publish the internal runtime package under the maintainer's npm scope.
 *
 * Why this exists: `dsh plugin add github:owner/repo` runs through pnpm, and
 * pnpm 10+ refuses git/tarball *sub*dependencies (`ERR_PNPM_EXOTIC_SUBDEP`).
 * The bundle therefore cannot pull its own runtime sibling straight from Git;
 * that one package has to live in a registry. Everything else (the selector,
 * its client half, the patch layer) still ships from the Git repository, so
 * `lib/` stays tracked and no build runs on the user's machine.
 *
 * The runtime keeps its published-under-a-scope name only in the tarball this
 * script writes: the workspace package keeps its original name so local builds
 * keep linking it. The alias in the repository root's `dependencies` maps the
 * original name onto the scoped package, which is why
 * `import.meta.resolve('dsh-context-compression-selector-runtime')` keeps
 * working after installation.
 *
 * Usage:
 *   node scripts/publish-runtime.mjs            # stage only, prints what would be published
 *   node scripts/publish-runtime.mjs --publish  # stage + `pnpm publish`
 *   node scripts/publish-runtime.mjs --publish --otp=123456   # non-interactive 2FA
 */

import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RUNTIME_DIR = join(ROOT, 'packages/runtime')
const STAGE = join(ROOT, 'out/npm-runtime')
const SCOPE = '@xbzb404'
const ALIAS_KEY = 'dsh-context-compression-selector-runtime'
const PUBLISH = process.argv.includes('--publish')
const OTP = process.argv.find((arg) => arg.startsWith('--otp='))

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))

const fail = (message) => {
  console.error(`publish-runtime: ${message}`)
  process.exit(1)
}

const rootManifest = await readJson(join(ROOT, 'package.json'))
const runtimeManifest = await readJson(join(RUNTIME_DIR, 'package.json'))

const version = runtimeManifest.version
const publishedName = `${SCOPE}/${ALIAS_KEY}`
const pinned = rootManifest.dependencies?.[ALIAS_KEY]

if (pinned !== void 0 && pinned !== `npm:${publishedName}@${version}`) {
  fail(
    `repository root pins "${ALIAS_KEY}": "${pinned}", but packages/runtime is at ${version}.\n` +
      `  expected: npm:${publishedName}@${version}\n` +
      `  Bump both (root pin + packages/runtime version) before publishing, or nothing will resolve.`,
  )
}

if (!existsSync(join(RUNTIME_DIR, 'lib/index.js'))) {
  fail('packages/runtime/lib is missing — run `pnpm -r run bundle` first (`lib/` is what ships, not `src/`).')
}

await rm(STAGE, { recursive: true, force: true })
await mkdir(STAGE, { recursive: true })

for (const entry of ['lib', 'assets']) {
  await cp(join(RUNTIME_DIR, entry), join(STAGE, entry), { recursive: true })
}
for (const entry of ['README.md', 'README.zh.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  if (!existsSync(join(RUNTIME_DIR, entry))) continue
  await cp(join(RUNTIME_DIR, entry), join(STAGE, entry))
}

/** The staged manifest: same payload, scoped identity. */
const staged = {
  name: publishedName,
  version,
  description: runtimeManifest.description,
  type: runtimeManifest.type,
  main: runtimeManifest.main,
  types: runtimeManifest.types,
  exports: runtimeManifest.exports,
  files: ['lib/**/*.js', 'lib/**/*.d.ts', 'assets/**/*', 'README.md', 'README.zh.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md'],
  keywords: runtimeManifest.keywords,
  license: runtimeManifest.license,
  author: runtimeManifest.author,
  repository: { type: 'git', url: 'git+https://github.com/xbzb404/dsh-context-compression-selector.git', directory: 'packages/runtime' },
  homepage: runtimeManifest.homepage,
  bugs: runtimeManifest.bugs,
  engines: runtimeManifest.engines,
  dependencies: runtimeManifest.dependencies,
  peerDependencies: runtimeManifest.peerDependencies,
  publishConfig: { access: 'public', tag: 'latest' },
}
await writeFile(join(STAGE, 'package.json'), `${JSON.stringify(staged, void 0, 2)}\n`)

console.log(`publish-runtime: staged ${publishedName}@${version} → ${STAGE}`)
console.log('publish-runtime: contents:')
for (const entry of ['lib', 'assets', 'README.md', 'README.zh.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'package.json']) {
  if (existsSync(join(STAGE, entry))) console.log(`  - ${entry}`)
}

if (!PUBLISH) {
  console.log('\npublish-runtime: dry run. Re-run with --publish to push it to the registry.')
  process.exit(0)
}

console.log(`\npublish-runtime: publishing ${publishedName}@${version} …`)
execFileSync('pnpm', [
  'publish',
  '--access',
  'public',
  '--tag',
  'latest',
  '--no-git-checks',
  ...(OTP === void 0 ? [] : [OTP]),
], {
  cwd: STAGE,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
console.log(`\npublish-runtime: done. Users can now run:
  dsh plugin add github:xbzb404/dsh-context-compression-selector`)
