// components/GenreFilter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Genre {
  id: number;
  name: string;
}

const GenreFilter = ({
  genres,
  selectedGenre,
}: {
  genres: Genre[];
  selectedGenre: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGenreClick = (genreName: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedGenre === genreName) {
      // Remove genre filter if already selected
      params.delete("genre");
    } else {
      // Set the genre filter
      params.set("genre", genreName);
      params.delete("q"); // Clear search query when filtering by genre
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
        <span className="bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-rose-200 bg-clip-text text-transparent mr-2">
          Browse by Genre
        </span>
        <span className="text-xs text-zinc-400 bg-white/5 rounded-full px-2 py-1">
          {genres.length} genres
        </span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.name)}
            className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 ${
              selectedGenre === genre.name
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 border-fuchsia-500/30 text-white shadow-lg shadow-fuchsia-500/20"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreFilter;
