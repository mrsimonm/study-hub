/* Lecture 5: Metamorphic rocks and processes (ported from the Metamorphic Rocks Walkthrough page) */
(function(){"use strict";
var $=GEO.$,$$=GEO.$$,shuffle=GEO.shuffle,esc=GEO.esc;

var STEPS=[
{t:"5 min",title:"What metamorphism is",html:`
<div class="box idea"><b>The idea</b>Metamorphic means <b>changed</b>. A rock is buried or squeezed, the temperature and pressure change, and its minerals change into new ones <b>while it stays solid</b>. Petrology is the study of rocks and how they form.</div>
<p class="big">Three key aspects control it:</p>
<ol><li><b>Protolith</b>: the original (parent) rock</li><li><b>Temperature</b></li><li><b>Pressure</b></li></ol>
<p>Helpers: <b>time</b> and <b>fluids</b>.</p>
<p>The protolith can be <b>virtually any rock</b>: basalt, gabbro, granite, tonalite, sandstone, limestone, mudstone, or even another metamorphic rock. That's why there are so many metamorphic rock types.</p>
<div class="box ana"><b>Analogy</b>Baking bread. The protolith is the dough, temperature is the oven, pressure is how hard you squash it. Different dough in the same oven gives different bread.</div>
<div class="box teach"><b>Teacher said</b>He opened by asking "what are the three key aspects forming a metamorphic rock?" Expect that exact question.</div>
<div class="chk" data-q="m2"></div>
<div class="chk" data-q="m3"></div>`},
{t:"10 min",title:"Where the pressure comes from",html:`
<div class="box idea"><b>The idea</b>Two ways to raise pressure: <b>burial</b> (piling more layers on top) and <b>tectonics</b> (plates pushing rocks deeper).</div>
<h3>1. Burial processes</h3>
<ul><li>New layers of sediment accumulate on top.</li><li>The weight of the overlying layers raises the <b>confining, lithostatic pressure</b>.</li><li>Lithostatic pressure is <b>equal in all directions</b>.</li><li>Metamorphic reactions begin at depths of about <b>2 km</b>.</li></ul>
<h3>2. Tectonic processes</h3>
<ul><li>Crustal thickening during <b>orogeny</b> (mountain building).</li><li>Rocks are dragged deeper into the Earth.</li><li>Adds lithostatic pressure <b>plus directed pressure and shear stress</b>.</li></ul>
<div class="box ana"><b>Analogy</b>Lithostatic pressure is a diver deep underwater: squeezed equally from every side. Directed pressure is a sponge squeezed between two hands: harder in one direction. Shear is sliding the top of a deck of cards sideways.</div>
<div class="box teach"><b>Teacher said</b>Tectonic dragging is "the most significant" way pressure increases.</div>
<div class="box trap"><b>Exam trap</b>Burial gives mostly <b>lithostatic</b> pressure (equal all round). <b>Directed</b> pressure and <b>shear</b> come from <b>tectonics</b>. Directed pressure is what makes layered (foliated) rocks in step 5.</div>
<div class="chk" data-q="m5"></div>
<div class="chk" data-q="m7"></div>`},
{t:"5 min",title:"Where the heat comes from",html:`
<div class="box idea"><b>The idea</b>Two heat sources: going <b>deeper</b> (the geothermal gradient) or a <b>magma intrusion</b> heating the rock next to it.</div>
<h3>1. Geothermal gradient</h3>
<p>Temperature rises with depth, roughly <b>25 to 30 °C per kilometre</b> on average.</p>
<label for="depth">Drag the depth: <b id="depthv"></b></label>
<input type="range" id="depth" min="0" max="30" step="1" value="10">
<div class="out" id="depthout"></div>
<h3>2. Magma intrusion</h3>
<ul><li>Magma transfers heat into the surrounding rocks.</li><li>This local heating makes a <b>"baked zone"</b> around the intrusion called the <b>(contact) aureole</b>.</li><li>Rock closest to the magma gets hottest <span class="chip">recording</span></li></ul>
<div class="box ana"><b>Analogy</b>A hot stone dropped into cake batter: a ring of baked cake forms around it. That ring is the aureole.</div>
<div class="box trap"><b>Exam trap</b>Aureole heating is <b>heat without directed pressure</b>. Remember that for hornfels in step 5.</div>
<div class="chk" data-q="m8"></div>
<div class="chk" data-q="m9"></div>`},
{t:"10 min",title:"Reactions and grade",html:`
<div class="box idea"><b>The principle of metamorphism</b>Different phases are stable at different PT (pressure–temperature) conditions. When PT changes, the phase changes.</div>
<ul><li><b>H₂O system:</b> solid, liquid and gas. Each is stable at different PT.</li><li><b>SiO₂ system:</b> a solid compound can have <b>several solid phases</b> (quartz at the surface, other crystal structures at higher P or T).</li><li>In rocks, minerals react and turn into new minerals <b>in the solid state</b>.</li></ul>
<div class="box ana"><b>Analogy</b>Water is ice, liquid or steam depending on PT. Minerals do the same, just with many more "costumes" and without melting.</div>
<h3>Reaction examples</h3>
<ul><li>Clay minerals (smectite + kaolinite) + water → <b>chlorite</b> + quartz</li><li>Chlorite + muscovite → <b>biotite</b> + quartz + kyanite + <b>water</b></li></ul>
<div class="box skip"><b>Don't memorise</b>The teacher said you don't need the phase diagrams or these formulas. Only the principle: new PT gives new minerals. Which mineral and rock names you <i>do</i> need: see the <b>Minerals &amp; rocks</b> tab.</div>
<h3>Metamorphic grade</h3>
<ul><li>Grade = <b>the degree of metamorphism</b>.</li><li>It <b>reflects the PT conditions</b>.</li><li>It is <b>determined by the minerals present</b>.</li><li>Three grades: <b>low, medium, high</b> <span class="chip">recording</span></li></ul>
<h3>Extra from the lecture <span class="chip">recording</span></h3>
<ul><li>Released water acts like a <b>catalyst</b> for the reactions.</li><li>Extra SiO₂ moves through the rock and forms <b>quartz veins</b>.</li><li><b>Retrograde metamorphism</b>: if a rock comes back up slowly, new reactions happen at the lower PT.</li><li>Time needed: roughly <b>100,000 to a million years</b> (faster with fluids).</li></ul>
<div class="chk" data-q="m10"></div>
<div class="chk" data-q="m11"></div>`},
{t:"15 min",title:"Textures: foliated or non-foliated",html:`
<h3>1. Foliated texture (layers)</h3>
<ul><li>Grains get <b>deformed</b> and atoms <b>migrate</b>.</li><li>New minerals grow <b>in the direction of weakest pressure</b>.</li><li>The rock looks <b>layered</b> and <b>breaks apart between the layers</b>.</li></ul>
<div class="box ana"><b>Analogy</b>Squeeze a pile of pencils from both sides and they all lie down across the squeeze. Minerals line up the same way.</div>
<p class="big">Foliation types, lowest grade to highest:</p>
<div class="tw"><table><thead><tr><th>Foliation</th><th>Rock</th><th>Looks like</th></tr></thead><tbody>
<tr><td><b>Slaty cleavage</b></td><td>Slate</td><td>Splits into neat flat sheets</td></tr>
<tr><td><b>Phyllitic foliation</b></td><td>Phyllite</td><td>Wavier, with a silky sheen</td></tr>
<tr><td><b>Schistose foliation</b></td><td>Schist</td><td>Wavy and messy, garnet crystals</td></tr>
<tr><td><b>Gneissic banding</b></td><td>Gneiss</td><td>Light and dark bands</td></tr></tbody></table></div>
<h3>2. Non-foliated texture (no layers)</h3>
<p>There are two reasons a metamorphic rock has no layers:</p>
<ol><li><b>No directed pressure.</b> Typical of contact metamorphism, which gives <b>hornfels</b>.</li><li><b>No sheet minerals.</b> Typical of limestone and sandstone, which give <b>marble</b> and <b>quartzite</b>.</li></ol>
<div class="box teach"><b>Teacher said</b>About hornfels: "don't forget about this one, it's very special."</div>
<div class="box trap"><b>Exam trap</b>Hornfels, marble and quartzite are all non-foliated, but for <b>different reasons</b>. Hornfels lacks directed pressure. Marble and quartzite lack sheet minerals.</div>
<h3>Sort them: foliated or not?</h3>
<div id="fsorter"></div>
<div class="chk" data-q="m13"></div>
<div class="chk" data-q="m45"></div>
<div class="chk" data-q="m15"></div>`},
{t:"15 min",title:"Metasedimentary rocks",html:`
<h3>Metapelitic rocks: the mud ladder</h3>
<p>"Pelitic" means from fine mud. <b>Teacher said: "these are the rocks I want you to know."</b></p>
<div class="ladder" id="ladbar"></div>
<input type="range" id="ladder" min="0" max="6" step="1" value="0" aria-label="Grade step on the mud ladder">
<div class="out" id="ladderout"></div>
<div class="box ana"><b>Memory trick</b><b>M</b>y <b>S</b>ister <b>S</b>ings <b>P</b>op <b>S</b>ongs <b>G</b>reat <b>M</b>orning: Mudstone, Shale, Slate, Phyllite, Schist, Gneiss, Migmatite.</div>
<div class="box trap"><b>Exam trap</b><b>Shale is still sedimentary.</b> Slate is the first metamorphic rock. Migmatite is <b>partial</b> melting, not a fully melted igneous rock.</div>
<h3>Metapsammitic: sandstone → quartzite</h3>
<h3>Metacalcareous: limestone → marble</h3>
<div class="box idea"><b>Why only one step?</b>Sandstone is almost all quartz and limestone is almost all calcite. Both minerals are <b>stable</b>, so the grains only recrystallise into interlocking crystals. No new minerals form, so there is no ladder.</div>
<div class="box teach"><b>Teacher said</b>He asked the class exactly this: "why don't we have a series like in the metapelitic rocks?" Answer: it's mostly quartz, which is stable.</div>
<h3>Extras from the lecture <span class="chip">recording</span></h3>
<ul><li>Coal: brown coal → black coal → <b>anthracite</b> (the shiny kind).</li><li>Chert recrystallises into something like quartzite. Travertine and all limestones become marble.</li><li>From the 15 Oct practical: slate is grey or black, phyllite is green because of chlorite. Slate is used for roofs and wall tiles (Můstek metro station). Schist and migmatite can have big red garnets.</li></ul>
<div class="chk" data-q="m20"></div>
<div class="chk" data-q="m19"></div>`},
{t:"20 min",title:"Metaigneous rocks, facies and series",html:`
<p>This is the hardest step. Take it slowly.</p>
<h3>Facies</h3>
<ul><li><b>Metabasaltic rocks define the metamorphic facies.</b></li><li>A facies is an <b>objective description based on its defining mineral assemblages</b>.</li><li>Each facies is characteristic of <b>certain PT conditions</b>.</li></ul>
<h3>Series</h3>
<ul><li>A series is <b>a trend of metamorphism characteristic of a certain geologic environment</b>.</li><li>Each series <b>extends across multiple facies</b>.</li></ul>
<div class="box ana"><b>Analogy</b>Facies are <b>rooms</b> on a map of pressure and temperature. A series is a <b>corridor</b> that walks through several rooms. Each corridor belongs to a place on Earth.</div>
<div class="tw"><table><thead><tr><th>Series</th><th>Setting</th><th>Facies / rocks</th></tr></thead><tbody>
<tr><td><b>Low P/T (1)</b></td><td>Contact metamorphism, around intrusions, upper crust</td><td><b>Hornfels</b></td></tr>
<tr><td><b>Medium P/T (3)</b></td><td>Regional = orogenic = mountain-belt metamorphism (Barrovian)</td><td><b>Greenschist → amphibolite → granulite</b></td></tr>
<tr><td><b>High P/T (5)</b></td><td>Subduction-zone metamorphism</td><td><b>Blueschist → eclogite</b></td></tr></tbody></table></div>
<p>Tap a series, then tap a facies box. The map is a sketch to show the logic, not the exact lecture diagram.</p>
<div class="seg" id="serseg" role="group" aria-label="Series"><button data-s="1" aria-pressed="false">1 Low P/T</button><button data-s="3" aria-pressed="false">3 Medium P/T</button><button data-s="5" aria-pressed="false">5 High P/T</button></div>
<div id="ptholder" style="margin-top:8px"></div>
<div class="out" id="ptout"><b>Tap a facies box</b> to see its conditions and rocks.</div>
<div class="box idea"><b>Why does subduction give high P but low T?</b>The cold ocean plate dives down fast. Pressure rises quickly with depth, but the plate doesn't have time to heat up. <span class="chip">recording</span></div>
<div class="box teach"><b>Teacher said</b>Greenschist is the first "proper" metamorphic rock you can recognise by eye. The full facies list he named: zeolite, prehnite–pumpellyite, greenschist, amphibolite, granulite, hornfels, blueschist, eclogite. Blueschist and eclogite are rarer at the surface. <span class="chip">recording</span></div>
<h3>Other metaigneous rocks</h3>
<div class="tw"><table><thead><tr><th>Group</th><th>Protolith (igneous)</th><th>Metamorphic rock</th></tr></thead><tbody>
<tr><td>Metagranitic</td><td>Granite, granodiorite or tonalite</td><td><b>(Ortho)gneiss</b></td></tr>
<tr><td>Metarhyolitic</td><td>Rhyolite, dacite</td><td>Metarhyolite / metadacite (low) → <b>felsic schist</b> (medium) → <b>felsic gneiss</b> (high)</td></tr>
<tr><td>Metaultramafic</td><td>Peridotite</td><td><b>Serpentinite</b></td></tr></tbody></table></div>
<div class="box idea"><b>Why does granite barely change?</b>Granite is mostly quartz and feldspar, which are stable. The minerals mostly just <b>line up into bands</b> under directed pressure. <span class="chip">recording</span></div>
<div class="box trap"><b>Exam trap</b><b>Ortho</b>gneiss = from an <b>igneous</b> rock (granite). <b>Para</b>gneiss = from a <b>sedimentary</b> rock (mudstone, shale). Same rock look, different parent.</div>
<div class="box trap"><b>Exam trap</b><b>Greenschist</b> has "schist" in the name but its protolith is <b>basalt</b>, not mud.</div>
<div class="chk" data-q="m34"></div>
<div class="chk" data-q="m36"></div>
<div class="chk" data-q="m27"></div>`},
{t:"5 min",title:"The rock cycle",html:`
<div class="box idea"><b>The idea</b>The three rock families keep turning into each other. Material gets recycled over Earth's history.</div>
<ol><li><b>Magma</b> cools and crystallises → <b>igneous rock</b></li><li>Igneous rock <b>weathers</b> at the surface → <b>sediment</b></li><li>Sediment is deposited and compacted → <b>sedimentary rock</b></li><li>Sedimentary rock is dragged into the Earth, heat and pressure → <b>metamorphic rock</b></li><li>Metamorphic rock <b>melts</b> → <b>magma</b> again</li></ol>
<p>Shortcuts: metamorphic rock brought up can <b>weather</b> into sediment. Igneous rock can be <b>metamorphosed</b> directly.</p>
<h3>Walk the cycle yourself</h3>
<div class="out"><div class="walk-now" id="walknow"></div><div class="opts" id="walkopts" style="margin-top:8px"></div><div class="trail" id="trail"></div></div>
<button class="ghost" id="walkreset" style="margin-top:8px">Start again</button>
<div class="chk" data-q="m39"></div>`},
{t:"20 min",title:"The 10 rock cards",html:`
<div class="box teach"><b>Teacher said</b>"These are the rocks I want you to understand and be able to recognise." Your sedimentary test asked for exactly this kind of fact (grain size per rock), so these cards are the most likely test material.</div>
<p>For each rock, know four things: <b>protolith, grade, texture, minerals</b>.</p>
<div class="row" style="margin:8px 0"><button class="ghost" data-toggle="hide" data-target="t-cards">Test myself (blur answers)</button></div>
<div class="tw" id="t-cards"></div>
<div class="box trap"><b>Watch out</b>One table calls phyllite "low-grade", but its card says "low to medium". If asked, low-grade is the safer answer. Eclogite's texture "granoblastic" isn't explained in the lecture: just link the word to eclogite.</div>
<div class="chk" data-q="m30"></div>
<div class="chk" data-q="m28"></div>`}
];

var Q=[
{id:"m1",q:"What does \"metamorphic\" mean?",h:"Meta = change, morph = form.",o:["Changed","Melted","Deposited","Crystallised from magma"],e:"Metamorphic = changed. The rock changes in the solid state."},
{id:"m2",fol:1,q:"What are the three key aspects controlling metamorphism?",h:"The original rock, plus two conditions.",o:["Protolith, temperature, pressure","Magma, water, time","Weathering, transport, deposition","Foliation, cleavage, banding"],e:"Protolith (original rock), temperature and pressure. Time and fluids help."},
{id:"m3",q:"What is a protolith?",h:"Proto = first.",o:["The original (parent) rock before metamorphism","A newly grown metamorphic mineral","A type of metamorphic facies","The pressure from overlying rock"],e:"The protolith is the parent rock. It can be virtually any rock."},
{id:"m4",q:"Which rocks can be a protolith?",h:"Basalt, granite, sandstone, limestone and mudstone can all be one.",o:["Virtually any rock","Only sedimentary rocks","Only igneous rocks","Only mudstone"],e:"Basalt, gabbro, granite, tonalite, sandstone, limestone, mudstone... any rock can be metamorphosed."},
{id:"m5",q:"Lithostatic (confining) pressure is:",h:"The weight of what's above.",o:["Pressure from overlying layers, equal in all directions","Pressure that is higher in one direction","Pressure from plates sliding past each other","Pressure caused by magma heat"],e:"Burial gives lithostatic pressure, equal in all directions. One-direction pressure is directed pressure."},
{id:"m6",q:"At roughly what depth do metamorphic reactions begin?",h:"A small number of kilometres.",o:["About 2 km","About 200 m","About 20 km","About 200 km"],e:"When rocks are buried, reactions begin at depths of about 2 km."},
{id:"m7",q:"Which process adds directed pressure and shear stress?",h:"Mountain building.",o:["Tectonic processes (crustal thickening during orogeny)","Burial by new sediment","Weathering","Cooling of lava"],e:"Tectonics drags rocks deeper and adds directed pressure and shear on top of lithostatic pressure."},
{id:"m8",q:"The average geothermal gradient is roughly:",h:"Tens of degrees per kilometre.",o:["25–30 °C per km","2–3 °C per km","250–300 °C per km","25–30 °C per metre"],e:"Temperature rises about 25–30 °C for each km of depth."},
{id:"m9",q:"What is the baked zone around a magma intrusion called?",h:"A halo around the magma.",o:["Aureole","Facies","Protolith","Foliation"],e:"Magma heats the surrounding rock, making a baked zone or (contact) aureole."},
{id:"m10",y:1,q:"What is the principle of metamorphism?",h:"Think of ice, water, steam.",o:["Different phases are stable at different PT conditions, so a PT change causes a phase change","Rocks melt completely and recrystallise from the melt","Minerals dissolve in rain and redeposit","Rocks change only through weathering at the surface"],e:"New pressure and temperature make new minerals stable, in the solid state."},
{id:"m11",q:"Metamorphic grade is determined by:",h:"What do you see inside the rock?",o:["The minerals present","The colour of the protolith","The size of the outcrop","The age of the rock"],e:"Grade = degree of metamorphism. It reflects PT and is determined by the minerals present."},
{id:"m12",q:"Which SiO₂ fact did the lecture use to explain metamorphism?",h:"One compound, several solid forms.",o:["A solid compound can have multiple solid phases","SiO₂ never changes structure","SiO₂ is only stable as a liquid","SiO₂ only exists as glass"],e:"SiO₂ is quartz at the surface but has other crystal structures at other PT conditions."},
{id:"m13",fol:1,q:"In a foliated rock, new minerals grow:",h:"They escape the squeeze.",o:["In the direction of weakest pressure","In the direction of strongest pressure","Randomly in all directions","Only around garnet"],e:"Grains deform, atoms migrate and new minerals grow toward the weakest pressure, which gives layers."},
{id:"m14",fol:1,q:"Which is the correct order of foliation, from lowest to highest grade?",h:"Sheets, sheen, wavy, bands.",o:["Slaty cleavage → phyllitic → schistose → gneissic banding","Phyllitic → slaty cleavage → gneissic banding → schistose","Gneissic banding → schistose → phyllitic → slaty cleavage","Schistose → slaty cleavage → phyllitic → gneissic banding"],e:"Slate → phyllite → schist → gneiss, with their matching foliation types."},
{id:"m15",fol:1,y:1,q:"Why are some metamorphic rocks non-foliated?",h:"There are two reasons.",o:["No directed pressure (contact metamorphism) or no sheet minerals (limestone, sandstone)","They cooled too fast at the surface","They were deposited in still water","They contain too much mica"],e:"Hornfels: no directed pressure. Marble and quartzite: no sheet minerals."},
{id:"m16",fol:1,q:"Hornfels forms by:",h:"Heat without squeezing.",o:["Contact metamorphism near an intrusion","Subduction at very high pressure","Regional metamorphism in mountain belts","Weathering of granite"],e:"Hornfels is non-foliated, in the low P/T series."},
{id:"m17",q:"What is the protolith of marble?",h:"A calcite rock.",o:["Limestone or dolostone","Sandstone","Basalt","Shale"],e:"Metacalcareous: limestone → marble. Minerals calcite, dolomite."},
{id:"m18",q:"What is the protolith of quartzite?",h:"A quartz-rich sedimentary rock.",o:["Sandstone","Limestone","Mudstone","Granite"],e:"Metapsammitic: sandstone → quartzite."},
{id:"m19",y:1,q:"Why does sandstone become only quartzite, with no series of rocks in between?",h:"What is sandstone made of?",o:["It is almost all quartz, which is stable, so it only recrystallises","Sandstone can't be buried deep enough","Quartz melts at low temperature","Sandstone has too much clay"],e:"Quartz stays stable, so the grains just recrystallise into interlocking crystals."},
{id:"m20",q:"Which is the correct metapelitic series?",h:"Start sedimentary, end with partial melting.",o:["Mudstone → shale → slate → phyllite → schist → gneiss → migmatite","Mudstone → slate → shale → schist → phyllite → gneiss → migmatite","Shale → mudstone → phyllite → slate → gneiss → schist → migmatite","Slate → phyllite → gneiss → schist → shale → mudstone → migmatite"],e:"My Sister Sings Pop Songs Great Morning."},
{id:"m21",q:"In the metapelitic series, shale is:",h:"Before the metamorphic grades start.",o:["Still a sedimentary rock","A low-grade metamorphic rock","A high-grade metamorphic rock","An igneous rock"],e:"Mudstone and shale are sedimentary. Slate is the first metamorphic rock."},
{id:"m22",q:"What does migmatite show?",h:"The top of the ladder.",o:["Partial melting","Contact metamorphism","Low-grade metamorphism","Weathering"],e:"Migmatite = partial melting: remains of gneiss plus veins of melted material."},
{id:"m23",fol:1,q:"Slate: what is its grade and texture?",h:"First metamorphic step.",o:["Low grade, foliated with slaty cleavage","High grade, gneissic banding","Medium grade, schistosity","Low grade, non-foliated"],e:"Slate: protolith mudstone or shale, low grade, slaty cleavage, minerals mica, chlorite, quartz, feldspar."},
{id:"m24",q:"Which mineral appears in schist on its rock card but not in slate or phyllite?",h:"Red, round crystals.",o:["Garnet","Chlorite","Calcite","Olivine"],e:"Schist: mica, quartz, feldspar, garnet. Medium grade."},
{id:"m25",q:"Paragneiss: grade and texture?",h:"Top of the mud ladder, before melting.",o:["High grade, foliated and banded","Low grade, slaty cleavage","Medium grade, non-foliated","Low grade, phyllitic sheen"],e:"Paragneiss: protolith shale or mudstone, high grade, banded, minerals quartz, feldspar, mica, amphibole."},
{id:"m26",q:"What is the protolith of orthogneiss?",h:"Ortho = igneous parent.",o:["Granite, granodiorite or tonalite","Shale or mudstone","Limestone","Peridotite"],e:"Metagranitic rocks: granite, granodiorite or tonalite → orthogneiss (high grade, banded)."},
{id:"m27",q:"What is the difference between orthogneiss and paragneiss?",h:"Look at the parent rock.",o:["Ortho comes from an igneous protolith, para from a sedimentary one","Ortho is low grade, para is high grade","Ortho is non-foliated, para is foliated","There is no difference"],e:"Orthogneiss from granite-type rocks, paragneiss from mudstone or shale."},
{id:"m28",q:"What is the protolith of greenschist?",h:"Despite the name, not mud.",o:["Basalt","Shale","Limestone","Sandstone"],e:"Greenschist: basalt, low to medium grade, chlorite, actinolite, epidote, albite."},
{id:"m29",q:"Which minerals define greenschist?",h:"Green ones.",o:["Chlorite, actinolite (green amphibole), epidote, albite","Garnet and omphacite","Calcite and dolomite","Olivine and pyroxene"],e:"Those four green-ish minerals give greenschist its colour."},
{id:"m30",q:"Which minerals make up eclogite?",h:"One red, one green.",o:["Garnet and omphacite (green pyroxene)","Chlorite and albite","Quartz only","Calcite and dolomite"],e:"Eclogite: basalt or gabbro protolith, high grade (high pressure), granoblastic texture."},
{id:"m31",q:"Amphibolite: protolith and minerals?",h:"Named after its main mineral.",o:["Basalt or gabbro; amphibole, plagioclase, epidote, garnet","Shale; mica, chlorite, quartz","Granite; quartz, feldspar, mica","Limestone; calcite, dolomite"],e:"Amphibolite: medium to high grade, foliated and banded."},
{id:"m32",q:"What is a metamorphic facies?",h:"Defined by minerals.",o:["An objective description based on defining mineral assemblages, typical of certain PT conditions","A trend of metamorphism typical of one geologic environment","The original rock","A type of foliation"],e:"Facies = mineral assemblage = certain PT. A series is the trend across several facies."},
{id:"m33",q:"What is a metamorphic series?",h:"A trend through several rooms.",o:["A trend of metamorphism characteristic of a geologic environment, across multiple facies","A single mineral assemblage","The order of foliation types","A list of protoliths"],e:"Series: low P/T (contact), medium P/T (regional), high P/T (subduction)."},
{id:"m34",q:"Which series is typical of contact metamorphism?",h:"Hornfels.",o:["Low P/T series","Medium P/T series","High P/T series","None, contact metamorphism has no series"],e:"Low P/T (series 1) = contact = hornfels."},
{id:"m35",q:"Greenschist → amphibolite → granulite belongs to which setting?",h:"Regional, also called Barrovian.",o:["Mountain belts (regional, orogenic), medium P/T","Subduction zones, high P/T","Contact aureoles, low P/T","Mid-ocean ridges, no metamorphism"],e:"Medium P/T (series 3) = regional = orogenic = mountain-belt metamorphism."},
{id:"m36",q:"Blueschist and eclogite form in which setting?",h:"Pressure rises faster than temperature.",o:["Subduction zones (high P/T)","Contact aureoles (low P/T)","Mountain belts (medium P/T)","Deserts"],e:"High P/T (series 5) = subduction-zone metamorphism."},
{id:"m37",q:"Peridotite metamorphoses into:",h:"Sounds like a snake.",o:["Serpentinite","Marble","Quartzite","Amphibolite"],e:"Metaultramafic: peridotite → serpentinite."},
{id:"m38",q:"Rhyolite at medium grade becomes:",h:"Metarhyolitic series.",o:["Felsic schist","Serpentinite","Eclogite","Marble"],e:"Rhyolite/dacite → metarhyolite/metadacite (low) → felsic schist (medium) → felsic gneiss (high)."},
{id:"m39",q:"In the rock cycle, a metamorphic rock that melts becomes:",h:"Hot and liquid.",o:["Magma","Sediment","Sedimentary rock","Hornfels"],e:"Melting gives magma, which crystallises into igneous rock."},
{id:"m40",q:"What is the high-grade metamorphic form of coal?",h:"The shiny one.",o:["Anthracite","Brown coal","Graphite slate","Chert"],e:"From the lecture: brown coal → black coal → anthracite."},
{id:"m41",fol:1,q:"Which rock is NOT foliated?",h:"Which one has no sheet minerals?",o:["Marble","Slate","Schist","Paragneiss"],e:"Marble is non-foliated, crystalline calcite."},
{id:"m42",q:"What grade is greenschist?",h:"Lower end of the regional series.",o:["Low to medium","High (high pressure)","Only very high","It isn't metamorphic"],e:"Greenschist card: low to medium grade."},
{id:"m43",y:1,q:"Why do blueschist and eclogite form at high pressure but relatively low temperature?",h:"Think about the diving plate.",o:["The subducting plate goes down fast and stays cool while pressure rises","Magma heats them strongly","They form at the surface","Burial is very slow there"],e:"In subduction the descending plate keeps its low temperature while pressure increases quickly."},
{id:"m44",q:"Which rocks define the metamorphic facies?",h:"Meta + a dark volcanic rock.",o:["Metabasaltic rocks","Metapelitic rocks","Metacalcareous rocks","Metapsammitic rocks"],e:"Metabasaltic rocks (metamorphosed basalt) define the metamorphic facies."},
{id:"m45",fol:1,q:"Which rock has phyllitic foliation (a wavy, silky sheen)?",h:"Between slate and schist.",o:["Phyllite","Slate","Gneiss","Marble"],e:"Phyllitic foliation belongs to phyllite: wavier than slate, with a silky sheen."},
{id:"m46",fol:1,q:"Which rock shows gneissic banding?",h:"Light and dark bands.",o:["Gneiss","Slate","Phyllite","Quartzite"],e:"Gneissic banding is the highest-grade foliation: light and dark bands."},
{id:"m47",fol:1,q:"What does slaty cleavage look like?",h:"The lowest-grade foliation.",o:["The rock splits into neat flat sheets","Light and dark bands","Wavy and messy with garnet crystals","Interlocking crystals with no layers"],e:"Slaty cleavage (slate): the rock splits into flat sheets."},
{id:"m48",fol:1,q:"Which foliation type belongs to schist?",h:"The name sounds like the rock.",o:["Schistose foliation (schistosity)","Slaty cleavage","Gneissic banding","Phyllitic foliation"],e:"Schist has schistose foliation: wavy, messy layers, often with garnet."},
{id:"m49",fol:1,q:"Which foliation type is the HIGHEST grade?",h:"The bands.",o:["Gneissic banding","Slaty cleavage","Phyllitic foliation","Schistose foliation"],e:"Order: slaty cleavage → phyllitic → schistose → gneissic banding."},
{id:"m50",fol:1,q:"Which rock is non-foliated because it formed WITHOUT directed pressure?",h:"Contact metamorphism.",o:["Hornfels","Slate","Schist","Gneiss"],e:"Hornfels forms in the contact aureole: heat but no directed pressure, so no layers."},
{id:"m51",fol:1,y:1,q:"Why are marble and quartzite non-foliated?",h:"What minerals are needed for layers?",o:["Their protoliths have no sheet minerals (almost only calcite or quartz)","They formed without any heat","They formed at the surface","They are igneous rocks"],e:"Limestone and sandstone lack sheet minerals like mica and chlorite, so marble and quartzite get interlocking crystals instead of layers."},
{id:"m52",fol:1,q:"Where does a foliated rock usually break?",h:"Think of slate roof tiles.",o:["Apart between the layers","Randomly in every direction","Only across the layers","It never breaks"],e:"Foliation gives a layered look and the rock breaks apart between the layers."},
{id:"m53",fol:1,q:"What happens to grains when a foliated texture forms?",h:"Two processes: one to grains, one to atoms.",o:["Grains are deformed and atoms migrate","Grains melt completely","Grains are weathered and transported","Grains dissolve in rainwater"],e:"Deformation of grains plus migration of atoms; new minerals grow toward the weakest pressure."},
{id:"m54",fol:1,q:"Which of these rocks is foliated?",h:"Look for 'slaty or schistose'.",o:["Greenschist","Marble","Quartzite","Hornfels"],e:"Greenschist is foliated (slaty or schistose). Marble, quartzite and hornfels are non-foliated."},
{id:"m55",fol:1,q:"Which of these rocks is non-foliated?",h:"Made almost only of quartz.",o:["Quartzite","Slate","Phyllite","Gneiss"],e:"Quartzite: interlocking quartz crystals, no layers."},
{id:"m56",fol:1,q:"Which two things does a rock need to become foliated?",h:"A force and a mineral type.",o:["Directed pressure and sheet minerals","Only high temperature","Water and acid","Rapid cooling at the surface"],e:"Without directed pressure (hornfels) or without sheet minerals (marble, quartzite) there are no layers."},
{id:"m57",q:"Which rock forms by partial melting at the top of the mud ladder?",h:"Mixed rock.",o:["Migmatite","Hornfels","Eclogite","Phyllite"],e:"Migmatite: gneiss remains plus veins of melt."},
{id:"m58",q:"Which is the metamorphic equivalent of basalt at the highest pressure?",h:"Garnet + green pyroxene.",o:["Eclogite","Greenschist","Slate","Marble"],e:"Eclogite forms from basalt or gabbro in subduction zones."}
];

var ROCKS=[
{n:"Slate",grp:"Metasedimentary",p:"Mudstone or shale",g:"Low",t:"Foliated, slaty cleavage",m:"Mica, chlorite, quartz, feldspar",clue:["t","g"],not:["Phyllite"]},
{n:"Phyllite",grp:"Metasedimentary",p:"Shale or mudstone",g:"Low to medium",t:"Foliated, phyllitic sheen",m:"Mica, chlorite, quartz, feldspar",clue:["t","g"],not:["Slate"]},
{n:"Schist",grp:"Metasedimentary",p:"Shale or mudstone",g:"Medium",t:"Foliated, schistosity",m:"Mica, quartz, feldspar, garnet",clue:["g","m"]},
{n:"Paragneiss",grp:"Metasedimentary",p:"Shale or mudstone",g:"High",t:"Foliated, banded",m:"Quartz, feldspar, mica, amphibole",clue:["p","g"]},
{n:"Quartzite",grp:"Metasedimentary",p:"Sandstone",g:"Low to high",t:"Non-foliated, crystalline",m:"Quartz",clue:["p","m"]},
{n:"Marble",grp:"Metasedimentary",p:"Limestone or dolostone",g:"Low to high",t:"Non-foliated, crystalline",m:"Calcite, dolomite",clue:["p","m"]},
{n:"Orthogneiss",grp:"Metaigneous",p:"Granite, granodiorite, tonalite",g:"High",t:"Foliated, banded",m:"Quartz, feldspar, mica, amphibole",clue:["p","t"]},
{n:"Greenschist",grp:"Metaigneous",p:"Basalt",g:"Low to medium",t:"Foliated, slaty or schistose",m:"Chlorite, actinolite (green amphibole), epidote, albite (Na-plagioclase)",clue:["p","m"]},
{n:"Amphibolite",grp:"Metaigneous",p:"Basalt or gabbro",g:"Medium to high",t:"Foliated, banded",m:"Amphibole, plagioclase, epidote, garnet",clue:["g","m"]},
{n:"Eclogite",grp:"Metaigneous",p:"Basalt or gabbro",g:"High (high pressure)",t:"Granoblastic",m:"Garnet, omphacite (green pyroxene)",clue:["t","m"]}
];

var VOC=[
["Basics","Metamorphic","Changed. A rock changes its minerals and texture while staying solid."],
["Basics","Petrology","The study of rocks and how they form."],
["Basics","Protolith","The original (parent) rock before metamorphism. Can be virtually any rock."],
["Basics","Three key aspects","Protolith, temperature and pressure (helped by time and fluids)."],
["Basics","PT conditions","Pressure and temperature conditions."],
["Basics","Phase","One form of a compound, e.g. ice, water and steam for H₂O, or the different crystal structures of SiO₂."],
["Basics","Phase change","When PT changes, a different phase becomes stable and replaces the old one."],
["Basics","Metamorphic reaction","Minerals react in the solid state and form new minerals, e.g. chlorite → biotite."],
["Basics","Metamorphic grade","The degree of metamorphism. Reflects the PT conditions and is determined by the minerals present: low, medium, high."],
["Basics","Retrograde metamorphism","New reactions at lower PT when a rock rises slowly back towards the surface. (recording)"],
["Basics","Quartz vein","Quartz that crystallises in cracks from extra SiO₂ released by reactions. (recording)"],
["Basics","Catalyst (water)","Water released by reactions speeds metamorphic reactions up. (recording)"],
["Agents","Burial","New sediment layers pile up on top and raise the pressure below."],
["Agents","Lithostatic pressure","Confining pressure from the overlying layers, equal in all directions."],
["Agents","Confining pressure","Another name for lithostatic pressure: squeezed equally from every side."],
["Agents","Directed pressure","Pressure that is higher in one direction. Comes from tectonics and causes foliation."],
["Agents","Shear stress","Stress from rock masses sliding past each other, like sliding a deck of cards."],
["Agents","Tectonic processes","Plate movements that drag rocks deeper and add directed pressure and shear."],
["Agents","Orogeny","Mountain building. Crust thickens and rocks are pushed deeper."],
["Agents","Crustal thickening","The crust gets thicker during orogeny, burying rocks deeper."],
["Agents","Geothermal gradient","Temperature rise with depth, about 25–30 °C per km on average."],
["Agents","Magma intrusion","Magma pushed into existing rock, heating the rock around it."],
["Agents","Aureole","The zone of heated, metamorphosed rock around a magma intrusion. Also called contact aureole."],
["Agents","Baked zone","Everyday name for the aureole: the rock baked by the nearby magma."],
["Textures","Texture","The size and arrangement of grains (minerals) in a rock."],
["Textures","Foliation / foliated","Minerals aligned in layers because of directed pressure. The rock splits between the layers."],
["Textures","Non-foliated","No layers. Either no directed pressure (hornfels) or no sheet minerals (marble, quartzite)."],
["Textures","Sheet minerals","Flat, layered minerals like mica, chlorite and clay. Needed to make foliation."],
["Textures","Slaty cleavage","Lowest-grade foliation: the rock splits into flat sheets. Slate."],
["Textures","Phyllitic foliation","Wavy foliation with a silky sheen. Phyllite."],
["Textures","Schistose foliation (schistosity)","Wavier, messier foliation, often with garnet. Schist."],
["Textures","Gneissic banding","Highest-grade foliation: light and dark bands. Gneiss."],
["Textures","Crystalline","Made of interlocking crystals, as in marble and quartzite."],
["Textures","Granoblastic","The texture of eclogite on its rock card (equal-sized, interlocking grains)."],
["Groups","Metasedimentary","Metamorphic rock made from a sedimentary protolith."],
["Groups","Metaigneous","Metamorphic rock made from an igneous protolith."],
["Groups","Metapelitic","From fine mud (mudstone, shale): slate, phyllite, schist, gneiss, migmatite."],
["Groups","Metapsammitic","From sandstone: quartzite."],
["Groups","Metacalcareous","From limestone: marble."],
["Groups","Metabasaltic","From basalt (and gabbro): greenschist, amphibolite, eclogite. These rocks define the facies."],
["Groups","Metagranitic","From granite, granodiorite or tonalite: orthogneiss."],
["Groups","Metarhyolitic","From rhyolite or dacite: metarhyolite, felsic schist, felsic gneiss."],
["Groups","Metaultramafic","From peridotite: serpentinite."],
["Groups","Ortho-","From an igneous protolith (orthogneiss from granite)."],
["Groups","Para-","From a sedimentary protolith (paragneiss from mudstone or shale)."],
["Groups","Partial melting","Part of a rock melts while the rest stays solid. Gives migmatite."],
["Facies","Facies","An objective description based on defining mineral assemblages. Each facies is typical of certain PT conditions."],
["Facies","Mineral assemblage","The set of minerals found together in a rock."],
["Facies","Series","A trend of metamorphism typical of one geologic environment. It crosses several facies."],
["Facies","Low P/T series (1)","Contact metamorphism. Hornfels."],
["Facies","Medium P/T series (3)","Regional (orogenic, mountain-belt) metamorphism. Greenschist → amphibolite → granulite."],
["Facies","High P/T series (5)","Subduction-zone metamorphism. Blueschist → eclogite."],
["Facies","Contact metamorphism","Metamorphism by heat from a nearby intrusion, without directed pressure."],
["Facies","Regional metamorphism","Metamorphism over large regions during mountain building. Also called orogenic."],
["Facies","Barrovian","The name of the medium P/T (regional) trend."],
["Facies","Subduction zone","Where one plate dives under another. High pressure but relatively low temperature."],
["Facies","Zeolite, prehnite–pumpellyite","The lowest facies, where metamorphism only begins. (recording)"],
["Rocks","Slate","Mudstone/shale, low grade, slaty cleavage. Mica, chlorite, quartz, feldspar."],
["Rocks","Phyllite","Shale/mudstone, low to medium grade, phyllitic sheen. Mica, chlorite, quartz, feldspar."],
["Rocks","Schist","Shale/mudstone, medium grade, schistosity. Mica, quartz, feldspar, garnet."],
["Rocks","Gneiss","High-grade, banded rock. Paragneiss from mud, orthogneiss from granite."],
["Rocks","Migmatite","Partially melted rock: remains of gneiss plus veins of melt."],
["Rocks","Quartzite","Sandstone, any grade, non-foliated. Quartz."],
["Rocks","Marble","Limestone or dolostone, any grade, non-foliated. Calcite, dolomite."],
["Rocks","Hornfels","Non-foliated rock from contact metamorphism. Low P/T series."],
["Rocks","Greenschist","Basalt, low to medium grade. Chlorite, actinolite, epidote, albite."],
["Rocks","Amphibolite","Basalt or gabbro, medium to high grade, banded. Amphibole, plagioclase, epidote, garnet."],
["Rocks","Granulite","Highest facies of the regional (medium P/T) series."],
["Rocks","Blueschist","High-pressure, low-temperature rock of subduction zones."],
["Rocks","Eclogite","Basalt or gabbro at high pressure, granoblastic. Garnet + omphacite."],
["Rocks","Serpentinite","Metamorphosed peridotite."],
["Rocks","Felsic schist / felsic gneiss","Medium / high grade metamorphosed rhyolite or dacite."],
["Rocks","Anthracite","The highest-grade, shiny coal (brown → black → anthracite). (recording)"],
["Minerals","Chlorite","Green sheet mineral of low grade. Gives phyllite and greenschist their green colour."],
["Minerals","Mica (biotite, muscovite)","Shiny sheet minerals. Biotite is dark, muscovite is light."],
["Minerals","Garnet","Round, dark red crystals that appear at medium grade (schist)."],
["Minerals","Staurolite","A typical metamorphic mineral of certain PT conditions. (recording)"],
["Minerals","Kyanite","Al₂SiO₅ mineral produced in the chlorite → biotite reaction."],
["Minerals","Clay minerals (smectite, kaolinite)","Fine sheet minerals in mud. They react to chlorite at low grade."],
["Minerals","Actinolite","Green amphibole in greenschist."],
["Minerals","Epidote","Pistachio-green mineral in greenschist and amphibolite."],
["Minerals","Albite","Na-plagioclase, in greenschist."],
["Minerals","Amphibole","Dark mineral, main mineral of amphibolite."],
["Minerals","Omphacite","Green pyroxene in eclogite."],
["Minerals","Calcite, dolomite","Carbonate minerals of marble. Calcite reacts with acid."]
];
var VCON=[["Lithostatic pressure","Confining pressure","Burial"],["Aureole","Baked zone","Magma intrusion","Contact metamorphism","Low P/T series (1)","Hornfels"],["Orogeny","Crustal thickening","Tectonic processes","Regional metamorphism","Medium P/T series (3)","Barrovian","Granulite"],["Subduction zone","High P/T series (5)","Blueschist","Eclogite","Omphacite"],["Slaty cleavage","Slate"],["Phyllitic foliation","Phyllite"],["Schistose foliation (schistosity)","Schist","Garnet"],["Gneissic banding","Gneiss"],["Partial melting","Migmatite"],["Metapsammitic","Quartzite"],["Metacalcareous","Marble","Calcite, dolomite"],["Metaultramafic","Serpentinite"],["Phase","Phase change","Metamorphic reaction"],["Facies","Mineral assemblage"],["Metarhyolitic","Felsic schist / felsic gneiss"],["Ortho-","Metagranitic","Metaigneous"],["Para-","Metapelitic","Metasedimentary"],["Foliation / foliated","Directed pressure","Sheet minerals","Non-foliated"],["Metamorphic","Metamorphic reaction"],["Mica (biotite, muscovite)","Sheet minerals"],["Actinolite","Amphibole"],["Clay minerals (smectite, kaolinite)","Sheet minerals"],["Metabasaltic","Greenschist","Amphibolite"]];

var SHEET=[
 ["Basics",["Term","Meaning"],[["Metamorphic","Changed (in the solid state)"],["3 key aspects","Protolith, temperature, pressure (+ time, + fluids)"],["Protolith","The original (parent) rock; can be virtually any rock"],["Principle","Different phases are stable at different PT; PT change → phase change"],["Grade","Degree of metamorphism; reflects PT; determined by the minerals present; low / medium / high"],["Retrograde","New reactions at lower PT when the rock rises slowly (recording)"]]],
 ["Agents",["Agent","Key facts"],[["Burial","Overlying layers → lithostatic (confining) pressure, equal in all directions; reactions start ~2 km"],["Tectonics","Crustal thickening in orogeny; rocks dragged deeper; + directed pressure + shear stress"],["Geothermal gradient","~25–30 °C per km"],["Magma intrusion","Heats the surrounding rock → baked zone = contact aureole"]]],
 ["Textures",["Texture","Facts"],[["Foliated","Grains deform, atoms migrate, new minerals grow in the direction of weakest pressure; layered, breaks between layers"],["Foliation order","Slaty cleavage → phyllitic → schistose → gneissic banding"],["Non-foliated","No directed pressure (contact → hornfels) or no sheet minerals (limestone → marble, sandstone → quartzite)"]]],
 ["Metasedimentary",["Group","Series"],[["Metapelitic","Mudstone → shale (both sedimentary) → slate (low) → phyllite (low) → schist (medium) → (para)gneiss (high) → migmatite (partial melting)"],["Metapsammitic","Sandstone → quartzite"],["Metacalcareous","Limestone → marble"],["Coal","Brown → black → anthracite (recording)"]]],
 ["Metaigneous, facies and series",["Item","Facts"],[["Facies","Defined by metabasaltic rocks; objective description by defining mineral assemblages; each = certain PT"],["Series","Trend typical of a geologic environment; extends across several facies"],["Low P/T (1)","Contact metamorphism → hornfels"],["Medium P/T (3)","Regional / orogenic / mountain belt (Barrovian) → greenschist → amphibolite → granulite"],["High P/T (5)","Subduction → blueschist → eclogite"],["Metagranitic","Granite, granodiorite, tonalite → (ortho)gneiss"],["Metarhyolitic","Rhyolite, dacite → metarhyolite / metadacite (low) → felsic schist (medium) → felsic gneiss (high)"],["Metaultramafic","Peridotite → serpentinite"]]],
 ["Rock cycle",["From","To"],[["Magma","Igneous rock (cooling, crystallisation)"],["Igneous / metamorphic rock","Sediment (weathering at the surface)"],["Sediment","Sedimentary rock (deposition, compaction)"],["Sedimentary / igneous rock","Metamorphic rock (heat and pressure at depth)"],["Metamorphic rock","Magma (melting)"]]]
];

var MUST='<span class="need must">Must know</span>',NICE='<span class="need nice">Good to know</span>',SKIP='<span class="need skip">Skip</span>';
var MROCK={"Slate":["mica","chlorite","quartz","feldspar"],"Phyllite":["mica","chlorite","quartz","feldspar"],"Schist":["mica","quartz","feldspar","garnet"],"Paragneiss":["quartz","feldspar","mica","amphibole"],"Quartzite":["quartz"],"Marble":["calcite","dolomite"],"Orthogneiss":["quartz","feldspar","mica","amphibole"],"Greenschist":["chlorite","actinolite","epidote","albite"],"Amphibolite":["amphibole","plagioclase","epidote","garnet"],"Eclogite":["garnet","omphacite"]};
var MALL=["mica","chlorite","quartz","feldspar","garnet","amphibole","calcite","dolomite","actinolite","epidote","albite","plagioclase","omphacite"];
var MFAM=[["feldspar","plagioclase","albite"],["amphibole","actinolite"]];
function fam(m){for(var i=0;i<MFAM.length;i++)if(MFAM[i].indexOf(m)>=0)return MFAM[i];return [m]}

/* widgets */
function initAll(){
  /* depth */
  function upDepth(){var d=+$("#depth").value;$("#depthv").textContent=d+" km";
    $("#depthout").innerHTML=(d===0?"At the surface.":"About <b>"+(d*25)+" to "+(d*30)+" °C</b> hotter than at the surface.")+(d<2?" Too shallow: reactions begin at about <b>2 km</b>.":" Deeper than the ~2 km where metamorphic reactions begin.")}
  $("#depth").oninput=upDepth;upDepth();
  /* foliated sorter */
  GEO.sorter($("#fsorter"),[["Slate","F","Slaty cleavage."],["Marble","N","No sheet minerals: interlocking calcite."],["Schist","F","Schistose foliation."],["Hornfels","N","No directed pressure: contact metamorphism."],["Phyllite","F","Phyllitic sheen."],["Quartzite","N","No sheet minerals: interlocking quartz."],["Gneiss","F","Gneissic banding."],["Greenschist","F","Slaty or schistose foliation."]],[["F","Foliated"],["N","Non-foliated"]]);
  /* ladder */
  var LAD=[["Mudstone","Sedimentary","Not metamorphic yet","Fine mud: clay and silt"],["Shale","Sedimentary","Still sedimentary","Squeezed, minerals start to reorient, splits in planes"],["Slate","Low grade","Slaty cleavage","Splits into flat sheets. Mica, chlorite, quartz, feldspar"],["Phyllite","Low grade (card: low to medium)","Phyllitic foliation","Wavy, silky sheen. Mica, chlorite, quartz, feldspar"],["Schist","Medium grade","Schistose foliation","Wavy and messy, garnet. Mica, quartz, feldspar, garnet"],["(Para)gneiss","High grade","Gneissic banding","Light and dark bands. Quartz, feldspar, mica, amphibole"],["Migmatite","Partial melting","Chaotic","Remains of gneiss plus veins of melted material"]];
  function upLad(){var v=+$("#ladder").value,r=LAD[v];
    $("#ladbar").innerHTML=LAD.map(function(x,n){return '<span class="'+(n===v?"on":"")+'">'+(n+1)+'</span>'}).join("");
    $("#ladderout").innerHTML='<div class="big">'+(v+1)+'. '+r[0]+'</div><div class="kv"><span>Grade</span><span>'+r[1]+'</span><span>Texture</span><span>'+r[2]+'</span><span>Looks like</span><span>'+r[3]+'</span></div>'}
  $("#ladder").oninput=upLad;upLad();
  /* PT map */
  var FAC=[
  {n:"Zeolite / prehnite–pumpellyite",l:"Zeolite",x:2,y:2,w:20,h:22,t:"Very low grade, where metamorphic reactions only begin. (recording)"},
  {n:"Hornfels",l:"Hornfels",x:24,y:0,w:48,h:15,t:"Low pressure, rising temperature. Contact metamorphism in the aureole. Non-foliated. Series 1 (low P/T)."},
  {n:"Greenschist",l:"Greenschist",x:24,y:19,w:20,h:24,t:"Basalt protolith, low to medium grade. Chlorite, actinolite, epidote, albite. Series 3 (medium P/T)."},
  {n:"Amphibolite",l:"Amphibolite",x:46,y:23,w:21,h:27,t:"Basalt or gabbro, medium to high grade. Amphibole, plagioclase, epidote, garnet. Series 3."},
  {n:"Granulite",l:"Granulite",x:69,y:27,w:28,h:27,t:"Highest grade of the regional (medium P/T) series. Series 3."},
  {n:"Blueschist",l:"Blueschist",x:2,y:48,w:28,h:36,t:"High pressure, low temperature. Subduction zone. Series 5 (high P/T)."},
  {n:"Eclogite",l:"Eclogite",x:33,y:58,w:64,h:38,t:"Highest pressure. Basalt or gabbro, garnet + omphacite, granoblastic. Subduction zone. Series 5."}];
  var SER={1:{p:[[4,5],[30,7],[70,9]],t:"<b>Series 1, low P/T</b>: contact metamorphism, magma bakes the rock around it. Rock: <b>hornfels</b>."},
  3:{p:[[6,10],[34,30],[57,37],[84,42]],t:"<b>Series 3, medium P/T</b>: regional (orogenic, mountain-belt, Barrovian). <b>Greenschist → amphibolite → granulite</b>. Mud goes slate → phyllite → schist → gneiss → migmatite."},
  5:{p:[[6,18],[12,40],[18,62],[40,76],[70,84]],t:"<b>Series 5, high P/T</b>: subduction. The plate stays cool while pressure rises. <b>Blueschist → eclogite</b>."}};
  var X=function(x){return 50+x*3.9},Y=function(y){return 268-y*2.5};
  var s='<svg class="ptmap" viewBox="0 0 450 312" role="img" aria-label="Sketch of metamorphic facies on a pressure and temperature map"><path class="axis" d="M50 18 V268 H442"/><text x="246" y="302" text-anchor="middle" font-size="13">Temperature →</text><text x="16" y="143" text-anchor="middle" font-size="13" transform="rotate(-90 16 143)">Pressure →</text>';
  FAC.forEach(function(f,n){var x=X(f.x),y=Y(f.y+f.h),w=f.w*3.9,h=f.h*2.5;s+='<g tabindex="0" role="button" aria-label="'+f.n+'" data-f="'+n+'"><rect class="fac" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5"/><text x="'+(x+w/2)+'" y="'+(y+h/2+4)+'" text-anchor="middle" font-size="11.5" pointer-events="none">'+f.l+'</text></g>'});
  [1,3,5].forEach(function(k){var pts=SER[k].p.map(function(p){return X(p[0])+","+Y(p[1])}).join(" "),l=SER[k].p[SER[k].p.length-1];s+='<polyline class="ser" data-s="'+k+'" points="'+pts+'"/><text class="stag" data-s="'+k+'" x="'+(X(l[0])+6)+'" y="'+(Y(l[1])+4)+'">'+k+'</text>'});
  $("#ptholder").innerHTML=s+'</svg>';
  function sel(n){$$("#ptholder .fac").forEach(function(r,i){r.classList.toggle("sel",i===n)});$("#ptout").innerHTML='<div class="big">'+FAC[n].n+'</div><p style="margin:4px 0 0">'+FAC[n].t+'</p>'}
  $("#ptholder").onclick=function(e){var g=e.target.closest("g[data-f]");if(g)sel(+g.getAttribute("data-f"))};
  $("#ptholder").onkeydown=function(e){if(e.key==="Enter"||e.key===" "){var g=e.target.closest("g[data-f]");if(g){e.preventDefault();sel(+g.getAttribute("data-f"))}}};
  $("#serseg").onclick=function(e){var b=e.target.closest("button");if(!b)return;var k=+b.getAttribute("data-s");$$("#serseg button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});$$("#ptholder [data-s]").forEach(function(el){el.classList.toggle("on",+el.getAttribute("data-s")===k)});$("#ptout").innerHTML=SER[k].t};
  /* rock cycle */
  var NODES={magma:"Magma",ign:"Igneous rock",sedm:"Sediment",sed:"Sedimentary rock",met:"Metamorphic rock"};
  var EDGES={magma:[["ign","Cools and crystallises"]],ign:[["sedm","Weathering at the surface"],["met","Dragged into the Earth: heat and pressure"]],sedm:[["sed","Deposited, compacted and cemented"]],sed:[["met","Dragged into the Earth: heat and pressure"]],met:[["magma","Melts"],["sedm","Brought to the surface and weathered"]]};
  var wc="magma",wt=["magma"];
  function walk(){$("#walknow").textContent="You are: "+NODES[wc];$("#walkopts").innerHTML=EDGES[wc].map(function(e){return '<button class="opt" data-to="'+e[0]+'">'+e[1]+'</button>'}).join("");var seen={};wt.forEach(function(t){seen[t]=1});$("#trail").innerHTML="Path: "+wt.map(function(t){return NODES[t]}).join(" → ")+"<br>Visited "+Object.keys(seen).length+" of 5"}
  $("#walkopts").onclick=function(e){var b=e.target.closest("[data-to]");if(!b)return;wc=b.getAttribute("data-to");wt.push(wc);walk()};
  $("#walkreset").onclick=function(){wc="magma";wt=["magma"];walk()};walk();
  /* rock table in step 9 */
  GEO.table($("#t-cards"),["Rock","Protolith","Grade","Texture","Minerals"],ROCKS.map(function(r){return [r.n,r.p,r.g,r.t,r.m]}),1);
}
STEPS[0].init=initAll;

GEO.register({
  id:"t5",num:5,title:"Metamorphic rocks",short:"Metamorphic",sub:"Lecture 5 · test 9 Nov (taken) + final exam",
  blurb:"Protolith, pressure and heat, foliation, the mud ladder, facies and series, the 10 rock cards.",
  h1:"Metamorphic rocks, one step at a time",
  start:{lede:"You never need the slides: everything for the test is taught here, step by step. Everything in this lecture can be tested. The weekly test on this lecture is done; keep it for the final exam.",
    plan:'<h3>First time, about 2 hours</h3><ol><li><b>Learn, step by step</b>: 9 short steps. Answer the check questions.</li><li><b>10 rock cards</b>: flip all 10, then play "Which rock am I?" until you get 8 right in a row.</li></ol><h3>Revision for the final exam, 1 hour</h3><ol><li><b>Cheat sheet</b> in test mode: say each blurred answer out loud, then tap to check.</li><li><b>Mock test</b> twice, then <b>Review</b> until it is empty.</li></ol>',
    six:["Three key aspects: <b>protolith, temperature, pressure</b> (plus time and fluids).","The mud ladder: <b>mudstone → shale → slate → phyllite → schist → gneiss → migmatite</b>.","<b>Sandstone → quartzite</b> and <b>limestone → marble</b>, one step each, because quartz and calcite are stable.","<b>Foliated</b> (layers) needs directed pressure and sheet minerals. <b>Non-foliated</b>: hornfels, marble, quartzite.","Series: <b>low P/T = contact = hornfels</b>, <b>medium P/T = mountain belts = greenschist → amphibolite → granulite</b>, <b>high P/T = subduction = blueschist → eclogite</b>.","The 10 rock cards: protolith, grade, texture, minerals."]},
  must:"foliation and textures",
  steps:STEPS,Q:Q,VOC:VOC,VCON:VCON,sheet:SHEET,
  cards:{tab:"10 rock cards",h1:"10 rock cards",who:"Which rock am I?",labels:{p:"Protolith",g:"Grade",t:"Texture",m:"Minerals"},keys:["p","g","t","m"],items:ROCKS},
  names:{tab:"Minerals & rocks",h1:"Minerals &amp; rocks: which names you need",small:"Drill: which mineral is in this rock?",
    html:'<div class="card"><h2>Short answer</h2><p><b>Yes, you need the rock names and the minerals on the 10 rock cards.</b> That\'s 13 minerals and about 30 rock names, and most are already familiar from lectures 3 and 4.</p><p><b>No, you don\'t need the reaction formulas</b> (smectite + kaolinite → chlorite …). The teacher said you only need the principle. Kyanite, smectite and kaolinite only appear in those formulas.</p><p>'+MUST+' core test facts &nbsp; '+NICE+' said in class or only in passing &nbsp; '+SKIP+' only inside the formulas</p></div><div class="card"><h2>Drill: which mineral is in this rock?</h2><p>One rock, four minerals, one is correct. Streak: <b id="mstreak">0</b> (aim for 10).</p><div id="mdrill"></div></div>',
    tables:[
     {title:"Minerals",head:["Mineral","What it is","In which rocks","Need it?"],rows:[["Quartz","Hard, glassy; SiO₂. Stable, just recrystallises","Slate, phyllite, schist, paragneiss, orthogneiss, quartzite (only quartz)",MUST],["Feldspar","Light rock-forming mineral; stable","Slate, phyllite, schist, paragneiss, orthogneiss",MUST],["Mica","Shiny sheet mineral (biotite = dark, muscovite = light)","Slate, phyllite, schist, paragneiss, orthogneiss",MUST],["Chlorite","Green sheet mineral of low grade","Slate, phyllite, greenschist",MUST],["Garnet","Round dark-red crystals, from medium grade up","Schist, amphibolite, eclogite",MUST],["Amphibole","Dark mineral","Paragneiss, orthogneiss, amphibolite",MUST],["Plagioclase","Feldspar type","Amphibolite",MUST],["Epidote","Pistachio green","Greenschist, amphibolite",MUST],["Actinolite","Green amphibole","Greenschist",MUST],["Albite","Na-plagioclase","Greenschist",MUST],["Omphacite","Green pyroxene","Eclogite",MUST],["Calcite","Carbonate, reacts with acid","Marble",MUST],["Dolomite","Carbonate with Mg","Marble",MUST],["Biotite, muscovite","The two micas (dark, light). Appear in the reactions","As 'mica' on the cards",NICE],["Staurolite","Typical metamorphic mineral of certain PT (recording)","Not on any card",NICE],["Smectite, kaolinite","Clay minerals, only in the reaction formula","None",SKIP],["Kyanite","Al₂SiO₅, only in the reaction formula","None",SKIP]]},
     {title:"Metamorphic rocks",head:["Rock","From (protolith)","Key fact","Need it?"],rows:[["Slate","Mudstone / shale","Low grade, slaty cleavage",MUST],["Phyllite","Shale / mudstone","Low (to medium) grade, phyllitic sheen",MUST],["Schist","Shale / mudstone","Medium grade, schistosity, garnet",MUST],["Paragneiss","Shale / mudstone","High grade, banded",MUST],["Migmatite","Gneiss (mud series)","Partial melting",MUST],["Quartzite","Sandstone","Non-foliated, quartz",MUST],["Marble","Limestone / dolostone","Non-foliated, calcite, dolomite",MUST],["Hornfels","Any rock near an intrusion","Contact metamorphism, low P/T, non-foliated",MUST],["Orthogneiss","Granite, granodiorite, tonalite","High grade, banded",MUST],["Greenschist","Basalt","Low to medium grade",MUST],["Amphibolite","Basalt / gabbro","Medium to high grade, banded",MUST],["Granulite","Basalt (facies)","Highest facies of the medium P/T series",MUST],["Blueschist","Basalt (facies)","High P / low T, subduction",MUST],["Eclogite","Basalt / gabbro","High pressure, garnet + omphacite",MUST],["Serpentinite","Peridotite","Metaultramafic",MUST],["Metarhyolite / metadacite","Rhyolite / dacite","Low grade",MUST],["Felsic schist / felsic gneiss","Rhyolite / dacite","Medium / high grade",MUST],["Zeolite, prehnite–pumpellyite","Basalt (facies)","Lowest facies (recording)",NICE],["Anthracite","Coal","Shiny high-grade coal (recording)",NICE]]},
     {title:"Starting rocks (protoliths)",intro:"You know these from lectures 3 and 4. Here you only need to know what each one turns into.",head:["Starting rock","Type","Becomes"],from:2,rows:[["Mudstone","Sedimentary","Shale → slate → phyllite → schist → paragneiss → migmatite"],["Shale","Sedimentary (still!)","Slate → phyllite → schist → paragneiss"],["Sandstone","Sedimentary","Quartzite"],["Limestone, dolostone","Sedimentary","Marble"],["Coal","Sedimentary (biogenic)","Brown → black coal → anthracite"],["Basalt, gabbro","Igneous (mafic)","Greenschist → amphibolite → granulite, or blueschist → eclogite"],["Granite, granodiorite, tonalite","Igneous (felsic)","Orthogneiss"],["Rhyolite, dacite","Igneous (volcanic, felsic)","Metarhyolite → felsic schist → felsic gneiss"],["Peridotite","Igneous (ultramafic)","Serpentinite"]]}
    ],
    init:function(){
      GEO.drill($("#mdrill"),"mstreak",function(){
        var rocks=Object.keys(MROCK),r=rocks[Math.floor(Math.random()*rocks.length)],has=MROCK[r];
        var right=has[Math.floor(Math.random()*has.length)],banned={};has.forEach(function(m){fam(m).forEach(function(x){banned[x]=1})});
        var cap=function(m){return m.charAt(0).toUpperCase()+m.slice(1)};
        var opts=shuffle([right].concat(shuffle(MALL.filter(function(m){return !banned[m]})).slice(0,3))).map(cap);
        return {q:"Which mineral is in <b>"+r+"</b>?",opts:opts,ans:cap(right),fb:r+" contains: <b>"+has.join(", ")+"</b>."};
      });
    }},
  mastery:{facts:[[1,"Metamorphic means {changed|deposited|molten|buried}."], [1,"The three key aspects of metamorphism are protolith, pressure and {temperature|wind|gravity|magnetism}."], [1,"The protolith is the {original (parent) rock|new rock|fluid|mineral}."], [1,"A protolith can be {virtually any rock|only shale|only granite|only basalt}."], [2,"Burial increases the {lithostatic|magnetic|chemical|biological} pressure."], [2,"Metamorphic reactions begin at burial depths of about {2|20|200|0.2} km."], [2,"Orogeny means {mountain building|volcanic eruption|erosion|sedimentation}."], [2,"During orogeny, crustal thickening drags rocks deeper and adds directed pressure and {shear stress|salinity|radioactivity|magnetism}."], [3,"The geothermal gradient is roughly {25–30|2–3|250–300|100} °C per kilometre."], [3,"Magma intrusion creates a baked zone called an {aureole|facies|series|foliation}."], [4,"Different phases are stable at different {PT (pressure–temperature)|colour|grain-size|age} conditions."], [4,"Metamorphic grade is the {degree of metamorphism|age|grain size|colour} of a rock."], [4,"Metamorphic grade is determined by the {minerals|colour|weight|age} present."], [4,"Chlorite and muscovite react to form {biotite|olivine|halite|calcite}."], [5,"In a foliated texture, new minerals grow in the direction of {weakest|strongest|no|highest} pressure."], [5,"Foliation makes a rock look {layered|massive|glassy|vesicular}."], [5,"Foliated textures include slaty cleavage, phyllitic foliation, schistose foliation and {gneissic banding|hornfels|marble|quartzite}."], [5,"Contact metamorphism typically produces the non-foliated rock {hornfels|schist|gneiss|slate}."], [5,"Limestone becomes non-foliated {marble|slate|schist|gneiss}."], [5,"Sandstone becomes non-foliated {quartzite|slate|schist|gneiss}."], [6,"Metapelitic rocks come from {mudstone and shale|sandstone|limestone|granite}."], [6,"The metapelitic series from low to high grade is slate, phyllite, schist and {gneiss|marble|quartzite|hornfels}."], [6,"Migmatite shows partial {melting|weathering|cementation|erosion}."], [6,"Slate is a {low|medium|high|very high}-grade rock with slaty cleavage."], [6,"Phyllite has a typical phyllitic {sheen|banding|crystal|vein}."], [6,"Schist is a {medium|low|high|zero}-grade rock made of mica, quartz, feldspar and garnet."], [6,"Paragneiss is a {high|low|medium|zero}-grade banded rock."], [6,"Quartzite has the protolith {sandstone|limestone|shale|basalt}."], [6,"Marble has the protolith limestone or {dolostone|sandstone|shale|granite}."], [7,"Metabasaltic rocks define metamorphic {facies|series|aureoles|cycles}."], [7,"A facies is an objective description based on defining mineral {assemblages|ages|colours|sizes}."], [7,"A metamorphic series is a trend characteristic of a certain geologic {environment|age|mineral|colour}."], [7,"Contact metamorphism belongs to the {low|medium|high} P/T series."], [7,"Regional (orogenic, Barrovian) metamorphism belongs to the {medium|low|high} P/T series."], [7,"Subduction-zone metamorphism belongs to the {high|low|medium} P/T series."], [7,"The medium P/T series runs greenschist, amphibolite and {granulite|blueschist|eclogite|hornfels}."], [7,"The high P/T series runs blueschist to {eclogite|granulite|hornfels|greenschist}."], [7,"Orthogneiss has the protolith granite, granodiorite or {tonalite|basalt|shale|limestone}."], [7,"Serpentinite has the protolith {peridotite|granite|shale|limestone}."], [7,"Greenschist has the protolith {basalt|granite|shale|limestone}."], [7,"Greenschist contains chlorite, actinolite, epidote and {albite|olivine|halite|calcite}."], [7,"Amphibolite has the protolith basalt or {gabbro|granite|sandstone|limestone}."], [7,"Eclogite is a {high-pressure|low-pressure|contact|low-grade} rock."], [7,"Eclogite contains garnet and omphacite, a green {pyroxene|amphibole|mica|feldspar}."]]},
  foot:"Sources: lecture 5 slides \"Metamorphic rocks and processes\" (Mgr. Václav Santolík, PhD, CZU) and your Wispr recordings of 2 Nov (lecture) and 15 Oct (practical). Lines marked \"recording\" were said in class but aren't on the slides."
});
})();
