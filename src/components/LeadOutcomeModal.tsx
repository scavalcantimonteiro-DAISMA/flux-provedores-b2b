import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  FileSpreadsheet, 
  Package, 
  CalendarCheck, 
  Building2, 
  Sparkles, 
  XCircle, 
  CheckCircle2,
  DollarSign,
  Clock,
  User as UserIcon,
  Wifi
} from 'lucide-react';
import { api } from '../services/api';
import { Lead, LeadStatus } from '../types';

interface LeadOutcomeModalProps {
  lead: Lead;
  onClose: () => void;
  onSuccess: () => void;
}

const OUTCOMES: {
  status: LeadStatus;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  border: string;
  activeBg: string;
}[] = [
  {
    status: 'CONTATO_REALIZADO',
    title: 'Contato Realizado',
    subtitle: 'Conversou com o decisor de compras ou proprietário',
    icon: PhoneCall,
    color: 'text-[#ff7a00]',
    border: 'border-[#ff7a00]/30',
    activeBg: 'bg-[#ff7a00]/15 border-[#ff7a00] ring-1 ring-[#ff7a00]'
  },
  {
    status: 'COTACAO_ENVIADA',
    title: 'Cotação Enviada',
    subtitle: 'Enviou proposta formal de cabos, ONUs ou caixas CTO',
    icon: FileSpreadsheet,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    activeBg: 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
  },
  {
    status: 'AMOSTRA_AGENDADA',
    title: 'Amostra Técnica Enviada',
    subtitle: 'Envio de amostras de cabos ou ONUs para homologação',
    icon: Package,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
  },
  {
    status: 'VISITA_AGENDADA',
    title: 'Visita Comercial Agendada',
    subtitle: 'Data marcada no provedor para apresentação e negociação',
    icon: CalendarCheck,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    activeBg: 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
  },
  {
    status: 'OUTRO_DISTRIBUIDOR',
    title: 'Já compra de Outro Distribuidor',
    subtitle: 'Utiliza WDC, Dicomp, Furukawa, Fiberhome ou outro',
    icon: Building2,
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    activeBg: 'bg-orange-950/40 border-orange-500 ring-1 ring-orange-500'
  },
  {
    status: 'FECHADO',
    title: 'Fechou Pedido / Cliente Ativo! 🏆',
    subtitle: 'Pedido faturado e entrega de materiais confirmada',
    icon: Sparkles,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    activeBg: 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
  },
  {
    status: 'SEM_INTERESSE',
    title: 'Sem Demanda / Sem Interesse',
    subtitle: 'Provedor sem expansão no momento ou já estocado',
    icon: XCircle,
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    activeBg: 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
  }
];

