(()=>{
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const glow=document.querySelector('.cursor-glow');
  const navLinks=[...document.querySelectorAll('.nav-links a')];
  const panels=[...document.querySelectorAll('[data-scene]')];

  function onScroll(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    root.style.setProperty('--progress',Math.min(1,scrollY/max));
    let current=panels[0];
    panels.forEach(panel=>{if(panel.getBoundingClientRect().top<innerHeight*.52)current=panel});
    const currentId=current.id==='home'?'top':current.id;
    navLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')===`#${currentId}`));
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  if(glow&&!reduced){
    addEventListener('pointermove',event=>{glow.style.left=`${event.clientX}px`;glow.style.top=`${event.clientY}px`},{passive:true});
  }

  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}
  }),{threshold:.12,rootMargin:'0px 0px -6%'});
  document.querySelectorAll('.reveal').forEach((element,index)=>{element.style.transitionDelay=`${Math.min(index%4,3)*70}ms`;revealObserver.observe(element)});

  if(!reduced&&matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.project').forEach(card=>{
      card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width-.5;const y=(event.clientY-rect.top)/rect.height-.5;card.style.transform=`rotateX(${-y*7}deg) rotateY(${x*8}deg) translateY(-3px)`});
      card.addEventListener('pointerleave',()=>{card.style.transform=''});
    });
    document.querySelectorAll('.magnetic').forEach(element=>{
      element.addEventListener('pointermove',event=>{const rect=element.getBoundingClientRect();const x=event.clientX-(rect.left+rect.width/2);const y=event.clientY-(rect.top+rect.height/2);element.style.transform=`translate(${x*.14}px,${y*.18}px)`});
      element.addEventListener('pointerleave',()=>{element.style.transform=''});
    });
  }

  document.querySelectorAll('.chip').forEach((chip,index)=>chip.addEventListener('pointerenter',()=>{
    chip.style.setProperty('transform',`translateY(-4px) rotate(${index%2?2:-2}deg)`);
  }));
})();
