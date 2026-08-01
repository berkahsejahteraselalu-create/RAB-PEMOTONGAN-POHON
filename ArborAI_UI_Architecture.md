---
title: Arbor-AI Neo-Bento UI/UX Overhaul
date: 2026-08-01
tags: [ui, ux, design-system, neo-bento, css-grid, glassmorphism, arbor-ai]
---

# Arbor-AI Neo-Bento UI/UX Architecture

Dokumen ini mencatat seluruh arsitektur desain, pembaruan UI/UX, dan logika kode yang diterapkan pada perombakan besar "Neo-Bento" untuk aplikasi Arbor-AI.

## 1. Konsep Desain Utama (Neo-Bento)
Desain aplikasi telah dirombak dari *layout dashboard* tradisional menjadi sistem **Neo-Bento Grid**.
- **Karakteristik:** Menampilkan informasi secara padat dan terstruktur layaknya kotak bento (makanan Jepang) dengan menggunakan `CSS Grid` asimetris.
- **Glassmorphism:** Navigasi atas (Floating Nav) menggunakan efek kaca transparan (`backdrop-filter: blur(12px)`) untuk kesan futuristik dan modern ala macOS/iOS.
- **Tipografi Data:** Menggunakan kombinasi font **Fira Sans** (untuk teks antarmuka) dan **Fira Code** (khusus untuk angka, metrik, tabel, dan ID data) yang memperkuat nuansa analitik data (_developer/data science_).

## 2. Sistem Tema Ganda (Dual-Theme)
Aplikasi kini sepenuhnya mendukung transisi mulus antara Mode Gelap (OLED) dan Mode Terang (Light).

### Mode Gelap (OLED Dark Mode) - *Default*
- **Background:** Deep Slate (`#020617`) - Menghemat daya layar OLED dan mengurangi silau.
- **Surface (Kartu):** Slate (`#0F172A`) dengan efek `box-shadow` berpendar hijau (Glow).
- **Aksen:** Neon Green (`#22C55E`).

### Mode Terang (Light Mode)
- **Background:** Putih keabuan (`#F8FAFC`).
- **Surface (Kartu):** Putih bersih (`#FFFFFF`) dengan bayangan abu-abu lembut.
- **Aksen:** Emerald Green (`#16A34A`) - Lebih gelap agar menjaga visibilitas dan kontras.

> **Interaksi Tema:** Perubahan tema akan tertransisi secara mulus selama `250ms` tanpa kejutan visual. Data preferensi tema disimpan pada `localStorage` (`arborTheme`).

## 3. Struktur `index.html`
- **Navigasi Melayang (Floating Nav):** Menu diletakkan di `nav.bento-nav` di bagian atas. Sidebar dihilangkan. Tombol toggle tema dikembalikan.
- **Bento Dashboard (`.bento-dashboard-grid`):** Menggunakan pola *grid* dengan definisi area seperti:
  - `.bento-kpi-cluster` (Kolom kecil penampung kartu metrik).
  - `.chart-main` & `.chart-side` (Wadah Chart.js).
- **Iconography:** Seluruh ikon *FontAwesome* telah diganti ke **Phosphor Icons** yang lebih elegan (contoh: `ph-circle-notch spin` pada _loading submit_ login).

## 4. Logika Antarmuka (`app.js`)
- **Bug Fix Login:** Memperbaiki status visibilitas _login overlay_ dengan menambahkan kelas `.hidden { display: none !important; }` yang tadinya terhapus saat refaktor.
- **Sinkronisasi Chart.js:**
  Konfigurasi Chart.js ditulis ulang agar merespon perubahan tema. Saat tombol tema di-klik, *grid*, teks legenda, dan garis pembatas pada Grafik Donat (Tindakan) dan Grafik Pie (Kondisi) secara otomatis memuat variabel warna `window.chartBorderColor` dan merender ulang grafiknya (`reRender = true`).

## 5. Pedoman Ekspansi (Untuk Developer Berikutnya)
- **Menambahkan Modul Baru:** Jangan merusak Bento Grid! Tambahkan elemen baru ke dalam kelas `.bento-card` dan berikan pengaturan kolom seperti `grid-column: span 1` atau `span 2`.
- **CSS Transitions:** Gunakan selalu variabel `var(--transition-normal)` untuk perubahan warna, dan `var(--transition-fast)` untuk interaksi _hover_ (misalnya transform `scale`). Selalu patuhi standar mikro-interaksi *Emil Kowalski* (desain responsif saat diklik/disentuh).
