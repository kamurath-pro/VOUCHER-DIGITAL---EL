import { RefreshCw, Moon, Sun, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { VoucherStats } from '../types';

interface HeaderProps {
  stats: VoucherStats | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({
  stats,
  darkMode,
  onToggleDarkMode,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="border-b border-[#0a1845] bg-[#050a30] text-white shadow-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          
          {/* Titles */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wider uppercase">
                  VOUCHER DIGITAL
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-cyan-300 border border-cyan-400/30">
                  Tianguá
                </span>
              </div>
              <p className="text-xs text-blue-200/75 font-medium">
                Espaçolaser Tianguá
              </p>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center justify-between sm:justify-end flex-wrap gap-2 sm:gap-2.5">
            
            {/* Last update text */}
            {stats?.lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-blue-100/80 order-last sm:order-first w-full sm:w-auto text-center sm:text-left justify-center sm:justify-start pt-1 sm:pt-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Última atualização: <strong className="font-semibold text-white">{stats.lastUpdated}</strong></span>
              </div>
            )}

            {/* Sheets Status Indicator */}
            <div
              id="sheets-status-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-emerald-950/60 text-emerald-300 border-emerald-700/60"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Planilhas Conectadas</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Refresh Button */}
            <button
              id="refresh-data-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>ATUALIZAR</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              title={darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 border border-white/15 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-cyan-300" />}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
