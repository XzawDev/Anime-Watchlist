import { Suspense } from "react";
import SearchBar from "./components/SearchBar";
import AnimeGrid from "./components/AnimeGrid";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopMovies,
  getUpcomingAnime,
  getGenres,
} from "./lib/anilist-service";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import GenreFilter from "./components/GenreFilter";
import AnimeCarousel from "./components/AnimeCarousel";
import AnimeCardSip from "./components/AnimeCardSip";

// Add proper type definitions for AniList data
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
  description?: string;
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

interface Genre {
  id: number;
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

  // Filter out adult genres
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
                <span>Live data powered by AniList</span>
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
                  {/* Genre Filter Section */}
                  <div className="mb-12">
                    <GenreFilter
                      genres={filteredGenres}
                      selectedGenre={genreFilter}
                    />
                  </div>

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
          <AnimeCardSip key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
};
