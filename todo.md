# svg-studio · 原生 SVG 特性演示 TODO

> 计划来源：`docs/svg-feature-demos.md`（人读版）与 `docs/svg-feature-demos.json`（机器可读）。
> 目标：16 个 expert 级原生 SVG 演示，覆盖 519 项核心 SVG 特性（当前计划覆盖率 100%）。
> 现状：计划已定稿；复审被 session limit 中断（17:30 PDT 重置）；实现尚未开始。

## 1. 计划收尾（先做）

- [ ] 17:30 PDT 限额重置后恢复 workflow 复审（runId `wf_e25e1df2-d7a`，前序 80 个 agent 已缓存，仅跑约 33 个复审 agent）：
  - [ ] 16 个 `revise:*`（coherence + feasibility 双棱镜修订，不可行特性移入 dropped）
  - [ ] 4 个未完成的 `critique:*`
  - [ ] `completeness-critic`（清单查漏）
- [ ] 复审完成后重新渲染 `docs/svg-feature-demos.md` + `.json`（scratchpad 的 `render_plan.py`）
- [ ] 若复审产生 dropped/uncovered 特性：确认重分配或记入排除附录，覆盖率回到 100% 或明确记录缺口

## 2. 管线准备（实现前必须）

- [ ] `scripts/capture.mjs`：Chrome 路径写死为 macOS（`/Applications/Google Chrome.app/...`），在 Linux 改为 Playwright 自带 Chromium 或环境变量 `CHROME_PATH` 覆盖
- [ ] 决定 SVG 演示的挂载方式：新建 `src/svg/<id>.ts` 各自导出 `render(stage: SVGSVGElement)`，`main.ts` 按 `?scene=` 分发到 canvas（Paper.js）或 SVG 分支
- [ ] 保留并沿用现有契约：`window.__VIS_READY__`、pointer 计数钩子、1400×900 透明舞台、RGBA 像素校验阈值
- [ ] 内嵌字体方案：网络被阻断，演示所需字体以 `@font-face` data URI 内嵌（先选型，避免 16 个演示各自为政）
- [ ] SMIL 演示的静帧策略：截图时刻必须有意义的静止画面（`pauseAnimations()` / `setCurrentTime()` 或构图本身稳定）
- [ ] 建立覆盖率门禁：按 `docs/svg-feature-demos.json` 的 `features[].demos` 断言每个核心特性键真的出现在对应演示 DOM 中（`querySelector` / 属性检查）

## 3. 逐演示实现（顺序：先重后轻，滤镜/SMIL/文本优先，尽早暴露管线风险）

- [ ] `four-colour-press-check` 四色套印检版台 — 91 特性，半调/分色/滤镜链，全场最密
- [ ] `pipeline-mimic-board` 管网模拟盘 — 83 特性，marker + context-fill/context-stroke
- [ ] `museum-label-panel` 博物馆展签面板 — 81 特性，foreignObject + 无障碍 + @media
- [ ] `ship-lofting-floor` 船体放样间 — 73 特性，路径语法全命令（龙骨三写法 + 幽灵线对照）
- [ ] `core-sample-stratigraphy` 岩芯地层揭示台 — 71 特性，clip/mask/效果顺序
- [ ] `escapement-chronometer` 擒纵天文钟 — 70 特性，SMIL syncbase 时间线
- [ ] `letterpress-type-specimen` 铅字样本册 — 68 特性，文本度量 + OpenType
- [ ] `neon-sign-workshop` 霓虹招牌工坊 — 63 特性，滤镜合成 + CSS masking
- [ ] `celestial-astrolabe-cabinet` 铜盘星图柜 — 60 特性，symbol/use 实例化 + viewBox 片段
- [ ] `forge-metallography-bench` 锻件金相台 — 57 特性，光照滤镜 + 卷积
- [ ] `stele-rubbing-hall` 碑林拓片厅 — 56 特性，textPath + 竖排 + 双向文本
- [ ] `guilloche-intaglio-plate` 玫瑰线雕版 — 55 特性，玫瑰线 + non-scaling-stroke
- [ ] `seismic-drum-console` 地震记录鼓控制台 — 52 特性，viewBox 相机 + pointer-events
- [ ] `jacquard-loom-draft` 提花纹版房 — 46 特性，pattern 平铺与接缝
- [ ] `auroral-spectrograph` 极光分光台 — 40 特性，渐变 paint server + SMIL stops
- [ ] `mycelium-culture-chamber` 菌种培养舱 — 42 特性，feTurbulence + 置换 + L-system

每个演示的完成定义（全部勾上才算完）：

- [ ] `src/svg/<id>.ts` 实现，构造要点逐条对照 `docs/svg-feature-demos.md` §3
- [ ] `SCENES=<id> npm run render` 通过（无浏览器报错、RGBA 校验通过）
- [ ] 截图目视检查：透明边距、文字未触线、滤镜/marker 未被裁剪
- [ ] 验收要点（acceptance 列表）逐条核对
- [ ] `catalog.json` 新增条目（字段从 `docs/svg-feature-demos.json` 取）
- [ ] `git add -f out/<id>-transparent.png`

## 4. 收尾

- [ ] 16 个演示全部入 catalog 后：`npm test`（typecheck + 全量 render + 校验）绿
- [ ] 覆盖率门禁测试落地并通过（519 核心特性 × DOM 断言）
- [ ] README 增补 SVG 演示章节（表格 + 图）
- [ ] `just build` / `just test` 通过；`pm doctor --deep -p svg-studio` 无本任务相关问题
- [ ] 提交：计划文档 + todo 勾选状态同步
