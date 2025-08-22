// components/AnimeGrid.tsx
import { searchAnime, getAnimeByGenre } from "../lib/anilist-service";
import AnimeCard from "../components/AnimeCard";
import LoadingSpinner from "../components/LoadingSpinner";

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

export default async function AnimeGrid({
  query,
  genre,
}: {
  query: string;
  genre?: string;
}) {
  let animeList: Anime[] = [];

  try {
    if (query) {
      animeList = await searchAnime(query);
    } else if (genre) {
      animeList = await getAnimeByGenre(genre);
    }
  } catch (error) {
    console.error("Error fetching anime:", error);
    return (
      <div className="mt-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-zinc-100">
          <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
            {query ? `Search Results for "${query}"` : `Genre: ${genre}`}
          </span>
        </h2>
        <div className="text-center py-16 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md shadow-inner">
          <p className="text-zinc-400">
            Error loading anime for{" "}
            <span className="text-zinc-200 font-medium">
              &quot;{query || genre}&quot;
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-zinc-100">
        <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
          {query
            ? `Search Results for "${query}"`
            : genre
            ? `Genre: ${genre}`
            : "Browse Anime"}
        </span>
        {animeList.length > 0 && (
          <span className="ml-2 text-sm text-zinc-400">
            ({animeList.length} results)
          </span>
        )}
      </h2>

      {animeList.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md shadow-inner">
          <p className="text-zinc-400">
            No anime found for{" "}
            <span className="text-zinc-200 font-medium">
              &quot;{query || genre}&quot;
            </span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {animeList.map((anime: Anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
