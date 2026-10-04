import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import { Context, Service } from '@deepseek-ai/cordis'
import type { AgentPreset, PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry'
import { afterEach, describe, expect, it } from 'vitest'
import { apply } from '../src/index.ts'
import { DEFAULT_VARIANT_ID_SUFFIX, type PresetVariantRegistry } from '../src/preset-overlay.ts'
import { FakePresetRegistry, rowsYaml, type SourcePreset } from './support/preset-registry.ts'

const STANDARD_ROWS: EntryOptions[] = [
  { id: 'persona', name: '/opt/preset/persona.js' },
]

const SOURCES: readonly SourcePreset[] = [
  { id: 'standard', rows: STANDARD_ROWS },
  { id: 'minimal', rows: STANDARD_ROWS },
]

let ctx: Context | undefined

afterEach(async () => {
  await ctx?.fiber.dispose()
  ctx = undefined
})

/** A Cordis service carrying the same three registry calls the overlay composes through. */
class FakeAgentPresets extends Service implements PresetVariantRegistry {
  readonly registry: FakePresetRegistry

  constructor(context: Context, sources: readonly SourcePreset[]) {
    super(context, 'agentPresets')
    this.registry = new FakePresetRegistry(sources)
  }

  async list(): Promise<readonly AgentPreset[]> {
    return await this.registry.list()
  }

  async readDocument(id: string): Promise<{ readonly agentPreset: string, readonly content: string }> {
    return await this.registry.readDocument(id)
  }

  async register(definition: PresetDefinition): Promise<() => Promise<void>> {
    return await this.registry.register(definition)
  }
}

async function harness(options: Parameters<typeof apply>[1] = {}): Promise<{
  runtime: Context
  registry: FakePresetRegistry
  selector: ReturnType<Context['plugin']>
}> {
  const runtime = new Context()
  ctx = runtime
  await runtime.plugin(FakeAgentPresets, SOURCES).await()
  const registry = (runtime as unknown as { agentPresets: FakeAgentPresets }).agentPresets.registry
  const selector = runtime.plugin({ apply: child => apply(child, options) })
  await selector.await()
  return { runtime, registry, selector }
}

/** Wait for the ownerless publication the Host kicked off. */
async function published(registry: FakePresetRegistry, count: number): Promise<void> {
  for (let tick = 0; tick < 200; tick += 1) {
    if (registry.registered.size >= count) return
    await new Promise(resolve => setTimeout(resolve, 5))
  }
  throw new Error(`timed out waiting for ${String(count)} preset variant(s)`)
}

describe('context compression selector Host preset integration', () => {
  it('publishes a variant only while the selector row is enabled', async () => {
    const { runtime, registry, selector } = await harness({ presetOverlay: true })
    await published(registry, 1)

    const variant = registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)
    expect(variant).toBeDefined()
    expect(rowsYaml(variant!.plugins as EntryOptions[])).toContain('id: tool-result-pruner')
    expect(registry.registered.has(`minimal${DEFAULT_VARIANT_ID_SUFFIX}`)).toBe(false)

    await selector.dispose()
    expect(registry.registered.size).toBe(0)
    expect(runtime).toBeDefined()
  })

  it('publishes nothing when the Bundle row leaves the overlay off', async () => {
    const { registry } = await harness()
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(registry.registered.size).toBe(0)
  })

  it('freezes the row-supplied Auto Compact threshold into one generation', async () => {
    const { registry } = await harness({ presetOverlay: true, autoCompactThresholdPercent: 73 })
    await published(registry, 1)

    const yaml = rowsYaml(registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)!.plugins as EntryOptions[])
    expect(yaml).toContain('thresholdRatio: 0.73')
    expect(yaml).toContain('retainRatio: 0.16')
    // The same read feeds the runtime deployment config, so Auto Compact and
    // micro compact cannot split across two thresholds in one generation.
    expect(yaml).toContain('autoCompactThresholdPercent: 73')
  })

  it('falls back to the pinned compaction defaults when no threshold is configured', async () => {
    const { registry } = await harness({ presetOverlay: true })
    await published(registry, 1)

    const yaml = rowsYaml(registry.registered.get(`standard${DEFAULT_VARIANT_ID_SUFFIX}`)!.plugins as EntryOptions[])
    expect(yaml).toContain('thresholdRatio: 0.8')
  })

  it('shares one publication across a built-in row and the standalone Bundle row', async () => {
    const runtime = new Context()
    ctx = runtime
    await runtime.plugin(FakeAgentPresets, SOURCES).await()
    const registry = (runtime as unknown as { agentPresets: FakeAgentPresets }).agentPresets.registry

    const builtIn = runtime.plugin({ apply })
    await builtIn.await()
    const bundle = runtime.plugin({ apply: child => apply(child, { presetOverlay: true }) })
    await bundle.await()
    await published(registry, 1)

    expect([...registry.registered.keys()]).toEqual([`standard${DEFAULT_VARIANT_ID_SUFFIX}`])

    await builtIn.dispose()
    expect(registry.registered.size).toBe(1)

    await bundle.dispose()
    expect(registry.registered.size).toBe(0)
  })
})
