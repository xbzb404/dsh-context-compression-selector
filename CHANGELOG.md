# Changelog

All notable changes use this file. The project follows semantic versioning after `0.1.0`.

## 0.2.2-rc.3.4 - 2026-11-17

### Fixed

- **The npm tarball registered its browser half under the wrong module id, so the settings page disappeared once installed.** `lib/client.js` opens with `window.__ModuleLoader__.load({ id })`, and the Harness accepts that registration only when `id` equals the **resolved manifest package name** it just fetched. The tracked artifact bakes the unscoped workspace name (`dsh-context-compression-selector`) — correct for a `github:` install, which serves that same manifest and runs no build — but the published tarball resolves as `@xbzb404/dsh-context-compression-selector`. The mismatch fails closed in the browser:
  `client-modules: could not load "@xbzb404/…": …/client.js?rev=…: loaded without registering "@xbzb404/…" via __ModuleLoader__.load`.
  The Host keeps serving and the Host-side plugin keeps loading, so nothing looks wrong from the CLI — only the browser half never contributes its `settings.section`, and 设置 → 内置插件 reports 本页面的插件未能完成同步.
  `scripts/publish-selector.mjs` now re-targets the staged `lib/client.js` id the same way it already re-targeted the patch layer's row `name:`, and re-reads the staged bytes to prove the file npm will serve carries it.
- **The patch layer and the client banner are now one checked pair.** Both are module identities the Host resolves; fixing one and shipping the other is what produced this release. `scripts/lib/selector-identity.mjs` holds the reader/rewriter both the publish script and the release gate use.

### Verified

- `pnpm run typecheck`, `pnpm run test` (520 passed, 1 skipped), `pnpm run test:built`, and `pnpm run verify:release` all pass. `packages/selector/tests/built/client-artifact.spec.ts` now asserts the tracked artifact announces the unscoped name, that re-targeting produces the scoped one, that only the banner id moves (the CSS tag id, `dataset.plugin`, and the `context-compression` settings entry id are untouched), and that a banner carrying an unexpected id throws instead of silently rewriting nothing.

## 0.2.2-rc.3.3 - 2026-11-17

### Fixed

- **The published patch layer named the unscoped module id, so an npm install failed with `ERR_MODULE_NOT_FOUND` and never activated.** The patch layer's `name:` is the module id the Host imports, not a label. It has to follow the tarball into the scope; `scripts/publish-selector.mjs` now retargets it and fails when the line it needs is absent.
- **The selector dependency was written as a plain version, so npm rejected it as an invalid spec** while the built code imports the *unscoped* runtime id. The staged manifest uses the `npm:` alias form, which installs the scoped runtime under the bare name the bundle actually imports.

## 0.2.2-rc.3 - 2026-11-17

### Changed

- **Re-targeted at DeepSeek Harness `0.2.2-rc.3`** (the runtime bundled in Desktop `0.2.2-rc.3`): every `@deepseek-ai` devDependency and peer floor moves from `0.2.2-rc.1` to `0.2.2-rc.3`. The cordis family pins are unchanged 鈥?cordis `4.1.0`, `cordis-plugin-loader` / `-include` / `-group` `1.1.0`, `@deepseek-ai/schemastery` `3.19.0` 鈥?because `0.2.2-rc.3` still ships that same generation. `@deepseek-ai/dsh-invariants` also stays at `0.2.0-rc.2`: it is still the newest published version, and nothing between `rc.1` and `rc.3` changes the `InvariantInstaller` shape this plugin uses.
- **The peer floors now start at `0.2.2-rc.3`.** Same load-bearing reason as every previous release: pnpm resolves a peer range to the *lowest* satisfying version, so a stale floor installs an older `@deepseek-ai/dsh-client-ui-slots` beside the root and splits the `SlotMap` / `LocaleNamespaceMap` declaration-merge targets. `scripts/verify-release.mjs` and `packages/selector/tests/public/package-contract.client.spec.ts` both used to pin the literal `0.2.2-rc.1`; they now **derive** the expected floor from the package's own `version`, so a release bump can no longer leave a gate checking a stale string while the invariant silently stops being enforced.

