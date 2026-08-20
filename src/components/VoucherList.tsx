import { MessageSquare, ExternalLink, Calendar, User, Phone, CheckCircle, XCircle, SearchX } from 'lucide-react';
import { VoucherRecord } from '../types';

interface VoucherListProps {
  records: VoucherRecord[];
  isLoading: boolean;
  searchTerm: string;
}

export function VoucherList({ records, isLoading, searchTerm }: VoucherListProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0d1b2e] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mb-3" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Carregando cadastros das planilhas...
        </p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0d1b2e] rounded-xl border border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          Nenhum cadastro encontrado
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          {searchTerm
            ? `Nenhum resultado para "${searchTerm}". Tente buscar por outro nome ou número.`
            : 'Não há registros disponíveis nesta categoria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0d1b2e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* DESKTOP & TABLET VIEW (TABLE) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold">Data</th>
              <th className="py-3.5 px-4 font-semibold">Nome</th>
              <th className="py-3.5 px-4 font-semibold">WhatsApp</th>
              <th className="py-3.5 px-4 font-semibold text-center">Já é cliente?</th>
              <th className="py-3.5 px-4 font-semibold text-center">Voucher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {records.map((record) => {
              const isSim = record.isClient.toLowerCase() === 'sim';
              const is3 = record.voucherType === '3 Sessões';
              const waUrl = `https://wa.me/${record.whatsappClean}`;

              return (
                <tr
                  key={record.id}
                  id={`row-${record.id}`}
                  className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* 1. Data */}
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {record.submittedAt}
                  </td>

                  {/* 2. Nome */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {record.nome}
                  </td>

                  {/* 3. WhatsApp with Clickable WhatsApp link */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {record.whatsapp}
                      </span>
                      {record.whatsappClean && (
                        <a
                          id={`wa-btn-${record.id}`}
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir WhatsApp"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-transform active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* 4. Já é cliente? */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isSim
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isSim ? <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                      {record.isClient}
                    </span>
                  </td>

                  {/* 5. Voucher */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        is3
                          ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                          : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {record.voucherType}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {records.map((record) => {
          const isSim = record.isClient.toLowerCase() === 'sim';
          const is3 = record.voucherType === '3 Sessões';
          const waUrl = `https://wa.me/${record.whatsappClean}`;

          return (
            <div
              key={record.id}
              id={`card-mobile-${record.id}`}
              className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
            >
              {/* Header of mobile card: Date & Voucher Type */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{record.submittedAt}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    is3
                      ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}
                >
                  {record.voucherType}
                </span>
              </div>

              {/* Name */}
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {record.nome}
                </h4>
              </div>

              {/* Status and WhatsApp Action */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                
                {/* Client tag */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Já é cliente:</span>
                  <span
                    className={`inline-flex items-center font-bold ${
                      isSim ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {record.isClient}
                  </span>
                </div>

                {/* WhatsApp Button */}
                {record.whatsappClean && (
                  <a
                    id={`wa-mobile-btn-${record.id}`}
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-transform active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{record.whatsapp}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
