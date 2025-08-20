import "server-only";

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

interface Pagination {
  last_visible_page: number;
  has_next_page: boolean;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

interface JikanApiResponse {
  data: Anime[];
  pagination: Pagination;
}

interface JikanSingleResponse {
  data: Anime;
}

// Add a delay function to handle rate limiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to fetch with retry logic
const fetchWithRetry = async (url: string, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
      });

      if (res.status === 429) {
        // If we're on the last retry, throw an error
        if (i === retries - 1) {
          throw new Error("Rate limited after retries");
        }
        await delay(delayMs * (i + 1));
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs * (i + 1));
    }
  }
};

export const getAnimeSearch = async (query: string): Promise<Anime[]> => {
  try {
    const data: JikanApiResponse = await fetchWithRetry(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
        query
      )}&limit=20&order_by=popularity`
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching anime search:", error);
    return [];
  }
};

export const getAnimeById = async (id: number): Promise<Anime | null> => {
  try {
    const data: JikanSingleResponse = await fetchWithRetry(
      `https://api.jikan.moe/v4/anime/${id}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching anime by ID:", error);
    return null;
  }
};

export const getTrendingAnime = async (): Promise<Anime[]> => {
  try {
    const data: JikanApiResponse = await fetchWithRetry(
      "https://api.jikan.moe/v4/top/anime?filter=airing&limit=12"
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    return [];
  }
};

export const getPopularAnime = async (): Promise<Anime[]> => {
  try {
    const data: JikanApiResponse = await fetchWithRetry(
      "https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12"
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching popular anime:", error);
    return [];
  }
};

export const getTopMovies = async (): Promise<Anime[]> => {
  try {
    const data: JikanApiResponse = await fetchWithRetry(
      "https://api.jikan.moe/v4/top/anime?type=movie&limit=12"
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching top movies:", error);
    return [];
  }
};

export const getUpcomingAnime = async (): Promise<Anime[]> => {
  try {
    // Use the season endpoint instead, as it's more reliable
    const currentYear = new Date().getFullYear();
    const nextSeason = getNextSeason();

    const data: JikanApiResponse = await fetchWithRetry(
      `https://api.jikan.moe/v4/seasons/${currentYear}/${nextSeason}?limit=12`
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching upcoming anime:", error);
    return [];
  }
};

// Helper function to determine next season
const getNextSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return "spring"; // Jan-Mar -> Spring (Apr-Jun)
  if (month >= 3 && month <= 5) return "summer"; // Apr-Jun -> Summer (Jul-Sep)
  if (month >= 6 && month <= 8) return "fall"; // Jul-Sep -> Fall (Oct-Dec)
  return "winter"; // Oct-Dec -> Winter (Jan-Mar)
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const data: { data: Genre[] } = await fetchWithRetry(
      "https://api.jikan.moe/v4/genres/anime"
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    // Return a basic set of genres as fallback
    return [
      { mal_id: 1, name: "Action" },
      { mal_id: 2, name: "Adventure" },
      { mal_id: 4, name: "Comedy" },
      { mal_id: 8, name: "Drama" },
      { mal_id: 10, name: "Fantasy" },
      { mal_id: 22, name: "Romance" },
      { mal_id: 23, name: "School" },
      { mal_id: 24, name: "Sci-Fi" },
      { mal_id: 27, name: "Shounen" },
      { mal_id: 30, name: "Sports" },
      { mal_id: 36, name: "Slice of Life" },
      { mal_id: 37, name: "Supernatural" },
    ];
  }
};

export const getAnimeByGenre = async (genreId: string): Promise<Anime[]> => {
  try {
    const data: JikanApiResponse = await fetchWithRetry(
      `https://api.jikan.moe/v4/anime?genres=${genreId}&limit=20&order_by=popularity`
    );
    return data.data || [];
  } catch (error) {
    console.error("Error fetching anime by genre:", error);
    return [];
  }
};
