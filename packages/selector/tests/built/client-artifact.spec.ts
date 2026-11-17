import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { describe, expect, it } from 'vitest'
import {
  clientRegistrationId,
  retargetClientRegistrationId,
} from '../../../../scripts/lib/selector-identity.mjs'

const artifact = resolve(import.meta.dirname, '../../lib/client.js')

describe('built Harness client artifact', () => {
  it('registers a self-contained lazy-CJS factory and injects its CSS', () => {
    const code = readFileSync(artifact, 'utf8')
    let registration: { id: string, factory: (require: (id: string) => unknown) => unknown } | undefined
    const moduleLoader = {
      load(value: typeof registration) {
        registration = value
      },
    }
    Object.defineProperty(window, '__ModuleLoader__', { configurable: true, value: moduleLoader })

    expect(() => Function(code)()).not.toThrow()
    expect(registration?.id).toBe('dsh-context-compression-selector')

    const modules = new Map<string, unknown>([
      ['react', React],
      ['react/jsx-runtime', jsxRuntime],
      // The current selector only keeps this official package as a side-effect
      // external. A minimal public-module stub proves the artifact asks the
      // Harness loader for it without importing the package's raw CSS in Node.
      ['@deepseek-ai/dsh-client-ui-primitives', {}],
    ])
    const exported = registration?.factory((id) => {
      if (!modules.has(id)) throw new Error(`unexpected client dependency: ${id}`)
      return modules.get(id)
    }) as { apply?: unknown, inject?: unknown }

    expect(exported.apply).toBeTypeOf('function')
    // 0.2.0 serves settings through `ctx.configForms`; the removed
    // `settingsScope` service no longer exists anywhere in the Harness.
    expect(exported.inject).toEqual(['slots', 'locale', 'configForms'])
    const style = document.querySelector<HTMLStyleElement>(
      'style[data-plugin-css="dsh-context-compression-selector/CompressionProfileSelector.module.css"]',
    )
    expect(style?.dataset.plugin).toBe('dsh-context-compression-selector')
    expect(style?.textContent).toContain('profileGrid')
    expect(document.querySelectorAll('style[data-plugin-css]').length).toBe(1)

    registration?.factory((id) => modules.get(id))
    expect(document.querySelectorAll('style[data-plugin-css]').length).toBe(1)
    expect(code).not.toMatch(/^\s*(?:import|export)\s/mu)
    expect(code).not.toMatch(/(?:\/home\/|[A-Za-z]:\\Users\\)/u)
    expect(code).not.toContain('sourceMappingURL')
  })
})

// The Host accepts a client registration only under the resolved manifest
// package name. The tracked artifact is served as-is to a `github:` install, so
// it must announce the workspace name; the npm tarball announces the scoped one.
// Both halves of that pair are asserted here, because the failure they guard is
// silent in the build and loud only in the user's browser.
describe('client registration identity', () => {
  const code = readFileSync(artifact, 'utf8')

  it('announces the unscoped workspace package name', () => {
    expect(clientRegistrationId(code)).toBe('dsh-context-compression-selector')
  })

  it('re-targets the scoped name for the published tarball', () => {
    const scoped = '@xbzb404/dsh-context-compression-selector'
    const retargeted = retargetClientRegistrationId(
      code,
      'dsh-context-compression-selector',
      scoped,
    )
    expect(clientRegistrationId(retargeted)).toBe(scoped)
    // Only the banner id moves. The CSS tag id, `dataset.plugin`, and the
    // settings entry id carry related names and must not be rewritten.
    expect(retargeted).toContain('const tagId = "dsh-context-compression-selector/CompressionProfileSelector.module.css";')
    expect(retargeted).toContain('"context-compression"')
    expect(retargeted.length).toBe(code.length + scoped.length - 'dsh-context-compression-selector'.length)
  })

  it('refuses to re-target a banner that carries an unexpected id', () => {
    // A silent no-op here is the whole bug: the tarball ships, installs, and
    // then never registers. The helper must throw instead.
    expect(() => retargetClientRegistrationId(code, 'some-other-package', '@xbzb404/x')).toThrow(
      /cannot be re-targeted/u,
    )
    expect(() => retargetClientRegistrationId('window.__ModuleLoader__.load({})', 'a', 'b')).toThrow(
      /does not open with a __ModuleLoader__\.load/u,
    )
  })
})
