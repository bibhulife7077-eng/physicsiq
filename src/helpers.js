// ─── CONSTANTS & HELPERS ─────────────────────────────────────────────────────
import { db, doc, getDoc, setDoc, collection, getDocs, writeBatch } from './firebase.js'
import DB from './data.js'


const TOTAL_TIME = 60 * 60;
const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const loadProgress = () => { try { return JSON.parse(localStorage.getItem("jee_prog") || "{}"); } catch { return {}; } };
const saveProgress = p => localStorage.setItem("jee_prog", JSON.stringify(p));
const progressKey = (year, month, shift) => `${year}_${month}_${shift}`;
const rand = arr => arr[Math.floor(Math.random()*arr.length)];
const getStatus = (i, answers, visited, marked) => {
  if (marked.has(i)) return "r";
  if (answers[i] !== undefined) return "a";
  if (visited.has(i)) return "s";
  return "u";
};

const START_QUOTES = [
  { text: "Every question is a battle. Win them one by one.", author: "JEE Warrior" },
  { text: "Pain is temporary. Your IIT rank is forever.", author: "Battle Creed" },
  { text: "They'll sleep. You'll grind. That's the difference.", author: "The Grind" },
  { text: "No shortcuts. No excuses. Only Physics.", author: "The Code" },
  { text: "The exam doesn't test what you know — it tests how hard you fought to know it.", author: "IIT Mindset" },
];

const getEndQuote = pct => {
  if (pct >= 80) return { text: "That's how champions finish. Now do it again.", sub: "Can you beat that score?" };
  if (pct >= 50) return { text: "Good battle. The next one, you finish stronger.", sub: "One more attempt — you're closer than you think." };
  if (pct >= 25) return { text: "You showed up. That already puts you ahead.", sub: "Take the test again. Watch what changes." };
  return { text: "Every legend has a bad day. Come back stronger.", sub: "Your next attempt will surprise you." };
};


// ─── FIRESTORE HELPERS ───────────────────────────────────────────────────────
// These functions talk to Firebase Firestore (Google's cloud database)
// 
// Firestore path structure (like folders on a computer):
//   pyq / {year} / months / {month} / shifts / {shift}            → shift info
//   pyq / {year} / months / {month} / shifts / {shift} / questions → questions
//   progress / {key}                                               → your scores
//
// "async" means the function waits for the internet before continuing
// "await" means "wait here until this step finishes"
// "try/catch" means "try this, and if it fails, do the catch part instead"

// SEED: Upload all local questions to Firestore (runs only once ever)
// After first run, the questions live in Firestore and you manage them there
const seedFirestore = async () => {
  try {
    const sentinelRef = doc(db, 'meta', 'seeded')
    const sentinel    = await getDoc(sentinelRef)
    if (sentinel.exists()) return // already seeded, skip

    const batch = writeBatch(db) // batch = send many writes at once (faster, cheaper)

    for (const [year, months] of Object.entries(DB)) {
      for (const [month, shifts] of Object.entries(months)) {
        for (const [shiftKey, shift] of Object.entries(shifts)) {
          // Save shift info
          const shiftRef = doc(db, 'pyq', year, 'months', month, 'shifts', shiftKey)
          batch.set(shiftRef, { label: shift.label, date: shift.date, totalQ: shift.totalQ, year, month, shiftKey })
          // Save each question
          for (const q of shift.questions) {
            const qRef = doc(db, 'pyq', year, 'months', month, 'shifts', shiftKey, 'questions', String(q.id))
            batch.set(qRef, { id: q.id, type: q.type, topic: q.topic, question: q.question, options: q.options, correct: q.correct, solution: q.solution, year, month, shiftKey })
          }
        }
      }
    }

    batch.set(sentinelRef, { seeded: true, seededAt: new Date().toISOString() })
    await batch.commit()
    console.log('✅ Firestore seeded with 75 questions')
  } catch (err) {
    console.warn('Seed failed (check Firestore rules):', err.message)
  }
}

// LOAD QUESTIONS: Get questions for a shift from Firestore
// If Firestore fails (no internet), falls back to the local DB in this file
const loadQuestionsFromFirestore = async (year, month, shift) => {
  try {
    const colRef = collection(db, 'pyq', year, 'months', month, 'shifts', shift, 'questions')
    const snap   = await getDocs(colRef)
    if (snap.empty) throw new Error('No questions found in Firestore')
    return snap.docs.map(d => d.data()).sort((a, b) => a.id - b.id)
  } catch (e) {
    console.warn('Using local fallback:', e.message)
    return DB[year]?.[month]?.[shift]?.questions || []
  }
}

// SAVE PROGRESS: Store a student's score to Firestore + localStorage backup
const saveProgressToFirestore = async (key, data) => {
  try {
    await setDoc(doc(db, 'progress', key), data)
  } catch (err) {
    console.warn('Firestore save failed, using localStorage only:', err.message)
  }
  localStorage.setItem(`prog_${key}`, JSON.stringify(data)) // always save locally too
}

// LOAD PROGRESS: Get a student's saved score for a shift
const loadProgressFromFirestore = async (key) => {
  try {
    const snap = await getDoc(doc(db, 'progress', key))
    return snap.exists() ? snap.data() : null
  } catch {
    try { return JSON.parse(localStorage.getItem(`prog_${key}`) || 'null') } catch { return null }
  }
}


export { TOTAL_TIME, fmt, loadProgress, saveProgress, progressKey, rand, getStatus,
  START_QUOTES, getEndQuote,
  seedFirestore, loadQuestionsFromFirestore, saveProgressToFirestore, loadProgressFromFirestore }