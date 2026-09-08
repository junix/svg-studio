import { readFile, writeFile } from 'node:fs/promises';
import { validatePlan } from './coverage.mjs';
const planPath = new URL('../docs/svg-feature-demos.json',import.meta.url);
const plan = JSON.parse(await readFile(planPath,'utf8'));
const catalog = JSON.parse(await readFile(new URL('../catalog.json',import.meta.url),'utf8'));
const counts = validatePlan(plan,catalog);
const esc = s => String(s??'').replaceAll('|','\\|').replaceAll('\n',' ');
const key = s => '`'+s+'`';
const featureMap = new Map(plan.features.map(f=>[f.key,f]));
const core = plan.features.filter(f=>f.tier==='core');
const excluded = plan.features.filter(f=>['none','deprecated'].includes(f.support));
const out = ['# svg-studio · 原生 SVG 特性演示计划','',
  `> 生成日期 ${plan.generated}。${counts.demos} 个演示，${counts.core} 个核心特性键，${counts.assignments} 次演示分配；完整清单 ${plan.features.length} 项，其中 ${excluded.length} 项未实现或已废弃。`,
  '> 本文件由 `npm run plan` 从 `docs/svg-feature-demos.json` 生成。计划分配覆盖不等于跨浏览器支持；DOM 声明不等于行为和像素验收。当前验证范围见 [验收记录](svg-feature-audit.md)。','',
  '## 0. 背景与契约','',
  '- `src/svg/<id>.ts` 导出 `render(stage)`，由 `src/main.ts` 挂载到 1400×900 透明 SVG。',
  '- 内嵌字体与图像；独立 SVG 试片从本地同源加载；捕获阶段阻断外网。',
  '- `window.__VIS_READY__` 为就绪契约；pointer 计数用于交互检查；SMIL/CSS 动画在导出模式冻结。',
  '- `CHROME_PATH` 可覆盖浏览器路径；macOS 自动选已安装的 Chrome，其余使用 Playwright Chromium。',
  '- `npm test` 检查计划完整性、类型、构建产物、DOM 特性、场景行为和 RGBA。`SCENES=<id> npm run render` 验证单个场景。','',
  '## 1. 演示总览','',
  '| # | id | 标题 | 家族 | 核心特性 | 特性总数 | 复杂度 |','|---|---|---|---|---|---|---|'];
for(const [i,d] of plan.demos.entries()) out.push(`| ${i+1} | ${key(d.id)} | ${d.title} | ${d.family} | ${core.filter(f=>f.demos.includes(d.id)).length} | ${plan.features.filter(f=>f.demos.includes(d.id)).length} | ${d.complexity} |`);
out.push('','## 2. 覆盖矩阵（领域 × 演示）','','| 领域 | '+plan.demos.map((_,i)=>`D${i+1}`).join(' | ')+' | 核心分配 |','|---|'+plan.demos.map(()=> '---|').join('')+'---|');
for(const a of plan.areas){const fs=core.filter(f=>f.area===a.key);out.push(`| ${a.name} | `+plan.demos.map(d=>fs.filter(f=>f.demos.includes(d.id)).length||'·').join(' | ')+` | ${fs.filter(f=>f.demos.length).length}/${fs.length} |`);}
out.push('','## 3. 演示详情','');
for(const [i,d] of plan.demos.entries()) {
 out.push(`### 3.${i+1} ${key(d.id)} — ${d.title}`,'',`- **用途 / 家族**：${d.use} / ${d.family}`,`- **复杂度**：${d.complexity}　**标签**：${d.tags.map(key).join(', ')}`,`- **设计问题**：${d.question}`,'',`**场景**　${d.scene}`,'','**主打特性**','');
 for(const k of d.hero_features) {const f=featureMap.get(k);out.push(`- ${key(k)} — ${f?.name??k}`);}
 out.push('','**辅助特性**','',d.supporting_features.map(key).join('、'),'','**构造要点**','');
 d.construction.forEach((s,i)=>out.push(`${i+1}. ${s}`));
 out.push('','**验收要点**','');d.acceptance.forEach((s,i)=>out.push(`${i+1}. ${s}`));
 if(d.review_notes?.length){out.push('','**实现复审**','');d.review_notes.forEach(s=>out.push(`- ${s}`));}
 out.push('','**浏览器注意**','');(Array.isArray(d.browser_notes)?d.browser_notes:[d.browser_notes]).forEach(s=>out.push(`- ${s}`));out.push('');
}
out.push('## 4. 明确排除项','','| 特性 | 状态 | 原因 |','|---|---|---|');
for(const f of excluded)out.push(`| ${key(f.key)} | ${f.support} | ${esc(f.support_note)} |`);
if(plan.excluded_after_review.length){out.push('','### 复审后排除','');for(const x of plan.excluded_after_review)out.push('- '+esc(JSON.stringify(x)));}
out.push('','## 5. 验证命令','','```bash','npm run plan','npm run plan:check','npm test','SCENES=core-sample-stratigraphy npm run render','```','','## 6. 完整特性清单','');
for(const a of plan.areas){out.push(`### ${a.name}`,'','| 特性键 | 名称 | 层级 / 父特性 | 支持 | 演示 |','|---|---|---|---|---|');for(const f of plan.features.filter(f=>f.area===a.key))out.push(`| ${key(f.key)} | ${esc(f.name)} | ${f.tier}${f.parent?' / '+key(f.parent):''} | ${f.support} | ${f.demos.join(', ')||'经 '+key(f.parent)} |`);out.push('');}
const content=out.join('\n')+'\n',path=new URL('../docs/svg-feature-demos.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(path,'utf8')!==content)throw new Error('SVG plan markdown is stale; run npm run plan');}
else await writeFile(path,content);
console.log(`SVG plan: ${counts.core} core keys, ${counts.demos} demos, markdown ${process.argv.includes('--check')?'checked':'generated'}`);
