import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Lock, 
  Shield, 
  Briefcase, 
  Phone, 
  CalendarCheck, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

interface UserManagementViewProps {
  currentUser: User;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('vendedor');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.createUser({ name, username, password, role });
      setName('');
      setUsername('');
      setPassword('');
      setRole('vendedor');
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar consultor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Tem certeza que deseja remover o usuário "${user.name}"?`)) {
      return;
    }
    try {
      await api.deleteUser(user.id);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir usuário');
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditPassword('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await api.updateUser(editingUser.id, {
        name: editName,
        username: editUsername,
        password: editPassword || undefined
      });
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar dados do usuário');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.updateUser(user.id, { active: !user.active });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#121216] via-[#1a1a24] to-[#ff7a00]/20 p-6 sm:p-8 rounded-3xl border border-[#282832] text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a00]/15 border border-[#ff7a00]/30 text-[#ff7a00] text-xs font-black uppercase tracking-wider mb-3">
            <Users className="w-4 h-4" />
            Gestão da Equipe Comercial B2B
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Consultores & Controle de Acesso
          </h1>
          <p className="text-slate-300 text-sm mt-1.5">
            Cadastre novos consultores de vendas. Cada consultor possui isolamento total de carteira, visualizando apenas os provedores que ele minerar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Criação */}
        <div className="bg-[#121216] border border-[#282832] rounded-3xl p-6 shadow-xl h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#282832]">
            <UserPlus className="w-5 h-5 text-[#ff7a00]" />
            <h2 className="text-base font-extrabold text-white">Novo Consultor</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Matheus Silva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Login / Usuário
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: matheus.scm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tipo de Perfil
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs font-semibold text-white focus:outline-none focus:border-[#ff7a00]"
              >
                <option value="vendedor">💼 Consultor de Vendas (Carteira Própria)</option>
                <option value="admin">🛡️ Administrador (Acesso Geral)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-[#ff7a00]/25 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar Consultor'}
            </button>
          </form>
        </div>

        {/* Tabela de Usuários */}
        <div className="lg:col-span-2 bg-[#121216] border border-[#282832] rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#282832]">
            <h2 className="text-base font-extrabold text-white">Consultores Cadastrados ({users.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <div className="inline-block w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs">Carregando consultores...</p>
            </div>
          ) : (
            <div className="divide-y divide-[#22222d] space-y-3">
              {users.map((u) => {
                const m = u.metrics || { totalLeads: 0, totalCalls: 0, quotesSent: 0, scheduledVisits: 0, closedDeals: 0 };
                return (
                  <div key={u.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{u.name}</span>
                        <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-[#ff7a00]/15 text-[#ff7a00] border border-[#ff7a00]/30">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-blue-950/50 text-blue-300 border border-blue-800">
                            CONSULTOR
                          </span>
                        )}
                        {u.active === false && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-rose-950/50 text-rose-300 border border-rose-800">
                            INATIVO
                          </span>
                        )}
                      </div>

                      {/* Métricas rápidas */}
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                          Leads: <strong className="text-white">{m.totalLeads}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          Ligações: <strong className="text-white">{m.totalCalls}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                          Cotações: <strong className="text-blue-300">{m.quotesSent}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          Fechados: <strong className="text-purple-300">{m.closedDeals}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u)}
                        title={u.active === false ? 'Reativar Consultor' : 'Desativar Consultor'}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          u.active === false
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50'
                            : 'bg-[#181822] border-[#282832] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {u.active === false ? 'Ativar' : 'Ativo'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        title="Editar Nome e Senha"
                        className="p-2 rounded-xl bg-[#181822] border border-[#282832] text-slate-400 hover:text-[#ff7a00] transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          title="Excluir Consultor"
                          className="p-2 rounded-xl bg-[#181822] border border-[#282832] text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121216] rounded-3xl border border-[#282832] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#282832]">
              <h3 className="font-extrabold text-white text-base">Editar Consultor</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Login</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 font-bold text-xs shadow-md shadow-[#ff7a00]/25"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
