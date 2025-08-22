import Link from "next/link";
import Image from "next/image";

interface Anime {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage: {
    large: string;
    extraLarge?: string;
    color?: string;
  };
  bannerImage?: string;
  averageScore?: number;
  episodes?: number;
  format?: string;
  status?: string;
  season?: string;
  seasonYear?: number;
  genres?: string[];
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  };
}

// Enhanced Anime Card Component with navigation
export default function AnimeCardSip({ anime }: { anime: Anime }) {
  // Add null/undefined checks for all properties
  if (!anime) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)] h-full">
        <div className="aspect-[2/3] w-full bg-zinc-800/50 flex items-center justify-center">
          <span className="text-zinc-500 text-sm">No data</span>
        </div>
      </div>
    );
  }

  const title =
    anime.title.english ||
    anime.title.romaji ||
    anime.title.native ||
    "Untitled";
  const score = anime.averageScore || "N/A";
  const eps = anime.episodes ?? "?";
  const imageUrl = anime.coverImage?.large;
  const year = anime.seasonYear;

  return (
    <Link href={`/anime/${anime.id}`} className="block group">
      <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)] hover:border-fuchsia-500/30 h-full">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-fuchsia-500/0 to-rose-500/0 group-hover:from-indigo-500/5 group-hover:via-fuchsia-500/5 group-hover:to-rose-500/5 transition-all duration-500" />

        {/* Shine effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.1) 55%, transparent 70%)",
            maskImage:
              "radial-gradient(120%_60% at 0% 0%, black 40%, transparent 70%)",
          }}
        />

        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900/60 text-zinc-500 text-xs">
              No Image
            </div>
          )}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Score badge */}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-white/15 bg-black/70 px-2 py-1 text-[11px] font-semibold text-zinc-100 backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>{score}</span>
          </div>

          {/* Episodes badge */}
          <div className="absolute right-2 top-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[11px] font-medium text-zinc-100 backdrop-blur">
            {eps} eps
          </div>

          {/* Date badge for upcoming anime */}
          {year && (
            <div className="absolute left-2 bottom-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-700 px-2 py-1 text-[11px] font-medium text-white">
              {year}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="relative p-3">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl ring-1 ring-white/10"
          />

          <h3 className="relative z-[1] line-clamp-2 text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
            {title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
            {anime.format && (
              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
                {anime.format}
              </span>
            )}
            {year && <span>{year}</span>}
            {anime.status && <span className="truncate">• {anime.status}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
