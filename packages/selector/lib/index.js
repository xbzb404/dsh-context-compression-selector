import z from "@deepseek-ai/schemastery";
import { AUTO_COMPACT_THRESHOLD_LIMITS, COMPRESSION_PROFILES, CustomCompressionPolicySchema, DEFAULT_CUSTOM_COMPRESSION_POLICY } from "dsh-context-compression-selector-runtime";
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
	*/
	async publishOnce() {
		const suffix = this.options.idSuffix ?? "--compression";
		const native = await this.registry.list();
		const declared = new Set(native.map((preset) => preset.id));
		for (const preset of native) {
			if (this.disposed) return;
			if (!isPublishable(preset, suffix, this.excluded())) continue;
			const id = `${preset.id}${suffix}`;
			if (this.variants.has(id) || declared.has(id)) continue;
			const rows = await this.composeRows(preset.id);
			const release = await this.registry.register({
				id,
				name: `${preset.name ?? preset.id} · ${this.options.displaySuffix ?? DEFAULT_DISPLAY_SUFFIX}`,
				...preset.description === void 0 ? {} : { description: preset.description },
				...preset.order === void 0 ? {} : { order: preset.order },
				plugins: rows
			});
			this.variants.set(id, { release });
		}
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
/** Loader validation for the standalone Bundle row. */
const Config = z.object({
	profile: z.union([...COMPRESSION_PROFILES]).default("balanced"),
	custom: CustomCompressionPolicySchema.default(DEFAULT_CUSTOM_COMPRESSION_POLICY),
	autoCompactThresholdPercent: z.number().step(1).min(AUTO_COMPACT_THRESHOLD_LIMITS.min).max(AUTO_COMPACT_THRESHOLD_LIMITS.max).default(AUTO_COMPACT_THRESHOLD_LIMITS.default),
	presetOverlay: z.boolean().default(false)
});
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
	if (config.presetOverlay !== true) return;
	ctx.inject(["agentPresets"], (presetsCtx) => {
		const installation = installCompressionVariants(presetsCtx.agentPresets, {
			modules: resolveCompressionModulePaths(),
			excludedPresetIds: ["minimal"],
			autoCompactThresholdPercent: () => config.autoCompactThresholdPercent ?? AUTO_COMPACT_THRESHOLD_LIMITS.default
		});
		presetsCtx.effect(() => () => installation.dispose(), "contextCompressionSelector.agentPresets()");
	});
}
//#endregion
export { Config, apply };
