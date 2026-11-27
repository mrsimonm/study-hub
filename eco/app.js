/* Eco Hub engine (shared with Micro Hub, Statistics Hub and Geology Hub). Data lectures are registered with GEO.register({...}); GEO.start() loads the course and boots. */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function el(id){return document.getElementById(id)}

/* ---------- state ---------- */
var KEY="ecoHub.v1";
function fresh(){return {review:[],tp:{},best:{},xp:0,day:{d:"",xp:0},streak:{last:"",n:0},games:{},full:false,last:"",mas:{}}}
var S=fresh();
function isObj(x){return x&&typeof x==="object"&&!Array.isArray(x)}
try{var raw=localStorage.getItem(KEY);if(raw){var p=JSON.parse(raw);if(isObj(p)){S.review=Array.isArray(p.review)?p.review:[];S.tp=isObj(p.tp)?p.tp:{};S.best=isObj(p.best)?p.best:{};S.xp=+p.xp||0;if(isObj(p.day))S.day={d:String(p.day.d||""),xp:+p.day.xp||0};if(isObj(p.streak))S.streak={last:String(p.streak.last||""),n:+p.streak.n||0};S.games=isObj(p.games)?p.games:{};S.full=!!p.full;S.mas=isObj(p.mas)?p.mas:{};S.last=typeof p.last==="string"?p.last:""}}}catch(e){}
function save(skipSync){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(!skipSync&&window.GEOSync)window.GEOSync.onSave(S)}
function tp(id){if(!S.tp[id]||typeof S.tp[id]!=="object")S.tp[id]={};var x=S.tp[id];if(!x.done||typeof x.done!=="object")x.done={};if(!x.best||typeof x.best!=="object")x.best={};x.step=+x.step||0;if(!isObj(x.bites))x.bites={};return x}

var GEO=window.GEO={topics:[],byId:{},ALL:{},$:$,$$:$$,shuffle:shuffle,esc:esc,el:el};
GEO._getState=function(){return S};
GEO._setState=function(next){
  if(!isObj(next))return;
  S=Object.assign(fresh(),next);
  save(true);hud();badge();if(window.CAT)CAT.refresh();
  if(!el("v-home").hidden)renderHome();
  else if(CUR&&!el("v-start").hidden)progress();
};
var ALL=GEO.ALL,CUR=null;
GEO.register=function(t){
  t.Q=t.Q||[];t.VOC=t.VOC||[];t.VCON=t.VCON||[];t.steps=t.steps||[];
  GEO.topics.push(t);GEO.byId[t.id]=t;
  t.Q.forEach(function(q){if(ALL[q.id])console.error("Duplicate question id "+q.id);q.t=t.id;ALL[q.id]=q});
};
GEO.planned=[];

/* ---------- course settings + data-file loader ----------
   Lectures are plain data folders (lecture.json + steps.md) listed in a course.json.
   See AUTHORING.md. GEO.start() loads the course file, builds each data lecture with GeoLecture.build(), registers it, then boots. */
GEO.course={title:"Eco Hub",code:"",subtitle:"ČZU Prague · Fundamentals of Ecology",
  intro:"Fundamentals of Ecology in one place: step-by-step lessons, flashcards, tick-all-that-apply drills, mock tests and review.",
  footer:"Built from the Fundamentals of Ecology course material of Martin Bulla and Peter Mikula (ČZU Prague).",
  testsCard:false};
GEO.note=function(html,bad){var h=el("loadnotes");if(!h)return;var d=document.createElement("div");d.className="card";d.style.borderColor=bad?"var(--no)":"var(--teach)";d.innerHTML=html;h.appendChild(d)};
function getFile(url,kind){return fetch(url,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(url+" (HTTP "+r.status+")");return kind==="json"?r.json():r.text()})}
GEO.loadCourse=function(url){
  var base=url.replace(/[^\/]*$/,"");
  return getFile(url,"json").then(function(C){
    ["title","code","subtitle","intro","footer","testsCard","tests","apply","paths","grades","exam","tickall"].forEach(function(k){if(C[k]!==undefined)GEO.course[k]=C[k]});
    GEO.course.base=base;
    if(Array.isArray(C.planned))GEO.planned=C.planned;
    document.title=GEO.course.title;
    return Promise.all((C.lectures||[]).map(function(p){
      var dir=base+String(p).replace(/\/+$/,"")+"/";
      return Promise.all([getFile(dir+"lecture.json","json"),getFile(dir+"steps.md","text")])
        .then(function(r){return {p:p,L:r[0],md:r[1]}},function(e){return {p:p,err:e.message||String(e)}});
    }));
  }).then(function(list){
    list.forEach(function(x){
      if(x.err){GEO.note("<b>Could not load lecture "+esc(x.p)+".</b><br>"+esc(x.err),true);return}
      if(!window.GeoLecture){GEO.note("<b>lib/lecture-lib.js is missing</b>, so data lectures cannot be built.",true);return}
      var r=GeoLecture.build(x.L,x.md);
      if(r.errors.length){GEO.note("<b>Lecture "+esc(x.p)+" has problems and was skipped:</b><ul>"+r.errors.map(function(m){return "<li>"+esc(m)+"</li>"}).join("")+"</ul>Run <code>node tools/validate.js</code> for the full list.",true);return}
      var T=r.topic,dup=[];
      if(GEO.byId[T.id])dup.push('lecture id "'+T.id+'" is already used by another lecture');
      T.Q.forEach(function(q){if(ALL[q.id])dup.push('question id "'+q.id+'" is already used')});
      if(dup.length){GEO.note("<b>Lecture "+esc(x.p)+" was skipped:</b> "+esc(dup.join("; "))+".",true);return}
      GEO.register(T);
      if(r.warnings.length)console.warn("Lecture "+x.p+": "+r.warnings.join(" | "));
    });
  });
};
GEO.start=function(){
  var u=new URLSearchParams(location.search).get("course")||"courses/eco/course.json";
  var p=/^[a-z][a-z0-9+.-]*:|^\/\//i.test(u)?Promise.reject(new Error("The course path must be a relative path inside this site.")):GEO.loadCourse(u);
  p.catch(function(e){GEO.note("<b>Data lectures could not be loaded.</b> "+esc(e.message||e)+"<br>If you opened <code>index.html</code> straight from disk, run a tiny local server instead: <code>python3 -m http.server 8000</code> and open <code>http://localhost:8000</code>.",true)}).then(function(){GEO.boot()});
};

/* ---------- motivation layer: XP, levels, daily goal, streak, toasts, confetti ---------- */
var GOAL=150;
var LV=["Consumer","Budget line","Utility","Demand","Elasticity","Marginal cost","MR = MC","Break-even","Market maker","Oligopolist","Economist"];
function lvOf(x){var n=0,need=100;while(x>=need){x-=need;n++;need=100+n*50}return {n:n,into:x,need:need}}
function lvName(n){return LV[Math.min(n,LV.length-1)]}
function dstr(d){return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function today(){return dstr(new Date())}
function yday(){return dstr(new Date(Date.now()-864e5))}
function streakNow(){return (S.streak.last===today()||S.streak.last===yday())?S.streak.n:0}
function dayXP(){return S.day.d===today()?S.day.xp:0}
function hud(){
  var L=lvOf(S.xp),x=el("hudXP"),k=el("hudStreak");if(!x)return;
  x.innerHTML='⚡ '+S.xp+' · Lv '+(L.n+1)+' <span class="lv"><i style="width:'+Math.round(L.into/L.need*100)+'%"></i></span>';
  x.title="Level "+(L.n+1)+": "+lvName(L.n)+". "+(L.need-L.into)+" XP to the next level.";
  k.textContent="🔥 "+streakNow();k.title=streakNow()+" day"+(streakNow()===1?"":"s")+" in a row";
}
var TQ={n:0,t:null};
function toast(msg,big){
  var h=el("toasts");if(!h)return;var d=document.createElement("div");d.className="toast"+(big?" big":"");d.textContent=msg;h.appendChild(d);
  while(h.children.length>3)h.removeChild(h.firstChild);
  setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},big?2600:1500);
}
function confetti(){
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var c=document.createElement("div");c.className="confetti";var cols=["#F2C14E","#5FD39A","#8CC4DC","#E39BDD","#F59A73","#9C93F2"];
  for(var i=0;i<46;i++){var p=document.createElement("i");p.style.left=Math.random()*100+"%";p.style.background=cols[i%cols.length];p.style.animationDelay=(Math.random()*.5)+"s";p.style.animationDuration=(1.2+Math.random()*.9)+"s";c.appendChild(p)}
  document.body.appendChild(c);setTimeout(function(){c.remove()},2600);
}
function xp(n,why){
  if(!n)return;var before=lvOf(S.xp).n,td=today(),dayBefore=dayXP();
  S.xp+=n;if(S.day.d!==td)S.day={d:td,xp:0};S.day.xp+=n;
  if(S.streak.last!==td){S.streak.n=(S.streak.last===yday())?S.streak.n+1:1;S.streak.last=td;if(S.streak.n>1)setTimeout(function(){toast("🔥 "+S.streak.n+" days in a row!",true)},400)}
  save();hud();
  TQ.n+=n;clearTimeout(TQ.t);TQ.t=setTimeout(function(){toast("+"+TQ.n+" XP");TQ.n=0},250);
  var after=lvOf(S.xp).n;
  if(after>before){confetti();setTimeout(function(){toast("Level up! You are now a "+lvName(after)+" (level "+(after+1)+") 🎉",true)},300)}
  else if(dayBefore<GOAL&&S.day.xp>=GOAL){confetti();setTimeout(function(){toast("Daily goal done! 🎯 Anything more is a bonus.",true)},300)}
  if(window.CAT)CAT.onXP(n,why);
}
GEO.xp=xp;GEO.toast=toast;GEO.confetti=confetti;GEO.lvOf=lvOf;GEO.lvName=lvName;GEO.GOAL=GOAL;GEO.streakNow=streakNow;GEO.today=today;GEO.dstr=dstr;
function fx(node,cls){if(!node)return;node.classList.remove("pop","shake");void node.offsetWidth;node.classList.add(cls)}
GEO.fx=fx;
function modal(em,title,text,btns){
  var m=el("modal"),b=el("modalbox");
  b.innerHTML='<div class="em">'+em+'</div><h2 style="margin:8px 0 6px">'+title+'</h2><p style="margin:0 auto">'+text+'</p><div class="row">'+btns.map(function(x,k){return '<button class="btn'+(k?' sec':'')+'" data-mb="'+k+'">'+x[0]+'</button>'}).join("")+'</div>';
  m.hidden=false;var f=$("[data-mb]",b);if(f)f.focus();
  b.onclick=function(e){var t=e.target.closest("[data-mb]");if(!t)return;m.hidden=true;var fn=btns[+t.getAttribute("data-mb")][1];if(fn)fn()};
}

/* ---------- read aloud ---------- */
var SPK=null;
function canSpeak(){return "speechSynthesis" in window&&typeof SpeechSynthesisUtterance!=="undefined"}
function stopSpeak(){if(canSpeak())speechSynthesis.cancel();if(SPK){SPK.setAttribute("aria-pressed","false");SPK.textContent="🔊 Read aloud"}SPK=null}
function speak(text,btn){
  if(!canSpeak())return;var was=SPK===btn;stopSpeak();if(was)return;
  var u=new SpeechSynthesisUtterance(text.replace(/\s+/g," ").trim());u.lang="en-GB";u.rate=.98;
  u.onend=function(){if(SPK===btn)stopSpeak()};SPK=btn;btn.setAttribute("aria-pressed","true");btn.textContent="⏹ Stop";speechSynthesis.speak(u);
}

/* ---------- small helpers for topic widgets ---------- */
function table(host,head,rows,from){var h='<table><thead><tr>'+head.map(function(x){return '<th>'+x+'</th>'}).join("")+'</tr></thead><tbody>';rows.forEach(function(r){h+='<tr>'+r.map(function(c,k){return '<td'+(k>=from?' class="ans"':'')+'>'+(k===0?'<b>'+c+'</b>':c)+'</td>'}).join("")+'</tr>'});host.innerHTML=h+'</tbody></table>'}
GEO.table=table;
document.addEventListener("click",function(e){
  var c=e.target.closest(".ans");if(c)c.classList.toggle("rev");
  var t=e.target.closest("[data-toggle=hide]");
  if(t){var w=el(t.getAttribute("data-target"));if(!w)return;var on=w.classList.toggle("hide");$$(".rev",w).forEach(function(x){x.classList.remove("rev")});t.textContent=on?"Show answers":"Test myself (blur answers)"}
});
/* sorter: rows = [[name, correctKey, explanation]], keys = [[key,label]] */
GEO.sorter=function(host,rows0,keys){
  var right=0,done=0,first=0,rows=shuffle(rows0.slice()).map(function(r){return {r:r,rep:false}}),total=rows.length;
  if(CUR)glossBuild();
  function desc(k){var kk=keys.filter(function(x){return x[0]===k})[0];if(!kk)return "";if(kk[2])return kk[2];var e=GLOSS&&glossFind(kk[1]);return e?e.mean:""}
  function rowHTML(x,n){var r=x.r,e=GLOSS&&glossFind(r[0]);
    return '<div class="wrow" data-n="'+n+'"><span class="nm">'+(x.rep?'<span class="chip">again</span> ':'')+esc(r[0])+(e?' <button class="defbtn" data-def title="What does it mean?" aria-label="Show the definition">ⓘ</button>':'')+'</span><span class="seg">'+keys.map(function(k){return '<button data-k="'+k[0]+'">'+esc(k[1])+'</button>'}).join("")+'</span><span class="fk" aria-live="polite"></span></div>'}
  host.classList.add("sort");
  host.innerHTML='<div class="srows">'+rows.map(rowHTML).join("")+'</div><div class="sortscore"></div><button class="ghost" data-reset style="margin-top:6px">Shuffle and restart</button>';
  function score(){$(".sortscore",host).textContent="Score: "+first+" / "+total+" right first time"+(done===rows.length?(first===total?" · perfect!":" · all fixed ✓"):"")}
  host.onclick=function(ev){
    if(ev.target.closest("[data-reset]")){GEO.sorter(host,rows0,keys);return}
    var db=ev.target.closest("[data-def]");
    if(db){var row=db.closest(".wrow"),x=rows[+row.getAttribute("data-n")],e=glossFind(x.r[0]),f=$(".fk",row);if(!e)return;
      if(!$("button[data-k]",row).disabled)x.helped=true;f.className="fk";f.innerHTML='<div class="why" style="margin-top:0">📖 <b>'+esc(e.term)+'</b> = '+esc(e.mean)+(x.helped?'<br><i>You used the definition, so this one comes back once more at the end.</i>':'')+'</div>';db.disabled=true;return}
    var b=ev.target.closest("button[data-k]");if(!b||b.disabled)return;
    var row2=b.closest(".wrow"),n=+row2.getAttribute("data-n"),x2=rows[n],r=x2.r,ok=b.getAttribute("data-k")===r[1],f2=$(".fk",row2);
    $$("button",row2).forEach(function(y){y.disabled=true});b.setAttribute("aria-pressed","true");
    var lab=keys.filter(function(k){return k[0]===r[1]})[0][1],pick=keys.filter(function(k){return k[0]===b.getAttribute("data-k")})[0][1],e2=glossFind(r[0]);
    done++;
    var h=ok?"<b>✓ Correct.</b> "+esc(r[2]||""):"<b>✗ It's "+esc(lab)+", not "+esc(pick)+".</b> "+esc(r[2]||"")+
      (e2?'<div class="why">📖 <b>'+esc(e2.term)+'</b> = '+esc(e2.mean)+'</div>':'')+
      (desc(b.getAttribute("data-k"))?'<div class="why">✗ <b>'+esc(pick)+'</b> means: '+esc(desc(b.getAttribute("data-k")))+'</div>':'')+
      (desc(r[1])?'<div class="why">✓ <b>'+esc(lab)+'</b> means: '+esc(desc(r[1]))+'</div>':'');
    var again=!ok||x2.helped;
    if(again&&!x2.rep){var nx={r:r,rep:true};rows.push(nx);var tmp=document.createElement("div");tmp.innerHTML=rowHTML(nx,rows.length-1);$(".srows",host).appendChild(tmp.firstChild);h+='<div class="why" style="border:0;padding-left:0"><i>'+(ok?"You used the definition, so it":"It")+' comes back at the end of the list.</i></div>'}
    f2.className="fk "+(ok?"good":"bad");f2.innerHTML=h;
    if(ok&&!x2.rep&&!x2.helped){first++;xp(4)}else if(ok)xp(2);
    fx(row2,ok?"pop":"shake");
    if(done===rows.length){if(first===total){xp(15,"perfect sort");confetti()}else xp(5)}
    score();
  };
  score();
};
/* drill: make() returns {q:html, opts:[strings], ans:string, fb:html} */
GEO.drill=function(host,streakId,make){
  var st=0;
  function next(){
    var d=make(),opts=d.opts;
    host.innerHTML='<p class="qtext">'+d.q+'</p><div class="opts">'+opts.map(function(o,k){return '<button class="opt" data-k="'+k+'">'+esc(o)+'</button>'}).join("")+'</div><div class="fb" hidden></div>';
    host.onclick=function(e){
      if(e.target.closest("[data-next]")){next();return}
      var b=e.target.closest(".opt");if(!b||b.disabled)return;
      var k=+b.getAttribute("data-k"),ok=opts[k]===d.ans;
      $$(".opt",host).forEach(function(x,n){x.disabled=true;if(opts[n]===d.ans)x.classList.add("ok");else if(n===k)x.classList.add("no")});
      st=ok?st+1:0;var se=el(streakId);if(se)se.textContent=st;if(ok)xp(st>=5?7:5);fx(host,ok?"pop":"shake");if(ok&&(st===5||st===10))toast("🔥 "+st+" in a row!",true);
      var fb=$(".fb",host);fb.hidden=false;fb.className="fb "+(ok?"good":"bad");
      fb.innerHTML=(ok?"<b>Yes.</b> ":"<b>No, it's "+esc(d.ans)+".</b> ")+(d.fb||"")+'<div style="margin-top:8px"><button class="btn" data-next>Next</button></div>';
    };
  }
  next();
};
/* pick n random items from arr, excluding x */
GEO.pick=function(arr,n,not){return shuffle(arr.filter(function(a){return not?not.indexOf(a)<0:true})).slice(0,n)};
/* ordering game: items in the correct order */
GEO.order=function(host,items,o){
  o=o||{};var pos=0;
  host.innerHTML='<div class="stack"></div><div class="opts"></div><div class="fb" hidden></div><button class="ghost" data-reset style="margin-top:8px">Start again</button>';
  function draw(){
    $(".stack",host).innerHTML=items.map(function(l,n){return n<pos?'<span>'+(n+1)+'. '+esc(l)+'</span>':'<span class="empty">'+(n+1)+'. ?</span>'}).join("");
    $(".opts",host).innerHTML=pos>=items.length?"":shuffle(items.slice(pos)).map(function(l){return '<button class="opt" data-l="'+esc(l)+'">'+esc(l)+'</button>'}).join("");
    if(pos>=items.length){var f=$(".fb",host);f.hidden=false;f.className="fb good";f.innerHTML="<b>Done! 🎉</b> "+(o.done||"");xp(15,"order solved")}
  }
  host.onclick=function(e){
    var f=$(".fb",host);
    if(e.target.closest("[data-reset]")){pos=0;f.hidden=true;draw();return}
    var b=e.target.closest("[data-l]");if(!b)return;
    if(b.getAttribute("data-l")===items[pos]){pos++;f.hidden=true;draw()}
    else{f.hidden=false;f.className="fb bad";f.innerHTML=o.wrong||"Not next. Try again.";fx(b,"shake")}
  };
  draw();
};

