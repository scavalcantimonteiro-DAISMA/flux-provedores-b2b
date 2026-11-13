import app from './app.js';
import { initDb } from './db.js';

const PORT = process.env.PORT || 3002;

async function start() {
  await initDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FLUX Provedores B2B Backend rodando em http://localhost:${PORT}`);
    console.log(`👤 Administrador Padrão: Flux | Senha: [configurada]`);
  });
}

start();
