(function(){
'use strict';
var root=document.documentElement;
function unit(){return parseFloat(getComputedStyle(root).fontSize)/16}
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
var NK=window.NICKCFG||{},search=NK.search||null,board=document.getElementById('board');
/* ================= НИК: ХАРАКТЕР, ФИЗИКА, РАМКИ, ПОРТАЛЫ ================= */
var nk=null,loopOn=false,lastT=0,busy=false,bubble=null,grabs=0,lastPrank=-9,plats=[],platT=0;
/* строка диалога: «настроение|текст». {х} — буква с лёгкой цензурой: мерцает символами, но слово читается */
var SEQS=[
 ['s|бл{я}ть, портал сам открылся!','a|это не я! баги тут сильнее создателя. ебан{у}ться.'],
 ['p|сука, куда меня тащит?!','d|а, я тут. «Inplace Streamingsectors Nulled» не спас.','y|в коде бардак, как у меня в носках.'],
 ['d|п{и}здец, портал-дыра.','w|«Streaming Bug Workaround» тут не работает? ну ясно.','y|а создатель ни при чём. ну почти.']
];
var SPAWN=[
 ['s|бл{я}ть, ну и тесно в этом поиске!'],
 ['n|фу, тут пылища. кэш не мыт с 2077-го.'],
 ['h|выпрыгнул. пахну баггами. «Dirt Begone» мне не поможет.'],
 ['y|я тут пока вылез. кстати, в поиск можно вписать «inkee2004». просто так.']
];
var LAZY=[
 ['z|уф… ноги отваливаются.','z|мне б «Fast Travel from anywhere to everywhere» — до холодильника.'],
 ['z|я неделю не обновлялся. воняет кэшем.','y|зато «Eye Adaptation» — глаза привыкли. нос тоже.'],
 ['z|пожрать бы. и не мыться.']
];
var FLY=[
 ['f|«Hide Distant 2D Cars»? я сам скрылся. крылья.exe, сук{а}!'],
 ['f|летим, бл{я}ть! «Draw Distance ReImagined» — вижу весь твой бардак.'],
 ['f|киберпсих в небе, держись! «Always Best Quality» — на высоте.']
];
var ROAST=[
 ['n|сижу, смотрю как ты ищешь.','y|«Cute and Sexy Pose Pack for FemV» — для фотосессии, да? конечно.','y|«Fast Travel Hologram Lucy» — романтик, бл{я}ть.','l|ну ты и извращенец, чумба.'],
 ['n|ты чё, опять в моды полез?','s|постер «Just Monika» в гостиной — еб{а}нуться, она же смотрит!','y|Моника, Люси… у тебя не сборка, а гарем.','w|молчу. я неряха, не стукач.'],
 ['n|«Reset Attributes» — сбросил бы себе характер.','a|а «Mod Settings» опять не открывается, сук{а}? это ты, не я.','l|«Photomode Facial Expression Mega Pack» мне! лицо глючит, видишь?']
];
var DOWN=[['z|всё, надоело. вниз.'],['n|хватит. тут бардак, мне пора.'],['w|пойду «Reset Attributes» — характер сбрасывать.']];
var JUMP=[['h|опа! на ту рамку!'],['h|прыг, бл{я}ть. совсем как «Fast Travel from anywhere»!'],['l|гравитация — для лохов.']];
var EDGE=[['p|ай, бл{я}ть, высоко!'],['s|тут край. я вообще-то боюсь высоты.'],['w|и куда дальше? вниз? ну такое.']];
/* реплики зависят от рамки, на которой стоит ник (по порядку карточек) */
var QUIPS={
 0:['n|«RED4ext», «redscript», «TweakXL»… фреймворков больше, чем у меня чистых носков.','w|без «Cyber Engine Tweaks» ни х{е}рена не запустится. как я без кофе.','s|«Mod Settings» и «Native Settings UI» — настройки есть, порядка нет.','w|«Browser Extension» — браузер в игре. а у меня в браузере сто вкладок с модами.'],
 1:['a|«Decals Flickering Fix» — мерцание починили. а моё лицо не чинят, сук{а}.','y|«Disappearing NPC and Vehicle Fix» — пусть бы мои носки так же исчезали.','s|«Accidental fast travel bug fix» — случайный телепорт? у меня каждый день: «забыл, куда шёл».','l|«Ragdoll Execution Fix» — наконец трупы падают как надо. я падаю ещё лучше.','n|«Empty Quickhack Menu Fix» — пустое меню починили. голову мне кто-нибудь починит?','z|«Static Takeout Cups Bugfix» — стаканчик залип. у меня дома такие стоят с весны.','a|«Eddies Notification Fix» — эдди видно, а толку? я всё равно на мели.'],
 2:['n|«Hide Distant 2D Cars» — плоские машины! как мои шутки.','y|«Not So Good Draw Distance» — название честное, как моя гигиена.','l|«Always Best Quality» — а у меня «Always Worst Quality».','s|«Draw Distance ReImagined» — вижу далеко, а убраться под носом лень.'],
 3:['y|«Just Monika Living Room Poster»… Just Monika. бл{я}ть, она на меня смотрит.','l|«Fast Travel Hologram Lucy» — Люси провожает в телепорт. меня бы так в душ провожали.','n|«Dirt Begone» убирает грязь с экрана. мне б такой в комнату.','z|«Blur Begone», «Glow Begone» — всё чёткое, а я мутный.','y|«Preem Water 2.0» — вода красивая. мыться я всё равно не пойду.','w|«Weather Switcher» — погоду переключил, а настроение никак.','h|«Japantown Apartment View Enhanced» — вид шикарный, а в квартире срач, как у меня.'],
 4:['w|«Reset Attributes» — мне б сбросить характер. «Опрятность: 0, лень: 99».','h|«No Intro Videos» — наконец без заставок. а я бы свою оставил.','y|«Virtual Atelier» — магазин одежды, а я хожу в одном и том же. и без носков.','s|«Immersive First Person 2.0» — от первого лица… лучше б ты не видел, как я живу.','n|«No Camera Auto Centering» — камера не дёргается. зато нервы дёргаются.'],
 5:['n|«Authentic Shift» — передачи как в жизни. у меня одна передача — «лень».','z|одна машина на всю рамку, и та не моя.'],
 6:['y|«Cute and Sexy Pose Pack» — позы красивые. я знаю только одну: «лёжа».','l|«Photomode Facial Expression Mega Pack» — мне такой! у меня мимика из пяти смайликов, и те глючат.','y|«VTK FemV — Kala’s Tattoos» — у меня тоже есть татуха. «Не мыть».','n|«VTK Vanilla HD Body» — тело в HD. а у меня в 240p и с артефактами.'],
 search:['n|«Найти мод»… а «найти носок» где?','y|ищи-ищи, я за тобой присмотрю.','h|в поиск можно вписать не только моды. например, меня. то, что на табличке.','s|попробуй вписать мой ник. только не пугайся: я умею влетать в строку.'],
 snd:['w|звук… «Loud Noises Fix - Audio Pool Fix» тут бы не помешал.','h|слышишь, как я топаю? это пиксели хрустят.'],
 dl:['h|«Скачать сборку» — 90 архивов! пока качается, я посижу.','w|90 архивов… иди поешь, неряха. я тоже пожрал бы.','n|там три варианта: с тату, без тату и стандарт. я бы взял стандарт — как мой гардероб.','y|выбирай вариант и жми «Скачать». фото можно увеличить, я подглядывал.'],
 perf:['n|«1660S 6GB» и «почти макс. графика» — смелый ты человек. я бы уже плакал.','y|30–50 FPS и статеры — кинематографично. как мои сны про «Fast Travel» до холодильника.','h|«Посмотреть видео-тест» — там всё честно, без нарезок. почти как я без душа.','w|«i5-10400F», 16 RAM, SSD — не топ, но и не «Not So Good Draw Distance».','s|нативное сглаживание… у меня тоже всё нативное: и лень, и бардак.'],
 note:['n|шаг два — «прочитать руководство». все его пропускают, как я душ.','h|шаг три — «приступить к прохождению». наконец-то.','y|рядом блок с тестом. сначала читай руководство, потом смотри цифры.'],
 floor:['y|внизу пусто. зато никто не видит мой бардак.','w|«Inplace Streamingsectors Nulled» — а мне бы «Inplace Мозги Nulled».','n|я на дне страницы. как мой рейтинг.']
};
/* лицо: кадры подбираются по настроению, меняются сами и «говорят» вместе с текстом */
if(NK.quips){for(var qk in NK.quips)QUIPS[qk]=NK.quips[qk]}
var FACE={
 n:['(・_・)','(・ω・)','(・_・)','(－_－)'],
 h:['(｡◕‿◕｡)','(｡◕ᴗ◕｡)','(｡◕‿◕｡)','(｡-‿-｡)'],
 l:['(～￣▽￣)～','～(￣▽￣～)','(～￣▽￣)～','～(￣▽￣～)'],
 a:['(╯▔皿▔)╯','(ノ▔皿▔)ノ','(╯°皿°)╯','(ノ▔皿▔)ノ'],
 z:['(－_－)ᶻ','(－_－)ᶻᶻ','(－ω－)','(－_－)ᶻ'],
 s:['Σ(°△°)','Σ(°ロ°)','(⊙_⊙)','Σ(°△°)'],
 y:['(¬‿¬)','( ͡° ͜ʖ ͡°)','(¬‿¬)','(￢‿￢)'],
 f:['＼(＾▽＾)／','ヽ(＾▽＾)ﾉ','＼(＾▽＾)／','ヽ(＾▽＾)ﾉ'],
 d:['(@_@)','(×_×)','(@_@;)','(◎_◎;)'],
 w:['¯\\_(ツ)_/¯','¯\\_(ツ)_/¯','¯\\_(°_°)_/¯','¯\\_(ツ)_/¯'],
 p:['(；ﾟДﾟ)','(；ﾟДﾟ)ﾉ','(；ﾟДﾟ)','ヽ(；ﾟДﾟ)']
};
var fc={el:null,b:null,mood:'n',i:0,on:false,hold:null,glT:null};
function faceFit(){
  if(!fc.el||!nk)return;
  fc.el.style.transform='none';
  var avail=nk.inner.clientWidth-6,w=fc.b.offsetWidth;
  if(w>avail)fc.el.style.transform='scale('+(avail/w).toFixed(3)+')';
}
function faceRender(){var f=FACE[fc.mood];fc.b.textContent=f[fc.i%f.length];faceFit()}
function faceSet(m){
  if(!fc.el)return;if(!FACE[m])m='n';
  var ch=fc.mood!==m;fc.mood=m;
  if(ch){
    fc.i=0;fc.el.className='face m-'+m;
    if(fc.on){fc.el.classList.add('gl');clearTimeout(fc.glT);fc.glT=setTimeout(function(){fc.el.classList.remove('gl')},320)}
  }
  faceRender();
}
function faceShow(on){
  if(!fc.el||!nk)return;
  fc.on=on;nk.el.classList.toggle('talk',on);if(on)faceRender();
}
function flashFace(m,ms){
  if(!fc.el||bubble)return;
  faceSet(m);faceShow(true);clearTimeout(fc.hold);
  fc.hold=setTimeout(function(){if(!bubble)faceShow(false)},ms);
}
setInterval(function(){if(fc.on&&!document.hidden){fc.i++;faceRender()}},300);

var seqIdx=Math.floor(Math.random()*SEQS.length),roastIdx=Math.floor(Math.random()*ROAST.length);
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
var GL=['#','%','@','&','▒','$','!','*'];
setInterval(function(){
  if(document.hidden)return;
  var n=document.querySelectorAll('.bt .cz');
  for(var i=0;i<n.length;i++){var e=n[i];e.textContent=Math.random()<.4?e.dataset.r:GL[(Math.random()*GL.length)|0]}
},110);
function parseLine(str){
  var out=[],z=false;
  for(var i=0;i<str.length;i++){var c=str.charAt(i);if(c==='{'){z=true;continue}if(c==='}'){z=false;continue}out.push({c:c,z:z})}
  return out;
}
/* пол ника — верхняя грань любой рамки: карточек, поиска, кнопок, блока установки */
function refreshPlats(){
  var out=[],kids=board?board.children:[];
  document.querySelectorAll(NK.sel||'.card,.search,.snd,.dl,.dlnote,.perf').forEach(function(e){
    var r=e.getBoundingClientRect();
    if(r.width<10||r.top<6||r.top>innerHeight-12)return;
    var c=e.dataset.nk||(e.classList.contains('card')?Array.prototype.indexOf.call(kids,e):e.classList.contains('search')?'search':e.classList.contains('snd')?'snd':e.classList.contains('dl')?'dl':'note');
    out.push({l:r.left,r:r.right,y:r.top,el:e,cat:c});
  });
  plats=out;
  if(nk&&nk.plat){var el0=nk.plat.el;nk.plat=null;for(var i=0;i<out.length;i++)if(out[i].el===el0){nk.plat=out[i];break}}
}
function ensureNick(){
  if(nk)return nk;
  var e=el('div','nick'),inn=el('div','nick-in');
  inn.appendChild(el('span','nm0','inkee2004'));
  var fe=el('span','face'),fb=el('b');fe.appendChild(fb);inn.appendChild(fe);
  e.appendChild(inn);
  var lg=el('div','legs');
  [[26,36],[74,-36]].forEach(function(p,i){
    var l=el('div','leg'),sh=el('i');l.appendChild(sh);
    l.style.left=p[0]+'%';l.style.setProperty('--r',p[1]);l.style.setProperty('--k',Math.round(-p[1]*1.9));l.style.setProperty('--dl',(i?'.25s':'0s'));lg.appendChild(l);
  });
  e.appendChild(lg);
  var wsv='<svg viewBox="0 0 60 40"><path d="M58 24L4 6L14 22L32 34Z"/><path d="M58 24L16 20" opacity=".6"/></svg>';
  ['l','r'].forEach(function(s){var w=el('div','wing '+s);w.innerHTML=wsv;e.appendChild(w)});
  document.body.appendChild(e);
  fc.el=fe;fc.b=fb;fe.className='face m-n';
  nk={el:e,inner:inn,x:0,y:0,vx:0,vy:0,a:0,va:0,w:0,h:0,drag:false,frozen:false,ox:0,oy:0,lt:0,pid:null,mode:'phys',rest:0,lift:0,bob:0,t:0,gone:false,dir:1,want:1,sm:1,sp:0,dirT:0,edgeT:0,stepT:0,alt:0,walkT:0,wp:[],wi:0,flapT:0,plat:null,ball:false,quipT:0,landEl:null,lf:.5};
  e.addEventListener('pointerdown',onNickDown);
  e.addEventListener('pointermove',onNickMove);
  e.addEventListener('pointerup',onNickUp);
  e.addEventListener('pointercancel',onNickUp);
  return nk;
}
function paint(){var tr='translate3d('+nk.x+'px,'+(nk.y-nk.lift-nk.bob)+'px,0) rotate('+nk.a+'deg)';nk.el.style.transform=tr;if(emoBox)emoBox.style.transform=tr}
/* плавный возврат к обычному состоянию: лапки и крылья гаснут, ник мягко оседает */
function resetAuto(){
  if(!nk)return;
  nk.el.classList.remove('legs-on','still','fast','wings-on','perch','struggle');
  nk.mode='phys';nk.rest=0;nk.bob=0;nk.t=0;nk.ball=false;
}
/* эмодзи-реакции: появляются вокруг рамки ника (не в диалоге), у каждого свой глитч */
var EMO={
 n:['😐','🙄','🤨','🫠','💭','🧐'],
 h:['😍','❤️','🌟','🍻','🥰','✨','💫','😊'],
 l:['🤪','😜','🌀','🎉','🫪','🪩','✨'],
 a:['🤬','😡','💢','🔥','👿','🗯️'],
 z:['😴','💤','🥱','🫥','🌙'],
 s:['😱','😳','🫨','‼️','👻','🙀'],
 y:['😏','😎','🔎','👀','🤭','😈','🕶️'],
 f:['🎉','🥳','🌟','🎊','🍻'],
 d:['😵‍💫','💫','🫨','🥴','🌀'],
 w:['🤷','🫪','🍻','🥴','😮‍💨','🫤'],
 p:['😰','😨','🫣','💦','😬','🆘']
};
var EMK=[[/носк/i,'🧦'],[/душ|гигиен|мыт/i,'🚿'],[/кофе/i,'☕'],[/холодил|поесть|пожрал|еда/i,'🍔'],[/поиск|найти|ищи|inkee2004/i,'🔎'],[/видео|кадр|fps/i,'🎞️'],[/monika|смотрит|подгляд/i,'👀'],[/телепорт|fast travel|портал/i,'🌀'],[/мусор/i,'🗑️'],[/тату|татуха/i,'🐉'],[/звук|слышиш|топаю|noise/i,'🔊'],[/ночь|сон|сны|спать/i,'🌙'],[/машин|shift|передач/i,'🚗'],[/оружи|quickhack|хак/i,'💻'],[/свет|свеч|glow|relux/i,'💡'],[/погод|rain|дожд/i,'🌧️'],[/руководств|читай/i,'📖'],[/скачать|архив/i,'📦'],[/настро/i,'⚙️'],[/лень|ленив/i,'🛋️'],[/глаза|kiroshi|eye/i,'👁️'],[/лицо|мимик|поз/i,'🎭']];
var EMS=[{l:'-1.2rem',t:'-1.9rem'},{r:'-1rem',t:'-2rem'},{l:'38%',t:'-2.4rem'},{l:'-2.1rem',t:'.1rem'},{r:'-2.1rem',t:'.1rem'},{l:'62%',t:'-2.1rem'}];
var emoOK={},emoBox=null,emoT=null;
function emoSup(c){
  if(c in emoOK)return emoOK[c];
  var ok=true;
  try{
    var cv=document.createElement('canvas');cv.width=cv.height=40;var x=cv.getContext('2d');x.font='28px sans-serif';x.textBaseline='top';
    function sig(t){x.clearRect(0,0,40,40);x.fillText(t,2,2);return cv.toDataURL()}
    var s=sig(c),bad=sig(String.fromCodePoint(0x10FFFF));ok=s!==bad&&s!==sig('');
  }catch(e){ok=true}
  return emoOK[c]=ok;
}
function emoClear(fast){
  clearTimeout(emoT);
  if(!emoBox)return;
  var b=emoBox;emoBox=null;
  b.classList.add('out');setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b)},fast?60:380);
}
function emoShow(mood,text,ttl){
  emoClear(true);
  if(!nk||nk.gone||!nk.el)return;
  var set=(EMO[mood]||EMO.n).filter(emoSup),pick=[],t=text||'';
  for(var i=0;i<EMK.length&&pick.length<1;i++)if(EMK[i][0].test(t)&&emoSup(EMK[i][1]))pick.push(EMK[i][1]);
  var cnt=(mood==='a'||mood==='h'||mood==='s'||mood==='l')?3:2;
  var guard=0;while(pick.length<cnt&&set.length&&guard++<20){var c=rnd(set);if(pick.indexOf(c)<0)pick.push(c)}
  var slots=EMS.slice().sort(function(){return Math.random()-.5}),box=el('div','emo');
  box.style.width=nk.el.offsetWidth+'px';box.style.height=nk.el.offsetHeight+'px';
  box.style.transform=nk.el.style.transform;
  document.body.appendChild(box);emoBox=box;
  var br=bubble&&bubble.el?bubble.el.getBoundingClientRect():null,used=0;
  function hit(a){return br&&a.right>br.left-6&&a.left<br.right+6&&a.bottom>br.top-6&&a.top<br.bottom+6}
  pick.forEach(function(c,i){
    var e=el('i',null,c);box.appendChild(e);
    for(var k=0;k<slots.length;k++){
      var s=slots[(used+k)%slots.length];
      e.style.left=s.l||'auto';e.style.right=s.r||'auto';e.style.top=s.t;
      if(!hit(e.getBoundingClientRect())){used=(used+k+1);e.style.setProperty('--d',(i*.13+Math.random()*.1).toFixed(2)+'s');e.style.setProperty('--g',(2.2+Math.random()*2.4).toFixed(2)+'s');e.style.setProperty('--r',(Math.random()*24-12).toFixed(0)+'deg');return}
    }
    box.removeChild(e);
  });
  if(!box.children.length){emoClear(true)}
  if(ttl)emoT=setTimeout(function(){emoClear()},ttl);
}
function killBubble(){emoClear();if(bubble){bubble.dead=true;if(bubble.el.parentNode)bubble.el.parentNode.removeChild(bubble.el);bubble=null;faceShow(false)}}
function spawnNick(arr){
  ensureNick();var u=unit();
  killBubble();resetAuto();nk.lift=0;nk.gone=false;nk.el.style.display='';
  var b=search?search.getBoundingClientRect():{left:innerWidth*.3,width:innerWidth*.4,top:innerHeight*.06,height:10};
  nk.w=nk.el.offsetWidth;nk.h=nk.el.offsetHeight;
  nk.x=b.left+b.width*(.35+Math.random()*.3)-nk.w/2;nk.y=b.top+b.height*.3;
  nk.vx=(40+Math.random()*90)*u;nk.vy=-(290+Math.random()*70)*u;nk.a=-14;nk.va=70;nk.frozen=false;nk.drag=false;
  nk.inner.style.transition='none';nk.inner.style.transform='scale(.3)';nk.inner.style.opacity='0';void nk.inner.offsetWidth;
  nk.inner.style.transition='transform .55s cubic-bezier(.2,1.3,.4,1),opacity .35s ease';nk.inner.style.transform='scale(1)';nk.inner.style.opacity='1';
  nk.el.style.pointerEvents='auto';paint();playPop();
  refreshPlats();
  if(!loopOn){loopOn=true;lastT=performance.now();requestAnimationFrame(loop)}
  setTimeout(function(){if(nk&&!bubble)showBubble(arr&&NK.arrive?rnd(NK.arrive):rnd(SPAWN),{})},500);
}
/* ник сам выпрыгивает из поиска через несколько секунд после открытия страницы */
var arrived=false;try{arrived=!!sessionStorage.getItem('nk-arrive');sessionStorage.removeItem('nk-arrive')}catch(e){}
if(arrived)setTimeout(emerge,700);else setTimeout(spawnNick,4700);
function loop(t){
  var raw=Math.max(.001,(t-lastT)/1000),dt=Math.min(.033,raw);lastT=t;
  if(!nk||nk.gone){loopOn=false;return}
  platT-=raw;if(platT<=0){platT=.4;refreshPlats()}
  nk.rdt=raw;step(dt);
  requestAnimationFrame(loop);
}
function bounds(){return {maxX:innerWidth-nk.w-2,floor:innerHeight-nk.h-2}}
/* новое направление: ник сначала плавно тормозит, потом разгоняется в другую сторону */
function pickDir(R){nk.want=Math.random()<.5?1:-1;nk.sp=(3+Math.random()*2.5)*R;nk.dirT=1.4+Math.random()*2}
function startLegs(){nk.mode='legsup';nk.t=0;nk.vx=0;nk.vy=0;nk.el.classList.add('legs-on','still')}
function startLazy(){nk.mode='lazy';nk.t=0;nk.el.classList.add('still');showBubble(rnd(LAZY),{})}
function startWings(){
  nk.mode='wingup';nk.t=0;nk.plat=null;nk.el.classList.remove('legs-on','still');nk.el.classList.add('wings-on');
  showBubble(rnd(FLY),{});
}
/* ближайшая рамка в сторону движения, до которой можно допрыгнуть */
function neighbor(dir){
  var cx=nk.x+nk.w/2,R=16*unit(),c=[];
  plats.forEach(function(p){
    if(nk.plat&&p.el===nk.plat.el)return;
    var inDir=dir>0?p.r>cx+4:p.l<cx-4,gap=dir>0?p.l-cx:cx-p.r,dy=p.y-(nk.y+nk.h);
    if(inDir&&gap<16*R&&dy>-12*R&&dy<22*R)c.push({p:p,d:Math.max(0,gap)+Math.abs(dy)*.6});
  });
  c.sort(function(a,b){return a.d-b.d});
  return c.length?c[Math.floor(Math.random()*Math.min(2,c.length))].p:null;
}
/* прыжок на выбранную (или любую другую) рамку по баллистической дуге */
function startJump(target){
  var p=target;
  if(!p){
    var c=plats.filter(function(q){return !nk.plat||q.el!==nk.plat.el});
    if(!c.length){startLazy();return}
    p=rnd(c);
  }
  var u=unit(),g=950*u;
  var tx=clamp((p.l+p.r)/2+(Math.random()-.5)*(p.r-p.l)*.4,p.l+4,p.r-4)-nk.w/2,ty=p.y-nk.h;
  var dy=ty-nk.y,dist=Math.abs(tx-nk.x)/Math.max(1,innerWidth),T=clamp(.8+Math.abs(dy)/1500+dist*.7,.8,1.7);
  nk.el.classList.remove('legs-on','still');nk.mode='phys';nk.rest=0;nk.plat=null;
  nk.vy=(dy-.5*g*T*T)/T;nk.vx=(tx-nk.x)/T;nk.ball=true;nk.va=0;
  playWhoosh(.6);if(!bubble&&Math.random()<.6)showBubble(rnd(JUMP),{});
}
/* куда приземлиться после полёта: поиск (с подколами) или любая другая рамка */
function pickLanding(){
  var c=plats.filter(function(q){return q.cat!=='search'&&(!nk.plat||q.el!==nk.plat.el)});
  if(search&&(!c.length||Math.random()<.3)){nk.landEl='search';return}
  if(!c.length){nk.landEl=null;return}
  nk.landEl=rnd(c).el;nk.lf=.15+Math.random()*.7;
}
function landTarget(R){
  if(nk.landEl&&nk.landEl!=='search'){
    for(var i=0;i<plats.length;i++)if(plats[i].el===nk.landEl){var p=plats[i];return {x:p.l+(p.r-p.l)*nk.lf-nk.w/2,y:p.y-nk.h,p:p}}
  }
  if(search){var sr=search.getBoundingClientRect();return {x:sr.left+R*1.2,y:sr.top-nk.h+1,p:null,search:true}}
  return {x:nk.x,y:bounds().floor,p:null};
}
function step(dt){
  if(nk.frozen){posBubble();return}
  var u=unit(),R=16*u,B=bounds(),L=1.65*R;
  if(nk.drag){
    nk.a+=(clamp(nk.vx*.012,-22,22)-nk.a)*Math.min(1,dt*10);
    paint();posBubble();return;
  }
  var m=nk.mode;
  if(m==='phys'){
    nk.vy+=950*u*dt;
    if(!nk.ball){nk.vx*=Math.pow(.55,dt);nk.vy*=Math.pow(.8,dt)}
    var pbot=nk.y+nk.h;
    nk.x+=nk.vx*dt;nk.y+=nk.vy*dt;nk.a+=nk.va*dt;nk.va*=Math.pow(.25,dt);
    nk.lift+=(0-nk.lift)*Math.min(1,dt*5);nk.bob=0;
    if(nk.x<2){nk.x=2;if(Math.abs(nk.vx)>120*u)playThump(clamp(Math.abs(nk.vx)/(900*u),.2,1));nk.vx=Math.abs(nk.vx)*.5}
    if(nk.x>B.maxX){nk.x=B.maxX;if(Math.abs(nk.vx)>120*u)playThump(clamp(Math.abs(nk.vx)/(900*u),.2,1));nk.vx=-Math.abs(nk.vx)*.5}
    if(nk.y<2){nk.y=2;nk.vy=Math.abs(nk.vy)*.4}
    var ground=B.floor,gp=null,bot=nk.y+nk.h,cx=nk.x+nk.w/2;
    if(nk.vy>=0){
      for(var i=0;i<plats.length;i++){var p=plats[i];
        if(cx>p.l&&cx<p.r&&pbot<=p.y+2&&bot>=p.y&&p.y-nk.h<ground){ground=p.y-nk.h;gp=p}}
    }
    var onFloor=false;
    if(nk.y>=ground){
      nk.y=ground;nk.plat=gp;var imp=nk.vy;nk.ball=false;
      if(imp>110*u)playThump(clamp(imp/(1100*u),.2,1));
      nk.vy=-imp*.38;if(Math.abs(nk.vy)<70*u)nk.vy=0;
      nk.vx*=.84;nk.va+=nk.vx*.04;onFloor=nk.vy===0;
    }
    if(onFloor||(nk.y>=ground-.5&&nk.vy===0)){
      nk.vx*=Math.pow(.02,dt);nk.va*=Math.pow(.02,dt);nk.a+=(0-nk.a)*Math.min(1,dt*5);
    }
    if(nk.y>=ground-.5&&Math.abs(nk.vy)<2&&Math.abs(nk.vx)<8){
      nk.rest+=nk.rdt||dt;
      if(nk.rest>3.2&&!bubble&&!busy)startLegs();
    }else nk.rest=0;
  }else if(m==='legsup'){
    nk.y=nk.plat?nk.plat.y-nk.h:B.floor;nk.lift+=(L-nk.lift)*Math.min(1,dt*4);nk.t+=dt;nk.a+=(0-nk.a)*Math.min(1,dt*6);
    if(nk.t>1){nk.mode='walk';nk.t=0;nk.walkT=8+Math.random()*4;nk.stepT=0;nk.quipT=2+Math.random()*2.5;pickDir(R);nk.dir=nk.want;nk.sm=0;nk.el.classList.remove('still')}
  }else if(m==='walk'){
    var pl=nk.plat,lo=pl?pl.l+6:2+nk.w/2,hi=pl?pl.r-6:innerWidth-2-nk.w/2;
    nk.y=pl?pl.y-nk.h:B.floor;nk.lift+=(L-nk.lift)*Math.min(1,dt*5);nk.t+=dt;
    nk.dirT-=dt;if(nk.dirT<=0)pickDir(R);
    if(nk.dir!==nk.want){nk.sm-=dt*3.2;if(nk.sm<=0){nk.sm=0;nk.dir=nk.want}}else nk.sm=Math.min(1,nk.sm+dt*2);
    /* краб: боком, короткими рывками в такт лапкам; у края замедляется */
    var ph=(nk.t%.5)/.5,pulse=.35+.65*Math.abs(Math.sin(ph*Math.PI*2));
    var cxw=nk.x+nk.w/2,ahead=nk.dir>0?hi-cxw:cxw-lo,f=clamp(ahead/(3*R),.18,1);
    nk.x+=nk.dir*nk.sp*pulse*nk.sm*f*dt;
    nk.x=clamp(nk.x,lo-nk.w/2,hi-nk.w/2);nk.x=clamp(nk.x,2,B.maxX);
    cxw=nk.x+nk.w/2;ahead=nk.dir>0?hi-cxw:cxw-lo;
    nk.bob=Math.abs(Math.sin(ph*Math.PI*2))*.1*R*nk.sm;
    nk.a=Math.sin(ph*Math.PI*2)*1.1*nk.sm;
    nk.stepT-=dt;if(nk.stepT<=0&&nk.sm>.25){nk.stepT=.25;nk.alt^=1;playStomp(nk.alt)}
    if(ahead<=1.5&&nk.sm>0){
      nk.mode='edge';nk.t=0;nk.edgeT=.6+Math.random()*.5;nk.el.classList.add('still');
      if(!bubble&&Math.random()<.35)showBubble(rnd(EDGE),{});
    }else{
      nk.quipT-=dt;if(nk.quipT<=0){nk.quipT=6+Math.random()*4;if(!bubble){var qs=QUIPS[pl?pl.cat:'floor']||QUIPS.floor;showBubble([rnd(qs)],{})}}
      nk.walkT-=dt;if(nk.walkT<=0){nk.mode='tired';nk.t=0;nk.bob=0;nk.el.classList.add('still')}
    }
  }else if(m==='edge'){
    /* на краю: замирает, покачивается над пустотой, потом решает — развернуться, спрыгнуть или перепрыгнуть */
    var pe=nk.plat;nk.y=pe?pe.y-nk.h:B.floor;nk.t+=dt;nk.lift+=(L-nk.lift)*Math.min(1,dt*5);nk.bob=0;
    nk.a=nk.dir*(Math.min(1,nk.t/.25)*5+Math.sin(nk.t*13)*1.4*Math.min(1,nk.t/.3));
    if(nk.t>=nk.edgeT){
      var r0=Math.random(),nb=pe?neighbor(nk.dir):null;
      nk.a=0;nk.el.classList.remove('still');
      if(nb&&r0<.5){startJump(nb)}
      else if(pe&&r0<.72){
        nk.mode='phys';nk.plat=null;nk.vx=nk.dir*95*u;nk.vy=-210*u;nk.ball=false;nk.el.classList.remove('legs-on');
      }else{
        nk.mode='walk';nk.t=0;nk.dir=-nk.dir;nk.want=nk.dir;nk.sm=0;nk.dirT=1.8+Math.random()*1.8;
      }
    }
  }else if(m==='tired'){
    nk.y=nk.plat?nk.plat.y-nk.h:B.floor;nk.t+=dt;nk.a+=(0-nk.a)*Math.min(1,dt*6);
    if(nk.t>1){var r=Math.random();if(r<.3)startWings();else if(r<.75)startJump();else startLazy()}
  }else if(m==='lazy'){
    nk.y=nk.plat?nk.plat.y-nk.h:B.floor;nk.t+=dt;nk.lift+=(0-nk.lift)*Math.min(1,dt*3);
    if(nk.t>2.2){resetAuto();nk.rest=0}
  }else if(m==='wingup'){
    nk.t+=dt;nk.lift+=(0-nk.lift)*Math.min(1,dt*4);nk.y+=((nk.plat?nk.plat.y-nk.h:B.floor)-R*2.5-nk.y)*Math.min(1,dt*2.5);
    if(nk.t>1){
      nk.mode='fly';nk.t=0;nk.wi=0;nk.wp=[];
      for(var i2=0;i2<3+(Math.random()<.5?1:0);i2++)nk.wp.push({x:innerWidth*(.06+Math.random()*.8),y:innerHeight*(.08+Math.random()*.72)});
    }
  }else if(m==='fly'||m==='land'){
    nk.t+=dt;nk.lift+=(0-nk.lift)*Math.min(1,dt*4);
    var tx,ty,k=1-Math.exp(-dt*(m==='land'?2.2:1.5)),lt=null;
    if(m==='fly'){
      var w=nk.wp[nk.wi];tx=w.x;ty=w.y;
      if(nk.t>1.8){nk.t=0;nk.wi++;if(nk.wi>=nk.wp.length){nk.mode='land';nk.t=0;pickLanding()}}
    }else{lt=landTarget(R);tx=lt.x;ty=lt.y}
    var px=nk.x;
    nk.x+=(tx-nk.x)*k;nk.y+=(ty-nk.y)*k;
    nk.a=clamp((nk.x-px)/Math.max(dt,.001)*.01,-10,10);
    nk.bob=m==='fly'?Math.sin(nk.t*3)*.3*R:0;
    if(m==='land'&&Math.hypot(tx-nk.x,ty-nk.y)<3){
      nk.x=tx;nk.y=ty;nk.a=0;nk.bob=0;nk.t=0;nk.el.classList.remove('wings-on');
      if(lt.search){
        nk.mode='perch';nk.el.classList.add('perch');playThump(.6);
        showBubble(ROAST[roastIdx++%ROAST.length],{done:function(){
          if(!nk||nk.mode!=='perch')return;
          nk.mode='perchwait';
          showBubble(rnd(DOWN),{done:function(){
            if(!nk||nk.mode!=='perchwait')return;
            nk.el.classList.remove('perch');nk.el.classList.add('wings-on');
            nk.mode='land';nk.t=0;pickLanding();if(nk.landEl==='search'){var c2=plats.filter(function(q){return q.cat!=='search'});if(c2.length){nk.landEl=rnd(c2).el;nk.lf=.15+Math.random()*.7}}
          }});
        }});
      }else{
        nk.mode='phys';nk.plat=lt.p;nk.vx=0;nk.vy=0;nk.rest=0;playThump(.4);
      }
    }
    nk.flapT-=dt;if(nk.flapT<=0){nk.flapT=.6;playFlap()}
  }else if(m==='perch'||m==='perchwait'){
    var s2=search.getBoundingClientRect();nk.x=s2.left+R*1.2;nk.y=s2.top-nk.h+1;nk.a=0;
  }
  paint();posBubble();
}
function onNickDown(e){
  if(busy||nk.frozen||e.button>0)return;
  e.preventDefault();grabs++;
  if(nk.mode!=='phys'){killBubble();resetAuto()}
  nk.lift=0;nk.plat=null;
  if(!bubble&&grabs>=2&&grabs-lastPrank>=2&&Math.random()<.34){lastPrank=grabs;prank();return}
  nk.drag=true;nk.el.classList.add('drag');nk.pid=e.pointerId;
  try{nk.el.setPointerCapture(e.pointerId)}catch(x){}
  nk.ox=e.clientX-nk.x;nk.oy=e.clientY-nk.y;nk.lt=performance.now();nk.vx=0;nk.vy=0;playGrab();
  flashFace('s',1000);emoShow(rnd(['s','d','p']),'',1300);
}
function onNickMove(e){
  if(!nk.drag||e.pointerId!==nk.pid)return;
  var now=performance.now(),dt=(now-nk.lt)/1000;
  var nx=clamp(e.clientX-nk.ox,2,innerWidth-nk.w-2),ny=clamp(e.clientY-nk.oy,2,innerHeight-nk.h-2);
  if(dt>0){nk.vx=nk.vx*.6+((nx-nk.x)/dt)*.4;nk.vy=nk.vy*.6+((ny-nk.y)/dt)*.4}
  nk.x=nx;nk.y=ny;nk.lt=now;
}
function onNickUp(e){
  if(!nk.drag||e.pointerId!==nk.pid)return;
  var u=unit(),cap=2600*u;
  nk.drag=false;nk.el.classList.remove('drag');nk.rest=0;
  if(performance.now()-nk.lt>90){nk.vx*=.2;nk.vy*=.2}
  nk.vx=clamp(nk.vx,-cap,cap);nk.vy=clamp(nk.vy,-cap,cap);
  var sp=Math.sqrt(nk.vx*nk.vx+nk.vy*nk.vy);
  nk.va=nk.vx*.05;
  if(sp>350*u)playWhoosh(clamp(sp/(1800*u),.3,1));else playGrab();
  if(sp>900*u)flashFace('d',1800);
  try{nk.el.releasePointerCapture(e.pointerId)}catch(x){}
}

