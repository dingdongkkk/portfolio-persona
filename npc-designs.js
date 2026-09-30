/* Original, articulated fashion silhouettes for the station crowd.
 * A 320-unit figure grid keeps adult proportions consistent across designs.
 * Curved contours, asymmetrical hair, tailored clothing and individual masks
 * replace the old shared polygon mannequin. All parts stay independently animated.
 */
(() => {
  'use strict';
  const paths = new Map();
  const path = d => {
    if (!paths.has(d)) {
      // Animated fold paths must never accumulate indefinitely.
      if (paths.size >= 512) paths.delete(paths.keys().next().value);
      paths.set(d, new Path2D(d));
    }
    return paths.get(d);
  };
  const palette = { red:'#ef0829', light:'#ff2943', shade:'#b00022', deep:'#71051b', ink:'#180a15', white:'#fffaf1' };
  let ctx;
  const fill = (d, color=palette.red) => {ctx.fillStyle=color;ctx.fill(path(d));};
  const line = (d,color=palette.deep,width=.9) => {ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke(path(d));};
  function part(x,y,angle,draw){ctx.save();ctx.translate(x,y);ctx.rotate(angle);draw();ctx.restore();}

  // A curved, tapered sleeve or trouser leg around three articulated joints.
  function limb(a,b,c,upper,lower,end,color){
    const normal=(p,q)=>{const r=Math.atan2(q[1]-p[1],q[0]-p[0]);return[-Math.sin(r),Math.cos(r)];};
    const u=normal(a,b),v=normal(b,c),m=[(u[0]+v[0])/2,(u[1]+v[1])/2];
    const edge=(p,n,w,side)=>[p[0]+n[0]*w*side,p[1]+n[1]*w*side];
    const al=edge(a,u,upper,1),bl=edge(b,m,lower,1),cl=edge(c,v,end,1);
    const ar=edge(a,u,upper,-1),br=edge(b,m,lower,-1),cr=edge(c,v,end,-1);
    ctx.beginPath();ctx.moveTo(...al);
    ctx.quadraticCurveTo(al[0]+(bl[0]-al[0])*.7,al[1]+(bl[1]-al[1])*.5,...bl);
    ctx.quadraticCurveTo(bl[0]+(cl[0]-bl[0])*.15,bl[1]+(cl[1]-bl[1])*.65,...cl);
    ctx.lineTo(...cr);ctx.quadraticCurveTo(br[0]+(cr[0]-br[0])*.3,br[1]+(cr[1]-br[1])*.4,...br);
    ctx.quadraticCurveTo(ar[0]+(br[0]-ar[0])*.8,ar[1]+(br[1]-ar[1])*.3,...ar);ctx.closePath();ctx.fillStyle=color;ctx.fill();
  }
  function hand(x,y,angle,glove=false){part(x,y,angle,()=>{
    fill('M-4-4L4-4L5 1L7 5Q8 8 5 8L3 4L3 13Q2 16 0 14L-1 7L-1 16Q-3 17-4 14L-5 8L-6 13Q-8 13-8 10L-8 1Z',glove?palette.ink:palette.red);
    if(!glove)line('M-5 0L-1 2L2 1',palette.shade,.6);
  });}
  function shoe(x,y,angle,boot=false){part(x,y,angle,()=>{
    fill(boot?'M-6-17L5-17L5-5L9 2L19 7Q22 10 18 12L-9 12L-10 8L-7 4Z':'M-6-5L5-5L7 1L16 4Q22 6 21 10L-10 10L-10 5Z');
    fill(boot?'M-9 7L20 8L18 12L-9 12Z':'M-10 7L21 7L21 10L-10 10Z',palette.ink);
    line('M-3 1L3 0M0 4L6 3',palette.shade,.8);
    if(boot){line('M-6-11L5-11',palette.ink,2);fill('M-2-13L2-13L2-9L-2-9Z',palette.light);}
  });}
  function face(kind,tilt,t){part(0,24,tilt,()=>{
    ctx.scale(.87,.87);
    // A three-quarter face: ear, nose, jaw and chin are part of the silhouette.
    fill('M-15 9Q-19-4-10-11Q2-19 13-9Q21-3 16 12L19 18L13 21L10 30L0 36L-10 30L-15 17Q-20 18-21 12Q-22 7-17 8Z');
    fill('M10 2L16 10L14 17L18 18L11 21L8 29L0 36L-1 28L5 20Z',palette.shade);
    line('M-18 10L-17 14M5 26L10 25',palette.deep,.7);
    if(kind==='muse'){
      // Asymmetrical bob with separate pointed locks, not a helmet shape.
      fill('M-18 22Q-29 5-21-9Q-18-18-5-19Q11-22 21-10Q27-1 20 11L19 28L25 39L15 35L12 29L10 13L13-1L6 5L8-7L-4 3L-9 2L-11 12L-14 26L-12 37L-23 33L-26 38L-25 22Z');
      fill('M-19 0L-16-8L-6-13L-13 3L-14 18L-19 25Z',palette.shade);
      line('M-3-14Q7-18 16-9M17-4L16 8',palette.light,.8);
      // A narrow cat-eye mask follows the brow; the face remains visible.
      fill('M-17 11L-7 13L-1 17L4 12L17 8L13 20L5 22L0 20L-5 23L-13 20Z',palette.white);
      fill('M-12 15L-4 18L-9 19ZM6 16L13 12L11 18Z',palette.ink);
    }else if(kind==='rebel'){
      fill('M-17 20L-23 12L-22 3L-27-1L-19-6L-24-12L-12-12L-12-19L-2-15L5-23L9-17L22-18L18-10L28-7L22 1L24 9L17 17L16 2L10 12L7-1L-1 9L-2-4L-12 11L-12 1Z');
      fill('M-16-8L-8-13L-3-8L-10-2ZM7-13L16-14L11-7Z',palette.shade);
      fill('M-19 10L-6 13L0 17L5 11L20 5L15 19L5 23L0 20L-6 23L-16 18Z',palette.white);
      fill('M-13 14L-5 17L-10 19ZM7 15L15 9L12 17Z',palette.ink);
    }else if(kind==='executive'){
      fill('M-18 17Q-24 6-19-6Q-14-18 0-18L14-22L11-16Q24-13 22-4L18 6L14 9L13-4Q-4 1-12-3L-14 13Z');
      fill('M-16-8Q-3-14 10-12L-1-6Z',palette.shade);
      // Straight, severe eye band for the commuter in a suit.
      fill('M-17 12L-2 15L2 15L16 10L13 21L4 22L0 18L-4 23L-14 21Z',palette.white);
      fill('M-12 16L-5 17L-8 20ZM5 17L12 14L10 19Z',palette.ink);
    }else{
      // Loose short hair and headphones distinguish the courier.
      fill('M-19 17L-24 7L-19 2L-22-9L-12-8L-8-17L0-13L11-20L12-11L22-8L18 1L22 7L17 14L12 2L4 9L2-2L-6 6L-11 1Z');
      line('M-21 7Q-25-16-1-20Q21-19 22 4',palette.ink,3.2);
      fill('M-24 5L-18 3L-17 18L-23 19ZM17 2L22 1L23 15L18 17Z',palette.deep);
      fill('M-16 12L-4 15L0 18L6 12L17 10L12 22L4 22L0 20L-6 23L-13 20Z',palette.white);
      fill('M-11 16L-4 18L-8 20ZM6 17L13 13L11 19Z',palette.ink);
    }
    // Slight head turn is independent of torso sway; no blinking mask artifacts.
  });}

  function legs(kind,step,lean){
    const feminine=kind==='muse';
    const hips=feminine?[[-9,164],[9,164]]:[[-10,149],[10,149]];
    const knees=feminine?[[-14,228], [13,227]]:[[-13,226], [15,227]];
    const feet=feminine?[[-18,306],[18,304]]:[[-19,307],[23,305]];
    if(kind==='rebel'){knees[0]=[-17,227];feet[0]=[-22,307];knees[1]=[17,224];feet[1]=[24,305];}
    if(kind==='executive'){knees[0]=[-7,224];feet[0]=[9,305];feet[1]=[27,305];}
    knees[0][0]+=step*.45;knees[1][0]-=step*.45;feet[0][0]+=step;feet[1][0]-=step;
    knees[0][1]-=Math.abs(step)*.15;knees[1][1]-=Math.abs(step)*.15;
    limb(hips[0],knees[0],feet[0],feminine?8.8:10.2,5.6,3.8,palette.shade);
    limb(hips[1],knees[1],feet[1],feminine?9.3:11,5.8,4.2,palette.red);
    if(feminine){
      // Tailored ankle boots and slim socks, with a clear knee silhouette.
      line(`M${knees[1][0]-4} ${knees[1][1]+9}l8-1`,palette.deep,1.5);
      limb([knees[0][0],knees[0][1]+12],[feet[0][0]-1,275],feet[0],5.5,4.8,5.1,palette.deep);
      limb([knees[1][0],knees[1][1]+11],[feet[1][0]-1,275],feet[1],5.7,5,5.4,palette.shade);
    }else{
      line(`M-3 161L${knees[1][0]-4} ${knees[1][1]-6}M${knees[1][0]+2} ${knees[1][1]+6}L${feet[1][0]+2} 289`,palette.deep,.9);
      line(`M${knees[1][0]-4} ${knees[1][1]-2}l9 3l-7 4`,palette.shade,1);
    }
    shoe(...feet[0],-.11,feminine||kind==='rebel');shoe(...feet[1],.03,feminine||kind==='rebel');
  }
  function jacket(kind,breath,wind){
    // Neck connects into the collar with human shoulder slopes.
    fill('M-7 48L7 46L7 59L15 65L2 82L-13 67L-7 59Z');
    fill('M2 52L7 48L7 60L2 69L-3 61Z',palette.shade);
    if(kind==='muse'){
      fill('M-9 60L-22 66Q-30 69-31 77L-25 93L-18 120L-21 145L-8 153L3 145L13 150L22 140L17 116L26 78Q26 70 16 65L8 58L1 82Z');
      fill('M-18 138Q1 143 19 136L29 182Q13 189-29 184Z');
      fill('M-10 147L-14 183L-7 184L-4 145ZM10 145L13 185L20 184L16 143Z',palette.shade);
      line('M-21 146L-24 181M0 148L1 183M19 146L24 180',palette.deep,.9);
      fill('M-9 61L1 79L9 59L6 96L-3 107Z',palette.ink);
      fill('M-9 60L-15 69L-4 82L-9 89L-1 104L-2 78ZM9 59L17 68L9 81L13 87L0 106L4 78Z',palette.light);
      fill('M-3 80L2 77L5 83L1 91L-3 88Z',palette.white);
      fill('M-3 87L1 90L0 110L-5 106Z',palette.deep);
      line('M-17 120L-9 122M10 119L17 117',palette.ink,1.3);
      fill('M-1 118L1 118L1 121L-1 121ZM0 131L2 131L2 134L0 134Z',palette.white);
    }else if(kind==='rebel'){
      const flap=Math.sin(wind*.8)*1.8;
      fill(`M-9 59L-26 66Q-35 67-34 79L-27 103L-23 135L${-33-flap} 194L-10 189L-1 166L5 191L${32+flap} 187L24 139L23 110L30 82Q33 70 23 66L9 58L1 82Z`);
      fill('M-8 62L1 81L8 61L13 100L8 136L-7 137L-12 103Z',palette.ink);
      fill('M-10 59L-21 68L-12 82L-18 87L-2 127L-3 86ZM10 59L22 70L14 81L19 87L5 127L5 84Z',palette.shade);
      line('M-19 90L-6 124M18 90L8 122',palette.light,.9);
      fill('M-21 131L-2 138L-9 183L-27 190Z',palette.shade);
      line('M-22 137L-10 136M13 136L23 131',palette.ink,1.4);
      fill('M-4 137L9 137L9 141L-4 141Z',palette.deep);
      fill('M0 136L6 136L6 142L0 142Z',palette.light);
      line('M20 144L25 180',palette.light,.6);
    }else if(kind==='executive'){
      fill('M-9 60L-27 67Q-33 69-32 80L-25 112L-25 159L-5 157L0 144L5 157L25 158L22 112L29 80Q29 72 23 67L9 59L0 85Z');
      fill('M-8 63L1 84L8 62L7 117L-5 119Z',palette.deep);
      fill('M-8 61L1 76L8 61L5 88L-4 89Z',palette.white);
      fill('M-2 78L2 77L4 83L1 89L4 115L0 121L-4 116L-1 88L-4 83Z',palette.ink);
      fill('M-9 61L-20 70L-12 84L-18 91L0 129L-4 88ZM9 60L19 70L11 83L16 89L1 129L5 88Z',palette.shade);
      line('M-22 136L-11 136M12 135L21 133M13 93L22 92',palette.ink,1);
      fill('M-1 130L2 130L2 133L-1 133Z',palette.white);
    }else{
      fill('M-11 57Q-26 57-30 70L-33 89L-26 117L-26 148Q-4 154 23 146L23 113L30 86L26 71Q20 59 10 58L0 79Z');
      fill('M-10 59Q-23 62-20 78L-10 91L-1 79L9 91L21 75Q23 63 10 57L1 76Z',palette.shade);
      line('M-9 83L-8 108M9 84L10 105',palette.white,.7);
      fill('M-3 83L0 79L3 84L2 150L-1 150Z',palette.deep);
      fill('M-19 122L-5 117L-5 138L-20 139ZM7 118L19 122L20 137L7 137Z',palette.shade);
      line('M-25 146Q-1 153 23 145',palette.ink,2);
      // Cross-body messenger strap is a strong identifying silhouette detail.
      line('M-22 66Q-8 94 23 126',palette.ink,5);
      line('M-22 66Q-8 94 23 126',palette.light,1);
    }
  }
  function arms(kind,t,step){
    const idle=Math.sin(t*1.2)*1.1;
    let left=[[-28,76],[-35,116],[-27,156]],right=[[26,75],[36,114],[25,156]];
    if(kind==='muse'){right=[[25,75],[49,104],[19,126]];left=[[-26,76],[-30,119],[-21,157]];}
    if(kind==='rebel'){left=[[-29,75],[-39,115],[-15,141]];right=[[28,75],[38,112],[17,139]];}
    if(kind==='executive'){left=[[-28,76],[-34,119],[-24,159]];right=[[26,75],[37,110],[17,129]];}
    if(kind==='courier'){left=[[-29,78],[-31-step*.4,114],[-25-step*.6,150]];right=[[26,76],[29+step*.4,111],[29+step*.6,149]];}
    left[1][0]+=idle;right[1][0]-=idle*.6;
    const cuff=(a,b)=>{const angle=Math.atan2(b[1]-a[1],b[0]-a[0])-Math.PI/2;part(...b,angle,()=>{fill('M-5-6L5-6L5 0L-5 0Z',palette.shade);line('M-4-3L4-3',palette.deep,.8);});};
    limb(...left,8,6.7,4.8,palette.shade);limb(...right,8,6.3,4.6,palette.red);
    cuff(left[1],left[2]);cuff(right[1],right[2]);
    if(kind!=='rebel'){hand(...left[2],-.08);}
    if(kind==='muse')hand(...right[2],.95);
    if(kind==='executive'){
      hand(...right[2],.65);
      // Slim briefcase held by the other hand, with actual negative-space handle.
      part(left[2][0]-2,left[2][1]+13,.03+idle*.015,()=>{line('M-7 4L-7-3Q-6-8 0-8Q7-8 7-3L7 4',palette.ink,3);fill('M-19 2L21 2L23 32L-19 33Z',palette.deep);line('M-16 7L18 7L20 28',palette.red,1.4);fill('M-2 5L4 5L4 10L-2 10Z',palette.light);});
    }
    if(kind==='courier'){
      hand(...right[2],-.18);
      part(24,126,.06,()=>{fill('M-3-7L20-6L23 30L-4 31Z',palette.deep);fill('M-5-8L20-8L21 6L-5 7Z',palette.red);line('M-3 10L18 10',palette.ink,1);fill('M6 4L10 4L10 10L6 10Z',palette.white);});
    }
  }
  window.PersonaNPCs={
    draw(context,kind,t,{walking=false,wind=0,seed=0}={}){
      ctx=context;const beat=t*(walking?3.2:1.5)+seed,step=walking?Math.sin(beat)*15:0;
      const breath=Math.sin(beat)*.6;
      ctx.save();
      legs(kind,step,0);
      ctx.save();ctx.translate(Math.sin(beat*.45)*.65,breath);ctx.rotate(Math.sin(beat*.5)*.007);
      // Bag straps and sleeves are behind the torso; hands are intentionally layered above it.
      jacket(kind,breath,wind);
      arms(kind,beat,step);
      face(kind,Math.sin(beat*.42)*.025+(kind==='muse'?-.09:.025),t);
      ctx.restore();ctx.restore();
    }
  };
})();
