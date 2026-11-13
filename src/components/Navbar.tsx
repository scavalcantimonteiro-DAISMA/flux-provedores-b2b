import React from 'react';
import { 
  Search, 
  Briefcase, 
  Calendar, 
  Users, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  Wifi,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  activeTab: 'finder' | 'portfolio' | 'agenda' | 'users' | 'supervisor';
  setActiveTab: (tab: 'finder' | 'portfolio' | 'agenda' | 'users' | 'supervisor') => void;
  onLogout: () => void;
  leadsCount: number;
  scheduledCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  leadsCount,
  scheduledCount
}) => {
  return (
    <header className="bg-[#121216] border-b border-[#282832] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/assets/logo-scm.jpg"
                alt="SCM TECH"
                className="w-10 h-10 rounded-xl object-cover border border-[#ff7a00]/40 shadow-sm shadow-[#ff7a00]/20"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#ff7a00] border-2 border-[#121216] rounded-full"></span>
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">
                  FLUX <span className="text-[#ff7a00]">Provedores</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#ff7a00]/15 text-[#ff7a00] border border-[#ff7a00]/30">
                  SCM TECH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Captação Ativa de Provedores de Internet (ISPs)
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('finder')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'finder'
                  ? 'bg-[#ff7a00] text-slate-950 shadow-md shadow-[#ff7a00]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#1c1c24]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Minerar Provedores</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('portfolio')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'portfolio'
                  ? 'bg-[#ff7a00] text-slate-950 shadow-md shadow-[#ff7a00]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#1c1c24]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Minha Carteira</span>
              {leadsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'portfolio'
                    ? 'bg-slate-950 text-white'
                    : 'bg-[#ff7a00] text-slate-950'
                }`}>
                  {leadsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agenda')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'agenda'
                  ? 'bg-[#ff7a00] text-slate-950 shadow-md shadow-[#ff7a00]/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#1c1c24]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agendamentos & Amostras</span>
              {scheduledCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'agenda'
                    ? 'bg-slate-950 text-white'
                    : 'bg-emerald-500 text-slate-950'
                }`}>
                  {scheduledCount}
                </span>
              )}
            </button>

            {user.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-[#ff7a00] text-slate-950 shadow-md shadow-[#ff7a00]/20'
                      : 'text-slate-300 hover:text-white hover:bg-[#1c1c24]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Equipe Comercial</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('supervisor')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'supervisor'
                      ? 'bg-[#ff7a00] text-slate-950 shadow-md shadow-[#ff7a00]/20'
                      : 'text-slate-300 hover:text-white hover:bg-[#1c1c24]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Painel Executivo</span>
                </button>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-extrabold text-white leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-[#ff7a00] font-mono">
                {user.role === 'admin' ? '🛡️ Administrador' : '💼 Consultor B2B'}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Sair do Sistema"
              className="p-2 rounded-xl border border-[#282832] bg-[#18181f] text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-[#282832] bg-[#0e0e12] px-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('finder')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'finder' ? 'bg-[#ff7a00] text-slate-950' : 'text-slate-400'
          }`}
        >
          Minerar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'portfolio' ? 'bg-[#ff7a00] text-slate-950' : 'text-slate-400'
          }`}
        >
          Carteira ({leadsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('agenda')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
            activeTab === 'agenda' ? 'bg-[#ff7a00] text-slate-950' : 'text-slate-400'
          }`}
        >
          Agenda ({scheduledCount})
        </button>
        {user.role === 'admin' && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                activeTab === 'users' ? 'bg-[#ff7a00] text-slate-950' : 'text-slate-400'
              }`}
            >
              Equipe
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('supervisor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                activeTab === 'supervisor' ? 'bg-[#ff7a00] text-slate-950' : 'text-slate-400'
              }`}
            >
              Painel
            </button>
          </>
        )}
      </div>
    </header>
  );
};
