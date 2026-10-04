# 签入账号路由（`deepseek-account`）支持规格

> **状态**：生效（本次修复的唯一权威表述）
> 取代范围：`docs/specs/2026-09-23-deepseek-v4.1-flash-support-spec.md` 中与 provider/base-url 允许集合相关的 R2.16、R4.7 与价格表 `provider`/`baseUrlClass` 行；该规格的其余规则不变。
> 适用文件：`packages/runtime/src/{deepseek-route.ts,measurement.ts,index.ts,deepseek-official-pricing.ts}` 及其测试。

## 0. 起因（实测事实）

1. 桌面版会话的实测路由是 `provider: "deepseek-account"`、`model: "deepseek-flash"`（会话日志 `request/context` 与 `request/header` 双证）。
2. `@deepseek-ai/dsh-llm-deepseek-account` 通过 `@deepseek-ai/dsh-llm-deepseek` 的共享 `registerDeepSeekProvider` 注册该 provider：**同一模型目录**（`connection.models`）、**同一公开 API 面**（`chat-completions`）、仅鉴权方式不同（`x-dsh-auth-token` 账号令牌代替 API key）。
3. 修复前，三处门把该 provider 判为"非受支持 DeepSeek 路由"：
   - `measurement.ts` 的 `bindCounter` → `countText`/`countImage` 双双 `unavailable`；
   - `measurement.ts` 的 `intrinsicImageDiagnostic` provider 门；
   - `index.ts` 的 `tokenizerAuditFact` → 审计报告 tokenizer 为 `unavailable`。
   精确计数不可用时，所有有损改写按设计 fail open，因此**该路由上 Fresh / Aggregate / History 一个 token 都不改**，插件形同未挂载。
4. 价格侧同门（`resolveOfficialDeepSeekPrice` 仅接受 `deepseek-official` + `official-public`），使 Adaptive 的历史授权在此类路由上永远拿不到价格。附带不一致：Measurement 侧早已接受 `deepseek`，价格侧却不接受，同一路由在两个门里答案不同。

## 1. 规则

- **R1 单一事实来源**：新增 `packages/runtime/src/deepseek-route.ts`，导出
  `DEEPSEEK_BILLED_PROVIDER_IDS = ['deepseek', 'deepseek-official', 'deepseek-account']`、
  `DEEPSEEK_OFFICIAL_BASE_URL_CLASSES = ['official-public', 'account-official']` 及两个判断函数
  `isDeepSeekBilledProvider` / `isDeepSeekOfficialBaseUrlClass`。所有 provider/base-url 门必须调用它们，不得再写内联枚举。
- **R2 精确计数门**（取代 R4.7 的枚举）：`bindCounter` 对 `isDeepSeekBilledProvider(provider) === false` 仍返回 `unavailable`，reason 字符串保持
  `canonical text: provider "<p>" is not the supported DeepSeek route` /
  `canonical image: provider "<p>" is not the supported DeepSeek route`（既有断言依赖该文本）。
- **R3 图像诊断门**（取代 R2.16 的枚举）：`intrinsicImageDiagnostic` 的 provider 判据改为 `isDeepSeekBilledProvider(target.provider)`，模型判据仍为 `VISION_MODEL_IDS.has(target.model)`。
- **R4 审计门**：`tokenizerAuditFact` 的 `eligible` 改为 `isDeepSeekBilledProvider(route.provider)`，即"能精确计数的路由才报告 tokenizer 身份"。
- **R5 价格门**：`resolveOfficialDeepSeekPrice` 的 provider 门改为 `isDeepSeekBilledProvider`，base-url 门改为 `isDeepSeekOfficialBaseUrlClass`；`OfficialDeepSeekPriceRecord.provider` / `baseUrlClass` 的类型由字面量放宽为允许集合的联合类型，并**如实写入输入值**（不再把账号路由伪记成 `deepseek-official`）。由此 `provider: 'deepseek'` 也按同一份官方价表计价，取代旧价格表 P-11 的"`deepseek` 必须 unpriced"行：Measurement 侧早已接受它，价格侧的不一致本身就是缺陷。
- **R6 仍然 fail closed**：不在允许集合内的 provider（如 `gateway`）与不在官方类别内的 base-url（如 `compatible-hmac:v1:test`）一律返回 `unpriced`，reason 文本不变（`unknown provider route` / `unknown base-url applicability`）。

## 2. 验收与证据

| 项 | 内容 |
| --- | --- |
| 新增测试 1 | `deepseek-official-pricing.spec.ts`：`deepseek-account` × `official-public` / `account-official` 均 `priced`，且记录如实回填 provider/baseUrlClass（CNY 命中 0.02 / 未命中 1 / 输出 4） |
| 新增测试 2 | 同上：`deepseek-account` + `compatible-hmac:v1:test` 仍 `unpriced`（reason 含 `base-url`） |
| 新增测试 3 | `public/public-runtime.spec.ts`：`deepseek-account` 路由下 `measureForCompaction().currentSurface.kind === 'exact-tokenizer'`，且 `pruneSession({ stage: 'fresh' })` 真的落地 1 条改写与对应审计 |
| 门禁 | `pnpm run typecheck`（runtime typecheck + bundle + selector typecheck + tests typecheck）全 0；`pnpm test` 519 passed / 1 skipped；`pnpm run test:built` 1 passed；`pnpm run verify:release` = OK |

## 3. 未覆盖（上游限制，与本修复无关）

- Harness `0.2.0-rc.2` 的 `ctx.tokenMeter.measure()` 只返回 `{ logRevision, baseline, surfaceDeltaTokens, totalTokens, surfaceTokens, nodes }`，不提供插件 `ProviderMeasurementKey` / `ObservedPromptUsage` 所需字段（`baseUrlClass`、`apiRoute`、逐 attempt 缓存拆分等），且插件内无任何生产者。因此 Adaptive 的成本门当前恒返回 `usage-unavailable`，价格门只在"未来上游补齐该 seam"后才可达；本规格为那条路径预先统一了允许集合，但不声称 Adaptive 现在会工作。
