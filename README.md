# ZNN Anime

Web streaming anime subtitle Indonesia berbasis Next.js dan endpoint OtakuDesu di `api.znn.my.id`.

## Endpoint yang dipakai

- `/otakudesu-ongoing?page=1`
- `/otakudesu-completed?page=1`
- `/otakudesu?q=judul`
- `/otakudesu-get?url=<anime-endpoint>`
- `/otakudesu-stream?endpoint=<episode-endpoint>`

Semua request API ZNN dilakukan dari server Next.js. `ZNN_ACCESS_TOKEN` tidak dikirim ke browser.

## Jalankan lokal

```bash
cp .env.example .env.local
npm install
npm run dev
```

Isi `.env.local`:

```env
ZNN_API_BASE=https://api.znn.my.id
ZNN_ACCESS_TOKEN=znn_vcl_token_project_ini
```

Buka `http://localhost:3000`.

## Deploy ke Vercel

1. Import repository ke Vercel.
2. Framework Preset: **Next.js**.
3. Tambahkan Environment Variables:

```env
ZNN_API_BASE=https://api.znn.my.id
ZNN_ACCESS_TOKEN=znn_vcl_token_project_ini
```

Gunakan satu token Vercel khusus untuk project Animestream dari **admin.znn.my.id → IP Whitelist → Token Vercel**.

Aktifkan variable minimal untuk **Production**. Kalau Preview Deployment juga dipakai, aktifkan untuk **Preview**.

Setelah menambah atau mengganti token, lakukan **Redeploy**.

Alur request:

```text
Browser
  -> Next.js di Vercel
  -> X-ZNN-Access: ZNN_ACCESS_TOKEN
  -> api.znn.my.id
```

Jangan memakai nama `NEXT_PUBLIC_ZNN_ACCESS_TOKEN` dan jangan menaruh token di komponen client.

## Fitur

- Home ongoing + completed
- Search
- Detail + sinopsis + info anime
- Daftar episode
- Player dari `/otakudesu-stream`
- Prev / next episode
- Favorit localStorage
- Continue watching localStorage
- Responsive mobile / desktop
