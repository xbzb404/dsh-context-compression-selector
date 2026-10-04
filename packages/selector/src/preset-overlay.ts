/**
 * Plugin-owned Agent-preset variants carrying the canonical compression stack.
 *
 * The composition authority moved between harness lines, and with it the only
 * public way to add rows to a preset:
 *
 * - 0.1.x: {@link AgentPreset} carried the declaring YAML **path**, so a plugin
 *   could decorate `resolve()` and hand callers a rewritten composition while
 *   the preset kept its own identity. That required generating files, freezing
 *   their mtime/size standing key, and scope-tracking every composition call.
 * - 0.2.0: {@link AgentPreset} is read-only display metadata (`id`, `name`,
 *   `description`, `order`, `broken`) and every composition comes from the
 *   {@link PresetDefinition} its owner registered. Nothing rewrites a native
 *   declaration, and a re-registered id is refused, so a plugin composes
 *   additions by declaring presets of its own.
 *
 * This module therefore publishes one *variant* per applicable native preset: a
 * sibling declaration whose rows are the source preset's rows with any prior
 * compression implementation replaced by the canonical stack. Variant ids are
 * derived deterministically from the source id, so an reinstall replaces the
 * same declaration instead of accumulating generations, and disposal removes
 * exactly the variants this installation registered.
 *
 * @module dsh-context-compression-selector/preset-overlay
 */

