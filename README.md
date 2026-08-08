# ZNN Anime

Web streaming anime subtitle Indonesia berbasis Next.js dan endpoint OtakuDesu di `api.znn.my.id`.

## Endpoint yang dipakai

- `/otakudesu-ongoing?page=1`
- `/otakudesu-completed?page=1`
- `/otakudesu?q=judul`
- `/otakudesu-get?url=<anime-endpoint>`
- `/otakudesu-stream?endpoint=<episode-endpoint>`

Browser tidak perlu API key upstream. Web hanya memakai API ZNN.

## Jalankan lokal

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Deploy Vercel

Import project ke Vercel lalu isi Environment Variable:

```text
ZNN_API_BASE=https://api.znn.my.id
```

Deploy. Tidak perlu server tambahan.

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
