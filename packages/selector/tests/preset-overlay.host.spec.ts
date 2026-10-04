import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import { afterEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_VARIANT_ID_SUFFIX,
  installCompressionVariants,
  type CompressionModulePaths,
  type PresetOverlayInstallation,
} from '../src/preset-overlay.ts'
import {
  FakePresetRegistry,
  flattenedRows,
  rowsYaml,
  type SourcePreset,
} from './support/preset-registry.ts'

/**
 * Row names are `file:` URLs: the registry mounts a declaration under the
 * declaring Loader's base, and a native Windows path is not a resolvable
 * specifier (the row would silently never start).
 */
const MODULES: CompressionModulePaths = {
  compactionBasic: 'file:///opt/context-selector/compaction-basic.js',
  commandCompact: 'file:///opt/context-selector/command-compact.js',
  toolResultPruner: 'file:///opt/context-selector/tool-result-pruner.js',
}

/** A native declaration carrying its own older compression implementation. */
const STANDARD_ROWS: EntryOptions[] = [
  { id: 'persona', name: '/opt/preset/persona.js' },
  { id: 'tool-context-retrieve', name: '@deepseek-ai/dsh-tool-context-retrieve' },
  {
    id: 'compaction',
    name: 'cordis:group',
    group: true,
    isolate: { compaction: true, toolResultPruner: true },
    config: [
      { id: 'compaction-basic', name: '@deepseek-ai/dsh-compaction-basic' },
      { id: 'command-compact', name: '@deepseek-ai/dsh-command-compact' },
      { id: 'tool-result-pruner', name: '@deepseek-ai/dsh-compaction-tool-result-pruner' },
    ],
  },
]

const MINIMAL_ROWS: EntryOptions[] = [
  { id: 'persona', name: '/opt/preset/minimal.js' },
]

const SOURCES: readonly SourcePreset[] = [
  { id: 'standard', rows: STANDARD_ROWS },
  { id: 'minimal', rows: MINIMAL_ROWS },
]

const installations: PresetOverlayInstallation[] = []

function install(
  registry: FakePresetRegistry,
  options: Partial<Parameters<typeof installCompressionVariants>[1]> = {},
): Promise<PresetOverlayInstallation> {
  const installation = installCompressionVariants(registry, {
    modules: MODULES,
    excludedPresetIds: ['minimal'],
    ...options,
  })
  installations.push(installation)
  return Promise.resolve(installation)
}

afterEach(async () => {
  await Promise.all(installations.splice(0).reverse().map(async installation => await installation.dispose()))
})

