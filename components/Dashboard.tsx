"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Article, Board, InfoPost, ScheduleItem, Task } from "../lib/types";
import { SUBJECTS, displaySubject } from "../lib/types";
import { Icon, subjectIcon, type IconName } from "./icons";

type Tab = "beranda" | "jadwal" | "info" | "tugas" | "artikel";

// ---------- util tanggal (zona WIB) ----------
function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}
function nowTimeJakarta(): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}
function dateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00+07:00`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}
function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00+07:00`);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}
function daysUntil(iso: string): number {
  const today = new Date(`${todayJakarta()}T00:00:00+07:00`).getTime();
  const target = new Date(`${iso}T00:00:00+07:00`).getTime();
  return Math.round((target - today) / 86400000);
}
function jakartaMs(date: string, time: string): number {
  return new Date(`${date}T${time}:00+07:00`).getTime();
}
function isPastSchedule(s: ScheduleItem): boolean {
  const today = todayJakarta();
  if (s.date < today) return true;
  if (s.date === today) return s.endTime <= nowTimeJakarta();
  return false;
}
function isExpiredInfo(p: InfoPost): boolean {
  return Boolean(p.expiresDate) && p.expiresDate < todayJakarta();
}
function countdownLabel(item: ScheduleItem, nowMs: number): string {
  const start = jakartaMs(item.date, item.startTime);
  const end = jakartaMs(item.date, item.endTime);
  if (nowMs >= start && nowMs < end) return "Sedang berlangsung";
  const diffMin = Math.max(0, Math.round((start - nowMs) / 60000));
  if (diffMin < 60) return `Mulai ${diffMin} menit lagi`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (item.date === todayJakarta()) {
    return m === 0 ? `Mulai ${h} jam lagi` : `Mulai ${h} jam ${m} menit lagi`;
  }
  return `Mulai ${shortDate(item.date)}, ${item.startTime}`;
}

// ---------- ikon hero yang beranimasi ----------
// Indeks awal disamakan untuk ketiga slot agar trio pertama yang tampil
// adalah kalender / megaphone / chart; urutan pergantian tiap 3 detik
// tetap sama per slot.
const HERO_SETS: { color: "blue" | "red" | "green"; icons: IconName[] }[] = [
  { color: "blue", icons: ["calendar", "clock", "list"] },
  { color: "red", icons: ["megaphone", "bell", "newspaper"] },
  { color: "green", icons: ["chart", "trend", "pie"] },
];

function HeroIcon({ slot, step }: { slot: number; step: number }) {
  const set = HERO_SETS[slot];
  const icon = set.icons[step % set.icons.length];
  return (
    <span className={`hero-icon ${set.color}`} aria-hidden="true">
      <span className="pop" key={icon}>
        <Icon name={icon} size={20} />
      </span>
    </span>
  );
}

function Hero() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setStep((s) => s + 1), 3000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <header className="hero">
      <div className="hero-labels">
        <span className="label-pill">Semester 5</span>
        <span className="label-pill">Angkatan 2024</span>
      </div>
      <h1>
        <span className="hero-line">
          Dashboard <HeroIcon slot={0} step={step} />
        </span>
        <span className="hero-line">
          Informasi <HeroIcon slot={1} step={step} />
        </span>
        <span className="hero-line">
          Terkurasi <HeroIcon slot={2} step={step} />
        </span>
      </h1>
      <p className="hero-sub">Prodi S-1 Bisnis Digital - FEB UDS.</p>
      <p className="hero-desc">
        Informasi seputar jadwal kelas, tugas, pengumuman, kegiatan dan artikel referensi terkait
        bisnis digital
        <mark className="wa-highlight">tanpa scrolling WhatsApp Group lagi.</mark>
      </p>
    </header>
  );
}

// ---------- bottom sheet generik ----------
// Dipakai untuk "Pilih Mata Kuliah" dan form kurator (tambah/ubah).
// Gagang seret, tutup bila diseret >90px, tombol tutup berupa teks "✕ Tutup".
function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div
      className="sheet-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="sheet"
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          startY.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          const dy = e.touches[0].clientY - startY.current;
          if (dy > 0) setDragY(dy);
        }}
        onTouchEnd={() => {
          if (dragY > 90) onClose();
          setDragY(0);
        }}
      >
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <button className="sheet-close" onClick={onClose}>
            ✕ Tutup
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