/* ---------- quiz engine ---------- */
function badge(){
  S.review=S.review.filter(function(id){return ALL[id]});
  var n=CUR?S.review.filter(function(id){return ALL[id].t===CUR.id}).length:S.review.length;
  var b=el("rbadge");if(b){b.textContent=n;b.hidden=!n}
}
function mark(q,ok){
  var ix=S.review.indexOf(q.id);
  if(ok){if(ix>=0)S.review.splice(ix,1)}else if(ix<0)S.review.push(q.id);
  save();badge();
}
function optsHTML(q){
  var order=shuffle(q.o.map(function(t,k){return {t:t,ok:k===0}}));
  return {order:order,html:order.map(function(x,k){return '<button class="opt" data-k="'+k+'">'+esc(x.t)+'</button>'}).join("")};
}
function topicChip(q){var t=GEO.byId[q.t];return t?'<span class="chip tc">L'+t.num+' '+esc(t.short)+'</span>':''}
function tags(q,mixed){return (mixed?topicChip(q):'')+(q.y?'<span class="chip">why</span>':'')+(q.x?'<span class="chip x">video extra</span>':'')}
function renderCheck(elm){
  var q=ALL[elm.getAttribute("data-q")];if(!q){elm.innerHTML='<p style="color:var(--no)">Missing question '+esc(elm.getAttribute("data-q"))+'</p>';console.error("Missing question "+elm.getAttribute("data-q"));return}
  var o=optsHTML(q);
  elm.innerHTML='<div class="qh">Check'+(q.y?' · why question':'')+'</div><p class="qtext">'+esc(q.q)+'</p><div class="opts">'+o.html+'</div><button class="ghost" style="margin-top:8px" data-hint>Hint</button><div class="hint" hidden>'+esc(q.h)+'</div><div class="fb" hidden></div>';
  elm.onclick=function(ev){
    if(ev.target.closest("[data-hint]")){$(".hint",elm).hidden=false;return}
    var b=ev.target.closest(".opt");if(!b||b.disabled)return;
    var k=+b.getAttribute("data-k"),ok=o.order[k].ok;
    $$(".opt",elm).forEach(function(x,n){x.disabled=true;if(o.order[n].ok)x.classList.add("ok");else if(n===k)x.classList.add("no")});
    var fb=$(".fb",elm);fb.hidden=false;fb.className="fb "+(ok?"good":"bad");
    fb.innerHTML=(ok?"<b>✓ Correct!</b> ":"<b>✗ Not quite.</b> The answer is <b>"+esc(q.o[0])+"</b>. ")+esc(q.e)+(ok?"":glossWhy(q.o[0],o.order[k].t))+(ok?"":" <i>Added to Review.</i>");
    mark(q,ok);xp(ok?10:2);fx(elm,ok?"pop":"shake");
    if(GEO._chk)GEO._chk(elm);
  };
}
function grade(pct){var g=GEO.course.grades;if(g){for(var i=0;i<g.length;i++)if(pct>=g[i][0])return g[i][1];return g[g.length-1][1]}return pct>=81?"1 (excellent)":pct>=66?"2 (good)":pct>=50?"3 (sufficient)":"4 (fail)"}
function quiz(host,ids,o){
  o=o||{};if(host._t){clearInterval(host._t);host._t=null}
  var qs=ids.map(function(id){return ALL[id]}).filter(Boolean),i=0,score=0,combo=0,left=o.seconds||0,answered={},missed=[],fin=false,cur,res={};
  if(!qs.length){host.innerHTML="<p>No questions here yet.</p>";return}
  function fmt(s){var m=Math.floor(s/60),r=s%60;return m+":"+(r<10?"0":"")+r}
  function show(){
    var q=qs[i];cur=optsHTML(q);
    host.innerHTML='<div class="qhead"><span>Question '+(i+1)+' of '+qs.length+'</span>'+tags(q,o.mixed)+(o.seconds?'<span class="timer'+(left<=60?' low':'')+'" data-tm>'+fmt(Math.max(left,0))+'</span>':'')+'</div><div class="bar"><i style="width:'+(i/qs.length*100)+'%"></i></div><p class="qtext">'+esc(q.q)+'</p><div class="opts">'+cur.html+'</div>'+(o.seconds?'':'<button class="ghost" style="margin-top:8px" data-act="hint">Hint</button><div class="hint" hidden>'+esc(q.h)+'</div>')+'<div class="fb" hidden></div><div class="nr" hidden style="margin-top:10px"></div>';
  }
  function tally(q,ok){var r=res[q.t]||(res[q.t]={s:0,n:0});r.n++;if(ok)r.s++}
  function answer(k){
    if(fin||answered[i]!==undefined)return;answered[i]=k;
    var q=qs[i],ok=cur.order[k].ok;
    $$(".opt",host).forEach(function(x,n){x.disabled=true;if(cur.order[n].ok)x.classList.add("ok");else if(n===k)x.classList.add("no")});
    if(ok){score++;combo++}else{missed.push(q);combo=0}
    tally(q,ok);mark(q,ok);xp(ok?(combo>=3?15:10):2);fx($(".opts",host),ok?"pop":"shake");
    var fb=$(".fb",host);fb.hidden=false;fb.className="fb "+(ok?"good":"bad");
    fb.innerHTML=(ok?"<b>✓ Correct!</b> "+(combo>=3?'<span class="combo">🔥 '+combo+' in a row</span> ':''):"<b>✗ Not quite.</b> The answer is <b>"+esc(q.o[0])+"</b>. ")+esc(q.e)+(ok?"":glossWhy(q.o[0],cur.order[k].t));
    var nr=$(".nr",host);nr.hidden=false;nr.innerHTML='<button class="btn" data-act="next">'+(i===qs.length-1?"See result":"Next question")+'</button>';
  }
  function finish(up){
    if(fin)return;fin=true;if(host._t){clearInterval(host._t);host._t=null}
    for(var n=0;n<qs.length;n++){if(answered[n]===undefined){missed.push(qs[n]);tally(qs[n],false);mark(qs[n],false)}}
    if(o.key){var pr=S.best[o.key];if(!pr||score/qs.length>pr.s/pr.n)S.best[o.key]={s:score,n:qs.length};save()}
    xp(20,"set finished");if(score===qs.length&&qs.length>=5)confetti();
    var pct=Math.round(score/qs.length*100);
    var h=(up?'<p><b>Time is up.</b> Unanswered questions count as missed.</p>':'')+'<div class="score">'+score+' / '+qs.length+'</div>';
    if(o.points)h+='<p>Score: <b>'+pct+' %</b>.</p>';
    if(o.exam)h+='<p><b>'+pct+' %</b>. On the course scale that is a <b>'+grade(pct)+'</b>.</p>';
    if(o.mixed){var keys=Object.keys(res);if(keys.length>1){h+='<div class="tw"><table><thead><tr><th>Lecture</th><th>Score</th></tr></thead><tbody>'+keys.map(function(k){var t=GEO.byId[k];return '<tr><td><b>L'+t.num+' '+esc(t.title)+'</b></td><td>'+res[k].s+' / '+res[k].n+'</td></tr>'}).join("")+'</tbody></table></div>'}}
    h+=missed.length?'<p>Missed, now in Review:</p><ul>'+missed.map(function(q){return '<li>'+(o.mixed?topicChip(q)+' ':'')+esc(q.q)+'<br><b>'+esc(q.o[0])+'</b></li>'}).join("")+'</ul>':'<p>No mistakes. Try another set.</p>';
    h+='<div class="row"><button class="btn" data-act="again">'+(o.againLabel||"Another set")+'</button>'+(missed.length&&o.reviewHash?'<button class="btn sec" data-act="rev">Open Review</button>':'')+'</div>';
    host.innerHTML=h;
  }
  host.onclick=function(ev){
    var t=ev.target.closest("button");if(!t)return;
    if(t.classList.contains("opt")){answer(+t.getAttribute("data-k"));return}
    var a=t.getAttribute("data-act");
    if(a==="hint")$(".hint",host).hidden=false;
    else if(a==="next"){if(i===qs.length-1)finish(false);else{i++;show()}}
    else if(a==="again"){if(o.again)o.again()}
    else if(a==="rev")go(o.reviewHash);
  };
  if(o.seconds)host._t=setInterval(function(){left--;var tm=$("[data-tm]",host);if(tm){tm.textContent=fmt(Math.max(left,0));if(left<=60)tm.classList.add("low")}if(left<=0)finish(true)},1000);
  show();
}
GEO.quiz=quiz;

