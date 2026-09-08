import { el, fragment, text, mark, freezeAt, isExport, fontFaceCss, FONT_CJK, FONT_MONO, mulberry32 } from './lib';
import { GROWER_SCRIPT, MASTER_BASE, MASTER_BY, EXPORT_TIME, GRAIN_RATIO, BLEED_RATIO, staircase } from './mycelium-culture-chamber-script';

const green = '#c4ddbc', gold = '#e0bc76', ink = '#283d34';
const label = (x: number, y: number, value: string, size = 12, fill = green) => text(value, { x, y, 'font-family': FONT_CJK, 'font-size': size, fill });
const turbulence = (id: string, type = 'fractalNoise', frequency = '.012 .018', octaves = 4) => el('feTurbulence', { id, type, baseFrequency: frequency, numOctaves: octaves, seed: 7, result: 'noise' });
const region = { x: '-30%', y: '-30%', width: '160%', height: '160%', 'color-interpolation-filters': 'sRGB' };

export async function render(stage: SVGSVGElement): Promise<void> {
  stage.setAttribute('role', 'img'); stage.setAttribute('aria-labelledby', 'culture-title culture-desc');
  stage.append(el('title', { id: 'culture-title' }, '菌种培养舱'), el('desc', { id: 'culture-desc' }, '三只培养皿用同一噪声母版驱动菌丝位移、渗色和纸纹。组滤镜与逐路径滤镜并列展示。'));
  stage.append(el('style', {}, fontFaceCss()));
  const defs = el('defs'); stage.append(defs);
  const master = turbulence('master-noise'); master.append(el('animate', { attributeName: 'baseFrequency', by: `${MASTER_BY.x} ${MASTER_BY.y}`, dur: '5s', repeatCount: 5, accumulate: 'sum', fill: 'freeze' }));
  defs.append(el('filter', { id: 'noise-source', x: 0, y: 0, width: '100%', height: '100%' }, master));
  defs.append(fragment(`<clipPath id="chamber-inner"><rect x="68" y="80" width="890" height="738" rx="14"/></clipPath>
    <filter id="mesh-blur"><feGaussianBlur stdDeviation="68"/></filter>
    <filter id="halo-feather" primitiveUnits="objectBoundingBox" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".03"/></filter>
    <filter id="halo-fixed"><feGaussianBlur stdDeviation="6"/></filter>
    <radialGradient id="spore"><stop stop-color="#e0bc76" stop-opacity=".48"/><stop offset="1" stop-color="#80bf83" stop-opacity="0"/></radialGradient>
    <linearGradient id="lamp"><stop stop-color="#917945"/><stop offset=".5" stop-color="#fff4bf"/><stop offset="1" stop-color="#917945"/></linearGradient>`));
  const warpNoises: SVGElement[] = [], bleedNoises: SVGElement[] = [];
  for (let i=0;i<3;i++) {
    const id = 'abc'[i], n = turbulence(i===0 ? 'warp-noise' : `warp-noise-${id}`, i===1 ? 'turbulence' : 'fractalNoise', '.012 .018', i===1 ? 5 : 2);
    warpNoises.push(n);
    const displacement = el('feDisplacementMap', { id: `warp-scale-${id}`, in: 'SourceGraphic', in2: 'noise', scale: i===1 ? 34 : 18, xChannelSelector: ['R','G','A'][i], yChannelSelector: i===1 ? 'A' : 'G' });
    displacement.append(el('animate', { id: `focus-anim-${id}`, attributeName: 'scale', by: 6, begin: 'indefinite', dur: '.5s', fill: 'freeze' }));
    defs.append(el('filter', { id: `warp-${id}`, ...region }, n, displacement));
    const bn = turbulence(i===0 ? 'bleed-noise' : `bleed-noise-${id}`); bleedNoises.push(bn);
    defs.append(el('filter', { id: `bleed-${id}`, ...region }, bn, fragment(`
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="warped"/>
      <feGaussianBlur in="warped" stdDeviation="3.2" result="soft"/>
      <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9" result="hard"/>
      <feGaussianBlur in="warped" stdDeviation="6"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -9" result="inner"/>
      <feComposite in="hard" in2="inner" operator="out" result="edge"/>
      <feFlood flood-color="#3d5c3a"/><feComposite in2="edge" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>`)));
  }
  const grain = turbulence('grain-noise', 'fractalNoise', `${MASTER_BASE.x*GRAIN_RATIO} ${MASTER_BASE.y*GRAIN_RATIO}`);
  defs.append(el('filter', { id: 'grain', x: 0, y: 0, width: '100%', height: '100%' }, grain, fragment('<feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".25" intercept=".75"/><feFuncG type="linear" slope=".25" intercept=".75"/><feFuncB type="linear" slope=".25" intercept=".75"/></feComponentTransfer><feBlend in2="SourceGraphic" mode="multiply"/>')));
  const heatNoise = turbulence('heat-noise','fractalNoise','.006 .05',2);
  // R=.5 is the neutral displacement channel: scale*(R-.5)=0, so x stays fixed.
  defs.append(el('filter', { id: 'heat-shimmer', ...region }, heatNoise, fragment('<feColorMatrix type="matrix" values="0 0 0 0 .5 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="vertical"/><feDisplacementMap in="SourceGraphic" in2="vertical" scale="8" xChannelSelector="R" yChannelSelector="G"/>')));
  const liquidNoise = turbulence('liquid-noise'); defs.append(el('filter', { id: 'liquid', ...region }, liquidNoise, el('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale: 9, xChannelSelector: 'R', yChannelSelector: 'G' })));
  const lensSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><radialGradient id="l"><stop stop-color="black"/><stop offset="1" stop-color="white"/></radialGradient></defs><rect width="300" height="300" fill="url(#l)"/></svg>';
  const lens = `data:image/svg+xml;base64,${btoa(lensSvg)}`;
  defs.append(el('filter', { id: 'rim-glass', ...region, primitiveUnits: 'objectBoundingBox' }, el('feImage', { href: lens, x: 0, y: 0, width: 1, height: 1, result: 'lens' }), el('feDisplacementMap', { in: 'SourceGraphic', in2: 'lens', scale: .09, xChannelSelector: 'R', yChannelSelector: 'R' }), el('feGaussianBlur', { stdDeviation: .003 })));
  const canvas = document.createElement('canvas'); canvas.width=128; canvas.height=128;
  const ctx = canvas.getContext('2d')!, pixels = ctx.createImageData(128,128), random = mulberry32(42);
  for(let i=0;i<pixels.data.length;i+=4) { const v=90+Math.floor(random()*165); pixels.data.set([v,v,v,255],i); } ctx.putImageData(pixels,0,0);
  const bagImage = canvas.toDataURL('image/png');
  defs.append(el('mask', { id:'bag-crinkle', maskContentUnits:'objectBoundingBox' }, el('image',{href:bagImage,width:1,height:1,preserveAspectRatio:'none'})),
    el('filter',{id:'bag-warp',...region},el('feImage',{href:bagImage,result:'crease'}),el('feDisplacementMap',{in:'SourceGraphic',in2:'crease',scale:8,xChannelSelector:'R',yChannelSelector:'G'})));
  stage.append(el('rect',{x:48,y:58,width:930,height:784,rx:20,fill:'#152c27','fill-opacity':.95,stroke:'#4f7763','stroke-width':2}));
  const mesh = el('g',{'clip-path':'url(#chamber-inner)',filter:'url(#mesh-blur)',opacity:.48});
  ['#2f6b4f','#8fbf6a','#d9a441','#3e7f8c','#5b3f6b'].forEach((fill,i)=>mesh.append(el('ellipse',{cx:180+i*155,cy:240+i%2*240,rx:160,ry:170,fill}))); stage.append(mesh);
  stage.append(el('rect',{x:96,y:118,width:834,height:16,rx:8,fill:'url(#lamp)'}));
  const heat = el('g',{id:'heat-band',filter:'url(#heat-shimmer)'});
  for(let y=154;y<270;y+=18) heat.append(el('line',{x1:96,x2:930,y1:y,y2:y,stroke:'#81ab8e','stroke-opacity':.25}));
  heat.append(label(108,179,'24.0°C / RH 92% · VERTICAL HEAT SHIMMER',13)); stage.append(heat);
  const liquid = el('g',{filter:'url(#liquid)'}); liquid.append(label(96,216,'MYCELIUM CULTURE CHAMBER',28),label(96,246,'菌种培养舱 / 一张噪声场，三种生长表面',16)); stage.append(liquid);
  for(let i=0;i<3;i++) {
    const id='abc'[i],cx=214+i*306,cy=468;
    defs.append(el('clipPath',{id:`dish-${id}`},el('circle',{cx,cy,r:118})),el('clipPath',{id:`rim-${id}`},el('path',{d:`M${cx+138} ${cy}a138 138 0 1 0 -276 0a138 138 0 1 0 276 0M${cx+120} ${cy}a120 120 0 1 1 -240 0a120 120 0 1 1 240 0`,'clip-rule':'evenodd'})));
    let rose=''; for(let k=0;k<=240;k++){const a=k/240*Math.PI*2,r=92+12*Math.cos(a*12);rose+=`${k?'L':'M'}${.5+Math.cos(a)*r/240} ${.5+Math.sin(a)*r/240}`;} rose+='Z';
    defs.append(el('mask',{id:`halo-${id}`,maskContentUnits:'objectBoundingBox'},el('path',{d:rose,fill:'white',filter:'url(#halo-feather)'})));
    stage.append(el('circle',{cx,cy:cy+7,r:140,fill:'#061611',opacity:.5}),el('circle',{cx,cy,r:138,fill:'#769d86','fill-opacity':.13,stroke:'#aac8b2','stroke-opacity':.7,'stroke-width':2}),el('circle',{cx,cy,r:120,fill:['#375344','#3b4b32','#344c46'][i]}));
    stage.append(el('rect',{x:cx-120,y:cy-120,width:240,height:240,fill:'url(#spore)',mask:`url(#halo-${id})`}));
    const colony = el('g',{id:`colony-${id}`,'data-lsystem':true,'data-cx':cx,'data-cy':cy,'data-seed':7+i*13,'data-points':12,'data-spread':32,'data-gens':7,'data-step':12,'data-paths':24,filter:i<2?`url(#bleed-${id})`:null,'data-path-filter':i===2?'url(#bleed-c)':null});
    stage.append(el('g',{'clip-path':`url(#dish-${id})`},el('g',{filter:`url(#warp-${id})`},colony)));
    stage.append(el('g',{'clip-path':`url(#rim-${id})`,filter:'url(#rim-glass)'},el('use',{href:`#colony-${id}`})));
    stage.append(el('path',{d:`M${cx-110} ${cy-66}A128 128 0 0 1 ${cx+30} ${cy-124}`,fill:'none',stroke:'#efffe8','stroke-width':3,'stroke-opacity':.5}),el('circle',{cx,cy,r:120,fill:'none',stroke:'#cee0c9','stroke-opacity':.4}));
    const names=['A-03 松针基质','B-07 木屑基质','C-11 逐段滤镜对照'];
    stage.append(label(cx-112,632,names[i],16,gold),label(cx-112,655,`xCh=${['R','G','A'][i]} · ${i===1?'turbulence / 5 octaves':'fractalNoise / 2 octaves'}`,11),label(cx-112,676,'接种 2026-03-14 · 24 PATHS',11));
  }
  const script=el('script',{type:'application/ecmascript'},GROWER_SCRIPT);stage.append(script);
  stage.append(el('rect',{id:'noise-plate',x:96,y:730,width:196,height:92,filter:'url(#noise-source)'}),label(308,752,'NOISE MASTER / seed 7',14,gold));
  const monitor=label(308,779,'',12);monitor.setAttribute('id','noise-readout');stage.append(monitor,label(308,802,'warp ×1.0  /  bleed ×2.2  /  grain t₀ ×64',12));
  const paper=el('g',{filter:'url(#grain)'},el('rect',{x:1006,y:90,width:366,height:570,rx:6,fill:'#f4efe2'}));stage.append(paper);
  stage.append(label(1026,123,'CULTURE RECORD 042',21,ink),label(1026,152,'组上统一渗染 / 逐路径独立水痕',14,ink),label(1026,180,'频率逐轮累积，纸纹保持接种时相位。',12,ink),label(1026,200,'R=.5：水平位移为零，仅上下抖动。',12,ink));
  for(let i=0;i<6;i++) {const id=`oct-${i}`; defs.append(el('filter',{id,x:0,y:0,width:'100%',height:'100%'},turbulence(`${id}-noise`,'fractalNoise','.04 .04',i+1)));stage.append(el('rect',{x:1026+i*55,y:237,width:45,height:48,filter:`url(#${id})`}),label(1031+i*55,302,`${i+1} oct`,11,ink));}
  for(let i=0;i<5;i++){const scale=[0,12,34,70,-34][i],id=`trial-${i}`;defs.append(el('filter',{id,...region},turbulence(`${id}-noise`,'fractalNoise','.04 .06',3),el('feDisplacementMap',{in:'SourceGraphic',in2:'noise',scale,xChannelSelector:'R',yChannelSelector:'G'})));stage.append(el('g',{filter:`url(#${id})`},label(1032+i*66,349,'菌',30,ink)),label(1032+i*66,381,`${scale}`,12,ink));}
  const ns=el('g',{id:'ns-control'});for(let i=0;i<4;i++){const path=i===2?document.createElement('path'):el('path');path.setAttribute('d',`M${1032+i*78} 428q12 -32 30 -8t30 -8`);path.setAttribute('fill','none');path.setAttribute('stroke',ink);path.setAttribute('stroke-width','3');ns.append(path);}stage.append(ns,label(1026,454,'SVG / SVG / HTML（不显影）/ SVG',11,ink));
  const good = '<svg xmlns="http://www.w3.org/2000/svg"><script><![CDATA[if (1 < 2 && true) {}]]></script></svg>';
  const bad = good.replace('<![CDATA[','').replace(']]>','');
  const parse = (s:string)=>new DOMParser().parseFromString(s,'image/svg+xml').querySelector('parsererror')!==null;
  stage.dataset.cdataValidated=String(!parse(good)&&parse(bad));
  stage.append(label(1026,484,'XML: CDATA ✓ / 未包裹的 < 与 && ✗',12,ink),label(1026,510,'同一独立 SVG：左 image，右 object',12,ink));
  stage.append(el('image',{href:'/mycelium-culture-chamber/culture-pair.svg',x:1026,y:524,width:150,height:100}));
  const foreign=el('foreignObject',{x:1196,y:524,width:150,height:100});
  const object=document.createElement('object');object.type='image/svg+xml';object.data='/mycelium-culture-chamber/culture-pair.svg';object.width='150';object.height='100';object.style.pointerEvents='none';foreign.append(object);stage.append(foreign);
  stage.append(el('rect',{x:1020,y:690,width:352,height:140,rx:6,fill:'#7fa8a0',mask:'url(#bag-crinkle)'}),el('g',{filter:'url(#bag-warp)'},el('rect',{x:1028,y:706,width:336,height:12,fill:gold}),label(1040,759,'ARCHIVE / SPORE SAMPLE 042',16,ink),label(1040,789,'bitmap → mask + displacement',12,ink)));
  const focus=el('circle',{id:'focus',cx:214,cy:468,r:144,fill:'none',stroke:gold,'stroke-width':1.5,'stroke-dasharray':'5 8','pointer-events':'none'});stage.append(focus);
  await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
  if(isExport()||matchMedia('(prefers-reduced-motion: reduce)').matches)freezeAt(stage,EXPORT_TIME);
  const sync=()=>{const fallback=staircase(stage.getCurrentTime()),x=master.baseFrequencyX.animVal||fallback.x,y=master.baseFrequencyY.animVal||fallback.y;
    warpNoises.forEach((n,i)=>n.setAttribute('baseFrequency',`${x*(i===1?.5:1)} ${y*(i===1?4:1)}`));bleedNoises.forEach(n=>n.setAttribute('baseFrequency',`${x*BLEED_RATIO} ${y*BLEED_RATIO}`));liquidNoise.setAttribute('baseFrequency',`${x*1.6} ${y*1.6}`);heatNoise.setAttribute('baseFrequency',`${x*.5} ${y*3}`);monitor.textContent=`t=${stage.getCurrentTime().toFixed(2)}s  f=${x.toFixed(5)} / ${y.toFixed(5)}`;};sync();
  if(!stage.animationsPaused()){const tick=()=>{sync();requestAnimationFrame(tick);};requestAnimationFrame(tick);}
  stage.addEventListener('pointermove',event=>{const p=new DOMPoint(event.clientX,event.clientY).matrixTransform(stage.getScreenCTM()!.inverse());const i=Math.max(0,Math.min(2,Math.round((p.x-214)/306)));focus.setAttribute('cx',String(214+i*306));(stage.querySelector(`#focus-anim-${'abc'[i]}`) as SVGAnimateElement).beginElement();});
  mark(stage,'api:Document.createElementNS','concept:script-cdata','concept:standalone-svg-document','concept:mesh-gradient-emulation',
    'concept:mask-with-filter','concept:mask-with-image','concept:filter-on-group-vs-children','concept:animated-turbulence','concept:glass-refraction-effect',
    'concept:heat-shimmer-animation','concept:liquid-distortion-effect','concept:paper-grain-texture','concept:watercolor-bleed-effect','concept:animate-filter-basefrequency');
}
