import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

export function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable "${name}" is missing or empty`);
  }
  return value;
}

export const config = Object.freeze({
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
  GROQ_MIN_INTERVAL_MS: Number(process.env.GROQ_MIN_INTERVAL_MS) || 10000,
  GROQ_DAILY_TOKEN_CAP: Number(process.env.GROQ_DAILY_TOKEN_CAP) || 90000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_EMBED_MODEL: process.env.GEMINI_EMBED_MODEL || '',
  GEMINI_EMBED_MIN_INTERVAL_MS: Number(process.env.GEMINI_EMBED_MIN_INTERVAL_MS) || 1000,
  CHROMA_URL: process.env.CHROMA_URL || 'http://localhost:8000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  MONGODB_DB: process.env.MONGODB_DB || 'travel_qa',
  PORT: Number(process.env.PORT) || 3001,
  JWT_SECRET: process.env.JWT_SECRET || '',
  SEED_DEMO_PASSWORD: process.env.SEED_DEMO_PASSWORD || '',
  // Set ONCE before evaluation, never tuned. Do not change.
  RAG_SIM_FLOOR: 0.3
});

// Set ONCE before evaluation, never tuned. Do not change.
export const RAG_SIM_FLOOR = 0.3;

export default config;
