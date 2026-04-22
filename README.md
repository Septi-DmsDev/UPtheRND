# UPtheRND

UPtheRND adalah starter project Next.js + Python worker untuk enhancement gambar yang ramah VPS kecil. Project ini memakai pola **web + worker + shared storage** supaya UI tetap responsif saat job diproses di background.

## Yang sudah dibuat

- Next.js App Router untuk upload, halaman hasil, polling status, dan download file.
- Route handler yang menulis job ke shared storage.
- Python worker dengan file-based queue dan satu job diproses dalam satu waktu.
- `docker-compose.yml` yang siap dipakai di Coolify atau Docker Compose biasa.
- Strategi rendering yang lebih rapi:
  - halaman utama dan halaman hasil membaca data langsung dari storage pada server side
  - client component hanya dipakai untuk upload, polling status, dan before/after slider
  - tidak ada double-fetch untuk initial render

## Struktur utama

```text
UPtheRND/
├── apps/
│   ├── web/
│   └── worker/
├── external/
│   └── Real-ESRGAN/
├── scripts/
├── storage/
├── .env.example
├── docker-compose.yml
└── README.md
```

## Quick start

1. Salin env:

```bash
cp .env.example .env
```

2. Jalankan compose:

```bash
docker compose up --build
```

3. Buka aplikasi di `http://localhost:3000`.

## Cara kerja data flow

1. User upload gambar ke `POST /api/jobs`.
2. Web menyimpan file input ke `UPLOADS_DIR`.
3. Web membuat file job JSON ke `JOBS_DIR` dengan status `queued`.
4. Worker membaca antrean, mengunci job, lalu memprosesnya.
5. Hasil disimpan ke `OUTPUTS_DIR` dan job di-update menjadi `done` atau `failed`.
6. Halaman hasil melakukan polling ringan hanya saat job belum selesai.

## Mode engine

Secara default worker memakai `UPSCALE_PROVIDER=auto`:

- jika wrapper Real-ESRGAN tersedia dan repo resmi sudah dipasang di `external/Real-ESRGAN`, worker akan mencoba engine tersebut lebih dulu
- jika belum siap, worker otomatis fallback ke pipeline Pillow (`Lanczos + UnsharpMask`) agar deploy tetap stabil

Ini sengaja dibuat supaya:

- project bisa langsung deploy di VPS CPU kecil
- integrasi Real-ESRGAN bisa diaktifkan bertahap tanpa memblokir launch awal

## Menyalakan Real-ESRGAN resmi

### Opsi cepat

```bash
./scripts/bootstrap-realesrgan.sh
```

Script ini akan clone repo resmi ke `external/Real-ESRGAN`.

### Dependency AI opsional

Jika kamu ingin image worker ikut meng-install dependency AI tambahan, set build arg berikut sebelum build:

```bash
INSTALL_AI_DEPS=1 docker compose build worker
```

File `apps/worker/requirements.ai.txt` sengaja dipisah supaya build default tetap ringan.

## Variabel penting

- `UPLOADS_DIR`, `OUTPUTS_DIR`, `JOBS_DIR`: lokasi shared storage.
- `MAX_UPLOAD_MB`: limit upload dari web.
- `UPSCALE_PROVIDER`: `auto`, `realesrgan`, atau `pillow`.
- `WORKER_POLL_INTERVAL_SECONDS`: jeda polling worker ke antrean.
- `REALESRGAN_REPO_DIR`: lokasi repo Real-ESRGAN resmi.

## Catatan deploy Coolify

- pakai **Docker Compose** resource, bukan Nixpacks.
- mount persistent storage untuk uploads, outputs, dan jobs jika ingin data tetap aman antar redeploy.
- worker tidak perlu domain publik.
- concurrency worker tetap 1 supaya stabil pada VPS 2 vCPU / 8 GB RAM.

## File tambahan yang penting

- `scripts/create-storage.sh` untuk menyiapkan folder storage lokal.
- `apps/worker/engine/realesrgan_wrapper.py` untuk menjembatani worker ke repo Real-ESRGAN resmi.
