import { Context } from "@deepseek-ai/cordis";
import { InjectFace, PropsLocale, PropsRuntime } from "@deepseek-ai/dsh-client-ui-slots";
//#region src/client/locales.d.ts
/** Simplified Chinese copy for the context-compression selector. */
declare const zh: {
  nav: string;
  'settings.title': string;
  'settings.description': string;
  label: string;
  'status.loading': string;
  'status.unavailable': string;
  'status.presetUnavailable': string;
  'status.minimalUnavailable': string;
  'status.saveFailed': string;
  'pricing.disclosure': string;
  'profile.balanced': string;
  'profile.cache-strict': string;
  'profile.savings': string;
  'profile.adaptive': string;
  'profile.custom': string;
  'profile.native': string;
  'profile.off': string;
  'profile.current': string;
  'detail.balanced': string;
  'detail.cache-strict': string;
  'detail.savings': string;
  'detail.adaptive': string;
  'detail.custom': string;
  'detail.native': string;
  'detail.off': string;
  'autoCompact.title': string;
  'autoCompact.description': string;
  'autoCompact.inputLabel': string;
  'autoCompact.sliderLabel': string;
  'autoCompact.quick': string;
  'autoCompact.riskLow': string;
  'autoCompact.riskHigh': string;
  'autoCompact.invalid': string;
  'autoCompact.save': string;
  'autoCompact.summaryHint': string;
  'custom.title': string;
  'custom.settingsHint': string;
  'custom.sessionScope': string;
  'custom.measurement': string;
  'custom.unit': string;
  'custom.unit.tokens': string;
  'custom.unit.contextPercent': string;
  'custom.enabled': string;
  'custom.enabled.on': string;
  'custom.enabled.off': string;
  'custom.fresh.enabled': string;
  'custom.fresh.trigger': string;
  'custom.fresh.target': string;
  'custom.aggregate.enabled': string;
  'custom.aggregate.trigger': string;
  'custom.aggregate.target': string;
  'custom.history.enabled': string;
  'custom.history.trigger': string;
  'custom.history.keepRecentToolCalls': string;
  'custom.history.keepRecentTokens': string;
  'custom.history.minReclaim': string;
  'custom.prefixPolicy': string;
  'custom.prefixPolicy.preserve': string;
  'custom.prefixPolicy.pressureBreak': string;
  'custom.experimental': string;
  'custom.tailTrim.enabled': string;
  'custom.tailTrim.trigger': string;
  'custom.tailTrim.warning': string;
  'custom.save': string;
  'custom.reset': string;
  'custom.invalid': string;
};
/** Locale keys that every context-compression selector dictionary must provide. */
type ContextCompressionLocaleKey = keyof typeof zh;
//#endregion
//#region src/profiles.d.ts
/** Public context-compression choices shared by the Host schema and browser selector. */
declare const COMPRESSION_PROFILES: readonly ["off", "native", "balanced", "cache-strict", "savings", "adaptive", "custom"];
/** One supported context-compression profile. */
type CompressionProfile = typeof COMPRESSION_PROFILES[number];
/** Single canonical unit stored by a version-1 browser Custom document. */
type CustomCompressionUnit = 'tokens' | 'context-percent';
/** Whether Custom History may routinely rewrite an already-sent prefix. */
type CustomPrefixPolicy = 'preserve' | 'pressure-break';
/** Browser representation of one independently enabled Fresh or Aggregate budget. */
interface CustomCompressionBudget {
  enabled: boolean;
  trigger: number;
  target: number;
}
/** Legacy browser representation of the Custom History working set. */
interface LegacyCustomHistoryPolicy {
  enabled: boolean;
  trigger: number;
  keepRecentTurns: number;
  keepRecent: number;
  minReclaim: number;
}
/** Browser representation of Custom History tool-call and token-tail protection. */
interface CustomHistoryPolicy {
  enabled: boolean;
  trigger: number;
  keepRecentToolCalls: number;
  keepRecentTokens: number;
  minReclaim: number;
}
/** Browser representation of the Custom-only Experimental TailTrim gate. */
interface CustomTailTrimPolicy {
  enabled: boolean;
  trigger: number;
}
interface CustomCompressionPolicyCommon<HistoryPolicy> {
  unit: CustomCompressionUnit;
  fresh: CustomCompressionBudget;
  aggregate: CustomCompressionBudget;
  history: HistoryPolicy;
  prefixPolicy: CustomPrefixPolicy;
}
/** Legacy public Custom document; accepted and normalized before editing. */
interface CustomCompressionPolicyV1 extends CustomCompressionPolicyCommon<LegacyCustomHistoryPolicy> {
  version: 1;
}
/** Legacy Custom document with a default-disabled TailTrim stage. */
interface CustomCompressionPolicyV2 extends CustomCompressionPolicyCommon<LegacyCustomHistoryPolicy> {
  version: 2;
  tailTrim: CustomTailTrimPolicy;
}
/** Public Custom document with tool-call working-set protection. */
interface CustomCompressionPolicyV3 extends CustomCompressionPolicyCommon<CustomHistoryPolicy> {
  version: 3;
  tailTrim: CustomTailTrimPolicy;
}
/** Exact public Custom document accepted by the Host and browser boundary. */
type CustomCompressionPolicy = CustomCompressionPolicyV1 | CustomCompressionPolicyV2 | CustomCompressionPolicyV3;
/** User-tunable Auto Compact coordination preferences. */
interface AutoCompactSettings {
  thresholdPercent: number;
}
/** Durable settings section owned by this package. */
interface ContextCompressionSettings {
  /** Default profile captured when each Session first reaches the pruner. */
  profile: CompressionProfile;
  /** Complete canonical policy captured with `profile` when the runtime first observes a Session. */
  custom: CustomCompressionPolicy;
  /** Auto Compact trigger captured with `profile` when the runtime first observes a Session. */
  autoCompact: AutoCompactSettings;
}
//#endregion
//#region src/client/CompressionProfileSelector.d.ts
/**
 * Browser view of one compression settings namespace.
 *
 * Harness 0.2.0 replaced `SettingsScope` with `ConfigForm`; the two publish the
 * same autonomic fields (status / value / revision / writable), so the selector
 * keeps rendering from this narrower shape and the client entry adapts whatever
 * the settings provider hands out.
 */
