import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const OKF_DIR = path.join(REPO_ROOT, 'data/okf');
const NOTICES_FILE = path.join(REPO_ROOT, 'data/rag/notices.json');
const NOTICES_BACKUP = path.join(REPO_ROOT, 'data/rag/notices.backup.json');
const QUESTIONS_FILE = path.join(REPO_ROOT, 'data/eval/questions.json');

const CATEGORY_MAPPING = {
  okf_only: 'OKF_ONLY',
  rag_only: 'RAG_ONLY',
  hybrid: 'HYBRID',
  human_fallback_stale: 'OKF_ONLY',
  human_fallback_no_evidence: 'ESCALATE',
  human_fallback_ambiguous: 'ESCALATE',
  human_fallback_conflict: 'ESCALATE'
};

const VALID_CATEGORIES = Object.keys(CATEGORY_MAPPING);
const VALID_OUTCOMES = ['OKF_ONLY', 'RAG_ONLY', 'HYBRID', 'ESCALATE'];

export function validateData(opts = {}) {
  const fixTimestamps = opts.fixTimestamps || process.argv.includes('--fix-timestamps');

  const errors = [];
  const warnings = [];
  const info = [];

  // ==========================================
  // 1. OKF VALIDATION
  // ==========================================
  if (!fs.existsSync(OKF_DIR)) {
    errors.push(`OKF directory does not exist: ${OKF_DIR}`);
  } else {
    const okfFiles = fs.readdirSync(OKF_DIR).filter(f => f.endsWith('.md'));
    if (okfFiles.length < 15 || okfFiles.length > 18) {
      errors.push(`OKF file count expected 15 to 18, found: ${okfFiles.length}`);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const staleFiles = [];
    const strippedFiles = [];

    for (const filename of okfFiles) {
      const fullPath = path.join(OKF_DIR, filename);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const parsed = matter(raw);
      const data = parsed.data || {};

      if (!data.type) {
        errors.push(`[OKF: ${filename}] Missing required frontmatter field 'type'`);
      }

      const expectedFields = ['title', 'topic', 'sources', 'verified', 'stale_after', 'status'];
      for (const ef of expectedFields) {
        if (data[ef] === undefined || data[ef] === null || data[ef] === '') {
          warnings.push(`[OKF: ${filename}] Missing expected frontmatter field '${ef}'`);
        }
      }

      if (data.status && !['current', 'outdated'].includes(data.status)) {
        errors.push(`[OKF: ${filename}] Invalid status '${data.status}', expected 'current' or 'outdated'`);
      }

      // Check date normalization
      const formatDate = (val) => {
        if (val instanceof Date) return val.toISOString().slice(0, 10);
        return String(val);
      };
      const staleAfterStr = data.stale_after ? formatDate(data.stale_after) : null;

      // Check comment stripping
      if (raw.includes('<!--')) {
        strippedFiles.push(filename);
      }
      const strippedBody = (parsed.content || '').replace(/<!--[\s\S]*?-->/g, '').trim();
      if (!strippedBody) {
        errors.push(`[OKF: ${filename}] Body is empty after comment stripping`);
      }

      // Check staleness
      if (data.status === 'outdated' || (staleAfterStr && staleAfterStr < todayStr)) {
        staleFiles.push(`${filename} (status: ${data.status}, stale_after: ${staleAfterStr})`);
      }
    }

    info.push(`OKF files checked: ${okfFiles.length}`);
    info.push(`Stale OKF files (${staleFiles.length}):\n  - ${staleFiles.join('\n  - ')}`);
    info.push(`OKF files with comments stripped (${strippedFiles.length}):\n  - ${strippedFiles.join('\n  - ')}`);
  }

  // ==========================================
  // 2. NOTICES VALIDATION
  // ==========================================
  let validNoticeIds = new Set();
  const changedTimestamps = [];

  if (!fs.existsSync(NOTICES_FILE)) {
    errors.push(`Notices file does not exist: ${NOTICES_FILE}`);
  } else {
    const rawNotices = fs.readFileSync(NOTICES_FILE, 'utf8');
    let notices;
    try {
      notices = JSON.parse(rawNotices);
    } catch (e) {
      errors.push(`Failed to parse notices.json: ${e.message}`);
    }

    if (Array.isArray(notices)) {
      if (notices.length !== 30) {
        errors.push(`Notices count expected exactly 30, found: ${notices.length}`);
      }

      const idRegex = /^notice-\d{4}$/;
      let noticesModified = false;

      for (const n of notices) {
        if (!n.id || !idRegex.test(n.id)) {
          errors.push(`[Notice: ${n.id || 'unknown'}] Invalid id format, must match /^notice-\\d{4}$/`);
        } else {
          if (validNoticeIds.has(n.id)) {
            errors.push(`[Notice: ${n.id}] Duplicate notice id`);
          }
          validNoticeIds.add(n.id);
        }

        if (!n.text || typeof n.text !== 'string' || n.text.trim() === '') {
          errors.push(`[Notice: ${n.id}] Text is empty or not a string`);
        }

        const meta = n.metadata || {};
        if (!meta.source_type) {
          errors.push(`[Notice: ${n.id}] metadata.source_type is required`);
        }

        if (typeof meta.timestamp !== 'number' || !Number.isInteger(meta.timestamp)) {
          errors.push(`[Notice: ${n.id}] metadata.timestamp must be an integer`);
        } else if (meta.timestamp > 1e11) {
          errors.push(`[Notice: ${n.id}] metadata.timestamp > 1e11 (looks like milliseconds, must be seconds)`);
        }

        for (const strField of ['flight_no', 'route', 'airline']) {
          if (meta[strField] !== null && meta[strField] !== undefined && typeof meta[strField] !== 'string') {
            errors.push(`[Notice: ${n.id}] metadata.${strField} must be null or string`);
          }
        }

        // Timestamp vs ISO date in text check
        const dateMatch = (n.text || '').match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch && typeof meta.timestamp === 'number') {
          const textIsoDate = dateMatch[1];
          const expectedTimestamp = Math.floor(new Date(`${textIsoDate}T00:00:00Z`).getTime() / 1000);
          const diffSeconds = Math.abs(meta.timestamp - expectedTimestamp);
          const diffDays = diffSeconds / 86400;

          if (diffDays > 1) {
            const currentIsoDate = new Date(meta.timestamp * 1000).toISOString().slice(0, 10);
            warnings.push(
              `[Notice: ${n.id}] Timestamp UTC date (${currentIsoDate}) differs by >1 day from text date (${textIsoDate}). Expected timestamp: ${expectedTimestamp}`
            );

            if (fixTimestamps) {
              changedTimestamps.push({
                id: n.id,
                oldTimestamp: meta.timestamp,
                newTimestamp: expectedTimestamp,
                oldDate: currentIsoDate,
                newDate: textIsoDate
              });
              meta.timestamp = expectedTimestamp;
              noticesModified = true;
            }
          }
        }
      }

      if (fixTimestamps && noticesModified) {
        if (!fs.existsSync(NOTICES_BACKUP)) {
          fs.copyFileSync(NOTICES_FILE, NOTICES_BACKUP);
          console.log(`Created backup of notices at: ${NOTICES_BACKUP}`);
        }
        fs.writeFileSync(NOTICES_FILE, JSON.stringify(notices, null, 2), 'utf8');
        console.log(`Fixed timestamps on ${changedTimestamps.length} notices.`);
      }

      info.push(`Notices checked: ${notices.length}`);
    }
  }

  // ==========================================
  // 3. QUESTIONS VALIDATION
  // ==========================================
  if (!fs.existsSync(QUESTIONS_FILE)) {
    errors.push(`Questions file does not exist: ${QUESTIONS_FILE}`);
  } else {
    const rawQuestions = fs.readFileSync(QUESTIONS_FILE, 'utf8');
    let questions;
    try {
      questions = JSON.parse(rawQuestions);
    } catch (e) {
      errors.push(`Failed to parse questions.json: ${e.message}`);
    }

    if (Array.isArray(questions)) {
      if (questions.length !== 84) {
        errors.push(`Questions count expected exactly 84, found: ${questions.length}`);
      }

      const questionIds = new Set();
      const categoryCounts = {};
      let devCount = 0;
      let testCount = 0;
      const outcomeCounts = {};

      const okfFileList = fs.existsSync(OKF_DIR) ? fs.readdirSync(OKF_DIR) : [];

      for (const q of questions) {
        // Unique ID check
        if (!q.id || !/^q-\d{3}$/.test(q.id)) {
          errors.push(`[Question: ${q.id || 'unknown'}] ID must match /^q-\\d{3}$/`);
        } else {
          if (questionIds.has(q.id)) {
            errors.push(`[Question: ${q.id}] Duplicate question id`);
          }
          questionIds.add(q.id);
        }

        // Required fields: id, category, question, expected_outcome, correct_answer, key_facts, split
        const reqFields = ['id', 'category', 'question', 'expected_outcome', 'correct_answer', 'key_facts', 'split'];
        for (const rf of reqFields) {
          if (q[rf] === undefined) {
            errors.push(`[Question: ${q.id}] Missing required field '${rf}'`);
          }
        }

        // Category check
        if (!VALID_CATEGORIES.includes(q.category)) {
          errors.push(`[Question: ${q.id}] Invalid category '${q.category}'`);
        } else {
          if (!categoryCounts[q.category]) {
            categoryCounts[q.category] = { dev: 0, test: 0, total: 0 };
          }
          categoryCounts[q.category].total++;
          if (q.split === 'dev') categoryCounts[q.category].dev++;
          if (q.split === 'test') categoryCounts[q.category].test++;
        }

        // Split check
        if (q.split === 'dev') devCount++;
        else if (q.split === 'test') testCount++;
        else errors.push(`[Question: ${q.id}] Split must be 'dev' or 'test', got: '${q.split}'`);

        // expected_outcome check
        if (!VALID_OUTCOMES.includes(q.expected_outcome)) {
          errors.push(`[Question: ${q.id}] Invalid expected_outcome '${q.expected_outcome}'`);
        } else {
          outcomeCounts[q.expected_outcome] = (outcomeCounts[q.expected_outcome] || 0) + 1;
        }

        const expectedOutcomeForCategory = CATEGORY_MAPPING[q.category];
        if (expectedOutcomeForCategory && q.expected_outcome !== expectedOutcomeForCategory) {
          errors.push(
            `[Question: ${q.id}] expected_outcome '${q.expected_outcome}' does not match category '${q.category}' mapping (expected '${expectedOutcomeForCategory}')`
          );
        }

        // Non-ESCALATE vs ESCALATE rules
        if (q.expected_outcome !== 'ESCALATE') {
          if (typeof q.correct_answer !== 'string' || q.correct_answer.trim() === '') {
            errors.push(`[Question: ${q.id}] Non-ESCALATE question must have non-empty string correct_answer`);
          }
          if (!Array.isArray(q.key_facts) || q.key_facts.length === 0) {
            errors.push(`[Question: ${q.id}] Non-ESCALATE question must have non-empty array key_facts`);
          } else if (typeof q.correct_answer === 'string') {
            const normAnswer = q.correct_answer.toLowerCase();
            for (const kf of q.key_facts) {
              if (!normAnswer.includes(String(kf).toLowerCase())) {
                warnings.push(
                  `[Question: ${q.id}] Key fact "${kf}" is not a case-insensitive substring of correct_answer`
                );
              }
            }
          }
        } else {
          if (q.correct_answer !== null) {
            errors.push(`[Question: ${q.id}] ESCALATE question must have correct_answer === null, got: ${JSON.stringify(q.correct_answer)}`);
          }
          if (!Array.isArray(q.key_facts) || q.key_facts.length !== 0) {
            errors.push(`[Question: ${q.id}] ESCALATE question must have key_facts === [], got: ${JSON.stringify(q.key_facts)}`);
          }
        }

        // Optional source_file check
        if (q.source_file) {
          if (!okfFileList.includes(q.source_file)) {
            errors.push(`[Question: ${q.id}] source_file '${q.source_file}' does not exist in data/okf/`);
          }
        }

        // Optional source_chunk check
        if (q.source_chunk) {
          if (!validNoticeIds.has(q.source_chunk)) {
            errors.push(`[Question: ${q.id}] source_chunk '${q.source_chunk}' is not a valid notice id`);
          }
        }
      }

      // Check category balance
      for (const cat of VALID_CATEGORIES) {
        const c = categoryCounts[cat] || { dev: 0, test: 0, total: 0 };
        if (c.total !== 12 || c.dev !== 4 || c.test !== 8) {
          errors.push(
            `Category '${cat}' distribution invalid: expected 12 total (4 dev + 8 test), found: ${c.total} total (${c.dev} dev + ${c.test} test)`
          );
        }
      }

      if (devCount !== 28 || testCount !== 56) {
        errors.push(`Split distribution invalid: expected 28 dev / 56 test, found: ${devCount} dev / ${testCount} test`);
      }

      info.push(`Questions checked: ${questions.length} (dev: ${devCount}, test: ${testCount})`);
      info.push(`Outcome distribution: ${JSON.stringify(outcomeCounts)}`);
    }
  }

  // ==========================================
  // REPORT RESULTS
  // ==========================================
  console.log('\n========================================');
  console.log('DATA VALIDATION REPORT');
  console.log('========================================');

  console.log('\n[INFO]');
  for (const inf of info) {
    console.log(`- ${inf}`);
  }

  if (warnings.length > 0) {
    console.log(`\n[WARNINGS] (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`- ${w}`);
    }
  } else {
    console.log('\n[WARNINGS] None.');
  }

  if (errors.length > 0) {
    console.log(`\n[ERRORS] (${errors.length}):`);
    for (const e of errors) {
      console.log(`! ${e}`);
    }
    console.log('\nValidation Result: FAIL');
    if (!opts.silent) {
      process.exit(1);
    }
    return { ok: false, errors, warnings, changedTimestamps };
  } else {
    console.log('\n[ERRORS] 0 errors. All checks passed.');
    console.log('\nValidation Result: PASS');
    return { ok: true, errors: [], warnings, changedTimestamps };
  }
}

if (process.argv[1] && process.argv[1].endsWith('validate-data.js')) {
  validateData();
}
