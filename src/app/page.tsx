import { Suspense } from "react";
import SearchBar from "./components/SearchBar";
import AnimeGrid from "./components/AnimeGrid";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopMovies,
  getUpcomingAnime,
  getGenres,
} from "./lib/jikan";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import GenreFilter from "./components/GenreFilter";
import AnimeCarousel from "./components/AnimeCarousel";
import Link from "next/link";
import Image from "next/image";

// Add proper type definitions
interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
      small_image_url: string;
    };
  };
  score: number;
  episodes: number;
  type: string;
  status: string;
  aired?: {
    from?: string;
    to?: string;
    string?: string;
  };
  season?: string;
  year?: number;
  synopsis?: string;
  rating?: string;
  studios?: Array<{
    mal_id: number;
    name: string;
  }>;
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
  source?: string;
}

interface Genre {
  mal_id: number;
  name: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || "";
  const genreFilter = resolvedSearchParams?.genre || "";

  const [trendingAnime, popularAnime, topMovies, upcomingAnime, genres] =
    await Promise.all([
      getTrendingAnime(),
      getPopularAnime(),
      getTopMovies(),
      getUpcomingAnime(),
      getGenres(),
    ]);

  const filteredGenres = genres.filter(
    (genre: Genre) => !["Hentai", "Ecchi", "Erotica"].includes(genre.name)
  );

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(1200px_800px_at_80%_-20%,#1a1f2e_0%,#0b0f1a_35%,#05070d_80%)] text-zinc-100">
      {/* Background elements */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(2000px_500px_at_50%_-10%,black,transparent)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:100%_32px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_100%]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <Navbar />
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
                    Anime Universe
                  </span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-zinc-300/90">
                  Discover, search, and track your favorite anime in one place.
                </p>
              </div>
              <div className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 shadow-inner">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live data powered by Jikan</span>
              </div>
            </div>

            {/* Search Area */}
            <div className="mt-6">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-2 shadow-inner">
                <SearchBar />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-10 py-8">
            <Suspense
              fallback={
                <div className="py-20">
                  <LoadingSpinner />
                </div>
              }
            >
              {query || genreFilter ? (
                <AnimeGrid query={query} genre={genreFilter} />
              ) : (
                <>
                  {/* Trending Anime Section */}
                  <AnimeSection
                    title="Trending Now"
                    animeList={trendingAnime}
                    count={trendingAnime.length}
                    className="mb-12"
                  />

                  {/* Popular Anime Carousel */}
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
                        Most Popular
                      </h2>
                      <div className="text-xs text-zinc-400">
                        All-time favorites
                      </div>
                    </div>
                    <AnimeCarousel animeList={popularAnime} />
                  </div>

                  {/* Top Movies Carousel */}
                  <div className="mb-12">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
                        Top Anime Movies
                      </h2>
                      <div className="text-xs text-zinc-400">
                        Highest rated films
                      </div>
                    </div>
                    <AnimeCarousel animeList={topMovies} />
                  </div>

                  {/* Genre Filter Section */}
                  <div className="mb-12">
                    <GenreFilter
                      genres={filteredGenres}
                      selectedGenre={genreFilter}
                    />
                  </div>

                  {/* Upcoming Anime Section */}
                  {upcomingAnime.length > 0 && (
                    <AnimeSection
                      title="Coming Soon"
                      animeList={upcomingAnime}
                      count={upcomingAnime.length}
                    />
                  )}
                </>
              )}
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}

// Anime Section Component
const AnimeSection = ({
  title,
  animeList,
  count,
  className = "",
}: {
  title: string;
  animeList: Anime[];
  count: number;
  className?: string;
}) => {
  return (
    <div className={className}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
          <span className="align-middle">{title}</span>
          <span
            aria-hidden
            className="ml-2 align-middle inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold text-zinc-300"
          >
            {count}
          </span>
        </h2>
        <div className="text-xs text-zinc-400">Updated recently</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {animeList.map((anime: Anime) => (
          <AnimeCardSip key={anime.mal_id} anime={anime} />
        ))}
      </div>
    </div>
  );
};

// Enhanced Anime Card Component with navigation
const AnimeCardSip = ({ anime }: { anime: Anime }) => {
  const title = anime.title ?? "Untitled";
  const score = anime.score ?? "N/A";
  const eps = anime.episodes ?? "?";
  const imageUrl = anime?.images?.jpg?.image_url;
  const startDate = anime.aired?.from
    ? new Date(anime.aired.from).getFullYear()
    : null;

  return (
    <Link href={`/anime/${anime.mal_id}`} className="block group">
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
          {startDate && (
            <div className="absolute left-2 bottom-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-700 px-2 py-1 text-[11px] font-medium text-white">
              {startDate}
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
            {anime.type && (
              <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5">
                {anime.type}
              </span>
            )}
            {startDate && <span>{startDate}</span>}
            {anime.status && <span className="truncate">• {anime.status}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
};
