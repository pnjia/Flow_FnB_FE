---
description: Melakukan pengelompokan komit yang logis dan dorong (push) ke Git
---

# Workflow Git Add, Commit, & Push

Gunakan workflow ini kapan pun pengguna meminta untuk melakukan komit dan push ke repositori Git. Workflow ini memastikan bahwa setiap komit dikelompokkan secara terstruktur berdasarkan fitur atau perubahannya, serta menggunakan pesan komit berbahasa Indonesia yang jelas.

1. **Jalankan Git Status**
   Pertama, periksa file-file apa saja yang berubah, ditambahkan, atau dihapus di dalam proyek. Bergantung pada perubahan, cobalah untuk memisah-misahkannya ke dalam beberapa komit logis yang lebih kecil dan terfokus (jangan menumpuk semuanya di dalam satu pesan komit).

   ```bash
   git status
   ```

2. **Kelompokkan Perubahan Secara Logis**
   Berdasarkan hasil `git status`, pelajari file-file tersebut dan kelompokkan berdasarkan fitur atau konteks perubahannya.
   - _Contoh Kelompok 1:_ Penambahan dan Pembaruan Dokumen Knowledge Base & Aturan Sistem (`.agents/`).
   - _Contoh Kelompok 2:_ Perubahan Struktur State Global Zustand (`src/store/index.ts`, `src/types/index.ts`).
   - _Contoh Kelompok 3:_ UI Components / shadcn-ui (`src/components/ui/`).
   - _Contoh Kelompok 4:_ Halaman Fitur Spesifik (`src/app/pos/`, `src/app/menu/`).

3. **Lakukan Add dan Commit per Kelompok**
   Untuk setiap kelompok yang sudah dirancang, operasikan perintah penambahan dan komit menggunakan perintah terminal. Pastikan pesan komit ditulis menggunakan Bahasa Indonesia berdasarkan standar **Conventional Commits** (seperti `fitur:`, `perbaikan:`, `infrastruktur:`, `docs:`).
   Contoh format:

   ```bash
   git add src/app/pos/page.tsx
   git commit -m "fitur(pos): implementasi flow validasi pramusaji ke order KDS"
   ```

4. **Verifikasi Sisa Perubahan**
   Kembali periksa `git status` dan ulangi Langkah 3 sampai seluruh file proyek yang sesuai dikomit ke repositori lokal. Hindari penggunaan satu `git add .` dan satu komit raksasa jika ada banyak fungsionalitas yang tidak terkait.

5. **Dorong (Push) Perubahan**
   Setelah dipastikan tidak ada sisa komit tertinggal, dorong (push) seluruh komit tersebut ke dalam branch _remote_. Sesuaikan branch dengan perintah spesifik di pangkalan proyek atau biarkan standar.
   // turbo
   ```bash
   git push origin HEAD
   ```
