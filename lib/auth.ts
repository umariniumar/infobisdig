// Login kurator server-side.
// Password TIDAK ditulis di kode — dibaca dari env CURATOR_PASSWORD.
// Setelah login benar, server memberi cookie httpOnly berisi token HMAC
// (kunci = password itu sendiri). Token diverifikasi ulang di setiap
// permintaan tulis. Tanpa CURATOR_PASSWORD yang diset, login selalu ditolak.
import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const CURATOR_COOKIE = "kk-curator";

function tokenFor(password: string): string {
  return createHmac("sha256", password).update("kurator-dashboard-bisdig").digest("hex");
}

export function curatorPasswordSet(): boolean {
  return Boolean(process.env.CURATOR_PASSWORD);
}

export function checkCuratorPassword(input: string): boolean {
  const expected = process.env.CURATOR_PASSWORD ?? "";
  if (!expected || !input) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function makeCuratorToken(): string | null {
  const pw = process.env.CURATOR_PASSWORD;
  if (!pw) return null;
  return tokenFor(pw);
}

export function isCuratorRequest(req: NextRequest): boolean {
  const pw = process.env.CURATOR_PASSWORD;
  const token = req.cookies.get(CURATOR_COOKIE)?.value;
  if (!pw || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(tokenFor(pw));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
