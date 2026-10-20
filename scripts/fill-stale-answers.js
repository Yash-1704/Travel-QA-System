import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadOkfFiles } from '../server/src/services/okfLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const QUESTIONS_FILE = path.join(REPO_ROOT, 'data/eval/questions.json');
const REVIEW_FILE = path.join(REPO_ROOT, 'data/eval/stale-answers-review.md');

const STALE_ANSWERS_DATA = [
  {
    id: 'q-037',
    sourceFile: 'visa-country-d-britannica.md',
    answer: 'Britannica visa fee is USD 115 (non-refundable)',
    key_facts: ['USD 115'],
    checkSubstring: 'USD 115',
    supportingLine: '- **Application fee:** USD 115 (non-refundable)'
  },
  {
    id: 'q-038',
    sourceFile: 'refund-policy-general.md',
    answer: 'airline-initiated cancellation refunds within 10 business days',
    key_facts: ['10 business days'],
    checkSubstring: '10 business days',
    supportingLine: 'When the airline cancels a flight, the refund to the original payment method is processed within **10 business days**.'
  },
  {
    id: 'q-039',
    sourceFile: 'visa-country-d-britannica.md',
    answer: 'documents: valid passport (min 6 months), completed online application form, bank statements for last 6 months, proof of accommodation, return or onward travel ticket, proof of employment or study',
    key_facts: ['bank statements', 'proof of accommodation', 'return or onward'],
    checkSubstring: 'Bank statements for the last 6 months',
    supportingLine: '1. Valid passport (minimum 6 months validity)\n2. Completed online application form\n3. Bank statements for the last 6 months\n4. Proof of accommodation (hotel booking or invitation letter)\n5. Return or onward travel ticket\n6. Proof of employment or study, including salary slips or institution letter'
  },
  {
    id: 'q-040',
    sourceFile: 'refund-policy-general.md',
    answer: 'standard refunds take 21 business days',
    key_facts: ['21 business days'],
    checkSubstring: '21 business days',
    supportingLine: 'When a passenger cancels a refundable ticket and a refund is due, the airline processes the refund to the original payment method within **21 business days** of the cancellation request.'
  },
  {
    id: 'q-041',
    sourceFile: 'visa-country-d-britannica.md',
    answer: 'processing time 15 to 20 business days',
    key_facts: ['15 to 20 business days'],
    checkSubstring: '15 to 20 business days',
    supportingLine: '- **Processing time:** 15 to 20 business days. Priority processing (8 business days) is available for an additional fee.'
  },
  {
    id: 'q-042',
    sourceFile: 'visa-country-d-britannica.md',
    answer: 'yes, priority processing (8 business days) for an additional fee',
    key_facts: ['priority', '8 business days'],
    checkSubstrings: ['priority processing', '8 business days'],
    supportingLine: '- **Processing time:** 15 to 20 business days. Priority processing (8 business days) is available for an additional fee.'
  },
  {
    id: 'q-043',
    sourceFile: 'refund-policy-general.md',
    answer: "submit through the airline's official website or customer support line; requests via third-party agents must be forwarded by the agent",
    key_facts: ['official website', 'customer support'],
    checkSubstrings: ['official website', 'customer support'],
    supportingLine: "All refund requests must be submitted through the airline's official website or customer support line. Requests made through third-party agents must be forwarded by the agent to the airline."
  },
  {
    id: 'q-044',
    sourceFile: 'visa-country-d-britannica.md',
    answer: 'yes, multiple entry, valid up to 6 months',
    key_facts: ['multiple entry'],
    checkSubstrings: ['multiple entry', '6 months'],
    supportingLine: '- **Validity:** Up to 6 months, multiple entry.'
  },
  {
    id: 'q-045',
    sourceFile: 'visa-country-d-britannica.md',
    answer: 'bank statements for the last 6 months',
    key_facts: ['last 6 months'],
    checkSubstrings: ['last 6 months'],
    supportingLine: '3. Bank statements for the last 6 months'
  },
  {
    id: 'q-046',
    sourceFile: 'refund-policy-general.md',
    answer: 'no; card and bank-transfer refunds both take 21 business days',
    key_facts: ['21 business days'],
    checkSubstrings: ['21 business days'],
    supportingLine: '- Credit/debit card payments: 21 business days for the refund to appear on the card statement.\n- Bank transfer payments: 21 business days.'
  },
  {
    id: 'q-047',
    sourceFile: 'visa-country-d-britannica.md',
    answer: 'valid up to 6 months, max stay per visit up to 6 months',
    key_facts: ['6 months'],
    checkSubstrings: ['Maximum stay per visit', '6 months'],
    supportingLine: '- **Validity:** Up to 6 months, multiple entry.\n- **Maximum stay per visit:** Up to 6 months.'
  },
  {
    id: 'q-048',
    sourceFile: 'refund-policy-general.md',
    answer: 'cash payments are refunded by cheque mailed to the address on file within 21 business days',
    key_facts: ['cheque', '21 business days'],
    checkSubstrings: ['cheque', '21 business days'],
    supportingLine: '- Cash payments at airport: Refund is issued by cheque and mailed to the address on file within 21 business days.'
  }
];

