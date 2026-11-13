import { Router } from 'express';
import { getDb, saveDb } from '../db.js';
import { authenticateToken } from './auth.js';

const router = Router();
router.use(authenticateToken);

// GET /api/leads - Retorna leads com regra estrita de isolamento de carteira
router.get('/', (req, res) => {
  const db = getDb();
  const { status, porte, search, state, city, targetUserId } = req.query;

  let leads = [...db.leads];

  // Regra de Isolamento de Carteira:
  if (req.user.role !== 'admin') {
    // Vendedor comum vê ESTRITAMENTE a sua carteira
    leads = leads.filter(l => l.userId === req.user.id);
  } else {
    // Administrador FLUX:
    if (targetUserId && targetUserId !== 'all') {
      leads = leads.filter(l => l.userId === targetUserId);
    } else if (!targetUserId) {
      leads = leads.filter(l => l.userId === req.user.id);
    }
    // targetUserId === 'all' exibe todos os leads
  }

  // Filtros
  if (status && status !== 'ALL') {
    leads = leads.filter(l => l.status === status);
  }
  if (porte && porte !== 'ALL') {
    leads = leads.filter(l => l.porte === porte);
  }
  if (state && state !== 'ALL') {
    leads = leads.filter(l => l.state === state);
  }
  if (city) {
    leads = leads.filter(l => l.city.toLowerCase().includes(city.toLowerCase().trim()));
  }
  if (search) {
    const term = search.toLowerCase().trim();
    leads = leads.filter(l =>
      l.tradeName.toLowerCase().includes(term) ||
      l.companyName.toLowerCase().includes(term) ||
      l.cnpj.includes(term) ||
      (l.asn && l.asn.toLowerCase().includes(term)) ||
      l.phone.includes(term) ||
      l.whatsapp.includes(term) ||
      l.city.toLowerCase().includes(term) ||
      l.neighborhood.toLowerCase().includes(term)
    );
  }

  // Ordena por atualização mais recente
  leads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json(leads);
});

// GET /api/leads/stats - Métricas do funil comercial de ISPs
router.get('/stats', (req, res) => {
  const db = getDb();
  const { targetUserId } = req.query;

  let leads = db.leads;

  if (req.user.role !== 'admin') {
    leads = leads.filter(l => l.userId === req.user.id);
  } else if (targetUserId && targetUserId !== 'all') {
    leads = leads.filter(l => l.userId === targetUserId);
  }

  const stats = {
    total: leads.length,
    novos: leads.filter(l => l.status === 'NOVO').length,
    contatoRealizado: leads.filter(l => l.status === 'CONTATO_REALIZADO').length,
    cotacaoEnviada: leads.filter(l => l.status === 'COTACAO_ENVIADA').length,
    visitasAgendadas: leads.filter(l => l.status === 'VISITA_AGENDADA' || l.status === 'AMOSTRA_AGENDADA').length,
    outroDistribuidor: leads.filter(l => l.status === 'OUTRO_DISTRIBUIDOR').length,
    fechados: leads.filter(l => l.status === 'FECHADO').length,
    semInteresse: leads.filter(l => l.status === 'SEM_INTERESSE').length,
    totalLigacoes: leads.reduce((acc, l) => acc + (l.callCount || 0), 0)
  };

  res.json(stats);
});

