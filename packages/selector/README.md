# dsh-context-compression-selector

The installable Product Bundle for this fork of the unofficial community DeepSeek Harness context-compression selector.

## Install

```sh
dsh plugin add @xbzb404/dsh-context-compression-selector
```

The selector layer should be listed in `dsh --dump-config`; restart Harness to apply.

To update or remove it, use the full scoped name:

```sh
dsh plugin up @xbzb404/dsh-context-compression-selector
dsh plugin remove @xbzb404/dsh-context-compression-selector
```

> **Do not install the unscoped name.** `dsh-context-compression-selector` on npm
> belongs to the upstream project and ships the *original* build, not this fork's
> fixes.

This one command resolves the exact `@xbzb404/dsh-context-compression-selector-runtime` dependency; do not install it separately.

> **Not an `npm install` package.** `@deepseek-ai/cordis` is declared `>=4.1.0 <5`,
> while the `@deepseek-ai/cordis-plugin-include@1.1.0` this Bundle also needs accepts
> only `~4.1.0`; npm's peer resolver therefore fails with `ERESOLVE`. `dsh plugin add`
> is the supported path. Installing into a plain npm project requires
> `--legacy-peer-deps` (or `--force`) and is not guaranteed to run.

## What this fork adds

Over the upstream 0.1.1 build:

- Targets the DeepSeek Harness `0.2.x` public API surface (`AgentPresetRegistry.register()` preset variants, `SettingsForms.describe()`, `snapshotEvents()` / `inheritedEventCount`), exercised against `0.2.2-rc.5`.
- DeepSeek-V4.1-Flash on the default route: `deepseek-flash` resolves an exact bundled tokenizer instead of failing closed, so exact-gated compression is no longer a no-op on the default model. Vision image-token arithmetic follows the official V4.1 image processor.
- Supports the signed-in account route (`deepseek-account`), which every exact-measurement and price gate previously refused, so compression never ran there.
- One source preset that cannot be composed no longer withdraws every variant, and a failed publication is reported through the Host logger instead of being swallowed.

The Bundle contributes Host settings, the Web UI, and a reversible preset overlay. All presets except the exact built-in `minimal` id receive the compression stack; switching non-Minimal presets preserves the saved selector settings. Minimal pauses plugin compression without deleting the setting.

## Compatibility

Verified against DeepSeek Harness `0.2.2-rc.5`, Node `^22.19.0 || >=24`. No Harness core patch is required.

See the [full README](https://github.com/xbzb404/dsh-context-compression-selector#readme) for profiles, defaults, audit evidence, Adaptive/cache limitations, upgrade/removal, and security guidance. This package is not affiliated with or endorsed by DeepSeek.
