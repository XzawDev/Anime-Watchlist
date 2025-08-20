// components/GenreFilter.tsx
"use client";

import { useRouter } from "next/navigation";

// Define TypeScript interface for the genre object
interface Genre {
  mal_id: number;
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

  const handleGenreClick = (genreId: string) => {
    if (selectedGenre === genreId) {
      router.push("/");
    } else {
      router.push(`/?genre=${genreId}`);
    }
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
            key={genre.mal_id}
            onClick={() => handleGenreClick(genre.mal_id.toString())}
            className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 ${
              selectedGenre === genre.mal_id.toString()
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
