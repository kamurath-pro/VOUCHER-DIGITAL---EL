import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { normalizeText } from '../services/sheetsClient';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function LoginScreen({ onLoginSuccess, darkMode, onToggleDarkMode }: LoginScreenProps) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = user.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Por favor, preencha o login e a senha.');
      return;
    }

    setIsLoading(true);
    setError('');

    const normalizedInputUser = normalizeText(cleanUser);
    const isUserValid =
      normalizedInputUser === 'TIANGUA' ||
      cleanUser.toUpperCase() === 'TIANGUÁ' ||
      cleanUser.toUpperCase() === 'TIANGUA';
    const isPasswordValid = cleanPass === '3553';

    if (isUserValid && isPasswordValid) {
      const token = `espacolaser-auth-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('espacolaser_auth_token', token);
      localStorage.setItem('espacolaser_user', 'Espaçolaser Tianguá');
      onLoginSuccess(token, 'Espaçolaser Tianguá');
      setIsLoading(false);
    } else {
      setError('Login ou senha incorretos.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#070e1c] transition-colors relative overflow-hidden">
      
      {/* Background Subtle Accent Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Card */}
        <div className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-7 sm:p-9 shadow-xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide uppercase">
                VOUCHER DIGITAL
              </h1>
              <p className="text-sm font-semibold text-blue-600 dark:text-cyan-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Espaçolaser Tianguá</span>
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Login Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="TIANGUÁ"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium uppercase"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ACESSAR PAINEL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Sistema interno para consulta e gestão de vouchers
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
