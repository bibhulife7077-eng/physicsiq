import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import DB from './data.js'
import S from './styles.js'
import { TOTAL_TIME, fmt, progressKey, rand, getStatus,
  START_QUOTES, getEndQuote, getStreakMessage,
  seedFirestore, loadQuestionsFromFirestore, saveProgressToFirestore, loadProgressFromFirestore
} from './helpers.js'

// ChartTooltip component
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="ct"><div className="ct-lbl">Test {label}</div><div className="ct-val">{payload[0].value} pts</div></div>
  )
  return null
}

export default function App() {
  // ── Navigation hierarchy state ──
  // view controls which screen is shown
  const [view, setView]           = useState("subjects");
  const [selSubject, setSelSubject] = useState(null);
  const [selYear, setSelYear]     = useState(null);
  const [selMonth, setSelMonth]   = useState(null);
  const [selShift, setSelShift]   = useState(null);

  // ── Test state ──
  const [screen, setScreen]       = useState(null); // "countdown"|"quote"|"test"|"results"
  const [countNum, setCountNum]   = useState(3);
  const [startQuote, setStartQuote] = useState(null);
  const [answers, setAnswers]     = useState({});
  const [timeLeft, setTimeLeft]   = useState(TOTAL_TIME);
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent]     = useState(0);
  const [visited, setVisited]     = useState(new Set());
  const [marked, setMarked]       = useState(new Set());
  const [aiTexts, setAiTexts]     = useState({});
  const [aiLoading, setAiLoading] = useState({});

  // ── Progress stored per shift key ──
  const [progress, setProgress]   = useState({});
  const [dbReady, setDbReady]       = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [firestoreQuestions, setFirestoreQuestions] = useState([]);
  const timerRef = useRef(null);

  // ── On mount: seed Firestore + load all saved progress ──
  // useEffect with empty [] runs once when app first loads
  useEffect(() => {
    seedFirestore();
    // Load all progress keys from localStorage as initial state
    const allProgress = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('prog_')) {
        try { allProgress[k.replace('prog_', '')] = JSON.parse(localStorage.getItem(k)); } catch {}
      }
    }
    setProgress(allProgress);
    setDbReady(true);
  }, []);

  // Current questions array
  // QUESTIONS: use Firestore data if loaded, else fallback to local DB
  const QUESTIONS = firestoreQuestions.length > 0
    ? firestoreQuestions
    : (selYear && selMonth && selShift ? DB[selYear]?.[selMonth]?.[selShift]?.questions || [] : []);
  const MCQ_QS = QUESTIONS.filter(q => q.type === "mcq");
  const NUM_QS = QUESTIONS.filter(q => q.type === "num");

  // ── Effects ──
  useEffect(() => {
    if (screen === "test") setVisited(v => new Set([...v, current]));
  }, [current, screen]);

  useEffect(() => {
    if (screen === "test" && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); doSubmit(); return 0; } return t - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, submitted]);

  useEffect(() => {
    if (screen !== "countdown") return;
    setCountNum(3); let n = 3;
    const iv = setInterval(() => {
      n--;
      if (n === 0) { setCountNum("GO"); clearInterval(iv); setTimeout(() => setScreen("test"), 700); }
      else setCountNum(n);
    }, 900);
    return () => clearInterval(iv);
  }, [screen]);

  useEffect(() => {
    if (screen !== "quote") return;
    const t = setTimeout(() => setScreen("countdown"), 2800);
    return () => clearTimeout(t);
  }, [screen]);

  // ── Actions ──
  const goToSubjects = () => { setView("subjects"); setSelSubject(null); setSelYear(null); setSelMonth(null); setSelShift(null); };
  const goToYears  = (subj) => { if (subj) setSelSubject(subj); setView("years"); setSelYear(null); setSelMonth(null); setSelShift(null); };
  const goToMonths = (y) => { setSelYear(y);   setSelMonth(null); setSelShift(null); setView("months"); };
  const goToShifts = async (m) => {
    setSelMonth(m); setSelShift(null); setView("shifts");
    // Load progress for each shift in this month from Firestore
    if (selYear && DB[selYear]?.[m]) {
      const updates = {};
      for (const shiftKey of Object.keys(DB[selYear][m])) {
        const key  = progressKey(selYear, m, shiftKey);
        const data = await loadProgressFromFirestore(key);
        if (data) updates[key] = data;
      }
      if (Object.keys(updates).length > 0) setProgress(p => ({ ...p, ...updates }));
    }
  };

  // Load questions from Firestore when a shift is selected
  const loadShiftQuestions = async (year, month, shift) => {
    setLoadingQuestions(true);
    const qs = await loadQuestionsFromFirestore(year, month, shift);
    setFirestoreQuestions(qs);
    setLoadingQuestions(false);
  };

  const beginTest = (shiftKey) => {
    setSelShift(shiftKey);
    setFirestoreQuestions([]); // clear previous shift's questions
    setAnswers({}); setTimeLeft(TOTAL_TIME); setSubmitted(false);
    setCurrent(0); setAiTexts({}); setAiLoading({});
    setVisited(new Set([0])); setMarked(new Set());
    setStartQuote(rand(START_QUOTES));
    setScreen("quote");
    setView("test");
    // Load questions from Firestore in background
    loadShiftQuestions(selYear, selMonth, shiftKey);
  };

  const selectOption = (qi, oi) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qi]: oi }));
    setMarked(m => { const n = new Set(m); n.delete(qi); return n; });
  };

  const toggleMark = () => setMarked(m => {
    const n = new Set(m); if (n.has(current)) n.delete(current); else n.add(current); return n;
  });

  const doSubmit = () => {
    clearInterval(timerRef.current); setSubmitted(true);
    let score = 0, correct = 0, wrong = 0, skipped = 0;
    QUESTIONS.forEach((q, i) => {
      if (answers[i] === undefined) skipped++;
      else if (answers[i] === q.correct) { correct++; score += 4; }
      else { wrong++; if (q.type === "mcq") score -= 1; }
    });
    const result = {
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      score, correct, wrong, skipped,
      total: QUESTIONS.length, maxScore: QUESTIONS.length * 4,
      timeTaken: TOTAL_TIME - timeLeft, answers: { ...answers }
    };
    const key = progressKey(selYear, selMonth, selShift);
    const prev = progress[key] || { attempts: [] };
    const updated = { ...progress, [key]: { ...prev, attempts: [...prev.attempts, result], best: Math.max(result.score, ...(prev.attempts.map(a => a.score))) } };
    setProgress(updated);
    // Save to Firestore + localStorage backup
    saveProgressToFirestore(key, updated[key]);
    setView("results");
  };

  const askAI = async (qi) => {
    const q = QUESTIONS[qi];
    setAiLoading(l => ({ ...l, [qi]: true }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "You are a JEE Physics expert. Give a clear step-by-step explanation. Simple language, under 120 words. No markdown.",
          messages: [{ role: "user", content: `Q: ${q.question}\nAnswer: ${q.options[q.correct]}\nHint: ${q.solution}\n\nExplain for a JEE student.` }]
        })
      });
      const data = await res.json();
      setAiTexts(a => ({ ...a, [qi]: data.content?.[0]?.text || "Could not load." }));
    } catch { setAiTexts(a => ({ ...a, [qi]: "Could not load explanation." })); }
    setAiLoading(l => ({ ...l, [qi]: false }));
  };

  // ── Derived data ──
  const currentResult = (() => {
    if (view !== "results" || !selYear || !selMonth || !selShift) return null;
    const key = progressKey(selYear, selMonth, selShift);
    const atts = progress[key]?.attempts || [];
    return atts[atts.length - 1] || null;
  })();

  const endQuote = currentResult ? getEndQuote((currentResult.score / currentResult.maxScore) * 100) : null;
  const shiftBest = selYear && selMonth && selShift ? (progress[progressKey(selYear, selMonth, selShift)]?.best ?? null) : null;
  const isNewBest = currentResult && (shiftBest === null || currentResult.score >= shiftBest);

  // Topic accuracy across all attempts for current shift
  const topicStats = {};
  QUESTIONS.forEach(q => { topicStats[q.topic] = { correct: 0, total: 0 }; });
  if (selYear && selMonth && selShift) {
    const key = progressKey(selYear, selMonth, selShift);
    (progress[key]?.attempts || []).forEach(h => {
      QUESTIONS.forEach((q, i) => {
        topicStats[q.topic].total++;
        if (h.answers[i] === q.correct) topicStats[q.topic].correct++;
      });
    });
  }

  // Chart data for current shift
  const chartData = selYear && selMonth && selShift
    ? (progress[progressKey(selYear, selMonth, selShift)]?.attempts || []).map((h, i) => ({ name: `${i + 1}`, score: h.score }))
    : [];

  // Helper: count total questions across a year
  const yearQCount = (y) => {
    let n = 0;
    Object.values(DB[y] || {}).forEach(month =>
      Object.values(month).forEach(shift => {
        n += (shift.questions || []).length;
      })
    );
    return n;
  };

  // Helper: count shifts with data in a month
  const monthShiftCount = (y, m) => Object.values(DB[y]?.[m] || {}).filter(s => s.questions?.length > 0).length;

  // Helper: get shift progress summary
  const shiftProgress = (y, m, s) => {
    const key = progressKey(y, m, s);
    const d = progress[key];
    if (!d || !d.attempts?.length) return null;
    return { attempts: d.attempts.length, best: d.best };
  };

  const answeredCount = Object.keys(answers).length;
  const reviewCount   = marked.size;
  const skippedCount  = [...visited].filter(i => answers[i] === undefined && !marked.has(i)).length;

  // All years available, sorted newest first
  const ALL_YEARS = ["2026","2025","2024","2023","2022","2021","2020","2019"];

  return (
    <>
      <style>{S}</style>

      {/* ── COUNTDOWN ── */}
      {screen === "countdown" && (
        <div className="cd-wrap">
          <div className="cd-ring"/><div className="cd-ring"/><div className="cd-ring"/>
          <div className="cd-label">Get ready</div>
          <div className={`cd-num${countNum === "GO" ? " go" : ""}`}>{countNum}</div>
        </div>
      )}

      {/* ── QUOTE ── */}
      {screen === "quote" && startQuote && (
        <div className="qt-wrap">
          <div className="qt-eye">⚔ Battle Mode</div>
          <div className="qt-bar"/>
          <div className="qt-text">"{startQuote.text}"</div>
          <div className="qt-author">— {startQuote.author}</div>
        </div>
      )}

      {/* ── MAIN UI (not fullscreen screens) ── */}
      {screen !== "countdown" && screen !== "quote" && (
        <div className="app">

          {/* TOP NAV */}
          <nav className="topnav">
            <div className="nav-logo" onClick={goToYears}>Rank<span style={{color:"#a855f7"}}>Pilot</span></div>
            <div className="nav-tabs">
              {view === "results" && <button className="nav-tab active">Results</button>}
              {view === "test" && submitted && <button className="nav-tab" onClick={() => setView("results")}>Results</button>}
              <button className={`nav-tab${view === "progress" ? " active" : ""}`} onClick={() => setView("progress")}>Progress</button>
              <button className={`nav-tab${["subjects","years","months","shifts"].includes(view) ? " active" : ""}`} onClick={goToSubjects}>Tests</button>
            </div>
          </nav>

          {/* BREADCRUMB — shown during test navigation */}
          {["years","months","shifts","test","results"].includes(view) && (
            <div className="breadcrumb">
              <span className="bc-item" onClick={goToSubjects}>Subjects</span>
              {selSubject && <><span className="bc-sep">›</span><span className={`bc-item${view === "years" ? " active" : ""}`} onClick={() => view !== "years" && goToYears()}>{selSubject}</span></>}
              {selYear && <><span className="bc-sep">›</span><span className={`bc-item${view === "months" ? " active" : ""}`} onClick={() => view !== "months" && goToMonths(selYear)}>{selYear}</span></>}
              {selMonth && <><span className="bc-sep">›</span><span className={`bc-item${view === "shifts" ? " active" : ""}`} onClick={() => view !== "shifts" && goToShifts(selMonth)}>{selMonth}</span></>}
              {selShift && <><span className="bc-sep">›</span><span className="bc-item active">{DB[selYear]?.[selMonth]?.[selShift]?.label} · {DB[selYear]?.[selMonth]?.[selShift]?.date}</span></>}
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: SUBJECTS
          ════════════════════════════════════════ */}
          {view === "subjects" && (
            <div className="sel-screen">
              <div className="sel-header">
                <div className="sel-title">JEE Main PYQ</div>
                <div className="sel-sub">Select a subject to begin</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:dbReady?"var(--g)":"var(--y)",animation:dbReady?"none":"aip 1.5s infinite"}}/>
                  <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)",letterSpacing:1}}>{dbReady?"FIREBASE CONNECTED":"CONNECTING..."}</span>
                </div>
              </div>
              <div className="subj-grid">
                {[
                  { key:"Physics",     cls:"phy", icon:"⚡", desc:"Mechanics · Optics · Modern Physics" },
                  { key:"Chemistry",   cls:"che", icon:"🧪", desc:"Organic · Inorganic · Physical" },
                  { key:"Mathematics", cls:"mat", icon:"∑",  desc:"Algebra · Calculus · Coordinate" },
                ].map(s => (
                  <div key={s.key} className={`subj-card ${s.cls}`}
                    onClick={() => s.key === "Physics" ? goToYears(s.key) : null}
                    style={s.key !== "Physics" ? {opacity:.45, cursor:"not-allowed"} : {}}
                  >
                    <div className="subj-icon">{s.icon}</div>
                    <div className="subj-name">{s.key}</div>
                    <div className="subj-desc">{s.key === "Physics" ? s.desc : "Coming soon"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: YEARS
          ════════════════════════════════════════ */}
          {view === "years" && (
            <div className="sel-screen">
              <div className="sel-header">
                <div className="sel-title">{selSubject}</div>
                <div className="sel-sub">Select a year to begin</div>
              </div>
              <div className="year-grid">
                {ALL_YEARS.map(y => {
                  const hasData = !!DB[y] && yearQCount(y) > 0;
                  const qCount  = yearQCount(y);
                  return (
                    <div key={y} className={`year-card${hasData ? " has-data" : " empty-slot"}`} onClick={() => hasData && goToMonths(y)}>
                      {hasData && <div className="year-badge">AVAILABLE</div>}
                      <div className="year-num">{y}</div>
                      {hasData
                        ? <div className="year-count">{qCount} questions</div>
                        : <div className="coming-soon">Coming soon</div>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: MONTHS
          ════════════════════════════════════════ */}
          {view === "months" && selYear && (
            <div className="sel-screen">
              <div className="sel-header">
                <div className="sel-title">JEE Main {selYear}</div>
                <div className="sel-sub">Select an exam date</div>
              </div>
              <div className="month-grid">
                {Object.keys(DB[selYear] || {}).map(m => {
                  const shiftCount = monthShiftCount(selYear, m);
                  const totalQ = Object.values(DB[selYear][m]).reduce((acc, s) => acc + (s.questions?.length || 0), 0);
                  return (
                    <div key={m} className="month-card has-data" onClick={() => goToShifts(m)}>
                      <div className="month-name">{m}</div>
                      <div className="month-info">
                        <div className="month-shifts">{shiftCount} shift{shiftCount > 1 ? "s" : ""} · {totalQ} questions</div>
                        <div className="month-pill">{selYear}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: SHIFTS
          ════════════════════════════════════════ */}
          {view === "shifts" && selYear && selMonth && (
            <div className="sel-screen">
              <div className="sel-header">
                <div className="sel-title">{selMonth} {selYear}</div>
                <div className="sel-sub">Select a shift to start the test</div>
              </div>
              <div className="shift-grid">
                {Object.entries(DB[selYear][selMonth]).map(([shiftKey, shift]) => {
                  const prog = shiftProgress(selYear, selMonth, shiftKey);
                  const mcqCount = (shift.questions || []).filter(q => q.type === "mcq").length;
                  const numCount = (shift.questions || []).filter(q => q.type === "num").length;
                  return (
                    <div key={shiftKey} className={`shift-card${prog ? " completed" : ""}`}>
                      <div className="shift-top">
                        <div className="shift-label">{shift.label}</div>
                        <div className="shift-date">{shift.date} {selYear}</div>
                      </div>
                      <div className="shift-stats">
                        <div className="shift-stat"><span>{shift.questions?.length || 0}</span> questions</div>
                        <div className="shift-stat"><span style={{color:"var(--g)"}}>MCQ</span> {mcqCount}</div>
                        <div className="shift-stat"><span style={{color:"var(--y)"}}>NUM</span> {numCount}</div>
                        <div className="shift-stat">⏱ <span>60</span> min</div>
                      </div>
                      {prog && (
                        <div className="shift-score">
                          <div>
                            <div className="shift-score-lbl">Best score</div>
                            <div className="shift-score-acc">{prog.attempts} attempt{prog.attempts > 1 ? "s" : ""}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div className="shift-score-val">{prog.best}</div>
                            <div className="shift-score-acc">/ {(shift.questions?.length || 0) * 4} pts</div>
                          </div>
                        </div>
                      )}
                      {prog
                        ? <button className="btn-retake" onClick={() => beginTest(shiftKey)}>Retake Test →</button>
                        : <button className="btn-start" onClick={() => beginTest(shiftKey)}>Start Test →</button>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: TEST
          ════════════════════════════════════════ */}
          {view === "test" && (
            <div className="test-layout">
              {loadingQuestions && (
                <div style={{position:"fixed",inset:0,background:"rgba(9,9,15,.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:50,gap:16}}>
                  <div style={{width:40,height:40,border:"3px solid var(--p3)",borderTop:"3px solid var(--p2)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--t2)",letterSpacing:2}}>LOADING FROM FIRESTORE...</div>
                </div>
              )}
              <div>
                <div className="test-header">
                  <div className="test-counter">Question <strong>{current + 1}</strong> of {QUESTIONS.length}</div>
                  <div className={`timer${timeLeft < 180 ? " warn" : ""}`}>{fmt(timeLeft)}</div>
                </div>
                <div className="pbar-wrap"><div className="pbar-fill" style={{width:`${((current+1)/QUESTIONS.length)*100}%`}}/></div>
                <div className="q-meta">
                  <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                    <span className="topic-chip">{QUESTIONS[current]?.topic}</span>
                    <span className={QUESTIONS[current]?.type === "mcq" ? "tbadge-mcq" : "tbadge-num"}>{QUESTIONS[current]?.type === "mcq" ? "MCQ" : "NUM"}</span>
                  </div>
                  <button className={`btn-review${marked.has(current) ? " active" : ""}`} onClick={toggleMark}>{marked.has(current) ? "★ Marked" : "☆ Review"}</button>
                </div>
                <p className="q-text">{QUESTIONS[current]?.question}</p>
                <div className="options">
                  {(QUESTIONS[current]?.options || []).map((opt, oi) => (
                    <button key={oi} className={`opt${answers[current] === oi ? " sel" : ""}`} onClick={() => selectOption(current, oi)}>
                      <span className="opt-l">{["A","B","C","D"][oi]}</span>{opt}
                    </button>
                  ))}
                </div>
                <div className="test-actions">
                  <button className="btn-secondary" onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current === 0}>← Prev</button>
                  {current < QUESTIONS.length - 1
                    ? <button className="btn-next" onClick={() => setCurrent(c => c+1)}>Next →</button>
                    : <button className="btn-next" onClick={doSubmit}>Finish & Submit →</button>
                  }
                </div>
              </div>

              <div className="nav-panel">
                <div className="nav-panel-title">Navigator</div>
                <div className="nav-sec-label mcq">Section A — MCQ ({MCQ_QS.length})</div>
                <div className="nav-grid">
                  {QUESTIONS.map((q, i) => q.type !== "mcq" ? null : (
                    <button key={i} className={`nb s${getStatus(i,answers,visited,marked)}${i===current?" cur":""}`} onClick={() => setCurrent(i)}>{i+1}</button>
                  ))}
                </div>
                <div className="nav-sec-label num">Section B — NUM ({NUM_QS.length})</div>
                <div className="nav-grid">
                  {QUESTIONS.map((q, i) => q.type !== "num" ? null : (
                    <button key={i} className={`nb s${getStatus(i,answers,visited,marked)}${i===current?" cur":""}`} onClick={() => setCurrent(i)}>{i+1}</button>
                  ))}
                </div>
                <div className="nav-counts">
                  <div className="nc-row"><div className="nc-dot" style={{background:"var(--g)"}}/>{answeredCount} answered</div>
                  <div className="nc-row"><div className="nc-dot" style={{background:"var(--or)"}}/>{skippedCount} skipped</div>
                  <div className="nc-row"><div className="nc-dot" style={{background:"var(--pu)"}}/>{reviewCount} for review</div>
                </div>
                <button className="nav-submit" onClick={doSubmit}>Submit Test</button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: RESULTS
          ════════════════════════════════════════ */}
          {view === "results" && currentResult && (
            <div className="results">
              <div className="score-hero">
                <div className="score-circle">
                  <div className="score-num">{currentResult.score}</div>
                  <div className="score-total">/ {currentResult.maxScore}</div>
                </div>
                <div className="score-title">{currentResult.score>=80?"Excellent! 🔥":currentResult.score>=50?"Good effort 👊":"Keep going 💪"}</div>
                <div className="score-sub">Accuracy: {Math.round((currentResult.correct/currentResult.total)*100)}% · Time: {fmt(currentResult.timeTaken)}</div>
              </div>

              {endQuote && <div className="end-quote-box"><div className="end-qt">"{endQuote.text}"</div><div className="end-sub">{endQuote.sub}</div></div>}

              <div className="nudge-card">
                <div className="nudge-left">
                  <div className="nudge-title">{isNewBest ? "🏆 New personal best!" : `Can you beat ${shiftBest} pts?`}</div>
                  <div className="nudge-sub">{isNewBest ? "You just set a new record. Now defend it." : "One more attempt — you're closer than you think."}</div>
                  {!isNewBest && <div className="nudge-best">Best: {shiftBest} pts · This: {currentResult.score} pts</div>}
                </div>
                <button className="btn-primary" onClick={() => beginTest(selShift)}>Try Again →</button>
              </div>

              <div className="breakdown">
                <div className="bcard"><div className="bnum gc">{currentResult.correct}</div><div className="blbl">Correct</div></div>
                <div className="bcard"><div className="bnum rc">{currentResult.wrong}</div><div className="blbl">Wrong</div></div>
                <div className="bcard"><div className="bnum yc">{currentResult.skipped}</div><div className="blbl">Skipped</div></div>
              </div>

              <div>
                <div className="section-hdr">Review All Questions</div>
                <div className="review-list">
                  {QUESTIONS.map((q, i) => {
                    const ans = currentResult.answers[i], isC = ans===q.correct, isS = ans===undefined;
                    return (
                      <div key={i} className={`ritem ${isS?"si":isC?"ci":"wi"}`}>
                        <div style={{display:"flex",gap:6,marginBottom:7,flexWrap:"wrap"}}>
                          <span className={q.type==="mcq"?"tbadge-mcq":"tbadge-num"}>{q.type.toUpperCase()}</span>
                          <span className="topic-chip">{q.topic}</span>
                          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)",padding:"3px 8px",background:"var(--s2)",borderRadius:100}}>{selYear} {selMonth} {DB[selYear]?.[selMonth]?.[selShift]?.label}</span>
                        </div>
                        <div className="rq">Q{i+1}. {q.question}</div>
                        <div className="rans">
                          <span className="ca">✓ {q.options[q.correct]}</span>
                          {!isS&&!isC&&<span className="wa">✗ {q.options[ans]}</span>}
                          {isS&&<span className="ska">Skipped</span>}
                        </div>
                        <div className="sol-box"><div className="sol-hdr">Solution</div><div className="sol-txt">{q.solution}</div></div>
                        {!aiTexts[i]
                          ?<button className="btn-ai" onClick={()=>askAI(i)} disabled={aiLoading[i]}>{aiLoading[i]?"✦ Loading...":"✦ Explain with AI"}</button>
                          :<div className="ai-box"><div className="ai-hdr"><div className="ai-dot"/>AI Explanation</div><div className="ai-txt">{aiTexts[i]}</div></div>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="results-actions">
                <button className="btn-primary" onClick={() => beginTest(selShift)}>Take Again →</button>
                <button className="btn-secondary" onClick={() => setView("shifts")}>← Back to Shifts</button>
                <button className="btn-secondary" onClick={() => setView("progress")}>Progress</button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: PROGRESS
          ════════════════════════════════════════ */}
          {view === "progress" && (
            <div className="progress-page">
              <div><div className="pg-title">Your Progress</div><div className="pg-sub">All attempts across shifts</div></div>

              {/* Score chart for current shift if selected */}
              {selYear && selMonth && selShift && chartData.length > 0 && (
                <div className="graph-wrap">
                  <div className="graph-lbl">{selYear} {selMonth} {DB[selYear]?.[selMonth]?.[selShift]?.label} — Score History</div>
                  {chartData.length === 1
                    ? <div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontFamily:"var(--mono)",fontSize:28,fontWeight:700,color:"var(--p2)"}}>{chartData[0].score}</div><div style={{fontSize:12,color:"var(--t2)",marginTop:4,fontFamily:"var(--mono)"}}>First attempt</div></div>
                    : <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}>
                          <XAxis dataKey="name" tick={{fill:"#6868a0",fontSize:11}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:"#6868a0",fontSize:11}} axisLine={false} tickLine={false} domain={["auto","auto"]}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          {shiftBest && <ReferenceLine y={shiftBest} stroke="#a89dff" strokeDasharray="4 4" strokeWidth={1}/>}
                          <Line type="monotone" dataKey="score" stroke="#7c6fff" strokeWidth={2} dot={{fill:"#a89dff",r:4,strokeWidth:0}} activeDot={{r:6,fill:"#a89dff"}}/>
                        </LineChart>
                      </ResponsiveContainer>
                  }
                </div>
              )}

              {/* Summary across all shifts */}
              <div>
                <div className="section-hdr">All Shifts Attempted</div>
                {Object.keys(progress).length === 0
                  ? <div className="empty-state">No tests taken yet. Pick a year and start.</div>
                  : <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {Object.entries(progress).map(([key, data]) => {
                        if (!data.attempts?.length) return null;
                        const [y, m, s] = key.split("_");
                        const shiftLabel = DB[y]?.[m]?.[s]?.label || s;
                        return (
                          <div key={key} style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                            <div>
                              <div style={{fontSize:13,fontWeight:600}}>{y} · {m} · {shiftLabel}</div>
                              <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:3}}>{data.attempts.length} attempt{data.attempts.length>1?"s":""}</div>
                            </div>
                            <div style={{display:"flex",gap:16,alignItems:"center"}}>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:700,color:"var(--p2)"}}>{data.best}</div>
                                <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)"}}>best score</div>
                              </div>
                              <button className="btn-retake" style={{width:"auto",padding:"8px 16px"}} onClick={() => { setSelYear(y); setSelMonth(m); beginTest(s); }}>Retake</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                }
              </div>

              {/* Topic accuracy */}
              {selYear && selMonth && selShift && Object.values(topicStats).some(s => s.total > 0) && (
                <div>
                  <div className="section-hdr">Accuracy by Topic — {selYear} {selMonth} {DB[selYear]?.[selMonth]?.[selShift]?.label}</div>
                  <div className="topic-grid">
                    {Object.entries(topicStats).filter(([,s]) => s.total > 0).map(([topic, stat]) => {
                      const pct = Math.round((stat.correct/stat.total)*100);
                      return (
                        <div key={topic} className="topic-card">
                          <div className="topic-name">{topic}</div>
                          <div className="tbar-bg"><div className="tbar-fill" style={{width:`${pct}%`}}/></div>
                          <div className="tpct">{pct}% accuracy</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={goToSubjects}>← Browse All Tests</button>
            </div>
          )}

        </div>
      )}
    </>
  );
}
