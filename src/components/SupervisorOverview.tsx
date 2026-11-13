import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Phone, 
  CalendarCheck, 
  Trophy, 
  Briefcase, 
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Package,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, User } from '../types';

interface SupervisorOverviewProps {
  onSelectUserToInspect: (userId: string) => void;
}

export const SupervisorOverview: React.FC<SupervisorOverviewProps> = ({ onSelectUserToInspect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [overallStats, setOverallStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        api.getUsers(),
        api.getStats('all')
      ]);
      setUsers(usersData);
      setOverallStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados do supervisor:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 rounded-3xl border border-slate-700 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a00]/20 border border-[#ff7a00]/40 text-[#ff7a00] text-xs font-black uppercase tracking-wider mb-3">
            <TrendingUp className="w-4 h-4" />
            Supervisão Comercial B2B • SCM TECH
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Painel Executivo & Produtividade da Equipe
          </h1>
          <p className="text-slate-300 text-sm mt-1.5">
            Acompanhe o funil de prospecção com provedores: leads minerados, contatos, cotações enviadas e pedidos fechados por cada consultor de telecom.
          </p>
        </div>
      </div>

      {/* Global KPIs */}
      {overallStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Provedores no Funil</span>
              <Briefcase className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-3xl font-black text-slate-900">{overallStats.total}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-[#e06b00] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Ligações Efetuadas</span>
              <Phone className="w-4 h-4 text-[#e06b00]" />
            </div>
            <span className="text-3xl font-black text-[#e06b00]">{overallStats.totalLigacoes}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Cotações Enviadas</span>
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-3xl font-black text-blue-600">{overallStats.cotacaoEnviada}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Visitas & Amostras</span>
              <CalendarCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-3xl font-black text-emerald-600">{overallStats.visitasAgendadas}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pedidos Fechados</span>
              <Trophy className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-3xl font-black text-purple-600">{overallStats.fechados}</span>
          </div>
        </div>
      )}

      {/* Ranking dos Vendedores */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#ff7a00]" />
          <span>Desempenho por Consultor de Vendas</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs">Carregando métricas da equipe...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Consultor</th>
                  <th className="py-3 px-4">Função</th>
                  <th className="py-3 px-4 text-center">Provedores na Carteira</th>
                  <th className="py-3 px-4 text-center">Ligações Feitas</th>
                  <th className="py-3 px-4 text-center">Cotações Enviadas</th>
                  <th className="py-3 px-4 text-center">Visitas Agendadas</th>
                  <th className="py-3 px-4 text-center">Pedidos Fechados</th>
                  <th className="py-3 px-4 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const m = u.metrics || { totalLeads: 0, totalCalls: 0, quotesSent: 0, scheduledVisits: 0, closedDeals: 0 };
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#e06b00] border border-orange-200">
                            ADMINISTRADOR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            CONSULTOR B2B
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {m.totalLeads}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-[#e06b00]">
                        {m.totalCalls}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-blue-700">
                        {m.quotesSent}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {m.scheduledVisits}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-purple-700">
                        {m.closedDeals}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectUserToInspect(u.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#e06b00] text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer border border-slate-200"
                        >
                          <span>Ver Carteira</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