### Fixed

- **The keyless parent/child cache-prefix E2E no longer compiles against `rc.2`+.** `SubagentActivationSpec` stopped accepting a nested `request` object and now takes the task options directly, so the spec passes `prompt` and `parent` as top-level fields. This is the `subagent-activation-options` break; the runtime code was unaffected because it does not start activations.

### Verified

- `pnpm run typecheck`, `pnpm run test` (520 passed, 1 skipped), `pnpm run test:built`, and `pnpm run verify:release` all pass against the `0.2.2-rc.3` packages.

### Publishing

- `@xbzb404/dsh-context-compression-selector-runtime@0.2.2-rc.3` is published to the public npm registry, and the repository root's alias pin moved with it, so the `github:` install keeps resolving one exact version.

## 0.2.2-rc.1 - 2026-11-13

### Changed

- **Re-targeted at DeepSeek Harness `0.2.2-rc.1`** (the runtime bundled in Desktop `0.2.2-rc.1`): every `@deepseek-ai` devDependency and peer floor moves to `0.2.2-rc.1`, together with the cordis family `0.2.2` peers on — cordis `4.1.0`, `cordis-plugin-loader` / `cordis-plugin-include` / `cordis-plugin-group` `1.1.0`, and `@deepseek-ai/schemastery` `3.19.0`. `@deepseek-ai/dsh-invariants` stays at `0.2.0-rc.2`: it is still the newest published version (`next` is `0.2.0-rc.2`), and `0.2.2` does not change the `InvariantInstaller` shape this plugin uses.
- **The peer floors now start at `0.2.2-rc.1`, and that is load-bearing.** This is the same failure mode the `0.2.1-rc.5` release fixed, one minor earlier: pnpm resolves a peer range to the *lowest* satisfying version, so a `>=0.2.1-rc.5` floor installed `@deepseek-ai/dsh-client-ui-slots@0.2.1-rc.5` beside the root's `0.2.2-rc.1`. Two copies of that package means two `SlotMap` / `LocaleNamespaceMap` declaration-merge targets, and the client half stopped type-checking (`'settings.section' does not satisfy the constraint 'never'`) while still shipping a bundle. `scripts/verify-release.mjs` pins the floor so it cannot drift back silently.

### Fixed

- **`@deepseek-ai/cordis` resolved to two instances, so `ctx.invariants` did not exist and the runtime half did not type-check.** `dsh-invariants@0.2.0-rc.2` still declares `@deepseek-ai/cordis: ~4.0.4`, which `4.1.0` does not satisfy, so pnpm materialized both a stale variant and the current one. Cordis carries the ambient `declare module` that merges the `Context` interface, and `dsh-invariants` augments that same interface with `ctx.invariants` — two instances means two unrelated `Context` types, so `invariant.ts` failed with `Property 'invariants' does not exist on type 'Context'` and `InvariantInstaller` stopped being satisfied. `pnpm-workspace.yaml` now pins cordis (and the cordis plugin family, whose own peers were what multiplied the variants) through `overrides`, which is also what production does: the Host resolves a single cordis.
- **`tools.execute` is a batch call in `0.2.2`, not a single-call one.** `ToolsService.execute` now takes `{ calls, signal, agent? }` and returns `{ results, additionalContexts, concluded }`, with each entry a `{ callId, result }` pair whose `result` carries the `isError` / `content` fields that used to sit on the return value directly. The TailTrim retrieve assertions in `packages/runtime/tests/public/public-runtime.spec.ts` now drive the batch shape.
- **Tool execution is a separate plugin in `0.2.2`, so a bare `ToolsService` cannot run anything.** The native and PTC executors were split into `@deepseek-ai/dsh-tool-executor-native` / `-ptc`, selected per Agent scope, and `execute()` throws `ToolExecutorUnavailableError` when none is mounted. The retrieve test mounts the native executor (which has no default export — it publishes a plain cordis plugin object) next to `ToolRuntime`.
- **`Agent` gained a `model` accessor and `agent/pre-step` gained `modelSelection`.** The stub agent in the public spec now implements `model.current()` / `model.select()`, and the pre-step waterfall assertion passes the `modelSelection` the real loop supplies. Neither value is read by the compression code.