/* ---------- topic rendering ---------- */
var steps=[];
function renderTopic(t){
  var qm=el("quiz-mock");if(qm._t){clearInterval(qm._t);qm._t=null}
  CUR=t;document.body.setAttribute("data-topic","t"+(((t.num-1)%6)+1));
  var st=tp(t.id);if(st.step>=t.steps.length)st.step=0;
  /* start */
  el("v-start").innerHTML='<h1>'+t.h1+'</h1><p class="lede">'+t.start.lede+'</p><div class="startbig" id="startbig"></div>'+(t.start.status?'<div class="card nexttest"><b>'+t.start.status+'</b></div>':'')+'<div class="card"><h2>If you remember only 6 things</h2><ol>'+t.start.six.map(function(x){return '<li>'+x+'</li>'}).join("")+'</ol></div>'+(t.start.extra||'')+'<div class="card"><h2>Your progress</h2><div class="grid" id="progress"></div><p class="lede" style="margin-top:10px;font-size:.9rem">Saved in this browser only, so your phone keeps its own progress.</p></div>';
  /* learn */
  el("steps").innerHTML=t.steps.map(function(s,n){return '<article class="step" data-t="'+esc(s.t)+'" data-title="'+esc(s.title)+'" hidden><h2>'+(n+1)+'. '+s.title+'</h2>'+s.html+(n===t.steps.length-1?'<div class="row" style="margin-top:14px"><button class="btn" data-gocards>Go to the '+esc(t.cards.tab)+' →</button></div>':'')+'</article>'}).join("");
  steps=$$("#steps .step");
  $$("#steps .chk").forEach(renderCheck);
  t.steps.forEach(function(s,n){if(s.init){try{s.init(steps[n])}catch(e){console.error(e)}}});
  steps.forEach(makeBites);
  /* cards */
  el("cardsH").textContent=t.cards.h1||t.cards.tab;
  el("cardsL").textContent=t.cards.lede||"Tap a card to flip it. Say the answer before you flip.";
  el("whoH").textContent=t.cards.who||"Which one am I?";
  renderCards(t);
  /* mock */
  el("mockL").textContent="Quick timed check: 7 questions, A/B/C/D, 5 minutes. A new random set each time, always with at least 2 questions on "+t.must+". Wrong answers go to Review.";
  el("mockNote").textContent=t.mockNote||"The timed test only uses tested material. \"All questions\" also includes any extras.";
  el("quiz-mock").innerHTML="";
  /* sheet */
  renderSheet(t);
  /* names */
  var nm=t.names;
  el("v-names").innerHTML='<h1>'+nm.h1+'</h1>'+(nm.html||'')+(nm.tables||[]).map(function(tb,k){return '<div class="card"><h2>'+tb.title+'</h2>'+(tb.intro?'<p>'+tb.intro+'</p>':'')+'<div class="row" style="margin-bottom:6px"><button class="ghost" data-toggle="hide" data-target="nt'+k+'">Test myself (blur answers)</button></div><div class="tw" id="nt'+k+'"></div></div>'}).join("");
  (nm.tables||[]).forEach(function(tb,k){table(el("nt"+k),tb.head,tb.rows,tb.from==null?1:tb.from)});
  if(nm.init){try{nm.init(el("v-names"))}catch(e){console.error(e)}}
  /* vocab */
  vInit(t);
  el("foot").innerHTML=t.foot||"";
  el("sheet").classList.remove("hide");el("sheettoggle").textContent="Test mode: off";
  glossify(el("steps"));glossify(el("v-start"));glossify(el("sheet"));
}
/* ---------- tap a bold key word to see its definition ---------- */
var GLOSS=null;
function glossKey(s){return String(s).toLowerCase().replace(/\([^)]*\)/g," ").replace(/[“”"'.,:;!?]/g,"").replace(/\s+/g," ").trim()}
function glossBuild(){
  GLOSS={};GEO.topics.forEach(function(t){t.VOC.forEach(function(v){var k=glossKey(v[1]);if(k.length<3)return;
    var e={term:v[1],mean:v[2],t:t};[k,k+"s",k+"es",k.replace(/y$/,"ies")].forEach(function(x){if(!GLOSS[x]||GLOSS[x].t!==CUR&&t===CUR)GLOSS[x]=e})})});
}
function glossFind(txt){var k=glossKey(txt);if(GLOSS[k])return GLOSS[k];
  /* plural or "the X" */
  k=k.replace(/^(the|a|an) /,"");if(GLOSS[k])return GLOSS[k];if(GLOSS[k.replace(/e?s$/,"")])return GLOSS[k.replace(/e?s$/,"")];return null}
function glossify(root){
  if(!root)return;glossBuild();
  $$("b, strong",root).forEach(function(b){
    if(b.closest(".chk, .sdwrap, button, .opts, .sort, .stack, td.ans, .box > b:first-child, h1, h2, h3, label, .fb, .gl")||b.classList.contains("gl"))return;
    if(b.parentNode&&b.parentNode.classList&&b.parentNode.classList.contains("box")&&b===b.parentNode.firstElementChild)return;
    var e=glossFind(b.textContent);if(!e)return;
    b.classList.add("gl");b.setAttribute("tabindex","0");b.setAttribute("role","button");b.setAttribute("data-gl",e.term);b.title="Tap for the definition";
  });
}
function glossShow(b){
  var e=glossFind(b.getAttribute("data-gl")),p=el("glpop");if(!e)return;
  if(!p){p=document.createElement("div");p.id="glpop";p.className="glpop";p.setAttribute("role","dialog");document.body.appendChild(p)}
  if(p.getAttribute("data-for")===e.term&&!p.hidden){p.hidden=true;return}
  p.setAttribute("data-for",e.term);
  p.innerHTML='<b>'+esc(e.term)+'</b><span>'+esc(e.mean)+'</span>'+(e.t!==CUR?'<small>from '+C_ABBR+e.t.num+' '+esc(e.t.short)+'</small>':'');
  p.hidden=false;var r=b.getBoundingClientRect(),w=Math.min(320,window.innerWidth-20);p.style.width=w+"px";
  var left=Math.max(10,Math.min(window.innerWidth-w-10,r.left+r.width/2-w/2));p.style.left=left+"px";
  var top=r.bottom+8;p.style.top=top+"px";
  var ph=p.offsetHeight;if(top+ph>window.innerHeight-90&&r.top-ph-8>60){p.style.top=(r.top-ph-8)+"px"}
}
var C_ABBR="L";
/* definitions for feedback after a wrong answer: the right answer and what you picked */
function glossLookup(txt){if(!GLOSS)glossBuild();var e=glossFind(txt);if(e)return e;
  var k=glossKey(txt),best=null;Object.keys(GLOSS).forEach(function(x){if(x.length>=4&&(" "+k+" ").indexOf(" "+x+" ")>=0&&(!best||x.length>glossKey(best.term).length))best=GLOSS[x]});return best}
function glossWhy(rightTxt,pickedTxt){var out=[],seen={};
  [[rightTxt,"✓"],[pickedTxt,"✗ You picked"]].forEach(function(p){if(!p[0])return;var e=glossLookup(p[0]);if(!e||seen[e.term])return;seen[e.term]=1;out.push('<div class="why">📖 '+(p[1]==="✓"?"":"<i>"+p[1]+":</i> ")+'<b>'+esc(e.term)+'</b> = '+esc(e.mean)+'</div>')});
  return out.join("")}
GEO.glossWhy=glossWhy;
document.addEventListener("click",function(e){var b=e.target.closest(".gl");var p=el("glpop");if(b){e.preventDefault();glossShow(b);return}if(p&&!p.hidden&&!e.target.closest("#glpop"))p.hidden=true});
document.addEventListener("keydown",function(e){var p=el("glpop");if(e.key==="Escape"&&p)p.hidden=true;if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("gl")){e.preventDefault();glossShow(e.target)}});
window.addEventListener("scroll",function(){var p=el("glpop");if(p)p.hidden=true},{passive:true});
function rail(){
  var st=tp(CUR.id);
  el("rail").innerHTML=steps.map(function(s,n){return '<button aria-label="Step '+(n+1)+': '+esc(s.getAttribute("data-title"))+'" class="'+(n===st.step?"cur":(st.done[n]?"done":""))+'"'+(drillShut(n)?' style="opacity:.35"':'')+' data-n="'+n+'"></button>'}).join("");
}
function showStep(n){
  var st=tp(CUR.id);
  n=Math.max(0,Math.min(steps.length-1,n));
  if(drillShut(n)){n=drillLimit();toast("🔒 Finish the quick drill in step "+(n+1)+" first")}
  st.step=n;save();
  steps.forEach(function(s,k){s.hidden=k!==n});
  stopSpeak();
  el("stepnum").textContent="Step "+(n+1)+" of "+steps.length+": "+steps[n].getAttribute("data-title");
  drawBites(n);
  el("prev").disabled=n===0;
  el("next").textContent=n===steps.length-1?"Finish ✓":"Next →";
  el("navmid").textContent=(n+1)+" / "+steps.length;
  rail();window.scrollTo(0,0);
}
el("rail").onclick=function(ev){var b=ev.target.closest("button[data-n]");if(b)showStep(+b.getAttribute("data-n"))};
el("prev").onclick=function(){showStep(tp(CUR.id).step-1)};
function stepDone(n){var st=tp(CUR.id);if(!st.done[n]){st.done[n]=true;save();xp(20,"step "+(n+1)+" done");if(Object.keys(st.done).filter(function(k){return st.done[k]}).length===steps.length){confetti();setTimeout(function(){toast("Every step of this lecture done! 🏆",true)},300)}}}
el("next").onclick=function(){var st=tp(CUR.id),n=st.step;if(drillBlocks(n)){drillNag(n);return}stepDone(n);if(n===steps.length-1)go(CUR.id+"-cards");else showStep(n+1)};
el("steps").addEventListener("click",function(e){if(e.target.closest("[data-gocards]")){if(drillBlocks(steps.length-1)){drillNag(steps.length-1);return}stepDone(steps.length-1);go(CUR.id+"-cards")}});

/* ---------- bite-size learning: each step is cut into short bits, revealed one at a time ---------- */
var STOPW=" the and with from that this into only than they them their which what when where have been were for not but its also about more most less some each very like just other over under such your".split(" ");
function kw(s){return (String(s).toLowerCase().match(/[a-z0-9]{4,}/g)||[]).filter(function(w){return STOPW.indexOf(w)<0})}
function txtLen(nodes){return nodes.reduce(function(a,n){return a+(n.textContent||"").length},0)}
function interactive(nodes){return nodes.some(function(n){return /^(INPUT|SVG|svg|LABEL)$/.test(n.tagName)||(n.querySelector&&n.querySelector("input,button,svg,select"))})}
var WSEL="input,svg,.sort,[id$=drill],.stack,.seg,.out,.match";
function splitTables(art){
  $$(":scope > .tw",art).forEach(function(tw){
    var tb=$("table",tw);if(!tb)return;var rows=$$("tbody > tr",tb);var tl=(tw.textContent||"").length;if(rows.length<4||tl<700)return;var per=Math.max(2,Math.ceil(rows.length/Math.ceil(tl/600)));
    if(tw.id){var tg=art.querySelector('[data-toggle=hide][data-target="'+tw.id+'"]');if(tg){var rw=tg.closest(".row");if(rw&&rw.parentNode===art&&rw.children.length===1)art.removeChild(rw);else tg.remove()}}
    var head=$("thead",tb),parts=[];for(var i=0;i<rows.length;i+=per)parts.push(rows.slice(i,i+per));
    if(parts.length>1&&parts[parts.length-1].length<2){var l=parts.pop();parts[parts.length-1]=parts[parts.length-1].concat(l)}
    parts.forEach(function(p,k){var w=document.createElement("div");w.className="tw";w.setAttribute("data-part",(k+1)+" / "+parts.length);var t=document.createElement("table");if(head)t.appendChild(head.cloneNode(true));var b=document.createElement("tbody");p.forEach(function(r){b.appendChild(r)});t.appendChild(b);w.appendChild(t);tw.parentNode.insertBefore(w,tw)});
    tw.parentNode.removeChild(tw);
  });
}
function testMe(art){
  $$(":scope > .tw",art).forEach(function(tw,k){
    var tb=$("table",tw);if(!tb||tw.id)return;var cols=$("tr",tb)?$("tr",tb).children.length:0;if(cols<2)return;
    $$("tbody tr",tb).forEach(function(r){Array.prototype.slice.call(r.children).forEach(function(c,i){if(i>0)c.classList.add("ans")})});
    var id="tm"+Math.random().toString(36).slice(2,8);tw.id=id;
    var bar=document.createElement("div");bar.className="row tmbar";bar.innerHTML='<button class="ghost" data-testme="'+id+'">🙈 Test me: hide the answers</button>'+(tw.getAttribute("data-part")?'<span style="font-size:.82rem;color:var(--mute)">table part '+tw.getAttribute("data-part")+'</span>':'');
    var g=document.createElement("div");g.className="twg";tw.parentNode.insertBefore(g,tw);g.appendChild(bar);g.appendChild(tw);
  });
}
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-testme]");
  if(b){var w=el(b.getAttribute("data-testme"));if(!w)return;var on=w.classList.toggle("hide");$$(".rev",w).forEach(function(x){x.classList.remove("rev")});b.textContent=on?"👀 Show all answers":"🙈 Test me: hide the answers";if(on)toast("Tap a blurred cell to check yourself");return}
  var c=e.target.closest(".step .hide .ans");if(c&&c.classList.contains("rev"))xp(1);
});
/* quick drill gates. Progress lives in S.games (value 1) because cloud sync keeps those keys. */
function drillKey(tid,n,stage){return "drill|"+tid+"|"+n+"|"+stage}
function drillBlocks(n){var a=steps[n];return !!(a&&a._need)&&!tp(CUR.id).done[n]&&!S.games[a._need]}
/* the furthest step you may open: the first one whose drill is unfinished. Finished steps always stay open. */
function drillLimit(){for(var i=0;i<steps.length;i++)if(drillBlocks(i))return i;return steps.length-1}
function drillShut(n){return n>drillLimit()&&!tp(CUR.id).done[n]}
function drillNag(n){
  var d=$(".sdwrap",steps[n]),seen=d&&d.offsetParent;
  toast(seen?"Finish every round of the quick drill first":"Open the rest of this step and finish its quick drill first");
  if(seen)d.scrollIntoView({behavior:"smooth",block:"start"});
}
function stepWords(art){
  var txt=" "+(art.textContent||"").toLowerCase().replace(/\s+/g," ")+" ";
  var seen={};return CUR.VOC.filter(function(v){var t=v[1].toLowerCase().replace(/\([^)]*\)/g,"").trim();if(t.length<4||seen[t])return false;var ok=txt.indexOf(t)>=0;if(ok)seen[t]=1;return ok});
}
function stepDrill(art,n){
  var terms=art._words=stepWords(art);
  if(!terms.length)return null;
  var earlier=[];steps.slice(0,n).forEach(function(s){(s._words||[]).forEach(function(v){if(terms.indexOf(v)<0&&earlier.indexOf(v)<0)earlier.push(v)})});
  var d=document.createElement("div");d.className="sdwrap";var topic=CUR,tid=CUR.id;
  var ORDER=earlier.length?["mc","hc","all"]:["mc","hc"],WORDS={mc:terms,hc:terms,all:earlier.concat(terms)};
  var NAME={mc:"Choose",hc:"🔥 Hardcore",all:"🔥 All words so far"};
  art._need=drillKey(tid,n,ORDER[ORDER.length-1]);
  function passed(m){return !!(tp(tid).done[n]||S.games[drillKey(tid,n,m)])}
  function unlocked(m){var i=ORDER.indexOf(m);return i<1||passed(m)||passed(ORDER[i-1])}
  function wordKey(m,v){return drillKey(tid,n,m)+"|"+v[1]}
  function todo(m){return passed(m)?WORDS[m].slice():WORDS[m].filter(function(v){return !S.games[wordKey(m,v)]})}
  function clear(m,v,left){
    if(passed(m))return;
    S.games[wordKey(m,v)]=1;
    if(left)save();else finish(m);
  }
  function finish(m){
    if(passed(m))return;
    S.games[drillKey(tid,n,m)]=1;save();tabs(m);
    if(m===ORDER[ORDER.length-1]&&d.isConnected){confetti();toast("Quick drill complete. Next step unlocked! 🔓",true)}
    if(CUR===topic&&steps[n]===art&&$(".bitebar",art)&&curStepN()===n){drawBites(n);rail()}
  }
  d.innerHTML='<h3>🎯 Quick drill: words from this step</h3><p style="font-size:.92rem;margin:0 0 8px">'+terms.length+(terms.length>1?' words':' word')+'. Clear '+(ORDER.length===3?'all three rounds':'both rounds')+', every word right, to unlock the next step.'+(ORDER.length===3?' The last round has '+WORDS.all.length+' words: this step and the earlier ones.':'')+' Flashcards are extra practice.</p><div class="row sdtabs">'+ORDER.map(function(m){return '<button class="ghost" data-sm="'+m+'"></button>'}).join("")+'<button class="ghost" data-sm="fc">Flashcards</button></div><div class="sdarea"></div>';
  var area=$(".sdarea",d),mode="mc",C=null,F=null,H=null;
  function tabs(cur){
    $$("[data-sm]",$(".sdtabs",d)).forEach(function(b){var m=b.getAttribute("data-sm");b.setAttribute("aria-pressed",m===cur?"true":"false");
      if(m==="fc")return;var open=unlocked(m);b.disabled=!open;b.textContent=(passed(m)?"✓ ":open?"":"🔒 ")+(ORDER.indexOf(m)+1)+" · "+NAME[m]});
  }
  function nextStage(m){return ORDER[ORDER.indexOf(m)+1]}
  function doneBox(m,extra){
    /* a round can end up with nothing left (merged from two devices, or the lesson changed): count it as cleared */
    finish(m);
    var nx=nextStage(m);
    area.innerHTML='<div class="fb good"><b>✓ '+NAME[m]+' cleared: '+(WORDS[m].length>1?'all '+WORDS[m].length+' words':'the word')+'.</b>'+(extra||'')+(nx?'':'<br>Quick drill complete.')+'</div><div class="row" style="margin-top:10px">'+(nx?'<button class="btn" data-sm="'+nx+'">Next: '+NAME[nx]+' →</button>':'')+'<button class="btn sec" data-sm="'+m+'">Practise again</button></div>';
  }
  function open(m){
    if(m==="fc"){fc();return}
    if(!unlocked(m))return;
    mode=m;
    if(m==="mc"){C={deck:shuffle(todo(m))};mcDraw()}
    else{H={m:m,deck:shuffle(todo(m)),score:0,miss:[]};H.n=H.deck.length;hcDraw()}
    tabs(m);
  }
  function mcDraw(){
    if(!C.deck.length){doneBox("mc");return}
    var v=C.deck[0];
    var others=terms.filter(function(x){return x!==v&&x[2]!==v[2]&&!topic.VCON.some(function(g){return g.indexOf(x[1])>=0&&g.indexOf(v[1])>=0})});
    if(others.length<3)others=others.concat(shuffle(topic.VOC.filter(function(x){return x!==v&&terms.indexOf(x)<0})).slice(0,3-others.length));
    C.opts=shuffle([v].concat(shuffle(others).slice(0,3)));C.answered=false;
    area.innerHTML='<p style="font-size:.88rem;color:var(--mute)">Read the meaning, tap the word. <b>'+C.deck.length+'</b> left.</p><p class="qtext">'+esc(v[2])+'</p><div class="opts">'+C.opts.map(function(o,k){return '<button class="opt" data-mck="'+k+'">'+esc(o[1])+'</button>'}).join("")+'</div><div class="fb" hidden></div>';
  }
  function mcPick(k){
    if(C.answered)return;C.answered=true;
    var v=C.deck.shift(),ok=C.opts[k][1]===v[1];
    $$(".opt",area).forEach(function(x,i){x.disabled=true;if(C.opts[i][1]===v[1])x.classList.add("ok");else if(i===k)x.classList.add("no")});
    if(ok){xp(5);clear("mc",v,C.deck.length)}else C.deck.splice(Math.min(C.deck.length,2+Math.floor(Math.random()*3)),0,v);
    var fb=$(".fb",area);fx(fb,ok?"pop":"shake");fb.hidden=false;fb.className="fb "+(ok?"good":"bad");
    fb.innerHTML=(ok?"<b>Yes.</b> ":"<b>No, it's "+esc(v[1])+".</b> It comes back soon. ")+"<b>"+esc(v[1])+"</b>: "+esc(v[2])+'<div style="margin-top:8px"><button class="btn" data-mcnext>Next →</button></div>';
  }
  function fc(){tabs("fc");F={deck:shuffle(terms.slice()),flip:false,known:0,rev:F?F.rev:false};fcDraw()}
  function fcDraw(){
    if(!F.deck.length){area.innerHTML='<div class="fb good"><b>'+(terms.length>1?'All '+terms.length+' cards':'Card')+' done! 🎉</b></div><div class="row" style="margin-top:10px"><button class="btn sec" data-fcagain>🔀 Shuffle and go again</button><button class="btn" data-sm="'+mode+'">Back to '+NAME[mode]+' →</button></div>';return}
    var v=F.deck[0],front=F.rev?esc(v[2]):'<b style="font-size:1.15rem">'+esc(v[1])+'</b>',back=F.rev?'<b style="font-size:1.15rem">'+esc(v[1])+'</b>':esc(v[2]);
    area.innerHTML='<div class="row" style="justify-content:space-between;font-size:.88rem;color:var(--mute)"><span>'+F.deck.length+' card'+(F.deck.length>1?'s':'')+' left</span><label style="cursor:pointer"><input type="checkbox" data-fcrev'+(F.rev?' checked':'')+'> Meaning first</label></div>'+
      '<button class="sdcard" data-fcflip aria-label="Flip the card">'+(F.flip?'<span class="sdsmall">'+front+'</span><span>'+back+'</span>':'<span>'+front+'</span><span class="sdsmall">Tap to flip</span>')+'</button>'+
      (F.flip?'<div class="row" style="margin-top:8px"><button class="btn sec" data-fcno>↺ Again</button><button class="btn" data-fcyes>✓ I knew it</button></div>':'');
  }
  function hcDraw(){
    if(!H.deck.length){if(H.n)xp(H.score*2+5,"hardcore");doneBox(H.m,H.n?'<br>'+H.score+' / '+H.n+' right first time.'+(H.miss.length?' Practise: '+H.miss.map(function(v){return '<b>'+esc(v[1])+'</b>'}).join(", "):''):'');return}
    var v=H.deck[0];
    area.innerHTML='<p style="font-size:.88rem;color:var(--mute)">'+NAME[H.m]+' · <b>'+H.deck.length+'</b> left · no options, no hints. Type the word.</p><p class="qtext">'+esc(v[2])+'</p><div class="typein"><input class="hcin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the term…" aria-label="Your answer"><button class="btn" data-hcok>Check</button></div><div class="fb" hidden></div>';
    var inp=$(".hcin",area);inp.focus({preventScroll:true});
  }
  function hcCheck(){var inp=$(".hcin",area);if(!inp||inp.disabled||!inp.value.trim())return;var v=H.deck[0],r=mTypedOk(inp.value,v[1]),fb=$(".fb",area);inp.disabled=true;$("[data-hcok]",area).disabled=true;fb.hidden=false;
    if(r){H.deck.shift();if(H.miss.indexOf(v)<0)H.score++;xp(3);fx(fb,"pop");fb.className="fb good";fb.innerHTML="<b>✓ "+(r===1?"Yes! Spelled: "+esc(v[1]):"Correct!")+"</b>";clear(H.m,v,H.deck.length)}
    else{if(H.miss.indexOf(v)<0)H.miss.push(v);H.deck.push(H.deck.shift());fx($(".typein",area),"shake");fb.className="fb bad";fb.innerHTML="<b>✗ It's "+esc(v[1])+".</b> It comes back at the end."}
    fb.innerHTML+='<div style="margin-top:8px"><button class="btn" data-hcnext>Next →</button></div>';$("[data-hcnext]",area).focus({preventScroll:true})}
  d.addEventListener("click",function(e){
    var sm=e.target.closest("[data-sm]");if(sm){open(sm.getAttribute("data-sm"));return}
    var mk=e.target.closest("[data-mck]");if(mk){mcPick(+mk.getAttribute("data-mck"));return}
    if(e.target.closest("[data-mcnext]")){mcDraw();return}
    if(e.target.closest("[data-fcflip]")){F.flip=!F.flip;fcDraw();return}
    if(e.target.closest("[data-fcyes]")){F.deck.shift();F.flip=false;xp(1);fcDraw();return}
    if(e.target.closest("[data-fcno]")){var c=F.deck.shift();F.deck.splice(Math.min(F.deck.length,2+Math.floor(Math.random()*3)),0,c);F.flip=false;fcDraw();return}
    if(e.target.closest("[data-fcagain]")){fc();return}
    if(e.target.closest("[data-hcok]")){hcCheck();return}
    if(e.target.closest("[data-hcnext]")){hcDraw();return}
  });
  d.addEventListener("change",function(e){if(e.target.hasAttribute("data-fcrev")){F.rev=e.target.checked;F.flip=false;fcDraw()}});
  d.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.classList.contains("hcin")){e.preventDefault();hcCheck()}});
  open(ORDER.filter(function(m){return !passed(m)})[0]||"mc");
  return d;
}
function makeBites(art){
  var hadWidget=!!art.querySelector(WSEL);
  splitTables(art);testMe(art);
  {var dr=stepDrill(art,steps.indexOf(art));if(dr){var ch=$$(":scope > .chk",art)[0],tl=$$(":scope > .row",art).filter(function(r){return r.querySelector("[data-gocards]")})[0];art.insertBefore(dr,ch||tl||null)}}
  var kids=Array.prototype.slice.call(art.children),h2=kids.shift(),tail=null;
  if(kids.length&&kids[kids.length-1].querySelector&&kids[kids.length-1].querySelector("[data-gocards]"))tail=kids.pop();
  var checks=kids.filter(function(k){return k.classList.contains("chk")}),body=kids.filter(function(k){return !k.classList.contains("chk")});
  var chunks=[],cur=[],len=0;
  function push(){if(cur.length){chunks.push(cur);cur=[];len=0}}
  body.forEach(function(nd){
    var tag=nd.tagName.toLowerCase(),box=nd.classList.contains("box"),flow=tag==="p"||tag==="ul"||tag==="ol"||nd.classList.contains("tw")||nd.classList.contains("twg");
    if(tag==="h3"||nd.classList.contains("sdwrap")||(box&&len>220)||(flow&&len>450))push();
    cur.push(nd);len+=(nd.textContent||"").length;
  });
  push();
  for(var i=0;i<chunks.length-1;i++){if(txtLen(chunks[i])<140&&!interactive(chunks[i])){chunks[i+1]=chunks[i].concat(chunks[i+1]);chunks.splice(i,1);i--}}
  if(!chunks.length)chunks=[[]];
  /* put each check right after the bit that teaches its answer */
  var cum=[],acc="";chunks.forEach(function(c){acc+=" "+c.map(function(n){return n.textContent||""}).join(" ").toLowerCase();cum.push(acc)});
  checks.forEach(function(c){
    var q=ALL[c.getAttribute("data-q")],at=chunks.length-1;
    if(q){var w=kw(q.o[0]+" "+q.q).filter(function(x){return cum[cum.length-1].indexOf(x)>=0});
      if(w.length)for(var k=0;k<chunks.length;k++){var hit=w.filter(function(x){return cum[k].indexOf(x)>=0}).length;if(hit/w.length>=.75){at=k;break}}}
    chunks[at].push(c);
  });
  var frag=document.createDocumentFragment();
  var pips=document.createElement("div");pips.className="pips";frag.appendChild(pips);
  chunks.forEach(function(c,k){var b=document.createElement("div");b.className="bite";b.setAttribute("data-b",k);c.forEach(function(n){b.appendChild(n)});frag.appendChild(b)});
  var bar=document.createElement("div");bar.className="bitebar";frag.appendChild(bar);
  art.insertBefore(frag,tail||null);
  if(tail)tail.classList.add("steptail");
}
function curStepN(){return tp(CUR.id).step}
function drawBites(n,scroll){
  var art=steps[n];if(!art)return;var st=tp(CUR.id),bites=$$(".bite",art),N=bites.length,full=S.full;
  var r=full?N:Math.max(1,Math.min(N,+st.bites[n]||1));
  el("v-learn").classList.toggle("full",full);el("fulltoggle").textContent=full?"Bite-size mode":"Show whole step";
  bites.forEach(function(b,i){b.hidden=i>=r});
  $(".pips",art).innerHTML=N>1?bites.map(function(b,i){return '<i class="'+(i<r?"on":"")+'"></i>'}).join("")+'<span style="font-size:.8rem;color:var(--mute);margin-left:6px">bit '+r+' of '+N+'</span>':"";
  var tail=$(".steptail",art);if(tail)tail.hidden=!full;
  var bar=$(".bitebar",art),last=bites[r-1];
  var open=$$(".chk",last).filter(function(c){var f=$(".fb",c);return f&&f.hidden});
  var sp=canSpeak()?'<button class="speak" data-speak aria-pressed="false">🔊 Read aloud</button>':'';
  var isLastStep=n===steps.length-1,MORE=["Got it, next bit →","Okay, more →","Next bit →","Keep going →"];
  if(full){bar.hidden=true}
  else{bar.hidden=false;
    if(r<N)bar.innerHTML='<span class="bn">Bit '+r+' of '+N+'</span>'+sp+(open.length?'<span class="wait">Answer the check above to unlock the next bit ↑</span>':'')+'<button class="btn" data-more'+(open.length?' disabled':'')+'>'+MORE[r%MORE.length]+'</button>';
    else bar.innerHTML='<span class="bn">🎉 Step '+(n+1)+' finished</span>'+sp+(open.length?'<span class="wait">Answer the check above first ↑</span>':drillBlocks(n)?'<span class="wait">Finish the quick drill above first ↑</span>':'')+'<button class="btn" data-stepnext'+(open.length||drillBlocks(n)?' disabled':'')+'>'+(isLastStep?"Go to the "+esc(CUR.cards.tab)+" →":"Next step →")+'</button>';
  }
  if(scroll&&last){var y=last.getBoundingClientRect().top+window.scrollY-110;window.scrollTo({top:y,behavior:"smooth"})}
}
GEO._chk=function(c){var art=c.closest(".step");if(!art||el("v-learn").hidden)return;var n=steps.indexOf(art);if(n===curStepN())drawBites(n)};
el("steps").addEventListener("click",function(e){
  var n=curStepN(),st=tp(CUR.id);
  if(e.target.closest("[data-more]")){stopSpeak();st.bites[n]=Math.max(1,+st.bites[n]||1)+1;save();xp(3);drawBites(n,true);return}
  if(e.target.closest("[data-stepnext]")){stopSpeak();el("next").click();return}
  var sb=e.target.closest("[data-speak]");if(sb){var bs=$$(".bite",steps[n]).filter(function(b){return !b.hidden}),b=bs[bs.length-1];
    var t=(n===0||bs.length===1?steps[n].querySelector("h2").textContent+". ":"")+Array.prototype.slice.call(b.childNodes).filter(function(x){return !(x.classList&&x.classList.contains("chk"))}).map(function(x){return x.textContent}).join(". ");speak(t,sb)}
});
el("fulltoggle").onclick=function(){S.full=!S.full;save();drawBites(curStepN())};
document.addEventListener("keydown",function(e){if(el("v-learn").hidden)return;if(e.target.closest("input,select,textarea"))return;if(e.key==="ArrowRight"){var m=$(".step:not([hidden]) [data-more]:not([disabled])");if(m&&!S.full)m.click();else el("next").click()}if(e.key==="ArrowLeft"&&tp(CUR.id).step>0)showStep(tp(CUR.id).step-1)});

