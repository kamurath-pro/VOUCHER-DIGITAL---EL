import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Secret key for HMAC token signing
const JWT_SECRET = process.env.JWT_SECRET || "espacolaser-tiangua-secret-auth-key-2026";
const ADMIN_USER = (process.env.ADMIN_USER || "TIANGUÁ").trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "3553").trim();

// Normalize string for accent & case insensitive comparison
function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

// Simple secure HMAC token generator
function generateToken(user: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = JSON.stringify({ user, expiresAt, rand: crypto.randomBytes(8).toString("hex") });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

// Verify token
function verifyToken(token: string): { valid: boolean; user?: string } {
  if (!token) return { valid: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };
  const [base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(base64Payload)
    .digest("base64url");

  if (signature !== expectedSig) return { valid: false };

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return { valid: false };
    }
    return { valid: true, user: payload.user };
  } catch {
    return { valid: false };
  }
}

// Auth Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Acesso não autorizado. Faça login." });
    return;
  }
  const token = authHeader.split(" ")[1];
  const auth = verifyToken(token);
  if (!auth.valid) {
    res.status(401).json({ success: false, message: "Sessão expirada ou inválida. Faça login novamente." });
    return;
  }
  (req as any).user = auth.user;
  next();
}

// Format Phone & WhatsApp Link
function formatPhone(phoneRaw: string): { formatted: string; clean: string } {
  if (!phoneRaw) return { formatted: "", clean: "" };
  const digits = phoneRaw.replace(/\D/g, "");
  
  // Format for WhatsApp wa.me link: needs country code (55 for Brazil)
  let cleanWithCountry = digits;
  if (digits.length === 10 || digits.length === 11) {
    cleanWithCountry = `55${digits}`;
  } else if (!digits.startsWith("55") && digits.length >= 8) {
    cleanWithCountry = `55${digits}`;
  }

  // Format for display (88) 99999-9999
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

// Parse Brazilian date or standard date
function parseDateForSort(dateStr: string): number {
  if (!dateStr) return 0;
  // Format like 20/08/2026 10:30 or 20/08/2026 or 2026-08-20T10:30:00
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

// Format date for display
function formatDateDisplay(dateStr: string): string {
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

// Check if date is today
function isToday(dateStr: string): boolean {
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

// CSV Row Parser helper
function parseCSV(text: string): string[][] {
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
        i++; // skip escaped quote
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
      if (row.some(c => c.trim().length > 0)) {
        lines.push(row);
      }
      row = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || row.length > 0) {
    row.push(currentVal);
    if (row.some(c => c.trim().length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

// Sample fallback data for initial presentation & testing before sheet IDs are inserted
function getSampleVouchers() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return [
    {
      id: "sample-3-1",
      submittedAt: `${day}/${month}/${year} 10:45`,
      submittedAtRaw: new Date(now.getTime() - 15 * 60000).toISOString(),
      nome: "Maria Eduarda Alves",
      whatsapp: "(88) 99723-4412",
      whatsappClean: "5588997234412",
      isClient: "Não",
      voucherType: "3 Sessões" as const,
    },
    {
      id: "sample-5-1",
      submittedAt: `${day}/${month}/${year} 09:20`,
      submittedAtRaw: new Date(now.getTime() - 95 * 60000).toISOString(),
      nome: "Francisca Carla Mesquita",
      whatsapp: "(88) 98845-1290",
      whatsappClean: "5588988451290",
      isClient: "Sim",
      voucherType: "5 Sessões" as const,
    },
    {
      id: "sample-3-2",
      submittedAt: `${day}/${month}/${year} 08:30`,
      submittedAtRaw: new Date(now.getTime() - 150 * 60000).toISOString(),
      nome: "Antonia Larissa Rodrigues",
      whatsapp: "(88) 99612-8873",
      whatsappClean: "5588996128873",
      isClient: "Não",
      voucherType: "3 Sessões" as const,
    },
    {
      id: "sample-5-2",
      submittedAt: "19/08/2026 16:40",
      submittedAtRaw: "2026-08-19T16:40:00.000Z",
      nome: "Beatriz Oliveira Souza",
      whatsapp: "(88) 99456-7811",
      whatsappClean: "5588994567811",
      isClient: "Não",
      voucherType: "5 Sessões" as const,
    },
    {
      id: "sample-3-3",
      submittedAt: "19/08/2026 14:15",
      submittedAtRaw: "2026-08-19T14:15:00.000Z",
      nome: "Juliana Mendes Cavalcante",
      whatsapp: "(88) 98123-9045",
      whatsappClean: "5588981239045",
      isClient: "Sim",
      voucherType: "3 Sessões" as const,
    },
    {
      id: "sample-5-3",
      submittedAt: "18/08/2026 18:05",
      submittedAtRaw: "2026-08-18T18:05:00.000Z",
      nome: "Camila Freire Rocha",
      whatsapp: "(88) 99934-2187",
      whatsappClean: "5588999342187",
      isClient: "Não",
      voucherType: "5 Sessões" as const,
    },
    {
      id: "sample-3-4",
      submittedAt: "18/08/2026 11:30",
      submittedAtRaw: "2026-08-18T11:30:00.000Z",
      nome: "Raimunda Nonata Lima",
      whatsapp: "(88) 98877-6655",
      whatsappClean: "5588988776655",
      isClient: "Sim",
      voucherType: "3 Sessões" as const,
    },
    {
      id: "sample-5-4",
      submittedAt: "17/08/2026 15:50",
      submittedAtRaw: "2026-08-17T15:50:00.000Z",
      nome: "Sabrina Vasconcelos Brito",
      whatsapp: "(88) 99654-3210",
      whatsappClean: "5588996543210",
      isClient: "Não",
      voucherType: "5 Sessões" as const,
    }
  ];
}

// Fetch Google Sheet data by Sheet ID and Tab or published CSV
async function fetchSheetData(
  sheetId?: string,
  sheetTab?: string,
  csvUrl?: string,
  voucherType: "3 Sessões" | "5 Sessões" = "3 Sessões"
) {
  if (!sheetId && !csvUrl) {
    return null;
  }

  // Try multiple Google Sheets CSV endpoints for highest reliability
  const urlsToTry: string[] = [];
  if (csvUrl) {
    urlsToTry.push(csvUrl);
  }
  if (sheetId) {
    if (sheetTab) {
      urlsToTry.push(
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetTab)}`
      );
    }
    urlsToTry.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`);
    urlsToTry.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`);
  }

  for (const fetchUrl of urlsToTry) {
    try {
      const res = await fetch(fetchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; EspacolaserTiangua/1.0)",
          Accept: "text/csv, text/plain, */*",
        },
      });

      if (!res.ok) {
        continue;
      }

      const csvText = await res.text();
      const rows = parseCSV(csvText);

      if (!rows || rows.length === 0) {
        return [];
      }

      // Check header row (row 0)
      const headerRow = rows[0].map(h => (h || "").toLowerCase().trim());
      
      // Dynamic column finder with fallback to standard index (A=0, B=1, C=2, D=3, E=4, F=5)
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

      const records = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 2) continue;

        const subId = (row[subIdIdx] || "").trim();
        const submittedAtRaw = (row[dateIdx] || "").trim();
        const nome = (row[nomeIdx] || "").trim();
        const whatsappRaw = (row[phoneIdx] || "").trim();
        const isClientRaw = (row[isClientIdx] || "").trim();

        // Skip completely empty lines
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
      console.warn(`[Google Sheets] Attempt failed for ${fetchUrl}:`, err);
    }
  }

  return null;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Login Endpoint
app.post("/api/login", (req: Request, res: Response) => {
  const { user, password } = req.body || {};

  if (!user || !password) {
    res.status(400).json({
      success: false,
      message: "Por favor, informe o login e a senha.",
    });
    return;
  }

  const normalizedInputUser = normalizeText(user);
  const normalizedExpectedUser = normalizeText(ADMIN_USER);

  if (normalizedInputUser === normalizedExpectedUser && password.trim() === ADMIN_PASSWORD) {
    const token = generateToken(ADMIN_USER);
    res.json({
      success: true,
      token,
      user: "Espaçolaser Tianguá",
      message: "Login realizado com sucesso.",
    });
    return;
  }

  res.status(401).json({
    success: false,
    message: "Login ou senha incorretos.",
  });
});

// 2. Auth Check Endpoint
app.get("/api/auth/check", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Não autenticado." });
    return;
  }
  const token = authHeader.split(" ")[1];
  const auth = verifyToken(token);
  if (!auth.valid) {
    res.status(401).json({ success: false, message: "Sessão inválida." });
    return;
  }
  res.json({ success: true, user: auth.user });
});

// 3. Vouchers Data Endpoint (Protected)
app.get("/api/vouchers", authMiddleware, async (req: Request, res: Response) => {
  try {
    // Default sheet IDs provided by user for Espaçolaser Tianguá
    const DEFAULT_SHEET_3_ID = "1DU8U7257KhJMrbCEdrOvmG8-9GFoth4y-0cY4VgglGE";
    const DEFAULT_SHEET_5_ID = "119MTwNs4h7TGuAaS1Tlil0nNuPYU8WEiqeKoExNByD4";

    const sheet3Id = process.env.SHEET_3_SESSIONS_ID || DEFAULT_SHEET_3_ID;
    const sheet3Tab = process.env.SHEET_3_SESSIONS_TAB || "Página1";
    const sheet3Csv = process.env.SHEET_3_CSV_URL;

    const sheet5Id = process.env.SHEET_5_SESSIONS_ID || DEFAULT_SHEET_5_ID;
    const sheet5Tab = process.env.SHEET_5_SESSIONS_TAB || "Página1";
    const sheet5Csv = process.env.SHEET_5_CSV_URL;

    const sheet3Configured = Boolean(sheet3Id || sheet3Csv);
    const sheet5Configured = Boolean(sheet5Id || sheet5Csv);

    let allRecords: any[] = [];
    let isLive = false;

    if (sheet3Configured || sheet5Configured) {
      const [res3, res5] = await Promise.all([
        fetchSheetData(sheet3Id, sheet3Tab, sheet3Csv, "3 Sessões"),
        fetchSheetData(sheet5Id, sheet5Tab, sheet5Csv, "5 Sessões"),
      ]);

      // If either returned an array (even if 0 items), mark live
      if (res3 !== null || res5 !== null) {
        isLive = true;
      }

      if (res3 && res3.length > 0) {
        allRecords.push(...res3);
      }
      if (res5 && res5.length > 0) {
        allRecords.push(...res5);
      }
    }

    // Sort from newest to oldest
    allRecords.sort((a, b) => {
      const timeA = parseDateForSort(a.submittedAtRaw || a.submittedAt);
      const timeB = parseDateForSort(b.submittedAtRaw || b.submittedAt);
      return timeB - timeA;
    });

    // Calculate stats
    const total = allRecords.length;
    const threeSessions = allRecords.filter((r) => r.voucherType === "3 Sessões").length;
    const fiveSessions = allRecords.filter((r) => r.voucherType === "5 Sessões").length;
    const today = allRecords.filter((r) => isToday(r.submittedAtRaw || r.submittedAt)).length;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const lastUpdated = `${day}/${month}/${year} ${hours}:${minutes}`;

    res.json({
      success: true,
      records: allRecords,
      stats: {
        total,
        threeSessions,
        fiveSessions,
        today,
        lastUpdated,
        source: isLive ? "live_sheets" : "sample_data",
        sheet3Configured,
        sheet5Configured,
      },
    });
  } catch (error: any) {
    console.error("[API] Error in /api/vouchers:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao carregar dados das planilhas.",
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "VOUCHER DIGITAL - ESPAÇOLASER TIANGUÁ" });
});

// -------------------------------------------------------------
// VITE / STATIC SERVING
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Espaçolaser Tianguá backend running on http://0.0.0.0:${PORT}`);
  });
}

start();
