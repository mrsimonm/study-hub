/* Lecture 4: Sedimentary rocks and processes */
(function(){"use strict";
var $=GEO.$,$$=GEO.$$,shuffle=GEO.shuffle,esc=GEO.esc;
var MUST='<span class="need must">Must know</span>',NICE='<span class="need nice">Good to know</span>',SKIP='<span class="need skip">Skip</span>';

var ROCKS=[
{n:"Conglomerate",grp:"Clastic",gs:"Coarse, > 2 mm, rounded clasts",co:"Varied rock and mineral clasts in a finer matrix",en:"River channels, alluvial fans, gravel beaches",clue:["gs","en"],not:["Breccia"]},
{n:"Breccia",grp:"Clastic",gs:"Coarse, > 2 mm, angular clasts",co:"Varied mineral and rock clasts in a finer matrix",en:"Talus slopes, debris flows, fault zones",clue:["gs","en"],not:["Conglomerate"]},
{n:"Sandstone",grp:"Clastic",gs:"Medium, 0.0625–2 mm, rounded to subangular",co:"Mainly quartz, may include feldspar and rock fragments",en:"Rivers, beaches, deserts, deltas",clue:["gs","co"]},
{n:"Siltstone",grp:"Clastic",gs:"Fine, 0.004–0.0625 mm",co:"Quartz, clay minerals, minor feldspar",en:"Floodplains, deltas, lake margins",clue:["gs","en"],not:["Mudstone","Shale","Claystone"]},
{n:"Claystone",grp:"Clastic",gs:"Fine, < 0.004 mm",co:"Clay minerals (e.g. kaolinite, illite)",en:"Lakes, deep marine, lagoons, floodplains",clue:["gs","co"],not:["Mudstone","Shale","Siltstone"]},
{n:"Mudstone",grp:"Clastic",gs:"Fine, clay or silt particles, < 0.0625 mm",co:"Quartz, clay minerals, minor feldspar",en:"Lakes, deep marine, lagoons, floodplains, deltas",clue:["gs","co"],not:["Shale","Claystone","Siltstone"]},
{n:"Shale",grp:"Clastic",gs:"Fine, clay or silt particles, < 0.0625 mm",co:"Like mudstone, but fissile: breaks in planes",en:"Lakes, deep marine, lagoons, floodplains, deltas",clue:["co","gs"],not:["Mudstone","Claystone","Siltstone"]},
{n:"Limestone",grp:"Chemical",gs:"Mostly microcrystalline, may include fossils",co:"Calcite (CaCO₃); grey, white, cream or tan",en:"Warm shallow marine (reefs, carbonate platforms), lakes, tidal flats",clue:["co","en"],not:["Biogenic limestone","Travertine"]},
{n:"Dolostone",grp:"Chemical",gs:"Crystalline; may keep textures of the original limestone",co:"Dolomite (CaMg(CO₃)₂); grey, brown, pink, beige",en:"Shallow marine, tidal flats, sabkhas, altered limestone",clue:["co","en"]},
{n:"Travertine",grp:"Chemical",gs:"Crystalline, porous, often banded or layered",co:"Calcite (CaCO₃); white, cream, tan",en:"Springs, caves, fresh water with CO₂ degassing",clue:["gs","en"],not:["Limestone"]},
{n:"Chert",grp:"Chemical",gs:"Very fine-grained, hard, conchoidal fracture",co:"Microcrystalline silica (SiO₂); grey, brown, black, red, white",en:"Deep marine (siliceous ooze) or replacement in limestones",clue:["co","gs"]},
{n:"Evaporite",grp:"Chemical",gs:"Crystalline to granular, may be layered or nodular",co:"Halite, gypsum or other; white, colourless, grey, pinkish",en:"Arid basins with high evaporation: playas, sabkhas, restricted lagoons",clue:["co","en"]},
{n:"Coal",grp:"Biogenic",gs:"Layered, compact; dull to shiny",co:"Organic carbon from plant material; black to dark brown",en:"Swamps and peat-forming wetlands, humid, low energy",clue:["co","en"]},
{n:"Biogenic limestone",grp:"Biogenic",gs:"Abundant visible or microscopic fossils",co:"Calcite (CaCO₃); grey, white, cream, tan",en:"Warm, shallow marine; e.g. chalk, coquina, fossiliferous limestone",clue:["gs","en"],not:["Limestone"]}
];

var ENV=[
["Fluvial","Terrestrial","Rivers and streams","Well-layered sands and muds, moderate sorting"],
["Alluvial fan","Terrestrial","Base of mountains","Coarse, poorly sorted sediments"],
["Glacial","Terrestrial","Ice-dominated","Very poorly sorted mix of all grain sizes"],
["Aeolian","Terrestrial","Wind-blown deserts","Very well-sorted, rounded sand grains"],
["Lacustrine","Terrestrial","Lakes","Fine-grained, often laminated beds"],
["Evaporitic","Terrestrial","Arid basins: playa (continental), sabkha (coastal)","Crystalline evaporite minerals, often bedded"],
["Deltaic","Transitional","River–sea interface","Alternating sand and mud layers"],
["Beach","Transitional","Wave-dominated coast","Well-sorted, rounded sand"],
["Tidal flat","Transitional","Intertidal zone","Alternating mud and sand, ripple marks"],
["Lagoon","Transitional","Sheltered coastal area","Fine, quiet-water sediments"],
["Shallow marine","Marine","Continental shelf and reefs","Well-sorted sand and carbonate mud"],
["Deep marine","Marine","Abyssal plain","Very fine muds and siliceous or calcareous ooze"]
];

var STEPS=[
{t:"8 min",title:"From rock to sediment to rock",html:`
<ul><li><b>Sedimentary</b> = <b>deposited + lithified</b> (turned into rock).</li><li><b>Petrology</b> = the study of rocks and their formative processes.</li><li>A <b>sediment</b> is natural rock material that gets deposited (settles). <span class="chip">recording</span></li></ul>
<p>The lecture has three parts: <b>sedimentary processes</b>, <b>depositional environments</b> (terrestrial, transitional, marine) and <b>sedimentary rocks</b> (clastic, chemical, biogenic).</p>
<h3>The chain of processes</h3>
<p>Put the processes in order, from a solid rock on a mountain to a new sedimentary rock:</p>
<div id="chain"></div>
<div class="box ana"><b>Analogy</b>A biscuit: you <b>break</b> it (weathering), the crumbs are <b>swept off</b> the table (erosion), <b>carried</b> to the bin (transport), they <b>settle</b> at the bottom (deposition) and get <b>squashed and glued</b> into a crumb cake (diagenesis).</div>
<div class="box teach"><b>From the recording</b>A student asked if the Earth gets bigger as layers pile up. No: <b>conservation of mass</b>. Whatever is deposited somewhere first had to be weathered and eroded somewhere else. <span class="chip">recording</span></div>
<div class="chk" data-q="se1"></div>
<div class="chk" data-q="se2"></div>`},
{t:"15 min",title:"Weathering: mechanical and chemical",html:`
<div class="box idea"><b>Definition</b><b>Weathering</b> is the breakdown of rocks and minerals <b>in place</b>, at or near the Earth's surface, through <b>physical, chemical and biological</b> processes.</div>
<div class="tw"><table><thead><tr><th></th><th>Mechanical weathering</th><th>Chemical weathering</th></tr></thead><tbody>
<tr><td><b>What happens</b></td><td>Breaks rocks into smaller pieces <b>without changing composition</b></td><td>Water + acids make minerals <b>dissolve or transform</b></td></tr>
<tr><td><b>Processes</b></td><td><b>Frost wedging</b> (freezing water expands in cracks)<br><b>Thermal expansion</b> (insolation, onion skin; deserts or wildfires)<br><b>Exfoliation</b> (release of pressure)<br><b>Biological activity</b> (root wedging, burrowing)</td><td><b>Hydrolysis</b>: feldspar → clay + ions<br><b>Oxidation</b>: iron minerals → rust (hematite, goethite)<br><b>Dissolution</b>: calcite in rainwater</td></tr>
<tr><td><b>Where faster</b></td><td>Frost wedging: where temperatures swing around freezing</td><td><b>Warm, wet</b> climates</td></tr>
<tr><td><b>Result</b></td><td><b>Angular, coarse fragments, sharp edges</b></td><td>Softened rock, <b>new minerals (clay)</b>, ions in solution</td></tr>
</tbody></table></div>
<div class="box teach"><b>Teacher said</b>"Remember <b>hydrolysis</b> as one of the principal processes." It breaks down minerals (especially feldspar) to form <b>soils</b> and releases elements that <b>plants</b> can use. Frost wedging is "very efficient" in the northern hemisphere. <span class="chip">recording</span></div>
<div class="box ana"><b>Analogy</b>Mechanical = smashing a sugar cube with a spoon (still sugar). Chemical = dropping it in tea (it dissolves into something else).</div>
<div class="box trap"><b>Exam trap</b>Root wedging and burrowing are <b>biological</b> processes, but on the slide they count as <b>mechanical</b> weathering. Exfoliation = pressure release, not temperature (that's thermal expansion / onion skin).</div>
<h3>Sort them: mechanical or chemical?</h3>
<div id="wsorter"></div>
<div class="chk" data-q="se5"></div>
<div class="chk" data-q="se9"></div>
<div class="chk" data-q="se11"></div>`},
{t:"12 min",title:"Erosion and transport",html:`
<p>The teacher asked: <b>what is the difference between weathering and erosion?</b></p>
<div class="box idea"><b>Answer</b><b>Weathering</b> breaks rock down <b>in place</b>. <b>Erosion</b> is the <b>removal</b> of weathered material (sediment) from its original location by natural agents: <b>water, wind, ice or gravity</b>.</div>
<p>Types: <b>water</b> erosion, <b>glacial</b> erosion, <b>gravitational</b> erosion, <b>wind (aeolian)</b> erosion.</p>
<h3>Transport</h3>
<p><b>Transport</b> is the movement of sediment from the site of erosion to the site of deposition. It follows erosion and uses the <b>same agents</b> (water, wind, glaciers, gravity). Three key processes:</p>
<ul><li><b>Sorting</b>: separation of grains by <b>size, shape and density</b>.</li><li><b>Rounding</b>: grains get more rounded and smooth from repeated <b>abrasion</b>.</li><li><b>Chemical alteration</b>: minerals dissolve or transform.</li></ul>
<h3>Slide the transport distance</h3>
<input type="range" id="tdist" min="0" max="4" step="1" value="0" aria-label="Transport distance">
<div class="out" id="tout"></div>
<div class="box teach"><b>From the recording</b>In a fast, high-energy stream, small particles are carried away while pebbles already settle. The longer the transport, the more the grains bump into each other and get rounded. <span class="chip">recording</span></div>
<div class="box trap"><b>Exam trap</b>Erosion = <b>removal</b> from a place; transport = <b>carrying</b> to another place. Both use the same four agents.</div>
<div class="chk" data-q="se14"></div>
<div class="chk" data-q="se16"></div>
<div class="chk" data-q="se18"></div>`},
{t:"12 min",title:"Deposition and diagenesis",html:`
<div class="box idea"><b>Deposition</b>The process by which transported sediments <b>come to rest and accumulate</b> in a new location, forming <b>sedimentary layers</b>. It is the end of the transport stage.</div>
<p>Key causes (the transport agent loses energy <span class="chip">recording</span>):</p>
<ul><li><b>Water slows down</b>: e.g. a lower slope, a river entering a lake</li><li><b>Wind drops</b></li><li><b>Glacier melts</b></li><li><b>Gravity stops acting</b>: e.g. the base of a cliff</li></ul>
<div class="box idea"><b>Diagenesis</b>All <b>physical, chemical and biological changes</b> in sediments <b>after deposition and before metamorphism</b>.</div>
<ul><li><b>Lithification</b>: making sediment a rock = <b>compaction + cementation</b></li><li><b>Recrystallisation</b>: crystals reorganise or grow larger</li><li><b>Authigenesis</b>: growth of new minerals</li><li><b>Dissolution</b>: unstable minerals dissolve</li><li><b>Biochemical alteration</b>: changes through microbial activity</li></ul>
<div class="box ana"><b>Analogy</b>Lithification is making a sandcastle permanent: press it (compaction) and glue it (cementation). The video in class: shake dirt in a glass of water and it settles into layers over time. <span class="chip">recording</span></div>
<div class="box trap"><b>Exam trap</b>Diagenesis stops where <b>metamorphism</b> begins (lecture 5). Lithification is only one part of diagenesis.</div>
<div class="chk" data-q="se20"></div>
<div class="chk" data-q="se22"></div>
<div class="chk" data-q="se24"></div>`},
{t:"15 min",title:"Depositional environments",html:`
<p>Where sediment ends up decides what it looks like. Three groups: <b>terrestrial</b> (on land), <b>transitional</b> (where land meets sea) and <b>marine</b>.</p>
<div class="row" style="margin:8px 0"><button class="ghost" data-toggle="hide" data-target="t-env">Test myself (blur answers)</button></div>
<div class="tw" id="t-env"></div>
<div class="box ana"><b>Memory trick: sorting</b>The <b>wind</b> is picky (only carries sand): <b>aeolian = very well sorted</b>. <b>Ice</b> is a bulldozer (carries everything): <b>glacial = very poorly sorted</b>. Mountains drop their load fast: <b>alluvial fan = coarse, poorly sorted</b>.</div>
<div class="box trap"><b>Exam trap</b><b>Playa</b> = <b>continental</b> arid basin; <b>sabkha</b> = <b>coastal</b> evaporite flat. Deltas, beaches, tidal flats and lagoons are <b>transitional</b>, not marine.</div>
<h3>Sort them: terrestrial, transitional or marine?</h3>
<div id="envsorter"></div>
<h3>Drill: which environment?</h3>
<p>Streak: <b id="envstreak">0</b> (aim for 8)</p>
<div id="envdrill"></div>
<div class="chk" data-q="se27"></div>
<div class="chk" data-q="se29"></div>
<div class="chk" data-q="se32"></div>`},
{t:"8 min",title:"Three kinds of sedimentary rock",html:`
<div class="tw"><table><thead><tr><th>Group</th><th>Also called</th><th>How it forms</th></tr></thead><tbody>
<tr><td><b>Clastic</b></td><td>Terrigenous</td><td>Accumulation and lithification of physical <b>fragments (clasts)</b> of pre-existing rocks</td></tr>
<tr><td><b>Chemical</b></td><td>Chemogenic</td><td><b>Precipitation</b> of minerals from solution, typically in evaporative or inorganic chemical conditions</td></tr>
<tr><td><b>Biogenic</b></td><td>Organic</td><td>Accumulation of <b>organic materials</b>: plants, algae, corals, microorganisms</td></tr>
</tbody></table></div>
<div class="box ana"><b>Analogy</b>Clastic = a wall of broken bricks. Chemical = salt crust left when a pot of salty water boils dry. Biogenic = a pile of shells or plant remains.</div>
<div class="box teach"><b>Teacher said</b>"Remember that sedimentary rocks have <b>layers</b>." Sedimentary beds are how you recognise them in the field. Fossils are also typical. <span class="chip">recording</span></div>
<h3>Sort them: clastic, chemical or biogenic?</h3>
<div id="gsorter"></div>
<div class="chk" data-q="se35"></div>
<div class="chk" data-q="se37"></div>`},
{t:"15 min",title:"Clastic rocks and grain size",html:`
<p>Clastic rocks are named by <b>grain size</b> (and, above 2 mm, by grain <b>shape</b>). This was the class activity: connect each rock with its grain size and setting.</p>
<div class="tw"><table><thead><tr><th>Rock</th><th>Grain size</th><th>Typical setting</th></tr></thead><tbody>
<tr><td><b>Claystone</b></td><td>&lt; 0.004 mm</td><td>Lakes, deep marine, lagoons</td></tr>
<tr><td><b>Siltstone</b></td><td>0.004–0.0625 mm</td><td>Deltas, floodplains</td></tr>
<tr><td><b>Shale / mudstone</b></td><td>&lt; 0.004–0.0625 mm (clay + silt)</td><td>Lakes, deep marine, lagoons</td></tr>
<tr><td><b>Sandstone</b></td><td>0.0625–2 mm</td><td>Rivers, beaches, deserts</td></tr>
<tr><td><b>Breccia</b></td><td>&gt; 2 mm, <b>angular</b></td><td>Talus slopes, debris flows</td></tr>
<tr><td><b>Conglomerate</b></td><td>&gt; 2 mm, <b>rounded</b></td><td>River channels, alluvial fans</td></tr>
</tbody></table></div>
<h3>Slide the grain size</h3>
<input type="range" id="gsz" min="0" max="100" step="1" value="40" aria-label="Grain size">
<div class="seg" id="shape" role="group" aria-label="Clast shape" style="margin-top:8px"><button data-s="r" aria-pressed="true">Rounded</button><button data-s="a" aria-pressed="false">Angular</button></div>
<div class="out" id="gszout"></div>
<div class="box trap"><b>Exam trap</b><b>Breccia = angular</b> (short transport, e.g. talus at the foot of a cliff). <b>Conglomerate = rounded</b> (long transport in rivers). <b>Shale</b> is the same as mudstone but <b>fissile</b>: it breaks into planes. The boundaries 0.004 mm, 0.0625 mm (= 1/16 mm) and 2 mm are the numbers to learn.</div>
<div class="box teach"><b>Your lecture 4 test</b>The weekly test on this lecture asked for grain sizes per rock, exactly this table.</div>
<div class="chk" data-q="se40"></div>
<div class="chk" data-q="se42"></div>
<div class="chk" data-q="se45"></div>`},
{t:"12 min",title:"Chemical rocks",html:`
<p>Second class activity: connect each chemical rock with its <b>main mineral</b> and <b>typical environment</b>.</p>
<div class="tw"><table><thead><tr><th>Rock</th><th>Main component</th><th>Typical environment</th></tr></thead><tbody>
<tr><td><b>Limestone</b></td><td>Calcite</td><td>Warm shallow marine, lakes</td></tr>
<tr><td><b>Dolostone</b></td><td>Dolomite</td><td>Altered limestones</td></tr>
<tr><td><b>Chert</b></td><td>Microcrystalline silica</td><td>Deep marine, replacement</td></tr>
<tr><td><b>Evaporite</b></td><td>Halite, gypsum</td><td>Arid basins, sabkhas</td></tr>
<tr><td><b>Travertine</b></td><td>Calcite</td><td>Springs, caves (fresh water)</td></tr>
</tbody></table></div>
<div class="box trap"><b>Exam trap</b><b>Limestone and travertine</b> are both calcite: limestone forms in <b>warm shallow seas</b>, travertine at <b>springs and caves</b> (porous, banded, CO₂ degassing). <b>Chert</b> is silica (SiO₂), very hard with conchoidal fracture, not a carbonate.</div>
<div class="box idea"><b>Links</b>Halite and calcite are on your mineral list (lecture 2); gypsum and dolomite were yellow there but are named here. Limestone and dolostone become <b>marble</b>, chert becomes something like quartzite (lecture 5).</div>
<h3>Drill: which chemical rock?</h3>
<p>Streak: <b id="chstreak">0</b> (aim for 8)</p>
<div id="chdrill"></div>
<div class="chk" data-q="se48"></div>
<div class="chk" data-q="se50"></div>
<div class="chk" data-q="se53"></div>`},
{t:"8 min",title:"Biogenic rocks",html:`
<div class="tw"><table><thead><tr><th>Rock</th><th>Made of</th><th>Where</th></tr></thead><tbody>
<tr><td><b>Coal</b></td><td>Predominantly organic carbon from <b>plant material</b>; layered, compact, dull to shiny, black to dark brown</td><td><b>Swamps and peat-forming wetlands</b> in humid, low-energy settings</td></tr>
<tr><td><b>Biogenic limestone</b></td><td>Calcite with abundant visible or microscopic <b>fossils</b></td><td>Warm, shallow marine</td></tr>
</tbody></table></div>
<p>Biogenic limestones are named by their fossils:</p>
<ul><li><b>Chalk</b>: from microscopic plankton deposited on the sea bed. <span class="chip">recording</span></li><li><b>Coquina</b>: made mainly of shells. <span class="chip">recording</span></li><li><b>Fossiliferous limestone</b>: limestone containing many fossils.</li></ul>
<div class="box idea"><b>Links</b>Coal becomes brown coal → black coal → <b>anthracite</b> with metamorphism (lecture 5).</div>
<div class="box ana"><b>Memory trick</b><b>Co</b>al = <b>Co</b>mpressed plants. <b>Co</b>quina = <b>Co</b>ckles (shells). <b>Ch</b>alk = <b>Ch</b>ewed-up plankton.</div>
<div class="chk" data-q="se57"></div>
<div class="chk" data-q="se59"></div>
<div class="chk" data-q="se61"></div>`}
];

var Q=[
{id:"se1",q:"What does \"sedimentary\" mean?",h:"Two words with a plus.",o:["Deposited + lithified","Changed by heat and pressure","Formed from magma","Melted and cooled"],e:"Sedimentary = deposited + lithified."},
{id:"se2",fol:1,q:"Which is the correct order of sedimentary processes?",h:"Break, remove, carry, settle, harden.",o:["Weathering → erosion → transport → deposition → diagenesis","Erosion → weathering → deposition → transport → diagenesis","Deposition → transport → weathering → diagenesis → erosion","Diagenesis → deposition → transport → erosion → weathering"],e:"Weathering, (erosion), transport, deposition, diagenesis."},
{id:"se3",q:"What are the three groups of depositional environments?",h:"Land, between, sea.",o:["Terrestrial, transitional, marine","Clastic, chemical, biogenic","Igneous, sedimentary, metamorphic","Fluvial, glacial, aeolian"],e:"Terrestrial, transitional and marine."},
{id:"se4",q:"Why doesn't the Earth get bigger as sediment piles up?",h:"A law of physics.",o:["Conservation of mass: deposited material was first eroded elsewhere","Sediment evaporates","The core absorbs it","It does get much bigger"],e:"From the recording: material is only moved, not created."},
{id:"se5",fol:1,q:"What is weathering?",h:"In place.",o:["The breakdown of rocks and minerals in place, at or near the surface","The removal of sediment by water or wind","The settling of sediment in layers","The hardening of sediment into rock"],e:"Weathering happens in place, through physical, chemical and biological processes."},
{id:"se6",fol:1,q:"What does mechanical weathering do?",h:"Smaller, same stuff.",o:["Breaks rock into smaller pieces without changing its composition","Dissolves minerals","Turns feldspar into clay","Rusts iron minerals"],e:"Mechanical weathering only breaks rock up; composition stays the same."},
{id:"se7",q:"What is frost wedging?",h:"Ice.",o:["Water freezing and expanding in cracks","Roots growing in cracks","Pressure release as rock is exposed","Rock dissolving in rainwater"],e:"Frost wedging: freezing water expands in cracks."},
{id:"se8",q:"What is exfoliation?",h:"Pressure.",o:["Rock breaking apart because of the release of pressure","Rock dissolving in acid","Rock expanding in desert heat","Roots splitting rock"],e:"Exfoliation = release of pressure when rock reaches the surface."},
{id:"se9",fol:1,q:"What kind of fragments does mechanical weathering produce?",h:"Sharp.",o:["Angular, coarse fragments with sharp edges","Rounded, well-sorted grains","Dissolved ions","New clay minerals"],e:"Mechanical weathering → angular, coarse, sharp-edged fragments."},
{id:"se10",q:"Thermal expansion (insolation, onion skin) is typical of:",h:"Hot days, cold nights.",o:["Deserts or wildfires","Glaciers","Deep oceans","Swamps"],e:"Thermal expansion: deserts or wildfires."},
{id:"se11",fol:1,q:"What happens in hydrolysis?",h:"Feldspar.",o:["Feldspar → clay + ions","Iron minerals → rust","Calcite dissolves in rainwater","Water freezes in cracks"],e:"Hydrolysis: feldspar reacts with water/acid to form clay and release ions."},
{id:"se12",fol:1,q:"In which climate is chemical weathering faster?",h:"Water and warmth.",o:["Warm and wet","Cold and dry","Hot and dry","Any, it makes no difference"],e:"Chemical weathering needs water and acids; it is faster in warm, wet climates."},
{id:"se13",y:1,q:"Why did the teacher call hydrolysis one of the principal processes?",h:"Soils and plants.",o:["It breaks minerals down to form soils and releases elements plants can use","It makes rocks harder","It forms evaporites","It causes earthquakes"],e:"Hydrolysis forms soils and releases nutrients."},
{id:"se14",fol:1,q:"What is the difference between weathering and erosion?",h:"In place vs removed.",o:["Weathering breaks rock down in place; erosion removes the material","They are the same thing","Erosion breaks rock in place; weathering removes it","Weathering only happens underwater"],e:"Weathering = breakdown in place; erosion = removal by water, wind, ice or gravity."},
{id:"se15",q:"Which agents cause erosion and transport?",h:"Four.",o:["Water, wind, ice, gravity","Heat, pressure, magma, time","Plants only","Earthquakes only"],e:"The same four agents erode and transport: water, wind, ice (glaciers), gravity."},
{id:"se16",fol:1,q:"What is sorting?",h:"Separating.",o:["Separation of grains by size, shape and density","Grains becoming rounder","Grains dissolving","Grains being cemented"],e:"Sorting happens during transport."},
{id:"se17",q:"What is rounding?",h:"Bumps and scrapes.",o:["Grains becoming more rounded and smoothed by repeated abrasion","Grains being separated by size","New minerals growing","Frost breaking rock"],e:"Rounding comes from abrasion during transport."},
{id:"se18",y:1,q:"Why are grains more rounded after a long transport?",h:"They collide.",o:["They bump into each other and get abraded along the way","They dissolve in the water","They melt","They grow new crystals"],e:"Repeated abrasion smooths and rounds the grains."},
{id:"se19",q:"What is transport?",h:"From A to B.",o:["Movement of sediment from the site of erosion to the site of deposition","Breakdown of rock in place","Hardening of sediment","Precipitation of salt"],e:"Transport follows erosion and uses the same agents."},
{id:"se20",fol:1,q:"What is deposition?",h:"Coming to rest.",o:["Transported sediments come to rest and accumulate, forming layers","Rock breaking in place","Removal of sediment","Melting of rock"],e:"Deposition ends transport and builds sedimentary layers."},
{id:"se21",y:1,q:"What is the key reason deposition happens?",h:"Energy.",o:["The transport agent loses energy (water slows, wind drops, glacier melts, gravity stops)","The sediment becomes lighter","The sun heats the sediment","Plants catch the grains"],e:"Lower energy means the agent can no longer carry the grains."},
{id:"se22",fol:1,q:"What is diagenesis?",h:"After deposition, before…",o:["All physical, chemical and biological changes in sediment after deposition and before metamorphism","The breakdown of rock at the surface","The transport of sediment","The melting of sediment into magma"],e:"Diagenesis covers all changes after deposition, before metamorphism."},
{id:"se23",fol:1,q:"What is lithification?",h:"Two steps.",o:["Making sediment into rock by compaction and cementation","Growth of new minerals","Dissolution of unstable minerals","Weathering of rock into soil"],e:"Lithification = compaction + cementation."},
{id:"se24",q:"What is authigenesis?",h:"New.",o:["Growth of new minerals during diagenesis","Crystals growing larger","Microbial changes","Rock breaking apart"],e:"Authigenesis = growth of new minerals."},
{id:"se25",q:"Which is NOT a diagenetic process?",h:"Four are listed with lithification.",o:["Frost wedging","Recrystallisation","Authigenesis","Biochemical alteration"],e:"Frost wedging is weathering. Diagenesis: lithification, recrystallisation, authigenesis, dissolution, biochemical alteration."},
{id:"se26",q:"Which situation causes deposition by water?",h:"Slower water.",o:["A river entering a lake","A river speeding up in a gorge","A flood starting","Rain falling on a mountain"],e:"Water slows down (lower slope, river enters a lake) and drops its load."},
{id:"se27",fol:1,q:"Which environment gives very well-sorted, rounded sand grains?",h:"The wind is picky.",o:["Aeolian (wind-blown deserts)","Glacial","Alluvial fan","Deep marine"],e:"Aeolian: very well-sorted, rounded sand."},
{id:"se28",fol:1,q:"Which environment gives a very poorly sorted mix of all grain sizes?",h:"A bulldozer of ice.",o:["Glacial","Aeolian","Beach","Lacustrine"],e:"Glacial: very poorly sorted mix of all grain sizes."},
{id:"se29",fol:1,q:"What is a sabkha?",h:"Coastal.",o:["A coastal evaporitic environment","A continental arid basin","A deep-sea plain","A mountain river"],e:"Playa = continental arid basin; sabkha = coastal. Both evaporitic."},
{id:"se30",q:"What is a playa?",h:"Continental.",o:["A continental arid (evaporitic) basin","A coastal salt flat","A coral reef","A delta"],e:"Playa = continental arid basin."},
{id:"se31",q:"Where are coarse, poorly sorted sediments deposited at the base of mountains?",h:"Fan.",o:["Alluvial fan","Lagoon","Deep marine","Beach"],e:"Alluvial fans: base of mountains, coarse and poorly sorted."},
{id:"se32",fol:1,q:"Which of these is a transitional environment?",h:"Where land meets sea.",o:["Delta","Lake","Abyssal plain","Desert"],e:"Transitional: deltaic, beach, tidal flat, lagoon."},
{id:"se33",q:"What sediment is typical of a tidal flat?",h:"Tides go in and out.",o:["Alternating mud and sand with ripple marks","Very well-sorted desert sand","Coarse angular blocks","Siliceous ooze"],e:"Tidal flat: intertidal zone, alternating mud and sand, ripple marks."},
{id:"se34",q:"What is deposited in the deep marine environment (abyssal plain)?",h:"Very fine.",o:["Very fine muds and siliceous or calcareous ooze","Coarse gravel","Well-sorted beach sand","Evaporite crystals"],e:"Deep marine: very low energy, very fine muds and ooze."},
{id:"se35",fol:1,q:"What are the three groups of sedimentary rocks?",h:"Fragments, solution, life.",o:["Clastic, chemical, biogenic","Plutonic, volcanic, pyroclastic","Foliated, non-foliated, banded","Terrestrial, transitional, marine"],e:"Clastic (terrigenous), chemical (chemogenic), biogenic (organic)."},
{id:"se36",fol:1,q:"How do clastic rocks form?",h:"Clasts.",o:["Accumulation and lithification of fragments (clasts) of pre-existing rocks","Precipitation of minerals from solution","Accumulation of plants and shells","Cooling of magma"],e:"Clastic = terrigenous: fragments of older rocks."},
{id:"se37",fol:1,q:"How do chemical sedimentary rocks form?",h:"Out of water.",o:["Precipitation of minerals from solution","Accumulation of rock fragments","Accumulation of plant material","Melting"],e:"Chemical = chemogenic: minerals precipitate from solution, often by evaporation."},
{id:"se38",q:"What is another name for clastic sedimentary rocks?",h:"Terra = land.",o:["Terrigenous","Chemogenic","Organic","Plutonic"],e:"Clastic = terrigenous."},
{id:"se39",y:1,q:"How can you recognise sedimentary rocks in the field, according to the teacher?",h:"Remember…",o:["They have layers (sedimentary beds)","They have big interlocking crystals","They are always black","They have gas bubbles"],e:"\"Remember that sedimentary rocks have layers.\""},
{id:"se40",fol:1,q:"What is the grain size of sandstone?",h:"Medium.",o:["0.0625–2 mm","< 0.004 mm","0.004–0.0625 mm","> 2 mm"],e:"Sandstone: 0.0625–2 mm, mainly quartz."},
{id:"se41",fol:1,q:"What is the grain size of siltstone?",h:"Between clay and sand.",o:["0.004–0.0625 mm","< 0.004 mm","0.0625–2 mm","> 2 mm"],e:"Siltstone: 0.004–0.0625 mm."},
{id:"se42",fol:1,q:"What is the grain size of claystone?",h:"The finest.",o:["< 0.004 mm","0.004–0.0625 mm","0.0625–2 mm","> 2 mm, rounded"],e:"Claystone: < 0.004 mm, clay minerals (kaolinite, illite)."},
{id:"se43",fol:1,q:"What is the difference between breccia and conglomerate?",h:"Both > 2 mm.",o:["Breccia has angular clasts; conglomerate has rounded clasts","Breccia is finer","Conglomerate is chemical","There is no difference"],e:"Both > 2 mm. Breccia angular (talus, debris flows); conglomerate rounded (river channels, alluvial fans)."},
{id:"se44",fol:1,q:"What makes shale different from mudstone?",h:"How it breaks.",o:["Shale is fissile: it breaks in planes","Shale is coarser","Shale is made of calcite","Shale forms only in deserts"],e:"Shale = same as mudstone but fissile."},
{id:"se45",fol:1,q:"Where does breccia typically form?",h:"Short transport.",o:["Talus slopes, debris flows, fault zones","Deep marine","River deltas","Swamps"],e:"Angular clasts mean little transport: talus slopes, debris flows, fault zones."},
{id:"se46",q:"Where does conglomerate typically form?",h:"Rivers.",o:["River channels, alluvial fans, gravel beaches","Deep marine","Swamps","Caves"],e:"Rounded clasts: river channels, alluvial fans, gravel beaches."},
{id:"se47",q:"What is sandstone mainly made of?",h:"Most stable mineral.",o:["Mainly quartz, may include feldspar and rock fragments","Calcite","Halite","Organic carbon"],e:"Sandstone: mainly quartz."},
{id:"se48",fol:1,q:"What is the main mineral of limestone, and where does it typically form?",h:"Warm seas.",o:["Calcite; warm shallow marine, lakes","Dolomite; altered limestones","Halite; arid basins","Silica; deep marine"],e:"Limestone: calcite; warm shallow marine (reefs, carbonate platforms), lakes, tidal flats."},
{id:"se49",fol:1,q:"What is dolostone made of?",h:"Ca + Mg carbonate.",o:["Dolomite","Calcite","Gypsum","Quartz"],e:"Dolostone: dolomite; often altered limestone, tidal flats, sabkhas."},
{id:"se50",fol:1,q:"What is chert made of?",h:"Very hard.",o:["Microcrystalline silica (SiO₂)","Calcite","Halite","Plant carbon"],e:"Chert: microcrystalline silica; deep marine (siliceous ooze) or replacement in limestone."},
{id:"se51",fol:1,q:"What are evaporites made of, and where do they form?",h:"Salt.",o:["Halite, gypsum or other; arid basins with high evaporation (playas, sabkhas)","Calcite; warm seas","Silica; deep ocean","Coal; swamps"],e:"Evaporites: halite, gypsum; arid basins, sabkhas, restricted lagoons."},
{id:"se52",fol:1,q:"Where does travertine form?",h:"Fresh water.",o:["Springs and caves, fresh water with CO₂ degassing","Warm shallow seas","Deep marine","Deserts"],e:"Travertine: calcite; springs, caves; porous and banded."},
{id:"se53",y:1,q:"Limestone and travertine are both calcite. What is different?",h:"Where.",o:["Limestone forms in warm shallow seas; travertine at springs and caves in fresh water","Travertine is silica","Limestone is clastic","Nothing"],e:"Same mineral, different environment. Travertine is porous and banded."},
{id:"se54",q:"Which rock has very fine grains, is hard and has conchoidal fracture?",h:"Silica.",o:["Chert","Limestone","Shale","Coal"],e:"Chert: very fine-grained, hard, conchoidal fracture."},
{id:"se55",q:"In the chemical-rock activity, which environment goes with dolostone?",h:"Changed limestone.",o:["Altered limestones","Springs, caves","Arid basins, sabkhas","Deep marine"],e:"Activity answer: dolostone — dolomite — altered limestones."},
{id:"se56",q:"In the chemical-rock activity, which environment goes with chert?",h:"Deep.",o:["Deep marine, replacement","Warm shallow marine","Springs, caves","Arid basins"],e:"Activity answer: chert — microcrystalline silica — deep marine, replacement."},
{id:"se57",fol:1,q:"How do biogenic sedimentary rocks form?",h:"Life.",o:["Accumulation of organic materials: plants, algae, corals, microorganisms","Precipitation of salt","Fragments of older rocks","Cooling magma"],e:"Biogenic = organic."},
{id:"se58",fol:1,q:"What is coal made of, and where does it form?",h:"Swamps.",o:["Organic carbon from plant material; swamps and peat-forming wetlands","Calcite from shells; reefs","Silica; deep ocean","Halite; deserts"],e:"Coal: plant carbon; humid, low-energy swamps and peat wetlands."},
{id:"se59",q:"What is chalk made of?",h:"Tiny sea life.",o:["Microscopic plankton deposited on the sea bed","Shells only","Plant material","Volcanic ash"],e:"From the recording: chalk forms from plankton."},
{id:"se60",q:"What is coquina?",h:"Shells.",o:["A limestone composed mainly of shells","A type of coal","A volcanic rock","A clastic sandstone"],e:"Coquina: mainly shells (fossils)."},
{id:"se61",q:"What is fossiliferous limestone?",h:"Fossils inside.",o:["Limestone containing many fossils","Limestone with no fossils","A sandstone","A chert"],e:"Fossiliferous limestone: limestone with lots of fossils."},
{id:"se62",q:"Where does biogenic limestone form?",h:"Warm.",o:["Warm, shallow marine settings","Swamps","Deserts","Glaciers"],e:"Biogenic limestone: warm, shallow marine."},
{id:"se63",q:"Which environment has well-layered sands and muds with moderate sorting?",h:"Rivers.",o:["Fluvial","Glacial","Aeolian","Evaporitic"],e:"Fluvial: rivers and streams."},
{id:"se64",q:"Which environment has fine-grained, often laminated beds?",h:"Lakes.",o:["Lacustrine","Alluvial fan","Glacial","Beach"],e:"Lacustrine = lakes."},
{id:"se65",q:"Which environment has alternating sand and mud layers at the river–sea interface?",h:"River mouth.",o:["Deltaic","Lagoon","Deep marine","Aeolian"],e:"Deltaic: alternating sand and mud."},
{id:"se66",q:"Which oxidation product forms when iron minerals weather?",h:"Rust.",o:["Hematite or goethite (rust)","Clay","Halite","Calcite"],e:"Oxidation: iron minerals → rust (hematite/goethite)."},
{id:"se67",q:"Which is NOT a type of erosion?",h:"Four agents.",o:["Magmatic erosion","Glacial erosion","Wind (aeolian) erosion","Gravitational erosion"],e:"Water, glacial, gravitational and wind erosion."},
{id:"se68",q:"What is dissolution in chemical weathering?",h:"Limestone in rain.",o:["Calcite dissolving in rainwater","Feldspar turning to clay","Iron turning to rust","Ice expanding in cracks"],e:"Dissolution: e.g. calcite dissolving in (slightly acidic) rainwater."},
{id:"se69",q:"Where do lagoons sit and what do they collect?",h:"Sheltered.",o:["Sheltered coastal areas with fine, quiet-water sediments","Mountain bases with coarse gravel","Open ocean floors with ooze","Deserts with dunes"],e:"Lagoon: sheltered, fine quiet-water sediments."},
{id:"se70",q:"Which environment gives well-sorted sand and carbonate mud on the continental shelf and reefs?",h:"Not deep.",o:["Shallow marine","Deep marine","Glacial","Lacustrine"],e:"Shallow marine: shelf and reefs, well-sorted sand and carbonate mud."}
];

var VOC=[
["Basics","Sediment","Natural rock material (grains, fragments, shells) that gets deposited."],
["Basics","Sedimentary","Deposited + lithified."],
["Basics","Sedimentary petrology","The study of sedimentary rocks and their formative processes."],
["Basics","Bed / layer","A single layer of sedimentary rock; layers are how you recognise sedimentary rocks."],
["Basics","Conservation of mass","Matter is not created: deposited sediment was first eroded somewhere else. (recording)"],
["Processes","Weathering","Breakdown of rocks and minerals in place, at or near the surface."],
["Processes","Mechanical weathering","Breaking rock into smaller pieces without changing composition."],
["Processes","Chemical weathering","Water and acids dissolve or transform minerals; faster in warm, wet climates."],
["Processes","Frost wedging","Freezing water expands in cracks and splits rock."],
["Processes","Thermal expansion (insolation)","Heating and cooling makes rock peel in layers (onion skin); deserts, wildfires."],
["Processes","Onion-skin weathering","Rock peeling off in curved shells from thermal expansion."],
["Processes","Exfoliation","Rock breaking apart from the release of pressure."],
["Processes","Root wedging","Roots growing in cracks and splitting rock (biological, counted as mechanical)."],
["Processes","Hydrolysis","Feldspar reacts with water/acid → clay + ions. Forms soils and releases nutrients."],
["Processes","Oxidation","Iron minerals → rust (hematite, goethite)."],
["Processes","Dissolution","Minerals dissolving, e.g. calcite in rainwater."],
["Processes","Erosion","Removal of weathered material from its original location by water, wind, ice or gravity."],
["Processes","Transport","Movement of sediment from the site of erosion to the site of deposition."],
["Processes","Sorting","Separation of grains by size, shape and density during transport."],
["Processes","Well sorted","Grains of very similar size (e.g. desert sand)."],
["Processes","Poorly sorted","A mix of many grain sizes (e.g. glacial, alluvial fan)."],
["Processes","Rounding","Grains become rounder and smoother by repeated abrasion."],
["Processes","Abrasion","Grinding and scraping of grains against each other."],
["Processes","Deposition (sedimentation)","Transported sediments come to rest and accumulate in layers."],
["Processes","Diagenesis","All physical, chemical and biological changes in sediment after deposition and before metamorphism."],
["Processes","Lithification","Making sediment into rock: compaction + cementation."],
["Processes","Compaction","Squeezing sediment together under the weight of new layers."],
["Processes","Cementation","Minerals glue grains together."],
["Processes","Recrystallisation","Crystals reorganise or grow larger during diagenesis."],
["Processes","Authigenesis","Growth of new minerals in sediment during diagenesis."],
["Processes","Biochemical alteration","Changes in sediment caused by microbes."],
["Environments","Depositional environment","The setting where sediment is deposited."],
["Environments","Terrestrial","On land (continental)."],
["Environments","Transitional","Where land meets sea."],
["Environments","Marine","In the sea."]
].concat(ENV.map(function(e){return ["Environments",e[0],e[1]+": "+e[2].charAt(0).toLowerCase()+e[2].slice(1)+"; "+e[3].charAt(0).toLowerCase()+e[3].slice(1)+"."]})).concat([
["Environments","Playa","Continental arid (evaporitic) basin."],
["Environments","Sabkha","Coastal evaporitic flat."],
["Environments","Ooze","Very fine deep-sea mud made of tiny siliceous or calcareous shells."],
["Environments","Ripple marks","Small wave-like ridges on sediment made by water or wind."],
["Rock groups","Clastic (terrigenous)","Rocks formed from fragments (clasts) of pre-existing rocks."],
["Rock groups","Chemical (chemogenic)","Rocks formed by precipitation of minerals from solution."],
["Rock groups","Biogenic (organic)","Rocks formed from organic materials: plants, algae, corals, microorganisms."],
["Rock groups","Clast","A fragment of a pre-existing rock or mineral."],
["Rock groups","Matrix","The finer material between larger clasts."],
["Rock groups","Precipitation","Minerals coming out of a solution as solid crystals."],
["Rock groups","Evaporation","Water turning to vapour, leaving dissolved minerals behind."],
["Rock groups","Grain size","Size of the clasts; used to name clastic rocks."],
["Rock groups","Angular","With sharp edges (short transport)."],
["Rock groups","Rounded","With smooth edges (long transport)."],
["Rock groups","Fissile","Breaking into thin planes (shale)."],
["Rock groups","Fossil","Remains or traces of a once-living organism in rock."]
]).concat(ROCKS.map(function(r){return ["Rocks",r.n,r.grp+". "+r.gs+". "+r.co+". "+r.en+"."]})).concat([
["Rocks","Chalk","Biogenic limestone from microscopic plankton. (recording)"],
["Rocks","Coquina","Biogenic limestone made mainly of shells. (recording)"],
["Rocks","Fossiliferous limestone","Limestone containing many fossils."]
]);
var VCON=[["Weathering","Erosion","Transport"],["Mechanical weathering","Frost wedging","Thermal expansion (insolation)","Onion-skin weathering","Exfoliation","Root wedging"],["Chemical weathering","Hydrolysis","Oxidation","Dissolution"],["Sorting","Well sorted","Poorly sorted"],["Rounding","Abrasion","Rounded","Angular"],["Diagenesis","Lithification","Compaction","Cementation","Recrystallisation","Authigenesis","Biochemical alteration"],["Playa","Sabkha","Evaporitic","Evaporite"],["Breccia","Conglomerate"],["Shale","Mudstone","Claystone","Siltstone","Fissile"],["Limestone","Biogenic limestone","Travertine","Chalk","Coquina","Fossiliferous limestone","Dolostone"],["Clastic (terrigenous)","Clast","Matrix"],["Chemical (chemogenic)","Precipitation","Evaporation"],["Terrestrial","Transitional","Marine"],["Deltaic","Tidal flat","Beach","Lagoon"],["Shallow marine","Deep marine","Ooze"],["Fluvial","Alluvial fan","Lacustrine"],["Aeolian","Glacial"],["Deposition (sedimentation)","Depositional environment"]];

var SHEET=[
 ["Processes",["Process","Facts"],[["Weathering","Breakdown in place at/near the surface; physical, chemical, biological"],["Mechanical","No change in composition: frost wedging, thermal expansion (onion skin), exfoliation (pressure release), biological (roots, burrowing) → angular, coarse, sharp fragments"],["Chemical","Water + acids, faster in warm wet climates: hydrolysis (feldspar → clay + ions), oxidation (Fe → rust), dissolution (calcite) → clay, ions"],["Erosion","Removal from the original place by water, wind, ice, gravity"],["Transport","Erosion site → deposition site; sorting, rounding, chemical alteration"],["Deposition","Sediment comes to rest in layers; water slows, wind drops, glacier melts, gravity stops"],["Diagenesis","After deposition, before metamorphism: lithification (compaction + cementation), recrystallisation, authigenesis, dissolution, biochemical alteration"]]],
 ["Environments",["Environment","Facts"],ENV.map(function(e){return [e[0]+" ("+e[1].toLowerCase()+")",e[2]+"; "+e[3]]})],
 ["Rock groups",["Group","Facts"],[["Clastic (terrigenous)","Fragments (clasts) of pre-existing rocks"],["Chemical (chemogenic)","Precipitation from solution"],["Biogenic (organic)","Plants, algae, corals, microorganisms"],["Field sign","Layers (beds); fossils"]]],
 ["Clastic grain sizes",["Rock","Grain size · setting"],[["Claystone","< 0.004 mm · lakes, deep marine, lagoons"],["Siltstone","0.004–0.0625 mm · deltas, floodplains"],["Shale / mudstone","< 0.0625 mm · lakes, deep marine, lagoons; shale is fissile"],["Sandstone","0.0625–2 mm · rivers, beaches, deserts"],["Breccia","> 2 mm, angular · talus slopes, debris flows"],["Conglomerate","> 2 mm, rounded · river channels, alluvial fans"]]],
 ["Chemical and biogenic",["Rock","Main component · environment"],[["Limestone","Calcite · warm shallow marine, lakes"],["Dolostone","Dolomite · altered limestones"],["Chert","Microcrystalline silica · deep marine, replacement"],["Evaporite","Halite, gypsum · arid basins, sabkhas"],["Travertine","Calcite · springs, caves (fresh water)"],["Coal","Plant carbon · swamps, peat wetlands"],["Biogenic limestone","Calcite with fossils · warm shallow marine (chalk, coquina, fossiliferous limestone)"]]]
];

function initAll(){
  GEO.order($("#chain"),["Weathering","Erosion","Transport","Deposition","Diagenesis"],{done:"Weathering breaks the rock in place, erosion removes it, transport carries it, deposition lets it settle in layers, diagenesis turns it into rock (lithification = compaction + cementation).",wrong:"Not next. Think: what has to happen first before anything can move?"});
  GEO.sorter($("#wsorter"),[["Frost wedging","m","Ice expanding in cracks."],["Hydrolysis","c","Feldspar → clay + ions."],["Root wedging","m","Biological, but it breaks the rock: mechanical."],["Oxidation","c","Iron minerals → rust."],["Exfoliation","m","Release of pressure."],["Dissolution","c","Calcite dissolves in rainwater."],["Thermal expansion (onion skin)","m","Heating and cooling."],["Burrowing animals","m","Biological activity breaking rock."]],[["m","Mechanical"],["c","Chemical"]]);
  var TD=[["At the source (0 km)","Very angular, sharp edges","Very poorly sorted: all sizes mixed","Breccia at a talus slope"],["Short (a few km, mountain stream)","Angular to subangular","Poorly sorted","Alluvial fan"],["Medium (river)","Subrounded","Moderately sorted","Fluvial sands and gravels"],["Long (big river to the coast)","Rounded","Well sorted","Beach sand, conglomerate pebbles"],["Very long (desert wind, many cycles)","Very well rounded","Very well sorted","Aeolian dune sand"]];
  function upT(){var v=+$("#tdist").value,r=TD[v];$("#tout").innerHTML='<div class="big">'+r[0]+'</div><div class="kv"><span>Grain shape</span><span>'+r[1]+'</span><span>Sorting</span><span>'+r[2]+'</span><span>Example</span><span>'+r[3]+'</span></div><p style="font-size:.85rem;color:var(--mute);margin:6px 0 0">A general picture (not exact numbers to learn): the longer the transport, the rounder and better sorted the grains.</p>'}
  $("#tdist").oninput=upT;upT();
  GEO.table($("#t-env"),["Environment","Group","Where","Sediment"],ENV.map(function(e){return [e[0],e[1],e[2],e[3]]}),1);
  var GK={Terrestrial:"te",Transitional:"tr",Marine:"ma"};GEO.sorter($("#envsorter"),ENV.filter(function(e,i){return [0,1,3,5,6,7,8,9,10,11].indexOf(i)>=0}).map(function(e){return [e[0],GK[e[1]],e[2]+"."]}),[["te","Terrestrial"],["tr","Transitional"],["ma","Marine"]]);
  var le=-1;GEO.drill($("#envdrill"),"envstreak",function(){var n;do{n=Math.floor(Math.random()*ENV.length)}while(n===le);le=n;var e=ENV[n];return {q:"Which environment: <b>"+esc(e[3])+"</b> ("+esc(e[2].toLowerCase())+")?",opts:shuffle([e[0]].concat(shuffle(ENV.filter(function(x){return x!==e}).map(function(x){return x[0]})).slice(0,3))),ans:e[0],fb:e[0]+" is "+e[1].toLowerCase()+"."}});
  GEO.sorter($("#gsorter"),[["Sandstone","cl","Fragments of older rocks."],["Rock salt (evaporite)","ch","Precipitated as water evaporated."],["Coal","bi","Compressed plant material."],["Conglomerate","cl","Rounded pebbles."],["Chert","ch","Microcrystalline silica."],["Coquina","bi","Shells."],["Shale","cl","Fine fragments, fissile."],["Travertine","ch","Calcite from springs."]],[["cl","Clastic"],["ch","Chemical"],["bi","Biogenic"]]);
  /* grain size slider: log 0.001 mm .. 100 mm */
  var shape="r";
  function upG(){var v=+$("#gsz").value,mm=Math.pow(10,-3+v/20),s=mm<0.01?mm.toFixed(4):mm<1?mm.toFixed(3):mm<10?mm.toFixed(1):Math.round(mm);
    var r,set;
    if(mm<0.004){r="Claystone (or mudstone / shale)";set="Lakes, deep marine, lagoons"}
    else if(mm<0.0625){r="Siltstone (or mudstone / shale)";set="Deltas, floodplains"}
    else if(mm<=2){r="Sandstone";set="Rivers, beaches, deserts"}
    else {r=shape==="r"?"Conglomerate":"Breccia";set=shape==="r"?"River channels, alluvial fans":"Talus slopes, debris flows"}
    $("#gszout").innerHTML='<div class="big">'+s+' mm</div><div class="kv"><span>Rock</span><span><b>'+r+'</b></span><span>Typical setting</span><span>'+set+'</span>'+(mm>2?'':'<span>Clast shape</span><span>Only matters above 2 mm</span>')+'</div>'}
  $("#gsz").oninput=upG;
  $("#shape").onclick=function(e){var b=e.target.closest("button");if(!b)return;shape=b.getAttribute("data-s");$$("#shape button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});upG()};
  upG();
  var CH=[["Limestone","Calcite","Warm shallow marine, lakes"],["Dolostone","Dolomite","Altered limestones"],["Chert","Microcrystalline silica","Deep marine, replacement"],["Evaporite","Halite, gypsum","Arid basins, sabkhas"],["Travertine","Calcite","Springs, caves (fresh water)"]],lc=-1;
  GEO.drill($("#chdrill"),"chstreak",function(){var n;do{n=Math.floor(Math.random()*10)}while(n===lc);lc=n;var c=CH[n%5],byEnv=n>=5;
    return {q:byEnv?"Which rock forms in: <b>"+c[2]+"</b>?":"Which rock is made mainly of <b>"+c[1]+"</b>"+(c[1]==="Calcite"?" and forms in <b>"+c[2].toLowerCase()+"</b>":"")+"?",opts:shuffle(CH.map(function(x){return x[0]})).slice(0,5),ans:c[0],fb:c[0]+": "+c[1]+" · "+c[2]+"."}});
}
STEPS[0].init=initAll;

GEO.register({
  id:"t4",num:4,title:"Sedimentary rocks",short:"Sedimentary",sub:"Lecture 4 · test 2 Nov (taken) + final exam",
  blurb:"Weathering, erosion, transport, deposition, diagenesis, 12 environments, clastic, chemical and biogenic rocks.",
  h1:"Sedimentary rocks, one step at a time",
  start:{lede:"You never need the slides: everything for the test is taught here, step by step. Everything in this lecture can be tested. The two class activities (grain sizes and chemical rocks) are the most test-like material.",
    plan:'<h3>First time, about 2 hours</h3><ol><li><b>Learn, step by step</b>: 9 steps with sorting games and sliders.</li><li><b>14 rock cards</b>: flip all, then "Which rock am I?" until 8 in a row.</li></ol><h3>Revision, 1 hour</h3><ol><li><b>Rocks &amp; places</b> tab: drill until 10 in a row.</li><li><b>Mock test</b> twice, then <b>Review</b>.</li></ol>',
    six:["Processes in order: <b>weathering → erosion → transport → deposition → diagenesis</b>.","<b>Mechanical</b> weathering breaks rock without changing it (frost, heat, pressure release, roots). <b>Chemical</b>: <b>hydrolysis</b> (feldspar → clay), oxidation, dissolution; faster when warm and wet.","Transport <b>sorts</b> and <b>rounds</b> grains; deposition happens when the agent <b>loses energy</b>; lithification = <b>compaction + cementation</b>.","Environments: terrestrial (fluvial, alluvial fan, glacial, aeolian, lacustrine, evaporitic: playa/sabkha), transitional (delta, beach, tidal flat, lagoon), marine (shallow, deep).","Clastic by grain size: <b>clay &lt; 0.004 &lt; silt &lt; 0.0625 &lt; sand &lt; 2 mm &lt; breccia (angular) / conglomerate (rounded)</b>; shale = fissile mudstone.","Chemical: <b>limestone (calcite), dolostone (dolomite), chert (silica), evaporite (halite, gypsum), travertine (springs)</b>. Biogenic: <b>coal, biogenic limestone</b> (chalk, coquina)."]},
  must:"processes, grain sizes and rock types",
  steps:STEPS,Q:Q,VOC:VOC,VCON:VCON,sheet:SHEET,
  cards:{tab:"14 rock cards",h1:"14 sedimentary rock cards",who:"Which rock am I?",labels:{gs:"Grain size / texture",co:"Made of",en:"Where it forms"},keys:["gs","co","en"],items:ROCKS},
  names:{tab:"Rocks & places",h1:"Rocks and environments: what you need",small:"Drill: grain sizes and environments",
    html:'<div class="card"><h2>Short answer</h2><p>You need all <b>14 rock names</b> with their grain size or main mineral and their environment, the <b>12 depositional environments</b>, and the names of the <b>processes</b>. The two class activities are the safest bet for test questions.</p><p>'+MUST+' tested facts &nbsp; '+NICE+' said in class</p></div><div class="card"><h2>Drill: grain sizes</h2><p>Streak: <b id="szstreak">0</b> (aim for 10).</p><div id="szdrill"></div></div>',
    tables:[
     {title:"Rocks",head:["Rock","Group","Grain size or main mineral","Where","Need it?"],rows:ROCKS.map(function(r){return [r.n,r.grp,r.gs,r.en,MUST]}).concat([["Chalk","Biogenic","Plankton (calcite)","Sea bed",NICE],["Coquina","Biogenic","Shells","Shallow marine",NICE],["Fossiliferous limestone","Biogenic","Calcite with fossils","Shallow marine",MUST]])},
     {title:"Environments",head:["Environment","Group","Sediment","Need it?"],rows:ENV.map(function(e){return [e[0],e[1],e[3],MUST]})},
     {title:"Minerals you meet here",head:["Mineral","Where","Need it?"],rows:[["Quartz","Sandstone, siltstone, mudstone; chert is microcrystalline silica",MUST],["Feldspar","Weathers to clay by hydrolysis",MUST],["Clay minerals (kaolinite, illite)","Claystone, mudstone, shale",MUST],["Calcite","Limestone, travertine, biogenic limestone",MUST],["Dolomite","Dolostone",MUST],["Halite, gypsum","Evaporites",MUST],["Hematite, goethite","Rust from oxidation",NICE]]}
    ],
    init:function(){
      var SZ=[["Claystone","< 0.004 mm"],["Siltstone","0.004–0.0625 mm"],["Shale / mudstone","< 0.004–0.0625 mm (clay and silt)"],["Sandstone","0.0625–2 mm"],["Breccia","> 2 mm, angular"],["Conglomerate","> 2 mm, rounded"]],ls=-1;
      GEO.drill($("#szdrill"),"szstreak",function(){var n;do{n=Math.floor(Math.random()*12)}while(n===ls);ls=n;var s=SZ[n%6],rev=n>=6;
        if(rev){var clash={"Claystone":["Shale / mudstone"],"Siltstone":["Shale / mudstone"],"Shale / mudstone":["Claystone","Siltstone"]}[s[0]]||[];var pool=SZ.filter(function(x){return x!==s&&clash.indexOf(x[0])<0}).map(function(x){return x[0]});return {q:"Which rock has grains of <b>"+s[1]+"</b>?",opts:shuffle([s[0]].concat(shuffle(pool).slice(0,3))),ans:s[0],fb:""}}
        var cl2={"Claystone":["Shale / mudstone"],"Siltstone":["Shale / mudstone"],"Shale / mudstone":["Claystone","Siltstone"]}[s[0]]||[];return {q:"What is the grain size of <b>"+s[0]+"</b>?",opts:shuffle([s[1]].concat(shuffle(SZ.filter(function(x){return x!==s&&cl2.indexOf(x[0])<0}).map(function(x){return x[1]})).slice(0,3))),ans:s[1],fb:""};});
    }},
  mastery:{facts:[[1,"Sedimentary means deposited and {lithified|melted|metamorphosed|crystallized from magma}."], [2,"Weathering is the breakdown of rocks and minerals {in place|after long transport|only underwater|only by magma}."], [2,"Mechanical weathering breaks rocks into smaller pieces without changing their {composition|size|shape|hardness}."], [2,"Frost wedging is caused by the expansion of {freezing water|salt|magma|clay} in cracks."], [2,"Exfoliation is caused by the release of {pressure|salt|acid|wind}."], [2,"Mechanical weathering produces {angular|rounded|dissolved|metamorphic} coarse fragments."], [2,"Chemical weathering is faster in {warm, wet|cold, dry|cold, wet|hot, dry} climates."], [2,"Hydrolysis turns feldspar into {clay and ions|rust|calcite|quartz}."], [2,"Oxidation turns iron minerals into rust, such as hematite or {goethite|galena|pyrite|magnetite}."], [2,"In rainwater, {calcite|quartz|zircon|garnet} dissolves."], [3,"Erosion is the {removal|burial|melting|crystallization} of weathered material from its original location."], [3,"The agents of erosion are water, wind, ice and {gravity|magma|heat|pressure}."], [3,"Wind erosion is also called {aeolian|glacial|fluvial|alluvial} erosion."], [3,"Transport is the movement of sediment from the site of erosion to the site of {deposition|weathering|melting|lithification}."], [3,"Sorting separates grains by size, shape and {density|colour|hardness|age}."], [3,"During transport, repeated abrasion makes grains more {rounded|angular|cemented|crystalline}."], [4,"Deposition (sedimentation) is the {end|start|middle|failure} of the transport stage."], [4,"Water deposits sediment when it {slows down|speeds up|freezes only|boils}."], [4,"Diagenesis covers all changes in sediments after deposition and before {metamorphism|weathering|erosion|transport}."], [4,"Lithification means compaction and {cementation|erosion|melting|weathering}."], [4,"Authigenesis is the growth of {new minerals|new glaciers|volcanoes|fossils only}."], [4,"In recrystallization, crystals reorganize or grow {larger|smaller|darker|softer}."], [5,"Fluvial sediments (rivers and streams) have {moderate|very poor|perfect|no} sorting."], [5,"Alluvial fans form at the base of {mountains|deltas|deserts|lakes} and are coarse and poorly sorted."], [5,"Glacial sediments are {very poorly sorted|very well sorted|perfectly rounded|fine only}."], [5,"Aeolian (wind-blown) desert sediments are very well {sorted|mixed|cemented|folded} rounded sand."], [5,"Lacustrine sediments form in {lakes|rivers|deserts|oceans}."], [5,"A playa is a continental evaporitic basin and a sabkha is a {coastal|glacial|deep marine|volcanic} one."], [5,"Deltas form where a river meets the {sea|desert|glacier|volcano} and have alternating sand and mud layers."], [5,"Beach sediments are well-sorted, {rounded|angular|poorly sorted|clay-rich} sand."], [5,"Tidal flats show alternating mud and sand with {ripple marks|columnar joints|foliation|pillows}."], [5,"A lagoon is a sheltered coastal area with {fine, quiet-water|coarse, poorly sorted|volcanic|glacial} sediments."], [5,"Deep marine sediments of the abyssal plain are very fine-grained muds and {siliceous or calcareous ooze|boulders|dunes|gravel}."], [6,"The three groups of sedimentary rocks are clastic, chemical and {biogenic|igneous|metamorphic|volcanic}."], [6,"Clastic rocks form from lithified {fragments (clasts)|precipitated minerals|plant material|lava}."], [6,"Chemical sedimentary rocks form by {precipitation|compaction of clasts|burial of plants|volcanism} of minerals from solution."], [6,"Biogenic rocks form from the accumulation of plants, algae, corals or {microorganisms|quartz|lava|clasts}."], [7,"Claystone has grains smaller than {0.004|0.0625|2|64} mm."], [7,"Siltstone grains are 0.004 to {0.0625|2|0.5|64} mm."], [7,"Sandstone grains are 0.0625 to {2|0.5|64|4} mm."], [7,"Conglomerate and breccia have grains larger than {2|0.0625|0.004|64} mm."], [7,"Conglomerate has {rounded|angular|microscopic|fibrous} clasts."], [7,"Breccia has {angular|rounded|microscopic|fibrous} clasts."], [7,"Conglomerate forms in river channels and {alluvial fans|abyssal plains|deserts|lagoons}."], [7,"Breccia forms on talus slopes and in {debris flows|deserts|abyssal plains|coral reefs}."], [7,"Sandstone is made mainly of {quartz|calcite|clay|halite}."], [7,"Shale is like mudstone but {fissile|massive|rounded|coarse}: it breaks in planes."], [7,"Claystone is made of clay minerals such as kaolinite and {illite|halite|calcite|garnet}."], [8,"Limestone consists mainly of {calcite|dolomite|halite|quartz}."], [8,"Limestone forms in warm, shallow {marine|glacial|desert|volcanic} settings."], [8,"Dolostone consists mainly of {dolomite|calcite|gypsum|quartz}."], [8,"Dolostone often forms by secondary alteration of {limestone|sandstone|shale|chert}."], [8,"Chert is made of {microcrystalline silica|calcite|halite|dolomite} and breaks with a conchoidal fracture."], [8,"Evaporites contain halite and {gypsum|calcite|quartz|chert}."], [8,"Evaporites form in arid basins such as playas and {sabkhas|deltas|reefs|glaciers}."], [8,"Travertine is made of {calcite|dolomite|silica|halite} and forms at springs and in caves."], [9,"Coal is made mostly of organic {carbon|calcium|silica|iron} from plant material."], [9,"Coal forms in swamps and peat-forming {wetlands|deserts|glaciers|reefs}."], [9,"Biogenic limestone contains abundant {fossils|quartz|garnet|halite}."], [9,"Types of biogenic limestone include chalk, coquina and {fossiliferous limestone|granite|slate|marble}."]]},
  foot:"Sources: lecture 4 slides \"Sedimentary rocks and processes\" (Mgr. Václav Santolík, PhD, CZU) and your Wispr recording of 26 Oct. Lines marked \"recording\" were said in class. The recording is poor in places (\"sacra\" = sabkha, \"mining\" = diagenesis), so the slide wording is used."
});
})();
