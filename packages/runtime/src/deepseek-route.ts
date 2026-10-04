/**
 * Provider-route identity for the DeepSeek surfaces this runtime may measure.
 *
 * Two independent gates ask the same question: the exact-tokenizer binding in
 * `measurement.ts` (without an exact same-revision count no lossy rewrite is
 * allowed) and the published price catalog in `deepseek-official-pricing.ts`
 * (without a priced route the conservative Adaptive gate cannot authorize
 * anything). They must answer identically, so the answer lives here once.
 */

/**
 * Provider ids whose DeepSeek V4 requests are served and billed by DeepSeek.
 *
 * `deepseek` is the API-key route and `deepseek-official` is the same surface
 * when a deployment names it explicitly.
 *
 * `deepseek-account` is the signed-in account route added by
 * `@deepseek-ai/dsh-llm-deepseek-account`: it registers through the shared
 * `registerDeepSeekProvider` seam with the same model catalog, discovers the
 * same model ids, and addresses the same public DeepSeek API surface — it
 * authenticates with an account token (`x-dsh-auth-token`) instead of an API
 * key. Refusing it therefore refused exact measurement and pricing on a route
 * that is served by the very same V4 tokenizer artifacts and billed on the very
 * same published price page, which silently turned every rewrite off there.
 *
 * Anything else — a gateway, a compatible proxy, an unrelated vendor — stays
 * fail-closed.
 */
export const DEEPSEEK_BILLED_PROVIDER_IDS: readonly string[] = Object.freeze([
  'deepseek',
  'deepseek-official',
  'deepseek-account',
])

/** One provider id this runtime can measure exactly and price officially. */
export type DeepSeekBilledProviderId = (typeof DEEPSEEK_BILLED_PROVIDER_IDS)[number]

/**
 * Whether one provider id belongs to the measured-and-priced DeepSeek routes.
 * @param provider - provider id from a durable request header, or undefined.
 * @returns `true` only for the DeepSeek-served routes above.
 */
export function isDeepSeekBilledProvider(provider: string | undefined): provider is DeepSeekBilledProviderId {
  return provider !== undefined && DEEPSEEK_BILLED_PROVIDER_IDS.includes(provider)
}

/**
 * Base-url classes addressed by the published DeepSeek price page.
 *
 * `official-public` is the public API host. `account-official` is the
 * signed-in account surface, billed by the same account and unreachable with an
 * API key. Any other class — a self-hosted gateway, an HMAC-compatible proxy —
 * is not covered by the published prices and stays unpriced.
 */
export const DEEPSEEK_OFFICIAL_BASE_URL_CLASSES: readonly string[] = Object.freeze([
  'official-public',
  'account-official',
])

/** One base-url class covered by the published DeepSeek price page. */
export type DeepSeekOfficialBaseUrlClass = (typeof DEEPSEEK_OFFICIAL_BASE_URL_CLASSES)[number]

/**
 * Whether one base-url class is covered by the published DeepSeek prices.
 * @param baseUrlClass - endpoint class observed for the routed request.
 * @returns `true` only for the two official DeepSeek surfaces.
 */
export function isDeepSeekOfficialBaseUrlClass(
  baseUrlClass: string,
): baseUrlClass is DeepSeekOfficialBaseUrlClass {
  return DEEPSEEK_OFFICIAL_BASE_URL_CLASSES.includes(baseUrlClass)
}
