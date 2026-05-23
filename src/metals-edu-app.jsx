import { useState, useMemo } from "react";

// ─── PERSISTENT STORAGE ──────────────────────────────────────────────────────
const SK = "metalogy-v3";
function loadP() { try { const r = window.storage ? null : localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveP(p) { try { localStorage.setItem(SK, JSON.stringify(p)); } catch {} }
function initP() { return { quizHistory:[], studied:[], totalCorrect:0, totalAttempted:0, badges:[] }; }

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Barlow:wght@300;400;500;600&display=swap');
:root {
  --bg:#f4f7f5; --s1:#ffffff; --s2:#edf2ee; --s3:#e0e9e2; --bd:#c4d4c8;
  --or:#d96c0c; --am:#a07800; --st:#3e6454; --tx:#18261e; --mu:#4e6858;
  --fe:#c44820; --nf:#0878a0; --ml:#7840b8; --gn:#208048; --rd:#c83030; --cp:#a06828;
  --shadow-sm:0 1px 6px rgba(0,0,0,.07);
  --shadow-md:0 3px 16px rgba(0,0,0,.10);
  --shadow-lg:0 6px 32px rgba(0,0,0,.14);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--tx);font-family:'Barlow',sans-serif;min-height:100vh;}
.app{min-height:100vh;background:
  radial-gradient(ellipse 110% 40% at 50% -5%,rgba(217,108,12,.06) 0%,transparent 55%),
  var(--bg);}

/* HEADER */
.hdr{padding:0 1.5rem;border-bottom:1px solid var(--bd);background:rgba(255,255,255,.97);backdrop-filter:blur(16px);position:sticky;top:0;z-index:200;display:flex;align-items:center;justify-content:space-between;height:60px;box-shadow:0 1px 12px rgba(0,0,0,.08);}
.logo{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.35rem;letter-spacing:.08em;color:var(--or);text-transform:uppercase;display:flex;align-items:center;gap:.4rem;}
.logo span{color:var(--tx);}
.lvl-sel{display:flex;gap:.2rem;background:var(--s2);padding:3px;border-radius:20px;border:1px solid var(--bd);}
.lvl-btn{padding:4px 13px;border-radius:20px;border:none;background:transparent;color:var(--mu);font-family:'Barlow',sans-serif;font-size:.72rem;font-weight:600;letter-spacing:.05em;cursor:pointer;transition:all .2s;text-transform:uppercase;}
.lvl-btn.active{background:var(--or);color:#fff;box-shadow:0 2px 10px rgba(217,108,12,.25);}
.nav{display:flex;border-bottom:1px solid var(--bd);padding:0 1.5rem;background:rgba(255,255,255,.97);overflow-x:auto;scrollbar-width:none;backdrop-filter:blur(8px);}
.nav::-webkit-scrollbar{display:none;}
.ntab{padding:12px 16px;border:none;background:transparent;color:var(--mu);font-family:'Rajdhani',sans-serif;font-size:.87rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;}
.ntab:hover{color:var(--tx);}
.ntab.active{color:var(--or);border-bottom-color:var(--or);}
.main{padding:1.5rem;max-width:1300px;margin:0 auto;}

/* SECTION HEADERS */
.sh{display:flex;align-items:center;gap:.7rem;margin-bottom:1.25rem;flex-wrap:wrap;padding-bottom:.85rem;border-bottom:1px solid var(--bd);}
.stag{font-family:'Share Tech Mono',monospace;font-size:.62rem;letter-spacing:.12em;padding:3px 10px;border-radius:20px;text-transform:uppercase;font-weight:700;}
.tfe{background:rgba(196,72,32,.10);color:var(--fe);border:1px solid rgba(196,72,32,.3);}
.tnf{background:rgba(8,120,160,.09);color:var(--nf);border:1px solid rgba(8,120,160,.3);}
.tml{background:rgba(120,64,184,.09);color:var(--ml);border:1px solid rgba(120,64,184,.3);}
.tgn{background:rgba(32,128,72,.09);color:var(--gn);border:1px solid rgba(32,128,72,.3);}
.tam{background:rgba(160,120,0,.09);color:var(--am);border:1px solid rgba(160,120,0,.3);}
.tcp{background:rgba(160,104,40,.09);color:var(--cp);border:1px solid rgba(160,104,40,.3);}
.stitle{font-family:'Rajdhani',sans-serif;font-size:1.2rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx);}

/* CARDS */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:1rem;margin-bottom:2.5rem;}
.mcard{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:1.1rem;transition:all .25s;position:relative;overflow:hidden;box-shadow:var(--shadow-sm);}
.mcard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
.mcard.ferrous::before{background:linear-gradient(90deg,var(--fe) 0%,rgba(196,72,32,0) 75%);}
.mcard.nonferrous::before{background:linear-gradient(90deg,var(--nf) 0%,rgba(8,120,160,0) 75%);}
.mcard.copper_alloy::before{background:linear-gradient(90deg,var(--cp) 0%,rgba(160,104,40,0) 75%);}
.mcard.ferrous:hover{border-color:rgba(196,72,32,.35);box-shadow:0 6px 24px rgba(196,72,32,.10),var(--shadow-md);background:var(--s2);}
.mcard.nonferrous:hover{border-color:rgba(8,120,160,.35);box-shadow:0 6px 24px rgba(8,120,160,.10),var(--shadow-md);background:var(--s2);}
.mcard.copper_alloy:hover{border-color:rgba(160,104,40,.35);box-shadow:0 6px 24px rgba(160,104,40,.10),var(--shadow-md);background:var(--s2);}
.mcard.exp{border-color:rgba(217,108,12,.45);box-shadow:0 0 0 1px rgba(217,108,12,.10),var(--shadow-md);}
.ctop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem;}
.msym{font-family:'Share Tech Mono',monospace;font-size:1.5rem;font-weight:700;line-height:1;}
.mcard.ferrous .msym{color:var(--fe);}
.mcard.nonferrous .msym{color:var(--nf);}
.mcard.copper_alloy .msym{color:var(--cp);}
.cbadge{font-family:'Share Tech Mono',monospace;font-size:.63rem;letter-spacing:.1em;padding:2px 8px;border-radius:20px;text-transform:uppercase;font-weight:700;}
.mname{font-family:'Rajdhani',sans-serif;font-size:1.08rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-bottom:.15rem;}
.msub{font-size:.77rem;color:var(--mu);font-weight:400;margin-bottom:.65rem;}
.mdesc{font-size:.88rem;color:#354840;line-height:1.6;margin-bottom:.7rem;}
.ulist{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.7rem;}
.uchip{font-size:.72rem;padding:3px 10px;border-radius:20px;background:rgba(62,100,84,.07);color:var(--st);border:1px solid rgba(62,100,84,.24);font-weight:500;transition:all .15s;}
.xbtn{width:100%;padding:7px;background:transparent;border:1px solid rgba(217,108,12,.28);border-radius:8px;color:var(--or);font-family:'Rajdhani',sans-serif;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s;font-weight:600;}
.xbtn:hover{background:rgba(217,108,12,.06);border-color:rgba(217,108,12,.5);}
.det{margin-top:.9rem;padding-top:.9rem;border-top:1px solid var(--bd);}
.det h4{font-family:'Rajdhani',sans-serif;font-size:.82rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--am);margin-bottom:.45rem;}
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:.7rem;}
.pi{background:var(--s2);border:1px solid var(--bd);border-radius:7px;padding:8px 11px;}
.plabel{font-size:.65rem;color:var(--mu);text-transform:uppercase;letter-spacing:.08em;font-family:'Share Tech Mono',monospace;margin-bottom:2px;}
.pval{font-size:.88rem;color:var(--tx);font-weight:500;margin-top:2px;}
.ginfo{font-size:.84rem;color:#2e4438;line-height:1.6;background:rgba(217,108,12,.04);border-left:3px solid var(--or);padding:9px 13px;border-radius:0 7px 7px 0;margin-bottom:.55rem;}
.studied-dot{position:absolute;top:10px;right:10px;width:20px;height:20px;background:var(--gn);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff;box-shadow:0 2px 8px rgba(32,128,72,.3);}

/* MICROSTRUCTURE */
.micro-wrap{margin-bottom:.75rem;}
.micro-lbl{font-family:'Share Tech Mono',monospace;font-size:.61rem;color:var(--mu);letter-spacing:.1em;text-align:center;margin-bottom:.4rem;text-transform:uppercase;}

/* SEARCH/FILTER */
.sbar{display:flex;gap:.7rem;margin-bottom:1.5rem;flex-wrap:wrap;align-items:center;}
.sinput{flex:1;min-width:180px;background:var(--s1);border:1px solid var(--bd);border-radius:8px;padding:9px 14px;color:var(--tx);font-family:'Barlow',sans-serif;font-size:.88rem;outline:none;transition:all .2s;box-shadow:var(--shadow-sm);}
.sinput:focus{border-color:rgba(217,108,12,.5);box-shadow:0 0 0 3px rgba(217,108,12,.08);}
.fbtns{display:flex;gap:.35rem;flex-wrap:wrap;}
.fbtn{padding:6px 15px;border-radius:20px;border:1px solid var(--bd);background:var(--s1);color:var(--mu);font-family:'Rajdhani',sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.fbtn:hover{color:var(--tx);border-color:rgba(78,104,88,.4);}
.fbtn.active{border-color:rgba(217,108,12,.5);background:rgba(217,108,12,.08);color:var(--or);}

/* MILL */
.mflow{display:flex;align-items:center;gap:0;margin-bottom:1.4rem;overflow-x:auto;padding-bottom:.5rem;}
.mstep{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:.85rem .95rem;min-width:120px;text-align:center;flex-shrink:0;cursor:pointer;transition:all .2s;box-shadow:var(--shadow-sm);}
.mstep:hover,.mstep.active{border-color:rgba(120,64,184,.4);background:rgba(120,64,184,.05);box-shadow:0 4px 18px rgba(120,64,184,.10),var(--shadow-sm);}
.marr{color:var(--mu);font-size:1rem;flex-shrink:0;padding:0 .2rem;opacity:.5;}
.msi{font-size:1.5rem;margin-bottom:.2rem;}
.msn{font-family:'Rajdhani',sans-serif;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx);}
.mst{font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--ml);margin-top:2px;}
.mdc{background:var(--s1);border:1px solid rgba(120,64,184,.22);border-radius:12px;padding:1.3rem;margin-bottom:1.4rem;box-shadow:0 0 20px rgba(120,64,184,.06),var(--shadow-sm);}
.mdc h3{font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ml);margin-bottom:.7rem;}
.mdc p{font-size:.88rem;color:#304050;line-height:1.65;margin-bottom:.65rem;}
.atable{width:100%;border-collapse:collapse;font-size:.85rem;}
.atable th{font-family:'Share Tech Mono',monospace;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--mu);padding:10px 12px;border-bottom:1px solid var(--bd);text-align:left;}
.atable td{padding:10px 12px;border-bottom:1px solid var(--bd);color:var(--tx);}
.atable tr:hover td{background:rgba(217,108,12,.04);}
.echip{display:inline-block;font-family:'Share Tech Mono',monospace;font-size:.68rem;padding:2px 7px;background:rgba(160,120,0,.10);color:var(--am);border-radius:4px;margin-right:3px;}

/* LADLE CALCULATOR */
.calc-wrap{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;}
@media(max-width:700px){.calc-wrap{grid-template-columns:1fr;}}
.calc-panel{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:1.2rem;box-shadow:var(--shadow-sm);}
.calc-panel h3{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--am);margin-bottom:1rem;padding-bottom:.55rem;border-bottom:1px solid var(--bd);}
.el-row{display:flex;align-items:center;gap:.6rem;margin-bottom:.65rem;}
.el-sym{font-family:'Share Tech Mono',monospace;font-size:.9rem;color:var(--am);min-width:28px;font-weight:700;}
.el-name{font-size:.78rem;color:var(--mu);min-width:85px;}
.el-slider{flex:1;accent-color:var(--or);cursor:pointer;height:4px;}
.el-val{font-family:'Share Tech Mono',monospace;font-size:.78rem;color:var(--tx);min-width:42px;text-align:right;}
.pred-section{background:var(--s2);border:1px solid var(--bd);border-radius:8px;padding:1.1rem;}
.pred-section h4{font-family:'Rajdhani',sans-serif;font-size:.85rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--or);margin-bottom:.75rem;}
.pred-bar-wrap{margin-bottom:.6rem;}
.pred-bar-label{display:flex;justify-content:space-between;margin-bottom:3px;}
.pred-bar-name{font-size:.73rem;color:var(--mu);}
.pred-bar-val{font-family:'Share Tech Mono',monospace;font-size:.73rem;color:var(--tx);}
.pred-bar-bg{height:6px;background:var(--s3);border-radius:3px;overflow:hidden;}
.pred-bar-fill{height:100%;border-radius:3px;transition:width .4s ease;}
.pred-steel-type{margin-top:.85rem;padding:.65rem .95rem;background:rgba(217,108,12,.06);border:1px solid rgba(217,108,12,.22);border-radius:7px;font-size:.82rem;color:var(--tx);line-height:1.55;}
.pred-grade{font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--or);margin-top:.3rem;}

/* COMPARE */
.cgrid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem;margin-bottom:1.5rem;}
@media(max-width:600px){.cgrid{grid-template-columns:1fr;}}
.cpanel{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:1.2rem;box-shadow:var(--shadow-sm);}
.cpanel h3{font-family:'Rajdhani',sans-serif;font-size:.95rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;margin-bottom:.85rem;padding-bottom:.55rem;border-bottom:1px solid var(--bd);}
.csel{width:100%;background:var(--s1);border:1px solid var(--bd);border-radius:7px;color:var(--tx);padding:8px 12px;font-family:'Barlow',sans-serif;font-size:.87rem;margin-bottom:.95rem;outline:none;cursor:pointer;transition:all .2s;}
.csel:focus{border-color:rgba(217,108,12,.45);box-shadow:0 0 0 3px rgba(217,108,12,.07);}
.crow{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:.82rem;}
.clabel{color:var(--mu);font-size:.76rem;}
.cval{color:var(--tx);font-weight:500;}