### Publishing

- `@xbzb404/dsh-context-compression-selector-runtime@0.2.2-rc.1` is on the public npm registry, and the repository root's alias pin moved with it, so the `github:` install keeps resolving one exact version.

## 0.2.1-rc.5 - 2026-11-12

### Changed

- **Re-targeted at DeepSeek Harness `0.2.1-rc.5`** (the runtime bundled in Desktop `0.2.1-rc.5`): every `@deepseek-ai` devDependency moves to `0.2.1-rc.5`, together with the cordis family the rc.5 packages peer on (`@deepseek-ai/cordis` 4.0.5, `cordis-plugin-include` 1.0.10, `cordis-plugin-loader` 1.0.6, `@deepseek-ai/schemastery` 3.18.5). `@deepseek-ai/dsh-invariants` stays at `0.2.0-rc.2`: it is still the newest published version (it otherwise ships only inside the Desktop bundle), and rc.5 does not change the `InvariantInstaller` shape this plugin uses.
- **The published peer ranges now start at `0.2.1-rc.5`.** The previous floor (`>=0.2.0-rc.2`) was not merely cosmetic: pnpm resolves a peer range to the *lowest* satisfying version, so the workspace installed `@deepseek-ai/dsh-client-ui-slots@0.2.0-rc.2` alongside the root's `0.2.1-rc.5`. Two copies of that package means two `SlotMap` / `LocaleNamespaceMap` declaration-merge targets, and the client half stopped type-checking (`'settings.section' does not satisfy the constraint 'never'`, `'context-compression' is not assignable to 'keyof LocaleNamespaceMap'`) while still shipping a bundle. The floor now matches the version the plugin is built and tested against, and `scripts/verify-release.mjs` pins it so it cannot drift back silently.

### Fixed

- **The keyless parent/child cache-prefix E2E no longer compiles or runs against rc.5.** rc.5 replaced the `ctx.subagents.start(name, request)` seam with `startActivation(spec)`, where the provider, a task label, the request, cancellation, and a delivery policy arrive as separate fields, and the resolved `SubagentActivation` carries `childId` rather than `id` / `localAgent`. The spec now drives the activation surface and reads the live Agent from `ctx.agents.get(childId)` **before** awaiting `result`, because `SubagentActivation.result` settles only after teardown has released that residency.
- **`SubagentRuntime` now injects `workingDirectory`, and local child startup calls `set(agent, path, signal)`.** A composition without the service exposes no `ctx.subagents` at all, and the agent-loop testkit fixture only implements `get`/`ensure`, so the spec mounts the fixture and adds the missing `set` instead of pulling in the real filesystem service.

### Publishing

- **`@xbzb404/dsh-context-compression-selector-runtime@0.2.1-rc.5` is now on the public npm registry**, so the `github:` install no longer depends on an unpublished exact version. The install docs drop the "runtime is not on npm" caveat that this release invalidates.

## Unreleased

### Fixed

