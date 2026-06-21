// ─── QUESTIONS DATABASE (auto-built from src/questions/*.json) ─────────────
//
// HOW THIS WORKS:
// Instead of hardcoding questions in this file, every paper now lives as its
// own JSON file in src/questions/ (see src/questions/_schema.sample.json for
// the exact format). Vite's `import.meta.glob` scans that folder at build
// time and eagerly imports every .json file it finds — so dropping a new
// file in src/questions/ makes it show up in the app automatically on the
// next dev-server reload or build. No code changes, no import list to edit.
//
// Each JSON file looks like:
//   { subject, year, month, shift, label, date, questions: [...] }
//
// This module reshapes that flat list of papers into the same nested shape
// the rest of the app (App.jsx, helpers.js) already expects:
//   DB[subject][year][month][shift] = { label, date, totalQ, questions }

const paperModules = import.meta.glob('./questions/*.json', { eager: true });

const DB = {};
let loadedCount = 0;
const errors = [];

for (const [path, mod] of Object.entries(paperModules)) {
  // Skip the documented sample/reference schema file — it's not real data.
  if (path.includes('_schema.sample.json')) continue;

  // Vite gives JSON imports either as the parsed object directly, or under
  // `.default` depending on version/config — handle both.
  const paper = mod.default ?? mod;

  const { subject, year, month, shift, label, date, questions } = paper || {};

  if (!subject || !year || !month || !shift || !Array.isArray(questions)) {
    errors.push(`${path}: missing one of subject/year/month/shift/questions`);
    continue;
  }

  if (!DB[subject]) DB[subject] = {};
  if (!DB[subject][year]) DB[subject][year] = {};
  if (!DB[subject][year][month]) DB[subject][year][month] = {};

  if (DB[subject][year][month][shift]) {
    errors.push(`${path}: duplicate paper for ${subject}/${year}/${month}/${shift} (overwriting earlier file)`);
  }

  DB[subject][year][month][shift] = {
    label: label || shift,
    date: date || '',
    totalQ: questions.length,
    questions,
  };
  loadedCount++;
}

if (errors.length > 0) {
  console.warn(`⚠️ ${errors.length} issue(s) while loading src/questions/:`, errors);
}
console.log(`📚 Loaded ${loadedCount} question paper(s) from src/questions/`);

export default DB;
