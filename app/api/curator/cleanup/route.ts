import { NextResponse, type NextRequest } from "next/server";
import { isCuratorRequest } from "../../../../lib/auth";
import { findCleanupCandidates, todayJakartaISO } from "../../../../lib/cleanup";
import { supabaseAdmin, supabaseConfigured } from "../../../../lib/supabase";

// Bersihkan jadwal lama — manual, oleh kurator.
// Aman secara default: tanpa dryRun=false eksplisit, TIDAK ada yang dihapus,
// hanya preview (jumlah + daftar) yang dikembalikan.
// Hanya schedule_items yang dihapus. Tanpa Supabase (mode seed) ditolak 503
// karena file JSON di Vercel bersifat read-only.
export async function POST(req: NextRequest) {
  if (!isCuratorRequest(req)) {
    return NextResponse.json({ error: "Belum login sebagai kurator." }, { status: 401 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database belum disiapkan (Supabase). Bersihkan jadwal tidak bisa jalan di mode seed — ikuti README bagian Supabase.",
      },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { dryRun?: boolean };
  // Hapus hanya bila dryRun=false eksplisit. Tanpa itu: preview saja.
  const dryRun = body.dryRun !== false;

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

  if (dryRun) {
    return NextResponse.json({ count: candidates.length, dryRun: true, items: candidates, ok: true, today });
  }

  const ids = candidates.map((c) => c.id);
  if (ids.length > 0) {
    const { error: delError } = await sb.from("schedule_items").delete().in("id", ids);
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });
  }
  return NextResponse.json({
    count: candidates.length,
    deleted: ids.length,
    dryRun: false,
    items: candidates,
    ok: true,
    today,
  });
}
