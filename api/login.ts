import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || "espacolaser-tiangua-secret-auth-key-2026";
const ADMIN_USER = (process.env.ADMIN_USER || "TIANGUÁ").trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "3553").trim();

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function generateToken(user: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ user, expiresAt, rand: crypto.randomBytes(8).toString("hex") });
  const base64Payload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export default async function handler(req: any, res: any) {
  // Enable CORS for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { user, password } = body || {};

  if (!user || !password) {
    res.status(400).json({
      success: false,
      message: "Por favor, informe o login e a senha.",
    });
    return;
  }

  const normalizedInputUser = normalizeText(user);
  const normalizedExpectedUser = normalizeText(ADMIN_USER);

  if (
    (normalizedInputUser === normalizedExpectedUser || normalizedInputUser === "TIANGUA") &&
    password.trim() === ADMIN_PASSWORD
  ) {
    const token = generateToken(ADMIN_USER);
    res.status(200).json({
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
}
