import z from "@deepseek-ai/schemastery";
import { CompressionProfile, CustomCompressionPolicy } from "dsh-context-compression-selector-runtime";
import { Context } from "@deepseek-ai/cordis";
//#region src/index.d.ts
/** Standalone Bundle preferences; the row exposes them through Settings forms. */
interface Config {
  /** One compression profile, or a fully manual Custom document. */
  profile?: CompressionProfile;
  /** Versioned manual policy used when {@link Config.profile} is `custom`. */
  custom?: CustomCompressionPolicy;
  /** Auto Compact context watermark percent shared with micro compact. */
  autoCompactThresholdPercent?: number;
  /** Publish a compression variant of every non-Minimal preset. */
  presetOverlay?: boolean;
}
/** Loader validation for the standalone Bundle row. */
declare const Config: z<Config>;
/**
 * Bundle Host entry.
 *
 * Harness 0.2.0 removed the imperative settings registration contract this
 * plugin used in 0.1.x (`settings.register`/`SettingsScope`). A row's Config
 * schema IS its settings surface now: `SettingsForms` projects this row's
 * schema into a form keyed by the profile entry id (see `cordis.patch.yml`),
 * the browser selector edits it through `ctx.configForms`, and every composer
 * reads the same document through `SettingsForms.describe()`. Nothing has to be
 * leased here anymore, so the Host only publishes the optional preset variants.
 */
declare function apply(ctx: Context, config?: Config): void;
//#endregion
export { Config, apply };