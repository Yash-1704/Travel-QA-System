import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../');

/**
 * Loads and parses all OKF policy markdown files from dir.
 * HTML comments are completely stripped from body and text.
 * @param {string} [dir="data/okf"] 
 * @returns {Array<{filename: string, frontmatter: object, title: string, topic: string, status: string, body: string, text: string}>}
 */
export function loadOkfFiles(dir = 'data/okf') {
  const targetDir = path.isAbsolute(dir) ? dir : path.resolve(REPO_ROOT, dir);

  if (!fs.existsSync(targetDir)) {
    throw new Error(`Directory does not exist: ${targetDir}`);
  }

  const entries = fs.readdirSync(targetDir)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  return entries.map(filename => {
    const fullPath = path.join(targetDir, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);

    const frontmatter = parsed.data || {};
    const title = frontmatter.title || '';
    const topic = frontmatter.topic || '';
    const status = frontmatter.status || '';

    // Strip ALL HTML comments (/<!--[\s\S]*?-->/g) and trim
    const body = (parsed.content || '').replace(/<!--[\s\S]*?-->/g, '').trim();
    const text = `${title}\n${topic}\n\n${body}`;

    return {
      filename,
      frontmatter,
      title,
      topic,
      status,
      body,
      text
    };
  });
}

export default loadOkfFiles;