/* cards + who am I */
function renderCards(t){
  var C=t.cards,L=C.labels,K=C.keys;
  function front(r){return '<span class="fn">'+r.n+'</span><span class="fhint">'+(r.grp||"")+' · tap to flip</span>'}
  function back(r){return '<span class="fn">'+r.n+'</span><dl>'+K.map(function(k){return '<dt>'+L[k]+'</dt><dd>'+r[k]+'</dd>'}).join("")+'</dl>'}
  el("flash").innerHTML=C.items.map(function(r,n){return '<button class="flash" data-n="'+n+'">'+front(r)+'</button>'}).join("");
  el("flash").onclick=function(e){var b=e.target.closest(".flash");if(!b)return;var r=C.items[+b.getAttribute("data-n")];var f=b.classList.toggle("f");b.innerHTML=f?back(r):front(r)};
  var streak=0,last=-1;el("streak").textContent="0";
  function who(){
    var n;do{n=Math.floor(Math.random()*C.items.length)}while(n===last&&C.items.length>1);last=n;
    var r=C.items[n],keys=r.clue||K.slice(0,2);
    var others=C.items.filter(function(x){return x!==r&&!(r.not&&r.not.indexOf(x.n)>=0)&&!(x.not&&x.not.indexOf(r.n)>=0)});
    var choices=shuffle([r].concat(shuffle(others).slice(0,3)));
    var h=el("whoami");
    h.innerHTML='<div class="out"><div class="kv">'+keys.map(function(k){return '<span>'+L[k]+'</span><span><b>'+r[k]+'</b></span>'}).join("")+'</div></div><div class="opts" style="margin-top:10px">'+choices.map(function(c){return '<button class="opt" data-n="'+esc(c.n)+'">'+c.n+'</button>'}).join("")+'</div><div class="fb" hidden></div>';
    h.onclick=function(e){
      if(e.target.closest("[data-whonext]")){who();return}
      var b=e.target.closest(".opt");if(!b||b.disabled)return;var ok=b.getAttribute("data-n")===r.n;
      $$(".opt",h).forEach(function(x){x.disabled=true;if(x.getAttribute("data-n")===r.n)x.classList.add("ok");else if(x===b)x.classList.add("no")});
      streak=ok?streak+1:0;el("streak").textContent=streak;if(ok)xp(5);fx(h,ok?"pop":"shake");
      var fb=$(".fb",h);fb.hidden=false;fb.className="fb "+(ok?"good":"bad");
      fb.innerHTML=(ok?(streak>=8?"<b>Yes! 8 in a row, great.</b> ":"<b>Yes!</b> "):"<b>No, it's "+r.n+".</b> ")+r.n+": "+K.map(function(k){return r[k]}).join(" · ")+'<div style="margin-top:8px"><button class="btn" data-whonext>Next</button></div>';
    };
  }
  who();
}
/* cheat sheet */
function renderSheet(t){
  var secs=t.sheet||[],h="";
  secs.forEach(function(s,n){h+='<div class="card"><h2>'+s[0]+'</h2><div class="tw" id="sh'+n+'"></div></div>'});
  if(t.cards.sheet!==false)h+='<div class="card"><h2>The '+esc(t.cards.tab)+'</h2><div class="tw" id="shC"></div></div>';
  el("sheet").innerHTML=h;
  secs.forEach(function(s,n){table(el("sh"+n),s[1],s[2],1)});
  if(t.cards.sheet!==false)table(el("shC"),["Name"].concat(t.cards.keys.map(function(k){return t.cards.labels[k]})),t.cards.items.map(function(r){return [r.n].concat(t.cards.keys.map(function(k){return r[k]}))}),1);
}
el("sheettoggle").onclick=function(){var on=el("sheet").classList.toggle("hide");$$("#sheet .rev").forEach(function(x){x.classList.remove("rev")});this.textContent="Test mode: "+(on?"on":"off")};

/* mock */
function mock(n,sec){
  var t=CUR,pool=t.Q.filter(function(q){return sec?!q.x:true});
  var ids=shuffle(pool.map(function(q){return q.id})).slice(0,n);
  if(n<pool.length){var have=ids.filter(function(id){return ALL[id].fol}).length;if(have<2){var extra=shuffle(pool.filter(function(q){return q.fol&&ids.indexOf(q.id)<0})).slice(0,2-have);var slots=shuffle(ids.map(function(id,k){return k}).filter(function(k){return !ALL[ids[k]].fol}));extra.forEach(function(q,j){ids[slots[j]]=q.id})}}
  quiz(el("quiz-mock"),ids,{key:t.id+(sec?"-mock7":"-all"),seconds:sec,points:!!sec,again:function(){mock(n,sec)},reviewHash:t.id+"-review"});
}
GEO.mockIds=function(t,n){var pool=t.Q.filter(function(q){return !q.x});var ids=shuffle(pool.map(function(q){return q.id})).slice(0,n);var have=ids.filter(function(id){return ALL[id].fol}).length;if(have<2){var extra=shuffle(pool.filter(function(q){return q.fol&&ids.indexOf(q.id)<0})).slice(0,2-have);var slots=shuffle(ids.map(function(id,k){return k}).filter(function(k){return !ALL[ids[k]].fol}));extra.forEach(function(q,j){ids[slots[j]]=q.id})}return ids};
el("mock7").onclick=function(){mock(7,300)};
el("mockall").onclick=function(){mock(CUR.Q.length,0)};

/* review (global or topic) */
function review(){
  var h=el("review-body");badge();if(h._t){clearInterval(h._t);h._t=null}
  var list=S.review.filter(function(id){return ALL[id]&&(!CUR||ALL[id].t===CUR.id)});
  el("revTitle").textContent=CUR?"Review: "+CUR.title:"Review: all lectures";
  el("revLede").textContent=CUR?"Every question from this lecture you got wrong lands here. Answer it right and it leaves.":"Every wrong answer from every lecture, in one place. Answer it right and it leaves.";
  if(!list.length){h.innerHTML='<p>Nothing to review. Wrong answers from any check, quiz or mock test land here.</p>';return}
  var by={};list.forEach(function(id){var k=ALL[id].t;by[k]=(by[k]||0)+1});
  h.innerHTML='<p><b>'+list.length+'</b> to clear'+(CUR?'':': '+Object.keys(by).map(function(k){return 'L'+GEO.byId[k].num+' '+esc(GEO.byId[k].short)+' '+by[k]}).join(" · "))+'.</p><button class="btn" id="revgo">Practise them</button><div id="revq" style="margin-top:12px"></div>';
  el("revgo").onclick=function(){this.hidden=true;quiz(el("revq"),shuffle(list.slice()),{again:review,againLabel:"Back to the list",mixed:!CUR})};
}

/* ---------- vocabulary trainer (per topic) ---------- */
var V={t:null,group:"All",dir:"t",deck:[],i:0,shown:false,total:0,again:0,mode:"cards",q:null};
function vPool(){return V.t.VOC.filter(function(v){return V.group==="All"||v[0]===V.group})}
function clash(a,b){return V.t.VCON.some(function(g){return g.indexOf(a)>=0&&g.indexOf(b)>=0})}
function vBuild(){V.deck=shuffle(vPool());V.i=0;V.shown=false;V.again=0;V.total=V.deck.length;vDraw()}
function vDraw(){
  var h=el("vtrainer");
  if(V.i>=V.deck.length){h.innerHTML='<div class="vcard"><div class="vt">Done!</div><div class="vm">All '+V.total+' cards known. You pressed "Again" '+V.again+' time'+(V.again===1?'':'s')+'.</div></div><div class="row" style="margin-top:10px;justify-content:center"><button class="btn" id="vagain">Shuffle and go again</button></div>';el("vagain").onclick=vBuild;return}
  var c=V.deck[V.i],front=V.dir==="t"?c[1]:c[2],back=V.dir==="t"?c[2]:c[1];
  h.innerHTML='<p style="color:var(--mute);font-size:.9rem">Card '+(V.i+1)+' of '+V.deck.length+' · '+esc(c[0])+'</p><div class="vcard"><div class="'+(V.dir==="t"?"vt":"vm")+'">'+esc(front)+'</div>'+(V.shown?'<hr style="border:0;border-top:1px solid var(--line);width:60%;margin:6px auto"><div class="'+(V.dir==="t"?"vm":"vt")+'">'+esc(back)+'</div>':'')+'</div><div class="row" style="margin-top:10px;justify-content:center">'+(V.shown?'<button class="btn sec" id="vno">Again</button><button class="btn" id="vyes">I knew it</button>':'<button class="btn" id="vshow">Show answer</button>')+'</div>';
  if(V.shown){el("vyes").onclick=function(){xp(2);V.i++;V.shown=false;vDraw()};el("vno").onclick=function(){V.again++;V.deck.push(V.deck[V.i]);V.i++;V.shown=false;vDraw()}}
  else el("vshow").onclick=function(){V.shown=true;vDraw()};
}
function vGridDraw(){var list=vPool();
  el("vgrid").innerHTML=list.map(function(v){return '<button class="flash" data-i="'+V.t.VOC.indexOf(v)+'"><span class="fn">'+esc(v[1])+'</span><span class="fhint">'+esc(v[0])+' · tap to flip</span></button>'}).join("")}
el("vgrid").onclick=function(e){var b=e.target.closest(".flash");if(!b)return;var v=V.t.VOC[+b.getAttribute("data-i")],f=b.classList.toggle("f");
  b.innerHTML=f?'<span class="fn" style="font-size:1rem">'+esc(v[1])+'</span><span>'+esc(v[2])+'</span>':'<span class="fn">'+esc(v[1])+'</span><span class="fhint">'+esc(v[0])+' · tap to flip</span>'};
function vQuizStart(){
  var pool=vPool();
  var items=shuffle(pool).slice(0,Math.min(10,pool.length)).map(function(v){return {v:v,dir:Math.random()<.5?"t":"m"}});
  V.q={items:items,i:0,score:0,missed:[],retry:false};vQuizDraw();
}
function vQuizDraw(){
  var h=el("vquiz"),q=V.q;
  if(q.i>=q.items.length){
    if(q.missed.length&&!q.retry){q.retry=true;q.items=q.items.concat(q.missed.map(function(it){return {v:it.v,dir:it.dir==="t"?"m":"t",again:true}}));q.missed2=q.missed;q.missed=[];vQuizDraw();return}
    var miss=q.missed2||[];
    h.innerHTML='<div class="score">'+q.score+' / '+q.items.length+'</div><p>'+(miss.length?'Words you missed (they came back once at the end):</p><ul>'+miss.map(function(it){return '<li><b>'+esc(it.v[1])+'</b>: '+esc(it.v[2])+'</li>'}).join("")+'</ul>':'No mistakes. Try another group or "All".</p>')+'<button class="btn" id="vqagain">New quiz</button>';
    el("vqagain").onclick=vQuizStart;return}
  var it=q.items[q.i],v=it.v;
  var others=V.t.VOC.filter(function(x){return x!==v&&!clash(x[1],v[1])&&x[1]!==v[1]&&x[2]!==v[2]});
  var same=shuffle(others.filter(function(x){return x[0]===v[0]})),rest=shuffle(others.filter(function(x){return x[0]!==v[0]}));
  var opts=shuffle([v].concat(same.concat(rest).slice(0,3)));
  var ask=it.dir==="t"?'What does <b>'+esc(v[1])+'</b> mean?':'Which term means: <b>'+esc(v[2])+'</b>';
  h.innerHTML='<div class="qhead"><span>Question '+(q.i+1)+' of '+q.items.length+'</span>'+(it.again?'<span class="chip">missed earlier</span>':'')+'</div><div class="bar"><i style="width:'+(q.i/q.items.length*100)+'%"></i></div><p class="qtext">'+ask+'</p><div class="opts">'+opts.map(function(o,k){return '<button class="opt" data-k="'+k+'">'+esc(it.dir==="t"?o[2]:o[1])+'</button>'}).join("")+'</div><div class="fb" hidden></div><div class="nr" hidden style="margin-top:10px"><button class="btn" id="vqnext">'+(q.i===q.items.length-1&&(q.retry||!q.missed.length)?"See result":"Next")+'</button></div>';
  h.onclick=function(e){var b=e.target.closest(".opt");if(!b||b.disabled)return;var k=+b.getAttribute("data-k"),ok=opts[k]===v;
    $$(".opt",h).forEach(function(x,n){x.disabled=true;if(opts[n]===v)x.classList.add("ok");else if(n===k)x.classList.add("no")});
    if(ok){q.score++;xp(5)}else if(!it.again)q.missed.push(it);fx(h,ok?"pop":"shake");
    var fb=$(".fb",h);fb.hidden=false;fb.className="fb "+(ok?"good":"bad");fb.innerHTML=(ok?"<b>Correct.</b> ":"<b>Not quite.</b> ")+"<b>"+esc(v[1])+"</b>: "+esc(v[2])+(ok||it.again?"":" <i>It will come back at the end.</i>");
    $(".nr",h).hidden=false;el("vqnext").onclick=function(){q.i++;vQuizDraw()}};
}
var VHELP={cards:"One card at a time. Say the answer, tap Show answer, then mark I knew it or Again. Again cards come back later.",grid:"All cards on one screen. Tap any card to flip it. Good for a quick scan.",quiz:"10 multiple-choice questions, both directions. Words you miss come back once at the end, the other way round."};
function vModeSet(m){V.mode=m;$$("#vmode button").forEach(function(x){x.setAttribute("aria-pressed",x.getAttribute("data-m")===m?"true":"false")});
  ["cards","grid","quiz"].forEach(function(k){el("vm-"+k).hidden=k!==m});el("vmodehelp").textContent=VHELP[m];
  if(m==="grid")vGridDraw();if(m==="quiz")vQuizStart();}