/* QUIZ */
.qwrap{max-width:660px;margin:0 auto;}
.qprog{display:flex;align-items:center;gap:.8rem;margin-bottom:1.6rem;}
.qpbar{flex:1;height:5px;background:var(--s3);border-radius:3px;overflow:hidden;}
.qpfill{height:100%;background:linear-gradient(90deg,var(--fe),var(--or));transition:width .35s;border-radius:3px;}
.qptxt{font-family:'Share Tech Mono',monospace;font-size:.72rem;color:var(--mu);white-space:nowrap;}
.qcard{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:1.8rem;margin-bottom:1.2rem;box-shadow:var(--shadow-md);}
.qcat{font-family:'Share Tech Mono',monospace;font-size:.68rem;color:var(--or);letter-spacing:.14em;text-transform:uppercase;margin-bottom:.75rem;}
.qq{font-family:'Rajdhani',sans-serif;font-size:1.3rem;font-weight:600;letter-spacing:.03em;line-height:1.35;margin-bottom:1.35rem;}
.qopts{display:grid;gap:.5rem;}
.qopt{padding:12px 16px;background:var(--s2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-family:'Barlow',sans-serif;font-size:.88rem;cursor:pointer;text-align:left;transition:all .18s;font-weight:400;}
.qopt:hover:not(:disabled){border-color:rgba(217,108,12,.45);background:rgba(217,108,12,.05);}
.qopt.correct{background:rgba(32,128,72,.08);border-color:var(--gn);color:#166838;}
.qopt.wrong{background:rgba(200,48,48,.07);border-color:var(--rd);color:#b02828;}
.qopt.reveal{background:rgba(32,128,72,.05);border-color:rgba(32,128,72,.32);color:#166838;}
.qfb{padding:11px 15px;border-radius:7px;font-size:.87rem;margin-top:.85rem;line-height:1.55;}
.qfb.ok{background:rgba(32,128,72,.07);border:1px solid rgba(32,128,72,.28);color:#166838;}
.qfb.ng{background:rgba(200,48,48,.06);border:1px solid rgba(200,48,48,.25);color:#b02828;}
.qnxt{width:100%;padding:13px;background:linear-gradient(90deg,var(--fe),var(--or));border:none;border-radius:8px;color:#fff;font-family:'Rajdhani',sans-serif;font-size:.98rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;margin-top:.85rem;transition:all .2s;box-shadow:0 4px 18px rgba(217,108,12,.25);}
.qnxt:hover{opacity:.9;box-shadow:0 6px 24px rgba(217,108,12,.35);}
.score-card{background:var(--s1);border:1px solid rgba(217,108,12,.28);border-radius:14px;padding:2.5rem 1.5rem;text-align:center;box-shadow:0 0 40px rgba(217,108,12,.07),var(--shadow-lg);}
.score-big{font-family:'Rajdhani',sans-serif;font-size:4.5rem;font-weight:700;color:var(--or);line-height:1;margin-bottom:.4rem;}
.score-lbl{font-size:.95rem;color:var(--mu);margin-bottom:1.5rem;}
.score-msg{font-size:1rem;color:var(--tx);margin-bottom:1.5rem;line-height:1.6;}
.qlobb{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:1.8rem;box-shadow:var(--shadow-sm);}
.qlobb-meta{font-size:.88rem;color:var(--mu);text-align:center;padding:.65rem 0 0;}
.qlobb-count{font-family:'Share Tech Mono',monospace;font-size:1.3rem;color:var(--or);}

/* PROGRESS TAB */
.stat-card{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:1.2rem;text-align:center;box-shadow:var(--shadow-sm);}
.stat-big{font-family:'Rajdhani',sans-serif;font-size:2.2rem;font-weight:700;color:var(--am);line-height:1;}
.stat-sub{font-size:.72rem;color:var(--mu);text-transform:uppercase;letter-spacing:.08em;margin-top:.25rem;}
.badge-chip{display:inline-flex;align-items:center;gap:.4rem;padding:.4rem .85rem;background:rgba(160,120,0,.07);border:1px solid rgba(160,120,0,.25);border-radius:20px;font-size:.78rem;color:var(--am);margin:.2rem;}
.hist-row{display:flex;align-items:center;gap:.7rem;padding:.55rem 0;border-bottom:1px solid var(--bd);font-size:.82rem;}
.hist-score{font-family:'Share Tech Mono',monospace;min-width:35px;font-weight:700;}
.hist-date{color:var(--mu);font-size:.7rem;white-space:nowrap;}
.hist-pct{font-family:'Share Tech Mono',monospace;font-size:.72rem;padding:2px 7px;border-radius:4px;min-width:38px;text-align:center;}
@media(max-width:580px){.hdr{padding:0 .9rem;}.main{padding:1rem;}.lvl-sel{display:none;}}
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FERROUS = [
  { id:"pig-iron", symbol:"PgFe", name:"Pig Iron", subtitle:"Primary Iron Product", type:"ferrous",
    desc:"The raw product of the blast furnace, pig iron contains 3.5–4.5% carbon and various impurities. It is the foundational feedstock for all steel and cast iron production.",
    uses:["Blast Furnace Output","Cast Iron Feedstock","Steel Production","Foundry Work"],
    properties:{"Carbon Content":"3.5–4.5%","Melting Point":"~1150°C","Tensile Strength":"~170 MPa","Hardness":"150–200 HB"},
    grades:"Comes in grades based on sulfur/phosphorus content. Basic pig iron (low P) goes to steelmaking; foundry grade (higher Si) goes to casting.",
    millRole:"First product of the blast furnace. Pig iron is the direct output of smelting iron ore with coke and limestone. It feeds both BOF steelmaking and foundry operations.",
    studentNote:"Think of pig iron as 'raw' iron — too brittle to use directly, but the starting point for everything.",
    micro:"ferrite_graphite" },
  { id:"carbon-steel", symbol:"CS", name:"Carbon Steel", subtitle:"Iron + Carbon Alloy", type:"ferrous",
    desc:"The most widely used engineering material. Carbon content (0.05–2.0%) controls hardness, strength, and weldability. Low-carbon is soft and formable; high-carbon is hard and wear-resistant.",
    uses:["Structural Beams","Automotive Bodies","Pipelines","Tools","Rail","Wire"],
    properties:{"Carbon Content":"0.05–2.0%","Melting Point":"~1425°C","Tensile Strength":"400–2000 MPa","Density":"7.85 g/cm³"},
    grades:"Low-carbon (1008–1025): structural, stampings. Medium (1030–1060): gears, shafts. High (1080–1095): springs, blades. Common grades: AISI 1018, 1045, 1095.",
    millRole:"Primary output of BOF and EAF steelmaking. Cast into slabs/blooms then rolled in hot strip mills or plate mills into final product.",
    studentNote:"More carbon = harder but more brittle. Less carbon = softer but easier to weld and form.",
    micro:"pearlite_ferrite" },
  { id:"stainless-steel", symbol:"SS", name:"Stainless Steel", subtitle:"Chromium Steel Alloy", type:"ferrous",
    desc:"Contains minimum 10.5% chromium, which forms a passive oxide layer that resists corrosion. Available in austenitic, ferritic, martensitic, and duplex families.",
    uses:["Food Equipment","Medical Devices","Chemical Plants","Architecture","Cutlery","Fasteners"],
    properties:{"Chromium":"10.5–26%","Melting Point":"~1400°C","Tensile Strength":"485–1800 MPa","Corrosion":"Excellent"},
    grades:"304/316: Austenitic (most common). 410/420: Martensitic (cutlery, tools). 430: Ferritic (automotive trim). 2205: Duplex (pressure vessels).",
    millRole:"Produced in AOD (Argon Oxygen Decarburization) vessels. Requires careful carbon reduction to avoid carbide precipitation.",
    studentNote:"The chromium acts like an invisible shield — oxygen in air reacts with chromium first, forming a protective skin over the iron.",
    micro:"austenite" },
  { id:"cast-iron", symbol:"CI", name:"Cast Iron", subtitle:"High-Carbon Iron", type:"ferrous",
    desc:"Carbon content above 2.1% makes this too brittle to roll or forge — but it pours well and is excellent under compression. Gray, white, ductile, and malleable variants each have distinct properties.",
    uses:["Engine Blocks","Brake Rotors","Cookware","Pipe Fittings","Machine Bases","Pump Housings"],
    properties:{"Carbon Content":"2.1–4.5%","Melting Point":"~1200°C","Compressive Strength":"570–1800 MPa","Machinability":"Good"},
    grades:"Gray: graphite flakes, good vibration damping. White: hard, wear-resistant. Ductile (nodular): tougher, bendable. Malleable: heat-treated for ductility.",
    millRole:"Used for mill rolls, bearing housings, and equipment bases throughout the plant due to vibration damping and compressive strength.",
    studentNote:"Cast iron is like over-carbonized steel — the extra carbon forms graphite flakes that are great for frying pans and engine blocks!",
    micro:"gray_iron" },
  { id:"alloy-steel", symbol:"AS", name:"Alloy Steel", subtitle:"Multi-Element Steel", type:"ferrous",
    desc:"Carbon steel with deliberate additions of chromium, nickel, molybdenum, vanadium, or manganese to enhance specific properties like hardenability, toughness, or creep resistance.",
    uses:["Gears","Crankshafts","Pressure Vessels","High-Strength Bolts","Drill Pipe","Springs"],
    properties:{"Alloying Elements":"Cr, Ni, Mo, V, Mn","Tensile Strength":"600–1800 MPa","Hardenability":"Excellent","Toughness":"High"},
    grades:"4140 (Cr-Mo): gears, axles. 4340 (Ni-Cr-Mo): aircraft parts. 8620: case-hardening. 52100: bearings.",
    millRole:"Produced in EAF with precise ladle metallurgy additions. Requires controlled cooling in bar/rod mills.",
    studentNote:"Think of alloying elements as 'ingredients' — each adds a different property. Chromium adds corrosion resistance; nickel adds toughness.",
    micro:"bainite" },
  { id:"tool-steel", symbol:"TS", name:"Tool Steel", subtitle:"Hardened Working Steel", type:"ferrous",
    desc:"Highly alloyed steels designed to cut, shape, or form other materials. Must maintain hardness at elevated temperatures and resist wear, deformation, and shock.",
    uses:["Cutting Tools","Dies","Punches","Drill Bits","Molds","Mill Rolls"],
    properties:{"Hardness":"60–68 HRC","Hot Hardness":"Excellent","Wear Resistance":"High","Toughness":"Moderate"},
    grades:"H13: hot work dies. D2: cold work dies. M2: high-speed cutting. W1: water-hardening files. A2: air-hardening.",
    millRole:"Used in rolling mill work rolls, edger rolls, and hot-work tooling. H13 contacts 1000°C+ steel.",
    studentNote:"Tool steels are the 'tools that make everything else.' An M2 drill bit stays hard because tungsten and molybdenum keep it hard when hot.",
    micro:"martensite" },
  { id:"wrought-iron", symbol:"WI", name:"Wrought Iron", subtitle:"Slag-Containing Iron", type:"ferrous",
    desc:"Nearly pure iron (<0.1% C) with slag inclusions (fibrous silicates) that give it a fibrous, wood-like grain. Highly ductile and corrosion resistant. Largely replaced by steel but still used in decorative work.",
    uses:["Decorative Gates","Railings","Historical Structures","Anchors","Chain Links","Ornamental Work"],
    properties:{"Carbon Content":"<0.1%","Tensile Strength":"~340 MPa","Ductility":"Very High","Corrosion":"Good"},
    grades:"Wrought iron is not graded in modern standards. Historical puddled iron vs. modern wrought iron differ in slag content.",
    millRole:"Predates modern steelmaking. The slag inclusions actually make wrought iron more corrosion-resistant than early steels — used in historic bridges still standing today.",
    studentNote:"Think of wrought iron like wood — it has a grain due to slag fibers, can be shaped by a blacksmith, and doesn't rust as fast as plain iron.",
    micro:"ferrite_slag" },
  { id:"maraging-steel", symbol:"MS", name:"Maraging Steel", subtitle:"Ultra-High Strength Steel", type:"ferrous",
    desc:"Ultra-low-carbon steel (< 0.03% C) hardened by precipitation of intermetallic compounds rather than carbon. Achieves tensile strengths >2000 MPa with reasonable toughness. Marage = martensite + aging.",
    uses:["Aerospace Structures","Rocket Motor Casings","Tooling","Injection Mold Tooling","Centrifuge Rotors","Premium Sports Equipment"],
    properties:{"Tensile Strength":">2000 MPa","Carbon":"<0.03%","Nickel Content":"17–19%","Heat Treatment":"Aging at 480°C"},
    grades:"Grade 200, 250, 300, 350 (MPa yield strength). C300 is most common: 18Ni-8.5Co-4.8Mo-0.4Ti.",
    millRole:"Used in precision tooling, mold inserts, and high-stress components. Valued for high polishability and dimensional stability during aging treatment.",
    studentNote:"Maraging steel gets hard through a completely different mechanism than regular steel — not carbon, but tiny metal 'needles' that form during low-temperature aging.",
    micro:"martensite" },
];

const NONFERROUS = [
  { id:"aluminum", symbol:"Al", name:"Aluminum", subtitle:"Lightweight Structural Metal", type:"nonferrous",
    desc:"Third most abundant element in Earth's crust. Excellent strength-to-weight ratio, naturally corrosion-resistant, and highly recyclable. Conducts electricity ~60% as well as copper.",
    uses:["Aerospace Structures","Automotive Panels","Beverage Cans","Power Lines","Window Frames","Foil"],
    properties:{"Density":"2.7 g/cm³","Melting Point":"660°C","Tensile Strength":"70–700 MPa","Conductivity":"61% IACS"},
    grades:"1xxx: pure Al (electrical). 2xxx: Cu alloy (aerospace). 3xxx: Mn alloy (cans). 5xxx: Mg alloy (marine). 6061: structural. 7075: highest strength.",
    millRole:"Used in steel mill crane components and electrical bus bars. Aluminum deoxidation is a critical ladle metallurgy step in steelmaking.",
    studentNote:"Aluminum's low density (about 1/3 of steel) is why aircraft frames and car hoods use it — same strength for much less weight.",
    micro:"aluminum_grains" },
  { id:"copper", symbol:"Cu", name:"Copper", subtitle:"Premier Electrical Conductor", type:"nonferrous",
    desc:"The best practical electrical and thermal conductor after silver. Antimicrobial, highly ductile, and naturally soft. The basis of brass (Cu-Zn) and bronze (Cu-Sn) alloys.",
    uses:["Electrical Wiring","Heat Exchangers","Plumbing","Motors","Printed Circuits","Roofing"],
    properties:{"Density":"8.96 g/cm³","Melting Point":"1085°C","Conductivity":"100% IACS","Ductility":"Excellent"},
    grades:"C11000: electrolytic tough pitch (wiring). C10100: oxygen-free (electronics). C26000: cartridge brass. C51000: phosphor bronze.",
    millRole:"Mold copper plates are the inner lining of continuous casters — copper's thermal conductivity rapidly solidifies molten steel into slabs.",
    studentNote:"Copper's IACS rating is the baseline for electrical conductivity — it IS 100%. Everything else is measured relative to copper.",
    micro:"copper_grains" },
  { id:"nickel", symbol:"Ni", name:"Nickel", subtitle:"Corrosion & Heat Resistant", type:"nonferrous",
    desc:"Silvery-white metal with excellent corrosion resistance, especially in alkaline environments. A critical alloying element in stainless steel. Superalloys based on nickel operate above 1000°C.",
    uses:["Stainless Steel Alloying","Jet Engines","Chemical Plant Equipment","Batteries","Electroplating","Coinage"],
    properties:{"Density":"8.9 g/cm³","Melting Point":"1455°C","Tensile Strength":"317–1800 MPa","Magnetic":"Yes (weakly)"},
    grades:"Commercially pure Ni (200/201). Monel (Ni-Cu): seawater. Inconel 625/718: jet engines. Hastelloy C: chemical processing.",
    millRole:"Critical alloying addition in austenitic stainless steels and high-nickel alloys used in pickling tanks and acid-resistant piping.",
    studentNote:"Without nickel, jet engines couldn't operate at today's temperatures. Nickel superalloys exceed their nominal melting point using cooling holes.",
    micro:"nickel_grains" },
  { id:"titanium", symbol:"Ti", name:"Titanium", subtitle:"Strength-to-Weight Champion", type:"nonferrous",
    desc:"Best strength-to-weight ratio of any structural metal. Biocompatible, corrosion-resistant in seawater and body fluids, and maintains strength at moderately high temperatures.",
    uses:["Aerospace Frames","Medical Implants","Offshore Platforms","Sporting Equipment","Jet Engine Discs","Desalination Plants"],
    properties:{"Density":"4.5 g/cm³","Melting Point":"1668°C","Tensile Strength":"240–1400 MPa","Biocompatibility":"Excellent"},
    grades:"Grade 1-4: commercially pure. Ti-6Al-4V (Grade 5): aerospace workhorse. Beta alloys: high-strength fasteners.",
    millRole:"Used as a microalloying addition in ultra-low-carbon (ULC) steels for automotive deep-drawing applications.",
    studentNote:"Ti-6Al-4V is one of engineering's most successful alloys — hip replacements, bicycle frames, aircraft, and watches all use it.",
    micro:"titanium_grains" },
  { id:"zinc", symbol:"Zn", name:"Zinc", subtitle:"Galvanizing & Alloying Metal", type:"nonferrous",
    desc:"Primarily used to galvanize (coat) steel for corrosion protection. When zinc contacts steel, it acts as a sacrificial anode — it corrodes instead of the steel beneath it.",
    uses:["Galvanizing Steel","Die Casting","Brass Production","Batteries","Roof Sheeting","Sunscreen"],
    properties:{"Density":"7.1 g/cm³","Melting Point":"420°C","Tensile Strength":"~200 MPa","Corrosion":"Self-Sacrificing"},
    grades:"Special High Grade (SHG): 99.995% pure for galvanizing. Zamak alloys: die casting. Brass (Cu-Zn): various compositions.",
    millRole:"Hot-dip galvanizing lines are a major product at flat-rolled steel mills. Strip passes through molten zinc at ~450°C.",
    studentNote:"Zinc's sacrificial protection is electrochemical — zinc has a more negative electrode potential than iron, so it 'wants' to corrode first.",
    micro:"zinc_grains" },
  { id:"lead", symbol:"Pb", name:"Lead", subtitle:"Dense & Radiation-Shielding", type:"nonferrous",
    desc:"Extremely dense, soft metal with a very low melting point. Excellent for radiation shielding, vibration damping, and sound attenuation. Now largely replaced in many applications due to toxicity.",
    uses:["Radiation Shielding","Batteries","Ballast Weights","Soundproofing","Shot/Ammunition","Cable Sheathing"],
    properties:{"Density":"11.3 g/cm³","Melting Point":"327°C","Tensile Strength":"~17 MPa","Flexibility":"Very Soft"},
    grades:"Chemical lead (99.9%): chemical plant. Antimonial lead: batteries. Terne (Pb-Sn): roofing.",
    millRole:"Historically added to free-machining steel to improve machinability. Largely phased out. Lead lining protects x-ray rooms in mill labs.",
    studentNote:"Lead's density (2x iron!) makes it an excellent radiation blocker — dense atomic nuclei intercept x-rays and gamma rays.",
    micro:"lead_grains" },
  { id:"tungsten", symbol:"W", name:"Tungsten", subtitle:"Highest Melting Point Metal", type:"nonferrous",
    desc:"Tungsten has the highest melting point of all metals (3422°C) and highest tensile strength at elevated temperatures. Extremely dense and hard. Used where nothing else survives.",
    uses:["Cutting Tool Tips","Light Bulb Filaments","X-ray Targets","Armor Piercing Rounds","Rocket Nozzles","Electrical Contacts"],
    properties:{"Density":"19.3 g/cm³","Melting Point":"3422°C","Tensile Strength":"550–3500 MPa","Hardness":"7.5 Mohs"},
    grades:"W1 (pure): electrical contacts. WC (tungsten carbide): cutting tools and wear parts. W-Ni-Fe: radiation shielding and ballast.",
    millRole:"Tungsten carbide (WC-Co) is the primary material for rolling mill guide inserts, edger rolls, and wear-resistant tooling throughout the mill.",
    studentNote:"Tungsten's melting point (3422°C) is so high it doesn't melt until you're almost halfway to the surface temperature of the sun!",
    micro:"tungsten_grains" },
  { id:"magnesium", symbol:"Mg", name:"Magnesium", subtitle:"Lightest Structural Metal", type:"nonferrous",
    desc:"The lightest structural metal at 1.74 g/cm³ — only 2/3 the density of aluminum. Good specific strength, naturally abundant, but highly flammable in fine powder form. Critical in steelmaking as a desulfurizer.",
    uses:["Automotive Housings","Laptop Cases","Bicycle Frames","Camera Bodies","Steelmaking Desulfurization","Aerospace Gearboxes"],
    properties:{"Density":"1.74 g/cm³","Melting Point":"650°C","Tensile Strength":"160–350 MPa","Flammability":"High (powder)"},
    grades:"AZ31 (Al-Zn): wrought sheet. AZ91: die casting. AM60: automotive. WE43: high-temp aerospace.",
    millRole:"Magnesium-lime (KR process) or magnesium cored wire injection is used in ladle desulfurization to reduce sulfur in liquid steel to <0.001%.",
    studentNote:"Magnesium burns with a brilliant white light — it's even used in flares and fireworks. But as a solid alloy, it's perfectly safe and incredibly light.",
    micro:"magnesium_grains" },
  { id:"cobalt", symbol:"Co", name:"Cobalt", subtitle:"Superalloy & Battery Metal", type:"nonferrous",
    desc:"Hard, magnetic metal with high melting point. Critical in superalloys (jet engines), cutting tools (WC-Co), battery cathodes (Li-Co), and permanent magnets. Strongly magnetic below 1115°C.",
    uses:["Jet Engine Superalloys","Lithium-Ion Batteries","Cutting Tools (WC-Co)","Permanent Magnets","Hard Facing","Medical Implants"],
    properties:{"Density":"8.9 g/cm³","Melting Point":"1495°C","Tensile Strength":"760–1000 MPa","Magnetic":"Yes (Curie: 1115°C)"},
    grades:"Commercially pure Co. Stellite (Co-Cr-W): wear-resistant hard-facing. MAR-M 509: superalloy. Li-Co oxide: battery cathode.",
    millRole:"Cobalt-based hard-facing alloys (Stellite) are applied to valve seats, wear plates, and guides in hot strip mills and continuous casting areas.",
    studentNote:"Cobalt is in nearly every smartphone battery (as LiCoO₂) and in the alloys that keep jet engines spinning at 1400°C. One metal, two very different worlds.",
    micro:"cobalt_grains" },
  { id:"tin", symbol:"Sn", name:"Tin", subtitle:"Coating & Soldering Metal", type:"nonferrous",
    desc:"Low-melting, corrosion-resistant metal. At room temperature, tin exists as white β-tin; below 13°C it slowly converts to gray α-tin (tin pest). Critical for food cans (tin plate) and soldering.",
    uses:["Tin-Plated Food Cans","Solder","Bronze Alloys","Bearing Alloys (Babbitt)","Organ Pipes","Anti-fouling Paints"],
    properties:{"Density":"7.3 g/cm³","Melting Point":"232°C","Tensile Strength":"~15 MPa","Allotropes":"White (β) & Gray (α)"},
    grades:"Grade A tin (99.85%): electrolytic tinplating. 63/37 Sn-Pb solder (melts at 183°C). Lead-free solder: Sn-Ag-Cu (SAC305).",
    millRole:"Electrolytic tinning lines coat cold-rolled strip with 1–11 g/m² of tin for food packaging. A major finishing line product in integrated steel mills.",
    studentNote:"The reason canned food stays fresh for years is a microscopic layer of tin — less than 0.001mm thick — that stops the steel from rusting and contaminating the food.",
    micro:"tin_grains" },
  { id:"chromium", symbol:"Cr", name:"Chromium", subtitle:"Hardness & Corrosion Resistance", type:"nonferrous",
    desc:"Hard, lustrous, steel-grey metal. The defining element in stainless steel (corrosion resistance) and hard chromium plating (wear resistance). Also critical in superalloys for high-temperature strength.",
    uses:["Stainless Steel Alloying","Hard Chrome Plating","Superalloy Addition","Dye & Pigment Production","Leather Tanning","Decorative Plating"],
    properties:{"Density":"7.2 g/cm³","Melting Point":"1907°C","Tensile Strength":"~690 MPa","Hardness":"8.5 Mohs"},
    grades:"Electrolytic chromium (99.9%+). Ferrochromium (FeCr): steelmaking alloy addition. HC FeCr (high carbon) and LC FeCr (low carbon) grades.",
    millRole:"Added as ferrochromium (FeCr) in the ladle or furnace for stainless steel production. Also used in hard chrome plating of mill rolls for surface finish.",
    studentNote:"Chromium is what makes stainless steel 'stainless.' Without chromium, your kitchen knives and medical tools would rust within hours of contact with water.",
    micro:"chromium_grains" },
  { id:"molybdenum", symbol:"Mo", name:"Molybdenum", subtitle:"High-Temp Strength Booster", type:"nonferrous",
    desc:"Refractory metal with very high melting point (2623°C). Dramatically improves high-temperature strength, creep resistance, and hardenability in steels at relatively low addition levels (0.15–5%).",
    uses:["High-Strength Steel Alloying","Catalysts (petroleum refining)","Heating Elements","Lubricant (MoS₂)","Aircraft Components","Chemical Reactors"],
    properties:{"Density":"10.2 g/cm³","Melting Point":"2623°C","Tensile Strength":"630–1500 MPa","Thermal Expansion":"Low"},
    grades:"Commercially pure Mo: heating elements. FeMo (ferromolybdenum): steel addition. MoS₂: solid lubricant for extreme conditions.",
    millRole:"Added as ferromolybdenum in ladle metallurgy for creep-resistant pressure vessel steels, pipeline steels, and high-speed tool steels. Also used in furnace heating elements.",
    studentNote:"MoS₂ (molybdenum disulfide) is a dry lubricant used in space because conventional oils freeze or evaporate in the vacuum. The same chemistry keeps drill bits from seizing at high speeds.",
    micro:"molybdenum_grains" },
];

const COPPER_ALLOYS = [
  { id:"brass", symbol:"Cu-Zn", name:"Brass (C26000)", subtitle:"Cartridge Brass 70/30", type:"copper_alloy",
    desc:"The most widely used copper alloy: 70% copper, 30% zinc. Excellent cold-working ability, good strength, and a distinctive golden color. Named 'cartridge brass' for its use in ammunition casings.",
    uses:["Ammunition Cartridges","Musical Instruments","Plumbing Fittings","Zippers","Radiator Cores","Decorative Hardware"],
    properties:{"Copper Content":"70%","Zinc Content":"30%","Tensile Strength":"300–900 MPa","Melting Point":"915–955°C"},
    grades:"C26000 (70/30): deep drawing. C27000 (65/35): yellow brass, hardware. C28000 (60/40): Muntz metal, hot working. C22000 (90/10): commercial bronze.",
    millRole:"Brass is processed in specialty non-ferrous rolling mills using multiple cold-reduction passes with intermediate annealing. Hot-dip galvanizing tanks use brass fittings throughout due to zinc compatibility.",
    studentNote:"Brass's gold color comes from the zinc — pure copper is reddish-orange, but adding zinc shifts it toward yellow. More zinc = more yellow/greenish.",
    micro:"brass_grains" },
  { id:"phosphor-bronze", symbol:"Cu-Sn", name:"Phosphor Bronze", subtitle:"Cu-Sn-P Spring Alloy", type:"copper_alloy",
    desc:"Copper with 5% tin and up to 0.35% phosphorus. The phosphorus acts as a deoxidizer and strengthens the alloy. Outstanding spring properties, fatigue resistance, and corrosion resistance in seawater.",
    uses:["Electrical Connectors","Springs","Bearings","Ship Propellers","Diaphragms","Musical Instrument Strings"],
    properties:{"Copper Content":"~94.5%","Tin Content":"~5%","Tensile Strength":"300–900 MPa","Fatigue Resistance":"Excellent"},
    grades:"C51000 (5% Sn): spring wire. C52100 (8% Sn): heavy duty springs. C54400 (4% Sn + Pb): free-machining bearings. C90300: tin bronze castings.",
    millRole:"Phosphor bronze strip is drawn and annealed in specialty copper mills. Used in steel plant electrical panels, bus bar supports, and spring-loaded contact assemblies in instrumentation.",
    studentNote:"Phosphor bronze is what makes guitar strings vibrant — the tin gives rigidity, phosphorus adds strength, and copper provides the warm tone.",
    micro:"bronze_grains" },
  { id:"cupronickel", symbol:"Cu-Ni", name:"Cupronickel (90/10)", subtitle:"Marine Grade Cu-Ni Alloy", type:"copper_alloy",
    desc:"90% copper, 10% nickel with small additions of iron and manganese. Exceptional resistance to seawater corrosion and biofouling (marine organisms). Used wherever saltwater contact is unavoidable.",
    uses:["Marine Heat Exchangers","Seawater Piping","Coinage","Desalination Plants","Ship Hull Cladding","Offshore Oil Platforms"],
    properties:{"Copper Content":"90%","Nickel Content":"10%","Tensile Strength":"300–500 MPa","Seawater Corrosion":"Excellent"},
    grades:"C70600 (90/10): standard marine. C71500 (70/30): higher strength marine. C72200 (Cr-addition): improved erosion resistance. Used in UNS C70600, DIN 2.0872.",
    millRole:"Cupronickel tubes line the water-cooling circuits in continuous caster secondary cooling zones and are used in heat exchangers throughout the utility systems of a steel plant.",
    studentNote:"Cupronickel is why coins like US quarters and dimes feel the way they do — the silvery appearance comes from nickel, but most of the metal is copper.",
    micro:"cupronickel_grains" },
  { id:"beryllium-copper", symbol:"Cu-Be", name:"Beryllium Copper", subtitle:"Highest Strength Cu Alloy", type:"copper_alloy",
    desc:"The strongest of all copper alloys: 1.7–2% beryllium in copper. After age hardening, it reaches tensile strengths over 1400 MPa while maintaining 60%+ of copper's conductivity. Non-sparking and non-magnetic.",
    uses:["High-Performance Springs","Aerospace Connectors","Non-Sparking Tools","Plastic Injection Molds","Precision Instruments","Oil/Gas Safety Tools"],
    properties:{"Beryllium Content":"1.7–2%","Tensile Strength":"700–1400 MPa","Conductivity":"~60% IACS","Hardness":"HRC 36–42 (aged)"},
    grades:"C17200 (1.9% Be): highest strength. C17000 (1.7% Be): balance of strength/conductivity. C17500 (0.6% Be + Co): high conductivity grade. Age hardened at 315°C.",
    millRole:"Beryllium copper molds and tools are used in non-sparking maintenance work in flammable gas atmospheres. Also used in precision sensor springs for ladle weighing systems.",
    studentNote:"Beryllium copper is a metallurgical paradox — it's as strong as steel but conducts electricity like a metal. The downside: beryllium dust is highly toxic, so machining requires strict safety controls.",
    micro:"beryllium_copper_grains" },
  { id:"aluminum-bronze", symbol:"Cu-Al", name:"Aluminum Bronze", subtitle:"High-Strength Wear-Resistant", type:"copper_alloy",
    desc:"Copper alloyed with 5–12% aluminum, often with iron and nickel additions. Exceptional combination of strength, hardness, wear resistance, and corrosion resistance. Has a golden color resembling gold alloys.",
    uses:["Gears & Worm Wheels","Marine Propellers","Pump Impellers","Valve Seats","Bushings & Bearings","Offshore Structural Components"],
    properties:{"Aluminum Content":"5–12%","Tensile Strength":"500–900 MPa","Hardness":"130–250 HB","Corrosion":"Seawater Resistant"},
    grades:"C62400 (11% Al): high strength. C63000 (Al-Ni): nickel-aluminum bronze for propellers. C95400: cast aluminum bronze. C63200: marine grade with Ni addition.",
    millRole:"Aluminum bronze bushings and wear plates are used in continuous casting machine segments, pinch roll assemblies, and hot mill guide systems where corrosion and wear resistance are both needed.",
    studentNote:"Aluminum bronze looks like gold and is used in 'gold' medals and award statuettes — it's not actually gold, but it has the appearance, corrosion resistance, and wear resistance at a fraction of the price.",
    micro:"aluminum_bronze_grains" },
  { id:"naval-brass", symbol:"Cu-Zn-Sn", name:"Naval Brass", subtitle:"Marine-Grade Brass C46400", type:"copper_alloy",
    desc:"A dezincification-resistant brass: 60% copper, 39.25% zinc, 0.75% tin. The tin addition greatly improves resistance to the selective leaching of zinc (dezincification) in seawater environments.",
    uses:["Marine Hardware","Condenser Plates","Pump Shafts","Valve Stems","Propeller Shafts","Rudder Bearings"],
    properties:{"Copper Content":"60%","Zinc Content":"~39%","Tin Content":"0.75%","Dezincification":"Resistant"},
    grades:"C46400 (Uninhibited Naval Brass). C46500 (+ As): arsenical, better dezincification resistance. C46700 (+ Sb): antimony inhibited. Hot-worked form is common.",
    millRole:"Naval brass is specified for seawater-cooled heat exchangers and pump components in coastal steel plants. Also used for propeller shaft sleeves on ships delivering raw materials to port-side mills.",
    studentNote:"Regular brass can 'dezincify' in seawater — the zinc leaches out, leaving a porous copper sponge. Adding even 0.75% tin prevents this, which is the entire reason Naval Brass exists.",
    micro:"brass_grains" },
];

const ALL_METALS = [...FERROUS, ...NONFERROUS, ...COPPER_ALLOYS];

const MILL_STEPS = [
  { id:"blast", icon:"🔥", name:"Blast Furnace", temp:"~1500°C", fullName:"Blast Furnace (BF) — Integrated Route",
    desc:"Iron ore, coke, and limestone are charged from the top. Hot blast air at ~1200°C is injected at tuyeres, creating temperatures >2000°C in the combustion zone. Carbon monoxide reduces iron oxides to liquid iron. Liquid pig iron (~4% C) and slag are tapped from the bottom every 4–6 hours. Pulverized coal injection (PCI) supplements coke to reduce fuel costs.",
    metals:["Iron ore (Fe₂O₃/Fe₃O₄)","Coke (carbon reductant)","Limestone (CaCO₃ slag former)","Pulverized coal injection (PCI)","Hot blast air (1150–1250°C)"],
    output:"Liquid pig iron at ~4% C, ~0.5% Si, ~0.3% Mn, 0.03% S" },
  { id:"eaf", icon:"⚡", name:"Arc Furnace", temp:"1600–1650°C", fullName:"Electric Arc Furnace (EAF) — Scrap Route",
    desc:"Three ultra-high-power (UHP) graphite electrodes strike arcs at up to 40,000°C to melt a 100–200 t charge of scrap steel in 40–65 minutes. Chemical energy from oxygen lances, natural gas burners, and carbon injection supplements electrical energy. Foamy slag practice — injecting carbon to generate CO bubbles — insulates the arc and boosts efficiency by 10–15%. A ladle furnace (LF) follows for chemistry trimming and temperature control before continuous casting.",
    metals:["Scrap steel — up to 100% of the charge","Graphite electrodes — UHP grade, 400–700 mm dia","Lime & dolomite — slag basicity control","Oxygen — decarburization and chemical energy","Carbon — foamy slag and recarburization","DRI / HBI — direct reduced iron (dilutes residuals)","FeMn, FeSi, FeCr, FeNi, FeMo — ladle alloy additions","Aluminum wire — deoxidation at tap"],
    output:"Liquid steel at 1600–1650°C, tapped to ladle for LMF trim" },
  { id:"bof", icon:"💨", name:"BOF / Refining", temp:"~1650°C", fullName:"Basic Oxygen Furnace",
    desc:"Pure oxygen is blown at supersonic speeds into liquid pig iron through a water-cooled lance. This oxidizes excess carbon from ~4% to <0.05% in just 18–22 minutes. Lime is added to form slag. Ladle metallurgy stations (LF, VD, RH degasser) then fine-tune chemistry, temperature, and inclusion content.",
    metals:["Oxygen (oxidizer)","Lime/dolomite (flux)","Ferroalloys: FeMn, FeSi, FeV, FeCr","Aluminum wire (deoxidizer)","Magnesium (desulfurizer)"],
    output:"Liquid steel at target chemistry, ~1580°C" },
  { id:"cast", icon:"🧊", name:"Continuous Casting", temp:"~1550°C", fullName:"Continuous Casting",
    desc:"Molten steel flows from ladle → tundish → oscillating copper mold. The copper mold extracts heat so rapidly (~1MW/m²) that a solid shell forms within seconds. The strand is withdrawn, spray-cooled through containment rolls, and cut by flame or mechanical shears. Slabs (flat products), blooms (long products), or billets are produced.",
    metals:["Copper mold plates (thermal extraction)","Mold flux powder (lubrication/insulation)","Argon gas (tundish shroud atmosphere)","Molybdenum ladle shrouds (high-wear)"],
    output:"Solid slabs (200–250mm), blooms, or billets at ~900°C" },
  { id:"reheat", icon:"🌡️", name:"Reheat Furnace", temp:"~1200°C", fullName:"Reheat Furnace",
    desc:"Cold or warm slabs are pushed or walked through gas-fired reheat furnaces at 280–360m/hr. Walking beam furnaces support slabs on water-cooled beams to avoid skid marks. Temperature uniformity (±15°C across the width) is critical — thermal gradients cause width variation, edge cracks, and shape defects in the rolled product.",
    metals:["Natural gas / blast furnace gas (fuel)","Alumina/magnesia refractory bricks (lining)","Scale (FeO/Fe₂O₃) forms on slab surface"],
    output:"Uniformly heated slab at 1180–1250°C" },
  { id:"roll", icon:"⚙️", name:"Rolling Mill", temp:"800–1100°C", fullName:"Hot Rolling Mill",
    desc:"The hot slab passes through a roughing mill (4–6 passes, 250mm → 30mm) then finishing stands (6–7 stands in tandem). Work roll gap, inter-stand tension, and crown are computer-controlled to ±5µm. High-speed steel (HSS) or indefinite chill iron (ICI) work rolls are ground daily. Run-out table cooling controls final microstructure and mechanical properties via controlled transformation.",
    metals:["HSS/ICI work rolls (finishing)","Chilled cast iron rougher rolls","Tool steel edger rolls","Backup rolls (forged steel, 1.5m dia)"],
    output:"Hot-rolled coil 2–25mm thick, ±30µm tolerance" },
  { id:"finish", icon:"✨", name:"Finishing Lines", temp:"Room Temp", fullName:"Cold Rolling & Finishing",
    desc:"Hot-rolled coil is pickled (HCl acid removes scale), then cold-rolled to final gauge — reducing 3mm HR to 0.6mm CR (80% reduction). Bell or continuous annealing restores ductility. Galvanizing lines pass strip through molten Zn at 450°C. Temper mills (1–2% reduction) give final surface finish, flatness, and yield point elimination.",
    metals:["HCl acid (pickling)","Zinc bath at 450°C (galvanizing)","Tin (electrolytic tinning)","Aluminum-zinc alloy (Galvalume)","Chromium (passivation coating)"],
    output:"Cold-rolled sheet, galvanized coil, tin plate, Galvalume" },
];

const ALLOYING = [
  { el:"C", name:"Carbon", effect:"Increases hardness & strength; reduces ductility & weldability above 0.3%", range:"0.05–1.5%" },
  { el:"Mn", name:"Manganese", effect:"Deoxidizer; improves hardenability and sulfide shape control; prevents hot shortness", range:"0.3–2.0%" },
  { el:"Cr", name:"Chromium", effect:"Corrosion resistance (≥10.5%); increases hardness; improves high-temp strength", range:"0.5–26%" },
  { el:"Ni", name:"Nickel", effect:"Toughness at low temps; austenite stabilizer in stainless; corrosion resistance", range:"0.5–35%" },
  { el:"Mo", name:"Molybdenum", effect:"Creep resistance; high-temp strength; hardenability; prevents temper brittleness", range:"0.15–5%" },
  { el:"V", name:"Vanadium", effect:"Microalloying grain refiner; precipitation hardening; wear resistance in tool steels", range:"0.05–5%" },
  { el:"Si", name:"Silicon", effect:"Deoxidizer; improves electrical resistivity (transformer steels); strengthens cast iron", range:"0.15–4%" },
  { el:"Al", name:"Aluminum", effect:"Strong deoxidizer; grain refiner (AlN); controls austenite grain size during rolling", range:"0.01–0.06%" },
  { el:"Ti", name:"Titanium", effect:"Stabilizes C and N in ULC steels; prevents sensitization in stainless; grain refinement", range:"0.01–0.3%" },
  { el:"B", name:"Boron", effect:"Extreme hardenability at very low levels (5–30 ppm); grain boundary strengthening", range:"0.0005–0.003%" },
  { el:"Co", name:"Cobalt", effect:"Increases hot hardness in HSS; strengthens superalloy matrix; raises Curie temperature", range:"1–12%" },
  { el:"W", name:"Tungsten", effect:"Carbide former; extreme hot hardness in HSS (M2); maintains hardness >500°C", range:"1–18%" },
  { el:"Nb", name:"Niobium", effect:"Microalloying: grain refinement and precipitation strengthening in HSLA steels", range:"0.01–0.1%" },
  { el:"Cu", name:"Copper", effect:"Improves atmospheric corrosion resistance; precipitation hardening in some grades", range:"0.1–2%" },
];

const QUIZ_POOL = [
  { q:"What is the minimum chromium content for stainless steel?", metal:"stainless-steel", opts:["5.5%","8.0%","10.5%","15.0%"], ans:2, exp:"Stainless steel requires at least 10.5% chromium to form a stable passive oxide layer that prevents corrosion." },
  { q:"Which metal is used for the inner mold plates in continuous casting?", metal:"copper", opts:["Aluminum","Copper","Stainless Steel","Cast Iron"], ans:1, exp:"Copper's exceptional thermal conductivity (100% IACS) rapidly extracts heat from molten steel, forming a solid shell in seconds." },
  { q:"What is the carbon content range in cast iron?", metal:"cast-iron", opts:["0.02–0.5%","0.5–2.0%","2.1–4.5%","5.0–8.0%"], ans:2, exp:"Cast iron contains 2.1–4.5% carbon. Above 2.1%, carbon forms graphite or iron carbide, making it unrollable." },
  { q:"Which alloying element provides creep resistance and high-temp strength in steels?", metal:"alloy-steel", opts:["Silicon","Manganese","Molybdenum","Boron"], ans:2, exp:"Molybdenum forms stable carbides that resist dissolution at high temperatures, preventing creep deformation." },
  { q:"In a blast furnace, what is the primary purpose of limestone?", metal:"pig-iron", opts:["Fuel source","Iron ore reduction","Slag former to remove impurities","Temperature control"], ans:2, exp:"Limestone (CaCO₃) decomposes to CaO which combines with silica and alumina from ore to form slag." },
  { q:"Which aluminum alloy series achieves the highest strength for aerospace?", metal:"aluminum", opts:["1xxx series","3xxx series","5xxx series","7xxx series"], ans:3, exp:"7xxx series (Zn-Mg-Cu alloys like 7075) are the highest-strength aluminum alloys used in aircraft structures." },
  { q:"What property makes zinc suitable for galvanizing steel?", metal:"zinc", opts:["High melting point","Sacrificial electrochemical protection","High tensile strength","Magnetic attraction"], ans:1, exp:"Zinc has a more negative electrode potential than iron, so it corrodes preferentially, protecting steel beneath it." },
  { q:"Which process reduces pig iron's carbon content from ~4% to <0.05%?", metal:"carbon-steel", opts:["Blast furnace smelting","Continuous casting","Basic Oxygen Furnace (BOF)","Hot rolling"], ans:2, exp:"In the BOF, pure oxygen blown at supersonic speed oxidizes carbon to CO/CO₂ gas in ~20 minutes." },
  { q:"AISI grade 4140 steel is classified as what type?", metal:"alloy-steel", opts:["Carbon steel","Stainless steel","Chromium-molybdenum alloy steel","Tool steel"], ans:2, exp:"4140 is a Cr-Mo alloy steel (4xxx AISI series). Used for gears, axles, and crankshafts." },
  { q:"What is the density of titanium vs. steel?", metal:"titanium", opts:["Same density","About 2x heavier","About half the density (~4.5 vs 7.85 g/cm³)","One-quarter the density"], ans:2, exp:"Titanium at 4.5 g/cm³ is roughly 57% the density of steel (7.85 g/cm³), giving it an outstanding strength-to-weight ratio." },
  { q:"Which element at only 5–30 ppm has an extreme effect on steel hardenability?", metal:"alloy-steel", opts:["Vanadium","Boron","Silicon","Titanium"], ans:1, exp:"Boron segregates to austenite grain boundaries and inhibits ferrite nucleation, dramatically increasing hardenability." },
  { q:"Which metal has the highest melting point of all metals?", metal:"tungsten", opts:["Titanium","Molybdenum","Tungsten","Cobalt"], ans:2, exp:"Tungsten melts at 3422°C — the highest of all metals. This is why it's used in light bulb filaments and rocket nozzles." },
  { q:"In steelmaking, which metal is injected as cored wire to desulfurize liquid steel?", metal:"carbon-steel", opts:["Aluminum","Manganese","Magnesium","Chromium"], ans:2, exp:"Magnesium (or Ca-Si) cored wire is injected into the ladle to react with sulfur, forming MgS which floats into slag." },
  { q:"What makes maraging steel achieve ultra-high strength (>2000 MPa)?", metal:"maraging-steel", opts:["Very high carbon content","Precipitation of intermetallic compounds during aging","Rapid quenching from high temperature","Addition of tungsten carbide"], ans:1, exp:"Maraging steels have <0.03% carbon and harden through precipitation of Ni₃Mo and Ni₃Ti intermetallics during low-temperature aging at ~480°C." },
  { q:"Cobalt-based alloys (Stellite) are primarily used in steel mills for:", metal:"cobalt", opts:["Electrical conductors","Wear-resistant hard-facing on hot guides and valve seats","Deoxidation of liquid steel","Galvanizing bath lining"], ans:1, exp:"Stellite (Co-Cr-W) maintains hardness at high temperatures and resists wear and oxidation, making it ideal for hard-facing guides, rolls, and wear plates in hot strip mills." },
  { q:"Which finishing line process electrolytically coats steel strip with tin for food cans?", metal:"tin", opts:["Galvanizing","Galvalume","Electrolytic tinning","Hard chrome plating"], ans:2, exp:"Electrolytic tinning lines deposit 1–11 g/m² of tin on cold-rolled strip through electrochemical deposition from a stannous sulfate bath — this creates tin plate for food cans." },
  { q:"What distinguishes wrought iron from cast iron and steel?", metal:"wrought-iron", opts:["Wrought iron has the highest carbon content","Wrought iron contains slag inclusions giving it a fibrous grain","Wrought iron is made in an electric arc furnace","Wrought iron cannot be welded"], ans:1, exp:"Wrought iron (<0.1% C) contains silicate slag inclusions that create a wood-like fibrous grain. This actually improves corrosion resistance compared to early steels." },
  { q:"Niobium (Nb) is classified as a microalloying element. What does it primarily do in HSLA steels?", metal:"alloy-steel", opts:["Acts as a powerful deoxidizer","Provides grain refinement and precipitation strengthening","Increases electrical conductivity","Replaces carbon for hardness"], ans:1, exp:"Niobium additions of 0.01–0.1% form fine NbC/NbN precipitates that pin austenite grain boundaries during rolling, producing finer ferrite grains and higher strength in as-rolled condition." },
  { q:"What is 'cartridge brass' (C26000) and why is it called that?", metal:"brass", opts:["A brass coated with chromium for shine","70% Cu / 30% Zn alloy named for its use in ammunition cartridges","A pure copper sheet used in cartridge printing","60% Cu / 40% Zn alloy developed for military use"], ans:1, exp:"C26000 (70/30 brass) is named for ammunition cartridges — its excellent cold-working ability allows deep drawing into the precise cylindrical cup shape of a rifle or pistol cartridge without cracking." },
  { q:"What does phosphorus addition achieve in phosphor bronze (C51000)?", metal:"phosphor-bronze", opts:["Increases zinc content for corrosion resistance","Acts as a deoxidizer and strengthens the alloy for better spring properties","Lowers the melting point for easier casting","Adds magnetic properties for sensor applications"], ans:1, exp:"Phosphorus (up to 0.35%) deoxidizes the melt and forms fine Cu₃P precipitates that enhance strength, hardness, and fatigue resistance — making phosphor bronze ideal for springs and connectors." },
  { q:"Why is cupronickel (90/10) preferred over brass for marine heat exchangers?", metal:"cupronickel", opts:["Higher tensile strength than brass","Resistance to dezincification and biofouling in seawater","Lower cost due to less copper content","Magnetic properties for easy inspection"], ans:1, exp:"Cupronickel resists both dezincification (the selective leaching of zinc that weakens brass in seawater) and biofouling (marine organisms) — making it the standard material for seawater-cooled heat exchangers and condenser tubing." },
  { q:"What makes beryllium copper (C17200) unique among copper alloys?", metal:"beryllium-copper", opts:["It is the most corrosion-resistant copper alloy","It achieves steel-level strength (>1400 MPa) after age hardening while remaining non-magnetic and non-sparking","It has the highest electrical conductivity of all copper alloys","It contains no beryllium — the name is historical"], ans:1, exp:"Beryllium copper age hardens through precipitation of CuBe and Cu₂Be intermetallics at ~315°C, reaching tensile strengths >1400 MPa — the highest of all copper alloys — while maintaining good conductivity, being non-magnetic, and non-sparking in explosive atmospheres." },
  { q:"What is 'dezincification' and which copper alloy was specifically designed to resist it?", metal:"naval-brass", opts:["Oxidation of zinc on brass surfaces — resisted by phosphor bronze","Selective leaching of zinc from brass in seawater leaving a porous copper sponge — resisted by Naval Brass (C46400)","A heat treatment that removes zinc — resisted by aluminum bronze","Zinc evaporation during casting — resisted by cupronickel"], ans:1, exp:"Dezincification occurs when zinc preferentially dissolves from brass in seawater, leaving a weakened copper shell. Naval Brass (C46400) adds 0.75% tin to inhibit this electrochemical process, making it the standard choice for marine hardware." },
];

// ─── MICROSTRUCTURE SVG ───────────────────────────────────────────────────────
function MicrostructureSVG({ metalId, width = 260, height = 105 }) {
  const seed = metalId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (s) => { let x = Math.sin(s + seed) * 10000; return x - Math.floor(x); };

  const microType = {
    "pig-iron":"ferrite_graphite","carbon-steel":"pearlite_ferrite","stainless-steel":"austenite",
    "cast-iron":"gray_iron","alloy-steel":"bainite","tool-steel":"martensite","wrought-iron":"ferrite_slag",
    "maraging-steel":"martensite","aluminum":"aluminum_grains","copper":"copper_grains","nickel":"nickel_grains",
    "titanium":"titanium_grains","zinc":"zinc_grains","lead":"lead_grains","tungsten":"tungsten_grains",
    "magnesium":"magnesium_grains","cobalt":"cobalt_grains","tin":"tin_grains","chromium":"chromium_grains",
    "molybdenum":"molybdenum_grains",
    "brass":"brass_grains","phosphor-bronze":"bronze_grains","cupronickel":"cupronickel_grains",
    "beryllium-copper":"beryllium_copper_grains","aluminum-bronze":"aluminum_bronze_grains","naval-brass":"brass_grains"
  }[metalId] || "pearlite_ferrite";

  const configs = {
    pearlite_ferrite:{ bg:"#0a0c10", grainColor:"#1e2535", lineColor:"#4a6080", accent:"#8fa0b8", label:"Pearlite + Ferrite", labelColor:"#8fa0b8" },
    austenite:{ bg:"#08100a", grainColor:"#0d2015", lineColor:"#2a6040", accent:"#40c870", label:"Austenite Grains", labelColor:"#40c870" },
    martensite:{ bg:"#100a08", grainColor:"#1a0e0a", lineColor:"#804020", accent:"#e05c30", label:"Martensite Needles", labelColor:"#e05c30" },
    bainite:{ bg:"#080c14", grainColor:"#10182a", lineColor:"#3050a0", accent:"#6080d0", label:"Bainite Structure", labelColor:"#6080d0" },
    gray_iron:{ bg:"#0c0c0c", grainColor:"#181818", lineColor:"#404040", accent:"#909090", label:"Graphite Flakes (Gray Iron)", labelColor:"#a0a0a0" },
    ferrite_graphite:{ bg:"#0c0c10", grainColor:"#1a1a22", lineColor:"#606060", accent:"#c0c0c0", label:"Ferrite + Graphite", labelColor:"#b0b0c0" },
    ferrite_slag:{ bg:"#100c08", grainColor:"#1e1408", lineColor:"#806040", accent:"#c09060", label:"Ferrite + Slag Inclusions", labelColor:"#c09060" },
    aluminum_grains:{ bg:"#0a0c12", grainColor:"#12182a", lineColor:"#4060a0", accent:"#80a0e0", label:"Aluminum Grains", labelColor:"#80a0e0" },
    copper_grains:{ bg:"#120a04", grainColor:"#241208", lineColor:"#904820", accent:"#e08040", label:"Copper Grains", labelColor:"#e08040" },
    nickel_grains:{ bg:"#0c0c10", grainColor:"#18182a", lineColor:"#505090", accent:"#a0a0d0", label:"Nickel Grains", labelColor:"#a0a0d0" },
    titanium_grains:{ bg:"#080c12", grainColor:"#101820", lineColor:"#305070", accent:"#60a0c0", label:"Ti α+β Grains", labelColor:"#60a0c0" },
    zinc_grains:{ bg:"#080c10", grainColor:"#101820", lineColor:"#304060", accent:"#60a0c0", label:"Zinc Dendritic Grains", labelColor:"#70b0d0" },
    lead_grains:{ bg:"#0c0c0c", grainColor:"#181c1c", lineColor:"#404850", accent:"#808a90", label:"Lead Grains", labelColor:"#808a90" },
    tungsten_grains:{ bg:"#0a080c", grainColor:"#181420", lineColor:"#504060", accent:"#c080f0", label:"Tungsten Grains", labelColor:"#b070e0" },
    magnesium_grains:{ bg:"#080c08", grainColor:"#0e180e", lineColor:"#306030", accent:"#60b060", label:"Mg Hexagonal Grains", labelColor:"#70c070" },
    cobalt_grains:{ bg:"#08080e", grainColor:"#10101e", lineColor:"#303070", accent:"#6060c0", label:"Cobalt Grains", labelColor:"#7070d0" },
    tin_grains:{ bg:"#0a0c0a", grainColor:"#141814", lineColor:"#406040", accent:"#80c080", label:"Tin Grains (β phase)", labelColor:"#90d090" },
    chromium_grains:{ bg:"#0c0808", grainColor:"#1e1010", lineColor:"#703020", accent:"#d06040", label:"Chromium Grains", labelColor:"#e07050" },
    molybdenum_grains:{ bg:"#080c10", grainColor:"#101820", lineColor:"#284870", accent:"#5080b0", label:"Molybdenum Grains", labelColor:"#6090c0" },
    brass_grains:{ bg:"#0e0b04", grainColor:"#1e1608", lineColor:"#806020", accent:"#c8a040", label:"Brass α+β Grains", labelColor:"#d4aa48" },
    bronze_grains:{ bg:"#100a04", grainColor:"#200e06", lineColor:"#784020", accent:"#b87040", label:"Bronze (α-Cu) Grains", labelColor:"#c07840" },
    cupronickel_grains:{ bg:"#0c0a08", grainColor:"#1c1610", lineColor:"#786040", accent:"#c8a070", label:"Cupronickel Grains", labelColor:"#d0a878" },
    beryllium_copper_grains:{ bg:"#100804", grainColor:"#201008", lineColor:"#904820", accent:"#e07030", label:"Be-Cu Precipitate Hardened", labelColor:"#e88040" },
    aluminum_bronze_grains:{ bg:"#0c0a04", grainColor:"#1a1406", lineColor:"#706010", accent:"#b89020", label:"Aluminum Bronze Grains", labelColor:"#c0a030" },
  };

  const cfg = configs[microType] || configs.pearlite_ferrite;
  const W = width, H = height;

  // Generate voronoi-like grain cells
  const numSeeds = 22;
  const seeds = Array.from({ length: numSeeds }, (_, i) => ({
    x: rng(i * 3.1) * W,
    y: rng(i * 3.7) * H,
    shade: rng(i * 2.9) * 0.4
  }));

  // Build cell polygons (simple proximity-based)
  const cells = seeds.map((s, si) => {
    const pts = [];
    const angles = Array.from({ length: 14 }, (_, k) => (k / 14) * Math.PI * 2);
    angles.forEach(a => {
      const r = (0.4 + rng(si * 7 + a) * 0.6) * Math.min(W, H) * 0.14;
      pts.push([s.x + Math.cos(a) * r, s.y + Math.sin(a) * r]);
    });
    return { pts, shade: s.shade };
  });

  // Needles for martensite/bainite
  const needles = microType === "martensite" || microType === "bainite"
    ? Array.from({ length: 28 }, (_, i) => ({
        x1: rng(i * 4.1) * W, y1: rng(i * 4.7) * H,
        len: 15 + rng(i * 3.3) * 30,
        angle: (rng(i * 5.1) < 0.5 ? 30 : -30) + rng(i * 6.1) * 20 - 10,
        opacity: 0.4 + rng(i * 7.1) * 0.5
      }))
    : [];

  // Graphite flakes for gray iron
  const flakes = (microType === "gray_iron" || microType === "ferrite_graphite")
    ? Array.from({ length: 20 }, (_, i) => ({
        x: rng(i * 3.3) * W, y: rng(i * 3.9) * H,
        w: 8 + rng(i * 4.1) * 25, h: 2 + rng(i * 5.1) * 4,
        angle: rng(i * 6.3) * 180
      }))
    : [];

  // Slag inclusions for wrought iron
  const slags = microType === "ferrite_slag"
    ? Array.from({ length: 12 }, (_, i) => ({
        x: rng(i * 4.4) * W, y: rng(i * 5.1) * H,
        rx: 3 + rng(i * 3.2) * 12, ry: 1.5 + rng(i * 4.2) * 3,
        angle: rng(i * 6.5) * 180
      }))
    : [];

  // Dendritic arms for Mg/Zn
  const isDendritic = microType === "magnesium_grains" || microType === "zinc_grains";

  return (
    <div className="micro-wrap">
      <div className="micro-lbl">{cfg.label}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 6, border: "1px solid var(--bd)", background: cfg.bg, display: "block" }}>
        <defs>
          <filter id={`glow-${metalId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`noise-${metalId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>

        {/* Grain fills */}
        {cells.map((cell, i) => (
          <polygon key={i}
            points={cell.pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}
            fill={cfg.grainColor}
            opacity={0.6 + cell.shade * 0.4}
          />
        ))}

        {/* Grain boundaries */}
        {cells.map((cell, i) => (
          <polygon key={`b${i}`}
            points={cell.pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}
            fill="none"
            stroke={cfg.lineColor}
            strokeWidth="0.8"
            opacity="0.7"
          />
        ))}

        {/* Martensite/Bainite needles */}
        {needles.map((n, i) => {
          const rad = (n.angle * Math.PI) / 180;
          return (
            <line key={i}
              x1={n.x} y1={n.y}
              x2={n.x + Math.cos(rad) * n.len} y2={n.y + Math.sin(rad) * n.len}
              stroke={cfg.accent} strokeWidth="1.2" opacity={n.opacity}
              filter={`url(#glow-${metalId})`}
            />
          );
        })}

        {/* Graphite flakes */}
        {flakes.map((f, i) => (
          <ellipse key={i} cx={f.x} cy={f.y} rx={f.w / 2} ry={f.h / 2}
            fill="#1a1a1a" stroke="#505050" strokeWidth="0.5" opacity="0.85"
            transform={`rotate(${f.angle},${f.x},${f.y})`}
          />
        ))}

        {/* Slag inclusions */}
        {slags.map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry}
            fill="#3a2810" stroke="#806040" strokeWidth="0.6" opacity="0.75"
            transform={`rotate(${s.angle},${s.x},${s.y})`}
          />
        ))}

        {/* Dendritic arms */}
        {isDendritic && seeds.slice(0, 10).map((s, si) => (
          [0, 90, 180, 270].map(a => {
            const rad = (a * Math.PI) / 180;
            const len = 12 + rng(si * a + 1) * 18;
            return (
              <g key={`${si}-${a}`}>
                <line x1={s.x} y1={s.y} x2={s.x + Math.cos(rad) * len} y2={s.y + Math.sin(rad) * len}
                  stroke={cfg.accent} strokeWidth="0.9" opacity="0.45" />
                {[0.35, 0.65].map(t => {
                  const bx = s.x + Math.cos(rad) * len * t;
                  const by = s.y + Math.sin(rad) * len * t;
                  const br = ((a + 90) * Math.PI) / 180;
                  return (
                    <line key={t} x1={bx} y1={by} x2={bx + Math.cos(br) * 5} y2={by + Math.sin(br) * 5}
                      stroke={cfg.accent} strokeWidth="0.6" opacity="0.3" />
                  );
                })}
              </g>
            );
          })
        ))}

        {/* Triple junction highlight dots */}
        {seeds.slice(0, 15).map((s, i) => (
          <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r="1.2"
            fill={cfg.accent} opacity="0.35"
          />
        ))}

        {/* Scale bar */}
        <rect x={W - 42} y={H - 10} width={30} height={2} fill={cfg.accent} opacity="0.6" rx="1" />
        <text x={W - 27} y={H - 13} fill={cfg.accent} fontSize="6" fontFamily="'Share Tech Mono',monospace" textAnchor="middle" opacity="0.6">10 µm</text>
      </svg>
    </div>
  );
}

// ─── LADLE CALCULATOR ─────────────────────────────────────────────────────────
const LADLE_ELEMENTS = [
  { sym:"C", name:"Carbon", min:0, max:1.5, step:0.01, unit:"%" },
  { sym:"Mn", name:"Manganese", min:0, max:2.5, step:0.05, unit:"%" },
  { sym:"Cr", name:"Chromium", min:0, max:26, step:0.5, unit:"%" },
  { sym:"Ni", name:"Nickel", min:0, max:20, step:0.5, unit:"%" },
  { sym:"Mo", name:"Molybdenum", min:0, max:5, step:0.1, unit:"%" },
  { sym:"Si", name:"Silicon", min:0, max:4, step:0.05, unit:"%" },
  { sym:"V", name:"Vanadium", min:0, max:2, step:0.05, unit:"%" },
];

function predictProperties(vals) {
  const { C, Mn, Cr, Ni, Mo, V } = vals;
  const ts = Math.min(2200, 400 + C * 800 + Mn * 150 + Cr * 30 + Ni * 20 + Mo * 200 + V * 300);
  const hardness = Math.min(68, 20 + C * 25 + Mo * 3 + V * 8 + Cr * 0.5);
  const weldability = Math.max(0, 100 - C * 60 - Mn * 8 - Cr * 2 - Mo * 5 - Ni * 1.5);
  const corrosionRes = Math.min(100, Cr * 4 + Ni * 2 + Mo * 6);
  const toughness = Math.min(100, 40 + Ni * 4 - C * 15 + Mn * 5 - V * 3);

  let grade = "Custom Steel", type = "";
  if (Cr >= 10.5 && Ni >= 6) { grade = "Austenitic Stainless (~304/316)"; type = "Stainless"; }
  else if (Cr >= 10.5 && Ni < 2) { grade = "Ferritic/Martensitic Stainless"; type = "Stainless"; }
  else if (C <= 0.05 && Mn <= 0.5 && Cr < 1) { grade = "Ultra-Low Carbon (ULC/IF Steel)"; type = "Flat"; }
  else if (C <= 0.3 && Cr < 1 && Mn <= 1.5) { grade = "Low Carbon Structural (~1018–1025)"; type = "Carbon"; }
  else if (C > 0.3 && C <= 0.6 && Mo >= 0.15) { grade = "Alloy Steel (~4140/4340)"; type = "Alloy"; }
  else if (C > 0.6 && V > 0.1 && Mo > 0.5) { grade = "Tool Steel (~H13/D2)"; type = "Tool"; }
  else if (C > 0.6 && Mn > 1) { grade = "High Carbon Steel (~1080–1095)"; type = "Carbon"; }
  else if (C > 0.3 && C <= 0.6) { grade = "Medium Carbon Steel (~1040–1060)"; type = "Carbon"; }

  return { ts: Math.round(ts), hardness: Math.round(hardness), weldability: Math.round(weldability), corrosionRes: Math.round(corrosionRes), toughness: Math.round(toughness), grade, type };
}

function LadleCalc() {
  const [vals, setVals] = useState({ C: 0.2, Mn: 1.0, Cr: 0, Ni: 0, Mo: 0, Si: 0.25, V: 0 });
  const pred = useMemo(() => predictProperties(vals), [vals]);

  const bars = [
    { label:"Tensile Strength", val:pred.ts, max:2200, unit:"MPa", color:"#f07820" },
    { label:"Hardness (HRC)", val:pred.hardness, max:68, unit:"HRC", color:"#e05c30" },
    { label:"Weldability", val:pred.weldability, max:100, unit:"%", color:"#40c870" },
    { label:"Corrosion Resistance", val:pred.corrosionRes, max:100, unit:"%", color:"#20a8d0" },
    { label:"Toughness", val:pred.toughness, max:100, unit:"%", color:"#a060d0" },
  ];

  return (
    <div className="calc-wrap">
      <div className="calc-panel">
        <h3>⚗ Alloy Composition</h3>
        {LADLE_ELEMENTS.map(el => (
          <div key={el.sym} className="el-row">
            <span className="el-sym">{el.sym}</span>
            <span className="el-name">{el.name}</span>
            <input type="range" className="el-slider" min={el.min} max={el.max} step={el.step}
              value={vals[el.sym]}
              onChange={e => setVals(v => ({ ...v, [el.sym]: parseFloat(e.target.value) }))}
            />
            <span className="el-val">{vals[el.sym].toFixed(el.sym === "C" ? 2 : 1)}{el.unit}</span>
          </div>
        ))}
      </div>

      <div className="calc-panel">
        <h3>📊 Predicted Properties</h3>
        <div className="pred-section">
          <h4>Mechanical & Chemical Properties</h4>
          {bars.map(b => (
            <div key={b.label} className="pred-bar-wrap">
              <div className="pred-bar-label">
                <span className="pred-bar-name">{b.label}</span>
                <span className="pred-bar-val">{b.val} {b.unit}</span>
              </div>
              <div className="pred-bar-bg">
                <div className="pred-bar-fill" style={{ width: `${(b.val / b.max) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
          <div className="pred-steel-type">
            <strong style={{ color: "var(--am)" }}>Closest Grade:</strong> {pred.grade}
            {pred.type && <div className="pred-grade">Category: {pred.type} Steel</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MetalogyApp() {
  const [tab, setTab] = useState("learn");
  const [level, setLevel] = useState("apprentice");
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [millStep, setMillStep] = useState("blast");
  const [compareA, setCompareA] = useState("carbon-steel");
  const [compareB, setCompareB] = useState("aluminum");
  const [progress, setProgress] = useState(() => loadP() || initP());
  const [quizState, setQuizState] = useState({ idx: 0, sel: null, score: 0, done: false });
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSearch, setQuizSearch] = useState("");
  const [quizMetalFilter, setQuizMetalFilter] = useState("all");
  const [shuffled, setShuffled] = useState([]);

  const filteredQuizPool = useMemo(() => {
    return QUIZ_POOL.filter(q => {
      const metalObj = ALL_METALS.find(m => m.id === q.metal);
      const matchesType = quizMetalFilter === "all" || (metalObj && metalObj.type === quizMetalFilter);
      const matchesSearch = !quizSearch || q.q.toLowerCase().includes(quizSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [quizSearch, quizMetalFilter]);

  const saveProgress = (p) => { setProgress(p); saveP(p); };

  const toggle = (id) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next && !progress.studied.includes(next)) {
      saveProgress({ ...progress, studied: [...progress.studied, next] });
    }
  };

  // Quiz logic
  const currentQ = shuffled[quizState.idx];
  const totalQ = Math.min(shuffled.length, 12);

  const handleAnswer = (i) => {
    if (quizState.sel !== null) return;
    const correct = i === currentQ.ans;
    setQuizState(s => ({ ...s, sel: i, score: correct ? s.score + 1 : s.score }));
  };

  const nextQ = () => {
    if (quizState.idx + 1 >= totalQ) {
      const now = new Date().toLocaleDateString();
      const hist = [...progress.quizHistory, { score: quizState.score + (quizState.sel === currentQ.ans ? 1 : 0), total: totalQ, date: now }];
      const newCorrect = progress.totalCorrect + quizState.score + (quizState.sel === currentQ.ans ? 1 : 0);
      const newAttempted = progress.totalAttempted + totalQ;
      const newBadges = [...progress.badges];
      if (!newBadges.includes("first-quiz")) newBadges.push("first-quiz");
      const pct = (quizState.score + 1) / totalQ;
      if (pct === 1 && !newBadges.includes("perfect")) newBadges.push("perfect");
      if (hist.length >= 5 && !newBadges.includes("dedicated")) newBadges.push("dedicated");
      if (progress.studied.length >= 10 && !newBadges.includes("explorer")) newBadges.push("explorer");
      saveProgress({ ...progress, quizHistory: hist, totalCorrect: newCorrect, totalAttempted: newAttempted, badges: newBadges });
      setQuizState(s => ({ ...s, done: true }));
    } else {
      setQuizState(s => ({ ...s, idx: s.idx + 1, sel: null }));
    }
  };

  const startQuiz = () => {
    setShuffled([...filteredQuizPool].sort(() => Math.random() - 0.5));
    setQuizState({ idx: 0, sel: null, score: 0, done: false });
    setQuizStarted(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizState({ idx: 0, sel: null, score: 0, done: false });
  };

  const scoreMsg = (s) => {
    const p = s / totalQ;
    if (p === 1) return "Perfect score — engineer-level mastery. Outstanding performance.";
    if (p >= 0.8) return "Excellent result. Strong metallurgical knowledge across the board.";
    if (p >= 0.6) return "Good foundation. Review mill processes and alloying elements sections.";
    return "Keep studying! Focus on the Learn tab, especially grades and mill operations.";
  };

  const finalScore = quizState.done
    ? (progress.quizHistory[progress.quizHistory.length - 1]?.score ?? 0)
    : quizState.score;

  const displayMetals = ALL_METALS.filter(m => {
    if (filter !== "all" && m.type !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return m.name.toLowerCase().includes(s) || m.uses.join(" ").toLowerCase().includes(s) || m.subtitle.toLowerCase().includes(s);
    }
    return true;
  });

  const metalA = ALL_METALS.find(m => m.id === compareA);
  const metalB = ALL_METALS.find(m => m.id === compareB);
  const activeStep = MILL_STEPS.find(s => s.id === millStep);

  const overallPct = progress.totalAttempted > 0 ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100) : 0;

  const BADGE_INFO = {
    "first-quiz": { icon: "🎯", label: "First Quiz Completed" },
    "perfect": { icon: "⭐", label: "Perfect Score" },
    "dedicated": { icon: "🏅", label: "5 Quizzes Completed" },
    "explorer": { icon: "🔍", label: "10 Metals Studied" },
  };

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* HEADER */}
      <header className="hdr">
        <div className="logo">⚙ METAL<span>OGY</span></div>
        <div className="lvl-sel">
          {["student","apprentice","engineer"].map(l => (
            <button key={l} className={`lvl-btn${level===l?" active":""}`} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
      </header>

      {/* NAV */}
      <nav className="nav">
        {[
          { id:"learn", label:"📚 Learn" },
          { id:"mill", label:"🏭 Steel Mill" },
          { id:"ladle", label:"⚗ Ladle Calc" },
          { id:"compare", label:"⚖ Compare" },
          { id:"quiz", label:"🎯 Quiz" },
          { id:"progress", label:"📊 Progress" },
        ].map(t => (
          <button key={t.id} className={`ntab${tab===t.id?" active":""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">

        {/* ══ LEARN TAB ══ */}
        {tab === "learn" && <>
          <div style={{ textAlign:"center", padding:"2rem 1rem 1.2rem" }}>
            <div style={{ display:"inline-block", fontFamily:"'Share Tech Mono',monospace", fontSize:".66rem", color:"var(--or)", letterSpacing:".15em", border:"1px solid rgba(240,120,32,.4)", padding:"3px 10px", borderRadius:2, marginBottom:".7rem" }}>
              ⬡ Industrial Metallurgy Reference
            </div>
            <h1 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"clamp(1.8rem,5vw,2.8rem)", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", marginBottom:".7rem" }}>
              Know Your <span style={{ color:"var(--or)" }}>Metals</span>
            </h1>
            <p style={{ color:"var(--mu)", maxWidth:460, margin:"0 auto 1.3rem", fontSize:".92rem", lineHeight:1.6, fontWeight:300 }}>
              26 metals — ferrous, non-ferrous, and copper alloys — with names, properties, grades, microstructures, and steel mill applications.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:"1.8rem", flexWrap:"wrap" }}>
              {[
                { n:ALL_METALS.length, l:"Metals" },
                { n:FERROUS.length, l:"Ferrous" },
                { n:NONFERROUS.length, l:"Non-Ferrous" },
                { n:COPPER_ALLOYS.length, l:"Cu-Alloys" },
                { n:progress.studied.length, l:"Studied" },
              ].map(s => (
                <div key={s.l} style={{ textAlign:"center" }}>
                  <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"1.6rem", fontWeight:700, color:"var(--am)", display:"block" }}>{s.n}</span>
                  <span style={{ fontSize:".7rem", color:"var(--mu)", letterSpacing:".08em", textTransform:"uppercase" }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sbar">
            <input className="sinput" placeholder="Search metals or applications..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="fbtns">
              {[
                { id:"all", label:"All" },
                { id:"ferrous", label:"Ferrous" },
                { id:"nonferrous", label:"Non-Ferrous" },
                { id:"copper_alloy", label:"Copper Alloys" },
              ].map(f => (
                <button key={f.id} className={`fbtn${filter===f.id?" active":""}`} onClick={() => setFilter(f.id)}>{f.label}</button>
              ))}
            </div>
          </div>

          {(filter==="all"||filter==="ferrous") && <>
            <div className="sh"><span className="stag tfe">Ferrous</span><span className="stitle">Iron-Based Metals</span><span style={{ color:"var(--mu)", fontSize:".77rem", marginLeft:"auto" }}>Contains Iron (Fe)</span></div>
            <div className="grid">
              {displayMetals.filter(m=>m.type==="ferrous").map(m => (
                <MetalCard key={m.id} metal={m} expanded={expanded===m.id} onToggle={toggle} level={level} studied={progress.studied.includes(m.id)} />
              ))}
            </div>
          </>}

          {(filter==="all"||filter==="nonferrous") && <>
            <div className="sh"><span className="stag tnf">Non-Ferrous</span><span className="stitle">No-Iron Metals</span><span style={{ color:"var(--mu)", fontSize:".77rem", marginLeft:"auto" }}>No Iron (Fe) Base</span></div>
            <div className="grid">
              {displayMetals.filter(m=>m.type==="nonferrous").map(m => (
                <MetalCard key={m.id} metal={m} expanded={expanded===m.id} onToggle={toggle} level={level} studied={progress.studied.includes(m.id)} />
              ))}
            </div>
          </>}

          {(filter==="all"||filter==="copper_alloy") && <>
            <div className="sh"><span className="stag tcp">Copper Alloys</span><span className="stitle">Copper-Based Alloys</span><span style={{ color:"var(--mu)", fontSize:".77rem", marginLeft:"auto" }}>Cu-Base Engineering Alloys</span></div>
            <div className="grid">
              {displayMetals.filter(m=>m.type==="copper_alloy").map(m => (
                <MetalCard key={m.id} metal={m} expanded={expanded===m.id} onToggle={toggle} level={level} studied={progress.studied.includes(m.id)} />
              ))}
            </div>
          </>}
        </>}

        {/* ══ MILL TAB ══ */}
        {tab === "mill" && <>
          <div className="sh"><span className="stag tml">Steel Mill</span><span className="stitle">From Ore to Finished Steel</span></div>
          <p style={{ color:"var(--mu)", fontSize:".87rem", marginBottom:"1.2rem" }}>Select any step to see temperatures, metals involved, and process details.</p>

          <div className="mflow">
            {MILL_STEPS.map((s, i) => <>
              <div key={s.id} className={`mstep${millStep===s.id?" active":""}`} onClick={() => setMillStep(s.id)}>
                <div className="msi">{s.icon}</div>
                <div className="msn">{s.name}</div>
                <div className="mst">{s.temp}</div>
              </div>
              {i < MILL_STEPS.length - 1 && <div className="marr">→</div>}
            </>)}
          </div>

          {activeStep && (
            <div className="mdc">
              <h3>{activeStep.icon} {activeStep.fullName} — {activeStep.temp}</h3>
              <p>{activeStep.desc}</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".9rem" }}>
                <div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".65rem", color:"var(--mu)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:".5rem" }}>Key Materials & Metals</div>
                  {activeStep.metals.map(m => (
                    <div key={m} style={{ fontSize:".82rem", padding:"5px 0", borderBottom:"1px solid var(--bd)", color:"var(--tx)" }}>
                      <span style={{ color:"var(--ml)", marginRight:6 }}>▸</span>{m}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".65rem", color:"var(--mu)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:".5rem" }}>Output</div>
                  <div style={{ background:"rgba(160,96,208,.08)", border:"1px solid rgba(160,96,208,.25)", borderRadius:5, padding:"10px", fontSize:".84rem", color:"var(--tx)", lineHeight:1.55 }}>{activeStep.output}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── EAF DEEP-DIVE PANEL ── */}
          {millStep === "eaf" && (
            <div className="mdc" style={{ marginTop:".85rem" }}>
              <h3>⚡ EAF Technical Breakdown</h3>

              {/* Power & Performance grid */}
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".63rem", color:"var(--mu)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:".55rem" }}>Power &amp; Performance</div>
              <div className="pgrid" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))", gap:".4rem", marginBottom:"1.1rem" }}>
                {[
                  { label:"Power Draw",      val:"60–150 MW" },
                  { label:"Energy / Tonne",  val:"350–700 kWh/t" },
                  { label:"Tap-to-Tap",      val:"40–65 min" },
                  { label:"Heat Size",       val:"80–200 t" },
                  { label:"Arc Temp",        val:"~3 000–40 000°C" },
                  { label:"Bath Temp",       val:"1 580–1 650°C" },
                ].map(x => (
                  <div className="pi" key={x.label}>
                    <div className="plabel">{x.label}</div>
                    <div className="pval">{x.val}</div>
                  </div>
                ))}
              </div>

              {/* How it works */}
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".63rem", color:"var(--mu)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:".45rem" }}>How It Works</div>
              <div className="ginfo" style={{ marginBottom:"1rem" }}>
                Scrap is charged into the furnace vessel, often in two baskets. The roof swings back, the charge drops, then the roof closes and the three electrodes lower. Striking an arc between the electrode tips and the scrap generates intense Joule heating. As scrap melts the electrodes bore down toward the liquid bath — arc length is servo-controlled to maximise power input while protecting the shell. Oxygen is lanced into the bath to oxidise carbon and silicon, generating chemical heat that can supply 30–40% of total energy. Carbon powder is blown into the slag to create CO bubbles (foamy slag), which blanket the arc and cut electrode consumption by ~20%.
              </div>

              {/* Scrap & electrodes side-by-side */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:".9rem", marginBottom:"1rem" }}>
                <div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".63rem", color:"var(--mu)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:".45rem" }}>Role of Scrap Steel</div>
                  {[
                    "Primary iron source — replaces ore & coke entirely",
                    "Grade sorting critical: low-residual scrap for quality flat products",
                    "Residuals (Cu, Sn, Mo) are non-removable — scrap selection controls final chemistry",
                    "DRI / HBI added to dilute residuals for demanding grades (automotive, electrical)",
                    "Typical charge: 80–100% scrap + 0–20% DRI/HBI + hot metal (if available)",
                  ].map(pt => (
                    <div key={pt} style={{ fontSize:".81rem", padding:"5px 0", borderBottom:"1px solid var(--bd)", color:"var(--tx)", lineHeight:1.45 }}>
                      <span style={{ color:"var(--nf)", marginRight:6 }}>▸</span>{pt}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".63rem", color:"var(--mu)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:".45rem" }}>Graphite Electrodes</div>
                  {[
                    "UHP (ultra-high-power) grade — pitch-impregnated, isostatically pressed",
                    "Diameter: 400–700 mm; column length 1.5–2.4 m per segment",
                    "Consumption: 1.5–2.5 kg per tonne of steel produced",
                    "Arc tip temperature: ~3 000°C at surface, plasma core >10 000°C",
                    "Nipple-joined columns auto-feed as electrodes oxidise and break",
                  ].map(pt => (
                    <div key={pt} style={{ fontSize:".81rem", padding:"5px 0", borderBottom:"1px solid var(--bd)", color:"var(--tx)", lineHeight:1.45 }}>
                      <span style={{ color:"var(--am)", marginRight:6 }}>▸</span>{pt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Alloy additions */}
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".63rem", color:"var(--mu)", letterSpacing:".12em", textTransform:"uppercase", marginBottom:".45rem" }}>Metals &amp; Alloys Added</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:".4rem" }}>
                {[
                  { el:"FeMn / SiMn",  note:"Deoxidation, sulphide shape control, hardenability" },
                  { el:"FeSi",         note:"Deoxidation; silicon for electrical & spring steels" },
                  { el:"FeCr / FeNi",  note:"Chromium & nickel for stainless and alloy grades" },
                  { el:"FeMo",         note:"Creep & high-temp strength; pipeline & pressure grades" },
                  { el:"FeV / FeNb",   note:"Microalloying grain refinement in HSLA steels" },
                  { el:"Al wire",      note:"Final deoxidation at tap; AlN grain size control" },
                  { el:"Carbon",       note:"Recarburisation to target; foamy slag generation" },
                  { el:"DRI / HBI",    note:"Dilutes Cu/Sn residuals; clean iron unit source" },
                ].map(a => (
                  <div key={a.el} className="pi" style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                    <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".78rem", color:"var(--ml)", whiteSpace:"nowrap", minWidth:68 }}>{a.el}</span>
                    <span style={{ fontSize:".79rem", color:"var(--mu)", lineHeight:1.4 }}>{a.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sh"><span className="stag tam">Chemistry</span><span className="stitle">Alloying Elements in Steel</span></div>
          <div style={{ background:"var(--s1)", border:"1px solid var(--bd)", borderRadius:8, overflow:"auto", marginBottom:"2rem" }}>
            <table className="atable">
              <thead>
                <tr><th>Element</th><th>Typical Range</th><th>Effect on Steel Properties</th></tr>
              </thead>
              <tbody>
                {ALLOYING.map(e => (
                  <tr key={e.el}>
                    <td><span className="echip">{e.el}</span> {e.name}</td>
                    <td style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".77rem", color:"var(--am)" }}>{e.range}</td>
                    <td style={{ color:"var(--mu)", fontSize:".8rem" }}>{e.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>}

        {/* ══ LADLE CALC TAB ══ */}
        {tab === "ladle" && <>
          <div className="sh"><span className="stag tam">⚗</span><span className="stitle">Ladle Metallurgy Calculator</span></div>
          <p style={{ color:"var(--mu)", fontSize:".87rem", marginBottom:"1.3rem" }}>
            Adjust alloying element sliders to simulate a steel composition. Predicted properties update in real time based on metallurgical models.
          </p>
          <LadleCalc />
          <div style={{ background:"var(--s1)", border:"1px solid var(--bd)", borderRadius:8, padding:"1rem", marginBottom:"1.5rem" }}>
            <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:".88rem", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", color:"var(--am)", marginBottom:".7rem" }}>How to Use This Tool</div>
            <div style={{ fontSize:".83rem", color:"var(--mu)", lineHeight:1.6 }}>
              Drag the sliders to simulate ladle additions in steelmaking. Carbon drives hardness and tensile strength but reduces weldability.
              Chromium above 10.5% creates stainless grades. Molybdenum and vanadium improve high-temperature strength. Nickel improves toughness.
              The predicted grade shows the nearest AISI/industry classification for your composition.
              <br/><br/>
              <span style={{ color:"var(--or)" }}>Note:</span> These predictions use simplified empirical models for educational purposes. Real steelmaking requires full thermodynamic modeling (Thermo-Calc, JMatPro).
            </div>
          </div>
        </>}

        {/* ══ COMPARE TAB ══ */}
        {tab === "compare" && <>
          <div className="sh"><span className="stag tnf">Compare</span><span className="stitle">Side-by-Side Metal Analysis</span></div>
          <div className="cgrid">
            {[[metalA, compareA, setCompareA, "Metal A"], [metalB, compareB, setCompareB, "Metal B"]].map(([panel, sel, setSel, label]) => (
              <div key={label} className="cpanel">
                <h3 style={{ color: panel?.type==="ferrous"?"var(--fe)":panel?.type==="copper_alloy"?"var(--cp)":"var(--nf)" }}>{label}: {panel?.name}</h3>
                <select className="csel" value={sel} onChange={e => setSel(e.target.value)}>
                  <optgroup label="── Ferrous ──">{FERROUS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
                  <optgroup label="── Non-Ferrous ──">{NONFERROUS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
                  <optgroup label="── Copper Alloys ──">{COPPER_ALLOYS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
                </select>
                {panel && <>
                  <div className="crow"><span className="clabel">Type</span><span className="cval" style={{ color:panel.type==="ferrous"?"var(--fe)":panel.type==="copper_alloy"?"var(--cp)":"var(--nf)" }}>{panel.type==="copper_alloy"?"Cu-Alloy":panel.type}</span></div>
                  {Object.entries(panel.properties).map(([k,v]) => (
                    <div key={k} className="crow"><span className="clabel">{k}</span><span className="cval">{v}</span></div>
                  ))}
                  <div style={{ marginTop:".7rem", padding:"8px", background:"var(--s2)", borderRadius:4, fontSize:".8rem", color:"var(--mu)", lineHeight:1.5 }}>{panel.desc}</div>
                  <div style={{ marginTop:".6rem" }}>
                    <div style={{ fontSize:".65rem", color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:".3rem", fontFamily:"'Share Tech Mono',monospace" }}>Key Uses</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:".3rem" }}>
                      {panel.uses.map(u => <span key={u} className="uchip">{u}</span>)}
                    </div>
                  </div>
                  {panel && (
                    <div style={{ marginTop:".7rem" }}>
                      <MicrostructureSVG metalId={panel.id} width={260} height={90} />
                    </div>
                  )}
                </>}
              </div>
            ))}
          </div>
          {metalA && metalB && (
            <div style={{ background:"var(--s1)", border:"1px solid var(--bd)", borderRadius:8, padding:"1.1rem", marginBottom:"2rem" }}>
              <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"1rem", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", color:"var(--am)", marginBottom:".8rem" }}>Key Differences</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:".6rem" }}>
                {[
                  { l:"Iron Content", a:metalA.type==="ferrous"?"Contains Iron":"No Iron", b:metalB.type==="ferrous"?"Contains Iron":"No Iron" },
                  { l:"Magnetic", a:metalA.type==="ferrous"?"Usually Yes":"Usually No", b:metalB.type==="ferrous"?"Usually Yes":"Usually No" },
                  { l:"Density", a:metalA.properties["Density"]||"—", b:metalB.properties["Density"]||"—" },
                  { l:"Melting Point", a:metalA.properties["Melting Point"]||"—", b:metalB.properties["Melting Point"]||"—" },
                ].map(row => (
                  <div key={row.l} style={{ background:"var(--s2)", border:"1px solid var(--bd)", borderRadius:5, padding:"9px 11px" }}>
                    <div style={{ fontSize:".63rem", color:"var(--mu)", textTransform:"uppercase", letterSpacing:".08em", fontFamily:"'Share Tech Mono',monospace", marginBottom:"5px" }}>{row.l}</div>
                    <div style={{ fontSize:".8rem" }}>
                      <span style={{ color:"var(--fe)" }}>{metalA.name.split(" ")[0]}: <strong style={{ color:"var(--tx)" }}>{row.a}</strong></span>
                      <span style={{ color:"var(--mu)", margin:"0 .4rem" }}>|</span>
                      <span style={{ color:"var(--nf)" }}>{metalB.name.split(" ")[0]}: <strong style={{ color:"var(--tx)" }}>{row.b}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>}

        {/* ══ QUIZ TAB ══ */}
        {tab === "quiz" && (
          <div className="qwrap">
            <div className="sh"><span className="stag tfe">Quiz</span><span className="stitle">Test Your Knowledge</span></div>
            {!quizStarted ? (
              <div className="qlobb">
                <div className="sbar">
                  <input
                    className="sinput"
                    placeholder="Search questions by keyword..."
                    value={quizSearch}
                    onChange={e => setQuizSearch(e.target.value)}
                  />
                </div>
                <div className="fbtns" style={{ marginBottom:"1rem" }}>
                  {[["all","All Metals"],["ferrous","Ferrous"],["nonferrous","Non-Ferrous"],["copper_alloy","Cu-Alloys"]].map(([val, label]) => (
                    <button key={val} className={`fbtn ${quizMetalFilter===val?"active":""}`} onClick={() => setQuizMetalFilter(val)}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="qlobb-meta">
                  <span className="qlobb-count">{filteredQuizPool.length}</span>
                  <span className="qlobb-label"> question{filteredQuizPool.length !== 1 ? "s" : ""} match your filter</span>
                </div>
                <button className="qnxt" onClick={startQuiz} disabled={filteredQuizPool.length === 0}
                  style={{ maxWidth:280, margin:"1.2rem auto 0", opacity: filteredQuizPool.length === 0 ? .4 : 1 }}>
                  {filteredQuizPool.length === 0 ? "No Questions Match" : `Start Quiz — ${Math.min(filteredQuizPool.length, 12)} Questions →`}
                </button>
              </div>
            ) : !quizState.done ? <>
              <div className="qprog">
                <div className="qpbar"><div className="qpfill" style={{ width:`${(quizState.idx/totalQ)*100}%` }} /></div>
                <span className="qptxt">{quizState.idx}/{totalQ}</span>
                <span className="qptxt" style={{ color:"var(--am)" }}>Score: {quizState.score}</span>
              </div>
              <div className="qcard">
                <div className="qcat">Question {quizState.idx + 1} of {totalQ}</div>
                <div className="qq">{currentQ.q}</div>
                <div className="qopts">
                  {currentQ.opts.map((opt, i) => {
                    let cls = "qopt";
                    if (quizState.sel !== null) {
                      if (i === currentQ.ans) cls += " correct";
                      else if (i === quizState.sel) cls += " wrong";
                      else cls += " reveal";
                    }
                    return (
                      <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={quizState.sel !== null}>
                        <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".75rem", marginRight:7, opacity:.5 }}>{String.fromCharCode(65+i)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizState.sel !== null && <>
                  <div className={`qfb ${quizState.sel===currentQ.ans?"ok":"ng"}`}>
                    <strong>{quizState.sel===currentQ.ans?"✓ Correct! ":"✗ Incorrect. "}</strong>{currentQ.exp}
                  </div>
                  <button className="qnxt" onClick={nextQ}>
                    {quizState.idx + 1 >= totalQ ? "View Results →" : "Next Question →"}
                  </button>
                </>}
              </div>
            </> : (
              <div className="score-card">
                <div className="score-big">{finalScore}/{totalQ}</div>
                <div className="score-lbl">Questions Correct — {Math.round(finalScore/totalQ*100)}%</div>
                <div className="score-msg">{scoreMsg(finalScore)}</div>
                <button className="qnxt" style={{ maxWidth:250, margin:"0 auto" }} onClick={startQuiz}>Retake Quiz</button>
                <button onClick={resetQuiz} style={{ display:"block", margin:".7rem auto 0", background:"none", border:"1px solid var(--bd)", borderRadius:4, color:"var(--mu)", padding:"7px 20px", fontFamily:"'Rajdhani',sans-serif", fontSize:".8rem", letterSpacing:".07em", cursor:"pointer", textTransform:"uppercase" }}>
                  Change Filter →
                </button>
                <button onClick={() => setTab("progress")} style={{ display:"block", margin:".5rem auto 0", background:"none", border:"1px solid var(--bd)", borderRadius:4, color:"var(--mu)", padding:"7px 20px", fontFamily:"'Rajdhani',sans-serif", fontSize:".8rem", letterSpacing:".07em", cursor:"pointer", textTransform:"uppercase" }}>
                  View Progress →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ PROGRESS TAB ══ */}
        {tab === "progress" && <>
          <div className="sh"><span className="stag tgn">Progress</span><span className="stitle">Your Learning Journey</span></div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:".7rem", marginBottom:"1.5rem" }}>
            {[
              { n: progress.quizHistory.length, l:"Quizzes Taken" },
              { n:`${overallPct}%`, l:"Overall Score" },
              { n: progress.totalCorrect, l:"Correct Answers" },
              { n: progress.studied.length, l:"Metals Studied" },
              { n: progress.badges.length, l:"Badges Earned" },
            ].map(s => (
              <div key={s.l} className="stat-card">
                <div className="stat-big">{s.n}</div>
                <div className="stat-sub">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div className="sh"><span className="stag tam">Badges</span><span className="stitle">Achievements</span></div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:".4rem", marginBottom:"1.5rem" }}>
            {Object.entries(BADGE_INFO).map(([id, b]) => (
              <span key={id} className="badge-chip" style={{ opacity: progress.badges.includes(id) ? 1 : 0.3 }}>
                {b.icon} {b.label} {progress.badges.includes(id) ? "✓" : "🔒"}
              </span>
            ))}
          </div>

          {/* Metals studied grid */}
          <div className="sh"><span className="stag tgn">Coverage</span><span className="stitle">Metals Studied</span></div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:".5rem", marginBottom:"1.5rem" }}>
            {ALL_METALS.map(m => {
              const done = progress.studied.includes(m.id);
              return (
                <div key={m.id} onClick={() => { toggle(m.id); setTab("learn"); }}
                  style={{ background:"var(--s1)", border:`1px solid ${done?"rgba(64,200,112,.4)":"var(--bd)"}`, borderRadius:5, padding:"7px 9px", cursor:"pointer", display:"flex", alignItems:"center", gap:".45rem", opacity:done?1:0.5, transition:"all .15s" }}>
                  <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".82rem", color:m.type==="ferrous"?"var(--fe)":"var(--nf)", minWidth:28 }}>{m.symbol}</span>
                  <span style={{ fontSize:".76rem", color:done?"var(--tx)":"var(--mu)" }}>{m.name}</span>
                  {done && <span style={{ marginLeft:"auto", color:"var(--gn)", fontSize:".62rem" }}>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Quiz history */}
          <div className="sh"><span className="stag tgn">History</span><span className="stitle">Quiz History</span></div>
          {progress.quizHistory.length > 0 ? (
            <div style={{ background:"var(--s1)", border:"1px solid var(--bd)", borderRadius:8, padding:".9rem", marginBottom:"1.3rem" }}>
              {[...progress.quizHistory].reverse().slice(0, 12).map((h, i) => {
                const pct = Math.round(h.score / h.total * 100);
                return (
                  <div key={i} className="hist-row">
                    <span className="hist-score" style={{ color:pct>=80?"var(--gn)":pct>=60?"var(--am)":"var(--rd)" }}>{h.score}/{h.total}</span>
                    <div className="hist-pct" style={{ background:pct>=80?"rgba(64,200,112,.1)":pct>=60?"rgba(240,168,32,.1)":"rgba(224,64,64,.1)", color:pct>=80?"var(--gn)":pct>=60?"var(--am)":"var(--rd)" }}>{pct}%</div>
                    <div style={{ flex:1, height:4, background:"var(--bd)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:pct>=80?"var(--gn)":pct>=60?"var(--am)":"var(--rd)", borderRadius:2, transition:"width .4s" }} />
                    </div>
                    <span className="hist-date">{h.date}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"2.5rem", color:"var(--mu)" }}>
              <div style={{ fontSize:"2rem", marginBottom:".8rem" }}>📊</div>
              No quiz history yet.
              <button className="qnxt" style={{ maxWidth:200, margin:"1.2rem auto 0" }} onClick={() => setTab("quiz")}>Take a Quiz →</button>
            </div>
          )}

          {progress.quizHistory.length > 0 && (
            <button onClick={() => { if (window.confirm("Reset all progress? This cannot be undone.")) saveProgress(initP()); }}
              style={{ background:"none", border:"1px solid rgba(224,64,64,.3)", borderRadius:4, color:"var(--rd)", padding:"6px 14px", fontFamily:"'Rajdhani',sans-serif", fontSize:".77rem", letterSpacing:".06em", cursor:"pointer", textTransform:"uppercase" }}>
              Reset All Progress
            </button>
          )}
        </>}

      </main>
    </div>
  );
}

// ─── METAL CARD ───────────────────────────────────────────────────────────────
function MetalCard({ metal, expanded, onToggle, level, studied }) {
  return (
    <div className={`mcard ${metal.type}${expanded?" exp":""}`}>
      {studied && <div className="studied-dot">✓</div>}
      <div className="ctop">
        <span className="msym">{metal.symbol}</span>
        <span className={`cbadge ${metal.type==="ferrous"?"tfe":metal.type==="copper_alloy"?"tcp":"tnf"}`}>{metal.type==="copper_alloy"?"Cu-Alloy":metal.type}</span>
      </div>
      <div className="mname">{metal.name}</div>
      <div className="msub">{metal.subtitle}</div>
      <div className="mdesc">{level==="student" ? (metal.studentNote || metal.desc) : metal.desc}</div>
      <div className="ulist">{metal.uses.slice(0, 4).map(u => <span key={u} className="uchip">{u}</span>)}</div>
      <button className="xbtn" onClick={() => onToggle(metal.id)}>
        {expanded ? "▲ Collapse" : "▼ Microstructure, Properties, Grades & Mill Role"}
      </button>
      {expanded && (
        <div className="det">
          <h4>Microstructure Visualization</h4>
          <MicrostructureSVG metalId={metal.id} width={260} height={105} />

          <h4>Physical Properties</h4>
          <div className="pgrid">
            {Object.entries(metal.properties).map(([k,v]) => (
              <div key={k} className="pi"><div className="plabel">{k}</div><div className="pval">{v}</div></div>
            ))}
          </div>

          {level !== "student" && <>
            <h4 style={{ marginTop:".6rem" }}>Grades & Standards</h4>
            <div className="ginfo">{metal.grades}</div>
          </>}

          <h4>Steel Mill Role</h4>
          <div className="ginfo" style={{ borderLeftColor:"var(--ml)", marginBottom:0 }}>{metal.millRole}</div>
        </div>
      )}
    </div>
  );
}
