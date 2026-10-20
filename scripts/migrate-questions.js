import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const QUESTIONS_FILE = path.join(REPO_ROOT, 'data/eval/questions.json');
const BACKUP_FILE = path.join(REPO_ROOT, 'data/eval/questions.backup.json');

const CATEGORY_MAPPING = {
  okf_only: 'OKF_ONLY',
  rag_only: 'RAG_ONLY',
  hybrid: 'HYBRID',
  human_fallback_stale: 'OKF_ONLY',
  human_fallback_no_evidence: 'ESCALATE',
  human_fallback_ambiguous: 'ESCALATE',
  human_fallback_conflict: 'ESCALATE'
};

export function migrateQuestions() {
  if (!fs.existsSync(QUESTIONS_FILE)) {
    throw new Error(`Questions file not found: ${QUESTIONS_FILE}`);
  }

  // Back up questions.json if backup does not exist
  if (!fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(QUESTIONS_FILE, BACKUP_FILE);
    console.log(`Created backup at: ${BACKUP_FILE}`);
  } else {
    console.log(`Backup already exists at: ${BACKUP_FILE}`);
  }

  const raw = fs.readFileSync(QUESTIONS_FILE, 'utf8');
  const questions = JSON.parse(raw);

  let updatedCount = 0;
  for (const q of questions) {
    if (CATEGORY_MAPPING[q.category]) {
      q.expected_outcome = CATEGORY_MAPPING[q.category];
    }

    if (q.category === 'human_fallback_stale') {
      // Clear correct_answer to null and key_facts to [] only if mismatched
      if (typeof q.correct_answer === 'string' && q.correct_answer.length > 0 && (!Array.isArray(q.key_facts) || q.key_facts.length === 0)) {
        q.correct_answer = null;
        q.key_facts = [];
      }
    }

    // Fix q-029 question text: "4 November 2025" -> "3 November 2025"
    if (q.id === 'q-029') {
      if (q.question.includes('4 November 2025')) {
        q.question = q.question.replace('4 November 2025', '3 November 2025');
        console.log('Fixed q-029 question text to 3 November 2025');
      }
    }

    updatedCount++;
  }

  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf8');
  console.log(`Migrated ${updatedCount} questions successfully.`);
}

if (process.argv[1] && process.argv[1].endsWith('migrate-questions.js')) {
  migrateQuestions();
}
