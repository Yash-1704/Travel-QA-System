import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, requireEnv } from '../server/src/config.js';
import { probeEmbeddingModel } from '../server/src/services/embed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(REPO_ROOT, '.env');

async function runProbe() {
  console.log('Probing Gemini embedding models...');
  try {
    const apiKey = requireEnv('GEMINI_API_KEY');
    const { model, dimension } = await probeEmbeddingModel(apiKey);
    console.log(`Chosen model: ${model} (vector dimension: ${dimension})`);

    // Write to .env
    let envContent = fs.readFileSync(ENV_FILE, 'utf8');
    if (/^GEMINI_EMBED_MODEL=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^GEMINI_EMBED_MODEL=.*$/m, `GEMINI_EMBED_MODEL=${model}`);
    } else {
      envContent += `\nGEMINI_EMBED_MODEL=${model}\n`;
    }
    fs.writeFileSync(ENV_FILE, envContent, 'utf8');
    console.log(`Updated .env with GEMINI_EMBED_MODEL=${model}`);
  } catch (err) {
    console.error(`Embed probe error: ${err.message}`);
    process.exit(1);
  }
}

runProbe();
