import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import {
  COMPRESSION_PROFILES,
  isCustomCompressionPolicy,
  ContextCompressionSettingsSection,
  type CompressionProfile, type CompressionSelectorInjected,
  type CompressionSettingsFace, type CompressionSettingsSnapshot, type ContextCompressionSettings,
} from './CompressionProfileSelector.tsx'
import { DEFAULT_CUSTOM_COMPRESSION_POLICY } from '../profiles.ts'
import { decodeSettings } from './decode.ts'
import { en, zh } from './locales.ts'

export const inject = ['slots', 'locale', 'configForms']
const NS = 'context-compression'

/**
 * Profile entry id carrying the compression settings.
 *
 * Harness 0.2.0 keys every settings form by **entry id** rather than by a
 * namespace a plugin registers at runtime (`SettingsForms` has no `register`),
 * so the deployment must compose the runtime under this id — see
 * `cordis.patch.yml` in this package. A composition that never serves the id
 * leaves the form `unavailable`, and every surface self-hides.
 */
const SETTINGS_ENTRY_ID = 'context-compression'

/**
 * Narrow one presumed Host Config section into the persisted settings document.
 *
 * The runtime's Config is deliberately flat (`autoCompactThresholdPercent`
 * rather than a nested `autoCompact` object), while the stored document shape
 * validated by {@link decodeSettings} is nested — so the three fields the UI
 * owns are projected out before decoding instead of handing the whole Config to
 * a decoder that would reject its extra keys.
 */
function decodeEntrySettings(section: unknown): ContextCompressionSettings | undefined {
  if (typeof section !== 'object' || section === null) return undefined
  const { profile, custom, autoCompactThresholdPercent } = section as Record<string, unknown>
  return decodeSettings({
    profile,
    custom,
    ...(autoCompactThresholdPercent === undefined
      ? {}
      : { autoCompact: { thresholdPercent: autoCompactThresholdPercent } }),
  })
}

function sameCustomPolicy(
  left: ContextCompressionSettings['custom'],
  right: ContextCompressionSettings['custom'],
): boolean {
  if (left.version !== 3 || right.version !== 3) return false
  return left.version === right.version
    && left.unit === right.unit
    && left.prefixPolicy === right.prefixPolicy
    && left.fresh.enabled === right.fresh.enabled
    && left.fresh.trigger === right.fresh.trigger
    && left.fresh.target === right.fresh.target
    && left.aggregate.enabled === right.aggregate.enabled
    && left.aggregate.trigger === right.aggregate.trigger
    && left.aggregate.target === right.aggregate.target
    && left.history.enabled === right.history.enabled
    && left.history.trigger === right.history.trigger
    && left.history.keepRecentToolCalls === right.history.keepRecentToolCalls
    && left.history.keepRecentTokens === right.history.keepRecentTokens
    && left.history.minReclaim === right.history.minReclaim
    && left.tailTrim.enabled === right.tailTrim.enabled
    && left.tailTrim.trigger === right.tailTrim.trigger
}

/**
 * The renderer-owned slot service, reached structurally.
 *
 * `Context.slots` is declared by `@deepseek-ai/dsh-client-ui-renderer`, which
 * the App injects at runtime but which is not resolvable as a type dependency
 * from a published Browser bundle; structural typing keeps the entry compiling
 * without re-declaring (and risking a contradiction with) that augmentation.
 */
interface SlotRegistryFace {
  /** Keep one contribution alive while its target slot is declared. */
  inject(key: string, callback: () => () => void): () => void
  /** Register one entry and return its withdrawer. */
  register(options: {
    name: string
    id: string
    order?: number
    label?: () => string
    locale?: string
    inject?: (...args: never[]) => object
  }, component: (props: never) => unknown): () => void
}

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-context-compression: dictionaries')
  const form = ctx.configForms.get<unknown>(SETTINGS_ENTRY_ID)
  const slots = (ctx as unknown as { slots: SlotRegistryFace }).slots
  /**
   * Decoded view over the shared form. `ConfigForm` snapshots are already
   * stable between publishes, so the derived snapshot is cached against its
   * source identity — returning a fresh object per call would defeat the
   * selector hook's referential equality.
   */
  let cachedSource: ReturnType<typeof form.getSnapshot> | undefined
  let cachedSnapshot: CompressionSettingsSnapshot | undefined
  const compression: CompressionSettingsFace = {
    getSnapshot(): CompressionSettingsSnapshot {
      const source = form.getSnapshot()
      if (cachedSource === source && cachedSnapshot !== undefined) return cachedSnapshot
      const derived: CompressionSettingsSnapshot = {
        status: source.status,
        value: decodeEntrySettings(source.value),
        revision: source.revision,
        writable: source.writable,
      }
      cachedSource = source
      cachedSnapshot = derived
      return derived
    },
    subscribe: listener => form.subscribe(listener),
  }
  /**
   * Confirm one write against the answer the provider folded back in.
   * 0.2.0 field writes resolve to the Host's accept/reject boolean rather than
   * throwing, so refusal and "accepted but not what we asked for" both surface
   * as the same user-visible failure.
   */
  const writeAndConfirm = async (
    write: () => Promise<boolean>,
    accepts: (settings: ContextCompressionSettings) => boolean,
  ): Promise<void> => {
    if (!(await write())) throw new Error('Context compression settings were not saved.')
    const after = decodeEntrySettings(form.getSnapshot().value)
    if (after === undefined || !accepts(after)) {
      throw new Error('Context compression settings were not saved.')
    }
  }
  const injected = (): CompressionSelectorInjected => ({
    hooks: { compression },
    select: profile => writeAndConfirm(
      () => form.set('profile', profile),
      settings => settings.profile === profile,
    ),
    saveCustom: custom => writeAndConfirm(
      () => form.set('custom', custom),
      settings => isCustomCompressionPolicy(settings.custom)
        && sameCustomPolicy(settings.custom, custom),
    ),
    resetCustom: () => writeAndConfirm(
      () => form.set('custom', structuredClone(DEFAULT_CUSTOM_COMPRESSION_POLICY)),
      settings => isCustomCompressionPolicy(settings.custom)
        && sameCustomPolicy(settings.custom, DEFAULT_CUSTOM_COMPRESSION_POLICY),
    ),
    // The runtime publishes the threshold as a flat Config field.
    saveAutoCompact: thresholdPercent => writeAndConfirm(
      () => form.set('autoCompactThresholdPercent', thresholdPercent),
      settings => settings.autoCompact.thresholdPercent === thresholdPercent,
    ),
  })
  slots.inject('settings.section', () => slots.register({
    name: 'settings.section',
    id: 'context-compression',
    order: 17,
    label: () => ctx.locale.bind(NS)('nav'),
    locale: NS,
    inject: injected,
  }, ContextCompressionSettingsSection))
}

export type {
  CompressionProfile, CompressionProfileSelectorProps, CompressionSelectorInjected,
  CompressionSettingsFace, CompressionSettingsSnapshot, ContextCompressionSettings,
} from './CompressionProfileSelector.tsx'
