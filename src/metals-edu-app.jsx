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
  --fe:#c44820; --nf:#0878a0; --ml:#7840b8; --gn:#208048; --rd:#c83030; --cp:#a06828; --sc:#4e7840;
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
.tsc{background:rgba(78,120,64,.09);color:var(--sc);border:1px solid rgba(78,120,64,.3);}
.stitle{font-family:'Rajdhani',sans-serif;font-size:1.2rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--tx);}

/* CARDS */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:1rem;margin-bottom:2.5rem;}
.mcard{background:var(--s1);border:1px solid var(--bd);border-radius:12px;padding:1.1rem;transition:all .25s;position:relative;overflow:hidden;box-shadow:var(--shadow-sm);}
.mcard-img{display:block;width:calc(100% + 2.2rem);margin:-1.1rem -1.1rem .9rem;height:152px;object-fit:cover;flex-shrink:0;}
.mcard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;z-index:1;}
.mcard.ferrous::before{background:linear-gradient(90deg,var(--fe) 0%,rgba(196,72,32,0) 75%);}
.mcard.nonferrous::before{background:linear-gradient(90deg,var(--nf) 0%,rgba(8,120,160,0) 75%);}
.mcard.copper_alloy::before{background:linear-gradient(90deg,var(--cp) 0%,rgba(160,104,40,0) 75%);}
.mcard.scrap::before{background:linear-gradient(90deg,var(--sc) 0%,rgba(78,120,64,0) 75%);}
.mcard.ferrous:hover{border-color:rgba(196,72,32,.35);box-shadow:0 6px 24px rgba(196,72,32,.10),var(--shadow-md);background:var(--s2);}
.mcard.nonferrous:hover{border-color:rgba(8,120,160,.35);box-shadow:0 6px 24px rgba(8,120,160,.10),var(--shadow-md);background:var(--s2);}
.mcard.copper_alloy:hover{border-color:rgba(160,104,40,.35);box-shadow:0 6px 24px rgba(160,104,40,.10),var(--shadow-md);background:var(--s2);}
.mcard.scrap:hover{border-color:rgba(78,120,64,.35);box-shadow:0 6px 24px rgba(78,120,64,.10),var(--shadow-md);background:var(--s2);}
.mcard.scrap .msym{color:var(--sc);}
.mcard.scrap.exp{border-color:rgba(78,120,64,.45);}
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
/* HEAT TREAT */
.ht-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;margin-bottom:2rem;}
.ht-card{background:var(--s1);border:1px solid var(--bd);border-radius:12px;overflow:hidden;box-shadow:var(--shadow-sm);transition:all .25s;position:relative;}
.ht-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--or) 0%,rgba(217,108,12,0) 75%);}
.ht-card:hover{border-color:rgba(217,108,12,.35);box-shadow:0 6px 24px rgba(217,108,12,.10),var(--shadow-md);}
.ht-head{padding:.95rem 1.1rem .6rem;border-bottom:1px solid var(--bd);background:rgba(217,108,12,.03);}
.ht-icon{font-size:1.5rem;margin-bottom:.3rem;}
.ht-title{font-family:'Rajdhani',sans-serif;font-size:1.05rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--tx);margin-bottom:.1rem;}
.ht-sub{font-size:.73rem;color:var(--mu);margin-bottom:.3rem;}
.ht-temp{font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--or);letter-spacing:.06em;}
.ht-body{padding:.9rem 1.1rem;}
.ht-desc{font-size:.87rem;color:#354840;line-height:1.6;margin-bottom:.75rem;}
.ht-chips{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.75rem;}
.ht-chip{font-size:.7rem;padding:3px 9px;border-radius:20px;background:rgba(217,108,12,.07);color:var(--or);border:1px solid rgba(217,108,12,.22);}
.ht-note{font-size:.82rem;color:#2e4438;line-height:1.55;background:rgba(217,108,12,.04);border-left:3px solid var(--or);padding:8px 12px;border-radius:0 7px 7px 0;}
.ht-phases{display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:.75rem;}
.ht-phase{background:var(--s2);border:1px solid var(--bd);border-radius:7px;padding:7px 10px;}
.ht-plabel{font-size:.63rem;color:var(--mu);text-transform:uppercase;letter-spacing:.08em;font-family:'Share Tech Mono',monospace;margin-bottom:2px;}
.ht-pval{font-size:.84rem;color:var(--tx);font-weight:500;}
/* GLOSSARY */
.glo-bar{display:flex;gap:.7rem;margin-bottom:1.2rem;flex-wrap:wrap;align-items:center;}
.glo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:.75rem;margin-bottom:2rem;}
.glo-card{background:var(--s1);border:1px solid var(--bd);border-radius:10px;padding:.95rem 1.1rem;box-shadow:var(--shadow-sm);}
.glo-term{font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--tx);margin-bottom:.2rem;}
.glo-cat{font-family:'Share Tech Mono',monospace;font-size:.6rem;letter-spacing:.12em;padding:2px 7px;border-radius:10px;text-transform:uppercase;font-weight:700;display:inline-block;margin-bottom:.5rem;}
.glo-def{font-size:.85rem;color:#354840;line-height:1.6;}
.glo-cat.micro{background:rgba(8,120,160,.09);color:var(--nf);border:1px solid rgba(8,120,160,.25);}
.glo-cat.mech{background:rgba(196,72,32,.08);color:var(--fe);border:1px solid rgba(196,72,32,.25);}
.glo-cat.process{background:rgba(120,64,184,.08);color:var(--ml);border:1px solid rgba(120,64,184,.25);}
.glo-cat.steel{background:rgba(160,120,0,.08);color:var(--am);border:1px solid rgba(160,120,0,.25);}
.glo-cat.scrap{background:rgba(78,120,64,.08);color:var(--sc);border:1px solid rgba(78,120,64,.25);}
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
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Pig_iron.jpg/330px-Pig_iron.jpg",
    micro:"ferrite_graphite" },
  { id:"carbon-steel", symbol:"CS", name:"Carbon Steel", subtitle:"Iron + Carbon Alloy", type:"ferrous",
    desc:"The most widely used engineering material. Carbon content (0.05–2.0%) controls hardness, strength, and weldability. Low-carbon is soft and formable; high-carbon is hard and wear-resistant.",
    uses:["Structural Beams","Automotive Bodies","Pipelines","Tools","Rail","Wire"],
    properties:{"Carbon Content":"0.05–2.0%","Melting Point":"~1425°C","Tensile Strength":"400–2000 MPa","Density":"7.85 g/cm³"},
    grades:"Low-carbon (1008–1025): structural, stampings. Medium (1030–1060): gears, shafts. High (1080–1095): springs, blades. Common grades: AISI 1018, 1045, 1095.",
    millRole:"Primary output of BOF and EAF steelmaking. Cast into slabs/blooms then rolled in hot strip mills or plate mills into final product.",
    studentNote:"More carbon = harder but more brittle. Less carbon = softer but easier to weld and form.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/A_bunch_of_rebar.jpg/330px-A_bunch_of_rebar.jpg",
    micro:"pearlite_ferrite" },
  { id:"stainless-steel", symbol:"SS", name:"Stainless Steel", subtitle:"Chromium Steel Alloy", type:"ferrous",
    desc:"Contains minimum 10.5% chromium, which forms a passive oxide layer that resists corrosion. Available in austenitic, ferritic, martensitic, and duplex families.",
    uses:["Food Equipment","Medical Devices","Chemical Plants","Architecture","Cutlery","Fasteners"],
    properties:{"Chromium":"10.5–26%","Melting Point":"~1400°C","Tensile Strength":"485–1800 MPa","Corrosion":"Excellent"},
    grades:"304/316: Austenitic (most common). 410/420: Martensitic (cutlery, tools). 430: Ferritic (automotive trim). 2205: Duplex (pressure vessels).",
    millRole:"Produced in AOD (Argon Oxygen Decarburization) vessels. Requires careful carbon reduction to avoid carbide precipitation.",
    studentNote:"The chromium acts like an invisible shield — oxygen in air reacts with chromium first, forming a protective skin over the iron.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Besteck_WMF_Stockholm_ca_1960er.jpg/330px-Besteck_WMF_Stockholm_ca_1960er.jpg",
    micro:"austenite" },
  { id:"cast-iron", symbol:"CI", name:"Cast Iron", subtitle:"High-Carbon Iron", type:"ferrous",
    desc:"Carbon content above 2.1% makes this too brittle to roll or forge — but it pours well and is excellent under compression. Gray, white, ductile, and malleable variants each have distinct properties.",
    uses:["Engine Blocks","Brake Rotors","Cookware","Pipe Fittings","Machine Bases","Pump Housings"],
    properties:{"Carbon Content":"2.1–4.5%","Melting Point":"~1200°C","Compressive Strength":"570–1800 MPa","Machinability":"Good"},
    grades:"Gray: graphite flakes, good vibration damping. White: hard, wear-resistant. Ductile (nodular): tougher, bendable. Malleable: heat-treated for ductility.",
    millRole:"Used for mill rolls, bearing housings, and equipment bases throughout the plant due to vibration damping and compressive strength.",
    studentNote:"Cast iron is like over-carbonized steel — the extra carbon forms graphite flakes that are great for frying pans and engine blocks!",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Cast-Iron-Pan.jpg/330px-Cast-Iron-Pan.jpg",
    micro:"gray_iron" },
  { id:"alloy-steel", symbol:"AS", name:"Alloy Steel", subtitle:"Multi-Element Steel", type:"ferrous",
    desc:"Carbon steel with deliberate additions of chromium, nickel, molybdenum, vanadium, or manganese to enhance specific properties like hardenability, toughness, or creep resistance.",
    uses:["Gears","Crankshafts","Pressure Vessels","High-Strength Bolts","Drill Pipe","Springs"],
    properties:{"Alloying Elements":"Cr, Ni, Mo, V, Mn","Tensile Strength":"600–1800 MPa","Hardenability":"Excellent","Toughness":"High"},
    grades:"4140 (Cr-Mo): gears, axles. 4340 (Ni-Cr-Mo): aircraft parts. 8620: case-hardening. 52100: bearings.",
    millRole:"Produced in EAF with precise ladle metallurgy additions. Requires controlled cooling in bar/rod mills.",
    studentNote:"Think of alloying elements as 'ingredients' — each adds a different property. Chromium adds corrosion resistance; nickel adds toughness.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/%D0%90%D1%80%D0%BC%D0%B0%D1%82%D1%83%D1%80%D0%BD%D1%8B%D0%B9_%D0%BF%D1%80%D0%BE%D0%BA%D0%B0%D1%82.jpg/330px-%D0%90%D1%80%D0%BC%D0%B0%D1%82%D1%83%D1%80%D0%BD%D1%8B%D0%B9_%D0%BF%D1%80%D0%BE%D0%BA%D0%B0%D1%82.jpg",
    micro:"bainite" },
  { id:"tool-steel", symbol:"TS", name:"Tool Steel", subtitle:"Hardened Working Steel", type:"ferrous",
    desc:"Highly alloyed steels designed to cut, shape, or form other materials. Must maintain hardness at elevated temperatures and resist wear, deformation, and shock.",
    uses:["Cutting Tools","Dies","Punches","Drill Bits","Molds","Mill Rolls"],
    properties:{"Hardness":"60–68 HRC","Hot Hardness":"Excellent","Wear Resistance":"High","Toughness":"Moderate"},
    grades:"H13: hot work dies. D2: cold work dies. M2: high-speed cutting. W1: water-hardening files. A2: air-hardening.",
    millRole:"Used in rolling mill work rolls, edger rolls, and hot-work tooling. H13 contacts 1000°C+ steel.",
    studentNote:"Tool steels are the 'tools that make everything else.' An M2 drill bit stays hard because tungsten and molybdenum keep it hard when hot.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Drillbits.jpg/330px-Drillbits.jpg",
    micro:"martensite" },
  { id:"wrought-iron", symbol:"WI", name:"Wrought Iron", subtitle:"Slag-Containing Iron", type:"ferrous",
    desc:"Nearly pure iron (<0.1% C) with slag inclusions (fibrous silicates) that give it a fibrous, wood-like grain. Highly ductile and corrosion resistant. Largely replaced by steel but still used in decorative work.",
    uses:["Decorative Gates","Railings","Historical Structures","Anchors","Chain Links","Ornamental Work"],
    properties:{"Carbon Content":"<0.1%","Tensile Strength":"~340 MPa","Ductility":"Very High","Corrosion":"Good"},
    grades:"Wrought iron is not graded in modern standards. Historical puddled iron vs. modern wrought iron differ in slag content.",
    millRole:"Predates modern steelmaking. The slag inclusions actually make wrought iron more corrosion-resistant than early steels — used in historic bridges still standing today.",
    studentNote:"Think of wrought iron like wood — it has a grain due to slag fibers, can be shaped by a blacksmith, and doesn't rust as fast as plain iron.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Balcon_d%27un_immeuble_parisien.jpg/330px-Balcon_d%27un_immeuble_parisien.jpg",
    micro:"ferrite_slag" },
  { id:"maraging-steel", symbol:"MS", name:"Maraging Steel", subtitle:"Ultra-High Strength Steel", type:"ferrous",
    desc:"Ultra-low-carbon steel (< 0.03% C) hardened by precipitation of intermetallic compounds rather than carbon. Achieves tensile strengths >2000 MPa with reasonable toughness. Marage = martensite + aging.",
    uses:["Aerospace Structures","Rocket Motor Casings","Tooling","Injection Mold Tooling","Centrifuge Rotors","Premium Sports Equipment"],
    properties:{"Tensile Strength":">2000 MPa","Carbon":"<0.03%","Nickel Content":"17–19%","Heat Treatment":"Aging at 480°C"},
    grades:"Grade 200, 250, 300, 350 (MPa yield strength). C300 is most common: 18Ni-8.5Co-4.8Mo-0.4Ti.",
    millRole:"Used in precision tooling, mold inserts, and high-stress components. Valued for high polishability and dimensional stability during aging treatment.",
    studentNote:"Maraging steel gets hard through a completely different mechanism than regular steel — not carbon, but tiny metal 'needles' that form during low-temperature aging.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/RS-68_rocket_engine_test.jpg/330px-RS-68_rocket_engine_test.jpg",
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
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Aluminium-4.jpg/330px-Aluminium-4.jpg",
    micro:"aluminum_grains" },
  { id:"copper", symbol:"Cu", name:"Copper", subtitle:"Premier Electrical Conductor", type:"nonferrous",
    desc:"The best practical electrical and thermal conductor after silver. Antimicrobial, highly ductile, and naturally soft. The basis of brass (Cu-Zn) and bronze (Cu-Sn) alloys.",
    uses:["Electrical Wiring","Heat Exchangers","Plumbing","Motors","Printed Circuits","Roofing"],
    properties:{"Density":"8.96 g/cm³","Melting Point":"1085°C","Conductivity":"100% IACS","Ductility":"Excellent"},
    grades:"C11000: electrolytic tough pitch (wiring). C10100: oxygen-free (electronics). C26000: cartridge brass. C51000: phosphor bronze.",
    millRole:"Mold copper plates are the inner lining of continuous casters — copper's thermal conductivity rapidly solidifies molten steel into slabs.",
    studentNote:"Copper's IACS rating is the baseline for electrical conductivity — it IS 100%. Everything else is measured relative to copper.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/NatCopper.jpg/330px-NatCopper.jpg",
    micro:"copper_grains" },
  { id:"nickel", symbol:"Ni", name:"Nickel", subtitle:"Corrosion & Heat Resistant", type:"nonferrous",
    desc:"Silvery-white metal with excellent corrosion resistance, especially in alkaline environments. A critical alloying element in stainless steel. Superalloys based on nickel operate above 1000°C.",
    uses:["Stainless Steel Alloying","Jet Engines","Chemical Plant Equipment","Batteries","Electroplating","Coinage"],
    properties:{"Density":"8.9 g/cm³","Melting Point":"1455°C","Tensile Strength":"317–1800 MPa","Magnetic":"Yes (weakly)"},
    grades:"Commercially pure Ni (200/201). Monel (Ni-Cu): seawater. Inconel 625/718: jet engines. Hastelloy C: chemical processing.",
    millRole:"Critical alloying addition in austenitic stainless steels and high-nickel alloys used in pickling tanks and acid-resistant piping.",
    studentNote:"Without nickel, jet engines couldn't operate at today's temperatures. Nickel superalloys exceed their nominal melting point using cooling holes.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Nickel_electrolytic_and_1cm3_cube.jpg/330px-Nickel_electrolytic_and_1cm3_cube.jpg",
    micro:"nickel_grains" },
  { id:"titanium", symbol:"Ti", name:"Titanium", subtitle:"Strength-to-Weight Champion", type:"nonferrous",
    desc:"Best strength-to-weight ratio of any structural metal. Biocompatible, corrosion-resistant in seawater and body fluids, and maintains strength at moderately high temperatures.",
    uses:["Aerospace Frames","Medical Implants","Offshore Platforms","Sporting Equipment","Jet Engine Discs","Desalination Plants"],
    properties:{"Density":"4.5 g/cm³","Melting Point":"1668°C","Tensile Strength":"240–1400 MPa","Biocompatibility":"Excellent"},
    grades:"Grade 1-4: commercially pure. Ti-6Al-4V (Grade 5): aerospace workhorse. Beta alloys: high-strength fasteners.",
    millRole:"Used as a microalloying addition in ultra-low-carbon (ULC) steels for automotive deep-drawing applications.",
    studentNote:"Ti-6Al-4V is one of engineering's most successful alloys — hip replacements, bicycle frames, aircraft, and watches all use it.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Titan-crystal_bar.JPG/330px-Titan-crystal_bar.JPG",
    micro:"titanium_grains" },
  { id:"zinc", symbol:"Zn", name:"Zinc", subtitle:"Galvanizing & Alloying Metal", type:"nonferrous",
    desc:"Primarily used to galvanize (coat) steel for corrosion protection. When zinc contacts steel, it acts as a sacrificial anode — it corrodes instead of the steel beneath it.",
    uses:["Galvanizing Steel","Die Casting","Brass Production","Batteries","Roof Sheeting","Sunscreen"],
    properties:{"Density":"7.1 g/cm³","Melting Point":"420°C","Tensile Strength":"~200 MPa","Corrosion":"Self-Sacrificing"},
    grades:"Special High Grade (SHG): 99.995% pure for galvanizing. Zamak alloys: die casting. Brass (Cu-Zn): various compositions.",
    millRole:"Hot-dip galvanizing lines are a major product at flat-rolled steel mills. Strip passes through molten zinc at ~450°C.",
    studentNote:"Zinc's sacrificial protection is electrochemical — zinc has a more negative electrode potential than iron, so it 'wants' to corrode first.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Zinc_fragment_sublimed_and_1cm3_cube.jpg/330px-Zinc_fragment_sublimed_and_1cm3_cube.jpg",
    micro:"zinc_grains" },
  { id:"lead", symbol:"Pb", name:"Lead", subtitle:"Dense & Radiation-Shielding", type:"nonferrous",
    desc:"Extremely dense, soft metal with a very low melting point. Excellent for radiation shielding, vibration damping, and sound attenuation. Now largely replaced in many applications due to toxicity.",
    uses:["Radiation Shielding","Batteries","Ballast Weights","Soundproofing","Shot/Ammunition","Cable Sheathing"],
    properties:{"Density":"11.3 g/cm³","Melting Point":"327°C","Tensile Strength":"~17 MPa","Flexibility":"Very Soft"},
    grades:"Chemical lead (99.9%): chemical plant. Antimonial lead: batteries. Terne (Pb-Sn): roofing.",
    millRole:"Historically added to free-machining steel to improve machinability. Largely phased out. Lead lining protects x-ray rooms in mill labs.",
    studentNote:"Lead's density (2x iron!) makes it an excellent radiation blocker — dense atomic nuclei intercept x-rays and gamma rays.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Lead_electrolytic_and_1cm3_cube.jpg/330px-Lead_electrolytic_and_1cm3_cube.jpg",
    micro:"lead_grains" },
  { id:"tungsten", symbol:"W", name:"Tungsten", subtitle:"Highest Melting Point Metal", type:"nonferrous",
    desc:"Tungsten has the highest melting point of all metals (3422°C) and highest tensile strength at elevated temperatures. Extremely dense and hard. Used where nothing else survives.",
    uses:["Cutting Tool Tips","Light Bulb Filaments","X-ray Targets","Armor Piercing Rounds","Rocket Nozzles","Electrical Contacts"],
    properties:{"Density":"19.3 g/cm³","Melting Point":"3422°C","Tensile Strength":"550–3500 MPa","Hardness":"7.5 Mohs"},
    grades:"W1 (pure): electrical contacts. WC (tungsten carbide): cutting tools and wear parts. W-Ni-Fe: radiation shielding and ballast.",
    millRole:"Tungsten carbide (WC-Co) is the primary material for rolling mill guide inserts, edger rolls, and wear-resistant tooling throughout the mill.",
    studentNote:"Tungsten's melting point (3422°C) is so high it doesn't melt until you're almost halfway to the surface temperature of the sun!",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Wolfram_evaporated_crystals_and_1cm3_cube.jpg/330px-Wolfram_evaporated_crystals_and_1cm3_cube.jpg",
    micro:"tungsten_grains" },
  { id:"magnesium", symbol:"Mg", name:"Magnesium", subtitle:"Lightest Structural Metal", type:"nonferrous",
    desc:"The lightest structural metal at 1.74 g/cm³ — only 2/3 the density of aluminum. Good specific strength, naturally abundant, but highly flammable in fine powder form. Critical in steelmaking as a desulfurizer.",
    uses:["Automotive Housings","Laptop Cases","Bicycle Frames","Camera Bodies","Steelmaking Desulfurization","Aerospace Gearboxes"],
    properties:{"Density":"1.74 g/cm³","Melting Point":"650°C","Tensile Strength":"160–350 MPa","Flammability":"High (powder)"},
    grades:"AZ31 (Al-Zn): wrought sheet. AZ91: die casting. AM60: automotive. WE43: high-temp aerospace.",
    millRole:"Magnesium-lime (KR process) or magnesium cored wire injection is used in ladle desulfurization to reduce sulfur in liquid steel to <0.001%.",
    studentNote:"Magnesium burns with a brilliant white light — it's even used in flares and fireworks. But as a solid alloy, it's perfectly safe and incredibly light.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/CSIRO_ScienceImage_2893_Crystalised_magnesium.jpg/330px-CSIRO_ScienceImage_2893_Crystalised_magnesium.jpg",
    micro:"magnesium_grains" },
  { id:"cobalt", symbol:"Co", name:"Cobalt", subtitle:"Superalloy & Battery Metal", type:"nonferrous",
    desc:"Hard, magnetic metal with high melting point. Critical in superalloys (jet engines), cutting tools (WC-Co), battery cathodes (Li-Co), and permanent magnets. Strongly magnetic below 1115°C.",
    uses:["Jet Engine Superalloys","Lithium-Ion Batteries","Cutting Tools (WC-Co)","Permanent Magnets","Hard Facing","Medical Implants"],
    properties:{"Density":"8.9 g/cm³","Melting Point":"1495°C","Tensile Strength":"760–1000 MPa","Magnetic":"Yes (Curie: 1115°C)"},
    grades:"Commercially pure Co. Stellite (Co-Cr-W): wear-resistant hard-facing. MAR-M 509: superalloy. Li-Co oxide: battery cathode.",
    millRole:"Cobalt-based hard-facing alloys (Stellite) are applied to valve seats, wear plates, and guides in hot strip mills and continuous casting areas.",
    studentNote:"Cobalt is in nearly every smartphone battery (as LiCoO₂) and in the alloys that keep jet engines spinning at 1400°C. One metal, two very different worlds.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Kobalt_electrolytic_and_1cm3_cube.jpg/330px-Kobalt_electrolytic_and_1cm3_cube.jpg",
    micro:"cobalt_grains" },
  { id:"tin", symbol:"Sn", name:"Tin", subtitle:"Coating & Soldering Metal", type:"nonferrous",
    desc:"Low-melting, corrosion-resistant metal. At room temperature, tin exists as white β-tin; below 13°C it slowly converts to gray α-tin (tin pest). Critical for food cans (tin plate) and soldering.",
    uses:["Tin-Plated Food Cans","Solder","Bronze Alloys","Bearing Alloys (Babbitt)","Organ Pipes","Anti-fouling Paints"],
    properties:{"Density":"7.3 g/cm³","Melting Point":"232°C","Tensile Strength":"~15 MPa","Allotropes":"White (β) & Gray (α)"},
    grades:"Grade A tin (99.85%): electrolytic tinplating. 63/37 Sn-Pb solder (melts at 183°C). Lead-free solder: Sn-Ag-Cu (SAC305).",
    millRole:"Electrolytic tinning lines coat cold-rolled strip with 1–11 g/m² of tin for food packaging. A major finishing line product in integrated steel mills.",
    studentNote:"The reason canned food stays fresh for years is a microscopic layer of tin — less than 0.001mm thick — that stops the steel from rusting and contaminating the food.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Sn-Alpha-Beta.jpg/330px-Sn-Alpha-Beta.jpg",
    micro:"tin_grains" },
  { id:"chromium", symbol:"Cr", name:"Chromium", subtitle:"Hardness & Corrosion Resistance", type:"nonferrous",
    desc:"Hard, lustrous, steel-grey metal. The defining element in stainless steel (corrosion resistance) and hard chromium plating (wear resistance). Also critical in superalloys for high-temperature strength.",
    uses:["Stainless Steel Alloying","Hard Chrome Plating","Superalloy Addition","Dye & Pigment Production","Leather Tanning","Decorative Plating"],
    properties:{"Density":"7.2 g/cm³","Melting Point":"1907°C","Tensile Strength":"~690 MPa","Hardness":"8.5 Mohs"},
    grades:"Electrolytic chromium (99.9%+). Ferrochromium (FeCr): steelmaking alloy addition. HC FeCr (high carbon) and LC FeCr (low carbon) grades.",
    millRole:"Added as ferrochromium (FeCr) in the ladle or furnace for stainless steel production. Also used in hard chrome plating of mill rolls for surface finish.",
    studentNote:"Chromium is what makes stainless steel 'stainless.' Without chromium, your kitchen knives and medical tools would rust within hours of contact with water.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Chromium_crystals_and_1cm3_cube.jpg/330px-Chromium_crystals_and_1cm3_cube.jpg",
    micro:"chromium_grains" },
  { id:"molybdenum", symbol:"Mo", name:"Molybdenum", subtitle:"High-Temp Strength Booster", type:"nonferrous",
    desc:"Refractory metal with very high melting point (2623°C). Dramatically improves high-temperature strength, creep resistance, and hardenability in steels at relatively low addition levels (0.15–5%).",
    uses:["High-Strength Steel Alloying","Catalysts (petroleum refining)","Heating Elements","Lubricant (MoS₂)","Aircraft Components","Chemical Reactors"],
    properties:{"Density":"10.2 g/cm³","Melting Point":"2623°C","Tensile Strength":"630–1500 MPa","Thermal Expansion":"Low"},
    grades:"Commercially pure Mo: heating elements. FeMo (ferromolybdenum): steel addition. MoS₂: solid lubricant for extreme conditions.",
    millRole:"Added as ferromolybdenum in ladle metallurgy for creep-resistant pressure vessel steels, pipeline steels, and high-speed tool steels. Also used in furnace heating elements.",
    studentNote:"MoS₂ (molybdenum disulfide) is a dry lubricant used in space because conventional oils freeze or evaporate in the vacuum. The same chemistry keeps drill bits from seizing at high speeds.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Molybdenum_crystaline_fragment_and_1cm3_cube.jpg/330px-Molybdenum_crystaline_fragment_and_1cm3_cube.jpg",
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
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Shell_Casings_-_Gun_Range_-_Brass_%2853371297223%29.jpg/330px-Shell_Casings_-_Gun_Range_-_Brass_%2853371297223%29.jpg",
    micro:"brass_grains" },
  { id:"phosphor-bronze", symbol:"Cu-Sn", name:"Phosphor Bronze", subtitle:"Cu-Sn-P Spring Alloy", type:"copper_alloy",
    desc:"Copper with 5% tin and up to 0.35% phosphorus. The phosphorus acts as a deoxidizer and strengthens the alloy. Outstanding spring properties, fatigue resistance, and corrosion resistance in seawater.",
    uses:["Electrical Connectors","Springs","Bearings","Ship Propellers","Diaphragms","Musical Instrument Strings"],
    properties:{"Copper Content":"~94.5%","Tin Content":"~5%","Tensile Strength":"300–900 MPa","Fatigue Resistance":"Excellent"},
    grades:"C51000 (5% Sn): spring wire. C52100 (8% Sn): heavy duty springs. C54400 (4% Sn + Pb): free-machining bearings. C90300: tin bronze castings.",
    millRole:"Phosphor bronze strip is drawn and annealed in specialty copper mills. Used in steel plant electrical panels, bus bar supports, and spring-loaded contact assemblies in instrumentation.",
    studentNote:"Phosphor bronze is what makes guitar strings vibrant — the tin gives rigidity, phosphorus adds strength, and copper provides the warm tone.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/1940s_warship_propeller.jpg/330px-1940s_warship_propeller.jpg",
    micro:"bronze_grains" },
  { id:"cupronickel", symbol:"Cu-Ni", name:"Cupronickel (90/10)", subtitle:"Marine Grade Cu-Ni Alloy", type:"copper_alloy",
    desc:"90% copper, 10% nickel with small additions of iron and manganese. Exceptional resistance to seawater corrosion and biofouling (marine organisms). Used wherever saltwater contact is unavoidable.",
    uses:["Marine Heat Exchangers","Seawater Piping","Coinage","Desalination Plants","Ship Hull Cladding","Offshore Oil Platforms"],
    properties:{"Copper Content":"90%","Nickel Content":"10%","Tensile Strength":"300–500 MPa","Seawater Corrosion":"Excellent"},
    grades:"C70600 (90/10): standard marine. C71500 (70/30): higher strength marine. C72200 (Cr-addition): improved erosion resistance. Used in UNS C70600, DIN 2.0872.",
    millRole:"Cupronickel tubes line the water-cooling circuits in continuous caster secondary cooling zones and are used in heat exchangers throughout the utility systems of a steel plant.",
    studentNote:"Cupronickel is why coins like US quarters and dimes feel the way they do — the silvery appearance comes from nickel, but most of the metal is copper.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Two_stacks_of_half_dollars%2C_one_silver%2C_one_clad_-_effects_of_the_Coinage_Act_1965.jpg/330px-Two_stacks_of_half_dollars%2C_one_silver%2C_one_clad_-_effects_of_the_Coinage_Act_1965.jpg",
    micro:"cupronickel_grains" },
  { id:"beryllium-copper", symbol:"Cu-Be", name:"Beryllium Copper", subtitle:"Highest Strength Cu Alloy", type:"copper_alloy",
    desc:"The strongest of all copper alloys: 1.7–2% beryllium in copper. After age hardening, it reaches tensile strengths over 1400 MPa while maintaining 60%+ of copper's conductivity. Non-sparking and non-magnetic.",
    uses:["High-Performance Springs","Aerospace Connectors","Non-Sparking Tools","Plastic Injection Molds","Precision Instruments","Oil/Gas Safety Tools"],
    properties:{"Beryllium Content":"1.7–2%","Tensile Strength":"700–1400 MPa","Conductivity":"~60% IACS","Hardness":"HRC 36–42 (aged)"},
    grades:"C17200 (1.9% Be): highest strength. C17000 (1.7% Be): balance of strength/conductivity. C17500 (0.6% Be + Co): high conductivity grade. Age hardened at 315°C.",
    millRole:"Beryllium copper molds and tools are used in non-sparking maintenance work in flammable gas atmospheres. Also used in precision sensor springs for ladle weighing systems.",
    studentNote:"Beryllium copper is a metallurgical paradox — it's as strong as steel but conducts electricity like a metal. The downside: beryllium dust is highly toxic, so machining requires strict safety controls.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Beryllium_Copper_Adjustable_Wrench.jpg/330px-Beryllium_Copper_Adjustable_Wrench.jpg",
    micro:"beryllium_copper_grains" },
  { id:"aluminum-bronze", symbol:"Cu-Al", name:"Aluminum Bronze", subtitle:"High-Strength Wear-Resistant", type:"copper_alloy",
    desc:"Copper alloyed with 5–12% aluminum, often with iron and nickel additions. Exceptional combination of strength, hardness, wear resistance, and corrosion resistance. Has a golden color resembling gold alloys.",
    uses:["Gears & Worm Wheels","Marine Propellers","Pump Impellers","Valve Seats","Bushings & Bearings","Offshore Structural Components"],
    properties:{"Aluminum Content":"5–12%","Tensile Strength":"500–900 MPa","Hardness":"130–250 HB","Corrosion":"Seawater Resistant"},
    grades:"C62400 (11% Al): high strength. C63000 (Al-Ni): nickel-aluminum bronze for propellers. C95400: cast aluminum bronze. C63200: marine grade with Ni addition.",
    millRole:"Aluminum bronze bushings and wear plates are used in continuous casting machine segments, pinch roll assemblies, and hot mill guide systems where corrosion and wear resistance are both needed.",
    studentNote:"Aluminum bronze looks like gold and is used in 'gold' medals and award statuettes — it's not actually gold, but it has the appearance, corrosion resistance, and wear resistance at a fraction of the price.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/AlubronzeCuAl20v500.png/330px-AlubronzeCuAl20v500.png",
    micro:"aluminum_bronze_grains" },
  { id:"naval-brass", symbol:"Cu-Zn-Sn", name:"Naval Brass", subtitle:"Marine-Grade Brass C46400", type:"copper_alloy",
    desc:"A dezincification-resistant brass: 60% copper, 39.25% zinc, 0.75% tin. The tin addition greatly improves resistance to the selective leaching of zinc (dezincification) in seawater environments.",
    uses:["Marine Hardware","Condenser Plates","Pump Shafts","Valve Stems","Propeller Shafts","Rudder Bearings"],
    properties:{"Copper Content":"60%","Zinc Content":"~39%","Tin Content":"0.75%","Dezincification":"Resistant"},
    grades:"C46400 (Uninhibited Naval Brass). C46500 (+ As): arsenical, better dezincification resistance. C46700 (+ Sb): antimony inhibited. Hot-worked form is common.",
    millRole:"Naval brass is specified for seawater-cooled heat exchangers and pump components in coastal steel plants. Also used for propeller shaft sleeves on ships delivering raw materials to port-side mills.",
    studentNote:"Regular brass can 'dezincify' in seawater — the zinc leaches out, leaving a porous copper sponge. Adding even 0.75% tin prevents this, which is the entire reason Naval Brass exists.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Planispheric_Astrolabe_MET_DP105325.jpg/330px-Planispheric_Astrolabe_MET_DP105325.jpg",
    micro:"brass_grains" },
];

