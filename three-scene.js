import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const canvas=document.querySelector('#scene3d');
const frame=document.querySelector('#interactive-art');
const label=document.querySelector('#scene-label');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

if(canvas&&frame){
try{
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x080908,.045);
  const camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,.35,7.8);
  const world=new THREE.Group();scene.add(world);
  const acid=0xc7ff45,blue=0x6078ff,paper=0xf4f2ec,ink=0x111311,skin=0xb97755;
  const matte=(color,roughness=.72)=>new THREE.MeshStandardMaterial({color,roughness,metalness:.05});
  const metal=(color)=>new THREE.MeshStandardMaterial({color,roughness:.26,metalness:.82});
  const glow=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity});
  const box=(w,h,d,material)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  const sphere=(r,material,segs=28)=>new THREE.Mesh(new THREE.SphereGeometry(r,segs,segs),material);
  function cylinderBetween(a,b,r,material){const mid=a.clone().add(b).multiplyScalar(.5),length=a.distanceTo(b);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,length,18),material);mesh.position.copy(mid);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return mesh}

  const set=new THREE.Group();world.add(set);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(4.2,64),new THREE.MeshStandardMaterial({color:0x0c0e0c,roughness:.92,metalness:.1,transparent:true,opacity:.86}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.78;set.add(floor);
  const floorRing=new THREE.Mesh(new THREE.RingGeometry(2.15,2.18,96),glow(blue,.45));floorRing.rotation.x=-Math.PI/2;floorRing.position.y=-1.75;set.add(floorRing);

  const desk=new THREE.Group();set.add(desk);
  const desktop=box(4.35,.16,1.55,metal(0x1d201d));desktop.position.set(.15,-.83,.15);desk.add(desktop);
  [[-1.65,-1.3,.15],[1.95,-1.3,.15]].forEach(([x,y,z])=>{const leg=box(.13,1.05,.13,matte(0x242724));leg.position.set(x,y,z);desk.add(leg)});
  const keyboard=box(1.15,.055,.42,matte(0x272a27));keyboard.position.set(.25,-.7,.78);keyboard.rotation.x=-.06;desk.add(keyboard);
  for(let i=0;i<8;i++){const key=box(.09,.015,.06,glow(i===6?acid:0x777a77,.8));key.position.set(-.14+i*.11,-.664,.91);desk.add(key)}
  const mug=box(.3,.38,.3,matte(acid));mug.position.set(1.72,-.56,.28);desk.add(mug);

  const monitor=new THREE.Group();monitor.position.set(.65,.08,.1);monitor.rotation.y=-.08;set.add(monitor);
  const bezel=box(2.15,1.42,.16,metal(0x191c19));monitor.add(bezel);
  const display=box(1.9,1.18,.03,new THREE.MeshStandardMaterial({color:0x070907,emissive:0x10200a,emissiveIntensity:.7,roughness:.35}));display.position.z=.095;monitor.add(display);
  const neck=box(.12,.62,.12,metal(0x242724));neck.position.y=-.98;monitor.add(neck);const base=box(.78,.07,.42,metal(0x242724));base.position.set(0,-1.3,.08);monitor.add(base);
  const screenGroup=new THREE.Group();screenGroup.position.z=.12;monitor.add(screenGroup);
  const bars=[];[.32,.55,.42,.82,.64,.92,.74].forEach((h,i)=>{const bar=box(.12,h,.035,glow(i%3===0?blue:acid,.92));bar.position.set(-.68+i*.22,-.43+h/2,.02);screenGroup.add(bar);bars.push(bar)});
  const chartLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([[-.75,.36,.03],[-.44,.18,.03],[-.12,.4,.03],[.18,.12,.03],[.48,.32,.03],[.75,.55,.03]].map(v=>new THREE.Vector3(...v))),new THREE.LineBasicMaterial({color:paper,transparent:true,opacity:.65}));screenGroup.add(chartLine);

  const person=new THREE.Group();person.position.set(-1.25,-.12,.55);set.add(person);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.48,10,24),matte(0x242b25));torso.position.y=-.1;torso.scale.set(1.08,1,.7);torso.rotation.z=-.035;person.add(torso);
  const shirtStripe=box(.085,.76,.018,glow(acid,.88));shirtStripe.position.set(.2,-.08,.285);person.add(shirtStripe);
  const neckHuman=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.26,24),matte(skin));neckHuman.position.y=.57;person.add(neckHuman);
  const head=new THREE.Group();head.position.set(-.02,1.02,.03);person.add(head);
  const face=sphere(.45,matte(skin));face.scale.set(.88,1.08,.86);head.add(face);
  const hair=sphere(.465,matte(0x121312));hair.scale.set(.9,.52,.88);hair.position.y=.25;head.add(hair);
  const earL=sphere(.09,matte(skin),20);earL.position.set(-.4,0,0);head.add(earL);const earR=earL.clone();earR.position.x=.4;head.add(earR);
  const eyes=new THREE.Group();head.add(eyes);
  [-.15,.15].forEach(x=>{const white=sphere(.07,glow(paper),18);white.scale.set(1.12,.72,.42);white.position.set(x,.04,.39);eyes.add(white);const pupil=sphere(.032,glow(0x111111),16);pupil.position.set(x,.04,.445);eyes.add(pupil)});
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.055,.18,16),matte(skin));nose.rotation.x=Math.PI/2;nose.position.set(0,-.05,.43);head.add(nose);
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.09,.012,8,24,Math.PI),glow(0x4a211d));mouth.rotation.z=Math.PI;mouth.position.set(0,-.2,.39);head.add(mouth);
  const glassesMat=glow(acid,.9);[-.15,.15].forEach(x=>{const rim=new THREE.Mesh(new THREE.TorusGeometry(.12,.012,8,30),glassesMat);rim.position.set(x,.04,.455);head.add(rim)});const bridge=box(.08,.015,.015,glassesMat);bridge.position.set(0,.04,.455);head.add(bridge);
  const armMat=matte(0x242b25),handMat=matte(skin),pantsMat=matte(0x181c19);
  function makeLimb(radius,material){const limb=new THREE.Mesh(new THREE.CapsuleGeometry(radius,.42,7,18),material);person.add(limb);return limb}
  function poseLimb(limb,a,b){const mid=a.clone().add(b).multiplyScalar(.5),length=a.distanceTo(b);limb.position.copy(mid);limb.scale.set(1,Math.max(.1,length/(.42+limb.geometry.parameters.radius*2)),1);limb.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize())}
  const leftShoulder=new THREE.Vector3(-.4,.28,0),leftElbow=new THREE.Vector3(-.68,-.25,.28),leftHandPos=new THREE.Vector3(-.18,-.5,.66);
  const rightShoulder=new THREE.Vector3(.4,.28,0),rightElbowPos=new THREE.Vector3(.68,-.25,.28),rightHandPos=new THREE.Vector3(1.1,-.5,.64);
  const leftUpper=makeLimb(.13,armMat),leftLower=makeLimb(.105,armMat),rightUpper=makeLimb(.13,armMat),rightLower=makeLimb(.105,armMat);
  poseLimb(leftUpper,leftShoulder,leftElbow);poseLimb(leftLower,leftElbow,leftHandPos);poseLimb(rightUpper,rightShoulder,rightElbowPos);poseLimb(rightLower,rightElbowPos,rightHandPos);
  const armJoints=[leftShoulder,rightShoulder,leftElbow,rightElbowPos].map((p,i)=>{const joint=sphere(i<2?.145:.115,i<2?armMat:handMat,18);joint.position.copy(p);person.add(joint);return joint});const rightElbowJoint=armJoints[3];
  const leftPalm=sphere(.13,handMat,20);leftPalm.scale.set(1.15,.78,.72);leftPalm.position.copy(leftHandPos);person.add(leftPalm);
  const rightPalm=new THREE.Group();person.add(rightPalm);const palm=sphere(.14,handMat,22);palm.scale.set(.86,1.12,.58);rightPalm.add(palm);
  [-.09,-.03,.03,.09].forEach((x,i)=>{const finger=new THREE.Mesh(new THREE.CapsuleGeometry(.022,.115,5,10),handMat);finger.position.set(x,.18-i*.008,0);rightPalm.add(finger)});
  const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.028,.1,5,10),handMat);thumb.position.set(-.145,.01,.01);thumb.rotation.z=.82;rightPalm.add(thumb);rightPalm.position.copy(rightHandPos);rightPalm.rotation.z=-1.05;
  const hipL=new THREE.Vector3(-.22,-.56,-.02),kneeL=new THREE.Vector3(-.4,-1.02,.38),ankleL=new THREE.Vector3(-.42,-1.62,.2);const hipR=new THREE.Vector3(.22,-.56,-.02),kneeR=new THREE.Vector3(.38,-1.02,.34),ankleR=new THREE.Vector3(.42,-1.62,.16);
  const thighL=makeLimb(.16,pantsMat),calfL=makeLimb(.135,pantsMat),thighR=makeLimb(.16,pantsMat),calfR=makeLimb(.135,pantsMat);poseLimb(thighL,hipL,kneeL);poseLimb(calfL,kneeL,ankleL);poseLimb(thighR,hipR,kneeR);poseLimb(calfR,kneeR,ankleR);
  [ankleL,ankleR].forEach(p=>{const shoe=box(.28,.13,.48,matte(0x101110));shoe.position.copy(p).add(new THREE.Vector3(0,-.04,.15));person.add(shoe)});
  const chairBack=box(1.05,1.3,.16,matte(0x171a17));chairBack.position.set(-1.25,-.62,-.05);chairBack.rotation.x=-.08;set.add(chairBack);
  const chairStem=box(.12,.75,.12,metal(0x303330));chairStem.position.set(-1.25,-1.38,-.05);set.add(chairStem);

  const dataOrbit=new THREE.Group();world.add(dataOrbit);const nodes=[];
  for(let i=0;i<22;i++){const angle=i/22*Math.PI*2,r=2.7+(i%4)*.13;const node=sphere(i%5===0?.07:.035,glow(i%3?acid:blue,.72),12);node.position.set(Math.cos(angle)*r,Math.sin(angle)*1.6,r%2*.06-.35);dataOrbit.add(node);nodes.push(node)}
  const halo=new THREE.Mesh(new THREE.TorusGeometry(2.72,.012,8,140),glow(acid,.28));halo.rotation.set(.35,.12,.05);dataOrbit.add(halo);
  const floaters=new THREE.Group();world.add(floaters);for(let i=0;i<5;i++){const panel=box(.55,.33,.025,new THREE.MeshStandardMaterial({color:i%2?blue:acid,emissive:i%2?blue:acid,emissiveIntensity:.45,transparent:true,opacity:.18,roughness:.4}));panel.position.set(-2.5+i*1.25,1.4+(i%2)*.55,-.6);panel.rotation.set(.08,i*.08-.15,i*.07);floaters.add(panel)}

  scene.add(new THREE.HemisphereLight(paper,0x080908,1.7));const key=new THREE.PointLight(acid,36,14,2);key.position.set(3.2,3.8,4.5);scene.add(key);const rim=new THREE.PointLight(blue,32,13,2);rim.position.set(-4,.3,3);scene.add(rim);const warm=new THREE.PointLight(0xff9c68,16,9,2);warm.position.set(-1,2.2,3.5);scene.add(warm);

  const states={focus:{label:'Deep focus',cam:[0,.3,7.8],world:[0,0,0],monitor:acid,orbit:.18},build:{label:'Building systems',cam:[.35,.25,7.15],world:[-.1,.08,0],monitor:blue,orbit:.7},think:{label:'Connecting ideas',cam:[-.45,.62,6.75],world:[.18,-.02,0],monitor:acid,orbit:1},connect:{label:'Open to connect',cam:[0,.4,7.35],world:[0,.12,0],monitor:blue,orbit:.45}};
  let active='focus',state=states.focus,scrollPhase=0,visible=true,raf=0;
  const pointer=new THREE.Vector2(),smoothPointer=new THREE.Vector2();
  addEventListener('pointermove',e=>pointer.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1)),{passive:true});addEventListener('pointerleave',()=>pointer.set(0,0));
  function updateSceneState(){const panels=[...document.querySelectorAll('[data-scene]')];let closest=panels[0],distance=Infinity;panels.forEach(p=>{const r=p.getBoundingClientRect(),d=Math.abs(r.top+r.height*.45-innerHeight*.5);if(d<distance){distance=d;closest=p}});const next=closest?.dataset.scene||'focus';if(next!==active){active=next;state=states[active];if(label)label.textContent=state.label;window.dispatchEvent(new CustomEvent('portfolio:scene',{detail:{scene:active}}))}const doc=document.documentElement;scrollPhase=scrollY/Math.max(1,doc.scrollHeight-innerHeight)}
  addEventListener('scroll',updateSceneState,{passive:true});updateSceneState();
  function resize(){const r=frame.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(r.height,1);camera.updateProjectionMatrix()}
  new ResizeObserver(resize).observe(frame);new IntersectionObserver(([e])=>{visible=e.isIntersecting||innerWidth<981;if(visible&&!reduceMotion)animate()},{threshold:.01}).observe(frame);
  const clock=new THREE.Clock();
  function animate(){cancelAnimationFrame(raf);if(!visible)return;const t=clock.getElapsedTime();smoothPointer.lerp(pointer,.075);
    head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,smoothPointer.x*.38+(active==='build'?.12:0),.08);head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,-smoothPointer.y*.2+(active==='think'?.12:0),.08);eyes.position.x=THREE.MathUtils.lerp(eyes.position.x,smoothPointer.x*.045,.12);eyes.position.y=THREE.MathUtils.lerp(eyes.position.y,smoothPointer.y*.035,.12);
    const waving=active==='connect',wave=waving?Math.sin(t*3.2)*.11:0;const elbowTarget=waving?new THREE.Vector3(.82,.82,.08):new THREE.Vector3(.68,-.25,.28);const handTarget=waving?new THREE.Vector3(.62+wave,1.42,.2):new THREE.Vector3(1.1,-.5,.64);rightElbowPos.lerp(elbowTarget,.065);rightHandPos.lerp(handTarget,.065);poseLimb(rightUpper,rightShoulder,rightElbowPos);poseLimb(rightLower,rightElbowPos,rightHandPos);rightElbowJoint.position.copy(rightElbowPos);rightPalm.position.copy(rightHandPos);rightPalm.rotation.z=THREE.MathUtils.lerp(rightPalm.rotation.z,waving?.05:-1.05,.065);rightPalm.rotation.y=THREE.MathUtils.lerp(rightPalm.rotation.y,waving?-.2:0,.065);person.rotation.y=THREE.MathUtils.lerp(person.rotation.y,waving?.1:active==='build'?.06:0,.04);
    const camTarget=new THREE.Vector3(...state.cam);camera.position.lerp(camTarget,.035);world.position.lerp(new THREE.Vector3(...state.world),.035);camera.position.x+=smoothPointer.x*.002;camera.position.y+=smoothPointer.y*.0015;camera.lookAt(0,-.05,0);
    const targetColor=new THREE.Color(state.monitor);display.material.emissive.lerp(targetColor,.035);key.color.lerp(targetColor,.025);floorRing.material.color.lerp(targetColor,.025);
    dataOrbit.rotation.z=t*(active==='think'?.18:.055)+scrollPhase*Math.PI*1.7;dataOrbit.rotation.y=t*.035+smoothPointer.x*.08;dataOrbit.scale.lerp(new THREE.Vector3(state.orbit,state.orbit,state.orbit),.045);floaters.rotation.y=scrollPhase*Math.PI*.8;floaters.position.y=Math.sin(t*.55)*.08;floaters.children.forEach((p,i)=>{p.material.opacity=THREE.MathUtils.lerp(p.material.opacity,active==='think'?.48:active==='build'?.27:.12,.04);p.position.y+=Math.sin(t*1.1+i)*.0015});
    bars.forEach((bar,i)=>{const pulse=.72+Math.sin(t*2+i*.8)*.2+(active==='build'?.22:0);bar.scale.y=THREE.MathUtils.lerp(bar.scale.y,pulse,.08)});monitor.rotation.y=THREE.MathUtils.lerp(monitor.rotation.y,-.08+smoothPointer.x*.025,.05);set.rotation.y=THREE.MathUtils.lerp(set.rotation.y,smoothPointer.x*.045,.04);set.position.y=Math.sin(t*.8)*.018;
    renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  resize();frame.classList.add('is-ready');if(reduceMotion)renderer.render(scene,camera);else animate();
}catch(error){console.warn('Interactive 3D unavailable; showing static fallback.',error)}
}
