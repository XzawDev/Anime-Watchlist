"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import AnimeCard from "./AnimeCard";

// Define TypeScript interface for the anime object
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

const AnimeCarousel = ({ animeList }: { animeList: Anime[] }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;

      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
      setScrollPosition(newPosition);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = carouselRef.current
    ? scrollPosition <
      carouselRef.current.scrollWidth - carouselRef.current.clientWidth
    : false;

  return (
    <div className="relative">
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {animeList.map((anime, index) => (
          <div
            key={anime.id || `anime-${index}`}
            className="flex-shrink-0 w-48 sm:w-56 md:w-64"
          >
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white backdrop-blur transition-all hover:bg-fuchsia-700/80"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white backdrop-blur transition-all hover:bg-fuchsia-700/80"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default AnimeCarousel;
