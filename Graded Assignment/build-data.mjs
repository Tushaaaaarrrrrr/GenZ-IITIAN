// Parse each week's pdftotext output into structured questions and write
// src/data/gradedAssignments.ts so the page can render quiz-style cards.
//
// pdftotext output is messy — different weeks use different question formats
// (Week 1 uses "Question N:" prefix; Weeks 3/5/6 use "1.", "2." with [Marks]
// or (points) suffix). Parser handles both, with reasonable heuristics for
// pseudocode vs prose vs MCQ options vs the explicit "Solution:" sections.

import fs from 'fs';

const WEEKS = [
  { week: 1, page: 6 },
  { week: 2, page: 15 },
  { week: 3, page: 33 },
  { week: 5, page: 93 },
  { week: 6, page: 128 },
];

// Lines we strip entirely (PDF page headers, footers, course banners)
const NOISE = [
  /^\s*Computational [Tt]hinking\b.*Page \d+ of \d+\s*$/,
  /^\s*BSCCS1001:.*$/,
  /^\s*Page \d+\s*$/,
  /^\s*Page \d+ of \d+\s*$/,
  /^\s*Week\s*-?\s*\d+\s*$/,
  /^\s*Graded Assignment Solution\s*$/,
  /^\s*Practice Assignment Solution\s*$/,
  /^\s*Thank you for watching this tutorial\.?\s*$/,
  /^\s*Happy learning\.?\s*$/,
];

function stripNoise(text) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .filter(line => !NOISE.some(re => re.test(line)))
    .join('\n');
}

// Ensure question-header markers always start their own chunk by inserting a
// blank line before them if the previous line is non-empty. pdftotext sometimes
// drops the paragraph break right before a heading.
function normalizeBreaks(text) {
  return text
    // pdftotext emits \f at page boundaries — treat as a paragraph break
    .replace(/\f/g, '\n\n')
    // Ensure question headers begin a fresh chunk if preceded by content
    .replace(/([^\n])\r?\n(Question\s*(?:\d+\s*)?:)/g, '$1\n\n$2');
}

