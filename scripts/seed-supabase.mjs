// Mengisi tabel Supabase dari data seed di data/*.json.
// Jalan:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:supabase
// atau isi .env.local dulu, lalu: npm run seed:supabase
// Script ini membaca .env.local bila ada (tanpa dependensi tambahan).
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)=(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diisi (di .env.local atau env).");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

function toRow(table, item) {
  const map = {
    createdAt: "created_at",
    deadlineDate: "deadline_date",
    deadlineTime: "deadline_time",
    endTime: "end_time",
    expiresDate: "expires_date",
    isExample: "is_example",
    mediaBlobKey: "media_blob_key",
    mediaFromUpload: "media_from_upload",
    mediaType: "media_type",
    mediaUrl: "media_url",
    readingMinutes: "reading_minutes",
    startTime: "start_time",
  };
  const row = {};
  for (const [k, v] of Object.entries(item)) row[map[k] ?? k] = v;
  return row;
}

const jobs = [
  ["schedule_items", "data/schedule.json"],
  ["info_posts", "data/info.json"],
  ["tasks", "data/tasks.json"],
  ["articles", "data/articles.json"],
];

for (const [table, file] of jobs) {
  const { items } = JSON.parse(readFileSync(file, "utf-8"));
  const rows = items.map((it) => toRow(table, it));
  const { error } = await sb.from(table).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`Gagal mengisi ${table}:`, error.message);
    process.exit(1);
  }
  console.log(`${table}: ${rows.length} baris tersimpan.`);
}

// Seed memakai id eksplisit, jadi sequence identity tiap tabel harus dimajukan
// ke id terbesar — kalau tidak, insert kurator berikutnya gagal
// "duplicate key value violates unique constraint ..._pkey".
const { error: resetError } = await sb.rpc("reset_identity_sequences");
if (resetError) {
  console.error(
    "PERINGATAN: reset_identity_sequences gagal (" + resetError.message + "). " +
    "Seed tetap selesai, tapi jalankan SQL ini di SQL Editor Supabase agar insert kurator tidak gagal:\n" +
    "SELECT setval(pg_get_serial_sequence('schedule_items','id'), (SELECT MAX(id) FROM schedule_items));\n" +
    "SELECT setval(pg_get_serial_sequence('info_posts','id'), (SELECT MAX(id) FROM info_posts));\n" +
    "SELECT setval(pg_get_serial_sequence('tasks','id'), (SELECT MAX(id) FROM tasks));\n" +
    "SELECT setval(pg_get_serial_sequence('articles','id'), (SELECT MAX(id) FROM articles));",
  );
} else {
  console.log("Sequence id tiap tabel sudah direset ke id terbesar.");
}
console.log("Seed Supabase selesai.");
