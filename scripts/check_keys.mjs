import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(projectRoot, 'backend', '.env');

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

async function checkGroq(apiKey, model = 'llama-3.3-70b-versatile') {
  if (!apiKey || apiKey.includes('your_groq_api_key_here')) {
    console.log('[Groq Provider]: NOT CONFIGURED (No GROQ_API_KEY found in backend/.env)');
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 1
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (res.ok) {
      console.log(`[Groq Provider]: PASS (HTTP ${res.status})`);
      return true;
    } else {
      console.log(`[Groq Provider]: FAIL (HTTP ${res.status})`);
      return false;
    }
  } catch (err) {
    console.log(`[Groq Provider]: FAIL (Connection Error: ${err.message || 'Network Timeout'})`);
    return false;
  }
}

async function checkGemini(apiKey, model = 'gemini-1.5-flash') {
  if (!apiKey || apiKey.includes('your_gemini_api_key_here')) {
    console.log('[Google Gemini Provider]: NOT CONFIGURED (No GEMINI_API_KEY found in backend/.env)');
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const endpointModel = model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${endpointModel}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping' }] }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (res.ok) {
      console.log(`[Google Gemini Provider]: PASS (HTTP ${res.status})`);
      return true;
    } else {
      console.log(`[Google Gemini Provider]: FAIL (HTTP ${res.status})`);
      return false;
    }
  } catch (err) {
    console.log(`[Google Gemini Provider]: FAIL (Connection Error: ${err.message || 'Network Timeout'})`);
    return false;
  }
}

async function main() {
  console.log('==================================================');
  console.log('COMMUNIQ - Free AI Provider Key Verification');
  console.log('==================================================\n');

  if (!fs.existsSync(envPath)) {
    console.log(`Notice: backend/.env was not found at ${envPath}.`);
    console.log('Please copy backend/.env.example to backend/.env and add your free keys.');
    console.log('\n[Groq Provider]: NOT CONFIGURED');
    console.log('[Google Gemini Provider]: NOT CONFIGURED\n');
    console.log('Local fallback engine remains active and 100% functional.');
    return;
  }

  const env = parseEnv(envPath);
  const groqKey = env.GROQ_API_KEY || '';
  const groqModel = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const geminiKey = env.GEMINI_API_KEY || '';
  const geminiModel = env.GEMINI_MODEL || 'gemini-1.5-flash';

  console.log('Checking Groq connectivity...');
  await checkGroq(groqKey, groqModel);

  console.log('Checking Google Gemini connectivity...');
  await checkGemini(geminiKey, geminiModel);

  console.log('\nAudit note: Secret keys are never printed, logged, or echoed.');
}

main().catch((err) => {
  console.error('Key verification encountered an error:', err.message);
  process.exit(1);
});
