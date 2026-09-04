# SVG 线、箭头与文字标注素材库

可编辑母版是 [`examples/arrow-library.svg`](../examples/arrow-library.svg)，机器可读索引是 [`arrow-library.json`](../arrow-library.json)。浏览器 demo 使用 `?scene=arrow-library`。每张卡片都有稳定 ID（`A01`–`C06`），可以让 code agent 按 ID 查找并复制对应的 `<g class="specimen">`；复制模板时，也要复制母版 `<defs>` 中被它引用的 marker、gradient 或 path。

## 先选文字策略

| 策略 | 模板 | 适用场景 | 关键做法 |
|---|---|---|---|
| 安全上标 | A01、B06 | 默认连接线 | 先画线，再画与背景同色的 mask，mask 与线保留 6–10px |
| 断线穿字 | A02、C04 | 标签必须占据线中间 | 把线拆成左右两段，不要用背景色粗描边伪造断线 |
| 沿线排布 | A03、B03、B04、C03 | 曲线、流线 | 复制一条向外偏移 14–16px 的隐藏 label path，再让 `textPath` 跟随它 |
| 旋转交叉 | A04 | 双向、张力、编辑性图形 | 文字后画并旋转，同时用同角度的局部 mask 保护字形 |
| 侧边竖标 | B01 | 正交线的长竖段 | 文字放在线侧 8px 以上，避免 `writing-mode` |
| 胶囊/端部说明 | C01、C06 | 状态或强调 | 标签成为独立视觉单元，不遮盖箭头尖端 |

## 最小可复制模板

### 1. 直线 + 实心箭头 + 安全上标

```svg
<defs>
  <marker id="arrow-filled" viewBox="0 0 12 10"
          markerWidth="12" markerHeight="10" refX="10" refY="5"
          orient="auto-start-reverse" markerUnits="userSpaceOnUse">
    <path d="M1 1 11 5 1 9 3.5 5Z" fill="#58d6c8"/>
  </marker>
</defs>

<!-- 先画线 -->
<path d="M40 80H360" fill="none" stroke="#58d6c8" stroke-width="2.5"
      stroke-linecap="round" marker-end="url(#arrow-filled)"/>
<!-- 后画标签；mask 底边距线 8px -->
<rect x="145" y="48" width="110" height="24" rx="4" fill="#0e1c31"/>
<text x="200" y="65" text-anchor="middle" fill="#dce8f5">提交任务</text>
```

### 2. 沿曲线排字

```svg
<path id="edge-sync" d="M40 90Q200 18 360 90" fill="none"
      stroke="#7fa6ff" stroke-width="2.5" marker-end="url(#arrow-stealth)"/>
<!-- label path 与箭头同形，但向上偏移 14px 且不可见 -->
<path id="edge-sync-label" d="M40 90Q200 18 360 90"
      transform="translate(0 -14)" fill="none" stroke="none"/>
<text fill="#dce8f5">
  <textPath href="#edge-sync-label" startOffset="50%" text-anchor="middle">
    沿曲线同步
  </textPath>
</text>
```

路径方向决定文字方向。若文字倒置，优先反转 `d` 的起终点；不要用 `scale(-1)`，它也会翻转字形。独立 label path 比直接在 `textPath` 上设置 `dy` 更稳定，也能明确保证字形与线之间的距离。长短变化较大的动态路径可设置 `pathLength="100"`，再用百分比 `startOffset`。

### 3. 圆角正交线

```svg
<path d="M40 85H170Q178 85 178 77V55Q178 47 186 47H360"
      fill="none" stroke="#58d6c8" stroke-width="2.5"
      stroke-linejoin="round" marker-end="url(#arrow-filled)"/>
```

拐角半径默认 8px。多个连接共用节点边缘时要把连接点错开至少 12px，不要让两条线共享一段路径。

### 4. 不可避免的交叉用跳桥

```svg
<!-- 次要竖线先画 -->
<path d="M200 30V110" stroke="#506a80" stroke-width="1.5" stroke-dasharray="4 5"/>
<!-- 主要横线在交点处抬起一个半圆 -->
<path d="M40 72H192a8 8 0 0 1 16 0H360"
      fill="none" stroke="#58d6c8" stroke-width="2.5"
      marker-end="url(#arrow-filled)"/>
```

