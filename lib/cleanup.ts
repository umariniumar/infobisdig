// Aturan bersih-bersih jadwal (retensi) — fungsi murni, tanpa efek samping.
// Dipakai oleh API kurator manual (POST /api/curator/cleanup) dan cron otomatis
// (GET /api/cron/cleanup) sehingga kedua jalur selalu memakai aturan yang sama.
//
// ATURAN (dari Umar, 13 Nov 2026):
//   1. Jadwal reguler dari Sevima (origin=sevima): dihapus saat GANTI BULAN —
//      tanggalnya sebelum tanggal 1 bulan berjalan DAN sudah lewat
//      (date < today). Jadwal bulan berjalan tetap dipertahankan, termasuk yang
//      sudah lewat di bulan yang sama. Jadwal masa depan tidak pernah dihapus.
//   2. Jadwal Zoom (mode=zoom, origin apa pun): dihapus otomatis bila sudah
//      lewat LEBIH DARI 3 hari (date < today - 3 hari).
//      Contoh: hari ini 13 Nov 2026, Zoom 9 Nov ke bawah terhapus; Zoom 10 Nov belum.
//   3. Hanya schedule_items. info_posts, tasks, articles tidak pernah disentuh.
import type { ScheduleItem } from "./types";

export type CleanupReason = "sevima-bulan-lalu" | "zoom-lewat-3-hari";

export type CleanupCandidate = {
  id: number;
  subject: string;
  date: string; // YYYY-MM-DD
  mode: ScheduleItem["mode"];
  origin: ScheduleItem["origin"];
  reason: CleanupReason;
  reasonLabel: string;
};

export const REASON_LABELS: Record<CleanupReason, string> = {
  "sevima-bulan-lalu": "Jadwal Sevima bulan lalu",
  "zoom-lewat-3-hari": "Zoom sudah lewat lebih dari 3 hari",
};

// Tanggal hari ini (WIB) dalam format YYYY-MM-DD. Server Vercel berjalan di UTC,
// jadi tanggal diambil lewat zona Asia/Jakarta agar sama dengan yang dilihat kurator.
export function todayJakartaISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

// Geser tanggal ISO sejauh n hari (n negatif = mundur). Dihitung di UTC agar
// tidak kena pergeseran zona waktu.
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Tanggal 1 bulan berjalan, mis. hari ini 13 Nov 2026 -> "2026-11-01".
export function firstOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

// Satu item layak dihapus? Kembalikan alasannya, atau null bila dipertahankan.
// Urutan cek: aturan Zoom dulu (jendelanya lebih ketat), lalu aturan Sevima.
export function cleanupReasonFor(item: ScheduleItem, today: string): CleanupReason | null {
  // Aturan 2: Zoom yang sudah lewat lebih dari 3 hari.
  if (item.mode === "zoom" && item.date < addDays(today, -3)) {
    return "zoom-lewat-3-hari";
  }
  // Aturan 1: Sevima bulan lalu (sudah lewat + sebelum tanggal 1 bulan ini).
  if (item.origin === "sevima" && item.date < today && item.date < firstOfMonth(today)) {
    return "sevima-bulan-lalu";
  }
  return null;
}

// Dari seluruh jadwal, kembalikan yang layak dihapus beserta alasannya.
// Diurutkan dari tanggal paling lama. Tidak mengubah data apa pun.
export function findCleanupCandidates(
  items: ScheduleItem[],
  today: string,
): CleanupCandidate[] {
  const out: CleanupCandidate[] = [];
  for (const item of items) {
    const reason = cleanupReasonFor(item, today);
    if (!reason) continue;
    out.push({
      date: item.date,
      id: item.id,
      mode: item.mode,
      origin: item.origin,
      reason,
      reasonLabel: REASON_LABELS[reason],
      subject: item.subject,
    });
  }
  out.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  return out;
}
