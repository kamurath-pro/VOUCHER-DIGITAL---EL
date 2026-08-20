import { Search, X } from 'lucide-react';

interface FilterAndSearchProps {
  activeTab: 'todos' | '3_sessoes' | '5_sessoes';
  onSelectTab: (tab: 'todos' | '3_sessoes' | '5_sessoes') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  counts: {
    todos: number;
    threeSessions: number;
    fiveSessions: number;
  };
}

export function FilterAndSearch({
  activeTab,
  onSelectTab,
  searchTerm,
  onSearchChange,
  counts,
}: FilterAndSearchProps) {
  const tabs = [
    { id: 'todos', label: 'TODOS', count: counts.todos },
    { id: '3_sessoes', label: '3 SESSÕES', count: counts.threeSessions },
    { id: '5_sessoes', label: '5 SESSÕES', count: counts.fiveSessions },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-[#0d1b2e] p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou WhatsApp..."
          className="w-full pl-9 pr-9 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button
            id="clear-search-btn"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

    </div>
  );
}
