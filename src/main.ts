import paper from 'paper';
import rough from 'roughjs/bundled/rough.esm.js';
import './style.css';

declare global { interface Window { __VIS_READY__?: boolean; __INTERACTION_COUNT__?: number } }

const W = 1400, H = 900;
const scene = new URLSearchParams(location.search).get('scene') ?? 'botanical';
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<canvas id="stage" width="${W}" height="${H}" aria-label="${scene}"></canvas>`;
const canvas = document.querySelector<HTMLCanvasElement>('#stage')!;
paper.setup(canvas);
paper.project.clear();

const color = (hex:string, alpha=1) => { const c = new paper.Color(hex); c.alpha = alpha; return c; };
const line = (points:Array<[number,number]>, stroke:string, width:number, alpha=1) => {
  const path = new paper.Path({segments:points, strokeColor:color(stroke,alpha), strokeWidth:width, strokeCap:'round', strokeJoin:'round'});
  path.smooth({type:'continuous'});
  return path;
};
const label = (text:string, point:[number,number], size=20, fill='#dce8f5', justification:'left'|'center'|'right'='left') => new paper.PointText({point,content:text,fillColor:color(fill),fontFamily:'Avenir Next',fontWeight:'600',fontSize:size,justification});

function botanical() {
  const center = new paper.Point(700,455);
  for (let ring=3; ring>=0; ring--) {
    const count = 10 + ring*4;
    const radius = 110 + ring*72;
    for (let i=0;i<count;i++) {
      const angle = 360*i/count + ring*8;
      const origin = center.add(new paper.Point({length:radius*.38, angle}));
      const tip = center.add(new paper.Point({length:radius, angle}));
      const normal = new paper.Point({length:26+ring*9, angle:angle+90});
      const petal = new paper.Path({closed:true, fillColor:color(['#ff6b8a','#ffb86b','#62d6c6','#7fa8ff'][ring], .18+.08*ring), strokeColor:color(['#ff9db0','#ffd09a','#8cebdd','#a9c5ff'][ring],.78), strokeWidth:2});
      petal.add(origin); petal.cubicCurveTo(origin.add(normal),tip.add(normal.multiply(.65)),tip); petal.cubicCurveTo(tip.subtract(normal.multiply(.65)),origin.subtract(normal),origin);
      line([[origin.x,origin.y],[tip.x,tip.y]], '#d9fff7', .75, .28);
    }
  }
  new paper.Path.Circle({center,radius:88,fillColor:color('#101c35',.68),strokeColor:color('#ffd36e'),strokeWidth:3});
  for(let i=0;i<32;i++) new paper.Path.Circle({center:center.add(new paper.Point({length:34+28*(i%3)/2,angle:i*137.5})),radius:4+(i%3),fillColor:color(i%2?'#ffd36e':'#ff8d72',.9)});
  label('CHROMATIC BOTANICA', [72,88], 30, '#eff8ff');
  label('PARAMETRIC SPECIMEN  •  04', [74,122], 14, '#82c9c0');
  line([[76,150],[360,150]], '#82c9c0', 2, .7);
  label('PETAL INDEX', [1140,758], 13, '#89a7c4');
  label('18 / 14 / 12 / 10', [1140,790], 20, '#ffd36e');
}

function metro() {
  const routes = [
    {c:'#ff6b84', pts:[[90,690],[260,560],[430,610],[600,430],[790,470],[980,290],[1300,230]]},
    {c:'#51d3c8', pts:[[100,260],[300,330],[470,250],[680,360],[850,270],[1040,430],[1300,520]]},
    {c:'#7f9cff', pts:[[170,800],[330,700],[480,510],[690,570],[890,690],[1070,610],[1250,730]]},
    {c:'#ffd166', pts:[[210,120],[330,250],[520,350],[720,250],[900,400],[1080,300],[1240,400]]},
  ];
  routes.forEach((route,ri) => {
    line(route.pts as Array<[number,number]>, route.c, 18, .16);
    const p = line(route.pts as Array<[number,number]>, route.c, 5, .95);
    p.dashArray = ri%2 ? [20,8] : [];
    route.pts.forEach(([x,y],i) => {
      new paper.Path.Circle({center:[x,y],radius:i===3?14:9,fillColor:color('#101b31',.95),strokeColor:color(route.c),strokeWidth:4});
      if (i===3) new paper.Path.Circle({center:[x,y],radius:4,fillColor:color('#f3fbff')});
    });
  });
  label('CITY OF CURRENTS', [74,86], 31, '#eef7ff');
  label('A TRANSIT MAP FOR IDEAS', [75,119], 14, '#8da5bb');
  const names = [['NORTH STAR',1130,196],['WAVELENGTH',1040,470],['COMMON GROUND',520,650],['DEEP FIELD',178,835]] as const;
  names.forEach(([t,x,y])=>{label(t,[x,y],14,'#dbe8f4'); line([[x,y+10],[x+125,y+10]],'#758ea8',1,.7)});
  const rc = rough.canvas(canvas);
  rc.rectangle(52,48,1296,804,{stroke:'#65839c',strokeWidth:1.2,roughness:1.4,bowing:.4});
  rc.circle(690,450,260,{stroke:'#ffd166',strokeWidth:1.2,roughness:1.8,bowing:1.2});
}

function orbits() {
  const center = new paper.Point(714,470);
  const palette=['#50d6ca','#ffcf66','#ff6f91','#7fa6ff','#b787ff'];
  for(let i=0;i<8;i++) {
    const e = new paper.Path.Ellipse({center,size:[260+i*105,100+i*55],strokeColor:color(palette[i%palette.length],.35+.05*(i%3)),strokeWidth:1.5});
    e.rotate(-18+i*7,center);
    e.dashArray=i%2?[8,8]:[];
    const p=e.getPointAt(e.length*(.11+.087*i));
    if(p){new paper.Path.Circle({center:p,radius:8+i%3*3,fillColor:color(palette[(i+2)%palette.length],.92),shadowColor:color(palette[(i+2)%palette.length],.45),shadowBlur:15});}
  }
  new paper.Path.Circle({center,radius:70,fillColor:{gradient:{stops:['#fff0a7','#ff9b67','#e94f79'],radial:true},origin:center,destination:center.add([70,0])},strokeColor:color('#fff2b9',.8),strokeWidth:2});
  for(let i=0;i<42;i++) {
    const a=i*137.508, r=240+(i%7)*57;
    const p=center.add(new paper.Point({length:r,angle:a}));
    new paper.Path.Circle({center:p,radius:1.5+(i%4)*.7,fillColor:color(palette[i%5],.5)});
  }
  label('ORBITAL CARTOGRAPHY', [68,85], 30, '#eff7ff');
  label('FIELD NOTES / 27 AUG', [70,119], 14, '#8da9be');
  label('ε = 0.42', [1135,756], 22, '#ffd166');
  label('RESONANT WINDOW', [1135,784], 12, '#809bb1');
  line([[1095,735],[1095,810]],'#ff6f91',3,.8);
}

({botanical,metro,orbits}[scene as 'botanical'|'metro'|'orbits'] ?? botanical)();
paper.view.update();
window.__INTERACTION_COUNT__ = 0;
canvas.addEventListener('pointermove', () => { window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0)+1; canvas.style.filter='saturate(1.04)'; });
canvas.addEventListener('pointerdown', () => { window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0)+1; });
window.__VIS_READY__ = true;