el("vmode").onclick=function(e){var b=e.target.closest("button");if(b)vModeSet(b.getAttribute("data-m"))};
el("vgroups").onclick=function(e){var b=e.target.closest("button");if(!b)return;V.group=b.getAttribute("data-g");$$("#vgroups button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});vBuild();if(V.mode==="grid")vGridDraw();if(V.mode==="quiz")vQuizStart()};
el("vdir").onclick=function(e){var b=e.target.closest("button");if(!b)return;V.dir=b.getAttribute("data-d");$$("#vdir button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});V.shown=false;vDraw()};
function vTable(){
  var q=(el("vsearch").value||"").toLowerCase().trim();
  var list=V.t.VOC.filter(function(v){return !q||(v[1]+" "+v[2]+" "+v[0]).toLowerCase().indexOf(q)>=0});
  el("vcount").textContent=list.length+" of "+V.t.VOC.length+" terms";
  table(el("t-vocab"),["Term","Meaning","Group"],list.map(function(v){return [esc(v[1]),esc(v[2]),esc(v[0])]}),1);
}
el("vsearch").oninput=vTable;
function vInit(t){
  V.t=t;V.group="All";V.dir="t";V.mode="cards";
  var G=["All"];t.VOC.forEach(function(v){if(G.indexOf(v[0])<0)G.push(v[0])});
  el("vgroups").innerHTML=G.map(function(g){var n=g==="All"?t.VOC.length:t.VOC.filter(function(v){return v[0]===g}).length;return '<button data-g="'+esc(g)+'" aria-pressed="'+(g==="All")+'">'+esc(g)+' ('+n+')</button>'}).join("");
  $$("#vdir button").forEach(function(x){x.setAttribute("aria-pressed",x.getAttribute("data-d")==="t"?"true":"false")});
  el("vsearch").value="";vTable();vBuild();vModeSet("cards");
}

/* ---------- global views ---------- */
function topicTile(t){
  var st=tp(t.id),d=Object.keys(st.done).filter(function(k){return st.done[k]}).length,b=S.best[t.id+"-mock7"];
  var rv=S.review.filter(function(id){return ALL[id]&&ALL[id].t===t.id}).length;
  return '<button class="tile tc'+(((t.num-1)%6)+1)+'" data-go="'+t.id+'"><span class="tn">Lecture '+t.num+'</span><span class="tt">'+esc(t.title)+'</span><span class="ts">'+esc(t.blurb)+'</span><span class="st">'+(t.mastery?'🏆 '+mStarsTxt(t)+' · ':'')+t.steps.length+' steps · '+t.Q.length+' questions · '+t.VOC.length+' terms</span><span class="pb"><i style="width:'+Math.round(d/Math.max(1,t.steps.length)*100)+'%"></i></span><span class="st">'+d+' / '+t.steps.length+' steps done'+(b?' · best mock '+b.s+'/'+b.n:'')+(rv?' · '+rv+' to review':'')+'</span></button>';
}
function testTopics(ts){
  if(ts.all)return GEO.topics.slice();
  return (ts.lectures||[]).map(function(id){return GEO.byId[id]}).filter(Boolean);
}
function testStats(ts){
  var list=testTopics(ts),stepsDone=0,stepsTot=0,stars=0,starsTot=0,qs=0;
  list.forEach(function(t){
    var st=tp(t.id);
    stepsDone+=Object.keys(st.done).filter(function(k){return st.done[k]}).length;
    stepsTot+=t.steps.length;
    qs+=t.Q.length;
    if(t.mastery){starsTot+=4;var m=mst(t);for(var k=1;k<=4;k++)if(m.stars[k]&&m.faded!==k)stars++}
  });
  var planN=(ts.planned||[]).length;
  return {list:list,stepsDone:stepsDone,stepsTot:stepsTot,stars:stars,starsTot:starsTot,qs:qs,planN:planN};
}
function testCard(ts,idx){
  var st=testStats(ts),pct=st.stepsTot?Math.round(st.stepsDone/st.stepsTot*100):0;
  var meta=st.list.length
    ?(st.list.length+" active topic"+(st.list.length>1?"s":"")+(st.planN?" + "+st.planN+" upcoming":"")+" · "+st.qs+" questions")
    :(st.planN+" planned topic"+(st.planN>1?"s":"")+" · slides not added yet");
  var prog=st.stepsTot
    ?(st.stepsDone+" / "+st.stepsTot+" steps done"+(st.starsTot?" · ⭐ "+st.stars+" / "+st.starsTot+" stars":""))
    :"No active lessons yet";
  return '<button class="tile tc'+((idx%6)+1)+'" data-go="test-'+esc(ts.id)+'">'
    +'<span class="tn">'+(ts.badge?esc(ts.badge):"Exam phase")+'</span>'
    +'<span class="tt">'+esc(ts.title)+'</span>'
    +'<span class="ts">'+esc(ts.sub)+'</span>'
    +'<span class="st">'+meta+'</span>'
    +'<span class="pb"><i style="width:'+pct+'%"></i></span>'
    +'<span class="st">'+prog+'</span></button>';
}
/* Test page "Lectures" grid, like Geology Hub's Home: one tile per seminar in order.
   Seminars with a lesson open its tabs (Overview, Learn, Mastery, Games, Mock test, Review…);
   seminars that only have real exercises so far open those. */
function testLectures(ts,st){
  var sets=(window.GEOApply?GEOApply.sets():[]).filter(function(s){return s.test===ts.id||ts.all});
  var semOfTopic={};sets.forEach(function(s){if(s.topic)semOfTopic[s.topic]=+String(s.id).replace(/\D/g,"")});
  var items=[],seen={};
  st.list.forEach(function(t){var n=semOfTopic[t.id];if(n)seen[n]=1;items.push({n:n||t.num,html:topicTile(t).replace('<span class="tn">Lecture '+t.num+'</span>','<span class="tn">Topic '+t.num+'</span>')})});
  sets.forEach(function(s,k){var n=+String(s.id).replace(/\D/g,"");if(s.topic&&GEO.byId[s.topic]&&st.list.indexOf(GEO.byId[s.topic])>=0)return;seen[n]=1;
    items.push({n:n,html:'<button class="tile tc'+(((n-1)%6)+1)+'" data-go="ap-'+esc(s.id)+'"><span class="tn">Topic '+n+'</span><span class="tt">'+esc(String(s.title).replace(/^Seminar \d+ · /,""))+'</span><span class="ts">Real seminar exercises with the formula sheet beside them. The lesson tabs come after the lecture slides are added.</span><span class="st">✏️ Exercises</span></button>'})});
  (ts.planned||[]).forEach(function(p){if(seen[p.n])return;items.push({n:p.n,html:'<div class="tile planned"><span class="tn">Topic '+p.n+'</span><span class="tt">'+esc(p.title)+'</span><span class="ts">'+esc(p.sub)+'</span></div>'})});
  items.sort(function(a,b){return a.n-b.n});
  return '<h2 style="margin-top:20px">Lectures</h2><div class="tiles">'+items.map(function(x){return x.html}).join("")+'</div>';
}
function renderTestView(id){
  var ts=(GEO.course.tests||[]).filter(function(x){return x.id===id})[0];
  if(!ts){go("home");return}
  var st=testStats(ts),pct=st.stepsTot?Math.round(st.stepsDone/st.stepsTot*100):0;
  var h='<div class="row" style="margin-bottom:10px"><button class="ghost" data-go="home">◂ Back to all tests</button></div>';
  h+='<div class="hero"><h1>'+esc(ts.title)+'</h1><p class="lede">'+esc(ts.sub)+'</p></div>';
  h+=testLectures(ts,st);
  if(window.GEOPath)h+=GEOPath.cta(ts.id);
  if(window.GEOApply)h+=GEOApply.testBlock(ts.id);
  h+='<div class="card"><b>Your readiness for '+esc(ts.title)+'</b>'
    +'<p style="margin:6px 0;color:var(--mute);font-size:.95rem">'+(st.stepsTot?st.stepsDone+' / '+st.stepsTot+' steps completed ('+pct+' %)':'No active lessons yet')+(st.starsTot?' · ⭐ '+st.stars+' / '+st.starsTot+' Mastery stars':'')+'</p>'
    +'<div class="bar"><i style="width:'+pct+'%"></i></div>';
  if(st.qs){
    h+='<div class="row" style="margin-top:10px"><button class="btn" id="tmock15">📝 Mock test (15 questions)</button><button class="btn sec" id="tmockall">All '+st.qs+' questions</button></div><div id="test-quiz" style="margin-top:12px"></div>';
  }else{
    h+='<p style="margin:8px 0 0;color:var(--mute);font-size:.92rem">Add lecture data for this test to unlock lessons, Mastery, and mock tests.</p>';
  }
  h+='</div>';
  var v=el("v-test");v.innerHTML=h;
  v.onclick=function(e){var b=e.target.closest("[data-go]");if(b)go(b.getAttribute("data-go"))};
  var runTestMock=function(lim){
    var pool=shuffle([].concat.apply([],st.list.map(function(t){return t.Q.filter(function(q){return !q.x}).map(function(q){return q.id})})));
    var ids=lim?pool.slice(0,Math.min(lim,pool.length)):pool;
    quiz(el("test-quiz"),ids,{key:"test-"+ts.id+(lim?"-15":"-all"),exam:true,mixed:st.list.length>1,again:function(){runTestMock(lim)},reviewHash:"review"});
  };
  var b15=el("tmock15"),ball=el("tmockall");
  if(b15)b15.onclick=function(){runTestMock(15)};
  if(ball)ball.onclick=function(){runTestMock(0)};
}
function renderHome(){
  CUR=null;document.body.setAttribute("data-topic","home");
  var next=GEO.topics.filter(function(t){return t.next})[0];
  var tq=0,tv=0;GEO.topics.forEach(function(t){tq+=t.Q.length;tv+=t.VOC.length});
  var h='<div class="hero"><h1>'+esc(GEO.course.title)+'</h1><p class="lede">'+esc(GEO.course.intro)+' '+tq+' questions and '+tv+' terms so far.</p></div>';
  if(window.GEOPath)(GEO.course.paths||[]).forEach(function(p){h+=GEOPath.cta(p)});
  var L=lvOf(S.xp),dx=dayXP(),lastT=null,lm=/^(t\d+)(?:-([a-z]+))?$/.exec(S.last||"");if(lm&&GEO.byId[lm[1]])lastT=GEO.byId[lm[1]];
  var VN={learn:"Learn",cards:"cards",games:"Games",mock:"Mock test",review:"Review",sheet:"Cheat sheet",names:"names",vocab:"Vocabulary"};
  h+='<div class="card"><div class="goal"><div class="ring" style="--p:'+Math.min(100,Math.round(dx/GOAL*100))+'"><span>'+Math.min(100,Math.round(dx/GOAL*100))+'%</span></div><div><b>Today: '+dx+' / '+GOAL+' XP</b>'+(dx>=GOAL?' 🎯 goal done!':'')+'<br><span style="color:var(--mute);font-size:.92rem">Level '+(L.n+1)+': <b>'+lvName(L.n)+'</b> · '+(L.need-L.into)+' XP to level up · 🔥 '+streakNow()+' day streak</span></div></div>';
  h+='<div class="startbig">'+(lastT?'<button data-go="'+esc(S.last)+'">▶ Pick up where you left off<small>L'+lastT.num+' '+esc(lastT.short)+(lm[2]?' · '+(VN[lm[2]]||lm[2]):' · Overview')+'</small></button>':'')+(next?'<button class="'+(lastT?'sec':'')+'" data-quickt="'+next.id+'">⚡ Quick 5 for the next test<small>L'+next.num+' '+esc(next.short)+', 2 minutes</small></button>':'')+'<button class="sec" id="homefocus">⏱ 10-minute focus sprint<small>Timer on, phone away, bonus XP</small></button></div></div>';
  GEO.mDue().forEach(function(t){h+='<div class="card" style="border-color:var(--teach)"><b>🔁 Mastery check due: L'+t.num+' '+esc(t.short)+'</b><p style="margin:4px 0 8px">10 quick items to keep your stars bright.</p><button class="btn" data-go="'+t.id+'-mastery">Do it now</button></div>'});
  if(next)h+='<div class="card nexttest"><h2>Next test: '+esc(next.next)+'</h2><p>The 5-minute test covers <b>lecture '+next.num+': '+esc(next.title)+'</b>.</p><div class="row"><button class="btn" data-go="'+next.id+'">Open lecture '+next.num+'</button><button class="btn sec" data-go="'+next.id+'-mock">Mock test</button></div></div>';
  if(Array.isArray(GEO.course.tests)&&GEO.course.tests.length){
    h+='<h2 style="margin-top:20px">Study by test</h2><div class="tiles">'+GEO.course.tests.map(testCard).join("")+'</div>';
  }else{
    h+='<h2 style="margin-top:20px">Lectures</h2><div class="tiles">'+GEO.topics.map(topicTile).join("")+GEO.planned.map(function(p){return '<div class="tile planned"><span class="tn">Lecture '+p.n+'</span><span class="tt">'+esc(p.title)+'</span><span class="ts">'+esc(p.sub)+'</span></div>'}).join("")+'</div>';
  }
  h+='<h2 style="margin-top:20px">Whole course</h2><div class="grid" style="margin-top:10px"><button class="mcard" data-go="exam"><b>Exam practice</b><small>Mixed questions from the lectures you pick, with a grade estimate</small></button>'+(window.GEOTick&&GEO.course.tickall?'<button class="mcard" data-go="tickall"><b>Tick all that apply</b><small>6 options, 1 to 6 correct, one wrong tick = 0. Like the real exam</small></button>':'')+'<button class="mcard" data-go="review"><b>Review all</b><small>'+S.review.filter(function(id){return ALL[id]}).length+' wrong answers to clear</small></button><button class="mcard" data-go="dict"><b>Dictionary</b><small>All '+tv+' terms, searchable</small></button>'+(GEO.byId.t1&&GEO.course.testsCard?'<button class="mcard" data-go="t1"><b>How the course works</b><small>Tests, grading, exam dates</small></button>':'')+'</div>';
  if(GEO.course.testsCard)h+='<div class="card"><h2>How the weekly tests work</h2><ul><li>5 minutes at the <b>start</b> of each lecture, about 7 A/B/C/D questions.</li><li>Only on the <b>previous</b> lecture, mostly facts from the lecture. Everything you need is in this hub.</li><li>Extra material (marked <i>not tested</i> here) is never in the test.</li><li>8 tests, the 2 worst are deleted, no retakes. Together they are <b>40 %</b> of your grade, the final exam <b>60 %</b>.</li></ul></div>';
  h+='<div class="card"><h2>Your data</h2><div id="syncbox" style="margin-bottom:10px"></div><p style="font-size:.95rem">Progress and wrong answers are saved in this browser'+(window.GEOSync?' (and synced to Firebase when signed in)':' only')+'.</p><button class="ghost" id="reset">Reset all my progress</button><span id="resetmsg" style="margin-left:10px;font-size:.9rem;color:var(--mute)"></span></div>';
  el("v-home").innerHTML=h;
  if(window.GEOSync)window.GEOSync.render();
  var armed=false;
  el("reset").onclick=function(){if(!armed){armed=true;this.textContent="Tap again to really reset";el("resetmsg").textContent="This deletes progress and the review list.";return}S=fresh();save(true);if(window.CAT)CAT.reset();if(window.GEOSync)window.GEOSync.onReset(S);hud();renderHome();el("resetmsg").textContent="Done. Progress reset."};
  el("foot").innerHTML=GEO.course.footer;
}
el("v-home").addEventListener("click",function(e){
  var q=e.target.closest("[data-quickt]");if(q){GM.auto="quick";go(q.getAttribute("data-quickt")+"-games");return}
  if(e.target.closest("#homefocus")){fsStart(10);return}
  var b=e.target.closest("[data-go]");if(b)go(b.getAttribute("data-go"))});
/* final exam */
var EXSEL=null;
function exInit(){
  if(!EXSEL){EXSEL={};GEO.topics.forEach(function(t){EXSEL[t.id]=t.id!=="t1"})}
  el("exsel").innerHTML=GEO.topics.map(function(t){return '<button data-t="'+t.id+'" aria-pressed="'+(!!EXSEL[t.id])+'">L'+t.num+' '+esc(t.short)+'</button>'}).join("");
}
el("exsel").onclick=function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-t");EXSEL[k]=!EXSEL[k];b.setAttribute("aria-pressed",EXSEL[k]?"true":"false")};
function exIds(n){
  var ts=GEO.topics.filter(function(t){return EXSEL[t.id]});if(!ts.length){ts=GEO.topics.slice()}
  var pools=ts.map(function(t){return shuffle(t.Q.filter(function(q){return !q.x}).map(function(q){return q.id}))});
  if(!n){return shuffle([].concat.apply([],ts.map(function(t){return t.Q.map(function(q){return q.id})})))}
  var w=ts.map(function(t){return t.id==="t1"?0.4:1}),sw=w.reduce(function(a,b){return a+b},0),ids=[];
  ts.forEach(function(t,k){var c=Math.max(1,Math.round(n*w[k]/sw));ids=ids.concat(pools[k].slice(0,c))});
  ids=shuffle(ids);
  if(ids.length>n)ids=ids.slice(0,n);
  var rest=shuffle([].concat.apply([],pools).filter(function(id){return ids.indexOf(id)<0}));
  while(ids.length<n&&rest.length)ids.push(rest.pop());
  return shuffle(ids);
}
function exam(n,sec){quiz(el("quiz-exam"),exIds(n),{key:n===(GEO.course.exam||{n:40}).n?"examfull":null,seconds:sec,exam:true,mixed:true,again:function(){exam(n,sec)},reviewHash:"review"})}
el("ex40").onclick=function(){var x=GEO.course.exam||{n:40,min:45};exam(x.n,x.min*60)};
el("ex15").onclick=function(){exam(15,0)};
el("exall").onclick=function(){exam(0,0)};
/* dictionary */
var DSEL={};
function dictInit(){
  el("dsel").innerHTML='<button data-t="all" aria-pressed="'+(!Object.keys(DSEL).some(function(k){return DSEL[k]}))+'">All</button>'+GEO.topics.map(function(t){return '<button data-t="'+t.id+'" aria-pressed="'+(!!DSEL[t.id])+'">L'+t.num+' '+esc(t.short)+' ('+t.VOC.length+')</button>'}).join("");
  dictTable();
}
el("dsel").onclick=function(e){var b=e.target.closest("button");if(!b)return;var k=b.getAttribute("data-t");if(k==="all")DSEL={};else DSEL[k]=!DSEL[k];dictInit()};
function dictTable(){
  var q=(el("dsearch").value||"").toLowerCase().trim(),any=Object.keys(DSEL).some(function(k){return DSEL[k]}),rows=[],n=0;
  GEO.topics.forEach(function(t){n+=t.VOC.length;if(any&&!DSEL[t.id])return;t.VOC.forEach(function(v){if(!q||(v[1]+" "+v[2]+" "+v[0]).toLowerCase().indexOf(q)>=0)rows.push([esc(v[1]),esc(v[2]),'L'+t.num+' '+esc(t.short)])})});
  rows.sort(function(a,b){return a[0].toLowerCase()<b[0].toLowerCase()?-1:1});
  el("dcount").textContent=rows.length+" of "+n+" terms";
  table(el("t-dict"),["Term","Meaning","Lecture"],rows,1);
}
el("dsearch").oninput=dictTable;

/* topic progress grid */
function progress(){
  var t=CUR,st=tp(t.id),d=Object.keys(st.done).filter(function(k){return st.done[k]}).length,b=S.best[t.id+"-mock7"];
  var sb=el("startbig");if(sb){var all=d>=t.steps.length;
    sb.innerHTML=(hasApply(t)?'<button data-v="apply">✏️ Apply: real seminar exercises<small>Formula sheet next to each task. Find the value, interpret it, earn XP.</small></button>':'')+'<button data-v="learn"'+(hasApply(t)?' class="sec"':'')+'>▶ '+(d===0?"Start learning":all?"Learn it again":"Continue learning")+'<small>'+(d===0?"Step 1 of "+t.steps.length+", in short bits":all?"All "+t.steps.length+" steps done ✓":"Step "+(st.step+1)+" of "+t.steps.length)+'</small></button><button class="sec" data-quick>⚡ Quick 5 questions<small>2 minutes, no timer. Easiest way in.</small></button><button class="sec" data-v="'+(t.mastery?"mastery":"games")+'">'+(t.mastery?'🏆 Mastery '+mStarsTxt(t)+'<small>Repeat everything until you know it cold</small></button><button class="sec" data-v="games">':'')+'🎮 Games<small>Lightning round, match pairs, type it</small></button>';}
  var rv=S.review.filter(function(id){return ALL[id]&&ALL[id].t===t.id}).length;
  el("progress").innerHTML='<button class="mcard" data-v="learn"><b>Learn, step by step</b><small>'+d+' of '+t.steps.length+' steps done</small></button><button class="mcard" data-v="cards"><b>'+esc(t.cards.tab)+'</b><small>Flip, then play "'+esc(t.cards.who||"Which one am I?")+'"</small></button><button class="mcard" data-v="games"><b>Games</b><small>'+(S.games[t.id+"-tf"]?'Lightning best '+S.games[t.id+"-tf"]:'Quick 5, lightning round, match, type it')+'</small></button><button class="mcard" data-v="mock"><b>Mock test</b><small>'+(b?'Best '+b.s+' / '+b.n:'Not tried yet')+'</small></button><button class="mcard" data-v="review"><b>Review</b><small>'+rv+' to clear</small></button><button class="mcard" data-v="vocab"><b>Vocabulary</b><small>'+t.VOC.length+' terms: flashcards, quiz, dictionary</small></button><button class="mcard" data-v="names"><b>'+esc(t.names.tab)+'</b><small>'+esc(t.names.small||"What you need to know")+'</small></button>';
}
el("v-start").addEventListener("click",function(e){if(e.target.closest("[data-quick]")){GM.auto="quick";go(CUR.id+"-games");return}var b=e.target.closest("[data-v]");if(b)go(CUR.id+"-"+b.getAttribute("data-v"))});

/* ---------- games ---------- */
var GM={auto:null,t:null,key:null};
function gameStop(){if(GM.t){clearInterval(GM.t);GM.t=null}if(GM.key){document.removeEventListener("keydown",GM.key);GM.key=null}var qe=el("gamebox");if(qe&&qe._t){clearInterval(qe._t);qe._t=null}}
function gamesInit(){
  $$("#gamepick button").forEach(function(b){b.setAttribute("aria-pressed","false")});
  var tfb=S.games[CUR.id+"-tf"],mb=S.games[CUR.id+"-match"];
  $('#gamepick [data-g="tf"] small').textContent="60 seconds of true or false."+(tfb?" Your record: "+tfb+".":" Set a record!");
  $('#gamepick [data-g="match"] small').textContent="Connect 6 terms with their meanings."+(mb?" Best: "+mb+" s.":"");
  el("gamebox").innerHTML='<p style="color:var(--mute);margin:0">Pick a game above. Not sure? Start with ⚡ Quick 5.</p>';
  if(GM.auto){var g=GM.auto;GM.auto=null;startGame(g)}
}
el("gamepick").onclick=function(e){var b=e.target.closest("[data-g]");if(b)startGame(b.getAttribute("data-g"))};
function startGame(g){
  gameStop();$$("#gamepick button").forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-g")===g?"true":"false")});
  var box=el("gamebox");
  if(g==="quick"){
    var rv=shuffle(S.review.filter(function(id){return ALL[id]&&ALL[id].t===CUR.id})).slice(0,2);
    var rest=shuffle(CUR.Q.filter(function(q){return !q.x&&rv.indexOf(q.id)<0}).map(function(q){return q.id})).slice(0,5-rv.length);
    box.innerHTML='<h2 style="margin-bottom:8px">⚡ Quick 5</h2><div id="gq"></div>';
    quiz(el("gq"),shuffle(rv.concat(rest)),{again:function(){startGame("quick")},againLabel:"Another 5",reviewHash:CUR.id+"-review"});
  }
  if(g==="tf")tfGame(box);
  if(g==="match")matchGame(box);
  if(g==="type")typeGame(box);
  var y=box.getBoundingClientRect().top+window.scrollY-110;if(y>window.scrollY+200)window.scrollTo({top:y,behavior:"smooth"});
}
/* lightning round: true or false */
function tfGame(box){
  var pool=CUR.Q.filter(function(q){return !q.x}),key=CUR.id+"-tf";
  box.innerHTML='<h2>⏱ Lightning round</h2><p>You see a question and an answer. Is the answer <b>right</b>? Tap ✓ or ✗ as fast as you can. 60 seconds. Keyboard: ← right, → wrong.</p><p>Your record: <b>'+(S.games[key]||0)+'</b></p><button class="btn" id="tfgo">Start!</button>';
  el("tfgo").onclick=function(){
    var left=60,score=0,n=0,miss=[],cur=null,used=[];
    function nextQ(){var q;var tries=0;do{q=pool[Math.floor(Math.random()*pool.length)];tries++}while(used.indexOf(q.id)>=0&&tries<30);used.push(q.id);if(used.length>pool.length-2)used=[];
      var truth=Math.random()<.5,cand=truth?q.o[0]:q.o[1+Math.floor(Math.random()*(q.o.length-1))];cur={q:q,truth:truth,cand:cand};
      $(".tfstate",box).innerHTML=esc(q.q)+'<span class="cand">→ '+esc(cand)+'</span>'}
    box.innerHTML='<div class="row" style="justify-content:space-between"><span class="bigtimer" id="tft">60</span><span class="big">Score: <b id="tfs">0</b></span></div><div class="tfstate"></div><div class="tf"><button class="t" data-a="1">✓ Right</button><button class="f" data-a="0">✗ Wrong</button></div><p id="tflast" style="min-height:3em;margin-top:10px;font-size:.92rem"></p>';
    nextQ();
    function ans(a){if(!cur)return;var ok=(a===cur.truth);n++;
      if(ok){score++;el("tfs").textContent=score;fx($(".tfstate",box),"pop");el("tflast").innerHTML='<span style="color:var(--ok)">✓ Yes!</span>'}
      else{miss.push(cur.q);mark(cur.q,false);fx($(".tfstate",box),"shake");el("tflast").innerHTML='<span style="color:var(--no)">✗</span> '+esc(cur.q.q)+' <b>'+esc(cur.q.o[0])+'</b>'}
      nextQ()}
    box.querySelector(".tf").onclick=function(e){var b=e.target.closest("[data-a]");if(b)ans(b.getAttribute("data-a")==="1")};
    GM.key=function(e){if(e.key==="ArrowLeft"){e.preventDefault();ans(true)}if(e.key==="ArrowRight"){e.preventDefault();ans(false)}};document.addEventListener("keydown",GM.key);
    GM.t=setInterval(function(){left--;var tt=el("tft");if(tt)tt.textContent=left;if(left<=10&&tt)tt.style.color="var(--no)";if(left<=0){gameStop();end()}},1000);
    function end(){cur=null;var rec=score>(S.games[key]||0);if(rec){S.games[key]=score;save()}
      xp(score*2+5,"lightning round");if(rec&&score>0){confetti()}
      box.innerHTML='<h2>⏱ Time!</h2><div class="score">'+score+' / '+n+'</div><p>'+(rec&&score>0?'<b>New record! 🏆</b>':'Record: '+(S.games[key]||0))+'</p>'+(miss.length?'<p>Learn these (they are now in Review):</p><ul>'+miss.map(function(q){return '<li>'+esc(q.q)+'<br><b>'+esc(q.o[0])+'</b></li>'}).join("")+'</ul>':'<p>No mistakes!</p>')+'<button class="btn" id="tfagain">Play again</button>';
      el("tfagain").onclick=function(){tfGame(box);el("tfgo").click()}}
  };
}
/* match pairs */
function matchGame(box){
  var key=CUR.id+"-match",V0=CUR.VOC,pick=[],tries=0;
  var pool=shuffle(V0.filter(function(v){return v[2].length<=110}));
  for(var i=0;i<pool.length&&pick.length<6;i++){var v=pool[i];if(pick.some(function(p){return p[1]===v[1]||p[2]===v[2]||CUR.VCON.some(function(g){return g.indexOf(p[1])>=0&&g.indexOf(v[1])>=0})}))continue;pick.push(v)}
  var L=shuffle(pick.map(function(v,k){return k})),Rr=shuffle(pick.map(function(v,k){return k}));
  var sel=null,done=0,err=0,t0=0;
  box.innerHTML='<h2>🧩 Match pairs</h2><p>Tap a term, then its meaning. <span id="mstat" style="color:var(--mute)">Timer starts on your first tap.</span></p><div class="match">'+L.map(function(k,i){return '<button class="term" data-s="t" data-k="'+k+'">'+esc(pick[k][1])+'</button><button data-s="m" data-k="'+Rr[i]+'">'+esc(pick[Rr[i]][2])+'</button>'}).join("")+'</div>';
  var grid=$(".match",box);
  grid.onclick=function(e){var b=e.target.closest("button");if(!b||b.classList.contains("done"))return;if(!t0)t0=Date.now();
    $$(".bad",grid).forEach(function(x){x.classList.remove("bad")});
    if(!sel||sel.getAttribute("data-s")===b.getAttribute("data-s")){if(sel)sel.classList.remove("sel");sel=b;b.classList.add("sel");return}
    if(sel.getAttribute("data-k")===b.getAttribute("data-k")){sel.classList.add("done");b.classList.add("done");sel.classList.remove("sel");done++;sel=null;xp(2);
      if(done===pick.length){var sec=Math.round((Date.now()-t0)/1000),best=S.games[key],rec=!best||sec<best;if(rec){S.games[key]=sec;save()}xp(Math.max(5,20-err*2),"match");confetti();
        box.innerHTML='<h2>🧩 All matched!</h2><div class="score">'+sec+' s</div><p>'+err+' wrong tap'+(err===1?'':'s')+'. '+(rec?'<b>New best time! 🏆</b>':'Best: '+best+' s')+'</p><ul>'+pick.map(function(v){return '<li><b>'+esc(v[1])+'</b>: '+esc(v[2])+'</li>'}).join("")+'</ul><button class="btn" id="magain">New pairs</button>';
        el("magain").onclick=function(){matchGame(box)}}}
    else{err++;sel.classList.add("bad");b.classList.add("bad");fx(b,"shake");sel.classList.remove("sel");sel=null;el("mstat").textContent=err+" wrong tap"+(err===1?"":"s")}
  };
}
/* type it */
function normT(s){return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\([^)]*\)/g," ").replace(/[^a-z0-9₀-₉]+/g," ").trim()}
function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i]}for(j=0;j<=n;j++)d[0][j]=j;for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
function variants(term){var base=String(term).replace(/\([^)]*\)/g," ");var parts=base.split(/\s*(?:\/|,| or )\s*/).concat([base]);return parts.map(normT).filter(function(x){return x.length>1})}
function typeGame(box){
  var deck=shuffle(CUR.VOC.filter(function(v){return v[1].length<=28})).slice(0,8),i=0,score=0,again=[],hintN=0;
  function draw(){
    if(i>=deck.length){xp(score*3+5,"type it");if(score===deck.length)confetti();
      box.innerHTML='<h2>⌨️ Done!</h2><div class="score">'+score+' / '+deck.length+'</div>'+(again.length?'<p>Practise these:</p><ul>'+again.map(function(v){return '<li><b>'+esc(v[1])+'</b>: '+esc(v[2])+'</li>'}).join("")+'</ul>':'<p>Perfect recall! 🧠</p>')+'<button class="btn" id="tyagain">8 new words</button>';el("tyagain").onclick=function(){typeGame(box)};return}
    var v=deck[i];hintN=0;
    box.innerHTML='<h2>⌨️ Type it</h2><div class="qhead"><span>Word '+(i+1)+' of '+deck.length+'</span><span class="chip">'+esc(v[0])+'</span></div><div class="bar"><i style="width:'+(i/deck.length*100)+'%"></i></div><p class="qtext">'+esc(v[2])+'</p><div class="typein"><input id="tyin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type the term…" aria-label="Your answer"><button class="btn" id="tyok">Check</button></div><div class="row" style="margin-top:8px"><button class="ghost" id="tyhint">Hint: show a letter</button><button class="ghost" id="tyskip">I don\'t know</button></div><p class="hint" id="tyh"></p><div class="fb" hidden></div>';
    var inp=el("tyin");inp.focus();
    function fin(ok,typo){var fb=$(".fb",box);fb.hidden=false;fb.className="fb "+(ok?"good":"bad");
      fb.innerHTML=(ok?"<b>✓ Yes!</b> "+(typo?"(spelled <b>"+esc(v[1])+"</b>) ":""):"<b>✗ It's "+esc(v[1])+".</b> ")+'<div style="margin-top:8px"><button class="btn" id="tynext">Next</button></div>';
      if(ok){score++;xp(hintN?2:4)}else{again.push(v)}fx($(".typein",box),ok?"pop":"shake");
      inp.disabled=true;el("tyok").disabled=true;el("tyhint").disabled=true;el("tyskip").disabled=true;var nb=el("tynext");nb.focus();nb.onclick=function(){i++;draw()}}
    function check(){var a=normT(inp.value);if(!a)return;var vs=variants(v[1]),exact=vs.indexOf(a)>=0,close=!exact&&vs.some(function(x){return lev(a,x)<=Math.max(1,Math.floor(x.length/6))});
      if(exact||close)fin(true,close);else{fx(inp,"shake");el("tyh").textContent="Not quite. Try again, or use a hint."}}
    el("tyok").onclick=check;inp.onkeydown=function(e){if(e.key==="Enter")check()};
    el("tyhint").onclick=function(){hintN++;var w=v[1];el("tyh").textContent="Starts with: "+w.slice(0,hintN)+"… ("+w.replace(/\s/g,"").length+" letters)";inp.focus()};
    el("tyskip").onclick=function(){fin(false)};
  }
  draw();
}


