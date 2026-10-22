/**
 * services/okf.js
 *
 * OKF keyword matching service for Phase 2A-2.
 * Matches customer questions against OKF files based on title, topic, and tags.
 */

import { loadOkfFiles } from './okfLoader.js';

// FIXED stopword list per AGENTS.md Phase 2A-2
const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does', 'did',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'this', 'that', 'these', 'those',
  'there', 'can', 'could', 'would', 'should', 'will', 'what', 'which', 'who', 'whom', 'how',
  'why', 'when', 'where', 'to', 'of', 'for', 'on', 'in', 'at', 'by', 'from', 'with', 'and',
  'or', 'if', 'any', 'about', 'much', 'many', 'get', 'got', 'have', 'has', 'had', 'not',
  'no', 'so', 'up', 'out', 'as', 'than', 'then', 'also', 'please'
]);

/**
 * Tokenize and normalize text into distinct keywords:
 * Lowercase, match /[a-z0-9]+/g, drop < 2 chars, drop stopwords,
 * dedupe, strip ONE trailing "s" when length > 3.
 *
 * @param {string} text
 * @returns {string[]} distinct normalized keywords
 */
export function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];

  const rawTokens = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  const filtered = rawTokens.filter(t => t.length >= 2 && !STOPWORDS.has(t));

  const normalized = filtered.map(t => {
    if (t.length > 3 && t.endsWith('s')) {
      return t.slice(0, -1);
    }
    return t;
  });

  return Array.from(new Set(normalized));
}

let okfCache = null;

function getCachedOkfFiles() {
  if (!okfCache) {
    const files = loadOkfFiles();
    okfCache = files.map(file => {
      const fm = file.frontmatter || {};
      let tagsText = '';
      if (Array.isArray(fm.tags)) {
        tagsText = fm.tags.join(' ');
      } else if (typeof fm.tags === 'string') {
        tagsText = fm.tags;
      }

      // Haystack per file = normalized tokens of title + topic + tags
      // Frontmatter only, never the body.
      const haystackText = `${file.title || ''} ${file.topic || ''} ${tagsText}`;
      const haystackKeywords = new Set(extractKeywords(haystackText));

      return {
        filename: file.filename,
        title: file.title,
        text: file.text,
        frontmatter: file.frontmatter,
        haystackKeywords
      };
    });
  }
  return okfCache;
}

/**
 * Match question against OKF files using keyword scoring.
 *
 * @param {string} question
 * @returns {{match: {filename: string, title: string, text: string, score: number, frontmatter: object}|null, retrievalMs: number}}
 */
export function matchOkf(question) {
  const start = Date.now();

  const questionKeywords = extractKeywords(question);
  if (questionKeywords.length === 0) {
    return {
      match: null,
      retrievalMs: Date.now() - start
    };
  }

  const files = getCachedOkfFiles();
  let bestMatch = null;
  let bestScore = 0;

  for (const file of files) {
    // Count distinct question keywords found in the haystack
    let matchedCount = 0;
    for (const kw of questionKeywords) {
      if (file.haystackKeywords.has(kw)) {
        matchedCount++;
      }
    }

    const score = matchedCount / questionKeywords.length;

    if (score > 0) {
      if (score > bestScore) {
        bestScore = score;
        bestMatch = file;
      } else if (score === bestScore && bestMatch) {
        // Ties broken by alphabetical filename
        if (file.filename.localeCompare(bestMatch.filename) < 0) {
          bestMatch = file;
        }
      }
    }
  }

  const retrievalMs = Date.now() - start;

  if (!bestMatch || bestScore === 0) {
    return {
      match: null,
      retrievalMs
    };
  }

  return {
    match: {
      filename: bestMatch.filename,
      title: bestMatch.title,
      text: bestMatch.text,
      score: bestScore,
      frontmatter: bestMatch.frontmatter
    },
    retrievalMs
  };
}

export default {
  extractKeywords,
  matchOkf
};