// ---------- pilih mata kuliah ----------
function SubjectPicker({
  value,
  onPick,
  onClose,
}: {
  value: string;
  onPick: (v: string) => void;
  onClose: () => void;
}) {
  const options = [{ canonical: "", display: "Semua mata kuliah" }, ...SUBJECTS];
  return (
    <BottomSheet title="Pilih Mata Kuliah" onClose={onClose}>
      <div className="sheet-list" style={{ padding: "0 0 4px" }}>
        {options.map((o) => (
          <button
            key={o.canonical || "semua"}
            className={`sheet-option ${value === o.canonical ? "active" : ""}`}
            onClick={() => {
              onPick(o.canonical);
              onClose();
            }}
          >
            <span className="item-icon">
              <Icon name={o.canonical ? subjectIcon(o.canonical) : "grid"} />
            </span>
            {o.display}
            <span className="spacer" />
            {value === o.canonical && <Icon name="check" />}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

function SubjectDropdown({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const current =
    value === "" ? "Semua mata kuliah" : SUBJECTS.find((s) => s.canonical === value)?.display ?? value;
  return (
    <>
      <button
        className={`subject-pill${value ? " selected" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}: ${current}`}
        onClick={() => setOpen(true)}
      >
        <span>{current}</span>
        <Icon name="chevronDown" />
      </button>
      {open && <SubjectPicker value={value} onPick={onChange} onClose={() => setOpen(false)} />}
    </>
  );
}

// ---------- tombol Zoom / link kelas ----------
function ZoomButton({ item }: { item: ScheduleItem }) {
  if (item.mode === "zoom") {
    if (item.isExample) {
      return (
        <p className="item-meta">
          <span className="badge example">Contoh — link dummy</span> Link Zoom asli dimasukkan
          kurator dari grup WA.
        </p>
      );
    }
    if (item.location.startsWith("http")) {
      return (
        <p>
          <a className="btn" href={item.location} target="_blank" rel="noreferrer">
            Masuk Zoom
          </a>
        </p>
      );
    }
    return <p className="item-meta">Link Zoom dimasukkan kurator.</p>;
  }
  if (item.location.startsWith("http")) {
    return (
      <p>
        <a className="btn" href={item.location} target="_blank" rel="noreferrer">
          Buka link kelas
        </a>
      </p>
    );
  }
  return null;
}

// ---------- tombol hapus dua langkah (kurator) ----------
// Klik pertama hanya mempersenjatai tombol ("Yakin hapus?"), klik kedua pada
// tombol yang sama baru benar-benar menghapus. Bila tidak diklik kedua dalam
// 5 detik, tombol kembali ke "Hapus". Tiap kartu punya instance sendiri,
// jadi mempersenjatai satu kartu tidak mempersenjatai kartu lain. Sengaja
// tidak pakai window.confirm — dialog itu tidak muncul/tepercaya di semua
// browser. Perilaku ini adalah keputusan yang sudah terverifikasi live;
// JANGAN diganti dengan perilaku hapus lain.
function ConfirmDeleteButton({
  onConfirm,
  style,
}: {
  onConfirm: () => void;
  style?: React.CSSProperties;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  return (
    <button
      className={armed ? "btn danger small armed" : "btn danger small"}
      style={style}
      onClick={() => {
        if (armed) {
          if (timer.current) clearTimeout(timer.current);
          timer.current = null;
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => {
          setArmed(false);
          timer.current = null;
        }, 5000);
      }}
    >
      {armed ? "Yakin hapus?" : "Hapus"}
    </button>
  );
}

// ---------- media gambar/video di kartu ----------
function MediaBlock({
  mediaType,
  mediaUrl,
  mediaFromUpload,
}: {
  mediaType: "" | "image" | "video";
  mediaUrl: string;
  mediaFromUpload: boolean;
}) {
  if (!mediaType || !mediaUrl) return null;
  const caption = mediaFromUpload ? "Media unggahan kurator" : "Media dari URL";
  const hideBroken = (e: React.SyntheticEvent) => {
    const fig = (e.target as HTMLElement).closest("figure");
    if (fig) (fig as HTMLElement).style.display = "none";
  };
  if (mediaType === "image") {
    return (
      <figure className="media-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mediaUrl} alt="" onError={hideBroken} />
        <figcaption>{caption}</figcaption>
      </figure>
    );
  }
  if (mediaType === "video") {
    return (
      <figure className="media-block">
        {mediaUrl.includes("youtube.com/embed") || mediaUrl.includes("youtu.be/") ? (
          <div className="video-wrap">
            <iframe
              src={mediaUrl}
              title="Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video controls src={mediaUrl} onError={hideBroken} />
        )}
        <figcaption>{caption}</figcaption>
      </figure>
    );
  }
  return null;
}

// ---------- kartu-kartu ----------
function CuratorActions({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  if (!onEdit && !onDelete) return null;
  return (
    <p style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
      {onEdit && (
        <button className="btn secondary small" onClick={onEdit}>
          Ubah
        </button>
      )}
      {onDelete && <ConfirmDeleteButton onConfirm={onDelete} />}
    </p>
  );
}

function ScheduleCard({
  item,
  onDelete,
  onEdit,
}: {
  item: ScheduleItem;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const past = isPastSchedule(item);
  return (
    <article className={`card${past ? " past" : ""}`}>
      <div className="item-row">
        <span className="item-icon">
          <Icon name={item.mode === "zoom" ? "clock" : "calendar"} />
        </span>
        <div style={{ flex: 1 }}>
          <p className="item-title">{displaySubject(item.subject)}</p>
          <p className="item-meta">
            {dateLabel(item.date)} · {item.startTime}–{item.endTime} WIB
          </p>
          <p className="item-meta">
            {item.mode === "zoom" ? "Online" : `Ruangan: ${item.location}`}
            {item.mode === "kelas" ? " · Kelas reguler" : ""}
          </p>
          {item.lecturer && (
            <p className="lecturers">
              Dosen:{" "}
              {item.lecturer
                .split(";")
                .map((l, i) => (
                  <span key={i}>
                    {i + 1}. {l.trim()}
                    <br />
                  </span>
                ))}
            </p>
          )}
          {item.note && <p className="item-meta">{item.note}</p>}
          <ZoomButton item={item} />
          <CuratorActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </article>
  );
}

function InfoCard({
  post,
  onDelete,
  onEdit,
}: {
  post: InfoPost;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const expired = isExpiredInfo(post);
  return (
    <article className={`card${expired ? " past" : ""}`}>
      {post.urgent && <span className="badge urgent">Penting</span>}{" "}
      {post.pinned && <span className="badge">Disematkan</span>}{" "}
      {post.isExample && <span className="badge example">Contoh</span>}
      {expired && <span className="badge">Sudah berakhir</span>}
      <h3 className="item-title" style={{ marginTop: 8 }}>
        {post.title}
      </h3>
      <p className="item-meta" style={{ whiteSpace: "pre-wrap" }}>
        {post.body}
      </p>
      <MediaBlock
        mediaType={post.mediaType}
        mediaUrl={post.mediaUrl}
        mediaFromUpload={post.mediaFromUpload}
      />
      <p className="item-meta" style={{ marginTop: 8 }}>
        {post.source}
        {post.subject ? ` · ${displaySubject(post.subject)}` : ""}
        {post.expiresDate ? ` · Berlaku s.d. ${shortDate(post.expiresDate)}` : ""}
      </p>
      <CuratorActions onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}

function TaskCard({
  task,
  onDelete,
  onEdit,
}: {
  task: Task;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const d = daysUntil(task.deadlineDate);
  const badge = d < 0 ? "Lewat" : d === 0 ? "Hari ini" : d === 1 ? "Besok" : `H-${d}`;
  const cls = d <= 2 ? "soon" : d <= 5 ? "mid" : "later";
  return (
    <article className="card">
      <div className="task-head">
        <h3 className="item-title">{task.title}</h3>
        <span className={`deadline-badge ${cls}`}>{badge}</span>
      </div>
      {task.isExample && <span className="badge example">Contoh</span>}
      <p className="item-meta">{task.description}</p>
      <p className="item-meta" style={{ marginTop: 6 }}>
        {displaySubject(task.subject)} · Tenggat {shortDate(task.deadlineDate)} ·{" "}
        {task.deadlineTime} WIB
      </p>
      <CuratorActions onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}

function ArticleCard({
  article,
  onDelete,
  onEdit,
}: {
  article: Article;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isVideo = article.mediaType === "video" && article.mediaUrl.startsWith("http");
  const wordCount = article.body.trim() ? article.body.trim().split(/\s+/).length : 0;
  return (
    <article className="card">
      {article.isExample && <span className="badge example">Contoh</span>}
      <h3 className="item-title" style={{ marginTop: 6 }}>
        {article.title}
      </h3>
      <p className="item-meta">{article.summary}</p>
      <p className="item-meta" style={{ marginTop: 6 }}>
        {displaySubject(article.subject)} · ±{article.readingMinutes} menit baca · {article.source}
      </p>
      {open && (
        <>
          {isVideo && (
            <div className="video-wrap">
              <iframe
                src={article.mediaUrl}
                title={article.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {article.mediaType === "image" && article.mediaUrl && (
            <MediaBlock
              mediaType="image"
              mediaUrl={article.mediaUrl}
              mediaFromUpload={article.mediaFromUpload}
            />
          )}
          <p className="article-body">{article.body}</p>
          <p className="item-meta">±{wordCount} kata</p>
          {article.url && (
            <p>
              <a href={article.url} target="_blank" rel="noreferrer">
                Baca sumber asli ↗
              </a>
            </p>
          )}
        </>
      )}
      <p style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn" onClick={() => setOpen(!open)}>
          {open ? "Tutup artikel" : "Baca artikel →"}
        </button>
        {onEdit && (
          <button className="btn secondary small" onClick={onEdit}>
            Ubah
          </button>
        )}
        {onDelete && <ConfirmDeleteButton onConfirm={onDelete} />}
      </p>
    </article>
  );
}

// ---------- panel kurator (di dalam dialog login) ----------
function CuratorPanel({
  board,
  onChanged,
  authed,
  onAuthChange,
  onOpenForm,
  opError,
  setOpError,
}: {
  board: Board;
  onChanged: () => void;
  authed: boolean;
  onAuthChange: (v: boolean) => void;
  onOpenForm: (type: "schedule" | "info" | "task" | "article") => void;
  opError: string;
  setOpError: (v: string) => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setName(localStorage.getItem("bisdig-curator-name") ?? "");
    } catch {
      /* abaikan */
    }
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/curator/login", {
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setBusy(false);
    if (r.ok) {
      try {
        localStorage.setItem("bisdig-curator-name", name.trim());
      } catch {
        /* abaikan */
      }
      onAuthChange(true);
      setPassword("");
    } else {
      setError("Kode akses kurator salah.");
    }
  }

  async function logout() {
    await fetch("/api/curator/logout", { method: "POST" });
    onAuthChange(false);
  }

  if (!authed) {
    return (
      <form onSubmit={login} style={{ marginTop: 16 }}>
        <label className="field-label" htmlFor="curator-name">
          Nama kurator
        </label>
        <input
          id="curator-name"
          className="field"
          type="text"
          autoComplete="name"
          placeholder="Nama kamu"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="field-label" htmlFor="curator-password">
          Kode akses kurator
        </label>
        <input
          id="curator-password"
          className="field"
          type="password"
          autoComplete="current-password"
          placeholder="Kode akses kurator"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
        <button className="btn btn-block" type="submit" disabled={busy}>
          <Icon name="login" size={18} />
          {busy ? "Memeriksa…" : "Masuk sebagai Kurator"}
        </button>
        <p className="item-meta" style={{ marginTop: 8 }}>
          Hanya admin prodi / PIC mata kuliah yang punya kode akses ini.
        </p>
      </form>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <p>
        <strong>Mode Kurator aktif.</strong>{" "}
        <button className="btn secondary" onClick={logout}>
          Keluar
        </button>
      </p>
      {board.source === "seed" && (
        <p className="notice warn">
          Mode baca saja: Supabase belum disiapkan di deployment ini, jadi tambah/ubah/hapus
          belum bisa tersimpan. Ikuti README bagian Supabase, lalu deploy ulang.
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["schedule", "info", "task", "article"] as const).map((c) => (
          <button key={c} className="btn secondary" onClick={() => onOpenForm(c)}>
            + Tambah{" "}
            {c === "schedule" ? "Jadwal" : c === "info" ? "Info" : c === "task" ? "Tugas" : "Artikel"}
          </button>
        ))}
      </div>
      {opError && (
        <p role="alert" style={{ color: "var(--danger)" }}>
          {opError}
        </p>
      )}
      <CleanupPanel board={board} onChanged={onChanged} />
    </div>
  );
}

function CleanupPanel({ board, onChanged }: { board: Board; onChanged: () => void }) {
  const [preview, setPreview] = useState<
    { id: number; subject: string; date: string; reasonLabel: string }[] | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const isSeed = board.source === "seed";

  async function callCleanup(dryRun: boolean) {
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const r = await fetch("/api/curator/cleanup", {
        body: JSON.stringify({ dryRun }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const d = await r.json().catch(() => ({}));
      setBusy(false);
      if (!r.ok) {
        setError(d.error ?? "Gagal memeriksa jadwal lama.");
        return;
      }
      if (dryRun) {
        setPreview(d.items ?? []);
        if ((d.count ?? 0) === 0) setMsg("Tidak ada jadwal lama yang perlu dihapus.");
      } else {
        setPreview(null);
        setMsg(`Berhasil menghapus ${d.deleted ?? 0} jadwal lama.`);
        onChanged();
      }
    } catch {
      setBusy(false);
      setError("Gagal menghubungi server. Periksa koneksi internet, lalu coba lagi.");
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3 className="item-title" style={{ marginTop: 0 }}>
        Bersihkan Jadwal Lama
      </h3>
      <p className="item-meta">
        Jadwal Sevima bulan lalu dihapus saat ganti bulan. Jadwal Zoom dihapus bila sudah lewat
        lebih dari 3 hari. Jadwal bulan berjalan dan jadwal masa depan tidak pernah dihapus.
        Info, tugas, dan artikel tidak disentuh.
      </p>
      {isSeed ? (
        <p className="notice warn">
          Database belum disiapkan (mode baca saja), jadi bersih-bersih belum bisa jalan. Ikuti
          README bagian Supabase, lalu deploy ulang.
        </p>
      ) : (
        <>
          <p>
            <button className="btn secondary" onClick={() => callCleanup(true)} disabled={busy}>
              {busy ? "Memeriksa…" : "Lihat jadwal yang akan dihapus"}
            </button>
          </p>
          {preview !== null && preview.length > 0 && (
            <>
              <p className="item-meta">
                {preview.length} jadwal akan dihapus:
              </p>
              <ul style={{ margin: "4px 0 12px", paddingLeft: 20 }}>
                {preview.map((c) => (
                  <li key={c.id} className="item-meta">
                    {displaySubject(c.subject)} · {shortDate(c.date)} · {c.reasonLabel}
                  </li>
                ))}
              </ul>
              <p>
                <button
                  className="btn danger"
                  onClick={() => {
                    if (window.confirm(`Hapus ${preview.length} jadwal lama ini?`)) {
                      callCleanup(false);
                    }
                  }}
                  disabled={busy}
                >
                  {busy ? "Menghapus…" : `Hapus ${preview.length} jadwal`}
                </button>
              </p>
            </>
          )}
        </>
      )}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {msg && <p className="notice info">{msg}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

// ---------- form kurator (tampil di bottom sheet) ----------
// initial diisi saat mode ubah; kosong saat mode tambah.
function ScheduleForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: Partial<ScheduleItem>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (item: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState({
    date: initial?.date ?? "",
    endTime: initial?.endTime ?? "",
    lecturer: initial?.lecturer ?? "",
    location: initial?.location ?? "",
    mode: initial?.mode ?? "kelas",
    note: initial?.note ?? "",
    startTime: initial?.startTime ?? "",
    subject: initial?.subject ?? "CRM",
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <Field label="Mata kuliah">
        <select className="field" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })}>
          {SUBJECTS.map((s) => (
            <option key={s.canonical} value={s.canonical}>
              {s.display}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tanggal">
        <input className="field" type="date" required value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} />
      </Field>
      <Field label="Jam mulai">
        <input className="field" type="time" required value={v.startTime} onChange={(e) => setV({ ...v, startTime: e.target.value })} />
      </Field>
      <Field label="Jam selesai">
        <input className="field" type="time" required value={v.endTime} onChange={(e) => setV({ ...v, endTime: e.target.value })} />
      </Field>
      <Field label="Dosen (pisahkan dengan ; bila lebih dari satu)">
        <input className="field" value={v.lecturer} onChange={(e) => setV({ ...v, lecturer: e.target.value })} />
      </Field>
      <Field label="Ruangan / link Zoom (link Zoom asli dari grup WA)">
        <input className="field" value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} placeholder="BDIGI-7 atau https://zoom.us/j/..." />
      </Field>
      <Field label="Jenis">
        <select className="field" value={v.mode} onChange={(e) => setV({ ...v, mode: e.target.value as ScheduleItem["mode"] })}>
          <option value="kelas">Kelas reguler</option>
          <option value="zoom">Zoom</option>
          <option value="pengganti">Kelas pengganti</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </Field>
      <Field label="Catatan">
        <input className="field" value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />
      </Field>
      <button className="btn" type="submit">{submitLabel}</button>{" "}
      <button className="btn secondary" type="button" onClick={onCancel}>Batal</button>
    </form>
  );
}

function InfoForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: Partial<InfoPost>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (item: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState({
    body: initial?.body ?? "",
    category: initial?.category ?? "pengumuman",
    source: initial?.source ?? "",
    subject: initial?.subject ?? "",
    title: initial?.title ?? "",
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <Field label="Judul">
        <input className="field" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      </Field>
      <Field label="Isi">
        <textarea className="field" rows={4} required value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} />
      </Field>
      <Field label="Kategori">
        <select className="field" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as InfoPost["category"] })}>
          <option value="pengumuman">Pengumuman</option>
          <option value="jadwal">Jadwal</option>
          <option value="tugas">Tugas</option>
          <option value="kegiatan">Kegiatan</option>
        </select>
      </Field>
      <Field label="Mata kuliah (kosongkan bila untuk semua)">
        <select className="field" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })}>
          <option value="">Semua mata kuliah</option>
          {SUBJECTS.map((s) => (
            <option key={s.canonical} value={s.canonical}>{s.display}</option>
          ))}
        </select>
      </Field>
      <Field label="Sumber">
        <input className="field" value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} placeholder="mis. Surat Edaran UDS" />
      </Field>
      <button className="btn" type="submit">{submitLabel}</button>{" "}
      <button className="btn secondary" type="button" onClick={onCancel}>Batal</button>
    </form>
  );
}

function TaskForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: Partial<Task>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (item: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState({
    deadlineDate: initial?.deadlineDate ?? "",
    deadlineTime: initial?.deadlineTime ?? "23:59",
    description: initial?.description ?? "",
    subject: initial?.subject ?? "CRM",
    title: initial?.title ?? "",
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <Field label="Judul tugas">
        <input className="field" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      </Field>
      <Field label="Deskripsi">
        <textarea className="field" rows={3} required value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      </Field>
      <Field label="Mata kuliah">
        <select className="field" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })}>
          {SUBJECTS.map((s) => (
            <option key={s.canonical} value={s.canonical}>{s.display}</option>
          ))}
        </select>
      </Field>
      <Field label="Tanggal tenggat">
        <input className="field" type="date" required value={v.deadlineDate} onChange={(e) => setV({ ...v, deadlineDate: e.target.value })} />
      </Field>
      <Field label="Jam tenggat">
        <input className="field" type="time" value={v.deadlineTime} onChange={(e) => setV({ ...v, deadlineTime: e.target.value })} />
      </Field>
      <button className="btn" type="submit">{submitLabel}</button>{" "}
      <button className="btn secondary" type="button" onClick={onCancel}>Batal</button>
    </form>
  );
}

function ArticleForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: Partial<Article>;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (item: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState({
    body: initial?.body ?? "",
    readingMinutes: initial?.readingMinutes ?? 5,
    source: initial?.source ?? "",
    subject: initial?.subject ?? "CRM",
    summary: initial?.summary ?? "",
    title: initial?.title ?? "",
    url: initial?.url ?? "",
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
    >
      <Field label="Judul artikel">
        <input className="field" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      </Field>
      <Field label="Ringkasan">
        <textarea className="field" rows={2} required value={v.summary} onChange={(e) => setV({ ...v, summary: e.target.value })} />
      </Field>
      <Field label="Isi (maks. 1000 kata)">
        <textarea className="field" rows={5} required value={v.body} onChange={(e) => setV({ ...v, body: e.target.value })} />
      </Field>
      <Field label="Mata kuliah">
        <select className="field" value={v.subject} onChange={(e) => setV({ ...v, subject: e.target.value })}>
          {SUBJECTS.map((s) => (
            <option key={s.canonical} value={s.canonical}>{s.display}</option>
          ))}
        </select>
      </Field>
      <Field label="Sumber">
        <input className="field" value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} />
      </Field>
      <Field label="Link sumber">
        <input className="field" value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} placeholder="https://..." />
      </Field>
      <Field label="Waktu baca (menit)">
        <input className="field" type="number" min={1} value={v.readingMinutes} onChange={(e) => setV({ ...v, readingMinutes: Number(e.target.value) })} />
      </Field>
      <button className="btn" type="submit">{submitLabel}</button>{" "}
      <button className="btn secondary" type="button" onClick={onCancel}>Batal</button>
    </form>
  );
}

// ---------- navigasi dengan indikator geser ----------
// Indikator gelap mengikuti tombol aktif (transisi pegas 0,38 detik).
// Diukur dari posisi tombol yang sebenarnya, jadi tetap tepat bila
// ukuran layar berubah.
function useSlidingIndicator(activeIndex: number) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [style, setStyle] = useState({ width: 0, x: 0 });
  const measure = () => {
    const el = refs.current[activeIndex];
    if (el) setStyle({ width: el.offsetWidth, x: el.offsetLeft });
  };
  useLayoutEffect(() => {
    measure();
  });
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { refs, style };
}

function DesktopNav({
  tabs,
  tab,
  onChange,
}: {
  tabs: { id: Tab; label: string; icon: IconName }[];
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  const activeIndex = tabs.findIndex((t) => t.id === tab);
  const { refs, style } = useSlidingIndicator(activeIndex);
  return (
    <nav className="desktop-nav" aria-label="Navigasi utama">
      <span
        className="seg-indicator"
        style={{ transform: `translateX(${style.x}px)`, width: style.width }}
        aria-hidden="true"
      />
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={tab === t.id ? "active" : ""}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function BottomNav({
  tabs,
  tab,
  onChange,
}: {
  tabs: { id: Tab; label: string; icon: IconName }[];
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  const activeIndex = tabs.findIndex((t) => t.id === tab);
  const { refs, style } = useSlidingIndicator(activeIndex);
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      <span
        className="nav-indicator"
        style={{ transform: `translateX(${style.x}px)`, width: style.width }}
        aria-hidden="true"
      />
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={tab === t.id ? "active" : ""}
          onClick={() => onChange(t.id)}
        >
          <Icon name={t.icon} size={20} />
          {t.label}
        </button>
      ))}
    </nav>
  );
}

type EditorState =
  | { type: "schedule"; mode: "add" | "edit"; item?: ScheduleItem }
  | { type: "info"; mode: "add" | "edit"; item?: InfoPost }
  | { type: "task"; mode: "add" | "edit"; item?: Task }
  | { type: "article"; mode: "add" | "edit"; item?: Article }
  | null;

// ---------- komponen utama ----------
export default function Dashboard({ initialBoard }: { initialBoard: Board }) {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [tab, setTab] = useState<Tab>("beranda");
  const [dark, setDark] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);
  const [jadwalSubject, setJadwalSubject] = useState("");
  const [infoSubject, setInfoSubject] = useState("");
  const [articleSubject, setArticleSubject] = useState("");
  const [infoCategory, setInfoCategory] = useState("semua");
  const [infoQuery, setInfoQuery] = useState("");
  const [dateKicker, setDateKicker] = useState("");
  const [curatorAuthed, setCuratorAuthed] = useState(false);
  const [curatorName, setCuratorName] = useState("");
  const [opError, setOpError] = useState("");
  const [showPast, setShowPast] = useState(true);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setDateKicker(
      new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        weekday: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date()),
    );
    try {
      setCuratorName(localStorage.getItem("bisdig-curator-name") ?? "");
    } catch {
      /* abaikan */
    }
  }, []);

  // Hitung ulang label countdown tiap menit.
  useEffect(() => {
    const t = window.setInterval(() => setNowTick(Date.now()), 60000);
    return () => window.clearInterval(t);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("bisdig-theme", next ? "dark" : "light");
    } catch {
      /* abaikan */
    }
  }

  async function refreshBoard() {
    const r = await fetch("/api/board");
    if (r.ok) setBoard(await r.json());
  }

  useEffect(() => {
    fetch("/api/curator/me")
      .then((r) => r.json())
      .then((d) => setCuratorAuthed(Boolean(d.loggedIn)))
      .catch(() => undefined);
  }, []);

  async function logout() {
    await fetch("/api/curator/logout", { method: "POST" });
    setCuratorAuthed(false);
  }

  async function remove(collection: string, id: number) {
    setOpError("");
    try {
      const r = await fetch("/api/curator/items", {
        body: JSON.stringify({ collection, id }),
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setOpError(d.error ?? "Gagal menghapus.");
        return;
      }
      refreshBoard();
    } catch {
      setOpError("Gagal menghapus: tidak bisa menghubungi server. Periksa koneksi internet, lalu coba lagi.");
    }
  }

  async function saveItem(collection: string, item: Record<string, unknown>) {
    setOpError("");
    try {
      const r = await fetch("/api/curator/items", {
        body: JSON.stringify({ collection, item }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setOpError(d.error ?? "Gagal menyimpan.");
        return;
      }
      setEditor(null);
      refreshBoard();
    } catch {
      setOpError("Gagal menyimpan: tidak bisa menghubungi server. Periksa koneksi internet, lalu coba lagi.");
    }
  }

  async function updateItem(collection: string, id: number, patch: Record<string, unknown>) {
    setOpError("");
    try {
      const r = await fetch("/api/curator/items", {
        body: JSON.stringify({ collection, id, patch }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setOpError(d.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      setEditor(null);
      refreshBoard();
    } catch {
      setOpError("Gagal menyimpan: tidak bisa menghubungi server. Periksa koneksi internet, lalu coba lagi.");
    }
  }

  const nextClass = useMemo(() => {
    const today = todayJakarta();
    const now = nowTimeJakarta();
    const sorted = [...board.schedule].sort((a, b) =>
      a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date),
    );
    return sorted.find((s) => s.date > today || (s.date === today && s.endTime > now));
  }, [board.schedule]);

  const todayItems = useMemo(
    () =>
      board.schedule
        .filter((s) => s.date === todayJakarta())
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [board.schedule],
  );

  const zoomSoon = useMemo(
    () =>
      board.schedule
        .filter((s) => s.mode === "zoom" && (s.date > todayJakarta() || s.date === todayJakarta()))
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
        .slice(0, 3),
    [board.schedule],
  );

  const tasksSoon = useMemo(
    () =>
      [...board.tasks]
        .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate))
        .slice(0, 3),
    [board.tasks],
  );

  const jadwalFiltered = board.schedule.filter(
    (s) => !jadwalSubject || s.subject === jadwalSubject || displaySubject(s.subject) === displaySubject(jadwalSubject),
  );
  const pastCount = jadwalFiltered.filter(isPastSchedule).length;
  const jadwalVisible = showPast ? jadwalFiltered : jadwalFiltered.filter((s) => !isPastSchedule(s));
  const jadwalByDate = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const s of jadwalVisible) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [jadwalVisible]);

  const infoFiltered = board.info.filter((p) => {
    if (infoCategory !== "semua" && p.category !== infoCategory) return false;
    if (infoSubject && p.subject && p.subject !== infoSubject) return false;
    if (infoQuery) {
      const q = infoQuery.toLowerCase();
      if (!(p.title + " " + p.body + " " + p.subject).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const articlesFiltered = board.articles.filter(
    (a) => !articleSubject || a.subject === articleSubject,
  );

  const tabs: { id: Tab; label: string; icon: IconName }[] = [
    { icon: "home", id: "beranda", label: "Beranda" },
    { icon: "calendar", id: "jadwal", label: "Jadwal" },
    { icon: "megaphone", id: "info", label: "Info" },
    { icon: "clipboard", id: "tugas", label: "Tugas" },
    { icon: "book", id: "artikel", label: "Artikel" },
  ];

  const editorTitles: Record<string, string> = {
    article: "Artikel",
    info: "Info",
    schedule: "Jadwal",
    task: "Tugas",
  };

  return (
    <div className="container">
      <div className="topbar">
        <span className="date-kicker">{dateKicker}</span>
        <div className="top-actions">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={dark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
            title={dark ? "Tema terang" : "Tema gelap"}
          >
            <Icon name={dark ? "sun" : "moon"} />
          </button>
          {curatorAuthed ? (
            <>
              <button
                className="curator-pill"
                onClick={() => setLoginOpen(true)}
                title="Panel kurator"
              >
                <Icon name="login" size={14} />
                {curatorName || "Kurator"}
              </button>
              <button className="btn secondary small" onClick={logout}>
                Keluar
              </button>
            </>
          ) : (
            <button
              className="icon-btn dark-solid"
              onClick={() => setLoginOpen(true)}
              aria-label="Login Kurator"
              title="Login Kurator"
            >
              <Icon name="login" />
            </button>
          )}
        </div>
      </div>

      <Hero />

      <DesktopNav tabs={tabs} tab={tab} onChange={setTab} />

      {opError && (
        <p role="alert" style={{ color: "var(--danger)" }}>
          {opError}
        </p>
      )}

      {tab === "beranda" && (
        <>
          <h2 className="section-title">Kelas Berikutnya</h2>
          {nextClass ? (
            <div className="next-class">
              <span className="chip">
                <span className="live-dot" /> {countdownLabel(nextClass, nowTick)}
              </span>{" "}
              <span className="chip">{dateLabel(nextClass.date)}</span>{" "}
              <span className="chip">
                {nextClass.mode === "zoom" ? "Zoom" : "Kelas reguler"}
              </span>
              <h3>{displaySubject(nextClass.subject)}</h3>
              <p>
                {dateLabel(nextClass.date)} · {nextClass.startTime}–{nextClass.endTime} WIB
              </p>
              <p>
                Dosen:{" "}
                {nextClass.lecturer
                  .split(";")
                  .map((l, i) => `${i + 1}. ${l.trim()}`)
                  .join(" ")}
              </p>
              <p>
                {nextClass.mode === "zoom"
                  ? "Online"
                  : `Ruangan: ${nextClass.location}`}
              </p>
              <ZoomButton item={nextClass} />
              {curatorAuthed && (
                <p style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="btn secondary small"
                    onClick={() => setEditor({ item: nextClass, mode: "edit", type: "schedule" })}
                  >
                    Ubah
                  </button>
                  <ConfirmDeleteButton onConfirm={() => remove("schedule", nextClass.id)} />
                </p>
              )}
            </div>
          ) : (
            <p className="empty">Tidak ada jadwal kelas berikutnya.</p>
          )}

          <h2 className="section-title">Jadwal Hari Ini</h2>
          {todayItems.length === 0 ? (
            <p className="empty">Tidak ada kelas terjadwal hari ini.</p>
          ) : (
            <div className="list">
              {todayItems.map((s) => (
                <ScheduleCard
                  key={s.id}
                  item={s}
                  onDelete={curatorAuthed ? () => remove("schedule", s.id) : undefined}
                  onEdit={curatorAuthed ? () => setEditor({ item: s, mode: "edit", type: "schedule" }) : undefined}
                />
              ))}
            </div>
          )}

          <h2 className="section-title">Jadwal Zoom</h2>
          {zoomSoon.length === 0 ? (
            <p className="empty">Belum ada sesi Zoom terjadwal.</p>
          ) : (
            <div className="list">
              {zoomSoon.map((s) => (
                <ScheduleCard
                  key={s.id}
                  item={s}
                  onDelete={curatorAuthed ? () => remove("schedule", s.id) : undefined}
                  onEdit={curatorAuthed ? () => setEditor({ item: s, mode: "edit", type: "schedule" }) : undefined}
                />
              ))}
            </div>
          )}

          <h2 className="section-title">Deadline Tugas</h2>
          {tasksSoon.length === 0 ? (
            <p className="empty">Belum ada tugas.</p>
          ) : (
            <div className="list">
              {tasksSoon.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onDelete={curatorAuthed ? () => remove("task", t.id) : undefined}
                  onEdit={curatorAuthed ? () => setEditor({ item: t, mode: "edit", type: "task" }) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "jadwal" && (
        <>
          <h2 className="section-title">Jadwal</h2>
          <SubjectDropdown value={jadwalSubject} onChange={setJadwalSubject} label="Filter mata kuliah jadwal" />
          {pastCount > 0 && (
            <p>
              <button className="toggle-past" onClick={() => setShowPast(!showPast)}>
                {showPast
                  ? `Sembunyikan jadwal yang sudah lewat (${pastCount})`
                  : `Tampilkan jadwal yang sudah lewat (${pastCount})`}
              </button>
            </p>
          )}
          {jadwalByDate.length === 0 ? (
            <p className="empty">Tidak ada jadwal untuk filter ini.</p>
          ) : (
            jadwalByDate.map(([date, items]) => (
              <div key={date}>
                <h3 style={{ margin: "18px 0 10px" }}>{dateLabel(date)}</h3>
                <div className="list">
                  {items.map((s) => (
                    <ScheduleCard
                      key={s.id}
                      item={s}
                      onDelete={curatorAuthed ? () => remove("schedule", s.id) : undefined}
                      onEdit={curatorAuthed ? () => setEditor({ item: s, mode: "edit", type: "schedule" }) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {tab === "info" && (
        <>
          <h2 className="section-title">Pusat Info</h2>
          <div className="search-wrap">
            <Icon name="search" />
            <input
              className="search-input"
              type="search"
              placeholder="Cari info…"
              aria-label="Cari info"
              value={infoQuery}
              onChange={(e) => setInfoQuery(e.target.value)}
            />
            {infoQuery && (
              <button
                className="search-clear"
                onClick={() => setInfoQuery("")}
                aria-label="Bersihkan pencarian"
              >
                ×
              </button>
            )}
          </div>
          <p className="search-hint">Contoh pencarian: “beasiswa”, “CRM”, “KKN”.</p>
          <div className="pill-row" role="tablist" aria-label="Kategori info">
            {["semua", "pengumuman", "jadwal", "tugas", "kegiatan"].map((c) => (
              <button
                key={c}
                className={`pill ${infoCategory === c ? "active" : ""}`}
                onClick={() => setInfoCategory(c)}
              >
                {c === "semua" ? "Semua" : c[0].toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <SubjectDropdown value={infoSubject} onChange={setInfoSubject} label="Filter mata kuliah info" />
          {infoFiltered.length === 0 ? (
            <p className="empty">Tidak ada info yang cocok.</p>
          ) : (
            <div className="list">
              {infoFiltered.map((p) => (
                <InfoCard
                  key={p.id}
                  post={p}
                  onDelete={curatorAuthed ? () => remove("info", p.id) : undefined}
                  onEdit={curatorAuthed ? () => setEditor({ item: p, mode: "edit", type: "info" }) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "tugas" && (
        <>
          <h2 className="section-title">Tugas</h2>
          {board.tasks.length === 0 ? (
            <p className="empty">Belum ada tugas.</p>
          ) : (
            <div className="list">
              {[...board.tasks]
                .sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate))
                .map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onDelete={curatorAuthed ? () => remove("task", t.id) : undefined}
                    onEdit={curatorAuthed ? () => setEditor({ item: t, mode: "edit", type: "task" }) : undefined}
                  />
                ))}
            </div>
          )}
        </>
      )}

      {tab === "artikel" && (
        <>
          <h2 className="section-title">Artikel</h2>
          <SubjectDropdown value={articleSubject} onChange={setArticleSubject} label="Filter mata kuliah artikel" />
          {articlesFiltered.length === 0 ? (
            <p className="empty">Tidak ada artikel untuk filter ini.</p>
          ) : (
            <div className="list">
              {articlesFiltered.map((a) => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  onDelete={curatorAuthed ? () => remove("article", a.id) : undefined}
                  onEdit={curatorAuthed ? () => setEditor({ item: a, mode: "edit", type: "article" }) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {loginOpen && (
        <div className="dialog-backdrop" onClick={() => setLoginOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Kurator">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Kurator</h3>
              <button className="icon-btn" onClick={() => setLoginOpen(false)} aria-label="Tutup">
                <Icon name="x" />
              </button>
            </div>
            <CuratorPanel
              board={board}
              onChanged={refreshBoard}
              authed={curatorAuthed}
              onAuthChange={(v) => {
                setCuratorAuthed(v);
                if (v) {
                  try {
                    setCuratorName(localStorage.getItem("bisdig-curator-name") ?? "");
                  } catch {
                    /* abaikan */
                  }
                }
              }}
              onOpenForm={(type) => setEditor({ mode: "add", type })}
              opError={opError}
              setOpError={setOpError}
            />
            <p className="item-meta" style={{ marginTop: 12 }}>
              Dashboard ini tidak memfasilitasi presensi kelas sama sekali. Presensi tetap lewat
              QR Sevima.
            </p>
          </div>
        </div>
      )}

      {editor && (
        <BottomSheet
          title={`${editor.mode === "add" ? "Tambah" : "Ubah"} ${editorTitles[editor.type]}`}
          onClose={() => setEditor(null)}
        >
          {editor.type === "schedule" && (
            <ScheduleForm
              initial={editor.mode === "edit" ? editor.item : undefined}
              submitLabel={editor.mode === "add" ? "Simpan jadwal" : "Simpan perubahan"}
              onCancel={() => setEditor(null)}
              onSubmit={(v) =>
                editor.mode === "add"
                  ? saveItem("schedule", v)
                  : updateItem("schedule", (editor.item as ScheduleItem).id, v)
              }
            />
          )}
          {editor.type === "info" && (
            <InfoForm
              initial={editor.mode === "edit" ? editor.item : undefined}
              submitLabel={editor.mode === "add" ? "Simpan info" : "Simpan perubahan"}
              onCancel={() => setEditor(null)}
              onSubmit={(v) =>
                editor.mode === "add"
                  ? saveItem("info", v)
                  : updateItem("info", (editor.item as InfoPost).id, v)
              }
            />
          )}
          {editor.type === "task" && (
            <TaskForm
              initial={editor.mode === "edit" ? editor.item : undefined}
              submitLabel={editor.mode === "add" ? "Simpan tugas" : "Simpan perubahan"}
              onCancel={() => setEditor(null)}
              onSubmit={(v) =>
                editor.mode === "add"
                  ? saveItem("task", v)
                  : updateItem("task", (editor.item as Task).id, v)
              }
            />
          )}
          {editor.type === "article" && (
            <ArticleForm
              initial={editor.mode === "edit" ? editor.item : undefined}
              submitLabel={editor.mode === "add" ? "Simpan artikel" : "Simpan perubahan"}
              onCancel={() => setEditor(null)}
              onSubmit={(v) =>
                editor.mode === "add"
                  ? saveItem("article", v)
                  : updateItem("article", (editor.item as Article).id, v)
              }
            />
          )}
        </BottomSheet>
      )}

      <BottomNav tabs={tabs} tab={tab} onChange={setTab} />

      <footer className="footer">Dashboard Informasi Terkurasi • 2026</footer>
    </div>
  );
}
