import { VoucherRecord, VoucherStats, VouchersResponse } from '../types';

const SHEET_3_ID = "1DU8U7257KhJMrbCEdrOvmG8-9GFoth4y-0cY4VgglGE";
const SHEET_5_ID = "119MTwNs4h7TGuAaS1Tlil0nNuPYU8WEiqeKoExNByD4";

// Normalize text helper
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

// Format Phone & WhatsApp
export function formatPhone(phoneRaw: string): { formatted: string; clean: string } {
  if (!phoneRaw) return { formatted: "", clean: "" };
  const digits = phoneRaw.replace(/\D/g, "");

  let cleanWithCountry = digits;
  if (digits.length === 10 || digits.length === 11) {
    cleanWithCountry = `55${digits}`;
  } else if (!digits.startsWith("55") && digits.length >= 8) {
    cleanWithCountry = `55${digits}`;
  }

  let formatted = phoneRaw.trim();
  if (digits.length === 11) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 13 && digits.startsWith("55")) {
    const withoutCountry = digits.slice(2);
    formatted = `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7)}`;
  }

  return { formatted, clean: cleanWithCountry };
}

// Format Date for Display
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr.trim();
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

// Check if a date string is today
export function isDateToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const todayDay = String(now.getDate()).padStart(2, "0");
  const todayMonth = String(now.getMonth() + 1).padStart(2, "0");
  const todayYear = now.getFullYear();

  if (dateStr.includes("/")) {
    const [datePart] = dateStr.split(" ");
    const [d, m, y] = datePart.split("/");
    return (
      String(d).padStart(2, "0") === todayDay &&
      String(m).padStart(2, "0") === todayMonth &&
      Number(y) === todayYear
    );
  }

  try {
    const d = new Date(dateStr);
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  } catch {
    return false;
  }
}

// Parse date timestamp for ordering
export function parseDateTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  try {
    if (dateStr.includes("/")) {
      const [datePart, timePart] = dateStr.split(" ");
      const [d, m, y] = datePart.split("/").map(Number);
      let hh = 0, mm = 0, ss = 0;
      if (timePart) {
        const timeParts = timePart.split(":").map(Number);
        hh = timeParts[0] || 0;
        mm = timeParts[1] || 0;
        ss = timeParts[2] || 0;
      }
      return new Date(y, m - 1, d, hh, mm, ss).getTime();
    }
    return new Date(dateStr).getTime() || 0;
  } catch {
    return 0;
  }
}

// CSV Parser
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal);
      currentVal = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(currentVal);
      currentVal = "";
      if (row.length > 0 && row.some(cell => cell.trim().length > 0)) {
        lines.push(row);
      }
      row = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal);
    if (row.some(cell => cell.trim().length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

// Direct fetch from Google Sheet
async function fetchSheetDirect(sheetId: string, voucherType: "3 Sessões" | "5 Sessões"): Promise<VoucherRecord[]> {
  const urls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const csvText = await res.text();
      const rows = parseCSV(csvText);
      if (!rows || rows.length === 0) return [];

      const headerRow = rows[0].map(h => (h || "").toLowerCase().trim());
      let subIdIdx = 0;
      let dateIdx = 2;
      let nomeIdx = 3;
      let phoneIdx = 4;
      let isClientIdx = 5;

      headerRow.forEach((colName, idx) => {
        if (colName.includes("submission")) subIdIdx = idx;
        else if (colName.includes("submitted") || colName.includes("data") || colName.includes("horário") || colName.includes("hora")) dateIdx = idx;
        else if (colName.includes("nome") || colName.includes("name")) nomeIdx = idx;
        else if (colName.includes("whats") || colName.includes("telefone") || colName.includes("celular") || colName.includes("contato") || colName.includes("fone")) phoneIdx = idx;
        else if (colName.includes("cliente")) isClientIdx = idx;
      });

      const records: VoucherRecord[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;

        const subId = (row[subIdIdx] || "").trim();
        const submittedAtRaw = (row[dateIdx] || "").trim();
        const nome = (row[nomeIdx] || "").trim();
        const whatsappRaw = (row[phoneIdx] || "").trim();
        const isClientRaw = (row[isClientIdx] || "").trim();

        if (!nome && !whatsappRaw && !submittedAtRaw) continue;

        const phoneInfo = formatPhone(whatsappRaw);
        const isClientLower = isClientRaw.toLowerCase();
        const isClientClean =
          isClientLower.startsWith("s") || isClientLower === "sim"
            ? "Sim"
            : isClientLower.startsWith("n") || isClientLower === "não" || isClientLower === "nao"
            ? "Não"
            : isClientRaw || "Não";

        records.push({
          id: subId || `${voucherType}-${i}`,
          submittedAt: formatDateDisplay(submittedAtRaw),
          submittedAtRaw,
          nome: nome || "Não informado",
          whatsapp: phoneInfo.formatted || whatsappRaw,
          whatsappClean: phoneInfo.clean,
          isClient: isClientClean,
          voucherType,
        });
      }

      return records;
    } catch (err) {
      console.warn(`[Client Sheets] Fetch failed for ${url}:`, err);
    }
  }

  return [];
}

// Fetch all vouchers directly from Google Sheets
export async function fetchAllVouchersDirect(): Promise<VouchersResponse> {
  const [res3, res5] = await Promise.all([
    fetchSheetDirect(SHEET_3_ID, "3 Sessões"),
    fetchSheetDirect(SHEET_5_ID, "5 Sessões"),
  ]);

  const allRecords = [...res3, ...res5];

  // Sort newest first
  allRecords.sort((a, b) => {
    const timeA = parseDateTimestamp(a.submittedAtRaw || a.submittedAt);
    const timeB = parseDateTimestamp(b.submittedAtRaw || b.submittedAt);
    return timeB - timeA;
  });

  const now = new Date();
  const lastUpdated = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
    2,
    "0"
  )}:${String(now.getMinutes()).padStart(2, "0")}`;

  const stats: VoucherStats = {
    total: allRecords.length,
    threeSessions: allRecords.filter((r) => r.voucherType === "3 Sessões").length,
    fiveSessions: allRecords.filter((r) => r.voucherType === "5 Sessões").length,
    today: allRecords.filter((r) =>
      isDateToday(r.submittedAtRaw || r.submittedAt)
    ).length,
    lastUpdated,
    source: "live_sheets",
    sheet3Configured: true,
    sheet5Configured: true,
  };

  return {
    success: true,
    records: allRecords,
    stats,
  };
}
