/* Slides panel: the lecture's full slide deck stays open beside (wide screens) or under (phones)
   whatever study tab you are on. Plain script, no build step. Pages are drawn with pdf.js
   (cdnjs, pinned version) and only when they scroll into view. If pdf.js can't load, the
   browser's own PDF viewer is used instead. */
(function(){
"use strict";
var PDFJS="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
var FILES={t1:"1-introduction",t2:"2-minerals",t3:"3-igneous-rocks",t4:"4-sedimentary-rocks",t5:"5-metamorphic-rocks",t6:"6-earth-structure",t7:"7-structural-geology-tectonics",t8:"8-historical-regional-geology-1"};
var KEY="geoHub.slides.v1";
var pref={open:false,tall:false};
try{var raw=localStorage.getItem(KEY);if(raw)pref=Object.assign(pref,JSON.parse(raw))}catch(e){}
function savePref(){try{localStorage.setItem(KEY,JSON.stringify(pref))}catch(e){}}

var cur=null,doc=null,loadedUrl=null,pageEls=[],io=null,scrollAt={},libP=null,token=0;
var btn,panel,body,pgLbl,sizeBtn;

function urlFor(t){
  if(!t)return null;
  if(t.slides)return t.slides;
  var course=window.GEO&&GEO.course;
  if(course&&course.code!=="ZOX101E")return null;      // the built-in map only fits the real geology course
  return FILES[t.id]?"slides/"+FILES[t.id]+".pdf":null;
}

function build(){
  if(panel)return;
  btn=document.createElement("button");
  btn.id="slidesbtn";btn.type="button";btn.hidden=true;
  btn.setAttribute("aria-controls","slidespanel");
  btn.onclick=function(){setOpen(!pref.open)};
  document.body.appendChild(btn);
  panel=document.createElement("aside");
  panel.id="slidespanel";panel.hidden=true;panel.setAttribute("aria-label","Lecture slides");
  panel.innerHTML='<div class="sl-bar"><b class="sl-title"></b><span class="sl-pg" aria-live="off"></span>'+
    '<a class="ghost sl-open" target="_blank" rel="noopener">Open PDF</a>'+
    '<button type="button" class="ghost sl-size" title="Make the slides panel taller or shorter">Taller</button>'+
    '<button type="button" class="ghost sl-x" aria-label="Hide the slides">✕</button></div>'+
    '<div class="sl-body" tabindex="0"></div>';
  document.body.appendChild(panel);
  body=panel.querySelector(".sl-body");pgLbl=panel.querySelector(".sl-pg");sizeBtn=panel.querySelector(".sl-size");
  panel.querySelector(".sl-x").onclick=function(){setOpen(false)};
  sizeBtn.onclick=function(){pref.tall=!pref.tall;savePref();layout()};
  var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){if(pref.open&&doc)draw()},250)});
  body.addEventListener("scroll",function(){if(cur)scrollAt[cur.id]=body.scrollTop;updatePg()},{passive:true});
}

function layout(){
  var on=!!cur&&pref.open&&!!urlFor(cur);
  panel.hidden=!on;
  document.body.classList.toggle("slides-on",on);
  document.body.classList.toggle("slides-tall",on&&pref.tall);
  btn.hidden=!(cur&&urlFor(cur))||on;btn.textContent="📑 Slides";
  btn.setAttribute("aria-expanded",on?"true":"false");
  sizeBtn.textContent=pref.tall?"Shorter":"Taller";
}

function setOpen(v){
  pref.open=!!v;savePref();layout();
  if(pref.open)ensure();
}

function loadLib(){
  if(libP)return libP;
  libP=new Promise(function(res,rej){
    var s=document.createElement("script");s.src=PDFJS+"pdf.min.js";s.onload=function(){res(window.pdfjsLib)};s.onerror=function(){rej(new Error("pdf.js"))};
    document.head.appendChild(s);
  }).then(function(lib){
    /* A worker must be same-origin, so wrap the CDN worker in a tiny blob script. */
    return fetch(PDFJS+"pdf.worker.min.js").then(function(r){if(!r.ok)throw new Error("worker");return r.text()}).then(function(code){
      lib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([code],{type:"text/javascript"}));return lib;
    });
  });
  libP.catch(function(){libP=null});
  return libP;
}

function fallback(url){
  doc=null;body.innerHTML='<iframe class="sl-frame" src="'+url+'" title="Lecture slides"></iframe>';pgLbl.textContent="";
}

function ensure(){
  if(!cur||!pref.open)return;
  var url=urlFor(cur);if(!url)return;
  panel.querySelector(".sl-title").textContent="L"+cur.num+" slides";
  panel.querySelector(".sl-open").href=url;
  if(loadedUrl===url)return;
  loadedUrl=url;doc=null;pageEls=[];var my=++token;
  body.innerHTML='<p class="sl-msg">Loading the slides…</p>';pgLbl.textContent="";
  loadLib().then(function(lib){return lib.getDocument({url:url}).promise}).then(function(d){
    if(my!==token)return;doc=d;draw(scrollAt[cur.id]);
  }).catch(function(){
    if(my!==token)return;fallback(url);
  });
}

function draw(startTop){
  if(io)io.disconnect();
  var ratio=body.scrollHeight>body.clientHeight?body.scrollTop/body.scrollHeight:0;
  var w=Math.max(200,body.clientWidth-16);
  body.innerHTML="";pageEls=[];
  var n=doc.numPages,my=token;
  io=new IntersectionObserver(function(es){
    es.forEach(function(en){if(en.isIntersecting){io.unobserve(en.target);render(en.target,my)}});
  },{root:body,rootMargin:"600px 0px"});
  doc.getPage(1).then(function(p0){
    if(my!==token)return;
    var v0=p0.getViewport({scale:1}),h=Math.round(w*v0.height/v0.width);
    for(var i=1;i<=n;i++){
      var d=document.createElement("div");d.className="sl-page";d.setAttribute("data-p",i);
      d.style.width=w+"px";d.style.height=h+"px";d.setAttribute("role","img");d.setAttribute("aria-label","Slide "+i+" of "+n);
      body.appendChild(d);pageEls.push(d);io.observe(d);
    }
    body.scrollTop=startTop!=null?startTop:ratio*body.scrollHeight;updatePg();
  });
}

function render(el,my){
  var i=+el.getAttribute("data-p");
  doc.getPage(i).then(function(p){
    if(my!==token)return;
    var w=parseFloat(el.style.width),v1=p.getViewport({scale:1}),dpr=Math.min(window.devicePixelRatio||1,2.5);
    var vp=p.getViewport({scale:w/v1.width*dpr});
    var c=document.createElement("canvas");c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);
    c.style.width=w+"px";c.style.height=Math.round(w*v1.height/v1.width)+"px";
    return p.render({canvasContext:c.getContext("2d"),viewport:vp}).promise.then(function(){
      if(my!==token)return;el.appendChild(c);
    });
  }).catch(function(){});
}

function updatePg(){
  if(!doc||!pageEls.length)return;
  var mid=body.scrollTop+body.clientHeight/3,k=0;
  for(var i=0;i<pageEls.length;i++){if(pageEls[i].offsetTop-body.offsetTop<=mid)k=i;else break}
  pgLbl.textContent="slide "+(k+1)+" / "+doc.numPages;
}

/* Called by app.js whenever the screen changes (t = the lecture, or null on home / exam / dictionary). */
window.GEOSlides={
  update:function(t){
    build();
    if(t!==cur){cur=t;loadedUrl=null}
    layout();
    if(cur&&urlFor(cur)&&pref.open)ensure();
  }
};
})();
