import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import leadRoutes from './routes/leads.js';
import searchRoutes from './routes/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Inicializa banco de dados
initDb();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rotas da API (duplo mapeamento para compatibilidade perfeita com Vercel Serverless)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/users', '/users'], userRoutes);
app.use(['/api/leads', '/leads'], leadRoutes);
app.use(['/api/search', '/search'], searchRoutes);

// Healthcheck
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    system: 'SCM TECH Provedores B2B',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Arquivos estáticos do build React
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback SPA
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/leads') || req.path.startsWith('/users') || req.path.startsWith('/search')) {
    return res.status(404).json({ error: 'Endpoint da API não encontrado.' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('SCM TECH Provedores B2B API Online. Aguardando build do frontend.');
    }
  });
});

export default app;
