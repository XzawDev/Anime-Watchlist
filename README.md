# 🌌 Anime Universe – Watchlist & Tracker

![Next.js](https://img.shields.io/badge/Next.js-15.4.7-black?style=for-the-badge&logo=next.js)  
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange?style=for-the-badge&logo=firebase)  
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Design-blue?style=for-the-badge&logo=tailwindcss)  
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)  
![Anime](https://img.shields.io/badge/Powered%20by-Jikan%20API-purple?style=for-the-badge&logo=graphql)

✨ Sebuah aplikasi web modern untuk menjelajahi anime, membuat
watchlist, melacak progress episode, dan mengatur profil pribadi.

---

## 📸 Preview

[Preview Screenshot]
(Coming Soon)

---

## 🚀 Fitur Utama

- 🔍 **Cari & Temukan Anime** – Trending, populer, movie top, dan yang akan datang.
- 🎬 **Detail Anime Lengkap** – Score, genre, sinopsis, studio, rating, dan informasi lainnya.
- 📑 **Watchlist Pribadi** – Simpan anime favoritmu dan kelola koleksi pribadi.
- ✅ **Progress Tracker** – Tandai episode yang sudah ditonton, tampilkan persentase progress.
- 👤 **Profil Pengguna** – Ubah username, bio, lokasi, dan genre favorit.
- 🔐 **Autentikasi & Keamanan** – Login dengan Firebase, ganti password, dan kelola akun.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: [Next.js 15+](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth**: [Firebase Firestore](https://firebase.google.com/), Firebase Auth
- **API Data**: [Jikan API](https://jikan.moe/) (MyAnimeList Unofficial API)

---

## 📂 Struktur Halaman Utama

```
anime-Watchlist/
├── app/
│ ├── anime/
│ │ └── [id]/
│ │ └── page.tsx
│ ├── dashboard/
│ │ ├── anime/
│ │ │ └── [id]/
│ │ │ └── page.tsx
│ │ └── page.tsx
│ ├── components/
│ │ ├── AddToWatchlist.tsx
│ │ ├── AnimeCarousel.tsx
│ │ ├── AnimeGrid.tsx
│ │ ├── AuthProvider.tsx
│ │ ├── GenreFilter.tsx
│ │ ├── LoadingSpinner.tsx
│ │ ├── Navbar.tsx
│ │ └── SearchBar.tsx
│ ├── lib/
│ │ ├── firebase.ts
│ │ └── jikan.ts
│ └── page.tsx
├── public/
└── package.json
```

---

## ⚡ Cara Menjalankan Project

1. **Clone repo ini**

   ```bash
   git clone https://github.com/username/anime-watchlist.git
   cd anime-watchlist
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi Firebase**

   - Buat project Firebase baru
   - Tambahkan file `.env.local` di root project dengan konfigurasi:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. **Jalankan server development**

   ```bash
   npm run dev
   ```

5. Buka di browser:
   ```
   http://localhost:3000
   ```

---

## 👩🏻‍💼 Kenapa Saya Membuat Project Ini

Saya membuat project Anime Universe – Watchlist & Tracker sebagai media pembelajaran pribadi. Ada beberapa alasan utama mengapa project ini saya kerjakan:

📡 Belajar API – Saya ingin memahami bagaimana cara mengambil data dari API publik (Jikan API), mengolah response JSON, dan menampilkannya dalam aplikasi web.

⚛️ Mendalami Next.js & React – Project ini menjadi sarana saya untuk mengeksplorasi Next.js (App Router), routing dinamis, serta konsep server & client components.

📘 Mengenal TypeScript (TSX) – Dengan menggunakan TypeScript, saya belajar menulis kode yang lebih terstruktur, aman, dan mudah dikelola.

🔐 Eksperimen dengan Firebase – Saya ingin mengetahui bagaimana autentikasi dan database real-time bekerja dalam aplikasi modern.

🎨 Meningkatkan kemampuan UI/UX – Saya memanfaatkan TailwindCSS dan animasi untuk membuat antarmuka yang menarik dan interaktif.

🌍 Lebih mengenal dunia teknologi – Melalui project ini, saya bisa memahami alur kerja pengembangan aplikasi web modern, mulai dari frontend, backend, hingga integrasi layanan pihak ketiga.

🤖 Pemanfaatan AI – Dalam proses pengembangan project ini, saya juga memanfaatkan bantuan AI untuk memberikan ide, membantu penulisan kode, dan menyusun dokumentasi agar lebih terstruktur.

---

> Dibuat dengan ❤️ dan ☕ oleh XzawDev untuk penggemar anime.
