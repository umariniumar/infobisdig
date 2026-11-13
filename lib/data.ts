// Lapisan data.
// PENTING: file JSON di Vercel bersifat read-only — aplikasi yang sudah di-deploy
// TIDAK bisa menulis ke data/*.json. Karena itu:
//   - Kalau env Supabase sudah diset: baca + tulis lewat Supabase (mode penuh).
//   - Kalau belum: baca dari seed JSON, tulis kurator ditolak dengan pesan jelas (HTTP 503).
import { promises as fs } from "fs";
import path from "path";
import type { Article, Board, InfoPost, ScheduleItem, Task } from "./types";
import { supabaseAnon } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");

async function readSeed<T>(file: string): Promise<T[]> {
  const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
  const parsed = JSON.parse(raw) as { items: T[] };
  return parsed.items;
}

function rowToSchedule(r: Record<string, unknown>): ScheduleItem {
  return {
    date: String(r.date ?? ""),
    endTime: String(r.end_time ?? ""),
    id: Number(r.id),
    isExample: Boolean(r.is_example),
    lecturer: String(r.lecturer ?? ""),
    location: String(r.location ?? ""),
    mode: (r.mode as ScheduleItem["mode"]) ?? "kelas",
    note: String(r.note ?? ""),
    origin: (r.origin as ScheduleItem["origin"]) ?? "sevima",
    startTime: String(r.start_time ?? ""),
    subject: String(r.subject ?? ""),
  };
}

function rowToInfo(r: Record<string, unknown>): InfoPost {
  return {
    body: String(r.body ?? ""),
    category: (r.category as InfoPost["category"]) ?? "pengumuman",
    createdAt: String(r.created_at ?? ""),
    expiresDate: String(r.expires_date ?? ""),
    id: Number(r.id),
    isExample: Boolean(r.is_example),
    mediaBlobKey: String(r.media_blob_key ?? ""),
    mediaFromUpload: Boolean(r.media_from_upload),
    mediaType: (r.media_type as InfoPost["mediaType"]) ?? "",
    mediaUrl: String(r.media_url ?? ""),
    pinned: Boolean(r.pinned),
    source: String(r.source ?? ""),
    subject: String(r.subject ?? ""),
    title: String(r.title ?? ""),
    urgent: Boolean(r.urgent),
  };
}

function rowToTask(r: Record<string, unknown>): Task {
  return {
    deadlineDate: String(r.deadline_date ?? ""),
    deadlineTime: String(r.deadline_time ?? ""),
    description: String(r.description ?? ""),
    id: Number(r.id),
    isExample: Boolean(r.is_example),
    subject: String(r.subject ?? ""),
    title: String(r.title ?? ""),
  };
}

function rowToArticle(r: Record<string, unknown>): Article {
  return {
    body: String(r.body ?? ""),
    createdAt: String(r.created_at ?? ""),
    id: Number(r.id),
    isExample: Boolean(r.is_example),
    mediaBlobKey: String(r.media_blob_key ?? ""),
    mediaFromUpload: Boolean(r.media_from_upload),
    mediaType: (r.media_type as Article["mediaType"]) ?? "",
    mediaUrl: String(r.media_url ?? ""),
    readingMinutes: Number(r.reading_minutes ?? 0),
    source: String(r.source ?? ""),
    subject: String(r.subject ?? ""),
    summary: String(r.summary ?? ""),
    title: String(r.title ?? ""),
    url: String(r.url ?? ""),
  };
}

export async function getBoard(): Promise<Board> {
  const sb = supabaseAnon();
  if (sb) {
    try {
      const [s, i, t, a] = await Promise.all([
        sb.from("schedule_items").select("*").order("date").order("start_time"),
        sb.from("info_posts").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false }),
        sb.from("tasks").select("*").order("deadline_date").order("deadline_time"),
        sb.from("articles").select("*").order("created_at", { ascending: false }),
      ]);
      if (!s.error && !i.error && !t.error && !a.error) {
        return {
          articles: (a.data ?? []).map(rowToArticle),
          info: (i.data ?? []).map(rowToInfo),
          schedule: (s.data ?? []).map(rowToSchedule),
          source: "supabase",
          tasks: (t.data ?? []).map(rowToTask),
        };
      }
    } catch {
      // jatuh ke seed di bawah
    }
  }
  const [schedule, info, tasks, articles] = await Promise.all([
    readSeed<ScheduleItem>("schedule.json"),
    readSeed<InfoPost>("info.json"),
    readSeed<Task>("tasks.json"),
    readSeed<Article>("articles.json"),
  ]);
  return { articles, info, schedule, source: "seed", tasks };
}
