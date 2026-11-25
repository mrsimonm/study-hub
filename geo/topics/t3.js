/* Lecture 3: Igneous rocks and processes */
(function(){"use strict";
var $=GEO.$,$$=GEO.$$,shuffle=GEO.shuffle,esc=GEO.esc;
var MUST='<span class="need must">Must know</span>',NICE='<span class="need nice">Good to know</span>',SKIP='<span class="need skip">Skip</span>';

var ROCKS=[
{n:"Granite",grp:"Plutonic",ty:"Plutonic (intrusive)",si:"~70–77 % (felsic)",co:"Light: white, pink or grey",mi:"Quartz, K-feldspar, plagioclase, biotite, ± muscovite",eq:"Rhyolite",clue:["ty","mi"],not:["Granodiorite / tonalite","Rhyolite"]},
{n:"Granodiorite / tonalite",grp:"Plutonic",ty:"Plutonic (intrusive)",si:"~63–70 % (felsic to intermediate)",co:"Light to medium grey",mi:"Plagioclase, quartz, biotite, amphibole, ± K-feldspar",eq:"Dacite",clue:["ty","si"],not:["Granite","Dacite"]},
{n:"Diorite",grp:"Plutonic",ty:"Plutonic (intrusive)",si:"~55–63 % (intermediate)",co:"\"Pepper and salt\", medium to dark grey",mi:"Plagioclase, amphibole, biotite, ± pyroxene",eq:"Andesite",clue:["ty","co"],not:["Andesite","Gabbro"]},
{n:"Gabbro",grp:"Plutonic",ty:"Plutonic (intrusive)",si:"~45–52 % (mafic)",co:"Dark grey to black",mi:"Plagioclase, pyroxene, ± olivine, ± amphibole",eq:"Basalt",clue:["ty","si"],not:["Basalt","Diorite"]},
{n:"Peridotite",grp:"Plutonic",ty:"Plutonic (intrusive)",si:"<45 % (ultramafic)",co:"Dark green to black",mi:"Olivine, pyroxene, ± amphibole, ± spinel, ± garnet",eq:"(Komatiite, picrite)",clue:["si","mi"]},
{n:"Rhyolite",grp:"Volcanic",ty:"Volcanic (extrusive)",si:"~70–77 % (felsic)",co:"Light to red: white, pink, orange, grey",mi:"Quartz, K-feldspar, plagioclase, biotite, ± muscovite",eq:"Granite",clue:["ty","si"],not:["Granite","Dacite"]},
{n:"Dacite",grp:"Volcanic",ty:"Volcanic (extrusive)",si:"~63–70 % (felsic to intermediate)",co:"Light to medium grey",mi:"Plagioclase, quartz, biotite, hornblende, ± K-feldspar",eq:"Granodiorite / tonalite",clue:["ty","si"],not:["Rhyolite","Granodiorite / tonalite"]},
{n:"Andesite",grp:"Volcanic",ty:"Volcanic (extrusive)",si:"~55–63 % (intermediate)",co:"Medium to dark grey",mi:"Plagioclase, amphibole, biotite, ± pyroxene",eq:"Diorite",clue:["ty","si"],not:["Diorite"]},
{n:"Basalt",grp:"Volcanic",ty:"Volcanic (extrusive)",si:"~45–52 % (mafic)",co:"Dark grey to black",mi:"Plagioclase, pyroxene, ± olivine, ± amphibole",eq:"Gabbro",clue:["ty","si"],not:["Gabbro"]},
{n:"Pegmatite",grp:"Plutonic (dikes)",ty:"Plutonic, usually in dikes",si:"Variable (usually felsic)",co:"Light: white, pink, grey; huge crystals",mi:"Very coarse quartz, K-feldspar, plagioclase, ± muscovite, ± tourmaline",eq:"None",clue:["co","mi"]}
];

var STEPS=[
{t:"10 min",title:"What magma is",html:`
<ul><li><b>Igneous</b> = <b>magmatic</b>. <b>Petrology</b> = the study of rocks and their formative processes.</li></ul>
<div class="box idea"><b>Two official definitions</b><b>Oxford:</b> "Hot fluid or semi-fluid material below or within the Earth's crust from which lava and other igneous rock is formed on cooling."<br><b>The teacher's compositional definition:</b> "Molten silicate material containing liquid, solid, and gas phases."</div>
<div class="tw"><table><thead><tr><th>Phase</th><th>What it is</th></tr></thead><tbody>
<tr><td><b>Liquid</b></td><td>A viscous fluid, most commonly of silicate composition</td></tr>
<tr><td><b>Solid</b></td><td>Crystallising crystals; residue after partial melting; fragments taken from the surrounding rock (<b>xenoliths</b>)</td></tr>
<tr><td><b>Gas</b></td><td>Bubbles of volatile components (H₂O, CO₂, H₂S, Cl…). They <b>form when pressure decreases</b> and are the <b>cause of eruptions</b></td></tr>
</tbody></table></div>
<div class="box ana"><b>Analogy</b>A can of soda: CO₂ stays dissolved under pressure; open the can and bubbles form and it can explode. Magma rising to the surface does the same. The teacher used exactly this picture. <span class="chip">recording</span> The liquid is thick like honey, only much thicker.</div>
<div class="box idea"><b>Link to lecture 6</b>Xenoliths in magma are one way we get samples of the deep Earth (peridotite in basalt).</div>
<div class="chk" data-q="ig1"></div>
<div class="chk" data-q="ig3"></div>
<div class="chk" data-q="ig4"></div>`},
{t:"15 min",title:"Four magma types",html:`
<p>Magma is not one thing. Its <b>SiO₂ content</b> controls almost everything else:</p>
<div class="tw"><table><thead><tr><th></th><th>Felsic</th><th>Intermediate</th><th>Mafic</th><th>Ultramafic</th></tr></thead><tbody>
<tr><td><b>SiO₂, Na₂O, K₂O</b></td><td>High</td><td>Average</td><td>Low</td><td>Very low</td></tr>
<tr><td><b>FeO, MgO, CaO</b></td><td>Low</td><td>Average</td><td>High</td><td>Very high</td></tr>
<tr><td><b>Gas content</b></td><td>High</td><td>Average</td><td>Low</td><td>Low</td></tr>
<tr><td><b>Density</b></td><td>Low</td><td>Average</td><td>High</td><td>High</td></tr>
<tr><td><b>Temperature</b></td><td>Low</td><td>Average</td><td>High</td><td>High</td></tr>
<tr><td><b>Viscosity</b></td><td>High</td><td>Average</td><td>Low</td><td>Very low</td></tr>
<tr><td><b>Eruption</b></td><td>Highly explosive</td><td>Rather explosive</td><td>Effusive</td><td>Effusive</td></tr>
<tr><td><b>Key minerals</b></td><td>Quartz, K-feldspar, plagioclase, mica</td><td>Quartz, plagioclase, amphibole</td><td>Plagioclase, amphibole, pyroxene</td><td>Olivine, pyroxene</td></tr>
<tr><td><b>Rocks</b></td><td>Rhyolite, granite</td><td>Andesite, diorite</td><td>Basalt, gabbro</td><td>Picrite, komatiite, peridotite</td></tr>
<tr><td><b>Landform</b></td><td>Lava domes</td><td>Stratovolcanoes</td><td>Shield volcanoes</td><td></td></tr>
</tbody></table></div>
<h3>Slide the silica</h3>
<input type="range" id="sio2" min="40" max="77" step="1" value="50" aria-label="SiO2 content in weight percent">
<div class="out" id="sio2out"></div>
<div class="box ana"><b>Memory trick</b><b>FEL</b>sic = <b>FEL</b>dspar + <b>S</b>ilica: light, sticky, explosive. <b>MAF</b>ic = <b>M</b>agnesium + <b>F</b>e (iron): dark, runny, effusive. More silica = stickier, cooler, lighter, more explosive.</div>
<div class="box teach"><b>Teacher said</b>The take-away: "magma isn't just a single composition … there are many different types of magma", and the type also defines the shape of the volcano. Iceland: runny basaltic lava flows like rivers; a viscous, gas-rich magma (Sicily video) explodes instead. <span class="chip">recording</span></div>
<div class="box trap"><b>Exam trap</b>Viscosity goes the <b>opposite</b> way to temperature and density: felsic magma is the <b>coolest, lightest and most viscous</b>. Basalt magma (~1160 °C) is hotter than rhyolite magma (~900 °C).</div>
<div class="chk" data-q="ig8"></div>
<div class="chk" data-q="ig10"></div>
<div class="chk" data-q="ig12"></div>`},
{t:"12 min",title:"Describing igneous rocks: texture",html:`
<p>The three <b>main</b> properties used to identify and classify igneous rocks:</p>
<ol><li><b>Texture</b></li><li><b>Mineral composition</b></li><li><b>Chemical composition</b></li></ol>
<p>Other useful things: colour, weight (density), structure, field relationships, weathering features, magnetic anisotropy, radioactivity.</p>
<div class="box teach"><b>Teacher said</b>Colour "is important, but it's secondary". Texture in rocks does <b>not</b> mean how it feels to touch: it means the <b>grain size and arrangement of the minerals</b>. <span class="chip">recording</span></div>
<div class="tw"><table><thead><tr><th>Texture</th><th>What you see</th><th>Typical of</th></tr></thead><tbody>
<tr><td><b>Phaneritic</b> (coarse-grained)</td><td>Big crystals you can see by eye</td><td>Plutonic rocks (slow cooling)</td></tr>
<tr><td><b>Aphanitic</b> (fine-grained)</td><td>Crystals too small to see</td><td>Volcanic rocks (fast cooling)</td></tr>
<tr><td><b>Porphyritic</b></td><td>Larger crystals floating in a fine-grained matrix</td><td>Both (in volcanic rocks still finer)</td></tr>
<tr><td><b>Glassy</b></td><td>No crystals at all, just glass</td><td>Obsidian</td></tr>
<tr><td><b>Vesicular</b></td><td>Bubbles (vesicles), sometimes filled with later minerals</td><td>Volcanic rocks</td></tr>
<tr><td><b>Pyroclastic</b></td><td>Angular fragments thrown out by a volcano</td><td>Tuff, volcanic breccia</td></tr>
</tbody></table></div>
<div class="box idea"><b>From the practical</b>Igneous rocks almost always have a <b>random</b> texture (crystals randomly oriented). An <b>oriented</b> texture (minerals aligned in sheets or layers) is typical of sedimentary and metamorphic rocks. <span class="chip">recording</span></div>
<h3>Drill: which texture?</h3>
<p>Streak: <b id="txstreak">0</b></p>
<div id="txdrill"></div>
<div class="chk" data-q="ig15"></div>
<div class="chk" data-q="ig17"></div>
<div class="chk" data-q="ig18"></div>`},
{t:"12 min",title:"Plutonic, volcanic and pyroclastic rocks",html:`
<div class="tw"><table><thead><tr><th></th><th>Plutonic rocks</th><th>Volcanic rocks</th></tr></thead><tbody>
<tr><td><b>Also called</b></td><td><b>Intrusive</b></td><td><b>Extrusive</b></td></tr>
<tr><td><b>Where</b></td><td>Magma "freezes" (crystallises) <b>beneath</b> the Earth's surface</td><td>Magma <b>erupts</b> on the surface</td></tr>
<tr><td><b>Cooling</b></td><td><b>Slow</b></td><td><b>Rapid</b></td></tr>
<tr><td><b>Texture</b></td><td>Phaneritic or porphyritic</td><td>Aphanitic, glassy, vesicular or porphyritic</td></tr>
<tr><td><b>Eruption</b></td><td></td><td>Explosive vs effusive, depending on the magma composition and gas content</td></tr>
</tbody></table></div>
<div class="box ana"><b>Analogy</b>Slow cooling = sugar crystals growing slowly in a jar for weeks (big crystals). Fast cooling = caramel poured on a cold plate (glassy, no crystals).</div>
<h3>Pyroclastic rocks</h3>
<ul><li><b>Fragmented volcanic material</b> ejected and deposited during <b>explosive eruptions</b>.</li><li>Made of volcanic <b>ash, lapilli, blocks or bombs</b>.</li><li><b>Clastic texture</b>: angular fragments, not interlocking crystals.</li><li>They sit on the boundary between igneous and sedimentary rocks. <span class="chip">recording</span></li></ul>
<h3>Slide the fragment size</h3>
<input type="range" id="pyro" min="0" max="100" step="1" value="10" aria-label="Fragment size">
<div class="out" id="pyroout"></div>
<div class="box trap"><b>Exam trap</b>Ash &lt; 2 mm → <b>tuff</b>. Lapilli 2–64 mm → <b>lapilli tuff / lapillistone</b>. Blocks and bombs &gt; 64 mm → <b>agglomerate or volcanic breccia</b>. Don't mix volcanic breccia with sedimentary breccia (lecture 4).</div>
<div class="chk" data-q="ig21"></div>
<div class="chk" data-q="ig23"></div>
<div class="chk" data-q="ig25"></div>`},
{t:"15 min",title:"Classifying igneous rocks: SiO₂ and QAPF",html:`
<h3>1. SiO₂ vs minerals diagram (the class activity)</h3>
<p>This diagram shows how the <b>mineral content</b> changes with <b>SiO₂</b> (70 % on the left to 40 % on the right), with the matching rock names on top:</p>
<div class="tw"><table><thead><tr><th>Volcanic</th><th>Rhyolite</th><th>Dacite</th><th>Andesite</th><th>Basalt</th><th>Komatiite</th></tr></thead><tbody>
<tr><td><b>Plutonic</b></td><td>Granite</td><td>Granodiorite</td><td>Diorite</td><td>Gabbro</td><td>Peridotite</td></tr>
<tr><td><b>Main minerals</b></td><td>Orthoclase (K-feldspar), quartz, Na-plagioclase, muscovite, biotite</td><td>Quartz, plagioclase, biotite, amphibole</td><td>Plagioclase, amphibole, biotite</td><td>Ca-plagioclase, pyroxene, (olivine)</td><td>Olivine, pyroxene</td></tr>
</tbody></table></div>
<div class="box teach"><b>Teacher said</b>"This isn't any classification diagram. It is just a tool, a hint" to see how mineralogy links to chemistry. In class you guessed olivine (bright green, far right) and quartz. <span class="chip">recording</span></div>
<h3>2. QAPF diagram (the official classification)</h3>
<ul><li>Classification based on the proportions of <b>Q</b> = quartz, <b>A</b> = alkali feldspar (K-feldspar), <b>P</b> = plagioclase, <b>F</b> = foid (feldspathoid).</li><li>Two diagrams: one for <b>plutonic</b>, one for <b>volcanic</b> rocks.</li><li>Quartz and foids never occur together: silica-saturated magma has quartz, silica-undersaturated (rarer) has foids. <span class="chip">recording</span></li></ul>
<p><b>What you need to know</b> (the simplified upper triangle). Tap anywhere inside the triangle:</p>
<div class="seg" id="qseg" role="group" aria-label="Rock type"><button data-k="p" aria-pressed="true">Plutonic</button><button data-k="v" aria-pressed="false">Volcanic</button></div>
<div id="qapf" style="margin-top:8px"></div>
<div class="out" id="qout">Tap inside the triangle.</div>
<div class="box teach"><b>Teacher said</b>"You don't have to remember all of it … all the different fields … But I want you to understand the principle, how these diagrams are formed." The closer a point is to a corner, the more of that mineral. <span class="chip">recording</span></div>
<div class="box skip"><b>Don't memorise (not tested)</b>The gabbroid diagram (plagioclase, orthopyroxene, clinopyroxene, olivine), the ultramafic diagram (olivine, opx, cpx), the table of chemical analyses, and the TAS diagrams (Na₂O+K₂O vs SiO₂). The teacher: "I don't want you to remember all these specifics." The chemistry matters for soil science, though.</div>
<div class="chk" data-q="ig29"></div>
<div class="chk" data-q="ig31"></div>
<div class="chk" data-q="ig33"></div>`},
{t:"15 min",title:"Intrusive bodies",html:`
<p>Bodies of magma that solidified <b>underground</b> (plutons). Two key words:</p>
<ul><li><b>Concordant</b> = follows the existing layers (goes <b>between</b> them).</li><li><b>Discordant</b> = <b>cuts across</b> the existing layers.</li></ul>
<div class="tw"><table><thead><tr><th>Body</th><th>What it is</th><th>Example</th></tr></thead><tbody>
<tr><td><b>Batholith</b></td><td>Large mass of intrusive rock formed deep in the crust; almost always felsic or intermediate (granite, quartz monzonite, diorite)</td><td>Sierra Nevada batholith, Half Dome (Yosemite)</td></tr>
<tr><td><b>Stock</b></td><td><b>Discordant</b> intrusion with surface exposure &lt; 100 km²; like a batholith but smaller (&lt; 20 km across); often the cupola of a hidden batholith</td><td>Syenitic stock, southern Israel</td></tr>
<tr><td><b>Lopolith</b></td><td>Large <b>lens</b>-shaped intrusion with a <b>depressed centre</b>; generally <b>concordant</b>; feeder dikes or funnels below; can be huge</td><td>Bushveld complex, South Africa (~66,000 km², 8 km thick); magmatic layering</td></tr>
<tr><td><b>Laccolith</b></td><td><b>Concordant</b> sheet intrusion injected between two sedimentary layers; magma pressure <b>pushes the layers up</b> into a dome or mushroom shape with a flat base</td><td>Enchanted Rock, Texas</td></tr>
<tr><td><b>Sill</b></td><td>Tabular sheet intruded <b>between</b> older layers (or along foliation); <b>concordant</b>: does not cut across beds</td><td>Basaltic sill, Yellowstone</td></tr>
<tr><td><b>Dike (dyke)</b></td><td><b>Discordant</b> tabular body: magma forced into <b>cracks that cut across</b> the layers</td><td>Pegmatite dykes, Connecticut</td></tr>
</tbody></table></div>
<div class="box teach"><b>From the recording</b>In a lopolith, crystals that form first sink and pile up in layers (<b>magmatic layering</b>). Layers of e.g. chromite can be mined. <span class="chip">recording</span></div>
<div class="box ana"><b>Memory trick</b><b>S</b>ill = <b>S</b>andwich filling (lies between the layers). <b>D</b>ike = <b>D</b>iagonal crack (cuts through). <b>Lacco</b>lith lifts the roof like a mushroom cap; <b>Lopo</b>lith sags like a bowl (lopo- = basin).</div>
<div class="box trap"><b>Exam trap</b>Sill vs dike is the classic question: both are flat sheets; the sill is <b>concordant</b>, the dike <b>discordant</b>. A stock is <b>discordant</b>; laccoliths and lopoliths are <b>concordant</b>.</div>
<h3>Sort them: concordant or discordant?</h3>
<div id="cdsorter"></div>
<div class="chk" data-q="ig36"></div>
<div class="chk" data-q="ig38"></div>
<div class="chk" data-q="ig41"></div>`},
{t:"12 min",title:"Volcanic landforms and structures",html:`
<div class="tw"><table><thead><tr><th>Landform</th><th>What it looks like</th><th>Magma</th><th>Example</th></tr></thead><tbody>
<tr><td><b>Shield volcano</b></td><td>Broad, gentle slopes</td><td>Fluid <b>basaltic</b> lava</td><td>Hawaii</td></tr>
<tr><td><b>Stratovolcano</b></td><td>Steep slopes, layered lava, ash and debris</td><td>Often <b>andesitic</b></td><td>Mt Fuji, Japan</td></tr>
<tr><td><b>Lava dome</b></td><td>Steep-sided dome; may collapse explosively</td><td>Viscous, often <b>rhyolitic</b></td><td>Chaitén, Chile</td></tr>
<tr><td><b>Cinder cone</b></td><td>Steep conical hill of loose pyroclastic fragments</td><td>Pyroclastic</td><td>Mt Aso, Japan</td></tr>
<tr><td><b>Caldera</b></td><td>Large depression formed by <b>collapse</b> after magma withdrawal</td><td>Any</td><td>Caldera Blanca, Canary Islands</td></tr>
</tbody></table></div>
<h3>Volcanic structures</h3>
<ul><li><b>Pillow lava</b>: bulbous, rounded lava forms produced during <b>underwater eruptions</b> (Oamaru, New Zealand). If you find pillows, the lava erupted under water. <span class="chip">recording</span></li><li><b>Columnar jointing</b>: polygonal columns formed by <b>contraction during cooling</b>, common in basalt (Giant's Causeway, Northern Ireland). It forms when the rock is already solid but still cooling. <span class="chip">recording</span></li></ul>
<div class="box ana"><b>Analogy</b>Runny pancake batter spreads into a flat wide pancake (shield volcano). Thick dough piles up into a steep blob (lava dome). Columnar jointing is like mud cracking into polygons as it dries and shrinks.</div>
<div class="box idea"><b>Links</b>Pillow lavas are a layer of the oceanic crust (lecture 6). Columnar jointing also occurs in Czechia's Tertiary volcanoes (the teacher mentioned local examples). <span class="chip">recording</span></div>
<h3>Match the magma to the landform</h3>
<div id="lfsorter"></div>
<div class="chk" data-q="ig44"></div>
<div class="chk" data-q="ig46"></div>
<div class="chk" data-q="ig49"></div>`},
{t:"15 min",title:"The plutonic rocks",html:`
<div class="box teach"><b>Teacher said</b>He listed the plutonic rocks and said "the last plutonic rock that I want you to know is peridotite". Individual rocks are practised in the practicals. <span class="chip">recording</span></div>
<div class="row" style="margin:8px 0"><button class="ghost" data-toggle="hide" data-target="t-plut">Test myself (blur answers)</button></div>
<div class="tw" id="t-plut"></div>
<div class="box idea"><b>From the practical: telling them apart</b>"The darker the rock is, the more mafic it is": granite → granodiorite → diorite → gabbro get darker. Gabbro has mostly <b>pyroxene</b>, diorite mostly <b>amphibole</b>; both are black, so they look alike. In the practical exam, mixing up granite and granodiorite (or gabbro and diorite) is OK, but calling a gabbro a granite is not. <span class="chip">recording</span></div>
<div class="box ana"><b>Memory trick</b>Light to dark, plutonic: "<b>G</b>reat <b>G</b>rannies <b>D</b>rink <b>G</b>reen <b>P</b>otions" = Granite, Granodiorite, Diorite, Gabbro, Peridotite.</div>
<div class="box trap"><b>Exam trap</b>Peridotite is <b>ultramafic</b> (&lt; 45 % SiO₂) and green because of <b>olivine</b>. It is the rock of the <b>mantle</b> (lecture 6), sometimes brought up as xenoliths in basalt.</div>
<div class="chk" data-q="ig52"></div>
<div class="chk" data-q="ig54"></div>
<div class="chk" data-q="ig56"></div>`},
{t:"15 min",title:"Volcanic rocks and pegmatite",html:`
<p>Each volcanic rock has a <b>plutonic twin</b> with the same chemistry. Only the cooling (and so the grain size) differs.</p>
<div class="row" style="margin:8px 0"><button class="ghost" data-toggle="hide" data-target="t-volc">Test myself (blur answers)</button></div>
<div class="tw" id="t-volc"></div>
<h3>Pegmatite</h3>
<ul><li>Plutonic, typically in <b>dikes</b>; SiO₂ variable (usually <b>felsic</b>); light-coloured.</li><li><b>Very coarse-grained</b>: huge crystals of quartz, K-feldspar, plagioclase, ± muscovite, ± tourmaline.</li><li>Source of special minerals, e.g. <b>spodumene, the main ore of lithium</b>. <span class="chip">recording</span></li><li>In the practical: the black crystals in pegmatite are <b>tourmaline</b>, not amphibole or pyroxene. <span class="chip">recording</span></li></ul>
<div class="box idea"><b>From the practical</b>Rhyolite usually shows a few crystals you can see (porphyritic) plus shards of glass. <b>Obsidian</b> is a rock made entirely of volcanic glass. Basalt feels heavier (denser) than granite. <span class="chip">recording</span></div>
<h3>Find the twin</h3>
<p>Streak: <b id="twstreak">0</b> (aim for 8)</p>
<div id="twdrill"></div>
<div class="chk" data-q="ig60"></div>
<div class="chk" data-q="ig62"></div>
<div class="chk" data-q="ig65"></div>`}
];

var Q=[
{id:"ig1",q:"What does \"igneous\" mean?",h:"A synonym: think of magma.",o:["Magmatic","Changed","Deposited","Layered"],e:"Igneous = magmatic. Metamorphic = changed, sedimentary = deposited and lithified."},
{id:"ig2",q:"What is petrology?",h:"Petra = rock.",o:["The study of rocks and their formative processes","The study of fossils","The study of minerals only","The study of earthquakes"],e:"Petrology = study of rocks and how they form."},
{id:"ig3",fol:1,q:"What is the teacher's compositional definition of magma?",h:"Three phases.",o:["Molten silicate material containing liquid, solid and gas phases","Pure liquid rock with no crystals","Solid rock deep in the mantle","Volcanic ash in the air"],e:"Magma = molten silicate with liquid, solid and gas phases."},
{id:"ig4",q:"What forms the solid phase of magma?",h:"Three sources.",o:["Crystallising crystals, residue after partial melting, and xenoliths from the surrounding rock","Only ice crystals","Only gas bubbles","Only volcanic glass"],e:"Solids: crystals growing, unmelted residue, and captured fragments (xenoliths)."},
{id:"ig5",y:1,q:"Why do gas bubbles form in magma and cause eruptions?",h:"Opening a can of soda.",o:["Pressure decreases as magma rises, so dissolved volatiles form bubbles","The magma cools and freezes","Water from the ocean enters the magma","Crystals melt"],e:"At depth gases are dissolved; with lower pressure near the surface they form bubbles and can explode."},
{id:"ig6",q:"Which gases (volatiles) are named in magma?",h:"Water and more.",o:["H₂O, CO₂, H₂S, Cl","O₂ and N₂ only","Helium and neon","Methane only"],e:"Volatiles: H₂O, CO₂, H₂S, Cl…"},
{id:"ig7",q:"What are xenoliths in magma?",h:"Xeno = foreign.",o:["Fragments assimilated from the surrounding rock","Gas bubbles","Glass shards","Newly grown crystals"],e:"Xenoliths are pieces of the surrounding rock carried in the magma."},
{id:"ig8",fol:1,q:"Which magma type has the highest SiO₂, lowest temperature and highest viscosity?",h:"Light and sticky.",o:["Felsic","Intermediate","Mafic","Ultramafic"],e:"Felsic: high SiO₂, Na₂O, K₂O; low density and temperature; high viscosity; highly explosive."},
{id:"ig9",fol:1,q:"Which magma type is effusive, with low viscosity, and forms shield volcanoes?",h:"Basalt.",o:["Mafic","Felsic","Intermediate","None of them"],e:"Mafic: low SiO₂, high FeO, MgO, CaO, low gas, high temperature, low viscosity, effusive; basalt, gabbro; shield volcanoes."},
{id:"ig10",fol:1,q:"Which rocks belong to the intermediate magma type?",h:"Stratovolcanoes.",o:["Andesite and diorite","Rhyolite and granite","Basalt and gabbro","Peridotite and komatiite"],e:"Intermediate: andesite (volcanic) and diorite (plutonic); stratovolcanoes."},
{id:"ig11",fol:1,q:"What are the key minerals of ultramafic magma?",h:"Green.",o:["Olivine and pyroxene","Quartz and K-feldspar","Plagioclase and amphibole","Calcite and dolomite"],e:"Ultramafic: olivine, pyroxene; picrite, komatiite, peridotite."},
{id:"ig12",y:1,q:"Why does felsic magma tend to erupt explosively?",h:"Two properties.",o:["High gas content and high viscosity","Low gas content and low viscosity","It is very hot","It is very dense"],e:"Sticky magma traps lots of gas, which escapes violently."},
{id:"ig13",q:"Which magma is hotter at eruption?",h:"~1160 vs ~900 °C.",o:["Basaltic (about 1160 °C)","Rhyolitic (about 900 °C)","Both the same","Andesitic is always hottest"],e:"Basalt ~1160 °C; rhyolite ~900 °C."},
{id:"ig14",q:"Which landform is typical of felsic magma?",h:"Too sticky to flow.",o:["Lava domes","Shield volcanoes","Pillow lavas","Mid-ocean ridges"],e:"Felsic → lava domes; intermediate → stratovolcanoes; mafic → shield volcanoes."},
{id:"ig15",fol:1,q:"What are the three main properties used to identify and classify igneous rocks?",h:"Colour is secondary.",o:["Texture, mineral composition, chemical composition","Colour, weight, smell","Age, size, location","Hardness, streak, luster"],e:"Texture, mineral composition and chemical composition. Colour, density, structure etc. help too."},
{id:"ig16",q:"What does 'texture' mean for a rock?",h:"Not how it feels.",o:["The grain size and arrangement of the minerals","How smooth it feels to touch","Its colour","Its chemical formula"],e:"Texture = grain size and arrangement of minerals."},
{id:"ig17",fol:1,q:"What is a porphyritic texture?",h:"Big in small.",o:["Larger crystals in a fine-grained matrix","Only glass","Bubbles in the rock","All crystals the same large size"],e:"Porphyritic: larger crystals (phenocrysts) in a fine-grained groundmass."},
{id:"ig18",fol:1,q:"Which texture has bubbles?",h:"Vesicles.",o:["Vesicular","Phaneritic","Glassy","Porphyritic"],e:"Vesicular texture: preserved gas bubbles, typical of volcanic rocks."},
{id:"ig19",q:"Which rock has a glassy texture?",h:"Black volcanic glass.",o:["Obsidian","Granite","Gabbro","Pegmatite"],e:"Obsidian is a rock made entirely of volcanic glass."},
{id:"ig20",q:"Which texture is typical of plutonic rocks?",h:"Slow cooling.",o:["Phaneritic (coarse-grained) or porphyritic","Glassy","Vesicular","Pyroclastic"],e:"Plutonic: slow cooling → phaneritic or porphyritic."},
{id:"ig21",fol:1,q:"What is another name for plutonic rocks?",h:"In-.",o:["Intrusive","Extrusive","Pyroclastic","Sedimentary"],e:"Plutonic = intrusive: magma crystallises below the surface."},
{id:"ig22",fol:1,q:"What is another name for volcanic rocks?",h:"Ex-.",o:["Extrusive","Intrusive","Metamorphic","Clastic"],e:"Volcanic = extrusive: magma erupts on the surface."},
{id:"ig23",fol:1,y:1,q:"Why do volcanic rocks have fine-grained or glassy textures?",h:"Time to grow.",o:["Rapid cooling at the surface leaves no time for big crystals","Slow cooling underground","High pressure crushes them","They contain no minerals"],e:"Rapid cooling → aphanitic, glassy or vesicular textures."},
{id:"ig24",q:"Which textures can volcanic rocks have?",h:"Four textures.",o:["Aphanitic, glassy, vesicular or porphyritic","Only phaneritic","Only foliated","Only clastic"],e:"Volcanic: aphanitic, glassy, vesicular or porphyritic."},
{id:"ig25",fol:1,q:"Volcanic ash (< 2 mm) forms which rock?",h:"Soft volcanic rock.",o:["Tuff","Agglomerate","Pegmatite","Basalt"],e:"Ash → tuff; lapilli → lapilli tuff; blocks and bombs → agglomerate or volcanic breccia."},
{id:"ig26",q:"What size are lapilli?",h:"Between ash and bombs.",o:["2–64 mm","< 2 mm","> 64 mm","> 1 m"],e:"Lapilli are 2–64 mm and form lapilli tuff or lapillistone."},
{id:"ig27",q:"Blocks and bombs (> 64 mm) form which rocks?",h:"Two names.",o:["Agglomerate or volcanic breccia","Tuff","Obsidian","Pumice"],e:"Blocks and bombs > 64 mm → agglomerate or volcanic breccia."},
{id:"ig28",q:"What texture do pyroclastic rocks have?",h:"Fragments.",o:["Clastic texture of angular fragments","Interlocking crystals","Glassy only","Foliated"],e:"Pyroclastic rocks have a clastic texture: angular fragments, not interlocking crystals."},
{id:"ig29",fol:1,q:"What do Q, A, P and F stand for in the QAPF diagram?",h:"Four minerals.",o:["Quartz, alkali feldspar, plagioclase, foid","Quartz, amphibole, pyroxene, feldspar","Quartz, apatite, pyrite, fluorite","Quartz, andesite, peridotite, felsite"],e:"Q quartz, A alkali feldspar (K-feldspar), P plagioclase, F foid (feldspathoid)."},
{id:"ig30",q:"How many QAPF diagrams are there?",h:"One for each kind of igneous rock.",o:["Two: one for plutonic, one for volcanic rocks","One for all rocks","Four","Seven"],e:"Separate QAPF diagrams for plutonic and volcanic rocks."},
{id:"ig31",fol:1,q:"In the QAPF diagram you need to know, which plutonic rock lies on the alkali-feldspar side, with plenty of quartz?",h:"The most common felsic plutonic rock.",o:["Granite","Diorite","Gabbro","Peridotite"],e:"Granite (volcanic: rhyolite). Towards plagioclase: granodiorite/tonalite (dacite); at the plagioclase corner with little quartz: diorite/gabbro (andesite/basalt)."},
{id:"ig32",q:"Which pair sits at the plagioclase corner with little quartz in the plutonic QAPF?",h:"Intermediate and mafic.",o:["Diorite / gabbro","Granite / rhyolite","Granodiorite / tonalite","Peridotite / komatiite"],e:"Diorite/gabbro (volcanic: andesite/basalt)."},
{id:"ig33",y:1,q:"What does the teacher want you to know about the QAPF diagram?",h:"Not the fields by heart.",o:["The principle: the closer to a corner, the more of that mineral","All fields by heart","Only the foid corner","Nothing, it is not tested"],e:"He said you don't need all the fields, but you must understand the principle."},
{id:"ig34",q:"Which diagrams are NOT tested?",h:"Chemistry and mafic rocks.",o:["Gabbroid, ultramafic and TAS diagrams, and the chemical analyses table","The QAPF 'what you need to know' diagram","The SiO₂ vs minerals diagram","The plutonic rock cards"],e:"Gabbroid, ultramafic, TAS and the chemistry table are extras and not tested."},
{id:"ig35",q:"What is the SiO₂ vs mineral volume diagram, according to the teacher?",h:"Not official.",o:["A tool or hint, not a classification diagram","The official classification","A metamorphic facies diagram","A TAS diagram"],e:"He said: \"This isn't any classification diagram. It is just a tool, a hint.\""},
{id:"ig36",fol:1,q:"What is the difference between a sill and a dike?",h:"Between vs across.",o:["A sill lies between layers (concordant); a dike cuts across them (discordant)","A sill cuts across; a dike lies between","Both cut across","Sills are volcanic; dikes are sedimentary"],e:"Sill = concordant sheet; dike = discordant sheet in cracks."},
{id:"ig37",fol:1,q:"What is a batholith?",h:"The biggest.",o:["A large mass of intrusive rock formed deep in the crust, mostly felsic or intermediate","A small pipe of basalt","A volcanic crater","A layer of ash"],e:"Batholiths: large, mostly granite, quartz monzonite or diorite; e.g. Sierra Nevada."},
{id:"ig38",fol:1,q:"Which intrusion pushes the overlying layers up into a dome or mushroom shape?",h:"Lifts the roof.",o:["Laccolith","Lopolith","Dike","Stock"],e:"Laccolith: concordant, between sedimentary layers, dome shape with flat base (Enchanted Rock)."},
{id:"ig39",q:"Which intrusion is lens-shaped with a depressed (sagging) centre?",h:"A bowl.",o:["Lopolith","Laccolith","Sill","Batholith"],e:"Lopolith: large, lenticular, depressed centre, generally concordant (Bushveld)."},
{id:"ig40",q:"What is a stock?",h:"Small batholith.",o:["A discordant intrusion with surface exposure under 100 km²","A huge lens with a sagging centre","A flat sheet between layers","A volcanic cone of ash"],e:"Stock: like a batholith but smaller; often the cupola of a hidden batholith."},
{id:"ig41",fol:1,q:"Which intrusion is discordant?",h:"Cuts across.",o:["Dike","Sill","Laccolith","Lopolith"],e:"Dikes (and stocks) are discordant. Sills, laccoliths and lopoliths are concordant."},
{id:"ig42",q:"Which example is a lopolith with magmatic layering?",h:"South Africa.",o:["Bushveld complex","Sierra Nevada","Enchanted Rock","Mt Fuji"],e:"Bushveld: ~66,000 km², exposed thickness 8 km."},
{id:"ig43",y:1,q:"Why can magmatic layering in a lopolith be economically important?",h:"Mining.",o:["Layers of minerals like chromite can be easily found and mined","It makes the rock waterproof","It produces diamonds","It causes earthquakes"],e:"Crystals settle in layers; some layers (e.g. chromite) are ores."},
{id:"ig44",fol:1,q:"Which volcano has broad, gentle slopes made of fluid basaltic lava?",h:"Hawaii.",o:["Shield volcano","Stratovolcano","Lava dome","Cinder cone"],e:"Shield volcanoes, like Hawaii, form from runny basaltic lava."},
{id:"ig45",fol:1,q:"Which volcano is steep and layered with lava, ash and debris, often andesitic?",h:"Mt Fuji.",o:["Stratovolcano","Shield volcano","Caldera","Pillow lava"],e:"Stratovolcano: steep, layered, often andesitic."},
{id:"ig46",fol:1,q:"What is a caldera?",h:"Collapse.",o:["A large depression formed by collapse after magma withdrawal","A steep cone of ash","A dome of rhyolite","An underwater lava flow"],e:"Caldera = large collapse depression (Caldera Blanca)."},
{id:"ig47",q:"What is a cinder cone?",h:"Loose fragments.",o:["A steep conical hill made of loose pyroclastic fragments","A broad basaltic volcano","A collapse crater","A dome of viscous lava"],e:"Cinder cone: loose pyroclastic fragments, e.g. Mt Aso."},
{id:"ig48",q:"What is a lava dome?",h:"Too viscous to flow.",o:["A steep-sided dome of viscous, often rhyolitic lava that may collapse explosively","A broad shield of basalt","A sill","A cinder cone"],e:"Lava dome: viscous, rhyolitic, e.g. Chaitén."},
{id:"ig49",fol:1,y:1,q:"What do pillow lavas tell you?",h:"Where did it erupt?",o:["The lava erupted under water","The lava erupted in a desert","The rock is metamorphic","The magma was felsic"],e:"Pillow lavas are rounded forms produced by underwater eruptions."},
{id:"ig50",fol:1,y:1,q:"How does columnar jointing form?",h:"Shrinking.",o:["By contraction during cooling, forming polygonal columns","By erosion of rivers","By crystals settling in layers","By wind abrasion"],e:"Columnar jointing: cooling contraction, common in basalt (Giant's Causeway)."},
{id:"ig51",q:"Where is the famous example of columnar jointing?",h:"Northern Ireland.",o:["Giant's Causeway","Mt Fuji","Half Dome","Bushveld"],e:"Giant's Causeway, Northern Ireland."},
{id:"ig52",fol:1,q:"What is the SiO₂ content and type of granite?",h:"Felsic plutonic.",o:["~70–77 %, felsic, plutonic","~45–52 %, mafic, volcanic","< 45 %, ultramafic, plutonic","~55–63 %, intermediate, volcanic"],e:"Granite: plutonic, ~70–77 % SiO₂ (felsic), light-coloured."},
{id:"ig53",fol:1,q:"Which minerals make up granite?",h:"Four plus maybe a white mica.",o:["Quartz, K-feldspar, plagioclase, biotite, ± muscovite","Olivine and pyroxene","Plagioclase and pyroxene","Calcite and dolomite"],e:"Granite: quartz, K-feldspar (often pink), plagioclase (white), biotite (black), ± muscovite."},
{id:"ig54",fol:1,q:"Which plutonic rock is \"pepper and salt\", intermediate?",h:"Between granodiorite and gabbro.",o:["Diorite","Granite","Peridotite","Pegmatite"],e:"Diorite: ~55–63 % SiO₂; plagioclase, amphibole, biotite, ± pyroxene."},
{id:"ig55",fol:1,q:"Which plutonic rock is mafic, dark grey to black, with plagioclase and pyroxene?",h:"Twin of basalt.",o:["Gabbro","Granite","Diorite","Rhyolite"],e:"Gabbro: ~45–52 % SiO₂; plagioclase, pyroxene, ± olivine, ± amphibole."},
{id:"ig56",fol:1,q:"Which rock is ultramafic (< 45 % SiO₂), dark green, made of olivine and pyroxene?",h:"Mantle rock.",o:["Peridotite","Gabbro","Basalt","Andesite"],e:"Peridotite: ultramafic; olivine, pyroxene, ± amphibole, ± spinel, ± garnet."},
{id:"ig57",q:"What is the SiO₂ content of granodiorite / tonalite?",h:"Felsic to intermediate.",o:["~63–70 %","~70–77 %","~45–52 %","< 45 %"],e:"Granodiorite/tonalite: ~63–70 %, light to medium grey."},
{id:"ig58",y:1,q:"In the practical, what is the easiest way to tell granite, granodiorite, diorite and gabbro apart?",h:"Colour index.",o:["The darker the rock, the more mafic it is","The heavier, the more felsic","Only by acid reaction","By the smell"],e:"Darker = more dark minerals (biotite, amphibole, pyroxene) = more mafic."},
{id:"ig59",q:"What dark mineral dominates in gabbro, and which in diorite?",h:"Both black.",o:["Gabbro: pyroxene; diorite: amphibole","Gabbro: amphibole; diorite: pyroxene","Both: olivine","Both: biotite"],e:"From the practical: gabbro mostly pyroxene, diorite mostly amphibole."},
{id:"ig60",fol:1,q:"What is the volcanic equivalent of granite?",h:"Same chemistry, fast cooling.",o:["Rhyolite","Basalt","Andesite","Dacite"],e:"Granite ↔ rhyolite; granodiorite ↔ dacite; diorite ↔ andesite; gabbro ↔ basalt."},
{id:"ig61",fol:1,q:"What is the volcanic equivalent of gabbro?",h:"Dark lava.",o:["Basalt","Rhyolite","Dacite","Obsidian"],e:"Gabbro ↔ basalt (~45–52 % SiO₂, mafic)."},
{id:"ig62",fol:1,q:"What is the volcanic equivalent of diorite?",h:"Andes.",o:["Andesite","Dacite","Basalt","Rhyolite"],e:"Diorite ↔ andesite (intermediate)."},
{id:"ig63",q:"What is the volcanic equivalent of granodiorite / tonalite?",h:"Felsic to intermediate.",o:["Dacite","Andesite","Basalt","Komatiite"],e:"Granodiorite/tonalite ↔ dacite."},
{id:"ig64",q:"What colour is rhyolite?",h:"Like granite, sometimes reddish.",o:["Light to red: white, pink, orange, grey","Dark grey to black","Dark green","Always pure black"],e:"Rhyolite: light- to red-coloured."},
{id:"ig65",fol:1,q:"What is special about pegmatite?",h:"Huge crystals.",o:["Very coarse-grained; forms in dikes; source of minerals like spodumene (lithium)","Glassy with no crystals","Ultramafic mantle rock","Fine-grained volcanic rock"],e:"Pegmatite: very coarse, usually felsic, often with tourmaline; spodumene = main lithium ore."},
{id:"ig66",q:"Which mineral in pegmatite is the main ore of lithium?",h:"From lecture 2's yellow list.",o:["Spodumene","Tourmaline","Quartz","Biotite"],e:"Spodumene, found in Li-rich pegmatites."},
{id:"ig67",q:"What are the black crystals in pegmatite, according to the practical?",h:"Not amphibole.",o:["Tourmaline","Pyroxene","Olivine","Magnetite"],e:"In pegmatites the dark mineral is usually tourmaline (schorl)."},
{id:"ig68",q:"Which minerals make up basalt?",h:"Same as gabbro.",o:["Plagioclase, pyroxene, ± olivine, ± amphibole","Quartz, K-feldspar, muscovite","Calcite only","Olivine only"],e:"Basalt: plagioclase, pyroxene, ± olivine, ± amphibole."},
{id:"ig69",q:"Which list is ordered from felsic to ultramafic (plutonic)?",h:"Light to dark.",o:["Granite, granodiorite, diorite, gabbro, peridotite","Peridotite, gabbro, diorite, granodiorite, granite","Gabbro, granite, peridotite, diorite, granodiorite","Diorite, granite, gabbro, peridotite, granodiorite"],e:"Great Grannies Drink Green Potions."},
{id:"ig70",q:"Which rock is ultramafic and volcanic?",h:"Two names: komatiite and…",o:["Picrite / komatiite","Rhyolite","Dacite","Andesite"],e:"Ultramafic: picrite, komatiite (volcanic), peridotite (plutonic)."}
];

var VOC=[
["Basics","Igneous","Formed from magma. Same as magmatic."],
["Basics","Magmatic","Formed from magma. Same as igneous."],
["Basics","Petrology","The study of rocks and their formative processes."],
["Basics","Magma","Molten silicate material containing liquid, solid and gas phases, below or within the crust."],
["Basics","Lava","Magma that has reached the surface."],
["Basics","Viscosity","Resistance to flow. Felsic magma is very viscous; basaltic magma is runny."],
["Basics","Viscous","Thick and slow-flowing, like honey."],
["Basics","Volatiles","Gas components dissolved in magma: H₂O, CO₂, H₂S, Cl…"],
["Basics","Xenolith","A fragment of the surrounding rock carried inside magma."],
["Basics","Partial melting","Only part of a rock melts; the unmelted residue can stay in the magma."],
["Basics","Crystallise","To form crystals as magma cools."],
["Magma types","Felsic","High SiO₂, Na₂O, K₂O; light-coloured; viscous; explosive (granite, rhyolite)."],
["Magma types","Intermediate","Average composition between felsic and mafic (diorite, andesite)."],
["Magma types","Mafic","Low SiO₂, high FeO, MgO, CaO; dark; runny; effusive (basalt, gabbro)."],
["Magma types","Ultramafic","Very low SiO₂, very rich in Fe and Mg; olivine and pyroxene (peridotite)."],
["Magma types","SiO₂ content","Silica content in weight percent (wt %). Controls the magma type."],
["Magma types","Explosive eruption","A violent eruption driven by gas in viscous magma."],
["Magma types","Effusive eruption","A calm eruption where runny lava flows out."],
["Description","Texture","Grain size and arrangement of minerals in a rock (not how it feels)."],
["Description","Mineral composition","Which minerals a rock contains and how much."],
["Description","Chemical composition","The rock's chemistry, e.g. % SiO₂."],
["Description","Field relationships","How a rock body sits relative to other rocks in the field."],
["Description","Magnetic anisotropy","A measured direction-dependent magnetism, e.g. showing magma flow (advanced)."],
["Description","Phaneritic","Coarse-grained: crystals visible by eye. Plutonic rocks."],
["Description","Aphanitic","Fine-grained: crystals too small to see. Volcanic rocks."],
["Description","Porphyritic","Larger crystals in a fine-grained matrix."],
["Description","Phenocryst","A large crystal in a porphyritic rock."],
["Description","Glassy","No crystals, only volcanic glass (obsidian)."],
["Description","Vesicular","Full of gas bubbles (vesicles)."],
["Description","Random texture","Crystals randomly oriented; typical of igneous rocks."],
["Description","Oriented texture","Minerals aligned in sheets or layers; typical of sedimentary and metamorphic rocks."],
["Rock groups","Plutonic","Intrusive: magma crystallised beneath the surface, slow cooling, coarse-grained."],
["Rock groups","Intrusive","Same as plutonic: formed inside the Earth."],
["Rock groups","Volcanic","Extrusive: magma erupted on the surface, rapid cooling, fine-grained or glassy."],
["Rock groups","Extrusive","Same as volcanic: formed on the surface."],
["Rock groups","Pyroclastic","Fragmented volcanic material ejected in explosive eruptions."],
["Rock groups","Volcanic ash","Pyroclastic fragments < 2 mm. Forms tuff."],
["Rock groups","Lapilli","Pyroclastic fragments 2–64 mm."],
["Rock groups","Volcanic bombs and blocks","Pyroclastic fragments > 64 mm."],
["Rock groups","Tuff","Rock made of volcanic ash."],
["Rock groups","Agglomerate / volcanic breccia","Rock made of volcanic blocks and bombs."],
["Classification","QAPF diagram","Classification by the proportions of quartz, alkali feldspar, plagioclase and foid."],
["Classification","Alkali feldspar","K-feldspar (orthoclase); the A corner of QAPF."],
["Classification","Foid (feldspathoid)","Mineral of silica-undersaturated magma; never together with quartz."],
["Classification","Silica-saturated","Magma with enough silica to form quartz (common)."],
["Classification","Silica-undersaturated","Magma with too little silica; forms foids instead of quartz (rare)."],
["Classification","TAS diagram","Total alkali (Na₂O+K₂O) vs silica classification. (yellow, not tested)"],
["Intrusions","Pluton","Any body of intrusive igneous rock."],
["Intrusions","Concordant","Following (parallel to) the existing layers."],
["Intrusions","Discordant","Cutting across the existing layers."],
["Intrusions","Batholith","Large mass of intrusive rock deep in the crust; mostly felsic or intermediate."],
["Intrusions","Stock","Discordant intrusion with < 100 km² exposure; a small batholith."],
["Intrusions","Cupola","The dome-shaped top of a buried batholith; a stock is often one."],
["Intrusions","Lopolith","Large lens-shaped, generally concordant intrusion with a sagging centre (Bushveld)."],
["Intrusions","Laccolith","Concordant intrusion that pushes overlying layers up into a dome (Enchanted Rock)."],
["Intrusions","Sill","Concordant tabular sheet between existing layers."],
["Intrusions","Dike (dyke)","Discordant tabular sheet that cuts across layers through cracks."],
["Intrusions","Magmatic layering","Layers formed as crystals settle in a magma chamber (e.g. chromite layers)."],
["Intrusions","Magma chamber","A body of magma underground."],
["Landforms","Shield volcano","Broad, gentle volcano of fluid basaltic lava (Hawaii)."],
["Landforms","Stratovolcano","Steep, layered volcano of lava, ash and debris; often andesitic (Mt Fuji)."],
["Landforms","Lava dome","Steep-sided dome of viscous, often rhyolitic lava (Chaitén)."],
["Landforms","Cinder cone","Steep conical hill of loose pyroclastic fragments (Mt Aso)."],
["Landforms","Caldera","Large depression formed by collapse after magma withdrawal."],
["Landforms","Pillow lava","Rounded lava forms from underwater eruptions."],
["Landforms","Columnar jointing","Polygonal columns from cooling contraction, common in basalt."],
["Rocks","Granite","Plutonic, felsic (~70–77 % SiO₂): quartz, K-feldspar, plagioclase, biotite."],
["Rocks","Granodiorite / tonalite","Plutonic, felsic–intermediate (~63–70 %): plagioclase, quartz, biotite, amphibole."],
["Rocks","Diorite","Plutonic, intermediate (~55–63 %), pepper and salt: plagioclase, amphibole, biotite."],
["Rocks","Gabbro","Plutonic, mafic (~45–52 %), dark: plagioclase, pyroxene."],
["Rocks","Peridotite","Plutonic, ultramafic (< 45 %), dark green: olivine, pyroxene."],
["Rocks","Rhyolite","Volcanic twin of granite."],
["Rocks","Dacite","Volcanic twin of granodiorite / tonalite."],
["Rocks","Andesite","Volcanic twin of diorite."],
["Rocks","Basalt","Volcanic twin of gabbro."],
["Rocks","Komatiite / picrite","Ultramafic volcanic rocks."],
["Rocks","Obsidian","Volcanic glass."],
["Rocks","Pegmatite","Very coarse-grained, usually felsic dike rock; can contain spodumene (Li ore) and tourmaline."]
];
var VCON=[["Igneous","Magmatic"],["Plutonic","Intrusive","Pluton"],["Volcanic","Extrusive","Lava"],["Phaneritic","Aphanitic","Porphyritic","Phenocryst"],["Concordant","Discordant","Sill","Dike (dyke)"],["Laccolith","Lopolith","Batholith","Stock","Cupola"],["Felsic","Granite","Rhyolite"],["Mafic","Basalt","Gabbro"],["Ultramafic","Peridotite","Komatiite / picrite"],["Intermediate","Diorite","Andesite"],["Granodiorite / tonalite","Dacite"],["Tuff","Volcanic ash"],["Agglomerate / volcanic breccia","Volcanic bombs and blocks","Lapilli"],["Viscosity","Viscous"],["Silica-saturated","Silica-undersaturated","Foid (feldspathoid)"],["Random texture","Oriented texture"],["Explosive eruption","Effusive eruption"],["Shield volcano","Stratovolcano","Lava dome","Cinder cone","Caldera"],["Glassy","Obsidian"]];

var SHEET=[
 ["Magma",["Item","Fact"],[["Igneous","= magmatic"],["Magma","Molten silicate with liquid, solid and gas phases"],["Liquid","Viscous, mostly silicate"],["Solid","Crystals, partial-melting residue, xenoliths"],["Gas","H₂O, CO₂, H₂S, Cl; form with pressure decrease; cause eruptions"]]],
 ["Magma types",["Type","Facts"],[["Felsic","High SiO₂, Na₂O, K₂O; high gas; low density and T; high viscosity; highly explosive; quartz, K-feldspar, plagioclase, mica; rhyolite, granite; lava domes"],["Intermediate","Average; rather explosive; quartz, plagioclase, amphibole; andesite, diorite; stratovolcanoes"],["Mafic","Low SiO₂; high FeO, MgO, CaO; low gas; high density and T; low viscosity; effusive; plagioclase, amphibole, pyroxene; basalt, gabbro; shield volcanoes"],["Ultramafic","Very low SiO₂; very low viscosity; olivine, pyroxene; picrite, komatiite, peridotite"],["Numbers","Basalt ~1160 °C, rhyolite ~900 °C"]]],
 ["Texture and rock groups",["Item","Fact"],[["Main properties","Texture, mineral composition, chemical composition"],["Texture","Grain size and arrangement of minerals"],["Plutonic","= intrusive; slow cooling; phaneritic or porphyritic"],["Volcanic","= extrusive; rapid cooling; aphanitic, glassy, vesicular or porphyritic"],["Pyroclastic","Explosive fragments; clastic texture; ash < 2 mm → tuff; lapilli 2–64 mm → lapilli tuff; blocks/bombs > 64 mm → agglomerate / volcanic breccia"]]],
 ["Classification",["Diagram","Fact"],[["SiO₂ vs minerals","A tool, not a classification: K-feldspar, quartz, plagioclase (Na→Ca), micas, amphibole, pyroxene, olivine"],["QAPF","Quartz, alkali feldspar, plagioclase, foid; plutonic and volcanic versions"],["Need to know","Granite (rhyolite); granodiorite/tonalite (dacite); diorite/gabbro (andesite/basalt)"],["Not tested","Gabbroid, ultramafic and TAS diagrams; chemistry table"]]],
 ["Intrusive bodies",["Body","Fact"],[["Batholith","Large, deep; felsic/intermediate; Sierra Nevada"],["Stock","Discordant; < 100 km²; small batholith"],["Lopolith","Lens with sagging centre; concordant; Bushveld; magmatic layering"],["Laccolith","Concordant; pushes layers up into a dome"],["Sill","Concordant sheet between layers"],["Dike","Discordant sheet cutting across"]]],
 ["Volcanic landforms",["Landform","Fact"],[["Shield volcano","Gentle; basaltic; Hawaii"],["Stratovolcano","Steep, layered; andesitic; Mt Fuji"],["Lava dome","Steep dome; rhyolitic; may collapse explosively"],["Cinder cone","Loose pyroclastic fragments"],["Caldera","Collapse depression after magma withdrawal"],["Pillow lava","Underwater eruption"],["Columnar jointing","Cooling contraction; basalt; Giant's Causeway"]]]
];

function initAll(){
  /* SiO2 slider */
  function lerp(a,b,t){return a+(b-a)*t}
  function upSi(){
    var s=+$("#sio2").value,t=(s-48)/(77-48),T=Math.round(lerp(1160,900,Math.max(0,Math.min(1,t)))),vis=Math.round(lerp(1,12,Math.max(0,Math.min(1,t)))),den=lerp(2.70,2.35,Math.max(0,Math.min(1,t))).toFixed(2);
    var ty,pl,vo,mi,er,lf;
    if(s<45){ty="Ultramafic";pl="Peridotite";vo="Komatiite / picrite";mi="Olivine, pyroxene";er="Effusive";lf="(rare today)"}
    else if(s<=52){ty="Mafic";pl="Gabbro";vo="Basalt";mi="Ca-plagioclase, pyroxene, ± olivine, ± amphibole";er="Effusive";lf="Shield volcano"}
    else if(s<55){ty="Mafic to intermediate";pl="Gabbro / diorite";vo="Basalt / andesite";mi="Plagioclase, pyroxene, amphibole";er="Mostly effusive";lf="Shield or stratovolcano"}
    else if(s<=63){ty="Intermediate";pl="Diorite";vo="Andesite";mi="Plagioclase, amphibole, biotite, ± pyroxene";er="Rather explosive";lf="Stratovolcano"}
    else if(s<70){ty="Felsic to intermediate";pl="Granodiorite / tonalite";vo="Dacite";mi="Plagioclase, quartz, biotite, amphibole, ± K-feldspar";er="Explosive";lf="Stratovolcano or lava dome"}
    else {ty="Felsic";pl="Granite";vo="Rhyolite";mi="Quartz, K-feldspar, plagioclase, biotite, ± muscovite";er="Highly explosive";lf="Lava dome"}
    $("#sio2out").innerHTML='<div class="big">'+s+' % SiO₂ · '+ty+'</div><div class="kv"><span>Plutonic rock</span><span><b>'+pl+'</b></span><span>Volcanic rock</span><span><b>'+vo+'</b></span><span>Key minerals</span><span>'+mi+'</span><span>Eruption</span><span>'+er+'</span><span>Landform</span><span>'+lf+'</span>'+(s>=45?'<span>Eruption temp.</span><span>about '+T+' °C</span><span>Viscosity</span><span>about 10<sup>'+vis+'</sup> Pa·s</span><span>Density</span><span>about '+den+' g/cm³</span>':'')+'</div><p style="font-size:.85rem;color:var(--mute);margin:8px 0 0">Temperature, viscosity and density are read off the lecture table (basalt 48 % → rhyolite 77 %) and are approximate.</p>';
  }
  $("#sio2").oninput=upSi;upSi();
  /* texture drill */
  var TX=[["Big crystals you can easily see","Phaneritic (coarse-grained)"],["Crystals too small to see by eye","Aphanitic (fine-grained)"],["Large crystals floating in a fine matrix","Porphyritic"],["No crystals at all, like black glass","Glassy"],["Full of gas bubbles","Vesicular"],["Angular fragments thrown out by an explosion","Pyroclastic"]];
  var TXO=TX.map(function(x){return x[1]}),lt=-1;
  GEO.drill($("#txdrill"),"txstreak",function(){var n;do{n=Math.floor(Math.random()*TX.length)}while(n===lt);lt=n;var t=TX[n];return {q:"Which texture: <b>"+t[0]+"</b>?",opts:shuffle([t[1]].concat(shuffle(TXO.filter(function(x){return x!==t[1]})).slice(0,3))),ans:t[1],fb:""}});
  /* pyroclastic slider: log scale 0.1 mm .. 1000 mm */
  function upPy(){var v=+$("#pyro").value,mm=Math.pow(10,-1+v/25),s=mm<1?mm.toFixed(2):mm<10?mm.toFixed(1):Math.round(mm);
    var n=mm<2?["Volcanic ash","Tuff"]:mm<=64?["Lapilli","Lapilli tuff / lapillistone"]:["Blocks and bombs","Agglomerate or volcanic breccia"];
    $("#pyroout").innerHTML='<div class="big">'+s+' mm</div><div class="kv"><span>Fragment</span><span><b>'+n[0]+'</b></span><span>Rock</span><span><b>'+n[1]+'</b></span></div>'}
  $("#pyro").oninput=upPy;upPy();
  /* QAPF triangle */
  var Qp=[200,20],Ap=[30,314],Pp=[370,314],kind="p",selF=null;
  function pt(q,a,p){return [(q*Qp[0]+a*Ap[0]+p*Pp[0]),(q*Qp[1]+a*Ap[1]+p*Pp[1])]}
  function line(q,r){/* point at quartz fraction q and P/(A+P)=r */return pt(q,(1-q)*(1-r),(1-q)*r)}
  function poly(arr){return arr.map(function(c){var p=line(c[0],c[1]);return p[0].toFixed(1)+","+p[1].toFixed(1)}).join(" ")}
  var F=[
    {k:"g",pts:[[0.2,0.1],[0.6,0.1],[0.6,0.65],[0.2,0.65]],p:"Granite",v:"Rhyolite"},
    {k:"gd",pts:[[0.2,0.65],[0.6,0.65],[0.6,1],[0.2,1]],p:"Granodiorite / tonalite",v:"Dacite"},
    {k:"dg",pts:[[0,0.65],[0.2,0.65],[0.2,1],[0,1]],p:"Diorite / gabbro",v:"Andesite / basalt"},
    {k:"af",pts:[[0.2,0],[0.6,0],[0.6,0.1],[0.2,0.1]],p:"Alkali-feldspar granite (not needed)",v:"Alkali-feldspar rhyolite (not needed)"},
    {k:"lo",pts:[[0,0],[0.2,0],[0.2,0.65],[0,0.65]],p:"Syenite / monzonite family (not needed)",v:"Trachyte / latite family (not needed)"},
    {k:"hi",pts:[[0.6,0],[1,0],[1,1],[0.6,1]],p:"Quartz-rich rocks (not needed)",v:"(no volcanic name needed)"}];
  function draw(){
    var s='<svg class="qapf" viewBox="0 0 400 340" role="img" aria-label="Simplified upper QAPF triangle"><polygon class="tri" points="'+Qp.join(",")+" "+Ap.join(",")+" "+Pp.join(",")+'"/>';
    F.forEach(function(f){var named=["g","gd","dg"].indexOf(f.k)>=0;s+='<polygon class="fld'+(named?" named":"")+(selF===f.k?" sel":"")+'" data-k="'+f.k+'" points="'+poly(f.pts)+'"/>'});
    var lab=function(k,q,r,t){var p=line(q,r);s+='<text class="lb" x="'+p[0].toFixed(1)+'" y="'+p[1].toFixed(1)+'" text-anchor="middle">'+t+'</text>'};
    var N=F.reduce(function(o,f){o[f.k]=f;return o},{});
    lab("g",0.38,0.38,kind==="p"?"Granite":"Rhyolite");
    lab("gd",0.40,0.83,kind==="p"?"Granodiorite /":"Dacite");if(kind==="p")lab("gd",0.33,0.84,"tonalite");
    lab("dg",0.10,0.80,kind==="p"?"Diorite /":"Andesite /");lab("dg",0.04,0.80,kind==="p"?"gabbro":"basalt");
    s+='<text class="cn" x="'+Qp[0]+'" y="14" text-anchor="middle">Q (quartz)</text><text class="cn" x="'+(Ap[0]-4)+'" y="334">A</text><text class="cn" x="'+(Pp[0]-6)+'" y="334">P</text></svg>';
    $("#qapf").innerHTML=s;
  }
  function info(e){
    var svg=$("#qapf svg");if(!svg)return;var r=svg.getBoundingClientRect(),x=(e.clientX-r.left)*400/r.width,y=(e.clientY-r.top)*340/r.height;
    /* barycentric */
    var d=(Ap[1]-Pp[1])*(Qp[0]-Pp[0])+(Pp[0]-Ap[0])*(Qp[1]-Pp[1]);
    var q=((Ap[1]-Pp[1])*(x-Pp[0])+(Pp[0]-Ap[0])*(y-Pp[1]))/d,a=((Pp[1]-Qp[1])*(x-Pp[0])+(Qp[0]-Pp[0])*(y-Pp[1]))/d,p=1-q-a;
    if(q<0||a<0||p<0)return;
    var rr=p/Math.max(1e-6,a+p),k=q>=0.6?"hi":q>=0.2?(rr<0.1?"af":rr<0.65?"g":"gd"):(rr>=0.65?"dg":"lo");
    selF=k;draw();var f=F.filter(function(z){return z.k===k})[0];
    $("#qout").innerHTML='<div class="big">'+(kind==="p"?f.p:f.v)+'</div><div class="kv"><span>Quartz (Q)</span><span>'+Math.round(q*100)+' %</span><span>Alkali feldspar (A)</span><span>'+Math.round(a*100)+' %</span><span>Plagioclase (P)</span><span>'+Math.round(p*100)+' %</span></div><p style="font-size:.85rem;color:var(--mute);margin:6px 0 0">Field lines: Q = 20 % and 60 %; P/(A+P) = 10 % and 65 %. You only need the three coloured fields.</p>';
  }
  $("#qapf").onclick=info;
  $("#qseg").onclick=function(e){var b=e.target.closest("button");if(!b)return;kind=b.getAttribute("data-k");$$("#qseg button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});selF=null;draw();$("#qout").textContent="Tap inside the triangle."};
  draw();
  /* concordant / discordant */
  GEO.sorter($("#cdsorter"),[["Sill","c","Lies between layers."],["Dike","d","Cuts across through cracks."],["Laccolith","c","Injected between sedimentary layers, then domes them up."],["Lopolith","c","Generally concordant, sagging centre."],["Stock","d","A discordant intrusion (< 100 km²)."]],[["c","Concordant"],["d","Discordant"]]);
  /* landform sorter */
  GEO.sorter($("#lfsorter"),[["Shield volcano","b","Fluid basaltic lava spreads into gentle slopes."],["Stratovolcano","a","Often andesitic; layers of lava and ash."],["Lava dome","r","Viscous rhyolitic lava piles up."],["Pillow lava","b","Basaltic lava erupting under water."],["Columnar jointing","b","Common in basalt."]],[["b","Basaltic"],["a","Andesitic"],["r","Rhyolitic"]]);
  /* rock tables */
  GEO.table($("#t-plut"),["Rock","SiO₂","Colour","Minerals","Volcanic twin"],ROCKS.filter(function(r){return r.grp==="Plutonic"}).map(function(r){return [r.n,r.si,r.co,r.mi,r.eq]}),1);
  GEO.table($("#t-volc"),["Rock","SiO₂","Colour","Minerals","Plutonic twin"],ROCKS.filter(function(r){return r.grp==="Volcanic"}).map(function(r){return [r.n,r.si,r.co,r.mi,r.eq]}),1);
  /* twin drill */
  var TW=[["Granite","Rhyolite"],["Granodiorite / tonalite","Dacite"],["Diorite","Andesite"],["Gabbro","Basalt"]],ALLR=["Granite","Granodiorite / tonalite","Diorite","Gabbro","Rhyolite","Dacite","Andesite","Basalt","Peridotite","Pegmatite"],lw=-1;
  GEO.drill($("#twdrill"),"twstreak",function(){var n;do{n=Math.floor(Math.random()*8)}while(n===lw);lw=n;var pair=TW[n%4],fromP=n<4,q=fromP?pair[0]:pair[1],a=fromP?pair[1]:pair[0];
    var pool=ALLR.filter(function(x){return x!==a&&x!==q});
    return {q:"What is the "+(fromP?"volcanic":"plutonic")+" twin of <b>"+q+"</b>?",opts:shuffle([a].concat(shuffle(pool).slice(0,3))),ans:a,fb:q+" ↔ <b>"+a+"</b>: same chemistry, "+(fromP?"fast":"slow")+" cooling."}});
}
STEPS[0].init=initAll;

GEO.register({
  id:"t3",num:3,title:"Igneous rocks",short:"Igneous",sub:"Lecture 3 · test 26 Oct (taken) + final exam",
  blurb:"Magma and its four types, textures, plutonic vs volcanic, QAPF, intrusions, volcanoes and the 10 igneous rocks.",
  h1:"Igneous rocks, one step at a time",
  start:{lede:"You never need the slides: everything for the test is taught here, step by step (lecture + 22 Oct practical). Not tested: the gabbroid, ultramafic and TAS diagrams and the chemistry table. Everything else counts.",
    plan:'<h3>First time, about 2 hours</h3><ol><li><b>Learn, step by step</b>: 9 steps. Use the silica slider and tap around the QAPF triangle.</li><li><b>10 rock cards</b>: flip all, then "Which rock am I?" until 8 in a row.</li></ol><h3>Revision, 1 hour</h3><ol><li><b>Rocks &amp; bodies</b> tab drill.</li><li><b>Mock test</b> twice, then <b>Review</b>.</li></ol>',
    six:["Magma = <b>molten silicate with liquid, solid and gas</b> phases; gas bubbles form when pressure drops and drive eruptions.","<b>Felsic → intermediate → mafic → ultramafic</b>: less SiO₂, darker, hotter, denser, <b>less viscous</b>, less explosive.","<b>Plutonic = intrusive</b>, slow cooling, coarse. <b>Volcanic = extrusive</b>, fast cooling, fine, glassy or vesicular.","Twins: <b>granite–rhyolite, granodiorite–dacite, diorite–andesite, gabbro–basalt</b>; peridotite is ultramafic.","Intrusions: <b>sill concordant, dike discordant</b>; batholith (huge), stock (small), laccolith (dome), lopolith (bowl).","Volcanoes: <b>shield (basalt), stratovolcano (andesite), lava dome (rhyolite)</b>, cinder cone, caldera; pillow lava = underwater; columnar jointing = cooling."]},
  must:"magma types, textures, rock names and intrusions",
  steps:STEPS,Q:Q,VOC:VOC,VCON:VCON,sheet:SHEET,
  cards:{tab:"10 rock cards",h1:"10 igneous rock cards",who:"Which rock am I?",labels:{ty:"Type",si:"SiO₂",co:"Colour",mi:"Minerals",eq:"Twin"},keys:["ty","si","co","mi","eq"],items:ROCKS},
  names:{tab:"Rocks & bodies",h1:"Rocks, bodies and landforms: what you need",small:"Drill: which body or landform?",
    html:'<div class="card"><h2>Short answer</h2><p>You need the <b>10 rock names</b> with their type and SiO₂ group, the <b>intrusive bodies</b> and the <b>volcanic landforms</b>. You don\'t need the chemistry tables or the yellow classification diagrams.</p><p>'+MUST+' tested &nbsp; '+NICE+' said in class or practical &nbsp; '+SKIP+' not tested</p></div><div class="card"><h2>Drill: which body or landform?</h2><p>Streak: <b id="bstreak">0</b> (aim for 10).</p><div id="bdrill"></div></div>',
    tables:[
     {title:"Rocks",head:["Rock","Type","SiO₂ group","Need it?"],rows:ROCKS.map(function(r){return [r.n,r.ty,r.si,MUST]}).concat([["Obsidian","Volcanic glass","Usually felsic",NICE],["Tuff","Pyroclastic (ash)","",MUST],["Agglomerate / volcanic breccia","Pyroclastic (blocks, bombs)","",MUST],["Komatiite, picrite","Ultramafic volcanic","< 45 %",NICE]])},
     {title:"Intrusive bodies and landforms",head:["Name","Key fact","Need it?"],rows:[["Batholith","Huge, deep, felsic/intermediate (Sierra Nevada)",MUST],["Stock","Discordant, < 100 km²",MUST],["Lopolith","Concordant lens with sagging centre (Bushveld)",MUST],["Laccolith","Concordant, domes layers up",MUST],["Sill","Concordant sheet",MUST],["Dike","Discordant sheet",MUST],["Shield volcano","Gentle, basaltic",MUST],["Stratovolcano","Steep, layered, andesitic",MUST],["Lava dome","Viscous rhyolitic dome",MUST],["Cinder cone","Loose pyroclastics",MUST],["Caldera","Collapse depression",MUST],["Pillow lava","Underwater eruption",MUST],["Columnar jointing","Cooling contraction",MUST]]},
     {title:"Minerals in igneous rocks (from lecture 2)",head:["Mineral","Typical of","Need it?"],rows:[["Quartz","Felsic rocks (granite, rhyolite)",MUST],["K-feldspar (orthoclase)","Felsic rocks; pink in granite",MUST],["Plagioclase","Almost all igneous rocks; Na-rich in felsic, Ca-rich in mafic",MUST],["Biotite, muscovite","Felsic to intermediate rocks",MUST],["Amphibole","Intermediate rocks (diorite)",MUST],["Pyroxene","Mafic rocks (gabbro, basalt)",MUST],["Olivine","Ultramafic rocks (peridotite)",MUST],["Tourmaline, spodumene","Pegmatite",NICE],["Spinel, garnet","± in peridotite",NICE],["Foids","Silica-undersaturated rocks",SKIP]]}
    ],
    init:function(){
      var B=[["Huge intrusion deep in the crust, mostly granite","Batholith"],["Small discordant intrusion, < 100 km²","Stock"],["Lens-shaped intrusion with a sagging centre","Lopolith"],["Intrusion that pushes the layers above it into a dome","Laccolith"],["Flat sheet between layers (concordant)","Sill"],["Flat sheet cutting across layers (discordant)","Dike"],["Broad gentle volcano of runny basalt","Shield volcano"],["Steep layered volcano, often andesitic","Stratovolcano"],["Steep dome of viscous rhyolitic lava","Lava dome"],["Steep hill of loose pyroclastic fragments","Cinder cone"],["Large depression after a volcano collapses","Caldera"],["Rounded lava blobs from underwater eruptions","Pillow lava"],["Polygonal columns from cooling contraction","Columnar jointing"]];
      var OPT=B.map(function(x){return x[1]}),lb=-1;
      GEO.drill($("#bdrill"),"bstreak",function(){var n;do{n=Math.floor(Math.random()*B.length)}while(n===lb);lb=n;var b=B[n];return {q:"<b>"+b[0]+"</b>",opts:shuffle([b[1]].concat(shuffle(OPT.filter(function(x){return x!==b[1]})).slice(0,3))),ans:b[1],fb:""}});
    }},
  mastery:{facts:[[1,"Igneous is a synonym of {magmatic|metamorphic|sedimentary|detrital}."], [1,"Petrology is the study of rocks and their {formative processes|prices|colours|ages only}."], [1,"Magma contains liquid, solid and {gas|plasma|ice|oil} phases."], [1,"The gas phase of magma holds volatiles such as H₂O, CO₂, H₂S and {Cl|Fe|Si|Al}."], [1,"Gas bubbles form in magma when the pressure {decreases|increases|stays constant|is very high} and cause eruptions."], [1,"Xenoliths are fragments assimilated from the {surrounding rock|mantle only|atmosphere|sea water}."], [2,"Felsic magma has the {highest|lowest|average|no} SiO₂ content."], [2,"Felsic magma has {high|low|very low|average} viscosity."], [2,"Felsic magma is highly {explosive|effusive|dense|hot}."], [2,"Felsic magma has the key minerals quartz, K-feldspar, plagioclase and {mica|olivine|pyroxene|amphibole}."], [2,"Felsic magma forms rhyolite, granite and {lava domes|shield volcanoes|stratovolcanoes|pillow lavas}."], [2,"Intermediate magma forms andesite, diorite and {stratovolcanoes|shield volcanoes|lava domes|calderas}."], [2,"Mafic magma has {low|high|average|very high} viscosity and is effusive."], [2,"Mafic magma is {hotter|cooler|more viscous|more gas-rich} than felsic magma."], [2,"Mafic magma forms basalt, gabbro and {shield volcanoes|stratovolcanoes|lava domes|cinder cones only}."], [2,"Ultramafic magma has {very low|high|average|low} SiO₂."], [2,"The key minerals of ultramafic magma are olivine and {pyroxene|quartz|muscovite|K-feldspar}."], [3,"Rocks are identified by texture, mineral composition and {chemical composition|age only|price|shape}."], [3,"Volcanic rocks can have an aphanitic, glassy, vesicular or {porphyritic|gneissic|foliated|schistose} texture."], [4,"Plutonic rocks are also called {intrusive|extrusive|pyroclastic|volcanic}."], [4,"Plutonic rocks cool {slowly|rapidly|instantly|never} beneath the Earth's surface."], [4,"Plutonic rocks have a {phaneritic|aphanitic|glassy|vesicular} or porphyritic texture."], [4,"Volcanic rocks are also called {extrusive|intrusive|plutonic|pyroclastic}."], [4,"Volcanic rocks cool {rapidly|slowly|not at all|deep underground}."], [4,"Pyroclastic rocks are made of angular {fragments|interlocking crystals|mud|shells}."], [4,"Volcanic ash (less than 2 mm) forms {tuff|agglomerate|lapillistone|volcanic breccia}."], [4,"Lapilli are {2–64|less than 2|more than 64|0.1–1} mm in size."], [4,"Blocks and bombs (over 64 mm) form agglomerate or {volcanic breccia|tuff|lapilli tuff|pumice only}."], [5,"In the QAPF diagram, Q stands for {quartz|quartzite|quicklime|quarry}."], [5,"In the QAPF diagram, F stands for {foid|fluorite|fayalite|feldspar}."], [5,"The TAS diagram plots SiO₂ against {Na₂O + K₂O|MgO|FeO|CaO}."], [5,"In the slide analyses, rhyolite has about {73|54|60|46} wt % SiO₂."], [5,"In the slide analyses, {picrite|rhyolite|andesite|basalt} has the highest MgO (about 21 wt %)."], [6,"A batholith is a large intrusion from deep in the crust, mostly of {felsic or intermediate|mafic|ultramafic|volcanic} rock."], [6,"A stock has a surface exposure of less than {100|20|1000|10} km²."], [6,"Stocks are probably the cupolas of hidden {batholiths|sills|dykes|lopoliths}."], [6,"A lopolith is lenticular with a {depressed|bulging|flat|conical} central region."], [6,"The Bushveld complex in {South Africa|Hawaii|Texas|Israel} is a huge lopolith."], [6,"A laccolith is a dome-shaped intrusion between layers of {sedimentary rock|lava|ash|ice}."], [6,"A sill is a {concordant|discordant|vertical|spherical} sheet intrusion: it does not cut across rock beds."], [6,"A dike (dyke) is a {discordant|concordant|dome-shaped|bowl-shaped} tabular intrusion."], [7,"A shield volcano has broad, gentle slopes made of fluid {basaltic|rhyolitic|andesitic|granitic} lava."], [7,"A stratovolcano has steep slopes and layers of lava and ash, and is often {andesitic|basaltic|rhyolitic|picritic}."], [7,"A lava dome is steep-sided and formed by viscous, often {rhyolitic|basaltic|andesitic|komatiitic} lava."], [7,"A cinder cone is a steep, conical hill of loose pyroclastic {fragments|lava|dykes|crystals}."], [7,"A caldera forms by {collapse after magma withdrawal|erosion|glaciers|sill intrusion}."], [7,"Pillow lava forms in {underwater|desert|glacial|cave} eruptions."], [7,"Columnar jointing forms by cooling contraction and is common in {basalt|granite|sandstone|marble}."], [8,"Granite is a {plutonic|volcanic|pyroclastic|sedimentary} rock with about 70 to 77 wt % SiO₂."], [8,"Granite is made of quartz, K-feldspar, plagioclase and {biotite|olivine|pyroxene|serpentine}."], [8,"Granodiorite and tonalite have about {63–70|70–77|55–63|45–52} wt % SiO₂."], [8,"Diorite has about {55–63|63–70|70–77|45–52} wt % SiO₂."], [8,"Diorite is called a \"{pepper and salt|zebra|marbled|banded}\" rock."], [8,"Gabbro is a {mafic|felsic|intermediate|ultramafic} plutonic rock."], [8,"Gabbro has about {45–52|55–63|63–70|70–77} wt % SiO₂."], [8,"Peridotite is an {ultramafic|felsic|intermediate|mafic} rock with less than 45 wt % SiO₂."], [8,"Peridotite is made mostly of olivine and {pyroxene|quartz|muscovite|K-feldspar}."], [9,"Rhyolite is a {volcanic|plutonic|pyroclastic|metamorphic} rock with about 70 to 77 wt % SiO₂."], [9,"Dacite has about {63–70|70–77|55–63|45–52} wt % SiO₂."], [9,"Andesite is an {intermediate|felsic|mafic|ultramafic} volcanic rock."], [9,"Basalt is a {volcanic|plutonic|pyroclastic|metamorphic} rock with about 45 to 52 wt % SiO₂."], [9,"Pegmatite is a {plutonic|volcanic|pyroclastic|sedimentary} rock with very coarse grains."], [9,"Pegmatite may contain muscovite or {tourmaline|olivine|pyroxene|garnet only}."]]},
  foot:"Sources: lecture 3 slides \"Igneous rocks and processes\" (Mgr. Václav Santolík, PhD, CZU), your Wispr recordings of 19 Oct (lecture) and 22 Oct (practical). Yellow (not tested) slides were found by their colour. Lines marked \"recording\" were said in class."
});
})();
