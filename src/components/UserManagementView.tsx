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
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();

      // Recupera backup local do navegador
      const localBackupRaw = localStorage.getItem('scm_provedores_vault_backup');
      if (localBackupRaw) {
        try {
          const localBackup = JSON.parse(localBackupRaw);
          if (localBackup && Array.isArray(localBackup.users) && localBackup.users.length > data.length) {
            // Cold start detectado! Auto-sincroniza vendedores do navegador para o servidor
            setSyncStatus('Sincronizando vendedores salvos com o servidor...');
            await api.syncSystem({ users: localBackup.users });
            const reloaded = await api.getUsers();
            setUsers(reloaded);
            setSyncStatus('✅ Vendedores sincronizados com sucesso!');
            setLoading(false);
            return;
          }
        } catch {}
      }

      setUsers(data);

      // Atualiza backup silencioso local
      try {
        const fullBackup = await api.getBackup();
        localStorage.setItem('scm_provedores_vault_backup', JSON.stringify(fullBackup));
      } catch {}
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const backup = await api.getBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_equipe_provedores_scm_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erro ao baixar backup: ' + err.message);
    }
  };

  const handleUploadBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.users)) {
        alert('Arquivo de backup inválido.');
        return;
      }
      await api.restoreBackup(parsed);
      localStorage.setItem('scm_provedores_vault_backup', JSON.stringify(parsed));
      alert(`Backup restaurado com sucesso! ${parsed.users.length} usuários carregados.`);
      loadUsers();
    } catch (err: any) {
      alert('Erro ao restaurar backup: ' + err.message);
    } finally {
      e.target.value = '';
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 rounded-3xl border border-slate-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a00]/20 border border-[#ff7a00]/40 text-[#ff7a00] text-xs font-black uppercase tracking-wider">
              <Users className="w-4 h-4" />
              Gestão da Equipe Comercial B2B
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              🛡️ Persistência Protegida Ativa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Consultores & Controle de Acesso
          </h1>
          <p className="text-slate-300 text-sm mt-1.5">
            Cadastre novos consultores de vendas. Cada consultor possui isolamento total de carteira, visualizando apenas os provedores que ele minerar.
          </p>
          {syncStatus && (
            <p className="mt-2 text-xs font-semibold text-emerald-300 animate-fadeIn">
              {syncStatus}
            </p>
          )}
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadBackup}
            title="Baixar arquivo de backup com todos os consultores e carteiras"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            💾 Baixar Backup
          </button>

          <label
            title="Restaurar consultores a partir de um backup .json"
            className="px-4 py-2.5 rounded-xl bg-[#ff7a00]/25 hover:bg-[#ff7a00]/40 border border-[#ff7a00]/50 text-xs font-bold text-[#ff7a00] transition flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            🔄 Restaurar
            <input
              type="file"
              accept=".json"
              onChange={handleUploadBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Criação */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <UserPlus className="w-5 h-5 text-[#ff7a00]" />
            <h2 className="text-base font-extrabold text-slate-900">Novo Consultor</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Matheus Silva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Login / Usuário
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: matheus.scm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff7a00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Perfil
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff7a00]"
              >
                <option value="vendedor">💼 Consultor de Vendas (Carteira Própria)</option>
                <option value="admin">🛡️ Administrador (Acesso Geral)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar Consultor'}
            </button>
          </form>
        </div>

        {/* Tabela de Usuários */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900">Consultores Cadastrados ({users.length})</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              <div className="inline-block w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs">Carregando consultores...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-3">
              {users.map((u) => {
                const m = u.metrics || { totalLeads: 0, totalCalls: 0, quotesSent: 0, scheduledVisits: 0, closedDeals: 0 };
                return (
                  <div key={u.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{u.name}</span>
                        <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#e06b00] border border-orange-200">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            CONSULTOR
                          </span>
                        )}
                        {u.active === false && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            INATIVO
                          </span>
                        )}
                      </div>

                      {/* Métricas rápidas */}
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          Leads: <strong className="text-slate-900">{m.totalLeads}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          Ligações: <strong className="text-slate-900">{m.totalCalls}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                          Cotações: <strong className="text-blue-800">{m.quotesSent}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          Fechados: <strong className="text-purple-800">{m.closedDeals}</strong>
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
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {u.active === false ? 'Ativar' : 'Ativo'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        title="Editar Nome e Senha"
                        className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#ff7a00] hover:bg-orange-50 transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          title="Excluir Consultor"
                          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base">Editar Consultor</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Login</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 font-bold text-xs shadow-sm"
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
