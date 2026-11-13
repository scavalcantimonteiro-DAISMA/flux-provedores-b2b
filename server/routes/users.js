import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDb } from '../db.js';
import { authenticateToken, requireAdmin } from './auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/users - Lista todos os usuários e suas métricas
router.get('/', (req, res) => {
  const db = getDb();
  
  const usersWithMetrics = db.users.map(u => {
    const userLeads = db.leads.filter(l => l.userId === u.id);
    const totalCalls = userLeads.reduce((acc, l) => acc + (l.callCount || 0), 0);
    const quotesSent = userLeads.filter(l => l.status === 'COTACAO_ENVIADA').length;
    const scheduledVisits = userLeads.filter(l => l.status === 'VISITA_AGENDADA' || l.status === 'AMOSTRA_AGENDADA').length;
    const closedDeals = userLeads.filter(l => l.status === 'FECHADO').length;

    return {
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role,
      active: u.active !== false,
      createdAt: u.createdAt,
      metrics: {
        totalLeads: userLeads.length,
        totalCalls,
        quotesSent,
        scheduledVisits,
        closedDeals
      }
    };
  });

  res.json(usersWithMetrics);
});

// POST /api/users - Cadastra novo vendedor/usuário
router.post('/', async (req, res) => {
  try {
    const { name, username, password, role = 'vendedor' } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Preencha Nome, Login e Senha.' });
    }

    const db = getDb();
    const existing = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Este login já está em uso por outro consultor.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      username: username.trim(),
      password: passwordHash,
      role: role === 'admin' ? 'admin' : 'vendedor',
      active: true,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await saveDb();

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      role: newUser.role,
      active: newUser.active,
      createdAt: newUser.createdAt
    });
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
});

// PUT /api/users/:id - Atualiza dados ou senha do usuário
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, active, role } = req.body;
    const db = getDb();

    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (name) user.name = name.trim();
    if (username) {
      const conflict = db.users.find(u => u.id !== id && u.username.toLowerCase() === username.trim().toLowerCase());
      if (conflict) {
        return res.status(400).json({ error: 'Este login já está em uso.' });
      }
      user.username = username.trim();
    }
    if (password && password.trim()) {
      user.password = await bcrypt.hash(password.trim(), 10);
    }
    if (typeof active === 'boolean') {
      user.active = active;
    }
    if (role && (role === 'admin' || role === 'vendedor')) {
      user.role = role;
    }

    await saveDb();

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      active: user.active
    });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// DELETE /api/users/:id - Remove vendedor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Você não pode excluir a sua própria conta de Administrador.' });
    }

    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    db.users.splice(index, 1);
    await saveDb();

    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
});

export default router;
