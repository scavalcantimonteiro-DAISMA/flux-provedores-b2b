import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  Download, 
  Phone, 
  MessageSquare, 
  Globe, 
  Layers, 
  CheckSquare, 
  Square,
  AlertCircle,
  Building2,
  Users,
  ChevronDown,
  Sparkles,
  Zap,
  Wifi,
  Package,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { Lead, IspPorte, PorteConfig, StateConfig, User } from '../types';

interface LeadGeneratorProps {
  currentUser: User;
  onLeadsImported: () => void;
}

export const LeadGenerator: React.FC<LeadGeneratorProps> = ({ currentUser, onLeadsImported }) => {
  const [states, setStates] = useState<StateConfig[]>([]);
  const [selectedState, setSelectedState] = useState<string>('SP');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedPorte, setSelectedPorte] = useState<string>('ALL');
  const [leadCount, setLeadCount] = useState<number>(50);

  const [generating, setGenerating] = useState<boolean>(false);
  const [generatedLeads, setGeneratedLeads] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState<boolean>(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Atribuição de vendedor caso seja Admin
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<string>(currentUser.id);

  useEffect(() => {
    loadMetadata();
    if (currentUser.role === 'admin') {
      loadUsers();
    }
  }, [currentUser]);

  const loadMetadata = async () => {
    try {
      const statesData = await api.getStates();
      setStates(statesData);
      if (statesData.length > 0) {
        setSelectedState(statesData[0].uf);
      }
    } catch (err) {
      console.error('Erro ao carregar estados:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await api.getUsers();
      setAllUsers(usersData);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const currentStateObj = states.find(s => s.uf === selectedState);
  const availableCities = currentStateObj ? currentStateObj.cities : [];

  const handleStateChange = (uf: string) => {
    setSelectedState(uf);
    setSelectedCity('ALL');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setImportSuccessMessage(null);
    try {
      const res = await api.generateLeads({
        state: selectedState,
        city: selectedCity,
        porte: selectedPorte,
        count: leadCount
      });
      setGeneratedLeads(res.leads);
      setSelectedLeadIds(new Set(res.leads.map(l => l.id)));
    } catch (err: any) {
      alert(err.message || 'Erro ao minerar provedores');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === generatedLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(generatedLeads.map(l => l.id)));
    }
  };

  const toggleSelectLead = (id: string) => {
    const next = new Set(selectedLeadIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedLeadIds(next);
  };

  const handleImportSelected = async () => {
    const leadsToImport = generatedLeads.filter(l => selectedLeadIds.has(l.id));
    if (leadsToImport.length === 0) {
      alert('Selecione ao menos um provedor para importar para a carteira.');
      return;
    }

    setImporting(true);
    try {
      const res = await api.importLeads(leadsToImport, currentUser.role === 'admin' ? assignedUserId : undefined);
      setImportSuccessMessage(res.message);
      setTimeout(() => {
        onLeadsImported();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Erro ao importar provedores');
    } finally {
      setImporting(false);
    }
  };

  const openWhatsApp = (lead: Lead) => {
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá, tudo bem? Sou da equipe comercial da SCM TECH Telecomunicações & Fibra Óptica.\n\n` +
      `Entro em contato com o provedor ${lead.tradeName} (${lead.city}/${lead.state}) a respeito do nosso estoque a pronta entrega com condições direto da fábrica:\n\n` +
      `• Cabos Drop Óptico 1 FO Homologados Anatel\n` +
      `• Caixas CTOs e Passivos para expansão FTTH\n` +
      `• Roteadores Gigabit Wi-Fi 6 e ONUs GPON/EPON\n\n` +
      `Gostaria de falar com o responsável de compras (${lead.contactPerson}) para enviar nossa tabela exclusiva para provedores.`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 p-6 sm:p-8 rounded-3xl border border-slate-700 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff7a00]/20 border border-[#ff7a00]/40 text-[#ff7a00] text-xs font-black uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            Mineração de ISPs em Todo o Brasil
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Captação de Provedores de Internet (B2B)
          </h1>
          <p className="text-slate-300 text-sm mt-1.5">
            Selecione o porte, o estado e a quantidade para minerar provedores de internet com CNPJ, ASN, dados do decisor de compras e demanda de materiais.
          </p>
        </div>
      </div>

      {/* Control Panel / Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Step 1: Porte do Provedor */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
            1. Porte do Provedor (Assinantes Ativos)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPorte('ALL')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                selectedPorte === 'ALL'
                  ? 'bg-orange-50 border-2 border-[#ff7a00] text-slate-950 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm block">Todos os Portes</span>
                <Layers className={`w-4 h-4 ${selectedPorte === 'ALL' ? 'text-[#e06b00]' : 'text-slate-400'}`} />
              </div>
              <p className="text-xs text-slate-500">Mix variado de pequeno, médio e grande porte</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPorte('PEQUENO')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                selectedPorte === 'PEQUENO'
                  ? 'bg-orange-50 border-2 border-[#ff7a00] text-slate-950 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm block">Pequeno Porte</span>
                <Package className={`w-4 h-4 ${selectedPorte === 'PEQUENO' ? 'text-[#e06b00]' : 'text-slate-400'}`} />
              </div>
              <p className="text-xs text-slate-500">A partir de 15 a 1.000 clientes (início de rede, FTTH local)</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPorte('MEDIO')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                selectedPorte === 'MEDIO'
                  ? 'bg-orange-50 border-2 border-[#ff7a00] text-slate-950 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm block">Médio Porte</span>
                <Building2 className={`w-4 h-4 ${selectedPorte === 'MEDIO' ? 'text-[#e06b00]' : 'text-slate-400'}`} />
              </div>
              <p className="text-xs text-slate-500">1.000 a 10.000 clientes (anéis ópticos e várias cidades)</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPorte('GRANDE')}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                selectedPorte === 'GRANDE'
                  ? 'bg-orange-50 border-2 border-[#ff7a00] text-slate-950 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm block">Grande Porte</span>
                <Wifi className={`w-4 h-4 ${selectedPorte === 'GRANDE' ? 'text-[#e06b00]' : 'text-slate-400'}`} />
              </div>
              <p className="text-xs text-slate-500">+10.000 clientes (ASN próprio e compras em escala)</p>
            </button>
          </div>
        </div>

        {/* Step 2: Estado, Cidade e Volume */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Estado */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Estado (UF)
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/20"
            >
              {states.map((s) => (
                <option key={s.uf} value={s.uf}>
                  {s.name} ({s.uf}) — DDD {s.ddd}
                </option>
              ))}
            </select>
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Cidade / Região
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/20"
            >
              <option value="ALL">🌐 Todas as Cidades do Estado ({availableCities.length} polos)</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              4. Quantidade de Provedores
            </label>
            <select
              value={leadCount}
              onChange={(e) => setLeadCount(Number(e.target.value))}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm font-black text-[#e06b00] focus:outline-none focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/20"
            >
              <option value={50}>⚡ 50 Provedores (Rápido)</option>
              <option value={100}>⚡ 100 Provedores</option>
              <option value={250}>⚡ 250 Provedores (Recomendado)</option>
              <option value={500}>⚡ 500 Provedores (Carga Alta)</option>
              <option value={1000}>🚀 1.000 Provedores (Massivo)</option>
              <option value={2000}>🔥 2.000 Provedores (Extração Máxima)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-4 px-6 rounded-2xl bg-[#ff7a00] hover:bg-[#e06b00] text-slate-950 font-black text-base transition flex items-center justify-center gap-2 shadow-lg shadow-[#ff7a00]/25 cursor-pointer disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Minerando provedores em {currentStateObj?.name}...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 text-slate-950" />
                <span>Minerar Provedores de Internet Agora ({leadCount} ISPs)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {importSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importSuccessMessage} Redirecionando para a sua carteira...</span>
        </div>
      )}

      {/* Generated Leads Results */}
      {generatedLeads.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {/* Action Bar for Results */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition cursor-pointer"
              >
                {selectedLeadIds.size === generatedLeads.length ? (
                  <CheckSquare className="w-5 h-5 text-[#ff7a00]" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
                <span>
                  Selecionar Todos ({selectedLeadIds.size}/{generatedLeads.length})
                </span>
              </button>
            </div>

            {/* Atribuir a Vendedor (se for Admin) */}
            {currentUser.role === 'admin' && allUsers.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Atribuir a:</span>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#ff7a00]"
                >
                  <option value={currentUser.id}>Minha Própria Carteira (Admin)</option>
                  {allUsers
                    .filter(u => u.id !== currentUser.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        👤 {u.name} (@{u.username})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Import Button */}
            <button
              type="button"
              onClick={handleImportSelected}
              disabled={importing || selectedLeadIds.size === 0}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-40"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando na Carteira...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Importar {selectedLeadIds.size} Provedores para Carteira</span>
                </>
              )}
            </button>
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {generatedLeads.map((lead) => {
              const isSelected = selectedLeadIds.has(lead.id);
              return (
                <div
                  key={lead.id}
                  onClick={() => toggleSelectLead(lead.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-orange-50/40 border-orange-300 ring-1 ring-[#ff7a00]/30 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="text-[#ff7a00]">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                            {lead.tradeName}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {lead.companyName} • CNPJ: {lead.cnpj}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-50 text-[#e06b00] border border-orange-200 shrink-0">
                        {lead.porte}
                      </span>
                    </div>

                    {/* Technical Telecom Info: ASN & Subscribers */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold">
                        🌐 {lead.asn}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-900 font-semibold">
                        👥 {lead.estimatedSubscribers}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {lead.city}/{lead.state}
                      </span>
                    </div>

                    {/* Decisor & Material Demand */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <p className="text-slate-700">
                        Decisor de Compras: <strong className="text-slate-950 font-bold">{lead.contactPerson}</strong> ({lead.contactRole})
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        📦 Demanda: <span className="text-slate-800 font-medium">{lead.materialDemand}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${lead.phone.replace(/\D/g, '')}`}
                      title={`Ligar para ${lead.phone}`}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#ff7a00]" />
                      <span>{lead.phone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => openWhatsApp(lead)}
                      title="Chamar no WhatsApp"
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
