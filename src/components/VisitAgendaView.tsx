import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  CalendarCheck,
  Building2,
  Tv,
  ArrowRight,
  Wifi,
  Package
} from 'lucide-react';
import { api } from '../services/api';
import { Lead, User } from '../types';

interface VisitAgendaViewProps {
  currentUser: User;
  onLeadUpdated: () => void;
  onRequestOutcome: (lead: Lead) => void;
}

export const VisitAgendaView: React.FC<VisitAgendaViewProps> = ({
  currentUser,
  onLeadUpdated,
  onRequestOutcome
}) => {
  const [scheduledLeads, setScheduledLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, [currentUser]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const data = await api.getLeads({
        targetUserId: currentUser.role === 'admin' ? 'all' : currentUser.id
      });
      // Filtra os que tem data de visita ou status de visita/amostra
      const filtered = data.filter(l => 
        l.status === 'VISITA_AGENDADA' || 
        l.status === 'AMOSTRA_AGENDADA' || 
        (l.visitDate && l.status !== 'FECHADO' && l.status !== 'SEM_INTERESSE')
      );
      filtered.sort((a, b) => {
        if (!a.visitDate) return 1;
        if (!b.visitDate) return -1;
        return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
      });
      setScheduledLeads(filtered);
    } catch (err) {
      console.error('Erro ao carregar visitas agendadas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkClosed = async (lead: Lead) => {
    try {
      await api.updateLeadStatus(lead.id, {
        status: 'FECHADO',
        note: '🎉 Pedido faturado! Negociação concluída com sucesso após visita/apresentação.'
      });
      loadVisits();
      onLeadUpdated();
    } catch (err: any) {
      alert(err.message || 'Erro ao fechar visita');
    }
  };

  const handleMarkLost = async (lead: Lead) => {
    const reason = prompt('Informe o motivo caso o provedor não tenha fechado agora (ex: comprou de outro fornecedor):');
    try {
      await api.updateLeadStatus(lead.id, {
        status: 'SEM_INTERESSE',
        note: reason ? `Visita/Amostra concluída: ${reason}` : 'Visita/Amostra concluída: sem interesse no momento.'
      });
      loadVisits();
      onLeadUpdated();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar');
    }
  };

  const openWhatsApp = (lead: Lead) => {
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${lead.contactPerson}, tudo bem? Aqui é ${currentUser.name} da SCM TECH Telecom.\n\n` +
      `Estou entrando em contato para confirmar nosso agendamento a respeito da apresentação de materiais de fibra óptica para o ${lead.tradeName}.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#121216] via-[#1a1a24] to-emerald-950/40 p-6 sm:p-8 rounded-3xl border border-[#282832] text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-3">
            <CalendarCheck className="w-4 h-4" />
            Cronograma Comercial & Técnico de ISPs
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Agendamentos de Reuniões & Amostras Técnicas
          </h1>
          <p className="text-slate-300 text-sm mt-1.5">
            Gerencie o roteiro de visitas e apresentações presenciais nos provedores de internet.
          </p>
        </div>
      </div>

      {/* Lista de Visitas */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-[#121216] rounded-3xl border border-[#282832]">
          <div className="inline-block w-8 h-8 border-3 border-[#ff7a00] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Carregando agendamentos...</p>
        </div>
      ) : scheduledLeads.length === 0 ? (
        <div className="p-12 text-center bg-[#121216] rounded-3xl border border-[#282832]">
          <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Nenhuma reunião ou amostra agendada no momento</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Acesse a aba <strong>"Minha Carteira"</strong>, clique em <strong>"Registrar Contato / Desfecho"</strong> e selecione a opção <strong>"Visita Comercial Agendada"</strong> ou <strong>"Amostra Técnica"</strong> para alimentar esta agenda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scheduledLeads.map((lead) => {
            const dateObj = lead.visitDate ? new Date(lead.visitDate) : null;
            const isToday = dateObj && dateObj.toDateString() === new Date().toDateString();

            return (
              <div
                key={lead.id}
                className={`p-5 rounded-3xl border transition shadow-sm flex flex-col justify-between gap-4 ${
                  isToday
                    ? 'bg-[#181824] border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-[#121216] border-[#282832]'
                }`}
              >
                <div className="space-y-3">
                  {/* Badge de Data */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {dateObj
                          ? dateObj.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                          : 'Horário a combinar'}
                      </span>
                      {isToday && (
                        <span className="ml-1 px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                          Hoje!
                        </span>
                      )}
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#ff7a00]/15 text-[#ff7a00] border border-[#ff7a00]/30">
                      {lead.porte}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      {lead.tradeName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {lead.companyName} • CNPJ: {lead.cnpj}
                    </p>
                  </div>

                  {/* Informações de Local & Decisor */}
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{lead.street}, {lead.number} - {lead.neighborhood}, {lead.city}/{lead.state}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Decisor: <strong className="text-white">{lead.contactPerson}</strong> ({lead.contactRole})</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Package className="w-4 h-4 text-[#ff7a00] shrink-0" />
                      <span>Demanda: {lead.materialDemand}</span>
                    </div>

                    {lead.visitNotes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-[#0e0e12] border border-[#22222d] text-xs text-slate-300">
                        <strong className="text-slate-400 block text-[11px] mb-0.5">Pauta da Visita:</strong>
                        <p>{lead.visitNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="pt-2 border-t border-[#22222d] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.phone.replace(/\D/g, '')}`}
                      className="p-2 rounded-xl bg-[#1c1c24] hover:bg-[#282834] text-slate-300 transition"
                      title="Ligar"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#ff7a00]" />
                    </a>

                    <button
                      type="button"
                      onClick={() => openWhatsApp(lead)}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkClosed(lead)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Fechar Pedido</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRequestOutcome(lead)}
                      className="px-3 py-1.5 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Atualizar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
