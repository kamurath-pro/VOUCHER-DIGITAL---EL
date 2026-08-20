import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { FilterAndSearch } from './components/FilterAndSearch';
import { VoucherList } from './components/VoucherList';
import { VoucherRecord, VoucherStats } from './types';
import { fetchAllVouchersDirect } from './services/sheetsClient';

export default function App() {
  // 1. Theme State (Light by default, dark mode supported)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('espacolaser_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  // 2. Data & Filter States
  const [records, setRecords] = useState<VoucherRecord[]>([]);
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [activeTab, setActiveTab] = useState<'todos' | '3_sessoes' | '5_sessoes'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync Dark Mode class with HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('espacolaser_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('espacolaser_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Fetch Vouchers Data (loads directly from Google Sheets)
  const fetchVouchers = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const directData = await fetchAllVouchersDirect();
      if (directData && directData.success) {
        setRecords(directData.records);
        setStats(directData.stats);
      }
    } catch (err) {
      console.error('Erro ao buscar vouchers:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load on mount
  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Auto-refresh every 10 minutes (600,000 ms)
  useEffect(() => {
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const interval = setInterval(() => {
      fetchVouchers(true);
    }, TEN_MINUTES_MS);

    return () => clearInterval(interval);
  }, [fetchVouchers]);

  // Filter and Search Logic
  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // Tab filter
      if (activeTab === '3_sessoes' && record.voucherType !== '3 Sessões') {
        return false;
      }
      if (activeTab === '5_sessoes' && record.voucherType !== '5 Sessões') {
        return false;
      }

      // Search filter (Nome or WhatsApp)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nomeMatch = record.nome.toLowerCase().includes(query);
        const waMatch = record.whatsapp.toLowerCase().includes(query);
        const waCleanMatch = record.whatsappClean.includes(query.replace(/\D/g, ''));
        return nomeMatch || waMatch || waCleanMatch;
      }

      return true;
    });
  }, [records, activeTab, searchTerm]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      todos: records.length,
      threeSessions: records.filter((r) => r.voucherType === '3 Sessões').length,
      fiveSessions: records.filter((r) => r.voucherType === '5 Sessões').length,
    };
  }, [records]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070e1c] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* 1. Header with Brand, Update Status, Refresh & Theme Toggle */}
      <Header
        stats={stats}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onRefresh={() => fetchVouchers(true)}
        isRefreshing={isRefreshing}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* 4 Cards: Total, 3 Sessões, 5 Sessões, Cadastros Hoje */}
        <StatCards
          stats={stats}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Filters (Todos, 3 Sessões, 5 Sessões) & Search (Nome/WhatsApp) */}
        <FilterAndSearch
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          counts={tabCounts}
        />

        {/* Records Table (Desktop) / Cards (Mobile) */}
        <VoucherList
          records={filteredRecords}
          isLoading={isLoading && records.length === 0}
          searchTerm={searchTerm}
        />

      </main>

    </div>
  );
}