- **The Bundle published no preset variants at all, so context compression never ran.** Marking the Config fields volatile — the change that made the settings form appear — also changed what `apply()` receives: `config.autoCompactThresholdPercent` is a cosmokit `Volatile` reference now, not a number, and `Number.isFinite()` over it is false. `composeRows` therefore threw `Auto Compact threshold percent must be finite` on the first source preset, `publishOnce` aborted, and the Bundle's own `published.catch(() => {})` swallowed the rejection: no `*--compression` preset existed anywhere, no log line said so, and every session silently ran without a compression stack. `apply()` now reads volatile fields through the reference they arrive as, and `packages/selector/tests/host-preset-overlay.host.spec.ts` covers the reference shape the Host actually supplies (the previous test passed a plain number, which is why the regression was invisible).
- **One source preset that could not be composed withdrew every variant.** `VariantPublisher.publishOnce` now collects per-source failures, keeps publishing the remaining sources, and reports all of them as one `AggregateError`, so a single unusable document can no longer cost a profile its whole compression stack.
- **A failed publication is no longer silent.** `apply()` reports the rejected publication through the Host logger, because the previous code path left no trace of a profile that runs without compression.
- **A live-editable `custom` field left the whole Plugin settings page disabled.** `SettingsForms.describe` serves a volatile field's form schema as `schema.toJSON()`, and the browser's `ConfigFormController.decode` rehydrates that envelope to validate the value it was served. `CustomCompressionPolicySchema` is a schemastery `transform`, which serializes its `transform` type and inner schema but never its callback, so the rehydrated node refused the very document it declares (`callback is not a function`). The client treats a decode failure exactly like an unfinished read — the form never leaves `loading` — and the selector disables every control while loading, so the page rendered with all controls grey. The Host field now carries the new `CustomCompressionPolicyInputSchema`, and `packages/selector/tests/settings-form-schema.host.spec.ts` asserts that the served envelope is transform-free and validates the document it was served.
- **The derived preset variants were rendered in English whatever the interface language, and offered no help.** The picker localizes a preset from its own dictionaries — but only for a roster row that publishes no name (`isBuiltInPreset(preset)`, i.e. `preset.name === undefined && dictionary[preset.id]`); a row that names itself, which every variant does, is rendered verbatim, and the `模式说明 / 如何使用` reader is served only for the four shipped ids (`presetGuide(id, trust)` is `trust === "system" && guides.has(id)`), so a plugin-declared variant can never open that dialog. The variant copy now follows the interface language — the saved `locale` preference in the settings document, else the process locale, else English — using the same shipped preset names the client's own `zh` dictionary carries (`标准模式`, `PTC 模式`, `极简模式`, `创造模式`, `上下文压缩`), and its description states what the reader would have said: what the selector's stack replaces, the Auto Compact level that generation froze, and where to change it. `PresetOverlayOptions.displayName` is new for the localized source name; `packages/selector/tests/host-preset-overlay.host.spec.ts` pins both languages.
- `packages/selector/tests/built/client-artifact.spec.ts` asserted an `inject` list naming `settingsScope`, a service 0.2.0 no longer ships (the client injects `configForms`), so `pnpm test:built` failed on an artifact that was already correct.
- **The signed-in account route was refused by every exact-measurement and price gate, so compression never ran there.** `bindCounter` accepted only providers `deepseek`/`deepseek-official`, and `resolveOfficialDeepSeekPrice` accepted only `deepseek-official` + `official-public`. `deepseek-account` — the route `@deepseek-ai/dsh-llm-deepseek-account` registers through the shared `registerDeepSeekProvider` seam, with the same model catalog, the same public API surface and an account token instead of an API key — therefore measured as `unavailable`, which fails every lossy rewrite open: Fresh, Aggregate and History all skipped and the mounted plugin changed nothing. The allowlists now live once in `packages/runtime/src/deepseek-route.ts` (`deepseek`, `deepseek-official`, `deepseek-account`; base-url classes `official-public`, `account-official`) and are used by `bindCounter`, the image diagnostic, `tokenizerAuditFact` and the price gate. Price records now report the provider and base-url class they actually resolved instead of overwriting them with the API-key names, which also makes `provider: 'deepseek'` priced (the measurement side already accepted it). Gateways and compatible proxies still fail closed. See `docs/specs/2026-10-05-deepseek-account-route-support-spec.md`.

### Added