/* ---------- MASTERY: 4 stars, every item repeated in harder formats, 100 % needed ---------- */
var MSTAR=[null,{n:"Recognise",d:"True or false, easy choices, match pairs",tgt:1},{n:"Tell apart",d:"Look-alike wrong answers, both directions",tgt:2},{n:"Recall",d:"Type it from memory, think before you see options",tgt:2},{n:"Master",d:"No hints, 25-second timer",tgt:2}];
var MROUND=12,MCHK=[1,3,7],MSEC=25;
function ymd(off){var d=new Date(Date.now()+(off||0)*864e5);return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function mst(t){if(!isObj(S.mas))S.mas={};var m=S.mas[t.id];if(!isObj(m))m=S.mas[t.id]={};if(!m.cur)m.cur=1;if(!isObj(m.got))m.got={};if(!isObj(m.stars))m.stars={};if(!isObj(m.chk))m.chk=null;return m}
function strip(h){return String(h).replace(/<[^>]+>/g," ").replace(/&[a-z]+;/g," ").toLowerCase()}
function mItems(t){
  if(t._mi)return t._mi;var tx=t.steps.map(function(s){return strip(s.html)}),it=[];
  function stepOf(words,html){for(var i=0;i<t.steps.length;i++){if(html&&t.steps[i].html.indexOf(html)>=0)return i}
    var w=kw(words);if(!w.length)return t.steps.length-1;for(var k=0;k<tx.length;k++){var hit=w.filter(function(x){return tx[k].indexOf(x)>=0}).length;if(hit/w.length>=.6)return k}return t.steps.length-1}
  t.Q.forEach(function(q){if(q.x)return;it.push({id:"q:"+q.id,k:"q",q:q,st:stepOf(q.o[0]+" "+q.q,'data-q="'+q.id+'"')})});
  t.VOC.forEach(function(v){var term=v[1].toLowerCase().replace(/\([^)]*\)/g,"").trim(),s=-1;for(var i=0;i<tx.length;i++)if(tx[i].indexOf(term)>=0){s=i;break}
    it.push({id:"v:"+v[1],k:"v",v:v,st:s>=0?s:stepOf(v[2])})});
  (t.mastery.facts||[]).forEach(function(f,i){var m=/\{([^}]*)\}/.exec(f[1]);if(!m)return;var opts=m[1].split("|");
    it.push({id:"f:"+i,k:"f",st:f[0]-1,pre:f[1].slice(0,m.index),post:f[1].slice(m.index+m[0].length),ans:opts[0],wr:opts.slice(1)})});
  it.forEach(function(x,i){x.ord=x.st*1000+i});it.sort(function(a,b){return a.ord-b.ord});
  t._mi=it;return it;
}
function mPct(t,k){var m=mst(t),it=mItems(t);if(m.stars[k])return 100;if(m.cur!==k)return 0;var tg=MSTAR[k].tgt,d=it.filter(function(x){return (m.got[x.id]||0)>=tg}).length;return Math.round(d/it.length*(m.boss?100:95))}
function mStatus(t,k){var m=mst(t);if(m.stars[k])return (m.faded===k?"faded":"done");if(k===m.cur){if(k===4&&m.unlock4&&ymd()<m.unlock4)return "wait";return "open"}return "locked"}
function mDue(t){var m=mst(t);return !!(m.chk&&m.chk.due&&ymd()>=m.chk.due)||m.faded}
GEO.mDue=function(){return GEO.topics.filter(function(t){return t.mastery&&S.mas&&S.mas[t.id]&&mDue(t)})};
function mStarsTxt(t){var m=mst(t),s="";for(var k=1;k<=4;k++)s+=m.stars[k]?(m.faded===k?"☆":"⭐"):"☆";return s}
GEO.mStarsTxt=mStarsTxt;

