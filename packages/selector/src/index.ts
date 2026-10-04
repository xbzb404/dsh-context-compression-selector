/** Host owner of the context-compression preference consumed by the browser selector. */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import {
  AUTO_COMPACT_THRESHOLD_LIMITS,
  COMPRESSION_PROFILES,
  CustomCompressionPolicyInputSchema,
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
 * A marked field also publishes its schema to the browser: the Host serves
 * `schema.toJSON()` and `ConfigFormController.decode` rehydrates that envelope to
 * validate the value it was served, so a marked field MUST use a schema that
 * survives plain JSON. `CustomCompressionPolicyInputSchema` is that schema for
 * the Custom document — `CustomCompressionPolicySchema` is a schemastery
 * `transform` whose callback cannot be serialized, and a marked field carrying
 * it makes the server value fail its own rehydrated schema
 * (`callback is not a function`), which leaves the browser form in `loading`
 * with every control disabled.
 *
 * The helper tolerates a schemastery predating the modifier: a runtime without
 * `.volatile` keeps the plain field instead of throwing at import time.
 */
function volatileField<F extends { volatile?: () => unknown }>(field: F): F {
  return typeof field.volatile === 'function'
    ? (field.volatile() as F)
    : field
}

/**
 * Global symbol cosmokit marks a live config reference with.
 *
 * `isVolatile` is deliberately identified across ESM/CJS copies of cosmokit, so
 * the check needs no import and no extra dependency.
 */
const VOLATILE_WRITE = Symbol.for('cosmokit.volatile.write')

/**
 * Read one config field as the plain value it was set to.
 *
 * A `.volatile()` field does not reach `apply()` as its value: it arrives as a
 * cosmokit `Volatile` reference, which is what lets a live edit update the
 * running row without remounting it. Every read of the *value* therefore has to
 * unwrap the reference — `Number.isFinite()` over it is false, and that silently
 * disarmed the whole publication: `composeRows` threw
 * `Auto Compact threshold percent must be finite` inside the fire-and-forget
 * publish, whose rejection this plugin swallows, so no preset variant was ever
 * registered and compression never ran.
 */
function fieldValue<T>(field: T): T {
  return typeof field === 'object' && field !== null && VOLATILE_WRITE in field
    ? (field as unknown as { get(): T }).get()
    : field
}

/** Loader validation for the standalone Bundle row. */
export const Config: z<Config> = z.object({
  profile: volatileField(z.union([...COMPRESSION_PROFILES]).default('balanced')),
  custom: volatileField(CustomCompressionPolicyInputSchema.default(DEFAULT_CUSTOM_COMPRESSION_POLICY)),
  autoCompactThresholdPercent: volatileField(
    z.number().step(1)
      .min(AUTO_COMPACT_THRESHOLD_LIMITS.min)
      .max(AUTO_COMPACT_THRESHOLD_LIMITS.max)
      .default(AUTO_COMPACT_THRESHOLD_LIMITS.default),
  ),
  presetOverlay: z.boolean().default(false),
})

/** The roster-row fields the variant copy reads. */
interface VariantSource {
  readonly id: string
  readonly name?: string | undefined
  readonly description?: string | undefined
}

/**
 * Display copy for the derived variants, in the two languages the Harness
 * client ships (`LOCALE_IDS`: `zh`, `en`).
 *
 * The picker localizes a *shipped* preset from its own dictionaries and offers
 * the "模式说明 / 如何使用" reader — but only for a roster row that publishes no
 * name and whose id is one of the four shipped presets: the row text comes from
 * `isBuiltInPreset(preset) ? dictionary[preset.id] : preset.{name,description}`,
 * and the reader's table is consulted as `trust === "system" && table.has(id)`.
 * A plugin-declared variant publishes a name, so it is always rendered verbatim
 * from this copy, and that reader is unreachable for it by construction — the
 * description below therefore has to say what the reader would have said.
 */
interface VariantCopy {
  /** Appended to the source preset's display name. */
  readonly displaySuffix: string
  /** Display names for the shipped presets, which publish none of their own. */
  readonly shippedNames: Readonly<Record<string, string>>
  /** Picker description standing in for the reader a variant cannot open. */
  describe(source: VariantSource, thresholdPercent: number): string
}

/** The shipped preset names the client's own `zh` dictionary uses. */
const SHIPPED_NAMES_ZH: Readonly<Record<string, string>> = {
  standard: '标准模式',
  ptc: 'PTC 模式',
  minimal: '极简模式',
  cordis: '创造模式',
}

/** The shipped preset names the client's own `en` dictionary uses. */
const SHIPPED_NAMES_EN: Readonly<Record<string, string>> = {
  standard: 'Standard mode',
  ptc: 'PTC mode',
  minimal: 'Minimal mode',
  cordis: 'Creator mode',
}

/** Display name of one source preset in one language. */
function sourceDisplayName(source: VariantSource, names: Readonly<Record<string, string>>): string {
  return source.name ?? names[source.id] ?? source.id
}

const VARIANT_COPY: Readonly<Record<'en' | 'zh', VariantCopy>> = {
  en: {
    displaySuffix: 'Context compression',
    shippedNames: SHIPPED_NAMES_EN,
    // Wording kept stable: it is what the picker shows next to the variant name.
    describe: (source, thresholdPercent) => [
      `Context compression over ${source.description ?? `the native ${source.id} preset`}.`,
      'The selector\'s compression stack — fresh, aggregate and history budgets plus recoverable '
      + 'tool-result pruning — replaces native head/tail trimming.',
      `Auto Compact frozen at ${String(thresholdPercent)}%.`,
    ].join(' '),
  },
  zh: {
    displaySuffix: '上下文压缩',
    shippedNames: SHIPPED_NAMES_ZH,
    describe: (source, thresholdPercent) => [
      `在「${sourceDisplayName(source, SHIPPED_NAMES_ZH)}」的基础上启用上下文压缩：`,
      'Fresh 预压缩刚变大的工具结果、Aggregate 在仍超预算时再次压缩、'
      + 'History 回收旧的工具结果并保留近期上下文，取代原生首尾裁剪。',
      `本次生成冻结的 Auto Compact 水位为 ${String(thresholdPercent)}%。`,
      '新建任务时选择本模式即可生效；Profile 与水位在「设置 → Context compression」中调整。',
    ].join(''),
  },
}

/** Settings namespace the locale plugin owns; its row carries the UI language. */
const LOCALE_SETTINGS_NAMESPACE = 'locale'

/** Field carrying an explicit language selection inside that namespace. */
const LOCALE_PREFERENCE_FIELD = 'preference'

/** Accepted BCP 47-style language ids, mirroring the locale plugin's schema. */
const LOCALE_ID_PATTERN = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u

/**
 * Resolve the language the variant copy is written in.
 *
 * Order: the user's explicit choice in the settings document, then the process
 * locale, then English. Reading the settings document is deliberately optional —
 * a service that is not mounted yet, a document that has not loaded, or a
 * rejected read only costs the explicit preference and falls back to the
 * process locale, which is what an unset preference means anyway.
 */
function resolveVariantLocale(ctx: Context): 'en' | 'zh' {
  const locale = localePreference(ctx) ?? processLocale()
  return locale?.toLowerCase().startsWith('zh') === true ? 'zh' : 'en'
}

/** The user's saved language choice, read from the settings document. */
function localePreference(ctx: Context): string | undefined {
  try {
    const settings = ctx.get('settings') as { describe?: () => unknown } | undefined
    const rows = settings?.describe?.()
    if (!Array.isArray(rows)) return undefined
    for (const row of rows) {
      const entry = row as {
        ns?: unknown
        user?: Record<string, unknown>
        value?: Record<string, unknown>
      }
      if (entry.ns !== LOCALE_SETTINGS_NAMESPACE) continue
      const chosen = entry.user?.[LOCALE_PREFERENCE_FIELD] ?? entry.value?.[LOCALE_PREFERENCE_FIELD]
      if (typeof chosen === 'string' && LOCALE_ID_PATTERN.test(chosen)) return chosen
    }
  } catch {
    // Localization is cosmetic: never let it break variant publication.
  }
  return undefined
}

/** The running process locale, used when no explicit preference is saved. */
function processLocale(): string | undefined {
  try {
    return new Intl.DateTimeFormat().resolvedOptions().locale
  } catch {
    return undefined
  }
}

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
  if (fieldValue(config.presetOverlay) !== true) return

  ctx.inject(['agentPresets'], (presetsCtx) => {
    const thresholdPercent = (): number =>
      fieldValue(config.autoCompactThresholdPercent) ?? AUTO_COMPACT_THRESHOLD_LIMITS.default
    const copy = VARIANT_COPY[resolveVariantLocale(ctx)]
    const installation = installCompressionVariants(
      presetsCtx.agentPresets,
      {
        modules: resolveCompressionModulePaths(),
        excludedPresetIds: ['minimal'],
        // Row validation defaults this to 80%; the explicit fallback keeps the
        // documented composition identical when the row is applied raw (a test
        // double, or a future caller that composes `apply` directly). The field
        // is volatile, so it is read through the reference it arrives as.
        autoCompactThresholdPercent: thresholdPercent,
        // The Host declares its own presets without a name or a description, so
        // a variant would show "No description." beside a name that only
        // repeated the source id — and the picker localizes that row from
        // nothing, because it only translates a shipped preset that publishes
        // no name. The variant therefore carries its own localized name suffix
        // and description; see {@link VARIANT_COPY}.
        displayName: source => sourceDisplayName(source, copy.shippedNames),
        displaySuffix: copy.displaySuffix,
        describeVariant: source => copy.describe(source, thresholdPercent()),
      },
    )
    presetsCtx.effect(() => () => installation.dispose(), 'contextCompressionSelector.agentPresets()')
    // A failed publication must not be silent: without this line a profile whose
    // presets could not be composed runs every session with no compression stack
    // at all, and the only trace is a rejection nobody observes. The Host logger
    // is where an operator sees it.
    void installation.ready().catch((error: unknown) => {
      presetsCtx.logger.error(
        'context-compression selector: preset variants were not published, so this profile runs without context compression',
        error,
      )
    })
  })
}
