export interface VoucherRecord {
  id: string;
  submittedAt: string;
  submittedAtRaw: string;
  nome: string;
  whatsapp: string;
  whatsappClean: string;
  isClient: string;
  voucherType: '3 Sessões' | '5 Sessões';
}

export interface VoucherStats {
  total: number;
  threeSessions: number;
  fiveSessions: number;
  today: number;
  lastUpdated: string;
  source: 'live_sheets' | 'sample_data';
  sheet3Configured: boolean;
  sheet5Configured: boolean;
}

export interface VouchersResponse {
  success: boolean;
  records: VoucherRecord[];
  stats: VoucherStats;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: string;
  message?: string;
}
