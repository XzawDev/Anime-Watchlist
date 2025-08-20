import { getAnimeById } from "../../lib/jikan";
import AddToWatchlist from "../../components/AddToWatchlist";
import { Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await getAnimeById(parseInt(id));

  // Handle case where anime is not found
  if (!anime) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-white">
      {/* Background Banner */}
      <div className="absolute inset-0">
        <Image
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          fill
          priority
          className="object-cover opacity-20 blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Poster */}
          <div className="w-full md:w-1/3">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]">
              <Image
                src={anime.images.jpg.large_image_url}
                alt={anime.title}
                width={400}
                height={600}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="mt-6 flex justify-center">
              <AddToWatchlist anime={anime} large />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {anime.title}
            </h1>
            {anime.title_japanese && (
              <h2 className="text-xl text-zinc-400 mb-8 italic">
                {anime.title_japanese}
              </h2>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/50 px-4 py-1.5 text-sm font-medium text-amber-400 hover:shadow-[0_0_12px_rgba(251,191,36,0.6)] transition">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {anime.score || "N/A"}
              </div>
              <div className="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm text-sky-300 hover:shadow-[0_0_12px_rgba(56,189,248,0.6)] transition">
                {anime.type}
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300 hover:shadow-[0_0_12px_rgba(52,211,153,0.6)] transition">
                {anime.episodes || "?"} episodes
              </div>
              <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 hover:shadow-[0_0_12px_rgba(167,139,250,0.6)] transition">
                {anime.status}
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-indigo-300">
                Synopsis
              </h3>
              <p className="text-lg leading-relaxed text-zinc-300 max-w-3xl">
                {anime.synopsis || "No synopsis available."}
              </p>
            </div>

            {/* Information + Genres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300">
                  Information
                </h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>
                    <span className="font-medium text-white">Aired:</span>{" "}
                    {anime.aired?.string || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium text-white">Premiered:</span>{" "}
                    {anime.season} {anime.year}
                  </li>
                  <li>
                    <span className="font-medium text-white">Studio:</span>{" "}
                    {anime.studios?.[0]?.name || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium text-white">Source:</span>{" "}
                    {anime.source}
                  </li>
                  <li>
                    <span className="font-medium text-white">Rating:</span>{" "}
                    {anime.rating}
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <span
                      key={genre.mal_id}
                      className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs text-pink-200 hover:shadow-[0_0_8px_rgba(236,72,153,0.6)] transition"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
