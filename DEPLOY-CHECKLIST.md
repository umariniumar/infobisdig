# Checklist Deploy — Dashboard Informasi Terkurasi

Centang satu per satu. Jangan sebar link ke grup WA sebelum semua kotak
di bawah ini tercentang.

## Persiapan akun & password

- [ ] Akun GitHub sudah ada
- [ ] Akun Vercel sudah ada (daftar pakai GitHub)
- [ ] Akun Supabase sudah ada
- [ ] Password kurator sudah dibuat (panjang, acak, tidak sama dengan password akun lain)
- [ ] Password kurator TIDAK dibagikan di grup WA

## Kode & repo

- [ ] Kode di `~/workspace/dashboard-vercel-deploy/` sudah dicek (tidak ada password/kunci di dalamnya)
- [ ] Repository GitHub `dashboard-bisdig-uds` sudah dibuat
- [ ] Kode sudah di-push ke GitHub (file README.md, package.json, folder data/ kelihatan)
- [ ] Tidak ada file `.env.local` yang ter-upload ke GitHub

## Supabase

- [ ] Project Supabase dibuat (region Singapore)
- [ ] `supabase/schema.sql` sudah dijalankan — 4 tabel terbentuk
- [ ] `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` sudah disalin
- [ ] `npm run seed:supabase` sudah jalan: 67 jadwal, 3 info, 4 tugas, 10 artikel
- [ ] Isi tabel dicek di Table Editor (jadwal Ekonomi Regional 16 Nov 2026 ada)

## Vercel

- [ ] Project Vercel di-import dari GitHub
- [ ] 4 env var sudah diisi di Vercel: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, CURATOR_PASSWORD
- [ ] Deploy pertama berhasil, alamat `https://....vercel.app` bisa dibuka
- [ ] (Opsional) Domain sendiri sudah dipasang

## Tes dari HP (sebelum disebar)

- [ ] Dibuka dari HP Android — hero center 3 baris, highlight kuning satu baris
- [ ] Dibuka dari iPhone — pil navigasi bawah tidak menutupi kartu
- [ ] Tab Info: info KKN Rp1.057.000 paling atas
- [ ] Dropdown "Pilih Mata Kuliah" bisa di-scroll sampai Teknologi Keuangan (Info, Jadwal, Artikel)
- [ ] Login kurator berhasil; tambah jadwal tes lalu hapus lagi
- [ ] 3 link Zoom contoh dicek: tertulis "Contoh — link dummy" (atau sudah diganti link asli / dihapus)
- [ ] Mode gelap/terang jalan di HP

## Sebar ke Angkatan 2024

- [ ] Link dikirim ke grup WA Angkatan 2024 beserta pesan singkat
- [ ] Password kurator TIDAK ikut dikirim di grup
- [ ] 2–3 mahasiswa sudah mencoba dan melaporkan hasilnya
- [ ] Kurator (admin prodi / PIC) sudah tahu cara mengisi link Zoom asli dan info baru