/* -- build one task for an item in a star's format -- */
function others(it,kind,n,look){var t=CUR,pool=mItems(t).filter(function(x){return x.k===kind&&x!==it});
  if(kind==="v"){pool=pool.filter(function(x){return x.v[2]!==it.v[2]&&x.v[1]!==it.v[1]&&!t.VCON.some(function(g){return g.indexOf(x.v[1])>=0&&g.indexOf(it.v[1])>=0})||look&&t.VCON.some(function(g){return g.indexOf(x.v[1])>=0&&g.indexOf(it.v[1])>=0})})}
  if(look&&kind==="v"){var same=shuffle(pool.filter(function(x){return x.v[0]===it.v[0]||Math.abs(x.st-it.st)<=0})),rest=shuffle(pool.filter(function(x){return same.indexOf(x)<0}));return same.concat(rest).slice(0,n)}
  return shuffle(pool).slice(0,n)}
function mTask(it,star){
  var r=Math.random(),T={it:it,star:star};
  if(it.k==="q"){var q=it.q;
    if(star===1){if(r<.5){var tr=Math.random()<.5,c=tr?q.o[0]:q.o[1+Math.floor(Math.random()*3)];T.type="tf";T.q=esc(q.q)+'<span class="cand">→ '+esc(c)+'</span>';T.truth=tr}
      else{T.type="mc";T.q=esc(q.q);T.opts=shuffle([q.o[0],q.o[1+Math.floor(Math.random()*3)]]);T.ans=q.o[0]}}
    else{T.type="mc";T.q=esc(q.q);T.opts=shuffle(q.o.slice());T.ans=q.o[0];if(star===3)T.hide=true}
    T.fb=esc(q.e);T.right=q.o[0];return T}
  if(it.k==="v"){var v=it.v;
    if(star===1){if(r<.4){var o2=others(it,"v",1)[0],tr2=Math.random()<.5||!o2;T.type="tf";T.q='<b>'+esc(v[1])+'</b> means:<span class="cand">'+esc(tr2?v[2]:o2.v[2])+'</span>';T.truth=tr2}
      else{T.type="mc";T.q=esc(v[2]);T.lab="Which term is this?";T.opts=shuffle([v[1]].concat(others(it,"v",3).map(function(x){return x.v[1]})));T.ans=v[1]}}
    else if(star===2){var oo=others(it,"v",3,true);if(r<.5){T.type="mc";T.q=esc(v[2]);T.lab="Which term is this?";T.opts=shuffle([v[1]].concat(oo.map(function(x){return x.v[1]})));T.ans=v[1]}
      else{T.type="mc";T.q='<b>'+esc(v[1])+'</b>';T.lab="What does it mean?";T.opts=shuffle([v[2]].concat(oo.map(function(x){return x.v[2]})));T.ans=v[2]}}
    else if(star===3||(star===4&&r<.7)){T.type="type";T.q=esc(v[2]);T.lab="Type the term";T.ans=v[1];T.hint=star===3}
    else{var o4=others(it,"v",3,true);T.type="mc";T.q='<b>'+esc(v[1])+'</b>';T.lab="What does it mean?";T.opts=shuffle([v[2]].concat(o4.map(function(x){return x.v[2]})));T.ans=v[2]}
    T.fb='<b>'+esc(v[1])+'</b>: '+esc(v[2]);T.right=v[1];return T}
  /* fact with a gap */
  var full=esc(it.pre)+'<b>'+esc(it.ans)+'</b>'+esc(it.post),gap=esc(it.pre)+'<span class="gap">_____</span>'+esc(it.post);
  if(star===1){var tr3=Math.random()<.5,w=it.wr[Math.floor(Math.random()*it.wr.length)];T.type="tf";T.q=esc(it.pre)+'<b>'+esc(tr3?it.ans:w)+'</b>'+esc(it.post);T.truth=tr3}
  else if(star===2){T.type="mc";T.q=gap;T.lab="Fill the gap";T.opts=shuffle([it.ans].concat(it.wr));T.ans=it.ans}
  else{T.type="type";T.q=gap;T.lab="Type the missing word or number";T.ans=it.ans;T.hint=star===3}
  T.fb=full;T.right=it.ans;return T;
}
function mNorm(s){return normT(String(s).replace(/[–—-]/g," ").replace(/\bto\b/g," ")).replace(/\s+/g," ").trim()}
function mTypedOk(a,want){a=mNorm(a);if(!a)return 0;var vs=variants(want).map(mNorm).concat([mNorm(want)]);if(vs.indexOf(a)>=0)return 2;
  if(/\d/.test(want))return 0;return vs.some(function(x){return lev(a,x)<=(x.length<=6?1:2)})?1:0}

/* -- session -- */
var MS=null;
function mBuildQueue(mode){
  var t=CUR,m=mst(t),it=mItems(t),star=mode.star,q=[];
  if(mode.kind==="round"){var tg=MSTAR[star].tgt,pend=it.filter(function(x){return (m.got[x.id]||0)<tg});q=shuffle(pend.slice(0,MROUND)).map(function(x){return {it:x,need:tg-(m.got[x.id]||0)}})}
  else{var n=mode.kind==="check"?10:15;q=shuffle(it).slice(0,n).map(function(x){return {it:x,need:1}})}
  return q}
function mStart(kind){
  var t=CUR,m=mst(t),star=kind==="check"||kind==="refresh"?(m.faded||m.chk&&m.chk.star||1):m.cur;
  if(kind==="round"&&!mItems(t).some(function(x){return (m.got[x.id]||0)<MSTAR[star].tgt}))kind="boss";
  MS={kind:kind,star:star,q:mBuildQueue({kind:kind,star:star}),done:0,right:0,wrong:0,combo:0,first:{},tmr:null};
  MS.total=MS.q.reduce(function(a,x){return a+x.need},0);
  el("v-mastery").classList.add("insession");el("contbar").hidden=true;window.scrollTo(0,0);mNext();
}
function mStop(){if(MS&&MS.tmr){clearInterval(MS.tmr);MS.tmr=null}}
function mNext(){
  mStop();var box=el("mbox");
  if(!MS.q.length){mFinish();return}
  var e=MS.q[0];
  if(MS.star===1&&e.it.k==="v"&&Math.random()<.35){var vs=MS.q.filter(function(x){return x.it.k==="v"}).slice(0,4);if(vs.length>=4){mMatch(vs);return}}
  var T=mTask(e.it,MS.star);MS.T=T;MS.tried=0;MS.picked=null;
  var head='<div class="qhead"><span>'+(MS.kind==="boss"?"👑 Boss round":MS.kind==="check"?"🔁 Memory check":MS.kind==="refresh"?"✨ Refresh":"⭐".repeat(MS.star)+" "+MSTAR[MS.star].n)+' · '+MS.done+' / '+MS.total+'</span>'+(MS.combo>=3?'<span class="combo">🔥 '+MS.combo+'</span>':'<span class="chip">'+esc(stepName(e.it))+'</span>')+'</div><div class="bar"><i style="width:'+Math.round(MS.done/Math.max(1,MS.total)*100)+'%"></i></div>'+(MS.star===4?'<div class="mtimer"><i></i></div>':'');
  var body=(T.lab?'<p class="mlab">'+T.lab+'</p>':'')+'<p class="qtext">'+T.q+'</p>';
  if(T.type==="tf")body+='<div class="tf"><button class="t" data-tf="1">✓ Right</button><button class="f" data-tf="0">✗ Wrong</button></div>';
  if(T.type==="mc")body+=(T.hide?'<button class="btn sec" data-reveal style="width:100%;margin:6px 0">🧠 I have my answer in mind: show the options</button>':'')+'<div class="opts"'+(T.hide?' hidden':'')+'>'+T.opts.map(function(o,i){return '<button class="opt" data-o="'+i+'">'+esc(o)+'</button>'}).join("")+'</div>';
  if(T.type==="type")body+='<div class="typein"><input id="min" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type it…" aria-label="Your answer"><button class="btn" data-ok>Check</button></div>'+(T.hint?'<div class="row" style="margin-top:8px"><button class="ghost" data-mh>Hint: show a letter</button></div><p class="hint" id="mh"></p>':'');
  box.innerHTML=head+body+'<div class="fb" hidden></div>';
  MS.hint=0;var inp=el("min");if(inp)inp.focus();
  if(MS.star===4){var t0=Date.now(),bar=$(".mtimer i",box);MS.tmr=setInterval(function(){var f=(Date.now()-t0)/(MSEC*1000);if(bar)bar.style.width=Math.min(100,f*100)+"%";if(f>=1){mStop();mAnswer(false,"⏱ Time's up.")}},200)}
}
function stepName(it){var s=CUR.steps[it.st];return s?"Step "+(it.st+1):""}
function mAnswer(ok,note,typo){
  mStop();var e=MS.q.shift(),T=MS.T,box=el("mbox"),fb=$(".fb",box);
  $$("button.opt, .tf button, [data-ok], [data-mh], [data-reveal]",box).forEach(function(b){b.disabled=true});var inp=el("min");if(inp)inp.disabled=true;
  if(T.type==="mc")$$(".opt",box).forEach(function(b){var o=T.opts[+b.getAttribute("data-o")];if(o===T.ans)b.classList.add("ok")});
  if(ok){MS.combo++;MS.right++;e.need--;MS.done++;
    if(MS.kind==="round"){var m=mst(CUR);m.got[e.it.id]=(m.got[e.it.id]||0)+1;save()}
    if(e.need>0)MS.q.splice(Math.min(MS.q.length,4+Math.floor(Math.random()*3)),0,e);
    xp(MS.combo>=5?5:3);fx($(".qtext",box),"pop");
    fb.hidden=false;fb.className="fb good";fb.innerHTML="<b>✓ "+(typo?"Yes! Spelled: "+esc(T.right):"Correct!")+"</b>"+(T.type==="tf"&&!T.truth||typo?" "+T.fb:"");
    setTimeout(function(){if(MS&&el("mbox").contains(fb))mNext()},typo||T.type==="tf"&&!T.truth?1600:650);
  }else{MS.combo=0;MS.wrong++;MS.first[e.it.id]=1;
    if(MS.kind==="round"){var m2=mst(CUR);m2.got[e.it.id]=0;save();var tg=MSTAR[MS.star].tgt;MS.total+=tg-e.need;e.need=tg}
    MS.q.splice(Math.min(MS.q.length,3+Math.floor(Math.random()*3)),0,e);
    if(e.it.k==="q")mark(e.it.q,false);
    fx($(".qtext",box),"shake");
    fb.hidden=false;fb.className="fb bad";fb.innerHTML="<b>✗ "+(note||"Not quite.")+"</b> "+(T.type==="tf"?(T.truth?"It was right. ":"It was wrong. "):"The answer: <b>"+esc(T.right)+"</b>. ")+T.fb+(e.it.k==="v"?"":glossWhy(T.right,MS.picked))+'<div style="margin-top:8px"><button class="btn" data-mnext>Got it, next →</button></div><p class="hint" style="margin-top:4px">It will come back in a few questions.</p>';
    var nb=$("[data-mnext]",box);if(nb)nb.focus();
  }
}
function mMatch(list){
  var box=el("mbox");list.forEach(function(e){MS.q.splice(MS.q.indexOf(e),1)});
  var L=shuffle(list.slice()),R=shuffle(list.slice()),sel=null,done=0,bad={};
  box.innerHTML='<div class="qhead"><span>⭐ Recognise · '+MS.done+' / '+MS.total+'</span><span class="chip">match</span></div><div class="bar"><i style="width:'+Math.round(MS.done/Math.max(1,MS.total)*100)+'%"></i></div><p class="mlab">Match each term with its meaning</p><div class="match">'+L.map(function(e,i){return '<button class="term" data-s="t" data-k="'+list.indexOf(e)+'">'+esc(e.it.v[1])+'</button><button data-s="m" data-k="'+list.indexOf(R[i])+'">'+esc(R[i].it.v[2])+'</button>'}).join("")+'</div>';
  var grid=$(".match",box);
  grid.onclick=function(ev){var b=ev.target.closest("button");if(!b||b.classList.contains("done"))return;$$(".bad",grid).forEach(function(x){x.classList.remove("bad")});
    if(!sel||sel.getAttribute("data-s")===b.getAttribute("data-s")){if(sel)sel.classList.remove("sel");sel=b;b.classList.add("sel");return}
    var k1=sel.getAttribute("data-k"),k2=b.getAttribute("data-k");
    if(k1===k2){sel.classList.add("done");b.classList.add("done");done++;var e=list[+k1];
      if(bad[k1]){e.need=MSTAR[1].tgt;MS.q.splice(Math.min(MS.q.length,3),0,e);if(MS.kind==="round"){mst(CUR).got[e.it.id]=0}}
      else{e.need--;MS.done++;MS.right++;if(MS.kind==="round"){var m=mst(CUR);m.got[e.it.id]=(m.got[e.it.id]||0)+1}xp(2)}
      save();sel=null;
      if(done===list.length)setTimeout(mNext,500)}
    else{bad[k1]=1;bad[k2]=1;MS.wrong++;MS.combo=0;sel.classList.add("bad");b.classList.add("bad");fx(b,"shake");sel.classList.remove("sel");sel=null}
  };
}
function mFinish(){
  var t=CUR,m=mst(t),box=el("mbox"),k=MS.star,h="";
  if(MS.kind==="round"){xp(15,"round done");var p=mPct(t,k);h='<h2>Round done! 💪</h2><p>'+"⭐".repeat(k)+' '+MSTAR[k].n+': <b>'+p+' %</b> mastered.</p><p>'+(MS.wrong?MS.wrong+" mistake"+(MS.wrong>1?"s":"")+", all fixed in the round.":"No mistakes!")+'</p>';
    h+='<div class="row"><button class="btn" data-mgo>Next round →</button><button class="btn sec" data-mbreak>Take a break</button></div>'}
  else if(MS.kind==="boss"){m.stars[k]=ymd();m.cur=k+1;m.got={};m.boss=false;if(m.faded===k)m.faded=0;m.chk={star:k,due:ymd(1),i:0};if(k===3)m.unlock4=ymd(1);save();
    xp(100,"star "+k+" earned");confetti();setTimeout(confetti,700);
    h='<h2>'+"⭐".repeat(k)+' Star '+k+' earned! 🏆</h2><p>Every item of this lecture right at the <b>'+MSTAR[k].n+'</b> level.</p>'+(k<4?(k===3?'<p>⭐4 unlocks <b>tomorrow</b>: sleeping on it makes it stick.</p>':'<p>Next: ⭐'+(k+1)+' '+MSTAR[k+1].n+'. '+MSTAR[k+1].d+'.</p>'):'<p><b>You have fully mastered this lecture.</b> Short memory checks will keep it fresh.</p>')+'<p class="hint">A quick memory check of this star comes back tomorrow.</p>'+(k<3?'<div class="row"><button class="btn" data-mgo>Start ⭐'+(k+1)+' →</button></div>':'')}
  else if(MS.kind==="check"){var pass=MS.wrong<=1;
    if(pass){m.chk.i++;m.chk.due=m.chk.i<MCHK.length?ymd(MCHK[m.chk.i]):"";xp(20,"memory check");h='<h2>Memory check passed ✓</h2><p>'+(m.chk.due?'Next check in '+MCHK[m.chk.i]+' days.':'This star is now solid. No more checks needed.')+'</p>'}
    else{m.faded=k;m.chk.due=ymd();h='<h2>This star faded a bit ☆</h2><p>'+MS.wrong+' mistakes. Do a short <b>refresh round</b> to bring the star back. It is quick, and it is exactly how memory gets stronger.</p><div class="row"><button class="btn" data-mrefresh>Refresh now</button></div>'}
    save()}
  else if(MS.kind==="refresh"){m.faded=0;m.chk={star:k,due:ymd(1),i:0};save();xp(30,"star restored");confetti();h='<h2>Star restored ⭐</h2><p>Next memory check tomorrow.</p>'}
  MS=null;box.innerHTML=h;el("v-mastery").classList.remove("insession");mDraw(true);
}
function mDraw(keepBox){
  var t=CUR,m=mst(t),it=mItems(t),h='';
  for(var k=1;k<=4;k++){var st=mStatus(t,k),p=mPct(t,k);
    h+='<div class="mstar '+st+'"><div class="ms">'+"⭐".repeat(k)+'</div><b>'+MSTAR[k].n+'</b><small>'+MSTAR[k].d+'</small><div class="pb"><i style="width:'+p+'%"></i></div><small class="mst">'+(st==="done"?"Earned ✓":st==="faded"?"Faded: refresh it":st==="wait"?"Unlocks tomorrow":st==="locked"?"🔒 Locked":p+" % mastered")+'</small></div>'}
  el("mstars").innerHTML=h;
  var due=mDue(t),cur=m.cur,act="";
  if(m.faded)act='<button data-mrefresh>✨ Refresh '+"⭐".repeat(m.faded)+'<small>The star faded. One short round brings it back.</small></button>';
  else if(due)act='<button data-mcheck>🔁 Memory check: '+"⭐".repeat(m.chk.star)+'<small>10 quick items. Due today.</small></button>';
  if(cur<=4&&mStatus(t,cur)==="open"){var pend=it.filter(function(x){return (m.got[x.id]||0)<MSTAR[cur].tgt}).length;
    act+='<button class="'+(act?"sec":"")+'" data-mgo>▶ '+(pend?(mPct(t,cur)?"Continue":"Start")+" "+"⭐".repeat(cur)+" "+MSTAR[cur].n:"👑 Boss round for ⭐"+cur)+'<small>'+(pend?pend+" items left · rounds of "+MROUND+", stop any time":"15 mixed items from the whole lecture. Get them all right to earn the star.")+'</small></button>'}
  else if(cur===4&&mStatus(t,4)==="wait")act+='<button class="sec" disabled>⭐⭐⭐⭐ unlocks tomorrow<small>Sleep helps memory. Come back tomorrow.</small></button>';
  else if(cur>4&&!act)act='<button class="sec" disabled>🏆 Fully mastered<small>Memory checks will appear here when due.</small></button>';
  el("mact").innerHTML=act;
  if(!keepBox&&!MS)el("mbox").innerHTML='<p style="color:var(--mute);margin:0">'+it.length+' items in this lecture: every term, every fact and every question. Each star goes through all of them again, harder each time. Wrong answers come back a few questions later until they stick.</p>';
}
GEO._ms=function(){return MS};GEO._S=function(){return S};
function masteryInit(){mStop();MS=null;el("v-mastery").classList.remove("insession");el("mtitle").textContent="🏆 Mastery: "+CUR.title;mDraw()}
el("v-mastery").addEventListener("click",function(e){
  if(e.target.closest("[data-mgo]")){mStart("round");return}
  if(e.target.closest("[data-mcheck]")){mStart("check");return}
  if(e.target.closest("[data-mrefresh]")){mStart("refresh");return}
  if(e.target.closest("[data-mquit]")){mStop();MS=null;el("v-mastery").classList.remove("insession");mDraw();toast("Progress saved. Come back any time.");return}
  if(e.target.closest("[data-mbreak]")){el("mbox").innerHTML='<p>Good call. Your progress is saved. ☕</p>';return}
  if(e.target.closest("[data-mnext]")){mNext();return}
  if(!MS)return;var T=MS.T;
  var tf=e.target.closest("[data-tf]");if(tf&&!tf.disabled){mAnswer((tf.getAttribute("data-tf")==="1")===T.truth);return}
  var o=e.target.closest("button.opt");if(o&&!o.disabled){MS.picked=T.opts[+o.getAttribute("data-o")];var ok=MS.picked===T.ans;if(!ok)o.classList.add("no");mAnswer(ok);return}
  if(e.target.closest("[data-reveal]")){$(".opts",el("mbox")).hidden=false;e.target.closest("[data-reveal]").remove();return}
  if(e.target.closest("[data-mh]")){MS.hint++;var w=T.ans;el("mh").textContent="Starts with: "+w.slice(0,MS.hint)+"… ("+w.replace(/\s/g,"").length+" characters)";el("min").focus();return}
  if(e.target.closest("[data-ok]"))mType();
});
function mType(){var inp=el("min");if(!inp||inp.disabled||!inp.value.trim())return;var r=mTypedOk(inp.value,MS.T.ans);
  if(r)mAnswer(true,null,r===1);else if(MS.star===3&&!MS.tried){MS.tried=1;fx($(".typein",el("mbox")),"shake");el("mh")&&(el("mh").textContent="Not quite. One more try, or use a hint.")}else{MS.tried=0;mAnswer(false)}}