export function fillStaleAnswers() {
  const okfFiles = loadOkfFiles();
  const fileMap = new Map(okfFiles.map(f => [f.filename, f]));

  // Verify each statement against the comment-stripped file body
  for (const entry of STALE_ANSWERS_DATA) {
    const file = fileMap.get(entry.sourceFile);
    if (!file) {
      throw new Error(`Policy file not found: ${entry.sourceFile}`);
    }

    const substrings = entry.checkSubstrings || [entry.checkSubstring];
    for (const sub of substrings) {
      if (!file.body.toLowerCase().includes(sub.toLowerCase())) {
        throw new Error(
          `Verification FAILED for ${entry.id}: substring "${sub}" not found in comment-stripped body of ${entry.sourceFile}`
        );
      }
    }
  }

  console.log('All 12 stale answer statements verified against comment-stripped files.');

  // Update questions.json
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
  const questionMap = new Map(questions.map(q => [q.id, q]));

  const reviewRows = [];

  for (const entry of STALE_ANSWERS_DATA) {
    const q = questionMap.get(entry.id);
    if (!q) {
      throw new Error(`Question ${entry.id} not found in questions.json`);
    }

    q.correct_answer = entry.answer;
    q.key_facts = entry.key_facts;
    q.source_file = entry.sourceFile;

    reviewRows.push({
      id: q.id,
      question: q.question,
      answer: q.correct_answer,
      key_facts: q.key_facts,
      supportingLine: entry.supportingLine,
      sourceFile: entry.sourceFile
    });
  }

  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf8');
  console.log('Updated questions.json with stale answers.');

  // Write data/eval/stale-answers-review.md
  let reviewMd = '# Stale Answers Review (q-037 to q-048)\n\n';
  reviewMd += 'Deliberately populated from the comment-stripped content of outdated policy files.\n\n';
  reviewMd += '| ID | Question | Answer (from file) | Key Facts | Source File | Supporting File Line |\n';
  reviewMd += '|---|---|---|---|---|---|\n';

  for (const r of reviewRows) {
    const safeQ = r.question.replace(/\|/g, '\\|');
    const safeA = r.answer.replace(/\|/g, '\\|');
    const safeKf = JSON.stringify(r.key_facts).replace(/\|/g, '\\|');
    const safeLine = r.supportingLine.replace(/\n/g, '<br>').replace(/\|/g, '\\|');
    reviewMd += `| ${r.id} | ${safeQ} | ${safeA} | ${safeKf} | \`${r.sourceFile}\` | ${safeLine} |\n`;
  }

  fs.writeFileSync(REVIEW_FILE, reviewMd, 'utf8');
  console.log(`Wrote ${REVIEW_FILE}`);
}

if (process.argv[1] && process.argv[1].endsWith('fill-stale-answers.js')) {
  fillStaleAnswers();
}
