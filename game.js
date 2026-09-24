(()=>{
  const canvas=document.querySelector('#game-canvas'),shell=document.querySelector('#signal-sprint');
  if(!canvas||!shell)return;
  const ctx=canvas.getContext('2d'),overlay=document.querySelector('#game-overlay'),startButton=document.querySelector('#game-start'),title=document.querySelector('#game-title'),copy=document.querySelector('#game-copy'),scoreEl=document.querySelector('#game-score'),bestEl=document.querySelector('#game-best'),energyEl=document.querySelector('#game-energy');
  const C={ink:'#090b0a',paper:'#f4f2ec',muted:'#8f938d',acid:'#c7ff45',blue:'#6078ff',red:'#ff6b62'};
  let w=1,h=1,dpr=1,ground=1,state='idle',visible=true,last=0,elapsed=0,score=0,energy=3,speed=260,spawnIn=1,collectIn=.8,gridOffset=0,invincible=0,best=0,raf=0;
  let obstacles=[],collectibles=[],sparks=[];
  const player={x:90,y:0,vy:0,width:34,height:64,onGround:true};
  try{best=Number(localStorage.getItem('signalSprintBest')||0)}catch(e){}bestEl.textContent=String(best).padStart(4,'0');

  function resize(){const r=canvas.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ground=h*.78;player.x=Math.max(70,w*.16);if(state!=='running')player.y=ground-player.height}
  new ResizeObserver(resize).observe(canvas);resize();
  function reset(){elapsed=0;score=0;energy=3;speed=Math.max(235,w*.34);spawnIn=1.1;collectIn=.65;obstacles=[];collectibles=[];sparks=[];invincible=0;player.y=ground-player.height;player.vy=0;player.onGround=true;updateHud()}
  function updateHud(){scoreEl.textContent=String(Math.floor(score)).padStart(4,'0');bestEl.textContent=String(best).padStart(4,'0');energyEl.textContent=Array.from({length:3},(_,i)=>i<energy?'●':'○').join(' ')}
  function start(){reset();state='running';overlay.hidden=true;last=performance.now();canvas.focus?.()}
  function finish(won=false){state='over';const final=Math.floor(score);if(final>best){best=final;try{localStorage.setItem('signalSprintBest',String(best))}catch(e){}}updateHud();title.textContent=won?'Pipeline complete.':'Signal interrupted.';copy.textContent=`You cleaned ${final} signal points. ${final>=best?'That is your best run.':'Try again and beat your best.'}`;startButton.textContent='Run again';overlay.hidden=false}
  function jump(){if(state!=='running')return;if(player.onGround){player.vy=-Math.max(570,h*1.2);player.onGround=false;for(let i=0;i<8;i++)sparks.push({x:player.x+10,y:ground-2,vx:-30-Math.random()*80,vy:-20-Math.random()*50,life:.45})}}
  startButton.addEventListener('click',start);canvas.tabIndex=0;canvas.addEventListener('pointerdown',jump);addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='ArrowUp')&&document.querySelector('#game').getBoundingClientRect().top<innerHeight&&document.querySelector('#game').getBoundingClientRect().bottom>0){e.preventDefault();if(state==='idle'||state==='over')start();else jump()}});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){last=performance.now();loop(last)}},{threshold:.05}).observe(shell);

  function roundedRect(x,y,width,height,r){ctx.beginPath();ctx.roundRect(x,y,width,height,r)}
  function spawnObstacle(){const height=34+Math.random()*34;obstacles.push({x:w+30,y:ground-height,width:34+Math.random()*17,height,hit:false,label:Math.random()>.42?'NULL':'404'});spawnIn=Math.max(.72,1.45-score/1700)+Math.random()*.55}
  function spawnCollectible(){const high=Math.random()>.48;collectibles.push({x:w+25,y:high?ground-125-Math.random()*55:ground-78-Math.random()*28,r:9,collected:false,phase:Math.random()*6});collectIn=.75+Math.random()*1.05}
  function burst(x,y,color){for(let i=0;i<12;i++)sparks.push({x,y,vx:(Math.random()-.5)*190,vy:(Math.random()-.7)*180,life:.55,color})}
  function overlaps(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y}
  function update(dt){
    elapsed+=dt;if(elapsed>=60){finish(true);return}speed=Math.max(235,w*.34)+Math.min(190,elapsed*3.1);gridOffset=(gridOffset+speed*dt*.22)%48;score+=dt*(10+speed*.015);invincible=Math.max(0,invincible-dt);
    player.vy+=Math.max(1350,h*2.8)*dt;player.y+=player.vy*dt;if(player.y>=ground-player.height){player.y=ground-player.height;player.vy=0;player.onGround=true}
    spawnIn-=dt;collectIn-=dt;if(spawnIn<=0)spawnObstacle();if(collectIn<=0)spawnCollectible();
    obstacles.forEach(o=>o.x-=speed*dt);collectibles.forEach(c=>{c.x-=speed*dt;c.phase+=dt*3});sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=260*dt;s.life-=dt});
    const hitbox={x:player.x+7,y:player.y+5,width:player.width-12,height:player.height-6};
    obstacles.forEach(o=>{if(!o.hit&&invincible<=0&&overlaps(hitbox,o)){o.hit=true;energy--;invincible=1.15;burst(player.x+player.width,player.y+player.height*.55,C.red);updateHud();if(energy<=0)finish(false)}});
    collectibles.forEach(c=>{const dx=player.x+player.width*.5-c.x,dy=player.y+player.height*.42-c.y;if(!c.collected&&dx*dx+dy*dy<750){c.collected=true;score+=75;burst(c.x,c.y,C.acid);updateHud()}});
    obstacles=obstacles.filter(o=>o.x+o.width>-40&&!o.hit);collectibles=collectibles.filter(c=>c.x>-30&&!c.collected);sparks=sparks.filter(s=>s.life>0);updateHud();
  }
  function drawBackground(t){
    const gradient=ctx.createLinearGradient(0,0,0,h);gradient.addColorStop(0,'#101510');gradient.addColorStop(.6,'#090b0a');gradient.addColorStop(1,'#060706');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(244,242,236,.055)';ctx.lineWidth=1;for(let x=-gridOffset;x<w;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=ground;y>0;y-=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.strokeStyle='rgba(96,120,255,.24)';ctx.lineWidth=2;ctx.beginPath();for(let x=0;x<=w;x+=30){const y=h*.33+Math.sin(x*.018+t*.0006)*20+Math.sin(x*.006+t*.00025)*14;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
    for(let i=0;i<8;i++){const x=((i*137-t*.018)%(w+120)+w+120)%(w+120)-60,y=h*.18+(i%4)*38;ctx.fillStyle=i%3?'rgba(199,255,69,.15)':'rgba(96,120,255,.2)';ctx.fillRect(x,y,3,3)}
    ctx.strokeStyle='rgba(199,255,69,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,ground+.5);ctx.lineTo(w,ground+.5);ctx.stroke();ctx.fillStyle='rgba(199,255,69,.04)';ctx.fillRect(0,ground,w,h-ground);
  }
  function drawRunner(t){
    const x=player.x,y=player.y,bob=player.onGround&&state==='running'?Math.abs(Math.sin(t*.014))*2:0,phase=t*.018;ctx.save();ctx.translate(x,y-bob);if(invincible>0&&Math.floor(invincible*12)%2===0)ctx.globalAlpha=.32;
    const hip={x:16,y:42},shoulder={x:17,y:22},swing=Math.sin(phase)*9;
    ctx.strokeStyle='#273029';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hip.x,hip.y);ctx.lineTo(11+swing*.45,55);ctx.lineTo(7-swing*.32,64);ctx.moveTo(hip.x,hip.y);ctx.lineTo(23-swing*.45,54);ctx.lineTo(29+swing*.32,63);ctx.stroke();
    ctx.strokeStyle='#313a32';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(shoulder.x,shoulder.y+2);ctx.lineTo(9-swing*.38,34);ctx.lineTo(6-swing*.62,43);ctx.moveTo(shoulder.x+2,shoulder.y+2);ctx.lineTo(27+swing*.38,33);ctx.lineTo(31+swing*.62,41);ctx.stroke();
    roundedRect(9,18,17,29,7);ctx.fillStyle='#202721';ctx.fill();ctx.fillStyle=C.acid;ctx.fillRect(20,23,2.5,18);
    ctx.fillStyle='#b97755';ctx.beginPath();ctx.arc(18,11,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111311';ctx.beginPath();ctx.arc(15,7,9,Math.PI,Math.PI*2);ctx.lineTo(25,8);ctx.fill();
    ctx.fillStyle=C.paper;ctx.beginPath();ctx.arc(23,10,2.8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(24,10,1.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle=C.acid;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(23,10,4.3,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=C.paper;ctx.fillRect(1,61,10,4);ctx.fillRect(25,61,11,4);ctx.restore();
  }
  function drawObstacle(o){ctx.save();ctx.shadowColor=C.red;ctx.shadowBlur=12;roundedRect(o.x,o.y,o.width,o.height,4);ctx.fillStyle='#1b1111';ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,107,98,.8)';ctx.stroke();ctx.translate(o.x+o.width/2,o.y+o.height/2);ctx.rotate(-Math.PI/2);ctx.fillStyle=C.red;ctx.font='700 9px Inter, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.label,0,0);ctx.restore()}
  function drawCollectible(c){const pulse=1+Math.sin(c.phase)*.14;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(Math.PI/4);ctx.shadowColor=C.acid;ctx.shadowBlur=18;ctx.fillStyle=C.acid;ctx.fillRect(-c.r*pulse,-c.r*pulse,c.r*2*pulse,c.r*2*pulse);ctx.shadowBlur=0;ctx.fillStyle=C.ink;ctx.fillRect(-2,-2,4,4);ctx.restore()}
  function draw(t){drawBackground(t);collectibles.forEach(drawCollectible);obstacles.forEach(drawObstacle);drawRunner(t);sparks.forEach(s=>{ctx.globalAlpha=Math.max(0,s.life/.55);ctx.fillStyle=s.color||C.acid;ctx.fillRect(s.x,s.y,3,3);ctx.globalAlpha=1});if(state==='running'){ctx.fillStyle=C.muted;ctx.font='600 10px Inter, sans-serif';ctx.textAlign='right';ctx.fillText(`${Math.max(0,Math.ceil(60-elapsed))}s`,w-20,ground+28)}}
  function loop(now){cancelAnimationFrame(raf);if(!visible)return;const dt=Math.min(.032,(now-last)/1000||0);last=now;if(state==='running')update(dt);draw(now);raf=requestAnimationFrame(loop)}
  reset();loop(performance.now());
})();