- **Every preset variant now carries its own description.** The Host's preset declarations ship no description, so the picker rendered `No description.` beside a name that only repeated the source id. A variant now states what it adds over the native preset and the Auto Compact threshold its generation froze; a source preset that already declares a description still wins when the caller supplies no formatter. Covered by `packages/selector/tests/preset-overlay.host.spec.ts` and the apply-level assertion in `packages/selector/tests/host-preset-overlay.host.spec.ts`.
- `CustomCompressionPolicyInputSchema` (runtime): the JSON-survivable union of the accepted v1/v2/v3 Custom documents, for a Host Config field a browser edits. `CustomCompressionPolicySchema` stays the canonicalizing gate for values the runtime resolves itself.

## 0.2.0-rc.1 - 2026-10-04

### Changed

- **Re-targeted the whole project at DeepSeek Harness `0.2.0-rc.2`.** The Bundle now publishes compression as **derived preset variants** declared through `AgentPresetRegistry.register()` instead of decorating preset resolution. The `0.1.x` overlay — a temporary directory, mtime/size standing keys, `AsyncLocalStorage`, and a `resolve()` method snapshot — is gone, because 0.2.0 makes the registry the only authority over preset composition and no longer lets a plugin rewrite someone else's preset.
- The Bundle's profile row id is now `context-compression`, which is also its settings namespace. In 0.2.0 a settings form is served per profile-row entry id, so the row the Bundle installs and the form the browser selector reads are the same document; the previous `context-compression-selector-bundle` id produced a form no client could resolve.
- Settings are read through `SettingsForms.describe()` when the Host does not expose `get(namespace)`. `describe()` is the only read API `SettingsForms` offers, and its descriptors key on the profile row's entry id. A host still exposing `get(namespace)` is honored first, so a mixed deployment keeps working.
- Preset variant ids are stable (`<source>--compression`) and reference-counted, so reinstalling the row replaces the same variants rather than accumulating generations, and the built-in row and the Bundle row never install two compression stacks.
- Client slot registration now goes through a locally declared structural `slots` face, and the selector no longer gates on session preset capability: `settings.section` in 0.2.0 receives only `{ close }` with `scope: 'root'`, so a `settings.section` component cannot observe the current session's preset.

### Added

- `installCompressionVariants()`, `canonicalCompressionRows()`, and `resolveCompressionModulePaths()` replace the removed `PresetOverlayStore`; a variant's plugin rows are emitted as `file:` URLs, which is required because the registry mounts rows under the declaring Loader's base.
- An end-to-end spec drives the real `Loader`, `Include`, `Group`, `LlmRuntime`, `SessionStore`, `SessionProjections`, `SystemPrompt`, `ToolRuntime`, `AgentRegistry`, `AgentLoop`, `CommandRuntime`, `TokenMeter`, and `AgentPresetRegistry`, and asserts that an Agent mounted on a variant carries `toolResultPruner`, `compaction`, the `context_compression_retrieve` tool, and the `compact` command while the source preset stays byte-identical.
- A runtime spec covers a Host that exposes only `describe()` — the 0.2.0 read surface — so a regression to `get()` or a row-id/namespace mismatch fails loudly.

### Fixed

- **Preset rows emitted by the plugin used native paths and silently never loaded on Windows.** A row name of `C://...//lib//index.js` is not a valid ESM specifier, so the Loader reported the row as `never started` and the variant came up without any compression at all. Rows are now `file:` URLs.
- `AgentLoop.create()` is awaited and resolves a `Promise<Agent>`; subagent child prefixes are read as `session.inheritedEventCount` with `snapshotEvents()`, since 0.2.0 removed the `seedLength` header mirror and the public `events` array.

### Removed

- `packages/selector/tests/standing-generation.host.spec.ts`, which exercised the 0.1.x standing-key machinery that no longer exists on the plugin side. Its real-harness coverage is replaced by `preset-overlay-loader.e2e.host.spec.ts`.

## 0.1.1 - 2026-09-23

### Added

