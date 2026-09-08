/** Behaviour and geometry probes complement feature-presence checks. Run after the export screenshot. */
export async function checkAcceptance(page, scene) {
  const result = await page.evaluate(async scene => {
    const stage = document.querySelector('#stage');
    const $ = selector => stage.querySelector(selector);
    const all = selector => [...stage.querySelectorAll(selector)];
    const checks = [];
    const expect = (name, condition, evidence) => {
      if (!condition) throw new Error(`${name}: ${JSON.stringify(evidence)}`);
      checks.push({name,evidence});
    };
    const frames = () => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const move = (x,y) => (document.elementFromPoint(x,y) ?? stage).dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:x,clientY:y}));
    const ids = all('[id]').map(n=>n.id);
    expect('unique SVG IDs',new Set(ids).size===ids.length,ids.filter((id,i)=>ids.indexOf(id)!==i));
    expect('embedded fonts loaded',document.fonts.status==='loaded',document.fonts.status);
    expect('no placeholder scene',!stage.dataset.features?.includes('concept:stub'),stage.dataset.scene);
    switch(scene) {
      case 'celestial-astrolabe-cabinet': {
        expect('nine reusable star masters',all('symbol[id^="gl-"]').length===9,all('symbol').length);
        expect('seeded catalogue and 24 zone windows',all('use.star').length>=1600&&all('.tag-window').length===24,all('use.star').length);
        const before=all('*').length; location.hash='zone-18';await frames();
        expect('fragment selection reuses existing geometry',stage.dataset.zone==='zone-18'&&all('*').length===before,stage.dataset.zone);
        expect('selected slip is visible',getComputedStyle($('#zone-18 .slip')).opacity==='1',getComputedStyle($('#zone-18 .slip')).opacity);
        expect('fragment capability probe completed',!/PROBING/.test($('#svgview-status').textContent),$('#svgview-status').textContent);
        expect('fixed SMIL phase',stage.animationsPaused()&&Math.abs(stage.getCurrentTime()-4.8)<.01,stage.getCurrentTime());
        break;
      }
      case 'museum-label-panel': {
        expect('wrapped HTML and controls in SVG',all('foreignObject').length>=2&&Boolean($('foreignObject input')),all('foreignObject').length);
        const objects=all('object').filter(o=>o.contentDocument?.documentElement.localName==='svg');
        expect('same-origin standalone SVG documents loaded',objects.length>=1,objects.length);
        expect('semantic accessible exhibit list',Boolean($('[role="list"]'))&&Boolean($('[tabindex]')),all('[tabindex]').length);
        break;
      }
      case 'ship-lofting-floor': {
        const paths=['#keel-verbose','#keel-compact','#keel-relative'].map($),lengths=paths.map(p=>p.getTotalLength());
        let error=0;
        for(let k=0;k<=100;k++){const points=paths.map((p,i)=>p.getPointAtLength(lengths[i]*k/100));for(const p of points.slice(1))error=Math.max(error,Math.hypot(p.x-points[0].x,p.y-points[0].y));}
        expect('three keel spellings describe the same geometry',error<.1,{lengths,maxError:error});
        expect('path commands cover the full drawing grammar','MLHVCSQTAZ'.split('').every(cmd=>all('path').some(p=>p.getAttribute('d')?.includes(cmd))),all('path').length);
        break;
      }
      case 'guilloche-intaglio-plate': {
        expect('four generative curve families',new Set(all('[data-family]').map(n=>n.dataset.family)).size>=4,all('[data-family]').length);
        expect('hairline strokes stay constant under transforms',all('[vector-effect="non-scaling-stroke"]').length>10,all('[vector-effect="non-scaling-stroke"]').length);
        const ring=$('.auto-rx'),b=ring.getBBox();expect('auto radius follows the other radius',Math.abs(b.width-b.height)<.1&&b.width>70,{width:b.width,height:b.height});
        break;
      }
      case 'auroral-spectrograph': {
        expect('44 curtains share one master',all('linearGradient[id^="curtain-"]').length===44&&all('#auroraStops stop').length>=4,all('linearGradient[id^="curtain-"]').length);
        const stop=$('#auroraStops stop:nth-of-type(3)');move(150,300);const a=stop.offset.baseVal;move(1250,300);const b=stop.offset.baseVal;
        expect('pointer changes master stop offset',Math.abs(a-b)>.02,{a,b});
        break;
      }
      case 'jacquard-loom-draft': {
        const inherited=['dent12','dent16','satin5-24','satin5-36','laneBB'].map(id=>$(`#${id}`));
        expect('pattern variants inherit their tile artwork',inherited.every(p=>p&&p.children.length===0&&p.hasAttribute('href')),inherited.map(p=>p?.id));
        expect('one bitmap demonstrates two rasterization modes',$('#spriteAuto').getAttribute('href')===$('#spritePixel').getAttribute('href')&&$('#spritePixel').getAttribute('image-rendering')==='pixelated',true);
        const before=$('#readout').textContent;move(930,200);move(1100,400);expect('weave coordinates update on pointer input',$('#readout').textContent!==before,$('#readout').textContent);
        break;
      }
      case 'stele-rubbing-hall': {
        const columns=all('#zhengwen text');expect('eight vertical text columns',columns.length===8&&columns.every(n=>getComputedStyle(n).writingMode==='vertical-rl'),columns.length);
        expect('glyph rotation is authored per character',columns.every(n=>n.rotate.baseVal.numberOfItems>=6),columns.map(n=>n.rotate.baseVal.numberOfItems));
        expect('language switch contains explicit fallback',all('switch > [systemLanguage]').length>=2&&all('switch > :not([systemLanguage]):not([requiredExtensions])').length>=1,all('switch > *').length);
        expect('text follows reusable paths',all('textPath').length>=4,all('textPath').length);
        break;
      }
      case 'letterpress-type-specimen': {
        expect('embedded specimen font available',document.fonts.check('16px "Praktika VF"'),true);
        const fixed=all('text[textLength]');expect('both width adjustment modes are present',fixed.some(n=>n.getAttribute('lengthAdjust')==='spacingAndGlyphs')&&fixed.some(n=>n.getAttribute('lengthAdjust')==='spacing'),fixed.length);
        expect('text metrics are measurable',fixed.every(n=>Number.isFinite(n.getComputedTextLength())&&n.getComputedTextLength()>0),fixed.map(n=>+n.getComputedTextLength().toFixed(2)));
        break;
      }
      case 'pipeline-mimic-board': {
        const arrows=all('[marker-start][marker-end]').filter(n=>n.getAttribute('marker-start')===n.getAttribute('marker-end'));
        expect('one auto-start-reverse marker serves both ends',arrows.length>0&&Boolean($('marker[orient="auto-start-reverse"]')),arrows.length);
        expect('valve marker is defined once',all('#mk-valve').length===1,all('#mk-valve').length);
        expect('context paint is used inside markers',Boolean($('marker [fill="context-stroke"],marker [fill="context-fill"]')),true);
        break;
      }
      case 'four-colour-press-check': {
        const filter=$('#overprint'),known=new Set(['SourceGraphic','SourceAlpha','BackgroundImage','BackgroundAlpha','FillPaint','StrokePaint']),broken=[];
        for(const primitive of filter.children){for(const attr of ['in','in2']){const input=primitive.getAttribute(attr);if(input&&!known.has(input))broken.push(input);}if(primitive.hasAttribute('result'))known.add(primitive.getAttribute('result'));}
        expect('overprint filter inputs resolve in order',broken.length===0,broken);
        expect('CMYK arithmetic product uses three composites',filter.querySelectorAll('feComposite[operator="arithmetic"][k1="1"][k2="0"][k3="0"][k4="0"]').length===3,true);
        expect('tone curve has nine editable samples',$('#curve-m feFuncG').tableValues.baseVal.numberOfItems===9,$('#curve-m feFuncG').tableValues.baseVal.numberOfItems);
        break;
      }
      case 'forge-metallography-bench': {
        const diffuse=$('#f-plate feDiffuseLighting'),specular=$('#f-plate feSpecularLighting');
        expect('diffuse and specular lighting share bump depth',diffuse.surfaceScale.baseVal===specular.surfaceScale.baseVal,diffuse.surfaceScale.baseVal);
        const kernels=all('feConvolveMatrix');expect('convolution comparison has distinct kernels',new Set(kernels.map(n=>n.getAttribute('kernelMatrix'))).size>=6,kernels.length);
        expect('all convolution edge modes present',['duplicate','wrap','none'].every(v=>kernels.some(n=>n.getAttribute('edgeMode')===v)),true);
        break;
      }
      case 'mycelium-culture-chamber': {
        const hosts=['a','b','c'].map(id=>$(`#colony-${id}`)),paths=hosts.flatMap(h=>[...h.children]);
        const segments=paths.reduce((n,p)=>n+(p.getAttribute('d').match(/M/g)||[]).length,0);
        expect('seeded L-system generates real SVG geometry',paths.length===72&&segments>=12000&&paths.every(p=>p.namespaceURI==='http://www.w3.org/2000/svg'),{paths:paths.length,segments});
        expect('group and per-path filters are distinct',hosts[0].hasAttribute('filter')&&hosts[1].hasAttribute('filter')&&!hosts[2].hasAttribute('filter')&&[...hosts[2].children].every(p=>p.hasAttribute('filter')),true);
        const master=$('#master-noise'),warp=$('#warp-noise'),bleed=$('#bleed-noise'),grain=$('#grain-noise');
        expect('noise consumers follow their specified ratios',Math.abs(warp.baseFrequencyX.baseVal-master.baseFrequencyX.animVal)<1e-5&&Math.abs(bleed.baseFrequencyX.baseVal/master.baseFrequencyX.animVal-2.2)<1e-4&&Math.abs(grain.baseFrequencyX.baseVal-.012*64)<1e-5,{master:master.baseFrequencyX.animVal,warp:warp.baseFrequencyX.baseVal,bleed:bleed.baseFrequencyX.baseVal,grain:grain.baseFrequencyX.baseVal});
        expect('wrong namespace control remains in DOM',all('#ns-control > *').filter(n=>n.namespaceURI==='http://www.w3.org/1999/xhtml').length===1,true);
        expect('CDATA control parses only with escaping',stage.dataset.cdataValidated==='true',stage.dataset.cdataValidated);
        expect('export phase is fixed',stage.animationsPaused()&&Math.abs(stage.getCurrentTime()-7.8)<.01,stage.getCurrentTime());
        break;
      }
      case 'neon-sign-workshop': {
        expect('one shared SVG clip for CSS shape comparisons',all('clipPath').length===1,all('clipPath').length);
        const morph=$('#ns-morph'),halo=$('#ns-halo');move(200,120);const a=[morph.radiusX.baseVal,halo.stdDeviationX.baseVal];move(1200,820);const b=[morph.radiusX.baseVal,halo.stdDeviationX.baseVal];
        expect('pointer controls both glow stages',a[0]!==b[0]&&a[1]!==b[1],{a,b});
        expect('HTML board shares SVG effects',Boolean($('.board'))&&getComputedStyle($('.board')).filter.includes('ns-f-neon'),getComputedStyle($('.board')).filter);
        break;
      }
      case 'escapement-chronometer': {
        expect('clock freezes at the intended phase',stage.animationsPaused()&&Math.abs(stage.getCurrentTime()-7.4)<.01,stage.getCurrentTime());
        const events=all('#event-log [data-fired="1"]');expect('timeline records all event types',events.length>=8&&['beginEvent','repeatEvent','endEvent'].every(type=>events.some(n=>n.dataset.type===type)),events.map(n=>n.dataset.type));
        const before=$('#minute-hand')?.getCTM();stage.setCurrentTime(2.05);await frames();const after=$('#minute-hand')?.getCTM();
        expect('timeline can seek backwards',Math.abs(stage.getCurrentTime()-2.05)<.01&&(!before||before.a!==after.a||before.b!==after.b),stage.getCurrentTime());
        break;
      }
      case 'core-sample-stratigraphy': {
        expect('clip and mask examples are complete',all('clipPath').length>=14&&all('mask').length>=12,{clips:all('clipPath').length,masks:all('mask').length});
        const ratios=all('[data-hit-ratio]').map(n=>+n.dataset.hitRatio);expect('clipping removes hits; masking retains hits',ratios.length===4&&ratios.slice(0,3).every(v=>v>0&&v<=.62)&&ratios[3]>=.97,ratios);
        expect('reveal freezes partway through the fifth layer',stage.animationsPaused()&&Math.abs(stage.getCurrentTime()-3.2)<.01,stage.getCurrentTime());
        move(672,468);const clip=$('#core-readout').textContent;move(756,414);const mask=$('#core-readout').textContent;
        expect('invisible masked region is still picked',clip.includes('未命中')&&mask.includes('仍命中'),{clip,mask});
        break;
      }
      case 'seismic-drum-console': {
        const camera=$('#camera'),before=camera.getAttribute('viewBox');
        expect('camera coordinate chains agree',$('#verdict-lamp').dataset.verdict==='match'&&Number(stage.dataset.coordinateError)<.001,{verdict:$('#verdict-lamp').dataset.verdict,error:stage.dataset.coordinateError});
        camera.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:400,clientY:350,deltaY:-300}));await frames();move(480,360);
        expect('wheel changes the view while coordinate chains agree',camera.getAttribute('viewBox')!==before&&$('#verdict-lamp').dataset.verdict==='match',camera.getAttribute('viewBox'));
        expect('CSS and WAAPI animations are observable',document.getAnimations().length>=2,document.getAnimations().length);
        expect('resize observer initialized the ruler',+stage.dataset.resizeCallbacks>=1,stage.dataset.resizeCallbacks);
        break;
      }
      default: throw new Error(`No acceptance probes for ${scene}`);
    }
    return checks;
  }, scene);
  const record = (name, condition, evidence) => {
    if (!condition) throw new Error(`${name}: ${JSON.stringify(evidence)}`);
    result.push({name,evidence});
  };
  if (scene === 'museum-label-panel') {
    const first = page.locator('#stage .hotspot[data-accession="M-01"]');
    await first.focus();
    const sequence = [];
    for (let i=0;i<7;i++) {
      sequence.push(await page.evaluate(()=>document.activeElement.dataset.accession));
      if (i<6) await page.keyboard.press('Tab');
    }
    record('Tab follows accession order',sequence.join(',')==='M-01,M-02,M-03,M-04,M-05,M-06,M-07',sequence);
    const hotspot = page.locator('#stage .hotspot[data-accession="M-04"]');
    await hotspot.focus();
    const cursor = page.locator('#stage [data-cursor-x]');
    const before = Number(await cursor.getAttribute('data-cursor-x'));
    for(let i=0;i<3;i++) await page.keyboard.press('ArrowRight');
    const after = Number(await cursor.getAttribute('data-cursor-x'));
    record('three arrow keys advance measuring cursor',after-before>=24,{before,after});
    await page.keyboard.press('Space');
    const display = await page.locator('#stage .layer-section').evaluate(el=>getComputedStyle(el).display);
    record('Space toggles semantic state and section visibility',await hotspot.getAttribute('aria-pressed')==='true'&&display==='block',display);
  }
  if (scene === 'forge-metallography-bench') {
    await page.locator('#ruler-0').click();
    const depth = await page.evaluate(()=>[
      document.querySelector('#f-plate feDiffuseLighting').surfaceScale.baseVal,
      document.querySelector('#f-plate feSpecularLighting').surfaceScale.baseVal,
      Number(document.querySelector('#hud-surface-scale').textContent),
    ]);
    record('depth control updates both lights and measured HUD',depth.every(x=>x===-12),depth);
    const bulb=await page.locator('#lamp-bulb').boundingBox();
    const x=bulb.x+bulb.width/2,y=bulb.y+bulb.height/2;
    const before=await page.locator('#lamp-head').getAttribute('transform');
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+150,y+80,{steps:4});
    const captured=await page.locator('#lamp-head').evaluate(el=>el.classList.contains('captured'));
    const after=await page.locator('#lamp-head').getAttribute('transform');
    await page.mouse.up();
    const released=await page.locator('#lamp-head').evaluate(el=>!el.classList.contains('captured'));
    record('real pointer capture drives and releases lamp handle',captured&&released&&before!==after,{captured,released,before,after});
  }
  return result;
}
