/* Lecture 1: Introduction and course rules */
(function(){"use strict";
var $=GEO.$,$$=GEO.$$,shuffle=GEO.shuffle,esc=GEO.esc;
var MUST='<span class="need must">Must know</span>',NICE='<span class="need nice">Good to know</span>';

var FIELDS=[
{n:"Mineralogy",grp:"Field of geology",d:"The study of minerals: their chemistry, structure and properties",l:"Lecture 2",clue:["d","l"]},
{n:"Petrology",grp:"Field of geology",d:"The study of rocks and their formative processes",l:"Lectures 3–5",clue:["d","l"]},
{n:"Geochemistry",grp:"Field of geology",d:"The chemistry of rocks and the Earth (the teacher's own field)",l:"Throughout",clue:["d","l"]},
{n:"Structural geology",grp:"Field of geology",d:"Deformation features in rocks, outcrop to regional scale",l:"Lecture 7",clue:["d","l"]},
{n:"Tectonics",grp:"Field of geology",d:"Large-scale plate interactions, regional to global",l:"Lecture 7",clue:["d","l"]},
{n:"Geophysics",grp:"Field of geology",d:"Physics of the Earth: seismic waves, magnetic and gravity fields",l:"Lecture 6",clue:["d","l"]},
{n:"Paleontology",grp:"Overlapping field",d:"The study of fossils and past life; between biology and geology",l:"History of the Earth",clue:["d","l"]},
{n:"Engineering geology",grp:"Overlapping field",d:"Geological surveys for buildings and roads",l:"Applied",clue:["d","l"]},
{n:"Economic geology (mining)",grp:"Overlapping field",d:"Finding and extracting ores, minerals and energy",l:"Lectures 10–11 (syllabus)",clue:["d","l"]},
{n:"Environmental geology",grp:"Overlapping field",d:"Geology related to the environment, e.g. mining and its effects",l:"End of the course, presentations",clue:["d","l"]},
{n:"Soil science",grp:"Overlapping field",d:"Soils form from the bedrock by weathering and interact with life",l:"Lecture 4",clue:["d","l"]},
{n:"Hydrogeology",grp:"Overlapping field",d:"Groundwater in rocks",l:"Applied",clue:["d","l"]}
];

var STEPS=[
{t:"5 min",title:"Who, where, when",html:`
<ul><li>Teacher: <b>Mgr. Václav Santolík, Ph.D.</b>, a fresh postdoc and <b>rock geochemist</b> (he dates and analyses rocks on mass spectrometers and electron microscopes). <span class="chip">recording</span></li><li>Email: <b>santolik@fzp.czu.cz</b>. Office: <b>MCEV Z326</b>. Consultation hours: contact him by email.</li><li>Course codes: <b>ZOX101E, ZOX102E, ZOX105E</b>.</li></ul>
<h3>His four rules</h3>
<ol><li><b>Work independently.</b></li><li><b>Don't be afraid to ask.</b></li><li><b>Be active.</b></li><li><b>Don't cheat.</b></li></ol>
<p>Also: "Be patient with me, I'll be patient with you."</p>
<h3>Where the material is</h3>
<ul><li><b>UIS</b> (is.czu.cz): syllabus, evaluation (grades), exam sign-up.</li><li><b>Moodle</b> (moodle.czu.cz): syllabus, <b>presentations</b>, other study material, real-time activities (quizzes in class).</li></ul>
<h3>Timetable (each Monday, winter semester)</h3>
<ul><li>8:45–10:15 <b>lecture</b> in D226</li><li>12:15–13:45 and 15:45–17:15 <b>practical lessons</b> in D226</li></ul>
<div class="box idea"><b>Good to know</b>The Moodle version of each presentation is the current one. The teacher said so in lecture 2 when he had shown an older version by mistake. <span class="chip">recording</span></div>
<div class="chk" data-q="in1"></div>
<div class="chk" data-q="in2"></div>`},
{t:"5 min",title:"The semester plan",html:`
<p>The outline from the first lecture (the order shifted a bit: lecture 6 became <b>Earth structure</b>, and structural geology moved to lecture 7):</p>
<ol><li>Introduction</li><li>Minerals</li><li>Igneous rocks and processes</li><li>Sedimentary rocks and processes</li><li>Metamorphic rocks and processes</li><li>Structural geology → <b>actually Earth structure</b></li><li>Geotectonic settings → <b>structural geology and tectonics</b> next</li><li>History of the Earth I</li><li>History of the Earth II</li><li>Economic geology I</li><li>Economic geology II</li></ol>
<div class="box teach"><b>From the recording</b>About 10 to 11 lectures in total; the course ends with <b>environmental geology</b>. There is <b>no fieldwork</b> this year. <span class="chip">recording</span></div>
<div class="chk" data-q="in4"></div>`},
{t:"10 min",title:"How you pass: credit, tests, exam",html:`
<h3>Credit (zápočet): pass / fail</h3>
<ul><li><b>Lectures</b>: attendance mandatory ("kinda").</li><li><b>Practicals</b>: attendance mandatory, you can miss <b>at most 3</b>.</li><li><b>Presentation</b> on environmental geology at the <b>8th + 9th practical</b> (December).</li><li><b>Essay</b> at the <b>11th practical</b>; you pick from given topics, e.g. mining and the environment. <span class="chip">recording</span></li><li>You can sign up for the exam <b>before</b> finishing the essay. <span class="chip">recording</span></li></ul>
<h3>Grading: option 2 won the class vote</h3>
<ul><li><b>Final exam = 60 %</b>, <b>regular tests = 40 %</b> of the final grade. <span class="chip">recording</span></li><li>Regular tests: <b>5 minutes at the beginning</b> of each lecture, <b>only on the previous lecture</b>. If you come late, you write it individually at the end of the lecture.</li><li><b>8 tests in total</b> (not in the first two weeks); <b>6 are graded</b>: the 2 worst are deleted, so you can miss 2. <b>No retakes</b>. <span class="chip">recording</span></li><li>Style: a few A/B/C/D questions, mostly facts from the slides. Slides with a <b>yellow</b> background are not tested.</li></ul>
<h3>Final exam</h3>
<ul><li><b>90 minutes</b>, <b>written</b>; sign up in <b>UIS</b>.</li><li>First date <b>18 Dec</b>, then at least 3–4 dates in January and February.</li><li>Covers <b>the whole (and only) geology taught</b> in the lectures; everything is in the presentations. It can include diagrams or pictures to fill in. <span class="chip">recording</span></li><li>Scale: <b>0–49 % = 4 (fail)</b>, <b>50–65 % = 3</b>, <b>66–80 % = 2</b>, <b>81–100 % = 1</b>.</li></ul>
<div class="box idea"><b>Specific needs</b>Send or bring an official document from the <b>CPS CZU</b> in advance (by <b>11 Dec 2026</b> at the latest).</div>
<h3>Grade calculator</h3>
<p style="font-size:.95rem">Enter your average on the weekly tests and a guess for the final exam.</p>
<div class="row"><label>Weekly tests average: <input class="num" id="gt" type="number" min="0" max="100" value="75"> %</label><label>Final exam: <input class="num" id="ge" type="number" min="0" max="100" value="70"> %</label></div>
<div class="out" id="gout"></div>
<div class="box trap"><b>Exam trap</b>The tests are on the <b>previous</b> lecture, not the one that day. And the 40 % only counts if you write them: missing more than 2 hurts.</div>
<div class="chk" data-q="in6"></div>
<div class="chk" data-q="in8"></div>
<div class="chk" data-q="in11"></div>`},
{t:"8 min",title:"What geology is",html:`
<div class="box idea"><b>The idea</b>Geology is the <b>study of the Earth</b>, mainly the <b>non-living Earth</b>: rocks, minerals and the processes that shape them. It is <b>multidisciplinary</b>: it uses chemistry, physics and mathematics. <span class="chip">recording</span></div>
<p>Fields influenced by geology, from the class discussion:</p>
<ul><li><b>Engineering and construction</b>: every building or road needs a geological survey; building materials come from rocks.</li><li><b>Agriculture and environmental science</b>: erosion, soil types; soil comes from the bedrock by weathering.</li><li><b>Paleontology</b>: fossils and past life, between biology and geology.</li><li><b>Mining</b> and resources; settlements and landscapes.</li></ul>
<div class="box ana"><b>From the video (Professor Dave)</b>Processes that shaped the planet long ago still happen today, so we can study them now: ripples on a beach look like the ripples in ancient sandstones. That idea is the essence of geology. <span class="chip">recording</span></div>
<h3>Where to learn more</h3>
<ul><li>Textbooks: Marshak, <i>Earth: Portrait of a Planet</i>; Grotzinger &amp; Jordan, <i>Understanding Earth</i>; Montgomery, <i>Fundamentals of Geology</i>; Rothery, <i>Geology: A Complete Introduction</i>.</li><li>Online: an interactive geology textbook, opengeology.org, alexstrekeisen.it (rock descriptions), English Wikipedia (the Czech one is weak), AI (but check it). <span class="chip">recording</span></li><li>YouTube: Professor Dave, GeoGirl, Earth and Space Sciences X.</li><li>Museums: National Museum Prague, National Technical Museum, Charles University geological museums, the faculty collections.</li><li>Prague trips: Barrandov–Hlubočepy, Prokopské údolí, Divoká Šárka, Prosecké skály, Housle and Kozí hřbety (Suchdol), Podbaba. Maps: mapy.geology.cz.</li></ul>
<h3>Match the field</h3>
<p>Streak: <b id="fstreak">0</b></p>
<div id="fdrill"></div>
<div class="chk" data-q="in14"></div>
<div class="chk" data-q="in16"></div>`}
];

var Q=[
{id:"in1",q:"What are the teacher's four rules?",h:"Independent, ask, active, honest.",o:["Work independently, don't be afraid to ask, be active, don't cheat","Always be on time, no phones, no food, no talking","Read the textbook, write notes, revise daily, sleep well","Work in pairs, ask the tutor, use Moodle, cheat if needed"],e:"Work independently; don't be afraid to ask; be active; don't cheat."},
{id:"in2",q:"Where do you find the lecture presentations?",h:"The e-learning platform.",o:["Moodle (moodle.czu.cz)","Only in UIS","On paper only","Nowhere"],e:"Moodle has the presentations, other materials and in-class activities. UIS has the syllabus and grades."},
{id:"in3",q:"Where do you sign up for the final exam?",h:"University information system.",o:["UIS (is.czu.cz)","Moodle","By email","No sign-up needed"],e:"Exam subscription in UIS is required."},
{id:"in4",q:"What does lecture 2 cover?",h:"After the introduction.",o:["Minerals","Igneous rocks","Earth structure","Economic geology"],e:"1 Introduction, 2 Minerals, 3 Igneous, 4 Sedimentary, 5 Metamorphic, 6 Earth structure."},
{id:"in5",q:"How many practicals can you miss at most?",h:"A small number.",o:["3","0","5","Any number"],e:"Practical attendance is mandatory; you can miss at most 3."},
{id:"in6",fol:1,q:"What do the weekly tests cover?",h:"Not today's lecture.",o:["Only the previous lecture","The whole course","Only the practicals","Today's lecture"],e:"5 minutes at the start of each lecture, only on the previous lecture."},
{id:"in7",fol:1,q:"How many weekly tests are there, and how many count?",h:"Two are deleted.",o:["8 tests, the best 6 count","6 tests, all count","10 tests, the best 8 count","8 tests, all count"],e:"8 tests (not in the first two weeks); the 2 worst are deleted."},
{id:"in8",fol:1,q:"How is the final grade made up (the option the class voted for)?",h:"60 / 40.",o:["Final exam 60 %, regular tests 40 %","Final exam 100 %","Regular tests 60 %, final exam 40 %","Presentation 50 %, essay 50 %"],e:"Option 2 won: 60 % final exam, 40 % regular tests."},
{id:"in9",fol:1,q:"How long is the final exam, and what form is it?",h:"An hour and a half.",o:["90 minutes, written","45 minutes, oral","3 hours, practical","30 minutes, online"],e:"Written, 90 minutes, on the whole geology taught in the lectures."},
{id:"in10",fol:1,q:"What grade is 70 % on the course scale?",h:"66–80 %.",o:["2 (good)","1 (excellent)","3 (sufficient)","4 (fail)"],e:"0–49 % = 4, 50–65 % = 3, 66–80 % = 2, 81–100 % = 1."},
{id:"in11",fol:1,q:"What is the minimum percentage to pass?",h:"Half.",o:["50 %","40 %","60 %","66 %"],e:"Below 50 % is a 4 (fail)."},
{id:"in12",q:"When is the first final exam date?",h:"Before Christmas.",o:["18 December","1 December","15 January","1 February"],e:"18 Dec, then at least 3–4 dates in January and February."},
{id:"in13",q:"What happens if you come late to a weekly test?",h:"You still write it.",o:["You write it individually at the end of the lecture","You get zero","You can never write it","You write it next week"],e:"Late students write the test individually at the end of the lecture."},
{id:"in14",q:"What is geology, as discussed in class?",h:"Mostly non-living.",o:["The study of the Earth, mainly the non-living Earth: rocks, minerals and processes","The study of living organisms","The study of the weather only","The study of space"],e:"Geology studies the (mainly non-living) Earth and overlaps with many fields."},
{id:"in15",q:"Which field studies fossils and past life?",h:"Between biology and geology.",o:["Paleontology","Petrology","Mineralogy","Hydrogeology"],e:"Paleontology: fossils and the history of life."},
{id:"in16",q:"What is petrology?",h:"Petra = rock.",o:["The study of rocks and their formative processes","The study of oil only","The study of fossils","The study of maps"],e:"Petrology studies rocks and how they form (lectures 3–5)."},
{id:"in17",q:"What do you need for the credit (zápočet)?",h:"Three things besides attendance.",o:["Practical attendance, a presentation and an essay","Only the final exam","Only the weekly tests","A field trip report"],e:"Credit: attendance, presentation (8th + 9th practical), essay (11th practical). Pass/fail."},
{id:"in18",q:"Which slides are NOT tested?",h:"A colour.",o:["Slides with a yellow background","Slides with pictures","The last slide of each lecture","All slides with tables"],e:"The teacher said yellow slides won't be in the tests."},
{id:"in19",q:"What is the teacher's own field?",h:"Chemistry of rocks.",o:["Rock geochemistry (dating and analysing rocks)","Paleontology","Volcanology","Glaciology"],e:"He is a rock geochemist."},
{id:"in20",q:"Can the weekly tests be retaken?",h:"Asked in class.",o:["No, there are no retakes","Yes, once","Yes, any time","Only with a doctor's note"],e:"No retakes; instead the 2 worst of 8 are deleted."}
];

var VOC=[
["Course","ZOX101E","The course code of Geology (also ZOX102E, ZOX105E)."],
["Course","Zápočet (credit)","Pass/fail credit: attendance at practicals, a presentation and an essay."],
["Course","Regular (weekly) test","5-minute A/B/C/D test at the start of each lecture, on the previous lecture."],
["Course","Final exam","Written, 90 minutes, on everything taught in the lectures. 60 % of the grade."],
["Course","UIS","The university information system (is.czu.cz): syllabus, grades, exam sign-up."],
["Course","Moodle","The e-learning system (moodle.czu.cz): presentations, materials, in-class quizzes."],
["Course","CPS CZU","The university office for students with specific needs; send its document in advance."],
["Course","Yellow slide","A slide with a yellow background: extra information, not tested."],
["Fields","Geology","The study of the Earth, mainly the non-living Earth: rocks, minerals and processes."]
].concat(FIELDS.map(function(f){return ["Fields",f.n,f.d+"."]}));
var VCON=[["Petrology","Mineralogy","Geochemistry"],["Structural geology","Tectonics"],["UIS","Moodle"],["Zápočet (credit)","Final exam","Regular (weekly) test"]];

var SHEET=[
 ["Contacts and places",["Item","Fact"],[["Teacher","Mgr. Václav Santolík, Ph.D. (rock geochemistry: dating and analysing rocks)"],["Email","santolik@fzp.czu.cz"],["Office","MCEV Z326; consultations by email"],["Lecture","Mondays 8:45–10:15, D226"],["Practicals","Mondays 12:15–13:45 and 15:45–17:15, D226"],["Materials","Moodle (presentations), UIS (syllabus, grades, exam sign-up)"]]],
 ["Passing",["Item","Fact"],[["Credit","Practicals (miss max 3), presentation (8th + 9th practical), essay (11th practical); pass/fail"],["Grade","60 % final exam + 40 % weekly tests (class vote)"],["Weekly tests","5 min at the start; previous lecture only; 8 tests, best 6 count; no retakes; late = write at the end"],["Final exam","Written, 90 min, UIS sign-up; from 18 Dec, more dates Jan–Feb; whole course"],["Scale","0–49 % = 4, 50–65 % = 3, 66–80 % = 2, 81–100 % = 1"],["Specific needs","CPS CZU document by 11 Dec 2026"]]]
];

function initAll(){
  function grade(p){return p>=81?"1 (excellent)":p>=66?"2 (good)":p>=50?"3 (sufficient)":"4 (fail)"}
  function up(){var t=Math.max(0,Math.min(100,+$("#gt").value||0)),e=Math.max(0,Math.min(100,+$("#ge").value||0)),f=Math.round(0.4*t+0.6*e);
    var need=Math.ceil((50-0.4*t)/0.6),need2=Math.ceil((66-0.4*t)/0.6),need1=Math.ceil((81-0.4*t)/0.6);
    function n(x){return x<=0?"any score":x>100?"not reachable":x+" %"}
    $("#gout").innerHTML='<div class="big">Final: '+f+' % → grade '+grade(f)+'</div><div class="kv"><span>Formula</span><span>0.4 × '+t+' + 0.6 × '+e+'</span><span>Exam needed for a 3</span><span>'+n(need)+'</span><span>Exam needed for a 2</span><span>'+n(need2)+'</span><span>Exam needed for a 1</span><span>'+n(need1)+'</span></div><p style="font-size:.85rem;color:var(--mute);margin:6px 0 0">An estimate based on the 60/40 split from the class vote.</p>'}
  $("#gt").oninput=up;$("#ge").oninput=up;up();
  var lf=-1;GEO.drill($("#fdrill"),"fstreak",function(){var n;do{n=Math.floor(Math.random()*FIELDS.length)}while(n===lf);lf=n;var f=FIELDS[n];return {q:"Which field: <b>"+esc(f.d)+"</b>?",opts:shuffle([f.n].concat(shuffle(FIELDS.filter(function(x){return x!==f}).map(function(x){return x.n})).slice(0,3))),ans:f.n,fb:""}});
}
STEPS[0].init=initAll;

GEO.register({
  id:"t1",num:1,title:"Introduction & course rules",short:"Intro",sub:"Lecture 1 · how the course works",
  blurb:"Who, where, the semester plan, how tests and the final exam work, and what geology is.",
  h1:"How the course works",
  start:{lede:"Built from the lecture 1 slides and your 5 Oct recording. This lecture had no weekly test, but it explains how you are graded. Worth 15 minutes once.",
    plan:'<ol><li><b>Learn, step by step</b>: 4 short steps, especially step 3 (grading) with the grade calculator.</li><li>Then go to the lecture you need to study from the <b>All topics</b> page.</li></ol>',
    six:["Weekly tests: <b>5 minutes at the start</b>, only on the <b>previous</b> lecture; 8 tests, best 6 count, no retakes.","Grade: <b>60 % final exam + 40 % weekly tests</b>.","Final exam: <b>written, 90 minutes</b>, whole course, sign up in <b>UIS</b>; first date <b>18 Dec</b>.","Scale: <b>50 %</b> to pass; 66 % for a 2; 81 % for a 1.","Credit: practicals (miss max 3), <b>presentation</b> (8th + 9th practical), <b>essay</b> (11th practical).","<b>Yellow slides are not tested.</b> Presentations are on <b>Moodle</b>."]},
  must:"tests and grading",
  steps:STEPS,Q:Q,VOC:VOC,VCON:VCON,sheet:SHEET,
  mockNote:"There was no weekly test on lecture 1. Use this only to check the course rules.",
  cards:{tab:"12 field cards",h1:"12 fields of geology",who:"Which field am I?",lede:"Fields of geology and the subjects it overlaps with (from the class discussion and the Moodle list). Tap to flip.",labels:{d:"What it studies",l:"Where in this course"},keys:["d","l"],items:FIELDS,sheet:true},
  names:{tab:"Course facts",h1:"Course facts at a glance",small:"Dates, numbers, rules",
    html:'<div class="card"><h2>Short answer</h2><p>None of this is likely in a weekly test, but it decides how you pass. '+MUST+' = rules that affect your grade, '+NICE+' = useful extras.</p></div>',
    tables:[
     {title:"Numbers and dates",head:["What","Fact","Need it?"],rows:[["Weekly tests","8 in total, best 6 count, 5 min each",MUST],["Grade split","60 % exam + 40 % tests",MUST],["Final exam","90 min, written",MUST],["First exam date","18 Dec",MUST],["Pass mark","50 %",MUST],["Practicals you can miss","3",MUST],["Presentation","8th + 9th practical",MUST],["Essay","11th practical",MUST],["Specific needs deadline","11 Dec 2026 (CPS CZU)",NICE],["Recognised minerals","~6,240 (lecture 2)",NICE]]},
     {title:"Useful places",head:["Place","What for","Need it?"],rows:[["Moodle","Presentations, in-class quizzes",MUST],["UIS","Grades, exam sign-up",MUST],["MCEV Z326","Teacher's office",NICE],["National Museum, Prague","Minerals and history of life",NICE],["Prokopské údolí, Barrandov","Geology trips in Prague",NICE],["mapy.geology.cz","Geological maps of Czechia",NICE]]}
    ]},
  mastery:{facts:[[1,"Lectures and practicals are held every {Monday|Tuesday|Wednesday|Friday} in the winter semester."], [1,"The lecture starts at {8:45|9:45|7:45|12:15} and lasts 90 minutes."], [1,"The lectures and practicals take place in room {D226|Z326|A101|B12}."], [1,"The lecturer is a rock {geochemist|zoologist|botanist|hydrologist}."], [1,"Presentations and real-time activities are on {Moodle|UIS|Teams|Dropbox}."], [1,"Grades (evaluation) are shown in {UIS|Moodle|Teams|email}."], [2,"The course has {11|8|6|14} lectures."], [3,"You can miss at most {3|1|5|0} practical lessons."], [3,"The presentation is in the {8th and 9th|3rd|11th|1st} practical lesson."], [3,"The essay is handed in at the {11th|8th|3rd|2nd} practical lesson."], [3,"A regular test lasts {5|15|30|45} minutes and is written at the beginning of the lecture."], [3,"A regular test only asks about the {previous|current|next|whole} lecture."], [3,"Regular tests: {8|6|4|10} in total, and the 2 worst are deleted."], [3,"Regular tests: of the 8 tests, the best {6|4|8|5} are graded."], [3,"If you come late to a regular test, you write it {individually at the end of the lecture|never|at home|the next week}."], [3,"The class vote gave a grade of {60 % final exam + 40 % regular tests|100 % final exam|60 % regular tests + 40 % final exam|50 % presentation + 50 % essay}."], [3,"The final exam is written and lasts {90|45|120|60} minutes."], [3,"You sign up for the final exam in {UIS|Moodle|email|Teams}."], [3,"The first final exam date is 18 {December|November|January|February}."], [3,"The final exam covers {the whole and only geology taught in the semester|only the last lecture|the textbooks|only the practicals}."], [3,"On the course scale, 0 to 49 % is grade {4 (fail)|3 (sufficient)|2 (good)|1 (excellent)}."], [3,"On the course scale, 50 to 65 % is grade {3 (sufficient)|4 (fail)|2 (good)|1 (excellent)}."], [3,"On the course scale, 66 to 80 % is grade {2 (good)|1 (excellent)|3 (sufficient)|4 (fail)}."], [3,"On the course scale, 81 to 100 % is grade {1 (excellent)|2 (good)|3 (sufficient)|4 (fail)}."], [3,"Students with specific needs bring an official document from the {CPS CZU|dean|library|study department}."], [4,"The list of geology fields is on {Moodle|UIS|Wikipedia|YouTube}."]]},
  foot:"Sources: lecture 1 slides \"Geology – Introduction\" (Mgr. Václav Santolík, Ph.D., CZU) and your Wispr recording of 5 Oct. Lines marked \"recording\" were said in class (e.g. the class vote for the 60/40 grading)."
});
})();