- DeepSeek-V4.1-Flash support for the `deepseek-flash` default route: it now resolves an exact bundled tokenizer (`deepseek-ai/DeepSeek-V4.1-Flash` @ `dba1be0a40aa45a94ad051997016db3960a90277`) instead of failing closed, so exact-gated compression is no longer a no-op on the Harness default model.
- Official `deepseek-flash` pricing rows (USD `0.003/0.15/0.6` off-peak and `0.006/0.3/1.2` peak; CNY `0.02/1/4` off-peak and `0.04/2/8` peak) with `modelVersion` `DeepSeek-V4.1-Flash`, so adaptive cost authority is enabled on that route.

### Changed

- The bundled vision asset is re-anchored from the retired `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` repository to `deepseek-ai/DeepSeek-V4.1-Flash` (`packages/runtime/assets/deepseek-v4.1-flash/`). The `tokenizer.json` and `tokenizer_config.json` bytes are unchanged; only provenance and the license file move.
- `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` are now served by the same V4.1-Flash artifact as `deepseek-flash`. `deepseek-v4-pro` keeps its own V4-Pro tokenizer, and the only V4-Pro change is dropping the retired `deepseek-v4-flash` alias from its manifest `modelIds`; the "untouched" part of this entry applies to `deepseek-v4-pro` only — its tokenizer bytes, `modelVersion`, and prices are unchanged.
- The two retired aliases `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` are now **billed at the Flash price** instead of the withdrawn V4-Flash tuple, matching the official pricing page ("billed at the Flash price" / "按 Flash 价格计费"). New: USD `0.003/0.15/0.6` off-peak and `0.006/0.3/1.2` peak, CNY `0.02/1/4` off-peak and `0.04/2/8` peak, `modelVersion` `DeepSeek-V4.1-Flash`. Previous: USD `0.007/0.22/0.66` off-peak and `0.014/0.44/1.32` peak, CNY `0.05/1.5/4.5` off-peak and `0.10/3.0/9.0` peak, `modelVersion` `DeepSeek-V4-Flash-0731`. This is not cosmetic: the cache-hit/cache-miss spread narrows from `0.213` to `0.147`, which can turn a previously authorized Adaptive History decision on these routes into `cache-risk-not-clearly-paid-back`. `deepseek-v4-pro` pricing is deliberately unchanged.
- The `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` routes are a documented compatibility period only: the official pricing page marks those models as retired and says their requests are served by V4.1-Flash. If the aliases are withdrawn, the tokenizer mapping and the pricing rows for them must be re-evaluated together.
- Vision image-token arithmetic is re-ported to the official V4.1 `image_processor.py`: the per-image cap moves 384 → 1024 tokens, the minimum-pixel floor 147456 → 295936, and the aspect clamp is gone because the official config pins `vision_max_wh_ratio` to `null`. The block length is now exactly `nLlmH * (nLlmW + 1) + 2` and is independent of the serialized position, so the position-dependent compress/odd-row/alignment padding and the `safe_resize` budget loop are removed. Measured divergence from the previous port: 800×600 338–341 → 317, 1024×1024 346–349 → 652, 14×14 114–117 → 184.
- The vision estimator identity is bumped to `deepseek-ai/DeepSeek-V4.1-Flash/image-token-estimate` @ `dba1be0a40aa45a94ad051997016db3960a90277:v1` so audit rows from the two arithmetics cannot be confused. The fixed 256-token malformed-image fallback is unchanged.
- `vision-golden.json` is regenerated by executing the official V4.1 Python implementation; the position sweep is retained as explicit position-independence evidence rather than a varying-count sweep.

### Fixed

- The selector's Adaptive price disclosure now reports `2026-09-23`, matching the re-verified price catalog. It still said `2026-08-25` after the catalog was re-checked, and a client-test regex pinned that literal, so the stale date was locked in rather than detected.
- The packed release smoke now drives `deepseek-flash` — the Harness default model id — instead of the legacy `deepseek-v4-flash` alias. The gate previously passed while never exercising the route this release exists to fix, so a regression on the default route would not have been caught. Alias mapping remains covered by the unit suite.

## 0.1.0 - 2026-09-03

### Added

