import paper from 'paper';
import rough from 'roughjs/bundled/rough.esm.js';
import { mountArrowLibrary } from './arrow-library';
import './style.css';

declare global { interface Window { __VIS_READY__?: boolean; __INTERACTION_COUNT__?: number } }

const W = 1400, H = 900;
const scene = new URLSearchParams(location.search).get('scene') ?? 'botanical';
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<canvas id="stage" width="${W}" height="${H}" aria-label="${scene}"></canvas>`;
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

function topology() {
  label('OBSERVABLE SYSTEM TOPOLOGY',[70,82],30);label('SERVICES • QUEUES • STORES • SIGNALS',[72,116],14,'#82a4ba');
  const groups=[{x:90,w:315,n:'EDGE',c:'#54d6c6'},{x:520,w:350,n:'STREAM',c:'#7b9cff'},{x:985,w:310,n:'PRODUCTS',c:'#ff6f91'}];
  groups.forEach(g=>{const box=new paper.Path.Rectangle({rectangle:new paper.Rectangle(g.x,180,g.w,570),radius:new paper.Size(24,24)});box.strokeColor=color(g.c,.55);box.fillColor=color('#10213a',.18);box.dashArray=[8,7];label(g.n,[g.x+28,218],15,g.c)});
  const nodes=[['Sensors',150,300,0],['Gateway',150,510,0],['Event log',590,285,1],['Quality',590,500,1],['State',770,390,1],['Lake',1055,285,2],['Model',1055,500,2],['Portal',1185,650,2]] as const;
  nodes.forEach(([n,x,y,i])=>{const b=new paper.Path.Rectangle({rectangle:new paper.Rectangle(x,y,165,72),radius:new paper.Size(14,14)});b.fillColor=color('#162b47',.88);b.strokeColor=color(groups[i].c,.9);b.strokeWidth=2;label(n,[x+82,y+43],15,'#e8f5fb','center')});
  const edges=[[315,336,590,321],[232,372,232,510],[315,546,590,536],[755,321,852,390],[755,536,852,426],[935,390,1055,321],[935,426,1055,536],[1137,572,1267,650]];
  edges.forEach((e,i)=>{const p=line([[e[0],e[1]],[e[2],e[3]]],groups[i%3].c,2.5,.75);p.dashArray=i%3===1?[7,6]:[]});
  for(let i=0;i<18;i++)new paper.Path.Circle({center:[82+i*70,815],radius:2+i%3,fillColor:color(groups[i%3].c,.6)});
}

function isometricCity() {
  label('ISOMETRIC CLIMATE DISTRICT',[70,82],30);label('ENERGY • WATER • MOBILITY LAYERS',[72,116],14,'#82a4ba');
  const origin=new paper.Point(700,210),sx=70,sy=38;
  for(let gy=0;gy<8;gy++)for(let gx=0;gx<10;gx++){
    const x=origin.x+(gx-gy)*sx*.52,y=origin.y+(gx+gy)*sy*.55;
    const h=30+((gx*17+gy*29)%5)*24,w=52;
    const top=new paper.Path({segments:[[x,y-h],[x+w/2,y-h+14],[x,y-h+28],[x-w/2,y-h+14]],closed:true,fillColor:color(['#54d6c6','#7b9cff','#ffd166'][((gx+gy)%3)],.52),strokeColor:color('#d8f5ff',.45),strokeWidth:1});
    const left=new paper.Path({segments:[[x-w/2,y-h+14],[x,y-h+28],[x,y+28],[x-w/2,y+14]],closed:true,fillColor:color('#17344f',.74)});const right=left.clone();right.scale(-1,1,[x,y]);right.fillColor=color('#244261',.72);top.bringToFront();
    if((gx+gy)%4===0)new paper.Path.Circle({center:[x,y-h+14],radius:5,fillColor:color('#ff6f91')});
  }
  line([[180,720],[470,565],[780,730],[1180,520]],'#ff6f91',8,.35);line([[180,720],[470,565],[780,730],[1180,520]],'#ffd166',2.5,.95);label('CIRCULAR TRANSIT LOOP',[920,780],14,'#ffd166');
}

function waveLab() {
  label('COUPLED OSCILLATOR LAB',[70,82],30);label('FOUR VIEWS OF ONE DYNAMICAL SYSTEM',[72,116],14,'#82a4ba');
  const panels=[[70,180,600,260],[730,180,600,260],[70,500,600,260],[730,500,600,260]];
  panels.forEach((r,i)=>{const b=new paper.Path.Rectangle({rectangle:new paper.Rectangle(r[0],r[1],r[2],r[3]),radius:new paper.Size(18,18)});b.fillColor=color('#10213a',.24);b.strokeColor=color(['#54d6c6','#7b9cff','#ff6f91','#ffd166'][i],.45);label(['TIME DOMAIN','PHASE PORTRAIT','SPECTRUM','ENVELOPE'][i],[r[0]+24,r[1]+36],13,'#9bb3c5');
    for(let g=1;g<5;g++)line([[r[0]+20,r[1]+g*45],[r[0]+r[2]-20,r[1]+g*45]],'#55738a',.6,.2);
  });
  const pts=Array.from({length:240},(_,i):[number,number]=>[95+i*2.25,310+65*Math.sin(i*.12)+24*Math.sin(i*.37)]);line(pts,'#54d6c6',2.3,.9);
  const orbit=Array.from({length:260},(_,i):[number,number]=>[1030+160*Math.cos(i*.11)*(1-.0015*i),310+88*Math.sin(i*.13)*(1-.0015*i)]);line(orbit,'#7b9cff',2,.85);
  for(let i=0;i<32;i++){const h=150*Math.exp(-Math.pow((i-8)/3,2))+90*Math.exp(-Math.pow((i-21)/4,2));const b=new paper.Path.Rectangle(new paper.Rectangle(100+i*17,725-h,11,h));b.fillColor=color('#ff6f91',.65)}
  const env=Array.from({length:200},(_,i):[number,number]=>[755+i*2.7,650-85*Math.sin(i*.18)*Math.exp(-i/120)]);line(env,'#ffd166',2.4,.9);
}

function contourMap() {
  label('FJORD EXPEDITION MAP',[70,82],30);label('CONTOURS • ROUTES • FIELD STATIONS',[72,116],14,'#82a4ba');
  const center=new paper.Point(710,475);
  for(let ring=0;ring<15;ring++){const p=new paper.Path({strokeColor:color(ring%4===0?'#54d6c6':'#58788e',ring%4===0?.65:.25),strokeWidth:ring%4===0?2:1,closed:true});for(let a=0;a<360;a+=5){const rad=95+ring*24+18*Math.sin((a*3+ring*31)*Math.PI/180)+8*Math.cos((a*7-ring*19)*Math.PI/180);p.add(center.add(new paper.Point({length:rad,angle:a})));}p.smooth({type:'continuous'});}
  const route=line([[180,680],[340,570],[520,620],[690,420],[880,490],[1050,310],[1250,260]],'#ff6f91',4,.95);route.dashArray=[14,7];
  [[340,570],[690,420],[1050,310],[880,490]].forEach((p,i)=>{new paper.Path.Circle({center:p,radius:12,fillColor:color('#0d1b30'),strokeColor:color(['#ffd166','#54d6c6','#7b9cff','#ff6f91'][i]),strokeWidth:4});label(`S-${i+1}`,[p[0]+18,p[1]-14],13,'#e4f2f9')});
  label('DEPTH INTERVAL 20 m',[1040,780],13,'#7f9cb0');
}

function circuit() {
  label('ANALOG VOICE / SIGNAL PATH',[70,82],30);label('OSCILLATOR → FILTER → ENVELOPE → OUTPUT',[72,116],14,'#82a4ba');
  const modules=[['VCO',100,280,'#54d6c6'],['MIX',360,280,'#7b9cff'],['VCF',620,280,'#ff6f91'],['VCA',880,280,'#ffd166'],['OUT',1140,280,'#b889ff']] as const;
  modules.forEach(([n,x,y,c],i)=>{const b=new paper.Path.Rectangle({rectangle:new paper.Rectangle(x,y,170,260),radius:new paper.Size(20,20)});b.fillColor=color('#132741',.72);b.strokeColor=color(c,.9);b.strokeWidth=2;label(n,[x+85,y+46],20,c,'center');for(let k=0;k<3;k++){new paper.Path.Circle({center:[x+45+k*40,y+105],radius:12,strokeColor:color(c,.7),strokeWidth:2});line([[x+35+k*40,y+160],[x+55+k*40,y+190]],c,2,.6)}if(i<4)line([[x+170,y+130],[x+260,y+130]],c,4,.8)});
  const mod=line([[180,690],[440,630],[705,705],[960,620],[1220,680]],'#54d6c6',3,.7);mod.dashArray=[8,7];label('CONTROL VOLTAGE BUS',[100,735],13,'#54d6c6');
}

function timeline() {
  label('MISSION 42 / OPERATIONS TIMELINE',[70,82],30);label('DEPENDENCIES, PARALLEL WORK, DECISION WINDOWS',[72,116],14,'#82a4ba');
  const lanes=['SCIENCE','FLIGHT','COMMS','GROUND','PUBLIC'];lanes.forEach((n,i)=>{const y=220+i*110;label(n,[80,y+8],13,['#54d6c6','#7b9cff','#ff6f91','#ffd166','#b889ff'][i]);line([[190,y],[1300,y]],'#57768c',1,.25)});
  const events=[[0,1,2.2,0],[1,2.4,4.5,1],[2,.4,2.8,2],[3,3.8,6.3,3],[4,5.4,8.4,4],[0,7.2,9.6,0],[2,8.8,10.4,2]];
  events.forEach(([lane,a,b,c],i)=>{const x=210+a*100,y=198+lane*110,w=(b-a)*100;const bar=new paper.Path.Rectangle({rectangle:new paper.Rectangle(x,y,w,42),radius:new paper.Size(14,14)});bar.fillColor=color(['#54d6c6','#7b9cff','#ff6f91','#ffd166','#b889ff'][c],.45);bar.strokeColor=color(['#54d6c6','#7b9cff','#ff6f91','#ffd166','#b889ff'][c],.9);label(['CALIBRATE','BURN','DOWNLINK','MODEL','BRIEF','SAMPLE','RELAY'][i],[x+12,y+27],12,'#edf8ff')});
  for(let d=0;d<=10;d++){const x=210+d*100;line([[x,175],[x,780]],'#647f93',.6,.18);label(`D+${d}`,[x,810],11,'#7895aa','center')}
}

function molecule() {
  label('MOLECULAR GEOMETRY ATLAS',[70,82],30);label('BONDS • FUNCTIONAL GROUPS • ELECTRON DENSITY',[72,116],14,'#82a4ba');
  const atoms=Array.from({length:24},(_,i)=>{const a=i*.82,r=85+i*16;return {p:[700+Math.cos(a)*r,470+Math.sin(a)*r*.58] as [number,number],c:['#54d6c6','#ff6f91','#7b9cff','#ffd166'][i%4],s:12+(i%5)*3}});
  atoms.forEach((a,i)=>{if(i)line([atoms[i-1].p,a.p],i%3===0?'#ffd166':'#7d9bb0',3,i%3===0?.8:.45);new paper.Path.Circle({center:a.p,radius:a.s,fillColor:color(a.c,.78),strokeColor:color('#edf8ff',.55),strokeWidth:1.5});if(i%6===0)label(['OH','NH₂','COO','CH₃'][i/6],[a.p[0]+18,a.p[1]-20],13,a.c)});
  for(let i=0;i<5;i++){const e=new paper.Path.Ellipse({center:[700,470],size:[500+i*90,180+i*46],strokeColor:color('#54d6c6',.12),strokeWidth:10});e.rotate(i*13)}
}

function loom() {
  label('ALGORITHMIC LOOM',[70,82],30);label('A REPEATABLE GRAMMAR OF CROSSING RIBBONS',[72,116],14,'#82a4ba');
  for(let i=0;i<18;i++){const y=190+i*34;const pts=Array.from({length:80},(_,k):[number,number]=>[80+k*16, y+28*Math.sin(k*.22+i*.63)+12*Math.sin(k*.61-i)]);line(pts,['#54d6c6','#7b9cff','#ff6f91','#ffd166','#b889ff'][i%5],7,i%3===0?.62:.28)}
  for(let i=0;i<15;i++){const x=130+i*84;const pts=Array.from({length:45},(_,k):[number,number]=>[x+22*Math.sin(k*.33+i),170+k*15]);const p=line(pts,['#ffd166','#ff6f91','#54d6c6'][i%3],3,.42);p.dashArray=[9,7]}
  const frame=new paper.Path.Rectangle({rectangle:new paper.Rectangle(58,160,1284,650),radius:new paper.Size(26,26)});frame.strokeColor=color('#d9f3ff',.35);frame.strokeWidth=2;
}

function typeSystem() {
  label('MODULAR TYPE SYSTEM',[70,82],30);label('8 PT BASELINE • 1.25 SCALE • EDITORIAL GRID',[72,116],14,'#82a4ba');
  for(let i=0;i<14;i++)line([[72+i*92,160],[72+i*92,820]],'#55768d',.7,.18);
  const words=[['FORM',76,320,108,'#54d6c6'],['FOLLOWS',74,430,76,'#edf8ff'],['FUNCTION',72,540,94,'#ff6f91'],['/ 2026',965,620,52,'#ffd166']] as const;
  words.forEach(([t,x,y,s,c])=>label(t,[x,y],s,c));
  const sizes=[12,15,19,24,30,38];sizes.forEach((s,i)=>{label(`${s}  Aa Bb 0123`,[900,210+i*57],s,'#8eabc0');new paper.Path.Circle({center:[850,205+i*57],radius:3+i*1.3,fillColor:color(['#54d6c6','#7b9cff','#ff6f91'][i%3])})});
  label('GRID / RHYTHM / CONTRAST / HIERARCHY',[75,785],14,'#7f9cb0');
}

const renderers:Record<string,()=>void>={botanical,metro,orbits,topology,'isometric-city':isometricCity,'wave-lab':waveLab,'contour-map':contourMap,circuit,timeline,molecule,loom,'type-system':typeSystem};

if (scene === 'arrow-library') {
  mountArrowLibrary(app);
} else {
  (renderers[scene]??botanical)();
  paper.view.update();
  window.__INTERACTION_COUNT__ = 0;
  canvas.addEventListener('pointermove', () => { window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0)+1; canvas.style.filter='saturate(1.04)'; });
  canvas.addEventListener('pointerdown', () => { window.__INTERACTION_COUNT__ = (window.__INTERACTION_COUNT__ ?? 0)+1; });
  window.__VIS_READY__ = true;
}
