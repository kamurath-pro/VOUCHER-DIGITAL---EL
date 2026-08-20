import { useState } from 'react';
import { X, FileSpreadsheet, Copy, Check, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { VoucherStats } from '../types';

interface SheetsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: VoucherStats | null;
}

export function SheetsConfigModal({ isOpen, onClose, stats }: SheetsConfigModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envTemplate = `# Planilha Voucher 3 Sessões
SHEET_3_SESSIONS_ID="1DU8U7257KhJMrbCEdrOvmG8-9GFoth4y-0cY4VgglGE"
SHEET_3_SESSIONS_TAB="Página1"

# Planilha Voucher 5 Sessões
SHEET_5_SESSIONS_ID="119MTwNs4h7TGuAaS1Tlil0nNuPYU8WEiqeKoExNByD4"
SHEET_5_SESSIONS_TAB="Página1"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0d1b2e] rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Configuração do Google Sheets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Integração direta com as duas planilhas
              </p>
            </div>
          </div>

          <button
            id="close-config-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Current Status */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              stats?.source === 'live_sheets'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
            }`}
          >
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold mb-0.5">
                {stats?.source === 'live_sheets'
                  ? 'Planilhas Conectadas ao Vivo!'
                  : 'Modo de Apresentação / Dados de Demonstração'}
              </p>
              <p className="opacity-90">
                {stats?.source === 'live_sheets'
                  ? 'O servidor está lendo diretamente as planilhas do Google Sheets e atualizando a cada 10 minutos.'
                  : 'O aplicativo já está 100% pronto. Para conectar suas planilhas reais, basta preencher as variáveis abaixo no arquivo .env ou no painel da Vercel.'}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Colunas esperadas em cada planilha:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
              <div>A = Submission ID</div>
              <div>B = Respondent ID</div>
              <div>C = Submitted at</div>
              <div>D = Nome</div>
              <div>E = WhatsApp</div>
              <div>F = Já é cliente?</div>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs pt-2">
              Variáveis prontas no servidor:
            </h4>

            {/* Code Block with Copy */}
            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-lg text-xs font-mono overflow-x-auto border border-slate-800">
                {envTemplate}
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                Acesso 100% seguro: toda leitura é feita no servidor e protegida por login.
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