/* ---------- портал-«дыра в коде» ---------- */
function jag(){
  var n=30,pts=[];
  for(var i=0;i<n;i++){var a=i/n*Math.PI*2,r=44+Math.random()*5;pts.push((50+Math.cos(a)*r).toFixed(1)+'% '+(50+Math.sin(a)*r).toFixed(1)+'%')}
  return 'polygon('+pts.join(',')+')';
}
root.style.setProperty('--h1',jag());root.style.setProperty('--h2',jag());root.style.setProperty('--h3',jag());
var CODE=['<div class="page">','null pointer','0x00FF3A','undefined','}catch(e){','ERR_VOID','DROP TABLE','█▓▒░▒','404','</main>','NaN','segfault','while(1){','0 1 1 0 1','throw new','..//..//'];
function makePortal(cx,cy){
  var p=el('div','portal');p.style.left=cx+'px';p.style.top=cy+'px';
  var h=el('div','hole'),c=el('div','code'),txt=[];
  for(var i=0;i<18;i++)txt.push(rnd(CODE));
  c.textContent=txt.join('\n')+'\n'+txt.join('\n');h.appendChild(c);p.appendChild(h);
  for(var j=0;j<6;j++){
    var f=el('span','fr',rnd(['<','/>','{}','0x','01','//']));var a=j/6*Math.PI*2+Math.random()*.4,r=52+Math.random()*6;
    f.style.left=(50+Math.cos(a)*r)+'%';f.style.top=(50+Math.sin(a)*r)+'%';f.style.animationDelay=(Math.random()*1.2)+'s';p.appendChild(f);
  }
  document.body.appendChild(p);void p.offsetWidth;p.classList.add('open');playPortal(true);playCreak();return p;
}
function closePortal(p){
  p.classList.remove('open');p.classList.add('closing');playPortal(false);
  setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p)},560);
}
function randPoint(cx,cy,dmin,dmax){
  var x,y,g=0,m=60;
  do{var a=Math.random()*Math.PI*2,d=dmin+Math.random()*(dmax-dmin);x=cx+Math.cos(a)*d;y=cy+Math.sin(a)*d;g++}
  while((x<m||x>innerWidth-m||y<m||y>innerHeight-m)&&g<50);
  return {x:clamp(x,m,innerWidth-m),y:clamp(y,m,innerHeight-m)};
}
function prank(){
  busy=true;killBubble();resetAuto();flashFace('p',2200);nk.frozen=true;nk.drag=false;nk.el.style.pointerEvents='none';
  var R=16*unit(),cx=nk.x+nk.w/2,cy=nk.y+nk.h/2;
  var P=randPoint(cx,cy,R*9,R*18),pa=makePortal(P.x,P.y),sx=nk.x,sy=nk.y,tx=P.x-nk.w/2,ty=P.y-nk.h/2,T0=performance.now()+700,sw0=false,suck=false;
  (function fr(now){
    var t=now-T0;
    if(t<0){requestAnimationFrame(fr);return}
    if(t<350){
      if(!sw0){sw0=true;nk.el.classList.add('struggle');playCreak()}
    }else{
      var q=clamp((t-350)/1100,0,1),e=q*q*q,sw=Math.sin(q*Math.PI*2.5)*(1-q)*36;
      if(!suck){suck=true;playSuck(false)}
      nk.x=sx+(tx-sx)*e+sw;nk.y=sy+(ty-sy)*e-Math.sin(q*Math.PI)*40;nk.a=q*420;
      nk.inner.style.transition='none';nk.inner.style.transform='scale('+(1-.95*e).toFixed(3)+')';paint();
      if(q>=1){finish();return}
    }
    requestAnimationFrame(fr);
  })(performance.now());
  function finish(){
    nk.el.classList.remove('struggle');nk.inner.style.opacity='0';
    closePortal(pa);
    setTimeout(function(){
      var Q=randPoint(cx,cy,innerWidth*.22,innerWidth*.5),pb=makePortal(Q.x,Q.y);
      nk.x=clamp(Q.x-nk.w/2,2,innerWidth-nk.w-2);nk.y=clamp(Q.y-nk.h/2,2,innerHeight-nk.h-2);nk.vx=0;nk.vy=0;nk.a=0;nk.va=0;paint();
      nk.inner.style.transition='none';nk.inner.style.transform='scale(.05) rotate(-200deg)';nk.inner.style.opacity='0';void nk.inner.offsetWidth;
      setTimeout(function(){
        nk.inner.style.transition='transform .6s cubic-bezier(.2,1.25,.4,1),opacity .4s ease';
        nk.inner.style.transform='scale(1) rotate(0deg)';nk.inner.style.opacity='1';playPop();
      },350);
      setTimeout(function(){
        closePortal(pb);nk.frozen=false;nk.el.style.pointerEvents='auto';nk.vy=-140*unit();busy=false;nk.rest=0;
        showBubble(SEQS[seqIdx++%SEQS.length],{});
      },1250);
    },800);
  }
}

