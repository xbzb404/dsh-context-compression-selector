/**
 * Standalone selector Bundle published through the REAL 0.2.0 preset registry.
 *
 * Everything below runs the actual registry, Loader, and compression packages:
 * the source presets are declared the way a harness declares them, the Bundle
 * row publishes its variants beside them, and an Agent mounted on a variant
 * must come up with the complete compression stack while the source preset
 * stays exactly as declared.
 */

import { Context } from '@deepseek-ai/cordis'
import Group from '@deepseek-ai/cordis-plugin-group'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import AgentRegistry, { type Agent } from '@deepseek-ai/dsh-agent'
import AgentLoop from '@deepseek-ai/dsh-agent-loop'
import AgentPresetRegistry from '@deepseek-ai/dsh-agent-preset-registry'
import CommandRuntime from '@deepseek-ai/dsh-commands'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import SessionProjections from '@deepseek-ai/dsh-session-projection'
import { scopeOf } from '@deepseek-ai/dsh-scope'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import TokenMeter from '@deepseek-ai/dsh-token-meter'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { apply } from '../src/index.ts'
import { DEFAULT_VARIANT_ID_SUFFIX } from '../src/preset-overlay.ts'

const CORDIS_ORIGINAL = Symbol.for('cordis.original')
type Traceable = { [CORDIS_ORIGINAL]?: unknown }

let ctx: Context | undefined
let root: string | undefined

afterEach(async () => {
  await ctx?.fiber.dispose()
  ctx = undefined
  if (root !== undefined) await rm(root, { recursive: true, force: true })
  root = undefined
})

/** Importable marker row every source preset declares. */
async function markerModule(): Promise<string> {
  root = await mkdtemp(join(tmpdir(), 'dsh-selector-registry-e2e-'))
  const marker = join(root, 'marker.mjs')
  await writeFile(marker, 'export function apply() {}\n')
  return marker
}

async function harness(options: Parameters<typeof apply>[1] = {}): Promise<Context> {
  const marker = await markerModule()
  const runtime = new Context()
  runtime.baseUrl = `${pathToFileURL(root!).href}/`
  await runtime.plugin(Loader)
  runtime.loader.builtins.include = Include
  runtime.loader.builtins.group = Group
  await runtime.plugin(LlmRuntime)
  await runtime.plugin(SessionStore)
  await runtime.plugin(SessionProjections)
  await runtime.plugin(SystemPrompt)
  await runtime.plugin(ToolRuntime)
  await runtime.plugin(AgentRegistry)
  await runtime.plugin(AgentLoop, { agents: [] })
  await runtime.plugin(CommandRuntime)
  await runtime.plugin(TokenMeter)
  // The registry replaces 0.1.x directory discovery: a deployment declares its
  // own presets, exactly as the harness now does for its shipped ones.
  await runtime.plugin(AgentPresetRegistry, { default: 'standard' })
  const rows = [{ id: 'source-marker', name: './marker.mjs' }]
  await runtime.agentPresets.register({ id: 'standard', plugins: rows })
  await runtime.agentPresets.register({ id: 'minimal', plugins: rows })
  await runtime.plugin({ apply: child => apply(child, options) }).await()
  ctx = runtime
  return runtime
}

/** Wait for the ownerless publication the Host row kicked off. */
async function publishedVariant(runtime: Context, id: string): Promise<void> {
  for (let tick = 0; tick < 200; tick += 1) {
    const roster = await runtime.agentPresets.list()
    if (roster.some(preset => preset.id === id)) return
    await new Promise(resolve => setTimeout(resolve, 5))
  }
  throw new Error(`timed out waiting for preset variant ${id}`)
}

async function agentOn(runtime: Context, sessionId: string, preset: string): Promise<Agent> {
  const handle = await runtime.agents.create({
    sessionId: SessionId(sessionId),
    setup: async agentCtx => void await runtime.agentPresets.mount(agentCtx, preset),
  })
  return handle.agent
}

function hasCompressionRetrieve(runtime: Context, agent: Agent): boolean {
  return runtime.tools.get('context_compression_retrieve', scopeOf(agent.ctx)) !== undefined
}

function hasCompactCommand(runtime: Context, agent: Agent): boolean {
  return runtime.commands.list(agent).some(command => command.name === 'compact')
}

function expectCompleteCompressionStack(runtime: Context, agent: Agent): void {
  expect(runtime.agentPresets.serviceFor(agent, 'toolResultPruner')).toBeDefined()
  expect(runtime.agentPresets.serviceFor(agent, 'compaction')).toBeDefined()
  expect(hasCompressionRetrieve(runtime, agent)).toBe(true)
  expect(hasCompactCommand(runtime, agent)).toBe(true)
}

function expectNoCompressionStack(runtime: Context, agent: Agent): void {
  expect(runtime.agentPresets.serviceFor(agent, 'toolResultPruner')).toBeUndefined()
  expect(runtime.agentPresets.serviceFor(agent, 'compaction')).toBeUndefined()
  expect(hasCompressionRetrieve(runtime, agent)).toBe(false)
  expect(hasCompactCommand(runtime, agent)).toBe(false)
}

describe('standalone selector Bundle through the real 0.2.0 preset registry', () => {
  it('mounts the complete stack on a variant without touching the source preset', async () => {
    const runtime = await harness({ presetOverlay: true })
    const variantId = `standard${DEFAULT_VARIANT_ID_SUFFIX}`
    await publishedVariant(runtime, variantId)

    const source = await runtime.agentPresets.readDocument('standard')
    expect(source.content).not.toContain('tool-result-pruner')
    expect((await runtime.agentPresets.resolve('standard')).broken).toBeUndefined()

    const agent = await agentOn(runtime, 'selector-registry-standard', variantId)
    expectCompleteCompressionStack(runtime, agent)
    // The source declaration is still its own preset, untouched by the variant.
    expect((await runtime.agentPresets.readDocument('standard')).content).toBe(source.content)
  })

  it('publishes no variant for Minimal', async () => {
    const runtime = await harness({ presetOverlay: true })
    await publishedVariant(runtime, `standard${DEFAULT_VARIANT_ID_SUFFIX}`)

    const roster = await runtime.agentPresets.list()
    expect(roster.some(preset => preset.id === `minimal${DEFAULT_VARIANT_ID_SUFFIX}`)).toBe(false)
    const agent = await agentOn(runtime, 'selector-registry-minimal', 'minimal')
    expectNoCompressionStack(runtime, agent)
  })

  it('gives a child the parent\'s exact compression service instances', async () => {
    const runtime = await harness({ presetOverlay: true })
    const variantId = `standard${DEFAULT_VARIANT_ID_SUFFIX}`
    await publishedVariant(runtime, variantId)

    const parent = await agentOn(runtime, 'selector-registry-parent', variantId)
    const childHandle = await runtime.agents.create({
      sessionId: SessionId('selector-registry-child'),
      setup: childCtx => void runtime.agentPresets.composeFrom(childCtx, parent.ctx),
    })
    const child = childHandle.agent

    const parentPruner = runtime.agentPresets.serviceFor(parent, 'toolResultPruner')
    const childPruner = runtime.agentPresets.serviceFor(child, 'toolResultPruner')
    expect(parentPruner).toBeDefined()
    expect(Object.is(
      (childPruner as Traceable)[CORDIS_ORIGINAL],
      (parentPruner as Traceable)[CORDIS_ORIGINAL],
    )).toBe(true)
    expect(hasCompressionRetrieve(runtime, child)).toBe(true)
    expect(hasCompactCommand(runtime, child)).toBe(true)
  })
})
