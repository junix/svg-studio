# svg-studio · 原生 SVG 特性演示 TODO

> 计划来源：`docs/svg-feature-demos.md`（人读版）与 `docs/svg-feature-demos.json`（机器可读）。
> 目标：16 个 expert 级原生 SVG 演示，覆盖 519 项核心 SVG 特性（当前计划覆盖率 100%）。
> 2026-09-08 审核：16 个演示均已有实现，三个空壳已补齐。原始 128 条验收：24 条已验、73 条部分、28 条待测、3 条冲突；因此本 TODO **尚未全部完成**。详见 `docs/svg-feature-audit.md` 与 `docs/svg-feature-acceptance-audit.json`。

## 1. 计划收尾

- [ ] 17:30 PDT 限额重置后恢复 workflow 复审（runId `wf_e25e1df2-d7a`，前序 80 个 agent 已缓存，仅跑约 33 个复审 agent）：
  - [ ] 16 个 `revise:*`（coherence + feasibility 双棱镜修订，不可行特性移入 dropped）
  - [ ] 4 个未完成的 `critique:*`
  - [ ] `completeness-critic`（清单查漏）
- [x] 恢复可复现的文档生成：`npm run plan` 从 JSON 生成 Markdown，`npm run plan:check` 防止漂移；替代未找到的 scratchpad `render_plan.py`。
- [x] 本地逐条审核 128 条 acceptance，保留通过、部分证据、待测及冲突状态；没有声称恢复历史 workflow。
- [x] 检查特性分配与排除附录：519 个核心键、538 次分配，16 个目录条目完整；运行时能力限制另记，未删特性以迎合测试。

> 历史 `wf_e25e1df2-d7a` 不在当前可访问的工具/工作区中，无法恢复这组 agent 运行；该项保留未完成。

## 2. 管线准备

- [x] `scripts/capture.mjs`：Chrome 路径写死为 macOS（`/Applications/Google Chrome.app/...`），在 Linux 改为 Playwright 自带 Chromium 或环境变量 `CHROME_PATH` 覆盖
- [x] 决定 SVG 演示的挂载方式：新建 `src/svg/<id>.ts` 各自导出 `render(stage: SVGSVGElement)`，`main.ts` 按 `?scene=` 分发到 canvas（Paper.js）或 SVG 分支
- [x] 保留并沿用现有契约：`window.__VIS_READY__`、pointer 计数钩子、1400×900 透明舞台、RGBA 像素校验阈值
- [x] 内嵌字体方案：网络被阻断，演示所需字体以 `@font-face` data URI 内嵌（先选型，避免 16 个演示各自为政）
- [x] SMIL 演示的静帧策略：截图时刻必须有意义的静止画面（`pauseAnimations()` / `setCurrentTime()` 或构图本身稳定）
- [x] 建立覆盖门禁：计划/目录关系与 DOM 元素、属性、样式检查通过；行为声明单独计数，另有交互探针。声明不等于行为证明，见收尾未完成项。

## 3. 逐演示实现（顺序：先重后轻，滤镜/SMIL/文本优先，尽早暴露管线风险）

- [x] `four-colour-press-check` 四色套印检版台 — 91 特性，半调/分色/滤镜链，全场最密
- [x] `pipeline-mimic-board` 管网模拟盘 — 83 特性，marker + context-fill/context-stroke
- [x] `museum-label-panel` 博物馆展签面板 — 81 特性，foreignObject + 无障碍 + @media
- [x] `ship-lofting-floor` 船体放样间 — 73 特性，路径语法全命令（龙骨三写法 + 幽灵线对照）
- [x] `core-sample-stratigraphy` 岩芯地层揭示台 — 71 特性，clip/mask/效果顺序
- [x] `escapement-chronometer` 擒纵天文钟 — 70 特性，SMIL syncbase 时间线
- [x] `letterpress-type-specimen` 铅字样本册 — 68 特性，文本度量 + OpenType
- [x] `neon-sign-workshop` 霓虹招牌工坊 — 63 特性，滤镜合成 + CSS masking
- [x] `celestial-astrolabe-cabinet` 铜盘星图柜 — 60 特性，symbol/use 实例化 + viewBox 片段
- [x] `forge-metallography-bench` 锻件金相台 — 57 特性，光照滤镜 + 卷积
- [x] `stele-rubbing-hall` 碑林拓片厅 — 56 特性，textPath + 竖排 + 双向文本
- [x] `guilloche-intaglio-plate` 玫瑰线雕版 — 55 特性，玫瑰线 + non-scaling-stroke
- [x] `seismic-drum-console` 地震记录鼓控制台 — 52 特性，viewBox 相机 + pointer-events
- [x] `jacquard-loom-draft` 提花纹版房 — 46 特性，pattern 平铺与接缝
- [x] `auroral-spectrograph` 极光分光台 — 40 特性，渐变 paint server + SMIL stops
- [x] `mycelium-culture-chamber` 菌种培养舱 — 42 特性，feTurbulence + 置换 + L-system

每个演示的完成定义（全部勾上才算完）：

- [ ] `src/svg/<id>.ts` 实现，构造要点逐条对照 `docs/svg-feature-demos.md` §3
- [x] 16 个演示均通过真实浏览器捕获、预期错误白名单和 RGBA 检查。
- [ ] 截图目视检查：透明边距、文字未触线、滤镜/marker 未被裁剪
- [x] 验收要点逐条核对并存档：`docs/svg-feature-acceptance-audit.json` 共 128 条。
- [ ] 所有 acceptance 条件完整通过（当前仅 24 条完整，不能用部分证据勾选）。
- [x] `catalog.json` 的 16 个条目及元数据与计划一致，缺项会使测试失败。
- [x] 31 张最终 PNG 随任务提交，包含原先未跟踪的 7 张原生演示截图。

## 4. 收尾

- [x] 16 个演示全部入 catalog 后：`npm test`（typecheck + 全量 render + 校验）绿，31 个场景通过。
- [x] 覆盖门禁回归测试落地：7 个计划反例/正例检查与 4 个真实 DOM 变异检查通过。
- [ ] 519 核心键均取得独立行为证据；现有 api/concept/css 声明只作为索引，不能视为这一项已完成。
- [x] README 补充 SVG 演示表格、图、可复现命令与验证边界。
- [x] `just build` / `just test` 通过；`just install` 无需安装；`pm doctor --deep -p svg-studio` 为 10 passed / 0 failed。
- [x] 提交本次修复、计划文档、验收记录、PNG 与 TODO 状态；未完成项保持未勾选。
