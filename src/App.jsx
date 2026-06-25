import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import DB from './data.js'
import S from './styles.js'
import { TOTAL_TIME, fmt, progressKey, rand, getStatus,
  START_QUOTES, getEndQuote, getStreakMessage,
  seedFirestore, loadQuestionsFromFirestore, saveProgressToFirestore, loadProgressFromFirestore
} from './helpers.js'

// ─── Image map (auto-discovers everything in src/images/) ────────────────────
const imageModules = import.meta.glob('./images/*', { eager: true });
const IMAGE_MAP = {};
for (const [path, mod] of Object.entries(imageModules)) {
  IMAGE_MAP[path.replace('./images/', '')] = mod.default ?? mod;
}

// ─── KaTeX loader ─────────────────────────────────────────────────────────────
// Loads KaTeX from CDN once, then sets window.__katexReady = true.
// Components call renderMath() which uses window.katex if available,
// or falls back to the raw LaTeX string if not yet loaded.
let katexLoadStarted = false;
function ensureKatex() {
  if (katexLoadStarted || typeof window === 'undefined') return;
  katexLoadStarted = true;
  if (!document.getElementById('katex-css')) {
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    document.head.appendChild(link);
  }
  if (!document.getElementById('katex-js')) {
    const script = document.createElement('script');
    script.id = 'katex-js';
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
    script.onload = () => { window.__katexReady = true; };
    document.head.appendChild(script);
  }
}
ensureKatex();

// Render a single string segment that may contain $...$ inline math.
// Splits on $ delimiters, alternates text/math, returns an array of React nodes.
function renderInlineMath(text, key = 0) {
  if (!text) return null;
  const parts = text.split(/(\$[^$\n]+\$)/g);
  if (parts.length === 1) return <span key={key}>{text}</span>;
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          if (window.__katexReady && window.katex) {
            try {
              const html = window.katex.renderToString(math, { throwOnError: false, displayMode: false });
              return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
            } catch { return <span key={i}>{part}</span>; }
          }
          // KaTeX not yet loaded — render as styled fallback so it's readable
          return <code key={i} style={{fontFamily:'var(--mono)',fontSize:'0.9em',color:'var(--p2)'}}>{math}</code>;
        }
        return part ? <span key={i}>{part}</span> : null;
      })}
    </span>
  );
}

