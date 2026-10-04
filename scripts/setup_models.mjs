import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(projectRoot, 'backend', '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  return env;
}

function updateEnv(filePath, updates) {
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf-8');
  }

  const lines = content.split('\n');
  const updatedKeys = new Set();
  const newLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match && updates[match[1].trim()] !== undefined) {
      const key = match[1].trim();
      newLines.push(`${key}=${updates[key]}`);
      updatedKeys.add(key);
    } else {
      newLines.push(line);
    }
  }

  for (const [key, val] of Object.entries(updates)) {
    if (!updatedKeys.has(key)) {
      newLines.push(`${key}=${val}`);
    }
  }

  fs.writeFileSync(filePath, newLines.join('\n').trim() + '\n', 'utf-8');
}

async function fetchGroqModels(apiKey) {
  if (!apiKey || apiKey.includes('your_groq_api_key_here')) return [];
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || [])
      .map((m) => m.id)
      .filter((id) => id.includes('llama') || id.includes('mixtral') || id.includes('gemma'));
  } catch {
    return [];
  }
}

async function fetchGeminiModels(apiKey) {
  if (!apiKey || apiKey.includes('your_gemini_api_key_here')) return [];
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || [])
      .filter((m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''))
      .filter((name) => name.includes('flash') || name.includes('pro'));
  } catch {
    return [];
  }
}

async function main() {
  console.log('==================================================');
  console.log('COMMUNIQ - Live Provider Free-Tier Model Discovery');
  console.log('==================================================\n');

  if (!fs.existsSync(envPath)) {
    console.log(`backend/.env not found at ${envPath}.`);
    console.log('Please copy backend/.env.example to backend/.env and add your free API keys.');
    rl.close();
    return;
  }

  const env = parseEnv(envPath);
  const groqKey = env.GROQ_API_KEY || '';
  const geminiKey = env.GEMINI_API_KEY || '';

  const updates = {};

  // 1. Groq Models
  console.log('Fetching live available models from Groq official API...');
  const groqModels = await fetchGroqModels(groqKey);
  const defaultGroq = 'llama-3.3-70b-versatile';

  if (groqModels.length > 0) {
    console.log('\nAvailable Groq Models:');
    groqModels.forEach((m, idx) => {
      console.log(`  [${idx + 1}] ${m} ${m === defaultGroq ? '(Recommended)' : ''}`);
    });

    const choice = await question(`\nSelect Groq model number [1-${groqModels.length}] or press Enter for default (${defaultGroq}): `);
    const num = parseInt(choice.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= groqModels.length) {
      updates.GROQ_MODEL = groqModels[num - 1];
    } else {
      updates.GROQ_MODEL = defaultGroq;
    }
  } else {
    console.log(`Could not query Groq models (No valid GROQ_API_KEY). Using fallback config: ${defaultGroq}`);
    updates.GROQ_MODEL = env.GROQ_MODEL || defaultGroq;
  }

  // 2. Gemini Models
  console.log('\nFetching live available models from Google Gemini official API...');
  const geminiModels = await fetchGeminiModels(geminiKey);
  const defaultGemini = 'gemini-1.5-flash';

  if (geminiModels.length > 0) {
    console.log('\nAvailable Google Gemini Models:');
    geminiModels.forEach((m, idx) => {
      console.log(`  [${idx + 1}] ${m} ${m === defaultGemini ? '(Recommended)' : ''}`);
    });

    const choice = await question(`\nSelect Gemini model number [1-${geminiModels.length}] or press Enter for default (${defaultGemini}): `);
    const num = parseInt(choice.trim(), 10);
    if (!isNaN(num) && num >= 1 && num <= geminiModels.length) {
      updates.GEMINI_MODEL = geminiModels[num - 1];
    } else {
      updates.GEMINI_MODEL = defaultGemini;
    }
  } else {
    console.log(`Could not query Gemini models (No valid GEMINI_API_KEY). Using fallback config: ${defaultGemini}`);
    updates.GEMINI_MODEL = env.GEMINI_MODEL || defaultGemini;
  }

  updateEnv(envPath, updates);
  console.log('\nSuccessfully updated backend/.env:');
  console.log(`- GROQ_MODEL=${updates.GROQ_MODEL}`);
  console.log(`- GEMINI_MODEL=${updates.GEMINI_MODEL}`);

  rl.close();
}

main().catch((err) => {
  console.error('Error in setup:models:', err.message);
  rl.close();
  process.exit(1);
});
