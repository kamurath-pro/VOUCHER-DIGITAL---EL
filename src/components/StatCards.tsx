import { Users, Sparkles, Gift, CalendarCheck } from 'lucide-react';
import { VoucherStats } from '../types';

interface StatCardsProps {
  stats: VoucherStats | null;
  activeTab: 'todos' | '3_sessoes' | '5_sessoes';
  onSelectTab: (tab: 'todos' | '3_sessoes' | '5_sessoes') => void;
}

export function StatCards({ stats, activeTab, onSelectTab }: StatCardsProps) {
  const cards = [
    {
      id: 'card-total',
      title: 'TOTAL DE CADASTROS',
      value: stats ? stats.total : 0,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgIcon: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900',
      tabKey: 'todos' as const,
      borderActive: activeTab === 'todos' ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'card-3-sessoes',
      title: '3 SESSÕES',
      value: stats ? stats.threeSessions : 0,
      icon: Sparkles,
      color: 'text-sky-600 dark:text-sky-400',
      bgIcon: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900',
      tabKey: '3_sessoes' as const,
      borderActive: activeTab === '3_sessoes' ? 'ring-2 ring-sky-500 border-sky-500' : 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'card-5-sessoes',
      title: '5 SESSÕES',
      value: stats ? stats.fiveSessions : 0,
      icon: Gift,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgIcon: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900',
      tabKey: '5_sessoes' as const,
      borderActive: activeTab === '5_sessoes' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'card-hoje',
      title: 'CADASTROS HOJE',
      value: stats ? stats.today : 0,
      icon: CalendarCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgIcon: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900',
      tabKey: null,
      borderActive: 'border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = Boolean(card.tabKey);

        return (
          <div
            key={card.id}
            id={card.id}
            onClick={() => card.tabKey && onSelectTab(card.tabKey)}
            className={`p-4 sm:p-5 rounded-xl bg-white dark:bg-[#0d1b2e] border ${card.borderActive} shadow-sm transition-all ${
              isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgIcon}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {card.value === 1 ? 'cadastro' : 'cadastros'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
