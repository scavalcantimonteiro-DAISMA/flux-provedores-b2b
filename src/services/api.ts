import { DashboardStats, Lead, LeadStatus, IspPorte, PorteConfig, StateConfig, User } from '../types';

const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('flux_b2b_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha no login' }));
      throw new Error(err.error || 'Erro ao realizar login');
    }
    const data = await res.json();
    localStorage.setItem('flux_b2b_token', data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Sessão expirada');
    }
    return res.json();
  },

  logout() {
    localStorage.removeItem('flux_b2b_token');
  },

  // Usuários (Admin)
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/users`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Falha ao carregar equipe');
    return res.json();
  },

  async createUser(userData: { name: string; username: string; password: string; role?: string }): Promise<User> {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao cadastrar usuário');
    }
    return res.json();
  },

  async updateUser(id: string, userData: Partial<User & { password?: string }>): Promise<User> {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar usuário');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir usuário');
    }
  },

  // Provedores / Leads
  async getLeads(filters: {
    status?: string;
    porte?: string;
    state?: string;
    city?: string;
    search?: string;
    targetUserId?: string;
  } = {}): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.porte) params.append('porte', filters.porte);
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);
    if (filters.search) params.append('search', filters.search);
    if (filters.targetUserId) params.append('targetUserId', filters.targetUserId);

    const res = await fetch(`${BASE_URL}/leads?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Falha ao carregar carteira de provedores');
    return res.json();
  },

  async getStats(targetUserId?: string): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (targetUserId) params.append('targetUserId', targetUserId);
    const res = await fetch(`${BASE_URL}/leads/stats?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Falha ao carregar estatísticas');
    return res.json();
  },

  async importLeads(leads: Partial<Lead>[], assignToUserId?: string): Promise<{ count: number; leads: Lead[] }> {
    const res = await fetch(`${BASE_URL}/leads/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ leads, assignToUserId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao importar provedores');
    }
    return res.json();
  },

  async updateLeadStatus(id: string, data: {
    status: LeadStatus;
    currentDistributor?: string | null;
    quoteValue?: string | null;
    visitDate?: string | null;
    visitNotes?: string | null;
    note?: string;
  }): Promise<{ lead: Lead }> {
    const res = await fetch(`${BASE_URL}/leads/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar situação');
    }
    return res.json();
  },

  async recordCall(id: string, note?: string): Promise<{ lead: Lead }> {
    const res = await fetch(`${BASE_URL}/leads/${id}/call`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ note })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao registrar ligação');
    }
    return res.json();
  },

  async addNote(id: string, text: string): Promise<{ lead: Lead }> {
    const res = await fetch(`${BASE_URL}/leads/${id}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao salvar anotação');
    }
    return res.json();
  },

  async deleteLead(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao excluir provedor');
    }
  },

  // Busca e Mineração de ISPs
  async getStates(): Promise<StateConfig[]> {
    const res = await fetch(`${BASE_URL}/search/states`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Falha ao carregar estados');
    return res.json();
  },

  async getPortes(): Promise<Record<IspPorte, PorteConfig>> {
    const res = await fetch(`${BASE_URL}/search/portes`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Falha ao carregar portes');
    return res.json();
  },

  async generateLeads(params: {
    state: string;
    city?: string;
    porte?: string;
    count: number;
  }): Promise<{ count: number; state: string; uf: string; leads: Lead[] }> {
    const res = await fetch(`${BASE_URL}/search/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao minerar provedores');
    }
    return res.json();
  }
};
