import { NextResponse, type NextRequest } from "next/server";
import { isCuratorRequest } from "../../../../lib/auth";
import { supabaseAdmin, supabaseConfigured } from "../../../../lib/supabase";

// CRUD kurator: hanya bisa jalan bila (1) sudah login kurator dan
// (2) Supabase sudah disiapkan. Tanpa Supabase, file JSON di Vercel
// bersifat read-only sehingga tulis ditolak dengan pesan jelas (503).
const TABLES: Record<string, string> = {
  article: "articles",
  articles: "articles",
  info: "info_posts",
  schedule: "schedule_items",
  task: "tasks",
  tasks: "tasks",
};

const COLUMNS: Record<string, Record<string, string>> = {
  articles: {
    body: "body",
    created_at: "created_at",
    is_example: "is_example",
    media_blob_key: "media_blob_key",
    media_from_upload: "media_from_upload",
    media_type: "media_type",
    media_url: "media_url",
    reading_minutes: "reading_minutes",
    source: "source",
    subject: "subject",
    summary: "summary",
    title: "title",
    url: "url",
  },
  info_posts: {
    body: "body",
    category: "category",
    created_at: "created_at",
    expires_date: "expires_date",
    is_example: "is_example",
    media_blob_key: "media_blob_key",
    media_from_upload: "media_from_upload",
    media_type: "media_type",
    media_url: "media_url",
    pinned: "pinned",
    source: "source",
    subject: "subject",
    title: "title",
    urgent: "urgent",
  },
  schedule_items: {
    date: "date",
    end_time: "end_time",
    is_example: "is_example",
    lecturer: "lecturer",
    location: "location",
    mode: "mode",
    note: "note",
    origin: "origin",
    start_time: "start_time",
    subject: "subject",
  },
  tasks: {
    deadline_date: "deadline_date",
    deadline_time: "deadline_time",
    description: "description",
    is_example: "is_example",
    subject: "subject",
    title: "title",
  },
};

function toRow(table: string, item: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
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
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) {
    const col = map[k] ?? k;
    if (COLUMNS[table]?.[col]) row[col] = v;
  }
  return row;
}

export async function POST(req: NextRequest) {
  if (!isCuratorRequest(req)) {
    return NextResponse.json({ error: "Belum login sebagai kurator." }, { status: 401 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json(
      { error: "Database belum disiapkan (Supabase). Tambah data belum bisa tersimpan — ikuti README bagian Supabase." },
      { status: 503 },
    );
  }
  const { collection, item } = (await req.json().catch(() => ({}))) as {
    collection?: string;
    item?: Record<string, unknown>;
  };
  const table = TABLES[collection ?? ""];
  if (!table || !item) {
    return NextResponse.json({ error: "Koleksi atau isi tidak valid." }, { status: 400 });
  }
  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  const row = toRow(table, item);
  const { data, error } = await sb.from(table).insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function PUT(req: NextRequest) {
  if (!isCuratorRequest(req)) {
    return NextResponse.json({ error: "Belum login sebagai kurator." }, { status: 401 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Database belum disiapkan (Supabase)." }, { status: 503 });
  }
  const { collection, id, patch } = (await req.json().catch(() => ({}))) as {
    collection?: string;
    id?: number;
    patch?: Record<string, unknown>;
  };
  const table = TABLES[collection ?? ""];
  if (!table || !id || !patch) {
    return NextResponse.json({ error: "Koleksi, id, atau perubahan tidak valid." }, { status: 400 });
  }
  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  const { data, error } = await sb.from(table).update(toRow(table, patch)).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}

export async function DELETE(req: NextRequest) {
  if (!isCuratorRequest(req)) {
    return NextResponse.json({ error: "Belum login sebagai kurator." }, { status: 401 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Database belum disiapkan (Supabase)." }, { status: 503 });
  }
  const { collection, id } = (await req.json().catch(() => ({}))) as {
    collection?: string;
    id?: number;
  };
  const table = TABLES[collection ?? ""];
  if (!table || !id) {
    return NextResponse.json({ error: "Koleksi atau id tidak valid." }, { status: 400 });
  }
  const sb = supabaseAdmin();
  if (!sb) return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 503 });
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
