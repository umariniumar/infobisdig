import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Mengecek status login kurator (dipakai halaman untuk menampilkan panel).
export async function GET() {
  const store = await cookies();
  const token = store.get("kk-curator")?.value ?? "";
  const pw = process.env.CURATOR_PASSWORD ?? "";
  let loggedIn = false;
  if (pw && token) {
    const expected = createHmac("sha256", pw).update("kurator-dashboard-bisdig").digest("hex");
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    loggedIn = a.length === b.length && timingSafeEqual(a, b);
  }
  return NextResponse.json({ loggedIn });
}
