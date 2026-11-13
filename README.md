# Dashboard Informasi Terkurasi — Prodi S-1 Bisnis Digital, FEB UDS

Dashboard hybrid (dashboard + media info) untuk **semua mahasiswa Bisnis Digital
Universitas dr. Soebandi**, pilot **Semester 5 Angkatan 2024**.

Isinya: jadwal kelas, tugas, pengumuman, kegiatan, dan artikel referensi terkait
bisnis digital — **tanpa scrolling WhatsApp Group lagi.**

> **Bukan presensi.** Dashboard ini **tidak memfasilitasi presensi kelas sama sekali**.
> Presensi tetap lewat QR Sevima (QR-nya dinamis, tidak bisa di-screenshot).
> Tidak ada bridging otomatis Sevima/Edlink. Link Zoom asli dimasukkan kurator
> manual dari grup WA.

## Yang ada di paket ini

- Aplikasi **Next.js (App Router) + TypeScript**, mobile-first, siap deploy ke Vercel.
- Tampilan mengikuti artifact aslinya: latar lavender muda bertitik, teks navy,
  font Inter tebal, hero center tiga baris (Dashboard / Informasi / Terkurasi)
  dengan ikon animasi yang berganti tiap 3 detik, kartu gelap Kelas Berikutnya,
  pil navigasi bawah mengambang (Beranda, Jadwal, Info, Tugas, Artikel),
  toggle tema gelap/terang, login kurator ikon saja.
- Filter mata kuliah di Info, Jadwal, dan Artikel: satu pil dropdown
  "Semua mata kuliah" yang membuka bottom sheet "Pilih Mata Kuliah" (bisa
  di-scroll sampai Teknologi Keuangan).
- Data seed asli dari artifact (live v16, 13 Nov 2026) di `data/`:
  - `schedule.json` — 67 jadwal (64 Sevima 16 Nov 2026–7 Jan 2027 + 3 sesi Zoom
    **CONTOH**; link Zoom contoh adalah **DUMMY** dan tetap ditandai contoh).
  - `info.json` — 3 info (1 asli: Pembayaran KKN TA 2026/2027 Rp1.057.000 via
    Edufin, 16 Nov–16 Des 2026 + 2 contoh).
  - `tasks.json` — 4 tugas (semua contoh).
  - `articles.json` — 10 artikel (semua contoh, termasuk 1 bergambar dan 1 video
    QRIS resmi Bank Indonesia di YouTube).

## Penting: soal simpan data di Vercel

File JSON di Vercel itu **read-only** — aplikasi yang sudah di-deploy **tidak
bisa menulis ke `data/*.json`**. Karena itu paket ini memakai dua mode:

| Mode | Kapan | Yang jalan |
| --- | --- | --- |
| **Seed (tanpa Supabase)** | Env Supabase belum diset | Semua orang bisa membaca jadwal/info/tugas/artikel. Kurator **tidak bisa** tambah/ubah/hapus — tombolnya menampilkan pesan "database belum disiapkan". |
| **Supabase (penuh)** | Env Supabase sudah diset + tabel sudah dibuat + seed sudah diimpor | Semua bisa membaca, kurator bisa tambah/ubah/hapus dan tersimpan untuk semua orang. |

Jadi: deploy tanpa Supabase tetap bisa dipakai baca, tapi kalau kurator mau
mengisi link Zoom asli dan info baru, **Supabase wajib disiapkan** (gratis).

## Yang masih dibutuhkan sebelum deploy

1. **Akun GitHub** (gratis) — untuk menyimpan kode ini.
2. **Akun Vercel** (gratis, daftar pakai akun GitHub) — untuk hosting.
3. **Akun Supabase** (gratis) — untuk database.
4. **Password kurator** — buat sendiri yang panjang dan acak (misal 3 kata + angka).
   Jangan pakai password akun lain. Jangan tulis di repo atau di grup WA.
5. **Nama/domain (opsional)** — kalau belum ada, Vercel memberi alamat gratis
   seperti `dashboard-bisdig.vercel.app`. Domain sendiri bisa dipasang belakangan.

## Langkah deploy (urut, jangan dilompati)

### Langkah 1 — Masukkan kode ini ke GitHub

