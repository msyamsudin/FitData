# FitData

Aplikasi web untuk menganalisis dan memvisualisasikan data latihan dari file FIT.

## Fitur

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
