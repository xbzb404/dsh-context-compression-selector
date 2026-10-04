/**
 * In-memory stand-in for the 0.2.0 Agent preset registry.
 *
 * Only three registry calls take part in publishing compression variants, so
 * the double models exactly those: a roster of source declarations, one
 * composed-YAML read per declaration, and registration whose disposer behaves
 * like the real one (a second registration of a live id is refused).
 */

import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import type { AgentPreset, PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry'
import { dump, load } from 'js-yaml'
import type { PresetVariantRegistry } from '../../src/preset-overlay.ts'

/** One native declaration the double serves, including its rows. */
export interface SourcePreset extends AgentPreset {
  /** Declared child rows, rendered through the Loader's YAML dialect. */
  readonly rows: readonly EntryOptions[]
}

/** Render rows exactly the way the registry renders a document for reading. */
export function rowsYaml(rows: readonly EntryOptions[]): string {
  return dump(rows, { schema: entryListSchema, noRefs: true, lineWidth: -1, sortKeys: false })
}

/** Parse one composed document back into rows. */
export function rowsAt(content: string): Array<Record<string, unknown>> {
  const parsed = load(content, { schema: entryListSchema })
  if (!Array.isArray(parsed)) throw new TypeError('expected an entry list')
  return parsed as Array<Record<string, unknown>>
}

/** Every row of one declaration, including rows nested inside groups. */
export function flatten(rows: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return rows.flatMap((row) => {
    const nested = row.group === true && Array.isArray(row.config)
      ? flatten(row.config as Array<Record<string, unknown>>)
      : []
    return [row, ...nested]
  })
}

/** One published declaration's rows, flattened for assertions. */
export function flattenedRows(definition: PresetDefinition): Array<Record<string, unknown>> {
  return flatten(definition.plugins as unknown as Array<Record<string, unknown>>)
}

export class FakePresetRegistry implements PresetVariantRegistry {
  private readonly sources = new Map<string, SourcePreset>()
  readonly registered = new Map<string, PresetDefinition>()

  constructor(sources: readonly SourcePreset[]) {
    for (const source of sources) this.sources.set(source.id, source)
  }

  /** Source rows stay readable even after every variant is withdrawn. */
  async list(): Promise<readonly AgentPreset[]> {
    const metadata = (preset: AgentPreset): AgentPreset => ({
      id: preset.id,
      ...(preset.name === undefined ? {} : { name: preset.name }),
      ...(preset.description === undefined ? {} : { description: preset.description }),
      ...(preset.order === undefined ? {} : { order: preset.order }),
      ...(preset.broken === undefined ? {} : { broken: preset.broken }),
    })
    return [...this.sources.values(), ...this.registered.values()].map(metadata)
  }

  async readDocument(id: string): Promise<{ readonly agentPreset: string, readonly content: string }> {
    const source = this.sources.get(id)
    if (source === undefined) throw new Error(`agent-preset/not-found: ${id}`)
    return { agentPreset: id, content: rowsYaml(source.rows) }
  }

  async register(definition: PresetDefinition): Promise<() => Promise<void>> {
    if (this.sources.has(definition.id) || this.registered.has(definition.id)) {
      throw new Error(`agent-preset/invalid: ${definition.id} is already taken`)
    }
    this.registered.set(definition.id, definition)
    return async () => {
      this.registered.delete(definition.id)
    }
  }
}
