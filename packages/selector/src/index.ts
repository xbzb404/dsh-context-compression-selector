/** Host owner of the context-compression preference consumed by the browser selector. */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import {
  AUTO_COMPACT_THRESHOLD_LIMITS,
  COMPRESSION_PROFILES,
  CustomCompressionPolicySchema,
  DEFAULT_CUSTOM_COMPRESSION_POLICY,
  type CompressionProfile,
  type CustomCompressionPolicy,
} from 'dsh-context-compression-selector-runtime'
import {
  installCompressionVariants,
  resolveCompressionModulePaths,
} from './preset-overlay.ts'

/** Standalone Bundle preferences; the row exposes them through Settings forms. */
export interface Config {
  /** One compression profile, or a fully manual Custom document. */
  profile?: CompressionProfile
  /** Versioned manual policy used when {@link Config.profile} is `custom`. */
  custom?: CustomCompressionPolicy
  /** Auto Compact context watermark percent shared with micro compact. */
  autoCompactThresholdPercent?: number
  /** Publish a compression variant of every non-Minimal preset. */
  presetOverlay?: boolean
}

/**
 * Mark a field live-editable on the Plugins page.
 *
 * The Host derives a row's settings form from this schema, but it only serves
 * the fields carrying schemastery's `.volatile()` mark — `SettingsForms.describe`
 * runs the schema through `volatileForm`, which drops every unmarked field and
 * returns `undefined` when nothing survives. A row whose fields are all plain
 * therefore yields no form at all: the browser selector's
 * `configForms.get('context-compression')` comes back empty, every surface
 * self-hides, and the Plugin settings page shows a lone empty tab.
 *
 * `.volatile()` means "edits commit without remounting the entry". That is
 * exactly right for the three fields the browser selector writes live: it owns
 * them, and every consumer reads the same settings document rather than the
 * apply-time snapshot. `presetOverlay` is deliberately left plain — it is read
 * once in `apply()` to decide whether to publish the preset variants, so a
 * change must remount the row, and an unmarked field is correctly not editable.
 *
 * The helper tolerates a schemastery predating the modifier: a runtime without
 * `.volatile` keeps the plain field instead of throwing at import time.
 */
function volatileField<F extends { volatile?: () => unknown }>(field: F): F {
  return typeof field.volatile === 'function'
    ? (field.volatile() as F)
    : field
}

/** Loader validation for the standalone Bundle row. */
export const Config: z<Config> = z.object({
  profile: volatileField(z.union([...COMPRESSION_PROFILES]).default('balanced')),
  custom: volatileField(CustomCompressionPolicySchema.default(DEFAULT_CUSTOM_COMPRESSION_POLICY)),
  autoCompactThresholdPercent: volatileField(
    z.number().step(1)
      .min(AUTO_COMPACT_THRESHOLD_LIMITS.min)
      .max(AUTO_COMPACT_THRESHOLD_LIMITS.max)
      .default(AUTO_COMPACT_THRESHOLD_LIMITS.default),
  ),
  presetOverlay: z.boolean().default(false),
})

/**
 * Bundle Host entry.
 *
 * Harness 0.2.0 removed the imperative settings registration contract this
 * plugin used in 0.1.x (`settings.register`/`SettingsScope`). A row's Config
 * schema IS its settings surface now: `SettingsForms` projects this row's
 * schema into a form keyed by the profile entry id (see `cordis.patch.yml`),
 * the browser selector edits it through `ctx.configForms`, and every composer
 * reads the same document through `SettingsForms.describe()`. Nothing has to be
 * leased here anymore, so the Host only publishes the optional preset variants.
 */
export function apply(ctx: Context, config: Config = {}): void {
  if (config.presetOverlay !== true) return

  ctx.inject(['agentPresets'], (presetsCtx) => {
    const installation = installCompressionVariants(
      presetsCtx.agentPresets,
      {
        modules: resolveCompressionModulePaths(),
        excludedPresetIds: ['minimal'],
        // Row validation defaults this to 80%; the explicit fallback keeps the
        // documented composition identical when the row is applied raw (a test
        // double, or a future caller that composes `apply` directly).
        autoCompactThresholdPercent: () => config.autoCompactThresholdPercent
          ?? AUTO_COMPACT_THRESHOLD_LIMITS.default,
      },
    )
    presetsCtx.effect(() => () => installation.dispose(), 'contextCompressionSelector.agentPresets()')
  })
}
