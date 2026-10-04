import z from "@deepseek-ai/schemastery";
import { AUTO_COMPACT_THRESHOLD_LIMITS, COMPRESSION_PROFILES, CustomCompressionPolicyInputSchema, DEFAULT_CUSTOM_COMPRESSION_POLICY } from "dsh-context-compression-selector-runtime";
import { applyEntryPatches, entryListSchema } from "@deepseek-ai/cordis-plugin-include";
import { load } from "js-yaml";
/** Marks a variant in the selection roster next to its native source. */
const DEFAULT_DISPLAY_SUFFIX = "Context compression";
/** Presets that ship no tool surface to compress. */
const DEFAULT_EXCLUDED_PRESET_IDS = ["minimal"];
/**
* Resolve the three compression package entries once from this package.
* @returns Absolute entry paths for the canonical compression layer.
*/
function resolveCompressionModulePaths() {
	return {
		compactionBasic: modulePath("@deepseek-ai/dsh-compaction-basic", import.meta.resolve("@deepseek-ai/dsh-compaction-basic")),
		commandCompact: modulePath("@deepseek-ai/dsh-command-compact", import.meta.resolve("@deepseek-ai/dsh-command-compact")),
		toolResultPruner: modulePath("dsh-context-compression-selector-runtime", import.meta.resolve("dsh-context-compression-selector-runtime"))
	};
}
/**
* Convert one package resolution into the module name a declaration accepts.
*
* The registry mounts a declaration under the DECLARING Loader's base, so a
* composition must name its modules absolutely — and it must name them as
* `file:` URLs: a native Windows path is not a resolvable ESM specifier, so a
* `C:\…\lib\index.js` row silently never starts.
*/
function modulePath(specifier, resolved) {
	if (!resolved.startsWith("file:")) throw new Error(`context-compression selector: ${specifier} resolved outside the filesystem (${resolved})`);
	return resolved;
}
/**
* Cordis can hand two callers different traceable proxies for one service.
* Symbol properties forward to the shared target, unlike proxy identity.
*/
const SHARED_VARIANTS = Symbol.for("dsh-context-compression-selector/preset-variants");
/**
* Publish one compression variant per applicable native preset.
*
* Duplicate rows (for example a Harness-bundled selector row beside the
* standalone Bundle) share one publication, so either row can unload first
* without withdrawing variants the other still shows in the roster.
* @param registry Native AgentPreset registry declarations are read from and published to.
* @param options Canonical module paths, exclusions, and naming.
* @returns A reference-counted handle that publishes synchronously and withdraws every variant on final disposal.
*/
function installCompressionVariants(registry, options) {
	const carrier = registry;
	let shared = carrier[SHARED_VARIANTS];
	if (shared === void 0) {
		shared = {
			optionsKey: optionsKey(options),
			publisher: new VariantPublisher(registry, options),
			references: 0
		};
		Object.defineProperty(carrier, SHARED_VARIANTS, {
			configurable: true,
			enumerable: false,
			writable: false,
			value: shared
		});
	} else if (shared.optionsKey !== optionsKey(options)) throw new Error("context-compression selector: AgentPresets already has a different compression overlay");
	const lease = shared;
	lease.references += 1;
	const published = lease.publisher.publish();
	published.catch(() => {});
	let disposed = false;
	return {
		get ids() {
			return lease.publisher.ids;
		},
		ready: () => published,
		async dispose() {
			if (disposed) return;
			disposed = true;
			try {
				await published;
			} catch {}
			lease.references -= 1;
			if (lease.references !== 0) return;
			if (carrier[SHARED_VARIANTS] === lease) Reflect.deleteProperty(carrier, SHARED_VARIANTS);
			await lease.publisher.dispose();
		}
	};
}
/** Stable equality for two rows asking to share one publication. */
function optionsKey(options) {
	return JSON.stringify({
		modules: options.modules,
		excludedPresetIds: [...options.excludedPresetIds ?? DEFAULT_EXCLUDED_PRESET_IDS].sort(),
		idSuffix: options.idSuffix ?? "--compression",
		displaySuffix: options.displaySuffix ?? DEFAULT_DISPLAY_SUFFIX
	});
}
/** Owns the declarations one installation published and their withdrawal. */
var VariantPublisher = class {
	registry;
	options;
	variants = /* @__PURE__ */ new Map();
	disposed = false;
	/** Serializes concurrent publications; never rejected, so the chain survives a failure. */
	queue = Promise.resolve();
	constructor(registry, options) {
		this.registry = registry;
		this.options = options;
		const paths = Object.entries(options.modules);
		for (const [name, path] of paths) if (!isModuleUrl(path)) throw new TypeError(`context-compression selector: module ${name} is not a file: URL: ${path}`);
	}
	/** Ids of the variants published so far. */
	get ids() {
		return [...this.variants.keys()];
	}
	/**
	* Publish one variant per applicable native preset.
	*
	* Concurrent calls (two rows leasing the same publication) are serialized,
	* because registering an id twice is refused by the registry.
	*/
	publish() {
		const next = async () => await this.publishOnce();
		const task = this.queue.then(next, next);
		this.queue = task.catch(() => {});
		return task;
	}
	/**
	* Publish every missing variant.
	*
	* A variant whose id is already declared is left to its owner: that is the
	* ordinary reinstall shape (this installation's second lease) and the shape
	* left behind by a process that died before its withdraw.
	*
	* One source preset that cannot be composed does not withdraw the others: its
	* failure is collected and every remaining source is still published, because a
	* single unusable document must not cost the profile its whole compression
	* stack. All failures are reported together as one rejection for the caller to
	* log.
	*/
	async publishOnce() {
		const suffix = this.options.idSuffix ?? "--compression";
		const native = await this.registry.list();
		const declared = new Set(native.map((preset) => preset.id));
		const failures = [];
		for (const preset of native) {
			if (this.disposed) return;
			if (!isPublishable(preset, suffix, this.excluded())) continue;
			const id = `${preset.id}${suffix}`;
			if (this.variants.has(id) || declared.has(id)) continue;
			try {
				const rows = await this.composeRows(preset.id);
				const description = this.options.describeVariant?.(preset) ?? preset.description;
				const source = this.options.displayName?.(preset) ?? preset.name ?? preset.id;
				const release = await this.registry.register({
					id,
					name: `${source} · ${this.options.displaySuffix ?? DEFAULT_DISPLAY_SUFFIX}`,
					...description === void 0 ? {} : { description },
					...preset.order === void 0 ? {} : { order: preset.order },
					plugins: rows
				});
				this.variants.set(id, { release });
			} catch (error) {
				failures.push({
					id,
					error
				});
			}
		}
		if (failures.length === 1) throw failures[0].error;
		if (failures.length > 1) throw new AggregateError(failures.map((failure) => new Error(`context-compression selector: cannot publish preset variant ${failure.id}`, { cause: failure.error })), "context-compression selector: preset variant publication failed");
	}
	/** Withdraw every published variant, reporting the first failure last. */
	async dispose() {
		this.disposed = true;
		await this.queue.catch(() => {});
		const entries = [...this.variants.entries()];
		this.variants.clear();
		const failures = [];
		for (const [id, variant] of entries.reverse()) try {
			await variant.release();
		} catch (error) {
			failures.push(new Error(`context-compression selector: cannot withdraw preset variant ${id}`, { cause: error }));
		}
		if (failures.length !== 0) throw new AggregateError(failures, "context-compression selector: preset variant disposal failed");
	}
	excluded() {
		return new Set(this.options.excludedPresetIds ?? DEFAULT_EXCLUDED_PRESET_IDS);
	}
	/** Source rows with every prior compression implementation replaced by ours. */
	async composeRows(sourceId) {
		const document = await this.registry.readDocument(sourceId);
		const thresholdPercent = this.options.autoCompactThresholdPercent?.();
		if (thresholdPercent !== void 0 && !Number.isFinite(thresholdPercent)) throw new Error(`context-compression selector: Auto Compact threshold percent must be finite, got ${String(thresholdPercent)}`);
		const rows = parseRows(document.content, sourceId);
		return applyEntryPatches(stripCompressionRows(rows), [{ insert: canonicalCompressionRows(this.options.modules, thresholdPercent) }], (message, ...args) => {
			throw new Error(renderPatchWarning(message, args));
		});
	}
};
/** Whether one roster entry is a native preset that still needs a variant. */
function isPublishable(preset, suffix, excluded) {
	if (preset.broken !== void 0) return false;
	if (excluded.has(preset.id)) return false;
	return !preset.id.endsWith(suffix);
}
/** Parse one native preset with exactly the Loader's YAML dialect. */
function parseRows(source, id) {
	const parsed = load(source, { schema: entryListSchema });
	if (!Array.isArray(parsed)) throw new TypeError(`context-compression selector: preset ${id} is not a top-level entry list`);
	return parsed;
}
/** Remove any prior compression implementation before adding the canonical one. */
function stripCompressionRows(rows) {
	const kept = [];
	for (const row of rows) {
		if (COMPRESSION_IDS.has(row.id) || COMPRESSION_PACKAGES.has(row.name)) continue;
		if (row.group === true && Array.isArray(row.config)) {
			const nested = row.config;
			kept.push({
				...row,
				config: stripCompressionRows(nested)
			});
		} else kept.push(row);
	}
	return kept;
}
/** Whether one declaration row name is a resolvable filesystem module URL. */
function isModuleUrl(value) {
	return URL.canParse(value) && new URL(value).protocol === "file:";
}
const COMPRESSION_IDS = /* @__PURE__ */ new Set([
	"compaction",
	"compaction-basic",
	"command-compact",
	"tool-result-pruner"
]);
const COMPRESSION_PACKAGES = /* @__PURE__ */ new Set([
	"@deepseek-ai/dsh-compaction-basic",
	"@deepseek-ai/dsh-command-compact",
	"@deepseek-ai/dsh-compaction-tool-result-pruner",
	"dsh-context-compression-selector-runtime"
]);
/**
* Complete, same-realm compression stack added to every applicable preset.
* When the Host settings expose an Auto Compact threshold, one read feeds both
* the compaction-basic `thresholdRatio` (beside the pinned first-release
* `retainRatio`) and the runtime deployment config, so plugin History and
* native Auto Compact share one watermark for this whole generation.
*/
function canonicalCompressionRows(modules, thresholdPercent) {
	return [{
		id: "compaction",
		name: "cordis:group",
		group: true,
		isolate: {
			compaction: true,
			toolResultPruner: true
		},
		config: [
			{
				id: "compaction-basic",
				name: modules.compactionBasic,
				...thresholdPercent === void 0 ? {} : { config: {
					thresholdRatio: thresholdPercent / 100,
					retainRatio: .16
				} }
			},
			{
				id: "command-compact",
				name: modules.commandCompact
			},
			{
				id: "tool-result-pruner",
				name: modules.toolResultPruner,
				config: {
					headChars: 4096,
					tailChars: 1024,
					...thresholdPercent === void 0 ? {} : { autoCompactThresholdPercent: thresholdPercent }
				}
			}
		]
	}];
}
/** Render include's printf-style warning without silently losing its target. */
function renderPatchWarning(message, args) {
	let index = 0;
	return `context-compression selector: ${message.replace(/%C/g, () => JSON.stringify(args[index++]))}`;
}
//#endregion
//#region src/index.ts
/**
* Mark a field live-editable on the Plugins page.
*
* The Host derives a row's settings form from this schema, but it only serves
* the fields carrying schemastery's `.volatile()` mark — `SettingsForms.describe`
* runs the schema through `volatileForm`, which drops every unmarked field and
* returns `undefined` when nothing survives. A row whose fields are all plain
* therefore yields no form at all: the browser selector's
* `configForms.get('context-compression')` comes back empty, every surface
* self-hides, and the Plugin settings page shows a lone empty tab.
*
* `.volatile()` means "edits commit without remounting the entry". That is
* exactly right for the three fields the browser selector writes live: it owns
* them, and every consumer reads the same settings document rather than the
* apply-time snapshot. `presetOverlay` is deliberately left plain — it is read
* once in `apply()` to decide whether to publish the preset variants, so a
* change must remount the row, and an unmarked field is correctly not editable.
*
* A marked field also publishes its schema to the browser: the Host serves
* `schema.toJSON()` and `ConfigFormController.decode` rehydrates that envelope to
* validate the value it was served, so a marked field MUST use a schema that
* survives plain JSON. `CustomCompressionPolicyInputSchema` is that schema for
* the Custom document — `CustomCompressionPolicySchema` is a schemastery
* `transform` whose callback cannot be serialized, and a marked field carrying
* it makes the server value fail its own rehydrated schema
* (`callback is not a function`), which leaves the browser form in `loading`
* with every control disabled.
*
* The helper tolerates a schemastery predating the modifier: a runtime without
* `.volatile` keeps the plain field instead of throwing at import time.
*/
function volatileField(field) {
	return typeof field.volatile === "function" ? field.volatile() : field;
}
/**
* Global symbol cosmokit marks a live config reference with.
*
* `isVolatile` is deliberately identified across ESM/CJS copies of cosmokit, so
* the check needs no import and no extra dependency.
*/
const VOLATILE_WRITE = Symbol.for("cosmokit.volatile.write");
/**
* Read one config field as the plain value it was set to.
*
* A `.volatile()` field does not reach `apply()` as its value: it arrives as a
* cosmokit `Volatile` reference, which is what lets a live edit update the
* running row without remounting it. Every read of the *value* therefore has to
* unwrap the reference — `Number.isFinite()` over it is false, and that silently
* disarmed the whole publication: `composeRows` threw
* `Auto Compact threshold percent must be finite` inside the fire-and-forget
* publish, whose rejection this plugin swallows, so no preset variant was ever
* registered and compression never ran.
*/
function fieldValue(field) {
	return typeof field === "object" && field !== null && VOLATILE_WRITE in field ? field.get() : field;
}
/** Loader validation for the standalone Bundle row. */
const Config = z.object({
	profile: volatileField(z.union([...COMPRESSION_PROFILES]).default("balanced")),
	custom: volatileField(CustomCompressionPolicyInputSchema.default(DEFAULT_CUSTOM_COMPRESSION_POLICY)),
	autoCompactThresholdPercent: volatileField(z.number().step(1).min(AUTO_COMPACT_THRESHOLD_LIMITS.min).max(AUTO_COMPACT_THRESHOLD_LIMITS.max).default(AUTO_COMPACT_THRESHOLD_LIMITS.default)),
	presetOverlay: z.boolean().default(false)
});
/** The shipped preset names the client's own `zh` dictionary uses. */
const SHIPPED_NAMES_ZH = {
	standard: "标准模式",
	ptc: "PTC 模式",
	minimal: "极简模式",
	cordis: "创造模式"
};
/** The shipped preset names the client's own `en` dictionary uses. */
const SHIPPED_NAMES_EN = {
	standard: "Standard mode",
	ptc: "PTC mode",
	minimal: "Minimal mode",
	cordis: "Creator mode"
};
/** Display name of one source preset in one language. */
function sourceDisplayName(source, names) {
	return source.name ?? names[source.id] ?? source.id;
}
const VARIANT_COPY = {
	en: {
		displaySuffix: "Context compression",
		shippedNames: SHIPPED_NAMES_EN,
		describe: (source, thresholdPercent) => [
			`Context compression over ${source.description ?? `the native ${source.id} preset`}.`,
			"The selector's compression stack — fresh, aggregate and history budgets plus recoverable tool-result pruning — replaces native head/tail trimming.",
			`Auto Compact frozen at ${String(thresholdPercent)}%.`
		].join(" ")
	},
	zh: {
		displaySuffix: "上下文压缩",
		shippedNames: SHIPPED_NAMES_ZH,
		describe: (source, thresholdPercent) => [
			`在「${sourceDisplayName(source, SHIPPED_NAMES_ZH)}」的基础上启用上下文压缩：`,
			"Fresh 预压缩刚变大的工具结果、Aggregate 在仍超预算时再次压缩、History 回收旧的工具结果并保留近期上下文，取代原生首尾裁剪。",
			`本次生成冻结的 Auto Compact 水位为 ${String(thresholdPercent)}%。`,
			"新建任务时选择本模式即可生效；Profile 与水位在「设置 → Context compression」中调整。"
		].join("")
	}
};
/** Settings namespace the locale plugin owns; its row carries the UI language. */
const LOCALE_SETTINGS_NAMESPACE = "locale";
/** Field carrying an explicit language selection inside that namespace. */
const LOCALE_PREFERENCE_FIELD = "preference";
/** Accepted BCP 47-style language ids, mirroring the locale plugin's schema. */
const LOCALE_ID_PATTERN = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;
/**
* Resolve the language the variant copy is written in.
*
* Order: the user's explicit choice in the settings document, then the process
* locale, then English. Reading the settings document is deliberately optional —
* a service that is not mounted yet, a document that has not loaded, or a
* rejected read only costs the explicit preference and falls back to the
* process locale, which is what an unset preference means anyway.
*/
function resolveVariantLocale(ctx) {
	return (localePreference(ctx) ?? processLocale())?.toLowerCase().startsWith("zh") === true ? "zh" : "en";
}
/** The user's saved language choice, read from the settings document. */
function localePreference(ctx) {
	try {
		const rows = ctx.get("settings")?.describe?.();
		if (!Array.isArray(rows)) return void 0;
		for (const row of rows) {
			const entry = row;
			if (entry.ns !== LOCALE_SETTINGS_NAMESPACE) continue;
			const chosen = entry.user?.[LOCALE_PREFERENCE_FIELD] ?? entry.value?.[LOCALE_PREFERENCE_FIELD];
			if (typeof chosen === "string" && LOCALE_ID_PATTERN.test(chosen)) return chosen;
		}
	} catch {}
}
/** The running process locale, used when no explicit preference is saved. */
function processLocale() {
	try {
		return new Intl.DateTimeFormat().resolvedOptions().locale;
	} catch {
		return;
	}
}
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
function apply(ctx, config = {}) {
	if (fieldValue(config.presetOverlay) !== true) return;
	ctx.inject(["agentPresets"], (presetsCtx) => {
		const thresholdPercent = () => fieldValue(config.autoCompactThresholdPercent) ?? AUTO_COMPACT_THRESHOLD_LIMITS.default;
		const copy = VARIANT_COPY[resolveVariantLocale(ctx)];
		const installation = installCompressionVariants(presetsCtx.agentPresets, {
			modules: resolveCompressionModulePaths(),
			excludedPresetIds: ["minimal"],
			autoCompactThresholdPercent: thresholdPercent,
			displayName: (source) => sourceDisplayName(source, copy.shippedNames),
			displaySuffix: copy.displaySuffix,
			describeVariant: (source) => copy.describe(source, thresholdPercent())
		});
		presetsCtx.effect(() => () => installation.dispose(), "contextCompressionSelector.agentPresets()");
		installation.ready().catch((error) => {
			presetsCtx.logger.error("context-compression selector: preset variants were not published, so this profile runs without context compression", error);
		});
	});
}
//#endregion
export { Config, apply };
