# Contributing

Thank you for helping improve this community plugin.

1. Open an issue before large behavior or compatibility changes.
2. Keep every production change inside this repository; do not require a DeepSeek Harness core patch.
3. Add a failing regression first for compression, surface/recovery, preset, tokenizer, or cache-prefix behavior.
4. Run:

   ```sh
   pnpm install --frozen-lockfile
   pnpm test
   pnpm typecheck
   pnpm build
   pnpm verify:release
   pnpm pack:dry-run
   ```

5. Never commit API keys, `.env` files, real Session logs, prompts/tool results, user paths, generated tarballs, or NPM tokens.

## Versioning

Track the Harness release this tree targets, and express any fix that ships
between Harness releases as a fourth numeric field:

| Situation | Version |
|---|---|
| Targeting Harness `0.2.2-rc.3`, first cut | `0.2.2-rc.3` |
| A follow-up fix while still on Harness `0.2.2-rc.3` | `0.2.2-rc.3.1`, `0.2.2-rc.3.2`, … |
| Harness moves to `0.2.2-rc.4` | `0.2.2-rc.4` (drops the counter) |

The rule exists so the first three fields always answer "which Harness is this
for?": a reader can pick the right build without reading a changelog. Never burn
a whole prerelease (`rc.4`) on a plugin-only fix, because that would make the
version look like it targets a Harness release that does not exist.

`packages/selector` and `packages/runtime` may sit at different versions: a
selector-only fix reuses the runtime already on npm. `scripts/publish-selector.mjs`
reads the version the selector pins rather than assuming the two match.

Pull requests should explain the evidence for “triggered”, “enabled but skipped”, and fail-open behavior separately. A code path existing is not runtime proof. Changes to tokenizer/model compatibility require an official source, pinned revision, license, byte length, SHA-256, and negative tests.
