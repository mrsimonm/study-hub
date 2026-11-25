/* Lecture 2: Minerals */
(function(){"use strict";
var $=GEO.$,$$=GEO.$$,shuffle=GEO.shuffle,esc=GEO.esc;
var MUST='<span class="need must">Must know</span>',NICE='<span class="need nice">Good to know</span>',SKIP='<span class="need skip">Skip</span>';

/* The 22 minerals you must know. Fields: class, use, look (recognise it by), where it forms, formula, hardness */
var MIN=[
{n:"Graphite",c:"Native element",u:"Pencils, lubricants, batteries, crucibles",k:"Dark grey, writes on paper, very soft (Mohs 1–2), conducts electricity",o:"Metamorphic rocks (marbles, schists), organic-rich sedimentary rocks",f:"C",h:"1–2"},
{n:"Diamond",c:"Native element",u:"Gemstones, cutting tools",k:"Hardest mineral (Mohs 10), adamantine luster",o:"Kimberlite pipes, mantle-derived rocks",f:"C",h:"10"},
{n:"Pyrite",c:"Sulfide",u:"Sulfuric acid production, minor iron ore",k:"Brass-yellow, metallic, cubic crystals (\"fool's gold\")",o:"Widespread; common in hydrothermal veins",f:"FeS₂",h:"6–6.5"},
{n:"Galena",c:"Sulfide",u:"Primary ore of lead (often contains silver)",k:"Lead-grey, bright metallic, very heavy (~7.5 g/cm³), perfect cubic cleavage",o:"Hydrothermal veins, Pb deposits",f:"PbS",h:"2.5"},
{n:"Chalcopyrite",c:"Sulfide",u:"Most important copper ore",k:"Brass-yellow to golden, may show iridescent tarnish",o:"Hydrothermal veins, porphyry copper deposits",f:"CuFeS₂",h:"3.5–4"},
{n:"Quartz",c:"Oxide",u:"Glass and ceramics industry, electronics",k:"Glassy (vitreous), Mohs 7, conchoidal fracture, no cleavage",o:"Everywhere: igneous, metamorphic, sedimentary rocks, veins",f:"SiO₂",h:"7"},
{n:"Hematite",c:"Oxide",u:"Major iron ore",k:"Steel-grey to reddish-brown, red streak",o:"Sedimentary (banded iron formations), metamorphic, weathered",f:"Fe₂O₃",h:"5–6.5"},
{n:"Magnetite",c:"Oxide",u:"Major iron ore",k:"Black, metallic, strongly magnetic",o:"Igneous and metamorphic rocks, iron deposits",f:"Fe₃O₄",h:"5.5–6.5"},
{n:"Halite",c:"Halide",u:"Table salt, chemical industry, de-icing roads",k:"Colourless to white, perfect cubic cleavage, salty taste",o:"Evaporite deposits from drying seas and lakes",f:"NaCl",h:"2.5"},
{n:"Calcite",c:"Carbonate",u:"Cement and lime production, soil conditioner",k:"Perfect rhombohedral cleavage, reacts strongly with HCl, Mohs 3",o:"Main mineral of limestones and marbles; veins",f:"CaCO₃",h:"3"},
{n:"Olivine",c:"Silicate",u:"Refractory material, gemstone (peridot)",k:"Olive green, glassy, granular, no cleavage",o:"Mafic and ultramafic igneous rocks, upper mantle",f:"(Mg,Fe)₂SiO₄",h:"6.5–7"},
{n:"Pyroxene",c:"Silicate",u:"No industrial use; essential rock-forming mineral",k:"Dark green to black, stubby crystals",o:"Mafic/ultramafic igneous rocks, high-grade metamorphic rocks",f:"(XY)(Si,Al)₂O₆",h:"5–7"},
{n:"Garnet",c:"Silicate",u:"Abrasive, gemstone",k:"Red, brown or green, dodecahedral crystals",o:"Metamorphic rocks (schists), some igneous rocks",f:"X₃Y₂(SiO₄)₃",h:"6.5–7.5"},
{n:"Amphibole",c:"Silicate",u:"No major industrial use",k:"Dark green to black, elongated crystals (e.g. hornblende)",o:"Igneous, metamorphic and sedimentary rocks",f:"Complex (hornblende)",h:"5–6"},
{n:"Biotite",c:"Silicate",u:"No major industrial use",k:"Black mica: dark brown to black, flaky, perfect cleavage",o:"Igneous, metamorphic and sedimentary rocks",f:"K(Mg,Fe)₃(AlSi₃O₁₀)(OH)₂",h:"2.5–3"},
{n:"Muscovite",c:"Silicate",u:"Electrical insulators, cosmetics",k:"White mica: silvery-white elastic sheets, perfect cleavage",o:"Granitic rocks, schists, pegmatites",f:"KAl₂(AlSi₃O₁₀)(OH)₂",h:"2.5"},
{n:"K-feldspar",c:"Silicate",u:"Ceramics, glass, mild abrasives",k:"Pink to white, good cleavage (orthoclase, microcline, sanidine)",o:"Felsic igneous rocks (granite, rhyolite)",f:"KAlSi₃O₈",h:"6"},
{n:"Plagioclase",c:"Silicate",u:"Ceramics, filler",k:"White to grey, striations on cleavage faces (Na–Ca feldspar)",o:"Most igneous rocks; major rock-forming mineral",f:"(Na,Ca)(Al,Si)₄O₈",h:"6–6.5"},
{n:"Epidote",c:"Silicate",u:"None major; sometimes ornamental",k:"Pistachio green, prismatic",o:"Low- to medium-grade metamorphic rocks (greenschists)",f:"Ca₂(Fe³⁺,Al)₃(SiO₄)₃(OH)",h:"6–7"},
{n:"Chlorite",c:"Silicate",u:"None industrially",k:"Green, flaky or scaly, soft, perfect cleavage",o:"Low-grade metamorphic rocks, alteration product",f:"(Mg,Fe,Al)₆(Si,Al)₄O₁₀(OH)₈",h:"2–2.5"},
{n:"Zeolite",c:"Silicate",u:"Water softeners, molecular sieves, catalysts",k:"White to colourless, porous structure",o:"Alteration of volcanic rocks; sedimentary, hydrothermal",f:"Variable (e.g. natrolite)",h:"3–5"},
{n:"Clay minerals (kaolinite)",c:"Silicate",u:"Porcelain, paper, cosmetics",k:"White, earthy, powdery, dull, very soft",o:"Weathered granite and feldspar-rich rocks (tropical soils)",f:"Al₂Si₂O₅(OH)₄",h:"~2"}
];
/* extra minerals (not tested) (not tested) */
var YEL=[["Gold","Native element","Jewelry, electronics, currency, investment"],["Silver","Native element","Electronics, jewelry, silverware"],["Copper","Native element","Wiring, plumbing, coins, alloys"],["Sulfur","Native element","Fertilizers, sulfuric acid, gunpowder"],["Pyrrhotite","Sulfide","Minor iron ore"],["Pentlandite","Sulfide","Primary ore of nickel"],["Sphalerite","Sulfide","Principal ore of zinc"],["Spinel","Oxide","Gemstones"],["Chromite","Oxide","Main ore of chromium"],["Ilmenite","Oxide","Main ore of titanium"],["Corundum","Oxide","Gemstones (ruby, sapphire), abrasives; Mohs 9"],["Fluorite","Halide","Flux in steelmaking, fluorine, optics"],["Aragonite","Carbonate","Ornamental; same formula as calcite, different crystal system"],["Dolomite","Carbonate","Construction stone, magnesium; reacts only weakly with acid"],["Malachite","Carbonate","Copper ore, pigment, gemstone (bright green)"],["Azurite","Carbonate","Copper ore, pigment (deep blue)"],["Gypsum","Sulfate","Plaster, drywall, fertilizer; Mohs 2"],["Apatite","Phosphate","Fertilizer (phosphate source); bones and teeth"],["Spodumene","Silicate","Major lithium ore (in pegmatites)"],["Tourmaline","Silicate","Gemstones; black schorl in pegmatites"],["Zircon","Silicate","Zirconium, abrasives, geochronology (dating)"],["Serpentine","Silicate","Asbestos, decorative stone"]];

var STEPS=[
{t:"8 min",title:"What a mineral is",html:`
<div class="box idea"><b>Two official definitions</b><b>Nickel (1995):</b> "A mineral is an element or a chemical compound that is normally crystalline and that has been formed as a result of geological processes."<br><b>Britannica:</b> "any naturally occurring homogeneous solid that has a definite (but not fixed) chemical composition and a distinctive internal crystal structure."</div>
<p>So a mineral is:</p>
<ul><li><b>Natural</b>, formed by <b>geological processes</b></li><li>A <b>solid</b> element or chemical compound</li><li>Normally <b>crystalline</b> (ordered inner structure)</li><li>With a <b>definite but not fixed</b> chemical composition</li></ul>
<div class="box teach"><b>Teacher said</b>In nutrition, "minerals" means ions or elements (calcium, zinc). In geology, a mineral is defined by the points above. <span class="chip">recording</span></div>
<h3>Key numbers</h3>
<ul><li>About <b>6,240</b> recognised mineral species, and several new ones every year.</li><li>Only about <b>100</b> are common in the Earth's crust.</li><li><b>Only 22 for you to learn.</b></li><li>Many are economically critical: ores of metals, industrial materials, gemstones.</li><li>They are organised in <b>9 classes</b> of the mineralogical system.</li></ul>
<div class="box ana"><b>Analogy</b>Minerals are the LEGO bricks; rocks are what you build from them. Granite is a "build" of quartz, feldspar and mica bricks.</div>
<div class="box trap"><b>Exam trap</b>"Definite but <b>not fixed</b>" composition: real minerals have small swaps of atoms (step 4). Glass, obsidian and opal are <b>not minerals</b> because they are amorphous (no crystal lattice). <span class="chip">recording</span></div>
<div class="chk" data-q="mi1"></div>
<div class="chk" data-q="mi3"></div>
<div class="chk" data-q="mi5"></div>`},
{t:"12 min",title:"Atoms: element, ion, isotope",html:`
<p>An atom has a <b>nucleus</b> of <b>protons</b> (+) and <b>neutrons</b> (no charge), with <b>electrons</b> (−) around it.</p>
<div class="tw"><table><thead><tr><th>Word</th><th>What changes</th><th>Result</th></tr></thead><tbody>
<tr><td><b>Element</b></td><td>Defined by the number of <b>protons</b> = the <b>atomic number</b></td><td>8 protons is always oxygen</td></tr>
<tr><td><b>Ion</b></td><td>A different number of <b>electrons</b></td><td>A different electrical charge. <b>Cation</b> = positive (fewer electrons). <b>Anion</b> = negative (more electrons)</td></tr>
<tr><td><b>Isotope</b></td><td>A different number of <b>neutrons</b></td><td>A different weight. Every element has several isotopes</td></tr>
</tbody></table></div>
<div class="box teach"><b>Teacher said</b>"These are some words that I want you to remember": element, ion, isotope. Electrons control the <b>charge</b>, neutrons control the <b>mass</b>. <span class="chip">recording</span></div>
<h3>Notation</h3>
<ul><li><b>Periodic-table notation</b>: symbol (C), atomic number (6), atomic mass (12.01, the average mass, a bit above 12 because heavier isotopes exist).</li><li><b>Real-life notation</b>: also the <b>mass number</b> (protons + neutrons) and the <b>charge</b>, for example ¹⁸O²⁻ = oxygen with 2 extra neutrons and 2 extra electrons.</li></ul>
<h3>Build an atom</h3>
<p style="font-size:.95rem">Move the sliders and watch the element, charge and mass number change.</p>
<label>Protons: <b id="apv"></b></label><input type="range" id="ap" min="1" max="20" value="8">
<label>Neutrons: <b id="anv"></b></label><input type="range" id="an" min="0" max="24" value="8">
<label>Electrons: <b id="aev"></b></label><input type="range" id="ae" min="0" max="22" value="10">
<div class="out" id="aout"></div>
<div class="box ana"><b>Memory trick</b><b>P</b>rotons = <b>P</b>assport (who you are). <b>E</b>lectrons = <b>E</b>motion (your charge, +/−). <b>N</b>eutrons = <b>N</b>utrition (your weight). Ca<b>t</b>ion has a "<b>t</b>" that looks like a plus sign.</div>
<div class="chk" data-q="mi8"></div>
<div class="chk" data-q="mi9"></div>
<div class="chk" data-q="mi11"></div>`},
{t:"10 min",title:"The periodic table and element groups",html:`
<ul><li>A table of chemical elements ordered by <b>increasing atomic number</b>.</li><li><b>7 rows = periods</b>, <b>18 columns = groups</b>.</li><li>Created by <b>Dmitri Mendeleev in 1869</b>. He predicted elements that were unknown at the time (blank spots in his table).</li></ul>
<h3>Element groups from the class activity</h3>
<div class="tw"><table><thead><tr><th>Group</th><th>Examples</th></tr></thead><tbody>
<tr><td><b>Alkali metals</b></td><td>Li, Na, K (first column, not hydrogen)</td></tr>
<tr><td><b>Alkaline earth metals</b></td><td>Be, Mg, Ca (second column)</td></tr>
<tr><td><b>Transition metals</b></td><td>Fe, Ni, Cu, Zn, Au, Ag (the middle block)</td></tr>
<tr><td><b>Lanthanoids = rare earth elements (REE)</b></td><td>La, Ce, Nd (row below the table)</td></tr>
<tr><td><b>Actinoids</b></td><td>Th, U (second row below)</td></tr>
<tr><td><b>Other metals</b></td><td>Al, Sn, Pb</td></tr>
<tr><td><b>Metalloids</b></td><td>B, Si, As (the diagonal "staircase")</td></tr>
<tr><td><b>Halogens</b></td><td>F, Cl, Br, I</td></tr>
<tr><td><b>Noble gases</b></td><td>He, Ne, Ar (last column)</td></tr>
<tr><td><b>Other nonmetals</b></td><td>H, C, N, O, P, S</td></tr>
</tbody></table></div>
<div class="box teach"><b>Teacher said</b>"This is something I will want you to remember. This isn't just for geology": which element is an alkali metal, a transition metal, a rare earth element. Rare earth elements (the lanthanoids) are "very much in the news with mining". <span class="chip">recording</span></div>
<h3>Drill: which group?</h3>
<p>Streak: <b id="gstreak">0</b> (aim for 10)</p>
<div id="gdrill"></div>
<div class="box skip"><b>Don't memorise (not tested)</b>The <b>Goldschmidt classification</b> sorts elements by where they went when the Earth formed: <b>lithophile</b> ("rock-loving", silicates and oxides, crust), <b>siderophile</b> ("iron-loving", metallic iron, core), <b>chalcophile</b> ("sulfur-loving", sulfides), <b>atmophile</b> ("gas-loving", atmosphere). The teacher said "I don't need you to know this … it won't be in the tests". Nice link to lecture 6: the iron-loving elements went to the Fe-Ni core.</div>
<div class="chk" data-q="mi13"></div>
<div class="chk" data-q="mi15"></div>`},
{t:"12 min",title:"Mineral structure: lattice, crystal systems, defects",html:`
<h3>Solid phases</h3>
<ul><li><b>Crystalline</b>: atoms, molecules or ions are arranged in a highly ordered structure, a <b>crystal lattice</b> extending in all directions.</li><li><b>Amorphous</b>: lacks any long-range order. Example: SiO₂ as <b>glass</b> (quartz is the crystalline SiO₂).</li></ul>
<ul><li><b>Crystal lattice</b>: an ordered, symmetrical, 3-dimensional arrangement of the atoms of a solid.</li><li><b>Unit cell</b>: the smallest group of particles that makes up the repeating pattern.</li><li><b>Crystal systems</b>: minerals are classified by their <b>symmetry and unit cell geometry</b> into <b>seven groups</b>: triclinic, monoclinic, orthorhombic, tetragonal, trigonal, hexagonal, cubic.</li></ul>
<div class="box teach"><b>Teacher said</b>"I don't need you to know all these specifics, like which axes have which angle … but I want you to know this concept: that the unit cell isn't always simply cubic, and that it is classified into these seven groups." <span class="chip">recording</span></div>
<div class="box ana"><b>Analogy</b>The unit cell is one tile; the lattice is the whole tiled floor. Tiles can be squares (cubic) or squashed and slanted shapes (the other six systems).</div>
<h3>Natural crystals have defects</h3>
<ul><li><b>Substitutional atoms</b> (a different atom in a normal spot)</li><li><b>Interstitial atoms</b> (an extra atom squeezed in between)</li><li><b>Vacancies</b> (missing atoms)</li><li><b>Dislocations</b> (shifted rows)</li></ul>
<p>Defects give minerals different <b>colours</b> (quartz can be clear, white, purple, pink or yellow) <span class="chip">recording</span> and change the chemistry:</p>
<ul><li><b>Molecular formula</b>: the theoretical formula, e.g. K-feldspar KAlSi₃O₈.</li><li><b>Empirical formula</b>: the real measured composition, e.g. K<sub>0.9</sub>Na<sub>0.03</sub>Ca<sub>0.01</sub>Al<sub>0.97</sub>Si<sub>2.87</sub>O<sub>8</sub>.</li></ul>
<h3>Sort them: crystalline or amorphous?</h3>
<div id="csorter"></div>
<div class="chk" data-q="mi17"></div>
<div class="chk" data-q="mi19"></div>
<div class="chk" data-q="mi22"></div>`},
{t:"15 min",title:"How we describe a mineral: physical properties",html:`
<div class="tw"><table><thead><tr><th>Property</th><th>What it means</th></tr></thead><tbody>
<tr><td><b>Colour</b></td><td>The colour of the mineral</td></tr>
<tr><td><b>Streak</b></td><td>The colour of its <b>powder</b>, when dragged on a porcelain plate (or paper)</td></tr>
<tr><td><b>Luster</b></td><td>How it reflects light: dull, vitreous (glassy), metallic…</td></tr>
<tr><td><b>Hardness</b></td><td>Tested by <b>scratching</b>; Mohs scale from 1 (talc) to 10 (diamond)</td></tr>
<tr><td><b>Cleavage</b></td><td>Breaks along flat <b>cleavage planes</b>: perfect / poor; basal / prismatic / cubic…</td></tr>
<tr><td><b>Fracture</b></td><td>How it breaks when <b>not</b> along cleavage planes: conchoidal / uneven / fibrous…</td></tr>
<tr><td><b>Density</b></td><td>Mass over volume: water = 1 g/cm³, quartz = 2.65 g/cm³, gold = 19.3 g/cm³</td></tr>
<tr><td><b>Habit</b></td><td>The overall appearance (shape): equant, massive, tabular, prismatic, fibrous…</td></tr>
</tbody></table></div>
<p><b>Other specific properties:</b> electrical conductivity, <b>magnetism</b> (magnetite), <b>fluorescence</b>, <b>reaction with acid</b> (calcite).</p>
<div class="box teach"><b>From the recording</b>Most rocks have a density of about <b>2.5 to 3.5 g/cm³</b>. Hardness is tested by scratching, not breaking; breaking shows cleavage or fracture. <span class="chip">recording</span></div>
<div class="box trap"><b>Exam trap</b><b>Streak ≠ colour.</b> Hematite looks steel-grey but leaves a <b>red</b> streak. <b>Cleavage</b> = neat planes; <b>fracture</b> = no planes (quartz has conchoidal fracture and no cleavage).</div>
<div class="box skip"><b>Extra (not tested)</b>The full Mohs ladder: 1 talc, 2 gypsum, 3 calcite, 4 fluorite, 5 apatite, 6 orthoclase (K-feldspar), 7 quartz, 8 topaz, 9 corundum, 10 diamond. Memory trick: "<b>T</b>he <b>G</b>irls <b>C</b>an <b>F</b>lirt <b>A</b>nd <b>O</b>ther <b>Q</b>ueer <b>T</b>hings <b>C</b>an <b>D</b>o". The video also explained bonds: covalent (strongest, diamond), ionic (cleavage, dissolves in water, halite), metallic (weakest, conducts).</div>
<h3>Scratch test: slide the hardness</h3>
<input type="range" id="mohs" min="1" max="10" step="0.5" value="3" aria-label="Mohs hardness">
<div class="out" id="mohsout"></div>
<h3>Drill: which property am I?</h3>
<p>Streak: <b id="pstreak">0</b></p>
<div id="pdrill"></div>
<div class="chk" data-q="mi25"></div>
<div class="chk" data-q="mi27"></div>
<div class="chk" data-q="mi30"></div>`},
{t:"12 min",title:"The 9 mineral classes",html:`
<p>Minerals are grouped into <b>9 classes</b> by their chemistry, mostly by the <b>anion</b> (the negative part):</p>
<div class="tw"><table><thead><tr><th>#</th><th>Class</th><th>Made of</th><th>Key facts</th></tr></thead><tbody>
<tr><td>1</td><td><b>Native elements</b></td><td>A single chemical element</td><td>Metals, semimetals, nonmetals; economically important (gold, silver, diamonds)</td></tr>
<tr><td>2</td><td><b>Sulfides</b></td><td>Metal cations + sulfur anions (S²⁻)</td><td>Key ore minerals of copper, lead, nickel, zinc; hydrothermal and magmatic deposits</td></tr>
<tr><td>3</td><td><b>Oxides</b></td><td>Metal cations + oxygen anions (O²⁻)</td><td>Sources of iron, aluminium, chromium, titanium</td></tr>
<tr><td>4</td><td><b>Halides</b></td><td>Metal cations + halogen anions (Cl⁻, F⁻, Br⁻, I⁻)</td><td>Form in <b>evaporitic environments</b>: where saline water bodies (lagoons, salt lakes) dry out</td></tr>
<tr><td>5</td><td><b>Carbonates</b></td><td>Metal cations + carbonate (CO₃²⁻)</td><td>Sedimentary, low-temperature; many react with dilute acid</td></tr>
<tr><td>6</td><td><b>Sulfates</b></td><td>Metal cations + sulfate (SO₄²⁻)</td><td>Evaporites, hydrothermal veins, weathering of sulfides</td></tr>
<tr><td>7</td><td><b>Phosphates</b></td><td>Metal cations + phosphate (PO₄³⁻)</td><td>Essential for biological processes and industry</td></tr>
<tr><td>8</td><td><b>Silicates</b></td><td>Metal cations + silicate (SiO₄⁴⁻)</td><td>Largest group, <b>over 90 % of Earth's crust</b></td></tr>
<tr><td>9</td><td><b>Organic minerals</b></td><td>Organic compounds</td><td>Rare</td></tr>
</tbody></table></div>
<div class="box ana"><b>Memory trick</b>"<b>N</b>ervous <b>S</b>tudents <b>O</b>ften <b>H</b>ave <b>C</b>offee, <b>S</b>andwiches, <b>P</b>izza, <b>S</b>alad, <b>O</b>ats" = Native, Sulfides, Oxides, Halides, Carbonates, Sulfates, Phosphates, Silicates, Organic.</div>
<div class="box trap"><b>Exam trap</b><b>Sulfide</b> (just S²⁻, e.g. pyrite FeS₂) ≠ <b>sulfate</b> (SO₄²⁻, e.g. gypsum). The teacher warned: "don't mix it". Also: <b>quartz (SiO₂) is listed under oxides</b> in this course. <span class="chip">recording</span></div>
<h3>The silicate tetrahedron</h3>
<ul><li>The fundamental building block of silicates.</li><li>A central <b>silicon</b> atom surrounded by <b>four oxygen</b> atoms.</li><li>Each tetrahedron carries a <b>−4 charge</b>, so it must bond with cations (Mg²⁺, Fe²⁺, K⁺, Ca²⁺, Al³⁺) or <b>share oxygen atoms</b> with other tetrahedra.</li></ul>
<h3>Sort the 22 minerals into their class</h3>
<p>Streak: <b id="kstreak">0</b></p>
<div id="kdrill"></div>
<div class="chk" data-q="mi34"></div>
<div class="chk" data-q="mi36"></div>
<div class="chk" data-q="mi40"></div>`},
{t:"15 min",title:"The 22 minerals, part 1: non-silicates",html:`
<div class="box teach"><b>Teacher said</b>"What I want you to know from these minerals … is just the <b>name of the mineral and their use</b>. I don't want you to know the chemical formula or some properties." And: "I will want you to learn 22 mineral species." <span class="chip">recording</span></div>
<p>The 22 are the minerals on your test list. Ten of them are not silicates:</p>
<div class="row" style="margin:8px 0"><button class="ghost" data-toggle="hide" data-target="t-nonsil">Test myself (blur answers)</button></div>
<div class="tw" id="t-nonsil"></div>
<div class="box ana"><b>Memory hooks</b><b>Graphite</b> = pencil ("graph" = write). <b>Galena</b> = Lead (both have an "l"). <b>Chalco</b>pyrite = copper (Greek "chalkos" = copper). <b>Hema</b>tite = blood-red streak (hema = blood), iron ore. <b>Magne</b>tite = magnetic iron ore. <b>Hal</b>ite = salt (halo = salt). <b>Calc</b>ite = cement and lime (calc = lime).</div>
<div class="box trap"><b>Exam trap</b>Pyrite contains iron, but it is used for <b>sulfuric acid</b>, not as a main iron ore (iron is hard to extract from it). <b>Hematite and magnetite</b> are the major iron ores. <span class="chip">recording</span></div>
<div class="chk" data-q="mi44"></div>
<div class="chk" data-q="mi47"></div>
<div class="chk" data-q="mi50"></div>`},
{t:"15 min",title:"The 22 minerals, part 2: silicates",html:`
<p>Twelve of the 22 are <b>silicates</b>, the main rock-forming minerals. You will meet them again in every rock lecture.</p>
<div class="row" style="margin:8px 0"><button class="ghost" data-toggle="hide" data-target="t-sil">Test myself (blur answers)</button></div>
<div class="tw" id="t-sil"></div>
<div class="box ana"><b>Memory hooks</b><b>Oliv</b>ine = olive green. <b>Mus</b>covite = <b>M</b>irror-like white mica (insulators, cosmetics). <b>Bio</b>tite = black mica. <b>K</b>-feldspar = <b>K</b>itchen (ceramics, glass), pink. <b>Plagio</b>clase = white with fine stripes. <b>Kaolin</b>ite = porcelain (china clay). <b>Zeo</b>lite = water softener (a sponge of tiny holes).</div>
<div class="box trap"><b>Exam trap</b>Several silicates have <b>no industrial use</b>: pyroxene, amphibole, biotite, chlorite (and epidote only ornamental). "No use" can be the correct answer.</div>
<div class="box idea"><b>Where they show up later</b>Olivine + pyroxene = peridotite (mantle, L3 and L6). Quartz + K-feldspar + plagioclase + biotite = granite (L3). Chlorite + epidote = greenschist, garnet = schist (L5). Kaolinite forms by hydrolysis of feldspar (L4).</div>
<div class="chk" data-q="mi55"></div>
<div class="chk" data-q="mi58"></div>
<div class="chk" data-q="mi61"></div>`},
{t:"8 min",title:"The extra minerals (not tested)",html:`
<div class="box skip"><b>Don't memorise for the weekly test</b>These 22 extra minerals are not on your list. The teacher said they "won't be included in the tests" and to "take this presentation also as a sort of textbook". <span class="chip">recording</span></div>
<div class="tw" id="t-yel"></div>
<div class="box idea"><b>Why still look at them?</b>Some come back in later lectures: <b>dolomite</b> (dolostone, L4), <b>gypsum</b> and halite (evaporites, L4), <b>spodumene</b> and <b>tourmaline</b> (pegmatite, L3), <b>serpentine</b> (serpentinite, L5), <b>chromite</b> (magmatic layering in lopoliths, L3). The teacher also mentioned in class that gypsum is used for plaster and apatite as fertilizer.</div>
<div class="chk" data-q="mi66"></div>`}
];

var Q=[
{id:"mi1",fol:1,q:"Which statement best describes a mineral?",h:"Four points: natural, solid, ordered, definite composition.",o:["A natural, normally crystalline solid element or compound with a definite (not fixed) composition, formed by geological processes","Any element in your food, like calcium or zinc","Any rock found in nature","Any substance made in a laboratory"],e:"Both official definitions (Nickel 1995, Britannica): natural, crystalline, definite but not fixed composition, geological processes."},
{id:"mi2",q:"How many mineral species are recognised today?",h:"Thousands.",o:["About 6,240","About 100","About 22","About 600,000"],e:"About 6,240 recognised species, with several new ones each year."},
{id:"mi3",q:"How many minerals are common in the Earth's crust?",h:"A round number.",o:["About 100","About 6,240","About 9","About 22"],e:"Only about 100 are common in the crust. 22 are on your list."},
{id:"mi4",q:"How many minerals do you have to learn for this course?",h:"The teacher said it.",o:["22","9","100","6,240"],e:"Only 22 for you to learn: the ones on the 22 mineral cards."},
{id:"mi5",y:1,q:"Why are glass and obsidian NOT minerals?",h:"What do they lack?",o:["They are amorphous: no crystal lattice","They are too soft","They are man-made only","They contain no silicon"],e:"Minerals are crystalline. Glass and obsidian have no long-range order."},
{id:"mi6",q:"Into how many classes is the mineralogical system organised?",h:"Native elements to organic minerals.",o:["9","7","22","18"],e:"Nine classes: native elements, sulfides, oxides, halides, carbonates, sulfates, phosphates, silicates, organic minerals."},
{id:"mi7",q:"What is a mineral's composition, according to Britannica?",h:"Two words with 'but'.",o:["Definite but not fixed","Fixed and never changing","Random","Always pure"],e:"Definite (but not fixed): atoms can be partly replaced by others."},
{id:"mi8",fol:1,q:"What defines a chemical element?",h:"The atomic number.",o:["The number of protons","The number of electrons","The number of neutrons","Its colour"],e:"An element is defined by its number of protons, the atomic number."},
{id:"mi9",fol:1,q:"What is an ion?",h:"Charge.",o:["An atom with a different number of electrons, so it has an electrical charge","An atom with a different number of neutrons","An atom with no protons","A type of crystal lattice"],e:"Ions have gained or lost electrons and so carry a charge."},
{id:"mi10",q:"What is a cation?",h:"Positive.",o:["A positively charged ion (fewer electrons)","A negatively charged ion (more electrons)","A neutral atom","A heavy isotope"],e:"Cation = positive (fewer electrons than protons). Anion = negative."},
{id:"mi11",fol:1,q:"What is an isotope?",h:"Different weight.",o:["An atom of the same element with a different number of neutrons","An atom with a different number of protons","An atom with an electrical charge","A mineral with defects"],e:"Isotopes differ in neutrons, so they have a different mass. Every element has several."},
{id:"mi12",q:"What is an anion?",h:"Negative.",o:["A negatively charged ion (more electrons)","A positively charged ion","An atom with more neutrons","A noble gas"],e:"Anions have extra electrons. In minerals, anions are e.g. S²⁻, O²⁻, Cl⁻, CO₃²⁻."},
{id:"mi13",q:"How are elements ordered in the periodic table?",h:"Count the protons.",o:["By increasing atomic number","By increasing density","Alphabetically","By colour"],e:"Ordered by increasing atomic number."},
{id:"mi14",q:"How many periods (rows) and groups (columns) does the periodic table have?",h:"7 and 18.",o:["7 rows (periods) and 18 columns (groups)","18 rows and 7 columns","9 rows and 9 columns","22 rows and 7 columns"],e:"7 periods, 18 groups."},
{id:"mi15",q:"Who created the periodic table, and when?",h:"1869.",o:["Dmitri Mendeleev, 1869","Charles Darwin, 1859","Marie Curie, 1903","James Dana, 1850s"],e:"Mendeleev, 1869. He predicted elements still unknown at the time."},
{id:"mi16",q:"The rare earth elements (REE) are which group?",h:"The row below the table, starting with lanthanum.",o:["The lanthanoids","The halogens","The noble gases","The alkali metals"],e:"Lanthanoids = rare earth elements, much in the news because of mining."},
{id:"mi17",fol:1,q:"What is a crystal lattice?",h:"Ordered, symmetrical, 3D.",o:["An ordered, symmetrical 3-dimensional arrangement of the atoms of a solid","The smallest repeating group of particles","A crack in a mineral","The colour of a mineral's powder"],e:"The lattice is the whole ordered 3D arrangement. The unit cell is its smallest repeating part."},
{id:"mi18",fol:1,q:"What is a unit cell?",h:"One tile of the floor.",o:["The smallest group of particles that makes up the repeating pattern","The whole crystal","A defect in a crystal","An amorphous solid"],e:"The unit cell repeats in all three dimensions to build the lattice."},
{id:"mi19",fol:1,q:"Into how many crystal systems are minerals classified?",h:"Triclinic to cubic.",o:["7","9","4","22"],e:"Seven crystal systems, by symmetry and unit cell geometry."},
{id:"mi20",q:"What is an amorphous solid?",h:"No order.",o:["A solid that lacks any long-range order","A solid with a cubic lattice","A liquid","A mineral with perfect cleavage"],e:"Amorphous solids, like glass, lack a crystal lattice."},
{id:"mi21",q:"What do crystal systems classify minerals by?",h:"Shape of the unit cell.",o:["Symmetry and unit cell geometry","Colour and streak","Hardness","Where they are mined"],e:"Crystal systems group minerals by symmetry and unit cell geometry."},
{id:"mi22",q:"What is the difference between a molecular and an empirical formula?",h:"Theory vs reality.",o:["Molecular = theoretical formula; empirical = the real measured composition","Molecular = real composition; empirical = theoretical","They are the same","Empirical formulas are only for gases"],e:"KAlSi₃O₈ is the molecular formula of K-feldspar; the measured one has some Na, Ca and other swaps."},
{id:"mi23",q:"Which is NOT a type of crystal defect?",h:"Three of them are about atoms in the lattice.",o:["Cleavage","Vacancies","Interstitial atoms","Dislocations"],e:"Defects: substitutional atoms, interstitial atoms, vacancies, dislocations. Cleavage is a physical property."},
{id:"mi24",y:1,q:"Why can quartz have many different colours?",h:"Crystals are not perfect.",o:["Because of defects (e.g. other atoms) in the crystal lattice","Because it is amorphous","Because of its streak","Because it is magnetic"],e:"Lattice defects cause colour varieties (clear, white, purple, pink, yellow)."},
{id:"mi25",fol:1,q:"What is streak?",h:"Powder.",o:["The colour a mineral leaves when dragged on a porcelain plate","How it reflects light","How it breaks","How hard it is"],e:"Streak = colour of the powder on a porcelain plate (or paper)."},
{id:"mi26",fol:1,q:"What is luster?",h:"Shiny or not.",o:["The way a mineral reflects light, e.g. dull, vitreous, metallic","The colour of its powder","Its weight","Its crystal system"],e:"Luster describes how the mineral reflects light."},
{id:"mi27",fol:1,q:"How is hardness tested?",h:"Not by breaking.",o:["By scratching; Mohs scale from 1 (talc) to 10 (diamond)","By breaking it with a hammer","By weighing it","By dropping acid on it"],e:"Hardness = resistance to scratching, on the Mohs scale."},
{id:"mi28",fol:1,q:"What is cleavage?",h:"Neat planes.",o:["The way a mineral breaks along flat cleavage planes","The way it breaks with no planes","Its colour","Its glow under UV light"],e:"Cleavage can be perfect or poor, and basal, prismatic, cubic…"},
{id:"mi29",fol:1,q:"What is fracture?",h:"No planes.",o:["The way a mineral breaks when not following cleavage planes, e.g. conchoidal","Breaking along perfect flat planes","Its reaction with acid","Its hardness"],e:"Fracture: conchoidal, uneven, fibrous…"},
{id:"mi30",q:"Which densities are correct?",h:"Water is 1.",o:["Water 1, quartz 2.65, gold 19.3 g/cm³","Water 10, quartz 26.5, gold 193 g/cm³","Water 1, quartz 7, gold 10 g/cm³","All minerals are 1 g/cm³"],e:"Water 1 g/cm³, quartz 2.65 g/cm³, gold 19.3 g/cm³."},
{id:"mi31",fol:1,q:"What is the habit of a mineral?",h:"Its overall look.",o:["Its overall appearance (shape): equant, massive, tabular, prismatic, fibrous…","Its streak","Its hardness","Its chemical formula"],e:"Habit = the overall shape of the crystal or aggregate."},
{id:"mi32",q:"Which is the hardest and which the softest on the Mohs scale?",h:"10 and 1.",o:["Diamond (10) and talc (1)","Quartz (10) and gypsum (1)","Gold (10) and graphite (1)","Corundum (10) and calcite (1)"],e:"The Mohs scale runs from talc (1) to diamond (10)."},
{id:"mi33",q:"Which is an \"other specific physical property\" of minerals?",h:"A magnet helps.",o:["Magnetism","Grain size","Foliation","Porosity of a rock"],e:"Other properties: electrical conductivity, magnetism, fluorescence, reaction with acid."},
{id:"mi34",fol:1,q:"Which list gives the 9 mineral classes?",h:"Native first, organic last.",o:["Native elements, sulfides, oxides, halides, carbonates, sulfates, phosphates, silicates, organic minerals","Igneous, sedimentary, metamorphic, organic, oxides, sulfides, halides, gems, ores","Metals, nonmetals, gases, liquids, solids, crystals, glasses, clays, salts","Quartz, feldspar, mica, olivine, pyroxene, amphibole, garnet, calcite, halite"],e:"Native elements, sulfides, oxides, halides, carbonates, sulfates, phosphates, silicates, organic minerals."},
{id:"mi35",q:"What do sulfides consist of?",h:"S²⁻.",o:["Metal cations + sulfur anions (S²⁻)","Metal cations + sulfate (SO₄²⁻)","Metal cations + oxygen","Silicon + oxygen"],e:"Sulfides: key ores of copper, lead, nickel, zinc."},
{id:"mi36",fol:1,q:"What is the difference between sulfides and sulfates?",h:"One has oxygen.",o:["Sulfides have S²⁻; sulfates have SO₄²⁻","They are the same","Sulfates have S²⁻; sulfides have SO₄²⁻","Sulfides are silicates"],e:"Don't mix them. Pyrite is a sulfide, gypsum a sulfate."},
{id:"mi37",q:"Which metals are mainly sourced from oxides?",h:"Four metals.",o:["Iron, aluminium, chromium, titanium","Copper, lead, nickel, zinc","Gold, silver, platinum","Sodium, potassium, calcium"],e:"Oxides are important sources of Fe, Al, Cr and Ti."},
{id:"mi38",q:"Where do halides often form?",h:"Salty water.",o:["In evaporitic environments where saline water bodies dry out","Deep in the mantle","In hydrothermal veins only","In the core"],e:"Halides (halite, fluorite) often form where salty water evaporates."},
{id:"mi39",q:"What is a typical property of many carbonates?",h:"Fizz.",o:["They react with dilute acids","They are magnetic","They conduct electricity","They are harder than quartz"],e:"Many carbonates react with acid. Calcite reacts strongly."},
{id:"mi40",fol:1,q:"Which mineral class makes up over 90 % of Earth's crust?",h:"Si + O.",o:["Silicates","Carbonates","Oxides","Native elements"],e:"Silicates are by far the largest and most diverse group."},
{id:"mi41",fol:1,q:"What is the silicate tetrahedron?",h:"One Si, four O.",o:["A silicon atom surrounded by four oxygen atoms, with a −4 charge","A carbon atom with four hydrogens","An iron atom with four sulfurs","A cube of sodium and chlorine"],e:"It must bond with cations or share oxygens with other tetrahedra."},
{id:"mi42",q:"What are the anions of phosphates?",h:"P + O.",o:["PO₄³⁻","SO₄²⁻","CO₃²⁻","SiO₄⁴⁻"],e:"Phosphates: metal cations + PO₄³⁻. Essential for biology and industry."},
{id:"mi43",q:"Which class is quartz (SiO₂) placed in, in this course?",h:"Look at its formula: metal + O.",o:["Oxides","Silicates","Native elements","Carbonates"],e:"In this course quartz is listed under oxides (SiO₂ = Si + O). Some books call it a silicate, but use oxides for the test."},
{id:"mi44",fol:1,q:"What is graphite used for?",h:"School.",o:["Pencils, lubricants, batteries, crucibles","Table salt","Cement","Primary ore of lead"],e:"Graphite (C): pencils, lubricants, batteries, crucibles."},
{id:"mi45",fol:1,q:"What is diamond used for?",h:"Hardest mineral.",o:["Gemstones and cutting tools","Pencils","Fertilizer","Sulfuric acid"],e:"Diamond (C, Mohs 10): gemstones, cutting tools."},
{id:"mi46",q:"Graphite and diamond are both made of carbon. What is different?",h:"The arrangement of atoms.",o:["Their crystal system (structure)","Their chemical element","Graphite is a sulfide","Diamond is amorphous"],e:"Same element, different crystal structure: graphite hexagonal and soft, diamond cubic and hardest."},
{id:"mi47",fol:1,q:"Which mineral is the primary ore of lead?",h:"Lead-grey cubes.",o:["Galena","Pyrite","Chalcopyrite","Hematite"],e:"Galena (PbS): primary lead ore, often with silver."},
{id:"mi48",fol:1,q:"Which mineral is the most important copper ore?",h:"Chalco = copper.",o:["Chalcopyrite","Galena","Magnetite","Halite"],e:"Chalcopyrite (CuFeS₂) is the most important copper ore."},
{id:"mi49",fol:1,q:"What is pyrite mainly used for?",h:"An acid.",o:["Sulfuric acid production (minor iron ore)","Main ore of lead","Table salt","Cement"],e:"Pyrite (FeS₂): sulfuric acid production, minor iron ore."},
{id:"mi50",fol:1,q:"Which two minerals are the major iron ores?",h:"Both are oxides.",o:["Hematite and magnetite","Pyrite and galena","Quartz and calcite","Halite and graphite"],e:"Hematite (Fe₂O₃) and magnetite (Fe₃O₄)."},
{id:"mi51",fol:1,q:"What is quartz used for?",h:"Windows.",o:["Glass and ceramics industry, electronics","Pencils","Fertilizer","Main ore of iron"],e:"Quartz (SiO₂): glass, ceramics, electronics."},
{id:"mi52",fol:1,q:"What is halite used for?",h:"Kitchen and winter roads.",o:["Table salt, chemical industry, de-icing roads","Cement","Porcelain","Cutting tools"],e:"Halite (NaCl): table salt, chemical industry, road de-icing."},
{id:"mi53",fol:1,q:"What is calcite used for?",h:"Building.",o:["Cement and lime production, soil conditioner","Electrical insulators","Iron ore","Batteries"],e:"Calcite (CaCO₃): cement and lime, soil conditioner. Main mineral of limestone and marble."},
{id:"mi54",q:"Which mineral is strongly magnetic?",h:"Its name says it.",o:["Magnetite","Hematite","Quartz","Calcite"],e:"Magnetite is strongly magnetic."},
{id:"mi55",fol:1,q:"What is olivine used for?",h:"A green gemstone.",o:["Refractory material and gemstone (peridot)","Porcelain","Electrical insulators","Water softeners"],e:"Olivine: refractory material, gemstone peridot."},
{id:"mi56",fol:1,q:"What is muscovite used for?",h:"White mica.",o:["Electrical insulators, cosmetics","Iron ore","Cement","Cutting tools"],e:"Muscovite: electrical insulators, cosmetics."},
{id:"mi57",fol:1,q:"What is K-feldspar used for?",h:"Pots and plates.",o:["Ceramics, glass, mild abrasives","Fertilizer","Lead ore","Water softeners"],e:"K-feldspar: ceramics, glass, mild abrasives."},
{id:"mi58",fol:1,q:"What are clay minerals (kaolinite) used for?",h:"Fine white china.",o:["Porcelain, paper, cosmetics","Cutting tools","Sulfuric acid","Iron ore"],e:"Kaolinite: porcelain, paper, cosmetics."},
{id:"mi59",fol:1,q:"What are zeolites used for?",h:"Tiny holes.",o:["Water softeners, molecular sieves, catalysts","Pencils","Table salt","Gemstones only"],e:"Zeolites are porous: water softeners, molecular sieves, catalysts."},
{id:"mi60",fol:1,q:"What is garnet used for?",h:"Sandpaper and jewelry.",o:["Abrasive and gemstone","Fertilizer","Insulators","Lead ore"],e:"Garnet: abrasive, gemstone."},
{id:"mi61",fol:1,q:"Which silicate has NO industrial use?",h:"An essential rock-forming mineral.",o:["Pyroxene","Muscovite","K-feldspar","Zeolite"],e:"Pyroxene: no industrial use (also amphibole, biotite, chlorite)."},
{id:"mi62",fol:1,q:"What is plagioclase used for?",h:"Like K-feldspar, but a filler.",o:["Ceramics, filler","Iron ore","Water softeners","Gemstone peridot"],e:"Plagioclase: ceramics, filler."},
{id:"mi63",q:"Which mineral is called \"black mica\"?",h:"Bio-.",o:["Biotite","Muscovite","Chlorite","Graphite"],e:"Biotite = black mica; muscovite = white mica."},
{id:"mi64",q:"Where does kaolinite form?",h:"Weathering.",o:["In weathered granite and feldspar-rich rocks (tropical soils)","In the mantle","In hydrothermal veins only","In meteorites"],e:"Kaolinite forms when feldspar weathers (hydrolysis, lecture 4)."},
{id:"mi65",q:"Which mineral is typical of low-grade metamorphic rocks and greenschists, pistachio green?",h:"Pistachio.",o:["Epidote","Olivine","Halite","Galena"],e:"Epidote: pistachio green, greenschist facies. Use: none major, ornamental."},
{id:"mi66",q:"Which minerals are NOT on your list of 22?",h:"The extra ones in the \"don't memorise\" step.",o:["Extras like gold, gypsum, apatite","Quartz and calcite","All silicates","All oxides"],e:"Gold, gypsum, apatite and the other extras are not tested. Your list is the 22 mineral cards."},
{id:"mi67",q:"Which mineral has a red streak even though it can look steel-grey?",h:"Blood.",o:["Hematite","Magnetite","Galena","Graphite"],e:"Hematite: steel-grey to reddish-brown, red streak."},
{id:"mi68",q:"Which mineral has perfect cubic cleavage and tastes salty?",h:"NaCl.",o:["Halite","Calcite","Quartz","Pyrite"],e:"Halite: perfect cubic cleavage, salty."},
{id:"mi69",q:"Which mineral reacts strongly with HCl (hydrochloric acid)?",h:"Carbonate.",o:["Calcite","Quartz","Halite","Olivine"],e:"Calcite reacts strongly with acid; it's how you recognise limestone and marble."},
{id:"mi70",q:"Which mineral has conchoidal fracture and no cleavage, hardness 7?",h:"Glass-making.",o:["Quartz","Calcite","Halite","Galena"],e:"Quartz: Mohs 7, conchoidal fracture, no cleavage."},
{id:"mi71",q:"Which is the Goldschmidt group of \"iron-loving\" elements (extra, not tested)?",h:"Sidero = iron.",o:["Siderophile","Lithophile","Chalcophile","Atmophile"],e:"Extra only: siderophile elements went with iron into the core.",x:1},
{id:"mi72",q:"Which bonds are the strongest, according to the video?",h:"Diamond.",o:["Covalent","Ionic","Metallic","There is no difference"],e:"Video extra: covalent (diamond) > ionic (halite) > metallic.",x:1},
{id:"mi73",q:"Which Na–Ca feldspar shows striations on its cleavage faces?",h:"White to grey.",o:["Plagioclase","K-feldspar","Muscovite","Olivine"],e:"Plagioclase (anorthite–albite series) has fine striations."},
{id:"mi74",q:"Which mineral is the main mineral of limestones and marbles?",h:"CaCO₃.",o:["Calcite","Quartz","Halite","Chlorite"],e:"Calcite is the main component of limestone and marble."}
];

var VOC=[
["Basics","Mineral","A natural, normally crystalline solid element or compound with a definite (not fixed) composition, formed by geological processes."],
["Basics","Mineral species","One named kind of mineral. About 6,240 are recognised; ~100 are common in the crust."],
["Basics","Rock","A natural aggregate of minerals (or glass, or fragments)."],
["Basics","Geological processes","Natural Earth processes (magmatic, metamorphic, sedimentary, hydrothermal) that form minerals."],
["Basics","Ore","A mineral or rock mined for a valuable element (e.g. galena for lead)."],
["Basics","Gemstone","A mineral valued for jewelry (diamond, garnet, peridot, ruby)."],
["Chemistry","Atom","The smallest unit of an element: a nucleus of protons and neutrons with electrons around it."],
["Chemistry","Proton","Positively charged particle in the nucleus. Their number defines the element."],
["Chemistry","Neutron","Particle without charge in the nucleus. Their number sets the isotope (mass)."],
["Chemistry","Electron","Negatively charged particle around the nucleus. Their number sets the charge."],
["Chemistry","Nucleus","The centre of an atom: protons and neutrons."],
["Chemistry","Element","A substance defined by the number of protons (atomic number)."],
["Chemistry","Atomic number","The number of protons in an atom."],
["Chemistry","Atomic mass","The average mass of an element's atoms (e.g. carbon 12.01)."],
["Chemistry","Mass number","Protons + neutrons in one atom (e.g. ¹⁸O)."],
["Chemistry","Ion","An atom with a different number of electrons, so it has an electrical charge."],
["Chemistry","Cation","A positive ion (fewer electrons than protons)."],
["Chemistry","Anion","A negative ion (more electrons than protons)."],
["Chemistry","Isotope","An atom of the same element with a different number of neutrons, so a different weight."],
["Chemistry","Periodic table","Table of elements ordered by increasing atomic number: 7 periods, 18 groups (Mendeleev 1869)."],
["Chemistry","Period","A row of the periodic table (7 in total)."],
["Chemistry","Group","A column of the periodic table (18 in total)."],
["Chemistry","Alkali metals","First column (Li, Na, K…), not hydrogen."],
["Chemistry","Alkaline earth metals","Second column (Be, Mg, Ca…)."],
["Chemistry","Transition metals","The middle block (Fe, Ni, Cu, Zn, Au…)."],
["Chemistry","Lanthanoids (rare earth elements)","The row starting with lanthanum; the REE much in the news because of mining."],
["Chemistry","Actinoids","The row starting with actinium (Th, U…)."],
["Chemistry","Metalloids","Elements between metals and nonmetals (B, Si, As…)."],
["Chemistry","Halogens","Group 17: F, Cl, Br, I. They form halide minerals."],
["Chemistry","Noble gases","Last column: He, Ne, Ar… very unreactive gases."],
["Chemistry","Goldschmidt classification","Groups elements by where they went when the Earth formed: lithophile, siderophile, chalcophile, atmophile. (yellow, not tested)"],
["Chemistry","Lithophile","\"Rock-loving\" elements; prefer silicates and oxides, common in the crust. (not tested)"],
["Chemistry","Siderophile","\"Iron-loving\" elements; prefer metallic iron, concentrated in the core. (not tested)"],
["Chemistry","Chalcophile","\"Sulfur-loving\" elements; form sulfide minerals. (not tested)"],
["Chemistry","Atmophile","\"Gas-loving\" elements; concentrated in the atmosphere. (not tested)"],
["Structure","Crystalline","With atoms arranged in a highly ordered, repeating 3D structure."],
["Structure","Amorphous","Lacking any long-range order, like glass."],
["Structure","Crystal lattice","An ordered, symmetrical 3D arrangement of the atoms of a solid."],
["Structure","Unit cell","The smallest group of particles that makes up the repeating pattern of a lattice."],
["Structure","Crystal system","One of 7 groups of minerals by symmetry and unit-cell geometry."],
["Structure","Cubic (isometric)","The most symmetrical crystal system (halite, pyrite, galena, diamond, garnet)."],
["Structure","Triclinic","The least symmetrical crystal system (plagioclase, kaolinite)."],
["Structure","Crystal defect","An imperfection in a crystal lattice: substitutional or interstitial atoms, vacancies, dislocations."],
["Structure","Substitutional atom","A different atom sitting in a normal lattice spot."],
["Structure","Interstitial atom","An extra atom squeezed between lattice spots."],
["Structure","Vacancy","A missing atom in a lattice."],
["Structure","Dislocation","A shifted row of atoms in a lattice."],
["Structure","Molecular formula","The theoretical chemical formula of a mineral (e.g. KAlSi₃O₈)."],
["Structure","Empirical formula","The real, measured composition of a mineral, with its small swaps of atoms."],
["Structure","Silicate tetrahedron","One Si atom surrounded by four O atoms, charge −4: the building block of silicates."],
["Properties","Colour","The colour of the mineral (can vary because of defects)."],
["Properties","Streak","The colour of a mineral's powder on a porcelain plate."],
["Properties","Luster","How a mineral reflects light: dull, vitreous, metallic, adamantine…"],
["Properties","Vitreous","Glassy luster (quartz)."],
["Properties","Metallic","Luster like metal (pyrite, galena)."],
["Properties","Hardness","Resistance to scratching."],
["Properties","Mohs scale","Hardness scale from 1 (talc) to 10 (diamond)."],
["Properties","Cleavage","Breaking along flat cleavage planes (perfect or poor; basal, prismatic, cubic…)."],
["Properties","Fracture","Breaking without following cleavage planes (conchoidal, uneven, fibrous…)."],
["Properties","Conchoidal fracture","Shell-shaped curved breakage, as in quartz and glass."],
["Properties","Density","Mass over volume, g/cm³. Water 1, quartz 2.65, gold 19.3."],
["Properties","Habit","The overall appearance or shape of a mineral (equant, massive, tabular, prismatic, fibrous)."],
["Properties","Magnetism","Being attracted by a magnet (magnetite)."],
["Properties","Fluorescence","Glowing under UV light."],
["Properties","Reaction with acid","Fizzing with dilute HCl, typical of calcite."],
["Classes","Native elements","Minerals made of a single element (graphite, diamond, gold)."],
["Classes","Sulfides","Metal cations + S²⁻ (pyrite, galena, chalcopyrite). Key metal ores."],
["Classes","Oxides","Metal cations + O²⁻ (quartz, hematite, magnetite). Fe, Al, Cr, Ti sources."],
["Classes","Halides","Metal cations + halogen anions (halite, fluorite). Evaporites."],
["Classes","Carbonates","Metal cations + CO₃²⁻ (calcite). Many react with acid."],
["Classes","Sulfates","Metal cations + SO₄²⁻ (gypsum). Evaporites, veins."],
["Classes","Phosphates","Metal cations + PO₄³⁻ (apatite). Biology, fertilizer."],
["Classes","Silicates","Metal cations + SiO₄⁴⁻. Over 90 % of Earth's crust."],
["Classes","Organic minerals","Rare minerals made of organic compounds."],
["Classes","Rock-forming minerals","The few common minerals that build most rocks (quartz, feldspars, micas, olivine, pyroxene, amphibole)."]
].concat(MIN.map(function(m){return ["The 22 minerals",m.n,m.c+". Use: "+m.u+"."]}));
var VCON=[["Ion","Cation","Anion"],["Element","Atomic number","Proton"],["Isotope","Neutron","Mass number"],["Crystal lattice","Unit cell","Crystal system","Crystalline"],["Streak","Colour"],["Cleavage","Fracture","Conchoidal fracture"],["Hardness","Mohs scale"],["Luster","Vitreous","Metallic"],["Sulfides","Sulfates"],["Molecular formula","Empirical formula"],["Lithophile","Siderophile","Chalcophile","Atmophile","Goldschmidt classification"],["Hematite","Magnetite"],["Biotite","Muscovite"],["K-feldspar","Plagioclase"],["Graphite","Diamond"],["Substitutional atom","Interstitial atom","Vacancy","Dislocation","Crystal defect"],["Period","Group","Periodic table"]];

var SHEET=[
 ["What a mineral is",["Item","Fact"],[["Definition","Natural, normally crystalline solid element or compound, definite (not fixed) composition, formed by geological processes"],["Numbers","~6,240 species; ~100 common in the crust; 22 to learn; 9 classes"],["Not minerals","Glass, obsidian, opal (amorphous)"]]],
 ["Atoms",["Word","Meaning"],[["Element","Defined by the number of protons (atomic number)"],["Ion","Different number of electrons → charge; cation +, anion −"],["Isotope","Different number of neutrons → different weight"],["Periodic table","Ordered by atomic number; 7 periods, 18 groups; Mendeleev 1869"],["Rare earth elements","= lanthanoids"]]],
 ["Structure",["Term","Meaning"],[["Crystalline / amorphous","Ordered lattice / no long-range order"],["Crystal lattice","Ordered, symmetrical 3D arrangement of atoms"],["Unit cell","Smallest repeating group"],["Crystal systems","7 groups by symmetry and unit cell geometry"],["Defects","Substitutional, interstitial atoms, vacancies, dislocations"],["Formulas","Molecular = theoretical; empirical = real measured"]]],
 ["Properties",["Property","Meaning"],[["Colour","The mineral's colour"],["Streak","Powder colour on porcelain"],["Luster","How it reflects light: dull, vitreous, metallic"],["Hardness","Scratching; Mohs 1 (talc) to 10 (diamond)"],["Cleavage","Breaks along planes: perfect/poor; basal/prismatic/cubic"],["Fracture","Breaks off the planes: conchoidal/uneven/fibrous"],["Density","Water 1, quartz 2.65, gold 19.3 g/cm³"],["Habit","Overall shape: equant, massive, tabular, prismatic, fibrous"],["Others","Conductivity, magnetism, fluorescence, reaction with acid"]]],
 ["Classes",["Class","Anion / facts"],[["Native elements","Single element"],["Sulfides","S²⁻; Cu, Pb, Ni, Zn ores"],["Oxides","O²⁻; Fe, Al, Cr, Ti"],["Halides","Cl⁻, F⁻, Br⁻, I⁻; evaporites"],["Carbonates","CO₃²⁻; react with acid"],["Sulfates","SO₄²⁻; evaporites, veins"],["Phosphates","PO₄³⁻; biology, industry"],["Silicates","SiO₄⁴⁻ tetrahedron; >90 % of the crust"],["Organic","Organic compounds"]]]
];

/* element data for the atom builder: [symbol, name, group] */
var EL=[["H","Hydrogen","Other nonmetal"],["He","Helium","Noble gas"],["Li","Lithium","Alkali metal"],["Be","Beryllium","Alkaline earth metal"],["B","Boron","Metalloid"],["C","Carbon","Other nonmetal"],["N","Nitrogen","Other nonmetal"],["O","Oxygen","Other nonmetal"],["F","Fluorine","Halogen"],["Ne","Neon","Noble gas"],["Na","Sodium","Alkali metal"],["Mg","Magnesium","Alkaline earth metal"],["Al","Aluminium","Other metal"],["Si","Silicon","Metalloid"],["P","Phosphorus","Other nonmetal"],["S","Sulfur","Other nonmetal"],["Cl","Chlorine","Halogen"],["Ar","Argon","Noble gas"],["K","Potassium","Alkali metal"],["Ca","Calcium","Alkaline earth metal"]];
var NORMN=[0,2,4,5,6,6,7,8,10,10,12,12,14,14,16,16,18,22,20,20];
var GROUPS=[["Na (sodium)","Alkali metal"],["K (potassium)","Alkali metal"],["Li (lithium)","Alkali metal"],["Ca (calcium)","Alkaline earth metal"],["Mg (magnesium)","Alkaline earth metal"],["Fe (iron)","Transition metal"],["Cu (copper)","Transition metal"],["Ni (nickel)","Transition metal"],["Au (gold)","Transition metal"],["Ce (cerium)","Lanthanoid (rare earth element)"],["Nd (neodymium)","Lanthanoid (rare earth element)"],["La (lanthanum)","Lanthanoid (rare earth element)"],["U (uranium)","Actinoid"],["Th (thorium)","Actinoid"],["Si (silicon)","Metalloid"],["As (arsenic)","Metalloid"],["Cl (chlorine)","Halogen"],["F (fluorine)","Halogen"],["Ar (argon)","Noble gas"],["He (helium)","Noble gas"],["O (oxygen)","Other nonmetal"],["S (sulfur)","Other nonmetal"],["Al (aluminium)","Other metal"],["Pb (lead)","Other metal"]];
var GOPT=["Alkali metal","Alkaline earth metal","Transition metal","Lanthanoid (rare earth element)","Actinoid","Metalloid","Halogen","Noble gas","Other nonmetal","Other metal"];
var PROPS=[["The colour of its powder on a porcelain plate","Streak"],["How it reflects light: dull, vitreous, metallic","Luster"],["Tested by scratching; 1 to 10","Hardness"],["Breaks along neat flat planes","Cleavage"],["Breaks in a curved, shell-like way, no planes","Fracture"],["Mass over volume","Density"],["The overall shape: prismatic, tabular, fibrous…","Habit"],["Glows under UV light","Fluorescence"],["Fizzes with dilute HCl","Reaction with acid"],["A compass needle moves next to it","Magnetism"]];
var POPT=["Streak","Luster","Hardness","Cleavage","Fracture","Density","Habit","Fluorescence","Reaction with acid","Magnetism","Colour"];
var CLASSES=["Native element","Sulfide","Oxide","Halide","Carbonate","Sulfate","Phosphate","Silicate"];

function initAll(){
  /* atom builder */
  function up(){
    var p=+$("#ap").value,n=+$("#an").value,e=+$("#ae").value,E=EL[p-1],ch=p-e,mass=p+n;
    $("#apv").textContent=p;$("#anv").textContent=n;$("#aev").textContent=e;
    var chs=ch===0?"neutral atom":(ch>0?"cation (charge +"+ch+")":"anion (charge "+ch+")");
    var iso=n===NORMN[p-1]?"the most common isotope":"an isotope with "+(n>NORMN[p-1]?"more":"fewer")+" neutrons than usual";
    var sup=String(mass).split("").map(function(d){return "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]}).join("");
    var cs=ch===0?"":(Math.abs(ch)>1?String(Math.abs(ch)).split("").map(function(d){return "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]}).join(""):"")+(ch>0?"⁺":"⁻");
    $("#aout").innerHTML='<div class="big">'+sup+E[0]+cs+' · '+E[1]+'</div><div class="kv"><span>Element (protons)</span><span>'+p+' protons = always '+E[1].toLowerCase()+'</span><span>Charge (electrons)</span><span>'+chs+'</span><span>Mass number</span><span>'+p+' + '+n+' = '+mass+' ('+iso+')</span><span>Element group</span><span>'+E[2]+'</span></div>';
  }
  ["ap","an","ae"].forEach(function(id){$("#"+id).oninput=up});up();
  /* groups drill */
  var lg=-1;GEO.drill($("#gdrill"),"gstreak",function(){var n;do{n=Math.floor(Math.random()*GROUPS.length)}while(n===lg);lg=n;var g=GROUPS[n];var wrong=shuffle(GOPT.filter(function(x){return x!==g[1]})).slice(0,3);return {q:"Which group is <b>"+g[0]+"</b>?",opts:shuffle([g[1]].concat(wrong)),ans:g[1],fb:g[0]+" → <b>"+g[1]+"</b>."}});
  /* crystalline vs amorphous */
  GEO.sorter($("#csorter"),[["Quartz","c","SiO₂ with a crystal lattice."],["Window glass","a","SiO₂ without long-range order."],["Obsidian (volcanic glass)","a","Cooled too fast to crystallise (recording/video)."],["Halite","c","Cubic crystals."],["Opal","a","Lacks a crystal lattice, so not a true mineral (video)."],["Diamond","c","Cubic carbon lattice."],["Calcite","c","Trigonal lattice, rhombohedral cleavage."],["Pyrite","c","Cubic crystals."]],[["c","Crystalline"],["a","Amorphous"]]);
  /* Mohs slider */
  var MS=[[1,"Talc"],[2,"Gypsum"],[3,"Calcite"],[4,"Fluorite"],[5,"Apatite"],[6,"Orthoclase (K-feldspar)"],[7,"Quartz"],[8,"Topaz"],[9,"Corundum"],[10,"Diamond"]];
  function mohs(){
    var h=+$("#mohs").value;
    var lo=MIN.filter(function(m){var a=m.h.replace("~","").split("–").map(Number);return (a[1]||a[0])<=h}).map(function(m){return m.n});
    var ref=MS.filter(function(x){return Math.abs(x[0]-h)<0.6})[0];
    $("#mohsout").innerHTML='<div class="big">Hardness '+h+(ref?' · like '+ref[1]:'')+'</div><p style="margin:6px 0 0">A mineral this hard would scratch these minerals from your list (their whole Mohs range is at or below '+h+'):</p><p style="margin:4px 0 0"><b>'+(lo.length?lo.join(", "):"none of them")+'</b></p><p style="font-size:.85rem;color:var(--mute);margin:6px 0 0">Reference minerals (extra, not tested): '+MS.map(function(x){return x[0]+" "+x[1]}).join(" · ")+'</p>';
  }
  $("#mohs").oninput=mohs;mohs();
  /* property drill */
  var lp=-1;GEO.drill($("#pdrill"),"pstreak",function(){var n;do{n=Math.floor(Math.random()*PROPS.length)}while(n===lp);lp=n;var p=PROPS[n];return {q:"Which property: <b>"+esc(p[0])+"</b>?",opts:shuffle([p[1]].concat(shuffle(POPT.filter(function(x){return x!==p[1]})).slice(0,3))),ans:p[1],fb:""}});
  /* class drill */
  var lk=-1;GEO.drill($("#kdrill"),"kstreak",function(){var n;do{n=Math.floor(Math.random()*MIN.length)}while(n===lk);lk=n;var m=MIN[n];return {q:"Which class is <b>"+esc(m.n)+"</b> ("+m.f+")?",opts:shuffle([m.c].concat(shuffle(CLASSES.filter(function(x){return x!==m.c})).slice(0,3))),ans:m.c,fb:m.n+" is a <b>"+m.c.toLowerCase()+"</b>. Use: "+esc(m.u)+"."}});
  /* tables */
  GEO.table($("#t-nonsil"),["Mineral","Class","Use (must know)","Recognise it by"],MIN.filter(function(m){return m.c!=="Silicate"}).map(function(m){return [m.n,m.c,m.u,m.k]}),1);
  GEO.table($("#t-sil"),["Mineral","Use (must know)","Recognise it by","Where"],MIN.filter(function(m){return m.c==="Silicate"}).map(function(m){return [m.n,m.u,m.k,m.o]}),1);
  GEO.table($("#t-yel"),["Mineral","Class","Use"],YEL,1);
}
STEPS[0].init=initAll;

GEO.register({
  id:"t2",num:2,title:"Minerals",short:"Minerals",sub:"Lecture 2 · test 19 Oct (taken) + final exam",
  blurb:"Atoms and the periodic table, crystal structure, physical properties, 9 classes and the 22 minerals you must know.",
  h1:"Minerals, one step at a time",
  start:{lede:"You never need the slides: everything for the test is taught here, step by step. Only <b>22 minerals</b> are tested (the teacher said so in class). That is exactly <b>22 minerals</b>. For each one you need the <b>name and its use</b>, not the formula.",
    plan:'<h3>First time, about 2 hours</h3><ol><li><b>Learn, step by step</b>: 9 steps. Play with the atom builder, the hardness slider and the drills.</li><li><b>22 mineral cards</b>: flip all, then play "Which mineral am I?" until you get 8 in a row.</li></ol><h3>Revision, 1 hour</h3><ol><li><b>22 minerals</b> tab: drill uses until you get 10 in a row.</li><li><b>Mock test</b> twice, then <b>Review</b>.</li></ol>',
    six:["A mineral is a <b>natural, normally crystalline</b> solid with a <b>definite (not fixed)</b> composition, formed by geological processes. Glass is not a mineral.","<b>Element</b> = number of protons; <b>ion</b> = different electrons (cation +, anion −); <b>isotope</b> = different neutrons.","<b>Crystal lattice</b> (ordered 3D) made of repeating <b>unit cells</b>; <b>7 crystal systems</b>; defects explain colour and empirical formulas.","Properties: <b>colour, streak, luster, hardness (Mohs 1 talc–10 diamond), cleavage, fracture, density, habit</b>.","<b>9 classes</b>: native elements, sulfides, oxides, halides, carbonates, sulfates, phosphates, silicates (>90 % of the crust), organic.","The <b>22 minerals and their uses</b>: e.g. galena = lead ore, chalcopyrite = copper ore, hematite and magnetite = iron ores, kaolinite = porcelain."]},
  must:"mineral uses, properties and structure",
  steps:STEPS,Q:Q,VOC:VOC,VCON:VCON,sheet:SHEET,
  mockNote:"The timed test only uses tested material. \"All questions\" also includes 2 extras, marked \"video extra\".",
  cards:{tab:"22 mineral cards",h1:"22 mineral cards",who:"Which mineral am I?",lede:"The 22 minerals you must know. Tap a card to flip it. The use is the most important line.",labels:{c:"Class",u:"Use",k:"Recognise it by",o:"Where it forms"},keys:["c","u","k","o"],
    items:MIN.map(function(m){var it={n:m.n,grp:m.c,c:m.c,u:m.u,k:m.k,o:m.o,clue:["u","k"]};if(m.n==="Hematite"||m.n==="Magnetite"){it.clue=["k","u"];it.not=[m.n==="Hematite"?"Magnetite":"Hematite"]}if(m.n==="Pyroxene"||m.n==="Amphibole"||m.n==="Biotite"||m.n==="Chlorite"||m.n==="Epidote"){it.clue=["k","o"]}return it})},
  names:{tab:"22 minerals",h1:"The 22 minerals: what you need",small:"Drill: what is it used for?",
    html:'<div class="card"><h2>Short answer</h2><p>The teacher: "what I want you to know from these minerals … is just the <b>name of the mineral and their use</b>. I don\'t want you to know the chemical formula or some properties." <span class="chip">recording</span></p><p>So: '+MUST+' name, class and use of the 22 &nbsp; '+NICE+' how to recognise them, formula, hardness (helps in the practical exam) &nbsp; '+SKIP+' extra minerals (not tested)</p></div><div class="card"><h2>Drill: uses</h2><div class="seg" id="udir" role="group" aria-label="Direction"><button data-d="u" aria-pressed="true">Mineral → use</button><button data-d="m" aria-pressed="false">Use → mineral</button></div><p style="margin-top:8px">Streak: <b id="ustreak">0</b> (aim for 10).</p><div id="udrill"></div></div>',
    tables:[
      {title:"The 22: name, class, use",head:["Mineral","Class","Use","Need it?"],rows:MIN.map(function(m){return [m.n,m.c,m.u,MUST]})},
      {title:"The 22: how to recognise them",intro:"Not needed for the weekly test, but it helps in the practical rock exam and the final exam.",head:["Mineral","Recognise it by","Formula","Mohs","Need it?"],rows:MIN.map(function(m){return [m.n,m.k,m.f,m.h,NICE]})},
      {title:"Extra minerals (not tested)",head:["Mineral","Class","Use","Need it?"],rows:YEL.map(function(y){return [y[0],y[1],y[2],SKIP]})}
    ],
    init:function(){
      var dir="u",last=-1;
      function make(){var n;do{n=Math.floor(Math.random()*MIN.length)}while(n===last);last=n;var m=MIN[n];
        var others=shuffle(MIN.filter(function(x){return x!==m&&x.u!==m.u})).slice(0,3);
        if(dir==="u")return {q:"What is <b>"+esc(m.n)+"</b> used for?",opts:shuffle([m.u].concat(others.map(function(x){return x.u}))),ans:m.u,fb:""};
        return {q:"Which mineral is used for: <b>"+esc(m.u)+"</b>?",opts:shuffle([m.n].concat(others.map(function(x){return x.n}))),ans:m.n,fb:""};}
      GEO.drill($("#udrill"),"ustreak",make);
      $("#udir").onclick=function(e){var b=e.target.closest("button");if(!b)return;dir=b.getAttribute("data-d");$$("#udir button").forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});GEO.drill($("#udrill"),"ustreak",make)};
    }},
  mastery:{facts:[[1,"According to Nickel (1995), a mineral is normally {crystalline|amorphous|liquid|organic} and formed by geological processes."], [1,"A mineral has a definite (but not {fixed|variable|random|unknown}) chemical composition."], [2,"An element is defined by its number of {protons|neutrons|electrons|photons} (the atomic number)."], [2,"An ion has a different number of {electrons|protons|neutrons|nuclei} than the neutral atom."], [2,"A cation has a {positive|negative|neutral|variable} charge because it has fewer electrons."], [2,"An anion has {more|fewer|the same number of|no} electrons and a negative charge."], [2,"Isotopes of an element differ in their number of {neutrons|protons|electrons|ions}."], [3,"The periodic table has {7|18|9|12} rows, called periods."], [3,"The periodic table has {18|7|9|12} columns, called groups."], [3,"The periodic table was created by {Mendeleev|Goldschmidt|Mohs|Nickel} in 1869."], [3,"Lithophile elements are \"{rock-loving|iron-loving|sulfur-loving|gas-loving}\"."], [3,"Siderophile elements prefer metallic iron and are concentrated in the Earth's {core|atmosphere|crust|oceans}."], [3,"Chalcophile elements bond with sulfur and tend to form {sulfide|oxide|silicate|carbonate} minerals."], [3,"Atmophile elements are volatile and concentrated in the {atmosphere|core|crust|mantle}."], [4,"In a crystalline solid the atoms are arranged in a highly {ordered|random|liquid|gaseous} structure."], [4,"An amorphous solid lacks any long-range {order|mass|colour|density}."], [4,"The smallest group of particles that repeats in a crystal is the {unit cell|crystal lattice|habit|cleavage}."], [4,"Crystals are classified into {seven|three|nine|twelve} crystal systems."], [4,"Natural crystal defects are substitutional atoms, interstitial atoms, vacancies and {dislocations|isotopes|cations|fractures}."], [4,"The {empirical|molecular|ideal|theoretical} formula shows the real chemical composition of a crystal."], [4,"The {molecular|empirical|measured|real} formula is the theoretical one, for example KAlSi₃O₈ for K-feldspar."], [5,"Hardness is tested by {scratching|heating|weighing|dissolving} the mineral."], [5,"On the Mohs scale, 1 is {talc|gypsum|quartz|diamond}."], [5,"On the Mohs scale, 10 is {diamond|corundum|quartz|topaz}."], [5,"Streak is the colour a mineral leaves when dragged over a {porcelain plate|steel file|glass jar|magnet}."], [5,"Luster describes how a mineral reflects {light|heat|sound|water}."], [5,"A mineral that breaks along smooth, flat planes shows {cleavage|fracture|streak|luster}."], [5,"When a mineral breaks without following cleavage planes, it shows {fracture|habit|streak|luster}."], [5,"Density is mass divided by volume; water has a density of {1|2.65|7.5|19.3} g/cm³."], [5,"Quartz has a density of about {2.65|1|7.5|19.3} g/cm³."], [5,"Habit is the overall {appearance|hardness|colour|streak} of a crystal, such as equant, tabular, prismatic or fibrous."], [6,"Only about {100|22|1000|6000} minerals are common in the Earth's crust."], [6,"The mineralogical system has {9|7|6|22} classes."], [6,"Native elements are composed of a {single chemical element|metal plus sulfur|silicate tetrahedron|carbonate group}."], [6,"Sulfides contain the anion {S²⁻|O²⁻|CO₃²⁻|SO₄²⁻}."], [6,"Oxides contain the anion {O²⁻|S²⁻|Cl⁻|PO₄³⁻}."], [6,"Halides contain halogen anions such as {Cl⁻|S²⁻|CO₃²⁻|PO₄³⁻}."], [6,"Carbonates contain the anion {CO₃²⁻|SO₄²⁻|PO₄³⁻|SiO₄⁴⁻}."], [6,"Sulfates contain the anion {SO₄²⁻|CO₃²⁻|PO₄³⁻|S²⁻}."], [6,"Phosphates contain the anion {PO₄³⁻|SO₄²⁻|CO₃²⁻|SiO₄⁴⁻}."], [6,"Silicates make up over {90|50|10|75} % of the Earth's crust."], [7,"Graphite and diamond are both made of {carbon|silicon|sulfur|iron}."], [7,"Diamond has Mohs hardness {10|7|9|5}."], [7,"Pyrite is used to produce {sulfuric acid|cement|glass|table salt}."], [7,"Galena (PbS) is the primary ore of {lead|zinc|copper|iron}."], [7,"Galena is very dense, about {7.5|2.65|1|19.3} g/cm³."], [7,"Chalcopyrite is the most important ore of {copper|lead|zinc|nickel}."], [7,"Hematite and magnetite are major ores of {iron|copper|lead|titanium}."], [7,"Hematite has a {red|black|white|green} streak."], [7,"Magnetite is strongly {magnetic|radioactive|soluble|fluorescent}."], [7,"Quartz is SiO₂ and has Mohs hardness {7|3|5|9}."], [7,"Quartz breaks with a {conchoidal fracture|perfect cubic cleavage|rhombohedral cleavage|fibrous fracture} and has no cleavage."], [7,"Halite is {NaCl|CaF₂|CaCO₃|KCl}, also known as table salt."], [7,"Halite has perfect {cubic|rhombohedral|octahedral|prismatic} cleavage."], [7,"Calcite is the main mineral of limestone and {marble|granite|basalt|sandstone}."], [7,"Calcite has perfect {rhombohedral|cubic|octahedral|basal} cleavage."], [7,"Calcite reacts strongly with {HCl|water|NaCl|oil}."], [8,"The basic building block of silicates is the silicon-oxygen {tetrahedron|cube|octahedron|hexagon}."], [8,"In a silicate tetrahedron, one silicon atom is surrounded by {four|two|six|eight} oxygen atoms."], [8,"Each silicate tetrahedron carries a charge of {−4|+4|0|−2}."], [8,"Olivine is found in mafic and ultramafic rocks and in the upper {mantle|crust|core|atmosphere}."], [8,"Olivine is {olive green|red|blue|black} with a glassy luster."], [8,"The gem variety of olivine is called {peridot|ruby|sapphire|topaz}."], [8,"Biotite is black mica and muscovite is {white|green|red|blue} mica."], [8,"Biotite has a perfect cleavage and a {flaky|cubic|fibrous|equant} habit."], [8,"Muscovite is used as an electrical {insulator|conductor|fuel|fertilizer}."], [8,"Garnet has a {dodecahedral|needle-like|flaky|fibrous} habit and is used as an abrasive and gemstone."], [8,"K-feldspar has the formula {KAlSi₃O₈|NaAlSi₃O₈|CaAl₂Si₂O₈|SiO₂}."], [8,"Plagioclase is a {Na–Ca|K–Na|Mg–Fe|Ca–Mg} feldspar."], [8,"Plagioclase shows {striations|a red streak|a salty taste|a cubic habit} on its cleavage faces."], [8,"Epidote is pistachio {green|red|blue|yellow} and typical for greenschists."], [8,"Chlorite is {green|red|black|yellow}, flaky and typical for low-grade metamorphic rocks."], [8,"Zeolite has a {porous|dense|glassy|metallic} structure and is used as a molecular sieve."], [8,"Clay minerals such as kaolinite are used for {porcelain|jewelry|steel|batteries}."]]},
  foot:"Sources: lecture 2 slides \"Minerals\" (Mgr. Václav Santolík, PhD, CZU), the course list of minerals, and your Wispr recording of 12 Oct. Which minerals are tested was read from the slide colours (white = tested, yellow = not tested); the white ones are exactly 22, matching what the teacher said. Lines marked \"recording\" were said in class."
});
})();