const SCRAP = [
  { id:"hms1", symbol:"HMS1", name:"HMS #1", subtitle:"Heavy Melting Steel No. 1", type:"scrap",
    desc:"The premier ferrous scrap grade — clean, dry steel sections ≥¼\" thick and ≥6\" wide. Includes heavy structural shapes, thick plate, and heavy forgings. No coatings, rubber, or free moisture. Low residuals make it ideal for quality flat products.",
    uses:["Quality Flat Products","EAF Automotive Sheet","BOF Skull Returns","Premium EAF Charges"],
    properties:{"Thickness":"≥¼\" (6 mm)","Piece Size":"≤36\" × ≤18\"","Residuals (Cu+Sn)":"< 0.20%","Typical C":"0.10–0.35%"},
    grades:"ISRI Grade 200/201. Equivalent to EU E1/E2 grades. Traded regionally and on LME. Commands premium pricing reflecting low residual content.",
    millRole:"Primary charge for EAF mills making drawing-quality automotive steels and quality flat products. Preferred when strict Cu, Sn, and Ni limits apply.",
    studentNote:"HMS #1 is the 'clean cut' of the scrap world — thick, heavy steel with minimal contamination. Mills pay top dollar because it doesn't pollute the chemistry of expensive steel grades.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Allegheny_Ludlum_Steel_Corp_Scrap_Piles.jpg/330px-Allegheny_Ludlum_Steel_Corp_Scrap_Piles.jpg" },

  { id:"shredded", symbol:"SHRD", name:"Shredded Scrap", subtitle:"Auto-Shredder Fragmented Steel", type:"scrap",
    desc:"Whole automobiles, appliances, and light steel passed through a high-power hammer mill. Output is fist-sized (2–8\") chunks after magnetic separation from non-ferrous material and plastic. Very high bulk density and consistent sizing — ideal for automated bucket charging.",
    uses:["High-Volume EAF Charging","Rebar & Merchant Bar","Structural Products","Auto Recycling Loop"],
    properties:{"Piece Size":"2\"–8\" nominal","Bulk Density":"95–130 lb/ft³","Cu Content":"0.15–0.30%","Yield":"~95% Fe"},
    grades:"ISRI Grade 211/212. The most common scrap grade by volume globally. Elevated copper and tin from wiring limit use in the most demanding flat-rolled products.",
    millRole:"The workhorse EAF charge material worldwide. Consistent sizing enables automated charging. Cu content makes it suitable for long products and structural steel but not exposed-quality automotive sheet.",
    studentNote:"Every scrapped car starts here — a shredder the size of a building tears the whole vehicle apart in seconds, magnets pull out the steel, and it's ready for the furnace. This is the foundation of the circular steel economy.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Car_scrapyard_-_geograph.org.uk_-_6700437.jpg/330px-Car_scrapyard_-_geograph.org.uk_-_6700437.jpg" },

  { id:"busheling", symbol:"BSH", name:"Busheling", subtitle:"Factory-New Steel Clips", type:"scrap",
    desc:"Clean, uncoated steel stampings, clippings, and punchings from automotive and appliance stamping plants. Essentially the same steel as the original sheet — ultra-low residuals, no weathering, no contamination. The cleanest and most valuable ferrous scrap grade.",
    uses:["AHSS & UHSS Production","Automotive Deep-Draw Sheet","High-Quality Flat Products","Premium EAF Charges"],
    properties:{"Origin":"Stamping plant offcuts","Residuals (Cu+Sn)":"< 0.08%","Max Piece Size":"12\" × 12\"","Bulk Density":"15–35 lb/ft³"},
    grades:"ISRI Grade 205. Also called No. 1 Factory Bundles. Commands the highest price of any ferrous scrap. Often sold direct from OEM stamping plants to mills under long-term contracts.",
    millRole:"Preferred charge for EAF mills producing high-strength automotive sheet where tramp element limits are extreme (Cu < 0.06%). Low bulk density requires careful charging to avoid arc splash.",
    studentNote:"Busheling is brand-new steel clipped off the stamping line — it never left the factory. That's why it's so pure, and why mills pay a premium: they're buying a pre-alloyed, uncontaminated feedstock.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CompactedSteelScraps.jpg/330px-CompactedSteelScraps.jpg" },

  { id:"plate-structural", symbol:"P&S", name:"Plate & Structural", subtitle:"Heavy Fabrication Scrap", type:"scrap",
    desc:"Clean steel plate, I-beams, angles, channels, and large structural shapes from fabrication shops, ship-breaking, and demolition. Thicker than HMS #2 but must be torch-cut to furnace-compatible lengths. High yield and well-defined chemistry.",
    uses:["EAF Long & Flat Products","Structural Steel Recycling","Heavy Section Mills","Rail Product Charges"],
    properties:{"Thickness":">3/16\"","Piece Size":"Cut to ≤60\"","Residuals":"Low","Typical Source":"Ship-breaking, fab shops"},
    grades:"ISRI Grade 233/234. Ship-breaking scrap may carry higher Mn and C from offshore structural grades. Cut quality critical — torch-cut ends must be free of slag and excessive oxidation.",
    millRole:"Widely used in structural, rail, and plate-product EAFs where higher carbon and manganese are acceptable. Dense, defined chemistry makes it easier to hit target heats than mixed grades.",
    studentNote:"When a ship is scrapped or a bridge is demolished, most of that steel becomes plate & structural scrap. It re-enters the supply chain and can become a new building or vessel within months.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Scrap_yard_1_%283360886332%29.jpg/330px-Scrap_yard_1_%283360886332%29.jpg" },

  { id:"dri-hbi", symbol:"DRI", name:"DRI / HBI", subtitle:"Direct Reduced Iron", type:"scrap",
    desc:"Iron ore reduced to metallic iron without melting — no blast furnace required. DRI (sponge iron) is porous and reactive; HBI (hot briquetted iron) is dense and stable for ocean shipping. Contains 90–96% iron with near-zero tramp elements. Not technically scrap, but substitutes for it as a virgin EAF charge material.",
    uses:["Tramp-Element Dilution","Quality Flat Products","EAF Virgin Iron Input","AHSS & Electrical Steel"],
    properties:{"Metallization":"≥92% Fe⁰","Total Iron":"90–96%","Carbon":"0.1–4%","Residuals (Cu+Sn)":"< 0.01%"},
    grades:"MIDREX and HYL/Energiron are dominant processes. HBI: 5–6 kg briquettes, stable for shipping. DRI: loose pellets, must be charged carefully to avoid reoxidation. Traded in USD/dmt.",
    millRole:"Added at 10–40% of EAF charge when scrap residuals exceed limits for quality grades. Essential for producing automotive body sheet, electrical steel, and stainless via the EAF route.",
    studentNote:"DRI lets an EAF mill make steel as clean as a blast furnace route — without the blast furnace. Adding 20% DRI to a scrap charge dilutes copper and tin to levels acceptable for the most demanding automotive grades.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Hot-briquetted_iron.JPG/330px-Hot-briquetted_iron.JPG" },

  { id:"turnings", symbol:"TURN", name:"Turnings & Borings", subtitle:"Machining Swarf & Chips", type:"scrap",
    desc:"Spiral chips, short turnings, and loose borings from lathe, milling, and drilling operations. High surface area promotes rapid oxidation and traps cutting oils. Must be centrifuged and dried before EAF charging. Lowest metal yield of any ferrous scrap grade.",
    uses:["EAF Charge (Low Tier)","Briquetted Charge Supplement","Foundry Cold Charges","Low-Grade Recycling"],
    properties:{"Metal Yield":"70–85%","Oil Content":"2–8% (must remove)","Piece Size":"Loose chips","Residuals":"Varies by source alloy"},
    grades:"ISRI Grade 244/246. Best practice: centrifuge to <2% oil, then briquette into dense pucks. Carbon and alloy content vary widely depending on the source alloy being machined.",
    millRole:"Lowest-value ferrous scrap. Used sparingly. Briquetted turnings preferred over loose material. High surface area causes oxidation losses and increases slag volume in the EAF.",
    studentNote:"Every piece of steel machined into a precision part generates a pile of chips. Those chips are worth money — but less than bulk scrap, because of the oils and the effort to process them before they can be safely charged.",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/SwarfSamples.jpg/330px-SwarfSamples.jpg" },
];

const HEAT_TREAT = [
  { id:"full-anneal", icon:"🌡️", name:"Full Annealing", subtitle:"Complete Softening", temp:"Ac3 + 30–50°C → Furnace Cool",
    mechanism:"Steel is heated above the upper critical temperature (Ac3) so all carbon dissolves into austenite, then cooled very slowly in the furnace (10–30°C/hr). Produces the softest, most ductile condition possible. Carbides spheroidize and grain boundaries relax. Maximum formability, minimum hardness.",
    phases:{"Start Temp":"750–900°C (Ac3+30)","Cooling Rate":"10–30°C/hr in furnace","Final Structure":"Coarse pearlite + ferrite","Hardness Result":"80–150 HB"},
    appliesto:["Low & medium carbon steels","Hypereutectoid steels (spheroidize variant)","After cold work to restore ductility","Forgings & castings before machining"],
    studentNote:"Full annealing is like giving steel a complete reset — slow furnace cooling means the atoms have maximum time to rearrange into the softest possible structure. Used when maximum machinability or formability is needed." },
  { id:"stress-relief", icon:"😮‍💨", name:"Stress Relief", subtitle:"No Phase Change — Residual Stress Removal", temp:"550–680°C → Slow Cool",
    mechanism:"Below the lower critical temperature (Ac1), no phase transformation occurs. Thermal energy allows dislocations and lattice distortions from welding, machining, or cold work to annihilate and rearrange. Dimensional stability is dramatically improved without changing hardness or microstructure significantly.",
    phases:{"Temperature":"550–680°C","Hold Time":"1 hr per 25mm section","Cooling Rate":"<150°C/hr in furnace","Hardness Change":"Minimal"},
    appliesto:["Welded fabrications","Machined precision components","Cold-worked parts","Castings & forgings before finish machining"],
    studentNote:"After welding, steel is 'locked' in tension internally — stress relief heat treatment lets those stresses relax without changing the microstructure. Essential for parts that must hold tight tolerances." },
  { id:"normalizing", icon:"⚖️", name:"Normalizing", subtitle:"Air-Cool from Austenite", temp:"Ac3 + 30–60°C → Air Cool",
    mechanism:"Like full annealing but air-cooled outside the furnace rather than furnace-cooled. The faster cooling rate produces a finer pearlite and ferrite structure with higher strength and hardness than full anneal, but less than quench-and-temper. Refines grain size. Widely used as a conditioning treatment before hardening or machining.",
    phases:{"Start Temp":"800–950°C","Cooling Rate":"~1–5°C/s in still air","Final Structure":"Fine pearlite + ferrite","Hardness":"150–250 HB"},
    appliesto:["Low & medium carbon steels","After heavy forging to refine grain size","Structural steel weld prep","Cast steel components"],
    studentNote:"Normalizing is 'anneal but with air cooling.' The faster cool gives finer, slightly stronger structure. It's the standard conditioning treatment — cheap (no slow furnace cool) and gives consistent results." },
  { id:"quenching", icon:"💧", name:"Quenching", subtitle:"Rapid Cooling to Form Martensite", temp:"Ac3 + 30–60°C → Rapid Cool",
    mechanism:"Steel is austenitized, then quenched into a cooling medium fast enough to suppress pearlite and bainite formation. Carbon atoms are 'trapped' in the iron lattice, creating a body-centered tetragonal (BCT) structure called martensite — extremely hard but brittle. Quench severity: brine > water > polymer > oil > air. Distortion and cracking risk increase with quench severity.",
    phases:{"Austenitize Temp":"800–900°C","Quench Media":"Water, oil, polymer, brine","Final Structure":"Martensite (BCT)","Hardness":"55–68 HRC"},
    appliesto:["Tool steels","Bearing steels (52100)","Gear & axle steels (4140, 4340)","High-strength structural steel"],
    studentNote:"Quenching 'freezes' steel in a high-energy state — the carbon atoms don't have time to form carbides and get trapped in the iron lattice, creating hard martensite. Steel goes from soft (200 HB) to razor-hard (65 HRC) in seconds." },
  { id:"tempering", icon:"🌊", name:"Tempering", subtitle:"Toughening Quenched Steel", temp:"150–700°C after Quench",
    mechanism:"Quenched martensite is too brittle for most uses. Reheating to 150–700°C allows controlled decomposition of martensite: carbon partially precipitates as fine carbides, reducing lattice strain. Higher tempering temperature → softer, tougher steel. Low temper (150–250°C): tools, cutting edges. High temper (500–700°C): structural, springs, gears. Always done immediately after quenching.",
    phases:{"Temperature Range":"150–700°C","Hold Time":"1–2 hr minimum","Cooling":"Air cool after hold","Hardness Range":"30–65 HRC (temp-dependent)"},
    appliesto:["All quenched steels","Tool steels: 150–250°C (low temper)","Structural/gear steels: 500–650°C","Springs: 400–500°C"],
    studentNote:"Tempering 'relaxes' martensite — trading some hardness for toughness. It's always done after quenching. A knife blade might temper at 200°C (stays hard), while an axle tempers at 600°C (soft enough not to snap). Same process, very different results." },
  { id:"carburizing", icon:"⚗️", name:"Carburizing", subtitle:"Surface Carbon Enrichment", temp:"850–980°C in Carbon Atmosphere",
    mechanism:"Low-carbon steel (0.10–0.25% C) is held in a carbon-rich atmosphere (endothermic gas, vacuum, or pack) at high temperature. Carbon diffuses into the surface layer to 0.6–2.0 mm depth, raising surface carbon to 0.8–1.0%. The part is then quenched to harden the high-carbon case while the low-carbon core remains tough. Gives hard wear-resistant surface + tough impact-resistant core.",
    phases:{"Process Temp":"850–980°C","Carbon Source":"Endogas (CO/H₂), vacuum, or pack","Case Depth":"0.5–2.0 mm","Surface Carbon":"0.8–1.0%"},
    appliesto:["Gear teeth (AISI 8620, 9310)","Bearing races","Camshafts & crankpins","Drive shafts"],
    studentNote:"Carburizing creates a 'chocolate-coated' steel — hard on the outside (like hardened high-carbon steel) and tough on the inside (like the original low-carbon steel). Gearbox teeth are usually carburized so they can handle both surface contact stress and impact loads." },
  { id:"nitriding", icon:"💨", name:"Nitriding", subtitle:"Nitrogen Case Hardening — No Quench", temp:"480–590°C in Ammonia/Gas",
    mechanism:"Nitrogen is diffused into the steel surface from decomposed ammonia gas (or plasma/salt bath) at relatively low temperatures. Nitrogen forms hard nitride precipitates (Fe₂N, Fe₄N, and alloy nitrides with Cr, Al, Mo). No quenching needed — distortion is minimal. Surface hardness exceeds carburizing (up to 1100 HV). Case depth is shallower (0.1–0.5 mm). Excellent corrosion and fatigue resistance.",
    phases:{"Process Temp":"480–590°C","Atmosphere":"Ammonia gas or plasma","Case Depth":"0.1–0.5 mm","Surface Hardness":"700–1100 HV"},
    appliesto:["Precision gears & crankshafts","Extrusion dies & molds","Valve stems","Aerospace structural parts"],
    studentNote:"Nitriding is the 'gentle' case hardening — done at low temperature, no quench, minimal distortion. Ideal for precision parts that can't afford warping. The hard surface comes from nitrogen compounds, not carbon." },
  { id:"induction-harden", icon:"⚡", name:"Induction Hardening", subtitle:"Selective Surface Hardening", temp:"Local Heating → Immediate Quench",
    mechanism:"An alternating magnetic field induces eddy currents in a selected surface zone, generating heat in microseconds to tens of seconds. Only the targeted area reaches austenitizing temperature — the core stays cool. Immediate quenching (water spray or immersion) creates a hard martensitic case. Depth is controlled by frequency: high frequency → shallow case (0.5–2mm), low frequency → deeper case (3–6mm). High productivity, low distortion.",
    phases:{"Frequency":"3–500 kHz depending on case depth","Power":"10 kW–1 MW","Case Depth":"0.5–6 mm","Cycle Time":"1–30 seconds"},
    appliesto:["Crankshafts & camshafts","Gear teeth (selective)","Axle journals","Rail ends & crossings"],
    studentNote:"Induction hardening heats just the surface — in seconds — using magnetic fields. It can harden the tooth flanks of a gear while leaving the core tough. You can run a crankshaft under an induction coil and harden every journal precisely without touching anything else." },
  { id:"precip-harden", icon:"🧊", name:"Precipitation Hardening", subtitle:"Aging to Strengthen", temp:"Solution Treat → Age at 300–550°C",
    mechanism:"Two-step process: (1) Solution treating dissolves alloying elements into a single-phase matrix at high temperature; (2) Aging at intermediate temperature causes fine intermetallic precipitates to nucleate and grow throughout the matrix. These precipitates pin dislocation movement, dramatically increasing strength. Used for aluminum alloys, maraging steels, 17-4 PH stainless, and beryllium copper.",
    phases:{"Solution Treat Temp":"900–1050°C (steels), 480–530°C (Al)","Aging Temp":"300–550°C (steels), 120–200°C (Al)","Aging Time":"1–20 hours","Strength Gain":"100–500 MPa"},
    appliesto:["Maraging steel (480°C aging)","17-4 PH stainless steel","Beryllium copper (C17200)","7075 aluminum (T6 temper)"],
    studentNote:"Precipitation hardening makes steel or aluminum hard without ever forming martensite — instead, tiny intermetallic 'needles' grow inside the grains and block dislocation movement. Maraging steel and many aerospace aluminum alloys use this mechanism." },
];

const GLOSSARY = [
  { term:"Austenite", cat:"micro", def:"The face-centered cubic (FCC) phase of iron (γ-iron) stable above ~727°C. Austenite can dissolve up to 2.1% carbon. It is non-magnetic, tough, and is the starting phase for most heat treatment cycles. In austenitic stainless steels (304, 316), it is retained at room temperature by nickel addition." },
  { term:"Ferrite", cat:"micro", def:"The body-centered cubic (BCC) phase of iron (α-iron) stable below ~912°C. Ferrite dissolves almost no carbon (<0.02%). It is soft, ductile, and magnetic. In low-carbon steels, ferrite forms white polygonal grains in the microstructure alongside pearlite. The 'matrix' of most mild steels." },
  { term:"Martensite", cat:"micro", def:"A metastable, supersaturated solid solution of carbon in iron formed by rapid quenching. Carbon atoms are 'trapped' in a body-centered tetragonal (BCT) lattice. The hardest steel microstructure (up to 68 HRC). Extremely hard but brittle as-quenched — always tempered before use. Named after German metallurgist Adolf Martens." },
  { term:"Pearlite", cat:"micro", def:"A lamellar (layered) microstructure of alternating ferrite and cementite (Fe₃C) plates, formed when austenite cools slowly through the eutectoid temperature (~727°C). Named for its pearlescent appearance under the microscope. Coarse pearlite (slow cool) is softer; fine pearlite (faster cool) is harder. Comprises most of annealed medium-carbon steel." },
  { term:"Bainite", cat:"micro", def:"An acicular (needle-like) microstructure formed when austenite transforms at temperatures between the pearlite range (~600°C) and the martensite start (Ms) temperature. Upper bainite (400–600°C) has coarser feathery structure; lower bainite (<400°C) is finer and stronger. Stronger than pearlite, tougher than martensite. Produced by austempering." },
  { term:"Cementite", cat:"micro", def:"Iron carbide (Fe₃C), a hard, brittle intermetallic compound containing 6.67% carbon. Forms as plates in pearlite, as a network in hypereutectoid steels, and as needles in white cast iron. Very high hardness (~800 HV) but zero toughness. Its distribution controls much of the hardness and brittleness of carbon steels." },
  { term:"Tensile Strength", cat:"mech", def:"The maximum stress a material can withstand before fracture when pulled in tension, measured in MPa or ksi. Also called Ultimate Tensile Strength (UTS). Distinguished from yield strength — the UTS is reached after significant plastic deformation. A structural steel might have 400 MPa UTS; maraging steel exceeds 2000 MPa." },
  { term:"Yield Strength", cat:"mech", def:"The stress at which a material begins to deform plastically (permanently), typically defined at 0.2% offset strain. Below yield, steel behaves elastically and springs back. Above yield, it permanently deforms. Yield strength governs structural design — engineers keep stresses well below it. Higher carbon and alloying generally raise yield strength." },
  { term:"Toughness", cat:"mech", def:"The ability of a material to absorb energy before fracture — a combination of strength and ductility. Measured by Charpy or Izod impact tests (in Joules). High-toughness steels resist crack propagation. Martensite is hard but low-toughness; tempered martensite trades hardness for toughness. Low temperature typically reduces toughness (ductile-to-brittle transition)." },
  { term:"Hardenability", cat:"mech", def:"The ability of a steel to be hardened (form martensite) throughout its cross-section during quenching, not just at the surface. Measured by the Jominy end-quench test. High hardenability allows thicker sections to harden fully. Alloying elements (Mn, Cr, Mo, Ni, B) all increase hardenability by slowing pearlite and bainite transformations." },
  { term:"Ductility", cat:"mech", def:"The ability of a material to undergo significant plastic deformation before fracture, measured as percent elongation or reduction in area. High ductility means the material can be drawn, stamped, or bent without cracking. Low-carbon steels are highly ductile; high-carbon and cast irons are brittle. Essential for sheet metal forming and structural applications." },
  { term:"Creep", cat:"mech", def:"The time-dependent plastic deformation of a material under sustained stress at elevated temperatures, well below its melting point. Significant above ~0.3–0.4 × melting point (Kelvin). Critical in power plant turbines, boilers, and jet engines. Molybdenum, chromium, and tungsten additions in steels form stable carbides that resist creep by pinning grain boundaries." },
  { term:"HSLA Steel", cat:"steel", def:"High Strength Low Alloy steel — a family of steels with small additions of Nb, V, Ti, and/or Cu (typically <0.1% each) that achieve 350–700 MPa yield strength without heat treatment. The microalloying elements refine grain size through precipitation and grain boundary pinning during controlled rolling. Used in automotive bodies, pipelines, and structural sections." },
  { term:"AHSS", cat:"steel", def:"Advanced High Strength Steel — umbrella term for modern automotive steels achieving 500–1500+ MPa tensile strength with significant ductility. Includes Dual Phase (DP), TRIP (Transformation Induced Plasticity), Martensitic, and TWIP (Twinning Induced Plasticity) steels. AHSS enables vehicle lightweighting — thinner, stronger panels with unchanged crash performance." },
  { term:"ULC Steel", cat:"steel", def:"Ultra Low Carbon steel — typically <0.005% carbon, compared to ~0.05% in ordinary low-carbon steel. Requires RH or VD vacuum degassing to reach these carbon levels. Enables excellent deep-drawing formability for automotive body panels. Often stabilized with titanium or niobium to prevent carbon/nitrogen 'aging' embrittlement after stamping." },
  { term:"HAZ", cat:"process", def:"Heat Affected Zone — the region of base metal adjacent to a weld that was not melted but was heated enough to alter its microstructure and mechanical properties. HAZ can show grain growth (softening), hardening (martensite formation in higher-carbon steels), or sensitization (in stainless). Controls weld joint performance and cracking risk. Width depends on heat input." },
  { term:"Sensitization", cat:"process", def:"A loss of corrosion resistance in austenitic stainless steel caused by heating in the 425–815°C range. Chromium diffuses to grain boundaries and forms Cr₂₃C₆ carbides, depleting adjacent regions below the 10.5% Cr minimum for passivity. These chromium-depleted zones are vulnerable to intergranular attack. Prevented by using low-carbon (304L, 316L) or titanium/niobium-stabilized grades." },
  { term:"Temper Embrittlement", cat:"process", def:"Embrittlement of certain alloy steels after tempering or slow cooling through the 375–575°C range. Caused by segregation of impurity elements (P, Sn, Sb, As) to prior austenite grain boundaries, lowering grain boundary cohesion. Detected by shift in ductile-to-brittle transition temperature. Prevented by using steels with low impurity levels and by molybdenum addition." },
  { term:"Tramp Elements", cat:"scrap", def:"Residual metallic elements in steel that cannot be removed by conventional steelmaking — primarily copper (Cu), tin (Sn), nickel (Ni), chromium (Cr), and molybdenum (Mo). They accumulate with each recycling cycle. At low levels (<0.2% Cu) they are harmless or even beneficial (Cu improves corrosion resistance). Above limits, Cu causes hot shortness (surface cracking during rolling) and Sn causes temper embrittlement." },
  { term:"Hot Shortness", cat:"process", def:"Surface cracking and tearing of steel during hot rolling caused by liquid copper films at grain boundaries. Copper melts at 1085°C — below the hot rolling temperature (~1150°C). When Cu-containing scrap is remelted, copper is rejected from solidifying steel and concentrates at grain boundaries. Prevented by diluting copper with low-residual scrap or DRI/pig iron. Tin exacerbates hot shortness." },
  { term:"Decarburization", cat:"process", def:"Loss of carbon from the surface layer of steel when heated in an oxidizing atmosphere. Oxygen reacts with surface carbon to form CO/CO₂ gas, leaving a soft ferrite-rich layer. Reduces fatigue strength and surface hardness. Prevented by controlled atmosphere furnaces, salt baths, or protective coatings. Critical issue in spring, tool, and bearing steel heat treatment." },
  { term:"Inoculation", cat:"process", def:"Addition of small amounts of materials (graphite, FeSi, cerium) to cast iron melts to control the number and morphology of graphite nucleation sites. Fine, uniformly distributed graphite flakes (gray iron) or spheroids (ductile iron) give predictable mechanical properties. Without inoculation, cast iron solidifies as brittle white iron. The entire character of cast iron depends on successful inoculation." },
  { term:"IACS", cat:"steel", def:"International Annealed Copper Standard — the baseline for measuring electrical conductivity. Pure annealed copper (C11000) = 100% IACS. All other metals are rated relative to this. Silver: 106%, aluminum: 61%, gold: 73%, steel: ~12%. Important for selecting materials in electrical applications — higher IACS means lower resistive losses in conductors and bus bars." },
  { term:"TTT Diagram", cat:"micro", def:"Time-Temperature-Transformation diagram — a graph showing the start and finish of austenite decomposition products (pearlite, bainite, martensite) as a function of temperature and time. The 'nose' of the TTT curve represents the fastest transformation. Cooling curves that miss the nose allow full martensite formation. Essential tool for designing quenching and tempering cycles." },
  { term:"Microalloying", cat:"steel", def:"The practice of adding very small amounts of strong carbide/nitride formers (Nb 0.01–0.1%, V 0.05–0.15%, Ti 0.01–0.03%) to refine grain size and provide precipitation strengthening in steel without heat treatment. These elements form fine precipitates (NbC, VN, TiN) during controlled rolling that pin austenite grain boundaries, producing fine, strong ferrite in the as-rolled condition. The key technology in modern HSLA steels." },
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

  // ── Scrap ──
  { q:"Why is 'Busheling' (ISRI 205) the most valuable ferrous scrap grade?", metal:"busheling", opts:["It is the heaviest and densest scrap","It is factory-new uncoated stamping clips with ultra-low residual elements","It contains pre-alloyed chromium and nickel","It is the easiest grade to shred and process"], ans:1, exp:"Busheling is generated directly from automotive stamping lines — it has never been exposed to weathering, coatings, or contamination, so residuals like Cu and Sn are as low as 0.08%. EAF mills pay a premium to make demanding steel grades." },
  { q:"What are 'tramp elements' in EAF steelmaking and why can't they be removed?", metal:"shredded", opts:["Phosphorus and sulfur — removed by lime slag","Copper, tin, and nickel — they are more noble than iron and won't oxidize into the slag","Carbon and silicon — controlled by oxygen lancing","Manganese and chromium — they evaporate during melting"], ans:1, exp:"Cu, Sn, Ni, and Mo are more noble (less reactive) than iron, so they won't oxidize and transfer into the slag when oxygen is blown. They accumulate with every recycling cycle — the only way to reduce them is to dilute with clean scrap or DRI." },
  { q:"What is the primary advantage of DRI/HBI over scrap in an EAF charge?", metal:"dri-hbi", opts:["Higher carbon content for recarburizing","Near-zero tramp elements (Cu < 0.01%) enabling high-quality flat products","Lower cost than all scrap grades","It melts faster than steel scrap"], ans:1, exp:"DRI/HBI is made from iron ore, not recycled steel, so it contains virtually no copper, tin, or nickel. Adding 20–40% DRI to a scrap charge dilutes tramp elements to levels acceptable for automotive sheet and electrical steel production via the EAF route." },
  { q:"What causes 'hot shortness' in steel rolled from copper-contaminated scrap?", metal:"shredded", opts:["Copper increases the melting point, causing solid inclusions during rolling","Molten copper films form at grain boundaries at hot rolling temperatures, causing surface cracks","Copper causes hydrogen embrittlement during reheating","Copper precipitates slow down the rolling mill rolls"], ans:1, exp:"Copper melts at 1085°C — below hot rolling temperatures (~1150°C). Copper rejected from the solidifying steel surface concentrates at grain boundaries as a liquid film, which tears open during rolling, causing surface cracks. Tin accelerates this by lowering copper's melting point further." },
  { q:"HMS #1 and HMS #2 scrap differ primarily in:", metal:"hms1", opts:["Carbon content — HMS #1 is high carbon, HMS #2 is low carbon","Thickness and cleanliness — HMS #1 requires ≥¼\" sections, HMS #2 allows lighter and dirtier material","Country of origin — HMS #1 is domestic, HMS #2 is imported","Magnetic properties — HMS #1 is fully magnetic, HMS #2 is partially non-magnetic"], ans:1, exp:"ISRI Grade 200 (HMS #1) requires clean, dry steel ≥¼\" thick. HMS #2 (Grade 201/202) allows thinner sections down to 1/8\" and mixed material. The thickness and cleanliness difference means HMS #1 has lower residuals and commands a higher price." },

  // ── Mill Process ──
  { q:"What is 'foamy slag practice' in an EAF and why is it used?", metal:"carbon-steel", opts:["Adding lime to make slag foamy for easier removal","Injecting carbon powder to generate CO bubbles that blanket the arc, cutting electrode consumption by ~20%","Stirring the slag with nitrogen to mix alloy additions","Reducing slag basicity by adding silica sand"], ans:1, exp:"Carbon powder is injected into the EAF slag, reacting with FeO to generate CO bubbles. The foam insulates and buries the arc, reducing heat loss and electrode oxidation. Foamy slag practice improves energy efficiency by 10–15% and is standard in all modern EAF operations." },
  { q:"In continuous casting, why is the mold oscillated vertically?", metal:"copper", opts:["To mix the liquid steel and homogenize temperature","To prevent the solidifying shell from sticking to the copper mold and tearing","To increase cooling rate by improving heat transfer","To measure mold level by vibration frequency"], ans:1, exp:"Without oscillation, friction between the solidifying steel shell and the copper mold would cause the shell to stick and tear — producing a breakout (liquid steel flood). Oscillation leaves characteristic 'oscillation marks' on the strand surface but keeps the shell free. Mold flux is also injected to lubricate." },
  { q:"What is the purpose of the 'run-out table' cooling system after the hot strip mill?", metal:"carbon-steel", opts:["To cool the coil before storage — no metallurgical effect","To control microstructure and mechanical properties through controlled austenite transformation temperature and rate","To remove surface scale by rapid quenching","To flatten the strip before coiling"], ans:1, exp:"The run-out table (ROT) cools the strip from ~880°C to a coiling temperature of 550–750°C using water banks. The cooling rate and stop temperature control whether austenite transforms to coarse or fine ferrite+pearlite or bainite, directly setting the mechanical properties of the final product without any additional heat treatment." },
  { q:"What is the role of limestone in the blast furnace?", metal:"pig-iron", opts:["Provides carbon for iron ore reduction","Decomposes to CaO which forms slag by combining with silica and alumina impurities","Acts as the primary fuel alongside coke","Provides the iron source for pig iron production"], ans:2, exp:"Limestone (CaCO₃) decomposes to CaO and CO₂ at ~900°C. The CaO acts as a flux, combining with SiO₂, Al₂O₃, and other gangue minerals from the iron ore to form liquid slag, which separates from the iron and is tapped separately. Without limestone, impurities would remain in the iron." },
  { q:"In an EAF, what is the role of the ladle furnace (LF) that follows tapping?", metal:"carbon-steel", opts:["To melt additional scrap that didn't fit in the EAF","To fine-tune chemistry, temperature, and remove inclusions before continuous casting","To perform the final quenching of liquid steel","To separate slag from steel by centrifugal force"], ans:1, exp:"After tapping, liquid steel in the ladle goes to the LF (ladle furnace) which uses graphite electrodes and inert gas stirring to: precisely adjust alloy chemistry, homogenize temperature, reduce sulfur via slag treatment, and float out non-metallic inclusions. The LF decouples EAF melting from caster speed." },

  // ── Alloying Elements ──
  { q:"What role does vanadium play in high-speed tool steels like M2?", metal:"tool-steel", opts:["Acts as a deoxidizer replacing aluminum","Forms extremely hard vanadium carbides (VC) that provide wear resistance and maintain hot hardness","Increases electrical conductivity for EDM machining","Lowers the austenitizing temperature to reduce distortion"], ans:1, exp:"Vanadium (1–5% in HSS) forms very hard VC carbides (HV ~2800 — harder than WC). These resist dissolution at cutting temperatures, provide abrasion resistance against workpiece materials, and help maintain hardness above 500°C. The V content is a key differentiator between general-purpose and premium high-speed steels." },
  { q:"What does silicon do in electrical (transformer) steels?", metal:"alloy-steel", opts:["Increases electrical conductivity by pairing with copper","Dramatically increases electrical resistivity, reducing eddy current losses in transformer cores","Acts as the primary strength-giving element","Stabilizes austenite for room-temperature retention"], ans:1, exp:"Silicon (2–4%) raises the electrical resistivity of iron from ~10 to ~50 μΩ·cm, reducing eddy current losses in AC transformer cores. It also improves magnetic permeability and reduces magnetostriction. Grain-oriented electrical steel (GOES) with 3% Si is the core material of virtually all power transformers." },
  { q:"Why is aluminum added to liquid steel in the ladle at tap?", metal:"carbon-steel", opts:["To add strength via aluminum carbide precipitation","As a strong deoxidizer (forming Al₂O₃) and to control austenite grain size via AlN precipitation","To increase electrical conductivity of the final product","To prevent hot shortness by binding with copper"], ans:1, exp:"Aluminum is the most common deoxidizer: 2Al + 3O → Al₂O₃. It removes dissolved oxygen that would cause porosity. Beyond deoxidation, AlN precipitates pin austenite grain boundaries during reheating, keeping grain size fine and improving toughness. 'Al-killed' steels have much better consistency than 'rimmed' steels." },
  { q:"What prevents sensitization in stainless steel grades 321 and 347?", metal:"stainless-steel", opts:["Higher chromium content (>18%)","Titanium (321) or niobium (347) additions that preferentially form TiC/NbC, preventing chromium carbide formation","Molybdenum additions that slow carbon diffusion","Water quenching after welding to freeze the microstructure"], ans:1, exp:"In the heat-affected zone of welds (425–815°C range), carbon migrates to grain boundaries and combines with chromium to form Cr₂₃C₆. This depletes adjacent regions below 10.5% Cr. Titanium or niobium have stronger affinity for carbon, forming TiC or NbC preferentially, leaving chromium in solution and the passive film intact." },
  { q:"What effect does copper addition (0.2–0.5%) have in weathering steel (Corten)?", metal:"alloy-steel", opts:["Increases hardenability for through-hardening","Promotes formation of a dense, adherent rust layer that acts as a corrosion barrier","Acts as a grain refiner replacing niobium","Increases electrical conductivity for grounding applications"], ans:1, exp:"In weathering steels (ASTM A588, A242), copper along with small amounts of phosphorus, chromium, and nickel promotes formation of a tightly adherent, amorphous rust layer (α-FeOOH). This patina seals the surface and greatly reduces ongoing corrosion — weathering steel can last 50+ years without paint in many environments." },
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
  const [gloSearch, setGloSearch] = useState("");
  const [gloCat, setGloCat] = useState("all");

  const filteredQuizPool = useMemo(() => {
    return QUIZ_POOL.filter(q => {
      const metalObj = [...ALL_METALS, ...SCRAP].find(m => m.id === q.metal);
      const matchesType = quizMetalFilter === "all"
        || (metalObj && metalObj.type === quizMetalFilter)
        || (quizMetalFilter === "scrap" && metalObj && metalObj.type === "scrap");
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

  const displayScrap = SCRAP.filter(m => {
    if (search) {
      const s = search.toLowerCase();
      return m.name.toLowerCase().includes(s) || m.uses.join(" ").toLowerCase().includes(s) || m.subtitle.toLowerCase().includes(s);
    }
    return true;
  });

  const metalA = [...ALL_METALS, ...SCRAP].find(m => m.id === compareA);
  const metalB = [...ALL_METALS, ...SCRAP].find(m => m.id === compareB);
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
          { id:"ht", label:"🔥 Heat Treat" },
          { id:"ladle", label:"⚗ Ladle Calc" },
          { id:"compare", label:"⚖ Compare" },
          { id:"quiz", label:"🎯 Quiz" },
          { id:"glossary", label:"📖 Glossary" },
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
              26 metals and 6 scrap grades — ferrous, non-ferrous, copper alloys, and recycled feedstocks — with properties, grades, and steel mill applications.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:"1.8rem", flexWrap:"wrap" }}>
              {[
                { n:ALL_METALS.length, l:"Metals" },
                { n:FERROUS.length, l:"Ferrous" },
                { n:NONFERROUS.length, l:"Non-Ferrous" },
                { n:COPPER_ALLOYS.length, l:"Cu-Alloys" },
                { n:SCRAP.length, l:"Scrap Grades" },
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
                { id:"scrap", label:"♻ Scrap" },
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

          {(filter==="all"||filter==="scrap") && displayScrap.length > 0 && <>
            <div className="sh"><span className="stag tsc">Scrap</span><span className="stitle">Recycled Feedstocks</span><span style={{ color:"var(--mu)", fontSize:".77rem", marginLeft:"auto" }}>EAF Charge Materials</span></div>
            <div className="grid">
              {displayScrap.map(m => (
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

        {/* ══ HEAT TREAT TAB ══ */}
        {tab === "ht" && <>
          <div style={{ textAlign:"center", padding:"1.5rem 1rem 1rem" }}>
            <div style={{ display:"inline-block", fontFamily:"'Share Tech Mono',monospace", fontSize:".66rem", color:"var(--or)", letterSpacing:".15em", border:"1px solid rgba(217,108,12,.4)", padding:"3px 10px", borderRadius:2, marginBottom:".7rem" }}>
              🔥 Thermal Processing Reference
            </div>
            <h1 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", marginBottom:".6rem" }}>
              Heat <span style={{ color:"var(--or)" }}>Treatment</span>
            </h1>
            <p style={{ color:"var(--mu)", maxWidth:500, margin:"0 auto 1.4rem", fontSize:".9rem", lineHeight:1.6, fontWeight:300 }}>
              9 core thermal processes — temperatures, mechanisms, resulting microstructures, and the steel grades each process is used on.
            </p>
          </div>
          <div className="ht-grid">
            {HEAT_TREAT.map(ht => (
              <div key={ht.id} className="ht-card">
                <div className="ht-head">
                  <div className="ht-icon">{ht.icon}</div>
                  <div className="ht-title">{ht.name}</div>
                  <div className="ht-sub">{ht.subtitle}</div>
                  <div className="ht-temp">{ht.temp}</div>
                </div>
                <div className="ht-body">
                  <div className="ht-desc">{ht.mechanism}</div>
                  <div className="ht-phases">
                    {Object.entries(ht.phases).map(([k, v]) => (
                      <div key={k} className="ht-phase">
                        <div className="ht-plabel">{k}</div>
                        <div className="ht-pval">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:".65rem" }}>
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:".62rem", color:"var(--mu)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:".4rem" }}>Applied To</div>
                    <div className="ht-chips">
                      {ht.appliesto.map(s => <span key={s} className="ht-chip">{s}</span>)}
                    </div>
                  </div>
                  {level === "student" && <div className="ht-note">{ht.studentNote}</div>}
                </div>
              </div>
            ))}
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
                <h3 style={{ color: panel?.type==="ferrous"?"var(--fe)":panel?.type==="copper_alloy"?"var(--cp)":panel?.type==="scrap"?"var(--sc)":"var(--nf)" }}>{label}: {panel?.name}</h3>
                <select className="csel" value={sel} onChange={e => setSel(e.target.value)}>
                  <optgroup label="── Ferrous ──">{FERROUS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
                  <optgroup label="── Non-Ferrous ──">{NONFERROUS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
                  <optgroup label="── Copper Alloys ──">{COPPER_ALLOYS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
                  <optgroup label="── Scrap Grades ──">{SCRAP.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>
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
                  {panel && panel.micro && (
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
                  { l:"Category", a:metalA.type==="ferrous"?"Ferrous":metalA.type==="copper_alloy"?"Cu-Alloy":metalA.type==="scrap"?"Scrap Feedstock":"Non-Ferrous", b:metalB.type==="ferrous"?"Ferrous":metalB.type==="copper_alloy"?"Cu-Alloy":metalB.type==="scrap"?"Scrap Feedstock":"Non-Ferrous" },
                  { l:"Iron Content", a:metalA.type==="ferrous"||metalA.type==="scrap"?"Contains Iron":"No Iron", b:metalB.type==="ferrous"||metalB.type==="scrap"?"Contains Iron":"No Iron" },
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
                  {[["all","All Topics"],["ferrous","Ferrous"],["nonferrous","Non-Ferrous"],["copper_alloy","Cu-Alloys"],["scrap","♻ Scrap"]].map(([val, label]) => (
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

        {/* ══ GLOSSARY TAB ══ */}
        {tab === "glossary" && <>
          <div style={{ textAlign:"center", padding:"1.5rem 1rem 1rem" }}>
            <div style={{ display:"inline-block", fontFamily:"'Share Tech Mono',monospace", fontSize:".66rem", color:"var(--nf)", letterSpacing:".15em", border:"1px solid rgba(8,120,160,.4)", padding:"3px 10px", borderRadius:2, marginBottom:".7rem" }}>
              📖 Metallurgical Reference
            </div>
            <h1 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:700, letterSpacing:".04em", textTransform:"uppercase", marginBottom:".6rem" }}>
              Glossary of <span style={{ color:"var(--nf)" }}>Key Terms</span>
            </h1>
            <p style={{ color:"var(--mu)", maxWidth:500, margin:"0 auto 1.4rem", fontSize:".9rem", lineHeight:1.6, fontWeight:300 }}>
              25 essential metallurgical terms — microstructure, mechanical properties, process concepts, steel designations, and scrap terminology.
            </p>
          </div>
          <div className="glo-bar">
            <input className="sinput" style={{ flex:1, minWidth:160 }} placeholder="Search terms..." value={gloSearch} onChange={e => setGloSearch(e.target.value)} />
            <div className="fbtns">
              {[["all","All"],["micro","Microstructure"],["mech","Mechanical"],["process","Process"],["steel","Steel Types"],["scrap","Scrap"]].map(([id, label]) => (
                <button key={id} className={`fbtn${gloCat===id?" active":""}`} onClick={() => setGloCat(id)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="glo-grid">
            {GLOSSARY.filter(g => {
              const matchCat = gloCat === "all" || g.cat === gloCat;
              const matchSearch = !gloSearch || g.term.toLowerCase().includes(gloSearch.toLowerCase()) || g.def.toLowerCase().includes(gloSearch.toLowerCase());
              return matchCat && matchSearch;
            }).map(g => (
              <div key={g.term} className="glo-card">
                <div className="glo-term">{g.term}</div>
                <span className={`glo-cat ${g.cat}`}>{g.cat === "micro" ? "Microstructure" : g.cat === "mech" ? "Mechanical" : g.cat === "process" ? "Process" : g.cat === "steel" ? "Steel Types" : "Scrap"}</span>
                <div className="glo-def">{g.def}</div>
              </div>
            ))}
          </div>
        </>}

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
      {metal.img && <img src={metal.img} alt={metal.name} className="mcard-img" />}
      {studied && <div className="studied-dot">✓</div>}
      <div className="ctop">
        <span className="msym">{metal.symbol}</span>
        <span className={`cbadge ${metal.type==="ferrous"?"tfe":metal.type==="copper_alloy"?"tcp":metal.type==="scrap"?"tsc":"tnf"}`}>{metal.type==="copper_alloy"?"Cu-Alloy":metal.type}</span>
      </div>
      <div className="mname">{metal.name}</div>
      <div className="msub">{metal.subtitle}</div>
      <div className="mdesc">{level==="student" ? (metal.studentNote || metal.desc) : metal.desc}</div>
      <div className="ulist">{metal.uses.slice(0, 4).map(u => <span key={u} className="uchip">{u}</span>)}</div>
      <button className="xbtn" onClick={() => onToggle(metal.id)}>
        {expanded ? "▲ Collapse" : metal.micro ? "▼ Microstructure, Properties, Grades & Mill Role" : "▼ Properties, Grades & Mill Role"}
      </button>
      {expanded && (
        <div className="det">
          {metal.micro && <>
            <h4>Microstructure Visualization</h4>
            <MicrostructureSVG metalId={metal.id} width={260} height={105} />
          </>}

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
