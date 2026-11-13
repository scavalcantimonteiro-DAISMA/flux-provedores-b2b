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

export async function initDb() {
  if (dbMemory) return;

  const defaultAdminPassword = await bcrypt.hash('Flux@2026', 10);

  const defaultDb = {
    users: [
      {
        id: 'usr_flux_admin',
        name: 'Saulo (Administrador FLUX)',
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
    if (isVercel) {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        dbMemory = JSON.parse(raw);
      } else {
        try {
          dbMemory = require('./data/database.json');
        } catch {
          dbMemory = defaultDb;
        }
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
        } catch {}
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
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      }
    }

    // Garante que o usuário Flux exista com privilégios de Admin
    const adminIndex = dbMemory.users.findIndex(u => u.username.toLowerCase() === 'flux');
    if (adminIndex === -1) {
      dbMemory.users.unshift(defaultDb.users[0]);
      await saveDb();
    } else {
      // Atualiza senha caso precise sincronizar com Flux@2026
      const isMatch = await bcrypt.compare('Flux@2026', dbMemory.users[adminIndex].password);
      if (!isMatch) {
        dbMemory.users[adminIndex].password = defaultAdminPassword;
        await saveDb();
      }
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
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbMemory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Falha ao gravar arquivo de banco no disco (mantido em memória):', err.message);
  }
}
