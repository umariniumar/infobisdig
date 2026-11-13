import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { findCleanupCandidates, todayJakartaISO } from "../../../../lib/cleanup";
import { supabaseAdmin, supabaseConfigured } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

// Bersihkan jadwal lama — otomatis, dipanggil cron harian Vercel (01:00 WIB).
// Wajib header: Authorization: Bearer <CRON_SECRET>.
// Vercel Cron mengirim header itu otomatis bila CRON_SECRET diset di env.
// Tanpa CRON_SECRET di env, endpoint ini tidak pernah jalan (503).
// Log hasil dicatat lewat console agar terlihat di Vercel Logs.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) {
    console.log("[cleanup-cron] CRON_SECRET belum diset — bersih-bersih dilewati.");
    return NextResponse.json(
      { error: "CRON_SECRET belum diset di environment. Bersihkan jadwal otomatis tidak aktif." },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(auth);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  if (!supabaseConfigured()) {
    console.log("[cleanup-cron] Supabase belum disiapkan — bersih-bersih dilewati.");
    return NextResponse.json(
      { error: "Database belum disiapkan (Supabase). Bersihkan jadwal tidak bisa jalan di mode seed." },
      { status: 503 },
    );
  }
  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });

  const today = todayJakartaISO();
  const { data, error } = await sb
    .from("schedule_items")
    .select("id, subject, date, mode, origin")
    .order("date");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const candidates = findCleanupCandidates(
    (data ?? []).map((r) => ({
      date: String(r.date ?? ""),
      endTime: "",
      id: Number(r.id),
      lecturer: "",
      location: "",
      mode: r.mode as "kelas" | "zoom" | "pengganti" | "lainnya",
      note: "",
      origin: r.origin as "sevima" | "tambahan",
      startTime: "",
      subject: String(r.subject ?? ""),
    })),
    today,
  );

  const ids = candidates.map((c) => c.id);
  if (ids.length > 0) {
    const { error: delError } = await sb.from("schedule_items").delete().in("id", ids);
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });
  }
  console.log(
    `[cleanup-cron] ${today}: ${ids.length} jadwal lama dihapus ` +
      `(${candidates.filter((c) => c.reason === "sevima-bulan-lalu").length} Sevima bulan lalu, ` +
      `${candidates.filter((c) => c.reason === "zoom-lewat-3-hari").length} Zoom lewat 3 hari).`,
  );
  return NextResponse.json({ count: candidates.length, deleted: ids.length, items: candidates, ok: true, today });
}
