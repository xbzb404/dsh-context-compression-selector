# dsh-context-compression-selector — offline install package

Installs the **Context compression selector** Bundle into DeepSeek Harness without
npm, pnpm, or network access.

## Install

1. Quit DeepSeek Harness completely (including the tray icon).
2. Unpack the whole zip. Keep `install.cmd` and `vendor\` together.
3. Double-click `install.cmd`.

That is the whole procedure. The script:

| step | what it does |
|---|---|
| 1 | backs up `%USERPROFILE%\.dsh\profiles\desktop\package.json` |
| 2 | copies the 6 packages from `vendor\` into the profile's `node_modules\` |
| 3 | adds `dsh-context-compression-selector` to `dsh.profile.bundles` |
| 4 | checks every entry file landed, and tells you what is missing if not |

Then restart the app. The new **Context compression** section appears in
Settings.

### Command line

```cmd
install.cmd                :: default profile "desktop"
install.cmd myprofile      :: a different profile
install.cmd --help
```

Set `DSH_HOME` first if your Harness home is not `%USERPROFILE%\.dsh`.

## Why not pnpm

The bundle's run-time (`dsh-context-compression-selector-runtime`) is a
prerelease that is not on npm, so a plain `pnpm add` cannot resolve it. The
usual workaround is a `pnpm` override pointing at a local tarball, but that
still runs a package manager, which:

* needs to delete its own temp tree first — blocked by many endpoint-protection
  agents and by the WorkBuddy sandbox (`SAFE_DELETE_BULK_CONFIRM_REQUIRED`);
* rewrites `node_modules` immediately before launch.

The second point is the one that actually breaks the UI. Harness hashes each
client bundle's `mtimeMs` / `ctimeMs` / `size` into a revision string, hashes
the whole set into the combined module-graph URL, and bakes that URL into the
page it serves. Rewrite the files after that page is served and every URL is
stale: the browser requests them, gets a 404, and each `<script>` fires its
`error` event — which the renderer reports as a bare **`failed to load`**, with
the whole settings panel going blank.

A copy from `vendor\` touches only the files it installs, and the app is closed
while it runs, so the revision is stable by the time the next launch reads it.

## What is in vendor/

| package | role |
|---|---|
| `dsh-context-compression-selector` | the Bundle (Host + client) |
| `dsh-context-compression-selector-runtime` | compression runtime + tokenizer assets |
| `@deepseek-ai/dsh-compaction-basic` | the official compression engine it drives |
| `@deepseek-ai/dsh-command-compact` | `/compact` command |
| `js-yaml` | config parsing |
| `@huggingface/tokenizers` | token counting |

Everything else the Bundle declares as a peer dependency — `@deepseek-ai/cordis`,
`dsh-session`, `dsh-llm`, `dsh-tools`, `dsh-client-ui-*` and so on — is
**injected by the Harness host at run time** and must *not* be copied into the
profile. Adding them is what previously inflated the module graph and blanked
the panel.

## Rollback

The script prints the backup path it created, e.g.

```cmd
copy /Y "C:\Users\you\.dsh\profiles\desktop\package.json.bak-install-12345" ^
        "C:\Users\you\.dsh\profiles\desktop\package.json"
```

You can then delete the six copied folders from `node_modules\`.
