# dsh-context-compression-selector

这是可直接安装的非官方社区 DeepSeek Harness 上下文压缩选择器 Product Bundle（本 fork 的构建）。

## 安装

```sh
dsh plugin add @xbzb404/dsh-context-compression-selector
dsh --dump-config   # 能看到 selector 这一层即为装好
```

安装后重启 Harness 生效。升级 / 卸载：

```sh
dsh plugin up @xbzb404/dsh-context-compression-selector
dsh plugin remove @xbzb404/dsh-context-compression-selector
```

> **别装错包。** npm 上不带 `@xbzb404/` 前缀的 `dsh-context-compression-selector`
> 属于上游项目，装它得到的是原版而不是本 fork 的修复版。

这一条命令会自动解析精确版本的 `@xbzb404/dsh-context-compression-selector-runtime`
依赖，不需要单独安装。

> **这不是 `npm install` 包。** `@deepseek-ai/cordis` 声明为 `>=4.1.0 <5`，而本 Bundle
> 同时依赖的 `@deepseek-ai/cordis-plugin-include@1.1.0` 只接受 `~4.1.0`，npm 的 peer
> 解析器因此报 `ERESOLVE` 失败。`dsh plugin add` 才是支持路径；若一定要装进普通 npm
> 项目，必须加 `--legacy-peer-deps`（或 `--force`），且不保证能跑。

## 这个 fork 带什么

相比上游 0.1.1 构建：

- 适配 DeepSeek Harness `0.2.x` 公开 API 面（`AgentPresetRegistry.register()` 派生 preset 变体、`SettingsForms.describe()`、`snapshotEvents()` / `inheritedEventCount` 等），面向 `0.2.2-rc.5` 实测。
- 支持 DeepSeek-V4.1-Flash：`deepseek-flash` 可解析出随包提供的精确 tokenizer 而不再安全降级为空转，默认模型上的精确门槛压缩不再失效；视觉图片 token 算术按官方 V4.1 image processor 重移植。
- 支持登录态账号路由（`deepseek-account`）：此前它被所有精确计量与价格门槛拒绝，压缩在账号路由下从不生效。
- 单个源 preset 无法组装时不再连带拖垮全部变体，失败会经 Host logger 报告而不是静默吞掉。

Bundle 提供 Host 设置、Web UI 和可逆 preset overlay。除 id 精确等于内置 `minimal` 的 preset 外，其他 preset 都会获得压缩能力；非 Minimal preset 之间切换时已保存设置保持不变。Minimal 只暂停插件压缩，不删除设置。

## 兼容性

已验证兼容 DeepSeek Harness `0.2.2-rc.5`，Node `^22.19.0 || >=24`。不需要修改 Harness 核心。

Profile、默认值、审计证据、Adaptive/cache 限制、升级/卸载与安全说明见[完整 README](https://github.com/xbzb404/dsh-context-compression-selector#readme)。本包与 DeepSeek 无隶属或背书关系。
