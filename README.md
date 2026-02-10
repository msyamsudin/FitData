# FitData

Aplikasi web untuk menganalisis dan memvisualisasikan data latihan dari file FIT.

## Fitur

<img width="2400" height="2256" alt="fitdata-trends-twitter-post-2026-02-08" src="https://github.com/user-attachments/assets/6a8ba675-cf5d-4b6b-80e6-9cefff5ccb76" />

- Upload dan parsing file FIT
- Dashboard metrik dengan visualisasi zone training
- Perbandingan sesi latihan (power, heart rate, cadence, speed)
- Tracking FTP dan analisis intensitas
- Analisis performa dengan TSS, IF, dan EF
- Chart interaktif dengan toggle metrik

## Teknologi

- React + Vite
- Recharts untuk visualisasi
- fit-file-parser untuk parsing FIT
- Tailwind CSS untuk styling

## Instalasi

```bash
npm install
```

## Menjalankan Aplikasi

```bash
npm run dev
```

Atau gunakan file batch:
```bash
run_app.bat
```

## Struktur Data FIT

Aplikasi mendukung data dari file FIT yang berisi:
- Records: power, heart rate, cadence, speed, distance
- Sessions: ringkasan latihan
- Laps: segmen latihan

## Konfigurasi FTP

FTP dapat dikonfigurasi melalui settings untuk perhitungan zone power yang akurat.


## Konfigurasi Heart Rate Zones

Aplikasi mendukung dua metode perhitungan zona detak jantung (Heart Rate):

1.  **Standard (Max HR)**:
    -   Dihitung berdasarkan usia pengguna (Rumus: `220 - Usia`).
    -   Zona ditentukan sebagai persentase dari Max HR.

2.  **Karvonen (Heart Rate Reserve)**:
    -   Mempertimbangkan Resting Heart Rate (RHR).
    -   Rumus: `Target HR = ((Max HR - Resting HR) × %Intensity) + Resting HR`.
    -   Lebih akurat untuk individu dengan tingkat kebugaran yang bervariasi.

Fitur tambahan:
-   **Zone Info**: Klik tombol (i) di header untuk melihat rentang BPM spesifik untuk setiap zona dan manfaat fisiologisnya (misal: "Endurance & Fat Burn").
-   **Visualisasi Zona**: Aktifkan "Show Zones" pada chart untuk melihat overlay warna zona beserta legendanya.