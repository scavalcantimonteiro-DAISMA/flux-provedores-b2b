import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle, Wifi } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('Adm');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(username, password);
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique as credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50/30 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#ff7a00]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#ff7a00]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-9 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-3.5">
            <img
              src="/assets/logo-scm.jpg"
              alt="SCM TECH"
              className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-[#ff7a00] shadow-md shadow-[#ff7a00]/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#ff7a00] p-1.5 rounded-full text-slate-950 shadow">
              <Wifi className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#e06b00] text-[11px] font-black uppercase tracking-wider mb-2">
            SCM TECH • Telecom B2B
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Provedores B2B
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Sistema de Captação & Prospecção Ativa de Provedores de Internet (ISPs)
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Usuário / Login
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu login"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#ff7a00] focus:ring-2 focus:ring-[#ff7a00]/20 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#ff7a00] hover:bg-[#e06b00] active:scale-[0.99] text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[#ff7a00]/25 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials Pill */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-50/90 border border-orange-200/80 text-[11px] text-slate-700 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e06b00]" />
            <span>Admin: <strong className="text-slate-900 font-bold">Adm</strong> (ou <strong className="text-slate-900 font-bold">Flux</strong>) | Senha: <strong className="text-[#e06b00] font-bold">Flux@2026</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-xs text-slate-500 space-y-1">
        <p>
          Desenvolvido e criado pela <strong className="text-slate-800 font-bold">SCM TECH</strong>
        </p>
        <p className="text-[11px] text-slate-400">
          Infraestrutura de Telecom • Todos os direitos reservados © 2026
        </p>
      </footer>
    </div>
  );
};