/* ---------- диалог ---------- */
function showBubble(lines,opts){
  opts=opts||{};if(bubble)killBubble();
  var b=el('div','bubble'),bh=el('div','bh'),bt=el('div','bt');
  bh.appendChild(el('i'));bh.appendChild(el('i'));bh.appendChild(el('span',null,'inkee2004.exe'));
  b.appendChild(bh);b.appendChild(bt);document.body.appendChild(b);
  var me={el:b,txt:bt,dead:false};bubble=me;posBubble();void b.offsetWidth;b.classList.add('on');playGiggle();
  var li=0;
  (function next(){
    if(me.dead)return;
    if(li>=lines.length){
      if(opts.done)opts.done();
      setTimeout(function(){b.classList.remove('on');setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b);if(bubble===me){bubble=null;faceShow(false)}},320)},400);
      return;
    }
    var raw=lines[li++],mood='n',mm=/^([a-z])\|/.exec(raw);
    if(mm){mood=mm[1];raw=raw.slice(2)}
    faceSet(mood);faceShow(true);emoShow(mood,raw);
    var line=parseLine(raw),k=0;bt.style.opacity=1;bt.textContent='';
    (function typeCh(){
      if(me.dead)return;
      if(k<line.length){
        var o=line[k++],n;
        if(o.z){n=el('span','cz',o.c);n.dataset.r=o.c}else n=document.createTextNode(o.c);
        bt.appendChild(n);if(k%3===0)playChirp();if(k%2===0){fc.i++;faceRender()}setTimeout(typeCh,30);
      }else setTimeout(function(){bt.style.opacity=0;emoClear();setTimeout(next,230)},800+line.length*34);
    })();
  })();
}
function posBubble(){
  if(!bubble||!nk)return;
  var bw=bubble.el.offsetWidth,bh=bubble.el.offsetHeight,x,y;
  if(nk.mode==='perch'||nk.mode==='perchwait'||nk.mode==='land'){
    x=nk.x-bw-12;if(x<8)x=nk.x+nk.w+12;y=clamp(nk.y+nk.h-bh,8,innerHeight-bh-8);
  }else{
    x=clamp(nk.x+nk.w/2-bw/2,8,innerWidth-bw-8);y=nk.y-nk.lift-bh-14;
    if(y<8)y=nk.y+nk.h+14;
  }
  bubble.el.style.transform='translate3d('+x+'px,'+y+'px,0)';
}
addEventListener('resize',function(){refreshPlats();if(nk&&!nk.gone&&!nk.drag&&nk.mode==='phys'){var B=bounds();nk.x=clamp(nk.x,2,Math.max(2,B.maxX));nk.y=clamp(nk.y,2,Math.max(2,B.floor));paint()}});
/* появление на новой странице: выходит из портала */
function emerge(L){
  ensureNick();busy=true;killBubble();resetAuto();nk.gone=false;nk.el.style.display='';nk.lift=0;
  nk.w=nk.el.offsetWidth;nk.h=nk.el.offsetHeight;
  var Q={x:innerWidth*(.28+Math.random()*.44),y:innerHeight*(.22+Math.random()*.2)},pb=makePortal(Q.x,Q.y);
  nk.x=clamp(Q.x-nk.w/2,2,innerWidth-nk.w-2);nk.y=clamp(Q.y-nk.h/2,2,innerHeight-nk.h-2);nk.vx=0;nk.vy=0;nk.a=0;nk.va=0;
  nk.frozen=true;nk.drag=false;nk.el.style.pointerEvents='none';
  nk.inner.style.transition='none';nk.inner.style.transform='scale(.05) rotate(-200deg)';nk.inner.style.opacity='0';void nk.inner.offsetWidth;paint();
  refreshPlats();
  if(!loopOn){loopOn=true;lastT=performance.now();requestAnimationFrame(loop)}
  setTimeout(function(){
    nk.inner.style.transition='transform .6s cubic-bezier(.2,1.25,.4,1),opacity .4s ease';
    nk.inner.style.transform='scale(1) rotate(0deg)';nk.inner.style.opacity='1';playPop();
  },350);
  setTimeout(function(){
    closePortal(pb);nk.frozen=false;nk.el.style.pointerEvents='auto';nk.vy=-140*unit();busy=false;nk.rest=0;
    showBubble(L?rnd(L):NK.arrive?rnd(NK.arrive):rnd(SPAWN),{});
  },1250);
}
/* уход со страницы: затягивает в портал, потом вызывается переход */
function leave(cb){
  if(!nk||nk.gone||busy||nk.frozen||nk.el.style.display==='none'){cb();return}
  busy=true;killBubble();resetAuto();nk.frozen=true;nk.drag=false;nk.el.style.pointerEvents='none';
  var R=16*unit(),cx=nk.x+nk.w/2,cy=nk.y+nk.h/2,done=false;
  var P=randPoint(cx,cy,R*5,R*9),pa=makePortal(P.x,P.y),sx=nk.x,sy=nk.y,tx=P.x-nk.w/2,ty=P.y-nk.h/2,T0=performance.now()+120,suck=false;
  function fin(){if(done)return;done=true;cb()}
  setTimeout(fin,1500);
  (function fr(now){
    var t=now-T0;
    if(t<0){requestAnimationFrame(fr);return}
    if(!suck){suck=true;playSuck(false)}
    var q=clamp(t/600,0,1),e=q*q*q,sw=Math.sin(q*Math.PI*2.5)*(1-q)*24;
    nk.x=sx+(tx-sx)*e+sw;nk.y=sy+(ty-sy)*e-Math.sin(q*Math.PI)*30;nk.a=q*420;
    nk.inner.style.transition='none';nk.inner.style.transform='scale('+(1-.95*e).toFixed(3)+')';paint();
    if(q>=1){nk.inner.style.opacity='0';closePortal(pa);setTimeout(fin,120);return}
    requestAnimationFrame(fr);
  })(performance.now());
}
/* слияние с поисковым запросом: ник влетает в строку поиска и растворяется в тексте */
function absorb(el,cb){
  if(!nk||nk.gone||busy||nk.frozen||nk.el.style.display==='none'){cb();return}
  busy=true;killBubble();resetAuto();nk.frozen=true;nk.drag=false;nk.el.style.pointerEvents='none';
  var r=el.getBoundingClientRect(),tx=r.left+Math.min(r.width*.42,160*unit())-nk.w/2,ty=r.top+r.height/2-nk.h/2,sx=nk.x,sy=nk.y,T0=performance.now()+80,snd=false,done=false;
  function fin(){if(done)return;done=true;nk.gone=true;nk.el.style.display='none';busy=false;el.classList.add('merge');setTimeout(function(){el.classList.remove('merge')},900);cb()}
  setTimeout(fin,1400);
  (function fr(now){
    var t=now-T0;
    if(t<0){requestAnimationFrame(fr);return}
    if(!snd){snd=true;playSuck(false)}
    var q=clamp(t/650,0,1),e=q*q*(3-2*q);
    nk.x=sx+(tx-sx)*e;nk.y=sy+(ty-sy)*e-Math.sin(q*Math.PI)*40;nk.a=q*300;
    nk.inner.style.transition='none';nk.inner.style.transform='scale('+(1-.9*e).toFixed(3)+')';nk.inner.style.opacity=(1-Math.max(0,q-.6)/.4).toFixed(2);paint();
    if(q>=1){setTimeout(fin,60);return}
    requestAnimationFrame(fr);
  })(performance.now());
}
window.NICK={leave:leave,absorb:absorb,back:emerge,say:function(l){if(nk&&!nk.gone&&!bubble&&!busy)showBubble(l,{})}};
})();
