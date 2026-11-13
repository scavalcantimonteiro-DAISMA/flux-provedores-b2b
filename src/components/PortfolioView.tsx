import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  CalendarCheck, 
  FileSpreadsheet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  Tv,
  Trash2,
  Users,
  Eye,
  StickyNote,
  Wifi,
  Sparkles,
  PhoneCall,
  DollarSign,
  Package
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../services/api';
import { DashboardStats, Lead, LeadStatus, User } from '../types';
import { LeadOutcomeModal } from './LeadOutcomeModal';

interface PortfolioViewProps {
  currentUser: User;
  onLeadUpdated: () => void;
  onRequestNotes: (lead: Lead) => void;
}

const STATUS_BADGES: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
  NOVO: { label: 'Novo (A Contatar)', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  CONTATO_REALIZADO: { label: '📞 Contato Feito', bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300' },
  COTACAO_ENVIADA: { label: '📝 Cotação Enviada', bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-300' },
  AMOSTRA_AGENDADA: { label: '📦 Amostra Técnica', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
  VISITA_AGENDADA: { label: '🟢 Visita Agendada', bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-300' },
  OUTRO_DISTRIBUIDOR: { label: '🏢 Outro Distribuidor', bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300' },
  FECHADO: { label: '🏆 Cliente Ativo (Fechado)', bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-300' },
  SEM_INTERESSE: { label: '🔴 Sem Interesse', bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-300' }
};

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  currentUser,
  onLeadUpdated,
  onRequestNotes
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [porteFilter, setPorteFilter] = useState<string>('ALL');

  // Modal de desfecho comercial especializado
  const [outcomeModalLead, setOutcomeModalLead] = useState<Lead | null>(null);

  // Controle de Supervisor para Adm
  const [targetUserId, setTargetUserId] = useState<string>(currentUser.id);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (currentUser.role === 'admin') {
      loadTeamUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    loadPortfolioData();
  }, [targetUserId, statusFilter, porteFilter, searchTerm]);

  const loadTeamUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('Erro ao carregar equipe:', err);
    }
  };

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const target = currentUser.role === 'admin' ? targetUserId : currentUser.id;
      const [leadsData, statsData] = await Promise.all([
        api.getLeads({
          status: statusFilter,
          porte: porteFilter,
          search: searchTerm,
          targetUserId: target
        }),
        api.getStats(target)
      ]);
      setLeads(leadsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar carteira de provedores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
    if (newStatus !== 'NOVO') {
      setOutcomeModalLead(lead);
      return;
    }

    try {
      await api.updateLeadStatus(lead.id, { status: newStatus });
      loadPortfolioData();
      onLeadUpdated();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status');
    }
  };

  const handleRecordCall = async (lead: Lead) => {
    try {
      await api.recordCall(lead.id);
      loadPortfolioData();
      onLeadUpdated();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar ligação');
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Tem certeza que deseja remover o provedor "${lead.tradeName}" da sua carteira?`)) {
      return;
    }
    try {
      await api.deleteLead(lead.id);
      loadPortfolioData();
      onLeadUpdated();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir provedor');
    }
  };

  const openWhatsApp = (lead: Lead) => {
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá, tudo bem? Sou ${currentUser.name} da equipe comercial da SCM TECH Telecomunicações & Fibra Óptica.\n\n` +
      `Entro em contato com o provedor ${lead.tradeName} a respeito da nossa linha completa de Cabos Drop, ONUs GPON e Caixas CTO homologadas.\n\n` +
      `Gostaria de falar com o responsável de compras (${lead.contactPerson}) para enviar nossa tabela de preços e verificar condições de fornecimento.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const openMaps = (lead: Lead) => {
    const query = encodeURIComponent(`${lead.tradeName}, ${lead.street}, ${lead.number}, ${lead.city} - ${lead.state}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const exportToExcel = () => {
    const rows = leads.map(l => ({
      'Nome Fantasia (ISP)': l.tradeName,
      'Razão Social': l.companyName,
      'Porte': l.porte,
      'Status': STATUS_BADGES[l.status]?.label || l.status,
      'ASN': l.asn || 'N/A',
      'Assinantes Ativos': l.estimatedSubscribers,
      'Distribuidor Atual': l.currentDistributor || 'Não informado',
      'Valor Cotação': l.quoteValue || 'N/A',
      'Telefone Comercial': l.phone,
      'WhatsApp': l.whatsapp,
      'E-mail Compras': l.email,
      'Website': l.website,
      'Endereço': `${l.street}, ${l.number} - ${l.neighborhood}`,
      'Cidade': l.city,
      'Estado (UF)': l.state,
      'CEP': l.cep,
      'CNPJ': l.cnpj,
      'Decisor de Compras': l.contactPerson,
      'Cargo do Decisor': l.contactRole,
      'Demanda Sugerida': l.materialDemand,
      'Total Ligações Feitas': l.callCount || 0,
      'Data da Visita/Reunião': l.visitDate ? new Date(l.visitDate).toLocaleString('pt-BR') : 'Não agendada',
      'Observações da Visita': l.visitNotes || '',
      'Vendedor Responsável': l.userName || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Provedores SCM TECH B2B');
    XLSX.writeFile(workbook, `Carteira_Provedores_SCM_TECH_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Carteira</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.total}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">A Contatar</span>
            <span className="text-2xl font-black text-slate-700 mt-1 block">{stats.novos}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-[#e06b00] uppercase tracking-wider block">Contatos Feitos</span>
            <span className="text-2xl font-black text-[#e06b00] mt-1 block">{stats.contatoRealizado}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Cotações Enviadas</span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">{stats.cotacaoEnviada}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Visitas / Amostras</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.visitasAgendadas}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Clientes Fechados</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">{stats.fechados}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">Outro Distribuidor</span>
            <span className="text-2xl font-black text-orange-600 mt-1 block">{stats.outroDistribuidor}</span>
          </div>
        </div>
      )}

      {/* Filter and Actions Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Supervisor Selector for Admin */}
        {currentUser.role === 'admin' && (
          <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e06b00]" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Auditoria do Administrador SCM TECH:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Exibindo carteira de:</span>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-orange-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/30"
              >
                <option value={currentUser.id}>Minha Própria Carteira (Admin)</option>
                <option value="all">🌐 Toda a Equipe (Todos os Provedores)</option>
                {allUsers
                  .filter(u => u.id !== currentUser.id)
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      👤 Vendedor: {u.name} (@{u.username})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {/* Search & Selectors */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome do ISP, CNPJ, ASN ou cidade..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/20 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Porte Filter */}
            <select
              value={porteFilter}
              onChange={(e) => setPorteFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:border-[#ff7a00]"
            >
              <option value="ALL">Todos os Portes</option>
              <option value="PEQUENO">📦 Pequeno Porte (15 - 1k)</option>
              <option value="MEDIO">🏢 Médio Porte (1k - 10k)</option>
              <option value="GRANDE">🌐 Grande Porte (+10k)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:border-[#ff7a00]"
            >
              <option value="ALL">Todos os Status</option>
              <option value="NOVO">⚪ Novo (A Contatar)</option>
              <option value="CONTATO_REALIZADO">📞 Contato Feito</option>
              <option value="COTACAO_ENVIADA">📝 Cotação Enviada</option>
              <option value="AMOSTRA_AGENDADA">📦 Amostra Técnica</option>
              <option value="VISITA_AGENDADA">🟢 Visita Agendada</option>
              <option value="OUTRO_DISTRIBUIDOR">🏢 Outro Distribuidor</option>
              <option value="FECHADO">🏆 Cliente Ativo (Fechado)</option>
              <option value="SEM_INTERESSE">🔴 Sem Interesse</option>
            </select>

            {/* Exportar Excel */}
            <button
              type="button"
              onClick={exportToExcel}
              disabled={leads.length === 0}
              className="px-3.5 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 border border-slate-200"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-3 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Carregando carteira de provedores...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Wifi className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhum provedor encontrado nesta carteira</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Use a aba <strong>"Minerar Provedores"</strong> para selecionar o estado, o porte e extrair os dados de contato dos ISPs para sua lista!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const statusConfig = STATUS_BADGES[lead.status] || STATUS_BADGES.NOVO;
            return (
              <div
                key={lead.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Lead Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-lg">
                        {lead.tradeName}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#e06b00] border border-orange-200">
                        {lead.porte}
                      </span>

                      {/* ASN */}
                      {lead.asn && lead.asn.startsWith('AS') && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 border border-blue-200 text-blue-800">
                          🌐 {lead.asn}
                        </span>
                      )}

                      {/* Distribuidor Concorrente */}
                      {lead.currentDistributor && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-900 border border-orange-200">
                          Compra de: {lead.currentDistributor}
                        </span>
                      )}

                      {/* Cotação */}
                      {lead.quoteValue && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                          Cotação: {lead.quoteValue}
                        </span>
                      )}

                      {/* Visita Agendada */}
                      {lead.visitDate && (lead.status === 'VISITA_AGENDADA' || lead.status === 'AMOSTRA_AGENDADA') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                          <CalendarCheck className="w-3.5 h-3.5" />
                          Reunião: {new Date(lead.visitDate).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-mono">
                      {lead.companyName} • CNPJ: {lead.cnpj}
                    </p>

                    {/* Telecom Details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 pt-0.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-orange-900 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                        👥 {lead.estimatedSubscribers}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Decisor: <strong className="text-slate-900 font-bold">{lead.contactPerson}</strong> ({lead.contactRole})</span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {lead.street}, {lead.number} - {lead.neighborhood}, {lead.city}/{lead.state}
                      </span>
                    </div>

                    {/* Material Demand */}
                    <div className="text-xs text-slate-600 flex items-center gap-2 pt-0.5">
                      <Package className="w-3.5 h-3.5 text-[#ff7a00] shrink-0" />
                      <span>Demanda: <strong className="text-slate-800">{lead.materialDemand}</strong></span>
                    </div>

                    {/* Call counter & notes */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                      <span>Ligações Feitas: <strong className="text-slate-800">{lead.callCount || 0}</strong></span>
                      {lead.lastCallAt && (
                        <span>• Última em: {new Date(lead.lastCallAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      )}
                      {lead.notes && lead.notes.length > 0 && (
                        <span className="text-[#e06b00] font-medium">
                          • {lead.notes.length} anotação(ões)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Botão Registrar Retorno Comercial (SUPER DESTAQUE) */}
                    <button
                      type="button"
                      onClick={() => setOutcomeModalLead(lead)}
                      title="Registrar se falou com o comprador, enviou cotação, amostra ou fechou pedido"
                      className="px-3.5 py-2.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Registrar Contato / Desfecho</span>
                    </button>

                    {/* Ligar Telefone */}
                    <a
                      href={`tel:${lead.phone.replace(/\D/g, '')}`}
                      title={`Ligar para ${lead.phone}`}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#ff7a00]" />
                      <span>{lead.phone}</span>
                    </a>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => openWhatsApp(lead)}
                      title="Abrir WhatsApp com Proposta Comercial"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Maps */}
                    <button
                      type="button"
                      onClick={() => openMaps(lead)}
                      title="Ver Rota no Google Maps"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition cursor-pointer border border-slate-200"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>

                    {/* Anotações */}
                    <button
                      type="button"
                      onClick={() => onRequestNotes(lead)}
                      title="Ver e Adicionar Anotações"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 transition cursor-pointer border border-slate-200"
                    >
                      <StickyNote className="w-4 h-4" />
                    </button>

                    {/* Seletor Rápido */}
                    <select
                      value={lead.status}
                      onChange={(e) => handleQuickStatusChange(lead, e.target.value as LeadStatus)}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff7a00]"
                    >
                      <option value="NOVO">⚪ Novo</option>
                      <option value="CONTATO_REALIZADO">📞 Contato Feito</option>
                      <option value="COTACAO_ENVIADA">📝 Cotação Enviada</option>
                      <option value="AMOSTRA_AGENDADA">📦 Amostra Técnica</option>
                      <option value="VISITA_AGENDADA">🟢 Visita Agendada</option>
                      <option value="OUTRO_DISTRIBUIDOR">🏢 Outro Distribuidor</option>
                      <option value="FECHADO">🏆 Fechado</option>
                      <option value="SEM_INTERESSE">🔴 Sem Interesse</option>
                    </select>

                    {/* Excluir */}
                    <button
                      type="button"
                      onClick={() => handleDelete(lead)}
                      title="Remover da Minha Carteira"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Modal */}
      {outcomeModalLead && (
        <LeadOutcomeModal
          lead={outcomeModalLead}
          onClose={() => setOutcomeModalLead(null)}
          onSuccess={() => {
            setOutcomeModalLead(null);
            loadPortfolioData();
            onLeadUpdated();
          }}
        />
      )}
    </div>
  );
};