describe('plugin-owned preset overlay variants', () => {
  it('publishes one variant per applicable native preset and leaves the source alone', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const installation = await install(registry)
    await installation.ready()

    expect([...registry.registered.keys()]).toEqual([`standard${DEFAULT_VARIANT_ID_SUFFIX}`])

    const variant = registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)
    expect(variant).toBeDefined()
    // The source declaration is never rewritten: only a sibling is declared.
    expect((await registry.readDocument('standard')).content).toBe(rowsYaml(STANDARD_ROWS))
    expect(flattenedRows(variant!).filter(row => row.id === 'persona')).toHaveLength(1)

    const rows = flattenedRows(variant!)
    expect(rows.filter(row => row.id === 'tool-context-retrieve')).toHaveLength(1)
    expect(rows.find(row => row.id === 'tool-context-retrieve')?.name)
      .toBe('@deepseek-ai/dsh-tool-context-retrieve')
    await installation.dispose()
  })

  it('replaces the prior compression rows instead of adding a second stack', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const installation = await install(registry)
    await installation.ready()

    const rows = flattenedRows(registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)!)
    expect(rows.filter(row => row.id === 'compaction')).toHaveLength(1)
    expect(rows.filter(row => row.id === 'compaction-basic')).toHaveLength(1)
    expect(rows.filter(row => row.id === 'command-compact')).toHaveLength(1)
    expect(rows.filter(row => row.id === 'tool-result-pruner')).toHaveLength(1)
    expect(rows.filter(row => row.name === '@deepseek-ai/dsh-compaction-tool-result-pruner')).toHaveLength(0)
    expect(rows.find(row => row.id === 'tool-result-pruner')?.name).toBe(MODULES.toolResultPruner)
    expect(rows.find(row => row.id === 'compaction-basic')?.name).toBe(MODULES.compactionBasic)
    expect(rows.find(row => row.id === 'command-compact')?.name).toBe(MODULES.commandCompact)
  })

  it('never derives a variant from Minimal or from a broken source', async () => {
    const registry = new FakePresetRegistry([
      { id: 'standard', rows: STANDARD_ROWS },
      { id: 'minimal', rows: MINIMAL_ROWS },
      { id: 'damaged', rows: MINIMAL_ROWS, broken: 'import failed' },
    ])
    const installation = await install(registry)
    await installation.ready()

    expect([...registry.registered.keys()]).toEqual([`standard${DEFAULT_VARIANT_ID_SUFFIX}`])
  })

  it('keeps the other variants when sources cannot be composed', async () => {
    const registry = new FakePresetRegistry([
      { id: 'standard', rows: STANDARD_ROWS },
      { id: 'minimal', rows: MINIMAL_ROWS },
      // Documents that are not top-level entry lists. Composing one used to
      // abort the whole pass, so a single unusable source cost the profile every
      // compression variant and the rejection was swallowed by the caller.
      { id: 'damaged-a', rows: { not: 'an entry list' } as never },
      { id: 'damaged-b', rows: 'neither is this' as never },
    ])
    const installation = await install(registry)
    await expect(installation.ready()).rejects.toThrow(/preset variant publication failed/u)
    expect([...registry.registered.keys()]).toEqual([`standard${DEFAULT_VARIANT_ID_SUFFIX}`])
  })

  it('never derives a variant from one of its own variants', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const installation = await install(registry)
    await installation.ready()

    const before = new Set(registry.registered.keys())
    // A second publication pass sees the first pass' variants in the roster;
    // they must not be treated as native sources needing another variant.
    const second = installCompressionVariants(registry, {
      modules: MODULES,
      excludedPresetIds: ['minimal'],
    })
    installations.push(second)
    await second.ready()

    expect([...registry.registered.keys()].sort()).toEqual([...before].sort())
  })

  it('feeds one Auto Compact read into both the compaction ratio and the runtime config', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const installation = await install(registry, { autoCompactThresholdPercent: () => 73 })
    await installation.ready()

    const yaml = rowsYaml(registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)!.plugins as EntryOptions[])
    expect(yaml).toContain('thresholdRatio: 0.73')
    // First-release retention stays pinned beside the threshold.
    expect(yaml).toContain('retainRatio: 0.16')
    expect(yaml).toContain('autoCompactThresholdPercent: 73')
  })

  it('omits both threshold fields when no threshold is available', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const installation = await install(registry, { autoCompactThresholdPercent: () => undefined })
    await installation.ready()

    const yaml = rowsYaml(registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)!.plugins as EntryOptions[])
    expect(yaml).not.toContain('thresholdRatio')
    expect(yaml).not.toContain('autoCompactThresholdPercent')
  })

  it('refuses a non-finite threshold instead of composing a NaN identity', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const installation = await install(registry, { autoCompactThresholdPercent: () => Number.NaN })
    await expect(installation.ready()).rejects.toThrow(/must be finite/u)

    expect(registry.registered.size).toBe(0)
  })

  it('names the variant after its source and inherits ordering', async () => {
    const registry = new FakePresetRegistry([
      { id: 'standard', name: 'Standard', description: 'native', order: 3, rows: STANDARD_ROWS },
    ])
    const installation = await install(registry)
    await installation.ready()

    const variant = registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)
    expect(variant?.name).toBe('Standard · Context compression')
    expect(variant?.description).toBe('native')
    expect(variant?.order).toBe(3)
  })

  it('describes each variant through the caller-supplied formatter', async () => {
    const registry = new FakePresetRegistry([
      { id: 'standard', description: 'native', rows: STANDARD_ROWS },
    ])
    const installation = await install(registry, { describeVariant: source => `over ${source.id}` })
    await installation.ready()

    expect(registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)?.description).toBe('over standard')
  })

  it('withdraws every variant on disposal and restores an empty roster', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const installation = await install(registry)
    await installation.ready()
    expect(registry.registered.size).toBe(1)

    await installation.dispose()
    expect(registry.registered.size).toBe(0)
    expect((await registry.list()).map(preset => preset.id)).toEqual(['standard', 'minimal'])
  })

  it('shares one publication across duplicate Bundle and built-in rows', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    const first = await install(registry)
    const second = await install(registry)
    await Promise.all([first.ready(), second.ready()])

    expect([...registry.registered.keys()]).toEqual([`standard${DEFAULT_VARIANT_ID_SUFFIX}`])

    await first.dispose()
    expect(registry.registered.size).toBe(1)

    await second.dispose()
    expect(registry.registered.size).toBe(0)
  })

  it('refuses to share one publication across different module sets', async () => {
    const registry = new FakePresetRegistry(SOURCES)
    await install(registry)
    expect(() => installCompressionVariants(registry, {
      modules: { ...MODULES, commandCompact: 'file:///opt/other/command-compact.js' },
      excludedPresetIds: ['minimal'],
    })).toThrow(/different compression overlay/u)
  })

  it('requires filesystem module URLs', () => {
    const registry = new FakePresetRegistry(SOURCES)
    expect(() => installCompressionVariants(registry, {
      modules: { ...MODULES, toolResultPruner: 'https://example.test/pruner.js' },
    })).toThrow(/not a file: URL/u)
  })
})
