/**
 * Types for the release scripts' shared identity helpers, so the release gate
 * and the built-artifact test can import the exact runtime code that runs in
 * `publish-selector.mjs` instead of a re-implementation of it.
 */

/** Read the `__ModuleLoader__.load({ id })` registration id of a client bundle. */
export function clientRegistrationId(source: string): string | undefined

/**
 * Rewrite a client bundle's registration id from one package name to another.
 *
 * @throws when the banner does not carry `from`.
 */
export function retargetClientRegistrationId(source: string, from: string, to: string): string
