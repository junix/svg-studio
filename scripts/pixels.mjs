import { PNG } from 'pngjs';

/** Pixel probes use the decoded export. A mask's own alpha requires removing its opaque backing. */
export async function checkPixels(page, scene, png) {
  const checks = [];
  const expect = (name, condition, evidence) => {
    if (!condition) throw new Error(`${name}: ${JSON.stringify(evidence)}`);
    checks.push({name, evidence});
  };
  const alpha = (x,y,source=png) => source.data[(y*source.width+x)*4+3];
  const corners=[[0,0],[1399,0],[0,899],[1399,899]].map(([x,y])=>alpha(x,y));
  expect('four transparent corners',corners.every(a=>a===0),corners);
  if (scene !== 'core-sample-stratigraphy') return checks;
  const gap = Array.from({length:160},(_,i)=>alpha(215+i,490));
  expect('empty recovery clip reveals transparency',gap.every(a=>a===0),Math.max(...gap));
  expect('clip-path none keeps the adjacent interval opaque',alpha(300,508)>200,alpha(300,508));
  const front = Array.from({length:302},(_,i)=>alpha(1038+i,560));
  const last = front.findLastIndex(a=>a>200)+1038;
  expect('fifth reveal front lies between 1230 and 1260',last>=1230&&last<=1260&&front.slice(last-1038+2).every(a=>a===0),last);
  // Preserve the scene and hide only the siblings of each specimen and its ancestor panel.
  // The original export remains untouched; the temporary capture isolates compositor alpha.
  await page.evaluate(() => {
    const keep = [...document.querySelectorAll('#p4-lum, #p4-alpha')];
    const style = document.createElement('style'); style.id='pixel-probe-isolation';
    document.head.append(style);
    // Visibility is inherited into use shadow trees; visibility hidden on defs would blank the specimens.
    for (const node of keep) node.dataset.pixelProbe='1';
    style.textContent='#stage > :not(defs):not(style):not(g) {visibility:hidden!important} #stage > g {visibility:hidden!important} #stage [data-pixel-probe] {visibility:visible!important}';
  });
  try {
    const isolated = PNG.sync.read(await page.screenshot({omitBackground:true}));
    const lum=alpha(798,167,isolated)/255, opaque=alpha(888,167,isolated)/255;
    expect('isolated red luminance mask versus alpha mask',lum>=.18&&lum<=.25&&opaque>=.98,{luminance:lum,alpha:opaque});
  } finally {
    await page.evaluate(()=>{document.querySelector('#pixel-probe-isolation').remove();document.querySelectorAll('[data-pixel-probe]').forEach(n=>delete n.dataset.pixelProbe);});
  }
  return checks;
}