// POST /api/leads/import - Adiciona leads gerados na carteira
router.post('/import', async (req, res) => {
  try {
    const { leads: incomingLeads, assignToUserId } = req.body;

    if (!Array.isArray(incomingLeads) || incomingLeads.length === 0) {
      return res.status(400).json({ error: 'Nenhum provedor fornecido para importação.' });
    }

    const db = getDb();
    let targetUserId = req.user.id;
    let targetUserName = req.user.name;

    if (req.user.role === 'admin' && assignToUserId) {
      const assigned = db.users.find(u => u.id === assignToUserId);
      if (assigned) {
        targetUserId = assigned.id;
        targetUserName = assigned.name;
      }
    }

    const imported = [];
    const now = new Date().toISOString();

    for (const lead of incomingLeads) {
      // Evita duplicatas do mesmo CNPJ na carteira do mesmo usuário
      const exists = db.leads.some(l => l.cnpj === lead.cnpj && l.userId === targetUserId);
      if (!exists) {
        const newLead = {
          ...lead,
          id: lead.id || `isp_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          userId: targetUserId,
          userName: targetUserName,
          status: lead.status || 'NOVO',
          callCount: 0,
          lastCallAt: null,
          visitDate: lead.visitDate || null,
          visitNotes: lead.visitNotes || null,
          currentDistributor: lead.currentDistributor || null,
          quoteValue: lead.quoteValue || null,
          notes: lead.notes || [],
          createdAt: now,
          updatedAt: now
        };
        db.leads.push(newLead);
        imported.push(newLead);
      }
    }

    await saveDb();

    res.status(201).json({
      message: `${imported.length} provedor(es) adicionados à sua carteira com sucesso!`,
      count: imported.length,
      leads: imported
    });
  } catch (err) {
    console.error('Erro na importação de provedores:', err);
    res.status(500).json({ error: 'Erro ao importar provedores.' });
  }
});

// PUT /api/leads/:id/status - Atualiza situação comercial do provedor
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, visitDate, visitNotes, currentDistributor, quoteValue, note } = req.body;
    const db = getDb();

    const lead = db.leads.find(l => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Provedor não encontrado.' });
    }

    if (req.user.role !== 'admin' && lead.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado a este provedor.' });
    }

    const previousStatus = lead.status;
    lead.status = status;
    lead.updatedAt = new Date().toISOString();

    if (currentDistributor !== undefined) {
      lead.currentDistributor = currentDistributor;
    }
    if (quoteValue !== undefined) {
      lead.quoteValue = quoteValue;
    }
    if (visitDate !== undefined) {
      lead.visitDate = visitDate;
    }
    if (visitNotes !== undefined) {
      lead.visitNotes = visitNotes;
    }

    if (note && note.trim()) {
      lead.notes.push({
        id: `note_${Date.now()}`,
        text: note.trim(),
        createdAt: new Date().toISOString(),
        userName: req.user.name
      });
    } else if (previousStatus !== status) {
      lead.notes.push({
        id: `note_${Date.now()}`,
        text: `Status alterado de "${previousStatus}" para "${status}".`,
        createdAt: new Date().toISOString(),
        userName: req.user.name
      });
    }

    await saveDb();

    res.json({ message: 'Situação do provedor atualizada com sucesso!', lead });
  } catch (err) {
    console.error('Erro ao atualizar status do provedor:', err);
    res.status(500).json({ error: 'Erro ao atualizar status do provedor.' });
  }
});

// POST /api/leads/:id/call - Registra ligação realizada
router.post('/:id/call', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const db = getDb();

    const lead = db.leads.find(l => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Provedor não encontrado.' });
    }

    if (req.user.role !== 'admin' && lead.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado a este provedor.' });
    }

    lead.callCount = (lead.callCount || 0) + 1;
    lead.lastCallAt = new Date().toISOString();
    lead.updatedAt = new Date().toISOString();

    if (lead.status === 'NOVO') {
      lead.status = 'CONTATO_REALIZADO';
    }

    lead.notes.push({
      id: `call_${Date.now()}`,
      text: note ? `📞 Ligação realizada: ${note}` : `📞 Contato telefônico registrado (${lead.callCount}ª ligação).`,
      createdAt: new Date().toISOString(),
      userName: req.user.name
    });

    await saveDb();

    res.json({ message: 'Ligação registrada com sucesso!', lead });
  } catch (err) {
    console.error('Erro ao registrar ligação:', err);
    res.status(500).json({ error: 'Erro ao registrar ligação.' });
  }
});

// POST /api/leads/:id/notes - Adiciona anotação
router.post('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const db = getDb();

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Texto da anotação é obrigatório.' });
    }

    const lead = db.leads.find(l => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Provedor não encontrado.' });
    }

    if (req.user.role !== 'admin' && lead.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado a este provedor.' });
    }

    lead.notes.push({
      id: `note_${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      userName: req.user.name
    });
    lead.updatedAt = new Date().toISOString();

    await saveDb();

    res.status(201).json({ message: 'Anotação salva com sucesso.', lead });
  } catch (err) {
    console.error('Erro ao salvar anotação:', err);
    res.status(500).json({ error: 'Erro ao salvar anotação.' });
  }
});

// DELETE /api/leads/:id - Remove provedor da carteira
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const index = db.leads.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Provedor não encontrado.' });
    }

    const lead = db.leads[index];
    if (req.user.role !== 'admin' && lead.userId !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado para excluir este provedor.' });
    }

    db.leads.splice(index, 1);
    await saveDb();

    res.json({ message: 'Provedor removido da sua carteira.' });
  } catch (err) {
    console.error('Erro ao excluir provedor:', err);
    res.status(500).json({ error: 'Erro ao excluir provedor.' });
  }
});

export default router;
