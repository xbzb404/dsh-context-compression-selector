#!/usr/bin/env node
/**
 * Publish the Bundle (the installable plugin) under the maintainer's npm scope.
 *
 * Why a scope: the unscoped names `dsh-context-compression-selector` and
 * `dsh-context-compression-selector-runtime` on npm belong to the upstream
 * project, so this fork cannot publish under them. The workspace keeps the
 * original names so local builds and the repository install path keep working;
 * only the tarball this script writes carries the scoped identity.
 *
 * Two names change in the staged tarball and both matter:
 *
 *   - `name`, because npm publishes under the name in the packed manifest.
 *   - the `dependencies` entry for the runtime, because that is what npm
 *     resolves when a user installs this package. It points at the scoped
 *     runtime, which IS published.
 *
 * Three names change in the staged tarball and all of them matter:
 *
 *   - `name`, because npm publishes under the name in the packed manifest.
 *   - the `dependencies` entry for the runtime, because that is what npm
 *     resolves when a user installs this package. It points at the scoped
 *     runtime, which IS published.
 *   - `name:` in the Bundle patch layer, which is the module id the Host
 *     imports, not a label.
 *
 * The fourth is the client half. `lib/client.js` opens with
 * `window.__ModuleLoader__.load({ id })`, and the Host only accepts that
 * registration when `id` equals the resolved manifest package name — so the
 * scoped tarball's client must register the scoped name. The tracked artifact
 * keeps the unscoped workspace id (a `github:` install resolves that name and
 * runs no build), which means the same re-target that fixes the patch has to
 * run on the staged client too. Skipping it installs cleanly and then fails in
 * the browser with "loaded without registering ... via __ModuleLoader__.load",
 * which presents as the settings page silently disappearing.
 *
 * The patch layer's own `name:` is the module id the Host imports; renaming it
 * without the client id (or the reverse) breaks the pair.
 *
 * Usage:
 *   node scripts/publish-selector.mjs            # stage only, prints what would be published
 *   node scripts/publish-selector.mjs --publish  # stage + publish
 */

import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { clientRegistrationId, retargetClientRegistrationId } from './lib/selector-identity.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SELECTOR_DIR = join(ROOT, 'packages/selector')
const STAGE = join(ROOT, 'out/npm-selector')
const SCOPE = '@xbzb404'
const ALIAS_KEY = 'dsh-context-compression-selector-runtime'
const PUBLISH = process.argv.includes('--publish')

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const fail = (message) => {
  console.error(`publish-selector: ${message}`)
  process.exit(1)
}

const selectorManifest = await readJson(join(SELECTOR_DIR, 'package.json'))
const version = selectorManifest.version
const publishedName = `${SCOPE}/${selectorManifest.name}`

// The runtime has its own published version, which need not equal the selector's:
// a selector-only fix ships rc.N+1 while reusing the runtime already on npm.
// Read the version the selector actually pins instead of assuming they match;
// publishing an alias to a version that does not exist installs an empty tree.
const runtimePin = selectorManifest.dependencies?.[ALIAS_KEY]
if (typeof runtimePin !== 'string' || runtimePin.length === 0) {
  fail(`selector does not declare a dependency on ${ALIAS_KEY}`)
}
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/u.test(runtimePin)) {
  fail(
    `selector pins ${ALIAS_KEY} as "${runtimePin}", which is not a plain version.\n` +
      `  The staged manifest rewrites this to an npm: alias, so it must start as a version.`,
  )
}
const scopedRuntime = `npm:${SCOPE}/${ALIAS_KEY}@${runtimePin}`

if (!existsSync(join(SELECTOR_DIR, 'lib/index.js')) || !existsSync(join(SELECTOR_DIR, 'lib/client.js'))) {
  fail('packages/selector/lib is incomplete — run `pnpm -r run bundle` first (`lib/` is what ships).')
}
if (!existsSync(join(SELECTOR_DIR, 'cordis.patch.yml'))) {
  fail('packages/selector/cordis.patch.yml is missing — the Bundle cannot install without it.')
}
if (selectorManifest.dsh?.bundle?.patch !== './cordis.patch.yml') {
  fail('selector manifest does not declare dsh.bundle.patch; installing it as a Bundle would be refused.')
}