## 箭头端点怎么画

- 实心三角：通用、有方向性，见 A01。
- 空心 V：更轻、更像注释或返回，见 A02/B05。
- Stealth：接近常见 LaTeX/TikZ 箭头，见 A03/B02/C03。
- Latex slender：细长、适合数学推导，见 A06/B03。
- Harpoon：偏序、映射或单侧作用，见 A05。
- 双向：`marker-start` 与 `marker-end` 同时设置；marker 要用 `orient="auto-start-reverse"`，见 A04/C04。
- 菱形起点：组合/所有权；仍可在末端保留方向箭头，见 C05。

`refX/refY` 是端点贴合的关键：箭尖在 marker 坐标中的位置应与 `refX/refY` 对齐。箭头看起来与线分离时，先修 `refX`，不要盲目延长路径。

## 给 code agent 的绘制规约

1. 先说清语义，再选路径、端点和文字策略；不要只说“画一个漂亮箭头”。
2. 每条可标注路径都给唯一、语义化的 `id`；页面有多个 SVG 时给 marker ID 加前缀。
3. 统一使用 `viewBox`，连接线 `fill="none"`，并显式设置 `stroke-linecap`、`stroke-linejoin`。
4. 普通架构图优先 A01/B02；文字真的需要压线时才用 A02/A04。
5. 标签后画。默认通过 mask 与线保留 6–10px 间距；沿线文字使用与箭头同形、向外偏移 14–16px 的独立隐藏路径。
6. 线与箭头必须是同一条 path 的 marker 关系，不要把三角形散落在终点附近。
7. 交叉能绕则绕；不能绕时只让较次要的线跳桥，见 B06。
8. 避免 `markerUnits="strokeWidth"` 造成粗线上的箭头失控；需要跨粗细复用时用 `userSpaceOnUse`。
9. SVG 的绘制顺序建议为：背景/分区 → 连接线 → 标签 mask → 标签 → 节点。
10. 完成后至少检查：箭头是否贴线、文字是否倒置/被裁、marker ID 是否冲突、缩放后线宽是否合适、键盘/屏幕阅读器是否能识别含义。

推荐提示词：

> 使用 `examples/arrow-library.svg` 的 B02 路径、A03 的 stealth 箭头端点和 A01 的安全上标方式。保持线与 marker 连续；标签与线至少相距 8px；为 path 和 marker 使用当前图唯一的 ID；输出带 viewBox、title 和 aria-labelledby 的原生 SVG。

## 18 个模板索引

| ID | 名称 | 路径/端点 | 标注方式 |
|---|---|---|---|
| A01 | 安全上标 | 直线 / 实心三角 | 背景 mask 上标 |
| A02 | 断线穿字 | 分段直线 / 空心 V | 文字穿线 |
| A03 | 曲线随排 | 二次曲线 / stealth | `textPath` |
| A04 | 双向交叉标 | 双向直线 | 旋转交叉 |
| A05 | 半箭头 | 直线 / harpoon | 下标 |
| A06 | 双线蕴含 | 双线 / latex | 线中盒装 |
| B01 | 正交折线 | 90° / 实心三角 | 竖段侧标 |
| B02 | 圆角折线 | 8px 圆角 / stealth | 转角 callout |
| B03 | 贝塞尔弧 | 三次曲线 / latex | `textPath` |
| B04 | S 形流线 | S 曲线 / 实心三角 | `textPath` |
| B05 | 回环箭头 | 自循环 / 空心 V | 安全上标 |
| B06 | 跨线跳桥 | 半圆 hop / 实心三角 | 安全上标 |
| C01 | 异步虚线 | 虚线 / 实心三角 | 胶囊上标 |
| C02 | 点线重复标 | 点线 / barb | 重复 `textPath` |
| C03 | 波形箭头 | 波形 / stealth | `textPath` |
| C04 | 尺寸标注 | 双向 + 刻度 | 断线穿字 |
| C05 | 组合关系 | 菱形 → 三角 | 两段语义 |
| C06 | 渐变强调 | 渐变曲线 / 实心三角 | 端部 callout |
