import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../../..')

describe('standalone package contract', () => {
  it('keeps two packages and one install-facing dependency edge', () => {
    const selector = JSON.parse(readFileSync(resolve(root, 'selector/package.json'), 'utf8')) as {
      name: string
      version: string
      dependencies?: Record<string, string>
      peerDependencies?: Record<string, string>
      publishConfig?: { tag?: string }
    }
    const runtime = JSON.parse(readFileSync(resolve(root, 'runtime/package.json'), 'utf8')) as {
      name: string
      version: string
      dependencies?: Record<string, string>
      publishConfig?: { tag?: string }
    }
    expect(selector.name).toBe('dsh-context-compression-selector')
    expect(runtime.name).toBe('dsh-context-compression-selector-runtime')
    expect(selector.dependencies?.['dsh-context-compression-selector-runtime']).toBe(runtime.version)
    expect(runtime.dependencies?.['@huggingface/tokenizers']).toBe('0.1.3')
    expect(Object.keys(selector.peerDependencies ?? {})).not.toContain('@deepseek-ai/dsh-compaction-tool-result-pruner')
    // The peer floor tracks the release series: a plugin built against 0.2.2
    // must not resolve against an earlier 0.2.2 prerelease whose surface it
    // does not match. Deriving it from `version` keeps that invariant checked
    // without a second place to bump on every release.
    const floor = `>=${selector.version} <0.3.0`
    expect(selector.peerDependencies?.['@deepseek-ai/dsh-compaction-basic']).toBe(floor)
    expect(selector.peerDependencies?.['@deepseek-ai/dsh-command-compact']).toBe(floor)
    expect(selector.publishConfig?.tag).toBe('latest')
    expect(runtime.publishConfig?.tag).toBe('latest')
  })

  it('uses the community package in the one Bundle patch', () => {
    const patch = readFileSync(resolve(root, 'selector/cordis.patch.yml'), 'utf8')
    expect(patch).toContain("name: 'dsh-context-compression-selector'")
    expect(patch).not.toContain('@deepseek-ai/dsh-client-ui-context-compression-selector')
  })
})