await rm(STAGE, { recursive: true, force: true })
await mkdir(STAGE, { recursive: true })

await cp(join(SELECTOR_DIR, 'lib'), join(STAGE, 'lib'), { recursive: true })
for (const entry of ['README.md', 'README.zh.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  if (existsSync(join(SELECTOR_DIR, entry))) await cp(join(SELECTOR_DIR, entry), join(STAGE, entry))
}

// The patch layer's `name:` is the module id the Host imports, not a label. The
// workspace version says the unscoped name because that is how the repository
// install and local builds resolve it; once this tarball is installed the same
// module lives at the scoped name, so the staged patch has to follow. Shipping
// the unscoped id makes the Host fail with ERR_MODULE_NOT_FOUND for
// 'dsh-context-compression-selector' and the Bundle silently never activates.
const patchSource = await readFile(join(SELECTOR_DIR, 'cordis.patch.yml'), 'utf8')
const unscoped = selectorManifest.name
const patchedForPublish = patchSource.replaceAll(`'${unscoped}'`, `'${publishedName}'`)
if (!patchedForPublish.includes(`'${publishedName}'`)) {
  fail(
    `cordis.patch.yml does not name the package as '${unscoped}', so the staged patch\n` +
      `  cannot be retargeted at '${publishedName}'. Check the patch layer's row name.`,
  )
}
await writeFile(join(STAGE, 'cordis.patch.yml'), patchedForPublish)

// The client half carries the same identity. Its banner id must equal the
// package name the Host resolved, or the registration is rejected in the
// browser and the plugin never contributes its settings section.
const clientSource = await readFile(join(STAGE, 'lib/client.js'), 'utf8')
let patchedClient
try {
  patchedClient = retargetClientRegistrationId(clientSource, unscoped, publishedName)
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
await writeFile(join(STAGE, 'lib/client.js'), patchedClient)

// Fail closed on the exact condition the Host rejects. Reading the staged bytes
// back proves the file on disk — not the string in memory — carries the id npm
// will serve.
const stagedClientId = clientRegistrationId(await readFile(join(STAGE, 'lib/client.js'), 'utf8'))
if (stagedClientId !== publishedName) {
  fail(
    `staged lib/client.js registers "${String(stagedClientId)}" instead of "${publishedName}".\n` +
      `  The Host accepts a client registration only under its resolved manifest name.`,
  )
}

/** The staged manifest: same payload, scoped identity, scoped runtime dependency. */
const staged = {
  ...selectorManifest,
  name: publishedName,
  dependencies: {
    ...selectorManifest.dependencies,
    // The `npm:` alias is load-bearing. npm rejects a plain "scope/name@version"
    // value as an invalid dependency spec, and even a bare scoped name would
    // install under `node_modules/@xbzb404/...`, while the built code imports
    // the *unscoped* id `dsh-context-compression-selector-runtime`. The alias
    // form installs the scoped tarball under that bare id, which is exactly
    // what `import 'dsh-context-compression-selector-runtime'` resolves.
    [ALIAS_KEY]: scopedRuntime,
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/xbzb404/dsh-context-compression-selector.git',
    directory: 'packages/selector',
  },
  publishConfig: { access: 'public', tag: 'latest' },
}
delete staged.scripts
await writeFile(join(STAGE, 'package.json'), `${JSON.stringify(staged, void 0, 2)}\n`)

console.log(`publish-selector: staged ${publishedName}@${version} → ${STAGE}`)
console.log(`publish-selector: runtime dependency → ${staged.dependencies[ALIAS_KEY]}`)
console.log(`publish-selector: dsh.bundle.patch = ${staged.dsh?.bundle?.patch}`)

if (!PUBLISH) {
  console.log('\npublish-selector: dry run. Re-run with --publish to push it to the registry.')
  process.exit(0)
}

console.log(`\npublish-selector: publishing ${publishedName}@${version} …`)
execFileSync('npm', ['publish', '--access', 'public', '--tag', 'latest'], {
  cwd: STAGE,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
console.log(`\npublish-selector: done. Users can now run:
  dsh plugin add ${publishedName}`)