- Stable release of DeepSeek V4 Flash Vision tokenizer integration for `deepseek-v4-flash-vision-exp`, including exact text counting and bounded image-token estimates.
- User-configurable model-driven Auto Compact threshold in the selector settings section.
- Auto Compact threshold linkage for each standard profile's History / micro-compact watermarks and related compression parameters.

### Changed

- The threshold editor now uses one direct numeric input; the slider and fixed quick-value buttons were removed.
- Runtime session-event access supports both the established Harness `events` accessor and the newer `snapshotEvents()` public API.

## 0.1.0-beta.4 - 2026-09-02

### Fixed

- Support the official DeepSeek Harness `dsh-v0.1.2-alpha.5` public API while retaining compatibility with the existing `0.1.1-rc.2` peer range. The plugin now owns the two small immutable-value helpers that the newer Harness no longer exports, and uses the same public `context-compression` namespace literal accepted by both Settings implementations. No Harness core code is modified.

## 0.1.0-beta.3 - 2026-09-01

### Scope

This is a staged release. Exact **text-class** token counting for `deepseek-v4-flash-vision-exp`, best-effort bounded **vision-class image** estimates, and the Auto Compact threshold/UI/audit work are delivered. Exact image measurement remains **BLOCKED upstream**: the current measurement seam exposes neither the adapter's projected request-image dimensions nor the absolute serialized position, so estimates cannot be promoted to `exact-tokenizer`.

### Added

- DeepSeek V4 Flash Vision support for `deepseek-v4-flash-vision-exp` via a separately bundled official tokenizer pinned at `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp` revision `6821d6ad3681a4b137b066b76094fa82ebd0a380`. Text, reasoning, tool-call arguments, and pure-text tool results are counted exactly; image-bearing tool-result candidates stay fail-open.
- Vision image-token arithmetic ported line-by-line from the official `inference/image_processor.py` (patch size 14, downsample 3, 384-token cap, min pixels 147456, 8:1 aspect clamp, and position-dependent alignment padding), validated against golden fixtures generated by executing the official Python implementation. Valid intrinsic dimensions now produce `tokenizer-estimate` at the midpoint of all four alignment residues with a 384-token per-image upper bound; malformed or unevaluable dimensions use a documented 256-token fallback. Mixed text/image surfaces aggregate exact text and estimated images without promoting them to exact.
- `autoCompact.thresholdPercent` setting (default 80, integer 50–90, step 1) with one shared validation contract across the settings UI, the persisted schema, and the runtime resolver. The editor lives inside the context-compression selector settings section.
- Standard-profile History linkage to the Auto Compact watermark: `A = floor(C × a)` rescales the History trigger, minimum reclaim, and recent-token tail; `D = floor(A × 0.875)` replaces the fixed 0.7 capacity-pressure ratio as the micro-compact last-chance gate; one batch must justify its cache break by pulling the complete request back below the deadline. Defaults at 80% reproduce the previous numbers exactly.
- The preset overlay writes the saved threshold into the generated `compaction-basic` composition as `thresholdRatio` (with `retainRatio` pinned at 0.16) and, from the same read, into the plugin runtime's deployment config as `autoCompactThresholdPercent`, so one standing generation never runs Auto Compact and micro compact on two different thresholds. Any generation-identity change — threshold, source, or module paths, including equal-length ones — produces a new standing composition generation. Deterministic identity-derived stamps use an 8-hex whole-second window; equal-prefix identities can collide in that first window on a coarse filesystem, so the overlay observes the staging file's real `mtimeMs+size` key and escalates to later hash windows before the atomic rename. Content, permissions, and the final unique stamp are complete before publication; already-running sessions keep their frozen policy.
- `policy-resolved` audits now record the Auto Compact coordination facts (threshold percent, `A`, `D`, parameter source — including `deployment-override`/`mixed` when deployment config replaces linked History watermarks), the routed provider/model, and the bundled tokenizer identity.
- Persisted settings reject present-but-invalid sections (`profile: null`, `custom: null`, own-property `undefined`) before any schema default can absorb them; a malformed stored document freezes the session losslessly (`profile: off`, audited as `settingsInvalidFallback: lossless-off`) instead of silently enabling the lossy Balanced default. The browser decoder applies the same rule and canonicalizes legacy Custom v1/v2 documents to the same v3 document the runtime resolver produces.
- The History planner returns a discriminated outcome, and `component-evaluation` audits distinguish the full skip taxonomy: `below-profile-trigger`, `below-micro-deadline`, `exact-tokenizer-unavailable`, `no-safe-candidates` (only recovery-tool output or already-cleared results), `protected-working-set` (everything inside the protected tail), `insufficient-reclaim` and `cannot-reach-deadline-target` (with the reached/required token numbers), `adaptive-cost-rejected`, and `recovery-tool-unavailable`.

