/* ================= ЗВУК (Web Audio, тихий и мягкий) ================= */
var ctx=null,master=null,verb=null,noiseBuf=null,soundOn=true,lastHover=0,lastKey=0,lastThump=0;
try{if(localStorage.getItem('modlist-snd')==='off')soundOn=false}catch(e){}
var sndBtn=document.getElementById('snd');
function syncBtn(){if(!sndBtn)return;sndBtn.setAttribute('aria-pressed',String(soundOn));var t=document.getElementById('sndT');if(t)t.textContent=soundOn?'Звук · вкл':'Звук · выкл'}
syncBtn();
if(sndBtn)sndBtn.addEventListener('click',function(){
  soundOn=!soundOn;syncBtn();
  try{localStorage.setItem('modlist-snd',soundOn?'on':'off')}catch(e){}
  if(soundOn)initAudio();
});
function impulse(c,sec,decay){
  var len=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,len,c.sampleRate);
  for(var ch=0;ch<2;ch++){var d=b.getChannelData(ch);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay)}
  return b;
}
function initAudio(){
  if(ctx){tryResume();return}
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  ctx=new AC();ctx.onstatechange=flushQ;
  var comp=ctx.createDynamicsCompressor();comp.threshold.value=-24;comp.ratio.value=6;
  master=ctx.createGain();master.gain.value=.55;master.connect(comp);comp.connect(ctx.destination);
  var conv=ctx.createConvolver();conv.buffer=impulse(ctx,1.8,3.2);
  var wet=ctx.createGain();wet.gain.value=.5;conv.connect(wet);wet.connect(master);
  verb=conv;
  var len=Math.floor(ctx.sampleRate*.4);noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);
  var nd=noiseBuf.getChannelData(0);for(var i=0;i<len;i++)nd[i]=Math.random()*2-1;
  tryResume();
}
var audioQ=[];
function flushQ(){if(ctx&&ctx.state==='running'){var q=audioQ;audioQ=[];q.forEach(function(f){try{f()}catch(e){}})}}
function whenAudio(fn){if(ctx&&ctx.state==='running')fn();else audioQ.push(fn)}
function tryResume(){if(ctx&&ctx.state!=='running'){var p=ctx.resume();if(p&&p.then)p.then(flushQ,function(){})}}
/* контекст создаётся сразу при загрузке и «разблокируется» самым первым подходящим действием */
var UNL=['pointerdown','pointerup','mousedown','click','keydown','touchstart','touchend','pointermove','wheel'];
function unlock(){initAudio();if(ctx&&ctx.state==='running')UNL.forEach(function(ev){window.removeEventListener(ev,unlock,true)})}
UNL.forEach(function(ev){window.addEventListener(ev,unlock,{capture:true,passive:true})});
document.addEventListener('visibilitychange',function(){if(!document.hidden)tryResume()});
function can(){return ctx&&master&&soundOn}
/* мягкая нота с обертонами */
function tone(freq,t0,gain,dur){
  if(!can())return;t0=t0||ctx.currentTime;
  [[1,1],[2,.22],[3,.06]].forEach(function(p){
    var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    o.type='sine';o.frequency.value=freq*p[0];f.type='lowpass';f.frequency.value=3200;
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(gain*p[1],t0+.009);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(f);f.connect(g);g.connect(master);g.connect(verb);o.start(t0);o.stop(t0+dur+.05);
  });
}
/* универсальный голос: тип, частота, свип, огибающая */
function voice(type,f0,f1,t0,gain,dur,wet){
  if(!can())return;
  var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
  o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);
  f.type='lowpass';f.frequency.value=2600;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(gain,t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(f);f.connect(g);g.connect(master);if(wet)g.connect(verb);o.start(t0);o.stop(t0+dur+.05);
}
function noise(t0,gain,dur,type,fr0,fr1,q){
  if(!can()||!noiseBuf)return;
  var s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter();
  s.buffer=noiseBuf;f.type=type;f.frequency.setValueAtTime(fr0,t0);if(fr1)f.frequency.exponentialRampToValueAtTime(fr1,t0+dur);f.Q.value=q||1;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(gain,t0+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  s.connect(f);f.connect(g);g.connect(master);s.start(t0);s.stop(t0+dur+.05);
}
var SCALE=[523.25,587.33,659.25,783.99,880,1046.5,783.99,659.25];
function playHover(i){
  if(!can())return;var now=ctx.currentTime;if(now-lastHover<.05)return;lastHover=now;
  tone(SCALE[i%SCALE.length],now,.032,.42);
}
function playClick(){
  if(!can())return;var now=ctx.currentTime;
  tone(392,now,.045,.6);tone(587.33,now+.075,.04,.75);
}
/* печать в поиске — только при вводе в строку поиска */
var KEYS=[392,440,523.25,587.33,659.25,783.99,659.25,587.33],kIdx=0;
function playKey(){
  if(!can())return;var now=ctx.currentTime;if(now-lastKey<.03)return;lastKey=now;
  tone(KEYS[kIdx++%KEYS.length]*(1+Math.random()*.01),now,.03,.34);
  noise(now,.012,.03,'bandpass',3600,0,1.2);
}
function playKeyDel(){
  if(!can())return;var now=ctx.currentTime;if(now-lastKey<.03)return;lastKey=now;
  voice('sine',420,260,now,.03,.2,true);
}
/* кнопка: забавный глитч-звук */
function playGlitch(){
  if(!can())return;var t=ctx.currentTime,N=[880,660,1175,494,1318,740];
  N.forEach(function(f,i){voice('triangle',f,f*(i%2?.8:1.15),t+i*.05,.032,.07,false)});
  noise(t+.02,.014,.28,'bandpass',2400,900,2);
  voice('sine',520,170,t+.32,.045,.34,true);
}
function playPop(){if(!can())return;var t=ctx.currentTime;voice('sine',300,720,t,.05,.14,true);noise(t,.012,.07,'highpass',3000,0,1)}
function playGrab(){if(!can())return;var t=ctx.currentTime;voice('sine',700,980,t,.025,.1,true);noise(t,.008,.05,'bandpass',3000,0,1)}
function playWhoosh(k){if(!can())return;var t=ctx.currentTime;noise(t,.03*k,.3,'bandpass',500,1800,1.4)}
function playThump(k){
  if(!can())return;var t=ctx.currentTime;if(t-lastThump<.07)return;lastThump=t;
  voice('sine',170,70,t,.06*k,.18,false);noise(t,.012*k,.05,'lowpass',500,0,1);
}
function playPortal(open){
  if(!can())return;var t=ctx.currentTime;
  if(open){voice('sine',220,640,t,.04,.5,true);voice('sine',330,960,t,.018,.5,true)}
  else{voice('sine',620,190,t,.04,.42,true)}
  noise(t,.012,.4,'bandpass',open?600:1400,open?2200:400,1.5);
}
function playChirp(){if(!can())return;var t=ctx.currentTime,f=520+Math.random()*340;voice('triangle',f,f*1.18,t,.018,.07,true)}
function playGiggle(){
  if(!can())return;var t=ctx.currentTime;
  [0,1,2,3].forEach(function(i){voice('triangle',700+(i%2)*160,820+(i%2)*160,t+i*.085,.022,.07,true)});
}

/* «чпоньк» — только при примагничивании нити в поиске */
function playSnap(){
  if(!can())return;var t=ctx.currentTime;
  voice('sine',240,640,t,.05,.1,true);voice('sine',900,420,t+.06,.03,.12,true);
  noise(t,.02,.05,'bandpass',1800,700,2);
}
function playStomp(alt){
  if(!can())return;var t=ctx.currentTime,f=alt?118:96;
  voice('sine',f*1.5,f*.55,t,.07,.1,false);noise(t,.016,.04,'lowpass',700,0,1);
  voice('square',1100+Math.random()*200,600,t,.006,.02,false);
}
function playFlap(){if(!can())return;var t=ctx.currentTime;noise(t,.02,.14,'bandpass',900,380,1.2)}
function playSuck(big){
  if(!can())return;var t=ctx.currentTime;
  voice('sine',big?90:520,big?820:90,t,.06,big?1.4:.7,true);noise(t,.02,big?1.5:.6,'bandpass',big?300:2000,big?2400:200,1.4);
}
function playCreak(){if(!can())return;var t=ctx.currentTime;voice('sawtooth',70,48,t,.025,.5,true);noise(t,.01,.4,'lowpass',400,0,1)}


/* ---- звуки фото на странице настроек: по одному короткому звуку на действие ---- */
var lastImg=0;
function playHoverImg(){if(!can())return;var t=ctx.currentTime;if(t-lastImg<.15)return;lastImg=t;voice('sine',520,700,t,.03,.14,true)}
function playZoomIn(){if(!can())return;var t=ctx.currentTime;voice('sine',380,760,t,.04,.2,true)}
function playZoomOut(){if(!can())return;var t=ctx.currentTime;lastImg=t+1.2;voice('sine',700,340,t,.035,.2,true)}
initAudio();