1. Buka [github.com/new](https://github.com/new), buat repository baru, misal
   `dashboard-bisdig-uds`. Biarkan kosong (jangan centang README).
2. Di komputer, di dalam folder paket ini, jalankan:
   ```bash
   git init
   git add .
   git commit -m "Dashboard Informasi Terkurasi v1"
   git branch -M main
   git remote add origin https://github.com/NAMA-AKUN-GITHUB/dashboard-bisdig-uds.git
   git push -u origin main
   ```
   Ganti `NAMA-AKUN-GITHUB` dengan nama akun GitHub Umar.
3. **Cek:** buka repository di GitHub — file `README.md`, `package.json`, dan
   folder `data/` harus kelihatan. Kalau ada file `.env.local`, **hapus dari
   repo** (file itu tidak boleh ter-upload).

### Langkah 2 — Buat project Supabase + tabel

1. Buka [supabase.com](https://supabase.com), daftar/masuk, klik **New project**.
2. Isi nama project (misal `dashboard-bisdig`), pilih region **Singapore**,
   buat password database (simpan baik-baik, ini bukan password kurator).
3. Tunggu project selesai dibuat (sekitar 1–2 menit).
4. Buka **SQL Editor** → **New query**, tempel seluruh isi file
   `supabase/schema.sql` dari paket ini, klik **Run**.
   **Cek:** 4 tabel terbentuk: `schedule_items`, `info_posts`, `tasks`,
   `articles`. Kalau ada error, baca pesannya — biasanya karena query dijalankan
   dua kali; itu aman, jalankan sekali lagi.
5. Buka **Project Settings → API**, salin:
   - **Project URL** → ini `SUPABASE_URL`
   - **anon public** → ini `SUPABASE_ANON_KEY`
   - **service_role** (klik Reveal) → ini `SUPABASE_SERVICE_ROLE_KEY`.
     Kunci service_role itu rahasia — jangan pernah dibagikan di grup WA.

### Langkah 3 — Isi database Supabase dengan data seed

1. Di komputer, salin `.env.example` menjadi `.env.local`, lalu isi ketiga nilai
   Supabase dari Langkah 2.
2. Jalankan:
   ```bash
   npm install
   npm run seed:supabase
   ```
3. **Cek:** terminal menampilkan `schedule_items: 67 baris tersimpan.`,
   `info_posts: 3 baris tersimpan.`, `tasks: 4 baris tersimpan.`,
   `articles: 10 baris tersimpan.` Lalu buka **Table Editor** di Supabase dan
   lihat isi tabelnya — jadwal Ekonomi Regional 16 Nov 2026 harus ada.

   > **Catatan:** seed memasukkan baris dengan id eksplisit, lalu memanggil
   > fungsi `reset_identity_sequences()` agar urutan id tiap tabel maju ke id
   > terbesar. Bila setup dari nol dan seed menampilkan peringatan bahwa rpc
   > gagal, jalankan potongan SQL `setval` dari akhir file
   > `supabase/schema.sql` di SQL Editor — kalau tidak, tambah data oleh
   > kurator akan gagal "duplicate key".

### Langkah 4 — Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com), masuk dengan akun GitHub.
2. Klik **Add New → Project**, pilih repository `dashboard-bisdig-uds`,
   klik **Import**.
3. Biarkan semua pengaturan apa adanya (Framework Preset: Next.js). **Jangan
   klik Deploy dulu.**
4. Buka bagian **Environment Variables**, isi empat variabel ini (nilai dari
   Langkah 2 dan password kurator buatan Umar):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CURATOR_PASSWORD`
5. Klik **Deploy**. Tunggu sampai muncul "Congratulations" dan alamat
   `https://dashboard-bisdig-uds.vercel.app` (namanya mengikuti nama repo).
6. **Cek:** buka alamat itu dari HP. Hero tiga baris harus center, frasa
   "tanpa scrolling WhatsApp Group lagi." satu baris highlight kuning, dan
   Kelas Berikutnya menampilkan Ekonomi Regional 16 Nov 2026.

### Langkah 5 — Tes dari HP (sebelum disebar)

1. Buka link dari HP Android dan iPhone. Cek: hero center, pil navigasi bawah
   tidak menutupi kartu, dropdown "Pilih Mata Kuliah" bisa di-scroll sampai
   Teknologi Keuangan.
2. Buka tab **Info** — info KKN Rp1.057.000 harus paling atas.
3. Login kurator (ikon di kanan atas) dengan `CURATOR_PASSWORD`. Tambah satu
   jadwal tes, lalu hapus lagi. **Cek:** jadwal tes sempat muncul, dan setelah
   dihapus hilang lagi.
4. Cek 3 link Zoom contoh (id CRM, Web App, Database) — harus tertulis
   **"Contoh — link dummy"** dan **tidak boleh** diklik sebagai Zoom asli.
   Ganti ketiganya dengan link Zoom asli dari grup WA, atau hapus contohnya.

### Langkah 6 — Sebar link ke grup WA Angkatan 2024

1. Kirim link Vercel ke grup WA Angkatan 2024 beserta pesan singkat, contoh:
   > "Info jadwal, tugas, pengumuman, kegiatan, dan artikel Bisnis Digital
   > sekarang ada di satu tempat, tanpa scrolling WhatsApp Group lagi:
   > https://dashboard-bisdig-uds.vercel.app — Kurator: admin prodi."
2. **Jangan** kirim password kurator di grup. Password kurator hanya untuk
   admin prodi / PIC mata kuliah, lewat jalur pribadi.
3. Minta 2–3 mahasiswa mencoba buka dari HP-nya dan melaporkan bila ada yang
   aneh (tampilan, jadwal yang salah, atau link yang tidak bisa dibuka).

## Bersihkan jadwal lama (retensi)

Supaya data tidak menumpuk, jadwal lama dihapus otomatis dengan dua aturan ini:

| Aturan | Yang dihapus |
| --- | --- |
| **Jadwal Sevima, ganti bulan** | Jadwal `origin=sevima` yang tanggalnya sebelum tanggal 1 bulan berjalan DAN sudah lewat. Jadwal bulan berjalan tetap dipertahankan, termasuk yang sudah lewat di bulan yang sama. Jadwal masa depan tidak pernah dihapus. |
| **Jadwal Zoom, lewat 3 hari** | Jadwal `mode=zoom` (origin apa pun) yang tanggalnya sudah lewat lebih dari 3 hari. |

Contoh (hari ini 13 Nov 2026): jadwal Sevima 28 Okt 2026 terhapus (bulan lalu), jadwal Sevima 10 Nov 2026 tetap ada (bulan berjalan, walau sudah lewat), Zoom 9 Nov 2026 terhapus (lewat 4 hari), Zoom 10 Nov 2026 tetap ada (baru lewat 3 hari), dan semua jadwal 14 Nov 2026 ke atas aman.

Yang dihapus hanya `schedule_items`. Info, tugas, dan artikel tidak pernah disentuh. Data seed di `data/*.json` juga tidak diubah — yang dihapus hanya baris di Supabase.

### Otomatis (cron harian, 01:00 WIB)

1. Di Vercel: Project → **Settings → Environment Variables**, tambah `CRON_SECRET` dengan nilai acak yang panjang (misal 32 karakter huruf+angka). Jangan pakai password akun lain.
2. **Redeploy** agar cron aktif (cron dibaca dari `vercel.json` saat deploy).
3. Cron jalan tiap hari 01:00 WIB (18:00 UTC) ke `GET /api/cron/cleanup`. Vercel mengirim header `Authorization: Bearer <CRON_SECRET>` secara otomatis. Hasilnya tercatat di Vercel → **Logs**. Tanpa `CRON_SECRET`, endpoint mengembalikan 503 dan tidak ada yang dihapus.
4. Catatan: paket gratis (Hobby) Vercel hanya mengizinkan cron harian — jadwal sekali sehari di atas sudah sesuai.

### Manual (panel kurator)

1. Buka website, login kurator (ikon di kanan atas).
2. Di panel kurator, bagian **Bersihkan Jadwal Lama**, klik **Lihat jadwal yang akan dihapus** — ini hanya preview, tidak ada yang terhapus.
3. Bila daftarnya sudah benar, klik **Hapus N jadwal** dan konfirmasi. Daftar jadwal ikut diperbarui.
4. Bila masih mode seed (Supabase belum disiapkan), tombolnya menampilkan pesan database belum disiapkan — bersih-bersih tidak bisa jalan di mode seed.

## Menjalankan di komputer sendiri (opsional, untuk tes)

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Tanpa `.env.local`, aplikasi jalan dalam mode
seed (baca saja). Untuk mengetes mode Supabase lokal, isi `.env.local` dulu
lalu jalankan ulang `npm run dev`.

## Mengubah data setelah live

- **Kurator (lewat website):** login kurator → tambah/ubah/hapus jadwal, info,
  tugas, artikel. Perubahan langsung tersimpan di Supabase dan terlihat semua
  mahasiswa.
- **Pengembang (lewat seed):** ubah file di `data/*.json`, lalu jalankan ulang
  `npm run seed:supabase`. Hati-hati: seed menimpa isi tabel dengan isi file.

## Bila ada yang rusak

- **Halaman blank / error 500:** buka Vercel → project → **Deployments** →
  klik deployment terbaru → **Functions / Logs**. Pesan error yang paling
  sering: env var belum diset atau salah ketik. Perbaiki di **Settings →
  Environment Variables**, lalu **Redeploy**.
- **Data lama / kosong:** cek apakah `SUPABASE_URL` benar dan seed sudah
  dijalankan (Langkah 3). Tanpa Supabase, aplikasi otomatis memakai seed JSON.
- **Login kurator selalu gagal:** cek `CURATOR_PASSWORD` di Vercel — harus sama
  persis (perhatikan spasi dan huruf besar/kecil). Setelah mengubah env var,
  **Redeploy** agar berlaku.
- **Link Zoom contoh masih muncul:** hapus 3 jadwal contoh itu lewat panel
  kurator (atau ganti `location`-nya dengan link Zoom asli dari grup WA).