interface CompressionSettingsSnapshot {
  /** `unavailable` when the namespace is not exposed to this client. */
  status: 'loading' | 'ready' | 'unavailable';
  /** Decoded, canonicalized settings; undefined before the first accepted read. */
  value: ContextCompressionSettings | undefined;
  /** Namespace revision fencing the next write. */
  revision: number | undefined;
  /** Whether the document accepts writes. */
  writable: boolean;
}
/**
 * The getSnapshot/subscribe pair the renderer binds into `useCompression`. Its
 * snapshot reference is stable until the source publishes a change.
 */
interface CompressionSettingsFace {
  getSnapshot(): CompressionSettingsSnapshot;
  subscribe(listener: () => void): () => void;
}
interface CompressionSelectorInjected {
  hooks: {
    compression: CompressionSettingsFace;
  };
  select: (profile: CompressionProfile) => Promise<void>;
  saveCustom: (custom: CustomCompressionPolicy) => Promise<void>;
  resetCustom: () => Promise<void>;
  saveAutoCompact: (thresholdPercent: number) => Promise<void>;
}
type CompressionProfileSelectorProps = PropsRuntime<'settings.section'> & PropsLocale<'context-compression'> & InjectFace<CompressionSelectorInjected>;
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'context-compression': ContextCompressionLocaleKey;
  }
}
//#endregion
//#region src/client/index.d.ts
declare const inject: string[];
declare function apply(ctx: Context): void;
//#endregion
export { type CompressionProfile, type CompressionProfileSelectorProps, type CompressionSelectorInjected, type CompressionSettingsFace, type CompressionSettingsSnapshot, type ContextCompressionSettings, apply, inject };