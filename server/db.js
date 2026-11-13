import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
const DB_FILE = isVercel 
  ? path.join('/tmp', 'database.json') 
  : path.join(__dirname, 'data', 'database.json');

let dbMemory = null;

// Configuração persistente oficial Upstash KV / Redis
const DEFAULT_KV_URL = 'https://excited-satyr-201088.upstash.io';
const DEFAULT_KV_TOKEN = 'gQAAAAAAAxGAAAIgcDE3ZjEwNWVkMjY4N2I0NzYyOWExZThiMWY3OTc5Y2MyMg';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || DEFAULT_KV_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || DEFAULT_KV_TOKEN;
const KV_KEY = 'scm_provedores_b2b_database';

async function fetchFromKv() {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.result) {
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      if (parsed && Array.isArray(parsed.users)) {
        console.log(`☁️ [Upstash KV Provedores] Carregados ${parsed.users.length} consultores e ${parsed.leads?.length || 0} provedores da nuvem.`);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Aviso: falha ao ler do Upstash KV:', err.message);
  }
  return null;
}

async function saveToKv(data) {
  if (!KV_URL || !KV_TOKEN) return;
  try {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const res = await fetch(`${KV_URL}/set/${KV_KEY}`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: payload
    });
    if (res.ok) {
      console.log(`☁️ [Upstash KV Provedores] Gravado na nuvem permanente com sucesso (${data.users?.length || 0} consultores).`);
    }
  } catch (err) {
    console.warn('Aviso: falha ao gravar no Upstash KV:', err.message);
  }
}

export async function initDb() {
  if (dbMemory) return;

  const defaultAdminPassword = await bcrypt.hash('Flux@2026', 10);

  const defaultDb = {
    users: [
      {
        id: 'usr_admin_default',
        name: 'Saulo (Administrador SCM TECH)',
        username: 'Adm',
        password: defaultAdminPassword,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_flux_admin',
        name: 'Saulo (Administrador SCM TECH)',
        username: 'Flux',
        password: defaultAdminPassword,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString()
      }
    ],
    leads: []
  };

  try {
    // 1. Tenta carregar do Upstash KV primeiro (persistência eterna na nuvem)
    const kvData = await fetchFromKv();
    if (kvData) {
      dbMemory = kvData;
    } else if (isVercel) {
      // 2. Tenta carregar do /tmp
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        dbMemory = JSON.parse(raw);
      } else {
        try {
          dbMemory = require('./data/database.json');
        } catch {
          dbMemory = defaultDb;
        }
      }
    } else {
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        dbMemory = JSON.parse(raw);
      } else {
        dbMemory = defaultDb;
      }
    }

    // Garante que ambos os usuários Adm e Flux existam
    let needsSave = false;
    for (const defUser of defaultDb.users) {
      const exists = dbMemory.users.find(u => u.username.toLowerCase() === defUser.username.toLowerCase());
      if (!exists) {
        dbMemory.users.push(defUser);
        needsSave = true;
      }
    }

    if (needsSave || !kvData) {
      await saveDb();
    }

  } catch (err) {
    console.error('Erro ao ler banco de dados, usando memória padrão:', err);
    dbMemory = defaultDb;
  }
}

export function getDb() {
  if (!dbMemory) {
    throw new Error('Banco de dados não inicializado. Chame initDb() primeiro.');
  }
  return dbMemory;
}

export async function saveDb() {
  if (!dbMemory) return;

  // 1. Salva no Upstash KV com await para garantir sincronização
  await saveToKv(dbMemory);

  // 2. Salva no disco
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
  } catch (err) {
    // Em ambientes serverless estritos continua na nuvem e na memória
  }
}

// Sincroniza e mescla vendedores e leads para evitar perda em cold-starts da Vercel
export async function syncDb({ users = [], leads = [] }) {
  if (!dbMemory) await initDb();
  let changed = false;

  if (Array.isArray(users)) {
    for (const u of users) {
      if (!u || !u.username) continue;
      const idx = dbMemory.users.findIndex(x => x.username.toLowerCase() === u.username.toLowerCase());
      if (idx === -1) {
        dbMemory.users.push(u);
        changed = true;
      } else {
        if (u.password && !dbMemory.users[idx].password) {
          dbMemory.users[idx].password = u.password;
          changed = true;
        }
      }
    }
  }

  if (Array.isArray(leads)) {
    for (const l of leads) {
      if (!l || !l.id) continue;
      const idx = dbMemory.leads.findIndex(x => x.id === l.id);
      if (idx === -1) {
        dbMemory.leads.push(l);
        changed = true;
      }
    }
  }

  if (changed) {
    await saveDb();
  }

  return dbMemory;
}
