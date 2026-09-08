# svg-studio · 原生 SVG 特性演示计划

> 生成日期 2026-09-08。16 个演示，519 个核心特性键，538 次演示分配；完整清单 1365 项，其中 140 项未实现或已废弃。
> 本文件由 `npm run plan` 从 `docs/svg-feature-demos.json` 生成。计划分配覆盖不等于跨浏览器支持；DOM 声明不等于行为和像素验收。当前验证范围见 [验收记录](svg-feature-audit.md)。

## 0. 背景与契约

- `src/svg/<id>.ts` 导出 `render(stage)`，由 `src/main.ts` 挂载到 1400×900 透明 SVG。
- 内嵌字体与图像；独立 SVG 试片从本地同源加载；捕获阶段阻断外网。
- `window.__VIS_READY__` 为就绪契约；pointer 计数用于交互检查；SMIL/CSS 动画在导出模式冻结。
- `CHROME_PATH` 可覆盖浏览器路径；macOS 自动选已安装的 Chrome，其余使用 Playwright Chromium。
- `npm test` 检查计划完整性、类型、构建产物、DOM 特性、场景行为和 RGBA。`SCENES=<id> npm run render` 验证单个场景。

## 1. 演示总览

| # | id | 标题 | 家族 | 核心特性 | 特性总数 | 复杂度 |
|---|---|---|---|---|---|---|
| 1 | `celestial-astrolabe-cabinet` | 铜盘星图柜 | astronomical instrument | 42 | 60 | expert |
| 2 | `museum-label-panel` | 博物馆展签面板 | museum curation / archives | 43 | 81 | expert |
| 3 | `ship-lofting-floor` | 船体放样间 | naval architecture | 40 | 73 | expert |
| 4 | `guilloche-intaglio-plate` | 玫瑰线雕版 | security printing | 31 | 55 | expert |
| 5 | `auroral-spectrograph` | 极光分光台 | atmospheric optics / spectroscopy | 28 | 40 | expert |
| 6 | `jacquard-loom-draft` | 提花纹版房 | weaving / textile drafting | 26 | 46 | expert |
| 7 | `stele-rubbing-hall` | 碑林拓片厅 | epigraphic typography | 29 | 56 | expert |
| 8 | `letterpress-type-specimen` | 铅字样本册 | typography | 37 | 68 | expert |
| 9 | `pipeline-mimic-board` | 管网模拟盘 | plant instrumentation | 40 | 83 | expert |
| 10 | `four-colour-press-check` | 四色套印检版台 | printing | 29 | 91 | expert |
| 11 | `forge-metallography-bench` | 锻件金相台 | scientific instrument | 28 | 57 | expert |
| 12 | `mycelium-culture-chamber` | 菌种培养舱 | procedural texture | 26 | 42 | expert |
| 13 | `neon-sign-workshop` | 霓虹招牌工坊 | filter compositing | 37 | 63 | expert |
| 14 | `escapement-chronometer` | 擒纵天文钟 | watchmaking / horology | 33 | 70 | expert |
| 15 | `core-sample-stratigraphy` | 岩芯地层揭示台 | geology / core logging | 34 | 71 | expert |
| 16 | `seismic-drum-console` | 地震记录鼓控制台 | instrument console | 35 | 52 | expert |

## 2. 覆盖矩阵（领域 × 演示）

| 领域 | D1 | D2 | D3 | D4 | D5 | D6 | D7 | D8 | D9 | D10 | D11 | D12 | D13 | D14 | D15 | D16 | 核心分配 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 文档结构与复用 | 33 | 6 | · | · | · | · | 3 | 3 | · | · | · | 3 | · | · | · | 2 | 50/50 |
| 嵌入、外来内容与语义 | 2 | 22 | · | · | · | 6 | · | 2 | · | · | · | 1 | 2 | 1 | · | · | 34/34 |
| 基本图形与路径语法 | · | · | 27 | 3 | · | 2 | · | 1 | 4 | 1 | · | · | · | · | · | · | 38/38 |
| 填充、描边与合成属性 | · | · | 4 | 13 | 2 | · | · | 1 | 4 | 1 | · | · | 2 | 2 | · | 3 | 32/32 |
| 渐变与图案 | · | · | · | · | 22 | 13 | · | · | 1 | 3 | · | 1 | · | · | · | · | 38/38 |
| 文本与排版 | · | 1 | · | · | 1 | · | 22 | 18 | · | · | · | · | 1 | · | · | · | 40/40 |
| 裁剪与遮罩 | · | · | · | · | · | · | 2 | · | · | · | · | 2 | 13 | · | 25 | · | 40/40 |
| 标记 (marker) | · | · | · | · | · | · | · | · | 28 | · | · | · | · | · | · | · | 28/28 |
| 滤镜：区域、连线、合成与颜色原语 | · | · | · | · | · | 3 | · | 5 | · | 19 | 1 | 2 | 13 | · | 2 | · | 42/42 |
| 滤镜：卷积、形态学、噪声、置换与光照 | · | · | · | · | · | 1 | · | · | · | 2 | 23 | 14 | 5 | · | · | · | 45/45 |
| SMIL 动画 | 3 | · | 1 | · | 3 | · | 1 | · | · | · | 1 | 3 | 1 | 29 | 2 | · | 44/44 |
| CSS 动画、CSS 变换与脚本 API | · | 3 | 3 | 6 | · | · | · | 6 | · | 1 | · | · | · | · | · | 17 | 31/31 |
| 变换与坐标系 | 2 | · | 5 | 9 | · | 1 | · | 1 | 2 | 2 | · | · | · | 1 | · | 9 | 30/30 |
| 交互与无障碍 | 2 | 11 | · | · | · | · | 1 | · | 1 | · | 3 | · | · | · | 5 | 4 | 27/27 |

## 3. 演示详情

### 3.1 `celestial-astrolabe-cabinet` — 铜盘星图柜

- **用途 / 家族**：star atlas cabinet / astronomical instrument
- **复杂度**：expert　**标签**：`astronomy`, `symbol-sprite`, `use-instancing`, `viewbox-fragments`, `shadow-tree`, `brass-instrument`
- **设计问题**：一套 symbol 母版加一墙具名视口，能不能在从不重绘任何一颗星的前提下，装下整份星表？

**场景**　展厅暮色里立着一座黄铜星图柜。柜体正面是一枚直径 640 的铜盘：圆窗里镂空的星网压在铜绿色的地平坐标网上，照准仪斜横过盘面，盘缘下方铆着的铭牌实时刻出指针所指的那颗星。柜门朝外微开两度多，门内侧排着六列四行共二十四格星区图签，每格下面錾着该区的赤经赤纬范围；门腰的凹槽里插着一张取景卡——点任一图签，具名 <view> 与 #svgView(viewBox(...)) 片段就把卡换成对应天区的放大取景，而主盘只是改写了一次 viewBox，整柜没有一个元素被新建或删除。全天一千六百余颗星只有九枚 symbol 母版：星等写进 use 的 width，光谱型写进 currentColor，天区色相写进 --tint，同一枚母版因此在二十四格里染成二十四种颜色；柜侧那道验色条上印着的 use .star-core{fill:red} 却怎么也够不到实例内部，而写在母版子节点上的一条规则能同时改掉全柜每一个实例。指针掠过星网时，铭牌第一行永远报告 use#s-1042，而不是里面那颗 path.star-core。

**主打特性**

- `el:symbol` — symbol reusable template
- `concept:sprite-sheet` — Symbol sprite sheet
- `concept:use-of-use` — Nested use-of-use instancing
- `el:view` — view predefined viewport
- `concept:svgview-viewbox` — svgView(viewBox(...)) fragment sprite crop
- `concept:use-css-custom-properties-passthrough` — CSS custom properties passed into use instance
- `concept:use-shadow-event-retargeting` — Event retargeting: events inside <use> instances report the <use> as target

**辅助特性**

`el:svg`、`concept:nested-svg`、`at:svg.viewBox`、`at:svg.preserveAspectRatio`、`av:svg.preserveAspectRatio=none`、`av:svg.preserveAspectRatio=xMidYMid-slice`、`concept:nested-viewport-clipping`、`pv:overflow=visible`、`at:svg.transform`、`el:g`、`concept:painting-order-document`、`el:defs`、`at:symbol.viewBox`、`at:symbol.refX`、`el:use`、`at:use.href`、`at:use.x`、`at:use.width`、`concept:use-external-fragment`、`concept:use-shadow-tree-styling`、`concept:use-inherited-fill-override`、`concept:use-currentcolor-passthrough`、`concept:use-inheritance`、`concept:fragment-identifier-viewid`、`concept:svgview-fragment-identifier`、`el:a`、`at:a.href`、`at:g.id`、`concept:animate-viewbox`、`concept:animate-use-href`、`concept:animate-in-use-shadow-tree`、`pv:transform=rotate-cx-cy`、`concept:y-down-clockwise-angles`、`css:target`、`concept:symbol-not-rendered-directly`、`concept:use-symbol-default-100pct-size`、`at:use.xlink:href`、`concept:use-shadow-tree`、`concept:use-shadow-tree-selector-isolation`、`api:SVGUseElement.instanceRoot`、`api:SVGElement.viewportElement`、`api:SVGSVGElement.getElementById`、`concept:g-property-inheritance`、`concept:defs-anywhere`、`at:svg.x`、`at:view.viewBox`、`concept:fragment-link-to-view`、`at:a.target`、`av:a.target=_blank`、`css:hover-inside-use`、`concept:viewbox-pan`、`concept:list-syntax-whitespace-tolerance`、`concept:standalone-svg-document`

**构造要点**

1. 舞台与配色：外层 <svg id="stage" width="1400" height="900" viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid meet">，背景全透明，只有黄铜件用 alpha 0.55–0.92 的填充（铜 #c8a45c / 高光 #f0d9a0 / 暗刻 #7a5c2a），盘底衬一块 alpha .55 的深蓝板 #101a2c 供星点显影；四周 32 的留白与柜体缝隙保持全透明。
2. 星表坐标系（catalogue space）固定为 0 0 2400 1200：x = RA(h) × 100，y = (90 − Dec) × 6.6667。全场每一个视口——主盘窗、24 个图签窗、24 张取景卡、校样条八格——都只是这同一坐标系上的不同 viewBox 矩形，没有任何一处重画星点。
3. 九枚母版：<defs> 里 gl-ob / gl-a / gl-f / gl-g / gl-k / gl-m / gl-double / gl-var / gl-neb，全部 <symbol viewBox="0 0 20 20" refX="10" refY="10">，refX/refY 让 use 的 x/y 直接落在星的坐标而不是左上角。每枚母版内部：衍射芒 fill="currentColor"（光谱型），晕环 fill="var(--tint, #7fd9ff)"（天区色），外圈 opacity="var(--mag-alpha, .8)"；gl-m 的芯 fill="#ff7a59" 錾死不随继承；gl-var 内含 SMIL。
4. 星表生成：mulberry32(seed 1054) 为 24 个天区各生成 62–76 颗星，共约 1680 颗。星等 m 按幂律采样 [0.8, 6.2]，use width=height=clamp(26 − 3.4m, 5, 26)——星等直接编码进 at:use.width；光谱型按 O/B 3%、A 9%、F 14%、G 21%、K 28%、M 25% 抽样并写进各自 use 的 color；另抽 4% double、3% var、1.5% neb 覆盖其余母版。12 颗真实亮星（Sirius、Rigel、Betelgeuse、Aldebaran、Vega、Deneb、Altair、Polaris、Arcturus、Spica、Antares、Canopus）按真赤经赤纬硬编码并只在主盘上刻名。
5. 天区分组与 use-of-use：每区一个 <g id="zone-07-plate">，内含星官连线 polyline 与该区全部 <use>；再有 <g id="star-field"> 由 24 个 <use href="#zone-NN-plate"/> 组成，整组仍在 defs 内（自身不显影）。主盘窗里只写一行 <use href="#star-field"/>——一个 use 指向一个本身由 use 组成的 g。每颗星在全文档最多被实例化两次：图签一次、主盘一次。
6. 主盘：圆心 (430,400)、R=320 的铜盘。窗口是 <svg id="dial-window" x="200" y="170" width="460" height="460" viewBox="<当前天区矩形>" preserveAspectRatio="xMidYMid slice">；窗内先 <use href="#alt-az-grid"/>（北纬 39.9° 的地平网：等高圈 a=0/15/…/75 与方位线 A=0/30/…/330，按标准公式换算到赤道坐标后采样成铜绿 polyline），再 <use href="#star-field"/>——星网压在地平网上，层序就是文档序。盘环是一枚 r=228→320 的圆环 <path>，画在窗之后遮掉方形视口的四角，圆窗因此不需要 clipPath；越出窗口的星点由嵌套视口默认裁掉。
7. 柜门：<svg id="door" x="852" y="76" width="500" height="622" viewBox="0 0 500 622" transform="rotate(-2.2 1102 387)">——transform 加在嵌套 svg 上，门微开。门内 y=56..468 排 6 列 × 4 行共 24 个 <g id="zone-NN">（列距 79、行距 103）：每格 <a href="#zone-NN"> 包住铜牌 + <svg class="tag-window" width="68" height="51" viewBox="<该区矩形>"> + <use href="#zone-NN-plate">；色相由 g 上的 style="--tint:hsl(k*15 70% 68%); color:…" 沿继承进影子树，同一枚母版在 24 格里染成 24 色。牌下两行等宽刻字为赤经赤纬范围。
8. 取景卡槽：门内 y=486..600 的凹槽里叠着 24 张 <svg class="slip" width="220" height="108">。因为卡与图签同在 <g id="zone-NN"> 里，纯 CSS 的 .slip{opacity:0} 与 #zone-NN:target .slip{opacity:1} 就完成换卡，无需脚本。偶数区的卡是 <image href="plates/atlas-plates.svg#zone-NN">（引用外部文件里声明的 <view id="zone-NN" viewBox="…">），奇数区是 <image href="plates/atlas-plates.svg#svgView(viewBox(800 300 400 300))">；卡面右侧把所用片段串原样刻出，其中一张故意写成逗号分隔的 viewBox(800,300,400,300) 以示列表语法容差，另一张用 xlink:href 刻明「旧刻法同效」。每张卡下方由门内第二个 <defs> 供给一份同 viewBox 的 inline 镜像 <svg><use href="#zone-NN-plate"/></svg>，默认 opacity 0。
9. 片段支持探针：载入时 new Image() 取 plates/probe.svg#svgView(viewBox(100 0 100 100))（该文件左半红右半绿），drawImage 到 OffscreenCanvas 采中心像素。绿＝片段被兑现，保留 <image> 卡并在铜牌刻 SVGVIEW: HONORED；红或加载失败则把 inline 镜像 opacity 提到 1、<image> 压到 0，刻 SVGVIEW: FALLBACK。
10. 外借母版：溢版校样里的彗星是 <use href="plates/atlas-plates.svg#gl-comet">，这枚母版本文档没有。载入后若 getBBox().width === 0 即判外部引用失败，改指 #gl-neb 并刻 EXTERNAL USE: FALLBACK；门角另有一枚 <a href="plates/atlas-plates.svg#zone-19" target="_blank"> 的「借版」铜签，指针悬停出现手型。
11. 验色条（x 786..842，y 90..690，12 格 50px 一列）：a) 三格同为 #gl-m，use 上 fill 分别红/绿/蓝——晕环改色、朱砂芯纹丝不动；b) 三格 #gl-g 只改 color，双色芒随 currentColor 走；c) 三格 #gl-a 只改 --tint；d) 一格印着 use .star-core{fill:#f00} 而星芯毫无反应，紧邻一格印着 #gl-var .pulse-ring{stroke:#ffd36e}（选择器落在母版子节点上），全柜每个变星实例同时变色；e) 末格是对心校验，左半 refX/refY=10、右半 refX/refY=0，后者整体偏到刻度十字的右下方半个 use 框。
12. 底条左段：象限仪 inset（x 44..168，y 742..866）画 +x 向右、+y 向下的轴，实心铜箭 transform="rotate(30 106 800)" 顺时针、铜绿虚线箭为数学惯例的逆时针，刻 SVG +30° ↻ / MATH +30° ↺。母版架（x 188..480）用 2 行 × 7 格、格宽 40 的嵌套 svg 排出：九枚母版各 <use> 一次并刻 id，一格用 24/44/72 三个 width 复用同一母版，一格的 <use href="#gl-neb"> 不写 width/height 因而按 100%×100% 铺满该格，一格放 <use href="#tally-bar" width="60" height="12">（引用的是 <rect>）证明尺寸对非 symbol 目标无效；标题刻「母版自身不显影，这九格也是 use」。
13. 底条中段的取景校样条（x 620..1096）：8 个 100×50 的嵌套 svg 装同一个正方形天区，两行四列，preserveAspectRatio 依次为 xMinYMin meet / xMidYMid meet / xMaxYMax meet / none（上行）与 xMinYMin slice / xMidYMid slice / xMaxYMax slice / xMidYMin meet（下行），每格下刻其值。底条右段（x 1116..1360）：一对 112×66 的同源视口，A 默认裁边、B 同时写 CSS overflow:visible 与 presentation attribute overflow="visible"，彗尾在 B 里越过铜边落到铜面上；其下 244×46 的层序校样里两枚重叠铜签，先画的那枚带 style="z-index:99" 仍被后画的压住。
14. 照准仪：<g id="alidade" transform="rotate(37 430 400)"> 用三参数形式；其下先画一份 transform="translate(430,400) rotate(37) translate(-430,-400)" 的虚线幽灵，两者严丝合缝，盘缘一个放大圆圈把重合的边缘指出来，转轴处一枚 3px 铜钉标出 (430,400)。
15. 动画与静帧：gl-var 母版内含 <animate attributeName="r" values="2.4;5.4;2.4" dur="3.2s" repeatCount="indefinite">，所有实例同相跳动；客星槽 <use id="nova-slot"> 上 <animate attributeName="href" calcMode="discrete" values="#gl-neb;#gl-ob;#gl-var" dur="6s" repeatCount="indefinite"> 轮替母版；主盘窗上 <animate id="sweep" attributeName="viewBox" begin="sweep-lever.click" dur="18s" calcMode="linear" fill="freeze" values="…"> 由「巡天」扳手触发。?export=1 时脚本先 stage.setCurrentTime(4.8) 再 pauseAnimations()，静帧定在刻意选定的相位：变星半开、客星停在第二枚母版、主盘停在 zone-07 的 authored viewBox。
16. 换幅与铭牌：脚本监听 hashchange，用 stage.getElementById 取命中天区的矩形写进 sweep 的 values 首末项并 beginElement()（导出模式直接改写 viewBox 属性），全过程不新建也不删除任何元素。pointermove 挂在 #dial-window 上，铭牌四行分别刻 EVENT TARGET（永远是 use#s-NNNN，而不是里面的 path.star-core）、INSTANCE ROOT（用 evt.target.instanceRoot.firstElementChild 的 class 证明脚本能拿到 CSS 拿不到的影子节点）、VIEWPORT（evt.target.viewportElement.id）、以及最近星的 RA/Dec/星等/光谱型；载入时先用 zone-07 的主星填满四行并把 location.hash 置为 #zone-07，保证静帧不空；每次 pointermove 自增 __INTERACTION_COUNT__。刻字全为拉丁字母与数字，@font-face 用 data-URI woff2 子集（条形衬线 + 等宽数字），fallback 到 serif/monospace。

**验收要点**

1. DOM：document.querySelectorAll('symbol').length === 9；#stage 内 use 元素 ≥ 1700；defs 之外直接书写的 circle|ellipse|polygon 星点数为 0——整份星表没有一颗星被重画。
2. DOM：对 #zone-19 的 <a> 派发 click 后，#dial-window.viewBox.baseVal.x/y 变为 zone-19 矩形的起点，而 #stage.querySelectorAll('*').length 与点击前完全相同（换幅不重绘）。
3. DOM：在一颗已知星的中心派发 pointermove，event.target.nodeName === 'use' 且 id 以 s- 开头；同时 getComputedStyle(document.querySelector('#gl-k .star-core')).fill 不是 rgb(255, 0, 0)，证明 use .star-core 规则够不到影子树，而写在母版子节点上的 #gl-var .pulse-ring 规则在全部变星实例上生效。
4. PNG：24 个图签窗中心区域采样，同一枚 #gl-g 母版呈现 24 种不同色相（相邻格色相差 ≥ 12°、最大差 ≥ 180°）；而验色条里三个 fill 不同的 #gl-m 格，其朱砂芯像素 RGB 三格一致（各通道差 ≤ 4）。
5. PNG + DOM：location.hash === '#zone-07'，被 :target 命中的那格铜牌高亮（其底板亮度较邻格高 ≥ 25%），且门腰凹槽里恰好一张取景卡的计算 opacity 为 1、其余 23 张为 0。
6. PNG：校样条八格中，none 那格的圆形星晕被压扁成椭圆（水平/垂直直径比 ≥ 1.25），三格 slice 内容铺满且左右被裁，三格 meet 在上下留出铜色空档，xMinYMin 与 xMaxYMax 的空档落在相反侧。
7. PNG：溢版校样 B 格的彗尾像素越过其视口矩形右边界至少 12px，A 格在同一边界被整齐截断；层序校样中带 style="z-index:99" 的铜签被后画的那枚压住。
8. PNG + 像素统计：铭牌四行与 SVGVIEW: / EXTERNAL USE: 两行状态字样可读且非空；全图完全透明像素 ≥ 8%、alpha>20 的可见像素 ≥ 3.5%、彩色像素 ≥ 2500。

**实现复审**

- 当前 Chrome 152 忽略 symbol 的 refX/refY 绘制锚点；入口通过 getBBox 探针识别并平移 use 修正。保留原生属性供比较。
- instanceRoot 在当前引擎未暴露，铭牌明确显示 NOT EXPOSED；嵌套 use 的事件可能重定向到外层 use，不能承诺总是 s-*。
- 星图数据为 1675 颗；九枚母版、24 图签、hash 切换和片段探针有浏览器检查。

**浏览器注意**

- 2026 年三家引擎的实际缺口与本场景的兜底：(1) at:symbol.refX/refY —— Chrome 与 Firefox 兑现，Safari 至今忽略，星点会整体偏到坐标交点的右下方半个 use 框；载入时用一枚探针 use 比较 getBoundingClientRect() 的中心与期望值，失配就一次性把全部 use 的 x/y 各减去 width/2 与 height/2（约 1700 次属性写，一帧内完成），验色条末格因此在 Safari 上退化为两格同心。(2) at:svg.transform —— Safari 只忽略最外层 svg 上的 transform；本场景的 rotate 只加在嵌套的 #door 上，三家均正常，最外层 #stage 不带 transform。(3) SMIL —— Safari 对 use 影子树内部的动画同步不可靠（变星可能只有部分实例跳动），故每枚变星母版另画一圈静态双环，静帧与无动画时身份仍可读；<animate attributeName=\"href\"> 在 Chrome/Firefox 有效，Safari 仍只认 xlink:href，脚本在 beginElement() 后比较 nova-slot.instanceRoot 是否更换，未更换则退回定时改写属性；viewBox 的 SMIL 插值三家都支持，Safari 起步略有跳变，仅影响「巡天」过程、不影响静帧。(4) 片段标识符 —— Chromium 与 Firefox 支持 <image> 上的 #svgView(viewBox(...)) 与具名 #viewId，Safari 支持不完整；用 probe.svg 的红/绿半幅做画布采样探针（同源 SVG 绘入 canvas 不污染），失败即揭开预置的 inline 镜像并把铜牌刻成 SVGVIEW: FALLBACK，取景卡内容不变、只是换了成像途径。(5) use 的外部文件引用三家都支持，但要求同源且不可 file://；plates/atlas-plates.svg 与 plates/probe.svg 由采集用的本地 dev server 同源提供，是本场景仅有的两处非 data: 请求，其余字体与素材全部 data-URI 内嵌；引用失败时 getBBox().width === 0 触发换用内嵌 #gl-neb 并刻 EXTERNAL USE: FALLBACK。(6) 嵌套 svg 的 overflow —— 现代三家都认 CSS overflow:visible，为兼容旧 Safari 同时写 presentation attribute overflow=\"visible\"。(7) 内联 SVG 的文档片段（#viewId、svgView()）对宿主 HTML 无效，这正是取景卡必须引用独立 SVG 文档的原因；:target 在三家里都能匹配 SVG 元素，Safari 早期不滚动但匹配无碍，本场景无滚动条。(8) 字体 —— 刻字全为拉丁字母与数字，@font-face 用 data-URI woff2 子集，fallback 到 serif/monospace，不依赖任何 CJK 字体。

### 3.2 `museum-label-panel` — 博物馆展签面板

- **用途 / 家族**：museum label system / museum curation / archives
- **复杂度**：expert　**标签**：`foreignobject`, `standalone-svg`, `accessibility`, `media-queries`, `forms`, `museum`
- **设计问题**：一份能被单独打开的 SVG 文档，究竟能承载多少博物馆展签系统——会换行的正文、成分公式、观众留言表单，还有一版打印稿？

**场景**　一块可以单独打开的展签面板铺满 1400×900 的透明舞台。左栏是彩陶双耳罐的矢量测绘图：外轮廓 path、半剖填充、尺寸线与 0–20 cm 比例尺；右栏由六个 foreignObject 承载展签真正的文本层——会自动换行的说明正文、三列栅格排布的年代与出土信息表、铅同位素比值的 MathML 公式（引线落在 XRF 折线的某个点上）、一张观众留言表单，以及贴在测绘图上、被旋转斜切的暂挂纸标签；面板底边是一条实时播报条。右侧档案栏把同一份 museum-label.svg 同时以 inline、img 与 object 三种方式挂出来，用「脚本 / 表单 / 悬停 / 外链」四个 ✓✗ 芯片说明安全静态模式下脚本与表单如何整体失效，而声明式动画依旧在跑；再往下是固有尺寸三态，以及缺 xmlns、文件 404、XML 语法不合法三块反例。档案栏最上方是这份展签的五种身份：浅色、深色、强制高对比、打印版式与窄幅响应，全部由同一文档内的四条媒体查询切换，正文一字未改，每块瓦片下方印着触发它的媒体查询原文。器物的七个部位按展品编号 M-01…M-07 排在 DOM 末尾，Tab 沿编号而非绘制顺序推进，两条折线把「绘制序」与「编号序」同时画在图上，每次焦点切换都由播报条读出来；右下角一枚按钮把当前身份序列化成一张位图存档，并自检 foreignObject 是否参与了这次栅格化。

**主打特性**

- `el:foreignObject` — foreignObject element
- `concept:foreignobject-html-text-wrapping` — Flowing, wrapping HTML text via foreignObject
- `concept:foreignobject-form-controls` — Interactive HTML form controls inside SVG
- `concept:standalone-svg-document` — Standalone SVG XML document
- `css:media-print` — @media print inside SVG
- `css:media-width-in-standalone-svg` — @media (width) responsive SVG in img/object
- `concept:aria-live` — aria-live region announcing SVG state changes
- `concept:role-button-keyboard` — role=button + tabindex + Enter/Space handling on shapes (aria-pressed)

**辅助特性**

`at:svg.width`、`concept:svg-auto-sizing`、`el:metadata`、`el:title`、`el:desc`、`at:svg.xmlns`、`concept:intrinsic-sizing-of-embedded-svg`、`concept:foreignobject-css-grid-flex`、`concept:foreignobject-mathml`、`concept:foreignobject-video`、`concept:foreignobject-transform`、`concept:foreignobject-filter-clip-mask`、`concept:svg-as-img-restrictions`、`concept:svg-as-object-embed-iframe`、`av:svg.role=img`、`at:svg.aria-label`、`at:g.aria-hidden`、`concept:tabindex-focusable-svg-elements`、`css:custom-properties`、`css:prefers-color-scheme`、`css:forced-colors`、`pv:fill=currentcolor`、`concept:svg-script-security-context`、`concept:svg-to-canvas-rasterization`、`api:SVGElement.focus`、`concept:keyboard-events`、`at:svg.tabindex`、`css:focus`、`css:focus-visible`、`css:has`、`css:checked-sibling-toggle`、`concept:role-group`、`concept:screen-reader-reading-order`、`concept:metadata-rdf-dublin-core`、`concept:foreign-namespace-attributes-ignored`、`concept:title-placement-first-child`、`concept:custom-tooltip`、`at:svg.aria-describedby`、`at:svg.aria-labelledby`、`at:svg.xmlns:xlink`、`at:foreignObject.x`、`at:foreignObject.width`、`concept:foreignobject-overflow-clipping`、`concept:foreignobject-viewbox-scaling`、`concept:foreignobject-xmlns-requirement`、`concept:foreignobject-canvas-rasterization`、`el:canvas`、`el:iframe`、`av:svg.role=graphics-document`、`av:g.role=list`、`av:g.role=group`、`concept:role-graphics-document`、`concept:svg-text-accessibility-and-find`、`concept:html-controls-via-foreignObject`、`concept:var-in-presentation-attribute`、`css:root-selector-scope`、`css:supports-rule`、`css:property-registered-animation`、`css:light-dark-function`、`css:system-colors`、`css:prefers-contrast`、`css:container-queries`、`css:outline`、`css:focus-within`、`css:presentation-attribute-specificity`、`api:HTMLObjectElement.contentDocument`、`api:SVGTextContentElement.getComputedTextLength`、`concept:tabindex-focus-order`、`concept:focus-events`、`concept:xml-entities-and-cdata`、`concept:xml-well-formedness-errors`、`concept:animation-in-img-context`、`concept:cross-document-svg-scripting`

**构造要点**

1. 坐标与产物：舞台 1400×900 透明；唯一真源是构建期生成的独立文档 /labels/museum-label.svg，首行 <?xml version="1.0" encoding="UTF-8"?>，根元素 <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink=… width="800" height="660" viewBox="0 0 800 660" role="img" aria-labelledby="lbl-title lbl-desc" aria-label="彩陶双耳罐展签">。同一源串再写出四个副本：-ratio.svg（只留 viewBox）、-bare.svg（既无 width/height 也无 viewBox）、-noxmlns.svg（删掉 xmlns）、-malformed.svg（正文里留一个未转义的 &）。<img> 用同串的 data:image/svg+xml;base64 副本，<object>/<iframe> 用同源文件（现代浏览器阻断 data: 导航），二者由同一 SHA-256 摘要断言等价。
2. 文档头部严格按序：<metadata> 内 RDF/Dublin Core（dc:title、dc:date、dc:identifier「M-2026-118」、dc:rights）+ 器物组上的外来命名空间属性 museum:accession="M-2026-118"（渲染完全忽略）→ <title id="lbl-title">（title 必须是首子元素才产生原生 tooltip）→ <desc id="lbl-desc"> → <defs>。宿主脚本用 object.contentDocument 读出 metadata 三个字段、用 getAttributeNS 读出 accession，把「档案元数据 · 4 字段 · 无可见输出」印在嵌入对照区，证明它存在且不上色。
3. 主展签（inline 副本）落在 x 32–832、y 64–724。文档内分栏：左栏 24–300 为测绘图，右栏 320–776 为文本层。绘制层序自下而上：纸底 rect → aria-hidden="true" 的 5 mm 网格 g（仍然可见但退出无障碍树）→ 器物几何 g（role="group"）→ 纹样层 .layer-pattern → 剖面层 .layer-section → foreignObject 组 → 阅读顺序热点 g（DOM 末尾）→ 焦点环层。
4. 器物几何：外轮廓用一条 path（口沿、颈、双耳、鼓腹、圈足），左半用 clipPath 切出半剖并填 45° 斜线 pattern；尺寸线 + 箭头在 x 24–300 外侧；比例尺由 Array.from({length:21}) 生成 0–20 cm 刻度，每 5 cm 一根长刻线并带数字。器物、纹样、比例尺各自是一个 <g role="group" aria-label>，构成 role="list" 的三项结构。
5. 六个 foreignObject 的坐标与职责（每个内部根 div 都必须显式写 xmlns="http://www.w3.org/1999/xhtml"，否则整块不渲染）：#fo-desc(x=320,y=150,width=456,height=190) 正文自动换行、overflow:hidden 截断并在底部用 mask=url(#m-fade) 渐隐，收尾一行「续见展册第 38 页」；#fo-grid(320,352,456,112) 三列 CSS grid，六项年代/出土/材质/尺寸/编号/入藏，标成 role="list" 与 role="listitem"，并加一条 @container (max-width: 300px) 规则让窄幅身份下塌成一列；#fo-math(320,470,250,90) MathML 分式（mfrac + msqrt + msup 的铅同位素比值），引线连到右侧 580–776 的 XRF 折线上的第 4 个点；#fo-form(320,560,456,84) 观众留言表单；#fo-live(24,612,752,32) 播报条；#fo-tag(196,88,150,70) 暂挂纸标签。
6. 换行对照（本 demo 的核心可见证据）：把 #fo-desc 的第一句原样复制成一个 SVG <text x="320" y="346">，不设 textLength、不做人工断行，它一行横穿并被 clipPath 裁于面板右边界 776，旁注「同一句 · SVG text 不换行」；断言用 getComputedTextLength() 与 456 比较。
7. 暂挂标签 #fo-tag：外层 transform="rotate(-6.5 271 123) skewX(-4)"，内部是普通静态流布局（不用 position:absolute，避开 Safari 的定位/命中测试缺陷），文字仍可选中且矢量清晰；标签内嵌一个 120×70 的 <iframe srcdoc> 展册页与一个 96×96 的 <canvas>（rAF 画合成偏光薄片旋转），canvas 用 clip-path=url(#c-vessel) 裁成器身剪影——foreignObject 内的 HTML 媒体与画布用它们来证明，不引入需要网络的 <video>。
8. 模糊与裁剪：#fo-redact(40,470,120,120) 承载「待考释文」段落，filter=url(#f-redact)（feGaussianBlur stdDeviation 由 var(--redact) 驱动，默认 3.2）+ clip-path=url(#c-round)（circle r=56）；指针悬停或聚焦时 --redact 降到 0.2，段落显形，这是 filter/clip 作用在 foreignObject 上的最直白演示。
9. 五种身份的样式实现：<style> 先在 :root 上定义 --paper/--ink/--rule/--accent/--hair/--redact（:root 在独立 SVG 文档中就是 svg 根），并用 @property 注册 --accent 以获得 240 ms 过渡；随后四个块各自重定义同一批变量——@media (prefers-color-scheme: dark)、@media (forced-colors: active)（改用 Canvas / CanvasText / Highlight 系统色，品牌色块加 forced-color-adjust:none，并用 @media (prefers-contrast: more) 兜底）、@media print（黑白化、隐藏表单与按钮、显出裁切标记与编号页脚）、@media (max-width: 420px)（测绘图移到正文之上、信息表塌成一列、标题缩为编号）。每个块都镜像一条 :root[data-identity="dark|forced|print|narrow"] 选择器，宿主给瓦片设该属性，于是一张静帧就能同时呈现五种身份；@supports (color: light-dark(#fff,#000)) 内额外给出 light-dark() 的等价写法。
10. 身份墙（864–1368, 64–300）：五块 96×120 瓦片全部引用同一文件——浅色 <object>；深色 <img style="color-scheme:dark">（依赖 color-scheme 向图像文档传播）；强制高对比 <object>+data-identity="forced"；打印 <object>+data-identity="print"；窄幅 <img width="380">（真实触发 max-width:420px 分支）再用 CSS transform 缩进瓦片。每块下方印出触发它的媒体查询原文，瓦片本身用 at:svg.width 展示 px 与 % 两种外层尺寸对同一 viewBox 的缩放。
11. 嵌入对照（864–1368, 316–470）：inline / <img> / <object> 三块同文件。文件内 <script>（用 CDATA 包裹，正文里另有 &#x2014; 实体，用于讲 XML 语法）把「脚本已运行 · hh:mm:ss.mmm」写入 #script-stamp，作者态文本是「脚本未运行（img 安全静态模式）」；另有一枚纯 CSS 动画呼吸点，三种嵌入里都在动，说明失效的是脚本与表单而非声明式动画。四个 ✓✗ 芯片对照 脚本 / 表单 / 悬停 / 外链（外链用一个 https 的 <image> 叠在手绘印记占位上，网络被阻断时占位显形）。宿主读 object.contentDocument 回填「跨文档读取成功 · 12:04:31.882」，并注明 <img> 无任何 DOM 可读、Ctrl+F 也搜不到其中的 <text>。
12. 固有尺寸与坏例（864–1368, 486–600）：三个 240 px 宽容器内的 <img> 分别指向带 width/height 的原件、只有 viewBox 的 -ratio.svg（撑满容器宽、保持 800:660）、什么都没有的 -bare.svg（渲染成 300×150）；脚本用 getBoundingClientRect() 把三组实测像素写进标注。第四块 <img src="…-noxmlns.svg" alt="无 xmlns：浏览器按 XML 树处理"> 只显示 alt；第五块 <object data="/labels/missing.svg">…回退内容…</object> 显示 fallback；第六块 <object data="…-malformed.svg"> 显示 XML 解析错误页。
13. 阅读顺序层：七个热点 <rect class="hotspot" tabindex="0" role="button" aria-pressed="false" data-accession="M-01…M-07" data-paint-index="k">，DOM 顺序严格按编号，视觉位置来自绘制顺序表（如口沿画得最早却编号 M-03）；每个热点首子元素是 <title>（原生 tooltip），其后 <desc> 并用 aria-describedby 指向它，指针悬停时另绘一个自制 SVG tooltip 以便进入静帧。两条 polyline 连接热点中心：虚线=绘制序，实线=编号序，B4 的编号目录（role="list"）用同色对照，并说明屏幕阅读器走的是 DOM 序。
14. 键盘与焦点：.hotspot:focus 描边加粗到 3 px，:focus-visible 再叠一圈 outline 虚线 accent 环（outline-offset 4）；focus 事件同时写 .kbd-focus 镜像类，保证截图确定性；#fo-form 的外框用 :focus-within 高亮。方向键沿轮廓 path 用 getPointAtLength 以 12 px 步进移动测量游标并更新读数；Enter/Space 翻转 aria-pressed 与剖面层可见性；底部按钮调用 document.querySelector('[data-accession="M-04"]').focus() 演示 SVGElement.focus()。装饰性网格与纹样不带 tabindex，Tab 直接跳过。
15. 纯 CSS 联动：表单里的 #layer-pattern / #layer-section 复选框配 :root:has(#layer-pattern:checked) .layer-pattern{display:block}，不用一行 JS 就切换图层；悬停联动用 svg:has(.hotspot:hover) .part:not(:hover){opacity:.35} 与目录行的 .legend-row:has(.dot[data-accession])。表单的 input/select/checkbox/button 由脚本把字数与身份写回一段 SVG <text>（「留言 12 字 · 待审」），证明 HTML 控件与 SVG 内容确实同一个 DOM。
16. 播报与导出：任一 focus / pointermove / 表单 input 事件后，同一个 announce() 写入 #fo-live 的 role="status" aria-live="polite" 段落——「焦点 M-04 双耳 · 顺序 4/7 · 身份 浅色 · 留言 12 字」，并自增 window.__INTERACTION_COUNT__ 供采集脚本的指针契约使用。右下角 240×150 的存档画布：XMLSerializer 序列化 inline 副本 → data:image/svg+xml;base64 → new Image() → drawImage；随后在正文段落对应像素处采样，据此把徽章写成「foreignObject 已参与栅格化」或「未参与」，未参与时用 canvas 直接补绘一行摘要文字。?export=1 时把偏光 canvas 固定在种子帧、暂停 rAF，并预先 focus M-03 让焦点环出现在静帧里；window.__VIS_READY__ 在所有副本 load、栅格自检完成、播报区首次写入之后置真。

**验收要点**

1. PNG 中 #fo-desc 的正文至少 4 行且全部落在 x=320–776 内；DOM 中同一句的对照 <text> 的 getComputedTextLength() > 456 且被 clipPath 裁于面板右缘——换行只发生在 foreignObject 一侧。
2. DOM：inline 副本内 foreignObject 数量 ≥ 6，#fo-form 内 input、select、input[type=checkbox]、button 各 ≥ 1，#fo-math 内存在 math > mfrac 且含 msqrt 与 msup；对应的 <img> 副本 naturalWidth > 0 却查不到任何表单节点或文本节点。
3. 身份墙五块瓦片在 PNG 中呈现五种不同的纸底/线色组合（逐块采样中心区域，两两色差 ΔE > 12），而五块引用的文件摘要（或归一化路径）完全一致。
4. Tab 序列：document.querySelectorAll('[data-accession]') 的 DOM 序为 M-01…M-07，[data-paint-index] 的序列与之不同；从 M-01 连按 Tab，document.activeElement.dataset.accession 依次递增，且带 .kbd-focus 的焦点环在静帧里可见。
5. 播报区 #fo-live 具有 role="status" 与 aria-live="polite"，静帧里可读出包含当前编号（M-03）与身份名的文字；触发 pointermove 后 window.__INTERACTION_COUNT__ 增大。
6. 键盘：向 M-04 派发 3 次 ArrowRight 后测量游标的 x 增加 ≥ 24；派发 Space 后该热点 aria-pressed 由 false 变 true，且 .layer-section 的 getComputedStyle(display) 由 none 变 block。
7. 存档画布采样到非透明像素，自检徽章文本严格是「foreignObject 已参与栅格化」或「foreignObject 未参与栅格化」之一，且徽章结论与实际采样一致。
8. 媒体查询真实性：在 emulateMedia({media:'print'}) 下，object 文档内 matchMedia('print').matches === true 且 #fo-form 的 getComputedStyle(display) === 'none'；把窄幅瓦片的 <img> 宽度设为 380 时其文档内 matchMedia('(max-width: 420px)').matches === true。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- Safari 对 foreignObject 的老问题集中在 transform 下：绝对定位/固定定位后代会错位、命中测试偏移，因此暂挂标签内部只用静态流布局，且不在旋转层里放交互控件；Safari 里 <iframe srcdoc> 嵌在 foreignObject 内历史上也不稳定，缺失时以同尺寸静态 HTML 卡兜底（因此不使用 <video>，网络被阻断的采集环境也无法加载媒体）。Safari 至今不实现 forced-colors，强制高对比身份改由镜像属性 :root[data-identity=\"forced\"] 与 @media (prefers-contrast: more) 呈现，系统色 CanvasText/Canvas/Highlight 本身在三家都可用。color-scheme 向 <img> 内 SVG 文档的传播在 Chrome/Safari 可用，Firefox 若未生效则该瓦片自动退回 <object>+data-identity=\"dark\" 版本，静帧不受影响。SVG 被当作图像栅格化（<img> 或 drawImage）时是否绘制 foreignObject 内的 HTML，各引擎历来不一致（Chrome 常整块丢弃，Firefox 多数情况绘制），所以存档画布带像素自检徽章，并在缺失时用 canvas 补绘摘要文字，而不是假装它一定成功。<object>/<iframe> 的 data 不接受 data: URI（data: 顶层导航被阻断），因此这两路走同源 /labels/*.svg 文件，只有 <img> 用 base64 data: URI；采集脚本的路由白名单需放行 127.0.0.1 与 data:。@media print 在 <img>/<object> 内嵌文档中的打印行为 Safari 支持较弱，静帧一律用镜像属性呈现，page.emulateMedia({media:'print'}) 只用于断言 matchMedia 与 display 计算值。MathML Core 三家均已支持，但无网络时依赖系统数学字体，度量异常时切到备用组里手绘的 SVG 分式。:has() 三家（Chrome/Safari/Firefox 121+）均可用，仍保留 JS 镜像 class 以保证截图确定性；@container 在 foreignObject 内 Chrome/Firefox 正常，Safari 个别版本对 SVG 内建立容器上下文有偏差，窄幅塌陷因此同时由 @media (max-width:420px) 保底。

### 3.3 `ship-lofting-floor` — 船体放样间

- **用途 / 家族**：technical lofting / naval architecture
- **复杂度**：expert　**标签**：`path-grammar`, `bezier`, `elliptical-arcs`, `lofting`, `matrix-projection`, `control-net`
- **设计问题**：路径语法里的每一条命令，能不能都化成一根真实的船体型线足尺画出，并当场与它自己的控制网核对无误？

**场景**　一间蓝晒色的放样间：深靛的地板上以足尺展开一副船体型线，六条水线横贯、十一条站线竖立，纵剖的舷弧、舭部的曲线与横剖的肋骨线在格网上互相交织，龙骨基线被同一段几何用啰嗦绝对写法、压缩写法和小写相对写法叠画了三遍，只见一根线——旁边那根被人为改动了一个相对增量的幽灵线却整段歪出去，成了对照。地板右缘摊着一张「命令构件表」：十张构件卡分两列钉在墙板上，S 与 T 的反射控制点用空心圆点标出它们不是被写下、而是被镜射出来的；A 的四种弧标志组合把同一对端点之间的四段候选弧一次摆齐；半径写成 1 1 的那段弧被自动放大成半径 50 的半圆；'h0' 的零长子路径在圆头端点下变成一排整齐的圆点，而同一串在平头端点下什么也没有。左下的工具搁架上躺着样条压铁、三块端点样板、三块折角样板与一把由 in / cm / mm / pt / pc / px 六种绝对单位刻出的、右端严丝合缝对齐的放样尺。右下角的矩阵台上，同一副断面被三个 matrix() 投成轴测分段箱的顶面与左右两面，中线右侧的半宽型线经 matrix(-1 0 0 1 …) 翻出左舷，「STARBOARD」的字样因此只能在镜子里读。最难忘的是控制网揭示：指针掠过任意一段型线，那一段立刻吐出自己的控制多边形、切线延长线、端点与弦长读数，屏幕下缘的读数条同时并排打出这一段的绝对写法与相对写法两行——数字完全不同，画出的却是同一条龙骨。

**主打特性**

- `at:path.d` — path data attribute d
- `av:path.d=A` — elliptical arc A/a
- `concept:arc-flag-combinations` — large-arc and sweep flags four combinations
- `concept:smooth-cubic-reflection` — S reflects previous C/S second control point
- `concept:relative-vs-absolute-commands` — lowercase relative vs uppercase absolute coordinates
- `concept:isometric-projection-matrix` — Isometric / axonometric projection via matrix()

**辅助特性**

`el:path`、`av:path.d=M`、`av:path.d=L`、`av:path.d=H`、`av:path.d=V`、`av:path.d=C`、`av:path.d=S`、`av:path.d=Q`、`av:path.d=T`、`av:path.d=Z`、`concept:arc-radius-scaling`、`concept:smooth-quadratic-reflection`、`concept:implicit-repeated-commands`、`concept:multiple-subpaths`、`concept:zero-length-subpath-round-cap-dot`、`at:path.pathLength`、`pr:fill-rule`、`css:d-property`、`api:SVGGeometryElement.getTotalLength`、`api:SVGGeometryElement.getPointAtLength`、`api:SVGGeometryElement.isPointInFill`、`api:SVGAnimatedLength.baseVal`、`pr:stroke-width`、`pr:stroke-linecap`、`pr:stroke-linejoin`、`pr:stroke-miterlimit`、`concept:animate-path-d-morph`、`css:geometry-properties`、`pv:transform=matrix`、`concept:negative-scale-mirroring`、`concept:length-units-absolute`、`concept:path-must-start-with-moveto`、`concept:empty-d-not-rendered`、`concept:path-error-partial-render`、`concept:path-number-syntax`、`concept:relative-moveto-after-closepath`、`concept:arc-x-axis-rotation`、`concept:arc-zero-radius-line`、`concept:arc-flag-compact-parsing`、`concept:smooth-command-without-predecessor`、`concept:closepath-join-vs-cap`、`concept:fill-closes-open-subpaths`、`concept:zero-length-subpath-square-cap`、`pv:fill-rule=nonzero`、`pv:fill-rule=evenodd`、`concept:winding-direction-holes`、`pv:stroke-linecap=round`、`pv:stroke-linecap=square`、`pv:stroke-linejoin=round`、`pv:stroke-linejoin=bevel`、`pv:stroke-width=0`、`css:d-property-transition`、`css:geometry-properties-transition`、`css:custom-properties-in-geometry`、`concept:units-inside-viewbox-scaled`、`concept:polygon-vs-path-equivalence`、`concept:animate-path-d-mismatch-discrete`、`api:SVGGeometryElement.pathLength`、`api:SVGGeometryElement.isPointInStroke`、`api:SVGPathElement.getPathData`、`api:SVGPathElement.pathSegList`、`api:SVGLength.convertToSpecifiedUnits`、`api:SVGAnimatedString.baseVal`、`api:Element.classList`、`concept:mouse-to-svg-coordinates`、`api:SVGGraphicsElement.getScreenCTM`、`api:Window.requestAnimationFrame`

**构造要点**

1. 画布与放样坐标：根元素 `<svg viewBox="0 0 1400 900">`，不铺满底色——只在各功能区放圆角面板（fill #0d2740、opacity .72、stroke #4f8fc0 .5），四周留 24px 全透明边，保证 omitBackground 截图的透明像素比例。放样坐标固定为：基线 y=604，站距 SX=76（站 0..10 → x=92,168,…,852），水线距 SY=62（WL0..WL5 → y=604,542,480,418,356,294）。所有手写 d 的数字都落在这套格网上取整，便于肉眼核对。
2. 分区盒子：标题带 (40,24)-(1360,92)；主放样区 (40,96)-(900,640)；右侧命令构件表 (930,96)-(1360,640)，2 列 × 5 行、每卡 205×100、间距 10；读数条 (40,648)-(900,700)；左下工具搁架 (40,704)-(900,876)；右下矩阵台 (930,660)-(1360,876)。层序自下而上：格网 → 幽灵线/影线 → 型线 → 构件卡 → `#control-net` 揭示层 → 读数条文字 → 指针状态点；`#control-net` 始终最后 append，保证压住型线。
3. 格网（H / V / M / 多子路径）：单个 `<path id="loft-grid">` 承担全部格网，d 形如 `M92 604H852 M92 542H852 …M92 604V294 M168 604V294 …`，6 条水线只用 H、11 条站线只用 V，stroke-width .5、opacity .45。同一元素内 17 个 M 子路径即 concept:multiple-subpaths 的第一处证据。
4. 龙骨三写法（hero）：同一段几何写成三个 path 叠画。`#keel-verbose` 用啰嗦绝对写法 `M 92 604 L 240 604 C 380 604, 460 598, 516 588 S 660 566, 852 560`；`#keel-compact` 用紧凑写法 `M92 604 240 604c140 0 220-6 276-16S660 566 852 560`（省略隐式 L、去掉可省分隔符、负号直接贴数、`.5` 式小数）；`#keel-relative` 全用小写相对命令。三者 stroke 分别为 4px 实线、2px 虚线、1px 点线，颜色错开，视觉上完全重合。第四条 `#keel-drift` 复制相对写法但把第二段的 dx 由 140 改成 158，整段其后全体右移 18，用 30% 透明的橙色画出，标注「一个相对增量 → 后续全体平移」。
5. 舷弧与半宽水线（C / S / Q / T 与反射）：`#sheer` 用 `M92 300 C168 268 244 252 320 250 S472 262 548 278 S700 306 852 296`，一段 C 起手、其后两段 S 保持切线连续；`#half-breadth` 用 `M92 470 Q168 430 244 470 T396 470 T548 470 T700 470 T852 470`，一段 Q 起手、其后 T 链交替出对称驼峰。两者的反射控制点在揭示层中画成空心圆（表示「未写出、由前一段镜射得到」），实写控制点画成实心方块；构件卡上另放一条以 `M…S…` 开头、无前驱的路径，其首控制点退化到起点，标注 concept:smooth-command-without-predecessor。
6. 横剖线与弧命令（hero A）：11 条站线型线各为一条 path，形状为 `M<半宽> <甲板y> V<舭顶y> A<rx> <ry> <rot> <laf> <sf> <x> <y> L92 604`——竖直的舷侧板用 V，转舭用 rx≠ry 的椭圆弧，其中站 3 与站 7 把 x-axis-rotation 写成 -12 展示弧的旋转轴，站 9 写成 `A0 24 0 0 1 …`（rx=0）退化成直线，站 10 的弧起讫点重合被整体忽略。构件表另有一张卡展示紧凑写法 `a25 25 0 1130 0`（两个标志位不加分隔符直接连读）。
7. 命令构件表 10 张卡（每卡 205×100，卡内左上角 11px 标题、底部 10px 等宽 d 字串）：① A 的四种标志组合——同一对端点 (0,0)-(60,0)、rx=44 ry=30，四条弧分别为 0 0 / 0 1 / 1 0 / 1 1，四色叠画，说明它们是两个候选椭圆的四段弧；② 半径自动放大——`M0 30A1 1 0 0 1 100 30` 渲染为半径 50 的半圆，卡上标注「r 被按规范放大到 50」；③ Z 与不闭合——两条相同折线，一条以 Z 收尾出现闭合边与斜接角，另一条留开口只见两个端帽，另叠一份仅描边不闭合但 fill 自动补面的版本；④ 零长子路径——`M8 20h0 M24 20h0 …M88 20h0`（6 个）分三行分别用 round / square / butt 端帽，得到 6 个圆点、6 个方块、以及一整行空白；⑤ 隐式命令重复——`M10 10 50 50 90 10` 不写任何 L 画出 V 形，旁边给出等价 polygon 的点串说明二者几何相同；⑥ pathLength 归一——两条弧长相差一倍的曲线都写 `pathLength="100" stroke-dasharray="12.5"`，各自恰好 4 段实线等长；⑦ fill-rule——同一条自交的五叶螺旋桨轮廓画两遍，nonzero 中心实心、evenodd 中心出五边形空洞，第三份把内环子路径反向绘制说明绕向决定挖孔；⑧ 错误容忍——三行：`d=""` 什么也不画、`d="L10 10 90 90"`（不以 M 开头）整条不渲染、`d="M10 10L90 90 X20 20L90 10"` 在非法命令处截断只画前半段；⑨ 相对 moveto 跟在 z 之后——`M20 20h40v40h-40z m0 60h40` 的第二个子路径从第一子路径起点而非终点起算；⑩ 历史 API 卡——一行 `pathSegList` 被划掉盖「已从所有引擎移除」戳，下一行 `getPathData()` 打勾并注明 Firefox 缺失时改用内置解析表。
8. 控制网揭示（hero 机制）：构建期为每条型线生成 `data-seg` JSON 数组，元素为 `{cmd, abs, rel, start, end, ctrl[], reflected[], len0, len1}`（`len0/len1` 由逐段追加构造探针 path 后调用 getTotalLength 得到）。运行时 pointermove（rAF 节流）先用 `pt.matrixTransform(svg.getScreenCTM().inverse())` 把事件坐标换到用户坐标，再对所有段的采样折线（每段 24 个 getPointAtLength 采样点）求最近距离，阈值 40 用户单位内命中。命中后在 `#control-net` 里画：控制多边形（1px 虚线依次连 start→ctrl→end）、切线延长线（起讫切向各延长 40）、实写控制点实心方块 5×5、反射控制点空心圆 r=5、端点空心方块 7×7 与弦线，并给端点标注弧长/弦长（mm）。同时给命中 path 加 `.picked` 类（classList），未命中时回退到默认预选段（龙骨第 2 段），保证静帧就有完整控制网。
9. 读数条（绝对/相对并排，hero）：`#readout` 用嵌入 data URI 的等宽字体分四行打印：第 1 行 `图层 class=` + 读取 `path.className.baseVal`；第 2 行 `绝对  C 612 318 668 286 724 300`；第 3 行 `相对  c 96 -38 152 -70 208 -56`（由 abs 减当前点 (516,356) 逐对生成，实现时直接用构建期算好的 rel 串）；第 4 行 `弧长 214.7mm  弦长 209.0mm  端点 (516,356)→(724,300)`。读数条右端放一个 120×70 的验证小窗，同时用第 2、3 行两个字串各建一条 path 叠画，二者完全重合并标注「Δ=0」。
10. 长度与站位取点：`#sheer-trace` 在建成后用 getTotalLength() 取 L，写入 `stroke-dasharray="${L} ${L}"`，得到一笔到底、只在起点留一处接缝的完整轮廓，旁注实测 mm；站位记号则沿 `#sheer` 以 L/10 步长调用 getPointAtLength 取 11 点，并用 ±1 单位的相邻采样求法向，画出 12 长的垂直短记号与站号。压铁（ducks）圆心同样由 getPointAtLength 沿舷弧等距摆放。
11. 压铁与 baseVal 游标：搁架上 9 个压铁为 `<circle>`，半径来自 CSS `circle.duck{ r: var(--duck-r,9px); transition: r .25s }`，`.duck:hover{ r:14px }`；样板矩形宽度也由 CSS 规则 `width:210px` 给出（几何属性作 CSS 属性）。搁架顶部另有一条 SVG 自绘游标：pointermove 时把指针 x 归一到 [0,1]，写 `ducks[i].r.baseVal.value = 6 + 8*t`，游标手柄同步平移，右侧读数用 `r.baseVal.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_MM)` 后的 `valueInSpecifiedUnits` 打印毫米值。若 `CSS.supports('r','10px')` 为假（Firefox），JS 直接写 r 属性并用 rAF 手工补间。
12. CSS d 与形变：`#rabbet-line`（龙骨槽线）不写 d 属性，几何全部来自样式表 `#rabbet-line{ d: path("M92 612H852"); transition: d .6s }`、`.loaded #rabbet-line{ d: path("M92 620C300 620 600 616 852 612") }`，指针进入放样区时对根节点 classList.toggle('loaded') 触发过渡；若 `CSS.supports('d','path("M0 0")')` 为假则把同一字串写回 d 属性并在卡上盖「attribute fallback」戳。另有 `#dwl` 用 SMIL `<animate attributeName="d" dur="8s" values="设计水线;满载水线;设计水线" calcMode="spline">`，两个 d 的命令序列与数量完全一致（均为 M C S S）故平滑形变；旁边的 `#dwl-bad` 目标 d 少一段 S，呈现整帧跳变，标注「命令不匹配 → 离散」。截图路径下调用 `svg.pauseAnimations(); svg.setCurrentTime(2.4)` 冻结中间帧，并把首尾两个 d 以 20% 透明的细虚线常驻，静帧仍读得出形变区间。
13. 线宽与端帽/接头样板：标题带右侧放图线等级梯 stroke-width 0.5 / 1 / 4 / 12 / 0（最后一行完全不出线，标「0 = 不出线」），并用一个 60×34 的矩形叠在 0.5 的同几何导线上，stroke-width 12 使描边内外各占 6，直观显示描边骑跨几何边。搁架三块样板：端帽板——三条同样的 14px 粗线压在 1px 细导线上，butt 齐平、round 与 square 各多伸出 7；折角板——同一条锯齿折线画三遍，miter / round / bevel；另加两条标注「Firefox only」的 miter-clip 与 arcs，检测不支持时视觉回退为 miter 并保留说明。尖角板——三个夹角 20° 的人字（miter 比 1/sin10°≈5.76），stroke-miterlimit 分别 1 / 4 / 10，只有 10 长出尖刺。
14. 指针型内外判定：`#hull-shell` 是一条含四个子路径的 path（外舷线→基线闭合、内底环、两个舱口小岛），fill-rule 由构件卡⑦ 的按钮态决定。pointermove 时把用户坐标点交给 `hullShell.isPointInFill(point)`，真则指针点填 #6ee7a8 并写「型内」，假则填 #ff7a7a 写「型外」；再用 `isPointInStroke` 判断是否正压在型线上，是则读数条左侧亮起「压线」指示。DOMPoint 由 `svg.createSVGPoint()`／`new DOMPoint` 构造以兼顾旧实现。
15. 矩阵台（hero 轴测 + 镜像）：右下 (930,660)-(1360,876)。同一段站线断面（120×120 局部坐标）复制三份组成分段箱：顶面 `matrix(0.866 0.5 -0.866 0.5 1145 720)`、右面 `matrix(0.866 0.5 0 1 1145 720)`、左面 `matrix(-0.866 0.5 0 1 1145 720)`，三面共边严丝合缝。镜像：半宽型线组置于中线 CLX=1145 右侧，左舷副本用 `matrix(-1 0 0 1 2290 0)`，其上「STARBOARD」标签另加 `scale(-1 1)` 与一行 `scale(1 -1)` 的吃水标记，只有在镜中可读。等价性验证：一组写 `transform="rotate(-18) scale(1.2 .8) translate(40 12)"`，其孪生组写单个 `matrix(1.14127 -0.37082 0.24721 0.76085 48.61735 -5.70271)`，两者逐像素重合，旁注「函数串 = 一次 matrix」。
16. 绝对单位放样尺与交互契约：搁架底部并排六根高 8 的标尺，左端同在 x=60，宽度分别写 `96px`、`1in`、`2.54cm`、`25.4mm`、`72pt`、`6pc`，在 1:1 的 viewBox 下右端全部落在 x=156；下方另嵌一个 `<svg viewBox="0 0 50 20" width="100" height="40">` 内放同样的 1in 尺，明显不再等于 96 屏幕像素，标注「viewBox 内单位随之缩放」。全局在首帧完成建构、预选默认段并渲染控制网后置 `window.__VIS_READY__=true`；pointermove 处理器每次成功命中或更新状态点即 `window.__INTERACTION_COUNT__++`，满足无点击的指针交互契约。

**验收要点**

1. 龙骨三写法核对：DOM 中 `#keel-verbose`、`#keel-compact`、`#keel-relative` 的 getTotalLength() 两两之差 < 0.5，PNG 中三者所在区域只见一根合并型线；`#keel-drift` 在第二段之后整体偏移 18，肉眼可辨为独立的橙色幽灵线。
2. 弧命令卡：构件卡① 中同一对端点之间存在 4 条 path，其 d 的标志位分别为 `0 0`、`0 1`、`1 0`、`1 1`，四条曲线互不重合且两两成对属于两个候选椭圆；构件卡② 中 `A1 1 0 0 1` 那条弧的渲染包围盒高度为 50±1，即半径被放大到 50。
3. 反射控制点：默认预选段与指针命中段的 `#control-net` 中至少含 1 条控制多边形 polyline、2 个实心方块控制点与 1 个空心圆反射控制点；把指针移到 `#sheer` 的 S 段时，空心圆与前一段末控制点关于公共端点严格中心对称（坐标之和的一半等于端点坐标，误差 < 0.5）。
4. 绝对/相对并排：读数条同时存在以 `绝对  C` 开头与以 `相对  c` 开头的两行文本，且相对行的每对数值等于绝对行对应数值减去当前点坐标；验证小窗内由两串分别构建的 path 完全重合，标注 Δ=0。
5. 零长子路径与 pathLength：构件卡④ 的 round 行出现 6 个圆点、square 行出现 6 个方块，butt 行对应像素带在 PNG 中 alpha 全为 0；构件卡⑥ 的两条长度不同的曲线各自呈现恰好 4 段等长实线。
6. 矩阵台：三面断面拼成闭合的轴测分段箱且共边无缝；`#iso-check-a` 与 `#iso-check-b` 的 getScreenCTM() 六个分量逐项之差 < 1e-6；左舷组的 transform 为 `matrix(-1 0 0 1 2290 0)`，其标签在 PNG 中为反写。
7. 绝对单位：六根标尺的右端 x 在 PNG 中对齐（差 ≤ 1px），DOM 中 width 属性分别为 96px / 1in / 2.54cm / 25.4mm / 72pt / 6pc；嵌套 viewBox 内的 1in 尺渲染宽度明显不等于 96px。
8. 交互与静帧：无任何点击、仅两次 pointermove 后 `window.__INTERACTION_COUNT__` 增大；指针状态点在型内为绿、型外为红且读数条文字随之切换；SMIL 被 pauseAnimations()+setCurrentTime(2.4) 冻结后 `#dwl` 仍位于两条常驻虚线端态之间，截图透明像素 ≥ 8%。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- CSS `d` 属性（css:d-property / css:d-property-transition）到 2026 年仍只有 Chrome 与 Safari 实现，Firefox 不支持，因此 `#rabbet-line` 先用 `CSS.supports('d','path(\"M0 0\")')` 探测，失败时由 JS 把同一字串写回 d 属性（几何照常出现，只是没有过渡），并在构件卡上盖「attribute fallback」戳，使降级本身也是可读的展示。CSS 几何属性（r/width/cx/cy…）同样是 Chrome/Safari 完整、Firefox 支持不全，压铁与样板用 `CSS.supports('r','10px')` 探测后回退为写属性 + requestAnimationFrame 手工补间，`--duck-r` 自定义属性在回退路径下改由 getComputedStyle 读出再赋值。`SVGPathElement.getPathData()` 仅 Chrome/Safari 提供，Firefox 缺失，故所有段信息以构建期生成的 `data-seg` 表为准，getPathData 只作可用时的交叉校验；`pathSegList` 已从三家引擎全部移除，场景中只以划掉的历史条目出现，绝不调用。`stroke-linejoin` 的 `miter-clip` 与 `arcs` 只有 Firefox 实现，样板上明确标注「Firefox only」，其余引擎按规范回退为 miter，回退结果本身即卡片说明的一部分。SMIL 的 `animate attributeName=\"d\"` 三家均可用，但 Chrome 曾在同一元素上混用 CSS `d` 与 SMIL `d` 时出现优先级抖动，故形变只作用于不写 CSS d 的 `#dwl`；截图时统一 `pauseAnimations()` + `setCurrentTime(2.4)` 取确定中间帧，Safari 对 setCurrentTime 后的首帧偶有一帧延迟，捕获前额外等一帧 rAF。`isPointInFill`/`isPointInStroke` 三家都有，但 Safari 对含 dasharray 的描边命中判定与其他引擎不一致，命中测试因此只对实线的 `#hull-shell` 进行。绝对单位在 96dpi 下三家换算一致，Safari 历史上对属性中的 `pc` 解析有偏差，该行同时标出 `= 96px` 的等价值以便肉眼核对。截图环境禁网，等宽标注字体以 data URI 的 `@font-face` 内嵌（失败时回退到通用 monospace，仅影响字距不影响几何），场景中不引用任何外部图像。

### 3.4 `guilloche-intaglio-plate` — 玫瑰线雕版

- **用途 / 家族**：security engraving / security printing
- **复杂度**：expert　**标签**：`guilloche`, `intaglio`, `hairline`, `non-scaling-stroke`, `paint-order`, `transform-order`, `ctm`, `security-printing`
- **设计问题**：上千根发丝细纹如何叠成一幅可读的雕版，而不是一团摩尔纹？

**场景**　一块尚未上机的钞券雕版摊在台面上，版身被透视微微翻起，右缘比左缘略大，底下压出三层纸厚。版心是四个玫瑰线参数族——两族外摆线、两族内摆线——按棕、绿、棕三次走版交错叠印，交叉处谁压谁只由走版先后与 stroke-opacity 决定，没有任何遮罩。曲线自身的内空被一次各向异性缩放拉成横椭圆开窗，窗里坐着一朵 24 瓣团花：左右两半用不同的 paint-order 走刀，一半被自己的描边吃掉瓣宽，一半墨色完整压在描边之上。版框内侧是四条行距从 6.0px 收到 1.7px 的底纹带，版底一条试印条把同一段样纹按 0.25× 到 4× 排开——上排的笔画随 CTM 忽粗忽细、忽隐忽显，下排加了 non-scaling-stroke 的笔画六个倍率完全一致：密度一直在变，线粗一根没变。防伪的干涉纹因此只由几何产生，不由笔画产生。指针停在团花或窗环任一环上，版右读出面板就报出那一族的 R/r/d/N 与当前 CTM 的 sx/sy，而笔宽那一栏始终是 0.60。

**主打特性**

- `pr:paint-order` — paint-order
- `pv:vector-effect=non-scaling-stroke` — vector-effect: non-scaling-stroke
- `concept:stroke-scales-with-ctm` — Stroke width and dashes scale with the transform
- `concept:transform-list-composition-order` — Transform list composition order (right-to-left application)
- `concept:hairline-stroke-rendering` — Sub-device-pixel strokes and zero width under downscale
- `css:css-color-paint` — CSS Color syntaxes as paint (rgb/hsl, #rrggbbaa, oklch, lab, color())

**辅助特性**

`el:circle`、`el:ellipse`、`av:ellipse.rx=auto`、`pr:fill`、`pr:stroke`、`pv:fill=none`、`pv:fill=currentColor`、`pr:color`、`pr:fill-opacity`、`pr:stroke-opacity`、`pr:opacity`、`pr:stroke-dasharray`、`pr:stroke-dashoffset`、`pr:transform`、`pr:rotate`、`pr:transform-origin`、`pr:transform-box`、`css:3d-transforms`、`pv:transform=translate`、`pv:transform=scale`、`concept:nested-group-ctm-accumulation`、`css:transform-cascade-precedence`、`css:individual-transform-properties`、`css:transform-transition-animation`、`at:circle.r`、`concept:radius-percentage-normalized-diagonal`、`at:ellipse.rx`、`at:ellipse.ry`、`pv:stroke=none`、`pv:fill=rgba()`、`pv:fill=color-mix()`、`concept:stroke-over-fill-transparency`、`concept:opacity-zero-still-hit-testable`、`concept:odd-dash-repetition`、`concept:dotted-line-round-caps`、`concept:marching-ants`、`pv:paint-order=stroke`、`concept:inner-outer-stroke-simulation`、`concept:stroke-width-under-nonuniform-scale`、`concept:non-uniform-scale-stroke-distortion`、`concept:transform-attribute-css-syntax`、`concept:invalid-transform-attribute-ignored`、`pv:transform-box=view-box`、`pv:transform-box=fill-box`、`pv:transform-box=stroke-box`、`concept:scale-about-point`、`concept:currentcolor-icon-theming`、`pr:perspective`、`api:SVGGraphicsElement.getScreenCTM`

**构造要点**

1. 版面坐标：根 `<svg viewBox="0 0 1400 900">`，不铺任何底色矩形以保留透明台面。版框 `<rect x="44" y="32" width="1312" height="836" rx="10">` 只描边不填充；纸厚由版框轮廓向下偏移 +4/+8/+12 的三条窄边带伪造，`fill="#3b3226" fill-opacity="0.5" stroke="none"`，垫在全部墨层之下。内容区 x 96..1304、y 84..816，其中顶条 y 92..252、版心 y 252..700、底条 y 712..816、左校样柱 x 96..244、右读出栏 x 998..1304。
2. 曲线发生器：内摆线 x=(R−r)cos t + d·cos(((R−r)/r)t)，y=(R−r)sin t − d·sin(((R−r)/r)t)；外摆线 x=(R+r)cos t − d·cos(((R+r)/r)t)，y=(R+r)sin t − d·sin(((R+r)/r)t)。t 在 [0, 2π·r/gcd(R,r)] 上取 288 点，输出 `M`+`L` 折线、坐标两位小数。一个「族」= 同一 (R,r,d) 下 N 条按 360°/N 递增相位的曲线，N 条全部拼进同一个 `<path>` 的多段子路径，因此四族只用 4 个元素承载约 280 条曲线，全版连底纹带共约 1300 条发丝子路径。
3. 四个族与三次走版：E-7（外摆 R=210 r=30 d=64 N=72，7 瓣，外环）、H-11（内摆 R=176 r=16 d=52 N=96，11 瓣，中环）、H-19（内摆 R=133 r=7 d=34 N=64，19 瓣，内环）、E-5（外摆 R=115 r=23 d=40 N=48，5 瓣，窗环）。E-7+H-19 归棕版，H-11+E-5 归绿版，DOM 顺序为 `#pass-brown-1` → `#pass-green` → `#pass-brown-2`（棕版加光细纹）。交叉处谁压谁完全由这个先后顺序加 `stroke-opacity="0.5"` 的多次 alpha 叠加决定，不用任何 mask/clipPath。
4. 分色与油墨配方：`#pass-brown-1,#pass-brown-2 { color: oklch(0.46 0.07 68) }`、`#pass-green { color: lab(42% -22 14) }`，族内所有 `<path>` 一律 `stroke="currentColor" fill="none"`，改一行 `color` 就换一套色版；`#pass-green` 内团花二次走版嵌一层 `<g style="color: color-mix(in oklab, lab(42% -22 14) 70%, #d8cfae)">` 覆盖出浅调。右上「油墨配方」条排 6 枚发丝描边样块，分别填 `hsl(38 34% 34%)`、`#5c4a2aee`、`rgba(92,74,42,.72)`、`oklch(0.46 0.07 68)`、`lab(42% -22 14)`、`color(display-p3 0.13 0.35 0.24)`，每枚旁刻其语法与 sRGB 回退值。版号钤记不写 `color`，直接继承 HTML `<main>` 的 `color`。
5. 版心主体：`#field` 承载四族并置于 (620,478)，样式 `transform: rotate(-3.2deg) scale(1.18, 0.72); transform-box: fill-box; transform-origin: center;`。各向异性缩放把玫瑰线天然的圆形内空拉成 rx≈200 ry≈132 的横椭圆开窗，同时把纵向线距压掉 28%——密度大变；每条 `<path>` 带 `stroke-width="0.6"` + `vector-effect="non-scaling-stroke"`，笔宽被钉死在 0.6 设备像素——线粗不变。`#field` 同时保留 `transform="translate(0 0)"` 属性，示意 CSS 规则胜出。
6. 开窗环双 keyline 对照：外圈是画在 `#field` 之外的真 `<ellipse cx="620" cy="478" rx="200" ry="132">`，笔宽沿周长恒定；内圈是画在 `#field` 之内、半径 170 的 `<circle>` 且刻意不加 vector-effect，被 scale(1.18,0.72) 之后左右两侧描边约 1.18px、上下约 0.72px，粗细起伏肉眼可辨。两条线用 0.4px 引线刻「真椭圆 / 被缩放的圆」。
7. 团花：`rx="150" ry="99"` 范围内 24 枚花瓣缎带，每枚 `fill="currentColor" fill-opacity="0.4"`、`stroke="currentColor" stroke-width="6" stroke-opacity="0.55"`，底下密纹透过 0.4 墨韵仍可读。花瓣 0–11 放进 `paint-order: normal` 组，12–23 放进 `paint-order: stroke fill markers` 组：右半瓣型完整、外缘干净（等效外描边），左半被自身描边吃掉一半瓣宽并在内侧留下描边乘填充的深色带。一条 `stroke-width="14" stroke-opacity="0.35"` 的保护线横切团花，其内半边明显给花瓣填充上色。团花中心用 `<circle cx="620" cy="478" r="6%">` 做导圆，版边刻其解析值 70.6px（按归一化对角线 √((1400²+900²)/2)=1176.9）。
8. 命中与读出：团花与窗环共 6 条同心 `<ellipse class="hit" opacity="0" fill="currentColor">`，按由外到内排列使最内圈位于最上层——`opacity:0` 不影响命中测试。每条与其可见 `<path class="ink">` 同处一个 `<g class="ring" data-family data-params>`，`.ring:hover .ink { scale: 1.02 }` + `transition: scale .3s ease`。`pointermove` 时用 `event.target.closest('[data-family]')` 决定读出内容并 `window.__INTERACTION_COUNT__++`。面板打印该族 R/r/d/N，以及 `ring.getScreenCTM()` 的 a/b/c/d、导出的 sx=√(a²+b²)、sy=√(c²+d²)，再用 `getBoundingClientRect().width / getBBox().width` 做交叉校验，末行恒为「笔宽 0.60 设备像素」。截图先于鼠标移动，所以必须在 `__VIS_READY__` 之前用默认族 H-11 预置一次面板。
9. 底纹带：版框内 40px 宽的环带切成四条子带（宽 12/10/9/9），行距 6.0 / 4.0 / 2.6 / 1.7px，`stroke-dasharray` 依次为 `none`、`10 2`、`20 5 5 5`、`7`（奇数项列表按规范重复一遍才闭合，相邻两周期墨与空互换，二倍周期肉眼可见）。最内子带的 1.7px 行距只有笔宽的 2.8 倍，是全版最接近糊版的地方，靠 non-scaling-stroke 才不塌成实色块。一条横贯全版的「安全线」用 `stroke-dasharray="18 10"` 加 `@keyframes` 推动 `stroke-dashoffset` 做行军蚁。
10. 试印条（x 100..800）：取 H-11 族 90×40 的片段作样纹 S-1。A 行 y=736 排出 0.25 / 0.5 / 1 / 2 / 4 五个倍率与一块 `scale(2 0.5)`，各用单参数 `translate(tx)` 放置（y 不变），`stroke-width="0.6"` 不加 vector-effect；B 行 y=790 完全相同但每条加 `vector-effect="non-scaling-stroke"`。A 行 0.25× 的 0.15px 笔画淡到几近消失、4× 变成 2.4px 粗线且虚线节距被拉长四倍、`scale(2 0.5)` 块横粗竖细；B 行六块笔宽与虚线节距完全一致，只有密度变化。两行行尾各加一块 `stroke-width="0"` 的空样，两行都彻底消失。4× 样块用 `translate(cx cy) scale(4) translate(-cx -cy)` 绕自身中心放大以留在基线上，旁边用 0.3px 虚线画出裸 `scale(4)` 会飞出去的鬼影框。
11. 轮位对照（x 336..620，y 100..206）：同一锚点 `<circle r="3">` 出发的两枚小玫瑰线，分别写 `transform="translate(210 0) rotate(24)"` 与 `transform="rotate(24) translate(210 0)"`，右到左的求值顺序让两个落点相距约 130px；虚线引线从锚点连到两个落点，版边刻「先移后转 / 先转后移」。第三枚参考件把属性写成 CSS 语法 `transform="rotate(24deg)"` 作为 SVG2 语法样品单独标注。
12. 转轮联动图（x 100..320）：`<g transform="rotate(15) translate(74 0)">` 四层嵌套模拟摆线机齿轮链，CTM 累积到 60°，末端 `<circle r="4">` 是刻刀销；卡盘与节圆由若干 `cx/cy/r` 圆构成。最外层用 `@keyframes` 连续旋转（`css:transform-transition-animation`），销尖轨迹用 `stroke-dasharray="0 4" stroke-linecap="round"` 的圆点线预先画出，那条轨迹正是主版 H-11 族中的一条曲线，把机构图与算法钉在一起。
13. 轮位试块（x 820..1010）：三块外形相同的小密纹块，都只写 `rotate: 12deg`。第一块用 SVG 默认原点（用户坐标 0,0）→ 沿半径约 270 的圆弧甩到别处，虚线画出该圆弧；第二块 `transform-box: fill-box; transform-origin: center` → 原地自转；第三块 `transform-box: stroke-box; transform-origin: center`，块内含一根偏置的 24px 粗刻痕，使描边包围盒中心比填充包围盒中心偏约 12px，旋转结果与第二块错开可见位移。
14. 套准十字与废样：套准十字（x 1030..1160）写 `transform="translate(120 0)"` 属性、同时被 `.reg { transform: none }` 覆盖（表现属性特异性为 0），实心十字停在未平移处，其属性位置画一枚 0.4px 虚线鬼影十字并连引线。左校样柱（x 96..244）自上而下放：`r=6%` 百分比半径导圆与解析值标注；三枚 44px 废样——`fill="none"` 的正样、误设 `fill="#6b5a33"` 被自交玫瑰线填成一团墨块的实心废样、`transform="rotate(24,)"` 语法错废样（整条属性被忽略、按未变换位置渲染）；再下面是省略 rx 的 `<ellipse cy="…" ry="40">` auto 半径校验环与其点线参照 `<circle r="40">`；柱底是 rx=26 / ry=74 的窄高「墨槽」椭圆图标。
15. 摩尔纹对照（右栏 y 600..694）：两块 120×94 的同源密纹，各 24 条 H-19 曲线。A 块每条线 `stroke-opacity="0.5"` 逐线合成，交叉点因多次 alpha 叠加而更深，编织的上下关系读得出来；B 块每条线不透明、整组 `<g opacity="0.5">`，交叉点与线条同亮度、整片均匀发灰，密纹立刻塌成摩尔纹——这是本版设计问题的直接答案，也是全版为什么不用组不透明度的理由。
16. 立体与静帧：`#plate { transform: perspective(2400px) rotateX(6deg) rotateY(-8deg); transform-box: view-box; transform-origin: 700px 450px }` 让整版微微翻起，右缘略大、左缘收缩，配合下垫的三层纸厚边带读出纸张厚度（SVG 内无 3D 渲染上下文，子元素被拍平，厚度只能这样伪造）。团花用两条互不相干的 `@keyframes` 分别驱动 `rotate`（40s 线性）与 `scale`（11s 往复），不合成 transform 列表；四角花角用 `rotate: -6deg; scale: 1.12; translate: 4px 0` 三个独立属性定位。`?export=1` 时在 `__VIS_READY__` 之前给根元素打 `data-still`，`:root[data-still] * { animation-play-state: paused !important }`，各动画配负 `animation-delay`（团花 −7.5s、联动图 −4.2s、安全线 −1.8s）把冻结姿态钉在设计好的位置。

**验收要点**

1. 试印条 B 行六个倍率样块在 PNG 上量得的笔画宽度一致（约 0.6 设备像素，彼此差 <0.2px）；A 行 0.25× 样块的平均 alpha 低于 B 行同块的 1/3，4× 样块笔画明显加粗且虚线节距约为 1× 样块的四倍。DOM 中 B 行每条 path 的 `vector-effect` 计算值为 `non-scaling-stroke`，A 行为 `none`。
2. 开窗处真 `<ellipse>` 的描边在四个方位粗细一致；紧邻的被 `scale(1.18,0.72)` 的 `<circle>` keyline 在左右两侧的描边宽度至少是上下两侧的 1.5 倍，可在 PNG 上直接量出。
3. 团花右半（`paint-order: stroke fill markers`）花瓣的可见瓣宽明显大于左半，且外缘无描边侵蚀；左半瓣内侧存在一条描边与 0.4 填充相乘产生的深色带。DOM 中两个花瓣组的 `paint-order` 计算值不同。
4. 轮位对照的两枚卫星玫瑰线自同一锚点出发落在不同位置，中心距 ≥ 120px；DOM 中两组的 `transform` 属性分别为 `translate(210 0) rotate(24)` 与 `rotate(24) translate(210 0)`。
5. 套准十字的实心十字位于未平移处，与其虚线鬼影相距约 120px；DOM 中该元素同时存在 `transform="translate(120 0)"` 属性与计算值为 `none` 的 CSS transform。
6. 静帧（截图先于任何指针事件）中右栏读出面板已显示默认族 H-11 的 R/r/d/N 与 sx/sy，且 sx≠1（受 `#field` 的 scale 与整版 3D 微倾影响），末行为「笔宽 0.60 设备像素」。指针移入团花后 `window.__INTERACTION_COUNT__` 增加，且面板族名从 H-11 变为被命中环的族名。
7. 底纹带最内子带（行距 1.7px）在 PNG 中仍呈交替的着墨列与透明列，不是一块实色；四条子带的虚线节奏各不相同，其中 `stroke-dasharray="7"` 那条呈现二倍周期的墨/空互换。
8. 摩尔纹对照 A 块的交叉点像素比其线条本身更暗（多次 alpha 叠加），B 块的交叉点与线条亮度一致；全图透明像素 ≥ 8%、可见像素 ≥ 3.5%、彩色像素 > 2500。

**实现复审**

- rx="auto" 属性被 Chrome 152 拒绝；改用 style="rx:auto"，以几何宽高相等验证效果。覆盖门禁接受同一几何属性的 DOM style 值。
- 原验收 #4 的数值不自洽：相同锚点上交换 translate(210 0) 与 rotate(24) 的位移差为 2×210×sin(12°)≈87.3，无法同时要求 ≥120；原文保留待修订。

**浏览器注意**

- 「av:ellipse.rx=auto」：Chrome/Firefox 把省略的 rx 当作 auto 并回退为 ry 的圆，Safari/WebKit 至今把缺失或 auto 的半径当作不渲染，那枚校验环在 Safari 上会整个消失——因此旁边固定画一枚点线 `<circle r=\"40\">` 参照与刻字说明，两种结果都读得通，且该环不进入验收断言。「css:3d-transforms」：SVG 内部没有 3D 渲染上下文，`transform-style: preserve-3d` 在三家引擎里都被忽略、子元素一律拍平，所以纸张厚度只能用三条偏移边带伪造而不是真挤出；`perspective()`/`rotateX`/`rotateY` 只加在最外层 `#plate` 上并把角度压到 6°/8°，避免 Safari 对内层 SVG 组拍平方式差异带来的错位，也避免倾斜跨版造成的笔宽差超过半个设备像素。「getScreenCTM 与 CSS transform」：各引擎对 CSS transform（尤其被拍平的 3D 分量）是否折进 `getScreenCTM()` 的处理并不一致，Firefox 的合成结果与 Chrome 有差；读出面板因此同时给出 `getBoundingClientRect().width / getBBox().width` 作为交叉校验，两个数值都打印出来而不假装只有一个真值。「vector-effect」：只有 `non-scaling-stroke` 被三家普遍实现，`non-scaling-size`、`non-rotation`、`fixed-position` 仍是 Firefox 独有或未实现，本版一概不用。「transform 属性的 CSS 语法」：`transform=\"rotate(24deg)\"` 这类 SVG2 写法 2026 年三家都能解析，但所有承重定位仍用无单位的传统语法，带单位的写法只出现在一枚单独标注的样品件上。「无效 transform 属性」：SVG 1.1 规定文档进入错误状态，实际上三家引擎都只是忽略该属性、按未变换位置渲染；这块废样只作说明，不写进验收断言。「CSS 颜色」：`oklch()`/`lab()`/`color(display-p3 …)`/`color-mix()` 自 2023 年起三家都支持，但 headless Chrome 的 PNG 输出是 sRGB，display-p3 的广色域样块会被截到 sRGB 边界，所以每枚样块都并排刻出其 sRGB 回退值，静帧里仍能读出配方差异。「发丝描边」：亚设备像素描边的抗锯齿策略各家不同——Chrome 按覆盖率淡出，Safari 倾向于钳到一条最小可见线，Firefox 介于两者之间；试印条 A 行的 0.25× 样块因此只作「明显更淡」的相对断言，不断言绝对灰度。「个别 transform 属性」：`rotate`/`scale`/`translate` 三个独立属性在 SVG 元素上三家自 2022–2023 年起可用，但 Safari 对百分比原点需要显式写 `transform-box: fill-box`，本版所有相关元素都显式声明。全版不使用 SMIL，动画全部走 CSS `@keyframes`，静帧靠 `data-still` + `animation-play-state: paused` 与负 `animation-delay` 冻结在设计姿态。字体只用系统通用族栈（等宽 + 无衬线回退），不加载任何外部字体，符合断网抓图约束。

### 3.5 `auroral-spectrograph` — 极光分光台

- **用途 / 家族**：scientific instrument panel / atmospheric optics / spectroscopy
- **复杂度**：expert　**标签**：`gradient`, `paint-server`, `smil`, `stops`, `spectroscopy`, `aurora`, `conic-emulation`
- **设计问题**：只用 gradient 的 stop，能把一片连续光场推到多远？

**场景**　上半幅是一整面夜空极光幕：44 条折叠光帘从地平辉光垂到天顶，全部由同一份母版 stop 铺出——短向量配 spreadMethod="reflect" 让褶皱镜像成无缝的绿氧-红氮起伏，斜置的 gradientTransform 让每条帘的色轴顺着折角走，帘顶靠 stop-opacity 溶进透明夜空。下半幅是同一时刻的读数台：一条由 64 片百叶拼成的主谱带共用一条 userSpaceOnUse 的横贯渐变，于是彼此分离的元素拼出连续色散，紧贴其下的 objectBoundingBox 孪生条让每片各自跑完整个色阶作反例；左侧「光栅标定卡」把向量四态、pad/repeat/reflect 三态与 offset 的写法差异排成样条，中间是透过率与赋色对照，右侧八颗标定球分别用 fx/fy、fr、cx/cy 与径向 reflect 做出偏心高光、实心光阑、偏心环与法布里–珀罗干涉环，最右是 96 段线性渐变切片拼出的角向色轮。最难忘的机制是一处改动、整幅呼吸：幕布、脊线、色轮楔与谱线编号文字都只写 href="#auroraStops"，SMIL 只推动母版的 stop 偏移与颜色，于是极光起伏、色轮转色、谱带读数位移同时发生，而画面上没有任何一块位图。

**主打特性**

- `at:radialGradient.fx` — Focal point fx/fy
- `at:radialGradient.fr` — Focal radius fr
- `av:linearGradient.spreadMethod=reflect` — spreadMethod reflect
- `at:linearGradient.href` — href inheritance between gradients
- `concept:conic-gradient-emulation` — Conic/angular gradient emulation
- `concept:smil-animated-stops` — SMIL animation of stop offset and colour

**辅助特性**

`pv:fill=url()`、`concept:paint-server-fallback`、`el:linearGradient`、`at:linearGradient.x1`、`av:linearGradient.gradientUnits=userSpaceOnUse`、`av:linearGradient.gradientUnits=objectBoundingBox`、`at:linearGradient.gradientTransform`、`av:linearGradient.spreadMethod=repeat`、`av:linearGradient.spreadMethod=pad`、`concept:zero-length-gradient-vector`、`el:radialGradient`、`at:radialGradient.cx`、`av:radialGradient.spreadMethod=reflect`、`av:radialGradient.spreadMethod=repeat`、`concept:focal-point-outside-circle`、`el:stop`、`at:stop.offset`、`concept:hard-stop-banding`、`concept:stop-offset-clamping`、`pr:stop-color`、`pv:stop-color=currentcolor`、`pr:stop-opacity`、`concept:premultiplied-transparent-stop`、`css:gradient-stop-selectors`、`css:custom-properties-in-gradients`、`concept:animated-gradient-vector`、`concept:gradient-on-stroke`、`concept:gradient-on-text`、`concept:text-gradient-fill`、`at:animate.values`、`concept:animate-color`、`concept:animate-gradient-stop`、`api:SVGStopElement.offset`、`api:SVGRadialGradientElement.fx`

**构造要点**

1. 舞台：<svg id="stage" viewBox="0 0 1400 900"> 全透明，只画一块 rect x=40 y=40 w=1320 h=820 rx=22 的仪器底板（fill=url(#deckPlate)，竖直 linearGradient #0a1626→#060b14），四周 40px 与四个圆角保持 alpha=0，使截图透明像素稳定在 14% 以上（capture.mjs 要求 ≥8%）。y=470 一条 1px 分度线把夜空幕与读数台分开：sky 40–470，deck 470–860。
2. 母版 #auroraStops 是全图唯一一处 stop 定义：<linearGradient id="auroraStops" x1="0" y1="1" x2="0" y2="0"> 内 7 个 <stop>——0% #071018/op 0、12% #3fe08a/.85、34% #5cffb1/.95（557.7nm 绿氧）、52% #35d6c9/.80、70% #6f7dff/.60（427.8nm 蓝紫氮离子）、86% #ff5f7e/.45（630.0nm 红氮）、100% #ff2f6d/op 0。其余所有渐变都不写 stop，只写 href="#auroraStops"（并保留 xlink:href 兼容属性），各自补自己的向量、spreadMethod 与 gradientTransform。
3. 极光幕：TS 生成 44 条幕带，第 i 条基线 x0=100+i*28+6*sin(1.7i)，上下端 y 84→466，宽 22–56，左右边缘各由 3 段 cubic 折出 x(t)=x0+A_i*sin(2πk_i t+φ_i)（A_i∈[14,46]，k_i∈[1.2,2.4]）。按四族分派向量：A 族不写向量，直接继承母版竖直向量；B 族（18 条，主角）x1=.42 x2=.58 + spreadMethod="reflect"，短向量被镜像成整幅无缝的绿-红-绿褶皱；C 族对角向量 (0,0)→(1,1) 且 gradientTransform="rotate(θ_i,.5,.5)"，θ_i 取该带中点的折叠切角，形状本身不做任何 transform；D 族 x2="50%" 保持默认 pad，后半幅露出平台色。
4. 第 37 条幕带故意写成 x1=x2、y1=y2 的零长向量，按规范渲染成最后一个 stop 的纯色，旁边 10px 注记「零色散：光栅失调」；它与相邻 D 族的 pad 平台并排，说明「平台」与「退化」是两回事。
5. 幕脊线：每条幕带中轴再叠一条 fill="none"、stroke="url(#crestRamp)"、stroke-width 3–5、stroke-linecap="round" 的开放路径，#crestRamp 只有 href 与自己的横向向量。左下 (96,430) 处另放一条放大到 stroke-width=14 的孤立脊线并引线注记：objectBoundingBox 不含描边宽度，故两端出现首末 stop 的 pad 平台。
6. SMIL 全部只挂在母版 stop 上：第 2/4/6 个 stop 各一条 <animate attributeName="offset" values="…5 个关键帧…" dur="9s|11s|13s" calcMode="linear" repeatCount="indefinite">，第 2 个 stop 另加 <animate attributeName="stop-color" values="#3fe08a;#5cffb1;seagreen;#3fe08a" dur="17s" repeatCount="indefinite">（hex 与 named 混用）。因为 44 条幕带、脊线、色轮楔与文字渐变都 href 母版，整片极光、色轮与标题同相位呼吸。
7. 读数游标：谱带上方 (x 72–1328, y 470–486) 的一组「Δλ」刻度文字加倒三角游标，用 <animateTransform attributeName="transform" type="translate" values="0 0;34 0;12 0;48 0;0 0" dur="9s" repeatCount="indefinite">，dur 与母版第 2 个 stop 同步，于是幕布起伏时读数同步位移。
8. 主谱带：y 486–556（基线 556 向上生长），x 72–1328，64 片 rect（宽 18.0，缝 1.6），高度=合成极光发射谱强度（427.8/557.7/630.0nm 三处峰＋连续本底）。64 片全部 fill="url(#dispersionUS)"，该渐变 gradientUnits="userSpaceOnUse" x1="72" y1="0" x2="1328" y2="0"，于是 64 个独立元素各取一段、拼成一条连续色散；紧贴其下 y 562–580 的孪生窄条用同一批矩形但 fill 指向 objectBoundingBox 版本 #dispersionBB，每片各自跑完整个色阶，形成刺眼对照。
9. 扫描高光 #sweep 是全图唯一自带 stop 的线性渐变（透明→白 .35→透明），覆在主谱带上，靠 <animateTransform attributeName="gradientTransform" type="translate" values="-420 0;1400 0" dur="6s" repeatCount="indefinite"> 横扫；同时它的中间 stop 上并挂 <animate attributeName="offset" values="0.38;0.62;0.38"> 与 <animate attributeName="stop-color" values="#ffffff;#bff5ff;#ffffff">，几何与 stop 两条动画叠在一处。
10. 光栅标定卡（C1，x 72–436，两列各 7 条 176×18 样条，行距 30，首行 y=626）：左列演示向量——水平、竖直、对角、x2="50%"（pad 平台）、零长向量复刻、gradientTransform="skewX(24)"，每条上方画出 x1→x2 的箭头与 pad 区网点阴影；右列演示铺展与 stop——spreadMethod repeat（短向量 x2=.08，12 段锯齿硬边）、reflect（同向量，镜像无缝）、pad、offset="0.5" 与 offset="50%" 的等效孪生、两 stop 同 offset 的硬边（滤光片 cut-on）、以及一条把 offset 写成 -0.2/1.3 且逆序 0.9→0.6 的样条，渲染出被夹紧与被强制单调后的意外硬边并注记。
11. 滤光片槽位（fallback）：波长轴行右端 (1268,584) 与 (1310,584) 两个 26×26 方块，都带 stroke="#5b6b82" stroke-dasharray="3 3" 的虚线框；A 槽 fill="url(#slot-missing) #f2a154" 渲染成橙色，B 槽 fill="url(#slot-missing)" 完全不上色只剩虚线框，标签写「备用色 / 空载」。
12. 透过率与赋色面板（C2，x 456–700）：顶部手绘 16×3 的 14px 检验格（#16233a/#233553 交替），其上覆 rect fill="url(#transRamp)"，该渐变 stop-opacity 由 1 线性降到 0，格子逐格透出；下方两条 60×14 孪生条一条渐隐到 black/op 0、一条渐隐到同色相/op 0，验证 SVG 的预乘插值使二者无灰边差异。再往下四条 120×14：stop-color 属性、style="stop-color:…" 内联、<style> 里的 .ox-line 类、以及 stop-color="currentColor"（由祖先 <g color="#5cffb1"> 决定），四条必须一模一样；最后一条 #nightRamp 的 stop 不带任何属性，全靠 <style> 中 #nightRamp stop:nth-child(1..5) 与 var(--line-o1)/--line-n1 上色，根 <g class="theme-night"> 换成 .theme-red 即整条改主题（截图取 theme-night，DOM 内保留另一套类以便验证）。
13. 标定球阵（C3，x 720–1006，r=30，四列 x=766/836/906/976，两行 cy=700/800，每球下方 10px 标签写决定性属性）：①#calBase cx=.5 cy=.5 r=.5 基准明心暗缘；②#calGloss fx=.34 fy=.30，高光偏左上而外缘仍是正圆；③#calAperture fr=.34，先是一块实心内盘再开始过渡（光阑）；④#calFr0 与③逐字相同但 fr=0 作孪生；⑤#calOffset cx=.18 cy=.18 r=.25，环偏心且 pad 色铺满其余；⑥#calEtalon spreadMethod="reflect"+fx=.38，镜像同心环向焦点方向变扁成法布里–珀罗干涉环；⑦#calEtalonRepeat 同参数改 repeat，环间出现硬边；⑧#calFlare fx=.95 fy=.05 焦点抵到圆周之外，高光被拉成彗尾。
14. 角向色轮（C4，中心 (1188,738)，内 r=44 外 r=110，均半径 77）：生成 96 个楔形 path，每楔 3.667°（总跨 352°，正上方留 8° 缺口作零级基准），相邻楔重叠 0.35° 消抗锯齿缝。第 k 楔 fill="url(#wedge-k)"，#wedge-k 仍然只写 href="#auroraStops"，另设 gradientUnits="userSpaceOnUse"，方向 u 取该楔角平分线的切向，向量起点 = 楔心 − (k+0.5)·S·u、长度 = 96·S（S=2π·77/96≈5.04px）——即让每个楔恰好落在同一条长渐变的第 k 个切片上，相邻楔的边界色天然相等，96 段线性拼出锥形近似；映射时把切片压在 offset 0.03–0.97 内避开母版两端的透明 stop。轮毂是 fr=.55 的径向渐变，轮缘每 30° 一条刻度与角度数字。因为楔也 href 母版，SMIL 推 stop 时色轮与极光同步转色。
15. 文字：主标题 <text x="88" y="118" font-size="42" fill="url(#titleRamp)">AURORAL SPECTROGRAPH</text>，#titleRamp href 母版并给横向向量，彩虹跨整段字面；波长轴三个编号 427.8 / 557.7 / 630.0 用 fill="url(#labelRamp)"，其中 630.0 写成 <text fill="url(#labelRamp)"><tspan>630</tspan><tspan>.0</tspan></text> 证明 bbox 仍按整个 text 元素算（两段颜色连续而非各自重跑）；每个编号右侧再引一条 stroke="url(#labelRamp)" 的细线指向谱带对应峰。
16. 交互与静帧：在 #stage 上挂 pointermove——指针 x 映射到 [-0.12,+0.12] 的偏移增量并用 stop.offset.baseVal.value 写回母版第 2/4/6 个 stop，指针 y 映射到 #calGloss 的 fx/fy（SVGRadialGradientElement.fx.baseVal.value），首个 pointermove 先调用 svg.pauseAnimations() 以免 SMIL 覆盖 DOM 基值、pointerleave 时 unpauseAnimations() 并复位，每次移动 window.__INTERACTION_COUNT__++ 并刷新右上读数「Δλ +0.06 · f=(0.34,0.30)」。URL 带 export=1 时先 svg.pauseAnimations(); svg.setCurrentTime(4.2) 把 SMIL 冻在幕布最饱满、扫描高光位于谱带 2/3 处的相位，再经两帧 requestAnimationFrame 置 window.__VIS_READY__=true。全部文字用 <style> 内嵌 data URI 的窄体子集字体（仅数字、大写拉丁与少量汉字），场景中 <image>、CSS background-image 与位图滤镜数均为 0。

**验收要点**

1. DOM：44 条幕带渐变、96 个色轮楔渐变与 #crestRamp/#titleRamp/#labelRamp 的 childElementCount 全为 0 且 href 解析到 #auroraStops；#auroraStops 内 <stop> 数为 7；document.querySelectorAll('image').length===0。
2. PNG：沿 y=300 横扫 B 族幕带区间，绿-红峰对称镜像出现 ≥6 次且相邻像素通道差始终 <12/255（reflect 无缝）；标定卡 repeat 样条同排采样出现 ≥10 处 >60/255 的硬跳变。
3. PNG：③号球圆心 22px 半径内颜色标准差 <2（fr 实心内盘），④号 fr=0 孪生球同区域标准差 >25，且两球外缘直径相同。
4. PNG：②号光泽球最亮像素相对球心偏移 dx≤-8 且 dy≤-8，同时球外缘拟合圆的残差 <1px（焦点偏移不改变外缘形状）。
5. PNG：色轮沿 r=88 采样 352 点，色相单调推进且只跨越一次 0/360，相邻样本色相差 <6°、亮度无阶跃（96 段拼缝不可见），唯一断口是正上方 8° 零级缺口。
6. PNG：滤光片槽 A 内部为 #f2a154(±8) 而槽 B 内部 alpha=0，两者虚线框都完整可见。
7. PNG：主谱带在 x=200/700/1200 三列颜色随 x 单调推进，而正下方 objectBoundingBox 孪生条在同三列颜色互不相同且各自跨越整个色阶。
8. 动画与交互：export=1 下 svg.animationsPaused()===true 且 getCurrentTime()≈4.2，静帧仍可读；对比 setCurrentTime(0) 与 4.2 两帧，幕布区像素差异面积 >8%；派发 pointermove 到舞台 (0.54W,0.46H) 后 window.__INTERACTION_COUNT__≥1 且母版第 3 个 stop 的 offset.baseVal.value 相对初值改变 >0.02。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- 2026 年 Chrome/Safari 对 radialGradient 的 fr 都已稳定（Chrome 85+、Safari 14+），Firefox 落地较晚，需在目标版本实测：若 fr 被忽略会退化为 fr=0，所以把 fr 球与 fr=0 孪生球并排放置——退化时表现为两球变得一样而不是内容消失，注记文字直接点明这一点。fx/fy 越出圆周（⑧号球）三家都按规范夹到圆周附近，但夹取后的彗尾长度略有差异，验收只检查高光方向而不比对像素。最大的真实风险是 SMIL 经 href 继承的传播：把 animate 挂在母版 stop 上，Chrome 与 Safari 会让所有引用该母版的渐变实时跟随，Firefox 在部分版本里只在初次解析时取值；因此生成器提供 fallback 开关，检测到不跟随时由 TS 把等价的 animate 节点复制进每个子渐变（视觉一致，DOM 体积变大），验收项 1 只校验 href 与 stop 数，不依赖某一实现。animateTransform 作用于 gradientTransform 在 Safari 上历史上有过不重绘的问题，兜底是用 requestAnimationFrame 直接写 gradientTransform 属性（同一套关键帧，export=1 时按 t=4.2s 定值写入，静帧不受影响）。锥形近似的楔缝在 Safari 与 Firefox 的抗锯齿下最容易露白，故相邻楔重叠 0.35°；若目标版本仍有 1px 缝，可把楔数从 96 降到 72 并把重叠加到 0.6°。stop-color 里的 var() 与 currentColor、以及 stop-opacity 的预乘插值三家一致；spreadMethod 在 userSpaceOnUse 下的舍入差异会让 repeat 样条最后一段宽度差 1px，验收用跳变计数而非位置。截图侧：capture.mjs 阻断非 localhost/data: 请求，故字体只用 data URI；SMIL 在无头 Chromium 下时间不确定，必须靠场景自身的 pauseAnimations()+setCurrentTime(4.2) 冻结；prefers-reduced-motion 命中时直接走同一条冻结路径，画面与静帧完全相同。

### 3.6 `jacquard-loom-draft` — 提花纹版房

- **用途 / 家族**：textile drafting / weaving / textile drafting
- **复杂度**：expert　**标签**：`pattern`, `tiling`, `seams`, `weaving`, `filter`, `raster`
- **设计问题**：当一整幅织物纹样都由 pattern 平铺拼出时，平铺究竟在哪里露出破绽？

**场景**　一间靛蓝色的纹版房。左侧压着一张带「校样 · DRAFT」水印的校样纸，穿综图、穿筘图、组织图、踏板图排成四联格；四块图共用同一张 userSpaceOnUse 的方格底纹，格线跨面板逐列对齐，踏板图右侧挂着一条持续下送的纹版带。右上是同一块织物的足尺放大样：缎纹大块里再嵌细密的浮长排线，底层压着扫描亚麻的 data URI 平铺，两级平铺同框可读；其下是幅宽变形架，同一枚花样在 90/150/220 厘米三种幅宽里被包围盒单位逐步拉成横椭圆，右侧 userSpaceOnUse 对照仍是正圆。再右挂着一卷扫描纱线、一排纱线登记卡和几枚放大 20 倍的纹版孔精灵。台面下缘横着一把接缝检验尺：同一枚组织元件分别以用户空间平铺、包围盒比例平铺、以及滤镜 feImage(#元件) + feTile 三种方式并排放大，接缝错位、抗锯齿缝隙与噪声拼合的差别一目了然。指针在放大样上移动时，读数条报出当前经纬序号，三条车道同步把这同一根经纱移到各自的十字丝下。

**主打特性**

- `el:pattern` — pattern element
- `at:pattern.patternTransform` — patternTransform rotates/scales the tile grid
- `concept:nested-pattern` — Pattern content filled with another pattern
- `concept:pattern-seams` — Tile seams and anti-aliasing artifacts
- `el:feTile` — feTile repeating an input subregion
- `at:feTurbulence.stitchTiles` — stitchTiles seamless tiling
- `at:pattern.href` — Pattern href inheritance

**辅助特性**

`el:image`、`at:image.href`、`at:image.preserveAspectRatio`、`concept:image-data-uri`、`concept:image-nested-svg-document`、`pr:image-rendering`、`el:rect`、`at:rect.rx`、`at:pattern.width`、`av:pattern.patternUnits=userSpaceOnUse`、`av:pattern.patternContentUnits=objectBoundingBox`、`at:pattern.viewBox`、`concept:pattern-with-text`、`concept:pattern-with-image`、`concept:hatching-pattern`、`concept:animated-pattern`、`el:feImage`、`av:feImage.href=#element`、`concept:objectboundingbox-unit-skew`、`concept:xlink-href-legacy`、`av:image.preserveAspectRatio=none`、`pv:image-rendering=pixelated`、`at:image.decoding`、`api:SVGImageElement.decode`、`at:rect.ry`、`at:pattern.x`、`at:pattern.preserveAspectRatio`、`av:pattern.patternUnits=objectBoundingBox`、`av:pattern.patternContentUnits=userSpaceOnUse`、`concept:pattern-viewbox-overrides-contentunits`、`concept:pattern-overflow-visible`、`concept:pattern-with-use`、`concept:checkerboard-pattern`、`concept:cross-hatch-layering`、`concept:pattern-tile-rasterization`、`av:feTurbulence.stitchTiles=noStitch`、`at:feImage.href`、`concept:fetile-subregion-pattern`、`api:SVGPatternElement.patternTransform`

**构造要点**

1. 坐标与配色：舞台 viewBox="0 0 1400 900"，不铺整幅背景矩形以保留 alpha。靛蓝墨 #14243f、板蓝 #223f6d、纸 #ece4d2@.94、茜红 #b8433a、纹版金 #c8a24a。所有面板底纸是 rect + rx="10"，纹版卡是 rect rx="6"（只写 rx，ry 默认取 rx 得圆角），唯独角落一张「废版」写 rx="6" ry="2" 作椭圆角对照。
2. 校样纸 rect x=56 y=88 w=648 h=472 rx=10，其上覆一层 rect fill="url(#wmDraft)" opacity=".12"；#wmDraft 为 patternUnits="userSpaceOnUse" width="150" height="96" patternTransform="rotate(-30)"，tile 内是一行 <text>校样 · DRAFT</text> —— 水印整体倾斜而纸张保持水平，patternTransform 只作用于 tile 网格。
3. 四联格共用一张方格底纹 #grid8（patternUnits="userSpaceOnUse" width="8" height="8"，两条 0.5 宽细线）。面板 A(76,124,292,196)、B(392,124,292,196)、C(76,344,292,196)、D(392,344,292,196) 都填这一张 pattern；因为是用户空间平铺，A 与 C 的格线逐列对齐，用一条 y=124..540 的金色检验线压过去证明列位连续（若改成 objectBoundingBox 就会错开）。
4. A 穿综图：8 片综（行高 18）× 36 根经（列宽 8）。穿综点是 8×18 的 rect rx="1.6"；穿综序列由算法生成：shaft = ((i*3) mod 8)，i>24 段改为回穿 shaft = 7-((i*3) mod 8)，末端出现可见的破斜纹折返。
5. B 穿筘图（图案继承的教学位）：基版 <pattern id="dent" patternUnits="userSpaceOnUse" width="8" height="36"> 内一条 stroke-width="1.5" 的竖线；#dent12、#dent16 只写 href="#dent" 与新的 width（12 / 16），自身无内容 —— 三条筘路密度按 8:12:16 变化而线宽恒定。第四条带把 #dent 与 href="#dent" patternTransform="rotate(90)" 两层叠出十字筘影。
6. C 组织图：九枚组织样，全部以 viewBox="0 0 100 100" 在点格纸坐标上作画。平纹 / 方平 / 蜂巢逐格 rect；三种斜纹共用同一条排线图案 #twillLine，只改 patternTransform="rotate(-26.565|-45|-63.435)" 得到 1/3、2/2、3/1 的真实斜纹角；缎纹 #satin5 的 #satin5-24、#satin5-36 靠 href 继承同一份画稿只换 tile 尺寸，图例三格（16/24/36）并列证明 viewBox 让同一画稿适配任意 tile；最后一枚 36×18 的非方 tile 写 preserveAspectRatio="none"，8 枚循环被横向压扁。
7. D 踏板图 + 纹版带：左半是 6 踏板 × 24 纬的踏法格；右半 rect x=560 y=352 w=112 h=180 rx=8 填 #cardChain（tile 16×24，含两排孔位与卡号文字），带 <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="0 -24" dur="2.4s" repeatCount="indefinite"/>，纹版带持续下送；tile 高度恰为一纬，t=0 时孔位与踏板行严格对齐，构成可读静帧。
8. 足尺放大样 x=728 y=88 w=360 h=360，三层叠放：底层 rect fill="url(#linenScan)"（tile 48×48 内嵌 128×128 亚麻扫描 PNG 的 <image>）；中层 rect fill="url(#satinBlock)"，#satinBlock 是 96×96 的棋盘 tile，其明暗两格再各自填 url(#floatFine)（tile 6×6 的浮长排线）—— 大棋盘与细排线两级平铺同框可见；顶层是 60×60 的经纬淡格与指针高亮带。
9. 幅宽变形架：三条同高 28、宽 96/168/240 的 rect（x=736，y=460/494/528）同填 #motifBB（patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" width=".25" height=".5"，内含 circle r=".1" 与四片花瓣）。内容单位随包围盒作非等比缩放，同一枚花样从近圆逐步拉成横椭圆；x=1000 处 96×96 对照方块填 #motifUser（同画稿，patternUnits / patternContentUnits 皆 userSpaceOnUse）保持正圆。三条刻意不写 viewBox —— 一旦有 viewBox 就会顶掉 patternContentUnits，图注写明这条陷阱。
10. 纱线卷与图像栏 x=1104..1344：rect x=1112 y=88 w=96 h=260 rx=26 填 #yarnRoll（tile 64×96，内嵌 64×256 纱线扫描 PNG 的 <image>，patternTransform="rotate(-12) scale(1 .9)" 造出捻向）。右侧三排小样：(a) y=92 两枚 56×56 <image>，左写 href、右写 xlink:href，同一 data URI 渲染完全一致；(b) y=164 左为 data:image/svg+xml 的外挂纹样票（自带 viewBox，放大仍是矢量硬边），右为同图 96×96 PNG 版，放大后糊；(c) y=236 两枚 60×60 框各引同一张 3×3 纹版孔精灵（放大 20 倍），左 image-rendering:auto 为模糊过渡，右 image-rendering:pixelated 为硬方块。下方 x=1128 起四张 200×40 宽框放同一张 96×96 方形纱样，preserveAspectRatio 依次 xMinYMid meet / xMidYMid meet / xMaxYMid meet / none，留白位置左中右移，末张被横向拉伸。
11. 接缝检验尺（下缘 x=56..1340）：顶部 rect x=56 y=584 w=1288 h=40 rx=6 填 #ruleTick（tile 8 = 一根经纱，每 8 格一根长刻度），指针移动时改写 #ruleTick 的 x 把刻度相位对到当前经纱；右端 rect rx="12" 是读数条。三条车道 x=56 / 492 / 928，w=412，主区 y=632 h=180，各自下缘留 40 高的「修正条」。
12. 三条车道共用同一份画稿 <g id="weaveCell">：36×36 的一枚 3/1 斜纹循环，由 4×4 个 9 单位 rect rx="1.2" 组成。车道 1 #laneUser 写 patternUnits="userSpaceOnUse" width="17.3" height="17.3" viewBox="0 0 36 36"，内含 <use href="#weaveCell"/> —— 分数 tile 落不到设备像素，接缝处出现规则的浅色抗锯齿缝隙；修正条改用 #laneFixed（width/height="18"、overflow="visible" 且画稿四周各溢出 1 单位、承载矩形 shape-rendering="crispEdges"），同样的画稿接缝消失，构成同框 A/B。
13. 车道 2 #laneBB 只写 href="#laneUser" 与 patternUnits="objectBoundingBox" width=".0485" height=".0909" preserveAspectRatio="none"：画稿与 viewBox 全部继承，只换平铺策略。412×180 的非方包围盒把 tile 压成 20×16.4，斜纹角度被拧出与车道 1 不同的斜度，接缝也随包围盒漂移 —— 同一份 art，两种单位，破绽不同。
14. 车道 3 用滤镜把文档内元件取回来再铺：filter#laneTile 写 filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x=928 y=632 width=412 height=180；<feImage href="#weaveCell" x="928" y="632" width="36" height="36" result="cell"/> 的子区域即重复单元，交给 <feTile in="cell"/> 铺满整条车道，与源元件逐像素同源、无接缝。同一滤镜内另有两块 45×45 的 feTurbulence（type="fractalNoise" baseFrequency=".9" numOctaves="2"），各经一次 feTile 放大到修正条左右两半：左 stitchTiles="noStitch" 每 45 单位一道错位断纹，右 stitchTiles="stitch" 连续无缝，最后 feComposite / feBlend 叠成织物毛羽。
15. 指针钩子：pointermove 挂在放大样 rect 上，用 getBoundingClientRect() 线性映射到 6 单位一格的 60×60 经纬网格算出 end / pick，随即 (a) 读数条写「经 #N · 纬 #M · 3/1 斜纹右斜面」，(b) 放大样上落一条经向带与一条纬向带，(c) 穿综图高亮该经所穿综片、踏板图高亮该纬所踏踏板，(d) 三条车道把同一根经纬移到各自中央十字丝下 —— 车道 1/2 经 SVGPatternElement.patternTransform 写 translate(-dx,-dy)，车道 3 改写 feImage 的 x/y，于是三种平铺法在同一根纱线上的接缝位置可直接对读。载入时默认取点 (946,214) → 经 #37 · 纬 #22，静帧即带读数。
16. 资产与就绪：tools/gen-assets.ts 确定性生成 128×128 亚麻织纹、64×256 纱线条、3×3 纹版孔精灵、96×96 纱样照，以及外挂纹样票 SVG（文字构建期转路径），全部以 base64 data URI 写入 assets.ts，运行期零网络请求；CJK 标签用约 120 字形的 woff2 子集内嵌。所有 <image> 写 decoding="sync"，字体就绪 + 全部 decode() resolve + 一帧 rAF 之后置 window.__sceneReady=true；截图前调用 svg.pauseAnimations(); svg.setCurrentTime(0)。

**验收要点**

1. DOM：#dent12 / #dent16 / #satin5-24 / #satin5-36 / #laneBB 五个 <pattern> 都只有 href 与覆盖属性、childElementCount === 0；PNG 上它们各自渲染出可见且互不相同的 tile。
2. PNG：穿筘图四条带的线间距按 8:12:16 变化而线宽恒为 1.5，第四条呈十字交叉；量取相邻线中心距误差 ≤1px。
3. PNG：接缝检验尺车道 1 主区可见规则的浅色接缝网格（周期 17.3），其正下方修正条同色同画稿而无任何缝隙；车道 2 的斜纹角与车道 1 明显不同；车道 3 主区全区无接缝。
4. PNG：车道 3 修正条左右两半噪声粒感相近，但左半每 45 单位有一道横竖断纹，右半连续 —— 对应 stitchTiles="noStitch" 与 "stitch"。
5. PNG：幅宽三条中同一枚花样由近圆逐步拉成横椭圆（宽高比随 96/168/240 单调增大），右侧 userSpaceOnUse 对照方块内仍为正圆。
6. PNG：足尺放大样同时可见 96 单位的缎纹棋盘块与 6 单位的浮长排线两级平铺，且底层亚麻扫描纹理在块间连续。
7. PNG/DOM：两枚 20 倍放大的 3×3 纹版孔精灵 href 相同、image-rendering 分别为 auto 与 pixelated；PNG 上左枚边缘为渐变过渡、右枚为硬直角方块。
8. 交互与静帧：dispatchEvent 一次 pointermove 到放大样内某点后，读数条文本匹配 /经 #\d+ · 纬 #\d+/ 且数值随坐标变化，三条车道的 patternTransform / feImage x 同步更新；pauseAnimations() + setCurrentTime(0) 后纹版带孔位与踏板行对齐，导出 PNG 的四角为完全透明像素。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- Firefox 至今不渲染 feImage href=\"#元素\"（bug 455986，2026 仍未修）：构建期额外产出一份 #weaveCell 的 data:image/svg+xml 副本，运行期用 'MozAppearance' in document.documentElement.style 判定 Gecko 后把 feImage 的 href 换成该 data URI（走 at:feImage.href），feTile 链路不变，车道 3 角标标注「Gecko 回退：data URI 元件」。feImage / feTile 的子区域摆位在三家引擎上并不完全一致（Safari 对省略 x/y 的 feImage 有历史偏移），因此滤镜一律写 filterUnits 与 primitiveUnits=\"userSpaceOnUse\"，并给每个 primitive 显式 x/y/width/height，避免默认 -10%/120% 滤镜区造成裁切与错位。stitchTiles=\"stitch\" 按规范允许引擎微调 baseFrequency 以整除 tile，stitch 一侧的噪声粒度会略粗于 noStitch 一侧 —— 这是规范行为不是渲染差错，图注写明。分数尺寸 tile 的接缝强度依赖设备像素对齐：Chromium / Safari 在 dpr=1 下缝隙明显，Firefox 因 tile 光栅化策略不同缝隙更细，故基线截图固定在 dpr=1 的 headless Chromium，其余引擎只作人工核对；修正条（整数 tile + overflow=\"visible\" 溢出 + crispEdges）在三家都干净。<image> 引用 SVG 文档按 secure static mode 处理：脚本、外链、外部字体一律不生效，SMIL 冻结在 t=0，因此纹样票内文字已在构建期转为路径，其 :hover 与 <a> 仅作为「不会生效」的说明存在。image-rendering: crisp-edges 各家映射仍不一致（Firefox 近邻，Safari 曾按平滑处理），对照组只用 auto 与 pixelated，后者三家一致。patternTransform 的 SMIL 动画三家可用，但 Safari 对 pattern 属性动画重绘节流较重；截图路径不依赖动画时间，pauseAnimations() + setCurrentTime(0) 即得确定静帧，若 SMIL 被禁用则回退为 rAF 直接写 patternTransform。patternUnits=\"objectBoundingBox\" 的包围盒按规范不含描边，车道 2 与幅宽架的承载矩形因此只用 fill、边框另画一层，否则 tile 尺寸会随描边取舍跨引擎漂移。采集时网络完全阻断：位图、外挂 SVG 与 CJK 子集 woff2 全部 data URI 内嵌，字体加载失败时回退系统 sans-serif，全部布局用固定坐标、不依赖字体度量。

### 3.7 `stele-rubbing-hall` — 碑林拓片厅

- **用途 / 家族**：epigraphic typography / epigraphic typography
- **复杂度**：expert　**标签**：`textpath`, `vertical-writing`, `bidi`, `text-clip`, `conditional-processing`, `epigraphy`, `rubbing`, `glyph-rotation`
- **设计问题**：当文字随石形而走、而不是随一条直线走时，一方碑刻靠什么维持它的读序？

**场景**　碑林长廊的挂杆上垂着一张刚揭下的整拓：绫边靛青，墨底沉黑，字口白得像刚透过纸的光。碑阳正文竖排右起，八列直立楷字自最右一列往左推，逐字带着微小的旋转与横向抖动，像刀口本身的错落；圆首的弧上，题额沿弧线居中绕行，同一条弧的另一侧贴着碑侧题记，倒挂着从另一头读回来，末尾几个字随碑侧折断被弧长裁掉。墨区底部一行残字不再等距，它们各自落回碑面实测的坐标，缺字处留着空；再往下一行拓工小跋随石面起伏上下摆动。左侧挂着一小方朱拓样，同一段碑文在这里换了身份——它被送进裁切路径当窗口，朱砂与毡纹只从笔画内部透出来，与主拓片的墨底白字成阴阳两拓。右侧是释文卡：一个条件分支组按系统语言整段替换释文，旁边的分支账把每条判定原样打印出来；卡上还排着基线校准尺、三签的锚点对照，以及叙利亚文题名与倒刻年号的双向文本段。一枚朱文圆印骑在拓片与释文卡的接缝上，印文沿闭合圆环绕满一周。一条朱砂虚线牵着①到⑦的号码，把弧上的题额、右起的正文、弧下的倒读题记、残缺的末行、骑缝印和释文卡串成一条读序；一个「▶讀」的标记正沿着圆首弧线缓缓巡行。观众把指针移过去，拓包所到之处墨色加深、字口更亮——而这些字始终是真文字，可以直接框选、复制走。

**主打特性**

- `el:textPath` — <textPath> text along a path
- `at:textPath.side` — side=right (text on other side of path)
- `concept:textpath-closed-path` — Text around a closed circle path
- `pv:writing-mode=vertical-rl` — writing-mode vertical-rl
- `pr:text-orientation` — text-orientation mixed / upright / sideways
- `at:text.rotate` — rotate list per glyph (last value repeats)
- `concept:text-in-clippath` — text and textPath inside clipPath

**辅助特性**

`el:switch`、`at:switch.systemLanguage`、`at:svg.lang`、`el:text`、`el:tspan`、`concept:multiline-text-tspan`、`at:text.x`、`at:text.dy`、`at:textPath.href`、`at:textPath.startOffset`、`at:textPath.path`、`pr:text-anchor`、`pr:dominant-baseline`、`pr:alignment-baseline`、`pr:baseline-shift`、`pr:direction`、`pr:unicode-bidi`、`concept:text-as-clip-path`、`concept:mask-with-text`、`concept:animate-text-attributes`、`css:user-select`、`at:switch.requiredExtensions`、`concept:conditional-attrs-outside-switch`、`css:lang-selector`、`concept:lang-dependent-glyph-selection`、`css:text-transform`、`concept:nested-tspan-inheritance`、`concept:tspan-absolute-repositioning`、`at:text.y`、`at:text.dx`、`api:SVGTextPositioningElement.x`、`at:textPath.xlink:href`、`concept:textpath-centered-text`、`concept:textpath-overflow-clipped`、`concept:textpath-startoffset-animation`、`api:SVGTextPathElement.startOffset`、`pv:text-anchor=middle`、`pv:text-anchor=end`、`concept:text-anchor-rtl-interaction`、`pv:dominant-baseline=ideographic`、`pv:dominant-baseline=central`、`pv:dominant-baseline=middle`、`pv:dominant-baseline=hanging`、`pv:baseline-shift=super`、`pv:baseline-shift=sub`、`pv:writing-mode=vertical-lr`、`concept:mixed-script-bidi`、`css:selection-pseudo`、`css:font-face-data-uri`

**构造要点**

1. 画布与版面：根 svg 用 viewBox="0 0 1400 900"、preserveAspectRatio="xMidYMid meet"、透明底。三块版面互不相接：朱拓小样 70..270 × 470..830，主拓片（含绫边）282..898 × 64..856，释文卡 920..1352 × 96..840；版面之间保留 ≥22px 的透明走廊，加上四周留白使导出 PNG 的透明像素稳定超过 8%。挂杆为 y=44、x 从 260 到 920 的圆头横杆，两端各一个 r=9 的轴头。色板：墨 #17140f、纸 #efe6d4、绫边靛青 #2c4a63、朱砂 #b3241f、藤黄签 #d8a13a、石绿 #4f7a63，保证彩色像素充足。
2. 碑形与那条被两段文字共用的弧：<path id="stele" d="M 320 340 A 280 280 0 0 1 880 340 L 880 836 L 320 836 Z"/> 是圆首碑轮廓（圆心 600,340，半径 280，顶点 y=60）。<path id="arc-e" d="M 386 340 A 214 214 0 0 1 814 340" fill="none" stroke="#b3241f" stroke-opacity=".18"/> 是圆首内的题额弧，它同时被题额与碑侧题记两个 textPath 引用——整个场景对「读序」的回答就压在这一条几何上。
3. 墨底白字用 mask 而不是纯色：自下而上是（a）纸层——填 #efe6d4 的 <use href="#stele">，叠一层 0.35 透明度的细纤维线；（b）墨层——同一个 <use href="#stele"> 填墨色 linearGradient 并撒石花斑点，带 mask="url(#m-ink)"。<mask id="m-ink" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style="mask-type:luminance"> 的内容为：白色 <use href="#stele"> 打底（处处上墨），其上由脚本克隆进来的正文与题额文本填 #000 挖出字口，另把第 3 列首二字与第 6 列末二字填 #6b6b6b——灰度而非二值，于是这四个字呈半透的「未拓透」墨色，正是 mask 与 clip 的差别所在。
4. 可见正文必须是真文本节点，不能只活在 mask 里：<g id="zhengwen"> 直接渲染在墨层之上，含 8 个 <text>，fill 取纸色，style="writing-mode:vertical-rl; text-orientation:upright; user-select:text; -webkit-user-select:text"。列心 x = 836 − 62i（i=0..7，最右列 836，最左列 402），起始 y=402，font-size 30，letter-spacing .06em，每列 16–22 字。左绫边另挂一列现代著录签，写 writing-mode:vertical-lr、font-size 13，行序左起，与碑文的右起恰好相反，用来点破「行序也是读序的一部分」。mask 与 clipPath 里的副本一律由脚本 cloneNode(true) 生成，克隆加 aria-hidden="true" 与 user-select:none。
5. 刀痕般的错落：每列 <text> 带 rotate="-3 2 -1 4 -2 3 2"（列表比字数短，最后一个 2° 向后重复到列尾，肉眼可见后半列统一微倾）与 dx="0 1.4 -1.1 1.6 -0.8 1.2 -1.4" 的横向抖动，逐字绕自身原点旋转。第 4、5 两列写同一段拉丁转写：第 4 列 text-orientation:mixed（拉丁字母侧倒成横排块），第 5 列 text-orientation:upright（字母逐个直立堆叠），列首各贴 9px 小标签注明取向，构成竖排里两种取向的直接对照。
6. 题额与碑侧题记共用 #arc-e：题额是 <text><textPath href="#arc-e" startOffset="50%" text-anchor="middle">，篆体子集 font-size 34，落在弧外侧、正对圆首顶点（居中于路径的标准写法）；碑侧题记是 <text><textPath href="#arc-e" side="right" startOffset="120">（长度值而非百分比），font-size 15，贴在同一条弧的内侧倒读。题记串刻意比弧长多 12%，末尾数字因 textPath 溢出被裁掉不渲染，读作「碑侧折断处失字」。第三条极小字号的刻工款用 xlink:href="#arc-e" 引用同一条弧，证明旧写法仍被解析。
7. side 的能力探测与回退：初始化时插入 1×1 的探针 <textPath side="right"> 并比较其首字 getExtentOfChar 的中心相对弧的上下符号；判定不支持时，脚本按同圆心同半径生成 <path id="arc-e-rev" d="M 814 340 A 214 214 0 0 0 386 340"/>（端点互换、sweep-flag 取反，几何完全相同、方向相反），把碑侧题记的 href 改指向它，并把底部 chip 文案设为「side=right → 反向路径回退」。两条分支下题记都落在弧内侧且倒读，只是实现不同。
8. 内联 path 的廊幌：顶部一条 <text><textPath path="M 300 30 q 300 34 600 0" startOffset="6%">，写展厅导览带，全场没有任何对应的 <path> 元素。探测方式：比较该 textPath 的 getComputedTextLength() 与去掉几何后的参照值，或检查其 getBBox().height < 2；判定不支持时脚本把同一条 d 写进 <defs><path id="ribbon"> 并改用 href，chip 记录实际走的分支。
9. 骑缝印（闭合路径绕字）：圆心 (905,700)、r=54，<path id="seal-ring" d="M 905 646 a 54 54 0 1 1 -0.1 0 Z"/>。外圈两段 textPath 引用同一条闭合路径，startOffset 分别为 4% 与 54%，首尾相接绕满一周；内圈 4 个篆字用 text-anchor:middle + dominant-baseline:central 摆成 2×2。整枚印 fill 朱砂、fill-opacity .82，跨在拓片右缘 x=898 与释文卡左缘 x=920 之上——它真的是一枚骑缝印，也是全场唯一的闭合路径绕字。
10. 朱拓小样——同一段字的第二次使用：<clipPath id="clip-zhu" clipPathUnits="userSpaceOnUse"> 里放三样东西：(a) 正文第 1、2 列的缩放克隆（transform="translate(-560,-40) scale(.72)"），(b) 一条 <text><textPath href="#arc-zhu"> 的弧上短句，(c) 一个 48px 的篆额大字（文字直接充当裁切轮廓）。其下 <g clip-path="url(#clip-zhu)"> 铺朱砂→赭的 linearGradient 矩形、45° 毡纹细线，以及一层缓慢平移的渐变；颜色只在笔画内部显形，笔画外保持纸色。它与主拓片的墨底白字构成阴拓／阳拓对照：同一段碑文一次是白字，一次是拓印窗口。
11. 释文卡的 <switch>：子元素严格按序为 (1) requiredExtensions="http://example.org/svg-rubbing" 且 systemLanguage="en" 的诱饵分支（扩展永远不满足，必被跳过），(2) systemLanguage="zh,zh-Hans,zh-CN" lang="zh-Hans"，(3) systemLanguage="ja" lang="ja"（竖排小段，:lang(ja) 换到日文字形子集并改青灰色），(4) systemLanguage="en,en-US" lang="en"，(5) 无任何条件的兜底分支（梵文转写 lang="sa-Latn" + 拉丁译名，text-transform:uppercase）。每个分支的段落用 tspan 排四行：首行 x="944" dy="0"，其后各行 x="944" dy="1.28em"，左缘齐平。卡头另有一个不在 switch 内、直接带 systemLanguage 的 <g>，演示条件属性脱离 switch 也照样求值。
12. 语言分支账：脚本遍历 switch 的 5 个子节点，用 getBoundingClientRect().width > 0 判定谁真的渲染了，同时用 navigator.languages 独立推算一遍，两列并排打印成 11px 等宽子集小字，命中行画一个朱砂勾，navigator.language 原样打印以便截图自证；两列若不一致，chip 变琥珀色报警。这一栏让「按系统语言整段替换」在静帧里也可读、可核对。
13. 基线校准尺与三签：y=612 一条 0.5px 界行线，「碑」字在 x=952/1032/1112/1192/1272 重复五次，dominant-baseline 依次取 alphabetic / ideographic / central / middle / hanging，字下各配 9px 注记，说明汉字装裱应取 ideographic 一档；第三个实例内嵌一个 alignment-baseline="hanging" 的 tspan（只在 Chrome/Safari 抬起）。右侧校记行用 baseline-shift="super"（注号）、baseline-shift="30%"（重文符）、baseline-shift="sub"（残画符）三种偏移，并用嵌套 tspan 演示 fill/font-size 的继承，其中一个双行夹注的 tspan 带绝对 x/y 直接跳到栏外。另有一条 x=1136 的铅垂线，三行著录签（起拓日期／碑名／编号）同 x 分别用 text-anchor=start / middle / end。
14. 双向文本段：x=1340 右缘处是 direction="rtl" unicode-bidi="isolate" text-anchor="end" 的叙利亚文题名（景教碑侧一路），隔离使其后的汉字不被卷入重排；其下一行是 unicode-bidi="embed" 的汉字＋阿拉伯数字混排，作为正常次序基准；再下一行同样内容改用 unicode-bidi="bidi-override" direction="rtl"，整段数字逆序显示，标注为「刀序倒刻对照」。三行左端各有 12px 的属性名标签，使差异在静帧里可指认。
15. 缺字末行与波浪跋：墨区底部 y=800 的一行残字用 x="352 392 436 520 560 648 690 734" 与一条微差的 y 列表落回碑面实测位置，缺字处留空；<animate attributeName="x" values="352 386 420 454 488 522 556 590; 352 392 436 520 560 648 690 734; 352 392 436 520 560 648 690 734" keyTimes="0;0.35;1" dur="5s" repeatCount="indefinite"/> 演示「缺字复位」，且一个周期里大部分时间停在实测位置，静帧因此有意义。y=826 的拓工小跋一行用 dy="0 -3 2 -4 3 -2 4 -3 2 0" 随石面起伏摆动。脚本再通过 SVGTextPositioningElement 的 x.baseVal（SVGLengthList）读回实测列，填进释文卡的著录表。
16. 读序引线与交互：最顶层是 0.35 透明度的朱砂虚线加 ①..⑦ 圆号，依次串起 题额 → 正文最右列 → 正文最左列 → 弧下碑侧题记 → 缺字末行 → 骑缝印 → 释文卡；一个「▶讀」标记字用 <animate attributeName="startOffset" values="4%;96%;4%" dur="9s" repeatCount="indefinite"/> 沿 #arc-e 巡行，脚本在 pointermove 时也可直接写 SVGTextPathElement.startOffset.baseVal 把它拽到指针最近点。pointermove 用 getScreenCTM().inverse() 把指针换算成用户坐标，移动 <mask id="m-pounce"> 里 r=96 的径向渐变白圆（拓包），让叠在上面的重墨层局部加深、字口更亮，同时刷新坐标读数并自增 window.__INTERACTION_COUNT__。导出前调用 svg.pauseAnimations() 与 setCurrentTime(2.4)，对正文第 3 列建立 Range 并 addRange 触发 ::selection 的朱砂高亮，最后置 window.__VIS_READY__ = true。

**验收要点**

1. 主拓片为墨底白字：在墨区背景采样的像素亮度 < 40，字口采样 > 190；DOM 中 #zhengwen 下恰有 8 个 <text>，computed writing-mode 全为 vertical-rl，其中 1 列 text-orientation 为 mixed、其余为 upright，最右列列心 x ≈ 836。
2. 题额与碑侧题记共用同一条弧：两个 textPath 引用的路径在几何上同圆心同半径（原生分支下 href 均为 #arc-e），其中一个带 side="right"；PNG 中弧的外侧与内侧各有一行字，内侧一行的字符朝向与外侧相反；碑侧题记末尾至少一个字符因溢出未渲染（getNumberOfChars 大于实际有 extent 的字符数）。
3. 逐字旋转成立：每个正文 <text> 的 rotate.baseVal.numberOfItems ≥ 6，且同一列相邻字符的 getExtentOfChar 外接框宽高比互不相同，说明旋转逐字生效、末值向后重复。
4. 朱拓小样是裁切窗口：笔画内部存在 R > 150 且 R−B > 60 的朱砂像素，而笔画外 6px 处像素与纸色的色差 < 12；DOM 中 clipPath#clip-zhu 的后代同时包含 <text> 与 <textPath>。
5. mask 的灰度可辨：主拓片中被标为「未拓透」的 4 个字，其笔画像素亮度落在 80–170 之间，既不等于全墨也不等于纸色，与二值裁切区分开。
6. 条件处理只放行一个分支：<switch> 的 5 个子节点里 getBoundingClientRect().width > 0 的恰好 1 个，带 requiredExtensions 的诱饵分支为 0×0；语言分支账中被打勾的行与该子节点一致，且截图上打印了 navigator.language 原值。
7. 骑缝印绕满一周并压住接缝：两段环形 textPath 的首尾间隙 < 8px，印记包围盒同时跨过 x=898 与 x=920 两条版面边界。
8. 交互与可选性：pointermove 后 window.__INTERACTION_COUNT__ 增加，拓包圆心与指针换算所得用户坐标误差 ≤ 1，该处墨色比移动前更深；导出前 getSelection().toString().length ≥ 6，而 mask/clipPath 内克隆文本层的 computed user-select 为 'none'。

**实现复审**

- 两条方向注释移出 #zhengwen，正文组恰含8列；switch 的 systemLanguage 门禁检查分支子元素。

**浏览器注意**

- textPath 的 side="right" 到 2026 年仍只有 Firefox（61+）实现，Chrome 与 Safari 直接忽略该属性、把题记画回弧外侧并与题额重叠；场景用 1×1 探针实测首字落在弧的哪一侧，不支持时切到脚本生成的 #arc-e-rev（端点互换、sweep-flag 取反的同一条几何），视觉结果一致而实现不同，底部 chip 明写走了哪条路。textPath 的内联 path 属性同样只有 Firefox 支持，Chrome/Safari 会把该 textPath 渲染成零长度，探测靠 getComputedTextLength()/getBBox().height，回退时把同一条 d 写进 <defs><path> 改用 href。alignment-baseline 在 Firefox 未实现（按 dominant-baseline 处理），那个 hanging 的 tspan 在 Firefox 下与基线行重合，注记已标明并同时给出 dominant-baseline 的近似值。writing-mode 只使用 vertical-rl / vertical-lr，旧值 tb、tb-rl 已废弃不用；Safari 对竖排文本的 rotate 与字距舍入与 Chrome 有约半像素差异，验收阈值按此放宽。text-orientation 的 sideways 值 Safari 落地最晚，场景只把 sideways 用在小样上并允许退化为 mixed，主对照使用支持面完整的 mixed 与 upright。systemLanguage 依赖 Accept-Language / navigator.languages：Chrome 按前缀匹配（zh 命中 zh-Hans），Safari 历史上更严格，故每个分支都写出 "zh,zh-Hans,zh-CN" 这样的完整列表；Playwright 需显式设置 locale，否则默认 en-US 命中英文分支——这正是分支账要把 navigator.language 原样打印出来的原因。用 <use> 引用文本进 clipPath/mask 在三家表现不一致（Safari 对 use→text 的裁切有长期缺陷），因此一律用脚本克隆真实文本节点，克隆加 aria-hidden 与 user-select:none。SVG 2 的自动换行（inline-size / shape-inside）三家都不可用，多行释文只能用 tspan 的 x 复位 + dy 实现。SMIL 在 Chrome 的弃用计划始终未执行，animate 对 x 列表与 startOffset 的动画三家可用，但导出前必须 pauseAnimations() 并 setCurrentTime 固定时刻，否则静帧不确定。网络被封锁，全部字体（CJK 楷体与篆体子集、带变音符号的拉丁子集、叙利亚文子集、等宽子集）都按实际用字 pyftsubset 后以 woff2 data URI 内联，缺一个码位就掉成 .notdef，尤其是梵文转写的 ā/ī/ū/ṣ/ṭ 与叙利亚文的连写形；叙利亚文整形在三家排版引擎间仍有细微差异，只作 direction/unicode-bidi 的演示而不作像素级校验。SVG 文本的 user-select 需显式声明并补 -webkit-user-select，::selection 在 SVG <text> 上 Chrome/Firefox 可自定义颜色、Safari 支持有限，故朱砂高亮只作增强，验收以 getSelection().toString() 为准。

### 3.8 `letterpress-type-specimen` — 铅字样本册

- **用途 / 家族**：type specimen / typography
- **复杂度**：expert　**标签**：`typography`, `type-specimen`, `text-metrics`, `opentype`, `css-cascade`, `letterpress`
- **设计问题**：一页样本册如何在自己的纸面上证明：关于这套字体的每一条度量声明都是可实测的，而不是排版者的宣称？

**场景**　一张 1400×900 的暖白样本纸浮在透明背景上，四角带十字规矩线、左缘留着毛边。纸面顶端是 92pt 的空心大字标题 Handgloves——描边压在字面之下，外面罩着一块朱红墨板，标题底下用 getBBox() 画出的虚线几何框紧贴字形，7u 粗的描边明显越出框外，基线上密排着每个字符起点的刻度。主栏往下是三块可测的版面：六级字号阶梯，每行自带基线、em 框、x 高度带和右端的实测前进宽；字重×字宽矩阵，四档 wght 乘三档 wdth，格下印着各自的宽度，一旦三列宽度相同就盖上「合成·无 wdth 轴」的印章；再往下是 OpenType 开关对照栏，liga、smcp、tnum、onum、font-kerning、text-rendering、letter-spacing、word-spacing、text-decoration 与四种通用字体族成对陈列，每对只印一个 Δ 数字，Δ 为零的行自动改印「本引擎无差异」，其后还跟着一条被划掉的 kerning="0" 废止行。栏目小标题下的色块不是矩形元素，而是 feFlood 灌满滤镜区域后透出的半透明底板，随标题长度自动张缩。右栏是最难忘的强制栏宽试验：三把 320/260/200 单位的标尺下，同一句样字被 textLength 压进固定栏宽两遍——上行 lengthAdjust="spacing"、下行 spacingAndGlyphs——逐字锚点刻度立刻显形：上行字形宽度纹丝不动、字距被挤掉，下行字形整体被压窄；读数栏并排印出「引擎读数」与「实测跨距」，二者在 spacing 档下并不相等，这条不一致本身就是展品。右栏中段是级联实验：同一句样字五行，先由 fill 呈现属性上色，再被一条 CSS 规则整体改写，接着是类、内联 style 与 !important 逐级夺回控制权，最后一行落到 UA 默认黑；每行旁的色片直接由 getComputedStyle 读回的 rgb() 值填成，把「呈现属性特异性为零」变成看得见、可比对的印刷结果。纸脚是三张校样卡（PI 外挂样式表、image 模式下被阻断的外部字体、卡内自带 data URI 字体）、一条走版中的墨辊与一栏运行时生成的自检结论。

**主打特性**

- `css:font-face-data-uri` — @font-face with data-URI font embedded in SVG
- `pr:font-feature-settings` — font-feature-settings OpenType features
- `at:text.textLength` — textLength forced advance width
- `av:text.lengthAdjust=spacingAndGlyphs` — lengthAdjust spacingAndGlyphs (glyphs scale)
- `api:SVGTextContentElement.getComputedTextLength` — getComputedTextLength
- `api:SVGTextContentElement.getStartPositionOfChar` — getStartPositionOfChar / getEndPositionOfChar
- `css:presentation-attribute-specificity` — Presentation attributes lose to any CSS rule

**辅助特性**

`el:style`、`concept:xml-stylesheet-pi`、`pv:white-space=pre`、`pr:white-space`、`concept:presentation-attribute-specificity`、`concept:presentation-attribute-cascade`、`concept:style-attribute`、`api:Window.getComputedStyle`、`api:SVGGraphicsElement.getBBox`、`pr:text-rendering`、`pr:letter-spacing`、`pr:word-spacing`、`pr:font-family`、`pr:font-size`、`pr:font-weight`、`pr:font-style`、`pr:font-stretch`、`pr:font-variant`、`pr:font-kerning`、`pr:text-decoration`、`concept:text-stroke-paint-order`、`el:feFlood`、`pr:flood-color`、`pr:flood-opacity`、`concept:filter-on-text`、`concept:text-background-box-via-flood`、`css:keyframes-paint-animation`、`css:keyframes-on-svg`、`css:transitions`、`concept:length-units-font-relative`、`api:FontFaceSet.ready`、`concept:svg-as-image-external-font-blocked`、`av:text.lengthAdjust=spacing`、`concept:textlength-on-tspan`、`api:SVGTextContentElement.getExtentOfChar`、`api:SVGTextContentElement.getSubStringLength`、`api:SVGTextContentElement.getNumberOfChars`、`api:SVGTextContentElement.getCharNumAtPosition`、`concept:bbox-excludes-stroke-and-control-points`、`api:SVGBoundingBoxOptions.stroke`、`pr:font-variation-settings`、`concept:faux-italic-skewx`、`pr:font-variant-ligatures`、`pr:font-variant-numeric`、`pr:kerning`、`pv:text-rendering=geometricPrecision`、`at:text.xml:space`、`av:g.xml:space=preserve`、`css:text-decoration-styling`、`pv:flood-color=currentColor`、`css:custom-properties-in-filter`、`css:flood-color-transition`、`concept:flood-fills-filter-region`、`css:important-override`、`concept:ua-stylesheet-defaults`、`api:SVGElement.style`、`api:CSSStyleDeclaration.fill`、`api:SVGElement.getPresentationAttribute`、`at:g.class`、`at:style.type`、`concept:hollow-outline-text`

**构造要点**

1. 坐标与纸张：单一根节点 `<svg id="stage" viewBox="0 0 1400 900">`。纸张是一条 path（`M56 36 H1344 V864 H56 Z`，左缘按 sin 波每 40u 抖动 ±1.5u 做毛边）填 `#f4ead6`，四周留出的透明边就是截图的 alpha 证据；纸内 28u 处一圈 `#c3ae8b` 0.6u 细框，四角画十字规矩线。版心 x 92…1308、y 76…830；主栏 92…900，右栏 940…1308，中缝 x=920 一条竖细线。墨色 `#1c2733`、量规朱红 `#b3271e`、级联靛蓝 `#14577a`、铜绿 `#1d7a4b`、紫 `#7a3fa0`、细线 `#c3ae8b`。
2. 字体资产管线：把一款带 wght/wdth 轴且含 liga/dlig/smcp/onum/tnum/kern 的开源可变字体放进 `assets/`，用 `pyftsubset --flavor=woff2 --layout-features=liga,dlig,smcp,c2sc,tnum,pnum,onum,lnum,kern --variations wght=200:900 --variations wdth=75:125` 裁到样本册实际用到的约 120 个字形，生成 `src/fonts/praktika.ts` 导出 base64 data URI；`<style type="text/css">` 内写 `@font-face{font-family:"Praktika VF";src:url(data:font/woff2;base64,…) format("woff2");font-weight:200 900;font-stretch:75% 125%}`。另生成只含校样卡 12 个字形的 micro subset 供第三张卡使用；字体许可证全文排进纸脚 colophon。
3. 图层顺序与就绪时序：全部 SVG DOM 由 TypeScript 生成。`<defs>` 先放 `<style type="text/css">` 与四个滤镜（三块底板 `plate-*` + 标题 `inkPlate`）→ 纸张与规矩线 → 各栏静态版面（每行一个 `<g class="row">`）→ 度量层 `<g class="gauge">`（量规、刻度、虚框）→ 读数层（所有数字统一 `font-variant-numeric:tabular-nums`）→ 动画层 → 交互游标层。所有度量必须在 `await document.fonts.ready` 并对每个用到的 weight/stretch 组合调过 `document.fonts.load` 之后执行，测完一次性 flush 进 DOM，再置 `window.__VIS_READY__ = true`。
4. 字号阶梯（x 92…640，y 226…430）：六行 font-size 9/12/16/22/32/48，样字 "Hamburgefonstiv"，行距 = size + 10。每行量规由三件事画成：整行基线细线；宽 = `getComputedTextLength()`、高 = font-size 的 em 框；x 高度带取自一个离屏探针 `<text>x</text>` 的 `getExtentOfChar(0).height`，画成 8% 不透明的靛蓝带。右端 x=636 右对齐印「宽 xxx.xx / em xx / x 高 xx.x」。48pt 行内嵌一个 `font-size="0.5em"` 的 tspan 并印「½em」，证明 em 相对父级字号。
5. em/rem 点列（x=118 一列）：每行画一个 `<circle r="0.28em">`（随该行 font-size 变大，实测 font-size 32 时 bbox 宽 64）与一个 `<circle style="r:0.28rem">`（恒定 4.48px），栏头印「em ↕ / rem —」。若 `style="r:…"` 不生效（旧 Safari 未把几何属性 CSS 化），脚本回退为写像素值的 `r` 属性并把栏头改印「rem 已换算」。
6. 字重×字宽矩阵（y 442…566）：行 = font-weight 200/400/700/900（同时写 `font-variation-settings:'wght' n` 作双保险），列 = font-stretch 75%/100%/125%，格内同一词 "Meta" 22pt，格下 8pt 印实测宽。脚本比较同一行三列宽度，三值相等即在该行盖「合成·无 wdth 轴」印章。矩阵下另起一小行：font-style normal / italic / oblique 12deg，再加一个 `transform="skewX(-12)"` 的伪斜体，四者宽度并排印出——伪斜体与正体宽度完全相同，就是「假斜体不改前进宽」的判据。
7. OpenType 开关对照栏（y 578…742，分 92…360 与 372…640 两小栏）：每行一对样字加一个 Δ 读数——liga 1/0（"office fjord"）、`font-variant:small-caps` 与 `font-feature-settings:'smcp' 1`、tnum/pnum（"1111 0123" 配一条竖对齐线）、onum/lnum、font-kerning normal/none（"AVATAR Ty"，AV 对另用 `getSubStringLength(0,2)` 单测）、text-rendering optimizeSpeed/optimizeLegibility/geometricPrecision、letter-spacing −1/0/8、word-spacing 0/20、text-decoration underline/overline/line-through（第三词加 `text-decoration-style:wavy` 与 `text-decoration-color:#b3271e`）、以及 serif/sans-serif/monospace/cursive 的通用字体族回退行。任何 Δ 为 0 的行自动改印「本引擎无差异」，绝不印未验证的宣称。
8. 废止陈列：紧接 font-kerning 之后排一行 SVG 1.1 的 `kerning="0"`，实测 Δ 恒为 0，整行用 `text-decoration:line-through` 划掉；自检栏再印一条 `typeof el.getPresentationAttribute`（三家引擎均为 "undefined"）。两条并列构成「宣称不等于可测」的反例，与全页主题呼应。
9. 行距正文块（y 754…830）：左半 x 92…470 排四行 11pt 正文，按 18u 基线步进逐行 `<text>` 落位，左侧 x=76 画基线刻度并印「18.0」，同时印出探针测得的 cap 高与 x 高。右半 x 482…640 是空白检验孪生对：同一串 "A␣␣␣␣␣B" 三行——`class="pre"`（CSS `white-space:pre`）、默认折叠、以及 `xml:space="preserve"`——三者的 `getComputedTextLength()` 印在下方（Chromium 152 实测 101.16 / 43.36 / 101.16）。
10. 强制栏宽试验（右栏 y 76…430）：三把标尺，目标宽 320/260/200u，每 20u 一小格、每 100u 一长格并印数字。每把标尺下同一句样字排两遍：上行 `textLength` + `lengthAdjust="spacing"`（靛蓝），下行 `textLength` + `lengthAdjust="spacingAndGlyphs"`（朱红）。每遍正下方画逐字锚点：在 `getStartPositionOfChar(i).x` 处落 4u 竖刻度，首末字另加 `getExtentOfChar` 方框——上行方框宽度与自然样本一致而刻度间距被压缩，下行方框本身变窄，肉眼即可判定被挤的是字距还是字形。
11. 判定与双读数（右栏 y 340…430）：脚本对每对样字算三个量——实测跨距 = `getEndPositionOfChar(n−1).x − getStartPositionOfChar(0).x`；字形宽比 = `getExtentOfChar(0).width ÷ 自然样本同字宽`；字距增量 = (实测跨距 − Σ字形宽) ÷ (n−1)。宽比 ≈ 1 盖「字距被挤」，宽比明显 < 1 盖「字形被压」。读数栏并排印「引擎读数 getComputedTextLength」与「实测跨距」：Chromium 152 在 spacing 档下二者不等（实测 238.88 vs 180.00），这条不一致直接印在纸上作为展品。末尾再加一行 `<tspan textLength="120">` 的局部强制样本，证明 textLength 可只作用于子串。
12. 级联实验（右栏 y 442…620）：同一句 24pt 样字排五行，都在 `<g class="cascade">` 内——①只有 `fill="#b3271e"` 呈现属性，被 `<style>` 中的类型选择器 `.sheet text{fill:#14577a}` 覆盖成靛蓝（特异性 0 输给任何规则）；②追加 `class="claim"`（`.claim{fill:#b3271e}`）靠特异性夺回朱红；③由脚本执行 `el.style.fill = "#1d7a4b"` 写内联样式；④命中 `.override{fill:#7a3fa0!important}`；⑤放在 `.sheet` 作用域之外且不写任何 fill，落到 UA 默认黑。每行右侧的色片 `fill` 直接由 `getComputedStyle(el).fill` 读回后写入，旁边用等宽字印出该 rgb() 字符串；五行右缘再画一段四级台阶，标注「属性 0 < 规则 < 内联 < !important」。
13. 滤镜灌注的标签底板：八个栏目小标题都是 `<text filter="url(#plate-…)">`，滤镜结构为 `feFlood`（`flood-color` 取该 `<filter>` 上声明的 `--plate` 自定义属性，`flood-opacity="0.34"` 让纸面透出）→ `feMerge`（底板在下、SourceGraphic 在上）。滤镜区域写成 `x="-4%" y="-30%" width="108%" height="160%"`，底板因而随文字长度自动张缩（实测短标签 84px 宽、长标签 376px 宽），全页没有一个作背景的 rect。其中一块底板故意写 `flood-color="currentColor"` 并在其 `<filter>` 上设 `color`，标签下印小字说明它取的是滤镜自身继承的 color，而非被引用元素的颜色。
14. 标题栏（y 76…206）："Handgloves" 92pt、wght 800，`fill="#f6f1e6" stroke="#1c2733" stroke-width="7" paint-order="stroke"` 形成描边在后的空心铅字，外罩 `filter="url(#inkPlate)"` 的朱红墨板（feFlood + feMerge，文字仍是真文本、可选中、DOM 里可读）。用 `getBBox()` 画朱红虚线几何框（其宽度等于 `getComputedTextLength()`），7u 描边像素明显越出框外；框旁印「getBBox 不含描边；getBBox({stroke:true}) 在本引擎返回同一矩形」，并另画一条按 stroke-width/2 手工外扩的点线作对照。基线上按 `getStartPositionOfChar(i).x` 排满字符起点刻度，第 3、8 个字符加 `getExtentOfChar` 方框。
15. 校样三卡（右栏 y 632…760）：三张 116×92 的 `<image>`，href 均为 `data:image/svg+xml` 的独立文档。第一张以 `<?xml-stylesheet type="text/css" href="data:text/css,…"?>` 开头，卡内元素写 `fill="#b3271e"` 而 PI 样式表把它改成靛蓝（Chromium 152 实测生效），卡下印「呈朱红 = 本引擎忽略 PI」；第二张卡内用自己的 `<style>` 上色（证明 `<style>` 在 img 模式仍生效），但 font-family 引用父文档的 "Praktika VF"，因外部字体被阻断而回退 serif，字面与纸面明显不同；第三张把 micro subset 的 woff2 data URI 写进卡内 `@font-face`，字面与纸面完全一致——三张卡合起来就是「样式随文档走、字体必须随文档走」的证据。
16. 动画层与交互钩子：纸脚 y 838…856 的墨辊条用 `@keyframes` 同时驱动 `fill` 色相、走版虚线的 `stroke-dashoffset` 与「校样中」印章的 `opacity` 脉动，另有一条 `flood-color` 的 transition 让底板在 hover 时换墨。`?export=1` 时给根节点加 `.frozen`（`animation-delay:-1.4s; animation-play-state:paused`），静帧固定在墨辊行至三分之二、印章半透的那一格。`pointermove` 用 `getScreenCTM().inverse()` 换算坐标，对命中的 `<text>` 调 `getCharNumAtPosition` 取字号，画出该字的 `getExtentOfChar` 方框，读数栏印「#序号 · 前进宽 · getSubStringLength(0,i)」，同时给该行加 `.hot` 类由 `transition: fill .3s, stroke-width .3s` 平滑变色，并自增 `window.__INTERACTION_COUNT__`；未命中时游标停在 32pt 阶梯行，保证静帧也带一组有意义的读数。

**验收要点**

1. 截图四周留有透明纸边（alpha=0 像素 ≥ 全图 12%），纸面为暖白 `#f4ead6`，四角十字规矩线与左缘毛边可见。
2. DOM：`document.fonts.check('16px "Praktika VF"')` 为 true；字号阶梯六行印出的宽度与各自 `getComputedTextLength()` 相差 < 0.5，且六个数值严格递增。
3. 强制栏宽试验：`lengthAdjust="spacing"` 样本的 `getExtentOfChar(0).width` 与自然样本相差 < 0.05 而实测跨距等于 textLength ±0.5；`spacingAndGlyphs` 样本的 `getExtentOfChar(0).width` ≤ 自然值的 0.9；两行盖出的判定印章文字分别为「字距被挤」与「字形被压」。
4. 级联五行的 `getComputedStyle(el).fill` 依次为 `rgb(20,87,122)`、`rgb(179,39,30)`、`rgb(29,122,75)`、`rgb(122,63,160)`、`rgb(0,0,0)`，且每行色片元素的 fill 与该字符串逐字相同，旁边印出的 rgb() 文本一致。
5. 截图中标签底板随文字长度张缩：最长栏目标题的底板像素宽度至少为最短者的 2 倍；底板为半透明（板内取样像素既不等于纯底板色也不等于纸色）。
6. 标题的 getBBox 虚线框宽度与 `getComputedTextLength()` 相差 < 1，且该框外仍存在描边墨色像素（证明几何框不含 7u 描边）。
7. 空白检验孪生对：`white-space:pre` 行与 `xml:space="preserve"` 行的 `getComputedTextLength()` 相等（±0.5），且均 ≥ 折叠孪生行的 1.8 倍。
8. pointermove 之后 `window.__INTERACTION_COUNT__` 增加，游标读数栏的 textContent 变为命中字符的序号与实测前进宽；`?export=1` 静帧中该读数栏已有默认命中的 32pt 阶梯行读数，且动画层被冻结在同一帧（两次渲染像素一致）。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- Chromium 152 实测：`lengthAdjust=\"spacing\"` 时 `getComputedTextLength()` 返回自然宽度（238.88）而非 textLength（200），只有 `spacingAndGlyphs` 会返回 200.00；Firefox / Safari 可能直接返回强制值。因此所有量规一律以 `getStartPositionOfChar` / `getEndPositionOfChar` 的实测跨距为准，引擎读数只作对照印刷，两者不等时那条差异本身就是展品，不会导致版面出错。`getBBox({stroke:true})` 在 Chromium 152 与不带参数结果完全一致（实测同为 200.00×57.74），说明 SVGBoundingBoxOptions 未生效；标题的描边框改用 stroke-width/2 手工外扩，并把这一点印在标签里。`flood-color:currentColor` 解析的是 `<filter>` 自身继承的 color 而非被滤镜引用元素的颜色（Chromium 实测得 rgb(0,0,0)），这是规范语义而非 bug，因此各底板色用独立 filter 或在 `<filter>` 上声明 `--plate` 自定义属性来切换。`<?xml-stylesheet?>` 携带 `data:text/css` 在 Chromium 152 的 SVG-as-image 中确认生效（`fill=\"red\"` 的 rect 被 PI 改成 lime）；Firefox 对 data: 样式表限制更严，Safari 的 secure static mode 也可能忽略，故校样卡的呈现属性故意设为朱红并配说明文字：卡片呈朱红即表示该引擎忽略了 PI，页面依旧可读。SVG-as-image 三家引擎一律阻断外部字体，中间那张校样卡因此回退 serif，右侧卡把 micro subset 写进卡内 `@font-face` 才恢复本体字面。数值 font-weight 与 font-stretch 依赖真实 wght/wdth 轴：缺轴时 Chrome 只能合成粗体、宽度毫无变化（本机回退 serif 实测三档 font-stretch 宽度均为 202.44），自检栏据此打 ✗ 并盖「合成」印章。`font-kerning:none` 只有在 subset 保留 GPOS kern 时才有可测差值（本机回退字体实测 Δ=0.00）；SVG 1.1 的 `kerning` 属性在三家引擎均已移除，Δ 恒为 0，样本册用删除线行陈列。`text-rendering` 三档只有 Chrome 会因 optimizeSpeed 关闭连字与字距、geometricPrecision 关闭 hinting，Firefox 仅部分响应，Safari 基本忽略，Δ 为 0 时该行自动改印「本引擎无差异」。`white-space:pre` 在 Chrome / Firefox 正常（实测 101.16 对折叠 43.36），Safari 表现不稳，故正文块并列保留 `xml:space=\"preserve\"` 孪生行（Chromium 实测同为 101.16）作为兜底。几何长度单位：`r=\"1em\"` 属性三家可用（font-size 32 时 bbox 宽实测 64），`style=\"r:1rem\"` 依赖几何属性 CSS 化（实测 32 = 2×16），旧版 Safari 不支持时脚本回退为写像素值的属性并改印栏头。所有度量都必须在 `await document.fonts.ready` 之后进行，否则读到的全是回退字体的数值；截图前脚本会再核对一次 `document.fonts.check`，未加载则在纸面盖「字体未就绪·数值来自回退字面」印章而不是静默出错。

### 3.9 `pipeline-mimic-board` — 管网模拟盘

- **用途 / 家族**：process mimic board / plant instrumentation
- **复杂度**：expert　**标签**：`marker`, `context-paint`, `p-and-id`, `arrowheads`, `dimensioning`, `smil`
- **设计问题**：一套 marker 定义能独自扛起多少工艺图语义——流向、阀态、仪表类型与尺寸标注？

**场景**　一块灰橙调的车间调度模拟盘：左侧主盘上是原料罐 T-01、换热器 E-01、双泵撬 P-01/P-02 与一圈闭合的冷却水环，管线用 polyline、line、polygon 三种基本形状拉通；盘上看得见的每一枚箭头、蝶阀符、仪表圈和量程短撇都不是独立图元，而是同一批 marker 在顶点上长出来的——箭随管走，回流支路只靠 orient="auto-start-reverse" 就在同一枚箭头定义下两端自动掉头读作可逆流，同一枚阀符在蒸汽管上取橙、在冷却水管上取灰蓝，全靠 context-stroke / context-fill 而不复制符号；斜置的泵撬被 skewX 带歪时，管线与其上的阀符一起被切变，旁边用 skewY 的冷却塔平台作对照。右侧一柱四扇转角解剖窗把机制单独放大：直角折点上的角平分线（讲清中点标记为何既不朝进边也不朝出边）、同一组点表交给 polygon 与 polyline 时闭合顶点的朝向差、非缩放描边下发丝线配巨大箭头的反差、以及 refX / markerWidth / preserveAspectRatio 的几何三联。底带左半是尺寸标注带，0°、90°、30° 三条尺寸线的端撇因 orient="auto" 永远垂直于各自的线；右半是图例、联锁逻辑小图与“marker 对 symbol”的取舍对照。指针停在任一管段上时，整条线换用另一组高亮标记，量程游标沿管滑到指针处并报出该点 DN 与流向。

**主打特性**

- `av:marker.orient=auto-start-reverse` — orient auto-start-reverse
- `concept:marker-vertex-bisector` — mid-marker direction is the bisector of adjacent segments
- `pv:fill=context-stroke` — Cross-using context paints (fill=context-stroke)
- `concept:marker-dimension-ticks` — dimension line ticks perpendicular to the line
- `concept:marker-closed-path-direction` — closed subpath orientation at the closing vertex
- `concept:marker-smil-attribute-animation` — SMIL animation of refX, orient, markerWidth
- `concept:marker-non-scaling-stroke` — markers under vector-effect non-scaling-stroke

**辅助特性**

`el:marker`、`el:line`、`el:polyline`、`el:polygon`、`at:polygon.points`、`at:polyline.points`、`at:line.x1`、`concept:line-has-no-fill-area`、`concept:polyline-fill-implicit-close`、`concept:points-odd-coordinate-count`、`concept:points-parse-error-partial-render`、`api:SVGPointList`、`pv:fill=context-fill`、`pv:stroke=context-stroke`、`pv:stroke=context-fill`、`concept:context-paint-in-use`、`concept:context-paint-gradient`、`concept:marker-currentcolor`、`pv:paint-order=markers`、`pr:marker-knockout-left`、`concept:gradient-on-marker`、`concept:marker-content-paint-servers`、`concept:nested-markers`、`concept:marker-text-content`、`concept:marker-style-isolation`、`concept:marker-display-ua-style`、`concept:markers-on-basic-shapes`、`at:marker.markerWidth`、`at:marker.markerHeight`、`av:marker.markerWidth=0`、`at:marker.refX`、`av:marker.refX=center`、`at:marker.refY`、`at:marker.markerUnits`、`av:marker.markerUnits=userSpaceOnUse`、`concept:marker-without-stroke`、`at:marker.orient`、`av:marker.orient=auto`、`av:marker.orient=angle`、`concept:marker-curve-tangent`、`concept:marker-reverse-arrow-fallback`、`concept:marker-zero-length-direction`、`at:marker.viewBox`、`at:marker.preserveAspectRatio`、`av:marker.preserveAspectRatio=none`、`pr:marker-start`、`pr:marker-mid`、`pr:marker-end`、`pr:marker`、`pv:marker=none`、`css:marker-properties`、`concept:marker-property-inheritance`、`concept:marker-subpath-vertices`、`concept:marker-dashed-stroke`、`concept:marker-arrowhead`、`concept:marker-vertex-glyphs`、`concept:marker-graph-nodes`、`concept:marker-vs-symbol`、`concept:marker-pointer-events`、`concept:marker-css-state-swap`、`api:CSSStyleDeclaration.markerEnd`、`concept:marker-animated-content`、`concept:marker-follows-animated-path`、`api:SVGMarkerElement.setOrientToAuto`、`api:SVGMarkerElement.setOrientToAngle`、`api:SVGMarkerElement.orientType`、`api:SVGMarkerElement.refX`、`api:SVGMarkerElement.markerUnits`、`api:SVGMarkerElement.viewBox`、`api:SVGBoundingBoxOptions.markers`、`concept:marker-transform-inheritance`、`pv:transform=skewX`、`pv:transform=skewY`、`css:hover`、`css:active`、`concept:hover-state-transition`

**构造要点**

1. 舞台与底板：根元素 <svg viewBox="0 0 1400 900">，不铺整幅背景以保住透明。三块半透明底板 <rect rx="10">（fill rgba(28,26,24,.82)，stroke rgba(200,150,90,.28)）——主流程盘 (24,24,976,636)、解剖窗柱 (1016,24,360,636)、底带 (24,676,1352,200)。配色令牌写在 :root：--steam #e8792b、--cw #7f9db0、--cond #c98a3c、--panel #8d959b、--ink #e9e2d8。位号字体用一款窄体等宽 woff2 以 data URI 内嵌 @font-face（family: MimicMono），marker 内的 <text> 显式声明该 family 并给 ui-monospace 回退，避免网络被禁时字形塌陷。
2. 标记族（全部集中在 <defs>，一律 viewBox="0 0 100 100" 以便在不同 markerWidth 下等比缩放）：#mk-arrow（三角箭头，refX=92 refY=50，fill=context-stroke，markerUnits=strokeWidth，markerWidth/markerHeight=6，orient=auto-start-reverse）、#mk-valve（蝶阀双三角，stroke=context-stroke、fill=context-fill、stroke-width=8，orient=auto）、#mk-inst（仪表圈：circle + 内含 <text>FT</text>，markerUnits=userSpaceOnUse、markerWidth/markerHeight=18、refX=refY=9）、#mk-tick（量程短撇：局部 y 向竖条，refY=0 使刻度悬在管下）、#mk-dim（尺寸端撇：竖条 refX=50 refY=50，orient=auto）、#mk-node（联锁节点圆 + <text>I</text>）、#mk-hatch（保温斜撇，内容用 <pattern> 填充，orient 固定角）、#mk-head（主流向大箭头，内容 fill 指向 objectBoundingBox 的 <radialGradient id="g-head">，即渐变按标记自身 bbox 求解）、#mk-noz（接管符号，内容里的小 polyline 自身再挂 marker-end 形成嵌套标记）。<marker> 元素本身由 UA 样式 display:none，从不直接绘制，只被引用。
3. 上下文取色三条路：①管线一律 fill="none" stroke="var(--steam|--cw|--cond)"，#mk-arrow 用 fill="context-stroke" 得到与管同色的实心箭尖，#mk-inst 外圈用 stroke="context-stroke"；②设备多边形（T-01 罐体、E-01 壳体、冷却水闭环）有真实 fill，其顶点标记用 fill="context-fill"、描边用 stroke="context-fill" 抓罐体填充色；③报警态由宿主组设置 color 属性，标记内容用 currentColor 跟着变红。图例诊断行放一枚故意写在普通 <rect> 上的 fill="context-stroke" 样例并打叉，说明上下文取色只在标记内容中有效。主蒸汽总管 stroke 指向 userSpaceOnUse 的 <linearGradient id="g-steam">，箭头经 context-stroke 继承该渐变。
4. 工艺拓扑（主盘用户坐标）：T-01 罐体 polygon "72,140 192,140 192,318 132,340 72,318"（有 fill）；E-01 换热器壳体 (470,150,180,120) 加折流板 polyline；泵撬 P-01/P-02 位于 <g transform="skewX(-12) translate(236,392)">；冷却水闭环 polygon "700,250 880,230 946,340 886,470 716,486 658,368"（低透明 fill）；蒸汽总管 polyline "72,96 420,96 420,150" 与 "650,210 940,210 940,470"，stroke-width=9；冷却水支管 stroke-width=3；回流支路 polyline "560,290 560,360 300,360 300,132 150,132"；换热器出口一段用 <path> 的 C 命令走曲线，让 orient=auto 沿曲线切线摆放箭头；跨接管写成含两个 M 子段的 path，展示子段各自的端点也长标记。
5. 阀与仪表全部由标记生成，盘面上没有任何独立阀体元素：管线加 marker-start=url(#mk-arrow)、marker-mid=url(#mk-valve)、marker-end=url(#mk-arrow)，折点即阀位。回流支路两端都引用同一个 #mk-arrow，靠 orient="auto-start-reverse" 让起点箭头自动反向，一条线直接读作可逆流；紧邻的旁通支路保留传统做法（复制一份 <marker id="mk-arrow-rev"> 内容 transform="rotate(180 50 50)"），既是老浏览器回退也是省下多少定义的对照。信号线用 stroke-dasharray 虚线，但其上的仪表圈保持实心，说明标记不吃宿主的 dash 与字号（样式隔离）。
6. markerUnits 分层承担“符号随管径”的行业读法：#mk-valve 用 strokeWidth 单位，于是 DN300 蒸汽总管（stroke-width 9）上的阀符大、DN50 冷却水支管（stroke-width 3）上的阀符小；#mk-inst 用 userSpaceOnUse，仪表圈在任何管径上恒为 18px，保证位号可读。图例区六条符号轨用 <line stroke="none" fill="var(--steam)"> 只挂 marker-start/mid/end——线本身不可见（line 没有填充区域，给了 fill 也不显示），只留下一排符号。
7. marker 简写与继承：底带尺寸线用 CSS 规则 .dim{marker:url(#mk-dim)} 一条声明覆盖起/中/末三处端撇；#instr-group{marker-mid:url(#mk-inst)} 让组内多条管线继承同一枚仪表圈；被隔离的检修段用 .isolated{marker:none} 关掉全部符号；另一段“符号停用”的支路则由 SMIL 把 #mk-valve-off 的 markerWidth 从 6 动到 0，标记视口归零后符号整体消失，作为 marker:none 的动态版本对照。
8. 尺寸标注带（底带 x 60..690）：三条尺寸线——水平 8600 的 <line>、竖直 3200 的 <line>、随斜置撬块旋转 30° 的 <polyline>（带一个中间折点以显示 mid 端撇）。端撇在标记内画成沿局部 y 的竖条，配 orient="auto" 后自动垂直于任意角度的尺寸线；量程短撇 #mk-tick 的 refY=0 让刻度悬在管下方而非骑线。标注数值先尝试 el.getBBox({markers:true}) 取含箭头的真实包围盒，浏览器忽略该选项时回退为手工把 markerWidth×stroke-width 折算进去，读数行同时打印“几何 bbox / 含标记 bbox”两组数字。
9. 图例与小图（底带 x 700..1352 及主盘右下）：①marker 对 symbol 对照——左边阀符由 marker 自动定向、随描边缩放但不可命中，右边同一图形用 <symbol>+<use> 手工摆放并可 hover 出提示框，验证标记内容不接收指针事件、命中目标始终是宿主路径；②联锁逻辑小图用四条 <line> 当边，marker-start=url(#mk-node) 自动长出节点圆（内含 <text>I</text>），marker-end=url(#mk-arrow) 长出箭头，边端点由 JS 写 x1/y1/x2/y2 生成；③流量趋势带是一条 polyline，marker-mid=url(#mk-dot) 在每个数据顶点放圆点；④报警星是一枚 points 用逗号与空白混排的 polygon，JS 通过 points（SVGPointList）的 getItem/replaceItem 推动一个顶点做闪烁报警。
10. 解剖窗 W1 转角平分线 (1032,40,328,145)：把折线 (1060,70)-(1160,70)-(1160,160) 放大绘制，叠画入边与出边切向的两枚虚线幽灵箭头、实际的中点标记、以及标注 45° 的角弧，说明中点标记方向取两邻段的角平分线；窗内右下角另放一个把折点重复一次的零长段样本，标出方向从相邻非零段继承。
11. 解剖窗 W2 闭合方向 (1032,197,328,145)：同一组三点分别交给 <polygon> 与 <polyline>，polygon 的自动闭合段让起点标记角度落在闭合段与首段之间，polyline 的起点标记则纯朝首段，两者并排且用弧线标出角差；两图都给同色半透明 fill，展示 polyline 填充时的隐式闭合轮廓与开口描边的差别；窗底放一份坐标个数为奇数的 points 样本，末尾孤立坐标被丢弃后只渲染前面的部分。
12. 解剖窗 W3 非缩放描边 (1032,354,328,145)：左半 <g transform="translate(1060,380) scale(3)"> 内的折线加 vector-effect="non-scaling-stroke"，描边保持 1px 发丝，而 markerUnits=strokeWidth 的箭头按用户坐标的 stroke-width 与 CTM 一起放大，形成“发丝线配巨大箭头”的反差；右半是未缩放的孪生件加一枚 userSpaceOnUse 标记作尺寸基准，两者用等长基线对齐便于测量。
13. 解剖窗 W4 几何三联 (1032,511,328,145)：第一行 refX=0 与 refX=92 对照（箭头过冲折点 vs 箭尖正压折点），并试写 refX="center"，脚本探测失败时回退为 viewBox 中心的数值；第二行同一箭头内容分别用 markerWidth/markerHeight=3 与 8，无 viewBox 的副本展示内容被视口裁掉；第三行在 markerWidth=8 markerHeight=4 的 2:1 盒里放正方 viewBox，分别用 xMinYMid meet / xMaxYMid meet / none 得到法兰左贴、右贴、拉伸三态；行末列出 orient 的四种写法 45、45deg、0.7854rad、50grad，并把 orientAngle.baseVal.value 的实测值打在旁边。
14. 斜置机组与描边击穿：泵撬 <g transform="skewX(-12)"> 内的管线连同阀符、箭头一起被切变（标记跟随引用元素的变换）；相邻的冷却塔平台用 skewY(-8) 作对照，水平边倾斜而竖直边保持竖直。蒸汽总管取一段设 paint-order="markers stroke fill"，粗描边压过大号阀符，在符号左侧形成明显的描边击穿缺口，紧邻的对照段用默认顺序，两段之间加一条引线标注。
15. 动画与静帧：#mk-cursor 的 refX 用 <animate attributeName="refX" values="0;-64;0" dur="6s" repeatCount="indefinite"> 驱动——orient=auto 时 refX 轴即管线切向，于是量程游标沿管滑动；#mk-head 的 orient 用 animate 在固定角与 auto 之间切换；#mk-valve 内部的蝶板自身有 animateTransform 脉动（标记内容动画）；一条旁路管的 d 被 SMIL 动画，其上的箭头跟着动画后的路径走。截图前脚本执行 svg.pauseAnimations(); svg.setCurrentTime(2.4)，冻结在游标位于管段中部、阀符半开、主箭头对齐管向的可读静帧。
16. 指针交互与 DOM 面板：pointermove 用 getScreenCTM().inverse() 把指针换算到用户坐标，逐段投影求最近管段，给该 polyline 加 .live 类；CSS .live{marker-mid:url(#mk-valve-hi);marker-end:url(#mk-arrow-hi)} 完成整线标记换组，JS 同时写 el.style.markerEnd 作为等价的脚本路径；把 #mk-cursor 的 refX.baseVal.value 设为负的投影距离，让量程标记滑到指针处，读数行打出该点 DN 与流向。CSS 另有 path:hover 的描边渐变过渡与 :active 的加深态。面板按钮调用 setOrientToAuto() / setOrientToAngle(SVGAngle.SVG_ANGLETYPE_DEG,45) 切换保温撇朝向，并回读 orientType、refX.baseVal.value、markerUnits.baseVal、viewBox.baseVal 打印到诊断行。

**验收要点**

1. 回流支路的 marker-start 与 marker-end 在 DOM 中指向同一个 id（#mk-arrow），而 PNG 上两枚箭头分别朝向管线两端，方向相反。
2. W1 中点标记的旋转角为入边与出边方向的平均（读数 45°±1°），与画出的两枚幽灵切向箭头都不重合；零长段样本的标记方向与其相邻非零段一致。
3. 同一个 #mk-valve 在蒸汽管上取样像素接近 --steam(#e8792b)、在冷却水支管上接近 --cw(#7f9db0)，且 DOM 中两条管线的 marker-mid 解析为同一 id、场景中该 marker 只定义一次。
4. W2 中 polygon 与 polyline 使用同一份 points（DOM 可比对字符串相等），但起点标记的渲染角度可见不同；奇数坐标样本只渲染到最后一个完整坐标对。
5. 底带三条尺寸线（0°、90°、30°）的端撇与各自线的夹角均为 90°±2°；量程短撇整体位于管线下方（refY=0 生效），不跨过线心。
6. W3 中被 scale(3) 的管线描边在 PNG 上仍量得约 1px，而其箭头面积明显大于右侧未缩放孪生件的同款箭头。
7. 调用 pauseAnimations() 并 setCurrentTime(2.4) 后，量程游标停在管段中部且不与端点重叠，#mk-cursor 的 refX.baseVal.value 读数非 0；同一时刻阀符处于半开姿态。
8. 在任一管段上派发 pointermove 后：该 polyline 带有 .live 类，getComputedStyle 的 markerMid 指向高亮标记 id，读数行出现该点 DN 与流向文字，PNG 上该整条线的符号换色。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- context-fill / context-stroke 在 2026 年的 Chromium、Firefox、Safari 均可用（Chromium 97+、Safari 16.4+），仍做特性探测：离屏渲染一枚 fill=\"context-stroke\" 的标记并读 getComputedStyle().fill，拿不到上下文色时由 JS 按介质克隆三份标记并改写 marker-* 引用，视觉退化为“每种介质一枚符号”。上下文取色引用渐变（context-paint-gradient）在各引擎对 gradientUnits=\"objectBoundingBox\" 在标记坐标系下的重解析并不一致，WebKit 倾向按标记内容自身 bbox 求解，故主蒸汽渐变改用 userSpaceOnUse，并在 #mk-head 内自带一份 radialGradient 保证造型稳定。orient 的带单位写法（45deg / 0.7854rad / 50grad）属 SVG2，Chromium 与 WebKit 仍可能整条属性失效回落为 0，因此实际管线只写裸数值，W4 把 orientAngle.baseVal.value 的实测值打印出来把浏览器差异变成内容。refX=\"center\" 至今无实现，探测后回退为 viewBox 中心的数值 refX。getBBox({markers:true}) 的 SVGBoundingBoxOptions 三家都未生效，尺寸带手工把 markerWidth×stroke-width 折进包围盒并同时展示两组数字。SVG2 的分布式标记 marker-pattern / marker-segment / marker 的 position 属性全无实现，场景不依赖，仅在图例里标为“未实现”。嵌套标记（#mk-noz 内容里的路径再挂 marker-end）在 Chromium 与 Firefox 渲染，WebKit 偶有丢失，探测后把内层箭头替换为预烘焙 path。auto-start-reverse 在旧 WebKit 缺失，保留 rotate(180) 的 #mk-arrow-rev 作回退（同时也是节省定义的对照）。SMIL 对 refX / orient / markerWidth 的 animate 在 Chromium 与 WebKit 稳定，Firefox 对标记属性动画的重绘节流较明显，故截图统一走 pauseAnimations()+setCurrentTime(2.4) 取确定静帧。标记内容在所有引擎都不接收指针事件，hover 命中目标只能是宿主路径，需要可点的阀件用 <use> 版本承担。网络被禁：位号字体以 woff2 data URI 内嵌，标记内 <text> 显式指定字体族并给系统等宽回退，避免标记样式隔离导致继承不到宿主字体时字形跳变。

### 3.10 `four-colour-press-check` — 四色套印检版台

- **用途 / 家族**：prepress proofing / printing
- **复杂度**：expert　**标签**：`prepress`, `halftone`, `color-separation`, `svg-filters`, `duotone`, `registration`, `color-space`
- **设计问题**：检版台怎样把一张样张拆成四色墨版，又当场证明这次分色能原样叠回来？

**场景**　一张摊开的检版台。正中压着 640×392 的套印样张，四角钉着套准十字靶，尾部一条色控条；左栏自上而下摊开青、品红、黄、黑四张单色分色片，每张片子上印着自己的曝光曲线类型与网角；样张下方是网点对照台——同一块中间调渐变被两条路各加网一次，左边是平铺网点、右边是滤镜网屏，两块之间留一条接缝；一只网点放大镜停在接缝上，镜内左右并排显示两种网点的网角、边缘和莫尔纹。右栏是控制侧：四条曝光曲线、两张回验残差片、一张一致性验版片、双色打样卡、校色小样和挖空／陷印试片行。

分色由 feColorMatrix 取墨量、feComponentTransfer 走曝光曲线、再由一次 duotone 映射把墨量涂成墨色；叠印把四张透射率图用 feComposite operator="arithmetic" k1="1" 连乘三次还原成彩色——减色叠印在数学上就是相乘。台面回答设计问题的方式很直接：回验片把叠印结果与原稿做 feBlend mode="difference" 再放大六倍，分色与叠印在同一空间（sRGB）时残差近黑，说明这次拆分可逆；把叠印段换成 linearRGB，中间调立刻亮起来，"为什么发灰"在同一画面里得到答案。拉动任何一版的曝光曲线，样张、残差片同时跟着变。最难忘的是放大镜下的两条网点路：矢量 pattern 的点在放大八倍后依旧锐利，滤镜网屏因为源头是位图被放大成设备像素软边，而套准十字旁边的 ×8 对照则摆明了 translate(0.5 0.5) 前后一根 1px 线的死活。

**主打特性**

- `el:feComponentTransfer` — feComponentTransfer per-channel remap
- `concept:duotone-via-component-transfer` — Duotone/false-colour by greyscale plus per-channel tables
- `av:feComposite.operator=arithmetic` — feComposite arithmetic with k1..k4
- `pr:color-interpolation-filters` — color-interpolation-filters (linearRGB default vs sRGB)
- `concept:halftone-dots` — Halftone dot screen
- `concept:filter-input-wiring` — in / in2 / result wiring between primitives

**辅助特性**

`el:filter`、`pr:filter`、`at:filter.x`、`at:filter.filterUnits`、`concept:filter-primitive-subregion`、`el:feMerge`、`el:feMergeNode`、`el:feBlend`、`el:feComposite`、`el:feColorMatrix`、`el:feFuncR`、`el:feFuncG`、`el:feFuncB`、`el:feFuncA`、`concept:halftone-pattern`、`concept:filter-device-pixel-resolution`、`concept:half-pixel-crisp-alignment`、`pr:shape-rendering`、`pr:color-interpolation`、`pv:shape-rendering=auto`、`pv:shape-rendering=optimizeSpeed`、`pv:shape-rendering=crispEdges`、`pv:shape-rendering=geometricPrecision`、`concept:half-pixel-crisp-lines`、`concept:gradient-banding-noise`、`pv:filter=none`、`api:CSS.supports-filter`、`concept:filter-region-default`、`concept:filter-region-clipping-trap`、`av:filter.filterUnits=objectBoundingBox`、`av:filter.filterUnits=userSpaceOnUse`、`concept:reuse-filter-across-elements`、`concept:filter-and-transform`、`concept:filter-clip-mask-opacity-order`、`concept:primitive-subregion-defaults`、`concept:subregion-crop-technique`、`pv:color-interpolation-filters=sRGB`、`pv:color-interpolation-filters=linearRGB`、`concept:implicit-chaining`、`concept:last-primitive-is-output`、`concept:multiple-results-fan-out`、`av:feGaussianBlur.in=SourceGraphic`、`api:SVGFilterPrimitiveStandardAttributes.result`、`at:feMergeNode.in`、`at:feBlend.in2`、`at:feBlend.mode`、`av:feBlend.mode=multiply`、`av:feBlend.mode=screen`、`av:feBlend.mode=darken`、`av:feBlend.mode=overlay`、`av:feBlend.mode=luminosity`、`av:feBlend.mode=difference`、`at:feComposite.operator`、`av:feComposite.operator=over`、`av:feComposite.operator=in`、`av:feComposite.operator=out`、`av:feComposite.operator=atop`、`av:feComposite.operator=xor`、`av:feComposite.operator=lighter`、`at:feComposite.k1`、`at:feColorMatrix.type`、`at:feColorMatrix.values`、`av:feColorMatrix.type=matrix`、`av:feColorMatrix.type=saturate`、`av:feColorMatrix.type=hueRotate`、`concept:premultiplied-alpha-in-colormatrix`、`at:feFuncR.type`、`av:feFuncR.type=identity`、`av:feFuncR.type=table`、`av:feFuncR.type=discrete`、`av:feFuncR.type=linear`、`av:feFuncR.type=gamma`、`at:feFuncR.tableValues`、`at:feFuncR.slope`、`at:feFuncR.intercept`、`at:feFuncR.amplitude`、`at:feFuncR.exponent`、`at:feFuncR.offset`、`api:SVGComponentTransferFunctionElement.tableValues`、`api:SVGFEColorMatrixElement.values`、`concept:filter-performance-caveats`、`el:pattern`、`at:pattern.patternTransform`、`concept:mouse-to-svg-coordinates`、`api:SVGGraphicsElement.getScreenCTM`

**构造要点**

1. 台面与坐标：1400×900 透明舞台，根 `<svg id="stage">` 内所有内容包进 `<g transform="translate(0.5 0.5)">`，使全场 1px 描边落在像素中心。三栏布局——A 栏 x36–300 摊四张分色片（264×176，y=108/296/484/672）；B 栏 x336–1000 是样张 (348,100,640×392)、网点对照台 (348,504,640×196) 与检查行 (348,712,640×154)；C 栏 x1044–1364 是控制侧（曲线 y100–260、叠印算路 y272–460、回验片 y468–560、双色卡 y568–648、校色小样 y656–724、merge 顺序 y732–800、挖空陷印试片 y808–866）。每块面板 8px 圆角、1px 边框、左上角一枚编号铅字块。
2. 两张位图，其余全矢量：启动时用离屏 `<canvas>` 程序化画一张 320×200 的原稿（蓝布上的橘子，另含 18% 中性灰块、C/M/Y/R/G/B 实地块、一条肤色渐变），`toDataURL('image/png')` 后写入 `<defs><image id="plate-source" width="320" height="200" href="data:image/png;base64,…">`，全场用 `<use href="#plate-source">` 复用；同法生成一张 640×400、8px 单元、45° 预铺满的网屏位图 `#screen-bitmap` 和一张 128×128 蓝噪位图 `#dither-bitmap`。除这三个 data: URI 外不请求任何外部资源，文字用 system-ui/ui-monospace 栈，不加载 webfont。
3. 单版分色链（四张片同构，三条 primitive）：`feColorMatrix type="matrix"` 把墨量写进 RGB 三通道——青版 R'=G'=B'=1−R（values 行 `-1 0 0 0 1`），品红版取 1−G，黄版取 1−B，黑版先 `type="saturate" values="0"` 再取 1−L；接 `feComponentTransfer` 走曝光曲线，四版故意各用一种函数类型：青 `feFuncR/G/B type="table" tableValues="0 .18 .42 .68 .86 1"`、品红 `type="gamma"` 的 amplitude/exponent/offset、黄 `type="linear"` 的 slope/intercept、黑 `type="discrete" tableValues="0 0 0 .15 .38 .62 .85 1"` 做 UCR 骨架黑；末条再用一个 `feComponentTransfer` 做 duotone 上色，tableValues 只有两个端点＝纸白与墨色（青片 R:"1 0.06" G:"1 0.62" B:"1 0.80"），未参与的通道写 `type="identity"`。每张片右侧再挂一枚 90×60 单通道特写小样：只开 `feFuncR type="table" tableValues="1 0"`（白变青、红变黑）、只开 `feFuncG type="gamma" exponent="0.45"`（中性灰偏绿）、只开 `feFuncB tableValues="0 0"`（暖黄），三张共用同一 `<use href="#plate-source">`。
4. 叠印滤镜 `#overprint` 的接线：SourceGraphic 先过一条 identity `feColorMatrix result="src"`，`src` 扇出到四条与上一条同构的 ink 分支（共享同一组 tableValues），各输出一张不透明的透射率图 cyanT/magT/yelT/blkT；随后三次 `feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0"` 依次相乘（cyanT×magT→cm，cm×yelT→cmy，cmy×blkT→cmyk）——减色叠印就是透射率连乘；最后 `feComposite in="cmyk" in2="cmyk" operator="arithmetic" k2="0.96" k4="0.03"` 压总墨量并抬纸白。`feGaussianBlur in="cmyk" stdDeviation="1.6" result="spread"` 一次算出、两处复用（网点扩大晕与陷印环），滤镜面板上用一张接线图把 result 名与 in/in2 箭头画出来。
5. 色控条用 primitive subregion：同一滤镜内 `feFlood flood-color="#f4f1ea" x="4%" y="88%" width="92%" height="8%" result="barBase"`，再 `feComposite in="barBase" in2="cmyk" operator="in" result="bar"`，于是纸白带只出现在样张尾部而不是铺满整个滤镜区；旁边留一枚不写 x/y/width/height 的对照 feFlood 缩略图，显示默认子区域＝整个滤镜区。控制条上的 C/M/Y/K 实地块与 50% 网点测控块是滤镜外的普通 `<rect>`。
6. 收尾 feMerge 与顺序对照：`feMerge` 依次叠 `<feMergeNode in="spread"/><feMergeNode in="cmyk"/><feMergeNode in="bar"/>`（扩大晕在下、实地居中、色控条在上）；C 栏 (1052,732) 两张 120×80 缩略图把后两个 feMergeNode 调换，右图的色控条被叠印盖住，坐实“最后一个节点画在最上”。
7. 两条叠印算路与一致性验版片：`#overprint-arith` 与 `#overprint-blend`（四条同样的 ink 分支，改用 `feBlend mode="multiply"` 串起来）各出一张 190×120 试片；第三张 `#overprint-diff` 在同一滤镜里同时算两条路，用 `feBlend mode="difference"` 相减、再接 `feComponentTransfer type="linear" slope="6"` 放大残差，近黑即证明两条路等价。旁边一条五格 `feBlend` 模式试片（multiply/screen/darken/overlay/luminosity）说明印刷为何只认 multiply。
8. 回验残差与色空间：两张 190×120 回验片把 `#overprint` 的输出与原稿做 `feBlend mode="difference"`、再 `type="linear" slope="6"` 放大。左片整条链 `color-interpolation-filters="sRGB"`——分色定义在编码值上，叠印也在编码值上相乘，残差近黑，分色可逆；右片把叠印段改成 `linearRGB`，跨空间相乘后中间调整体亮起、样张发灰，标签直接写“为什么发灰”。下方再放一对经典小样：红／绿边界各模糊一次，linearRGB 版中间偏亮黄、sRGB 版偏暗浊。
9. 灰梯尺行 (348,712,300×70)：第一条是连续渐变原尺；第二条同一渐变过 `feComponentTransfer` 的 `feFuncR/G/B type="discrete"` 21 段 tableValues，切成 21 级阶调；第三条在连续渐变上用 `feImage href="#dither-bitmap 的 data URI"` 加 `feComposite operator="arithmetic" k2="1" k3="0.03" k4="0"` 掺入蓝噪，压掉肉眼可见的阶梯带。右侧 (660,712,300×70) 另放两条纯渐变梯尺，分别写 `color-interpolation="sRGB"` 与 `"linearRGB"`，脚本采样两条中点后把“本浏览器有／无差异”的实测结果印在标签上（Firefox 有、Chrome/Safari 无）。
10. 网点对照台的两条路：同一条 0→100% 中间调渐变加网两次。左块 (356,520,240×140) 纯矢量——`<pattern id="screen-c" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">` 内一枚圆点，按阶调切换五档半径的 pattern 铺出网点阶调；右块 (596,520,240×140) 走滤镜网屏——`feImage href="data:image/png…" result="screen"` 取 45° 网屏位图，`feComposite in="SourceGraphic" in2="screen" operator="arithmetic" k2="1" k3="-1" k4="0.5"` 求 tone−screen+0.5，再用 `feComponentTransfer` 的 `feFuncR/G/B/A type="discrete" tableValues="0 1"` 阈值化成硬边网点，最后 `feColorMatrix` 上青墨色；点面积随阶调变化的关系与左块一致。两块共用 x=596 的接缝。右上再挂两枚 136×66 小片：一枚按 C15°/M75°/Y0°/K45° 叠出玫瑰斑，一枚故意用 15°/18° 叠出莫尔纹，唯一差别就是 `patternTransform="rotate(θ)"`，角度印在片下。
11. 放大镜：`<g id="loupe">` 用 `clipPath` 圆（r=92）套一份 `<use href="#table-art" transform="translate(px,py) scale(8) translate(-px,-py)">`，镜筒投影滤镜写 `filterUnits="userSpaceOnUse"` 并把 x/y/width/height 固定成圆的外接矩形，于是几何放大八倍而环晕宽度不变；镜内左半（pattern 网点）在 ×8 下依旧是锐利矢量边，右半（feImage 网屏）因为源头是固定像素密度的位图被放大成设备像素软边／锯齿，镜内直接印出两侧实测的边缘过渡像素数与点面积率。clip 在 filter 之后生效，投影因此不会被圆裁掉——面板上注明这层效果顺序。放大镜每帧只重算一次滤镜，指针空闲时冻结缓存，避免 ×8 滤镜逐帧重栅格化。
12. 套准十字与半像素：样张四角各一枚 1px stroke 的十字靶，左上一枚落在整数坐标、右上一枚放进 `<g transform="translate(0.5 0.5)">`；检查行 (348,790) 用 ×8 的 `<use>` 把两枚并排放大，整数版竖线糊成两列灰、半像素版是一列实黑。十字的陷印环由 `feGaussianBlur in="SourceAlpha"` → `feComponentTransfer` 的 `feFuncA type="discrete" tableValues="0 1"` 阈值化成硬边 → `feComposite operator="out"` 与原图相减得到，宽度约 0.6pt。C 栏底部 (1052,808) 一行六枚 44×44 挖空／陷印试片，分别用 `feComposite operator="over|in|out|atop|xor|lighter"`，标签写清它们在版上的名字：压印、专色限域、挖空、承印、互斥叠印、加亮。
13. 滤镜区域、单位与两种写法：左上十字的光晕滤镜用默认区域（x=-10% width=120%），光晕被切成方边；右上同效果的滤镜改 `x="-50%" y="-50%" width="200%" height="200%"`，光晕完整——两枚并排标注“滤镜区域裁切陷阱”。另一组把同一个网点扩大滤镜同时套到 56×56 小样与 132×132 大样：`filterUnits="objectBoundingBox"` 一组晕随尺寸缩放（错），`userSpaceOnUse` 一组固定 3px（对）。这两个大样一个写 `filter="url(#dot-gain)"` 属性、一个写 `style="filter:url(#dot-gain)"` CSS，结果必须完全一致；台面左上的原稿参照片写 `filter="none"`，右下角印一行 `CSS.supports('filter','url(#dot-gain)')` 的实测返回值。
14. shape-rendering 角线靶：检查行右段 (760,790) 四枚 44×44 带斜边的星形套准靶，分别写 `shape-rendering="auto"`、`"optimizeSpeed"`、`"crispEdges"`、`"geometricPrecision"`，统一 ×4 放大后并排；脚本沿每枚靶的同一条斜边扫描，量出灰度过渡像素数并印在靶下（不写死结论，因为三家浏览器实现不同）。
15. 校色小样、双色卡与预乘警示：C 栏 `feColorMatrix` 三连——`type="matrix"` 的墨量提取、`type="saturate" values="0"` 的黑版灰度、`type="hueRotate" values="30"` 的色相偏移检查，三张缩略图共用同一 `<use href="#plate-source">`；双色打样卡走“saturate 0 → feComponentTransfer 端点 tableValues 映射到 #17324f→#f2c14e”的 duotone，与四张分色片是同一套 primitive，只换端点颜色。旁边一枚 64×64 警示片：同一 offset 型 color matrix 分别作用在透明片基与不透明纸基上，透明那张边缘出现预乘 alpha 造成的暗边，说明为什么叠印前要先垫纸基。
16. 交互与静帧：`pointermove` 用 `getScreenCTM().inverse()` 把指针换算到 SVG 坐标，(a) 移动放大镜并刷新镜内读数，(b) 若落在 C 栏某条曲线面板内，按 y 改写该版 feFunc 的中段 `tableValues`（用 setAttribute 写、用 `tableValues.baseVal` 读回校验），同时更新曲线折线、样张与两张回验片，(c) `__INTERACTION_COUNT__++`。`?export=1` 时把放大镜停在接缝 (596,590)、四条曲线复位到默认，等一帧后置 `__VIS_READY__ = true`，静帧里两条网点路、残差近黑的可逆证明与发灰的跨空间对照全部在位。

**验收要点**

1. DOM：`#overprint` 内 `result="src"` 被四条 ink 分支的 `in` 引用，三条 `feComposite[operator="arithmetic"][k1="1"][k2="0"][k3="0"][k4="0"]` 把 cyanT/magT/yelT/blkT 串成 cmyk，且滤镜内所有 in/in2 要么是标准输入名要么指向已存在的 result（无悬空引用）。
2. PNG：同空间回验片（sRGB）190×120 区域平均亮度 < 12/255；跨空间回验片（linearRGB 叠印）同区域 > 40/255，两者相差 ≥ 3 倍——分色可逆与“为什么发灰”同时成立。
3. PNG：一致性验版片（arithmetic 与 feBlend multiply 的 difference ×6）平均亮度 < 8/255，最大亮度 < 40/255。
4. PNG：沿 21 阶灰梯尺中线采样 300 点，能分出 21 个平台，平台内标准差 ≤ 2/255、相邻平台差 ≥ 8/255；同排加噪那条的相邻列亮度差方差高于 discrete 那条，证明抖动生效。
5. PNG：放大镜圆内沿水平中线扫描，左半 pattern 网点每个点边缘的灰度过渡 ≤ 2 像素、右半 feImage 网屏 ≥ 4 像素，而两半的点心间距差 ≤ 1px——同一网线数，两种栅格化。
6. PNG：半像素 ×8 对照区里，`translate(0.5 0.5)` 一侧的竖线只占 1 列且最暗值 ≤ 40/255；整数坐标一侧占 2 列且最暗值 ≥ 90/255。
7. PNG：四张分色片各取 40×40 实地区，青片 hue ∈ [185°,205°]、品红 ∈ [315°,335°]、黄 ∈ [45°,62°]，黑片饱和度 < 0.08。
8. DOM + PNG：两次 pointermove 后 `__INTERACTION_COUNT__` 增加、`#loupe` 的 transform 跟随指针；拖动品红曲线面板后 `#curve-m` 里 feFuncG 的 `tableValues.baseVal.numberOfItems` 保持 9 且第 5 项数值改变，同空间回验片平均亮度随之上升 ≥ 20/255。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- 2026 年三家的实际差距与本场景的兜底：(1) 非滤镜的 `color-interpolation` 只有 Firefox 会按 linearRGB 插值渐变，Chrome 与 Safari 忽略该属性，所以那两条渐变梯尺不写死结论——脚本采样两条中点，把“本浏览器有／无差异”实测印在标签上；headless Chrome 的基准截图里两条相同并显示“无差异”。(2) `color-interpolation-filters` 三家都实现，但中间缓存的 8-bit 舍入不同，Safari 在长链上会多出可见色阶，因此回验残差与一致性片的阈值都留了 ±4/255 余量，且一致性片刻意声明 `sRGB` 以避开 linearRGB 往返的量化。(3) `feImage href=\"#element\"` 引用同文档元素在 Chrome 早已移除、Safari 不稳，Firefox 仍支持——网屏因此一律用 data: URI PNG，三家表现一致；`filterRes` 已废弃且无实现，网屏分辨率靠位图自身像素密度控制。(4) `feComposite operator=\"arithmetic\"` 按预乘 alpha 计算并 clamp 到 [0,1]，半透明输入会出现暗边，所以四条 ink 分支在相乘前一律映射到不透明纸基；那枚 64×64 警示片就是把这个坑显式画出来。(5) Safari 对 `filterUnits=\"userSpaceOnUse\"` 加大缩放的滤镜会分块重采样、可能露出接缝，放大镜的滤镜区域因此被限制在圆的外接矩形内，并把 ×8 的滤镜结果按指针空闲缓存，避免逐帧重栅格化。(6) `shape-rendering=\"optimizeSpeed\"` 在 Chrome 与 Safari 上关抗锯齿的程度不同，Firefox 的 `crispEdges` 会额外把边对齐到像素网格，所以四枚靶下印的是实测过渡像素数而不是断言。(7) 截图基准是 deviceScaleFactor=1；在 2× 屏上滤镜网屏会重采样而 pattern 网点不会，这正是要展示的差异，但阈值以 1× 为准。(8) 网络被屏蔽，全场只有三个 data: URI 位图，文字使用系统 sans/mono 栈、不加载 webfont，因此字形宽度在三家略有差别，标签均按左对齐排布、不依赖精确文本宽度。

### 3.11 `forge-metallography-bench` — 锻件金相台

- **用途 / 家族**：materials inspection / scientific instrument
- **复杂度**：expert　**标签**：`lighting-filters`, `bump-map`, `convolution`, `metallography`, `pointer-drag`, `smil`, `brushed-metal`, `chrome`
- **设计问题**：如果一块钢印铭牌只剩下一张 alpha 高度图，光照滤镜还能从中还原出多少真实的金相判读？

**场景**　一台钢灰色的金相观察台平铺在 1400×900 的透明舞台上，板块之间留着切角与透明缝，像拆开的检验台面。台面左半是主角：一块刚打出编号 SN-4417-A 与六边形厂徽的锻造铭牌，字口是从板形里挖掉的空洞，斜射的聚光把硬边阴影压在字口右下侧；铭牌下面一排四片「深度标尺」是同一段字形的复制，唯一的变量是 surfaceScale（−12 / 6 / 18 / 34），负值那片把凹进去的字口整个翻成凸起。再往下是三条只差 lighting-color 的拉丝铝带（白、琥珀、青）、一块镜面铬件 CrMo-4，和一枚 Ø128 的抛光浸蚀试样——试样被切成四个象限，各自用 azimuth 0°/90°/180°/270° 的平行光打，同一条晶界在四个方位下亮暗翻转。右上是光源控制台：侧视高度图上一盏灯挂在 z 轨上，锥角盘的外圈手柄管 limitingConeAngle、内圈手柄管聚光的 specularExponent，六格检视片把「原始 alpha、模糊后的 alpha、镜面通道 exp=1 与 exp=24、点光 z=24 与 z=180」并排摊开；巡检轨道上两根指针跑着同一组疏密不等的停靠点，一根 calcMode="paced"，一根 calcMode="linear"，静帧里明显错开。右下是九格读片框：同一张铭牌裁切分别过浮雕、锐化、Laplacian 边缘三种 kernelMatrix，再过 order 3×3 / 5×5 / 7×1 三种核阶，最后过 edgeMode duplicate / wrap / none 三种边界处理。整台仪器没有一粒噪声——所有高低起伏都来自字形与排线的 alpha 通道，漫反射与镜面反射对同一张高度图打光后再乘回、加回原色。最难忘的是那盏可拖拽的灯：把灯头拖到别处、把 z 从 24 拉到 180、把锥角一收，铭文深浅、字口投影、拉丝纹与镜面高光整体改写，锥内只剩一小片组织可读，而「铭文有多深」从头到尾只由 HUD 上那一个 surfaceScale 数值决定。

**主打特性**

- `el:feSpecularLighting` — feSpecularLighting primitive
- `el:feSpotLight` — feSpotLight source
- `concept:lighting-alpha-bump-map` — Alpha channel as height map
- `at:feConvolveMatrix.kernelMatrix` — kernelMatrix weights
- `concept:convolve-emboss` — Emboss recipe
- `concept:animated-light-source` — Animated light position / angle
- `at:feDiffuseLighting.surfaceScale` — surfaceScale height

**辅助特性**

`el:feDiffuseLighting`、`el:fePointLight`、`el:feDistantLight`、`at:feDistantLight.azimuth`、`at:fePointLight.z`、`at:feSpotLight.pointsAtX`、`at:feSpotLight.limitingConeAngle`、`at:feSpecularLighting.specularExponent`、`pr:lighting-color`、`el:feConvolveMatrix`、`at:feConvolveMatrix.order`、`at:feConvolveMatrix.edgeMode`、`concept:convolve-sharpen`、`concept:convolve-edge-detect`、`av:feGaussianBlur.stdDeviation=two-values`、`concept:brushed-metal-texture`、`concept:chrome-metal-effect`、`av:animate.calcMode=paced`、`concept:mouse-events`、`concept:drag-with-pointer-events`、`api:Element.setPointerCapture`、`at:feConvolveMatrix.preserveAlpha`、`at:feConvolveMatrix.divisor`、`at:feConvolveMatrix.bias`、`at:feConvolveMatrix.targetX`、`av:feConvolveMatrix.edgeMode=duplicate`、`av:feConvolveMatrix.edgeMode=wrap`、`av:feConvolveMatrix.edgeMode=none`、`concept:convolve-box-blur`、`api:SVGFEConvolveMatrixElement.kernelMatrix`、`at:feDiffuseLighting.diffuseConstant`、`concept:diffuse-output-opaque`、`concept:single-light-source-child`、`at:feSpecularLighting.surfaceScale`、`at:feSpecularLighting.specularConstant`、`concept:specular-composite-add`、`at:feDistantLight.elevation`、`api:SVGFEDistantLightElement.azimuth`、`at:fePointLight.x`、`at:fePointLight.y`、`at:feSpotLight.x`、`at:feSpotLight.z`、`at:feSpotLight.pointsAtY`、`at:feSpotLight.pointsAtZ`、`at:feSpotLight.specularExponent`、`api:SVGFESpotLightElement.pointsAtX`、`api:SVGFEPointLightElement.x`、`concept:primitive-units-lighting-coordinates`、`concept:event-delegation-on-group`、`concept:mouseenter-vs-mouseover`

**构造要点**

1. 画布与图层：`<svg id="stage" viewBox="0 0 1400 900">`，不铺任何全屏背景矩形；最底层只放 `<rect id="hit-plane" width="1400" height="900" fill="none" pointer-events="all"/>` 作事件靶面（不着色、不占像素）。层序：hit-plane → `<defs>`（约 25 个滤镜 + 渐变 + clipPath，全部由 TS 表驱动生成）→ 台面板块 `#bench` → 字口投影层 `#cast-shadow` → 灯臂 `#arm`（末端是灯头手柄）→ 探针十字线。板块四角切角、彼此留 12–20px 透明缝，保证截图透明像素 ≥18%。
2. 坐标表（写死，userSpaceOnUse）：标题块 (56,40,414,72)；HUD 读数条 (486,44,634,64)；灯臂基座板 (1136,40,216,72)；铭牌 (56,136,644,334)；深度标尺四片各 (152,100)，y=486，x=56/220/384/548；拉丝条 (56,604,316,112)；镜面铬件 (388,604,312,112)；浸蚀试样 (56,732,316,132)；探针与事件日志 (388,732,312,132)；光源控制台 (720,136,632,278)；读片框 (720,434,632,430)。
3. 唯一的高度图：`#plate-face` 是一条 `path`，外轮廓为铭牌圆角矩形，内部子路径是钢印字形、六边形厂徽与排线区，`fill-rule="evenodd"` 把字口挖成空洞，填充钢色 linearGradient；它的 SourceAlpha 就是全场唯一高度图。字形由 TS 的 5×7 stencil 生成器输出路径（"SN-4417-A"、"44"、厂徽），排线区是步距 3.5px、由 mulberry32(0x4417) 抖动起止 x 与不透明度的水平线组——全场不使用任何字体文件、`<image>` 或 feTurbulence。铭牌之下另铺 `#plate-floor` 深钢色底板，透过挖空的字口露出「被打下去的字底」。
4. 主滤镜 `#f-plate`（显式 x/y/width/height = 铭牌 bbox 外扩 24，`color-interpolation-filters="sRGB"`）链路：feGaussianBlur(in=SourceAlpha, stdDeviation=1.8) → `bump`；feDiffuseLighting(in=bump, surfaceScale=S, diffuseConstant=0.92) + 唯一一个光源子元素 → `dif`；feComposite(dif, in2=SourceGraphic, operator="in") 把不透明的漫反射结果夹回板形（diffuse 输出恒为不透明，必须夹形，否则滤镜区会变成实心矩形）；再 feComposite(operator="arithmetic" k1=1 k2=k3=k4=0) 与 SourceGraphic 相乘 = 漫反射 × 原色；feSpecularLighting(in=bump, 同一个 S, specularConstant=0.8, specularExponent=E) + 同型光源 → `spc`，同样 `operator="in"` 夹形后用 feComposite(operator="arithmetic" k2=1 k3=1) 叠加回去。
5. 单一高度值贯穿全台：`state.surfaceScale` 同时写进 `#f-plate` 的 feDiffuseLighting 与 feSpecularLighting，HUD 的 SURFACE SCALE 直接读 `feDiffuseLighting.surfaceScale.baseVal` 而不是另存副本。深度标尺四片是同一段 "44" 字形的复制，唯一变量是 surfaceScale = −12 / 6 / 18 / 34（负值把字口翻成凸起），四片共用 diffuseConstant=1.0 与 feDistantLight(elevation=55，azimuth 由灯臂角实时同步)；click 某片即把该值提升为全台的 S，被选片加琥珀描边。
6. 三个光源子元素永远只有一个挂在树上：`<fePointLight x y z>`、`<feSpotLight x y z pointsAtX/Y/Z limitingConeAngle specularExponent>`、`<feDistantLight azimuth elevation>`；模式按钮 click 时用 replaceChild 换掉 feDiffuseLighting 与 feSpecularLighting 各自的唯一子节点（默认 SPOT）。primitiveUnits 保持默认 userSpaceOnUse，所以光源的 (x,y,z) 就是舞台坐标，HUD 打印的数值与灯头在画面上的像素位置严格一致。
7. 灯臂与拖拽：基座 (1330,76)，两段连杆 L1=420、L2=380，用二连杆 IK 求肘点并取「肘上」解（垂线方向取较小 y），默认灯头 (600,268)、z=110、pointsAt=(330,320)、limitingConeAngle=26°。灯头 `#lamp-head` 是拖拽手柄：pointerdown 时 `setPointerCapture(e.pointerId)`（`gotpointercapture` 时把手柄环换成琥珀色），pointermove 用 `getScreenCTM().inverse()` 把 client 坐标换到舞台坐标后写 `spot.x.baseVal = …`、`spot.y.baseVal = …`（走 IDL 而非 setAttribute），pointerup 调 `releasePointerCapture` 并加 `lostpointercapture` 兜底。同一套 handle 工厂复用在 z 竖轨手柄（20..200）、锥角盘外圈手柄（limitingConeAngle 6..48）、锥角盘内圈手柄（feSpotLight 的 specularExponent 1..40）与聚光靶点 `#aim`（pointsAtX/pointsAtY，pointsAtZ 固定 0 = 铭牌平面）。
8. 硬边字口阴影：`#cast-shadow` 是字形与排线路径的副本，填深色、clip 在铭牌内，其 transform 由灯位实时算出——偏移方向取「灯位 → 铭牌中心」的单位向量，长度 = surfaceScale × k / z——并按是否落在锥内分段淡出；灯一动，全部字口阴影的方向与长度整体改写，这是拖拽最直观的回执。
9. 自动巡检（静帧也成立）：`<fePointLight>` 与 `<feSpotLight>` 内各挂两条 `<animate attributeName="x"/"y" calcMode="paced" dur="11s" repeatCount="indefinite">`，values 是 5 个疏密不等的停靠点，高光沿铭牌匀速扫过；控制台的「巡检轨道」把同一组 values 画成带刻度的横轨，两根指针分别由 `calcMode="paced"` 与 `calcMode="linear"` 的 `<animate>` 驱动同一组 values，静帧里两针明显错位，标签直接印出两种 calcMode 与各段长度。首次在灯头上 pointerdown 时对所有 animate 调 `endElement()` 交出控制权，HUD 从 AUTO 切 MANUAL；「RE-SCAN」按钮 click 调 `beginElement()` 收回。
10. 读片框九格：每格是 `<g filter="url(#kv-*)"><rect fill="#171b20"/><use href="#crop-44" transform="translate(..) scale(.62)"/></g>`，源是同一张已打光的铭牌裁切，并在裁切左下角贴一条橙色定位条专供 wrap 观察。第一行 order="3 3"，三种 kernelMatrix：浮雕 `-2 -1 0 / -1 1 1 / 0 1 2`（divisor=1、bias=0.5 把负值抬回可见区）、锐化 `0 -1 0 / -1 5 -1 / 0 -1 0`（preserveAlpha="true"，只卷积颜色不卷积 alpha）、Laplacian 边缘 `1 1 1 / 1 -8 1 / 1 1 1`（黑底亮线）；每格下方的 3×3 数字网格在运行时由 `SVGFEConvolveMatrixElement.kernelMatrix.baseVal` 逐项读出后渲染，保证印刷值与属性同源。
11. 第二行核阶对照：同一裁切分别过 order="3 3"（全 1 盒式核 divisor=9）、order="5 5"（divisor=25）与非方核 order="7 1" targetX="6"（横向拖影，方向刻意与拉丝纹垂直以便区分）；标签印出 order / divisor / targetX。第三行边界模式：统一 order="9 9" 盒式核，滤镜区域 x/y/width/height 精确等于瓦片矩形，edgeMode 依次 duplicate / wrap / none——duplicate 边缘拖出条纹、wrap 把左下的橙色定位条从右上角折回来、none 四周出现暗 fringe。
12. 拉丝条：三条 34px 高的横带共用 `#f-brush`——源 alpha 是步距 2.5px 的水平细线阵（同一个 mulberry32），先 `feGaussianBlur stdDeviation="9 0"` 只在水平方向抹平成连续丝纹而竖向边缘保持锐利，再 feDiffuseLighting(diffuseConstant=1.15) + feSpecularLighting(specularConstant=0.35, specularExponent=3) 打出宽而钝的铝拉丝光泽；三条带唯一差别是 `lighting-color`，通过 CSS 类 `.tint-white/.tint-amber/.tint-cyan` 设在 fe*Lighting 元素上（呈现属性，CSS 覆盖同名 attribute），灯色按钮 click 时把同一组类切到主铭牌的光照原语上。右端另贴一枚 24×34 对照小片，唯一差别是 `stdDeviation="0 9"`，丝纹转成竖向。
13. 镜面铬件与浸蚀试样：铬件 "CrMo-4" 用 stencil 路径填 8 段黑—白—灰交替的镜面 linearGradient，滤镜内 feGaussianBlur(stdDeviation=2.4) 造圆角倒棱后叠 feSpecularLighting(specularConstant=1.15, specularExponent=48)，得到窄而硬的铬高光，与拉丝条的 exponent=3 形成并排对照（两者的 specularConstant/Exponent 都印在标签上）。浸蚀试样是 Ø128 圆盘，内容为 30 籽点、两轮松弛的 Voronoi 晶界网（线宽 1.2），四个象限各自 clipPath 后用 azimuth=0/90/180/270、elevation=32 的 feDistantLight 打光；azimuth 值同时通过 `SVGFEDistantLightElement.azimuth.baseVal` 供 HUD 读出。
14. 检视片六格（控制台右侧，每格 74×56）：α（SourceAlpha 直接 flood 成白，浮在透明底上）、α-blur（stdDeviation=2.6，圆润倒棱 vs 平顶只有一圈亮边）、S(exp=1) 与 S(exp=24) 只输出 feSpecularLighting 原始结果（白色高光斑点浮在透明舞台上，正好用透明底展示）、P(z=24) 与 P(z=180) 用同一 fePointLight 的两个 z 值显示热点从紧到散。六格共同构成「高度图 → 打光结果」的读法说明。
15. 事件与探针：全部交互挂在 `#bench` 上做事件委托（pointerdown/move/up、click，以及捕获阶段的 mouseover 与 mouseenter），日志面板保留最近 4 行 `type · #target-id`，并刻意同时记录从子路径冒泡上来的 mouseover 与只在瓦片自身触发一次的 mouseenter；纯 pointermove（未按键）时在铭牌上画十字探针，用 `plateHeightPath.isPointInFill(new DOMPoint(x,y))` 判断指针落在字口内还是台面上，读数打印 `h = 0` 或 `h = S`，同时 `window.__INTERACTION_COUNT__++`。
16. 导出与就绪：`export=1` 时先 `stage.setCurrentTime(2.4)` 再 `stage.pauseAnimations()`，让巡检高光停在铭牌右上、两根 calcMode 指针明显错开，然后置 `window.__VIS_READY__ = true`；所有滤镜一律显式声明 x/y/width/height 并以 `feComposite operator="in"` 收尾，避免不透明的 lighting 输出把滤镜区涂成实心矩形而毁掉透明底与透明像素预算。

**验收要点**

1. PNG：透明像素 ≥18%（板块缝隙与切角），可见像素 ≥60%，彩色像素 ≥2500（琥珀/青灯色带与 HUD 文字）；画面四周无因 lighting 输出未夹形而产生的不透明矩形。
2. DOM：`#f-plate` 内 feDiffuseLighting 与 feSpecularLighting 的 `surfaceScale.baseVal` 相等，且与 HUD `#hud-surface-scale` 的文本数值一致；点击深度标尺第 1 片（−12）后三者同步变为 −12。
3. DOM：读片框九块的 feConvolveMatrix 两两不同——第一行 `order` 全为 "3 3" 而 `kernelMatrix` 互异，第二行 `order` 依次为 3×3 / 5×5 / 7×1（末块 `targetX="6"`），第三行 `edgeMode` 依次为 duplicate / wrap / none；每块下方打印的数字网格与 `kernelMatrix.baseVal` 逐项相等。
4. PNG：浮雕块左上亮、右下暗（沿光轴的亮度梯度符号相反）；边缘块的中位亮度显著低于源裁切且字形呈亮线；锐化块在字口边缘的梯度峰值高于源裁切（可见光晕）。
5. PNG：edgeMode 三块的边缘行为可测——wrap 块右上角出现源图左下角的橙色定位条，none 块外圈 8px 的平均亮度显著低于块中心，duplicate 块外圈无暗环且呈条纹拖影。
6. DOM + PNG：把 `#lamp-head` 拖动 200px 后，feSpotLight 的 `x.baseVal/y.baseVal` 随之更新，`#cast-shadow` 的 transform 改变，重新截图时铭牌高光质心位移 >120px；把 limitingConeAngle 调到 8° 后，铭牌上锥外区域的平均亮度下降且出现清晰圆形边界。
7. DOM：在任一手柄上 pointerdown 会触发 `setPointerCapture`（该手柄收到 `gotpointercapture`、环色变琥珀），指针移出 `#stage` 边界仍继续跟随，pointerup 后 `releasePointerCapture` 且手柄环复位。
8. DOM：仅移动指针（不按键）即可使 `window.__INTERACTION_COUNT__` 递增，事件日志追加带 `#target-id` 的行，且悬停某读片框时日志同时出现 mouseover（冒泡多次）与 mouseenter（仅一次）。

**实现复审**

- 六个检查图块原先与滤镜重名，现以 insp-tile-* 区分；全场景执行唯一 ID 检查。

**浏览器注意**

- 无网络环境下不加载任何外部字体或位图：铭牌字形、厂徽、铬件字样全部是运行时生成的 stencil 路径，标注只用系统等宽栈（ui-monospace / DejaVu Sans Mono / monospace）且全为拉丁字符与数字，避免无头 Linux 缺 CJK 字体导致豆腐块；中文只出现在文档与 catalog 中。WebKit 至今对 SMIL 直接动画滤镜原语属性（fePointLight 的 x/y、feSpotLight 的 pointsAtX）不总触发滤镜重算，因此在 WebKit 上默认走 rAF 回退：`<animate>` 元素仍保留在 DOM 中作为声明式来源，JS 读它的 `values`/`dur` 自行插值并写 `light.x.baseVal`，Chrome/Firefox 仍走原生 SMIL；巡检轨道的两根指针动画作用在普通图形属性上，三引擎一致，因此 `calcMode=\"paced\"` 的可见对照不依赖回退路径。feConvolveMatrix 的 `kernelUnitLength` 在三引擎中基本被忽略（Firefox 未实现），所以场景不依赖它做与分辨率无关的卷积，而是固定 userSpaceOnUse 与 deviceScaleFactor=1 的 1:1 像素比；同理 `filterRes` 已废弃，读片框改用 0.62 缩放裁切来控制像素量。各引擎对 feDiffuseLighting/feSpecularLighting 的表面法线估计不同（Firefox 边缘更硬、Chrome 的 SwiftShader 路径在镜面高光上有轻微色带），因此浮雕深浅与高光形状存在可见的跨引擎差异；HUD 打印 surfaceScale / specularExponent / z 等原始参数，验收只比较同一截图内的相对关系而不比对绝对像素值。lighting 原语输出恒为不透明，若省略 filter region 或末端的 `feComposite operator=\"in\"`，在 `omitBackground` 截图上会留下实心矩形——这是本场景最容易踩的坑，已在每个滤镜上显式声明区域并夹形。`SVGGeometryElement.isPointInFill` 在 Chrome/Firefox 接受 DOMPoint，旧版 WebKit 需要 `svg.createSVGPoint()`，探针代码做两路兼容；`setPointerCapture` 在 SVG 元素上三引擎均可用，但 Firefox 在指针移出窗口时偶尔只派发 `lostpointercapture`，故拖拽结束逻辑同时监听 pointerup 与 lostpointercapture。Safari 对 `limitingConeAngle` 的锥边抗锯齿较差（硬边略有锯齿），且对「已滤镜化的组再被 use 引用后二次滤镜」代价较高，读片框因此限制在九块 200px 级瓦片内。

### 3.12 `mycelium-culture-chamber` — 菌种培养舱

- **用途 / 家族**：laboratory illustration / procedural texture
- **复杂度**：expert　**标签**：`feturbulence`, `displacement-map`, `watercolor`, `l-system`, `smil`, `svg-filters`, `mycology`
- **设计问题**：菌落能不能不靠手绘、而是从一张噪声里长出来？

**场景**　一只不锈钢培养舱正面对着观者：顶灯是一条暖白灯管，灯下的空气微微上下抖动，把背板上的温湿度刻度晃成波纹；后壁是几团模糊色斑融成的一层湿润辉光。中层托盘上并排三只培养皿，皿里的菌落不是画出来的，而是脚本用 L-system 现场长出的一万两千多段菌丝，全部被同一张分形噪声扭曲：A 皿「松针基质」是柔云状的绵密白霜，B 皿「木屑基质」被横向拉长的湍流撕成脉络分明的纤维束，C 皿是记着「合成层错误」的废片——渗色滤镜挂到了每一段菌丝上，于是二十几圈水痕互相穿插、永远合不成一片菌落。每团菌落外缘都有水彩般的锯齿渗边与一圈更深的积色，再外面是柔和的孢子晕；玻璃皿壁把底下的菌丝折成一道向外弯的透镜光带，上下各压一道弯月高光。皿底铭牌 A-03 / B-07 / C-11 与接种日期 2026-03-14 始终清晰可读。舱右侧是一张带均匀纸纹的记录纸，贴着倍频、基频、位移幅度、位移通道四行试片，纸下压着一只半透明的压平样品袋。整幅最要紧的机关是：同一张噪声母版（在控制条上以监视窗直接示出）同时充当位移源、渗染遮罩与纸纹，只有它的 baseFrequency 在按 by + accumulate="sum" 一轮一轮往上叠，噪声越来越细，菌落也就越长越密——静帧不过是这条生长曲线上的任意一刻。

**主打特性**

- `el:feTurbulence` — feTurbulence primitive
- `el:feDisplacementMap` — feDisplacementMap primitive
- `concept:watercolor-bleed-effect` — Watercolor bleed edges
- `concept:animate-filter-basefrequency` — animating feTurbulence baseFrequency
- `concept:liquid-distortion-effect` — Liquid / gooey distortion
- `av:animate.accumulate=sum` — accumulate sum across repeats
- `at:feDisplacementMap.in2` — in2 map source

**辅助特性**

`el:script`、`concept:script-cdata`、`api:Document.createElementNS`、`concept:mesh-gradient-emulation`、`concept:mask-with-filter`、`concept:mask-with-image`、`at:filter.primitiveUnits`、`concept:filter-on-group-vs-children`、`at:feTurbulence.type`、`at:feTurbulence.baseFrequency`、`at:feTurbulence.numOctaves`、`concept:animated-turbulence`、`at:feDisplacementMap.scale`、`at:feDisplacementMap.xChannelSelector`、`concept:glass-refraction-effect`、`concept:paper-grain-texture`、`concept:heat-shimmer-animation`、`at:animate.by`、`av:feTurbulence.type=fractalNoise`、`av:feTurbulence.type=turbulence`、`at:feTurbulence.seed`、`concept:turbulence-fills-filter-region`、`concept:cloud-smoke-texture`、`concept:wood-marble-texture`、`at:feDisplacementMap.yChannelSelector`、`av:feDisplacementMap.xChannelSelector=A`、`concept:displacement-gradient-lens`、`concept:displacement-filter-region-overflow`、`concept:smil-animate-displacement-scale`、`api:SVGFETurbulenceElement.baseFrequencyX`、`api:SVGUnknownElement`、`concept:script-blocked-in-img`、`av:filter.primitiveUnits=objectBoundingBox`、`av:filter.primitiveUnits=userSpaceOnUse`、`concept:standalone-svg-document`

**构造要点**

1. 画布与分区：viewBox="0 0 1400 900"，全幅无底色。培养舱主体为 rounded rect x=48 y=58 w=930 h=784 rx=20；右列 x=1006..1372 为记录纸与样品袋，两列间留 28px 透明缝，四周留 ≥40px 透明边，保证 omitBackground 截图仍有 8% 以上全透明像素。全部字号 ≥11px，铭牌类文字一律置于任何位移滤镜链之外。
2. 图层顺序（自下而上）：舱内背板栅格 → mesh 辉光 → 灯管与热抖动带 → 三只培养皿（皿影 / 琼脂 / 菌落 / 渗色 / 孢子晕 / 玻璃圈 / 皿底铭牌）→ 舱体门框与铰链 → 控制条（含噪声母版监视窗）→ 记录纸（纸纹）→ 试片区 → 样品袋 → 标题与图例。mesh 辉光用 concept:mesh-gradient-emulation：五只彩色椭圆（#2f6b4f #8fbf6a #d9a441 #3e7f8c #5b3f6b，rx 120..210）放进一个 <g clip-path="url(#chamber-inner)" filter="url(#mesh-blur)">，滤镜只有一条 feGaussianBlur stdDeviation="68"；模糊挂在组上而非各椭圆上，色团先合成再一次性糊开，才会连成一片连续的潮湿光场——这是本幅第一处 concept:filter-on-group-vs-children。
3. 噪声母版：<filter id="noise-source" x="0" y="0" width="100%" height="100%"> 内只有 <feTurbulence id="master-noise" type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="4" seed="7">。它贴在控制条上的 <rect id="noise-plate" x="96" y="742" width="196" height="112"> 上——feTurbulence 不读 SourceGraphic、直接铺满滤镜区（concept:turbulence-fills-filter-region），所以这块矩形就是肉眼可见的「噪声母版监视窗」。母版上挂 <animate attributeName="baseFrequency" by="0.004 0.006" dur="5s" repeatCount="5" accumulate="sum" fill="freeze"/>：by 给的是每轮相对增量，accumulate="sum" 让第 n 轮从第 n−1 轮末值继续，频率呈阶梯从 0.012 爬到 0.032，噪声由大团块渐变为细丝；去掉 accumulate 每轮都会跳回 0.012，看上去是抽搐而非生长。
4. 一张噪声三处消费：#warp-noise / #bleed-noise / #grain-noise 三个 feTurbulence 与母版共用 seed="7"、numOctaves 家族与同一相位。SVG 内脚本每帧读 master.baseFrequencyX.animVal，按固定倍率写回三处的 baseFrequencyX/Y（api:SVGFETurbulenceElement.baseFrequencyX）：warp ×1.0、bleed ×2.2 实时跟随母版推进，grain 只在 t=0 取一次母版初值 ×64 后冻结（纸是接种当天印的，不该跟着长）。于是位移源、渗染遮罩、纸纹三者确实是同一张噪声场的三次采样，且 DOM 中可逐项核对。
5. 菌丝生成：公理 F，规则 F → F[+F][−F]F，分支概率 0.72 并随代次线性衰减，转角 ±(18°+rng·14°)，步长 12px×0.86^gen，共 7 代；每皿从接种点区（中心 r≤18 内取 4 点）各起一支，约 4200 段/皿、12600 段/幅。写入用 document.createElementNS('http://www.w3.org/2000/svg','path')，每 175 段合成一条多子路径 d（"M x y L x y" 串接），每皿 24 条 path、按代次分层：stroke 从 gen0 的 1.5px #f2f7ef 递减到 gen6 的 0.35px #b9d4bb，stroke-opacity 0.62，全部裁进 clipPath 内圆 r=118。
6. 三皿参数表：cy=468，cx=214 / 520 / 826，皿外径 R=138、琼脂 r=120。A「A-03 松针基质」warp 用 type="fractalNoise" numOctaves="2"、频率随母版 ×1.0、scale="18"、xChannelSelector="R" yChannelSelector="G"，得柔和云团（concept:cloud-smoke-texture）；B「B-07 木屑基质」用 type="turbulence" numOctaves="5"、baseFrequency 各向异性（母版x×0.5 母版y×4，横向拉长）、scale="34"、xChannelSelector="G" yChannelSelector="A"，得脉络分明的木纹/大理石褶皱（concept:wood-marble-texture）；C「C-11 对照」噪声与 scale 同 A、但 xChannelSelector="A"。皿沿铭牌直接印 xCh=R|G|A，同一张噪声给出三种横向摆动。所有 warp 滤镜写 x="-30%" y="-30%" width="160%" height="160%"，否则 scale=34 会把菌落边缘推出默认滤镜区被切平。
7. 合成层对照：A、B 的渗色滤镜挂在 <g id="colony-a" filter="url(#bleed-a)"> 组上，24 条 path 先合成一张位图再统一渗色，整皿是一片连续湿边；C 把同一条滤镜链逐条写到每条 path 的 filter 属性上，24 圈水痕互相穿插、边缘永不合并——正是实验记录里「滤镜挂错层」的废片，皿旁标注「合成层错误 · 逐段滤镜」。
8. 水彩渗色链 #bleed-a（hero）：feTurbulence(#bleed-noise) → feDisplacementMap in="SourceGraphic" scale="14" → feGaussianBlur stdDeviation="3.2" → feColorMatrix 仅在 alpha 行做陡坡（0 0 0 22 −9）把糊边重新硬化成锯齿水痕；再取同一路做第二次 blur(6)+同样 alpha 陡坡得到「内缩版」，用 feComposite operator="out" 从硬化版里减去内缩版得到一圈环带，feFlood #3d5c3a + feComposite operator="in" 染成深色积色边，最后 feMerge：积色环在下、SourceGraphic 在上。链上写 color-interpolation-filters="sRGB"，否则积色边在 linearRGB 下会发灰。
9. 孢子晕：<mask id="halo-a"> 的内容是一条硬边白色十二瓣玫瑰线 <path filter="url(#halo-feather)"/>（concept:mask-with-filter），被遮的是一张孢子色 radialGradient 矩形；#halo-feather 写 primitiveUnits="objectBoundingBox" 且 feGaussianBlur stdDeviation="0.03"，柔度按各自包围盒等比缩放，所以 138px 的大菌落与试片区 24px 的小菌斑能共用同一 mask 与同一 filter 而观感一致。试片区旁另放一枚 #halo-fixed 对照斑（默认 userSpaceOnUse、stdDeviation="6"），同样的绝对模糊半径把小菌斑整个吞掉，两枚并排即说明 primitiveUnits 的差别。
10. 玻璃皿壁折射：<g clip-path="url(#rim-a)">（环带 r=120..138）内放 <use href="#colony-a"/> 与琼脂副本，挂 #rim-glass：feImage href="data:image/svg+xml;base64,…"（一张 300×300、黑心白边的 radialGradient 方图）→ result="lens" → feDisplacementMap in="SourceGraphic" in2="lens" scale="26" xChannelSelector="R" yChannelSelector="R"；径向坡度沿半径递增，位移量随之外扩，得到桶形透镜弯折（concept:displacement-gradient-lens）；若换成线性渐变则整块等量平移、只有位移没有弯折，这一点在记录纸上单列一枚对照片注明。其上叠 feGaussianBlur 0.8 的雾面，再画两道白→透明的弯月高光（上左、下右）作玻璃反光。这是本幅第二种 in2 来源。
11. 舱内空气：灯管 rect x=96 y=118 w=834 h=16，暖色 linearGradient 加外发光。灯下 y=142..282 的背板（横向基准线 + 「24.0℃ / RH 92%」刻度）整组挂 #heat-shimmer：feTurbulence type="fractalNoise" baseFrequency="0.006 0.05" numOctaves="2"（随母版慢漂移）→ feColorMatrix 把 R 通道清零 → feDisplacementMap scale="6" xChannelSelector="R"（R 恒为 0，横向只剩一个常量偏移即等于不动）yChannelSelector="G"，于是只剩纵向起伏，基准线像在热空气里抖。背板标题「MYCELIUM CULTURE CHAMBER / 菌种培养舱」与湿度曲线另挂 #liquid：母版频率 ×1.6 的 fractalNoise + feDisplacementMap scale="9"，随母版频率一路推进，字与曲线像浸在水里持续起伏；scale 压在 9 以内保证静帧仍可读。
12. 记录纸纸纹：卡片 rect x=1006 y=90 w=366 h=570 rx=6 填 #f4efe2，整组挂 #grain：#grain-noise（seed 同母版、numOctaves=4、baseFrequency 为母版初值 ×64 后冻结）→ feColorMatrix 去色并压成低对比 alpha → feBlend mode="multiply" 叠回卡片，得到放大才看得见的均匀细颗粒。卡内不做位移，颗粒不动；卡外舱内区域不挂此滤镜，两侧颗粒统计量可直接比对。
13. 试片区（卡片下半 x=1026..1356，四行 48px 方片，片下 8px 小字标参数）：① numOctaves 1→6 六片，模糊团块逐步长出细褶；② baseFrequency 0.004 / 0.02 / "0.01 0.2" 三片，末片是横向拉长的木纹条；③ feDisplacementMap scale 0 / 12 / 34 / 70 / −34 五片，全用同一撮菌丝加同一枚「菌」字：0 完好、12 起波、34 起伏、70 撕碎、−34 反向；④ xChannelSelector R / G / A 三片同源噪声三种摆动，末尾另附一片 seed 动画（标「闪烁 · 不用于本舱」，示 at:feTurbulence.seed 与 baseFrequency 动画的区别）。
14. 样品袋：x=1020 y=690 w=352 h=140 的 #7fa8a0 矩形被 <mask id="bag-crinkle"> 遮罩，mask 内容是 <image href="data:image/png;base64,…" width="352" height="140" preserveAspectRatio="none"/>（128×128 灰噪点 PNG，约 1.4KB，亮处透暗处隐），塑封袋于是呈半透明压皱感（concept:mask-with-image）。袋口封条与标签另挂 #bag-warp，in2 用同一张 PNG 的 feImage、scale="8"，让封条随褶皱起伏——这是本幅第三种 in2 来源（湍流 / data-URI 矢量渐变 / data-URI 位图）。
15. 脚本、CDATA 与命名空间：全幅是一份独立 XML SVG（mycelium-culture-chamber.svg），<script type="application/ecmascript"><![CDATA[ … ]]></script> 紧跟 <defs> 之后；生成器里含 for (let i = 0; i < n && rng() < p; i++)，其中的 < 与 && 不用 CDATA 包裹会让 XML 解析器直接报错整幅白屏，记录纸上以一枚红色小卡说明该失败态。所有节点用 createElementNS 创建；卡片角落的 #ns-control 试片故意用 document.createElement('path') 造第 3 根菌丝，它以 XHTML 命名空间的 SVGUnknownElement 落进 DOM 却不渲染，试片上只见 3 根，旁注「无命名空间 → 不渲染」。另一枚小卡画两只空皿，注明同一文件被 <img> 引用时脚本被禁用、只剩皿与铭牌（concept:script-blocked-in-img）。
16. 交互与导出：宿主页把该 SVG 以 <object type="image/svg+xml"> 嵌进 #stage（<img> 会禁脚本）。SVG 内脚本监听 pointermove，用 getBoundingClientRect 把指针换算成 viewBox 坐标，最近的一只皿升起 #focus 光圈，并在该皿 warp 的 feDisplacementMap 上 beginElement 一条预置的 <animate attributeName="scale" by="6" dur="0.5s" fill="freeze"/>（concept:smil-animate-displacement-scale，与母版共用 at:animate.by 的相对写法），同时 parent.__INTERACTION_COUNT__++；交互期间把 warp 的 numOctaves 临时降到 3 以保住帧率。带 ?export=1 时脚本让 SMIL 自由跑 2.6s 后调用 svgRoot.pauseAnimations() 冻结在一片生长切片上，再置 parent.__VIS_READY__ = true。

**验收要点**

1. DOM：#colony-a / #colony-b / #colony-c 三组合计 ≥72 条 <path>，其 d 属性中的 M 命令总数 ≥12000，且每条的 namespaceURI 均为 http://www.w3.org/2000/svg。
2. DOM：#colony-a、#colony-b 的 filter 写在组元素上、子 path 无 filter 属性；#colony-c 相反（组上无、24 条 path 各带 filter）。PNG 中 C 皿边缘可见互相穿插、不合并的多圈水痕，A/B 为一条连续湿边。
3. DOM：#warp-noise、#bleed-noise、#grain-noise 的 seed 均等于 #master-noise 的 seed；导出瞬间前两者的 baseFrequencyX 等于母版 animVal（误差 ≤1e-4），#grain-noise 等于母版初值 ×64 且与 animVal 无关。
4. PNG：三块皿底铭牌 A-03 / B-07 / C-11 与接种日期 2026-03-14 全部清晰可读（这些文字位于 warp 与 liquid 滤镜链之外）。
5. PNG：A 皿菌落外缘 3px 环带的平均亮度比菌落内部低 ≥8%（水彩积色边成立）；同一条水平扫描线上，B 皿的亮度过零点数至少是 A 皿的 1.6 倍（turbulence 脉络 vs fractalNoise 云团）。
6. PNG：灯下抖动带内每条横向基准线的左右端点 x 偏移 <1px，中段 y 起伏 ≥3px——只有纵向抖动，无横向位移。
7. PNG：记录纸卡片内任取 200×200 区域，相邻像素亮度差的标准差 >3；舱内背板同尺寸区域 <1.5（纸纹存在且仅限卡片）。
8. DOM + PNG：#ns-control 试片有 4 个子节点，其中恰有 1 个 namespaceURI 为 http://www.w3.org/1999/xhtml；该试片在 PNG 中只渲染出 3 根菌丝。

**实现复审**

- 主场景直接挂在 #stage，独立 SVG 试片分别经 image 与 object 展示脚本禁用和启用。
- 主场景在 7.8 s 冻结；warp ×1、bleed ×2.2，grain 为初值 ×64。原验收要求 warp 与 bleed 同频和构造第4点矛盾，以明确倍率为准。
- heat-shimmer 的 R 通道必须为 0.5 才无横向偏移：scale × (R−0.5)。R=0 会整体左移。
- 菌丝共72条路径、固定种子产生37748个线段；命名空间和 CDATA 有正反例验证。
- 捕获管线移除强制 SwiftShader，交由 Chrome 选择渲染后端，保留全部 72 条路径与嵌套滤镜。

**浏览器注意**

- feImage 引用同文档元素（href=\"#id\"）至今只有 Firefox 稳定支持，Chrome 与 Safari 长期未实现，因此透镜图与褶皱位图一律走 data: URI（矢量渐变用 data:image/svg+xml，位图用 data:image/png），既绕开该差异也满足断网抓图；噪声母版监视窗因此只是一块可见的滤镜矩形，不作为 feImage 源。SMIL 对 baseFrequency 这类 number-optional-number 属性的动画在 Firefox 上历史性不稳（有时只吃第一个分量），accumulate=\"sum\" 在部分实现里对该类型会退化成 replace；脚本在 600ms 后比对 animVal 与初值，若未推进就接管，用 SVGFETurbulenceElement.baseFrequencyX/Y 自行复现 by + accumulate 的阶梯，观感一致。Safari 对 primitiveUnits=\"objectBoundingBox\" 的 stdDeviation 折算历史上偏小，退化结果只是孢子晕更紧，不影响铭牌与日期可读性，试片区那枚 userSpaceOnUse 对照仍能显出差别。三家浏览器的滤镜默认 color-interpolation-filters=\"linearRGB\"，湍流与积色边都会偏暗发灰，故 warp / bleed / grain 三条链显式写 sRGB，只有热抖动保留 linearRGB（那里要的就是低对比）。位移会把内容推出默认滤镜区（-10%/120%），scale=70 的试片尤甚，所有位移滤镜写 x=\"-30%\" y=\"-30%\" width=\"160%\" height=\"160%\"；Safari 对超大滤镜区会降采样，因此单块滤镜区控制在 420px 以内，三皿各自成链而不共用一个大滤镜。<img> 引用 SVG 时脚本被禁用（三家一致），故宿主页用 <object type=\"image/svg+xml\">，并等内部文档 load 后再置 __VIS_READY__；Playwright 对 <object> 内容截图正常，指针事件需在内部文档监听并回写 parent 计数。12600 段路径先合成再滤镜，Firefox 在 1400×900 上约 60–90ms/帧，故导出前只跑 2.6s SMIL 即 pauseAnimations()，交互态临时降 numOctaves 保帧率。独立 XML SVG 中 <script> 内的 < 与 && 必须 CDATA 包裹；HTML 前景内容解析同样接受 CDATA 段，故同一份文件既能独立打开也能内联进宿主页。

### 3.13 `neon-sign-workshop` — 霓虹招牌工坊

- **用途 / 家族**：signage graphics / filter compositing
- **复杂度**：expert　**标签**：`neon`, `svg-filters`, `css-masking`, `clip-path`, `html-svg-interop`, `morphology`, `blend-modes`
- **设计问题**：当光晕、辉光、内阴影与投影不再靠一句简写、而是各自由 filter 基元手工接线时，它们到底差在哪里？

**场景**　雨夜的霓虹招牌工坊。左侧弯管台上一块正在通电的招牌在潮气里发亮：「霓虹 / OPEN · 24H」由 feMorphology 胀大 alpha、再经 feGaussianBlur 摊开成粉色外晕，管芯是一层青色软光；招牌底板的裁切轮廓在铭牌、盾形、箭头三个 polygon() 之间缓慢过渡，像刚从冲床上取下还没定型。台面右下角是校色位：白灯箱上三张青/品红/黄滤色片用 multiply 减色成红绿蓝与黑，紧挨着的深色台面上同样三圆改 screen 加色向白——霓虹的加色逻辑被摆在减色逻辑旁边；左边一对「隔离开关」小样说明 isolation:isolate 如何把混合关在组内。招牌右边紧贴着一块用真 HTML 排版的价目板，弯管工时逐行列着点线引导，它和招牌引用的是同一枚 filter、同一条 clipPath、同一张 mask——效果不属于 SVG 独有的图形层。右上角是夹具三参照与弯管半径尺：同一条倒角管路被 fill-box / stroke-box / view-box 三种参照盒切出三个结果，四段管样分别按 radius 0 0、10 0、0 10、7 7 被压扁成扁宽或瘦高，其中一段的 radius 还在来回加压。画面中带是墙上六块做法卡，同为「霓虹」二字，分别写作形态学扩张描边、模糊 alpha 阈值光晕、经典四基元阴影链、内阴影、单基元 feDropShadow 和纯 CSS 滤镜链，每块卡下面一行等宽小字写出它的基元接线，卡面各自被 inset()、circle()、ellipse()、polygon()、path()、rect() 裁成不同外形，文档里没有一个 clipPath 元素参与。底部是地面积水：多层 CSS 遮罩用 mask-composite 的 subtract / intersect / exclude 切出单月牙、透镜和双月牙三洼水，价目板的 HTML 倒影被一张 SVG mask 与一层线性渐变同时约束，只在水洼里显影并随深度淡去，旁边还有雨点遮罩网格和「同一张遮罩两种读法」的 mask-mode 对照。启辉抖动只由一条模糊半径动画驱动，指针一移，弯管压力与辉光半径同时改到那枚共享滤镜上，招牌和 HTML 价目板一起呼吸。

**主打特性**

- `concept:neon-glow-morphology` — Neon glow via dilate + blur
- `at:feMorphology.radius` — radius with two values (anisotropic)
- `concept:inner-shadow-technique` — Inner shadow via SourceAlpha out compositing
- `css:mask-composite` — mask-composite (add, subtract, intersect, exclude)
- `css:svg-filter-on-html-element` — SVG filter applied to HTML elements and the outermost svg via filter:url(#id)
- `pr:mix-blend-mode` — mix-blend-mode on SVG elements
- `concept:animate-filter-stddeviation` — animating feGaussianBlur stdDeviation

**辅助特性**

`concept:inline-svg-in-html`、`concept:inline-svg-id-collisions`、`concept:svg-as-css-background-image`、`concept:svg-data-uri-encoding`、`pr:isolation`、`pv:mix-blend-mode=screen`、`concept:svg-blend-with-html-backdrop`、`concept:clip-path-html-to-svg-reference`、`css:clip-path-basic-shapes`、`pv:clip-path=inset()`、`pv:clip-path=circle()`、`pv:clip-path=ellipse()`、`pv:clip-path=polygon()`、`pv:clip-path=path()`、`pv:clip-path=rect()`、`css:clip-path-geometry-box`、`pv:clip-path=fill-box`、`pv:clip-path=stroke-box`、`pv:clip-path=view-box`、`concept:clip-path-shape-transition`、`api:CSSStyleDeclaration.clipPath`、`concept:mask-html-to-svg-reference`、`css:mask-image`、`concept:mask-image-svg-url`、`css:mask-mode`、`css:mask-layers`、`css:mask-size`、`css:mask-repeat`、`css:filter-functions-on-svg`、`css:filter-chaining`、`css:filter-transition`、`el:feOffset`、`at:feOffset.dx`、`el:feGaussianBlur`、`at:feGaussianBlur.stdDeviation`、`av:feGaussianBlur.stdDeviation=0`、`api:SVGFEGaussianBlurElement.setStdDeviation`、`el:feDropShadow`、`at:feDropShadow.dx`、`concept:classic-drop-shadow-chain`、`concept:outline-stroke-via-alpha-dilate`、`el:feMorphology`、`at:feMorphology.operator`、`av:feMorphology.operator=erode`、`av:feMorphology.operator=dilate`、`concept:morphology-thicken-text`、`concept:morphology-zero-radius`、`concept:smil-animate-morphology-radius`、`api:SVGFEMorphologyElement.radiusX`、`concept:morphology-outline-stroke`、`el:feComponentTransfer`、`concept:filter-input-wiring`、`pr:color-interpolation-filters`、`el:mask`、`pr:mask-type`、`css:font-face-data-uri`

**构造要点**

1. 舞台与层序：`#stage{position:relative;width:1400px;height:900px;background:transparent}`，内部五层等尺寸绝对定位——`#wall`（HTML，z1，data-URI 瓦片背景）→ `#svg-base`（z2，台面/卡片/尺规）→ `#world-html`（z3，价目板与倒影等真 HTML）→ `#svg-glow`（z4，`<svg>` 元素自身写 `mix-blend-mode:screen`）→ `#svg-ui`（z5，标注与射灯层）。所有 SVG 层 `viewBox="0 0 1400 900"`、1 user unit = 1 CSS px；另设 `<svg id="defs-layer" width="0" height="0" aria-hidden="true">` 专存全部 filter/clipPath/mask/pattern，id 一律加 `ns-` 前缀，避免同一 HTML 文档里多张 inline SVG 的 id 碰撞。所有面板背景保持半透明并留出 24px 沟槽与外边距，使 PNG 的全透明像素稳定高于 8%（capture.mjs 的 RGBA 阈值）。
2. 分区坐标：标题带 y32–96；弯管台 x32–700 / y104–452（招牌几何中心 (366,236)，台面检验条 y352–444）；HTML 价目板 x716–1044 / y104–452；夹具三参照 x1060–1368 / y104–270；弯管半径尺 x1060–1368 / y286–452；做法卡带 6 张 212×186，x = 34 + i×224（i=0..5），y466–652；地面积水带 x32–1368 / y668–868。
3. 弯管路径生成：给定折线骨架点列，逐顶点做半径 r=26 的圆角倒角（由入/出单位向量求两切点，写 `L` 到入切点再接 `A 26 26 0 0 sweep`），输出唯一一条 `d`；招牌外框、夹具三参照与半径尺样件全部复用这条 `d` 与同一 `stroke-width="22"`，保证三处对照严格同源、差异只来自滤镜与裁切。
4. 共享滤镜 `#ns-f-neon`（招牌与价目板共用；显式 `color-interpolation-filters="sRGB"`，滤镜区 `x="-45%" y="-45%" width="190%" height="190%"`，否则默认 -10%/120% 会把外晕削掉）：`feMorphology(in=SourceAlpha, operator=dilate, radius=3, id=ns-morph)` → `feGaussianBlur(stdDeviation=10, id=ns-halo)` → `feFlood(flood-color=#ff2f9d)` + `feComposite(operator=in)` 得外晕；另一路 `feGaussianBlur(in=SourceAlpha, stdDeviation=2.4)` + `feFlood(#8ff6ff)` + `feComposite(in)` 得管芯软光；`feMerge` 顺序为 外晕、外晕、管芯、SourceGraphic。这就是 neon-glow 的完整接线：先胀大 alpha 再模糊，halo 才会离开笔画而不是贴着笔画；标注里附一行 linearRGB 版本的亮度差说明为何锁 sRGB。
5. 两界并置：SVG 招牌组与 HTML `.board` 写完全相同的三处引用——`filter:url(#ns-f-neon)`、`clip-path:url(#ns-clip-plate)`、`mask:url(#ns-m-tube-fade)`；`#ns-clip-plate` 用 `clipPathUnits="objectBoundingBox"`，`#ns-m-tube-fade` 用 `maskContentUnits="objectBoundingBox"` + `mask-type="luminance"`，归一化坐标才能同时套住两种盒模型。`.board` 自身背景必须透明（瓦片背景放在父级 `.board-frame`），否则 feMorphology 胀的是整块方框 alpha 而不是字形 alpha——这条差别在场景里用一枚「错误示范」小样并排给出。
6. 文字与继承：价目板用真 HTML 排版（`display:grid` 两列、`border-bottom:1px dotted` 做点线引导），SVG `<text>` 写 `fill:currentColor` 并不设 font-family；页面一条 `#stage{color:#bfe9ff;font-family:'NeonSubset',ui-sans-serif}` 同时改变两侧的字体与颜色，`@font-face` 用内联 base64 WOFF2 子集（仅含「霓虹」及 OPEN/24H/数字/等宽标注字符，网络被阻断故不得外链），并且 inline SVG 无需 xmlns、脚本可直接 `getElementById` 拿到滤镜基元。
7. 六块做法卡（同为「霓虹」二字，仅接线不同，卡底一行 10px 等宽小字写出各自基元链），卡面用 CSS 基本形状裁切，文档中没有任何 `<clipPath>` 参与：① 形态学扩张描边 `feMorphology(dilate 4)` + `feFlood` + `feComposite(operator=out)`，`clip-path: inset(6px round 12px)`；② 模糊 alpha 阈值光晕 `feGaussianBlur(4)` → `feComponentTransfer/feFuncA type="discrete" tableValues="0 1"` → `feFlood` + `feComposite(in)`，`clip-path: circle(46% at 50% 48%)`；③ 经典四基元阴影链 `SourceAlpha` → `feGaussianBlur(4)` → `feOffset(dx=6 dy=8)` → `feFlood`+`feComposite(in)` → `feMerge`，`clip-path: ellipse(48% 44%)`；④ 内阴影 `feOffset(SourceAlpha, dy=5)` → `feGaussianBlur(6)` → `feComposite(in=SourceAlpha, operator=out)` → `feFlood(#050d14, .82)` + `feComposite(in)` → `feMerge(SourceGraphic, inner)`，`clip-path: polygon(...)` 缺角铭牌；⑤ 单基元 `feDropShadow(dx=6 dy=8 stdDeviation=4)`，`clip-path: path("...")`，参数与卡③逐项一致以便像素级对照；⑥ 纯 CSS 链 `filter: url(#ns-f-tint) drop-shadow(6px 8px 4px #001f2e) blur(.4px)`，`clip-path: rect(4px auto auto 4px)`（`@supports` 回退 `inset(4px)`）。
8. 卡⑥内并排放一枚「换序」小样 `filter: drop-shadow(...) url(#ns-f-tint)`：后置的染色滤镜把阴影一并染成品红，与前置顺序的中性阴影形成肉眼可辨的差别，说明链式滤镜的顺序有语义。六块卡统一 `transition: filter .35s ease`，悬停时追加 `saturate(1.4)`。
9. 夹具三参照：同一条 `stroke-width=22` 的弯管路径三份，分别 `clip-path: inset(10%) fill-box`、`inset(10%) stroke-box`、`inset(10%) view-box`；fill-box 只按填充几何算，切线深切进描边；stroke-box 把 11px 半描边计入，切得宽松；view-box 以最近 SVG 视口为参照，10% 是 (140,90) 量级，样件几乎整条被留下。三份下方各标注实际参照盒与算得的裁切矩形数值。
10. 弯管半径尺：四段同源管样，滤镜 radius 依次为 `0 0`（零半径直通参照，同格并列一枚 `stdDeviation=0` 的模糊参照说明「零参数即恒等」）、`10 0`（只横向胀、管子被压成扁宽）、`0 10`（只纵向胀）、`7 7`（各向同性）；第五格是 operator 对照：同一「霓虹」二字 `erode radius=2` 成发丝、`dilate radius=5` 成胖体并让笔画间空隙合拢。`10 0` 那段挂 `<animate attributeName="radius" values="2 8;9 1;2 8" dur="4.2s" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1" repeatCount="indefinite"/>`，读作弯管机来回加压。
11. 地面积水：三块同尺寸湿沥青渐变 rect，各自两层 `mask-image: radial-gradient(circle at 38% 50%, #000 0 42%, transparent 43%), radial-gradient(circle at 62% 50%, #000 0 42%, transparent 43%)`，`mask-composite` 依次取 `subtract` / `intersect` / `exclude`，得到单月牙、透镜、双月牙；同时并写 `-webkit-mask-composite: source-out / source-in / xor` 兼容旧 WebKit。第四块远端地面用 `mask-image: linear-gradient(to bottom, #000 30%, transparent)` 自然消失，全程不出现 `<mask>` 元素。
12. 倒影：HTML `.reflection` 里放价目板文字的 `transform: scaleY(-1)` 副本，`mask: url(#ns-m-puddle) luminance, linear-gradient(#000 0%, transparent 78%) alpha;`（`mask-mode: luminance, alpha` 显式写出），两层叠加后倒影只在水洼形状内出现且随深度淡出；`#ns-m-puddle` 是由种子噪声扰动的超椭圆路径加数条横向波纹构成的 `<mask mask-type="luminance">`。旁边一对 82×64「潮气对照」补丁用同一张彩色渐变 `mask-image`，一块 `mask-mode: alpha`（几乎不淡出）、一块 `mask-mode: luminance`（明显渐隐），标注「同一张遮罩，两种读法」。
13. 雨点：湿地面上一块 rect 用水滴形 data-URI SVG 作 `mask-image`，`mask-size: 40px 40px; mask-repeat: repeat` 得到整片小水滴窗口；紧邻一块同源的 `mask-size: contain; mask-repeat: no-repeat` 只留一颗大水滴，说明 mask-size 决定的是遮罩图案的尺度而非内容。
14. 墙面瓦片：`#wall` 与 `.board-frame` 共用一段 `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' ...>...</svg>")`（属性用单引号、`#` 写作 `%23`、`<`/`>` 百分号转义，不走 base64 以便阅读）画弯管工艺瓦片；瓦片 SVG 内含 `@media (min-width: 96px){ .anno{display:block} }`，`#wall` 用 `background-size:120px` 显示带尺寸标注的完整弯管图，`.board-frame` 用 `background-size:48px` 只剩简化圆点——同一段 SVG 因盒子尺寸不同而改变内容；同一段 data URI 再被雨点区当 `mask-image` 复用一次。
15. 检验位：台面右下两组三圆（r=26、圆心成正三角、间距 30）——上组青/品红/黄 `mix-blend-mode: multiply` 压在白灯箱 rect 上，交叠处减色成红绿蓝与黑；下组同样三圆改 `screen` 压在深色台面上，交叠处加色向白，正是霓虹的逻辑。左侧「隔离开关」A/B：两块同样 screen 混合的小招牌压在同一条纹底上，A 的外层写 `isolation: isolate`（条纹被挡在组外，块内干净），B 不隔离（条纹透过混合可见）。全层 `#svg-glow` 则把 `mix-blend-mode:screen` 写在 `<svg>` 元素本身，让辉光跨过 SVG 与 HTML 的边界与湿地面叠加——inline SVG 根会建立层叠上下文，只有写在 `<svg>` 元素上才能与 HTML 背景混合。
16. 招牌轮廓过渡与指针交互：底板层 `.plate-morph` 用 `animation: plate 9s ease-in-out infinite alternate`，关键帧在三个同顶点数的 `polygon()` 之间过渡（铭牌→盾形→箭头），另有一条 `circle(0% at 50% 50%) → circle(75%)` 的通电揭示；卡带上一枚悬停小样把三角形 `polygon()` 过渡为近正六边形，说明顶点数必须一致才可插值。`#stage` 的 pointermove 一次做三件事：`ns-morph.radiusX.baseVal = 1 + 8*(px/1400)`、`ns-halo.setStdDeviation(v, v)`（v = 4 + 12*(py/900)）、`torch.style.clipPath = `circle(160px at ${px}px ${py}px)`` 揭开卡墙下面的接线线框层，并 `window.__INTERACTION_COUNT__++`；因两界共用同一枚滤镜，一次移动两侧同步变化。启辉抖动只有 `<animate attributeName="stdDeviation" additive="sum" values="0;2.6;.4;3.2;0" dur="2.4s" repeatCount="indefinite"/>` 一条，叠加在指针写入的基值上，不动 opacity 与颜色。加载时先派发一次 (980,430) 的合成 pointermove 保证静帧有意义；截图前 `svg.pauseAnimations(); svg.setCurrentTime(1.6)` 并 `document.getAnimations().forEach(a=>{a.currentTime=2400;a.pause()})`，`await document.fonts.ready` 后置 `window.__VIS_READY__ = true`（同时置 `window.__sceneReady`）。

**验收要点**

1. DOM：`getComputedStyle(document.querySelector('.board'))` 的 filter / clip-path / mask 分别解析到 `url("#ns-f-neon")`、`url("#ns-clip-plate")`、`url("#ns-m-tube-fade")`，与 SVG 招牌组上的三个属性字符串逐一相同——同一枚滤镜、同一条裁切、同一张掩码被 SVG 图形与 HTML 元素同时引用。
2. PNG：招牌笔画外法线方向 22px 处的像素红/蓝通道比台面基线高 ≥12%，粉色外晕外缘（亮度阈值轮廓）离笔画 ≥26px；HTML 价目板文字外同样距离处出现同色相外晕，两者色相角差 < 8°。
3. PNG：做法卡③（四基元链）与卡⑤（feDropShadow）的阴影相对字形质心的偏移均为 (6,8)px ±1.5px，两卡阴影 alpha 剖面的逐点差异 < 4%。
4. PNG：半径尺中 `radius="10 0"` 样件的包围盒比 `radius="0 0"` 宽 ≥18px 而高度差 < 3px；`radius="0 10"` 反之（高 ≥18px、宽差 < 3px）。
5. PNG：三块水洼的连通亮区计数依次为 1（subtract 单月牙）、1（intersect 透镜且面积最小）、2（exclude 双月牙），且 intersect 面积 < subtract 面积 < 两层遮罩并集面积。
6. PNG：内阴影卡的暗带完全在字形内部——形状内边缘内 3px 处亮度比字形形心低 ≥35%，形状外 3px 处亮度与卡面背景差 < 5%（与投影卡的外侧暗斑形成对照）。
7. DOM：六块做法卡的 `getComputedStyle(...).clipPath` 依次以 `inset(`、`circle(`、`ellipse(`、`polygon(`、`path(`、`rect(`（或 `@supports` 回退后的 `inset(`）开头；全文档 `document.querySelectorAll('clipPath').length === 1`（只有共享的 `#ns-clip-plate`），证明卡片裁切全部来自 CSS 基本形状。
8. 交互与透明：合成 pointermove 到 (200,120) 与 (1200,820) 两次采样后，`#ns-morph.radiusX.baseVal` 与 `#ns-halo.stdDeviationX.baseVal` 均随之改变、`window.__INTERACTION_COUNT__` 递增，且 SVG 招牌与 HTML 价目板同一相对采样点的外晕亮度变化同号；导出的 PNG 四角 alpha = 0，全透明像素占比 ≥ 8%。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。

**浏览器注意**

- 主截图目标是 Playwright/Chromium，其余为真实浏览的回退。① HTML 元素引用 SVG `<mask>`（倒影的 `mask:url(#ns-m-puddle)`）在 Chrome 120+/Firefox 稳定，Safari 至今对 HTML 上的 SVG mask 与 `mask-type:luminance` 处理不一致，故 `@supports (mask-image: url(#x))` 检测失败时回退到等效的 `-webkit-mask-image: radial-gradient(...)` 水洼形状，并把波纹改成第二层线性渐变。② `clip-path:url()` 与 `mask` 作用于 HTML 元素时必须用 `clipPathUnits/maskContentUnits=\"objectBoundingBox\"`：userSpaceOnUse 在 Chrome 与 Safari 上对 HTML 盒的原点解释不同，会把招牌与价目板切到两个位置。③ `mask-composite` 标准语法在 Chrome 120+/Firefox/Safari 15.4+ 可用，旧 WebKit 只认 `-webkit-mask-composite: source-out|source-in|xor`，两套并写；`mask-mode` 在老 WebKit 需要 `-webkit-mask-source-type`，对照补丁同时给出两种写法。④ `clip-path: rect()` 与 `shape()` 各引擎落地时间不同（Safari 与 Chrome 较早、Firefox 偏晚），卡⑥ 用 `@supports (clip-path: rect(0 auto auto 0))` 回退到 `inset(4px)`，回退时标注文字同步改写以免图注说谎。⑤ 几何盒关键字：`fill-box`/`stroke-box` 作用在 SVG 元素上曾有引擎把它当 border-box 处理，故三份样件各自把实测裁切矩形数值打在旁边，读者以数字而非记忆核对；不支持时全部退化为 `view-box` 并标注「回退」。⑥ SVG filter 应用于 HTML 元素三家皆支持，但 Safari 会在合成层重采样、文字边缘略软；滤镜区必须显式放大到 -45%/190%，否则默认区域会削掉大半径 halo。⑦ `color-interpolation-filters` 默认 linearRGB，各家实现一致但霓虹亮度观感差异极大，全部显式声明 sRGB 并在标注里给出两种取值的对比说明。⑧ 跨 SVG/HTML 的 `mix-blend-mode` 依赖祖先没有因 filter/opacity/transform 产生隔离，因此辉光单独一层 `<svg>` 且其父容器不写 `isolation`；反过来「隔离开关」小样刻意写 `isolation:isolate` 展示相反效果。⑨ SMIL 对 `feMorphology/@radius` 的插值在部分 Chrome 版本会向整数取整，动画显得跳格，故半径的连续控制以 DOM（`radiusX.baseVal`）为准、SMIL 只做慢速加压演示；启辉抖动的 `additive=\"sum\"` 在三家均可与 DOM 基值叠加。⑩ 网络被阻断：字体只用内联 base64 WOFF2 子集、`font-display:block`，墙面瓦片与雨点遮罩用 data:image/svg+xml（非 base64、`#` 转 `%23`）；截图前 `document.fonts.ready` + `pauseAnimations()/setCurrentTime(1.6)` + `getAnimations()` 冻结，并等两帧 rAF 以避开 Firefox 对 HTML 遮罩合成时机的差异。

### 3.14 `escapement-chronometer` — 擒纵天文钟

- **用途 / 家族**：declarative timing schematic / watchmaking / horology
- **复杂度**：expert　**标签**：`smil`, `syncbase`, `timeline-scrubbing`, `escapement`, `declarative-animation`, `keysplines`, `horology`
- **设计问题**：机械擒纵能否完全由声明式的时序关系装配出来，让时间轴本身成为那套轮系？

**场景**　一台剖开陈列的黄铜天文钟摊在深绿台呢上：左半边是走时轮系——发条盒、中心轮、三轮、四轮一路咬到十五齿擒纵轮，擒纵叉在锁面与冲量面之间翻动，下方一枚大摆轮带着三圈半游丝摆动，旁边还立着一枚同尺寸的"硬游丝对照摆"。中部是表盘，时针分针连续走，小秒盘一格一格跳。右侧上方是打点机构：每第六次摆动释放报时轮，锤子沿一段内联曲线抬起落下敲三响，止打杆一按即停；右侧下方是均时差凸轮，两枚从动件骑在同一条实描凸轮廓上，一枚匀速正走、一枚逆行并在半途停跳。台呢上摊着一把时序尺，八条泳道的条形长度直接来自各动画的 getStartTime() 与 getSimpleDuration()，黄铜连线标出"谁的结束是谁的开始"。整台机器没有一行驱动脚本：摆轮的 begin 引出叉瓦的 begin，擒纵的每次重复以累加方式推进分轮，跳秒靠离散取值，凸轮按关键点控距离，游丝的软硬由每段缓动曲线决定。最难忘的是右下角的时间基准台——拖动滑块直接改写整台机器的当前时刻，可以把钟倒回任意一次咬合并冻结，事件日志同步点亮开始、重复与结束事件的先后，让人看清这台钟真正的传动关系是时间而不是齿。

**主打特性**

- `av:animate.begin=syncbase` — syncbase begin id.begin / id.end + offset
- `at:animate.keySplines` — keySplines cubic-Bezier easing per segment
- `api:SVGSVGElement.setCurrentTime` — setCurrentTime() timeline scrubbing
- `concept:smil-events` — beginEvent / endEvent / repeatEvent DOM events
- `at:animateMotion.keyPoints` — animateMotion keyPoints with keyTimes
- `av:animateTransform.additive=sum` — stacked animateTransforms with additive=sum

**辅助特性**

`el:animate`、`at:animate.attributeName`、`at:animate.attributeType`、`concept:smil-overrides-css`、`concept:animation-sandwich-priority`、`api:SVGAnimatedLength.animVal`、`el:set`、`at:set.to`、`concept:set-visibility-toggle`、`el:animateTransform`、`at:animateTransform.type`、`av:animateTransform.type=rotate`、`concept:animate-transform-requires-animatetransform`、`concept:animatetransform-base-transform-preserved`、`el:animateMotion`、`at:animateMotion.path`、`el:mpath`、`at:mpath.href`、`av:animateMotion.rotate=auto`、`av:animateMotion.rotate=auto-reverse`、`concept:animatemotion-transform-stacking`、`el:discard`、`at:discard.begin`、`at:discard.href`、`at:animate.begin`、`av:animate.begin=offset`、`av:animate.begin=repeat`、`concept:multiple-begin-values`、`av:animate.begin=event`、`av:animate.begin=indefinite`、`at:animate.dur`、`at:animate.end`、`at:animate.restart`、`av:animate.restart=whenNotActive`、`av:animate.restart=never`、`at:animate.repeatCount`、`av:animate.repeatCount=indefinite`、`at:animate.repeatDur`、`at:animate.keyTimes`、`av:animate.calcMode=spline`、`av:animate.calcMode=discrete`、`av:animate.additive=sum`、`at:animate.href`、`api:SVGAnimationElement.beginElement`、`api:SVGAnimationElement.beginElementAt`、`api:SVGAnimationElement.endElement`、`api:SVGAnimationElement.getStartTime`、`api:SVGAnimationElement.getSimpleDuration`、`api:SVGAnimationElement.getCurrentTime`、`api:SVGAnimationElement.targetElement`、`api:SVGAnimationElement.onbegin`、`at:animate.onbegin`、`api:TimeEvent`、`api:SVGSVGElement.pauseAnimations`、`api:SVGSVGElement.unpauseAnimations`、`api:SVGSVGElement.animationsPaused`、`api:SVGSVGElement.getCurrentTime`、`concept:smil-2026-support-status`、`css:prefers-reduced-motion`、`pr:visibility`、`concept:visibility-child-override`、`pv:visibility=collapse`、`pr:display`、`pv:transform=rotate`

**构造要点**

1. 画布与分层：viewBox="0 0 1400 900"，1 user unit = 1px，背景整体透明；只在 x∈[70,1330]、y∈[688,868] 铺一块 opacity .26 的圆角台呢（fill #2f5d4a）加 45° 斜纹 hatch，其余留空，保证 alpha=0 像素 ≥ 25%。绘制顺序：台呢 → 夹板 bbox 虚线 → 走时轮系 → 擒纵与摆轮 → 表盘 → 打点与凸轮 → 时序尺 → 基准台与事件日志 → 探针 HUD（pointer-events:none，最上层）。配色：黄铜 #d9a441/#f0c76b、深棕描边 #4a3418、钢蓝 #7fb2d6、宝石红 #d9455f、字 #f2e6cf/#9fb8ad。
2. 轮系坐标与基础变换：发条盒 (170,300) r=86、中心轮 (330,350) r=74、三轮 (450,275) r=52、四轮 (520,380) r=42、擒纵轮 (580,460) r=60（15 齿，齿廓由极坐标脚本生成）、擒纵叉枢轴 (470,520)、主摆轮 (300,590) r=115（游丝为 r 18→62 的 3.5 圈阿基米德螺线）、对照次摆 (560,650) r=52。每个轮子是 `<g transform="rotate(a cx cy)">`，SMIL 只在其上叠加，基础变换永远保留。另在 (200,100)–(420,100) 画一根子午校准杆，属性写 transform="rotate(5)"（不带 cx cy），与其未旋转的灰色幽灵副本并列，并从画布原点 (0,0) 画出半径线与虚线圆弧，证明支点是用户空间原点而不是杆件中心，与所有轮子的 rotate(a cx cy) 形成对照。
3. 摆轮与游丝软硬（keySplines 主证）：`#a-balance` = `<animateTransform attributeName="transform" type="rotate" values="-32 300 590;32 300 590;-32 300 590" dur="0.8s" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" repeatCount="indefinite">`；对照次摆 `#a-balance-hard` 几何相同但 dur="2.4s"、calcMode="linear"、repeatDur="9.6s"（跑满四摆自停），标签写"硬游丝 / 线性 / 3× 慢"。在 (908,706) 与 (908,790) 各画一张 74×74 缓动图：三次贝塞尔曲线 + 控制手柄 (0.42,0) (0.58,1)，对照图只画对角线。
4. 声明式轮系（syncbase 主证）：`#a-fork` begin="a-balance.begin"、dur="0.8s"、keyTimes="0;0.40;0.46;0.90;1"、values="-9;-9;9;9;-9"（锁面 → 冲量 → 反向锁面 → 落），repeatCount="indefinite"，把擒纵叉 80% 时间停在锁面、10% 时间完成冲量；`#a-escape` begin="a-fork.begin+0.18s" dur="0.22s" type="rotate" values="0 580 460;12 580 460" additive="sum" accumulate="sum" repeatCount="indefinite"，擒纵轮每拍净进 12°；分轮 `#a-minute` begin="a-escape.begin" 以同样方式每拍累加 1.5°。全链条不写一行 JS 驱动。
5. 装配级联与拆件（有限 syncbase + discard）：`#a-asm1`…`#a-asm4`（夹板落位 → 擒纵轮入孔 → 叉入槽 → 摆轮起摆）依次 begin="a-asmN-1.end"，dur 0.6/0.5/0.5/0.8s，`#a-balance` 的 begin 再挂到 a-asm4.end（t≈2.4s）。橙色运输固定夹 `#shipping-clamp` 由放在 `<defs>` 中的 `<discard href="#shipping-clamp" begin="a-asm4.end"/>` 永久移出 DOM，同一元素另挂 `<set attributeName="opacity" to="0" begin="a-asm4.end" fill="freeze"/>` 作为 Firefox 兜底。
6. 打点机构：`#a-strike` 的 begin 写成多值 "a-balance.repeat(6);silence-lever.click"（第 6 次摆动即 t≈7.2s 自动释放，也可手动触发），repeatCount="3"（三响），end="silence-lever.click" 让点击止打杆立刻收锤；报时锤用内联路径 `<animateMotion path="M1250,118 C1268,150 1262,196 1244,222" rotate="auto" dur="0.35s" repeatCount="3">` 抬落并自动转向；锁片 `<set attributeName="fill" to="#d9455f" begin="a-strike.begin" fill="freeze"/>` 一次性变红不再插值；静音牌 `<set attributeName="visibility" to="visible" begin="silence-lever.click" fill="freeze"/>`。止打杆本身是 (1046,268) 120×28 的 rect 按钮，hover 时由 begin="silence-lever.mouseover" 的高亮动画点亮。
7. 均时差凸轮（keyPoints 主证）：闭合凸轮廓 `#eot-cam-profile` 实描出来（中心 (1160,430)，极坐标 r=60+50·|sin(2θ)| 的双凸轮）。从动件 A 组自带 transform="rotate(-12)"，其上挂 `<animateMotion dur="9s" repeatCount="indefinite" calcMode="linear" rotate="auto" keyPoints="0;0.25;0.25;1" keyTimes="0;0.3;0.55;1"><mpath href="#eot-cam-profile"/></animateMotion>`——位移叠在自身 rotate 之上，中途在 0.25 弧长处停跳 2.25s；从动件 B 同一 mpath 但 keyPoints="1;0"、rotate="auto-reverse"、dur="4s"、repeatCount="2.5"、fill="freeze"，走 2.5 轮后停在半程。路径外侧画 0→1 的弧长刻度尺与时间刻度尺各一条，直观说明 keyPoints 管距离、keyTimes 管时间。
8. 表盘：中心 (830,300)、外圈 r=160。时针（长 92）连续 `animateTransform type="rotate" dur="120s" repeatCount="indefinite"`；分针 `#minute-hand` 由第 4 条累加链驱动；小秒盘中心 (830,400) r=52，跳秒指针 `calcMode="discrete"` values 为 20 个 18° 角、dur="8s"、repeatCount="indefinite"，逐格硬跳无中间值；小秒盘背光用 `<animate attributeName="opacity" attributeType="CSS" values="0.25;0.6;0.25" dur="1.6s" repeatCount="indefinite"/>`，与几何属性动画的 attributeType="XML" 并排标注。动力储备条 `#power-bar`（rect 700,468，宽 220）由放在 `<defs>` 里的 `<animate href="#power-bar" attributeName="width" from="220" to="46" dur="30s" fill="freeze"/>` 远程驱动，画一条虚线从"defs 通道"标记指向该条，说明动画元素并不在被驱动元素里。
9. additive 双证与失败对照：分轮组自带 transform="rotate(-8 830 300)"，其上叠三条 animateTransform——连续 rotate、additive="sum" 的每拍步进、additive="sum" 的 type="translate" 偏摆，合成为轨道式复合运动；旁边 (560,200) r=40 放一枚同构"对照轮"，第二条不写 additive（默认 replace），肉眼可见它丢掉基础旋转并被后者顶替，再旁边第三枚只挂 `<animate attributeName="transform" …>`，完全不动，标签写明 transform 必须用 animateTransform。属性动画的 additive 用在擒纵叉枢轴：`animate attributeName="cx"` 由 470 慢漂移到 476（dur="12s"），叠加 `animate attributeName="cx" values="-1.4;1.4;-1.4" dur="0.8s" additive="sum"`，并在旁画出底值位置的灰色幽灵圆，证明呈现值 = 底值 + 增量。
10. 剖开的夹板（visibility 与 display 对照）：`#top-plate`（rect 150,220 → 640,540，圆角 14）设 visibility="hidden"，其子元素红宝石轴承 (330,350) r=9 显式 visibility="visible" 依然可见；脚本读该组 getBBox() 画金色虚线外框，注明"隐藏但仍占位"。右侧 `#dummy-plate`（rect 560,180，100×62）设 display="none"，其父组 getBBox() 虚线明显收缩且不含它。铭牌 `<text>` 中插一个 `<tspan display="none">（备用编号 II）</tspan>`，使后续文字左移，与下一行未隐藏的同文案排版直接对照。探针在两块板上都不命中，但只有 visibility 那块留着外框。
11. 时序尺：时间轴 t∈[0,12s] 映射 x = 70 + t·77.5，八条 20px 泳道（装配 / 摆轮 / 叉瓦 / 擒纵 / 分轮 / 打点 / 凸轮 / 跳秒）。条形的 x 与宽度不硬编码，而是遍历 `svg.querySelectorAll('animate,animateTransform,animateMotion,set')`，用 `getStartTime()` 与 `getSimpleDuration()` 计算，重复段以刻度点标出；syncbase 关系用带箭头的黄铜连线从被依赖动画的 begin/end 处连到从属泳道起点，线上标 `a-fork.begin+0.18s`、`a-asm3.end` 等原文。第九条"停用泳道"设 visibility="collapse"，留白与 hidden 行形成对照并加注。播放头由 rAF 读 `svg.getCurrentTime()` 绘制成一条竖线，跟随一切 seek。
12. 时间基准台：滑轨 (1046,826)→(1330,826)，把手 22×34。pointerdown/pointermove 把 x 线性映射为 t∈[0,12] 调 `svg.setCurrentTime(t)`，可来回拖动把钟倒回任意一次咬合；"冻结"扳手调用 `pauseAnimations()` / `unpauseAnimations()`，状态灯读 `animationsPaused()` 显示红绿。三枚 SVG 按钮分别调用 `beginElement()` 释放 begin="indefinite" 的拆卸动画 `#a-detach`、`beginElementAt(0.5)` 预约半秒后释放、`endElement()` 急停，按钮 hover 高亮本身由 begin="…​.mouseover" 的 SMIL 动画完成。
13. 事件日志：面板 (1030,580)–(1360,776)，10 行 19px。行内容由与 SMIL 同源的调度表预生成（时刻 / 动画 id / 事件类型），运行时用 `addEventListener('beginEvent'|'repeatEvent'|'endEvent')` 与 `el.onbegin` 属性（其中 `#a-strike` 用 XML 的 onbegin= 写法）把命中的行 `data-fired="1"` 点亮为实心圆，并从 `TimeEvent.detail` 取重复序号写进行尾；摆轮的 repeatEvent 递增右上角"拍数 #N"计数器，`a-strike` 的 endEvent 把面板标题改成"打点结束"。
14. restart 三连：左边缘三根上条棘爪按钮 (70,470)、(70,520)、(70,570)，各 110×34，点击都触发同一段 0.9s 的上条转动，但分别 restart="always" / "whenNotActive" / "never"，各自旁边一枚由 beginEvent 递增的计数器：连点时第一枚一路加，第二枚只在空闲时加，第三枚永远停在 1，构成可核对的证据。
15. 减动与支持状态铭牌：装饰星轮 (990,150) r=34 用 CSS `@keyframes spin` 旋转，`@media (prefers-reduced-motion: reduce){ .deco-star{ animation:none } }`；铭牌文字由 matchMedia 写成"减动：开 / 关"，开启时脚本另行 `pauseAnimations()` 并停在基准帧，说明装饰动效与机构时基分别如何响应。另一块铭牌 (1030,556) 由运行时特性检测生成："SMIL 2026：Chrome / Firefox / Safari 均原生渲染，无 polyfill；discard：" + ('SVGDiscardElement' in window ? '支持' : '本引擎忽略，已用 set 兜底')。
16. 导出与指针探针：`?export=1` 时让文档以真实时间运行到 T0=7.40s（使真实 begin/repeat/end 事件全部发生并点亮日志），随后 `pauseAnimations()` + `setCurrentTime(7.40)` 精确定帧再置 `window.__VIS_READY__=true`；该帧擒纵处于冲量中段、锤已抬起、凸轮从动件在 62% 弧长、日志 11 行、运输夹已被 discard。SVG 根监听 pointermove：`window.__INTERACTION_COUNT__++`，HUD 卡片跟随指针显示 `svg.getCurrentTime()`、命中元素 id、驱动它的动画的 `targetElement` / `getStartTime()` / `getSimpleDuration()` / 该动画自身的 `getCurrentTime()`，以及擒纵轮宝石的 `r.animVal.value`；擒纵叉的 fill 由 CSS class 给定，冲量期被 SMIL 的 `animate fill` 覆盖，HUD 同时打印 CSS 声明值与动画呈现值，标注动画三明治的优先级。

**验收要点**

1. 冻结帧：导出时 `svg.animationsPaused() === true` 且 `svg.getCurrentTime()` 为 7.40±0.01；PNG 中擒纵叉与擒纵轮齿处于咬合冲量中段、报时锤抬起、播放头落在时序尺 x≈643。
2. 事件日志：`#event-log [data-fired="1"]` 至少 8 行，且 beginEvent / repeatEvent / endEvent 三类各至少 1 行；"拍数 #N" 与摆轮实际 repeatEvent 次数一致（(7.40−2.40)/0.8 = 6）。
3. 倒带可核对：调用 `setCurrentTime(2.05)` 后重截图，分针角度与 7.40 帧相差 ≥ 30°，运输固定夹在该帧仍然可见，滑块把手 x 与 t 的线性映射误差 < 2px。
4. discard：Chrome / Safari 中 t>2.5s 后 `document.getElementById('shipping-clamp') === null`；Firefox 中该元素仍在 DOM 但 computed opacity 为 0，且支持状态铭牌文字显示"本引擎忽略，已用 set 兜底"。
5. dur 对照：同一帧下主摆轮与对照次摆的 rotate 角度差 ≥ 20°，时序尺上两条泳道条宽比为 0.8 : 2.4（±2px）。
6. 占位对照：含 visibility="hidden" 夹板的组 `getBBox().width` 比 display="none" 组大 ≥ 90 user units，两条虚线外框在 PNG 中均可见，且隐藏夹板内的红宝石轴承依然显影。
7. keyPoints：同一帧两枚从动件在 `#eot-cam-profile` 上的归一化弧长位置相差 ≥ 0.3（用 getPointAtLength 反查最近点），rotate="auto" 箭头朝向与该点切线夹角 < 8°。
8. 交互：pointermove 使 `window.__INTERACTION_COUNT__` 递增且 HUD 时间读数刷新；连点 restart="never" 的棘爪按钮其计数停在 1，restart="always" 的计数随每次点击递增，restart="whenNotActive" 只在空闲时递增。

**实现复审**

- 已检查源模块、catalog 元数据、DOM 特性、浏览器行为与渲染产物；原始定量验收未逐条全部自动化，详见验收记录。
- 当前 Chrome 152 忽略 discard，演示以实际检测结果显示 set 兜底；原验收 #4 的 Chrome 删除 DOM 结论不能套用于本机。原点校准图已移入透明边距。

**浏览器注意**

- 2026 年 Chrome、Firefox、Safari 均原生渲染 SMIL，本场景不需要任何 polyfill，右侧铭牌用运行时特性检测把这一结论写在画面上。真实差异有四处。其一，`<discard>` 只有 Chrome 与 Safari 17+ 实现，Firefox 直接忽略，因此运输固定夹同时挂 `set opacity=0`，视觉一致而 DOM 结论不同，验收分引擎写。其二，向后 seek 时被跳过的 begin/end 事件在 Safari 与 Firefox 上不保证补发，所以事件日志的行文本来自与 SMIL 同源的预计算调度表，实时事件只负责点亮 `data-fired`；导出前先以真实时间跑到 T0=7.40s 让事件真正发生，再 `pauseAnimations()` + `setCurrentTime(7.40)` 定帧，既确定又不依赖 seek 的事件补发。其三，Firefox 对 `beginElementAt()` 与 `x.repeat(n)` 实例时间偶有一帧偏差，打点释放因此同时给出 `silence-lever.click` 这条手动 begin 实例，界面不会因差一帧而卡住；Safari 早期版本对 `mpath` + `keyPoints` 的弧长插值精度略差，故内联 `path` 的报时锤与 `mpath` 的凸轮从动件各用一套写法互为佐证。其四，`attributeType=\"CSS\"` 的属性名在 Safari 上必须小写，且 SMIL 覆盖 CSS 的动画三明治顺序在三家一致，HUD 会把 CSS 声明值与动画呈现值并排打印以便当场核对。`prefers-reduced-motion` 依赖系统设置，Playwright 用 `reducedMotion: 'reduce'` 复现，默认截图跑在 no-preference 下。网络被封锁，全部文字使用 system-ui / 等宽系统字体栈，不外链字体，也不引用任何位图。

### 3.15 `core-sample-stratigraphy` — 岩芯地层揭示台

- **用途 / 家族**：core log interpretation / geology / core logging
- **复杂度**：expert　**标签**：`clip-path`, `mask`, `hit-testing`, `effect-order`, `smil`, `stratigraphy`
- **设计问题**：当层界本身是半透明的软过渡时，裁切与掩码的真实差别到底在哪里？

**场景**　一张摊开的岩芯编录台。左端立着 ZK-114 井 0–120 m 的岩芯桶，桶身照片被切进破口的柱面轮廓里，每条发丝般的层界外面套着一圈看不见的粗描边，指针靠近 11 px 就能抓住它并读出深度。往右是展开的地层柱：砂层用抖动圆点、泥层用密排细线、灰岩用错缝砖纹，各按粒度自绘；断层处上下盘由两条裁切路径求交而成，尖灭层被子级裁切逐个削成楔子，88–92 m 的零采取率段用一个空的 clipPath 整段抹去，紧邻的对照段则写着 clip-path="none"。台面中部竖着两块仪器卡：取心窗标定卡把 clipPathUnits、clipPath transform、clip-rule、use 进裁切、整组开窗与逐块开窗一行行摆开，每行都有引线指向柱体上真正用到它的深度；遮罩解释带把同一段柱体重复八次，让人看清同一份遮罩按亮度和按透明度两种读法的差别——不透明的红斑在亮度下只透出 21%，在透明度下则全开。层界不是硬边：白到黑的渐变让接触面在 18 px 内羽化，遮罩内容自身还挂着模糊，岩芯照片经 luminanceToAlpha 直接生成自己的岩性掩码。右端是被逐段揭开的解释剖面，同一条揭开锋面上半用裁切、下半用遮罩，把这道设计问题的两个答案并排放在一起。台面下方是处理顺序架：同一支岩芯按滤镜、裁切、掩码、透明度的不同先后各渲染一遍，每格右侧那张小小的命中图由页面自己采样得出——被裁掉的部分真的点不到，被掩码淡到不可见的部分却依然响应指针。

**主打特性**

- `el:mask` — mask element
- `pr:mask-type` — mask-type property (luminance default vs alpha)
- `concept:gradient-feathered-mask` — Gradient-feathered mask edges (soft fade, vignette)
- `concept:animated-clippath-reveal` — SMIL-animated clipPath geometry (reveal/wipe)
- `concept:effect-order-filter-clip-mask-opacity` — Processing order: filter, clip, mask, opacity
- `concept:clipped-hit-testing` — Pointer events respect clip-path
- `concept:masked-hit-testing` — Pointer events ignore mask transparency

**辅助特性**

`el:clipPath`、`at:clipPath.clipPathUnits`、`av:clipPath.clipPathUnits=objectBoundingBox`、`av:clipPath.clipPathUnits=userSpaceOnUse`、`api:SVGClipPathElement.clipPathUnits`、`at:clipPath.transform`、`pr:clip-rule`、`pv:clip-rule=evenodd`、`concept:nested-clippath`、`concept:clip-path-on-clippath-children`、`concept:use-in-clippath`、`concept:clip-group-vs-children`、`pr:clip-path`、`pv:clip-path=none`、`concept:clippath-union-of-children`、`concept:clippath-ignores-paint`、`concept:clippath-child-display-none`、`concept:clippath-disallowed-children`、`concept:empty-clippath`、`concept:objectboundingbox-zero-bbox-trap`、`concept:clip-follows-target-transform`、`concept:invalid-clip-reference`、`concept:getbbox-ignores-clip`、`at:mask.x`、`at:mask.y`、`at:mask.width`、`at:mask.height`、`at:mask.maskUnits`、`av:mask.maskUnits=userSpaceOnUse`、`at:mask.maskContentUnits`、`av:mask.maskContentUnits=objectBoundingBox`、`pv:mask-type=luminance`、`pv:mask-type=alpha`、`concept:mask-luminance-colorspace`、`concept:mask-content-opacity`、`concept:nested-mask`、`concept:mask-smil-animation`、`concept:mask-on-group-vs-element`、`pr:mask`、`concept:invalid-mask-reference`、`concept:clip-after-blur-via-group`、`concept:mask-and-clip-combined`、`av:feGaussianBlur.in=SourceAlpha`、`av:feColorMatrix.type=luminanceToAlpha`、`av:animate.fill=freeze`、`av:animate.fill=remove`、`at:animate.from`、`at:animate.to`、`pr:pointer-events`、`pv:pointer-events=none`、`pv:pointer-events=bounding-box`、`pv:pointer-events=visiblePainted`、`pv:pointer-events=visibleFill`、`pv:pointer-events=visibleStroke`、`pv:pointer-events=visible`、`pv:pointer-events=painted`、`pv:pointer-events=fill`、`pv:pointer-events=stroke`、`pv:pointer-events=all`、`pv:pointer-events=auto`、`concept:hidden-elements-hit-testing`、`concept:hit-test-transparent-fill`、`concept:hit-test-overlay-rect`、`concept:hit-test-invisible-stroke`

**构造要点**

1. 画布与坐标：单个 <svg id="stage" viewBox="0 0 1400 900">，body{margin:0}，无背景矩形（透明导出）。1 用户单位 = 1 CSS px = 1 设备 px，因此 SVG 用户坐标可直接当作 client 坐标喂给 elementFromPoint，命中采样不需要 CTM 换算。深度映射 y(d) = 142 + 3.9·d，d ∈ [0,120] m → y ∈ [142,610]。五个纵栏：P1 岩芯桶 x 60–172、P2 展开柱 x 186–408、P3 取心窗标定卡 x 422–716、P4 遮罩解释带 x 730–1024、P5 解释剖面 x 1038–1340；台面下 y 646–812 是处理顺序架，y 820–876 是拾取策略条，页眉 y 36–104（含右侧读数区）。
2. 岩性数据与纹理：mulberry32(0x5EA1) 固定种子生成 16 层（顶深、底深、岩性 ∈ sand/mud/limestone、粒度 1–5）。三种岩性用自绘几何而非 <pattern>（<pattern> 是 jacquard-loom-draft 的主场）：sand = 泊松抖动圆点场，r = 1.1 + 1.6·rand，密度随粒度线性升；mud = 3.2 px 间距、0.7 px 水平细线、端点 ±0.4 抖动；limestone = 24×9 砖缝、隔行半格错位。岩芯照片由页面内 <canvas> 按同一种子画出 128×496 柱面（灰岩亮、泥岩暗），toDataURL('image/png') 后作为 data: URI 注入 <image id="core-photo">，全场景零网络请求。
3. P1 岩芯桶把 el:clipPath 的正例与三个反例塞进同一个 <clipPath id="clip-barrel">：body <rect> + 顶端 <ellipse> + 底端断口 <path> 三个子元素取并集（concept:clippath-union-of-children）；其中一个子元素故意写 fill="#f00" stroke-width="20"，说明裁切只取几何、不看涂色（concept:clippath-ignores-paint）；再放一个 display="none" 的子元素（不参与，concept:clippath-child-display-none）和一个包着大矩形的 <g>（非法子元素、被整体忽略，concept:clippath-disallowed-children）。<image> 以属性形式引用 clip-path="url(#clip-barrel)"。
4. 发丝层界的抓手：P1 每条层界是 0.9 px 实线，同路径再叠一条 stroke="transparent" stroke-width="22"、pointer-events="stroke" 的隐形描边，身后画 6% 不透明度的 22 px 淡带作为可见提示（concept:hit-test-invisible-stroke）。指针进入 11 px 内层界变亮，页眉读数区打印该层界深度。桶身整组套 filter="url(#f-sil)"：<feGaussianBlur in="SourceAlpha" stdDeviation="5"/> + feFlood(#06121f,.55) + feComposite operator="in"，再 feMerge 回 SourceGraphic —— 多色岩芯先塌成纯黑剪影再当阴影，旁注「SourceAlpha → 剪影」（av:feGaussianBlur.in=SourceAlpha）。
5. P2 断层：clipPath#blk-hw 内是上盘多边形，且它自身带 clip-path="url(#log-extent)"，所以上盘层组的可见区是「断块 ∩ 柱体范围」的透镜形而不是并集（concept:nested-clippath）。下盘 #blk-fw 沿断层面下移 24 px（落差 6 m），并改由内联 <style> 的 .blk-fw{clip-path:url(#blk-fw)} 施加，与上盘的属性写法像素一致（pr:clip-path 属性 vs CSS 两种写法）。
6. P2 尖灭与缺失：clipPath#pinch 的三个 <rect> 子元素各自带 clip-path="url(#taper-1|2|3)"，被逐个削成向右收敛的楔形，裁切区最终是「一整块下伏层 + 三块被削楔子」的并集（concept:clip-path-on-clippath-children）。88–92 m 的 0% 采取率段用空的 <clipPath id="clip-void"/> 整段抹去（concept:empty-clippath，两引擎实测 alpha = 0）；92–96 m 段写 clip-path="none" 作对照（pv:clip-path=none）；再下一段故意写 clip-path="url(#missing-core)" 指向不存在的 id —— 实测 Chromium 152 / Firefox 155 按 CSS Masking 处理为「不裁切、照常渲染」，旁注点明这与 SVG 1.1「视为错误、不渲染」的旧措辞相反（concept:invalid-clip-reference）。三格并排，正好是空裁切、不裁切、无效引用三种结局。
7. P3 取心窗标定卡共 6 行，每行是左右一对 120×54 小样，行右伸出引线指到 P2 中真正用到该技法的深度，卡片因此不是孤立色板。行1：同一个默认 userSpaceOnUse 窗口作用在 120×54 与 40×54 两片岩芯上，后者几乎被切光（av:clipPath.clipPathUnits=userSpaceOnUse）。行2：同一窗口改写成 0..1 的 clipPathUnits="objectBoundingBox" 圆，三片不同尺寸各得等比椭圆窗（av:clipPath.clipPathUnits=objectBoundingBox）；脚注用 SVGClipPathElement.clipPathUnits.baseVal 读回枚举值 1/2 打进标签（api:SVGClipPathElement.clipPathUnits）。
8. P3 行3 零 bbox 陷阱：一条 0 高的层界线套 objectBoundingBox 裁切 → 整条消失（两引擎实测一致），右侧给出「补 0.01 高度」的修复版（concept:objectboundingbox-zero-bbox-trap）。行4 transform：两个相同方窗，右侧的 <clipPath transform="rotate(45 ...)"> 把窗口转成菱形；两个目标又都置于按 12° 倾角旋转的层组内，说明裁切随目标用户坐标系一起转（at:clipPath.transform、concept:clip-follows-target-transform）。同时画出被裁目标的 getBBox() 虚线框，明显大于可见部分（concept:getbbox-ignores-clip）。
9. P3 行5 clip-rule：黄铁矿星形双晶（自交五角）作裁切，左片默认 nonzero 整颗填满岩芯照片，右片子路径写 clip-rule="evenodd" 中心被掏空（实测中心像素由实色变为背景）（pr:clip-rule、pv:clip-rule=evenodd）；注意 clip-rule 只对 clipPath 子元素生效，直接画在图形上无效，卡片脚注写明这一点。行6 use 与分组：<clipPath><use href="#glyph-nodule"/></clipPath> 正常把灰岩纹理切成结核符号，另一格 <use href="#legend-group"> 指向 <g> —— 两引擎实测裁切区判为空、目标整块不可见，旁注「use→g 无效」（concept:use-in-clippath）；行右再放一对取样窗，<g clip-path="url(#plug-window)"> 整组只开一个圆窗 vs 同样碎块逐个 clip-path 各开一窗（concept:clip-group-vs-children）。
10. P4 遮罩解释带把同一段 <use href="#core-seg"> 重复 8 次、每格 78 宽。亮度/透明度对照：同一份遮罩内容（白渐变 + 一块不透明红斑）分别以 mask-type="luminance"（默认）与 mask-type="alpha" 解释 —— 实测红斑在 luminance 下只透出 54/255 ≈ 0.212（Rec.709 红系数），在 alpha 下全透（pr:mask-type、pv:mask-type=luminance、pv:mask-type=alpha、concept:mask-luminance-colorspace）。羽化格：sand/mud 接触面用白→黑 linearGradient 在 18 px 内渐隐，岩芯照片外缘再叠 radialGradient 暗角（concept:gradient-feathered-mask），且遮罩内容自身挂 filter="url(#f-soft)"（feGaussianBlur stdDeviation=4），软边来自遮罩内部而非目标。
11. P4 自动岩性掩码格：把 #core-photo 复制进遮罩内容并加 filter="url(#f-l2a)"（feColorMatrix type="luminanceToAlpha"），亮的灰岩变不透明、暗的泥岩变透明。实测该滤镜输出是「纯黑 + 变化 alpha」，必须配 mask-type="alpha" 才显影；隔壁格保留默认 luminance 作为全黑反例，两格并排就是这条陷阱的完整解释（av:feColorMatrix.type=luminanceToAlpha）。另设一格用 color-interpolation-filters="sRGB" 的同款滤镜，注出与默认 linearRGB 的读数差。
12. P4 遮罩窗口三格：x=".25"（默认 objectBoundingBox 单位）让左 1/4 段整段不可见，虚线画出遮罩区域本身（at:mask.x、at:mask.y）；maskUnits="userSpaceOnUse" 的孪生格用同一组绝对坐标，把矮段整段切光（at:mask.maskUnits、av:mask.maskUnits=userSpaceOnUse）；带模糊晕的断层影线格给出默认 −10%/120% 区域裁掉光晕（实测 bbox 外 12 px 已归零）vs x="-50%" y="-50%" width="200%" height="200%" 保住光晕的对照（at:mask.width、at:mask.height）。取样孔两格：默认 maskContentUnits="userSpaceOnUse" 的 40 px 白圆在高矮两段上开出同样大小的孔；maskContentUnits="objectBoundingBox" 的 0..1 白圆随各自 bbox 等比缩放（at:mask.maskContentUnits、av:mask.maskContentUnits=objectBoundingBox）。
13. P4 组 vs 逐元素与写法格：三片交叠的岩性带整组挂一个渐变遮罩 → 交叠处仍是连续渐变（实测透出 0.95 / 0.50 / 0.07）；逐片各挂同一遮罩 → 交叠处反而更实（0.89 / 0.90 / 0.12），出现可见接缝（concept:mask-on-group-vs-element）。一格用 mask="url(#m-fade)" 属性、孪生格用内联 <style> 的 .fade{mask:url(#m-fade)}，实测像素完全一致（pr:mask）；再一格写 mask="url(#nope)" → 实测按「不遮罩、照常渲染」处理（concept:invalid-mask-reference）。半格用 fill-opacity=".5" 的白遮罩内容（concept:mask-content-opacity），另半格让遮罩内容自身再套一层遮罩做双重衰减（concept:nested-mask），两者实测都落在 0.502。
14. SMIL：P4 取样灯是遮罩里的白圆，<animate attributeName="r" from="0" to="46" dur="1.8s" fill="freeze"/>，冻结后解释带保持全开（concept:mask-smil-animation、at:animate.from、at:animate.to、av:animate.fill=freeze）；旁边一条扫描光带用同类但 fill="remove" 的动画作对照，冻结时刻回到初值，两格标签直接写出各自的 fill 值（av:animate.fill=remove）。P5 解释剖面用 clipPath#reveal 内 5 个 <rect>，逐段 <animate attributeName="width" from="0" to="302" begin="0.6s|1.1s|1.6s|2.1s|2.6s" dur="0.9s" fill="freeze"/> 把层序解释一段段揭开（concept:animated-clippath-reveal）；同一条揭开锋面上半段走 clip 呈硬边、下半段再穿过一张羽化遮罩呈软边，把本demo的设计问题的两个答案并排摆在同一条边上。P5 的井震标定点是一颗五角星，pointer-events="bounding-box" 并画出虚线 bbox（pv:pointer-events=bounding-box）；所有注记文字所在 <g> 写 pointer-events="none"，压在剖面上却从不挡拾取（pv:pointer-events=none）。
15. 处理顺序架 4 格，x = 60/385/710/1035，格内渲染区 186×110 起于 y 652，右侧 84×50 是命中缩略图，其下 84×50 是把该格左上角边缘 3× 放大的 <use transform="scale(3)"> 检视窗，让边缘差别在 1400 px 宽的 PNG 里也读得出。格1：单元素同时写 filter/clip/mask/opacity —— 规范固定为 filter → clip → mask → opacity，模糊被裁出硬边（实测裁切外 12 px 已全透）。格2：filter 提到外层 <g>、clip 留在内层 <use>，模糊反而溢出裁切边约 4 px（实测该处仍有可见色）（concept:clip-after-blur-via-group）。格3：内层 mask、外层 clip，先羽化再硬切（concept:mask-and-clip-combined）。格4：左半 <g opacity=".5"> 包两片交叠、右半两片各写 opacity=".5"，组透明先合成后降透、元素透明在交叠处叠深（实测 alpha 128 vs 192）。四格合起来即 concept:effect-order-filter-clip-mask-opacity。
16. 命中图与拾取条：布局稳定后（连续两帧 rAF）对每格渲染区按 5 px 网格调用 document.elementFromPoint，落在本格目标上记为命中，结果按 0.45 缩放画进右侧缩略图（命中画实心方块、未命中留空），命中率写入 data-hit-ratio。含裁切的格被切区真的点不到（比率约 0.5），纯掩码格哪怕全黑不可见仍全部命中（比率约 1.0，实测 elementFromPoint 返回被遮罩元素本身）—— concept:clipped-hit-testing 与 concept:masked-hit-testing 的正面对照。底部拾取策略条排 11 枚同样的岩性小片，依次写 pointer-events = auto / visiblePainted / visibleFill / visibleStroke / visible / painted / fill / stroke / all / none / bounding-box，片下标出取值，悬停只在该值允许处改色（实测 visibleStroke 的内部不命中、painted 即使 visibility="hidden" 仍命中、fill 即使 fill="none" 仍命中内部，concept:hidden-elements-hit-testing）；右侧三枚补充片：fill="transparent" 内部可命中、fill="none" 只有描边可命中（concept:hit-test-transparent-fill），第三枚是 Safari 的 bounding-box 兜底透明覆盖矩形（concept:hit-test-overlay-rect）。
17. 交互与导出：stage 上挂 pointermove，自增 window.__INTERACTION_COUNT__，用 elementFromPoint 取当前目标并在页眉读数区打印「id · 裁切内/外 · 掩码 α」。两个探针位置刻意安排在捕获脚本会经过的点上：(672,468) 落在 P3 行4 方窗被裁掉的那一半 → 读数「裁切之外 · 未命中」；(756,414) 落在 P4 x=".25" 那格被遮成全透明的左 1/4 → 读数「掩码不可见 · 仍命中」。导出路径 ?export=1：连续两帧 requestAnimationFrame 之后再执行 stage.setCurrentTime(3.2); stage.pauseAnimations();（实测在解析期同步调用 setCurrentTime 会被静默忽略、时间线停在 0），此时前四段剖面已完全揭开、第五段停在 67% 的揭开锋面上，构成有意义的静帧，最后置 window.__VIS_READY__ = true。

**验收要点**

1. DOM：stage.querySelectorAll('clipPath').length ≥ 14 且 mask 元素 ≥ 12；除刻意的 #missing-core 与 #nope 两处反例外，所有 clip-path / mask 的 url(#…) 都能在文档内解析到同名元素。
2. DOM：四个处理顺序格的命中缩略图都带 data-hit-ratio；含裁切的格 ≤ 0.62，纯掩码格 ≥ 0.97 —— 被裁掉的采样点未命中、被遮罩淡到不可见的采样点仍然命中。
3. PNG：P2 的 0% 采取率段（空 clipPath，约 x 200–400 / y 485–500）像素 alpha 全为 0；紧邻的 clip-path="none" 对照段在同一扫描行 alpha > 200。
4. PNG：P4 亮度/透明度对照两格在红斑的同一相对位置上，luminance 格的合成 alpha 落在 0.18–0.25（实测参考 54/255），alpha 格 ≥ 0.98。
5. PNG：P5 揭开锋面 —— y = 560 一行自 x 1038 起连续有像素，直到 x 落在 1230–1260 之间中断、其右为透明，证明前四段已冻结完成而第五段停在动画中途。
6. 交互：指针移到 (672,468) 后读数文本含「未命中」，移到 (756,414) 后含「仍命中」，且两次移动后 window.__INTERACTION_COUNT__ 均增加。
7. DOM：stage.getCurrentTime() === 3.2 且 stage.animationsPaused() === true，window.__VIS_READY__ === true（顺序错误时 getCurrentTime 会停在 0，可直接判失败）。
8. PNG：整幅透明像素 ≥ 8%、可见像素 ≥ 3.5%、彩色像素 ≥ 2500（沿用仓库既有导出阈值）；P3 行3 零 bbox 那格除标注文字外无岩芯像素。

**实现复审**

- missing-core 与 nope 是刻意展示的无效引用；引用门禁只对本场景允许这两个 id。
- 截图在3.2 s冻结；四个网格独立调用 elementFromPoint，裁切格约0.43、遮罩格约0.97。
- 密集说明缩短到面板范围内，完整语义保留在构造说明。
- 亮度遮罩必须隔离不透明底板测 alpha：实测红斑 54/255，alpha 掩码为 1。扫描 y=560 的第五段锋面为 x=1238。

**浏览器注意**

- 实测环境为 headless Chromium 152.0.7977.64 与 Firefox 155.0.1（file:// 本地页、网络断开），本场景用到的裁切、遮罩、滤镜与命中行为两者逐像素一致（差异 ≤ 1/255），下列差异都是跨引擎的真实缺口。（1）pointer-events: bounding-box：Chromium / Edge / Firefox 支持（实测星形空角可命中），Safari/WebKit 至今未实现；回退用 CSS.supports('pointer-events','bounding-box') 检测，不支持时在星形下补一块 fill=\"transparent\" 的 bbox 覆盖矩形，并把该片标签改写为「Safari 兜底」，虚线 bbox 提示两种情况下都画。（2）遮罩亮度的色彩空间：CSS Masking 规定按 sRGB 计权，Chromium / Firefox 实测纯红透出 54/255 = 0.212（Rec.709 的 0.2126）；WebKit 历史上按 SVG 1.1 在 linearRGB 下计算，会把同一块红读得更暗。因此红斑格的标签写的是运行时实测值而不是硬编码常数，跨引擎不会说谎。（3）CSS 写法：mask: url(#m) 简写、mask-image: url(#m) 长写与 mask 属性在 Chromium / Firefox 上实测等价；Safari 对 HTML 元素仍需 -webkit-mask-*，对 SVG 元素用标准 mask。CSS 那一格用 @supports (mask-image: url(#x)) 包裹，并在运行时把 getComputedStyle(el).maskImage 打进标签——引擎若没吃下这条声明，标签会直接显示 none。（4）无效引用：clip-path=\"url(#不存在)\" 与 mask=\"url(#不存在)\" 在 Chromium 152 / Firefox 155 都按 CSS Masking 处理成「不裁切 / 不遮罩、元素照常渲染」（实测为原色），而 SVG 1.1 的旧措辞是「视为错误、元素不渲染」，旧版 WebKit 可能仍按不渲染处理；场景把这两格标注为「行为依引擎而定」，并且不让它们进入验收像素断言。（5）与之相反，空的 <clipPath/>（无子元素）和 <use> 指向 <g> 的裁切在两引擎都判定裁切区为空、目标整块不可见（实测 alpha = 0）；这三种结局排在一起，正是场景要讲的「空 ≠ 无效」。（6）SMIL：Chromium / Firefox / Safari 均可用，但 setCurrentTime() 必须在时间线启动之后调用——实测在解析期同步调用会被静默忽略、getCurrentTime() 仍为 0，因此导出路径固定为「两帧 rAF → setCurrentTime → pauseAnimations」。另设 ?static=1 分支（也用于 prefers-reduced-motion）：不插入任何 <animate>，直接把终值写成静态属性，静帧与冻结帧一致。（7）命中采样依赖 document.elementFromPoint，它对视口外坐标返回 null；导出视口固定 1400×900、body{margin:0}、舞台无滚动条，所以 SVG 用户坐标可直接当 client 坐标用；若嵌进有滚动的宿主页面，需加上 getBoundingClientRect() 的偏移。（8）不加载任何 webfont，文字走系统字体栈，构图不依赖测量文本宽度，字体替换只改字形不改版面；唯一位图是页面内 <canvas>.toDataURL() 生成的岩芯柱面 PNG，以 data: URI 内联，捕获时网络可全程断开。

### 3.16 `seismic-drum-console` — 地震记录鼓控制台

- **用途 / 家族**：seismic recording console / instrument console
- **复杂度**：expert　**标签**：`seismology`, `viewbox-camera`, `coordinate-mapping`, `pointer-events`, `motion-path`, `matrix-math`, `nested-viewport`
- **设计问题**：一段记录的坐标真相究竟住在 viewBox 里、CTM 里，还是指针里？

**场景**　记录室的熏烟纸鼓被展平成一张二十四小时的琥珀色记录纸：每小时一行，共 24 行铺在中央的取景窗里。已封存的行是暗褐色的旧道，当前三行正在显影——笔尖沿着一条运动路径缓缓右行，走过之处虚线偏移把地震道一段段显出来，行末抬笔、沿回程弧扫回左端、落笔换行。左下角的总览窗是另一个嵌套视口，用覆盖裁剪把整天塞进一格，格内那道亮框就是取景窗此刻框住的范围。滚轮在光标处缩放改写取景矩形，拖拽平移移动相机原点，台面一变宽，下方时标尺立刻重新分格。控制台最要紧的器件是右下角那条读数条：同一秒有三种说法——屏幕坐标经屏幕矩阵求逆还原成用户空间，取景相机、变换列表与手算矩阵对同一个采样点各报一次走时，三行数字并排列出；任何一次缩放或平移之后它们必须逐位相同，校验灯才是绿的，第四行故意留给只看 offsetX 的天真读法，红着字告诉你少算了信箱边和视口原点会差出多少秒。三支笔分别由 CSS 关键帧、Web Animations 与逐帧脚本驱动，笔位不同、显影长度不同，行下方的抖动带把每帧间隔和三者的相位误差画在同一张纸上。

**主打特性**

- `concept:mouse-to-svg-coordinates` — Screen to user space via getScreenCTM().inverse() and DOMPoint
- `api:SVGGraphicsElement.getScreenCTM` — getScreenCTM
- `concept:wheel-zoom` — wheel event driven zoom/pan of the viewBox
- `api:DOMMatrix` — DOMMatrix construction and multiplication
- `api:SVGAnimatedRect.baseVal` — viewBox.baseVal scripted pan and zoom
- `pr:offset-path` — offset-path: path() motion path
- `api:Window.requestAnimationFrame` — requestAnimationFrame-driven attribute updates

**辅助特性**

`api:SVGSVGElement.viewBox`、`api:SVGSVGElement.currentScale`、`concept:viewbox-camera-zoom`、`concept:viewbox-camera-pan`、`concept:viewbox-negative-origin`、`concept:nested-svg-viewport`、`av:svg.preserveAspectRatio=slice`、`pr:overflow`、`concept:nearest-viewport-percentage-resolution`、`concept:percentage-diagonal-formula`、`concept:pointer-to-user-space`、`api:SVGGraphicsElement.getCTM`、`api:DOMPoint.matrixTransform`、`api:SVGTransformList`、`api:SVGAnimatedTransformList.baseVal`、`api:SVGSVGElement.checkIntersection`、`api:SVGElement.dataset`、`api:ResizeObserver.observe`、`api:IntersectionObserver.observe`、`css:animation-timeline-scroll`、`concept:line-drawing-dash-animation`、`pr:offset-distance`、`pr:offset-rotate`、`api:Element.animate`、`concept:pointer-events-api`、`concept:touch-events`、`pr:cursor`、`pr:touch-action`、`api:DOMMatrixReadOnly.inverse`、`api:SVGSVGElement.createSVGPoint`、`api:SVGSVGElement.createSVGMatrix`、`api:SVGSVGElement.createSVGRect`、`api:SVGSVGElement.createSVGTransformFromMatrix`、`api:SVGTransform.setRotate`、`api:SVGTransformList.consolidate`、`api:SVGMatrix`、`api:MouseEvent.offsetX`、`api:SVGGraphicsElement.nearestViewportElement`、`api:Animation.playbackRate`、`api:Document.getAnimations`、`concept:waapi-non-css-attribute-animation`、`api:PointerEvent.getCoalescedEvents`、`concept:multi-touch-gesture`、`pv:touch-action=none`、`pv:overflow=scroll`

**构造要点**

1. 坐标分层与命名（全场景只有三层坐标，所有读数都写明自己在哪一层）：屏幕空间＝client px；台面空间＝根 `<svg id="console" width="1400" height="900" viewBox="0 0 1400 900">` 的用户单位；记录纸空间＝相机嵌套视口的 viewBox 单位，宽 1440＝60 分钟（24 单位/分，1 单位＝2.5 s），高 840＝24 行×35。舞台宿主是 `div#stage`（1400×900，透明），内含根 `<svg>` 与唯一一块 HTML 元素——右侧走纸卷筒滚动容器（见第 13 条）。
2. 版面矩形（台面单位）：抬头 16,16–1384,104；左控制列 16,120–180,690；校准靶 24,706–172,854；相机窗 196,128–1156,648（960×520）；时标尺 196,656–1156,688；总览窗 196,700–500,832（304×132）；标定条 516,700–916,800（400×100）；溢出三联 516,812–916,884（三格 120×72，间隔 20）；读数条 936,700–1384,884；走纸卷筒 1172,128–1382,648。图层顺序：纸面底衬 → 网格/行分隔 → 已封存道 → 显影中道 → 事件标注 → 笔臂三件套 → 相机边框与信箱条 → 覆盖层（采样十字、取景角点、框选矩形） → 面板组 → 控制列 → 抬头。
3. 相机嵌套视口：`<svg id="camera" x="196" y="128" width="960" height="520" viewBox="0 0 1440 840" preserveAspectRatio="xMidYMid meet">`（concept:nested-svg-viewport）。meet 比例 k=min(960/1440,520/840)=0.61905，绘制宽 891.43，左右各留 34.29 的信箱空隙——用两条竖向暗色条明确画出来并标注「信箱边 34.29 px」，因为后面所有指针换算的坑都在这两条带子里。相机内容超出视口的部分由默认 `overflow:hidden` 裁掉。
4. 记录纸生成：用固定种子的 PRNG（xorshift32，seed 20260907）为每个整点生成 1440 个采样，值＝粉噪声基线＋两次事件（14 时与 17 时）的 P/S 波包（指数衰减正弦），振幅裁到 ±15 单位。每行落成一条 `<path>`（360 点抽稀，d 用 `L` 折线），同时把逐点累积弧长 cumLen[i] 与其 x 存入表，供第 7 条的显影同步用。行组为 `<g class="row" data-hour="09" data-state="…" transform="translate(0,315)">`，行内基线 y=17.5。
5. 行状态与 dataset：`data-state` 取 sealed/recording/flagged/blank；`<style>` 里用 `[data-state="sealed"] .trace{stroke:#8a6b46;opacity:.7}`、`[data-state="recording"] .trace{stroke:#ffcf7a}`、`[data-state="flagged"]{filter:none;}` 配一条琥珀色晕带 `<rect class="flag">` 着色（api:SVGElement.dataset）。点击任一行把 `el.dataset.hour` 与 `el.dataset.state` 写进读数条标题「选中 14 时行 · flagged」。光标：记录纸 `cursor:grab`（拖拽中根节点加 `[data-drag]` 切 `grabbing`）、采样十字 `crosshair`、时标尺 `ns-resize`、sealed 行 `not-allowed`，左控制列并排四块 24×24 样例砖标注各自取值（pr:cursor）。
6. 三支笔与运动路径：09/10/11 三行各一支笔，行内基线 yc 分别 332.5/367.5/402.5（记录纸空间）。每支笔的路径写成 CSS `offset-path: path('M 36 Y H 1404 C 1432 Y 1432 Y-30 1404 Y-30 H 36 C 8 Y-30 8 Y 36 Y Z')`（pr:offset-path，总长≈2926，行段占 46.75%），并显式声明 `transform-box: view-box; transform-origin: 0 0;` 免得引擎按边框盒解析。笔架是三件套，共用同一条路径：笔尖 `offset-rotate: auto`、回程刮刀 `offset-rotate: reverse`、墨罐配重 `offset-rotate: 0deg`（pr:offset-rotate）——在回程弧上三者朝向明显分叉。`offset-distance` 关键帧为 0%→0、82%→46.75%、100%→100%，于是 82% 之后就是抬笔、沿弧扫回、落笔（pr:offset-distance）；左控制列另有「笔位」滑轨直接静态写 `style.offsetDistance`，用于定格调试。
7. 显影与三种驱动：脚本按第 4 条的 cumLen 表生成 40 段关键帧（每 2% 行程一段）把 `stroke-dashoffset` 从 L 精确降到 0，`stroke-dasharray` 设为 `L L`（concept:line-drawing-dash-animation）。同一张关键帧表喂给三条链——09 行由 `<style>` 内的 `@keyframes` 驱动；10 行由 `pen.animate(frames,{duration:24000,iterations:Infinity})` 驱动（api:Element.animate），并在旁边留一条注释行说明 WAAPI 只能动 `stroke-dashoffset`、`offset-distance` 这类映射成 CSS 属性的东西，动不了 `points` 这种几何属性（concept:waapi-non-css-attribute-animation）；11 行由 rAF 每帧重算：改写活动道 `<polyline>` 的 `points`、写笔架 transform（api:Window.requestAnimationFrame）。走纸速度旋钮改 `anim.playbackRate`（api:Animation.playbackRate），读数条列出 `document.getAnimations()` 的条目——CSS 笔与 WAAPI 笔在列表里，rAF 笔不在，这就是三种驱动的证据（api:Document.getAnimations）。11 行下方 30 单位处画抖动带：rAF 保留最近 240 帧的 dt 画成竖条（>20 ms 标红为丢帧），并每 500 ms 采一次三支笔的实际相位（CSS 笔读 `getComputedStyle(pen).offsetDistance`，WAAPI 笔读 `anim.currentTime` 换算，rAF 笔用自身状态）画三条相位误差细线，标注中位 dt 与最大相位差 ms。
8. 三链读数（场景核心，读数条四行等宽数字并列）。取指针 `(clientX,clientY)`，各链独立算出采样点的记录纸坐标与走时 t＝floor(y/35) 小时 + x×2.5 秒，格式 `hh:mm:ss.mmm`：链 A 相机链——只读 `camera.viewBox.baseVal`（api:SVGSVGElement.viewBox / api:SVGAnimatedRect.baseVal）与视口 x/y/width/height，按 meet 公式手推 k=min(w/vw,h/vh)、tx=x0+(w−vw·k)/2、ty=y0+(h−vh·k)/2，与根 `getScreenCTM()` 复合后求逆；链 B 变换链——直接 `rowGroup.getScreenCTM().inverse()`（api:SVGGraphicsElement.getScreenCTM、api:DOMMatrixReadOnly.inverse）把 DOMPoint 打回行内空间，再用 `rowGroup.getCTM()`（api:SVGGraphicsElement.getCTM）补回到相机视口空间，旁注 `trace.nearestViewportElement === camera`，解释 getCTM 为什么停在相机而不是根（api:SVGGraphicsElement.nearestViewportElement）；链 C 手算链——不碰任何 CTM API，只用 `stage.getBoundingClientRect()` 与属性数字，`new DOMMatrix().translateSelf(rect.x,rect.y).scaleSelf(sx,sy).translateSelf(tx,ty).scaleSelf(k,k).translateSelf(-vx,-vy)`，再 `.inverse()` 配 `point.matrixTransform(m)`（api:DOMMatrix、api:DOMPoint.matrixTransform）。三行必须逐位相同（|Δ|<1e-6 s），校验灯写 `data-verdict="match"` 亮绿并计数「校验 N 次 / 失配 0」；第四行是天真链，直接拿 `event.offsetX × vw/width`（api:MouseEvent.offsetX），漏掉信箱边与 viewBox 原点，缩放后误差通常几十秒，红字标出差值。脚注一行用 `createSVGPoint()`/`createSVGMatrix()`/`SVGMatrix` 复算同一点，打勾表示与 DOMPoint/DOMMatrix 同值（api:SVGSVGElement.createSVGPoint、api:SVGSVGElement.createSVGMatrix、api:SVGMatrix）。
9. 相机操纵：`wheel` 监听 `{passive:false}` 并 `preventDefault()`，先用链 B 把光标还原成记录纸坐标 p，再令 `vw*=f`（f=1.0018^deltaY，钳制 vw∈[180,2880]）、`vx = p.x − (p.x−vx)·f`，vy 同理，写回 `camera.viewBox.baseVal`（concept:wheel-zoom、concept:viewbox-camera-zoom、concept:viewbox-camera-pan）——于是缩放锚在光标下的那一秒不动。左键拖拽平移：位移除以当前 k 后减到 `viewBox.baseVal.x/y`；左控制列另有「取景滑轨」用数值直接设 `viewBox.baseVal.x` 与 `.width`，与滚轮共享同一个 clamp。相机 `<svg>` 上 `touch-action:none` 保证移动端拖动是平移画面而非滚页（pr:touch-action、pv:touch-action=none），走纸卷筒用 `touch-action:pan-y`，两处都读 `getComputedStyle` 把实测值印在旁边的芯片上。双指 `touchmove` 按两点距离比缩放 viewBox（concept:multi-touch-gesture）。每次相机变更后立即重跑第 8 条的三链校验，并刷新第 10、12 条的派生元素。
10. 总览窗与取景角点：`<svg x="196" y="700" width="304" height="132" viewBox="0 0 1440 840" preserveAspectRatio="xMidYMid slice">` 覆盖裁剪，k=0.21111，绘制高 177.33，上下各裁 22.67（av:svg.preserveAspectRatio=slice；旁边放一对 40×20 小样标注 meet 留空隙、slice 裁两头）。窗内画全天缩略道，加一个亮框 `<rect>` 实时反映相机 viewBox；框的四个角用 `DOMPoint(x,y).matrixTransform(M)` 分别映射到台面空间与总览空间，各画一个青色小圆，缩放平移后必须仍贴在角上。窗内再放一个 `width="50%"` 的取景带 `<rect>`：它按最近视口的 viewBox 解析＝720 记录纸单位＝152 px，恰好半个窗；台面上同写法的兄弟 `<rect width="50%">` 是 700 台面单位，两个数字并排标出（concept:nearest-viewport-percentage-resolution）。
11. 标定条与溢出三联：标定条 `<svg x="516" y="700" width="400" height="100" viewBox="0 0 400 100">` 内放 `<circle cx="200" cy="50" r="50%">`，实际 r=0.5·sqrt((400²+100²)/2)=145.77，标注「>半高 50，<半宽 200」，圆被视口裁成一条宽弧带（concept:percentage-diagonal-formula）。其下三格 120×72 的嵌套 `<svg>` 各含一个溢出视口边界的圆，分别 `overflow:hidden` / `visible` / `scroll`：第一格裁在框内、第二格溢到台面上、第三格标注「实测等同 hidden，SVG 视口不出滚动条」（pr:overflow、pv:overflow=scroll）。
12. 校准靶与时标尺：校准靶 `<svg x="24" y="706" width="148" height="148" viewBox="-50 -50 100 100">`，两条轴穿过 (0,0) 落在面板正中，四象限刻度（concept:viewbox-negative-origin）；把当前采样点归一化到 ±50 后打点，并用 `DOMPoint(0,0).matrixTransform(handMatrix)` 画出手算链认定的原点，验证「原点在正中」。时标尺用第 8 条链 A 的 M 把记录纸的分钟位置映射进台面空间画刻度，因此刻度必须落在信箱边之内；步长在 {1,2,5,10,15} 分里选第一个使刻度间距 ≥26 px 的值。`ResizeObserver` 同时观察相机 `<svg>` 与 `div#stage`（哪个先报用哪个），左控制列「台面宽度」滑轨改相机 `width` 属性（720…1120），回调里重算 k、信箱边、刻度步长并把 `contentRect` 尺寸原样印在尺子右端（api:ResizeObserver.observe）。
13. 走纸卷筒（滚动驱动）：`div#feed`（1172,128,210×520，`overflow-y:auto`，透明底＋琥珀细框）里嵌一张 `<svg width="210" height="1560">`，把全天 24 小时竖排成缩微纸带。带上每条道用 `animation: ink linear both; animation-timeline: scroll(nearest block);`，`@keyframes ink{from{stroke-dashoffset:var(--len)}to{stroke-dashoffset:0}}`——不滚就完全静止，滚动到哪画到哪（css:animation-timeline-scroll）。同一容器作为 root 的 `IntersectionObserver`（threshold .25）给刚进入视野的小时块跑一次淡入并 `unobserve`，已在视野内的不重播（api:IntersectionObserver.observe）。用 `CSS.supports('animation-timeline: scroll()')` 探测，false 时退回 `scroll` 事件直接写 `stroke-dashoffset`，视觉一致并在面板角上标 `data-fallback="scroll-listener"`。
14. 变换列表演示台（读数条上沿 936,700–1384,760）：把 rAF 笔架的 `transform.baseVal` 当教具，每秒推进一步——`appendItem(createSVGTransformFromMatrix(handMatrix))` → `createSVGTransform()` 后 `setRotate(角度, cx, cy)` → 追加 scale，读数条打印 `numberOfItems: 3` 与三项类型，然后 `consolidate()` 合成一项并印出合并后的 a b c d e f，元素同步可见地平移→旋转→缩放（api:SVGTransformList、api:SVGAnimatedTransformList.baseVal、api:SVGSVGElement.createSVGTransformFromMatrix、api:SVGTransform.setRotate、api:SVGTransformList.consolidate）。定格时停在「步 2/3」并保留列表长度文本。
15. 指针层与框选：`pointerdown/move/up` 驱动手描注记笔——笔迹跟着指针出现，线宽由 `pressure`（无压感时回落 0.5）决定，颜色按 `pointerType` 分 mouse/pen/touch 三色并配图例；每次 move 调 `getCoalescedEvents()` 补齐中间点，读数条印出本次合并事件数（concept:pointer-events-api、api:PointerEvent.getCoalescedEvents）。`touchstart/move/end` 为每个手指生成编号圆随指移动、抬起即消（concept:touch-events），桌面无触摸时面板显示一段录制好的 TouchList 回放（标注「回放」）以保证静帧可读。Shift+拖拽拉出框选矩形：用 `camera.createSVGRect()` 造框，逐条道调 `checkIntersection`（相交→黄，`data-select="intersect"`）与 `checkEnclosure`（整段入选→绿，`data-select="enclose"`）（api:SVGSVGElement.checkIntersection、api:SVGSVGElement.createSVGRect）；不支持时退回 `getBBox()` 加变换求交并标 `data-fallback="bbox"`。
16. 定格与导出协议：`?export=1` 时冻结——`document.getAnimations().forEach(a=>{a.currentTime=a.effect.getTiming().duration*phase; a.pause()})`，三支笔的相位刻意错开为 CSS 0.88（正在回程弧上，x≈980、y=yc−30，三件套朝向分叉）、WAAPI 0.62（行内 x≈1070）、rAF 0.41（行内 x≈720），于是静帧里三行显影长度一眼不同；rAF 笔按同一虚拟时刻渲染一帧确定性波形，抖动带用预置的 dt 序列填满。走纸卷筒预滚到 38%，框选与手描注记各留一段预置结果。就绪后置 `window.__VIS_READY__=true`；`pointermove` 递增 `window.__INTERACTION_COUNT__` 并刷新三链读数。最后一行做负对照：写 `console.currentScale = 2` 再读回，把「写入 2.000 / 读回 X / 生效：否（内联文档，仅独立 SVG 文档有效）」和 `currentTranslate` 的 x,y 一并印出，生效与否由写入前后 `getScreenCTM().a` 是否变化实测决定（api:SVGSVGElement.currentScale）——它就是本场景对设计问题的答案：真相不在 currentScale 里。

**验收要点**

1. 相机窗左右各有约 34.3 px 的信箱暗条、上下无空隙；总览窗上下各被裁掉约 22.7；DOM 中两者 `preserveAspectRatio` 分别为 `xMidYMid meet` 与 `xMidYMid slice`。
2. 读数条链 A/B/C 三行走时文本逐字符相同，校验灯 `data-verdict="match"`；脚本连续执行一次滚轮缩放（deltaY=-300）与一次 120 px 拖拽平移后重取，仍逐字符相同且失配计数为 0；天真 offsetX 行 `data-verdict="drift"` 且显示误差 > 1 s。
3. `document.getAnimations().length >= 2` 且其中包含 09 行的 CSS 动画与 10 行的 WAAPI 动画，11 行的 rAF 笔不在列表中；PNG 中 09/10/11 三行的已显影长度互不相同（09 行满行且笔在行上方的回程弧上）。
4. 标定条内 `circle[r="50%"]` 的 `getBBox().width` 约 291.5（r≈145.8），且圆被 400×100 的嵌套视口裁成弧带；旁注文字给出 145.8 / 50 / 200 三个数。
5. 溢出三联中 `overflow:hidden` 与 `overflow:scroll` 两格的圆被裁在框线内、无滚动条，`overflow:visible` 一格的圆明显溢出到框外（PNG 可直接判读）。
6. 拖动台面宽度滑轨改写相机 `width` 后，`ResizeObserver` 回调至少触发一次，时标尺子元素数量随之变化且相邻刻度间距 ≥26 px，尺端文本与 `contentRect` 的宽高一致。
7. 在舞台上做 `pointermove` 后 `window.__INTERACTION_COUNT__` 增加，且采样十字中心经三链回算得到的记录纸坐标与指针位置往返误差 < 0.01 记录纸单位。
8. Shift 框选后命中的道带上 `data-select="intersect"`（黄）或 `"enclose"`（绿）；在未实现 `checkIntersection` 的引擎上改为 `data-fallback="bbox"` 且着色结果一致。

**实现复审**

- createSVGTransformFromMatrix 在 Chrome 152 仍要求旧 SVGMatrix；显式复制 DOMMatrix 的6个分量。
- SVGMatrix 与 DOMMatrix 并非运行时别名，说明栏显示实测结果。
- 三条坐标链以记录纸坐标误差 <0.001（优于原往返0.01要求）检查；SVGMatrix 路径存在单精度舍入，不能用时间差1e-6秒断言。
- 缩短控制面板与矩阵读数文字，ResizeObserver 的完整观测值保留在 DOM dataset；固定截图内不再越过右边界。

**浏览器注意**

- currentScale / currentTranslate 只对独立 SVG 文档的最外层 svg 生效：Chrome 与 Firefox 对 HTML 内联的根 svg 直接忽略写入（读回仍为 1），Safari 历史上表现不一致，可能真的缩放。场景因此把它做成显式负对照行，生效与否由写入前后 `getScreenCTM().a` 实测判定并据实改写文案，真实缩放一律由 viewBox 承担，静帧在任一引擎下都可读。scroll 驱动动画（`animation-timeline: scroll()`）在 Chrome 115+ 与 Safari 26+ 可用，Firefox 仍需开关，用 `CSS.supports()` 探测后退回 scroll 事件直写 `stroke-dashoffset`，视觉一致并标 `data-fallback`。`checkIntersection` / `checkEnclosure` 在 Firefox 未实现，Chrome 与 Safari 的实现基于 bbox 而非真实几何（细描边的弯曲道会“过度命中”），场景据此只用它做粗筛并标注该限制，Firefox 走 `getBBox()` 加变换求交的回退。SVG 元素上的 `offset-path` 参考框在各引擎间曾有 border-box / view-box 之争，故显式声明 `transform-box: view-box; transform-origin: 0 0;`；`offset-rotate: reverse` 需要 Safari 16+，更旧版本回退成 `auto 180deg`。`ResizeObserver` 观察 SVG 元素时 Chrome / Firefox 报告 bbox，部分 Safari 版本对 SVG 目标不触发，故同时观察 HTML 宿主 `div#stage`，取先到的回调。触摸事件在无触摸屏的桌面 Safari / Firefox 完全不派发，Chrome 需开触摸模拟，因此主交互链路是 Pointer Events，触点面板在无触摸环境下显示录制回放并标注「回放」。`getScreenCTM()` 在页面存在 CSS transform 或页面缩放时各引擎处理有差异，场景不给舞台加任何 CSS transform，并用 `stage.getBoundingClientRect()` 作为手算链的唯一屏幕锚点，使三链在 devicePixelRatio ≠ 1 时依然同值。`overflow: scroll` 在三个引擎里都不会给 SVG 视口生成滚动条，等同 hidden，格内文字直接写出这条实测结论。抓图环境禁网，不加载任何 webfont：数字全部使用 `ui-monospace, \"DejaVu Sans Mono\", monospace` 等宽回退栈，保证三链读数逐位对齐可比。

## 4. 明确排除项

| 特性 | 状态 | 原因 |
|---|---|---|
| `api:SVGSVGElement.useCurrentView` | none | Removed in SVG 2; not implemented |
| `api:SVGUseElement.instanceRoot` | none | Removed from Chrome; never in Firefox or Safari |
| `at:a.xlink:title` | deprecated | xlink:title/type/role/arcrole/show/actuate removed in SVG 2; Chrome and Safari ignore, Firefox once tooltipped |
| `at:svg.baseProfile` | deprecated | Removed in SVG 2; ignored by all browsers |
| `at:svg.contentScriptType` | deprecated | Removed in SVG 2; ignored by all browsers |
| `at:svg.externalResourcesRequired` | deprecated | Removed in SVG 2; never implemented by any browser |
| `at:svg.playbackorder` | none | No browser implements |
| `at:svg.version` | deprecated | Removed in SVG 2; ignored by all browsers |
| `at:svg.xml:base` | deprecated | Removed from SVG 2; Chrome and Safari never resolved it, Firefox dropped it |
| `at:svg.xmlns:xlink` | deprecated | Only needed for xlink:href in XML; unnecessary with SVG 2 href |
| `at:svg.zoomAndPan` | deprecated | Deprecated in SVG 2; effectively ignored on standalone SVG in current Chrome, Firefox and Safari |
| `at:switch.requiredFeatures` | deprecated | Removed in SVG 2; modern browsers ignore it (treated as passing) |
| `at:use.xlink:href` | deprecated | Still rendered by all browsers; deprecated in SVG 2, href wins when both present |
| `at:view.viewTarget` | none | Removed in SVG 2; no browser highlights the target |
| `av:g.xml:space=preserve` | deprecated | Deprecated in SVG 2 but still honoured by all browsers |
| `concept:svgview-viewtarget` | none | Removed; no browser implements |
| `concept:svgview-zoomandpan` | deprecated | Deprecated with zoomAndPan; ignored by Chrome and Safari |
| `el:unknown` | none | No browser implements SVGUnknownElement; unrecognised tags become plain SVGElement and render nothing |
| `at:a.xlink:arcrole` | deprecated | ignored by all browsers |
| `at:a.xlink:show` | deprecated | ignored by all browsers; target attribute replaces it |
| `at:a.xlink:type` | deprecated | ignored by all browsers |
| `at:svg.focusable` | deprecated | only legacy IE/Edge honoured it; ignored by all modern browsers |
| `av:a.target=_replace` | deprecated | removed in SVG 2; browsers treat as a named window |
| `concept:media-fragments-spatial` | none | no browser applies #xywh= to raster or SVG resources |
| `concept:xlink-href-legacy` | deprecated | still rendered by all browsers; deprecated in SVG 2; xmlns:xlink declaration required in XML |
| `el:audio` | none | no browser implements SVG-namespace audio |
| `el:canvas` | none | no browser implements SVG-namespace canvas |
| `el:iframe` | none | no browser implements SVG-namespace iframe |
| `el:video` | none | no browser implements SVG-namespace video; use foreignObject with HTML video |
| `pv:image-rendering=optimizeSpeed` | deprecated | legacy keywords mapped to pixelated/auto or ignored; removed from SVG 2 in favour of CSS values |
| `api:SVGPathElement.getPathData` | none | No browser ships it; polyfill only |
| `api:SVGPathElement.getPathSegAtLength` | deprecated | Still in Chrome, Firefox and Safari but removed from SVG 2 |
| `api:SVGPathElement.pathSegList` | deprecated | Removed from Chrome 48 and WebKit; Firefox retains; dropped from SVG 2 |
| `av:path.d=B` | none | Dropped from SVG 2 candidate; no browser |
| `av:path.d=R` | none | Removed from SVG 2 draft; no browser |
| `concept:multiple-fill-layers` | none | rolled back from SVG 2 Fill & Stroke drafts; no browser implements |
| `el:color-profile` | deprecated | removed in SVG 2; Chrome dropped it, Firefox and Safari never implemented |
| `el:cursor` | deprecated | removed in SVG 2; never implemented by browsers |
| `el:solidcolor` | deprecated | from SVG Tiny 1.2, dropped from SVG 2 CR; no browser support |
| `pr:buffered-rendering` | deprecated | removed in SVG 2; Chrome dropped it, WebKit still parses; will-change replaces it |
| `pr:color-rendering` | deprecated | removed in SVG 2; no visible effect in browsers |
| `pr:enable-background` | deprecated | removed in SVG 2; never implemented by browsers; isolation replaces it |
| `pr:stroke-alignment` | none | moved from SVG 2 into SVG Strokes module; no browser implements |
| `pr:stroke-dashcorner` | none | SVG Strokes module; no browser implements |
| `pr:z-index` | none | deferred out of SVG 2; no browser reorders SVG by z-index |
| `pv:fill=child` | none | deferred from SVG 2; no browser implements |
| `pv:fill=icc-color()` | deprecated | removed in SVG 2; never implemented by browsers |
| `pv:stroke-linejoin=arcs` | none | no browser implements; treated as invalid, renders miter |
| `pv:vector-effect=fixed-position` | none | no browser implements; at-risk in spec |
| `pv:vector-effect=non-rotation` | none | no browser implements; at-risk in spec |
| `pv:vector-effect=non-scaling-size` | none | no browser implements; at-risk in spec |
| `pv:vector-effect=non-scaling-stroke-viewport` | none | no browser parses the viewport/screen keywords; value becomes invalid |
| `at:linearGradient.xlink:href` | deprecated | Still rendered by all browsers; deprecated in SVG 2 in favour of plain href |
| `concept:pattern-overflow-visible` | none | All browsers clip tile content to the tile rectangle regardless of overflow |
| `css:fill-css-gradient-image` | none | No browser accepts CSS image gradients in fill/stroke; only url(#id) paint servers |
| `el:hatch` | none | Deferred from SVG 2 CR; no browser implements; Inkscape only |
| `el:meshgradient` | none | Deferred from SVG 2 CR; Firefox prototype removed; Inkscape only |
| `api:SVGTextContentElement.selectSubString` | deprecated | removed in SVG 2; no-op in Chrome, Firefox and Safari |
| `at:text.xml:space` | deprecated | deprecated in SVG 2 in favour of white-space; still honoured by all browsers |
| `at:textPath.spacing` | none | parsed but no browser distinguishes exact from auto |
| `at:textPath.xlink:href` | deprecated | deprecated in SVG 2 but still honoured by all browsers |
| `av:textPath.method=stretch` | none | no browser implements stretch; all fall back to align |
| `concept:svg-as-image-external-font-blocked` | none | all browsers block external resources in SVG-as-image; only data URIs work |
| `css:vertical-align-svg-text` | none | no browser applies vertical-align to SVG tspans |
| `el:altGlyph` | deprecated | removed in SVG 2; WebKit dropped it, Chrome and Firefox never implemented |
| `el:altGlyphDef` | deprecated | removed in SVG 2; no browser |
| `el:altGlyphItem` | deprecated | removed in SVG 2; no browser |
| `el:definition-src` | deprecated | SVG 1.0 only, removed in SVG 1.1; no browser |
| `el:font` | deprecated | removed in SVG 2; Chrome 38 and WebKit dropped, Firefox never implemented |
| `el:font-face` | deprecated | removed in SVG 2; no browser |
| `el:font-face-format` | deprecated | removed in SVG 2; no browser |
| `el:font-face-name` | deprecated | removed in SVG 2; no browser |
| `el:font-face-src` | deprecated | removed in SVG 2; no browser |
| `el:font-face-uri` | deprecated | removed in SVG 2; no browser |
| `el:glyph` | deprecated | removed in SVG 2; no current browser |
| `el:glyphRef` | deprecated | removed in SVG 2; no browser |
| `el:hkern` | deprecated | removed in SVG 2; no current browser |
| `el:missing-glyph` | deprecated | removed in SVG 2; no current browser |
| `el:tbreak` | deprecated | SVG Tiny 1.2 only; no current browser |
| `el:textArea` | deprecated | SVG Tiny 1.2 only; Opera Presto historically; no current browser |
| `el:tref` | deprecated | removed in SVG 2; Chrome never implemented, Firefox and WebKit dropped it |
| `el:vkern` | deprecated | removed in SVG 2; no current browser |
| `pr:glyph-orientation-horizontal` | deprecated | removed in SVG 2; no browser implements |
| `pr:glyph-orientation-vertical` | deprecated | removed in SVG 2; Chrome and Safari map 0/90 only, Firefox ignores |
| `pr:inline-size` | none | no browser implements SVG text wrapping |
| `pr:kerning` | deprecated | removed in SVG 2; ignored by all browsers, use font-kerning |
| `pr:shape-inside` | none | no browser implements |
| `pr:text-decoration-fill` | none | no browser implements |
| `pr:text-overflow` | none | no browser applies text-overflow to SVG text |
| `pv:dominant-baseline=text-before-edge` | deprecated | dropped from CSS Inline; Chrome and Safari still render, Firefox maps loosely |
| `pv:writing-mode=tb` | deprecated | SVG 1.1 keywords still mapped to vertical-rl/horizontal-tb by all browsers |
| `css:mask-border` | none | Not applicable to SVG elements; only -webkit-mask-box-image on HTML in Chromium/WebKit |
| `pr:clip` | deprecated | Removed in SVG 2 and CSS Masking; Chrome and Firefox ignore it on SVG, use clip-path inset() |
| `at:marker.position` | none | SVG 2 draft attribute removed with marker-pattern; no browser |
| `at:marker.transform` | none | marker is not a transformable element; transform attribute ignored in all browsers |
| `av:marker.refX=center` | none | No browser accepts the keywords; treated as invalid (0) in Chrome, Firefox, Safari |
| `concept:markers-on-basic-shapes` | none | Chrome, Firefox and Safari draw markers only on path, line, polyline, polygon |
| `pr:marker-knockout-left` | none | Dropped from SVG 2; no browser |
| `pr:marker-pattern` | none | Proposed in SVG 2 drafts then removed; no browser |
| `pr:marker-segment` | none | Removed from SVG 2; no browser |
| `at:feGaussianBlur.edgeMode` | none | No shipping Chrome, Firefox or Safari applies edgeMode on feGaussianBlur; all behave as none |
| `at:feImage.xlink:href` | deprecated | Still works everywhere but deprecated by SVG 2 in favor of href |
| `at:filter.filterRes` | deprecated | Removed in Filter Effects 1; Chrome dropped it, Firefox and Safari never honored it |
| `at:filter.href` | deprecated | Dropped in Filter Effects 1; no browser implements inheritance |
| `av:feGaussianBlur.in=BackgroundAlpha` | deprecated | Removed in Filter Effects 1; no browser support |
| `av:feGaussianBlur.in=BackgroundImage` | deprecated | Removed in Filter Effects 1; only old IE/Opera implemented; use CSS backdrop-filter |
| `av:feGaussianBlur.in=FillPaint` | deprecated | Removed in Filter Effects 1; browsers treat as transparent black |
| `av:feGaussianBlur.in=StrokePaint` | deprecated | Removed in Filter Effects 1; browsers treat as transparent black |
| `at:feConvolveMatrix.kernelUnitLength` | none | no shipping browser implements; kernel always samples device pixels |
| `at:feDiffuseLighting.kernelUnitLength` | none | no shipping browser implements for feDiffuseLighting or feSpecularLighting |
| `api:TimeEvent` | deprecated | removed from SVG 2; browsers dispatch plain Event/TimeEvent inconsistently |
| `at:animate.attributeType` | deprecated | dropped from SVG 2; browsers still parse it as a hint |
| `at:animateMotion.origin` | none | no browser implements; always behaves as default |
| `at:svg.timelinebegin` | none | no browser implements |
| `av:animate.begin=wallclock` | none | no browser implements wallclock timing |
| `av:animate.dur=media` | none | no browser implements media duration |
| `concept:view-element-animations` | none | no browser runs animations declared as children of <view> |
| `el:animateColor` | deprecated | removed from SVG 2 and all browsers; Firefox never supported |
| `el:animation` | deprecated | SVG Tiny 1.2 only; no current browser |
| `el:prefetch` | deprecated | SVG Tiny 1.2 only; no current browser |
| `api:SVGElement.getPresentationAttribute` | deprecated | Removed from SVG 2; Chrome and Firefox dropped, Safari retains SVGPaint |
| `api:SVGElementInstance` | deprecated | Removed in SVG 2; Chrome dropped in 2016, Firefox and Safari never exposed it |
| `api:SVGGraphicsElement.getTransformToElement` | deprecated | Removed from SVG 2, Chrome 48 and Firefox; Safari still exposes |
| `api:SVGGraphicsElement.nearestViewportElement` | deprecated | Deprecated in SVG 2; still exposed by browsers |
| `api:SVGMatrix` | deprecated | Aliased to DOMMatrix/DOMPoint/DOMRect in all browsers; names retained |
| `api:SVGSVGElement.currentView` | deprecated | Removed from SVG 2 and from browsers |
| `api:SVGSVGElement.suspendRedraw` | deprecated | Kept as no-ops or removed; no rendering effect anywhere |
| `api:SVGUnknownElement` | none | No browser exposes SVGUnknownElement; unknown svg-namespace elements are plain SVGElement |
| `api:SVGZoomEvent` | deprecated | Removed in SVG 2 and from all browsers |
| `at:svg.contentStyleType` | deprecated | Removed in SVG 2; ignored by all browsers |
| `concept:waapi-non-css-attribute-animation` | none | points, viewBox, x1/y1, dx are not CSS properties; no engine animates them via animate() |
| `concept:xlink-namespace-setattribute` | deprecated | xlink:href deprecated in SVG 2; plain href works everywhere |
| `pv:transform-style=preserve-3d` | none | No browser creates 3D contexts for SVG descendants; always flattened |
| `api:SVGSVGElement.createSVGMatrix` | deprecated | SVGMatrix and SVGPoint replaced by DOMMatrix and DOMPoint in SVG 2; still shipping as aliases |
| `av:svg.preserveAspectRatio=defer` | deprecated | removed in SVG 2; browsers ignore defer |
| `concept:transform-on-tspan-ignored` | none | no browser applies transform to tspan; use text-level transform or the rotate attribute |
| `at:a.xlink:href` | deprecated | Still honoured by all browsers but deprecated in SVG 2 |
| `concept:svg-1.1-dom-events` | deprecated | Dropped in SVG 2; browsers only fire plain load/resize/scroll/focusin; mutation events removed from Chrome 127 |
| `el:handler` | deprecated | SVG Tiny 1.2 only; no current browser |
| `el:listener` | deprecated | SVG Tiny 1.2 only; no current browser |

## 5. 验证命令

```bash
npm run plan
npm run plan:check
npm test
SCENES=core-sample-stratigraphy npm run render
```

## 6. 完整特性清单

### 文档结构与复用

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:Document.createElementNS` | createElementNS with SVG namespace | core | broad | mycelium-culture-chamber |
| `api:SVGSVGElement.currentScale` | currentScale / currentTranslate | core | partial | seismic-drum-console |
| `api:SVGSVGElement.viewBox` | viewBox.baseVal scripting | core | broad | seismic-drum-console |
| `at:a.href` | a href (including in-document #view links) | core | broad | celestial-astrolabe-cabinet |
| `at:g.id` | id attribute (any element) | core | broad | celestial-astrolabe-cabinet |
| `at:svg.lang` | lang / xml:lang attribute | core | broad | stele-rubbing-hall |
| `at:svg.preserveAspectRatio` | preserveAspectRatio align + meet/slice | core | broad | celestial-astrolabe-cabinet |
| `at:svg.transform` | transform on svg element | core | partial | celestial-astrolabe-cabinet |
| `at:svg.viewBox` | viewBox user coordinate system | core | broad | celestial-astrolabe-cabinet |
| `at:svg.width` | svg width/height viewport size | core | broad | museum-label-panel |
| `at:svg.xmlns` | xmlns namespace declaration | core | broad | museum-label-panel |
| `at:switch.systemLanguage` | systemLanguage conditional attribute | core | broad | stele-rubbing-hall |
| `at:symbol.refX` | symbol refX/refY anchor point | core | partial | celestial-astrolabe-cabinet |
| `at:symbol.viewBox` | symbol viewBox | core | broad | celestial-astrolabe-cabinet |
| `at:use.href` | href without xlink prefix (use and all referencing elements) | core | broad | celestial-astrolabe-cabinet |
| `at:use.width` | use width/height override for symbol/svg targets | core | broad | celestial-astrolabe-cabinet |
| `at:use.x` | use x/y translation | core | broad | celestial-astrolabe-cabinet |
| `av:svg.preserveAspectRatio=none` | preserveAspectRatio none (non-uniform stretch) | core | broad | celestial-astrolabe-cabinet |
| `av:svg.preserveAspectRatio=xMidYMid-slice` | preserveAspectRatio xMidYMid slice (cover) | core | broad | celestial-astrolabe-cabinet |
| `concept:fragment-identifier-viewid` | #viewId fragment identifier | core | broad | celestial-astrolabe-cabinet |
| `concept:nested-svg` | Nested svg viewport | core | broad | celestial-astrolabe-cabinet |
| `concept:nested-viewport-clipping` | Nested svg clips to viewport by default | core | broad | celestial-astrolabe-cabinet |
| `concept:painting-order-document` | Document order defines stacking (no z-index) | core | broad | celestial-astrolabe-cabinet |
| `concept:script-cdata` | CDATA wrapping for script/style in XML SVG | core | broad | mycelium-culture-chamber |
| `concept:sprite-sheet` | Symbol sprite sheet | core | broad | celestial-astrolabe-cabinet |
| `concept:svg-auto-sizing` | width/height auto and intrinsic aspect ratio | core | broad | museum-label-panel |
| `concept:svgview-fragment-identifier` | SVG fragment identifiers (#id, #svgView(viewBox(...))) | core | partial | celestial-astrolabe-cabinet |
| `concept:svgview-viewbox` | svgView(viewBox(...)) fragment sprite crop | core | broad | celestial-astrolabe-cabinet |
| `concept:use-css-custom-properties-passthrough` | CSS custom properties passed into use instance | core | broad | celestial-astrolabe-cabinet |
| `concept:use-currentcolor-passthrough` | currentColor passed through use | core | broad | celestial-astrolabe-cabinet |
| `concept:use-external-fragment` | use referencing external file fragment (symbol library) | core | broad | celestial-astrolabe-cabinet |
| `concept:use-inherited-fill-override` | Per-instance colour via inherited properties | core | broad | celestial-astrolabe-cabinet |
| `concept:use-of-use` | Nested use-of-use instancing | core | broad | celestial-astrolabe-cabinet |
| `concept:use-shadow-tree-styling` | use shadow tree: selectors cannot reach inside | core | broad | celestial-astrolabe-cabinet |
| `concept:xml-stylesheet-pi` | xml-stylesheet processing instruction | core | broad | letterpress-type-specimen |
| `el:a` | a hyperlink element | core | broad | celestial-astrolabe-cabinet |
| `el:defs` | defs definitions container | core | broad | celestial-astrolabe-cabinet |
| `el:desc` | desc long description | core | broad | museum-label-panel |
| `el:g` | g group container | core | broad | celestial-astrolabe-cabinet |
| `el:metadata` | metadata element | core | broad | museum-label-panel |
| `el:script` | script element inside SVG | core | broad | mycelium-culture-chamber |
| `el:style` | style element inside SVG | core | broad | letterpress-type-specimen |
| `el:svg` | svg root element | core | broad | celestial-astrolabe-cabinet |
| `el:switch` | switch conditional processing | core | broad | stele-rubbing-hall |
| `el:symbol` | symbol reusable template | core | broad | celestial-astrolabe-cabinet |
| `el:title` | title element (tooltip and accessible name) | core | broad | museum-label-panel |
| `el:use` | use element instancing | core | broad | celestial-astrolabe-cabinet |
| `el:view` | view predefined viewport | core | broad | celestial-astrolabe-cabinet |
| `pv:overflow=visible` | overflow: visible on nested viewport | core | broad | celestial-astrolabe-cabinet |
| `pv:white-space=pre` | white-space CSS replacement for xml:space | core | broad | letterpress-type-specimen |
| `api:SVGElement.viewportElement` | ownerSVGElement / viewportElement | detail / `concept:nested-svg` | broad | celestial-astrolabe-cabinet |
| `api:SVGSVGElement.getElementById` | SVGSVGElement.getElementById | detail / `at:g.id` | broad | celestial-astrolabe-cabinet |
| `api:SVGSVGElement.getIntersectionList` | getIntersectionList / getEnclosureList / checkIntersection | detail / `api:SVGSVGElement.viewBox` | partial | seismic-drum-console (via api:SVGSVGElement.viewBox) |
| `api:SVGSVGElement.preserveAspectRatio` | preserveAspectRatio.baseVal scripting | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `api:SVGSVGElement.useCurrentView` | useCurrentView / currentView | detail / `el:view` | none | celestial-astrolabe-cabinet (via el:view) |
| `api:SVGUseElement.instanceRoot` | SVGUseElement.instanceRoot | detail / `concept:use-shadow-tree-styling` | none | celestial-astrolabe-cabinet |
| `at:a.download` | a download/rel/hreflang/type/ping (HTML-aligned) | detail / `el:a` | partial | celestial-astrolabe-cabinet (via el:a) |
| `at:a.target` | a target | detail / `el:a` | broad | celestial-astrolabe-cabinet |
| `at:a.xlink:title` | xlink:title and other xlink:* attributes | detail / `el:a` | deprecated | celestial-astrolabe-cabinet (via el:a) |
| `at:g.class` | class attribute (any element) | detail / `el:style` | broad | letterpress-type-specimen |
| `at:g.data-*` | custom data-* attributes on SVG elements | detail / `at:g.id` | broad | celestial-astrolabe-cabinet (via at:g.id) |
| `at:g.style` | style attribute (any element) | detail / `el:style` | broad | letterpress-type-specimen (via el:style) |
| `at:script.href` | script href external file | detail / `el:script` | broad | mycelium-culture-chamber (via el:script) |
| `at:style.media` | style media attribute | detail / `el:style` | broad | letterpress-type-specimen (via el:style) |
| `at:svg.baseProfile` | baseProfile attribute | detail / `el:svg` | deprecated | celestial-astrolabe-cabinet (via el:svg) |
| `at:svg.contentScriptType` | contentScriptType / contentStyleType | detail / `el:svg` | deprecated | celestial-astrolabe-cabinet (via el:svg) |
| `at:svg.externalResourcesRequired` | externalResourcesRequired | detail / `el:svg` | deprecated | celestial-astrolabe-cabinet (via el:svg) |
| `at:svg.playbackorder` | playbackorder / timelinebegin | detail / `el:svg` | none | celestial-astrolabe-cabinet (via el:svg) |
| `at:svg.version` | version attribute | detail / `el:svg` | deprecated | celestial-astrolabe-cabinet (via el:svg) |
| `at:svg.x` | svg x/y position (nested only) | detail / `concept:nested-svg` | broad | celestial-astrolabe-cabinet |
| `at:svg.xml:base` | xml:base removed | detail / `el:svg` | deprecated | celestial-astrolabe-cabinet (via el:svg) |
| `at:svg.xmlns:xlink` | xmlns:xlink declaration | detail / `at:svg.xmlns` | deprecated | museum-label-panel |
| `at:svg.zoomAndPan` | zoomAndPan magnify/disable | detail / `el:svg` | deprecated | celestial-astrolabe-cabinet (via el:svg) |
| `at:switch.requiredExtensions` | requiredExtensions conditional attribute | detail / `el:switch` | broad | stele-rubbing-hall |
| `at:switch.requiredFeatures` | requiredFeatures conditional attribute | detail / `el:switch` | deprecated | stele-rubbing-hall (via el:switch) |
| `at:symbol.preserveAspectRatio` | symbol preserveAspectRatio | detail / `el:symbol` | broad | celestial-astrolabe-cabinet (via el:symbol) |
| `at:symbol.x` | symbol x/y/width/height geometry | detail / `el:symbol` | partial | celestial-astrolabe-cabinet (via el:symbol) |
| `at:use.xlink:href` | xlink:href legacy reference | detail / `at:use.href` | deprecated | celestial-astrolabe-cabinet |
| `at:view.preserveAspectRatio` | view preserveAspectRatio | detail / `el:view` | broad | celestial-astrolabe-cabinet (via el:view) |
| `at:view.viewBox` | view viewBox | detail / `el:view` | broad | celestial-astrolabe-cabinet |
| `at:view.viewTarget` | view viewTarget | detail / `el:view` | none | celestial-astrolabe-cabinet (via el:view) |
| `av:g.xml:space=preserve` | xml:space=preserve whitespace handling | detail / `pv:white-space=pre` | deprecated | letterpress-type-specimen |
| `av:svg.preserveAspectRatio=xMaxYMax-meet` | preserveAspectRatio xMaxYMax meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMaxYMax-slice` | preserveAspectRatio xMaxYMax slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMaxYMid-meet` | preserveAspectRatio xMaxYMid meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMaxYMid-slice` | preserveAspectRatio xMaxYMid slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMaxYMin-meet` | preserveAspectRatio xMaxYMin meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMaxYMin-slice` | preserveAspectRatio xMaxYMin slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMidYMax-meet` | preserveAspectRatio xMidYMax meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMidYMax-slice` | preserveAspectRatio xMidYMax slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMidYMid-meet` | preserveAspectRatio xMidYMid meet (default) | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMidYMin-meet` | preserveAspectRatio xMidYMin meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMidYMin-slice` | preserveAspectRatio xMidYMin slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMinYMax-meet` | preserveAspectRatio xMinYMax meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMinYMax-slice` | preserveAspectRatio xMinYMax slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMinYMid-meet` | preserveAspectRatio xMinYMid meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMinYMid-slice` | preserveAspectRatio xMinYMid slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMinYMin-meet` | preserveAspectRatio xMinYMin meet | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMinYMin-slice` | preserveAspectRatio xMinYMin slice | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `concept:conditional-attrs-outside-switch` | Conditional attributes hide elements outside switch | detail / `el:switch` | broad | stele-rubbing-hall |
| `concept:defs-anywhere` | defs and forward references anywhere in document | detail / `el:defs` | broad | celestial-astrolabe-cabinet |
| `concept:duplicate-id-first-wins` | Duplicate ids resolve to the first element | detail / `at:g.id` | broad | celestial-astrolabe-cabinet (via at:g.id) |
| `concept:g-property-inheritance` | Presentation property inheritance through g | detail / `el:g` | broad | celestial-astrolabe-cabinet |
| `concept:geometry-min-max-constraints` | min/max-width and height constraining root svg sizing | detail / `el:svg` | partial | celestial-astrolabe-cabinet (via el:svg) |
| `concept:list-syntax-whitespace-tolerance` | Whitespace and comma tolerance in attribute lists | detail / `at:svg.viewBox` | broad | celestial-astrolabe-cabinet |
| `concept:nested-percentage-lengths` | Percentages resolve against nearest viewport | detail / `concept:nested-svg` | broad | celestial-astrolabe-cabinet (via concept:nested-svg) |
| `concept:script-anywhere` | script allowed as child of any element | detail / `el:script` | broad | mycelium-culture-chamber (via el:script) |
| `concept:script-blocked-in-img` | Scripts not executed in img/background/use | detail / `el:script` | broad | mycelium-culture-chamber |
| `concept:svg-media-queries-in-img` | Media queries inside SVG respond to its own viewport | detail / `el:style` | broad | letterpress-type-specimen (via el:style) |
| `concept:svgview-preserveaspectratio` | svgView(preserveAspectRatio(...)) fragment | detail / `concept:svgview-viewbox` | partial | celestial-astrolabe-cabinet (via concept:svgview-viewbox) |
| `concept:svgview-transform` | svgView(transform(...)) fragment | detail / `concept:svgview-viewbox` | partial | celestial-astrolabe-cabinet (via concept:svgview-viewbox) |
| `concept:svgview-viewtarget` | svgView(viewTarget(...)) fragment | detail / `concept:svgview-viewbox` | none | celestial-astrolabe-cabinet (via concept:svgview-viewbox) |
| `concept:svgview-zoomandpan` | svgView(zoomAndPan(...)) fragment | detail / `concept:svgview-viewbox` | deprecated | celestial-astrolabe-cabinet (via concept:svgview-viewbox) |
| `concept:switch-style-script-still-processed` | switch does not affect script/style processing | detail / `el:switch` | broad | stele-rubbing-hall (via el:switch) |
| `concept:symbol-not-rendered-directly` | symbol never renders without use | detail / `el:symbol` | broad | celestial-astrolabe-cabinet |
| `concept:title-placement-first-child` | title/desc must be first children | detail / `el:title` | broad | museum-label-panel |
| `concept:use-cross-inline-svg` | use across separate inline svgs in one HTML page | detail / `concept:sprite-sheet` | broad | celestial-astrolabe-cabinet (via concept:sprite-sheet) |
| `concept:use-cyclic-reference` | Cyclic use references render nothing | detail / `concept:use-of-use` | broad | celestial-astrolabe-cabinet (via concept:use-of-use) |
| `concept:use-external-whole-document` | use referencing an external document without fragment | detail / `concept:use-external-fragment` | partial | celestial-astrolabe-cabinet (via concept:use-external-fragment) |
| `concept:use-shadow-tree` | use instances as Shadow DOM with event retargeting | detail / `concept:use-shadow-tree-styling` | broad | celestial-astrolabe-cabinet |
| `concept:use-symbol-default-100pct-size` | use of symbol defaults to 100% size | detail / `at:use.width` | broad | celestial-astrolabe-cabinet |
| `concept:viewbox-pan` | viewBox origin offset (pan/crop) | detail / `at:svg.viewBox` | broad | celestial-astrolabe-cabinet |
| `concept:viewport-overflow-scroll` | overflow: auto/scroll on svg viewports | detail / `pv:overflow=visible` | partial | celestial-astrolabe-cabinet (via pv:overflow=visible) |
| `css:html-cascade-into-inline-svg` | HTML page stylesheet styles inline SVG | detail / `el:style` | broad | letterpress-type-specimen (via el:style) |
| `el:unknown` | unknown element placeholder | detail / `el:svg` | none | celestial-astrolabe-cabinet (via el:svg) |

### 嵌入、外来内容与语义

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `at:g.aria-hidden` | aria-hidden / role=presentation on decorative groups | core | broad | museum-label-panel |
| `at:image.href` | image href (SVG 2 unprefixed) | core | broad | jacquard-loom-draft |
| `at:image.preserveAspectRatio` | image preserveAspectRatio (meet alignment) | core | broad | jacquard-loom-draft |
| `at:svg.aria-label` | aria-label on SVG elements | core | broad | museum-label-panel |
| `av:svg.role=img` | role=img on svg root | core | broad | museum-label-panel |
| `concept:foreignobject-css-grid-flex` | CSS grid/flex layout inside foreignObject | core | broad | museum-label-panel |
| `concept:foreignobject-filter-clip-mask` | filter/clip-path/mask on foreignObject | core | partial | museum-label-panel |
| `concept:foreignobject-form-controls` | Interactive HTML form controls inside SVG | core | broad | museum-label-panel |
| `concept:foreignobject-html-text-wrapping` | Flowing, wrapping HTML text via foreignObject | core | broad | museum-label-panel |
| `concept:foreignobject-mathml` | MathML formula inside foreignObject | core | broad | museum-label-panel |
| `concept:foreignobject-transform` | Transforms applied to foreignObject | core | partial | museum-label-panel |
| `concept:foreignobject-video` | HTML video/canvas/iframe inside foreignObject | core | partial | museum-label-panel |
| `concept:image-data-uri` | data: URI raster embedding | core | broad | jacquard-loom-draft |
| `concept:image-nested-svg-document` | SVG file referenced by image (secure static mode) | core | broad | jacquard-loom-draft |
| `concept:inline-svg-in-html` | Inline SVG in an HTML document | core | broad | neon-sign-workshop |
| `concept:intrinsic-sizing-of-embedded-svg` | Intrinsic size rules for embedded SVG | core | broad | museum-label-panel |
| `concept:presentation-attribute-specificity` | Presentation attribute vs CSS cascade (specificity 0) | core | broad | letterpress-type-specimen |
| `concept:standalone-svg-document` | Standalone SVG XML document | core | broad | celestial-astrolabe-cabinet, museum-label-panel, mycelium-culture-chamber |
| `concept:style-attribute` | Inline style attribute on SVG elements | core | broad | letterpress-type-specimen |
| `concept:svg-as-css-background-image` | SVG as CSS background-image / mask-image | core | broad | neon-sign-workshop |
| `concept:svg-as-img-restrictions` | SVG in HTML img / picture (secure static mode) | core | broad | museum-label-panel |
| `concept:svg-as-object-embed-iframe` | SVG via object/embed/iframe (scripts enabled) | core | broad | museum-label-panel |
| `concept:tabindex-focusable-svg-elements` | tabindex on SVG elements and :focus styling | core | broad | museum-label-panel |
| `concept:use-inheritance` | Property inheritance from use into its shadow tree | core | broad | celestial-astrolabe-cabinet |
| `css:custom-properties` | CSS custom properties and var() in presentation properties | core | broad | museum-label-panel |
| `css:forced-colors` | @media (forced-colors) and system colors | core | partial | museum-label-panel |
| `css:media-print` | @media print inside SVG | core | broad | museum-label-panel |
| `css:media-width-in-standalone-svg` | @media (width) responsive SVG in img/object | core | broad | museum-label-panel |
| `css:prefers-color-scheme` | @media (prefers-color-scheme: dark) | core | broad | museum-label-panel |
| `css:prefers-reduced-motion` | @media (prefers-reduced-motion) | core | broad | escapement-chronometer |
| `el:foreignObject` | foreignObject element | core | broad | museum-label-panel |
| `el:image` | image element | core | broad | jacquard-loom-draft |
| `pr:image-rendering` | image-rendering property | core | broad | jacquard-loom-draft |
| `pv:fill=currentcolor` | currentColor for icons inheriting HTML color | core | broad | museum-label-panel |
| `api:HTMLObjectElement.contentDocument` | Accessing embedded SVG DOM via contentDocument | detail / `concept:svg-as-object-embed-iframe` | broad | museum-label-panel |
| `api:SVGElement.style` | SVGElement.style CSSStyleDeclaration | detail / `el:style` | broad | letterpress-type-specimen |
| `api:SVGImageElement.decode` | SVGImageElement.decode() | detail / `el:image` | partial | jacquard-loom-draft |
| `at:a.rel` | a rel / referrerpolicy / hreflang / type | detail / `el:a` | partial | celestial-astrolabe-cabinet (via el:a) |
| `at:a.xlink:arcrole` | xlink:arcrole / xlink:role | detail / `el:a` | deprecated | celestial-astrolabe-cabinet (via el:a) |
| `at:a.xlink:show` | xlink:show | detail / `el:a` | deprecated | celestial-astrolabe-cabinet (via el:a) |
| `at:a.xlink:type` | xlink:type / xlink:actuate | detail / `el:a` | deprecated | celestial-astrolabe-cabinet (via el:a) |
| `at:foreignObject.width` | foreignObject width/height | detail / `el:foreignObject` | broad | museum-label-panel |
| `at:foreignObject.x` | foreignObject x/y | detail / `el:foreignObject` | broad | museum-label-panel |
| `at:image.crossorigin` | image crossorigin attribute | detail / `el:image` | broad | jacquard-loom-draft (via el:image) |
| `at:image.decoding` | image decoding hint (sync/async) | detail / `el:image` | partial | jacquard-loom-draft |
| `at:image.fetchpriority` | image fetchpriority hint | detail / `el:image` | partial | jacquard-loom-draft (via el:image) |
| `at:image.width` | image width/height (explicit or auto from intrinsic size) | detail / `el:image` | broad | jacquard-loom-draft (via el:image) |
| `at:image.x` | image x/y position | detail / `el:image` | broad | jacquard-loom-draft (via el:image) |
| `at:svg.aria-describedby` | aria-describedby referencing desc | detail / `el:desc` | broad | museum-label-panel |
| `at:svg.aria-labelledby` | aria-labelledby referencing title/text ids | detail / `at:svg.aria-label` | broad | museum-label-panel |
| `at:svg.focusable` | focusable attribute (SVG Tiny 1.2 / IE) | detail / `concept:tabindex-focusable-svg-elements` | deprecated | museum-label-panel (via concept:tabindex-focusable-svg-elements) |
| `av:a.target=_blank` | a target values (_blank/_self/_top/_parent) | detail / `el:a` | broad | celestial-astrolabe-cabinet |
| `av:a.target=_replace` | a target _replace | detail / `el:a` | deprecated | celestial-astrolabe-cabinet (via el:a) |
| `av:g.role=group` | role=group with aria-label on subdiagrams | detail / `av:svg.role=img` | broad | museum-label-panel |
| `av:g.role=list` | role=list/listitem structure on groups | detail / `av:svg.role=img` | broad | museum-label-panel |
| `av:image.preserveAspectRatio=none` | preserveAspectRatio none (non-uniform stretch) | detail / `at:image.preserveAspectRatio` | broad | jacquard-loom-draft |
| `av:image.preserveAspectRatio=xMidYMid slice` | preserveAspectRatio slice (cover/crop) | detail / `at:image.preserveAspectRatio` | broad | jacquard-loom-draft (via at:image.preserveAspectRatio) |
| `av:svg.role=graphics-document` | WAI-ARIA Graphics roles (graphics-document/object/symbol) | detail / `av:svg.role=img` | partial | museum-label-panel |
| `concept:animated-raster-in-image` | animated GIF/APNG/WebP inside image | detail / `el:image` | broad | jacquard-loom-draft (via el:image) |
| `concept:foreign-namespace-attributes-ignored` | Unknown namespaced elements/attributes ignored (inkscape:, sodipodi:) | detail / `el:metadata` | broad | museum-label-panel |
| `concept:foreignobject-canvas-rasterization` | Rasterising SVG+foreignObject via canvas drawImage | detail / `el:foreignObject` | partial | museum-label-panel |
| `concept:foreignobject-overflow-clipping` | foreignObject overflow (UA default hidden) | detail / `el:foreignObject` | broad | museum-label-panel |
| `concept:foreignobject-viewbox-scaling` | HTML scaled by viewBox in foreignObject | detail / `el:foreignObject` | broad | museum-label-panel |
| `concept:foreignobject-xmlns-requirement` | XHTML namespace requirement in standalone SVG | detail / `el:foreignObject` | broad | museum-label-panel |
| `concept:html-link-stylesheet-in-svg` | XHTML link rel=stylesheet inside SVG | detail / `concept:xml-stylesheet-pi` | partial | letterpress-type-specimen (via concept:xml-stylesheet-pi) |
| `concept:html-parser-foreign-content` | HTML parser foreign-content rules (case fix-up, no namespace) | detail / `concept:inline-svg-in-html` | broad | neon-sign-workshop (via concept:inline-svg-in-html) |
| `concept:inline-svg-baseline-gap` | Inline svg is display:inline (baseline gap) | detail / `concept:inline-svg-in-html` | broad | neon-sign-workshop (via concept:inline-svg-in-html) |
| `concept:inline-svg-id-collisions` | Duplicate ids across several inline SVGs | detail / `concept:inline-svg-in-html` | broad | neon-sign-workshop |
| `concept:inline-svg-style-leaks-globally` | style inside inline SVG applies to the whole HTML document | detail / `el:style` | broad | letterpress-type-specimen (via el:style) |
| `concept:lang-dependent-glyph-selection` | Language-dependent font and glyph selection | detail / `at:svg.lang` | broad | stele-rubbing-hall |
| `concept:media-fragments-spatial` | spatial media fragments (#xywh=) on image resources | detail / `el:image` | none | jacquard-loom-draft (via el:image) |
| `concept:metadata-rdf-dublin-core` | RDF / Dublin Core inside metadata | detail / `el:metadata` | broad | museum-label-panel |
| `concept:svg-data-uri-encoding` | Encoding SVG in data: URIs (utf8, # escaping) | detail / `concept:svg-as-css-background-image` | broad | neon-sign-workshop |
| `concept:svg-favicon` | SVG favicon with embedded dark-mode CSS | detail / `concept:svg-as-img-restrictions` | partial | museum-label-panel (via concept:svg-as-img-restrictions) |
| `concept:svg-text-accessibility-and-find` | SVG text exposed to find-in-page, selection and AT | detail / `av:svg.role=img` | broad | museum-label-panel |
| `concept:ua-stylesheet-defaults` | SVG user-agent stylesheet defaults | detail / `concept:presentation-attribute-specificity` | broad | letterpress-type-specimen |
| `concept:use-shadow-tree-selector-isolation` | Document selectors do not reach into use shadow trees; custom properties do | detail / `concept:use-inheritance` | broad | celestial-astrolabe-cabinet |
| `concept:var-in-presentation-attribute` | var() inside presentation attributes | detail / `css:custom-properties` | partial | museum-label-panel |
| `concept:xlink-href-legacy` | xlink:href and xmlns:xlink namespace | detail / `at:image.href` | deprecated | jacquard-loom-draft |
| `concept:xml-entities-and-cdata` | XML entities, internal DTD entity definitions and CDATA sections | detail / `concept:standalone-svg-document` | broad | museum-label-panel |
| `concept:xml-well-formedness-errors` | Strict XML parsing (well-formedness failures) | detail / `concept:standalone-svg-document` | broad | museum-label-panel |
| `css:container-queries` | Container queries around/inside SVG | detail / `concept:foreignobject-css-grid-flex` | partial | museum-label-panel |
| `css:hyphens-in-foreignobject` | hyphens:auto with lang in foreignObject text | detail / `at:svg.lang` | partial | stele-rubbing-hall (via at:svg.lang) |
| `css:import-rule` | @import inside SVG style element | detail / `el:style` | broad | letterpress-type-specimen (via el:style) |
| `css:important-override` | !important in SVG styling | detail / `concept:presentation-attribute-specificity` | broad | letterpress-type-specimen |
| `css:lang-selector` | :lang() pseudo-class styling | detail / `at:svg.lang` | broad | stele-rubbing-hall |
| `css:light-dark-function` | light-dark() with color-scheme | detail / `css:prefers-color-scheme` | broad | museum-label-panel |
| `css:link-pseudo-classes-svg-a` | :link/:visited/:hover/:focus on SVG a | detail / `el:a` | broad | celestial-astrolabe-cabinet (via el:a) |
| `css:prefers-contrast` | @media (prefers-contrast: more) | detail / `css:forced-colors` | broad | museum-label-panel |
| `css:root-selector-scope` | :root theming scope (svg root vs html root) | detail / `css:custom-properties` | broad | museum-label-panel |
| `css:supports-rule` | @supports feature queries | detail / `css:custom-properties` | broad | museum-label-panel |
| `css:target-pseudo-class` | :target with fragment links inside SVG | detail / `at:a.href` | broad | celestial-astrolabe-cabinet (via at:a.href) |
| `el:audio` | SVG-namespace audio element | detail / `concept:foreignobject-video` | none | museum-label-panel (via concept:foreignobject-video) |
| `el:canvas` | SVG-namespace canvas element | detail / `concept:foreignobject-video` | none | museum-label-panel |
| `el:iframe` | SVG-namespace iframe element | detail / `concept:foreignobject-video` | none | museum-label-panel |
| `el:video` | SVG-namespace video element | detail / `concept:foreignobject-video` | none | museum-label-panel (via concept:foreignobject-video) |
| `pv:image-rendering=crisp-edges` | image-rendering crisp-edges | detail / `pr:image-rendering` | partial | jacquard-loom-draft (via pr:image-rendering) |
| `pv:image-rendering=optimizeSpeed` | SVG 1.1 optimizeSpeed/optimizeQuality keywords | detail / `pr:image-rendering` | deprecated | jacquard-loom-draft (via pr:image-rendering) |
| `pv:image-rendering=pixelated` | image-rendering pixelated | detail / `pr:image-rendering` | broad | jacquard-loom-draft |

### 基本图形与路径语法

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:SVGAnimatedLength.baseVal` | animated length baseVal/animVal on geometry attributes | core | broad | ship-lofting-floor |
| `api:SVGGeometryElement.getPointAtLength` | getPointAtLength() | core | broad | ship-lofting-floor |
| `api:SVGGeometryElement.getTotalLength` | getTotalLength() | core | broad | ship-lofting-floor |
| `api:SVGGeometryElement.isPointInFill` | isPointInFill() | core | broad | ship-lofting-floor |
| `api:SVGGraphicsElement.getBBox` | getBBox() geometry bounding box | core | broad | letterpress-type-specimen |
| `at:path.d` | path data attribute d | core | broad | ship-lofting-floor |
| `at:path.pathLength` | pathLength normalisation | core | broad | ship-lofting-floor |
| `at:polygon.points` | polygon points list parsing | core | broad | pipeline-mimic-board |
| `at:rect.rx` | rect corner radius rx | core | broad | jacquard-loom-draft |
| `av:ellipse.rx=auto` | ellipse rx/ry auto (circle fallback) | core | partial | guilloche-intaglio-plate |
| `av:path.d=A` | elliptical arc A/a | core | broad | ship-lofting-floor |
| `av:path.d=C` | cubic Bezier curveto C/c | core | broad | ship-lofting-floor |
| `av:path.d=H` | horizontal lineto H/h | core | broad | ship-lofting-floor |
| `av:path.d=L` | lineto L/l | core | broad | ship-lofting-floor |
| `av:path.d=M` | moveto M/m | core | broad | ship-lofting-floor |
| `av:path.d=Q` | quadratic Bezier curveto Q/q | core | broad | ship-lofting-floor |
| `av:path.d=S` | smooth cubic curveto S/s | core | broad | ship-lofting-floor |
| `av:path.d=T` | smooth quadratic curveto T/t | core | broad | ship-lofting-floor |
| `av:path.d=V` | vertical lineto V/v | core | broad | ship-lofting-floor |
| `av:path.d=Z` | closepath Z/z | core | broad | ship-lofting-floor |
| `concept:arc-flag-combinations` | large-arc and sweep flags four combinations | core | broad | ship-lofting-floor |
| `concept:arc-radius-scaling` | too-small arc radii scaled up | core | broad | ship-lofting-floor |
| `concept:implicit-repeated-commands` | implicit command repetition (M implies L) | core | broad | ship-lofting-floor |
| `concept:multiple-subpaths` | multiple subpaths in one path | core | broad | ship-lofting-floor |
| `concept:relative-vs-absolute-commands` | lowercase relative vs uppercase absolute coordinates | core | broad | ship-lofting-floor |
| `concept:smooth-cubic-reflection` | S reflects previous C/S second control point | core | broad | ship-lofting-floor |
| `concept:smooth-quadratic-reflection` | T reflects previous Q/T control point | core | broad | ship-lofting-floor |
| `concept:zero-length-subpath-round-cap-dot` | zero-length segment with round cap renders dot | core | broad | ship-lofting-floor |
| `css:d-property` | path d as CSS property | core | broad | ship-lofting-floor |
| `el:circle` | circle element | core | broad | guilloche-intaglio-plate |
| `el:ellipse` | ellipse element | core | broad | guilloche-intaglio-plate |
| `el:line` | line element | core | broad | pipeline-mimic-board |
| `el:path` | path element | core | broad | ship-lofting-floor |
| `el:polygon` | polygon element | core | broad | pipeline-mimic-board |
| `el:polyline` | polyline element | core | broad | pipeline-mimic-board |
| `el:rect` | rect element | core | broad | jacquard-loom-draft |
| `pr:fill-rule` | fill-rule property | core | broad | ship-lofting-floor |
| `pr:shape-rendering` | shape-rendering property | core | broad | four-colour-press-check |
| `api:SVGGeometryElement.isPointInStroke` | isPointInStroke() | detail / `api:SVGGeometryElement.isPointInFill` | broad | ship-lofting-floor |
| `api:SVGGeometryElement.pathLength` | pathLength animated number | detail / `at:path.pathLength` | broad | ship-lofting-floor |
| `api:SVGPathElement.getPathData` | getPathData()/setPathData() path data API | detail / `at:path.d` | none | ship-lofting-floor |
| `api:SVGPathElement.getPathSegAtLength` | getPathSegAtLength() | detail / `api:SVGGeometryElement.getPointAtLength` | deprecated | ship-lofting-floor (via api:SVGGeometryElement.getPointAtLength) |
| `api:SVGPathElement.pathSegList` | pathSegList / SVGPathSeg interfaces | detail / `at:path.d` | deprecated | ship-lofting-floor |
| `api:SVGPointList` | polygon.points SVGPointList manipulation | detail / `at:polygon.points` | broad | pipeline-mimic-board |
| `at:circle.cx` | circle cx/cy centre | detail / `el:circle` | broad | guilloche-intaglio-plate (via el:circle) |
| `at:circle.r` | circle radius r | detail / `el:circle` | broad | guilloche-intaglio-plate |
| `at:ellipse.cx` | ellipse cx/cy centre | detail / `el:ellipse` | broad | guilloche-intaglio-plate (via el:ellipse) |
| `at:ellipse.rx` | ellipse horizontal radius rx | detail / `el:ellipse` | broad | guilloche-intaglio-plate |
| `at:ellipse.ry` | ellipse vertical radius ry | detail / `el:ellipse` | broad | guilloche-intaglio-plate |
| `at:line.x1` | line x1/y1/x2/y2 endpoints | detail / `el:line` | broad | pipeline-mimic-board |
| `at:polyline.points` | polyline points list | detail / `el:polyline` | broad | pipeline-mimic-board |
| `at:rect.ry` | rect vertical corner radius ry | detail / `at:rect.rx` | broad | jacquard-loom-draft |
| `at:rect.width` | rect width/height size | detail / `el:rect` | broad | jacquard-loom-draft (via el:rect) |
| `at:rect.x` | rect x/y position | detail / `el:rect` | broad | jacquard-loom-draft (via el:rect) |
| `av:path.d=B` | bearing commands B/b | detail / `at:path.d` | none | ship-lofting-floor (via at:path.d) |
| `av:path.d=R` | Catmull-Rom commands R/r | detail / `at:path.d` | none | ship-lofting-floor (via at:path.d) |
| `av:rect.rx=auto` | rect rx/ry auto keyword | detail / `at:rect.rx` | broad | jacquard-loom-draft (via at:rect.rx) |
| `concept:absolute-length-units-in-geometry` | CSS units (mm, cm, in, em) in geometry attributes | detail / `el:rect` | broad | jacquard-loom-draft (via el:rect) |
| `concept:arc-coincident-endpoints-omitted` | arc with equal endpoints is skipped | detail / `av:path.d=A` | broad | ship-lofting-floor (via av:path.d=A) |
| `concept:arc-flag-compact-parsing` | arc flags parsed without separators | detail / `av:path.d=A` | broad | ship-lofting-floor |
| `concept:arc-negative-radius-absolute` | negative arc radii use absolute value | detail / `av:path.d=A` | broad | ship-lofting-floor (via av:path.d=A) |
| `concept:arc-x-axis-rotation` | arc x-axis-rotation parameter | detail / `av:path.d=A` | broad | ship-lofting-floor |
| `concept:arc-zero-radius-line` | zero arc radius degenerates to line | detail / `av:path.d=A` | broad | ship-lofting-floor |
| `concept:bbox-excludes-stroke-and-control-points` | bbox ignores stroke and off-curve control points | detail / `api:SVGGraphicsElement.getBBox` | broad | letterpress-type-specimen |
| `concept:closepath-join-vs-cap` | Z joins stroke ends, open path gets caps | detail / `av:path.d=Z` | broad | ship-lofting-floor |
| `concept:empty-d-not-rendered` | empty or missing d/points disables rendering | detail / `at:path.d` | broad | ship-lofting-floor |
| `concept:fill-closes-open-subpaths` | fill implicitly closes unclosed subpaths | detail / `av:path.d=Z` | broad | ship-lofting-floor |
| `concept:line-has-no-fill-area` | line ignores fill | detail / `el:line` | broad | pipeline-mimic-board |
| `concept:negative-length-error` | negative width/height/r treated as zero | detail / `el:rect` | broad | jacquard-loom-draft (via el:rect) |
| `concept:path-error-partial-render` | path data error renders up to error | detail / `at:path.d` | broad | ship-lofting-floor |
| `concept:path-must-start-with-moveto` | path data must begin with M/m | detail / `at:path.d` | broad | ship-lofting-floor |
| `concept:path-number-syntax` | compact number syntax in path data | detail / `at:path.d` | broad | ship-lofting-floor |
| `concept:pathlength-on-basic-shapes` | pathLength on rect/circle/ellipse/line/polyline/polygon | detail / `at:path.pathLength` | broad | ship-lofting-floor (via at:path.pathLength) |
| `concept:points-odd-coordinate-count` | odd coordinate count drops trailing value | detail / `at:polygon.points` | broad | pipeline-mimic-board |
| `concept:points-parse-error-partial-render` | points parse error renders prefix | detail / `at:polygon.points` | broad | pipeline-mimic-board |
| `concept:polygon-vs-path-equivalence` | basic shapes as equivalent paths | detail / `el:path` | broad | ship-lofting-floor |
| `concept:polyline-fill-implicit-close` | polyline fill closes area but stroke stays open | detail / `el:polyline` | broad | pipeline-mimic-board |
| `concept:radius-percentage-normalized-diagonal` | percentage r resolves against normalized diagonal | detail / `el:circle` | broad | guilloche-intaglio-plate |
| `concept:rect-corner-radius-clamp` | rx/ry clamped to half size | detail / `at:rect.rx` | broad | jacquard-loom-draft (via at:rect.rx) |
| `concept:rect-percentage-geometry` | percentage x/y/width/height on rect | detail / `el:rect` | broad | jacquard-loom-draft (via el:rect) |
| `concept:relative-moveto-after-closepath` | relative m after Z is relative to subpath start | detail / `av:path.d=M` | broad | ship-lofting-floor |
| `concept:smooth-command-without-predecessor` | S/T after non-curve uses current point as control | detail / `concept:smooth-cubic-reflection` | broad | ship-lofting-floor |
| `concept:stroke-dash-start-position-on-shapes` | dash pattern origin per basic shape | detail / `at:path.pathLength` | broad | ship-lofting-floor (via at:path.pathLength) |
| `concept:winding-direction-holes` | subpath winding direction creates holes under nonzero | detail / `pr:fill-rule` | broad | ship-lofting-floor |
| `concept:zero-length-subpath-square-cap` | zero-length segment with square cap renders square | detail / `concept:zero-length-subpath-round-cap-dot` | broad | ship-lofting-floor |
| `concept:zero-size-shape-not-rendered` | zero width/height/r disables rendering | detail / `el:rect` | broad | jacquard-loom-draft (via el:rect) |
| `css:custom-properties-in-geometry` | var() in geometry properties | detail / `css:geometry-properties` | broad | ship-lofting-floor |
| `css:d-property-transition` | CSS transition between path() values | detail / `css:d-property` | broad | ship-lofting-floor |
| `css:geometry-percentage-in-css` | percentage geometry values via CSS | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `css:geometry-properties-transition` | CSS transitions/animations on geometry properties | detail / `css:geometry-properties` | broad | ship-lofting-floor |
| `pr:cx` | cx geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:cy` | cy geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:height` | height geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:r` | r geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:rx` | rx geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:ry` | ry geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:width` | width geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:x` | x geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pr:y` | y geometry property | detail / `css:geometry-properties` | broad | ship-lofting-floor (via css:geometry-properties) |
| `pv:fill-rule=evenodd` | fill-rule evenodd | detail / `pr:fill-rule` | broad | ship-lofting-floor |
| `pv:fill-rule=nonzero` | fill-rule nonzero | detail / `pr:fill-rule` | broad | ship-lofting-floor |
| `pv:shape-rendering=auto` | shape-rendering auto | detail / `pr:shape-rendering` | broad | four-colour-press-check |
| `pv:shape-rendering=crispEdges` | shape-rendering crispEdges | detail / `pr:shape-rendering` | broad | four-colour-press-check |
| `pv:shape-rendering=geometricPrecision` | shape-rendering geometricPrecision | detail / `pr:shape-rendering` | broad | four-colour-press-check |
| `pv:shape-rendering=optimizeSpeed` | shape-rendering optimizeSpeed | detail / `pr:shape-rendering` | partial | four-colour-press-check |

### 填充、描边与合成属性

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `concept:line-drawing-dash-animation` | Line-drawing effect with dasharray = path length | core | broad | seismic-drum-console |
| `concept:paint-server-fallback` | url() paint with fallback colour or none | core | broad | auroral-spectrograph |
| `css:css-color-paint` | CSS Color syntaxes as paint (rgb/hsl, #rrggbbaa, oklch, lab, color()) | core | broad | guilloche-intaglio-plate |
| `pr:color` | color property (currentColor source) | core | broad | guilloche-intaglio-plate |
| `pr:color-interpolation` | color-interpolation sRGB/linearRGB | core | partial | four-colour-press-check |
| `pr:cursor` | cursor property on SVG elements | core | broad | seismic-drum-console |
| `pr:display` | display: none vs visibility | core | broad | escapement-chronometer |
| `pr:fill` | fill paint property | core | broad | guilloche-intaglio-plate |
| `pr:fill-opacity` | fill-opacity | core | broad | guilloche-intaglio-plate |
| `pr:isolation` | isolation: isolate | core | broad | neon-sign-workshop |
| `pr:mix-blend-mode` | mix-blend-mode on SVG elements | core | broad | neon-sign-workshop |
| `pr:opacity` | opacity (group compositing vs per-element) | core | broad | guilloche-intaglio-plate |
| `pr:overflow` | overflow on nested viewports | core | broad | seismic-drum-console |
| `pr:paint-order` | paint-order | core | broad | guilloche-intaglio-plate |
| `pr:stroke` | stroke paint property | core | broad | guilloche-intaglio-plate |
| `pr:stroke-dasharray` | stroke-dasharray lengths | core | broad | guilloche-intaglio-plate |
| `pr:stroke-dashoffset` | stroke-dashoffset (incl. negative) | core | broad | guilloche-intaglio-plate |
| `pr:stroke-linecap` | stroke-linecap butt/round/square | core | broad | ship-lofting-floor |
| `pr:stroke-linejoin` | stroke-linejoin miter/round/bevel | core | broad | ship-lofting-floor |
| `pr:stroke-miterlimit` | stroke-miterlimit | core | broad | ship-lofting-floor |
| `pr:stroke-opacity` | stroke-opacity | core | broad | guilloche-intaglio-plate |
| `pr:stroke-width` | stroke-width in user units | core | broad | ship-lofting-floor |
| `pr:text-rendering` | text-rendering hint | core | partial | letterpress-type-specimen |
| `pr:visibility` | visibility hidden vs visible | core | broad | escapement-chronometer |
| `pv:fill=context-fill` | context-fill paint (markers) | core | broad | pipeline-mimic-board |
| `pv:fill=context-stroke` | Cross-using context paints (fill=context-stroke) | core | broad | pipeline-mimic-board |
| `pv:fill=currentColor` | currentColor paint keyword | core | broad | guilloche-intaglio-plate |
| `pv:fill=none` | fill: none (unfilled) | core | broad | guilloche-intaglio-plate |
| `pv:fill=url()` | Paint server reference url(#id) | core | broad | auroral-spectrograph |
| `pv:paint-order=markers` | paint-order with markers first | core | broad | pipeline-mimic-board |
| `pv:stroke=context-stroke` | context-stroke paint (markers) | core | broad | pipeline-mimic-board |
| `pv:vector-effect=non-scaling-stroke` | vector-effect: non-scaling-stroke | core | broad | guilloche-intaglio-plate |
| `concept:closepath-join-vs-caps` | Closepath Z produces a join instead of caps | detail / `pr:stroke-linejoin` | broad | ship-lofting-floor (via pr:stroke-linejoin) |
| `concept:context-paint-in-use` | context-fill/context-stroke inside <use> references | detail / `pv:fill=context-fill` | partial | pipeline-mimic-board |
| `concept:currentcolor-icon-theming` | Recolouring <use> icons via CSS color | detail / `pv:fill=currentColor` | broad | guilloche-intaglio-plate |
| `concept:dash-caps-overlap` | Caps applied to each dash | detail / `pr:stroke-dasharray` | broad | guilloche-intaglio-plate (via pr:stroke-dasharray) |
| `concept:default-paint-values` | Initial values fill black, stroke none | detail / `pr:fill` | broad | guilloche-intaglio-plate (via pr:fill) |
| `concept:dotted-line-round-caps` | Dotted line via zero dashes and round caps | detail / `pr:stroke-dasharray` | broad | guilloche-intaglio-plate |
| `concept:half-pixel-crisp-lines` | Half-pixel offset for crisp 1px strokes | detail / `pr:shape-rendering` | broad | four-colour-press-check |
| `concept:inner-outer-stroke-simulation` | Simulating inside/outside strokes | detail / `pr:paint-order` | broad | guilloche-intaglio-plate |
| `concept:marching-ants` | Marching-ants selection outline | detail / `pr:stroke-dashoffset` | broad | guilloche-intaglio-plate |
| `concept:multiple-fill-layers` | Multiple comma-separated fill/stroke paint layers (rolled back) | detail / `pr:fill` | none | guilloche-intaglio-plate (via pr:fill) |
| `concept:odd-dash-repetition` | Odd-count dasharray doubled | detail / `pr:stroke-dasharray` | broad | guilloche-intaglio-plate |
| `concept:opacity-zero-still-hit-testable` | opacity 0 keeps hit-testing unlike visibility hidden | detail / `pr:opacity` | broad | guilloche-intaglio-plate |
| `concept:progress-ring` | Circular progress ring via dash on circle | detail / `pr:stroke-dasharray` | broad | guilloche-intaglio-plate (via pr:stroke-dasharray) |
| `concept:stroke-over-fill-transparency` | Translucent stroke shows fill beneath its inner half | detail / `pr:stroke-opacity` | broad | guilloche-intaglio-plate |
| `concept:stroke-paint-server` | Gradient or pattern on stroke | detail / `pr:stroke` | broad | guilloche-intaglio-plate (via pr:stroke) |
| `concept:stroke-width-under-nonuniform-scale` | Stroke distorted by non-uniform transforms | detail / `pv:vector-effect=non-scaling-stroke` | broad | guilloche-intaglio-plate |
| `concept:svg-blend-with-html-backdrop` | Blending inline SVG content against HTML backdrop | detail / `pr:mix-blend-mode` | broad | neon-sign-workshop |
| `concept:visibility-child-override` | Child re-enabling visibility inside hidden parent | detail / `pr:visibility` | broad | escapement-chronometer |
| `concept:zero-length-subpath-caps` | Zero-length subpaths render dots with round/square caps | detail / `pr:stroke-linecap` | broad | ship-lofting-floor (via pr:stroke-linecap) |
| `el:color-profile` | <color-profile> element and color-profile property | detail / `css:css-color-paint` | deprecated | guilloche-intaglio-plate (via css:css-color-paint) |
| `el:cursor` | <cursor> element | detail / `pr:cursor` | deprecated | seismic-drum-console (via pr:cursor) |
| `el:solidcolor` | <solidcolor> paint server (solid-color / solid-opacity) | detail / `pv:fill=url()` | deprecated | auroral-spectrograph (via pv:fill=url()) |
| `pr:buffered-rendering` | buffered-rendering (removed; use will-change) | detail / `pr:opacity` | deprecated | guilloche-intaglio-plate (via pr:opacity) |
| `pr:color-rendering` | color-rendering hint | detail / `pr:color-interpolation` | deprecated | four-colour-press-check (via pr:color-interpolation) |
| `pr:enable-background` | enable-background / BackgroundImage | detail / `pr:isolation` | deprecated | neon-sign-workshop (via pr:isolation) |
| `pr:stroke-alignment` | stroke-alignment inner/outer | detail / `pr:stroke` | none | guilloche-intaglio-plate (via pr:stroke) |
| `pr:stroke-dashcorner` | stroke-dashcorner / stroke-dash-justify | detail / `pr:stroke-dasharray` | none | guilloche-intaglio-plate (via pr:stroke-dasharray) |
| `pr:z-index` | z-index (dropped from SVG 2) | detail / `pr:paint-order` | none | guilloche-intaglio-plate (via pr:paint-order) |
| `pv:cursor=url()` | Custom image cursor via url() | detail / `pr:cursor` | broad | seismic-drum-console (via pr:cursor) |
| `pv:fill=child` | child / child(n) paint values (deferred) | detail / `pr:fill` | none | guilloche-intaglio-plate (via pr:fill) |
| `pv:fill=color-mix()` | color-mix() as paint | detail / `css:css-color-paint` | broad | guilloche-intaglio-plate |
| `pv:fill=icc-color()` | icc-color() ICC profile paint | detail / `css:css-color-paint` | deprecated | guilloche-intaglio-plate (via css:css-color-paint) |
| `pv:fill=inherit` | Explicit inherit of paint | detail / `pr:fill` | broad | guilloche-intaglio-plate (via pr:fill) |
| `pv:fill=light-dark()` | light-dark() paint for colour schemes | detail / `css:css-color-paint` | broad | guilloche-intaglio-plate (via css:css-color-paint) |
| `pv:fill=rgba()` | Alpha colour syntaxes (rgba, hsla, #rrggbbaa) | detail / `css:css-color-paint` | broad | guilloche-intaglio-plate |
| `pv:fill=system-color` | System colour keywords (Canvas, CanvasText, Highlight, AccentColor) | detail / `css:css-color-paint` | broad | guilloche-intaglio-plate (via css:css-color-paint) |
| `pv:fill=transparent` | transparent colour keyword as paint | detail / `pv:fill=none` | broad | guilloche-intaglio-plate (via pv:fill=none) |
| `pv:mix-blend-mode=difference` | difference / exclusion blend | detail / `pr:mix-blend-mode` | broad | neon-sign-workshop (via pr:mix-blend-mode) |
| `pv:mix-blend-mode=luminosity` | Non-separable blends (hue, saturation, color, luminosity) | detail / `pr:mix-blend-mode` | broad | neon-sign-workshop (via pr:mix-blend-mode) |
| `pv:mix-blend-mode=screen` | Additive blend modes (screen, lighten, plus-lighter) | detail / `pr:mix-blend-mode` | broad | neon-sign-workshop |
| `pv:overflow=scroll` | overflow: scroll / auto behave as hidden in SVG | detail / `pr:overflow` | broad | seismic-drum-console |
| `pv:paint-order=stroke` | paint-order: stroke on text (outline behind fill) | detail / `pr:paint-order` | broad | guilloche-intaglio-plate |
| `pv:stroke-dasharray=percentage` | Percentage dash lengths | detail / `pr:stroke-dasharray` | broad | guilloche-intaglio-plate (via pr:stroke-dasharray) |
| `pv:stroke-linecap=round` | Round caps | detail / `pr:stroke-linecap` | broad | ship-lofting-floor |
| `pv:stroke-linecap=square` | Square caps | detail / `pr:stroke-linecap` | broad | ship-lofting-floor |
| `pv:stroke-linejoin=arcs` | arcs join | detail / `pr:stroke-linejoin` | none | ship-lofting-floor (via pr:stroke-linejoin) |
| `pv:stroke-linejoin=bevel` | Bevel joins | detail / `pr:stroke-linejoin` | broad | ship-lofting-floor |
| `pv:stroke-linejoin=miter-clip` | miter-clip join | detail / `pr:stroke-linejoin` | partial | ship-lofting-floor (via pr:stroke-linejoin) |
| `pv:stroke-linejoin=round` | Round joins | detail / `pr:stroke-linejoin` | broad | ship-lofting-floor |
| `pv:stroke-width=0` | Zero stroke-width suppresses stroke | detail / `pr:stroke-width` | broad | ship-lofting-floor |
| `pv:stroke-width=em` | stroke-width with CSS units (em, px, mm) | detail / `pr:stroke-width` | broad | ship-lofting-floor (via pr:stroke-width) |
| `pv:stroke-width=percentage` | stroke-width as percentage of viewport diagonal | detail / `pr:stroke-width` | broad | ship-lofting-floor (via pr:stroke-width) |
| `pv:stroke=none` | stroke: none (default) | detail / `pr:stroke` | broad | guilloche-intaglio-plate |
| `pv:vector-effect=fixed-position` | vector-effect: fixed-position | detail / `pv:vector-effect=non-scaling-stroke` | none | guilloche-intaglio-plate (via pv:vector-effect=non-scaling-stroke) |
| `pv:vector-effect=non-rotation` | vector-effect: non-rotation | detail / `pv:vector-effect=non-scaling-stroke` | none | guilloche-intaglio-plate (via pv:vector-effect=non-scaling-stroke) |
| `pv:vector-effect=non-scaling-size` | vector-effect: non-scaling-size | detail / `pv:vector-effect=non-scaling-stroke` | none | guilloche-intaglio-plate (via pv:vector-effect=non-scaling-stroke) |
| `pv:vector-effect=non-scaling-stroke-viewport` | vector-effect viewport / screen reference modifiers | detail / `pv:vector-effect=non-scaling-stroke` | none | guilloche-intaglio-plate (via pv:vector-effect=non-scaling-stroke) |
| `pv:visibility=collapse` | visibility: collapse | detail / `pr:visibility` | broad | escapement-chronometer |

### 渐变与图案

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `at:linearGradient.gradientTransform` | gradientTransform | core | broad | auroral-spectrograph |
| `at:linearGradient.href` | href inheritance between gradients | core | broad | auroral-spectrograph |
| `at:linearGradient.x1` | Gradient vector x1/y1/x2/y2 | core | broad | auroral-spectrograph |
| `at:pattern.href` | Pattern href inheritance | core | broad | jacquard-loom-draft |
| `at:pattern.patternTransform` | patternTransform rotates/scales the tile grid | core | broad | jacquard-loom-draft, four-colour-press-check |
| `at:pattern.viewBox` | pattern viewBox scaling | core | broad | jacquard-loom-draft |
| `at:pattern.width` | Tile size width/height | core | broad | jacquard-loom-draft |
| `at:radialGradient.cx` | Radial centre and radius cx/cy/r | core | broad | auroral-spectrograph |
| `at:radialGradient.fr` | Focal radius fr | core | partial | auroral-spectrograph |
| `at:radialGradient.fx` | Focal point fx/fy | core | broad | auroral-spectrograph |
| `at:stop.offset` | offset as number or percentage | core | broad | auroral-spectrograph |
| `av:linearGradient.gradientUnits=userSpaceOnUse` | gradientUnits userSpaceOnUse | core | broad | auroral-spectrograph |
| `av:linearGradient.spreadMethod=reflect` | spreadMethod reflect | core | broad | auroral-spectrograph |
| `av:linearGradient.spreadMethod=repeat` | spreadMethod repeat | core | broad | auroral-spectrograph |
| `av:pattern.patternContentUnits=objectBoundingBox` | patternContentUnits objectBoundingBox | core | broad | jacquard-loom-draft |
| `av:pattern.patternUnits=userSpaceOnUse` | patternUnits userSpaceOnUse | core | broad | jacquard-loom-draft |
| `av:radialGradient.spreadMethod=reflect` | Radial reflect with focal offset | core | broad | auroral-spectrograph |
| `concept:animated-gradient-vector` | Animating gradient geometry or gradientTransform | core | broad | auroral-spectrograph |
| `concept:animated-pattern` | Animating patternTransform or tile content | core | broad | jacquard-loom-draft |
| `concept:conic-gradient-emulation` | Conic/angular gradient emulation | core | broad | auroral-spectrograph |
| `concept:gradient-on-marker` | Gradient inside marker content | core | broad | pipeline-mimic-board |
| `concept:gradient-on-stroke` | Gradient stroke | core | broad | auroral-spectrograph |
| `concept:gradient-on-text` | Gradient-filled text | core | broad | auroral-spectrograph |
| `concept:halftone-pattern` | Halftone dots via patterns | core | broad | four-colour-press-check |
| `concept:hatching-pattern` | Hatching via line patterns | core | broad | jacquard-loom-draft |
| `concept:mesh-gradient-emulation` | Mesh gradient emulation with blurred blobs | core | broad | mycelium-culture-chamber |
| `concept:nested-pattern` | Pattern content filled with another pattern | core | broad | jacquard-loom-draft |
| `concept:pattern-seams` | Tile seams and anti-aliasing artifacts | core | broad | jacquard-loom-draft |
| `concept:pattern-with-image` | Raster image tiles in a pattern | core | broad | jacquard-loom-draft |
| `concept:pattern-with-text` | Text inside pattern tiles | core | broad | jacquard-loom-draft |
| `concept:smil-animated-stops` | SMIL animation of stop offset and colour | core | broad | auroral-spectrograph |
| `css:gradient-stop-selectors` | CSS-styled stops via selectors and classes | core | broad | auroral-spectrograph |
| `el:linearGradient` | linearGradient element | core | broad | auroral-spectrograph |
| `el:pattern` | pattern element | core | broad | jacquard-loom-draft, four-colour-press-check |
| `el:radialGradient` | radialGradient element | core | broad | auroral-spectrograph |
| `el:stop` | stop element | core | broad | auroral-spectrograph |
| `pr:stop-color` | stop-color property | core | broad | auroral-spectrograph |
| `pr:stop-opacity` | stop-opacity property | core | broad | auroral-spectrograph |
| `api:SVGGradientElement.gradientUnits` | SVGGradientElement gradientUnits/spreadMethod/gradientTransform animated attributes | detail / `av:linearGradient.gradientUnits=userSpaceOnUse` | broad | auroral-spectrograph (via av:linearGradient.gradientUnits=userSpaceOnUse) |
| `api:SVGLinearGradientElement.x1` | SVGLinearGradientElement x1/y1/x2/y2 SVGAnimatedLength | detail / `at:linearGradient.x1` | broad | auroral-spectrograph (via at:linearGradient.x1) |
| `api:SVGPatternElement.patternTransform` | SVGPatternElement animated attributes | detail / `at:pattern.patternTransform` | broad | jacquard-loom-draft |
| `api:SVGRadialGradientElement.fx` | SVGRadialGradientElement cx/cy/r/fx/fy/fr SVGAnimatedLength | detail / `at:radialGradient.fx` | broad | auroral-spectrograph |
| `api:SVGStopElement.offset` | SVGStopElement.offset SVGAnimatedNumber | detail / `at:stop.offset` | broad | auroral-spectrograph |
| `at:linearGradient.xlink:href` | xlink:href on gradients and patterns | detail / `at:linearGradient.href` | deprecated | auroral-spectrograph (via at:linearGradient.href) |
| `at:pattern.preserveAspectRatio` | pattern preserveAspectRatio | detail / `at:pattern.viewBox` | broad | jacquard-loom-draft |
| `at:pattern.x` | Tile origin x/y offset | detail / `at:pattern.width` | broad | jacquard-loom-draft |
| `av:linearGradient.gradientUnits=objectBoundingBox` | gradientUnits objectBoundingBox (default) | detail / `av:linearGradient.gradientUnits=userSpaceOnUse` | broad | auroral-spectrograph |
| `av:linearGradient.spreadMethod=pad` | spreadMethod pad (default) | detail / `el:linearGradient` | broad | auroral-spectrograph |
| `av:pattern.patternContentUnits=userSpaceOnUse` | patternContentUnits userSpaceOnUse (default) | detail / `av:pattern.patternContentUnits=objectBoundingBox` | broad | jacquard-loom-draft |
| `av:pattern.patternUnits=objectBoundingBox` | patternUnits objectBoundingBox (default) | detail / `av:pattern.patternUnits=userSpaceOnUse` | broad | jacquard-loom-draft |
| `av:radialGradient.spreadMethod=repeat` | Radial repeat with focal offset | detail / `av:radialGradient.spreadMethod=reflect` | broad | auroral-spectrograph |
| `concept:bbox-gradient-diagonal-skew` | objectBoundingBox skews diagonal gradients | detail / `av:linearGradient.gradientUnits=userSpaceOnUse` | broad | auroral-spectrograph (via av:linearGradient.gradientUnits=userSpaceOnUse) |
| `concept:bbox-zero-size-paint-server-disabled` | Zero-width/height bbox disables bbox paint servers | detail / `av:linearGradient.gradientUnits=userSpaceOnUse` | broad | auroral-spectrograph (via av:linearGradient.gradientUnits=userSpaceOnUse) |
| `concept:checkerboard-pattern` | Checkerboard and transparency-grid tiles | detail / `el:pattern` | broad | jacquard-loom-draft |
| `concept:cross-hatch-layering` | Cross-hatch by stacking two pattern fills | detail / `concept:hatching-pattern` | broad | jacquard-loom-draft |
| `concept:elliptical-radial-gradient` | Elliptical radial via gradientTransform or bbox units | detail / `el:radialGradient` | broad | auroral-spectrograph (via el:radialGradient) |
| `concept:external-gradient-reference` | Cross-document url(file.svg#grad) paint servers | detail / `at:linearGradient.href` | partial | auroral-spectrograph (via at:linearGradient.href) |
| `concept:focal-point-outside-circle` | Focal point outside end circle (SVG 2 cone) | detail / `at:radialGradient.fx` | partial | auroral-spectrograph |
| `concept:foreignobject-css-gradient` | CSS conic/repeating gradients via foreignObject | detail / `concept:conic-gradient-emulation` | partial | auroral-spectrograph (via concept:conic-gradient-emulation) |
| `concept:gradient-banding-noise` | Banding and dither via feTurbulence noise overlay | detail / `pr:color-interpolation` | broad | four-colour-press-check |
| `concept:gradient-href-chain` | Multi-level href chains and attribute override | detail / `at:linearGradient.href` | broad | auroral-spectrograph (via at:linearGradient.href) |
| `concept:gradient-href-cross-type` | Linear referencing radial (stops only cross type) | detail / `at:linearGradient.href` | broad | auroral-spectrograph (via at:linearGradient.href) |
| `concept:gradient-on-group-bbox-per-child` | Gradient fill inherited from <g> resolves bbox per child | detail / `av:linearGradient.gradientUnits=userSpaceOnUse` | broad | auroral-spectrograph (via av:linearGradient.gradientUnits=userSpaceOnUse) |
| `concept:gradient-on-use-instances` | bbox gradients per <use> instance | detail / `el:linearGradient` | broad | auroral-spectrograph (via el:linearGradient) |
| `concept:hard-stop-banding` | Duplicate offsets create hard edges | detail / `at:stop.offset` | broad | auroral-spectrograph |
| `concept:layered-radial-gradients` | Stacking transparent radial gradients | detail / `concept:mesh-gradient-emulation` | broad | mycelium-culture-chamber (via concept:mesh-gradient-emulation) |
| `concept:paint-server-reference-cycle` | Self/cyclic references are treated as errors | detail / `el:pattern` | broad | jacquard-loom-draft (via el:pattern), four-colour-press-check (via el:pattern) |
| `concept:pattern-on-stroke` | Pattern-filled stroke | detail / `concept:gradient-on-stroke` | broad | auroral-spectrograph (via concept:gradient-on-stroke) |
| `concept:pattern-on-text` | Pattern-filled text | detail / `concept:gradient-on-text` | broad | auroral-spectrograph (via concept:gradient-on-text) |
| `concept:pattern-overflow-visible` | overflow:visible on pattern tiles | detail / `el:pattern` | none | jacquard-loom-draft |
| `concept:pattern-tile-rasterization` | Tile rasterization resolution and blur | detail / `concept:pattern-seams` | partial | jacquard-loom-draft |
| `concept:pattern-viewbox-overrides-contentunits` | viewBox overrides patternContentUnits | detail / `at:pattern.viewBox` | broad | jacquard-loom-draft |
| `concept:pattern-with-filter` | Filtered content inside pattern tiles | detail / `el:pattern` | broad | jacquard-loom-draft (via el:pattern), four-colour-press-check (via el:pattern) |
| `concept:pattern-with-gradient` | Gradient-filled content inside pattern | detail / `el:pattern` | broad | jacquard-loom-draft (via el:pattern), four-colour-press-check (via el:pattern) |
| `concept:pattern-with-use` | Pattern tile built from <use> instances | detail / `el:pattern` | broad | jacquard-loom-draft |
| `concept:pattern-zero-size-disabled` | Zero tile size disables the pattern | detail / `at:pattern.width` | broad | jacquard-loom-draft (via at:pattern.width) |
| `concept:premultiplied-transparent-stop` | Transparent stops interpolate premultiplied | detail / `pr:stop-opacity` | broad | auroral-spectrograph |
| `concept:single-or-zero-stop-gradient` | Zero stops = none, one stop = solid | detail / `el:stop` | broad | auroral-spectrograph (via el:stop) |
| `concept:single-stop-gradient-as-solidcolor` | Single-stop gradient as reusable named colour | detail / `el:stop` | broad | auroral-spectrograph (via el:stop) |
| `concept:stop-offset-clamping` | Offset clamping and monotonic ordering | detail / `at:stop.offset` | broad | auroral-spectrograph |
| `concept:zero-length-gradient-vector` | Zero-length vector paints last stop colour | detail / `at:linearGradient.x1` | broad | auroral-spectrograph |
| `css:custom-properties-in-gradients` | CSS custom properties driving stop colours | detail / `css:gradient-stop-selectors` | broad | auroral-spectrograph |
| `css:fill-css-gradient-image` | CSS linear-gradient() as SVG fill | detail / `el:linearGradient` | none | auroral-spectrograph (via el:linearGradient) |
| `css:modern-color-syntax-in-stops` | CSS Color 4 values (oklch, color-mix) in stop-color | detail / `pr:stop-color` | broad | auroral-spectrograph (via pr:stop-color) |
| `css:stop-color-transition` | CSS transitions and animations on stop-color/stop-opacity | detail / `pr:stop-color` | broad | auroral-spectrograph (via pr:stop-color) |
| `el:hatch` | hatch / hatchpath paint server | detail / `concept:hatching-pattern` | none | jacquard-loom-draft (via concept:hatching-pattern) |
| `el:meshgradient` | meshgradient / meshrow / meshpatch (and draft mesh alias) | detail / `concept:mesh-gradient-emulation` | none | mycelium-culture-chamber (via concept:mesh-gradient-emulation) |
| `pv:stop-color=currentcolor` | currentColor in stops | detail / `pr:stop-color` | broad | auroral-spectrograph |

### 文本与排版

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:SVGTextContentElement.getComputedTextLength` | getComputedTextLength | core | broad | museum-label-panel, letterpress-type-specimen |
| `api:SVGTextContentElement.getStartPositionOfChar` | getStartPositionOfChar / getEndPositionOfChar | core | broad | letterpress-type-specimen |
| `at:text.dy` | dy relative vertical shift list | core | broad | stele-rubbing-hall |
| `at:text.rotate` | rotate list per glyph (last value repeats) | core | broad | stele-rubbing-hall |
| `at:text.textLength` | textLength forced advance width | core | broad | letterpress-type-specimen |
| `at:text.x` | x list with per-glyph absolute positions (text/tspan) | core | broad | stele-rubbing-hall |
| `at:textPath.href` | textPath href reference (unprefixed) | core | broad | stele-rubbing-hall |
| `at:textPath.path` | inline path attribute on textPath | core | partial | stele-rubbing-hall |
| `at:textPath.side` | side=right (text on other side of path) | core | partial | stele-rubbing-hall |
| `at:textPath.startOffset` | startOffset as length or percentage | core | broad | stele-rubbing-hall |
| `av:text.lengthAdjust=spacingAndGlyphs` | lengthAdjust spacingAndGlyphs (glyphs scale) | core | broad | letterpress-type-specimen |
| `concept:multiline-text-tspan` | Multi-line text via tspan x reset and dy | core | broad | stele-rubbing-hall |
| `concept:text-as-clip-path` | Text as clip-path or mask content | core | broad | stele-rubbing-hall |
| `concept:text-gradient-fill` | Text filled with a gradient | core | broad | auroral-spectrograph |
| `concept:text-stroke-paint-order` | Stroked text with paint-order stroke | core | broad | letterpress-type-specimen |
| `concept:textpath-closed-path` | Text around a closed circle path | core | broad | stele-rubbing-hall |
| `css:font-face-data-uri` | @font-face with data-URI font embedded in SVG | core | broad | stele-rubbing-hall, letterpress-type-specimen, neon-sign-workshop |
| `el:text` | <text> element | core | broad | stele-rubbing-hall |
| `el:textPath` | <textPath> text along a path | core | broad | stele-rubbing-hall |
| `el:tspan` | <tspan> inline span | core | broad | stele-rubbing-hall |
| `pr:alignment-baseline` | alignment-baseline on tspan | core | partial | stele-rubbing-hall |
| `pr:baseline-shift` | baseline-shift length or percentage | core | broad | stele-rubbing-hall |
| `pr:direction` | direction rtl | core | broad | stele-rubbing-hall |
| `pr:dominant-baseline` | dominant-baseline | core | broad | stele-rubbing-hall |
| `pr:font-family` | font-family and generic fallbacks | core | broad | letterpress-type-specimen |
| `pr:font-feature-settings` | font-feature-settings OpenType features | core | broad | letterpress-type-specimen |
| `pr:font-kerning` | font-kerning none / normal | core | broad | letterpress-type-specimen |
| `pr:font-size` | font-size in user units, em, percent | core | broad | letterpress-type-specimen |
| `pr:font-stretch` | font-stretch condensed / expanded | core | broad | letterpress-type-specimen |
| `pr:font-style` | font-style italic / oblique | core | broad | letterpress-type-specimen |
| `pr:font-variant` | font-variant small-caps | core | broad | letterpress-type-specimen |
| `pr:font-weight` | font-weight keywords and numeric | core | broad | letterpress-type-specimen |
| `pr:letter-spacing` | letter-spacing | core | broad | letterpress-type-specimen |
| `pr:text-anchor` | text-anchor start / middle / end | core | broad | stele-rubbing-hall |
| `pr:text-decoration` | text-decoration underline / overline / line-through | core | broad | letterpress-type-specimen |
| `pr:text-orientation` | text-orientation mixed / upright / sideways | core | broad | stele-rubbing-hall |
| `pr:unicode-bidi` | unicode-bidi embed / bidi-override / isolate | core | broad | stele-rubbing-hall |
| `pr:white-space` | white-space pre on SVG text | core | partial | letterpress-type-specimen |
| `pr:word-spacing` | word-spacing | core | broad | letterpress-type-specimen |
| `pv:writing-mode=vertical-rl` | writing-mode vertical-rl | core | broad | stele-rubbing-hall |
| `api:FontFaceSet.ready` | document.fonts.ready for font-load detection | detail / `css:font-face-data-uri` | broad | letterpress-type-specimen |
| `api:SVGTextContentElement.getCharNumAtPosition` | getCharNumAtPosition hit testing | detail / `api:SVGTextContentElement.getStartPositionOfChar` | broad | letterpress-type-specimen |
| `api:SVGTextContentElement.getExtentOfChar` | getExtentOfChar | detail / `api:SVGTextContentElement.getStartPositionOfChar` | broad | letterpress-type-specimen |
| `api:SVGTextContentElement.getNumberOfChars` | getNumberOfChars | detail / `api:SVGTextContentElement.getComputedTextLength` | broad | letterpress-type-specimen |
| `api:SVGTextContentElement.getRotationOfChar` | getRotationOfChar | detail / `api:SVGTextContentElement.getStartPositionOfChar` | broad | letterpress-type-specimen (via api:SVGTextContentElement.getStartPositionOfChar) |
| `api:SVGTextContentElement.getSubStringLength` | getSubStringLength | detail / `api:SVGTextContentElement.getComputedTextLength` | broad | letterpress-type-specimen |
| `api:SVGTextContentElement.selectSubString` | selectSubString | detail / `api:SVGTextContentElement.getStartPositionOfChar` | deprecated | letterpress-type-specimen (via api:SVGTextContentElement.getStartPositionOfChar) |
| `api:SVGTextPathElement.startOffset` | SVGTextPathElement.startOffset animated length | detail / `at:textPath.startOffset` | broad | stele-rubbing-hall |
| `api:SVGTextPositioningElement.x` | SVGTextPositioningElement x/y/dx/dy/rotate animated lists | detail / `at:text.x` | broad | stele-rubbing-hall |
| `at:text.dx` | dx relative horizontal shift list | detail / `at:text.dy` | broad | stele-rubbing-hall |
| `at:text.lang` | lang / xml:lang driving glyph selection | detail / `pr:font-family` | broad | letterpress-type-specimen (via pr:font-family) |
| `at:text.xml:space` | xml:space=preserve whitespace handling | detail / `pr:white-space` | deprecated | letterpress-type-specimen |
| `at:text.y` | y list with per-glyph absolute baselines | detail / `at:text.x` | broad | stele-rubbing-hall |
| `at:textPath.method` | method align (default rigid glyphs) | detail / `el:textPath` | partial | stele-rubbing-hall (via el:textPath) |
| `at:textPath.spacing` | spacing auto / exact | detail / `el:textPath` | none | stele-rubbing-hall (via el:textPath) |
| `at:textPath.xlink:href` | textPath xlink:href (legacy) | detail / `at:textPath.href` | deprecated | stele-rubbing-hall |
| `av:text.lengthAdjust=spacing` | lengthAdjust spacing (only gaps change, default) | detail / `at:text.textLength` | broad | letterpress-type-specimen |
| `av:textPath.method=stretch` | method=stretch (warp glyph outlines) | detail / `el:textPath` | none | stele-rubbing-hall (via el:textPath) |
| `concept:emoji-color-fonts` | Colour emoji and COLR fonts in SVG text | detail / `pr:font-family` | broad | letterpress-type-specimen (via pr:font-family) |
| `concept:faux-italic-skewx` | Faux italic / oblique text via skewX | detail / `pr:font-style` | broad | letterpress-type-specimen |
| `concept:hollow-outline-text` | Outline-only text (fill none, stroke set) | detail / `concept:text-stroke-paint-order` | broad | letterpress-type-specimen |
| `concept:mixed-script-bidi` | Mixed LTR and RTL runs in one text | detail / `pr:unicode-bidi` | broad | stele-rubbing-hall |
| `concept:nested-tspan-inheritance` | Nested tspans inheriting and overriding styles | detail / `el:tspan` | broad | stele-rubbing-hall |
| `concept:svg-as-image-external-font-blocked` | External fonts blocked in SVG used as <img> | detail / `css:font-face-data-uri` | none | letterpress-type-specimen |
| `concept:text-anchor-rtl-interaction` | text-anchor start follows direction rtl | detail / `pr:text-anchor` | broad | stele-rubbing-hall |
| `concept:text-pattern-fill` | Text filled with a pattern | detail / `concept:text-gradient-fill` | broad | auroral-spectrograph (via concept:text-gradient-fill) |
| `concept:textlength-on-tspan` | textLength applied to a single tspan | detail / `at:text.textLength` | broad | letterpress-type-specimen |
| `concept:textpath-baseline-offset` | Lifting text off the path with dy | detail / `el:textPath` | broad | stele-rubbing-hall (via el:textPath) |
| `concept:textpath-basic-shape-ref` | textPath referencing basic shapes | detail / `at:textPath.href` | partial | stele-rubbing-hall (via at:textPath.href) |
| `concept:textpath-centered-text` | Centred text on path via 50% offset and middle anchor | detail / `at:textPath.startOffset` | broad | stele-rubbing-hall |
| `concept:textpath-multi-subpath` | Text across multiple subpaths | detail / `el:textPath` | broad | stele-rubbing-hall (via el:textPath) |
| `concept:textpath-overflow-clipped` | Glyphs beyond path end are not rendered | detail / `el:textPath` | broad | stele-rubbing-hall |
| `concept:textpath-startoffset-animation` | Animating startOffset to scroll text along path | detail / `at:textPath.startOffset` | broad | stele-rubbing-hall |
| `concept:tspan-absolute-repositioning` | Absolute repositioning mid-run with tspan x/y | detail / `el:tspan` | broad | stele-rubbing-hall |
| `css:pseudo-elements-svg-text` | ::selection / ::first-letter / ::first-line on SVG text | detail / `el:text` | partial | stele-rubbing-hall (via el:text) |
| `css:text-decoration-styling` | text-decoration-style / color / thickness on SVG text | detail / `pr:text-decoration` | partial | letterpress-type-specimen |
| `css:text-shadow-svg-text` | text-shadow on SVG text | detail / `el:text` | partial | stele-rubbing-hall (via el:text) |
| `css:text-transform` | text-transform uppercase on SVG text | detail / `el:text` | broad | stele-rubbing-hall |
| `css:vertical-align-svg-text` | vertical-align shorthand replacing baseline props | detail / `pr:baseline-shift` | none | stele-rubbing-hall (via pr:baseline-shift) |
| `el:altGlyph` | <altGlyph> alternate glyph selection | detail / `el:text` | deprecated | stele-rubbing-hall (via el:text) |
| `el:altGlyphDef` | <altGlyphDef> | detail / `el:text` | deprecated | stele-rubbing-hall (via el:text) |
| `el:altGlyphItem` | <altGlyphItem> | detail / `el:text` | deprecated | stele-rubbing-hall (via el:text) |
| `el:definition-src` | <definition-src> (SVG 1.0) | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:font` | <font> SVG font container | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:font-face` | <font-face> SVG font descriptor | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:font-face-format` | <font-face-format> | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:font-face-name` | <font-face-name> | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:font-face-src` | <font-face-src> | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:font-face-uri` | <font-face-uri> | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:glyph` | <glyph> SVG font glyph | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:glyphRef` | <glyphRef> | detail / `el:text` | deprecated | stele-rubbing-hall (via el:text) |
| `el:hkern` | <hkern> horizontal kerning pair | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:missing-glyph` | <missing-glyph> fallback | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `el:tbreak` | <tbreak> line break (SVG Tiny 1.2) | detail / `concept:multiline-text-tspan` | deprecated | stele-rubbing-hall (via concept:multiline-text-tspan) |
| `el:textArea` | <textArea> wrapped text (SVG Tiny 1.2) | detail / `concept:multiline-text-tspan` | deprecated | stele-rubbing-hall (via concept:multiline-text-tspan) |
| `el:tref` | <tref> text reference | detail / `el:tspan` | deprecated | stele-rubbing-hall (via el:tspan) |
| `el:vkern` | <vkern> vertical kerning pair | detail / `css:font-face-data-uri` | deprecated | stele-rubbing-hall (via css:font-face-data-uri), letterpress-type-specimen (via css:font-face-data-uri), neon-sign-workshop (via css:font-face-data-uri) |
| `pr:font` | font shorthand | detail / `pr:font-family` | broad | letterpress-type-specimen (via pr:font-family) |
| `pr:font-size-adjust` | font-size-adjust x-height matching | detail / `pr:font-size` | broad | letterpress-type-specimen (via pr:font-size) |
| `pr:font-variant-ligatures` | font-variant-ligatures none / common | detail / `pr:font-feature-settings` | broad | letterpress-type-specimen |
| `pr:font-variant-numeric` | font-variant-numeric tabular / oldstyle | detail / `pr:font-feature-settings` | broad | letterpress-type-specimen |
| `pr:font-variation-settings` | font-variation-settings variable axes | detail / `pr:font-weight` | broad | letterpress-type-specimen |
| `pr:font-width` | font-width (font-stretch alias) | detail / `pr:font-stretch` | partial | letterpress-type-specimen (via pr:font-stretch) |
| `pr:glyph-orientation-horizontal` | glyph-orientation-horizontal (legacy) | detail / `pr:text-orientation` | deprecated | stele-rubbing-hall (via pr:text-orientation) |
| `pr:glyph-orientation-vertical` | glyph-orientation-vertical (legacy) | detail / `pr:text-orientation` | deprecated | stele-rubbing-hall (via pr:text-orientation) |
| `pr:inline-size` | inline-size auto line wrapping | detail / `concept:multiline-text-tspan` | none | stele-rubbing-hall (via concept:multiline-text-tspan) |
| `pr:kerning` | kerning property / attribute (legacy) | detail / `pr:font-kerning` | deprecated | letterpress-type-specimen |
| `pr:shape-inside` | shape-inside / shape-subtract / shape-padding text wrapping | detail / `concept:multiline-text-tspan` | none | stele-rubbing-hall (via concept:multiline-text-tspan) |
| `pr:text-decoration-fill` | text-decoration-fill / text-decoration-stroke | detail / `pr:text-decoration` | none | letterpress-type-specimen (via pr:text-decoration) |
| `pr:text-overflow` | text-overflow on SVG text | detail / `el:text` | none | stele-rubbing-hall (via el:text) |
| `pv:baseline-shift=sub` | baseline-shift sub | detail / `pr:baseline-shift` | broad | stele-rubbing-hall |
| `pv:baseline-shift=super` | baseline-shift super | detail / `pr:baseline-shift` | broad | stele-rubbing-hall |
| `pv:dominant-baseline=central` | dominant-baseline central | detail / `pr:dominant-baseline` | broad | stele-rubbing-hall |
| `pv:dominant-baseline=hanging` | dominant-baseline hanging | detail / `pr:dominant-baseline` | broad | stele-rubbing-hall |
| `pv:dominant-baseline=ideographic` | dominant-baseline ideographic / mathematical | detail / `pr:dominant-baseline` | broad | stele-rubbing-hall |
| `pv:dominant-baseline=middle` | dominant-baseline middle | detail / `pr:dominant-baseline` | broad | stele-rubbing-hall |
| `pv:dominant-baseline=text-before-edge` | dominant-baseline text-before-edge / text-after-edge | detail / `pr:dominant-baseline` | deprecated | stele-rubbing-hall (via pr:dominant-baseline) |
| `pv:dominant-baseline=text-top` | dominant-baseline text-top / text-bottom | detail / `pr:dominant-baseline` | partial | stele-rubbing-hall (via pr:dominant-baseline) |
| `pv:text-anchor=end` | text-anchor end | detail / `pr:text-anchor` | broad | stele-rubbing-hall |
| `pv:text-anchor=middle` | text-anchor middle | detail / `pr:text-anchor` | broad | stele-rubbing-hall |
| `pv:text-rendering=geometricPrecision` | text-rendering geometricPrecision | detail / `pr:text-rendering` | broad | letterpress-type-specimen |
| `pv:writing-mode=tb` | legacy writing-mode tb / tb-rl / rl / lr | detail / `pv:writing-mode=vertical-rl` | deprecated | stele-rubbing-hall (via pv:writing-mode=vertical-rl) |
| `pv:writing-mode=vertical-lr` | writing-mode vertical-lr | detail / `pv:writing-mode=vertical-rl` | broad | stele-rubbing-hall |

### 裁剪与遮罩

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:CSSStyleDeclaration.clipPath` | Scripted clip-path via style.clipPath | core | broad | neon-sign-workshop |
| `at:clipPath.clipPathUnits` | clipPathUnits attribute | core | broad | core-sample-stratigraphy |
| `at:clipPath.transform` | transform on clipPath and its children | core | broad | core-sample-stratigraphy |
| `at:mask.maskContentUnits` | maskContentUnits attribute | core | broad | core-sample-stratigraphy |
| `at:mask.maskUnits` | maskUnits attribute | core | broad | core-sample-stratigraphy |
| `at:mask.width` | mask width region size | core | broad | core-sample-stratigraphy |
| `at:mask.x` | mask x region origin | core | broad | core-sample-stratigraphy |
| `av:clipPath.clipPathUnits=objectBoundingBox` | clipPathUnits=objectBoundingBox | core | broad | core-sample-stratigraphy |
| `av:mask.maskContentUnits=objectBoundingBox` | maskContentUnits=objectBoundingBox | core | broad | core-sample-stratigraphy |
| `concept:animated-clippath-reveal` | SMIL-animated clipPath geometry (reveal/wipe) | core | broad | core-sample-stratigraphy |
| `concept:clip-group-vs-children` | Clip applied to a group vs each child | core | broad | core-sample-stratigraphy |
| `concept:clip-path-html-to-svg-reference` | HTML element clipped by an inline SVG clipPath | core | broad | neon-sign-workshop |
| `concept:clip-path-on-clippath-children` | clip-path on individual clipPath children | core | broad | core-sample-stratigraphy |
| `concept:clip-path-shape-transition` | CSS transition/animation between basic shapes | core | broad | neon-sign-workshop |
| `concept:clipped-hit-testing` | Pointer events respect clip-path | core | broad | core-sample-stratigraphy |
| `concept:effect-order-filter-clip-mask-opacity` | Processing order: filter, clip, mask, opacity | core | broad | core-sample-stratigraphy |
| `concept:gradient-feathered-mask` | Gradient-feathered mask edges (soft fade, vignette) | core | broad | core-sample-stratigraphy |
| `concept:mask-html-to-svg-reference` | HTML element masked by an SVG mask element | core | partial | neon-sign-workshop |
| `concept:mask-on-group-vs-element` | Mask on a group vs on each element | core | broad | core-sample-stratigraphy |
| `concept:mask-smil-animation` | SMIL animation inside mask content | core | broad | core-sample-stratigraphy |
| `concept:mask-with-filter` | Filtered mask content (blur feathering) | core | broad | mycelium-culture-chamber |
| `concept:mask-with-image` | Raster or SVG image as mask content | core | broad | mycelium-culture-chamber |
| `concept:mask-with-text` | Text as mask content | core | broad | stele-rubbing-hall |
| `concept:masked-hit-testing` | Pointer events ignore mask transparency | core | broad | core-sample-stratigraphy |
| `concept:nested-clippath` | clip-path on a clipPath element (intersection) | core | broad | core-sample-stratigraphy |
| `concept:text-in-clippath` | text and textPath inside clipPath | core | broad | stele-rubbing-hall |
| `concept:use-in-clippath` | use element inside clipPath | core | broad | core-sample-stratigraphy |
| `css:clip-path-basic-shapes` | clip-path CSS basic shapes on SVG elements | core | broad | neon-sign-workshop |
| `css:clip-path-geometry-box` | clip-path geometry-box keywords (fill-box, stroke-box, view-box) | core | broad | neon-sign-workshop |
| `css:mask-composite` | mask-composite (add, subtract, intersect, exclude) | core | broad | neon-sign-workshop |
| `css:mask-image` | CSS mask shorthand and mask-image on SVG elements | core | broad | neon-sign-workshop |
| `css:mask-layers` | Multi-layer mask shorthand | core | broad | neon-sign-workshop |
| `css:mask-mode` | mask-mode (alpha, luminance, match-source) | core | broad | neon-sign-workshop |
| `css:mask-size` | mask-size | core | broad | neon-sign-workshop |
| `el:clipPath` | clipPath element | core | broad | core-sample-stratigraphy |
| `el:mask` | mask element | core | broad | neon-sign-workshop, core-sample-stratigraphy |
| `pr:clip-path` | clip-path property | core | broad | core-sample-stratigraphy |
| `pr:clip-rule` | clip-rule property | core | broad | core-sample-stratigraphy |
| `pr:mask` | mask property/attribute with url() reference | core | broad | core-sample-stratigraphy |
| `pr:mask-type` | mask-type property (luminance default vs alpha) | core | broad | neon-sign-workshop, core-sample-stratigraphy |
| `api:SVGClipPathElement.clipPathUnits` | SVGClipPathElement animated attributes | detail / `at:clipPath.clipPathUnits` | broad | core-sample-stratigraphy |
| `api:SVGClipPathElement.transform` | SVGClipPathElement.transform animated transform list | detail / `at:clipPath.transform` | broad | core-sample-stratigraphy (via at:clipPath.transform) |
| `api:SVGMaskElement.maskUnits` | SVGMaskElement animated attributes | detail / `at:mask.maskUnits` | broad | core-sample-stratigraphy (via at:mask.maskUnits) |
| `at:mask.height` | mask height region size | detail / `at:mask.width` | broad | core-sample-stratigraphy |
| `at:mask.y` | mask y region origin | detail / `at:mask.x` | broad | core-sample-stratigraphy |
| `av:clipPath.clipPathUnits=userSpaceOnUse` | clipPathUnits=userSpaceOnUse (default) | detail / `at:clipPath.clipPathUnits` | broad | core-sample-stratigraphy |
| `av:mask.maskUnits=userSpaceOnUse` | maskUnits=userSpaceOnUse | detail / `at:mask.maskUnits` | broad | core-sample-stratigraphy |
| `concept:clip-after-blur-via-group` | Reordering effects by wrapping in groups | detail / `concept:effect-order-filter-clip-mask-opacity` | broad | core-sample-stratigraphy |
| `concept:clip-follows-target-transform` | Clip evaluated in target user space | detail / `at:clipPath.transform` | broad | core-sample-stratigraphy |
| `concept:clippath-child-display-none` | display:none and visibility on clipPath children | detail / `el:clipPath` | partial | core-sample-stratigraphy |
| `concept:clippath-disallowed-children` | Ignored clipPath children (g, image, foreignObject) | detail / `el:clipPath` | broad | core-sample-stratigraphy |
| `concept:clippath-ignores-paint` | Clip uses raw geometry, ignores fill, stroke, opacity | detail / `el:clipPath` | broad | core-sample-stratigraphy |
| `concept:clippath-union-of-children` | Union of multiple clipPath children | detail / `el:clipPath` | broad | core-sample-stratigraphy |
| `concept:empty-clippath` | Empty clipPath hides element | detail / `el:clipPath` | broad | core-sample-stratigraphy |
| `concept:external-clip-mask-reference` | clip-path/mask referencing an external SVG file | detail / `pr:clip-path` | partial | core-sample-stratigraphy (via pr:clip-path) |
| `concept:getbbox-ignores-clip` | getBBox and getBoundingClientRect ignore clipping | detail / `concept:clipped-hit-testing` | broad | core-sample-stratigraphy |
| `concept:invalid-clip-reference` | clip-path referencing missing element | detail / `pr:clip-path` | partial | core-sample-stratigraphy |
| `concept:invalid-mask-reference` | mask referencing missing element | detail / `pr:mask` | partial | core-sample-stratigraphy |
| `concept:marker-viewport-clipping` | marker overflow clipping | detail / `pr:overflow` | broad | seismic-drum-console (via pr:overflow) |
| `concept:mask-and-clip-combined` | clip-path and mask on the same element | detail / `concept:effect-order-filter-clip-mask-opacity` | broad | core-sample-stratigraphy |
| `concept:mask-content-opacity` | Opacity and fill-opacity inside mask content | detail / `el:mask` | broad | core-sample-stratigraphy |
| `concept:mask-image-svg-url` | External SVG or raster file as CSS mask-image | detail / `css:mask-image` | broad | neon-sign-workshop |
| `concept:mask-luminance-colorspace` | Luminance coefficients and color-interpolation on masks | detail / `pr:mask-type` | partial | core-sample-stratigraphy |
| `concept:mask-with-pattern` | Pattern-filled mask content (halftone) | detail / `el:mask` | broad | neon-sign-workshop (via el:mask), core-sample-stratigraphy (via el:mask) |
| `concept:nested-mask` | Mask content that is itself masked | detail / `el:mask` | broad | core-sample-stratigraphy |
| `concept:objectboundingbox-zero-bbox-trap` | objectBoundingBox fails on zero-area bounding boxes | detail / `av:clipPath.clipPathUnits=objectBoundingBox` | broad | core-sample-stratigraphy |
| `concept:outer-svg-overflow-in-html` | overflow:visible on inline svg root | detail / `pr:overflow` | broad | seismic-drum-console (via pr:overflow) |
| `concept:overflow-hidden-hit-testing` | Viewport overflow clipping also clips hit-testing | detail / `concept:clipped-hit-testing` | broad | core-sample-stratigraphy (via concept:clipped-hit-testing) |
| `concept:pattern-tile-clipping` | pattern tiles clip content to the tile | detail / `pr:overflow` | partial | seismic-drum-console (via pr:overflow) |
| `concept:symbol-viewport-clipping` | symbol instances clip to their viewport | detail / `pr:overflow` | broad | seismic-drum-console (via pr:overflow) |
| `css:mask-border` | mask-border on SVG elements | detail / `css:mask-image` | none | neon-sign-workshop (via css:mask-image) |
| `css:mask-clip` | mask-clip geometry boxes on SVG | detail / `css:mask-image` | partial | neon-sign-workshop (via css:mask-image) |
| `css:mask-origin` | mask-origin geometry boxes on SVG | detail / `css:mask-image` | partial | neon-sign-workshop (via css:mask-image) |
| `css:mask-position` | mask-position | detail / `css:mask-size` | broad | neon-sign-workshop (via css:mask-size) |
| `css:mask-repeat` | mask-repeat | detail / `css:mask-size` | broad | neon-sign-workshop |
| `pr:clip` | clip property with rect() on viewports (deprecated) | detail / `pr:clip-path` | deprecated | core-sample-stratigraphy (via pr:clip-path) |
| `pv:clip-path=border-box` | CSS box keywords (content-box, padding-box, border-box, margin-box) on SVG | detail / `css:clip-path-geometry-box` | broad | neon-sign-workshop (via css:clip-path-geometry-box) |
| `pv:clip-path=circle()` | clip-path: circle() basic shape | detail / `css:clip-path-basic-shapes` | broad | neon-sign-workshop |
| `pv:clip-path=ellipse()` | clip-path: ellipse() basic shape | detail / `css:clip-path-basic-shapes` | broad | neon-sign-workshop |
| `pv:clip-path=fill-box` | clip-path geometry-box: fill-box | detail / `css:clip-path-geometry-box` | broad | neon-sign-workshop |
| `pv:clip-path=inset()` | clip-path: inset() basic shape | detail / `css:clip-path-basic-shapes` | broad | neon-sign-workshop |
| `pv:clip-path=none` | clip-path: none reset | detail / `pr:clip-path` | broad | core-sample-stratigraphy |
| `pv:clip-path=path()` | clip-path: path() basic shape | detail / `css:clip-path-basic-shapes` | broad | neon-sign-workshop |
| `pv:clip-path=polygon()` | clip-path: polygon() basic shape | detail / `css:clip-path-basic-shapes` | broad | neon-sign-workshop |
| `pv:clip-path=rect()` | clip-path: rect() and xywh() shapes | detail / `css:clip-path-basic-shapes` | broad | neon-sign-workshop |
| `pv:clip-path=shape()` | clip-path: shape() function | detail / `css:clip-path-basic-shapes` | partial | neon-sign-workshop (via css:clip-path-basic-shapes) |
| `pv:clip-path=stroke-box` | clip-path geometry-box: stroke-box | detail / `css:clip-path-geometry-box` | broad | neon-sign-workshop |
| `pv:clip-path=view-box` | clip-path geometry-box: view-box | detail / `css:clip-path-geometry-box` | broad | neon-sign-workshop |
| `pv:clip-rule=evenodd` | clip-rule=evenodd | detail / `pr:clip-rule` | broad | core-sample-stratigraphy |
| `pv:mask-type=alpha` | mask-type=alpha | detail / `pr:mask-type` | broad | core-sample-stratigraphy |
| `pv:mask-type=luminance` | mask-type=luminance (default) | detail / `pr:mask-type` | broad | core-sample-stratigraphy |

### 标记 (marker)

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:SVGMarkerElement.setOrientToAuto` | SVGMarkerElement.setOrientToAuto | core | broad | pipeline-mimic-board |
| `at:marker.markerUnits` | markerUnits | core | broad | pipeline-mimic-board |
| `at:marker.markerWidth` | markerWidth / markerHeight viewport size | core | broad | pipeline-mimic-board |
| `at:marker.orient` | orient | core | broad | pipeline-mimic-board |
| `at:marker.preserveAspectRatio` | marker preserveAspectRatio | core | broad | pipeline-mimic-board |
| `at:marker.refX` | refX anchor point | core | broad | pipeline-mimic-board |
| `at:marker.refY` | refY anchor point | core | broad | pipeline-mimic-board |
| `at:marker.viewBox` | marker viewBox | core | broad | pipeline-mimic-board |
| `av:marker.markerUnits=userSpaceOnUse` | markerUnits userSpaceOnUse (fixed size) | core | broad | pipeline-mimic-board |
| `av:marker.orient=angle` | orient fixed angle (number, deg, rad, grad) | core | broad | pipeline-mimic-board |
| `av:marker.orient=auto` | orient auto (follow path direction) | core | broad | pipeline-mimic-board |
| `av:marker.orient=auto-start-reverse` | orient auto-start-reverse | core | broad | pipeline-mimic-board |
| `concept:marker-arrowhead` | arrowhead technique | core | broad | pipeline-mimic-board |
| `concept:marker-closed-path-direction` | closed subpath orientation at the closing vertex | core | broad | pipeline-mimic-board |
| `concept:marker-css-state-swap` | swap marker via :hover or class change | core | broad | pipeline-mimic-board |
| `concept:marker-dimension-ticks` | dimension line ticks perpendicular to the line | core | broad | pipeline-mimic-board |
| `concept:marker-graph-nodes` | graph edges with node glyphs and arrowheads | core | broad | pipeline-mimic-board |
| `concept:marker-non-scaling-stroke` | markers under vector-effect non-scaling-stroke | core | broad | pipeline-mimic-board |
| `concept:marker-smil-attribute-animation` | SMIL animation of refX, orient, markerWidth | core | broad | pipeline-mimic-board |
| `concept:marker-transform-inheritance` | markers inherit the referencing element's transform (incl. skew) | core | broad | pipeline-mimic-board |
| `concept:marker-vertex-bisector` | mid-marker direction is the bisector of adjacent segments | core | broad | pipeline-mimic-board |
| `concept:marker-vertex-glyphs` | vertex glyphs on polylines (data points) | core | broad | pipeline-mimic-board |
| `concept:marker-vs-symbol` | marker versus symbol/use trade-offs | core | broad | pipeline-mimic-board |
| `el:marker` | marker element | core | broad | pipeline-mimic-board |
| `pr:marker` | marker shorthand (CSS only) | core | broad | pipeline-mimic-board |
| `pr:marker-end` | marker-end | core | broad | pipeline-mimic-board |
| `pr:marker-mid` | marker-mid | core | broad | pipeline-mimic-board |
| `pr:marker-start` | marker-start | core | broad | pipeline-mimic-board |
| `api:CSSStyleDeclaration.markerEnd` | style.markerEnd / markerStart / markerMid | detail / `pr:marker-end` | broad | pipeline-mimic-board |
| `api:SVGBoundingBoxOptions.markers` | getBBox({markers:true}) | detail / `el:marker` | partial | pipeline-mimic-board |
| `api:SVGMarkerElement.markerUnits` | SVGMarkerElement.markerUnits animated enumeration | detail / `api:SVGMarkerElement.setOrientToAuto` | broad | pipeline-mimic-board |
| `api:SVGMarkerElement.orientType` | orientType / orientAngle animated properties | detail / `api:SVGMarkerElement.setOrientToAuto` | broad | pipeline-mimic-board |
| `api:SVGMarkerElement.refX` | refX/refY/markerWidth/markerHeight as SVGAnimatedLength | detail / `api:SVGMarkerElement.setOrientToAuto` | broad | pipeline-mimic-board |
| `api:SVGMarkerElement.setOrientToAngle` | SVGMarkerElement.setOrientToAngle | detail / `api:SVGMarkerElement.setOrientToAuto` | broad | pipeline-mimic-board |
| `api:SVGMarkerElement.viewBox` | SVGFitToViewBox on marker (viewBox, preserveAspectRatio) | detail / `api:SVGMarkerElement.setOrientToAuto` | broad | pipeline-mimic-board |
| `at:marker.markerHeight` | markerHeight | detail / `at:marker.markerWidth` | broad | pipeline-mimic-board |
| `at:marker.position` | marker position attribute (draft) | detail / `pr:marker-mid` | none | pipeline-mimic-board (via pr:marker-mid) |
| `at:marker.transform` | transform on marker element | detail / `el:marker` | none | pipeline-mimic-board (via el:marker) |
| `av:marker.markerUnits=strokeWidth` | markerUnits strokeWidth (default, scales with stroke) | detail / `at:marker.markerUnits` | broad | pipeline-mimic-board (via at:marker.markerUnits) |
| `av:marker.markerWidth=0` | markerWidth or markerHeight zero disables marker | detail / `at:marker.markerWidth` | broad | pipeline-mimic-board |
| `av:marker.preserveAspectRatio=none` | non-uniform stretch of marker content | detail / `at:marker.preserveAspectRatio` | broad | pipeline-mimic-board |
| `av:marker.refX=center` | refX/refY keywords left\|center\|right, top\|center\|bottom | detail / `at:marker.refX` | none | pipeline-mimic-board |
| `concept:context-paint-gradient` | context-stroke referencing a gradient/pattern | detail / `pv:fill=context-stroke` | partial | pipeline-mimic-board |
| `concept:marker-animated-content` | animated content inside a marker | detail / `concept:marker-smil-attribute-animation` | broad | pipeline-mimic-board |
| `concept:marker-base-href-pitfall` | markers vanish with base href or routed URLs | detail / `pr:marker-end` | broad | pipeline-mimic-board (via pr:marker-end) |
| `concept:marker-content-paint-servers` | gradients, patterns and filters inside marker content | detail / `el:marker` | broad | pipeline-mimic-board |
| `concept:marker-currentcolor` | currentColor inside marker content follows the marker's own color | detail / `pv:fill=context-stroke` | broad | pipeline-mimic-board |
| `concept:marker-curve-tangent` | orientation on curves uses the tangent | detail / `av:marker.orient=auto` | broad | pipeline-mimic-board |
| `concept:marker-dashed-stroke` | markers on dashed strokes ignore dash gaps | detail / `pr:marker-mid` | broad | pipeline-mimic-board |
| `concept:marker-display-ua-style` | marker element is never rendered directly | detail / `el:marker` | broad | pipeline-mimic-board |
| `concept:marker-element-effects` | opacity, filter, clip-path, mask on host apply to markers | detail / `el:marker` | broad | pipeline-mimic-board (via el:marker) |
| `concept:marker-external-reference` | marker referenced from an external SVG file | detail / `el:marker` | partial | pipeline-mimic-board (via el:marker) |
| `concept:marker-follows-animated-path` | markers track an animated path d or points | detail / `concept:marker-smil-attribute-animation` | broad | pipeline-mimic-board |
| `concept:marker-ignores-display` | display none on marker or its ancestors does not disable it | detail / `el:marker` | broad | pipeline-mimic-board (via el:marker) |
| `concept:marker-pointer-events` | markers are not hit-testable | detail / `concept:marker-vs-symbol` | broad | pipeline-mimic-board |
| `concept:marker-property-inheritance` | marker properties inherit to descendant shapes | detail / `pr:marker` | broad | pipeline-mimic-board |
| `concept:marker-reverse-arrow-fallback` | reversed start arrow without auto-start-reverse | detail / `av:marker.orient=auto-start-reverse` | broad | pipeline-mimic-board |
| `concept:marker-shared-defs-across-inline-svg` | marker defined in one inline svg used by another | detail / `el:marker` | broad | pipeline-mimic-board (via el:marker) |
| `concept:marker-style-isolation` | marker content inherits from the marker's ancestors, not the host shape | detail / `el:marker` | broad | pipeline-mimic-board |
| `concept:marker-subpath-vertices` | start/end only at path ends, mid at subpath starts | detail / `pr:marker-mid` | broad | pipeline-mimic-board |
| `concept:marker-text-content` | text inside marker content | detail / `el:marker` | broad | pipeline-mimic-board |
| `concept:marker-without-stroke` | markers render even when stroke is none | detail / `at:marker.markerUnits` | broad | pipeline-mimic-board |
| `concept:marker-zero-length-direction` | direction with zero-length segments or coincident control points | detail / `concept:marker-vertex-bisector` | partial | pipeline-mimic-board |
| `concept:markers-on-basic-shapes` | SVG 2 markers on rect, circle, ellipse | detail / `el:marker` | none | pipeline-mimic-board |
| `concept:nested-markers` | marker content that itself uses markers | detail / `el:marker` | partial | pipeline-mimic-board |
| `css:marker-properties` | marker properties from external/embedded CSS | detail / `pr:marker` | broad | pipeline-mimic-board |
| `pr:marker-knockout-left` | marker-knockout-left / marker-knockout-right | detail / `pv:paint-order=markers` | none | pipeline-mimic-board |
| `pr:marker-pattern` | marker-pattern (repeating markers along path) | detail / `pr:marker-mid` | none | pipeline-mimic-board (via pr:marker-mid) |
| `pr:marker-segment` | marker-segment (per-segment midpoint marker) | detail / `pr:marker-mid` | none | pipeline-mimic-board (via pr:marker-mid) |
| `pv:marker=none` | marker none reset | detail / `pr:marker` | broad | pipeline-mimic-board |
| `pv:stroke=context-fill` | stroke context-fill | detail / `pv:fill=context-fill` | broad | pipeline-mimic-board |

### 滤镜：区域、连线、合成与颜色原语

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `at:feGaussianBlur.stdDeviation` | stdDeviation blur radius | core | broad | neon-sign-workshop |
| `at:filter.filterUnits` | filterUnits | core | broad | four-colour-press-check |
| `at:filter.primitiveUnits` | primitiveUnits | core | broad | mycelium-culture-chamber |
| `at:filter.x` | filter region x/y/width/height | core | broad | four-colour-press-check |
| `av:feColorMatrix.type=luminanceToAlpha` | feColorMatrix luminanceToAlpha | core | broad | core-sample-stratigraphy |
| `av:feComposite.operator=arithmetic` | feComposite arithmetic with k1..k4 | core | broad | four-colour-press-check |
| `av:feGaussianBlur.in=SourceAlpha` | SourceAlpha keyword | core | broad | core-sample-stratigraphy |
| `av:feGaussianBlur.stdDeviation=two-values` | Anisotropic blur with two stdDeviation values | core | broad | forge-metallography-bench |
| `av:feImage.href=#element` | feImage href to an in-document element (#id) | core | partial | jacquard-loom-draft |
| `concept:classic-drop-shadow-chain` | SourceAlpha + blur + offset + merge shadow chain | core | broad | neon-sign-workshop |
| `concept:duotone-via-component-transfer` | Duotone/false-colour by greyscale plus per-channel tables | core | broad | four-colour-press-check |
| `concept:filter-input-wiring` | in / in2 / result wiring between primitives | core | broad | four-colour-press-check, neon-sign-workshop |
| `concept:filter-on-group-vs-children` | Filter on a group composites children first | core | broad | mycelium-culture-chamber |
| `concept:filter-on-text` | Filter effects on text | core | broad | letterpress-type-specimen |
| `concept:filter-primitive-subregion` | Per-primitive subregion x/y/width/height | core | broad | four-colour-press-check |
| `concept:inner-shadow-technique` | Inner shadow via SourceAlpha out compositing | core | broad | neon-sign-workshop |
| `concept:outline-stroke-via-alpha-dilate` | Outline/halo via blurred alpha thresholded then flooded | core | broad | neon-sign-workshop |
| `concept:text-background-box-via-flood` | Text label background box via feFlood+feMerge | core | broad | letterpress-type-specimen |
| `css:filter-chaining` | Chaining several filters: filter: url(#a) url(#b) blur(2px) | core | broad | neon-sign-workshop |
| `css:filter-functions-on-svg` | CSS filter functions (blur, drop-shadow, grayscale, hue-rotate...) on SVG elements | core | broad | neon-sign-workshop |
| `css:svg-filter-on-html-element` | SVG filter applied to HTML elements and the outermost svg via filter:url(#id) | core | broad | neon-sign-workshop |
| `el:feBlend` | feBlend | core | broad | four-colour-press-check |
| `el:feColorMatrix` | feColorMatrix | core | broad | four-colour-press-check |
| `el:feComponentTransfer` | feComponentTransfer per-channel remap | core | broad | four-colour-press-check, neon-sign-workshop |
| `el:feComposite` | feComposite Porter-Duff compositing | core | broad | four-colour-press-check |
| `el:feDropShadow` | feDropShadow single-primitive shadow | core | broad | neon-sign-workshop |
| `el:feFlood` | feFlood solid color fill | core | broad | letterpress-type-specimen |
| `el:feFuncA` | feFuncA alpha channel function | core | broad | four-colour-press-check |
| `el:feFuncB` | feFuncB blue channel function | core | broad | four-colour-press-check |
| `el:feFuncG` | feFuncG green channel function | core | broad | four-colour-press-check |
| `el:feFuncR` | feFuncR red channel function | core | broad | four-colour-press-check |
| `el:feGaussianBlur` | feGaussianBlur | core | broad | neon-sign-workshop |
| `el:feImage` | feImage external/data-URI image input | core | broad | jacquard-loom-draft |
| `el:feMerge` | feMerge stacking | core | broad | four-colour-press-check |
| `el:feMergeNode` | feMergeNode layer order | core | broad | four-colour-press-check |
| `el:feOffset` | feOffset translation | core | broad | neon-sign-workshop |
| `el:feTile` | feTile repeating an input subregion | core | broad | jacquard-loom-draft |
| `el:filter` | filter element | core | broad | four-colour-press-check |
| `pr:color-interpolation-filters` | color-interpolation-filters (linearRGB default vs sRGB) | core | broad | four-colour-press-check, neon-sign-workshop |
| `pr:filter` | filter presentation property (attribute or CSS url()) | core | broad | four-colour-press-check |
| `pr:flood-color` | flood-color (feFlood and feDropShadow) | core | broad | letterpress-type-specimen |
| `pr:flood-opacity` | flood-opacity | core | broad | letterpress-type-specimen |
| `api:CSS.supports-filter` | CSS.supports('filter','url(#x)') feature detection | detail / `pr:filter` | broad | four-colour-press-check |
| `api:SVGComponentTransferFunctionElement.tableValues` | feFunc* type/tableValues/slope/intercept/amplitude/exponent/offset DOM access | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `api:SVGFEBlendElement.mode` | SVGFEBlendElement.mode with SVG_FEBLEND_MODE_* constants | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `api:SVGFEColorMatrixElement.values` | SVGFEColorMatrixElement.values SVGAnimatedNumberList | detail / `el:feColorMatrix` | broad | four-colour-press-check |
| `api:SVGFECompositeElement.k1` | SVGFECompositeElement k1..k4 animated numbers | detail / `av:feComposite.operator=arithmetic` | broad | four-colour-press-check (via av:feComposite.operator=arithmetic) |
| `api:SVGFEDropShadowElement.setStdDeviation` | SVGFEDropShadowElement.setStdDeviation | detail / `el:feDropShadow` | broad | neon-sign-workshop (via el:feDropShadow) |
| `api:SVGFEGaussianBlurElement.setStdDeviation` | SVGFEGaussianBlurElement.setStdDeviation(x, y) | detail / `el:feGaussianBlur` | broad | neon-sign-workshop |
| `api:SVGFilterElement.filterUnits` | SVGFilterElement animated attribute access (filterUnits, x, width...) | detail / `el:filter` | broad | four-colour-press-check (via el:filter) |
| `api:SVGFilterPrimitiveStandardAttributes.result` | Primitive x/y/width/height/result animated attributes | detail / `concept:filter-input-wiring` | broad | four-colour-press-check |
| `at:feBlend.in2` | in2 second input (feBlend, feComposite, feDisplacementMap) | detail / `concept:filter-input-wiring` | broad | four-colour-press-check |
| `at:feBlend.mode` | feBlend mode | detail / `el:feBlend` | broad | four-colour-press-check |
| `at:feColorMatrix.type` | feColorMatrix type | detail / `el:feColorMatrix` | broad | four-colour-press-check |
| `at:feColorMatrix.values` | feColorMatrix values | detail / `el:feColorMatrix` | broad | four-colour-press-check |
| `at:feComposite.k1` | feComposite k1/k2/k3/k4 | detail / `av:feComposite.operator=arithmetic` | broad | four-colour-press-check |
| `at:feComposite.operator` | feComposite operator | detail / `el:feComposite` | broad | four-colour-press-check |
| `at:feDropShadow.dx` | feDropShadow dx/dy/stdDeviation | detail / `el:feDropShadow` | broad | neon-sign-workshop |
| `at:feFuncR.amplitude` | amplitude | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `at:feFuncR.exponent` | exponent | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `at:feFuncR.intercept` | intercept | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `at:feFuncR.offset` | offset (gamma transfer) | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `at:feFuncR.slope` | slope | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `at:feFuncR.tableValues` | tableValues | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `at:feFuncR.type` | transfer function type (all feFunc*) | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `at:feGaussianBlur.edgeMode` | edgeMode on feGaussianBlur (none/duplicate/wrap) | detail / `el:feGaussianBlur` | none | neon-sign-workshop (via el:feGaussianBlur) |
| `at:feImage.crossorigin` | feImage crossorigin | detail / `el:feImage` | partial | jacquard-loom-draft (via el:feImage) |
| `at:feImage.href` | feImage href (SVG 2 unprefixed) | detail / `el:feImage` | broad | jacquard-loom-draft |
| `at:feImage.preserveAspectRatio` | feImage preserveAspectRatio | detail / `el:feImage` | broad | jacquard-loom-draft (via el:feImage) |
| `at:feImage.x` | feImage x/y/width/height placement | detail / `el:feImage` | broad | jacquard-loom-draft (via el:feImage) |
| `at:feImage.xlink:href` | feImage xlink:href | detail / `el:feImage` | deprecated | jacquard-loom-draft (via el:feImage) |
| `at:feMergeNode.in` | feMergeNode in | detail / `el:feMergeNode` | broad | four-colour-press-check |
| `at:feOffset.dx` | feOffset dx/dy (including negative and fractional) | detail / `el:feOffset` | broad | neon-sign-workshop |
| `at:filter.filterRes` | filterRes intermediate resolution | detail / `el:filter` | deprecated | four-colour-press-check (via el:filter) |
| `at:filter.href` | filter href inheritance from another filter | detail / `el:filter` | deprecated | four-colour-press-check (via el:filter) |
| `av:feBlend.mode=color` | feBlend color | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=color-burn` | feBlend color-burn | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=color-dodge` | feBlend color-dodge | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=darken` | feBlend darken | detail / `el:feBlend` | broad | four-colour-press-check |
| `av:feBlend.mode=difference` | feBlend difference | detail / `el:feBlend` | broad | four-colour-press-check |
| `av:feBlend.mode=exclusion` | feBlend exclusion | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=hard-light` | feBlend hard-light | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=hue` | feBlend hue | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=lighten` | feBlend lighten | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=luminosity` | feBlend luminosity | detail / `el:feBlend` | broad | four-colour-press-check |
| `av:feBlend.mode=multiply` | feBlend multiply | detail / `el:feBlend` | broad | four-colour-press-check |
| `av:feBlend.mode=normal` | feBlend normal | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=overlay` | feBlend overlay | detail / `el:feBlend` | broad | four-colour-press-check |
| `av:feBlend.mode=saturation` | feBlend saturation | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feBlend.mode=screen` | feBlend screen | detail / `el:feBlend` | broad | four-colour-press-check |
| `av:feBlend.mode=soft-light` | feBlend soft-light | detail / `el:feBlend` | broad | four-colour-press-check (via el:feBlend) |
| `av:feColorMatrix.type=hueRotate` | feColorMatrix hueRotate | detail / `el:feColorMatrix` | broad | four-colour-press-check |
| `av:feColorMatrix.type=matrix` | feColorMatrix matrix (4x5 values) | detail / `el:feColorMatrix` | broad | four-colour-press-check |
| `av:feColorMatrix.type=saturate` | feColorMatrix saturate | detail / `el:feColorMatrix` | broad | four-colour-press-check |
| `av:feComposite.operator=atop` | feComposite atop | detail / `el:feComposite` | broad | four-colour-press-check |
| `av:feComposite.operator=in` | feComposite in | detail / `el:feComposite` | broad | four-colour-press-check |
| `av:feComposite.operator=lighter` | feComposite lighter (additive) | detail / `el:feComposite` | partial | four-colour-press-check |
| `av:feComposite.operator=out` | feComposite out | detail / `el:feComposite` | broad | four-colour-press-check |
| `av:feComposite.operator=over` | feComposite over (default) | detail / `el:feComposite` | broad | four-colour-press-check |
| `av:feComposite.operator=xor` | feComposite xor | detail / `el:feComposite` | broad | four-colour-press-check |
| `av:feFuncR.type=discrete` | transfer type discrete (posterize) | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `av:feFuncR.type=gamma` | transfer type gamma with amplitude/exponent/offset | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `av:feFuncR.type=identity` | transfer type identity | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `av:feFuncR.type=linear` | transfer type linear with slope/intercept | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `av:feFuncR.type=table` | transfer type table with tableValues | detail / `el:feComponentTransfer` | broad | four-colour-press-check |
| `av:feGaussianBlur.in=BackgroundAlpha` | BackgroundAlpha keyword | detail / `concept:filter-input-wiring` | deprecated | four-colour-press-check (via concept:filter-input-wiring), neon-sign-workshop (via concept:filter-input-wiring) |
| `av:feGaussianBlur.in=BackgroundImage` | BackgroundImage keyword | detail / `concept:filter-input-wiring` | deprecated | four-colour-press-check (via concept:filter-input-wiring), neon-sign-workshop (via concept:filter-input-wiring) |
| `av:feGaussianBlur.in=FillPaint` | FillPaint keyword | detail / `concept:filter-input-wiring` | deprecated | four-colour-press-check (via concept:filter-input-wiring), neon-sign-workshop (via concept:filter-input-wiring) |
| `av:feGaussianBlur.in=SourceGraphic` | SourceGraphic keyword | detail / `concept:filter-input-wiring` | broad | four-colour-press-check |
| `av:feGaussianBlur.in=StrokePaint` | StrokePaint keyword | detail / `concept:filter-input-wiring` | deprecated | four-colour-press-check (via concept:filter-input-wiring), neon-sign-workshop (via concept:filter-input-wiring) |
| `av:feGaussianBlur.stdDeviation=0` | stdDeviation 0 pass-through | detail / `at:feGaussianBlur.stdDeviation` | broad | neon-sign-workshop |
| `av:filter.filterUnits=objectBoundingBox` | filterUnits objectBoundingBox (default) | detail / `at:filter.filterUnits` | broad | four-colour-press-check |
| `av:filter.filterUnits=userSpaceOnUse` | filterUnits userSpaceOnUse | detail / `at:filter.filterUnits` | broad | four-colour-press-check |
| `av:filter.primitiveUnits=objectBoundingBox` | primitiveUnits objectBoundingBox | detail / `at:filter.primitiveUnits` | broad | mycelium-culture-chamber |
| `av:filter.primitiveUnits=userSpaceOnUse` | primitiveUnits userSpaceOnUse (default) | detail / `at:filter.primitiveUnits` | broad | mycelium-culture-chamber |
| `concept:arithmetic-alpha-threshold` | Arithmetic compositing to boost or threshold alpha | detail / `av:feComposite.operator=arithmetic` | broad | four-colour-press-check (via av:feComposite.operator=arithmetic) |
| `concept:fetile-subregion-pattern` | feTile requires an explicit input subregion | detail / `el:feTile` | broad | jacquard-loom-draft |
| `concept:filter-and-transform` | Filter is applied in user space before the element's transform | detail / `el:filter` | broad | four-colour-press-check |
| `concept:filter-clip-mask-opacity-order` | Order: filter, then clip-path, then mask, then opacity | detail / `el:filter` | broad | four-colour-press-check |
| `concept:filter-on-empty-group` | Filter on empty or invisible group renders nothing in objectBoundingBox mode | detail / `at:filter.filterUnits` | broad | four-colour-press-check (via at:filter.filterUnits) |
| `concept:filter-on-zero-bbox-element` | objectBoundingBox filter vanishes on zero-width/height bbox | detail / `at:filter.filterUnits` | broad | four-colour-press-check (via at:filter.filterUnits) |
| `concept:filter-region-clipping-trap` | Filter region clipping of shadows and blur | detail / `at:filter.x` | broad | four-colour-press-check |
| `concept:filter-region-css-units` | filter x/y/width/height accept percentages and user units | detail / `at:filter.x` | broad | four-colour-press-check (via at:filter.x) |
| `concept:filter-region-default` | Default filter region -10%/-10%/120%/120% | detail / `at:filter.x` | broad | four-colour-press-check |
| `concept:flood-fills-filter-region` | feFlood fills the entire filter region | detail / `el:feFlood` | broad | letterpress-type-specimen |
| `concept:implicit-chaining` | Implicit chaining when in is omitted | detail / `concept:filter-input-wiring` | broad | four-colour-press-check |
| `concept:last-primitive-is-output` | Filter output is the last primitive | detail / `concept:filter-input-wiring` | broad | four-colour-press-check |
| `concept:multiple-results-fan-out` | Fan-out: one result feeding several primitives | detail / `concept:filter-input-wiring` | broad | four-colour-press-check |
| `concept:nested-filtered-elements` | Filtered element inside a filtered group | detail / `concept:filter-on-group-vs-children` | broad | mycelium-culture-chamber (via concept:filter-on-group-vs-children) |
| `concept:premultiplied-alpha-in-colormatrix` | Colour primitives operate on un-premultiplied values; alpha row affects edges | detail / `el:feColorMatrix` | broad | four-colour-press-check |
| `concept:primitive-subregion-defaults` | Default primitive subregion: union of inputs vs full filter region | detail / `concept:filter-primitive-subregion` | partial | four-colour-press-check |
| `concept:reuse-filter-across-elements` | One filter definition shared by many elements | detail / `el:filter` | broad | four-colour-press-check |
| `concept:subregion-crop-technique` | Using a primitive subregion as a crop | detail / `concept:filter-primitive-subregion` | broad | four-colour-press-check |
| `css:custom-properties-in-filter` | CSS custom properties driving flood-color or filter | detail / `pr:flood-color` | broad | letterpress-type-specimen |
| `css:filter-transition` | CSS transitions/animations of filter functions | detail / `css:filter-functions-on-svg` | broad | neon-sign-workshop |
| `css:filter-url-external-file` | filter: url(external.svg#id) | detail / `pr:filter` | partial | four-colour-press-check (via pr:filter) |
| `css:flood-color-transition` | CSS transition of flood-color/flood-opacity | detail / `pr:flood-color` | broad | letterpress-type-specimen |
| `pv:color-interpolation-filters=linearRGB` | color-interpolation-filters: linearRGB (default) | detail / `pr:color-interpolation-filters` | broad | four-colour-press-check |
| `pv:color-interpolation-filters=sRGB` | color-interpolation-filters: sRGB | detail / `pr:color-interpolation-filters` | broad | four-colour-press-check |
| `pv:filter=none` | filter: none override | detail / `pr:filter` | broad | four-colour-press-check |
| `pv:flood-color=currentColor` | flood-color: currentColor | detail / `pr:flood-color` | broad | letterpress-type-specimen |

### 滤镜：卷积、形态学、噪声、置换与光照

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `at:feConvolveMatrix.edgeMode` | edgeMode border handling | core | broad | forge-metallography-bench |
| `at:feConvolveMatrix.kernelMatrix` | kernelMatrix weights | core | broad | forge-metallography-bench |
| `at:feConvolveMatrix.order` | Kernel order (size), incl. non-square | core | broad | forge-metallography-bench |
| `at:feDiffuseLighting.surfaceScale` | surfaceScale height | core | broad | forge-metallography-bench |
| `at:feDisplacementMap.in2` | in2 map source | core | broad | mycelium-culture-chamber |
| `at:feDisplacementMap.scale` | scale magnitude | core | broad | mycelium-culture-chamber |
| `at:feDisplacementMap.xChannelSelector` | xChannelSelector R/G/B/A | core | broad | mycelium-culture-chamber |
| `at:feDistantLight.azimuth` | azimuth angle | core | broad | forge-metallography-bench |
| `at:feMorphology.operator` | operator erode / dilate | core | broad | neon-sign-workshop |
| `at:feMorphology.radius` | radius with two values (anisotropic) | core | broad | neon-sign-workshop |
| `at:fePointLight.z` | Point light z height | core | broad | forge-metallography-bench |
| `at:feSpecularLighting.specularExponent` | specularExponent shininess | core | broad | forge-metallography-bench |
| `at:feSpotLight.limitingConeAngle` | limitingConeAngle hard cutoff | core | broad | forge-metallography-bench |
| `at:feSpotLight.pointsAtX` | pointsAtX/Y/Z aim target | core | broad | forge-metallography-bench |
| `at:feTurbulence.baseFrequency` | baseFrequency (one or two values) | core | broad | mycelium-culture-chamber |
| `at:feTurbulence.numOctaves` | numOctaves detail layers | core | broad | mycelium-culture-chamber |
| `at:feTurbulence.stitchTiles` | stitchTiles seamless tiling | core | broad | jacquard-loom-draft |
| `at:feTurbulence.type` | type turbulence vs fractalNoise | core | broad | mycelium-culture-chamber |
| `concept:animated-light-source` | Animated light position / angle | core | broad | forge-metallography-bench |
| `concept:animated-turbulence` | Animated noise (baseFrequency/seed) | core | broad | mycelium-culture-chamber |
| `concept:brushed-metal-texture` | Brushed metal texture | core | broad | forge-metallography-bench |
| `concept:chrome-metal-effect` | Chrome / polished metal text | core | broad | forge-metallography-bench |
| `concept:convolve-edge-detect` | Edge detection (Laplacian / Sobel) | core | broad | forge-metallography-bench |
| `concept:convolve-emboss` | Emboss recipe | core | broad | forge-metallography-bench |
| `concept:convolve-sharpen` | Sharpen / unsharp kernel | core | broad | forge-metallography-bench |
| `concept:filter-device-pixel-resolution` | Filter rasterised at device pixels | core | broad | four-colour-press-check |
| `concept:glass-refraction-effect` | Glass / frosted refraction recipe | core | broad | mycelium-culture-chamber |
| `concept:halftone-dots` | Halftone dot screen | core | broad | four-colour-press-check |
| `concept:heat-shimmer-animation` | Heat shimmer / mirage | core | broad | mycelium-culture-chamber |
| `concept:lighting-alpha-bump-map` | Alpha channel as height map | core | broad | forge-metallography-bench |
| `concept:liquid-distortion-effect` | Liquid / gooey distortion | core | broad | mycelium-culture-chamber |
| `concept:morphology-outline-stroke` | Outline via dilate minus source | core | broad | neon-sign-workshop |
| `concept:neon-glow-morphology` | Neon glow via dilate + blur | core | broad | neon-sign-workshop |
| `concept:paper-grain-texture` | Paper grain / film grain overlay | core | broad | mycelium-culture-chamber |
| `concept:watercolor-bleed-effect` | Watercolor bleed edges | core | broad | mycelium-culture-chamber |
| `el:feConvolveMatrix` | feConvolveMatrix primitive | core | broad | forge-metallography-bench |
| `el:feDiffuseLighting` | feDiffuseLighting primitive | core | broad | forge-metallography-bench |
| `el:feDisplacementMap` | feDisplacementMap primitive | core | broad | mycelium-culture-chamber |
| `el:feDistantLight` | feDistantLight source | core | broad | forge-metallography-bench |
| `el:feMorphology` | feMorphology primitive | core | broad | neon-sign-workshop |
| `el:fePointLight` | fePointLight source | core | broad | forge-metallography-bench |
| `el:feSpecularLighting` | feSpecularLighting primitive | core | broad | forge-metallography-bench |
| `el:feSpotLight` | feSpotLight source | core | broad | forge-metallography-bench |
| `el:feTurbulence` | feTurbulence primitive | core | broad | mycelium-culture-chamber |
| `pr:lighting-color` | lighting-color property | core | broad | forge-metallography-bench |
| `api:SVGFEConvolveMatrixElement.kernelMatrix` | Scripted kernelMatrix (SVGAnimatedNumberList) | detail / `at:feConvolveMatrix.kernelMatrix` | broad | forge-metallography-bench |
| `api:SVGFEDisplacementMapElement.scale` | Scripted displacement scale | detail / `at:feDisplacementMap.scale` | broad | mycelium-culture-chamber (via at:feDisplacementMap.scale) |
| `api:SVGFEDistantLightElement.azimuth` | Scripted distant light angle | detail / `at:feDistantLight.azimuth` | broad | forge-metallography-bench |
| `api:SVGFEMorphologyElement.radiusX` | Scripted morphology radius | detail / `at:feMorphology.radius` | broad | neon-sign-workshop |
| `api:SVGFEPointLightElement.x` | Scripted point light position | detail / `concept:animated-light-source` | broad | forge-metallography-bench |
| `api:SVGFESpotLightElement.pointsAtX` | Scripted spotlight aim | detail / `concept:animated-light-source` | broad | forge-metallography-bench |
| `api:SVGFETurbulenceElement.baseFrequencyX` | Scripted baseFrequency animation | detail / `concept:animated-turbulence` | broad | mycelium-culture-chamber |
| `api:SVGFETurbulenceElement.seed` | Scripted seed re-roll | detail / `concept:animated-turbulence` | broad | mycelium-culture-chamber (via concept:animated-turbulence) |
| `at:feConvolveMatrix.bias` | bias offset | detail / `at:feConvolveMatrix.kernelMatrix` | partial | forge-metallography-bench |
| `at:feConvolveMatrix.divisor` | divisor normalisation | detail / `at:feConvolveMatrix.kernelMatrix` | broad | forge-metallography-bench |
| `at:feConvolveMatrix.kernelUnitLength` | kernelUnitLength (convolution) | detail / `el:feConvolveMatrix` | none | forge-metallography-bench (via el:feConvolveMatrix) |
| `at:feConvolveMatrix.preserveAlpha` | preserveAlpha true/false | detail / `el:feConvolveMatrix` | broad | forge-metallography-bench |
| `at:feConvolveMatrix.targetX` | targetX kernel anchor | detail / `at:feConvolveMatrix.order` | broad | forge-metallography-bench |
| `at:feConvolveMatrix.targetY` | targetY kernel anchor | detail / `at:feConvolveMatrix.order` | broad | forge-metallography-bench (via at:feConvolveMatrix.order) |
| `at:feDiffuseLighting.diffuseConstant` | diffuseConstant | detail / `el:feDiffuseLighting` | broad | forge-metallography-bench |
| `at:feDiffuseLighting.kernelUnitLength` | kernelUnitLength (lighting) | detail / `el:feDiffuseLighting` | none | forge-metallography-bench (via el:feDiffuseLighting) |
| `at:feDisplacementMap.yChannelSelector` | yChannelSelector R/G/B/A | detail / `at:feDisplacementMap.xChannelSelector` | broad | mycelium-culture-chamber |
| `at:feDistantLight.elevation` | elevation angle | detail / `at:feDistantLight.azimuth` | broad | forge-metallography-bench |
| `at:fePointLight.x` | Point light x position | detail / `el:fePointLight` | broad | forge-metallography-bench |
| `at:fePointLight.y` | Point light y position | detail / `el:fePointLight` | broad | forge-metallography-bench |
| `at:feSpecularLighting.specularConstant` | specularConstant | detail / `el:feSpecularLighting` | broad | forge-metallography-bench |
| `at:feSpecularLighting.surfaceScale` | surfaceScale (specular) | detail / `at:feDiffuseLighting.surfaceScale` | broad | forge-metallography-bench |
| `at:feSpotLight.pointsAtY` | pointsAtY | detail / `at:feSpotLight.pointsAtX` | broad | forge-metallography-bench |
| `at:feSpotLight.pointsAtZ` | pointsAtZ | detail / `at:feSpotLight.pointsAtX` | broad | forge-metallography-bench |
| `at:feSpotLight.specularExponent` | Spot focus exponent | detail / `el:feSpotLight` | broad | forge-metallography-bench |
| `at:feSpotLight.x` | Spot light x/y position | detail / `el:feSpotLight` | broad | forge-metallography-bench |
| `at:feSpotLight.z` | Spot light z height | detail / `el:feSpotLight` | broad | forge-metallography-bench |
| `at:feTurbulence.seed` | seed | detail / `el:feTurbulence` | broad | mycelium-culture-chamber |
| `av:feConvolveMatrix.edgeMode=duplicate` | edgeMode duplicate (default) | detail / `at:feConvolveMatrix.edgeMode` | broad | forge-metallography-bench |
| `av:feConvolveMatrix.edgeMode=none` | edgeMode none | detail / `at:feConvolveMatrix.edgeMode` | broad | forge-metallography-bench |
| `av:feConvolveMatrix.edgeMode=wrap` | edgeMode wrap | detail / `at:feConvolveMatrix.edgeMode` | broad | forge-metallography-bench |
| `av:feDisplacementMap.xChannelSelector=A` | Alpha channel as displacement (default) | detail / `at:feDisplacementMap.xChannelSelector` | broad | mycelium-culture-chamber |
| `av:feMorphology.operator=dilate` | operator dilate | detail / `at:feMorphology.operator` | broad | neon-sign-workshop |
| `av:feMorphology.operator=erode` | operator erode (default) | detail / `at:feMorphology.operator` | broad | neon-sign-workshop |
| `av:feTurbulence.stitchTiles=noStitch` | stitchTiles noStitch (default) | detail / `at:feTurbulence.stitchTiles` | broad | jacquard-loom-draft |
| `av:feTurbulence.type=fractalNoise` | type fractalNoise | detail / `at:feTurbulence.type` | broad | mycelium-culture-chamber |
| `av:feTurbulence.type=turbulence` | type turbulence (default) | detail / `at:feTurbulence.type` | broad | mycelium-culture-chamber |
| `concept:cloud-smoke-texture` | Clouds / smoke from fractalNoise | detail / `at:feTurbulence.type` | broad | mycelium-culture-chamber |
| `concept:convolve-box-blur` | Box / motion blur via kernel | detail / `at:feConvolveMatrix.order` | broad | forge-metallography-bench |
| `concept:diffuse-output-opaque` | Diffuse result is opaque; re-mask with SourceAlpha | detail / `el:feDiffuseLighting` | broad | forge-metallography-bench |
| `concept:displacement-color-space-caveat` | Displacement map read in linearRGB by default | detail / `el:feDisplacementMap` | broad | mycelium-culture-chamber (via el:feDisplacementMap) |
| `concept:displacement-filter-region-overflow` | Displaced pixels clipped by filter region | detail / `at:feDisplacementMap.scale` | broad | mycelium-culture-chamber |
| `concept:displacement-gradient-lens` | Gradient-driven lens / ripple | detail / `at:feDisplacementMap.in2` | broad | mycelium-culture-chamber |
| `concept:filter-effects-primitives-unchanged` | Advanced primitives carried unchanged into Filter Effects / CSS filter() | detail / `el:feTurbulence` | broad | mycelium-culture-chamber (via el:feTurbulence) |
| `concept:filter-performance-caveats` | Performance of heavy primitives | detail / `concept:filter-device-pixel-resolution` | broad | four-colour-press-check |
| `concept:lighting-plus-turbulence-bump` | Lighting a noise bump map | detail / `concept:lighting-alpha-bump-map` | broad | forge-metallography-bench (via concept:lighting-alpha-bump-map) |
| `concept:morphology-thicken-text` | Faux-bold / thin text | detail / `at:feMorphology.operator` | broad | neon-sign-workshop |
| `concept:morphology-zero-radius` | Zero / negative radius behaviour | detail / `at:feMorphology.radius` | partial | neon-sign-workshop |
| `concept:primitive-units-lighting-coordinates` | primitiveUnits objectBoundingBox with lights | detail / `el:fePointLight` | partial | forge-metallography-bench |
| `concept:rough-sketch-edges` | Hand-drawn rough edges | detail / `el:feDisplacementMap` | broad | mycelium-culture-chamber (via el:feDisplacementMap) |
| `concept:single-light-source-child` | Exactly one light-source child per lighting primitive | detail / `el:feDiffuseLighting` | broad | forge-metallography-bench |
| `concept:smil-animate-displacement-scale` | Animating displacement scale | detail / `at:feDisplacementMap.scale` | broad | mycelium-culture-chamber |
| `concept:smil-animate-morphology-radius` | Animating morphology radius | detail / `at:feMorphology.radius` | broad | neon-sign-workshop |
| `concept:specular-composite-add` | Adding specular result to source | detail / `el:feSpecularLighting` | broad | forge-metallography-bench |
| `concept:turbulence-color-channels` | Independent RGBA noise channels | detail / `el:feTurbulence` | broad | mycelium-culture-chamber (via el:feTurbulence) |
| `concept:turbulence-fills-filter-region` | Turbulence has no input; fills subregion | detail / `el:feTurbulence` | broad | mycelium-culture-chamber |
| `concept:turbulence-linearrgb-darkening` | Noise brightness vs color-interpolation-filters | detail / `el:feTurbulence` | broad | mycelium-culture-chamber (via el:feTurbulence) |
| `concept:turbulence-zoom-stability` | Noise granularity under zoom / DPR | detail / `concept:filter-device-pixel-resolution` | partial | four-colour-press-check (via concept:filter-device-pixel-resolution) |
| `concept:wood-marble-texture` | Wood grain / marble veins | detail / `at:feTurbulence.baseFrequency` | broad | mycelium-culture-chamber |

### SMIL 动画

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:SVGAnimationElement.beginElement` | beginElement() scripted start/restart | core | broad | escapement-chronometer |
| `api:SVGSVGElement.pauseAnimations` | pauseAnimations() | core | broad | escapement-chronometer |
| `api:SVGSVGElement.setCurrentTime` | setCurrentTime() timeline scrubbing | core | broad | escapement-chronometer |
| `at:animate.begin` | begin attribute (start time list) | core | broad | escapement-chronometer |
| `at:animate.by` | by relative delta animation | core | broad | mycelium-culture-chamber |
| `at:animate.dur` | dur simple duration | core | broad | escapement-chronometer |
| `at:animate.end` | end attribute (event, syncbase or offset) | core | broad | escapement-chronometer |
| `at:animate.from` | from/to pair | core | broad | core-sample-stratigraphy |
| `at:animate.href` | href targeting a non-parent element | core | broad | escapement-chronometer |
| `at:animate.keySplines` | keySplines cubic-Bezier easing per segment | core | broad | escapement-chronometer |
| `at:animate.keyTimes` | keyTimes pacing of values | core | broad | escapement-chronometer |
| `at:animate.repeatCount` | repeatCount (number or indefinite) | core | broad | escapement-chronometer |
| `at:animate.restart` | restart (always / whenNotActive / never) | core | broad | escapement-chronometer |
| `at:animate.values` | values list (multi-keyframe) | core | broad | auroral-spectrograph |
| `at:animateMotion.keyPoints` | animateMotion keyPoints with keyTimes | core | broad | escapement-chronometer |
| `at:animateMotion.path` | animateMotion inline path attribute | core | broad | escapement-chronometer |
| `av:animate.accumulate=sum` | accumulate sum across repeats | core | broad | mycelium-culture-chamber |
| `av:animate.additive=sum` | additive sum on attribute animations | core | broad | escapement-chronometer |
| `av:animate.begin=event` | event-based begin (click, mouseover, focusin, id.event) | core | broad | escapement-chronometer |
| `av:animate.begin=indefinite` | begin indefinite (script-only start) | core | broad | escapement-chronometer |
| `av:animate.begin=syncbase` | syncbase begin id.begin / id.end + offset | core | broad | escapement-chronometer |
| `av:animate.calcMode=discrete` | calcMode discrete (frame flipping) | core | broad | escapement-chronometer |
| `av:animate.calcMode=paced` | calcMode paced (constant velocity) | core | broad | forge-metallography-bench |
| `av:animate.fill=freeze` | fill freeze (hold end value) | core | broad | core-sample-stratigraphy |
| `av:animateMotion.rotate=auto` | animateMotion rotate auto | core | broad | escapement-chronometer |
| `av:animateTransform.additive=sum` | stacked animateTransforms with additive=sum | core | broad | escapement-chronometer |
| `av:animateTransform.type=rotate` | animateTransform type rotate (angle cx cy) | core | broad | escapement-chronometer |
| `concept:animate-color` | colour interpolation of fill/stroke/stop-color | core | broad | auroral-spectrograph |
| `concept:animate-filter-basefrequency` | animating feTurbulence baseFrequency | core | broad | mycelium-culture-chamber |
| `concept:animate-filter-stddeviation` | animating feGaussianBlur stdDeviation | core | broad | neon-sign-workshop |
| `concept:animate-gradient-stop` | animating gradient stops and vector | core | broad | auroral-spectrograph |
| `concept:animate-in-use-shadow-tree` | animations inside use-instanced content | core | partial | celestial-astrolabe-cabinet |
| `concept:animate-path-d-morph` | path d morphing with matching commands | core | broad | ship-lofting-floor |
| `concept:animate-text-attributes` | animating text x/dx/rotate/font-size/textLength/startOffset | core | broad | stele-rubbing-hall |
| `concept:animate-use-href` | animating href of use (symbol swap) | core | broad | celestial-astrolabe-cabinet |
| `concept:animate-viewbox` | animating viewBox (camera pan/zoom) | core | broad | celestial-astrolabe-cabinet |
| `concept:smil-2026-support-status` | SMIL browser support status 2026 | core | broad | escapement-chronometer |
| `concept:smil-events` | beginEvent / endEvent / repeatEvent DOM events | core | broad | escapement-chronometer |
| `el:animate` | animate element | core | broad | escapement-chronometer |
| `el:animateMotion` | animateMotion element | core | broad | escapement-chronometer |
| `el:animateTransform` | animateTransform element | core | broad | escapement-chronometer |
| `el:discard` | discard element (remove element at time) | core | partial | escapement-chronometer |
| `el:mpath` | mpath (reference an existing path for motion) | core | broad | escapement-chronometer |
| `el:set` | set element (discrete value switch) | core | broad | escapement-chronometer |
| `api:SVGAnimatedLength.animVal` | animVal vs baseVal while animating | detail / `el:animate` | broad | escapement-chronometer |
| `api:SVGAnimationElement.beginElementAt` | beginElementAt(offset) | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer |
| `api:SVGAnimationElement.endElement` | endElement() scripted stop | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer |
| `api:SVGAnimationElement.getCurrentTime` | SVGAnimationElement.getCurrentTime() | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer |
| `api:SVGAnimationElement.getSimpleDuration` | getSimpleDuration() | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer |
| `api:SVGAnimationElement.getStartTime` | getStartTime() | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer |
| `api:SVGAnimationElement.targetElement` | targetElement property | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer |
| `api:SVGSVGElement.animationsPaused` | animationsPaused() | detail / `api:SVGSVGElement.pauseAnimations` | broad | escapement-chronometer |
| `api:SVGSVGElement.getCurrentTime` | SVGSVGElement.getCurrentTime() document time | detail / `api:SVGSVGElement.setCurrentTime` | broad | escapement-chronometer |
| `api:SVGSVGElement.unpauseAnimations` | unpauseAnimations() | detail / `api:SVGSVGElement.pauseAnimations` | broad | escapement-chronometer |
| `api:TimeEvent` | TimeEvent interface (detail) | detail / `concept:smil-events` | deprecated | escapement-chronometer |
| `at:animate.attributeName` | attributeName target attribute/property | detail / `el:animate` | broad | escapement-chronometer |
| `at:animate.attributeType` | attributeType CSS / XML / auto | detail / `el:animate` | deprecated | escapement-chronometer |
| `at:animate.max` | max active duration | detail / `at:animate.dur` | partial | escapement-chronometer (via at:animate.dur) |
| `at:animate.min` | min active duration | detail / `at:animate.dur` | partial | escapement-chronometer (via at:animate.dur) |
| `at:animate.onbegin` | onbegin/onend/onrepeat event attributes | detail / `concept:smil-events` | broad | escapement-chronometer |
| `at:animate.repeatDur` | repeatDur total repeat time | detail / `at:animate.repeatCount` | broad | escapement-chronometer |
| `at:animate.to` | to-only animation (blend from base value) | detail / `at:animate.from` | broad | core-sample-stratigraphy |
| `at:animateMotion.origin` | animateMotion origin attribute | detail / `el:animateMotion` | none | escapement-chronometer (via el:animateMotion) |
| `at:animateTransform.type` | animateTransform type selector | detail / `el:animateTransform` | broad | escapement-chronometer |
| `at:discard.begin` | discard begin time | detail / `el:discard` | partial | escapement-chronometer |
| `at:discard.href` | discard href target | detail / `el:discard` | partial | escapement-chronometer |
| `at:mpath.href` | mpath href | detail / `el:mpath` | broad | escapement-chronometer |
| `at:set.to` | set to value | detail / `el:set` | broad | escapement-chronometer |
| `at:svg.timelinebegin` | timelinebegin | detail / `api:SVGSVGElement.setCurrentTime` | none | escapement-chronometer (via api:SVGSVGElement.setCurrentTime) |
| `av:animate.begin=accessKey` | accessKey(key) begin | detail / `at:animate.begin` | partial | escapement-chronometer (via at:animate.begin) |
| `av:animate.begin=negative-offset` | negative begin offset (start mid-way) | detail / `at:animate.begin` | broad | escapement-chronometer (via at:animate.begin) |
| `av:animate.begin=offset` | begin clock-value offset | detail / `at:animate.begin` | broad | escapement-chronometer |
| `av:animate.begin=repeat` | syncbase on repeat iteration id.repeat(n) | detail / `at:animate.begin` | partial | escapement-chronometer |
| `av:animate.begin=wallclock` | wallclock() begin | detail / `at:animate.begin` | none | escapement-chronometer (via at:animate.begin) |
| `av:animate.calcMode=linear` | calcMode linear (default) | detail / `at:animate.values` | broad | auroral-spectrograph (via at:animate.values) |
| `av:animate.calcMode=spline` | calcMode spline | detail / `at:animate.keySplines` | broad | escapement-chronometer |
| `av:animate.dur=media` | dur media | detail / `at:animate.dur` | none | escapement-chronometer (via at:animate.dur) |
| `av:animate.fill=remove` | fill remove (default snap-back) | detail / `av:animate.fill=freeze` | broad | core-sample-stratigraphy |
| `av:animate.repeatCount=indefinite` | repeatCount indefinite | detail / `at:animate.repeatCount` | broad | escapement-chronometer |
| `av:animate.restart=never` | restart never | detail / `at:animate.restart` | broad | escapement-chronometer |
| `av:animate.restart=whenNotActive` | restart whenNotActive | detail / `at:animate.restart` | broad | escapement-chronometer |
| `av:animateMotion.rotate=angle` | animateMotion fixed rotate angle | detail / `av:animateMotion.rotate=auto` | broad | escapement-chronometer (via av:animateMotion.rotate=auto) |
| `av:animateMotion.rotate=auto-reverse` | animateMotion rotate auto-reverse | detail / `av:animateMotion.rotate=auto` | broad | escapement-chronometer |
| `av:animateTransform.accumulate=sum` | animateTransform accumulate across repeats | detail / `av:animate.accumulate=sum` | broad | mycelium-culture-chamber (via av:animate.accumulate=sum) |
| `av:animateTransform.type=scale` | animateTransform type scale | detail / `el:animateTransform` | broad | escapement-chronometer (via el:animateTransform) |
| `av:animateTransform.type=skewX` | animateTransform type skewX | detail / `el:animateTransform` | broad | escapement-chronometer (via el:animateTransform) |
| `av:animateTransform.type=skewY` | animateTransform type skewY | detail / `el:animateTransform` | broad | escapement-chronometer (via el:animateTransform) |
| `av:animateTransform.type=translate` | animateTransform type translate | detail / `el:animateTransform` | broad | escapement-chronometer (via el:animateTransform) |
| `concept:animate-light-position` | animating fePointLight/feSpotLight x y z | detail / `concept:animate-filter-stddeviation` | broad | neon-sign-workshop (via concept:animate-filter-stddeviation) |
| `concept:animate-path-d-mismatch-discrete` | d command mismatch falls back to discrete | detail / `concept:animate-path-d-morph` | broad | ship-lofting-floor |
| `concept:animate-points` | animating polygon/polyline points | detail / `concept:animate-path-d-morph` | broad | ship-lofting-floor (via concept:animate-path-d-morph) |
| `concept:animate-transform-requires-animatetransform` | animate on transform is ignored; animateTransform required | detail / `el:animateTransform` | broad | escapement-chronometer |
| `concept:animatemotion-paced-default` | animateMotion defaults to calcMode paced | detail / `av:animate.calcMode=paced` | broad | forge-metallography-bench (via av:animate.calcMode=paced) |
| `concept:animatemotion-transform-stacking` | motion transform composed after the transform attribute | detail / `el:animateMotion` | broad | escapement-chronometer |
| `concept:animatemotion-values-coordinates` | animateMotion via from/to/values coordinate pairs | detail / `el:animateMotion` | broad | escapement-chronometer (via el:animateMotion) |
| `concept:animatetransform-base-transform-preserved` | additive=sum keeps the static transform attribute | detail / `av:animateTransform.additive=sum` | broad | escapement-chronometer |
| `concept:animation-sandwich-priority` | animation sandwich model (later animation wins) | detail / `av:animate.additive=sum` | broad | escapement-chronometer |
| `concept:dynamic-animate-insertion` | script-inserted animation elements start running | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer (via api:SVGAnimationElement.beginElement) |
| `concept:multiple-begin-values` | semicolon-separated begin list | detail / `at:animate.begin` | broad | escapement-chronometer |
| `concept:set-visibility-toggle` | set on visibility/display to show or hide at a time | detail / `el:set` | broad | escapement-chronometer |
| `concept:smil-in-img` | SMIL runs inside img and CSS background | detail / `concept:smil-2026-support-status` | broad | escapement-chronometer (via concept:smil-2026-support-status) |
| `concept:smil-in-resource-documents` | animations do not run in resource documents | detail / `concept:smil-2026-support-status` | broad | escapement-chronometer (via concept:smil-2026-support-status) |
| `concept:smil-overrides-css` | SMIL animated value beats author CSS | detail / `el:animate` | partial | escapement-chronometer |
| `concept:view-element-animations` | animation elements inside view | detail / `at:animate.begin` | none | escapement-chronometer (via at:animate.begin) |
| `el:animateColor` | animateColor element | detail / `concept:animate-color` | deprecated | auroral-spectrograph (via concept:animate-color) |
| `el:animation` | nested SVG animation element (SVG Tiny 1.2) | detail / `el:animate` | deprecated | escapement-chronometer (via el:animate) |
| `el:prefetch` | prefetch resource element (SVG Tiny 1.2) | detail / `el:animate` | deprecated | escapement-chronometer (via el:animate) |

### CSS 动画、CSS 变换与脚本 API

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:DOMMatrix` | DOMMatrix construction and multiplication | core | broad | seismic-drum-console |
| `api:DOMPoint.matrixTransform` | DOMPoint.matrixTransform | core | broad | seismic-drum-console |
| `api:Element.animate` | Web Animations API on SVG elements | core | broad | seismic-drum-console |
| `api:IntersectionObserver.observe` | IntersectionObserver with SVG elements | core | broad | seismic-drum-console |
| `api:ResizeObserver.observe` | ResizeObserver on SVG elements | core | broad | seismic-drum-console |
| `api:SVGAnimatedRect.baseVal` | viewBox.baseVal scripted pan and zoom | core | broad | seismic-drum-console |
| `api:SVGElement.dataset` | dataset and data-* attributes on SVG elements | core | broad | seismic-drum-console |
| `api:SVGGraphicsElement.getCTM` | getCTM | core | broad | seismic-drum-console |
| `api:SVGGraphicsElement.getScreenCTM` | getScreenCTM | core | broad | ship-lofting-floor, guilloche-intaglio-plate, four-colour-press-check, seismic-drum-console |
| `api:SVGSVGElement.checkIntersection` | checkIntersection / checkEnclosure | core | partial | seismic-drum-console |
| `api:SVGTransformList` | transform.baseVal SVGTransformList manipulation | core | broad | seismic-drum-console |
| `api:Window.getComputedStyle` | Reading computed paint values | core | broad | letterpress-type-specimen |
| `api:Window.requestAnimationFrame` | requestAnimationFrame-driven attribute updates | core | broad | ship-lofting-floor, seismic-drum-console |
| `concept:pointer-to-user-space` | Mapping pointer coordinates to SVG user space | core | broad | seismic-drum-console |
| `concept:presentation-attribute-cascade` | Presentation attribute vs CSS cascade precedence | core | broad | letterpress-type-specimen |
| `concept:svg-script-security-context` | Script execution context of embedded SVG | core | broad | museum-label-panel |
| `concept:svg-to-canvas-rasterization` | Serialize SVG and draw to canvas / export PNG | core | broad | museum-label-panel |
| `css:3d-transforms` | 3D transform functions on SVG elements | core | partial | guilloche-intaglio-plate |
| `css:animation-timeline-scroll` | Scroll-driven animations on SVG | core | partial | seismic-drum-console |
| `css:geometry-properties` | Geometry attributes as CSS properties (x, y, width, height, cx, cy, r, rx, ry) | core | partial | ship-lofting-floor |
| `css:keyframes-on-svg` | CSS @keyframes on SVG presentation properties | core | broad | letterpress-type-specimen |
| `css:keyframes-paint-animation` | CSS keyframe animation of fill, stroke, opacity, dashoffset | core | broad | letterpress-type-specimen |
| `css:presentation-attribute-specificity` | Presentation attributes lose to any CSS rule | core | broad | museum-label-panel, letterpress-type-specimen |
| `css:transitions` | CSS transitions on SVG presentation properties | core | broad | letterpress-type-specimen |
| `pr:offset-distance` | offset-distance | core | broad | seismic-drum-console |
| `pr:offset-path` | offset-path: path() motion path | core | broad | seismic-drum-console |
| `pr:offset-rotate` | offset-rotate auto / reverse / angle | core | broad | seismic-drum-console |
| `pr:rotate` | Individual transform properties rotate / scale / translate | core | broad | guilloche-intaglio-plate |
| `pr:transform` | CSS transform property on SVG elements | core | broad | guilloche-intaglio-plate |
| `pr:transform-box` | transform-box reference box | core | broad | guilloche-intaglio-plate |
| `pr:transform-origin` | transform-origin on SVG | core | broad | guilloche-intaglio-plate |
| `api:Animation.playbackRate` | Animation object control (pause, reverse, playbackRate, currentTime) | detail / `api:Element.animate` | broad | seismic-drum-console |
| `api:CSSStyleDeclaration.fill` | Setting paint via element.style | detail / `css:presentation-attribute-specificity` | broad | letterpress-type-specimen |
| `api:Document.getAnimations` | document.getAnimations / element.getAnimations | detail / `api:Element.animate` | broad | seismic-drum-console |
| `api:Element.classList` | classList on SVG elements | detail / `api:SVGAnimatedLength.baseVal` | broad | ship-lofting-floor |
| `api:Element.getBoundingClientRect` | getBoundingClientRect on SVG elements | detail / `api:SVGGraphicsElement.getBBox` | broad | letterpress-type-specimen (via api:SVGGraphicsElement.getBBox) |
| `api:ElementCSSInlineStyle.style` | el.style inline property writes on SVG elements | detail / `api:Window.getComputedStyle` | broad | letterpress-type-specimen (via api:Window.getComputedStyle) |
| `api:SVGAnimatedString.baseVal` | href.baseVal / className.baseVal | detail / `api:SVGAnimatedLength.baseVal` | broad | ship-lofting-floor |
| `api:SVGAnimationElement.onbegin` | beginEvent / endEvent / repeatEvent listeners | detail / `api:SVGAnimationElement.beginElement` | broad | escapement-chronometer |
| `api:SVGBoundingBoxOptions.stroke` | getBBox with SVGBoundingBoxOptions (fill/stroke/markers/clipped) | detail / `api:SVGGraphicsElement.getBBox` | partial | letterpress-type-specimen |
| `api:SVGElement.getPresentationAttribute` | getPresentationAttribute, SVGPaint, SVGColor removed | detail / `api:Window.getComputedStyle` | deprecated | letterpress-type-specimen |
| `api:SVGElementInstance` | SVGElementInstance / SVGElementInstanceList removed | detail / `el:script` | deprecated | mycelium-culture-chamber (via el:script) |
| `api:SVGGraphicsElement.getTransformToElement` | getTransformToElement removed | detail / `api:SVGGraphicsElement.getCTM` | deprecated | seismic-drum-console (via api:SVGGraphicsElement.getCTM) |
| `api:SVGGraphicsElement.nearestViewportElement` | nearestViewportElement / farthestViewportElement | detail / `api:SVGGraphicsElement.getCTM` | deprecated | seismic-drum-console |
| `api:SVGLength.convertToSpecifiedUnits` | SVGLength unit conversion | detail / `api:SVGAnimatedLength.baseVal` | broad | ship-lofting-floor |
| `api:SVGMatrix` | SVGMatrix / SVGPoint / SVGRect legacy interfaces | detail / `api:DOMMatrix` | deprecated | seismic-drum-console |
| `api:SVGSVGElement.createSVGPoint` | createSVGPoint / createSVGMatrix / createSVGLength legacy factories | detail / `api:DOMPoint.matrixTransform` | broad | seismic-drum-console |
| `api:SVGSVGElement.createSVGRect` | createSVGRect | detail / `api:SVGSVGElement.checkIntersection` | broad | seismic-drum-console |
| `api:SVGSVGElement.createSVGTransformFromMatrix` | createSVGTransform / createSVGTransformFromMatrix | detail / `api:SVGTransformList` | broad | seismic-drum-console |
| `api:SVGSVGElement.currentView` | currentView / useCurrentView / SVGViewSpec / pixelUnitToMillimeterX | detail / `api:SVGSVGElement.currentScale` | deprecated | seismic-drum-console (via api:SVGSVGElement.currentScale) |
| `api:SVGSVGElement.suspendRedraw` | suspendRedraw / unsuspendRedraw / forceRedraw / deselectAll | detail / `api:Window.requestAnimationFrame` | deprecated | ship-lofting-floor (via api:Window.requestAnimationFrame), seismic-drum-console (via api:Window.requestAnimationFrame) |
| `api:SVGTransform.setRotate` | SVGTransform setRotate / setTranslate / setScale / setMatrix | detail / `api:SVGTransformList` | broad | seismic-drum-console |
| `api:SVGUnknownElement` | SVGUnknownElement interface | detail / `api:Document.createElementNS` | none | mycelium-culture-chamber |
| `api:SVGZoomEvent` | SVGZoomEvent removed | detail / `api:SVGSVGElement.currentScale` | deprecated | seismic-drum-console (via api:SVGSVGElement.currentScale) |
| `at:script.crossorigin` | script crossorigin | detail / `el:script` | broad | mycelium-culture-chamber (via el:script) |
| `at:style.type` | style element type | detail / `el:style` | broad | letterpress-type-specimen |
| `at:svg.contentStyleType` | contentStyleType | detail / `el:style` | deprecated | letterpress-type-specimen (via el:style) |
| `av:script.type=module` | module scripts in SVG | detail / `el:script` | partial | mycelium-culture-chamber (via el:script) |
| `concept:animation-in-img-context` | CSS/SMIL animations run inside img but scripts do not | detail / `concept:svg-script-security-context` | broad | museum-label-panel |
| `concept:cross-document-svg-scripting` | Scripting an embedded SVG via contentDocument | detail / `concept:svg-script-security-context` | broad | museum-label-panel |
| `concept:getbbox-unrendered-element` | getBBox on display:none or detached elements | detail / `api:SVGGraphicsElement.getBBox` | broad | letterpress-type-specimen (via api:SVGGraphicsElement.getBBox) |
| `concept:innerhtml-svg-parsing` | innerHTML / insertAdjacentHTML inside an svg element | detail / `api:Document.createElementNS` | broad | mycelium-culture-chamber (via api:Document.createElementNS) |
| `concept:presentation-attributes-any-element` | Presentation attributes allowed on any SVG element | detail / `concept:presentation-attribute-cascade` | broad | letterpress-type-specimen (via concept:presentation-attribute-cascade) |
| `concept:transform-attribute-css-syntax` | CSS unit syntax inside transform attribute | detail / `pr:transform` | partial | guilloche-intaglio-plate |
| `concept:waapi-non-css-attribute-animation` | WAAPI cannot animate non-CSS SVG attributes | detail / `api:Element.animate` | none | seismic-drum-console |
| `concept:xlink-namespace-setattribute` | setAttributeNS with the xlink namespace for href | detail / `api:Document.createElementNS` | deprecated | mycelium-culture-chamber (via api:Document.createElementNS) |
| `css:animating-stop-color` | CSS animation of gradient stops inside defs | detail / `css:keyframes-on-svg` | broad | letterpress-type-specimen (via css:keyframes-on-svg) |
| `css:animation-composition` | animation-composition add / accumulate | detail / `css:keyframes-on-svg` | broad | letterpress-type-specimen (via css:keyframes-on-svg) |
| `css:hover-fill-transition` | :hover state with fill/stroke transition | detail / `css:keyframes-paint-animation` | broad | letterpress-type-specimen (via css:keyframes-paint-animation) |
| `css:property-registered-animation` | @property registered custom property animation | detail / `css:custom-properties` | broad | museum-label-panel |
| `css:starting-style` | @starting-style entry transitions | detail / `css:transitions` | broad | letterpress-type-specimen (via css:transitions) |
| `css:transition-behavior-allow-discrete` | transition-behavior: allow-discrete | detail / `css:transitions` | broad | letterpress-type-specimen (via css:transitions) |
| `pr:offset-anchor` | offset-anchor | detail / `pr:offset-path` | broad | seismic-drum-console (via pr:offset-path) |
| `pr:offset-position` | offset-position | detail / `pr:offset-path` | partial | seismic-drum-console (via pr:offset-path) |
| `pr:perspective` | perspective on SVG children | detail / `css:3d-transforms` | partial | guilloche-intaglio-plate |
| `pv:offset-path=ray` | offset-path: ray() | detail / `pr:offset-path` | partial | seismic-drum-console (via pr:offset-path) |
| `pv:offset-path=url` | offset-path: url(#shape) and basic shapes with coord-box | detail / `pr:offset-path` | partial | seismic-drum-console (via pr:offset-path) |
| `pv:transform-box=fill-box` | transform-box: fill-box | detail / `pr:transform-box` | broad | guilloche-intaglio-plate |
| `pv:transform-box=stroke-box` | transform-box: stroke-box | detail / `pr:transform-box` | partial | guilloche-intaglio-plate |
| `pv:transform-box=view-box` | transform-box: view-box (default) | detail / `pr:transform-box` | broad | guilloche-intaglio-plate |
| `pv:transform-style=preserve-3d` | transform-style: preserve-3d inside SVG | detail / `css:3d-transforms` | none | guilloche-intaglio-plate (via css:3d-transforms) |

### 变换与坐标系

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:SVGAnimatedTransformList.baseVal` | element.transform.baseVal list manipulation | core | broad | seismic-drum-console |
| `av:svg.preserveAspectRatio=slice` | meetOrSlice = slice (cover and crop) | core | broad | seismic-drum-console |
| `concept:hairline-stroke-rendering` | Sub-device-pixel strokes and zero width under downscale | core | broad | guilloche-intaglio-plate |
| `concept:half-pixel-crisp-alignment` | translate(0.5 0.5) for crisp 1px lines | core | broad | four-colour-press-check |
| `concept:isometric-projection-matrix` | Isometric / axonometric projection via matrix() | core | broad | ship-lofting-floor |
| `concept:length-units-absolute` | Absolute units px, mm, cm, in, pt, pc at 96 dpi | core | broad | ship-lofting-floor |
| `concept:length-units-font-relative` | em and rem lengths on geometry | core | broad | letterpress-type-specimen |
| `concept:mouse-to-svg-coordinates` | Screen to user space via getScreenCTM().inverse() and DOMPoint | core | broad | ship-lofting-floor, four-colour-press-check, seismic-drum-console |
| `concept:nearest-viewport-percentage-resolution` | Percentages resolve against the nearest viewport, not the root | core | broad | seismic-drum-console |
| `concept:negative-scale-mirroring` | Mirroring with negative scale | core | broad | ship-lofting-floor |
| `concept:nested-group-ctm-accumulation` | Nested <g> transforms accumulate into the CTM | core | broad | guilloche-intaglio-plate |
| `concept:nested-svg-viewport` | Nested <svg> with x/y/width/height and its own viewBox | core | broad | seismic-drum-console |
| `concept:objectboundingbox-unit-skew` | objectBoundingBox units stretch with non-square bounding boxes | core | broad | jacquard-loom-draft |
| `concept:percentage-diagonal-formula` | Non-axis percentages use the normalized diagonal sqrt((w²+h²)/2) | core | broad | seismic-drum-console |
| `concept:stroke-scales-with-ctm` | Stroke width and dashes scale with the transform | core | broad | guilloche-intaglio-plate |
| `concept:transform-list-composition-order` | Transform list composition order (right-to-left application) | core | broad | guilloche-intaglio-plate |
| `concept:viewbox-camera-pan` | viewBox min-x / min-y as camera offset | core | broad | seismic-drum-console |
| `concept:viewbox-camera-zoom` | Smaller viewBox magnifies (zoom in), larger shrinks (zoom out) | core | broad | seismic-drum-console |
| `concept:viewbox-negative-origin` | Negative viewBox origin centring (0,0) in the viewport | core | broad | seismic-drum-console |
| `concept:y-down-clockwise-angles` | y axis points down, positive angles rotate clockwise | core | broad | celestial-astrolabe-cabinet |
| `css:individual-transform-properties` | CSS translate / rotate / scale properties on SVG elements | core | broad | guilloche-intaglio-plate |
| `css:transform-cascade-precedence` | CSS transform overrides the transform attribute (presentation attribute specificity zero) | core | broad | guilloche-intaglio-plate |
| `css:transform-transition-animation` | CSS transitions and @keyframes animating transform on SVG elements | core | broad | guilloche-intaglio-plate |
| `pv:transform=matrix` | matrix(a b c d e f) general affine | core | broad | ship-lofting-floor |
| `pv:transform=rotate` | rotate(angle) about the origin | core | broad | escapement-chronometer |
| `pv:transform=rotate-cx-cy` | rotate(angle cx cy) three-argument form | core | broad | celestial-astrolabe-cabinet |
| `pv:transform=scale` | scale(sx sy) | core | broad | guilloche-intaglio-plate |
| `pv:transform=skewX` | skewX(angle) | core | broad | pipeline-mimic-board |
| `pv:transform=skewY` | skewY(angle) | core | broad | pipeline-mimic-board |
| `pv:transform=translate` | translate(tx ty) | core | broad | guilloche-intaglio-plate |
| `api:DOMMatrixReadOnly.inverse` | DOMMatrix inverse / multiply / rotate / scale helpers | detail / `concept:mouse-to-svg-coordinates` | broad | seismic-drum-console |
| `api:SVGSVGElement.createSVGMatrix` | createSVGMatrix / createSVGTransform / createSVGPoint legacy factories | detail / `api:SVGAnimatedTransformList.baseVal` | deprecated | seismic-drum-console |
| `api:SVGTransformList.consolidate` | SVGTransformList.consolidate() collapses list into one matrix | detail / `api:SVGAnimatedTransformList.baseVal` | broad | seismic-drum-console |
| `av:svg.preserveAspectRatio=defer` | preserveAspectRatio defer keyword removed | detail / `at:svg.preserveAspectRatio` | deprecated | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `av:svg.preserveAspectRatio=xMinYMin` | Alignment keywords xMin/xMid/xMax x YMin/YMid/YMax | detail / `at:svg.preserveAspectRatio` | broad | celestial-astrolabe-cabinet (via at:svg.preserveAspectRatio) |
| `concept:bounding-box-algorithm` | Normative bounding box algorithm and objectBoundingBox | detail / `api:SVGGraphicsElement.getBBox` | broad | letterpress-type-specimen (via api:SVGGraphicsElement.getBBox) |
| `concept:css-transform-on-pattern-gradient` | CSS transform on pattern and gradient elements | detail / `at:pattern.patternTransform` | partial | jacquard-loom-draft (via at:pattern.patternTransform), four-colour-press-check (via at:pattern.patternTransform) |
| `concept:css-units-in-attributes` | CSS-only units (vw, vh, ch, Q) in geometry attributes | detail / `concept:length-units-absolute` | partial | ship-lofting-floor (via concept:length-units-absolute) |
| `concept:filter-region-rotates-with-transform` | Filter primitives operate in the element's transformed user space | detail / `concept:nested-group-ctm-accumulation` | broad | guilloche-intaglio-plate (via concept:nested-group-ctm-accumulation) |
| `concept:invalid-transform-attribute-ignored` | Parse error discards the whole transform attribute | detail / `pr:transform` | broad | guilloche-intaglio-plate |
| `concept:invalid-viewbox-disables-rendering` | Zero or negative viewBox width/height disables rendering | detail / `at:svg.viewBox` | broad | celestial-astrolabe-cabinet (via at:svg.viewBox) |
| `concept:large-coordinate-precision` | Floating-point precision loss with huge coordinates and tiny scales | detail / `concept:hairline-stroke-rendering` | partial | guilloche-intaglio-plate (via concept:hairline-stroke-rendering) |
| `concept:nested-svg-transform-attribute` | transform on a nested <svg> element | detail / `at:svg.transform` | partial | celestial-astrolabe-cabinet (via at:svg.transform) |
| `concept:non-uniform-scale-stroke-distortion` | Non-uniform scale turns the stroke pen into an ellipse | detail / `concept:stroke-scales-with-ctm` | broad | guilloche-intaglio-plate |
| `concept:scale-about-point` | Scaling about a point via translate-scale-translate | detail / `pv:transform=scale` | broad | guilloche-intaglio-plate |
| `concept:singular-transform-matrix` | Non-invertible transform (scale(0), degenerate matrix) | detail / `pv:transform=scale` | broad | guilloche-intaglio-plate (via pv:transform=scale) |
| `concept:transform-attribute-syntax` | Attribute syntax: optional commas/whitespace, unitless numbers, degrees implied | detail / `pr:transform` | broad | guilloche-intaglio-plate (via pr:transform) |
| `concept:transform-on-tspan-ignored` | transform on <tspan> is ignored | detail / `pr:transform` | none | guilloche-intaglio-plate (via pr:transform) |
| `concept:transform-origin-default-svg-vs-html` | Default transform-origin is 0 0 for SVG content, 50% 50% for HTML | detail / `pr:transform-origin` | broad | guilloche-intaglio-plate (via pr:transform-origin) |
| `concept:translate-vs-xy-positioning` | translate() versus x/y attributes for positioning | detail / `pv:transform=translate` | broad | guilloche-intaglio-plate (via pv:transform=translate) |
| `concept:unitless-length-in-css` | Unitless numbers accepted for SVG properties in CSS | detail / `concept:length-units-absolute` | broad | ship-lofting-floor (via concept:length-units-absolute) |
| `concept:units-inside-viewbox-scaled` | Physical units inside a viewBox are converted then rescaled | detail / `concept:length-units-absolute` | broad | ship-lofting-floor |
| `concept:use-xy-appended-translate` | <use> x/y is an extra translate applied after its transform | detail / `concept:transform-list-composition-order` | broad | guilloche-intaglio-plate (via concept:transform-list-composition-order) |
| `concept:viewbox-intrinsic-aspect-ratio` | viewBox-only root svg sizes responsively via intrinsic aspect ratio | detail / `at:svg.viewBox` | broad | celestial-astrolabe-cabinet (via at:svg.viewBox) |
| `css:transform-3d-on-svg` | 3D transforms (rotateX/rotateY/perspective) on inner SVG elements | detail / `css:individual-transform-properties` | partial | guilloche-intaglio-plate (via css:individual-transform-properties) |
| `css:transform-attribute-css-syntax` | CSS units and functions in the transform attribute | detail / `css:transform-cascade-precedence` | partial | guilloche-intaglio-plate (via css:transform-cascade-precedence) |
| `css:transform-on-inline-svg-root` | CSS transform on the inline <svg> root behaves like an HTML box | detail / `at:svg.transform` | broad | celestial-astrolabe-cabinet (via at:svg.transform) |
| `css:transform-syntax-differences` | CSS transform requires units (px, deg) and single-angle rotate | detail / `css:transform-cascade-precedence` | broad | guilloche-intaglio-plate (via css:transform-cascade-precedence) |
| `css:zoom` | CSS zoom property on SVG content | detail / `at:svg.transform` | partial | celestial-astrolabe-cabinet (via at:svg.transform) |
| `pv:transform-box=content-box` | transform-box: content-box / border-box on SVG elements | detail / `pr:transform-box` | broad | guilloche-intaglio-plate (via pr:transform-box) |

### 交互与无障碍

| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |
|---|---|---|---|---|
| `api:Element.setPointerCapture` | Element.setPointerCapture / releasePointerCapture / gotpointercapture | core | broad | forge-metallography-bench |
| `api:SVGElement.focus` | SVGElement.focus() / blur() / tabIndex | core | broad | museum-label-panel |
| `at:svg.tabindex` | tabindex on SVG elements (root and shapes focusable) | core | broad | museum-label-panel |
| `concept:aria-live` | aria-live region announcing SVG state changes | core | broad | museum-label-panel |
| `concept:drag-with-pointer-events` | Dragging shapes with pointerdown/move/up and translate updates | core | broad | forge-metallography-bench |
| `concept:hit-test-invisible-stroke` | Invisible wide stroke enlarging hit area of thin lines | core | broad | core-sample-stratigraphy |
| `concept:hit-test-transparent-fill` | fill=transparent vs fill=none hit-testing difference | core | broad | core-sample-stratigraphy |
| `concept:keyboard-events` | keydown/keyup on focused SVG elements (arrow-key movement, Enter/Space activation) | core | broad | museum-label-panel |
| `concept:mouse-events` | Mouse events on SVG elements (click, dblclick, mousedown/up/move, mouseover/out) | core | broad | forge-metallography-bench |
| `concept:pointer-events-api` | Pointer events (pointerdown/move/up, pointerType, pressure) | core | broad | seismic-drum-console |
| `concept:role-button-keyboard` | role=button + tabindex + Enter/Space handling on shapes (aria-pressed) | core | broad | museum-label-panel |
| `concept:role-group` | role=group / list / listitem on <g> structuring screen-reader navigation | core | broad | museum-label-panel |
| `concept:screen-reader-reading-order` | Reading order follows DOM order, not visual position (aria-owns / reordering) | core | broad | museum-label-panel |
| `concept:touch-events` | Touch events (touchstart/move/end, TouchList) | core | partial | seismic-drum-console |
| `concept:use-shadow-event-retargeting` | Event retargeting: events inside <use> instances report the <use> as target | core | broad | celestial-astrolabe-cabinet |
| `concept:wheel-zoom` | wheel event driven zoom/pan of the viewBox | core | broad | seismic-drum-console |
| `css:checked-sibling-toggle` | Checkbox/radio hack: input:checked ~ svg or :has(:checked) toggling SVG state | core | broad | museum-label-panel |
| `css:focus` | :focus pseudo-class on SVG elements | core | broad | museum-label-panel |
| `css:focus-visible` | :focus-visible (keyboard-only focus ring) | core | broad | museum-label-panel |
| `css:has` | :has() relational selector for state propagation | core | broad | museum-label-panel |
| `css:hover` | :hover on SVG elements and groups | core | broad | pipeline-mimic-board |
| `css:target` | :target pseudo-class driven by URL fragment | core | broad | celestial-astrolabe-cabinet |
| `css:user-select` | user-select and native text selection of SVG <text> | core | broad | stele-rubbing-hall |
| `pr:pointer-events` | pointer-events property | core | broad | core-sample-stratigraphy |
| `pr:touch-action` | touch-action on the <svg> viewport | core | broad | seismic-drum-console |
| `pv:pointer-events=bounding-box` | pointer-events: bounding-box | core | partial | core-sample-stratigraphy |
| `pv:pointer-events=none` | pointer-events: none (pass-through, inherited) | core | broad | core-sample-stratigraphy |
| `api:Document.elementFromPoint` | document.elementFromPoint / elementsFromPoint on SVG content | detail / `api:SVGGeometryElement.isPointInFill` | broad | ship-lofting-floor (via api:SVGGeometryElement.isPointInFill) |
| `api:MouseEvent.offsetX` | MouseEvent.offsetX/offsetY on SVG targets | detail / `api:SVGGraphicsElement.getScreenCTM` | partial | seismic-drum-console |
| `api:PointerEvent.getCoalescedEvents` | PointerEvent.getCoalescedEvents / getPredictedEvents | detail / `concept:pointer-events-api` | broad | seismic-drum-console |
| `at:a.hreflang` | a hreflang / type link metadata | detail / `el:a` | broad | celestial-astrolabe-cabinet (via el:a) |
| `at:a.ping` | a ping | detail / `el:a` | partial | celestial-astrolabe-cabinet (via el:a) |
| `at:a.referrerpolicy` | a referrerpolicy | detail / `el:a` | partial | celestial-astrolabe-cabinet (via el:a) |
| `at:a.xlink:href` | a xlink:href (legacy) | detail / `el:a` | deprecated | celestial-astrolabe-cabinet (via el:a) |
| `at:svg.autofocus` | autofocus on SVG elements | detail / `at:svg.tabindex` | broad | museum-label-panel (via at:svg.tabindex) |
| `at:svg.onload` | onload on <svg> root (SVGLoad renamed to load) | detail / `concept:mouse-events` | broad | forge-metallography-bench (via concept:mouse-events) |
| `concept:clip-path-hit-testing` | clip-path removes clipped regions from hit testing; mask and opacity do not | detail / `pr:pointer-events` | broad | core-sample-stratigraphy (via pr:pointer-events) |
| `concept:contextmenu-event` | contextmenu event (right-click) on SVG elements | detail / `concept:mouse-events` | broad | forge-metallography-bench (via concept:mouse-events) |
| `concept:custom-tooltip` | Script-positioned SVG tooltip following the pointer | detail / `el:title` | broad | museum-label-panel |
| `concept:embedding-mode-interactivity` | Interactivity depends on embedding: <img>/CSS background inert, <object>/<iframe>/inline interactive | detail / `concept:mouse-events` | broad | forge-metallography-bench (via concept:mouse-events) |
| `concept:event-delegation-on-group` | Event bubbling and delegation on a parent <g> via event.target | detail / `concept:mouse-events` | broad | forge-metallography-bench |
| `concept:focus-events` | focus/blur/focusin/focusout on SVG elements (replacing DOMFocusIn/Out) | detail / `at:svg.tabindex` | broad | museum-label-panel |
| `concept:fragment-link-to-view` | In-document links to #id, <view> and svgView(viewBox()) fragments | detail / `el:a` | partial | celestial-astrolabe-cabinet |
| `concept:hidden-elements-hit-testing` | display:none removes from hit-testing; visibility:hidden depends on pointer-events value | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `concept:hit-test-overlay-rect` | Transparent overlay rect capturing all events for a plot area | detail / `concept:hit-test-transparent-fill` | broad | core-sample-stratigraphy |
| `concept:hover-state-transition` | CSS transitions on presentation properties for hover/focus states | detail / `css:hover` | broad | pipeline-mimic-board |
| `concept:html-controls-via-foreignObject` | Keyboard-operable HTML controls inside <foreignObject> | detail / `concept:role-button-keyboard` | partial | museum-label-panel |
| `concept:html-drag-and-drop-on-svg` | HTML draggable / dragstart on SVG elements | detail / `concept:drag-with-pointer-events` | partial | forge-metallography-bench (via concept:drag-with-pointer-events) |
| `concept:inline-event-handler-attributes` | Inline on* event attributes (onclick, onmouseover, onkeydown) | detail / `concept:mouse-events` | broad | forge-metallography-bench (via concept:mouse-events) |
| `concept:markers-not-hittable` | Marker, pattern and gradient content never receive events | detail / `pr:pointer-events` | broad | core-sample-stratigraphy (via pr:pointer-events) |
| `concept:mouseenter-vs-mouseover` | mouseenter/mouseleave vs bubbling mouseover/mouseout on nested groups | detail / `concept:mouse-events` | broad | forge-metallography-bench |
| `concept:multi-touch-gesture` | Multi-touch pinch-zoom / rotate with pointer or touch events | detail / `concept:touch-events` | broad | seismic-drum-console |
| `concept:nested-viewport-hit-clipping` | Content outside a nested <svg> viewport is not hittable | detail / `pr:pointer-events` | broad | core-sample-stratigraphy (via pr:pointer-events) |
| `concept:role-graphics-document` | WAI-ARIA Graphics roles (graphics-document, graphics-object, graphics-symbol) | detail / `concept:role-group` | partial | museum-label-panel |
| `concept:role-slider` | role=slider / progressbar with aria-valuenow on SVG controls | detail / `concept:role-button-keyboard` | broad | museum-label-panel (via concept:role-button-keyboard) |
| `concept:svg-1.1-dom-events` | SVG 1.1 events (SVGZoom, SVGScroll, SVGResize, DOMActivate, DOMFocusIn, mutation events, onzoom) | detail / `concept:mouse-events` | deprecated | forge-metallography-bench (via concept:mouse-events) |
| `concept:tabindex-focus-order` | Focus order control (tabindex=0 DOM order, positive values, -1 script-only) | detail / `at:svg.tabindex` | broad | museum-label-panel |
| `concept:text-hit-testing` | Text hit-testing by glyph cells, not bounding box or painted pixels | detail / `pr:pointer-events` | broad | core-sample-stratigraphy (via pr:pointer-events) |
| `concept:text-link` | <a> inside <text> wrapping tspans | detail / `el:a` | broad | celestial-astrolabe-cabinet (via el:a) |
| `css:active` | :active pressed state | detail / `css:hover` | broad | pipeline-mimic-board |
| `css:focus-within` | :focus-within on ancestor <g> | detail / `css:focus` | broad | museum-label-panel |
| `css:hover-inside-use` | :hover / :active styling of <use> instances and cloned children | detail / `concept:use-shadow-event-retargeting` | broad | celestial-astrolabe-cabinet |
| `css:link-pseudo` | :link / :any-link / :visited on SVG <a> | detail / `el:a` | partial | celestial-astrolabe-cabinet (via el:a) |
| `css:media-hover-pointer` | @media (hover) / (pointer: coarse) adaptive hit targets | detail / `concept:hit-test-invisible-stroke` | broad | core-sample-stratigraphy (via concept:hit-test-invisible-stroke) |
| `css:outline` | outline / outline-offset on SVG shapes for focus rings | detail / `css:focus` | broad | museum-label-panel |
| `css:selection-pseudo` | ::selection styling of SVG text | detail / `css:user-select` | partial | stele-rubbing-hall |
| `css:system-colors` | System colour keywords (CanvasText, Highlight, LinkText) as fill/stroke | detail / `css:forced-colors` | broad | museum-label-panel |
| `css:tap-highlight-color` | -webkit-tap-highlight-color on tappable SVG links | detail / `pr:touch-action` | partial | seismic-drum-console (via pr:touch-action) |
| `el:handler` | <handler> element (SVG Tiny 1.2) | detail / `concept:mouse-events` | deprecated | forge-metallography-bench (via concept:mouse-events) |
| `el:listener` | <listener> element (SVG Tiny 1.2) | detail / `concept:mouse-events` | deprecated | forge-metallography-bench (via concept:mouse-events) |
| `pv:pointer-events=all` | pointer-events: all | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=auto` | pointer-events: auto (CSS alias of visiblePainted on SVG) | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=fill` | pointer-events: fill | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=painted` | pointer-events: painted | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=stroke` | pointer-events: stroke | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=visible` | pointer-events: visible | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=visibleFill` | pointer-events: visibleFill | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=visiblePainted` | pointer-events: visiblePainted (default) | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:pointer-events=visibleStroke` | pointer-events: visibleStroke | detail / `pr:pointer-events` | broad | core-sample-stratigraphy |
| `pv:touch-action=none` | touch-action: none / manipulation / pan-x / pinch-zoom values | detail / `pr:touch-action` | broad | seismic-drum-console |