### Known limitations

- Images never claim exact counts. The official expansion depends on the absolute prompt position (system prompt, chat-template framing, adapter image handles) and on the adapter's final request-image projection (including per-route `imagePixelBudget`/`imageDetail` overrides and byte-cap reprojection), none of which is exposed through the current measurement seam. Intrinsic/default estimates may therefore differ materially from provider accounting. Upstream capability requests remain projected request-image dimensions and the absolute serialized position exposed to token-meter extensions.
- History skips the whole batch whenever any tool-result candidate lacks an exact count, including image-bearing candidates, even though sibling text candidates are individually exact.
- Custom remains manual token mode; its History parameters do not follow the Auto Compact watermark.
- A vision token breakdown UI is not shipped; image estimates and the intrinsic alignment diagnostic are available on the measured token view, while lossy rewrite proofs still require exact counts.

### Deferred

- Audit `modality` field and the tokenizer artifact SHA-256 inside audit records (the audits already carry the routed provider/model and tokenizer identity).
- Publishing the (now complete) runtime skip-reason taxonomy as a user-facing documentation table.
- Custom-profile display of the A/D watermarks and an above-D warning; Custom remains fully manual.
- Vision token breakdown UI and promotion of image estimates to exact measurement.

## 0.1.0-beta.2 - 2026-08-28

### Fixed

- Resolve the official DeepSeek V4 Flash tokenizer route so Fresh and Aggregate can evaluate tool results for the supported V4 models.
- Run Cache Strict History at the real request boundary once its configured capacity-pressure condition is met; trigger the capacity condition at 70% routed-context utilization.
- Disable Harness-native head/middle/tail tool-result pruning whenever a selector profile is active, leaving the selector as the sole tool-result compactor.

### Changed

- Protect the newest 10 agent tool calls and a 64,000-token tool-result tail window before History/microcompact rewrites older results.

## 0.1.0-beta.1 - 2026-08-27

### Added

- One-install DeepSeek Harness Product Bundle backed by a separate exact-version runtime package.
- Web profile selector with preset-stable settings and an explicit built-in Minimal exception.
- Fresh, Aggregate, routine/capacity-aware History, Native tool-result pruning, and default-off Custom TailTrim.
- Standard-event TailTrim protocol using `compaction/prune` plus recoverable `user/message` replacement.
- Plugin-owned `context_compression_retrieve` recovery tool.
- Structured, content-free policy, evaluation, rewrite, failure, and Native auto-compact audit records.
- Pinned official DeepSeek V4 tokenizer assets with runtime SHA-256 validation and upstream license.
- Public-API component E2E, preset/Minimal, and parent/fork/spawn cache-prefix regression tests.

### Compatibility

- Verified against DeepSeek Harness `dsh-v0.1.1-rc.2` public packages.
- Exact tokenizer mapping is currently limited to `deepseek-v4-flash` and `deepseek-v4-pro`.

### Known limitations

- Adaptive ordinary History fails closed when public request-level route/cache evidence is incomplete; capacity pressure remains a separate safety override.
- Cache-prefix tests prove native fork inheritance and identical serialized prefixes, not a provider-specific cache allocation or a guaranteed DeepSeek cache hit.
- Settings snapshots and first-exposure decisions are process-local to the mounted runtime.
