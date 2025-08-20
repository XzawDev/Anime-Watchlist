🌌 Anime Universe – Watchlist & Tracker

![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)  
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?style=for-the-badge&logo=firebase)  
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Design-blue?style=for-the-badge&logo=tailwindcss)  
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)  
![Anime](https://img.shields.io/badge/Powered%20by-Jikan%20API-purple?style=for-the-badge&logo=graphql)

✨ Sebuah aplikasi web modern untuk menjelajahi anime, membuat
watchlist, melacak progress episode, dan mengatur profil pribadi.

---

📸 Preview

[Preview Screenshot]
(Tambahkan screenshot aplikasi di sini)

---

🚀 Fitur Utama

- 🔍 Cari & Temukan Anime – Trending, populer, movie top, dan yang
  akan datang.
- 🎬 Detail Anime Lengkap – Score, genre, sinopsis, studio, rating,
  dan informasi lainnya.
- 📑 Watchlist Pribadi – Simpan anime favoritmu dan kelola koleksi
  pribadi.
- ✅ Progress Tracker – Tandai episode yang sudah ditonton, tampilkan
  persentase progress.
- 👤 Profil Pengguna – Ubah username, bio, lokasi, dan genre favorit.
- 🔐 Autentikasi & Keamanan – Login dengan Firebase, ganti password,
  dan kelola akun.

---

🛠️ Teknologi yang Digunakan

- Frontend: Next.js 13+, React, TypeScript
- Styling: TailwindCSS, Framer Motion
- Backend & Auth: Firebase Firestore, Firebase Auth
- API Data: Jikan API (MyAnimeList Unofficial API)

---

📂 Struktur Halaman Utama

- / → Halaman utama (Trending, Popular, Top Movies, Upcoming, Filter
  Genre)
- /dashboard → Watchlist pengguna
- /dashboard/anime/:id → Detail anime dalam watchlist + progress
  episode
- /profile → Pengaturan profil & akun
- /login → Halaman autentikasi

---

⚡ Cara Menjalankan Project

1.  Clone repo ini

        git clone https://github.com/username/anime-watchlist.git
        cd anime-watchlist

2.  Install dependencies

        npm install

3.  Konfigurasi Firebase

    - Buat project Firebase baru

    - Tambahkan file .env.local di root project dengan konfigurasi:

          NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
          NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
          NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

4.  Jalankan server development

        npm run dev

5.  Buka di browser:

        http://localhost:3000

---

🌟 Roadmap / To-Do

- ☐ Tambah dark/light mode toggle
- ☐ Fitur rekomendasi anime berdasarkan genre favorit
- ☐ Integrasi login via Google / GitHub
- ☐ Export/Import watchlist

---

🤝 Kontribusi

Kontribusi sangat terbuka! Silakan fork repo ini, buat branch baru, dan
ajukan Pull Request.

---

📜 Lisensi

MIT License © 2025 Anime Universe

---

Dibuat dengan ❤️ oleh penggemar anime untuk penggemar anime.