// Split into "chunks" separated by blank lines
function chunkByBlank(text) {
  const chunks = [];
  let cur = [];
  for (const line of text.split('\n')) {
    if (line.trim() === '') {
      if (cur.length) { chunks.push(cur); cur = []; }
    } else {
      cur.push(line);
    }
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

// Heuristic: is this chunk a code block?
// Looks for dense code-shape patterns (braces, assignments, comparators) and
// classic pseudocode keywords. Allows a leading bare line like "Procedure X()"
// at column 0 mixed with indented body.
const CODE_KEYWORD = /^\s*(Step\s+\d+|Procedure\b|end\s|End\b|while\s*\(|if\s*\(|else\b|elif\b|foreach\b|for\s*\(|return\b|Read\s|Move\s|Maintain\b|Arrange\b|Calculate\b|Initialize\b|Print\s|Set\b|Count\s*=|SumT\s*=|while\b)/i;
const CODE_SHAPE = /[{}();=]|->|<=|>=|==|!=|\+\+|--/;

function isCodeChunk(lines) {
  if (lines.length === 0) return false;
  let codey = 0;
  let total = 0;
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    total++;
    if (CODE_KEYWORD.test(l)) codey++;
    else if (CODE_SHAPE.test(t)) codey++;
    else if (/^[a-z_][\w]*\s*=/.test(t)) codey++;  // assignment
    else if (/^\d+\s*$/.test(t)) codey++;  // standalone number
  }
  if (total === 0) return false;
  return codey / total >= 0.5;
}

// Heuristic: is this chunk an MCQ option block?
// Allow "a." / "(a)" / "a)" with or without trailing whitespace.
function isOptionsChunk(lines) {
  if (lines.length === 0) return false;
  const first = lines[0].trim();
  return /^[a-eA-E]\.(\s|$)/.test(first) ||
         /^\([a-eA-E]\)/.test(first) ||
         /^[a-eA-E]\)(\s|$)/.test(first);
}

// Extract leading "Solution:" marker — returns the chunk content with marker removed,
// or null if it's not a solution chunk.
function stripSolutionPrefix(lines) {
  const first = lines[0].trimStart();
  const m = first.match(/^Solution\s*:\s*(.*)/);
  if (!m) return null;
  // Replace the first line with everything after "Solution:"
  const rest = [...lines];
  rest[0] = rest[0].replace(/^(\s*)Solution\s*:\s*/, '$1');
  // Drop empty first line if Solution: was on its own
  while (rest.length && rest[0].trim() === '') rest.shift();
  return rest;
}

// Dedent a code block so the least-indented line starts at column 0
function dedent(lines) {
  const nonempty = lines.filter(l => l.trim());
  if (!nonempty.length) return lines.join('\n');
  const minIndent = Math.min(...nonempty.map(l => l.length - l.trimStart().length));
  return lines.map(l => l.slice(minIndent)).join('\n');
}

// Collapse paragraph lines (single line wraps) into one logical paragraph
function flowText(lines) {
  return lines.map(l => l.trim()).filter(Boolean).join(' ');
}

// Identify whether a chunk is a question header (starts a new question).
// Sequence-aware: numeric "N." headers must match expectedNum to avoid catching
// inline numbered explanations like "30. After the end of the iteration...".
// Falls back to prose markers ("The following procedure", "The given procedure",
// "What will") for weeks that use a tutorial format without explicit numbering.
// Returns { number, points, rest } or null.
function detectQuestionHeader(lines, expectedNum) {
  const first = lines[0].trim();
  // "Question 1: text..." (Week 1 Q1 style — with number)
  let m = first.match(/^Question\s+(\d+)\s*:\s*(.*)/i);
  if (m) {
    return { number: m[1], points: null, rest: [m[2], ...lines.slice(1)].filter(Boolean) };
  }
  // "Question: text..." (Week 1 Q2-Q5 — no number, auto-increment)
  m = first.match(/^Question\s*:\s*(.*)/i);
  if (m) {
    return { number: String(expectedNum), points: null, rest: [m[1], ...lines.slice(1)].filter(Boolean) };
  }
  // "1. (2 points) text..." or "1. (3 Marks) text..." or "1. text..."
  // Require the number to match the expected sequence so we don't trip on
  // mid-paragraph references like "30. After the iteration..."
  m = first.match(/^(\d+)\.\s*(?:\(([^)]+)\)\s*)?(.*)/);
  if (m && m[3] && m[3].length > 15 && parseInt(m[1], 10) === expectedNum) {
    return { number: m[1], points: m[2] || null, rest: [m[3], ...lines.slice(1)] };
  }
  // Tutorial-style fallback (Week 2): prose openers indicate a new question.
  // Auto-numbered.
  if (/^(The following (procedure|pseudocode|flowchart)|The given (procedure|pseudocode)|What will)\b/i.test(first)) {
    return { number: String(expectedNum), points: null, rest: lines };
  }
  return null;
}

function classifyChunk(rawLines) {
  // First check for solution marker
  const sol = stripSolutionPrefix(rawLines);
  if (sol) {
    return { kind: 'solution', text: flowParagraph(sol) };
  }
  if (isCodeChunk(rawLines)) {
    return { kind: 'code', text: dedent(rawLines).replace(/\s+$/g, '') };
  }
  if (isOptionsChunk(rawLines)) {
    // Try to split into multiple options (one per line, or by "a.", "b." prefix)
    const text = rawLines.map(l => l.trim()).filter(Boolean).join('\n');
    const items = text.split(/\n(?=[a-eA-E]\.\s|\([a-eA-E]\)\s)/g).map(s => s.trim()).filter(Boolean);
    return { kind: 'options', items };
  }
  return { kind: 'prose', text: flowParagraph(rawLines) };
}

// Some prose chunks have an internal line that's an "answer choice" mid-paragraph.
// For simplicity, flow as one paragraph; CSS will wrap.
function flowParagraph(lines) {
  return flowText(lines);
}

function parseWeek(rawText) {
  const cleaned = normalizeBreaks(stripNoise(rawText));
  const chunks = chunkByBlank(cleaned);

  const intro = [];
  const questions = [];
  let cur = null;

  for (const chunk of chunks) {
    // Expected question number = pushed + in-flight + 1
    const expected = questions.length + (cur ? 1 : 0) + 1;
    const header = detectQuestionHeader(chunk, expected);
    if (header) {
      if (cur) questions.push(cur);
      cur = { number: header.number, points: header.points, prompt: '', blocks: [] };
      // The remainder of the header chunk after the "Question N:"/"N." prefix
      // becomes the prompt (prose).
      const restClassified = classifyChunk(header.rest);
      if (restClassified.kind === 'prose') {
        cur.prompt = restClassified.text;
      } else {
        cur.blocks.push(restClassified);
      }
      continue;
    }
    if (!cur) {
      // Pre-question content → intro
      const block = classifyChunk(chunk);
      if (block.kind === 'prose' && block.text) intro.push(block.text);
      continue;
    }
    cur.blocks.push(classifyChunk(chunk));
  }
  if (cur) questions.push(cur);

  return {
    intro: intro.join('\n\n').trim(),
    questions,
  };
}

// ---- Build the data file ----

const out = ['// Auto-extracted from public/assets/cs1001Assignments.pdf via',
  '// Graded Assignment/build-data.mjs. Re-run that script to regenerate.',
  '// Foundation > CT graded assignment solutions. Weeks 4, 7-12 not in source PDF.',
  '',
  "export type GradedBlockKind = 'prose' | 'code' | 'options' | 'solution';",
  '',
  'export interface GradedBlock {',
  '  kind: GradedBlockKind;',
  '  text?: string;',
  '  items?: string[];',
  '}',
  '',
  'export interface GradedQuestion {',
  '  number: string;',
  '  points: string | null;',
  '  prompt: string;',
  '  blocks: GradedBlock[];',
  '}',
  '',
  'export interface GradedAssignmentContent {',
  '  level: string;',
  '  subject: string;',
  '  week: string;',
  '  pdfPath: string;',
  '  pdfPage: number;',
  '  intro: string;',
  '  questions: GradedQuestion[];',
  '}',
  '',
  'export const gradedAssignments: GradedAssignmentContent[] = ['];

for (const w of WEEKS) {
  const txt = fs.readFileSync(`Graded Assignment/week${w.week}.txt`, 'utf8');
  const parsed = parseWeek(txt);
  out.push(`  {`);
  out.push(`    level: 'Foundation',`);
  out.push(`    subject: 'CT',`);
  out.push(`    week: 'Week ${w.week}',`);
  out.push(`    pdfPath: '/assets/cs1001Assignments.pdf',`);
  out.push(`    pdfPage: ${w.page},`);
  out.push(`    intro: ${JSON.stringify(parsed.intro)},`);
  out.push(`    questions: [`);
  for (const q of parsed.questions) {
    out.push(`      {`);
    out.push(`        number: ${JSON.stringify(q.number)},`);
    out.push(`        points: ${JSON.stringify(q.points)},`);
    out.push(`        prompt: ${JSON.stringify(q.prompt)},`);
    out.push(`        blocks: [`);
    for (const b of q.blocks) {
      if (b.kind === 'options') {
        out.push(`          { kind: 'options', items: ${JSON.stringify(b.items)} },`);
      } else {
        out.push(`          { kind: ${JSON.stringify(b.kind)}, text: ${JSON.stringify(b.text)} },`);
      }
    }
    out.push(`        ],`);
    out.push(`      },`);
  }
  out.push(`    ],`);
  out.push(`  },`);
  console.log(`Week ${w.week}: ${parsed.questions.length} questions, intro ${parsed.intro.length} chars`);
}

out.push('];', '');
fs.writeFileSync('src/data/gradedAssignments.ts', out.join('\n'));
const size = (fs.statSync('src/data/gradedAssignments.ts').size / 1024).toFixed(1);
console.log(`Wrote src/data/gradedAssignments.ts — ${size} KB`);
