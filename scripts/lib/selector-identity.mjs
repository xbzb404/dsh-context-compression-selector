/**
 * Identity re-targeting rules shared by the publish script and the release gate.
 *
 * A Harness client bundle announces itself with
 * `window.__ModuleLoader__.load({ id, factory })`, and the Host accepts that
 * registration only when `id` equals the **resolved manifest package name** of
 * the package it just fetched ("The resolved manifest package name identifies
 * the browser module" — Harness client-modules contract). Anything else is a
 * hard failure in the browser:
 *
 *   client-modules: could not load "@/scope/pkg": plugins/??...@scope/pkg/client.js:
 *   loaded without registering "@/scope/pkg" via __ModuleLoader__.load
 *
 * This repository ships two install shapes from one built artifact:
 *
 *   - repository / `github:` install → the workspace manifest name, unscoped
 *     (`dsh-context-compression-selector`);
 *   - npm tarball → the scoped published name (`@xbzb404/...`).
 *
 * Both names must be right for their own shape, and only one can be baked into
 * `packages/selector/lib/client.js`, which is tracked so a git install needs no
 * build. The artifact therefore always carries the unscoped workspace id, and
 * the publish script re-targets the staged copy — exactly the same way it
 * re-targets the patch layer's row `name:`. These helpers are shared so the
 * release gate can prove the re-target actually lands.
 */

/**
 * Read the registration id out of a built client bundle.
 *
 * Matches only the `id:` field of the `__ModuleLoader__.load(...)` call. Other
 * strings in the bundle (the CSS tag id, `dataset.plugin`, settings entry ids)
 * carry related names but are not the module id, and must not be confused with
 * it.
 *
 * @param source - Contents of a built `client.js`.
 * @returns the registration id, or `undefined` when the banner is absent.
 */
export function clientRegistrationId(source) {
  const match = /__ModuleLoader__\.load\(\{\s*id:\s*(["'])([^"']*)\1/u.exec(source)
  return match?.[2]
}

/**
 * Re-target a built client bundle's registration id at another package name.
 *
 * @param source - Contents of a built `client.js`.
 * @param from - The id currently baked into the banner.
 * @param to - The package name the installed artifact will resolve to.
 * @returns the rewritten source.
 * @throws when the banner does not carry `from`, so a silent mismatch cannot
 *   ship: rewriting nothing is the failure mode this function exists to stop.
 */
export function retargetClientRegistrationId(source, from, to) {
  const current = clientRegistrationId(source)
  if (current === undefined) {
    throw new Error('client.js does not open with a __ModuleLoader__.load({ id }) banner')
  }
  if (current !== from) {
    throw new Error(
      `client.js registers "${current}", so it cannot be re-targeted from "${from}" to "${to}".\n` +
        `  The tracked artifact must carry the workspace name; check the client build banner.`,
    )
  }
  // Quote-agnostic: the banner is emitted by tsdown, the artifact is rewritten
  // here, and the two must not have to agree on quote style.
  return source.replace(
    /(__ModuleLoader__\.load\(\{\s*id:\s*)(["'])([^"']*)\2/u,
    (_match, prefix, quote) => `${prefix}${quote}${to}${quote}`,
  )
}