// Detect and render a markdown pipe table (| col | col | ...).
// Returns rendered JSX table or null if the text is not a table.
function renderTable(lines) {
  const tableLines = lines.filter(l => l.trim().startsWith('|'));
  if (tableLines.length < 2) return null;

  const parseRow = (line) =>
    line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

  const isSepRow = (line) => /^\|[\s|:-]+\|$/.test(line.trim()) || line.replace(/[\s|:-]/g, '') === '';

  const headers = parseRow(tableLines[0]);
  const rows = tableLines.slice(2).filter(l => !isSepRow(l)).map(parseRow);

  return (
    <div style={{ overflowX: 'auto', margin: '10px 0 14px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: 'var(--t)' }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid var(--b)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '6px 12px', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t2)', fontWeight: 700, background: 'var(--s2)', whiteSpace: 'nowrap' }}>
                {renderInlineMath(h, i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid var(--b)' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '7px 12px', verticalAlign: 'top', lineHeight: 1.6 }}>
                  {renderInlineMath(cell, ci)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main text renderer: preserves \n line breaks, renders markdown tables,
// renders $...$ inline math, and handles $$...$$ block math.
function Render({ text, size = 'md' }) {
  const [, forceUpdate] = useState(0);
  // Re-render once KaTeX loads so math displays properly
  useEffect(() => {
    if (window.__katexReady) return;
    const iv = setInterval(() => {
      if (window.__katexReady) { clearInterval(iv); forceUpdate(n => n + 1); }
    }, 200);
    return () => clearInterval(iv);
  }, []);

  if (!text) return null;

  const fontSize = size === 'sm' ? 13 : 16;
  const lineH    = size === 'sm' ? 1.7 : 1.8;
  const fontW    = size === 'sm' ? 400 : 500;

  // Handle block math $$...$$ spanning multiple lines
  const blockMathRegex = /\$\$([\s\S]+?)\$\$/g;
  const segments = [];
  let last = 0, bMatch;
  while ((bMatch = blockMathRegex.exec(text)) !== null) {
    if (bMatch.index > last) segments.push({ type: 'text', content: text.slice(last, bMatch.index) });
    segments.push({ type: 'block-math', content: bMatch[1].trim() });
    last = bMatch.index + bMatch[0].length;
  }
  if (last < text.length) segments.push({ type: 'text', content: text.slice(last) });

  return (
    <div style={{ fontSize, lineHeight: lineH, fontWeight: fontW, color: 'var(--t)' }}>
      {segments.map((seg, si) => {
        if (seg.type === 'block-math') {
          if (window.__katexReady && window.katex) {
            try {
              const html = window.katex.renderToString(seg.content, { throwOnError: false, displayMode: true });
              return <div key={si} style={{ overflowX: 'auto', margin: '8px 0', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: html }} />;
            } catch { /**/ }
          }
          return <div key={si} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--p2)', margin: '6px 0', overflowX: 'auto' }}>{seg.content}</div>;
        }

        // Split text segment into lines
        const lines = seg.content.split('\n');

        // Check if this segment is a markdown table
        const tableHasHeader = lines.some(l => l.trim().startsWith('|'));
        if (tableHasHeader) {
          const table = renderTable(lines);
          if (table) return <div key={si}>{table}</div>;
        }

        // Regular paragraph/line rendering
        const nodes = [];
        let paraLines = [];
        const flushPara = () => {
          if (!paraLines.length) return;
          const content = paraLines.join(' ');
          nodes.push(
            <p key={nodes.length} style={{ margin: '0 0 8px 0', lineHeight: lineH, fontSize, fontWeight: fontW, color: 'var(--t)' }}>
              {renderInlineMath(content)}
            </p>
          );
          paraLines = [];
        };

        // Buffers for grouping consecutive Match-the-List items and Assertion/Reason pairs
        let listBuffer = [];      // collects {label, text} entries for the current List I/List II block
        let listHeading = null;   // heading text for the list block currently being collected ("List I", "List II", ...)
        let arBuffer = [];        // collects {label, text} for Assertion/Reason

        const flushList = () => {
          if (!listBuffer.length) { listHeading = null; return; }
          nodes.push(
            <div key={nodes.length} style={{ margin: '4px 0 12px', border: '1px solid var(--b)', borderRadius: 10, overflow: 'hidden' }}>
              {listHeading && (
                <div style={{ padding: '7px 12px', background: 'var(--s2)', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--t2)', letterSpacing: 0.5 }}>
                  {listHeading}
                </div>
              )}
              <div>
                {listBuffer.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderTop: idx === 0 ? 'none' : '1px solid var(--b)' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--p2)', minWidth: 26, fontSize }}>{item.label}</span>
                    <span style={{ fontSize, lineHeight: lineH, fontWeight: fontW }}>{renderInlineMath(item.text)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
          listBuffer = [];
          listHeading = null;
        };

        const flushAR = () => {
          if (!arBuffer.length) return;
          nodes.push(
            <div key={nodes.length} style={{ margin: '4px 0 12px', border: '1px solid var(--b)', borderRadius: 10, overflow: 'hidden' }}>
              {arBuffer.map((item, idx) => (
                <div key={idx} style={{ padding: '10px 12px', borderTop: idx === 0 ? 'none' : '1px solid var(--b)' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--p2)', fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize, lineHeight: lineH, fontWeight: fontW }}>{renderInlineMath(item.text.trim())}</div>
                </div>
              ))}
            </div>
          );
          arBuffer = [];
        };

        // Heading for a List I / List II block, e.g. "List I" or "List-II:"
        const listHeadingRe = /^List[\s\-]*(I{1,2}|[0-9])\s*[:\-]?\s*$/i;
        // A single list entry: "I. Photon", "P. xxx", "1. xxx", "(A) xxx", "a. xxx"
        const listItemRe = /^(\(?[A-Za-z0-9]{1,3}\)?)[.\):]\s+(.*)$/;
        // Assertion / Reason / Statement-I / Statement-II lines.
        // Matches "Assertion:", "Assertion A:", "Reason:", "Reason R:",
        // "Statement I:", "Statement-II:", etc. The optional trailing
        // identifier (A, R, I, II, 1, 2...) is captured separately so the
        // label can still be normalized for display.
        const arRe = /^(Assertion|Reason|Statement)(?=[\s:\-])\s*[-\s]?\s*([A-Za-z0-9]{0,3})\s*[:\-]\s*(.*)$/i;
        // Final answer-choice lines like "(A) Both A and R are true..." — render as plain standalone lines
        const choiceRe = /^[A-D][.\)]\s/;

        lines.forEach((line) => {
          const trimmed = line.trim();

          if (trimmed === '') {
            flushPara(); flushList(); flushAR();
            return;
          }

          // List I / List II heading
          if (listHeadingRe.test(trimmed)) {
            flushPara(); flushAR();
            if (listBuffer.length) flushList(); // new heading starts a new block
            listHeading = trimmed.replace(/[:\-]\s*$/, '');
            return;
          }

          const arMatch = trimmed.match(arRe);
          if (arMatch) {
            flushPara(); flushList();
            const base = arMatch[1];          // "Assertion" | "Reason" | "Statement"
            const ident = arMatch[2];         // "A" | "R" | "I" | "II" | "1" | "" etc.
            const label = ident ? `${base} ${ident}` : base;
            arBuffer.push({ label, text: arMatch[3] });
            return;
          }

          // If we're in the middle of collecting an Assertion/Reason block and this
          // line doesn't start a new A/R label, treat it as a continuation line of
          // the most recent entry (preserves multi-line Assertion/Reason text from JSON
          // instead of breaking out into a separate paragraph).
          if (arBuffer.length && !listHeadingRe.test(trimmed) && !listItemRe.test(trimmed) && !choiceRe.test(trimmed)) {
            arBuffer[arBuffer.length - 1].text += ' ' + trimmed;
            return;
          }

          const listMatch = trimmed.match(listItemRe);
          if (listMatch && listHeading !== null) {
            // Inside a List I/II block — collect as an entry
            flushPara(); flushAR();
            listBuffer.push({ label: listMatch[1], text: listMatch[2] });
            return;
          }

          // Anything else flushes any open list/AR block
          flushList(); flushAR();

          if (choiceRe.test(trimmed)) {
            flushPara();
            nodes.push(
              <p key={nodes.length} style={{ margin: '0 0 6px 0', lineHeight: lineH, fontSize, fontWeight: fontW, color: 'var(--t)' }}>
                {renderInlineMath(trimmed)}
              </p>
            );
          } else {
            paraLines.push(trimmed);
          }
        });
        flushPara(); flushList(); flushAR();
        return <div key={si}>{nodes}</div>;
      })}
    </div>
  );
}

// Question image component — looks up bundled image; shows a visible
// placeholder (instead of disappearing silently) if the file isn't bundled.
function QuestionImage({ filename }) {
  if (!filename) return null;
  const src = IMAGE_MAP[filename];
  if (!src) {
    // Always warn (not just in DEV) so a missing/misnamed asset is debuggable in production too.
    console.warn(`QuestionImage: "${filename}" not found in src/images/. Available: ${Object.keys(IMAGE_MAP).join(', ') || '(none)'}`);
    return (
      <div style={{ margin: '0 0 18px 0', borderRadius: 10, border: '1px dashed var(--b)', background: 'var(--s1)', padding: '18px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>🖼️</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t2)' }}>
          Diagram missing: <strong>{filename}</strong>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t2)', marginTop: 4, opacity: 0.7 }}>
          Check it's placed in src/images/ with this exact filename and was included in the deploy.
        </div>
      </div>
    );
  }
  return (
    <div style={{ margin: '0 0 18px 0', borderRadius: 10, overflow: 'hidden', background: 'var(--s1)', border: '1px solid var(--b)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <img src={src} alt="Question diagram" style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 6 }} />
    </div>
  );
}

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
    : (selSubject && selYear && selMonth && selShift ? DB[selSubject]?.[selYear]?.[selMonth]?.[selShift]?.questions || [] : []);
  const MCQ_QS = QUESTIONS.filter(q => q.type === "mcq");
  const NUM_QS = QUESTIONS.filter(q => q.type === "numerical");

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
    if (selSubject && selYear && DB[selSubject]?.[selYear]?.[m]) {
      const updates = {};
      for (const shiftKey of Object.keys(DB[selSubject][selYear][m])) {
        const key  = progressKey(selSubject, selYear, m, shiftKey);
        const data = await loadProgressFromFirestore(key);
        if (data) updates[key] = data;
      }
      if (Object.keys(updates).length > 0) setProgress(p => ({ ...p, ...updates }));
    }
  };

  // Load questions from Firestore when a shift is selected
  const loadShiftQuestions = async (subject, year, month, shift) => {
    setLoadingQuestions(true);
    const qs = await loadQuestionsFromFirestore(subject, year, month, shift);
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
    loadShiftQuestions(selSubject, selYear, selMonth, shiftKey);
  };

  const selectOption = (qi, oi) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qi]: oi }));
    setMarked(m => { const n = new Set(m); n.delete(qi); return n; });
  };

  const setNumericAnswer = (qi, value) => {
    if (submitted) return;
    setAnswers(a => {
      const n = { ...a };
      if (value === "") delete n[qi]; // empty input = unanswered/skipped, not a "0" answer
      else n[qi] = value;
      return n;
    });
    setMarked(m => { const n = new Set(m); n.delete(qi); return n; });
  };

  // Numerical answers are typed free text, so compare as numbers when possible
  // (so "5" matches "5.0" etc.), falling back to a trimmed string compare.
  const isAnswerCorrect = (q, userAnswer) => {
    if (userAnswer === undefined) return false;
    if (q.type === "numerical") {
      const userNum = Number(userAnswer), correctNum = Number(q.correct);
      if (!Number.isNaN(userNum) && !Number.isNaN(correctNum)) return userNum === correctNum;
      return String(userAnswer).trim() === String(q.correct).trim();
    }
    return userAnswer === q.correct;
  };

  const toggleMark = () => setMarked(m => {
    const n = new Set(m); if (n.has(current)) n.delete(current); else n.add(current); return n;
  });

  const doSubmit = () => {
    clearInterval(timerRef.current); setSubmitted(true);
    let score = 0, correct = 0, wrong = 0, skipped = 0;
    QUESTIONS.forEach((q, i) => {
      if (answers[i] === undefined) skipped++;
      else if (isAnswerCorrect(q, answers[i])) { correct++; score += 4; }
      else { wrong++; if (q.type === "mcq") score -= 1; }
    });
    const result = {
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      score, correct, wrong, skipped,
      total: QUESTIONS.length, maxScore: QUESTIONS.length * 4,
      timeTaken: TOTAL_TIME - timeLeft, answers: { ...answers }
    };
    const key = progressKey(selSubject, selYear, selMonth, selShift);
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
          system: `You are a JEE ${selSubject || "Physics"} expert. Give a clear step-by-step explanation. Simple language, under 120 words. No markdown.`,
          messages: [{ role: "user", content: `Q: ${q.question}\nAnswer: ${q.type === "mcq" ? q.options[q.correct] : q.correct}\nHint: ${q.solution}\n\nExplain for a JEE student.` }]
        })
      });
      const data = await res.json();
      setAiTexts(a => ({ ...a, [qi]: data.content?.[0]?.text || "Could not load." }));
    } catch { setAiTexts(a => ({ ...a, [qi]: "Could not load explanation." })); }
    setAiLoading(l => ({ ...l, [qi]: false }));
  };

  // ── Derived data ──
  const currentResult = (() => {
    if (view !== "results" || !selSubject || !selYear || !selMonth || !selShift) return null;
    const key = progressKey(selSubject, selYear, selMonth, selShift);
    const atts = progress[key]?.attempts || [];
    return atts[atts.length - 1] || null;
  })();

  const endQuote = currentResult ? getEndQuote((currentResult.score / currentResult.maxScore) * 100) : null;
  const shiftBest = selSubject && selYear && selMonth && selShift ? (progress[progressKey(selSubject, selYear, selMonth, selShift)]?.best ?? null) : null;
  const isNewBest = currentResult && (shiftBest === null || currentResult.score >= shiftBest);

  // Topic accuracy across all attempts for current shift
  const topicStats = {};
  QUESTIONS.forEach(q => { topicStats[q.topic] = { correct: 0, total: 0 }; });
  if (selSubject && selYear && selMonth && selShift) {
    const key = progressKey(selSubject, selYear, selMonth, selShift);
    (progress[key]?.attempts || []).forEach(h => {
      QUESTIONS.forEach((q, i) => {
        topicStats[q.topic].total++;
        if (isAnswerCorrect(q, h.answers[i])) topicStats[q.topic].correct++;
      });
    });
  }

  // Chart data for current shift
  const chartData = selSubject && selYear && selMonth && selShift
    ? (progress[progressKey(selSubject, selYear, selMonth, selShift)]?.attempts || []).map((h, i) => ({ name: `${i + 1}`, score: h.score }))
    : [];

  // Helper: count total questions across a year for the current subject
  const yearQCount = (y) => {
    let n = 0;
    Object.values(DB[selSubject]?.[y] || {}).forEach(month =>
      Object.values(month).forEach(shift => { n += (shift.questions || []).length; })
    );
    return n;
  };

  // Helper: count shifts with data in a month
  const monthShiftCount = (y, m) => Object.values(DB[selSubject]?.[y]?.[m] || {}).filter(s => s.questions?.length > 0).length;

  // Helper: get shift progress summary
  const shiftProgress = (subj, y, m, s) => {
    const key = progressKey(subj, y, m, s);
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
              {selShift && <><span className="bc-sep">›</span><span className="bc-item active">{DB[selSubject]?.[selYear]?.[selMonth]?.[selShift]?.label} · {DB[selSubject]?.[selYear]?.[selMonth]?.[selShift]?.date}</span></>}
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
                  <div key={s.key} className={`subj-card ${s.cls}`} onClick={() => goToYears(s.key)}>
                    <div className="subj-icon">{s.icon}</div>
                    <div className="subj-name">{s.key}</div>
                    <div className="subj-desc">{s.desc}</div>
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
                  const qCount = yearQCount(y);
                  return (
                    <div key={y} className="year-card has-data" onClick={() => goToMonths(y)}>
                      <div className="year-num">{y}</div>
                      {qCount > 0
                        ? <><div className="year-badge">AVAILABLE</div><div className="year-count">{qCount} questions</div></>
                        : <div className="coming-soon">Select to explore</div>
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
                {(() => {
                  const months = Object.keys(DB[selSubject]?.[selYear] || {});
                  return months.map(m => {
                    const shiftCount = monthShiftCount(selYear, m);
                    const totalQ     = Object.values(DB[selSubject]?.[selYear]?.[m] || {}).reduce((acc, s) => acc + (s.questions?.length || 0), 0);
                    return (
                      <div key={m} className="month-card has-data" onClick={() => goToShifts(m)}>
                        <div className="month-name">{m}</div>
                        <div className="month-info">
                          <div className="month-shifts">{shiftCount} shift{shiftCount > 1 ? "s" : ""} · {totalQ} questions</div>
                          <div className="month-pill">{selYear}</div>
                        </div>
                      </div>
                    );
                  });
                })()}
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
                {(() => {
                  const entries = Object.entries(DB[selSubject]?.[selYear]?.[selMonth] || {});
                  return entries.map(([shiftKey, shift]) => {
                    const prog     = shiftProgress(selSubject, selYear, selMonth, shiftKey);
                    const hasQs    = (shift.questions?.length || 0) > 0;
                    const mcqCount = (shift.questions || []).filter(q => q.type === "mcq").length;
                    const numCount = (shift.questions || []).filter(q => q.type === "numerical").length;
                    return (
                      <div key={shiftKey} className={`shift-card${prog ? " completed" : ""}`}>
                        <div className="shift-top">
                          <div className="shift-label">{shift.label}</div>
                          <div className="shift-date">{shift.date ? `${shift.date} ${selYear}` : selYear}</div>
                        </div>
                        {hasQs && (
                          <div className="shift-stats">
                            <div className="shift-stat"><span>{shift.questions?.length || 0}</span> questions</div>
                            <div className="shift-stat"><span style={{color:"var(--g)"}}>MCQ</span> {mcqCount}</div>
                            <div className="shift-stat"><span style={{color:"var(--y)"}}>NUM</span> {numCount}</div>
                            <div className="shift-stat">⏱ <span>60</span> min</div>
                          </div>
                        )}
                        {prog && hasQs && (
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
                        {hasQs
                          ? prog
                            ? <button className="btn-retake" onClick={() => beginTest(shiftKey)}>Retake Test →</button>
                            : <button className="btn-start" onClick={() => beginTest(shiftKey)}>Start Test →</button>
                          : <div style={{textAlign:"center",padding:"16px 0",fontFamily:"var(--mono)",fontSize:12,color:"var(--t2)",letterSpacing:1}}>Questions coming soon</div>
                        }
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              VIEW: TEST
          ════════════════════════════════════════ */}
          {view === "test" && QUESTIONS.length === 0 && !loadingQuestions && (
            <div className="sel-screen">
              <div style={{textAlign:"center",padding:"60px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
                <div style={{fontSize:40}}>📚</div>
                <div style={{fontSize:18,fontWeight:700}}>Questions coming soon</div>
                <div style={{fontSize:13,color:"var(--t2)",fontFamily:"var(--mono)"}}>We're adding {selSubject} questions for {selYear} {selMonth}.</div>
                <button className="btn-secondary" onClick={() => setView("shifts")} style={{marginTop:8}}>← Back to Shifts</button>
              </div>
            </div>
          )}

          {view === "test" && QUESTIONS.length > 0 && (
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
                <QuestionImage filename={QUESTIONS[current]?.image} />
                <div className="q-text"><Render text={QUESTIONS[current]?.question} /></div>
                {QUESTIONS[current]?.type === "mcq" ? (
                  <div className="options">
                    {(QUESTIONS[current]?.options || []).map((opt, oi) => (
                      <button key={oi} className={`opt${answers[current] === oi ? " sel" : ""}`} onClick={() => selectOption(current, oi)}>
                        <span className="opt-l">{["A","B","C","D"][oi]}</span>
                        <span className="opt-text"><Render text={opt} size="sm" /></span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="num-input-wrap">
                    <input
                      key={current}
                      type="text"
                      inputMode="decimal"
                      className="num-input"
                      placeholder="Type your numeric answer (e.g. 5625 or -3.5)"
                      defaultValue={answers[current] ?? ""}
                      onChange={(e) => {
                        // allow digits, one leading minus, one decimal point while typing
                        const v = e.target.value;
                        if (v === "" || /^-?\d*\.?\d*$/.test(v)) setNumericAnswer(current, v);
                      }}
                    />
                  </div>
                )}
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
                  {QUESTIONS.map((q, i) => q.type !== "numerical" ? null : (
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
                    const ans = currentResult.answers[i], isC = isAnswerCorrect(q, ans), isS = ans===undefined;
                    return (
                      <div key={i} className={`ritem ${isS?"si":isC?"ci":"wi"}`}>
                        <div style={{display:"flex",gap:6,marginBottom:7,flexWrap:"wrap"}}>
                          <span className={q.type==="mcq"?"tbadge-mcq":"tbadge-num"}>{q.type==="mcq"?"MCQ":"NUM"}</span>
                          <span className="topic-chip">{q.topic}</span>
                          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t2)",padding:"3px 8px",background:"var(--s2)",borderRadius:100}}>{selYear} {selMonth} {DB[selSubject]?.[selYear]?.[selMonth]?.[selShift]?.label}</span>
                        </div>
                        <div className="rq"><strong>Q{i+1}.</strong> <Render text={q.question} size="sm" /></div>
                        <div className="rans">
                          <span className="ca">✓ {q.type==="mcq" ? <Render text={q.options[q.correct]} size="sm" /> : q.correct}</span>
                          {!isS&&!isC&&<span className="wa">✗ {q.type==="mcq" ? <Render text={q.options[ans]} size="sm" /> : ans}</span>}
                          {isS&&<span className="ska">Skipped</span>}
                        </div>
                        <div className="sol-box"><div className="sol-hdr">Solution</div><div className="sol-txt"><Render text={q.solution} size="sm" /></div></div>
                        {!aiTexts[i]
                          ?<button className="btn-ai" onClick={()=>askAI(i)} disabled={aiLoading[i]}>{aiLoading[i]?"✦ Loading...":"✦ Explain with AI"}</button>
                          :<div className="ai-box"><div className="ai-hdr"><div className="ai-dot"/>AI Explanation</div><div className="ai-txt"><Render text={aiTexts[i]} size="sm" /></div></div>
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
                  <div className="graph-lbl">{selYear} {selMonth} {DB[selSubject]?.[selYear]?.[selMonth]?.[selShift]?.label} — Score History</div>
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
                        const [subj, y, m, s] = key.split("_");
                        const shiftLabel = DB[subj]?.[y]?.[m]?.[s]?.label || s;
                        return (
                          <div key={key} style={{background:"var(--s1)",border:"1px solid var(--b)",borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                            <div>
                              <div style={{fontSize:13,fontWeight:600}}>{subj} · {y} · {m} · {shiftLabel}</div>
                              <div style={{fontSize:11,color:"var(--t2)",fontFamily:"var(--mono)",marginTop:3}}>{data.attempts.length} attempt{data.attempts.length>1?"s":""}</div>
                            </div>
                            <div style={{display:"flex",gap:16,alignItems:"center"}}>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:700,color:"var(--p2)"}}>{data.best}</div>
                                <div style={{fontSize:10,color:"var(--t2)",fontFamily:"var(--mono)"}}>best score</div>
                              </div>
                              <button className="btn-retake" style={{width:"auto",padding:"8px 16px"}} onClick={() => { setSelSubject(subj); setSelYear(y); setSelMonth(m); beginTest(s); }}>Retake</button>
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
                  <div className="section-hdr">Accuracy by Topic — {selYear} {selMonth} {DB[selSubject]?.[selYear]?.[selMonth]?.[selShift]?.label}</div>
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
