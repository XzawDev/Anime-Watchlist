// components/AnimeGrid.tsx
import { getAnimeSearch, getAnimeByGenre } from "../lib/jikan";
import AnimeCard from "../components/AnimeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Suspense } from "react";

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  // Add other properties you use from the API response
}

export default async function AnimeGrid({
  query,
  genre,
}: {
  query: string;
  genre?: string;
}) {
  let animeList: Anime[] = [];

  if (query) {
    animeList = await getAnimeSearch(query);
  } else if (genre) {
    animeList = await getAnimeByGenre(genre);
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-zinc-100">
        <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent">
          {query ? `Search Results for "${query}"` : "Browse by Genre"}
        </span>
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
          <Suspense
            fallback={
              <div className="col-span-full flex justify-center py-10">
                <LoadingSpinner />
              </div>
            }
          >
            {animeList.map((anime: Anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </Suspense>
        </div>
      )}
    </div>
  );
}
