// components/AnimeCard.tsx
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
// import AddToWatchlist from "./AddToWatchlist";

// Define TypeScript interface for the anime object
interface Anime {
  mal_id: number;
  title?: string;
  score?: number | string;
  episodes?: number;
  images?: {
    jpg?: {
      image_url: string;
    };
  };
  synopsis?: string;
  type?: string;
  year?: number;
  status?: string;
}

const AnimeCard = ({ anime }: { anime: Anime }) => {
  const title = anime.title ?? "Untitled";
  const score = anime.score ?? "N/A";
  const eps = anime.episodes ?? "?";
  const imageUrl = anime.images?.jpg?.image_url;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)] transition-transform hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)]">
      <Link href={`/anime/${anime.mal_id}`}>
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              unoptimized // Remove this if you configure external domains in next.config.js
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-900/60 text-zinc-500 text-xs">
              No Image
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Hover synopsis overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[11px] text-zinc-200 line-clamp-3 leading-snug">
              {anime.synopsis || "No synopsis available."}
            </p>
          </div>

          {/* Score badge */}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[11px] font-semibold text-zinc-100 backdrop-blur">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>{score}</span>
          </div>

          {/* Episodes badge */}
          <div className="absolute right-2 top-2 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[11px] font-medium text-zinc-100 backdrop-blur">
            {eps} eps
          </div>
        </div>

        {/* Meta */}
        <div className="relative p-3">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl ring-1 ring-white/10"
          />

          <h3 className="relative z-[1] line-clamp-2 text-sm font-semibold text-zinc-100">
            {title}
          </h3>

          {/* Additional info similar to the Trending Now section */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
            {anime.type && (
              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
                {anime.type}
              </span>
            )}
            {anime.year && <span>{anime.year}</span>}
            {anime.status && <span className="truncate">• {anime.status}</span>}
          </div>
        </div>
      </Link>

      {/* Watchlist button */}
      <div className="absolute top-2 right-2 z-[2]">
        {/* <AddToWatchlist anime={anime} /> */}
      </div>
    </article>
  );
};

export default AnimeCard;