export const LeadOutcomeModal: React.FC<LeadOutcomeModalProps> = ({ lead, onClose, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(
    lead.status === 'NOVO' ? 'CONTATO_REALIZADO' : lead.status
  );

  // Visita
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };
  const [visitDate, setVisitDate] = useState(lead.visitDate ? lead.visitDate.slice(0, 16) : getDefaultDateTime());
  const [contactPerson, setContactPerson] = useState(lead.contactPerson || '');
  const [visitNotes, setVisitNotes] = useState(lead.visitNotes || '');

  // Cotação
  const [quoteValue, setQuoteValue] = useState(lead.quoteValue || '');

  // Outro distribuidor
  const [competitorDistributor, setCompetitorDistributor] = useState<string>(
    lead.currentDistributor || 'WDC Networks'
  );
  const [customDistributor, setCustomDistributor] = useState('');

  // Fechamento
  const [orderMaterials, setOrderMaterials] = useState('Cabos Drop 1 FO + ONUs GPON');
  const [orderValue, setOrderValue] = useState('');

  // Resumo
  const [notesText, setNotesText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalDistributor: string | null = null;
      let finalNote = notesText.trim();

      if (selectedStatus === 'OUTRO_DISTRIBUIDOR') {
        finalDistributor = competitorDistributor === 'Outro' ? (customDistributor || 'Outro Distribuidor') : competitorDistributor;
        finalNote = finalNote 
          ? `[Compra de ${finalDistributor}]: ${finalNote}` 
          : `Provedor compra atualmente de ${finalDistributor}.`;
      } else if (selectedStatus === 'COTACAO_ENVIADA') {
        finalNote = finalNote 
          ? `[Cotação Enviada - Valor ${quoteValue || 'a definir'}]: ${finalNote}` 
          : `Cotação formal enviada para ${contactPerson}. Valor: ${quoteValue || 'Em análise'}.`;
      } else if (selectedStatus === 'VISITA_AGENDADA') {
        finalNote = finalNote 
          ? `[Visita Agendada]: ${finalNote}` 
          : `Visita presencial agendada para ${new Date(visitDate).toLocaleString('pt-BR')} com ${contactPerson}.`;
      } else if (selectedStatus === 'AMOSTRA_AGENDADA') {
        finalNote = finalNote 
          ? `[Amostra Técnica]: ${finalNote}` 
          : `Envio de amostras para teste no laboratório do provedor.`;
      } else if (selectedStatus === 'FECHADO') {
        finalNote = finalNote 
          ? `[🏆 PEDIDO FECHADO]: ${orderMaterials} (Valor: ${orderValue || 'Confirmado'}). Obs: ${finalNote}` 
          : `🏆 PEDIDO FECHADO: Fornecimento de ${orderMaterials} aprovado!`;
      }

      await api.updateLeadStatus(lead.id, {
        status: selectedStatus,
        currentDistributor: finalDistributor,
        quoteValue: selectedStatus === 'COTACAO_ENVIADA' ? quoteValue : undefined,
        visitDate: selectedStatus === 'VISITA_AGENDADA' ? visitDate : undefined,
        visitNotes: selectedStatus === 'VISITA_AGENDADA' ? visitNotes : undefined,
        note: finalNote
      });

      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar desfecho');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#121216] rounded-3xl border border-[#282832] shadow-2xl max-w-2xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#171720] via-[#1a1a24] to-[#ff7a00]/25 text-white flex items-start justify-between shrink-0 border-b border-[#282832]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#ff7a00] text-slate-950">
                Retorno Comercial ISP
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {lead.porte} • {lead.city}/{lead.state}
              </span>
            </div>
            <h3 className="font-extrabold text-xl text-white mt-1 leading-tight">
              {lead.tradeName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Decisor: <strong className="text-white">{lead.contactPerson}</strong> • {lead.estimatedSubscribers}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Outcome Cards */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Qual foi o resultado do contato com o provedor?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {OUTCOMES.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedStatus === item.status;
                return (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => setSelectedStatus(item.status)}
                    className={`text-left p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? item.activeBg
                        : 'border-[#282832] bg-[#18181f] hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-[#0e0e12] shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white block truncate">
                          {item.title}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#ff7a00] shrink-0 ml-1"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Fields conforme status */}

          {/* COTAÇÃO ENVIADA */}
          {selectedStatus === 'COTACAO_ENVIADA' && (
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span>Dados da Cotação / Orçamento</span>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Valor Estimado da Cotação (R$) ou Volume de Itens
                </label>
                <input
                  type="text"
                  value={quoteValue}
                  onChange={(e) => setQuoteValue(e.target.value)}
                  placeholder="Ex: R$ 18.500,00 (10 bobinas drop + 100 ONUs)"
                  className="w-full px-3 py-2 rounded-xl border border-blue-700 bg-[#0e0e12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}

          {/* VISITA AGENDADA */}
          {selectedStatus === 'VISITA_AGENDADA' && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>Agendamento Presencial no Provedor</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Data e Hora da Reunião *
                  </label>
                  <input
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-emerald-700 bg-[#0e0e12] text-xs font-semibold text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Quem vai nos receber
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Ex: Carlos (Dono) e Amanda (NOC)"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-700 bg-[#0e0e12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Observações para a visita técnica/comercial
                </label>
                <input
                  type="text"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="Ex: Levar amostra do cabo Drop autossustentado e tabela atacado"
                  className="w-full px-3 py-2 rounded-xl border border-emerald-700 bg-[#0e0e12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          )}

          {/* JÁ COMPRA DE OUTRO DISTRIBUIDOR */}
          {selectedStatus === 'OUTRO_DISTRIBUIDOR' && (
            <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-orange-300 font-bold text-xs">
                <Building2 className="w-4 h-4 text-orange-400" />
                <span>De qual distribuidor o provedor compra habitualmente?</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['WDC Networks', 'Dicomp', 'Furukawa', 'Outro'].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setCompetitorDistributor(dist)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                      competitorDistributor === dist
                        ? 'bg-[#ff7a00] text-slate-950 border-[#ff7a00]'
                        : 'bg-[#18181f] text-slate-300 border-[#282832] hover:border-slate-600'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
              {competitorDistributor === 'Outro' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Nome do Distribuidor ou Importadora
                  </label>
                  <input
                    type="text"
                    value={customDistributor}
                    onChange={(e) => setCustomDistributor(e.target.value)}
                    placeholder="Ex: Fiberhome, OIW, Distribuidora Regional..."
                    className="w-full px-3 py-2 rounded-xl border border-orange-700 bg-[#0e0e12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff7a00]"
                  />
                </div>
              )}
            </div>
          )}

          {/* FECHADO / PEDIDO ACEITO */}
          {selectedStatus === 'FECHADO' && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-purple-300 font-black text-xs">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Parabéns! Registrar Pedido Fechado SCM TECH</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Itens / Materiais Fechados
                  </label>
                  <input
                    type="text"
                    value={orderMaterials}
                    onChange={(e) => setOrderMaterials(e.target.value)}
                    placeholder="Ex: 20 Bobinas Drop 1km + 150 ONUs"
                    className="w-full px-3 py-2 rounded-xl border border-purple-700 bg-[#0e0e12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Valor do Pedido (R$)
                  </label>
                  <input
                    type="text"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    placeholder="Ex: R$ 34.000,00"
                    className="w-full px-3 py-2 rounded-xl border border-purple-700 bg-[#0e0e12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resumo Geral */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Anotação / Resumo da conversa com o provedor
            </label>
            <textarea
              rows={3}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Ex: Falei com o Carlos. Disse que precisa de 10 bobinas de drop para o próximo mês e pediu para cotar também conectores SC/APC..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#282832] bg-[#18181f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff7a00] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 transition flex items-center gap-2 shadow-lg shadow-[#ff7a00]/25 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Salvar Situação do Provedor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
