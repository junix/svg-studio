# SVG 演示验收记录

2026-09-08。本次补齐了实现和工程验证；原 TODO 尚未全部满足。原始 128 条 acceptance 已逐条审核：**24 条已验、73 条部分、28 条待测、3 条条件冲突**。完整原文与逐项证据在 [acceptance 审核表](svg-feature-acceptance-audit.json)，未把部分验证计为通过。

## 已完成的工程工作

- 补齐铜盘星图柜、岩芯地层揭示台、菌种培养舱三个空壳入口；16 个场景均有真实 SVG 结构和可用截图。
- 修复嵌入脚本语法、旧 SVGMatrix 接口、地震台坐标精度误判、金相台重复 ID、碑林列数与 rx:auto 的浏览器兼容问题。
- 完成离线字体子集生成：8 个字面、1100 个中文码位；字体与位图均内嵌，独立 SVG 试片从本地同源加载。
- 截图使用构建后的 Vite preview，并阻断外网；移除强制 SwiftShader，保留全部滤镜与几何。每个场景输出 1400×900 RGBA PNG。
- 用 browser-harness 关闭缓存、以 1400×900 视口重新打开全部 16 个演示并检查截图；修复天文钟原点超出安全边距、岩芯标题和地震台读数越界。密集说明的全面无交叠审查仍未完成。
- `npm run plan` / `npm run plan:check` 取代丢失的 scratchpad 生成器，避免 Markdown 与 JSON 漂移。

## 实际验证范围

- `just test` 通过（包含 build、typecheck、计划同步、7 个计划门禁测试、全量 render）。
- 31 个场景均通过：15 个既有画布/库场景和 16 个原生特性演示；108 个命名 DOM/行为检查、35 个像素检查。
- 覆盖反向测试：保留声明但改属性值、删属性、删样式、删元素，四类变异均被门禁拒绝。
- `just install` 通过（浏览器项目，无二进制安装）；`pm doctor --deep -p svg-studio`：10 passed / 0 failed。
- 当前引擎为 Chrome 152.0.7977.82 / macOS arm64。未将本次结果推断为 Firefox、Safari 或 Linux 的实测结果。
- [完整机器报告](svg-feature-verification.json) 保存每个断言证据、PNG 哈希和输入文件哈希。最新重跑报告写入 `out/verification.json`。

## 覆盖门禁的边界

519 是唯一核心键数，538 是演示分配次数。286 个唯一键（292 次分配）检查真实元素、属性或样式；另外 233 个唯一 api/concept/css 键（246 次分配）检查显式声明。声明只用于索引，不能单独证明 API 行为、浏览器支持或像素结果。108 个命名探针补充行为证据，但没有覆盖全部 233 个声明键。

| 演示 | 核心分配 | DOM/样式 | 声明 | 行为检查 | PNG |
|---|---:|---:|---:|---:|---|
| 铜盘星图柜 | 42 | 21 | 21 | 9 | [截图](../out/celestial-astrolabe-cabinet-transparent.png) |
| 博物馆展签面板 | 43 | 11 | 32 | 9 | [截图](../out/museum-label-panel-transparent.png) |
| 船体放样间 | 40 | 19 | 21 | 5 | [截图](../out/ship-lofting-floor-transparent.png) |
| 玫瑰线雕版 | 31 | 21 | 10 | 6 | [截图](../out/guilloche-intaglio-plate-transparent.png) |
| 极光分光台 | 28 | 18 | 10 | 5 | [截图](../out/auroral-spectrograph-transparent.png) |
| 提花纹版房 | 26 | 17 | 9 | 6 | [截图](../out/jacquard-loom-draft-transparent.png) |
| 碑林拓片厅 | 29 | 21 | 8 | 7 | [截图](../out/stele-rubbing-hall-transparent.png) |
| 铅字样本册 | 37 | 20 | 17 | 6 | [截图](../out/letterpress-type-specimen-transparent.png) |
| 管网模拟盘 | 40 | 26 | 14 | 6 | [截图](../out/pipeline-mimic-board-transparent.png) |
| 四色套印检版台 | 29 | 20 | 9 | 6 | [截图](../out/four-colour-press-check-transparent.png) |
| 锻件金相台 | 28 | 18 | 10 | 8 | [截图](../out/forge-metallography-bench-transparent.png) |
| 菌种培养舱 | 26 | 12 | 14 | 9 | [截图](../out/mycelium-culture-chamber-transparent.png) |
| 霓虹招牌工坊 | 37 | 13 | 24 | 6 | [截图](../out/neon-sign-workshop-transparent.png) |
| 擒纵天文钟 | 33 | 27 | 6 | 6 | [截图](../out/escapement-chronometer-transparent.png) |
| 岩芯地层揭示台 | 34 | 21 | 13 | 7 | [截图](../out/core-sample-stratigraphy-transparent.png) |
| 地震记录鼓控制台 | 35 | 7 | 28 | 7 | [截图](../out/seismic-drum-console-transparent.png) |

## 原计划的明确冲突与修正依据

1. 玫瑰线 #4：同一锚点下 `translate(210 0) rotate(24)` 与交换顺序之间的位移差为 `2×210×sin(12°)≈87.3`，不能同时满足原文的 ≥120。原指标保留为待修订，没有通过改变测量定义来宣布成功。
2. 菌种 #3：构造要求 bleed 频率为 master×2.2，验收却要求两者相等。实测 master≈.01824、bleed≈.040128、grain≈.768；现有自动检查遵循构造定义，但原文冲突尚未闭环。
3. 天文钟 #4：当前 Chrome 忽略 discard，场景依据实际行为标明 set 兜底。原文要求 Chrome 从 DOM 删除运输夹，不能作为本机通过项。
4. 岩芯 #4 的测量方法已澄清：最终图有不透明底板，遮罩自身 alpha 必须在临时隔离底板的截图里取样。实测 luminance=54/255、alpha=1，原导出图保持不变。
5. 铜盘 symbol refX 与实例根可见性采用实际浏览器探测；旧 SVGMatrix 与 DOMMatrix 在当前 Chrome 并非同一运行时类型。字体样本名 Praktika VF 对应静态 Latin Modern，页面明确标出不支持的可变轴。

## 尚未完成

- 历史 workflow `wf_e25e1df2-d7a` 及其缓存 agent 不在本次可访问环境中，未恢复、未冒称原 workflow 复审完成。
- 16 个场景的全部构造说明与原始验收尚未取得完整证据。特别是色相差、Delta E、滤镜 alpha 剖面、亚像素笔宽、动画帧差、跨引擎媒体查询等数值条件，不能由整图 RGBA 门禁代替。
- 全部核心 API/concept/css 键仍需独立行为证据；密集版面的文字与线条全面无交叠检查尚未完成。
- 具体后续检查按 [逐项审核表](svg-feature-acceptance-audit.json) 的 partial / unverified / conflict 条目推进；[TODO](../todo.md) 保留这些未完成状态。
