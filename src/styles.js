// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg:#09090f;--s1:#111118;--s2:#17171f;--b:#22222e;
    --p:#7c6fff;--p2:#a89dff;--p3:#2a2550;
    --g:#22c55e;--y:#f59e0b;--or:#f97316;--pu:#a855f7;
    --t:#eeeef5;--t2:#6868a0;--t3:#9494c0;
    --font:'Inter',sans-serif;--mono:'JetBrains Mono',monospace;--serif:'DM Serif Display',serif;
  }
  body{background:var(--bg);color:var(--t);font-family:var(--font);min-height:100vh;overflow-x:hidden;}
  .app{max-width:1020px;margin:0 auto;padding:24px 16px;min-height:100vh;}

  /* ── TOPNAV ── */
  .topnav{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:14px;border-bottom:1px solid var(--b);}
  .nav-logo{font-size:16px;font-weight:800;letter-spacing:-.5px;cursor:pointer;}
  .nav-logo span{color:var(--p2);}
  .nav-tabs{display:flex;gap:3px;}
  .nav-tab{background:transparent;border:none;color:var(--t2);padding:7px 13px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .nav-tab:hover{color:var(--t);background:var(--s1);}
  .nav-tab.active{color:var(--p2);background:#1a1840;}

  /* ── BREADCRUMB ── */
  .breadcrumb{display:flex;align-items:center;gap:6px;margin-bottom:24px;flex-wrap:wrap;}
  .bc-item{font-family:var(--mono);font-size:11px;color:var(--t2);cursor:pointer;padding:4px 10px;border-radius:6px;transition:all .15s;border:1px solid transparent;}
  .bc-item:hover{color:var(--t);background:var(--s1);border-color:var(--b);}
  .bc-item.active{color:var(--p2);background:#1a1840;border-color:var(--p3);cursor:default;}
  .bc-sep{color:var(--b);font-size:12px;}

  /* ── YEAR/MONTH/SHIFT SELECTION SCREENS ── */
  .sel-screen{display:flex;flex-direction:column;gap:28px;}
  .sel-header{display:flex;flex-direction:column;gap:6px;}
  .sel-title{font-size:22px;font-weight:800;letter-spacing:-.5px;}
  .sel-sub{font-size:13px;color:var(--t2);font-family:var(--mono);}

  /* Year cards — large, prominent */
  .year-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;}
  .year-card{background:var(--s1);border:1.5px solid var(--b);border-radius:14px;padding:24px 20px;cursor:pointer;transition:all .2s;text-align:center;position:relative;overflow:hidden;}
  .year-card:hover{border-color:var(--p);transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,111,255,.15);}
  .year-card.has-data{border-color:var(--p3);}
  .year-num{font-family:var(--mono);font-size:32px;font-weight:700;color:var(--p2);line-height:1;}
  .year-count{font-size:11px;color:var(--t2);margin-top:6px;font-family:var(--mono);}
  .year-badge{position:absolute;top:10px;right:10px;background:var(--p3);color:var(--p2);font-size:9px;font-family:var(--mono);padding:2px 6px;border-radius:4px;letter-spacing:1px;}

  /* Month cards */
  .month-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}
  .month-card{background:var(--s1);border:1.5px solid var(--b);border-radius:12px;padding:20px;cursor:pointer;transition:all .2s;}
  .month-card:hover{border-color:var(--p);transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,111,255,.15);}
  .month-card.has-data{border-color:var(--p3);}
  .month-name{font-size:18px;font-weight:700;margin-bottom:8px;}
  .month-info{display:flex;flex-direction:column;gap:4px;}
  .month-shifts{font-family:var(--mono);font-size:11px;color:var(--t2);}
  .month-pill{display:inline-block;background:var(--p3);color:var(--p2);font-size:9px;font-family:var(--mono);padding:2px 8px;border-radius:100px;letter-spacing:1px;margin-top:4px;}

  /* Shift cards — the actual test cards */
  .shift-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;}
  .shift-card{background:var(--s1);border:1.5px solid var(--b);border-radius:14px;padding:22px;cursor:pointer;transition:all .2s;position:relative;}
  .shift-card:hover{border-color:var(--p);box-shadow:0 8px 32px rgba(124,111,255,.18);}
  .shift-card.completed{border-color:var(--p3);}
  .shift-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;}
  .shift-label{font-size:16px;font-weight:700;}
  .shift-date{font-family:var(--mono);font-size:11px;color:var(--t2);}
  .shift-stats{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;}
  .shift-stat{background:var(--s2);border:1px solid var(--b);border-radius:7px;padding:6px 10px;font-family:var(--mono);font-size:11px;color:var(--t2);}
  .shift-stat span{color:var(--t);font-weight:700;}
  .shift-score{background:linear-gradient(135deg,#1a1840,#16143a);border:1px solid var(--p3);border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;}
  .shift-score-lbl{font-size:11px;color:var(--t2);font-family:var(--mono);}
  .shift-score-val{font-family:var(--mono);font-size:16px;font-weight:700;color:var(--p2);}
  .shift-score-acc{font-size:10px;color:var(--t2);font-family:var(--mono);}
  .btn-start{width:100%;background:var(--p);color:white;border:none;padding:11px;border-radius:9px;font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;}
  .btn-start:hover{background:var(--p2);box-shadow:0 6px 20px rgba(124,111,255,.3);}
  .btn-retake{width:100%;background:transparent;color:var(--p2);border:1.5px solid var(--p3);padding:10px;border-radius:9px;font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
  .btn-retake:hover{background:#1a1840;}

  /* Empty state for years/months with no data */
  .empty-slot{opacity:.4;cursor:not-allowed;}
  .empty-slot:hover{transform:none;box-shadow:none;border-color:var(--b);}
  .coming-soon{font-size:10px;color:var(--t2);font-family:var(--mono);margin-top:6px;}

  /* ── COUNTDOWN ── */
  .cd-wrap{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;gap:16px;}
  .cd-label{font-family:var(--mono);font-size:11px;letter-spacing:4px;color:var(--t2);text-transform:uppercase;animation:fi .4s ease;}
  .cd-num{font-size:clamp(120px,22vw,180px);font-weight:800;line-height:1;color:var(--t);animation:cpop .5s cubic-bezier(.34,1.56,.64,1);letter-spacing:-4px;}
  .cd-num.go{color:var(--p2);}
  @keyframes cpop{0%{transform:scale(.4);opacity:0;}100%{transform:scale(1);opacity:1;}}
  @keyframes fi{from{opacity:0;}to{opacity:1;}}
  @keyframes su{from{transform:translateY(24px);opacity:0;}to{transform:translateY(0);opacity:1;}}
  .cd-ring{position:absolute;border-radius:50%;border:1px solid rgba(124,111,255,.1);animation:rp 1.2s ease-out infinite;}
  .cd-ring:nth-child(1){width:260px;height:260px;}
  .cd-ring:nth-child(2){width:420px;height:420px;animation-delay:.2s;border-color:rgba(124,111,255,.06);}
  .cd-ring:nth-child(3){width:580px;height:580px;animation-delay:.4s;border-color:rgba(124,111,255,.03);}
  @keyframes rp{0%{transform:scale(.85);opacity:0;}100%{transform:scale(1.15);opacity:0;}}

  /* ── QUOTE ── */
  .qt-wrap{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99;padding:40px;text-align:center;gap:20px;}
  .qt-eye{font-family:var(--mono);font-size:10px;letter-spacing:4px;color:var(--p);text-transform:uppercase;animation:fi .6s ease;}
  .qt-bar{width:40px;height:2px;background:var(--p);border-radius:2px;animation:xbar .7s ease forwards;}
  .qt-text{font-family:var(--serif);font-size:clamp(22px,4vw,38px);line-height:1.3;max-width:580px;color:var(--t);animation:su .7s ease;font-style:italic;}
  .qt-author{font-family:var(--mono);font-size:11px;color:var(--t2);letter-spacing:2px;}
  @keyframes xbar{from{width:0;}to{width:40px;}}

  /* ── TEST ── */
  .test-layout{display:grid;grid-template-columns:1fr 252px;gap:24px;align-items:start;}
  @media(max-width:700px){.test-layout{grid-template-columns:1fr;}}
  .test-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--b);flex-wrap:wrap;gap:12px;}
  .test-counter{font-family:var(--mono);font-size:12px;color:var(--t2);}
  .test-counter strong{color:var(--t);font-size:16px;}
  .timer{font-family:var(--mono);font-size:20px;font-weight:700;padding:9px 16px;border-radius:9px;border:1px solid var(--b);background:var(--s1);transition:all .3s;}
  .timer.warn{color:#ff8888;border-color:#ff8888;animation:twarn 1s infinite;}
  @keyframes twarn{0%,100%{box-shadow:0 0 0 rgba(255,136,136,0);}50%{box-shadow:0 0 20px rgba(255,136,136,.25);}}
  .pbar-wrap{height:3px;background:var(--b);border-radius:3px;margin-bottom:22px;}
  .pbar-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--p2));border-radius:3px;transition:width .4s;}
  .q-meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;}
  .topic-chip{font-size:10px;font-family:var(--mono);letter-spacing:1px;text-transform:uppercase;color:var(--p2);background:#1a1840;border:1px solid var(--p3);padding:3px 11px;border-radius:100px;}
  .tbadge-mcq{font-size:10px;font-family:var(--mono);font-weight:700;letter-spacing:2px;color:var(--g);background:#0d2018;border:1px solid #1a4030;padding:3px 10px;border-radius:100px;}
  .tbadge-num{font-size:10px;font-family:var(--mono);font-weight:700;letter-spacing:2px;color:var(--y);background:#201800;border:1px solid #403000;padding:3px 10px;border-radius:100px;}
  .btn-review{background:transparent;border:1px solid #3d1a5a;color:var(--pu);padding:5px 12px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .btn-review:hover,.btn-review.active{background:#1e0a30;}
  .q-text{font-size:16px;font-weight:500;line-height:1.8;margin-bottom:22px;color:var(--t);}
  .options{display:flex;flex-direction:column;gap:9px;margin-bottom:18px;}
  .opt{background:var(--s1);border:1.5px solid var(--b);border-radius:11px;padding:13px 16px;text-align:left;cursor:pointer;font-family:var(--font);font-size:14px;color:var(--t);transition:all .15s;display:flex;align-items:center;gap:12px;}
  .opt:hover{border-color:var(--p);background:#16143a;}
  .opt.sel{border-color:var(--p);background:#16143a;}
  .opt-l{font-family:var(--mono);font-size:11px;font-weight:700;width:26px;height:26px;border-radius:6px;background:var(--s2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--t2);transition:all .15s;}
  .opt.sel .opt-l{background:var(--p);color:white;}
  .num-input-wrap{margin-bottom:18px;}
  .num-input{width:100%;background:var(--s1);border:1.5px solid var(--b);border-radius:11px;padding:14px 16px;font-family:var(--mono);font-size:16px;color:var(--t);transition:all .15s;box-sizing:border-box;}
  .num-input::placeholder{color:var(--t2);font-family:var(--font);font-size:13px;}
  .num-input:focus{outline:none;border-color:var(--p);background:#16143a;}
  .test-actions{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:18px;}
  .btn-secondary{background:transparent;border:1.5px solid var(--b);color:var(--t2);padding:10px 22px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .btn-secondary:hover{border-color:var(--p2);color:var(--t);}
  .btn-next{background:var(--p);color:white;border:none;padding:10px 26px;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .15s;}
  .btn-next:hover{background:var(--p2);}
  .btn-primary{background:var(--p);color:white;border:none;padding:13px 36px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .2s;}
  .btn-primary:hover{background:var(--p2);transform:translateY(-2px);box-shadow:0 8px 28px rgba(124,111,255,.3);}

  /* ── NAVIGATOR ── */
  .nav-panel{background:var(--s1);border:1px solid var(--b);border-radius:14px;padding:18px;position:sticky;top:24px;}
  .nav-panel-title{font-size:10px;font-family:var(--mono);color:var(--t2);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;}
  .nav-sec-label{font-size:10px;font-family:var(--mono);letter-spacing:2px;text-transform:uppercase;margin-bottom:7px;margin-top:12px;}
  .nav-sec-label.mcq{color:var(--g);}
  .nav-sec-label.num{color:var(--y);}
  .nav-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;}
  .nb{width:100%;aspect-ratio:1;border-radius:7px;border:1.5px solid var(--b);background:var(--s2);font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;color:var(--t2);}
  .nb.cur{border-color:var(--p);color:var(--p2);background:#16143a;box-shadow:0 0 10px rgba(124,111,255,.25);}
  .nb.sa{background:#0a1f12;border-color:var(--g);color:var(--g);}
  .nb.ss{background:#201000;border-color:var(--or);color:var(--or);}
  .nb.sr{background:#18082a;border-color:var(--pu);color:var(--pu);}
  .nav-counts{display:flex;flex-direction:column;gap:4px;padding:10px 0;border-top:1px solid var(--b);border-bottom:1px solid var(--b);margin:10px 0;}
  .nc-row{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--t2);font-family:var(--mono);}
  .nc-dot{width:7px;height:7px;border-radius:2px;flex-shrink:0;}
  .nav-submit{width:100%;background:var(--p);color:white;border:none;padding:11px;border-radius:9px;font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;margin-top:4px;}
  .nav-submit:hover{background:var(--p2);}

  /* ── RESULTS ── */
  .results{display:flex;flex-direction:column;gap:22px;animation:su .5s ease;}
  .score-hero{background:var(--s1);border:1px solid var(--b);border-radius:14px;padding:32px;text-align:center;}
  .score-circle{width:110px;height:110px;border-radius:50%;border:2px solid var(--p);display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 16px;background:#16143a;box-shadow:0 0 40px rgba(124,111,255,.15);}
  .score-num{font-family:var(--mono);font-size:36px;font-weight:700;color:var(--p2);line-height:1;}
  .score-total{font-size:11px;color:var(--t2);font-family:var(--mono);}
  .score-title{font-size:20px;font-weight:700;margin-bottom:5px;}
  .score-sub{color:var(--t2);font-size:12px;font-family:var(--mono);}
  .end-quote-box{background:var(--s1);border-left:2px solid var(--p);border-radius:0 10px 10px 0;padding:16px 20px;}
  .end-qt{font-family:var(--serif);font-size:19px;color:var(--t);margin-bottom:5px;line-height:1.35;font-style:italic;}
  .end-sub{font-size:12px;color:var(--p2);font-family:var(--mono);}
  .nudge-card{background:linear-gradient(135deg,#1a1840,#16143a);border:1px solid var(--p3);border-radius:12px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
  .nudge-left{display:flex;flex-direction:column;gap:4px;}
  .nudge-title{font-size:14px;font-weight:700;}
  .nudge-sub{font-size:12px;color:var(--t2);}
  .nudge-best{font-family:var(--mono);font-size:11px;color:var(--p2);}
  .breakdown{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .bcard{background:var(--s1);border:1px solid var(--b);border-radius:11px;padding:15px;text-align:center;}
  .bnum{font-size:24px;font-weight:700;font-family:var(--mono);}
  .blbl{font-size:10px;color:var(--t2);margin-top:3px;text-transform:uppercase;letter-spacing:1px;}
  .gc{color:var(--g);}.rc{color:#ff9999;}.yc{color:var(--y);}
  .section-hdr{font-size:11px;font-weight:700;color:var(--t2);text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;font-family:var(--mono);}
  .review-list{display:flex;flex-direction:column;gap:10px;}
  .ritem{background:var(--s1);border:1px solid var(--b);border-radius:11px;padding:16px;}
  .ritem.ci{border-left:2px solid var(--g);}
  .ritem.wi{border-left:2px solid #ff8888;}
  .ritem.si{border-left:2px solid var(--y);}
  .rq{font-size:13px;font-weight:500;margin-bottom:9px;line-height:1.65;}
  .rans{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;}
  .rans span{padding:2px 10px;border-radius:100px;font-family:var(--mono);font-size:11px;}
  .ca{background:#0a1f12;color:var(--g);}
  .wa{background:#1f0a0a;color:#ff9999;}
  .ska{background:#201500;color:var(--y);}
  .sol-box{background:#0a150a;border:1px solid #1a3520;border-radius:9px;padding:13px 15px;margin-top:9px;}
  .sol-hdr{font-size:9px;font-family:var(--mono);color:var(--g);text-transform:uppercase;letter-spacing:2px;margin-bottom:7px;}
  .sol-txt{font-size:13px;color:#7ab87a;line-height:1.7;}
  .ai-box{background:var(--s2);border:1px solid var(--p3);border-radius:9px;padding:14px;margin-top:9px;}
  .ai-hdr{display:flex;align-items:center;gap:7px;margin-bottom:9px;font-size:9px;font-family:var(--mono);color:var(--p2);text-transform:uppercase;letter-spacing:2px;}
  .ai-dot{width:6px;height:6px;border-radius:50%;background:var(--p2);animation:aip 1.5s infinite;}
  @keyframes aip{0%,100%{opacity:1;}50%{opacity:.3;}}
  .ai-txt{font-size:13px;color:var(--t2);line-height:1.75;}
  .btn-ai{background:transparent;border:1px solid var(--p3);color:var(--p2);padding:7px 14px;border-radius:7px;font-size:12px;cursor:pointer;font-family:var(--font);transition:all .15s;margin-top:8px;}
  .btn-ai:hover{background:#1a1640;}
  .btn-ai:disabled{opacity:.4;cursor:not-allowed;}
  .results-actions{display:flex;gap:10px;flex-wrap:wrap;}

  /* ── PROGRESS ── */
  .progress-page{display:flex;flex-direction:column;gap:22px;}
  .pg-title{font-size:18px;font-weight:700;letter-spacing:-.3px;margin-bottom:3px;}
  .pg-sub{font-size:12px;color:var(--t2);font-family:var(--mono);}
  .graph-wrap{background:var(--s1);border:1px solid var(--b);border-radius:14px;padding:22px;}
  .graph-lbl{font-size:10px;font-family:var(--mono);color:var(--t2);text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;}
  .empty-state{text-align:center;padding:36px;color:var(--t2);font-size:13px;font-family:var(--mono);}
  .topic-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;}
  .topic-card{background:var(--s1);border:1px solid var(--b);border-radius:11px;padding:14px;}
  .topic-name{font-size:12px;font-weight:600;margin-bottom:9px;}
  .tbar-bg{height:5px;background:var(--b);border-radius:3px;}
  .tbar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--p),var(--p2));transition:width .6s;}
  .tpct{font-size:10px;color:var(--t2);margin-top:5px;font-family:var(--mono);}
  .ct{background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:10px 14px;font-family:var(--mono);font-size:12px;}
  .ct-lbl{color:var(--t2);margin-bottom:3px;}
  .ct-val{color:var(--p2);font-weight:700;font-size:14px;}


  /* ── SUBJECTS ── */
  .subj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;}
  .subj-card{background:var(--s1);border:1.5px solid var(--b);border-radius:16px;padding:32px 24px;cursor:pointer;transition:all .2s;text-align:center;position:relative;overflow:hidden;}
  .subj-card:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(124,111,255,.18);}
  .subj-card.phy{border-color:var(--p3);}
  .subj-card.phy:hover{border-color:var(--p);}
  .subj-card.che{border-color:#1a3520;}
  .subj-card.che:hover{border-color:var(--g);}
  .subj-card.mat{border-color:#201800;}
  .subj-card.mat:hover{border-color:var(--y);}
  .subj-icon{font-size:40px;margin-bottom:14px;line-height:1;}
  .subj-name{font-size:18px;font-weight:800;letter-spacing:-.3px;margin-bottom:6px;}
  .subj-desc{font-size:12px;color:var(--t2);font-family:var(--mono);}
  .subj-card.phy .subj-name{color:var(--p2);}
  .subj-card.che .subj-name{color:var(--g);}
  .subj-card.mat .subj-name{color:var(--y);}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @media(max-width:500px){.breakdown{grid-template-columns:1fr 1fr;}.year-grid{grid-template-columns:repeat(3,1fr);}}
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default S