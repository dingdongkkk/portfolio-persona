/* A live, perspective-projected station. No background image is used here.
 * All geometry, train cars, doors, commuters and lights are drawn independently.
 * World coordinates: X across the platform, Y down, Z into the tunnel.
 */
(() => {
  'use strict';
  const canvas = document.getElementById('stationCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const RED = '#ef001e', INK = '#08090c', FLOOR = 1.62, CEILING = -2.4, NEAR = .65, FAR = 65;
  let width = 1, height = 1, dpr = 1, active = false, motion = true, raf = 0;
  let time = 0, previous = 0, frames = 0, phase = '', phaseLabel = '';
  let pointer = { x: 0, y: 0 }, camera = { x: 0, y: 0 };
  let focal = 1, vx = 0, vy = 0;
  const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const crowd = [
    { x: -.38, z: 3.5, size: 2.12, pose: 'hip', flip: -1, seed: .3 },
    { x: 1.15, z: 4.6, size: 2.28, pose: 'pocket', flip: 1, seed: 2.5 },
    { x: 1.92, z: 7.8, size: 2.2, pose: 'lean', flip: -1, seed: 4.8 },
    { x: -.45, z: 10, size: 2.05, pose: 'walk', flip: 1, seed: 1.1 },
    { x: .95, z: 14, size: 2.12, pose: 'hip', flip: 1, seed: 5.5 },
    { x: -.1, z: 19, size: 2.25, pose: 'pocket', flip: -1, seed: 3.2 },
    { x: 1.25, z: 27, size: 2.15, pose: 'walk', flip: -1, seed: 2.1 }
  ];

  function project([x, y, z]) {
    return [vx + (x - camera.x) * focal / z, vy + (y - camera.y) * focal / z];
  }
  // Near-plane clipping avoids exploding polygons when a carriage passes the camera.
  function clip(points) {
    const out = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      const ai = a[2] >= NEAR, bi = b[2] >= NEAR;
      if (ai) out.push(a);
      if (ai !== bi) {
        const k = (NEAR - a[2]) / (b[2] - a[2]);
        out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, NEAR]);
      }
    }
    return out;
  }
  function poly(points, fill, stroke, lineWidth = 1) {
    points = clip(points);
    if (points.length < 3) return;
    ctx.beginPath();
    points.forEach((p, i) => { const [x,y] = project(p); i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); });
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }
  function wall(x, y1, y2, z1, z2, fill, stroke) {
    if (z2 < NEAR || z1 > FAR) return;
    poly([[x,y1,z1],[x,y1,z2],[x,y2,z2],[x,y2,z1]],fill,stroke);
  }
  function floor(x1,x2,z1,z2,color,y=FLOOR) {
    poly([[x1,y,z1],[x2,y,z1],[x2,y,z2],[x1,y,z2]],color);
  }
  function line(a,b,color,size=1) {
    if(a[2]<NEAR&&b[2]<NEAR)return;
    if(a[2]<NEAR||b[2]<NEAR){const k=(NEAR-a[2])/(b[2]-a[2]);const c=a.map((v,i)=>v+(b[i]-v)*k);if(a[2]<NEAR)a=c;else b=c;}
    ctx.beginPath();ctx.moveTo(...project(a));ctx.lineTo(...project(b));ctx.strokeStyle=color;ctx.lineWidth=size;ctx.stroke();
  }
  function trainState(t) {
    const cycle = t % 22;
    if(cycle<5) return {phase:'arriving',label:'TRAIN ARRIVING',front:38-47*(1-Math.pow(1-cycle/5,3)),doors:0,speed:28.2*Math.pow(1-cycle/5,2)};
    if(cycle<6) return {phase:'stopped',label:'MIND THE GAP',front:-9,doors:ease((cycle-5.5)/.5),speed:0};
    if(cycle<10) return {phase:'boarding',label:'DOORS OPEN',front:-9,doors:1,speed:0};
    if(cycle<11.5) return {phase:'closing',label:'DOORS CLOSING',front:-9,doors:1-ease((cycle-10)/.9),speed:0};
    if(cycle<18) {const d=cycle-11.5;return {phase:'departing',label:'TRAIN DEPARTING',front:-9-d*d*3.6,doors:0,speed:d*7.2};}
    return {phase:'waiting',label:'NEXT TRAIN APPROACHING',front:-200,doors:0,speed:0};
  }

  function architecture(t, train) {
    ctx.fillStyle=INK;ctx.fillRect(0,0,width,height);
    // Tunnel, track bed, platform and flat alternating tiles.
    wall(4.9,CEILING,2.2,NEAR,FAR,'#101217');
    poly([[-4.8,CEILING,NEAR],[5,CEILING,NEAR],[5,CEILING,FAR],[-4.8,CEILING,FAR]],'#202126');
    floor(-4.8,2.13,NEAR,FAR,'#25262a');
    floor(2.13,5,NEAR,FAR,'#0a0a0c',1.94);
    for(let z=62;z>0;z-=2){
      for(let x=-5;x<2;x++) floor(x,Math.min(x+1,2.13),Math.max(z,NEAR),z+2,((x+z/2)%2)?'#242529':'#2d2e32');
      floor(2.4,4.5,z,z+.14,'#35373a',1.93);
    }
    for(const x of[2.65,3.85])floor(x,x+.055,NEAR,FAR,'#777a80',1.87);
    floor(1.9,2.08,NEAR,FAR,RED);
    floor(1.78,1.84,NEAR,FAR,'#66666a');
    floor(-3.6,-3.5,NEAR,FAR,'#b10019');
    for(let z=.8;z<40;z+=.55) floor(1.92,2.03,z,z+.075,'#80000f');
    // Left wall and repeating architectural ribs.
    wall(-3.9,-2.15,1.62,NEAR,FAR,'#303136');
    wall(-3.88,-2.15,-1.97,NEAR,FAR,'#76777a');
    wall(-3.88,1.25,1.52,NEAR,FAR,'#121316');
    for(let z=60;z>0;z-=4){
      wall(-3.84,-1.78,1.17,z+.35,z+3.7,'#1b1c20');
      poly([[-3.81,-1.65,z+.5],[-3.81,-1.65,z+1.4],[-3.81,.4,z+3.5],[-3.81,1.05,z+3]],'#3e3f43');
      poly([[-3.8,-1.6,z+2.6],[-3.8,-1.1,z+3.4],[-3.8,1.06,z+1.1],[-3.8,.7,z+.6]],'#36373b');
      wall(-3.7,CEILING,FLOOR,z,z+.12,'#626267');
      wall(-3.67,CEILING,FLOOR,z+.12,z+.32,'#16171b');
      line([-3.6,CEILING,z],[4.9,CEILING,z],'#090a0c',Math.max(1,8/z));
    }
    // White fluorescent bars; changing levels travel towards the viewer.
    for(let z=55;z>1;z-=5){
      const intensity=.85+.08*Math.sin(t*2.3-z*.8);
      for(const x of[-1.55,1.1]){
        poly([[x,CEILING+.025,z],[x+.35,CEILING+.025,z],[x+.35,CEILING+.025,z+2], [x,CEILING+.025,z+2]],`rgba(255,255,249,${intensity})`);
        poly([[x,CEILING,z],[x+.35,CEILING,z],[x+.35,CEILING+.08,z],[x,CEILING+.08,z]],'#9b9b9b');
      }
    }
    // Warm moving pools of reflected train light, without flashing the UI.
    if(train.speed>1){
      for(let i=0;i<10;i++){
        const z=1+((i*6.3+t*train.speed*.55)%55);
        floor(.85,1.88,z,z+.7,'rgba(244,231,211,.055)');
      }
    }
    // Far route marker and exit glow.
    const [sx,sy]=project([.2,-.8,42]);
    ctx.fillStyle='#d60020';ctx.fillRect(sx-10,sy-5,20,9);
  }

  function trainCar(z, index, state, t) {
    const x=2.48, end=z+9.6;
    if(end<NEAR||z>FAR)return;
    // Body panels and the thin low-poly roof, window band and undercarriage.
    wall(x,-1.76,1.52,z,end,'#a2a4a9','#141519');
    poly([[x,-1.76,z],[x+.19,-2.01,z],[x+.19,-2.01,end],[x,-1.76,end]],'#d4d5d6');
    wall(x-.008,-1.62,-1.4,z+.06,end-.06,'#ee001b');
    wall(x-.01,-1.37,-1.31,z,end,'#f4f4ec');
    wall(x-.015,1.06,1.23,z,end,'#df001b');
    wall(x-.01,1.39,1.6,z,end,'#53565e');
    wall(x+.08,1.6,1.85,z+.4,end-.4,'#08090c');
    // Car joints are visible as the whole train moves down the track.
    wall(x-.01,-1.65,1.53,z,z+.15,'#15171b');
    for(const start of[.55,2.13,6.35,7.95]){
      wall(x-.02,-1.13,.12,z+start,z+start+1.2,'#20242a','#5b5d62');
      wall(x-.025,-1.02,-.87,z+start+.08,z+start+1.1,'#c5c8bd');
      poly([[x-.027,-.78,z+start+.07],[x-.027,-.91,z+start+.6],[x-.027,-.02,z+start+1.1],[x-.027,-.02,z+start+.65]],'#343b42');
      // Passing rider silhouettes behind the windows.
      const a=z+start+.45, b=z+start+.72;
      wall(x-.03,-.59,-.31,a,b,'#090b10');
      wall(x-.03,-.29,.08,a-.09,b+.1,'#090b10');
    }
    // Double sliding doors: opening exposes the lit interior and floor.
    const a=z+3.75, b=z+5.9, mid=(a+b)/2, gap=state.doors*.95;
    wall(x-.04,-1.27,1.32,a,b,'#17191e','#51545a');
    if(gap>.001){
      wall(x-.05,-1.18,1.3,mid-gap,mid+gap,'#d1d0bd');
      wall(x-.06,-.92,.25,mid-gap,mid+gap,'#555a59');
      wall(x-.065,.26,1.29,mid-gap,mid+gap,'#878b82');
      line([x-.07,-.95,mid+.25],[x-.07,1.15,mid+.25],'#e3e3d6',2);
      floor(2.06,2.48,mid-gap,mid+gap,'#e7e3c955');
    }
    const panel=(l,r)=>{
      if(r-l<.03)return;
      wall(x-.075,-1.23,1.3,l,r,'#b3b5b8','#3f4248');
      const inset=Math.min(.14,(r-l)*.18);
      wall(x-.08,-.99,-.05,l+inset,r-inset,'#1a2026');
      wall(x-.085,-.93,-.8,l+inset,r-inset,'#aeb5b3');
      wall(x-.08,1.06,1.22,l,r,RED);
    };
    panel(a,mid-gap);panel(mid+gap,b);
    // Amber warning lamps pulse gently only during closure.
    const lamp=state.phase==='closing'?(Math.sin(t*9)>0?'#ffc44d':'#915123'):'#caccc6';
    wall(x-.05,-1.36,-1.29,mid-.2,mid+.2,lamp);
    // Car identifiers, as an actual perspective decal.
    wall(x-.028,.57,.8,z+.56,z+1.28,'#32353c');
    for(let n=0;n<=index%3;n++)wall(x-.032,.63,.72,z+.65+n*.14,z+.72+n*.14,'#e4e4df');
  }

  function trainDraw(state,t) {
    for(let i=5;i>=0;i--)trainCar(state.front+i*9.9,i,state,t);
    // Front/rear cabin has its own geometry and headlights.
    const z=state.front;
    if(z>NEAR&&z<FAR){
      poly([[2.48,-1.75,z],[2.68,-2,z],[4.03,-2,z],[4.22,-1.75,z],[4.22,1.58,z],[2.48,1.58,z]],'#bdc0c2','#101217',2);
      poly([[2.68,-1.4,z-.01],[4.02,-1.4,z-.01],[4.02,-.18,z-.01],[2.68,-.18,z-.01]],'#121820');
      poly([[2.7,-1.35,z-.02],[3.93,-1.35,z-.02],[3.25,-1.13,z-.02],[2.7,-.65,z-.02]],'#3c4955');
      poly([[2.5,.35,z-.02],[4.2,.35,z-.02],[4.2,.64,z-.02],[2.5,.64,z-.02]],RED);
      for(const x of[2.66,3.8]){
        poly([[x,.9,z-.03],[x+.22,.9,z-.03],[x+.22,1.07,z-.03],[x,1.07,z-.03]],'#fff8dc');
        const [sx,sy]=project([x+.1,1,z]);const r=clamp(focal/z*.13,2,25);
        const glow=ctx.createRadialGradient(sx,sy,0,sx,sy,r*3);glow.addColorStop(0,'#fffbdc66');glow.addColorStop(1,'#fffbdc00');ctx.fillStyle=glow;ctx.fillRect(sx-r*3,sy-r*3,r*6,r*6);
      }
      poly([[3,-1.84,z-.01],[3.72,-1.84,z-.01],[3.72,-1.55,z-.01],[3,-1.55,z-.01]],'#08090b');
      line([3.1,-1.69,z-.02],[3.63,-1.69,z-.02],'#ed102c',2);
    }
    if(state.speed>4){
      ctx.globalAlpha=clamp(state.speed/40,0,.32);
      for(let i=0;i<12;i++){
        const z=1+((i*4.7+t*state.speed)%40);
        line([2.46,-1.08+(i%4)*.48,z],[2.46,-1.08+(i%4)*.48,z+clamp(state.speed*.12,1,4)],i%3?'#e1e3e2':RED,1.2);
      }ctx.globalAlpha=1;
    }
  }

  const head = new Path2D('M-17 30L-23 16L-19 9L-25 1L-11 3L-8-5L0-1L8-8L12-1L24-3L20 7L26 13L20 31L13 45L0 51L-12 44Z');
  const mask = new Path2D('M-18 27L-5 29L0 34L6 28L20 23L15 35L5 37L0 41L-6 36L-15 35Z');
  function shape(points,color){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();}
  function limb(a,b,c,w1,w2,color){
    // Two tapered segments keep limbs solid anatomical silhouettes, not strokes.
    const segment=(p,q,pw,qw)=>{const angle=Math.atan2(q[1]-p[1],q[0]-p[0]);const dx=Math.sin(angle),dy=-Math.cos(angle);shape([[p[0]+dx*pw,p[1]+dy*pw],[q[0]+dx*qw,q[1]+dy*qw],[q[0]-dx*qw,q[1]-dy*qw],[p[0]-dx*pw,p[1]-dy*pw]],color);};
    segment(a,b,w1,w2);segment(b,c,w2,w2*.65);ctx.fillStyle=color;ctx.beginPath();ctx.arc(b[0],b[1],w2,0,Math.PI*2);ctx.fill();
  }
  function person(c,t,state){
    const walking=c.pose==='walk';
    const z=c.z+(walking?Math.sin(t*.22+c.seed)*2.1:0);
    const x=c.x+(walking?Math.sin(t*.22+c.seed)*.24:0);
    const [sx,sy]=project([x,FLOOR,z]);const scale=focal*c.size/z/235;
    const beat=t*(walking?3.4:1.8)+c.seed;
    const sway=Math.sin(beat*.55)*(walking?.025:.022);
    const breath=Math.sin(beat)*1.15;
    const step=walking?Math.sin(beat)*21:0;
    ctx.save();ctx.translate(sx,sy);
    // A projected black floor shadow stretches away from each figure.
    ctx.save();ctx.transform(scale*.95,scale*.1,-scale*.35,scale*.18,0,0);ctx.fillStyle='#050508';ctx.beginPath();ctx.ellipse(12,5,45,27,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.scale(scale*c.flip,scale);ctx.rotate(sway);ctx.translate(0,-228+breath);
    const red=c.z>12?'#d8001b':RED, dark='#970015';
    const leftFoot=[-16+step,222],rightFoot=[18-step,222];
    if(c.pose==='hip') {leftFoot[0]=-24;rightFoot[0]=9;}
    if(c.pose==='lean'){leftFoot[0]=-28;rightFoot[0]=14;}
    limb([-11,124],[-15+step*.55,173-Math.abs(step)*.18],leftFoot,10,6.7,dark);
    limb([11,124],[14-step*.5,172-Math.abs(step)*.12],rightFoot,10.5,6.5,red);
    shape([[leftFoot[0]-6,215],[leftFoot[0]+5,218],[leftFoot[0]+10,227],[leftFoot[0]-12,228],[leftFoot[0]-12,223]],red);
    shape([[rightFoot[0]-6,216],[rightFoot[0]+5,218],[rightFoot[0]+15,224],[rightFoot[0]+14,228],[rightFoot[0]-8,228]],red);
    let leftElbow=[-29,91],leftHand=[-26-step*.45,123],rightElbow=[29,91],rightHand=[25+step*.45,121];
    if(c.pose==='hip'){rightElbow=[46,83+Math.sin(beat)*1.2];rightHand=[20,111];leftElbow=[-28,93];leftHand=[-19,130];}
    if(c.pose==='pocket'){leftElbow=[-36,91];leftHand=[-13,116];rightElbow=[32,94];rightHand=[15,113];}
    if(c.pose==='lean'){leftElbow=[-36,76];leftHand=[-5,92];rightElbow=[35,89];rightHand=[-15,97];}
    limb([-20,61],leftElbow,leftHand,8.5,6,red);
    limb([20,61],rightElbow,rightHand,8.5,6,red);
    // Neck, angular collar, jacket, hem and small silhouette details.
    shape([[-8,43],[9,43],[11,56],[24,62],[19,102],[23,134],[5,136],[0,125],[-5,136],[-22,133],[-18,100],[-25,61],[-10,55]],red);
    shape([[-10,54],[-2,72],[0,101],[5,74],[12,53],[7,65],[0,74],[-7,65]],dark);
    if(c.pose==='hip')shape([[-19,115],[20,112],[31,146],[-26,144]],red);
    ctx.save();ctx.translate(Math.sin(beat*.6)*1.2,-2);ctx.rotate(Math.sin(beat*.5)*.025);
    ctx.fillStyle=red;ctx.fill(head);ctx.fillStyle='#fff';ctx.fill(mask);
    shape([[-13,30],[-5,32],[-9,34]],'#111');shape([[8,30],[15,27],[12,32]],'#111');
    ctx.restore();
    // Jacket tails respond to the train's passing air.
    if(state.speed>5){const flutter=Math.sin(t*11+c.seed)*clamp(state.speed/12,0,3);shape([[-20,111],[-24-flutter,140],[-6,134]],red);}
    ctx.restore();
  }

  function pillar(z){
    const x=-3.2;
    wall(x,CEILING,FLOOR,z,z+.34,'#424349');
    poly([[x,CEILING,z],[x+.3,CEILING,z],[x+.3,FLOOR,z],[x,FLOOR,z]],'#53545a');
    poly([[x,-.06,z-.01],[x+.3,-.06,z-.01],[x+.3,.22,z-.01],[x,.22,z-.01]],RED);
    wall(x+.305,-.06,.22,z,z+.34,'#af0016');
  }
  function sign(t,state){
    const x=.7,z=13,y=-1.83,[sx,sy]=project([x,y,z]),s=focal/z;
    // Hanging destination board in the world, independent of the menu UI.
    line([x-.65,CEILING,z],[x-.65,y,z],'#89898b',2);
    line([x+1.55,CEILING,z],[x+1.55,y,z],'#89898b',2);
    ctx.save();ctx.translate(sx,sy);ctx.transform(1,-.035,.04,1,0,0);
    ctx.fillStyle='#060708';ctx.fillRect(-s*.85,-s*.08,s*2.65,s*.71);
    ctx.fillStyle=RED;ctx.fillRect(-s*.85,-s*.08,s*.56,s*.71);
    ctx.fillStyle='#fff';ctx.font=`bold ${s*.4}px sans-serif`;ctx.fillText('01',-s*.8,s*.42);
    ctx.font=`bold ${s*.16}px sans-serif`;ctx.fillText('THE UNDERGROUND',-s*.15,s*.18);
    ctx.fillStyle=state.phase==='boarding'?'#ffffff':'#ff2840';ctx.font=`${s*.12}px monospace`;ctx.fillText(state.label,-s*.15,s*.43);ctx.restore();
  }
  function particles(t,state){
    for(let i=0;i<18;i++){
      const seed=i*13.17, z=3+((i*7.5+t*.14)%35);
      const x=Math.sin(seed+t*.16)*2.1, y=Math.cos(seed+t*.29)*1.1;
      const [sx,sy]=project([x,y,z]);ctx.fillStyle=i%4?'#fff2':'#f2003044';
      const r=clamp(focal/z*.017,.6,2.4);ctx.fillRect(sx,sy,r,r*.5);
    }
  }
  function render(){
    const state=trainState(time);
    focal=Math.max(height*.87,width*.59);
    vx=width*(width<761?.49:.62)+Math.sin(time*.19)*width*.005;
    vy=height*.39+Math.sin(time*.27)*height*.003;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    architecture(time,state);trainDraw(state,time);
    // Fog stays behind the foreground figures so their red silhouettes remain crisp.
    const fog=ctx.createRadialGradient(vx,vy,0,vx,vy,height*.27);fog.addColorStop(0,'#090a0ee6');fog.addColorStop(.25,'#090a0e99');fog.addColorStop(1,'#090a0e00');ctx.fillStyle=fog;ctx.fillRect(0,0,width,height);
    const objects=crowd.map(c=>({z:c.z,draw:()=>person(c,time,state)}));
    for(const z of[4,11,18,25,32,39])objects.push({z,draw:()=>pillar(z)});
    objects.sort((a,b)=>b.z-a.z).forEach(o=>o.draw());
    if(width>760)sign(time,state);particles(time,state);
    const shade=ctx.createLinearGradient(0,0,0,height);shade.addColorStop(0,'#00000020');shade.addColorStop(.65,'#00000000');shade.addColorStop(1,'#00000060');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    frames++;
    if(phase!==state.phase||phaseLabel!==(motion?state.label:'SCENE PAUSED')){
      phase=state.phase;phaseLabel=motion?state.label:'SCENE PAUSED';
      canvas.dataset.phase=phase;
      const status=document.getElementById('trainStatus');if(status)status.textContent=phaseLabel;
    }
  }
  function tick(now){
    raf=0;
    if(!active||!motion||document.hidden){previous=0;return;}
    if(previous)time+=Math.min((now-previous)/1000,.05);
    previous=now;
    camera.x+=(pointer.x*.18-camera.x)*.035;
    camera.y+=(pointer.y*.09-camera.y)*.035;
    render();raf=requestAnimationFrame(tick);
  }
  function sync(){
    cancelAnimationFrame(raf);raf=0;previous=0;
    if(active){render();if(motion&&!document.hidden)raf=requestAnimationFrame(tick);}
  }
  function resize(){
    width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,width<761?1.5:2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);if(active)render();
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){pointer.x=e.clientX/width-.5;pointer.y=e.clientY/height-.5;}},{passive:true});
  document.addEventListener('visibilitychange',sync);
  window.StationRenderer={
    setActive(value){active=value;sync();},
    setMotion(value){motion=value;sync();},
    replay(){time=0;sync();},
    getState(){const train=trainState(time);return {active,motion,time,frames,phase:train.phase,trainZ:train.front,doorOpening:train.doors,running:!!raf};}
  };
  resize();
})();
