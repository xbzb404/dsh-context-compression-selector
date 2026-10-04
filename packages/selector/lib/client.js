window.__ModuleLoader__.load({
	id: "dsh-context-compression-selector",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-context-compression-css:466eb745356d-CompressionProfileSelector.module.css.mjs
		const css = ".rLocJG_settingsSection{max-width:720px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:12px;display:flex}.rLocJG_settingsTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:500;line-height:24px}.rLocJG_settingsDescription{color:var(--dsw-alias-label-tertiary);margin:0;font-size:14px;line-height:22px}.rLocJG_root{width:100%}.rLocJG_profileGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;display:grid}.rLocJG_profileCard{border:1px solid var(--dsw-alias-border-l2);min-height:112px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border-radius:10px;flex-direction:column;gap:8px;padding:14px;display:flex}.rLocJG_profileCard:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.rLocJG_profileCard[aria-pressed=true]{border-color:var(--dsw-alias-label-primary)}.rLocJG_profileCard:active:not(:disabled){transform:scale(.99)}.rLocJG_profileCard:disabled{cursor:default;opacity:.6}.rLocJG_profileCard:focus-visible{outline-offset:2px;outline:2px solid}.rLocJG_profileCardTop{align-items:center;gap:8px;display:flex}.rLocJG_profileCardTitle{font-size:14px;font-weight:500;line-height:20px}.rLocJG_profileCurrent{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);border-radius:999px;padding:1px 6px;font-size:10px;line-height:14px}.rLocJG_profileCardDetail{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.rLocJG_button{border:1px solid var(--dsw-alias-border-l2);width:100%;min-height:34px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border-radius:10px;align-items:center;gap:8px;padding:6px 8px;display:flex}.rLocJG_button:hover{background:var(--dsw-alias-interactive-bg-hover)}.rLocJG_button:disabled{cursor:default;opacity:.6}.rLocJG_copy{flex:1;min-width:0}.rLocJG_label{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:14px}.rLocJG_value{text-overflow:ellipsis;white-space:nowrap;font-size:13px;line-height:17px;overflow:hidden}.rLocJG_chevron{color:var(--dsw-alias-label-secondary);flex:none}.rLocJG_menuCopy{flex-direction:column;gap:2px;min-width:220px;display:flex}.rLocJG_menuTitle{font-size:13px;line-height:17px}.rLocJG_menuDetail{white-space:normal;max-width:290px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:15px}.rLocJG_error{color:var(--dsw-alias-state-error-primary);padding:4px 8px 0;font-size:11px;line-height:15px}.rLocJG_unavailable{color:var(--dsw-alias-label-tertiary);padding:4px 8px 0;font-size:11px;line-height:15px}.rLocJG_settingsHint{color:var(--dsw-alias-label-secondary);padding:4px 8px 0;font-size:11px;line-height:15px}.rLocJG_pricing{color:var(--dsw-alias-label-tertiary);padding:4px 8px 0;font-size:11px;line-height:15px}.rLocJG_custom{border-top:1px solid var(--dsw-alias-border-l2);margin-top:16px;padding:16px 0 0}.rLocJG_customTitle{margin:0 0 6px;font-size:13px;line-height:17px}.rLocJG_customNote{color:var(--dsw-alias-label-tertiary);margin:4px 0;font-size:11px;line-height:15px}.rLocJG_stage{border:0;border-top:1px solid var(--dsw-alias-border-l2);margin:12px 0 0;padding:12px 0 0}.rLocJG_stageToggle{align-items:center;gap:6px;font-size:12px;line-height:16px;display:inline-flex}.rLocJG_fieldGrid{grid-template-columns:1fr;gap:8px;display:grid}.rLocJG_field{min-width:0;color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;margin-top:8px;font-size:11px;line-height:15px;display:flex}.rLocJG_field input,.rLocJG_field select{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:100%;min-width:0;min-height:30px;color:var(--dsw-alias-label-primary);border-radius:7px;padding:4px 6px}.rLocJG_field input:focus-visible,.rLocJG_field select:focus-visible,.rLocJG_actions button:focus-visible{outline-offset:2px;outline:2px solid}.rLocJG_actions{flex-wrap:wrap;gap:8px;margin-top:10px;display:flex}.rLocJG_actions button{border:1px solid var(--dsw-alias-border-l2);min-height:30px;color:var(--dsw-alias-label-primary);background:0 0;border-radius:7px;padding:4px 8px}.rLocJG_actions button:active:not(:disabled){transform:scale(.98)}.rLocJG_actions button:disabled{opacity:.6}@media (width<=560px){.rLocJG_profileGrid{grid-template-columns:1fr}}.rLocJG_autoCompact{border:1px solid #80808059;border-radius:8px;margin-top:24px;padding:16px}.rLocJG_autoCompactTitle{margin:0 0 8px;font-size:15px;font-weight:600}.rLocJG_autoCompactRisk{opacity:.9;margin:8px 0 0;font-size:12px}";
		const tagId = "dsh-context-compression-selector/CompressionProfileSelector.module.css";
		if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${tagId}"]`) === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-context-compression-selector";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default = {
			"actions": "rLocJG_actions",
			"autoCompact": "rLocJG_autoCompact",
			"autoCompactRisk": "rLocJG_autoCompactRisk",
			"autoCompactTitle": "rLocJG_autoCompactTitle",
			"button": "rLocJG_button",
			"chevron": "rLocJG_chevron",
			"copy": "rLocJG_copy",
			"custom": "rLocJG_custom",
			"customNote": "rLocJG_customNote",
			"customTitle": "rLocJG_customTitle",
			"error": "rLocJG_error",
			"field": "rLocJG_field",
			"fieldGrid": "rLocJG_fieldGrid",
			"label": "rLocJG_label",
			"menuCopy": "rLocJG_menuCopy",
			"menuDetail": "rLocJG_menuDetail",
			"menuTitle": "rLocJG_menuTitle",
			"pricing": "rLocJG_pricing",
			"profileCard": "rLocJG_profileCard",
			"profileCardDetail": "rLocJG_profileCardDetail",
			"profileCardTitle": "rLocJG_profileCardTitle",
			"profileCardTop": "rLocJG_profileCardTop",
			"profileCurrent": "rLocJG_profileCurrent",
			"profileGrid": "rLocJG_profileGrid",
			"root": "rLocJG_root",
			"settingsDescription": "rLocJG_settingsDescription",
			"settingsHint": "rLocJG_settingsHint",
			"settingsSection": "rLocJG_settingsSection",
			"settingsTitle": "rLocJG_settingsTitle",
			"stage": "rLocJG_stage",
			"stageToggle": "rLocJG_stageToggle",
			"unavailable": "rLocJG_unavailable",
			"value": "rLocJG_value"
		};
		//#endregion
		//#region src/profiles.ts
		/** Public context-compression choices shared by the Host schema and browser selector. */
		const COMPRESSION_PROFILES = [
			"off",
			"native",
			"balanced",
			"cache-strict",
			"savings",
			"adaptive",
			"custom"
		];
		/** Browser-safe mirror of the Host's Balanced-equivalent Custom default. */
		const DEFAULT_CUSTOM_COMPRESSION_POLICY = {
			version: 3,
			unit: "tokens",
			fresh: {
				enabled: true,
				trigger: 8192,
				target: 3072
			},
			aggregate: {
				enabled: true,
				trigger: 32768,
				target: 12288
			},
			history: {
				enabled: true,
				trigger: 5e5,
				keepRecentToolCalls: 10,
				keepRecentTokens: 64e3,
				minReclaim: 96e3
			},
			prefixPolicy: "pressure-break",
			tailTrim: {
				enabled: false,
				trigger: 7e5
			}
		};
		/**
		* The one threshold contract shared by the UI, the persisted settings, and the
		* runtime resolver; mirrored browser-safe from the runtime package.
		*/
		const AUTO_COMPACT_THRESHOLD_LIMITS = Object.freeze({
			min: 50,
			max: 90,
			step: 1,
			default: 80
		});
		/** Narrow one unknown value to a valid Auto Compact threshold percent. */
		function isValidAutoCompactThresholdPercent(value) {
			return typeof value === "number" && Number.isSafeInteger(value) && value >= AUTO_COMPACT_THRESHOLD_LIMITS.min && value <= AUTO_COMPACT_THRESHOLD_LIMITS.max;
		}
		/** Accept JSON-object records while rejecting class instances and exotic prototypes. */
		function isPlainRecord(value) {
			if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
			const prototype = Object.getPrototypeOf(value);
			return prototype === Object.prototype || prototype === null;
		}
		/**
		* Decode the persisted autoCompact section with exactly the runtime schema's
		* strictness: absent means the 80% default; present values must be a plain
		* object carrying only a valid `thresholdPercent`. Anything else is invalid,
		* never silently coerced.
		*/
		function decodeAutoCompactSettings(value) {
			if (value === void 0) return { thresholdPercent: AUTO_COMPACT_THRESHOLD_LIMITS.default };
			if (!isPlainRecord(value)) return void 0;
			const keys = Object.keys(value);
			if (keys.length !== 1 || keys[0] !== "thresholdPercent") return void 0;
			const thresholdPercent = value.thresholdPercent;
			return isValidAutoCompactThresholdPercent(thresholdPercent) ? { thresholdPercent } : void 0;
		}
		/**
		* Narrow an unknown settings value to a complete supported Custom policy.
		* @param value - Candidate settings value received from the Host or edited locally.
		* @returns Whether the value is a relation-valid Custom policy.
		*/
		function isCustomCompressionPolicy(value) {
			if (!hasExactKeys(value, value !== null && typeof value === "object" && "version" in value && value.version === 1 ? [
				"version",
				"unit",
				"fresh",
				"aggregate",
				"history",
				"prefixPolicy"
			] : [
				"version",
				"unit",
				"fresh",
				"aggregate",
				"history",
				"prefixPolicy",
				"tailTrim"
			])) return false;
			if (value.version !== 1 && value.version !== 2 && value.version !== 3 || value.unit !== "tokens" && value.unit !== "context-percent") return false;
			if (value.prefixPolicy !== "preserve" && value.prefixPolicy !== "pressure-break") return false;
			if (!isBudget(value.fresh) || !isBudget(value.aggregate)) return false;
			const modernHistory = value.version === 3;
			if (!hasExactKeys(value.history, modernHistory ? [
				"enabled",
				"trigger",
				"keepRecentToolCalls",
				"keepRecentTokens",
				"minReclaim"
			] : [
				"enabled",
				"trigger",
				"keepRecentTurns",
				"keepRecent",
				"minReclaim"
			])) return false;
			if (typeof value.history.enabled !== "boolean" || typeof value.history.trigger !== "number" || typeof value.history.minReclaim !== "number") return false;
			const recent = modernHistory ? value.history.keepRecentTokens : value.history.keepRecent;
			const calls = modernHistory ? value.history.keepRecentToolCalls : value.history.keepRecentTurns;
			if (typeof recent !== "number" || typeof calls !== "number" || !Number.isSafeInteger(calls) || calls < 0) return false;
			let tailTrimTrigger;
			if (value.version !== 1) {
				const tailTrim = value.tailTrim;
				if (!hasExactKeys(tailTrim, ["enabled", "trigger"]) || typeof tailTrim.enabled !== "boolean" || typeof tailTrim.trigger !== "number") return false;
				tailTrimTrigger = tailTrim.trigger;
			}
			const measured = [
				value.fresh.trigger,
				value.fresh.target,
				value.aggregate.trigger,
				value.aggregate.target,
				value.history.trigger,
				recent,
				value.history.minReclaim,
				...tailTrimTrigger === void 0 ? [] : [tailTrimTrigger]
			];
			if (!measured.every((entry) => typeof entry === "number" && Number.isFinite(entry))) return false;
			if (value.fresh.trigger <= 0 || value.fresh.target <= 0 || value.aggregate.trigger <= 0 || value.aggregate.target <= 0 || value.history.trigger <= 0 || recent < 0 || value.history.minReclaim <= 0 || tailTrimTrigger !== void 0 && tailTrimTrigger <= 0) return false;
			if (value.unit === "tokens" && !measured.every(Number.isSafeInteger)) return false;
			if (value.unit === "context-percent" && !measured.every((entry) => entry <= 100)) return false;
			return value.fresh.target < value.fresh.trigger && value.aggregate.target < value.aggregate.trigger && value.history.minReclaim <= value.history.trigger;
		}
		function isBudget(value) {
			return hasExactKeys(value, [
				"enabled",
				"trigger",
				"target"
			]) && typeof value.enabled === "boolean" && typeof value.trigger === "number" && typeof value.target === "number";
		}
		/**
		* Canonicalize one validated Custom document to version 3, mirroring the
		* runtime's `canonicalizeCustomPolicy` exactly so the browser and runtime
		* boundaries hand the SAME complete document to the UI and the policy
		* resolver: legacy v1/v2 History working sets upgrade to the 10-call default,
		* and a v1 document gains the default-disabled TailTrim stage.
		*/
		function canonicalizeCustomPolicy(policy) {
			if (policy.version === 3) return structuredClone(policy);
			return {
				version: 3,
				unit: policy.unit,
				fresh: structuredClone(policy.fresh),
				aggregate: structuredClone(policy.aggregate),
				history: {
					enabled: policy.history.enabled,
					trigger: policy.history.trigger,
					keepRecentToolCalls: 10,
					keepRecentTokens: policy.history.keepRecent,
					minReclaim: policy.history.minReclaim
				},
				prefixPolicy: policy.prefixPolicy,
				tailTrim: policy.version === 1 ? {
					enabled: false,
					trigger: 7e5
				} : structuredClone(policy.tailTrim)
			};
		}
		function hasExactKeys(value, expected) {
			if (!isPlainRecord(value)) return false;
			const keys = Object.keys(value);
			return keys.length === expected.length && keys.every((key) => expected.includes(key));
		}
		//#endregion
		//#region src/client/CompressionProfileSelector.tsx
		/** Full-page Settings surface backed by the same durable selector state. */
		function ContextCompressionSettingsSection(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsCompressionProfileControls, { ...props });
		}
		function SettingsCompressionProfileControls({ useCompression, select, saveCustom, resetCustom, saveAutoCompact, t }) {
			const state = useCompression((snapshot) => snapshot);
			const [saving, setSaving] = (0, react.useState)(false);
			const [saveError, setSaveError] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)(null);
			const current = state.value?.profile ?? "balanced";
			(0, react.useEffect)(() => {
				const custom = state.value?.custom;
				setDraft(current === "custom" && custom !== void 0 ? editableCustom(custom) : null);
			}, [current, state.value?.custom]);
			if (state.status === "unavailable") return null;
			const busy = state.status === "loading" || saving;
			const selectProfile = (profile) => {
				if (!state.writable || profile === current) return;
				setSaveError(null);
				setSaving(true);
				select(profile).then(() => {
					setSaving(false);
				}, (error) => {
					setSaving(false);
					setSaveError(error instanceof Error && error.message !== "" ? error.message : t("status.saveFailed"));
				});
			};
			const settle = (operation) => {
				setSaveError(null);
				setSaving(true);
				operation().then(() => {
					setSaving(false);
				}, (error) => {
					setSaving(false);
					setSaveError(error instanceof Error && error.message !== "" ? error.message : t("status.saveFailed"));
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.settingsSection,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.settingsTitle,
						children: t("settings.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.settingsDescription,
						children: t("settings.description")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.profileGrid,
						"aria-label": t("label"),
						children: COMPRESSION_PROFILES.map((profile) => {
							const selected = profile === current;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.profileCard,
								"aria-pressed": selected,
								disabled: busy || !state.writable,
								onClick: () => {
									selectProfile(profile);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.profileCardTop,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.profileCardTitle,
										children: t(`profile.${profile}`)
									}), selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.profileCurrent,
										children: t("profile.current")
									}) : null]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.profileCardDetail,
									children: t(`detail.${profile}`)
								})]
							}, profile);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AutoCompactThresholdControls, {
						value: state.value?.autoCompact?.thresholdPercent ?? AUTO_COMPACT_THRESHOLD_LIMITS.default,
						disabled: busy || !state.writable,
						save: saveAutoCompact,
						settle,
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.pricing,
						children: t("pricing.disclosure")
					}),
					current !== "custom" || draft === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomPolicyEditor, {
						value: draft,
						disabled: busy || !state.writable,
						setValue: setDraft,
						save: () => saveCustom(structuredClone(draft)),
						reset: resetCustom,
						settle,
						t
					}),
					saveError === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.error,
						role: "alert",
						children: saveError
					})
				]
			});
		}
		/**
		* The authoritative Auto Compact threshold editor for the context-compression
		* section. A typed number input and its save path are kept deliberately simple;
		* values outside the recommended 70–85 band warn without blocking.
		*/
		function AutoCompactThresholdControls({ value, disabled, save, settle, t }) {
			const [draft, setDraft] = (0, react.useState)(String(value));
			(0, react.useEffect)(() => {
				setDraft(String(value));
			}, [value]);
			const parsed = Number(draft);
			const valid = isValidAutoCompactThresholdPercent(parsed);
			const risk = !valid ? "autoCompact.invalid" : parsed < 70 ? "autoCompact.riskLow" : parsed > 85 ? "autoCompact.riskHigh" : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.autoCompact,
				"aria-labelledby": "context-compression-autocompact-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						id: "context-compression-autocompact-title",
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.autoCompactTitle,
						children: t("autoCompact.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.customNote,
						children: t("autoCompact.description")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("autoCompact.inputLabel") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "number",
							value: draft,
							min: AUTO_COMPACT_THRESHOLD_LIMITS.min,
							max: AUTO_COMPACT_THRESHOLD_LIMITS.max,
							step: AUTO_COMPACT_THRESHOLD_LIMITS.step,
							disabled,
							"aria-invalid": !valid,
							onChange: (event) => {
								setDraft(event.currentTarget.value);
							}
						})]
					}),
					risk === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: risk === "autoCompact.invalid" ? _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.error : _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.autoCompactRisk,
						role: risk === "autoCompact.invalid" ? "alert" : "note",
						children: t(risk)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.actions,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: disabled || !valid || parsed === value,
							onClick: () => {
								settle(() => save(parsed));
							},
							children: t("autoCompact.save")
						})
					})
				]
			});
		}
		function CustomPolicyEditor({ value, disabled, setValue, save, reset, settle, t }) {
			const valid = isCustomCompressionPolicy(value);
			const unitStep = value.unit === "tokens" ? 1 : .01;
			const unitMax = value.unit === "tokens" ? void 0 : 100;
			const unitBounds = unitMax === void 0 ? {} : { max: unitMax };
			const setBudget = (stage, patch) => {
				setValue({
					...value,
					[stage]: {
						...value[stage],
						...patch
					}
				});
			};
			const setHistory = (patch) => {
				setValue({
					...value,
					history: {
						...value.history,
						...patch
					}
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.custom,
				"aria-labelledby": "context-compression-custom-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						id: "context-compression-custom-title",
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.customTitle,
						children: t("custom.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.customNote,
						children: t("custom.sessionScope")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.customNote,
						children: t("custom.measurement")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("custom.unit") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: value.unit,
							disabled,
							onChange: (event) => {
								setValue({
									...value,
									unit: event.currentTarget.value
								});
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "tokens",
								children: t("custom.unit.tokens")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "context-percent",
								children: t("custom.unit.contextPercent")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StageFields, {
						t,
						title: t("custom.fresh.enabled"),
						enabled: value.fresh.enabled,
						disabled,
						onEnabled: (enabled) => {
							setBudget("fresh", { enabled });
						},
						fields: [{
							label: t("custom.fresh.trigger"),
							value: value.fresh.trigger,
							set: (trigger) => {
								setBudget("fresh", { trigger });
							},
							...unitBounds
						}, {
							label: t("custom.fresh.target"),
							value: value.fresh.target,
							set: (target) => {
								setBudget("fresh", { target });
							},
							...unitBounds
						}],
						step: unitStep
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StageFields, {
						t,
						title: t("custom.aggregate.enabled"),
						enabled: value.aggregate.enabled,
						disabled,
						onEnabled: (enabled) => {
							setBudget("aggregate", { enabled });
						},
						fields: [{
							label: t("custom.aggregate.trigger"),
							value: value.aggregate.trigger,
							set: (trigger) => {
								setBudget("aggregate", { trigger });
							},
							...unitBounds
						}, {
							label: t("custom.aggregate.target"),
							value: value.aggregate.target,
							set: (target) => {
								setBudget("aggregate", { target });
							},
							...unitBounds
						}],
						step: unitStep
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StageFields, {
						t,
						title: t("custom.history.enabled"),
						enabled: value.history.enabled,
						disabled,
						onEnabled: (enabled) => {
							setHistory({ enabled });
						},
						fields: [
							{
								label: t("custom.history.trigger"),
								value: value.history.trigger,
								set: (trigger) => {
									setHistory({ trigger });
								},
								...unitBounds
							},
							{
								label: t("custom.history.keepRecentToolCalls"),
								value: value.history.keepRecentToolCalls,
								set: (keepRecentToolCalls) => {
									setHistory({ keepRecentToolCalls });
								},
								integer: true,
								allowZero: true
							},
							{
								label: t("custom.history.keepRecentTokens"),
								value: value.history.keepRecentTokens,
								set: (keepRecentTokens) => {
									setHistory({ keepRecentTokens });
								},
								allowZero: true,
								...unitBounds
							},
							{
								label: t("custom.history.minReclaim"),
								value: value.history.minReclaim,
								set: (minReclaim) => {
									setHistory({ minReclaim });
								},
								...unitBounds
							}
						],
						step: unitStep,
						fieldsEnabled: value.history.enabled || value.tailTrim.enabled
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("custom.prefixPolicy") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: value.prefixPolicy,
							disabled: disabled || !value.history.enabled,
							onChange: (event) => {
								setValue({
									...value,
									prefixPolicy: event.currentTarget.value
								});
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "preserve",
								children: t("custom.prefixPolicy.preserve")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "pressure-break",
								children: t("custom.prefixPolicy.pressureBreak")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.customNote,
						children: t("custom.experimental")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StageFields, {
						t,
						title: t("custom.tailTrim.enabled"),
						enabled: value.tailTrim.enabled,
						disabled,
						onEnabled: (enabled) => {
							setValue({
								...value,
								tailTrim: {
									...value.tailTrim,
									enabled
								}
							});
						},
						fields: [{
							label: t("custom.tailTrim.trigger"),
							value: value.tailTrim.trigger,
							set: (trigger) => {
								setValue({
									...value,
									tailTrim: {
										...value.tailTrim,
										trigger
									}
								});
							},
							...unitBounds
						}],
						step: unitStep
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.customNote,
						children: t("custom.tailTrim.warning")
					}),
					valid ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.error,
						role: "alert",
						children: t("custom.invalid")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.actions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: disabled || !valid,
							onClick: () => {
								settle(save);
							},
							children: t("custom.save")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled,
							onClick: () => {
								settle(reset);
							},
							children: t("custom.reset")
						})]
					})
				]
			});
		}
		function StageFields({ title, enabled, disabled, onEnabled, fields, step, fieldsEnabled = enabled, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
				className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.stage,
				disabled,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: title }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.field,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("custom.enabled") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							"aria-label": title,
							value: enabled ? "on" : "off",
							onChange: (event) => {
								onEnabled(event.currentTarget.value === "on");
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "on",
								children: t("custom.enabled.on")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "off",
								children: t("custom.enabled.off")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.fieldGrid,
						children: fields.map((field) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: _dsh_context_compression_css_466eb745356d_CompressionProfileSelector_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: field.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "number",
								value: field.value,
								min: field.allowZero === true ? 0 : field.integer === true ? 1 : step,
								max: field.max,
								step: field.integer === true ? 1 : step,
								disabled: !fieldsEnabled || disabled,
								onChange: (event) => {
									field.set(Number(event.currentTarget.value));
								}
							})]
						}, field.label))
					})
				]
			});
		}
		function editableCustom(value) {
			if (value.version === 3) return structuredClone(value);
			return {
				version: 3,
				unit: value.unit,
				fresh: structuredClone(value.fresh),
				aggregate: structuredClone(value.aggregate),
				history: {
					enabled: value.history.enabled,
					trigger: value.history.trigger,
					keepRecentToolCalls: 10,
					keepRecentTokens: value.history.keepRecent,
					minReclaim: value.history.minReclaim
				},
				prefixPolicy: value.prefixPolicy,
				tailTrim: value.version === 1 ? {
					enabled: false,
					trigger: 7e5
				} : structuredClone(value.tailTrim)
			};
		}
		//#endregion
		//#region src/client/decode.ts
		/** Browser-safe settings decoding shared by the client entry and node tests. */
		/**
		* Decode one stored context-compression settings document with exactly the
		* runtime schema's strictness: a plain object with only `profile`, `custom`,
		* and `autoCompact` keys, a supported profile, a valid Custom document
		* canonicalized to v3 exactly as the runtime resolver would, and a
		* strictly-shaped autoCompact section (absent inherits the 80% default).
		* Anything else decodes to `undefined` so the UI reports the document as
		* unreadable instead of silently disagreeing with the runtime.
		*/
		function decodeSettings(value) {
			if (!isPlainRecord(value)) return void 0;
			if (Object.keys(value).some((key) => key !== "profile" && key !== "custom" && key !== "autoCompact")) return void 0;
			const profile = value.profile;
			const custom = value.custom;
			const autoCompact = decodeAutoCompactSettings(value.autoCompact);
			return typeof profile === "string" && COMPRESSION_PROFILES.includes(profile) && isCustomCompressionPolicy(custom) && autoCompact !== void 0 ? {
				profile,
				custom: canonicalizeCustomPolicy(custom),
				autoCompact
			} : void 0;
		}
		//#endregion
		//#region src/client/locales.ts
		/** Simplified Chinese copy for the context-compression selector. */
		const zh = {
			"nav": "上下文压缩选择器",
			"settings.title": "上下文压缩选择器",
			"settings.description": "为当前会话选择压缩 Profile，并配置该 Profile 提供的参数。",
			"label": "上下文压缩",
			"status.loading": "加载中",
			"status.unavailable": "不可用",
			"status.presetUnavailable": "此会话的 preset 未提供上下文压缩，或能力尚未确认。",
			"status.minimalUnavailable": "极简模式不会为此会话加载上下文压缩能力，因此选择器在本会话中等效为关闭，仅保留 Harness 原生行为。切换到标准、PTC／Coding、创造模式，或支持该能力的自定义 preset 后即可配置。",
			"status.saveFailed": "保存失败，请重试",
			"pricing.disclosure": "DeepSeek 官方价格目录复核于 2026-09-23。Asia/Shanghai 周一至周五 09:00–12:00、14:00–18:00 为峰时，其余为谷时；跨边界请求按成本区间处理。",
			"profile.balanced": "平衡模式",
			"profile.cache-strict": "Cache Strict（前缀保护）",
			"profile.savings": "节省模式",
			"profile.adaptive": "Adaptive（保守成本）",
			"profile.custom": "Custom／实验模式",
			"profile.native": "原生对照",
			"profile.off": "插件关闭",
			"profile.current": "当前选择",
			"detail.balanced": "确定性压缩新工具结果；高水位时老化旧结果",
			"detail.cache-strict": "仅在确认容量压力时老化已发送历史；服务端缓存命中仍是 best-effort",
			"detail.savings": "使用更小目标并更早清理旧工具结果；不保证每个请求更便宜",
			"detail.adaptive": "Fresh／Aggregate 与平衡模式一致；仅当紧邻官方 usage 与当前官方价格证明历史压缩明确更省钱时老化历史，否则保留",
			"detail.custom": "为新会话选择已实现的压缩阶段和计量阈值",
			"detail.native": "只使用 DeepSeek Harness 原生头尾裁剪",
			"detail.off": "关闭确定性选择器；原生 auto-compact 仍由 Harness 配置决定",
			"autoCompact.title": "Auto Compact 触发水位",
			"autoCompact.description": "模型驱动 Auto Compact 在请求占用达到该水位时触发。调整后，标准 Profile 的 History 触发值、最小回收量与近期尾窗随水位联动；修改只影响新会话。",
			"autoCompact.inputLabel": "Auto Compact 阈值（%）",
			"autoCompact.sliderLabel": "Auto Compact 阈值滑杆",
			"autoCompact.quick": "快捷值",
			"autoCompact.riskLow": "低于推荐范围：更早触发会增加摘要调用与前缀重建。",
			"autoCompact.riskHigh": "高于推荐范围：上下文容量为请求与输出共享，过晚触发会减少单次大输出、推理与工具 schema 的余量。",
			"autoCompact.invalid": "Auto Compact 阈值必须是 50–90 之间的整数。",
			"autoCompact.save": "保存 Auto Compact 阈值",
			"autoCompact.summaryHint": "Auto Compact 阈值：{percent}%。可在设置中修改。",
			"custom.title": "Custom 策略",
			"custom.settingsHint": "具体参数请前往“设置 > 上下文压缩选择器”中编辑。",
			"custom.sessionScope": "保存后的修改会在当前压缩运行时随后首次观察某个 Session 时生效；已被该运行时观察的 Session 继续使用其冻结策略。",
			"custom.measurement": "首选 DeepSeek 精确 tokenizer；不可用时回退到带校准的 tokenizer estimate，绝不使用 chars/4。缓存归因仍未知。",
			"custom.unit": "规范单位",
			"custom.unit.tokens": "Tokens",
			"custom.unit.contextPercent": "上下文百分比",
			"custom.enabled": "是否启用",
			"custom.enabled.on": "开",
			"custom.enabled.off": "关",
			"custom.fresh.enabled": "启用 Fresh",
			"custom.fresh.trigger": "Fresh 触发值",
			"custom.fresh.target": "Fresh 目标值",
			"custom.aggregate.enabled": "启用 Aggregate",
			"custom.aggregate.trigger": "Aggregate 触发值",
			"custom.aggregate.target": "Aggregate 目标值",
			"custom.history.enabled": "启用 History",
			"custom.history.trigger": "History 触发值",
			"custom.history.keepRecentToolCalls": "保护近期工具调用数",
			"custom.history.keepRecentTokens": "保护近期工具结果尾窗",
			"custom.history.minReclaim": "最小回收量",
			"custom.prefixPolicy": "已发送前缀策略",
			"custom.prefixPolicy.preserve": "仅在容量压力时改写",
			"custom.prefixPolicy.pressureBreak": "允许常规历史老化",
			"custom.experimental": "Experimental：以下功能仅用于 Custom，不会加入标准 Profile。",
			"custom.tailTrim.enabled": "启用 TailTrim（实验）",
			"custom.tailTrim.trigger": "TailTrim 触发值",
			"custom.tailTrim.warning": "TailTrim 只在精确 tokenizer 可用时，把一个完整、已结束且非错误的纯工具组替换为可恢复引用；它与 History 共用近期工具调用数、工具结果尾窗和最小回收参数。它会改写已发送前缀，可能降低缓存命中。",
			"custom.save": "保存 Custom 策略",
			"custom.reset": "重置 Custom 策略",
			"custom.invalid": "Custom 策略参数无效。"
		};
		/** English copy matching every simplified Chinese selector key. */
		const en = {
			"nav": "Context compression selector",
			"settings.title": "Context compression selector",
			"settings.description": "Choose a compression profile for the current session and configure the parameters it provides.",
			"label": "Context compression",
			"status.loading": "Loading",
			"status.unavailable": "Unavailable",
			"status.presetUnavailable": "This session’s preset does not provide context compression, or availability is not yet confirmed.",
			"status.minimalUnavailable": "Minimal mode does not load context compression for this session. The selector is effectively off and Harness native behavior remains. Switch to Standard, PTC / Coding, Creative, or a capable custom preset to configure it.",
			"status.saveFailed": "Save failed. Try again.",
			"pricing.disclosure": "DeepSeek official prices checked 2026-09-23. Peak Mon–Fri 09:00–12:00 and 14:00–18:00 Asia/Shanghai; otherwise off-peak. Cross-boundary requests use a cost range.",
			"profile.balanced": "Balanced",
			"profile.cache-strict": "Cache Strict (prefix protection)",
			"profile.savings": "Savings",
			"profile.adaptive": "Adaptive (conservative cost)",
			"profile.custom": "Custom / Experimental",
			"profile.native": "Native baseline",
			"profile.off": "Plugin off",
			"profile.current": "Current profile",
			"detail.balanced": "Reduce fresh tool results deterministically; age old results at high watermarks",
			"detail.cache-strict": "Age sent history only under confirmed capacity pressure; provider cache hits remain best-effort",
			"detail.savings": "Use smaller targets and age old tool results earlier; does not guarantee a cheaper request",
			"detail.adaptive": "Use Balanced Fresh/Aggregate; age history only when adjacent official usage and current official prices prove a clear saving",
			"detail.custom": "Choose implemented stages and measured thresholds for new sessions",
			"detail.native": "Use only the Harness native head/tail pruner",
			"detail.off": "Disable the deterministic selector; native auto-compact remains separately configured",
			"autoCompact.title": "Auto Compact trigger level",
			"autoCompact.description": "Model-driven Auto Compact triggers once request usage crosses this level. Standard-profile History triggers, minimum reclaim, and the recent tail follow the level; changes affect new sessions only.",
			"autoCompact.inputLabel": "Auto Compact threshold (%)",
			"autoCompact.sliderLabel": "Auto Compact threshold slider",
			"autoCompact.quick": "Quick values",
			"autoCompact.riskLow": "Below the recommended band: triggering earlier increases summarization calls and prefix rebuilds.",
			"autoCompact.riskHigh": "Above the recommended band: context capacity is shared by requests and output, so triggering later reduces headroom for single large outputs, reasoning, and tool schemas.",
			"autoCompact.invalid": "The Auto Compact threshold must be an integer between 50 and 90.",
			"autoCompact.save": "Save Auto Compact threshold",
			"autoCompact.summaryHint": "Auto Compact threshold: {percent}%. Change it in Settings.",
			"custom.title": "Custom policy",
			"custom.settingsHint": "Edit detailed parameters in Settings > Context compression selector.",
			"custom.sessionScope": "Saved changes apply when the current compression runtime next observes a Session for the first time. A Session already observed by that runtime keeps its frozen policy.",
			"custom.measurement": "Exact DeepSeek tokenizer first; tokenizer estimate with calibration fallback. Never chars/4. Cache attribution remains unknown.",
			"custom.unit": "Canonical unit",
			"custom.unit.tokens": "Tokens",
			"custom.unit.contextPercent": "Context percent",
			"custom.enabled": "Enabled",
			"custom.enabled.on": "On",
			"custom.enabled.off": "Off",
			"custom.fresh.enabled": "Enable Fresh",
			"custom.fresh.trigger": "Fresh trigger",
			"custom.fresh.target": "Fresh target",
			"custom.aggregate.enabled": "Enable Aggregate",
			"custom.aggregate.trigger": "Aggregate trigger",
			"custom.aggregate.target": "Aggregate target",
			"custom.history.enabled": "Enable History",
			"custom.history.trigger": "History trigger",
			"custom.history.keepRecentToolCalls": "Protected recent tool calls",
			"custom.history.keepRecentTokens": "Protected recent tool-result tail",
			"custom.history.minReclaim": "Minimum reclaim",
			"custom.prefixPolicy": "Sent-prefix policy",
			"custom.prefixPolicy.preserve": "Preserve until capacity pressure",
			"custom.prefixPolicy.pressureBreak": "Allow routine history aging",
			"custom.experimental": "Experimental: these controls are Custom-only and never added to standard profiles.",
			"custom.tailTrim.enabled": "Enable TailTrim (experimental)",
			"custom.tailTrim.trigger": "TailTrim trigger",
			"custom.tailTrim.warning": "TailTrim requires the exact tokenizer and replaces at most one complete, finished, non-error tool-only group with a recoverable reference. It shares Protected recent tool calls, Protected recent tool-result tail, and Minimum reclaim with History. It rewrites a sent prefix and may reduce cache hits.",
			"custom.save": "Save Custom policy",
			"custom.reset": "Reset Custom policy",
			"custom.invalid": "Custom policy values are invalid."
		};
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		const NS = "context-compression";
		/**
		* Profile entry id carrying the compression settings.
		*
		* Harness 0.2.0 keys every settings form by **entry id** rather than by a
		* namespace a plugin registers at runtime (`SettingsForms` has no `register`),
		* so the deployment must compose the runtime under this id — see
		* `cordis.patch.yml` in this package. A composition that never serves the id
		* leaves the form `unavailable`, and every surface self-hides.
		*/
		const SETTINGS_ENTRY_ID = "context-compression";
		/**
		* Narrow one presumed Host Config section into the persisted settings document.
		*
		* The runtime's Config is deliberately flat (`autoCompactThresholdPercent`
		* rather than a nested `autoCompact` object), while the stored document shape
		* validated by {@link decodeSettings} is nested — so the three fields the UI
		* owns are projected out before decoding instead of handing the whole Config to
		* a decoder that would reject its extra keys.
		*/
		function decodeEntrySettings(section) {
			if (typeof section !== "object" || section === null) return void 0;
			const { profile, custom, autoCompactThresholdPercent } = section;
			return decodeSettings({
				profile,
				custom,
				...autoCompactThresholdPercent === void 0 ? {} : { autoCompact: { thresholdPercent: autoCompactThresholdPercent } }
			});
		}
		function sameCustomPolicy(left, right) {
			if (left.version !== 3 || right.version !== 3) return false;
			return left.version === right.version && left.unit === right.unit && left.prefixPolicy === right.prefixPolicy && left.fresh.enabled === right.fresh.enabled && left.fresh.trigger === right.fresh.trigger && left.fresh.target === right.fresh.target && left.aggregate.enabled === right.aggregate.enabled && left.aggregate.trigger === right.aggregate.trigger && left.aggregate.target === right.aggregate.target && left.history.enabled === right.history.enabled && left.history.trigger === right.history.trigger && left.history.keepRecentToolCalls === right.history.keepRecentToolCalls && left.history.keepRecentTokens === right.history.keepRecentTokens && left.history.minReclaim === right.history.minReclaim && left.tailTrim.enabled === right.tailTrim.enabled && left.tailTrim.trigger === right.tailTrim.trigger;
		}
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-context-compression: dictionaries");
			const form = ctx.configForms.get(SETTINGS_ENTRY_ID);
			const slots = ctx.slots;
			/**
			* Decoded view over the shared form. `ConfigForm` snapshots are already
			* stable between publishes, so the derived snapshot is cached against its
			* source identity — returning a fresh object per call would defeat the
			* selector hook's referential equality.
			*/
			let cachedSource;
			let cachedSnapshot;
			const compression = {
				getSnapshot() {
					const source = form.getSnapshot();
					if (cachedSource === source && cachedSnapshot !== void 0) return cachedSnapshot;
					const derived = {
						status: source.status,
						value: decodeEntrySettings(source.value),
						revision: source.revision,
						writable: source.writable
					};
					cachedSource = source;
					cachedSnapshot = derived;
					return derived;
				},
				subscribe: (listener) => form.subscribe(listener)
			};
			/**
			* Confirm one write against the answer the provider folded back in.
			* 0.2.0 field writes resolve to the Host's accept/reject boolean rather than
			* throwing, so refusal and "accepted but not what we asked for" both surface
			* as the same user-visible failure.
			*/
			const writeAndConfirm = async (write, accepts) => {
				if (!await write()) throw new Error("Context compression settings were not saved.");
				const after = decodeEntrySettings(form.getSnapshot().value);
				if (after === void 0 || !accepts(after)) throw new Error("Context compression settings were not saved.");
			};
			const injected = () => ({
				hooks: { compression },
				select: (profile) => writeAndConfirm(() => form.set("profile", profile), (settings) => settings.profile === profile),
				saveCustom: (custom) => writeAndConfirm(() => form.set("custom", custom), (settings) => isCustomCompressionPolicy(settings.custom) && sameCustomPolicy(settings.custom, custom)),
				resetCustom: () => writeAndConfirm(() => form.set("custom", structuredClone(DEFAULT_CUSTOM_COMPRESSION_POLICY)), (settings) => isCustomCompressionPolicy(settings.custom) && sameCustomPolicy(settings.custom, DEFAULT_CUSTOM_COMPRESSION_POLICY)),
				saveAutoCompact: (thresholdPercent) => writeAndConfirm(() => form.set("autoCompactThresholdPercent", thresholdPercent), (settings) => settings.autoCompact.thresholdPercent === thresholdPercent)
			});
			slots.inject("settings.section", () => slots.register({
				name: "settings.section",
				id: "context-compression",
				order: 17,
				label: () => ctx.locale.bind(NS)("nav"),
				locale: NS,
				inject: injected
			}, ContextCompressionSettingsSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
