---
title: Arbor-AI Neo-Bento UI/UX Architecture
date: 2026-08-01
tags: [ui, ux, design-system, neo-bento, css-grid, glassmorphism, arbor-ai, mobile-responsive, data-persistence]
---

# Arbor-AI Neo-Bento UI/UX Architecture

Dokumen ini mencatat seluruh arsitektur desain, pembaruan UI/UX, optimasi layar HP/Android, serta perbaikan sistem penyimpanan permanen (*data persistence*) pada perombakan "Neo-Bento" untuk aplikasi Arbor-AI.

## 1. Konsep Desain Utama (Neo-Bento)
Desain aplikasi telah dirombak dari *layout dashboard* tradisional menjadi sistem **Neo-Bento Grid**.
- **Karakteristik:** Menampilkan informasi secara padat dan terstruktur layaknya kotak bento (makanan Jepang) dengan menggunakan `CSS Grid` asimetris.
- **Glassmorphism:** Navigasi atas (Floating Nav) menggunakan efek kaca transparan (`backdrop-filter: blur(12px)`) untuk kesan futuristik dan modern ala macOS/iOS.
- **Tipografi Data:** Menggunakan kombinasi font **Fira Sans** (teks antarmuka) dan **Fira Code** (khusus angka, metrik, tabel, dan ID data) yang memperkuat nuansa analitik data (_developer/data science_).

## 2. Sistem Tema Ganda (Dual-Theme)
Aplikasi sepenuhnya mendukung transisi mulus antara Mode Gelap (OLED) dan Mode Terang (Light).

### Mode Gelap (OLED Dark Mode) - *Default*
- **Background:** Deep Slate (`#020617`) - Menghemat daya layar OLED dan mengurangi silau.
- **Surface (Kartu):** Slate (`#0F172A`) dengan efek `box-shadow` berpendar hijau (Glow).
- **Aksen:** Neon Green (`#22C55E`).

### Mode Terang (Light Mode)
- **Background:** Putih keabuan (`#F8FAFC`).
- **Surface (Kartu):** Putih bersih (`#FFFFFF`) dengan bayangan abu-abu lembut.
- **Aksen:** Emerald Green (`#16A34A`) - Lebih gelap agar menjaga visibilitas dan kontras.

> **Interaksi Tema:** Perubahan tema tertransisi secara mulus selama `250ms`. Preferensi disimpan pada `localStorage` (`arborTheme`).

## 3. Optimasi Responsif Smartphone (Android & iOS)
Pembaruan khusus untuk memastikan tampilan nyaman dan ergonomis di layar HP (`<768px` dan `<480px`):
- **Horizontal Scrollable Pills:** Menu navigasi melayang berubah menjadi kapsul yang dapat di-swipe secara horizontal pada layar mobile, menghemat ruang tinggi layar hingga 40%.
- **KPI 2x2 Grid:** 4 kartu metrik utama diubah dari tumpukan panjang ke bawah menjadi format grid 2x2 yang ringkas.
- **Pencegahan Auto-Zoom Mobile:** Seluruh elemen input form menggunakan font minimum 16px (`1rem`) dan ukuran target sentuh `min-height: 44px` sesuai pedoman Touch Target Google Android.
- **Padding Kompak:** Padding kontainer dipangkas menjadi 12px pada HP untuk memaksimalkan area baca tabel data.

## 4. Sistem Penyimpanan Permanen Data Multi-Tenant (`app.js`)
Perbaikan kritis pada fungsi penyimpan data `saveToLocal()` dan pembaca data `checkAuthSession()`:
- **Superadmin Multi-Tenant Mapping:** `saveToLocal()` kini secara otomatis memetakan dan menyimpan data ke namespace `localStorage` masing-masing akun (`arborSurveyData_admin`, `arborSurveyData_guest1` s/d `guest4`).
- **Konsistensi Refresh & Relogin:** Saat halaman di-refresh atau pengguna melakukan logout & login kembali, data tidak akan hilang karena aplikasi memuat kembali data dari `localStorage` secara otomatis sebelum tabel dan dashboard di-render.

## 5. Struktur File Utama
- `index.html`: Layout Bento Grid & Navigasi Kapsul.
- `style.css`: Variabel token tema ganda, CSS Grid, media queries mobile.
- `app.js`: Logika state multi-tenant, penanganan login/session, rendering Chart.js dinamis.
- `ArborAI_UI_Architecture.md`: Dokumen arsitektur ini (format Obsidian).

## 6. Pedoman Ekspansi (Untuk Developer Berikutnya)
- **Menambahkan Modul Baru:** Selalu bungkus komponen baru dalam `.bento-card` dan tentukan span kolom (`grid-column: span 1` / `span 2`).
- **CSS Transitions:** Gunakan variabel `var(--transition-normal)` untuk perubahan warna, dan `var(--transition-fast)` untuk mikro-interaksi tombol.