import { applyEntryPatches, entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import type { AgentPreset, PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry'
import { load } from 'js-yaml'

/** Node module URLs written into the generated compression stack. */
export interface CompressionModulePaths {
  /** Exact aggregate/history compaction implementation shipped with the Bundle. */
  readonly compactionBasic: string
  /** Exact manual compact command shipped with the Bundle. */
  readonly commandCompact: string
  /** Exact enhanced tool-result pruner shipped with the Bundle. */
  readonly toolResultPruner: string
}

/** One native preset's declared rows, exactly as the registry renders them. */
export interface PresetDocument {
  /** The preset the composition belongs to. */
  readonly agentPreset: string
  /** Declared child plugin list as entry-list YAML, `!!js` expressions included. */
  readonly content: string
}

/**
 * The registry methods this module composes through, narrowed to what it reads
 * and writes so a test can supply the whole contract without the real service.
 */
export interface PresetVariantRegistry {
  /** Read every declared preset, including activation failures. */
  list(): Promise<readonly AgentPreset[]>
  /** Read one declaration's child plugin rows as YAML. */
  readDocument(id: string): Promise<PresetDocument>
  /** Declare one preset; the returned disposer withdraws it. */
  register(definition: PresetDefinition): Promise<() => Promise<void>>
}

/** Configuration for one reversible variant publication. */
export interface PresetOverlayOptions {
  /** Absolute module entry points written into the generated composition. */
  readonly modules: CompressionModulePaths
  /** Preset ids that deliberately get no variant. */
  readonly excludedPresetIds?: readonly string[]
  /**
   * Reads the Auto Compact threshold percent (50–90) to freeze into newly
   * generated compositions — once per composition, into BOTH the
   * compaction-basic `thresholdRatio` and the runtime deployment config, so
   * one generation can never split Auto Compact and micro compact across two
   * thresholds. Returning `undefined` keeps both defaults untouched.
   */
  readonly autoCompactThresholdPercent?: () => number | undefined
  /** Appended to the source preset id to name its variant. */
  readonly idSuffix?: string
  /**
   * Display name of the source preset inside the variant name.
   *
   * The Host declares its shipped presets without a name — the picker supplies
   * "标准模式" / "Standard mode" from its own dictionary — so a variant built from
   * `preset.name ?? preset.id` would read "standard · …" in both languages.
   * Returning `undefined` keeps that fallback, which is what a user-authored
   * preset (which does declare a name) needs.
   */
  readonly displayName?: (source: AgentPreset) => string | undefined
  /** Appended to the source preset's display name. */
  readonly displaySuffix?: string
  /**
   * Description shown for one variant in the Host's preset picker.
   *
   * The Host's own preset declarations carry no description, so a variant would
   * otherwise render as "No description." next to a name that only repeats the
   * source id. Returning `undefined` keeps whatever the source preset declares.
   */
  readonly describeVariant?: (source: AgentPreset) => string | undefined
}

/** Handle returned by {@link installCompressionVariants}. */
export interface PresetOverlayInstallation {
  /** Ids of the variants this installation published. */
  readonly ids: readonly string[]
  /** Settlement of the publication; rejects when a variant could not be declared. */
  ready(): Promise<void>
  /** Withdraw every published variant. */
  dispose(): Promise<void>
}

/** Separates a variant id from the native preset it was derived from. */
export const DEFAULT_VARIANT_ID_SUFFIX = '--compression'

/** Marks a variant in the selection roster next to its native source. */
const DEFAULT_DISPLAY_SUFFIX = 'Context compression'

/** Presets that ship no tool surface to compress. */
const DEFAULT_EXCLUDED_PRESET_IDS: readonly string[] = ['minimal']

/**
 * Resolve the three compression package entries once from this package.
 * @returns Absolute entry paths for the canonical compression layer.
 */
export function resolveCompressionModulePaths(): CompressionModulePaths {
  return {
    compactionBasic: modulePath(
      '@deepseek-ai/dsh-compaction-basic', import.meta.resolve('@deepseek-ai/dsh-compaction-basic')),
    commandCompact: modulePath(
      '@deepseek-ai/dsh-command-compact', import.meta.resolve('@deepseek-ai/dsh-command-compact')),
    toolResultPruner: modulePath(
      'dsh-context-compression-selector-runtime', import.meta.resolve('dsh-context-compression-selector-runtime')),
  }
}

/**
 * Convert one package resolution into the module name a declaration accepts.
 *
 * The registry mounts a declaration under the DECLARING Loader's base, so a
 * composition must name its modules absolutely — and it must name them as
 * `file:` URLs: a native Windows path is not a resolvable ESM specifier, so a
 * `C:\…\lib\index.js` row silently never starts.
 */
function modulePath(specifier: string, resolved: string): string {
  if (!resolved.startsWith('file:')) {
    throw new Error(`context-compression selector: ${specifier} resolved outside the filesystem (${resolved})`)
  }
  return resolved
}

/** One installation's view over the variants it published. */
interface PublishedVariant {
  readonly release: () => Promise<void>
}

/** Leased variants installed on one registry by every row sharing them. */
interface SharedVariants {
  /** Canonical options prevent two rows from silently requesting different stacks. */
  readonly optionsKey: string
  /** Variant ids and their registry disposers. */
  readonly publisher: VariantPublisher
  /** Number of live plugin fibers leasing this publication. */
  references: number
}

/**
 * Cordis can hand two callers different traceable proxies for one service.
 * Symbol properties forward to the shared target, unlike proxy identity.
 */
const SHARED_VARIANTS = Symbol.for(
  'dsh-context-compression-selector/preset-variants',
)

/**
 * Publish one compression variant per applicable native preset.
 *
 * Duplicate rows (for example a Harness-bundled selector row beside the
 * standalone Bundle) share one publication, so either row can unload first
 * without withdrawing variants the other still shows in the roster.
 * @param registry Native AgentPreset registry declarations are read from and published to.
 * @param options Canonical module paths, exclusions, and naming.
 * @returns A reference-counted handle that publishes synchronously and withdraws every variant on final disposal.
 */
export function installCompressionVariants(
  registry: PresetVariantRegistry,
  options: PresetOverlayOptions,
): PresetOverlayInstallation {
  const carrier = registry as PresetVariantRegistry & { [SHARED_VARIANTS]?: SharedVariants }
  let shared = carrier[SHARED_VARIANTS]
  if (shared === undefined) {
    shared = { optionsKey: optionsKey(options), publisher: new VariantPublisher(registry, options), references: 0 }
    Object.defineProperty(carrier, SHARED_VARIANTS, {
      configurable: true,
      enumerable: false,
      writable: false,
      value: shared,
    })
  } else if (shared.optionsKey !== optionsKey(options)) {
    throw new Error('context-compression selector: AgentPresets already has a different compression overlay')
  }
  const lease = shared
  lease.references += 1
  const published = lease.publisher.publish()
  // Publication is ownerless once it is detached from the caller's fiber: it
  // must never surface as an unhandled rejection, and callers that care
  // observe failures through {@link PresetOverlayInstallation.ready}.
  published.catch(() => {})
  let disposed = false
  return {
    get ids(): readonly string[] {
      return lease.publisher.ids
    },
    ready: () => published,
    async dispose(): Promise<void> {
      if (disposed) return
      disposed = true
      try {
        await published
      } catch {
        // A publication that failed still owns whatever it registered.
      }
      lease.references -= 1
      if (lease.references !== 0) return
      if (carrier[SHARED_VARIANTS] === lease) {
        Reflect.deleteProperty(carrier, SHARED_VARIANTS)
      }
      await lease.publisher.dispose()
    },
  }
}

/** Stable equality for two rows asking to share one publication. */
function optionsKey(options: PresetOverlayOptions): string {
  return JSON.stringify({
    modules: options.modules,
    excludedPresetIds: [...(options.excludedPresetIds ?? DEFAULT_EXCLUDED_PRESET_IDS)].sort(),
    idSuffix: options.idSuffix ?? DEFAULT_VARIANT_ID_SUFFIX,
    displaySuffix: options.displaySuffix ?? DEFAULT_DISPLAY_SUFFIX,
  })
}

/** Owns the declarations one installation published and their withdrawal. */
class VariantPublisher {
  private readonly variants = new Map<string, PublishedVariant>()
  private disposed = false
  /** Serializes concurrent publications; never rejected, so the chain survives a failure. */
  private queue: Promise<void> = Promise.resolve()

  constructor(
    private readonly registry: PresetVariantRegistry,
    private readonly options: PresetOverlayOptions,
  ) {
    const paths = Object.entries(options.modules) as [keyof CompressionModulePaths, string][]
    for (const [name, path] of paths) {
      if (!isModuleUrl(path)) {
        throw new TypeError(`context-compression selector: module ${name} is not a file: URL: ${path}`)
      }
    }
  }

  /** Ids of the variants published so far. */
  get ids(): readonly string[] {
    return [...this.variants.keys()]
  }

  /**
   * Publish one variant per applicable native preset.
   *
   * Concurrent calls (two rows leasing the same publication) are serialized,
   * because registering an id twice is refused by the registry.
   */
  publish(): Promise<void> {
    const next = async (): Promise<void> => await this.publishOnce()
    const task = this.queue.then(next, next)
    this.queue = task.catch(() => {})
    return task
  }

  /**
   * Publish every missing variant.
   *
   * A variant whose id is already declared is left to its owner: that is the
   * ordinary reinstall shape (this installation's second lease) and the shape
   * left behind by a process that died before its withdraw.
   *
   * One source preset that cannot be composed does not withdraw the others: its
   * failure is collected and every remaining source is still published, because a
   * single unusable document must not cost the profile its whole compression
   * stack. All failures are reported together as one rejection for the caller to
   * log.
   */
  private async publishOnce(): Promise<void> {
    const suffix = this.options.idSuffix ?? DEFAULT_VARIANT_ID_SUFFIX
    const native = await this.registry.list()
    const declared = new Set(native.map(preset => preset.id))
    const failures: { id: string, error: unknown }[] = []
    for (const preset of native) {
      if (this.disposed) return
      if (!isPublishable(preset, suffix, this.excluded())) continue
      const id = `${preset.id}${suffix}`
      if (this.variants.has(id) || declared.has(id)) continue
      try {
        const rows = await this.composeRows(preset.id)
        const description = this.options.describeVariant?.(preset) ?? preset.description
        const source = this.options.displayName?.(preset) ?? preset.name ?? preset.id
        const release = await this.registry.register({
          id,
          name: `${source} · ${this.options.displaySuffix ?? DEFAULT_DISPLAY_SUFFIX}`,
          ...(description === undefined ? {} : { description }),
          ...(preset.order === undefined ? {} : { order: preset.order }),
          plugins: rows,
        })
        this.variants.set(id, { release })
      } catch (error: unknown) {
        failures.push({ id, error })
      }
    }
    if (failures.length === 1) {
      // One failure keeps its own message: it names the actual defect (an
      // unusable document, a non-finite threshold) better than a wrapper can.
      throw failures[0]!.error
    }
    if (failures.length > 1) {
      throw new AggregateError(
        failures.map(failure => new Error(
          `context-compression selector: cannot publish preset variant ${failure.id}`, { cause: failure.error })),
        'context-compression selector: preset variant publication failed',
      )
    }
  }

  /** Withdraw every published variant, reporting the first failure last. */
  async dispose(): Promise<void> {
    this.disposed = true
    await this.queue.catch(() => {})
    const entries = [...this.variants.entries()]
    this.variants.clear()
    const failures: unknown[] = []
    for (const [id, variant] of entries.reverse()) {
      try {
        await variant.release()
      } catch (error: unknown) {
        failures.push(new Error(`context-compression selector: cannot withdraw preset variant ${id}`, { cause: error }))
      }
    }
    if (failures.length !== 0) throw new AggregateError(failures, 'context-compression selector: preset variant disposal failed')
  }

  private excluded(): ReadonlySet<string> {
    return new Set(this.options.excludedPresetIds ?? DEFAULT_EXCLUDED_PRESET_IDS)
  }

  /** Source rows with every prior compression implementation replaced by ours. */
  private async composeRows(sourceId: string): Promise<EntryOptions[]> {
    const document = await this.registry.readDocument(sourceId)
    const thresholdPercent = this.options.autoCompactThresholdPercent?.()
    if (thresholdPercent !== undefined && !Number.isFinite(thresholdPercent)) {
      // JSON.stringify maps NaN to null and the YAML dump would serialize it as
      // `.nan`; refuse a coin-flip composition instead.
      throw new Error(
        `context-compression selector: Auto Compact threshold percent must be finite, got ${String(thresholdPercent)}`,
      )
    }
    const rows = parseRows(document.content, sourceId)
    return applyEntryPatches(
      stripCompressionRows(rows),
      [{ insert: canonicalCompressionRows(this.options.modules, thresholdPercent) }],
      (message: string, ...args: unknown[]) => {
        throw new Error(renderPatchWarning(message, args))
      },
    )
  }
}

/** Whether one roster entry is a native preset that still needs a variant. */
function isPublishable(
  preset: AgentPreset,
  suffix: string,
  excluded: ReadonlySet<string>,
): boolean {
  if (preset.broken !== undefined) return false
  if (excluded.has(preset.id)) return false
  // Never derive from our own variants: their rows already carry the stack.
  return !preset.id.endsWith(suffix)
}

/** Parse one native preset with exactly the Loader's YAML dialect. */
function parseRows(source: string, id: string): EntryOptions[] {
  const parsed = load(source, { schema: entryListSchema })
  if (!Array.isArray(parsed)) {
    throw new TypeError(`context-compression selector: preset ${id} is not a top-level entry list`)
  }
  return parsed as EntryOptions[]
}

/** Remove any prior compression implementation before adding the canonical one. */
function stripCompressionRows(rows: EntryOptions[]): EntryOptions[] {
  const kept: EntryOptions[] = []
  for (const row of rows) {
    if (COMPRESSION_IDS.has(row.id) || COMPRESSION_PACKAGES.has(row.name)) continue
    if (row.group === true && Array.isArray(row.config)) {
      const nested = row.config as unknown as EntryOptions[]
      kept.push({ ...row, config: stripCompressionRows(nested) })
    } else {
      kept.push(row)
    }
  }
  return kept
}

/** Whether one declaration row name is a resolvable filesystem module URL. */
function isModuleUrl(value: string): boolean {
  return URL.canParse(value) && new URL(value).protocol === 'file:'
}

const COMPRESSION_IDS = new Set([
  'compaction',
  'compaction-basic',
  'command-compact',
  'tool-result-pruner',
])

const COMPRESSION_PACKAGES = new Set([
  '@deepseek-ai/dsh-compaction-basic',
  '@deepseek-ai/dsh-command-compact',
  '@deepseek-ai/dsh-compaction-tool-result-pruner',
  'dsh-context-compression-selector-runtime',
])

/**
 * Complete, same-realm compression stack added to every applicable preset.
 * When the Host settings expose an Auto Compact threshold, one read feeds both
 * the compaction-basic `thresholdRatio` (beside the pinned first-release
 * `retainRatio`) and the runtime deployment config, so plugin History and
 * native Auto Compact share one watermark for this whole generation.
 */
export function canonicalCompressionRows(
  modules: CompressionModulePaths,
  thresholdPercent?: number,
): EntryOptions[] {
  return [
    {
      id: 'compaction',
      name: 'cordis:group',
      group: true,
      isolate: {
        compaction: true,
        toolResultPruner: true,
      },
      config: [
        {
          id: 'compaction-basic',
          name: modules.compactionBasic,
          ...(thresholdPercent === undefined ? {} : {
            config: {
              thresholdRatio: thresholdPercent / 100,
              retainRatio: 0.16,
            },
          }),
        },
        {
          id: 'command-compact',
          name: modules.commandCompact,
        },
        {
          id: 'tool-result-pruner',
          name: modules.toolResultPruner,
          config: {
            headChars: 4096,
            tailChars: 1024,
            ...(thresholdPercent === undefined ? {} : { autoCompactThresholdPercent: thresholdPercent }),
          },
        },
      ],
    },
  ]
}

/** Render include's printf-style warning without silently losing its target. */
function renderPatchWarning(message: string, args: readonly unknown[]): string {
  let index = 0
  return `context-compression selector: ${message.replace(/%C/g, () => JSON.stringify(args[index++]))}`
}
