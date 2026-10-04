/**
 * Regression: a live-editable Config field must survive the settings round trip.
 *
 * `SettingsForms.describe` serves each volatile field's form schema as
 * `schema.toJSON()` and `ConfigFormController.decode` rehydrates that envelope to
 * validate the value it was served. A schemastery `transform` cannot make that
 * trip — the serialized node keeps its `transform` type and inner schema but no
 * callback — so a marked field carrying one fails its own rehydrated schema with
 * `callback is not a function`. The client then never leaves `loading` (a decode
 * failure is indistinguishable from an unfinished read) and renders every control
 * from that form disabled, which is what turned the Plugins page into a grey,
 * unusable form.
 *
 * The helpers below mirror the shipped Host functions
 * (`@deepseek-ai/dsh-settings` `volatileForm`, `plainSchema`, `projectForm`) so
 * this spec asserts that contract without needing a Harness install.
 */
import Schema from '@deepseek-ai/schemastery'
import { DEFAULT_CUSTOM_COMPRESSION_POLICY } from 'dsh-context-compression-selector-runtime'
import { describe, expect, it } from 'vitest'
import { Config } from '../src/index.ts'
import { decodeSettings } from '../src/client/decode.ts'

/** Unwrap a schemastery volatile wrapper; the Host's `plainConfig` does the same. */
function plain(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && typeof (value as { get?: unknown }).get === 'function') {
    return plain((value as { get: () => unknown }).get())
  }
  if (Array.isArray(value)) return value.map(plain)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, plain(child)]))
  }
  return value
}

/** Rehydrate and de-mark one field's schema, as `plainSchema` does before serving it. */
function plainSchema(schema: Schema): Schema {
  const result = new Schema(schema.toJSON() as Schema)
  const walk = (node: Schema): void => {
    delete node.meta.volatile
    for (const child of Object.values(node.dict ?? {})) walk(child)
    if (node.inner) walk(node.inner)
    for (const child of node.list ?? []) walk(child)
  }
  walk(result)
  return result
}

/** The one form the Host serves for a row: its volatile fields only. */
function volatileForm(schema: Schema): Schema | undefined {
  if (schema.meta.volatile) return plainSchema(schema)
  if (schema.type !== 'object') return undefined
  const dict = Object.fromEntries(Object.entries(schema.dict ?? {}).flatMap(([key, child]) => {
    const field = volatileForm(child)
    return field === undefined ? [] : [[key, field]]
  }))
  return Object.keys(dict).length === 0 ? undefined : Schema.object(dict)
}

/** Project only the fields the served form declares, as `projectForm` does. */
function projectForm(schema: Schema, value: unknown): unknown {
  if (schema.type === 'object' && value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(schema.dict ?? {}).flatMap(([key, child]) => {
      const field = Reflect.get(value, key)
      return field === undefined ? [] : [[key, projectForm(child, field)]]
    }))
  }
  return value
}

/** The envelope a client receives, after the JSON the wire actually carries. */
function servedEnvelope(form: Schema): Schema {
  return new Schema(JSON.parse(JSON.stringify(form.toJSON())) as Schema)
}

/**
 * Project a served Host section into the document the browser decodes: the
 * client's `decodeEntrySettings` moves the flat `autoCompactThresholdPercent`
 * field into its nested `autoCompact` section before {@link decodeSettings}.
 */
function clientDocument(value: unknown): unknown {
  const { profile, custom, autoCompactThresholdPercent } = value as Record<string, unknown>
  return {
    profile,
    custom,
    ...autoCompactThresholdPercent === undefined
      ? {}
      : { autoCompact: { thresholdPercent: autoCompactThresholdPercent } },
  }
}

const LEGACY_V1_CUSTOM = {
  version: 1,
  unit: 'tokens',
  fresh: { enabled: true, trigger: 8_192, target: 3_072 },
  aggregate: { enabled: true, trigger: 32_768, target: 12_288 },
  history: { enabled: true, trigger: 500_000, keepRecentTurns: 10, keepRecent: 64_000, minReclaim: 96_000 },
  prefixPolicy: 'pressure-break',
}

describe('live-editable settings schema', () => {
  it('serves a JSON envelope the browser can rehydrate and validate', () => {
    const form = volatileForm(Config)
    expect(form).toBeDefined()
    const envelope = servedEnvelope(form as Schema)

    // The regression itself: a transform survives toJSON() as an unusable node.
    expect(JSON.stringify(envelope.toJSON())).not.toContain('"transform"')

    const documents = [
      {
        profile: 'balanced',
        custom: structuredClone(DEFAULT_CUSTOM_COMPRESSION_POLICY),
        autoCompactThresholdPercent: 80,
      },
      { profile: 'off', custom: structuredClone(DEFAULT_CUSTOM_COMPRESSION_POLICY), autoCompactThresholdPercent: 50 },
      { profile: 'custom', custom: structuredClone(LEGACY_V1_CUSTOM), autoCompactThresholdPercent: 90 },
    ]
    for (const document of documents) {
      expect(() => envelope(document)).not.toThrow()
      // The client's own decoder consumes exactly this document.
      expect(decodeSettings(clientDocument(document))?.profile).toBe(document.profile)
    }
  })

  it('validates the document a fresh row resolves to', () => {
    const resolved = plain(Config({ presetOverlay: true }))
    const form = volatileForm(Config) as Schema
    const value = projectForm(form, resolved)
    expect(value).toMatchObject({ profile: 'balanced', autoCompactThresholdPercent: 80 })
    expect(() => servedEnvelope(form)(value)).not.toThrow()
    expect(decodeSettings(clientDocument(value))?.profile).toBe('balanced')
  })

  it('keeps presetOverlay out of the served form', () => {
    const form = volatileForm(Config) as Schema
    expect(Object.keys(form.dict ?? {})).toEqual(['profile', 'custom', 'autoCompactThresholdPercent'])
  })
})