document.addEventListener("keydown",function(e){if(el("v-mastery").hidden)return;
  if(e.key==="Enter"&&e.target.id==="min"){e.preventDefault();mType();return}
});

/* ---------- keyboard answering: a number picks, Enter confirms and then goes on ---------- */
(function(){
  var css=document.createElement("style");
  css.textContent=".opts,.tf{counter-reset:kn}.opts>button.opt::before,.tf>button::before{counter-increment:kn;content:counter(kn);display:inline-block;min-width:1.7em;margin-right:8px;border:1px solid currentColor;border-radius:5px;font-size:.78rem;font-weight:700;text-align:center;opacity:.6}.opts>button.kpick,.tf>button.kpick{outline:3px solid var(--acc);outline-offset:2px}.match{counter-reset:kt km}.match>button[data-s=t]::before{counter-increment:kt;content:counter(kt)}.match>button[data-s=m]::before{counter-increment:km;content:counter(km)}.match>button[data-s]::before,[data-fcno]::before,[data-fcyes]::before,#vno::before,#vyes::before{display:inline-block;min-width:1.7em;margin-right:8px;border:1px solid currentColor;border-radius:5px;font-size:.78rem;font-weight:700;text-align:center;opacity:.6}[data-fcno]::before,#vno::before{content:'1'}[data-fcyes]::before,#vyes::before{content:'2'}.match>button.kpick,.row>button.kpick{outline:3px solid var(--acc);outline-offset:2px}";
  document.head.appendChild(css);
  var NEXT="[data-next],[data-mcnext],[data-hcnext],[data-whonext],[data-mnext],[data-act=next],[data-reveal],#vqnext,#tynext,#vshow,#magain,[data-fcflip],#mbox button.btn[data-mgo],.sdarea button.btn[data-sm]:not(.sec)";
  var pick=null,host=null;
  function all(sel){return Array.prototype.slice.call(document.querySelectorAll(sel))}
  function shown(x){return x.isConnected&&x.getClientRects().length>0&&getComputedStyle(x).visibility!=="hidden"}
  function inView(x){var r=x.getBoundingClientRect();return r.bottom>0&&r.top<window.innerHeight}
  function clear(){if(pick)pick.classList.remove("kpick");pick=null}
  var GROUPS=".opts,.tf,.match,.sdarea .row,#vtrainer .row";
  /* what the number keys choose from; in match pairs it is the column you are on */
  function choices(g){
    var c=Array.prototype.slice.call(g.children).filter(function(x){return x.tagName==="BUTTON"});
    if(g.classList.contains("match")){var s=g.querySelector("button.sel"),side=s&&s.getAttribute("data-s")==="t"?"m":"t";return c.filter(function(b){return b.getAttribute("data-s")===side})}
    if(g.classList.contains("row")&&!g.querySelector(":scope>[data-fcno],:scope>#vno"))return [];
    return c;
  }
  function live(b){return !b.disabled&&!b.classList.contains("done")}
  /* the question that gets the keys: the one used last, else the first open one on screen */
  function group(){
    var open=all(GROUPS).filter(function(g){return shown(g)&&choices(g).some(live)});
    return open.filter(function(g){return g.parentElement===host&&inView(g)})[0]||open.filter(inView)[0]||open.filter(function(g){return g.parentElement===host})[0]||open[0];
  }
  function nextBtn(){
    var l=all(NEXT).filter(function(b){return !b.disabled&&shown(b)});
    return l.filter(function(b){return host&&host.contains(b)})[0]||(host&&host.isConnected&&host.classList.contains("chk")?null:l.filter(inView)[0]);
  }
  document.addEventListener("click",function(e){
    if(!e.target.closest)return;
    var g=e.target.closest(GROUPS);if(g){host=g.parentElement;clear()}
    /* a button clicked with the mouse must not swallow the next Enter */
    var b=e.target.closest("button");if(b&&e.detail&&document.activeElement===b)b.blur();
  },true);
  window.addEventListener("hashchange",function(){clear();host=null});
  document.addEventListener("keydown",function(e){
    if(e.ctrlKey||e.metaKey||e.altKey||e.repeat||e.defaultPrevented)return;
    var t=e.target;if(t&&t.closest&&t.closest("input,textarea,select"))return;
    if(/^[1-9]$/.test(e.key)){
      var g=group();if(!g)return;var b=choices(g)[+e.key-1];if(!b||!live(b))return;
      e.preventDefault();clear();pick=b;host=g.parentElement;b.classList.add("kpick");
      if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
      b.scrollIntoView({block:"nearest"});return;
    }
    if(e.key!=="Enter")return;
    if(pick){var p=pick;clear();if(!p.disabled&&shown(p)){e.preventDefault();p.click();return}}
    if(t&&t.closest&&t.closest("button:not([disabled]),a,summary,.gl"))return;
    var n=nextBtn();if(n){e.preventDefault();n.click()}
  });
})();

/* ---------- focus sprint ---------- */
var FS={end:0,t:null,brk:false};
function fsFmt(l){var m=Math.floor(l/60),r=l%60;return m+":"+(r<10?"0":"")+r}
function fsStart(min,brk){FS.end=Date.now()+min*60000;FS.brk=!!brk;clearInterval(FS.t);FS.t=setInterval(fsTick,1000);el("focuspanel").hidden=true;el("focusstop").hidden=false;fsTick();if(!brk)toast("⏱ "+min+"-minute sprint started. You've got this.",true)}
function fsStop(){clearInterval(FS.t);FS.t=null;var b=el("focusbtn");b.textContent="⏱ Focus";b.classList.remove("on");el("focusstop").hidden=true}
function fsTick(){var l=Math.max(0,Math.round((FS.end-Date.now())/1000)),b=el("focusbtn");b.textContent=(FS.brk?"☕ ":"⏱ ")+fsFmt(l);b.classList.add("on");
  if(l<=0){var brk=FS.brk;fsStop();
    if(!brk){xp(25,"focus sprint");confetti();modal("🎉","Sprint done!","Great focus. Take a short break now: stand up, stretch, drink some water. Then come back for another round.",[["☕ 3-minute break",function(){fsStart(3,true)}],["Keep going: 10 more",function(){fsStart(10)}],["Close",null]])}
    else modal("💪","Break's over","Ready for another short sprint?",[["⏱ 10-minute sprint",function(){fsStart(10)}],["Not now",null]])}}
el("focusbtn").onclick=function(e){e.stopPropagation();el("focuspanel").hidden=!el("focuspanel").hidden};
el("focuspanel").onclick=function(e){e.stopPropagation();var b=e.target.closest("[data-min]");if(b)fsStart(+b.getAttribute("data-min"))};
el("focusstop").onclick=function(e){e.stopPropagation();fsStop();el("focuspanel").hidden=true};
document.addEventListener("click",function(){var p=el("focuspanel");if(p&&!p.hidden)p.hidden=true});

/* ---------- tabs + routing ---------- */
var TVIEWS=["start","learn","cards","games","mock","review","sheet","names","vocab"];
function hasApply(t){return !!(t&&window.GEOApply&&GEOApply.has(t))}
function tv(t){var a=hasApply(t)?["apply"]:[];return t&&t.mastery?["start"].concat(a,["learn","mastery"],TVIEWS.slice(2)):["start"].concat(a,TVIEWS.slice(1))}
function tabsFor(t){
  if(!t)return [["home","🏠 Home"],["exam","🎓 Exam practice"]].concat(window.GEOTick&&GEO.course.tickall?[["tickall","☑️ Tick all"]]:[]).concat([["review",'Review<span class="badge" id="rbadge" hidden>0</span>'],["dict","Dictionary"]]);
  return [[t.id,"📍 Overview"]].concat(hasApply(t)?[[t.id+"-apply","✏️ Apply"]]:[]).concat([[t.id+"-learn","📖 Learn"]]).concat(t.mastery?[[t.id+"-mastery","🏆 Mastery"]]:[]).concat([[t.id+"-cards","🃏 "+esc(t.cards.tab)],[t.id+"-games","🎮 Games"],[t.id+"-mock","📝 Mock test"],[t.id+"-review",'🔁 Review<span class="badge" id="rbadge" hidden>0</span>'],[t.id+"-sheet","📄 Cheat sheet"],[t.id+"-names","🔤 "+esc(t.names.tab)],[t.id+"-vocab","📚 Vocabulary"]]);
}
var tabsKey=null;
function drawTabs(t,sel){
  var k=t?t.id:"g";
  if(tabsKey!==k){el("tabs").innerHTML=tabsFor(t).map(function(x){return '<button class="tab" role="tab" data-h="'+x[0]+'">'+x[1]+'</button>'}).join("");tabsKey=k}
  $$(".tab").forEach(function(b){b.setAttribute("aria-selected",b.getAttribute("data-h")===sel?"true":"false")});
  var hb=el("homebtn");hb.hidden=!t;
  el("brandT").textContent=t?"L"+t.num+" · "+t.title:GEO.course.title;
  el("brandS").textContent=t?t.sub:(GEO.course.code?GEO.course.code+" · ":"")+GEO.course.subtitle;
  badge();
}
el("tabs").onclick=function(e){var b=e.target.closest(".tab");if(b)go(b.getAttribute("data-h"))};
el("homebtn").onclick=function(){go("home")};
function go(h){if(location.hash!=="#"+h)location.hash="#"+h;else show(h)}
GEO.go=go;
var ALLVIEWS=["home","test","exam","review","dict","tickall","start","apply","path","learn","mastery","cards","games","mock","sheet","names","vocab"];
function showView(v){ALLVIEWS.forEach(function(n){el("v-"+n).hidden=n!==v});el("lessonnav").hidden=v!=="learn"}
function show(h){
  h=h||"home";var m=/^(t\d+)(?:-([a-z]+))?$/.exec(h);
  stopSpeak();gameStop();if(typeof mStop==="function")mStop();var md=el("modal");if(md)md.hidden=true;
  if(m&&GEO.byId[m[1]]){
    var t=GEO.byId[m[1]],v=m[2]||"start";if(tv(t).indexOf(v)<0)v="start";
    if(CUR!==t)renderTopic(t);
    drawTabs(t,v==="start"?t.id:t.id+"-"+v);showView(v);
    if(v==="learn")showStep(tp(t.id).step);else window.scrollTo(0,0);
    if(v==="apply")GEOApply.open(t);
    if(v==="review")review();if(v==="start")progress();if(v==="games")gamesInit();if(v==="mastery")masteryInit();
    S.last=t.id+(v==="start"?"":"-"+v);save();
    contBar(t,v);
    return;
  }
  var stm=/^study-([a-z0-9]+)$/.exec(h);
  if(stm&&window.GEOPath&&(GEO.course.paths||[]).indexOf(stm[1])>=0){
    CUR=null;document.body.setAttribute("data-topic","home");el("contbar").hidden=true;
    drawTabs(null,"");showView("path");GEOPath.open(stm[1]);el("foot").innerHTML="";
    return;
  }
  var aps=/^ap-([a-z0-9]+)$/.exec(h)&&window.GEOApply&&GEOApply.setById(h.slice(3));
  if(aps){
    if(aps.topic&&GEO.byId[aps.topic]){location.replace("#"+aps.topic+"-apply");return}
    CUR=null;document.body.setAttribute("data-topic","home");el("contbar").hidden=true;
    drawTabs(null,"");showView("apply");window.scrollTo(0,0);GEOApply.openSet(aps.id);el("foot").innerHTML="";
    return;
  }
  if(h.indexOf("test-")===0){
    CUR=null;document.body.setAttribute("data-topic","home");
    el("contbar").hidden=true;
    drawTabs(null,"home");showView("test");window.scrollTo(0,0);
    renderTestView(h.slice(5));el("foot").innerHTML="";
    return;
  }
  if(["exam","review","dict","tickall"].indexOf(h)<0)h="home";
  CUR=null;document.body.setAttribute("data-topic","home");
  el("contbar").hidden=true;
  drawTabs(null,h);showView(h);window.scrollTo(0,0);
  if(h==="home")renderHome();
  if(h==="exam"){exInit();el("foot").innerHTML=""}
  if(h==="review"){review();el("foot").innerHTML=""}
  if(h==="dict"){dictInit();el("foot").innerHTML=""}
  if(h==="tickall"){if(window.GEOTick)GEOTick.open(el("v-tickall"));el("foot").innerHTML=""}
}
var TLAB={start:"Overview",apply:"Apply: seminar exercises",learn:"Learn, step by step",mastery:"Mastery",games:"Games",mock:"Mock test",review:"Review",sheet:"Cheat sheet",vocab:"Vocabulary"};
function contBar(t,v){
  var bar=el("contbar");if(v==="learn"){bar.hidden=true;return}
  var TV=tv(t),i=TV.indexOf(v),label,target;
  if(i<TV.length-1){var nv=TV[i+1];label=nv==="cards"?t.cards.tab:nv==="names"?t.names.tab:TLAB[nv];target=t.id+"-"+nv}
  else{var k=GEO.topics.indexOf(t),nt=GEO.topics[k+1];if(nt){label="Lecture "+nt.num+": "+nt.title;target=nt.id}else{label="All topics";target="home"}}
  var b=el("contbtn");b.textContent="Continue: "+label+" →";b.setAttribute("data-h",target);bar.hidden=false;
}
el("contbtn").onclick=function(){go(this.getAttribute("data-h"))};
window.addEventListener("hashchange",function(){show(location.hash.slice(1))});
GEO.boot=function(){
  GEO.topics.sort(function(a,b){return a.num-b.num});hud();
  if(window.GEOSync)window.GEOSync.init();
  show(location.hash.slice(1)||"home");
};
})();
