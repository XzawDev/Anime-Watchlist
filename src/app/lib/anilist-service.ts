// lib/anilist-service.ts
import {
  SEARCH_ANIME_QUERY,
  TRENDING_ANIME_QUERY,
  POPULAR_ANIME_QUERY,
  ANIME_BY_ID_QUERY,
  ANIME_BY_MAL_ID_QUERY,
  ANIME_BY_GENRE_QUERY,
  TOP_MOVIES_QUERY,
  UPCOMING_ANIME_QUERY,
  GENRES_QUERY,
} from "./anilist-queries";

// Define interfaces for the data structures
interface AniListMedia {
  id: number;
  title?: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    large?: string;
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
  studios?: {
    edges?: Array<{
      node: {
        id: number;
        name: string;
      };
    }>;
  };
  source?: string;
  isAdult?: boolean;
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  };
}

interface StudioEdge {
  node: {
    id: number;
    name: string;
  };
}

interface AnimeForEpisodeCount {
  status?: string;
  nextAiringEpisode?: {
    episode: number;
  };
  episodes?: number;
}

// Helper function to make GraphQL requests with retry logic
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const anilistRequest = async (
  query: string,
  variables: Record<string, unknown> = {},
  retries = 2
) => {
  // Create a cache key
  const cacheKey = JSON.stringify({ query, variables });

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Attempt ${attempt} for query:`,
        query,
        "with variables:",
        variables
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // For 404 responses, don't log as an error since it's expected behavior
        if (response.status === 404) {
          console.log(
            "Anime not found for query:",
            query,
            "with variables:",
            variables
          );
          return { data: null };
        }

        console.error(
          `HTTP error! status: ${response.status} for query:`,
          query
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error("AniList API errors:", data.errors);
        return { data: null };
      }

      // Cache the successful response
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      // Don't log timeout errors as they're expected in some cases
      if (error instanceof Error && error.name === "AbortError") {
        console.log(`Request timed out on attempt ${attempt}`);
      } else {
        console.error(`Attempt ${attempt} failed:`, error);
      }

      if (attempt === retries) {
        console.error("All retry attempts failed");
        return { data: null };
      }

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Map AniList media to our Anime interface
const mapToAnimeInterface = (media: AniListMedia) => {
  return {
    id: media.id,
    title: {
      romaji: media.title?.romaji,
      english: media.title?.english,
      native: media.title?.native,
    },
    coverImage: {
      large: media.coverImage?.large,
      extraLarge: media.coverImage?.extraLarge,
      color: media.coverImage?.color,
    },
    bannerImage: media.bannerImage,
    description: media.description,
    averageScore: media.averageScore,
    episodes: media.episodes,
    format: media.format,
    status: media.status,
    season: media.season,
    seasonYear: media.seasonYear,
    genres: media.genres,
    studios:
      media.studios?.edges?.map((edge: StudioEdge) => ({
        id: edge.node.id,
        name: edge.node.name,
      })) || [],
    source: media.source,
    isAdult: media.isAdult,
    nextAiringEpisode: media.nextAiringEpisode
      ? {
          episode: media.nextAiringEpisode.episode,
          airingAt: media.nextAiringEpisode.airingAt,
          timeUntilAiring: media.nextAiringEpisode.timeUntilAiring,
        }
      : undefined,
  };
};

export const getAnimeByAnilistId = async (id: number) => {
  try {
    const data = await anilistRequest(ANIME_BY_ID_QUERY, {
      id: id,
    });

    if (data.data && data.data.Media) {
      return mapToAnimeInterface(data.data.Media);
    }

    return null;
  } catch (error) {
    console.error("Error fetching anime by AniList ID:", id, error);
    return null;
  }
};

export const searchAnimeByTitle = async (title: string) => {
  try {
    const data = await anilistRequest(SEARCH_ANIME_QUERY, {
      search: title,
      page: 1,
      perPage: 1,
    });

    if (data.data && data.data.Page.media.length > 0) {
      return mapToAnimeInterface(data.data.Page.media[0]);
    }

    return null;
  } catch (error) {
    console.error("Error searching anime by title:", title, error);
    return null;
  }
};

// Search anime
export const searchAnime = async (
  query: string,
  page: number = 1,
  perPage: number = 20
) => {
  try {
    const data = await anilistRequest(SEARCH_ANIME_QUERY, {
      search: query,
      page,
      perPage,
    });

    if (data.data && data.data.Page.media) {
      return data.data.Page.media.map(mapToAnimeInterface);
    }

    return [];
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
};

// Get trending anime
export const getTrendingAnime = async (
  page: number = 1,
  perPage: number = 12
) => {
  try {
    const data = await anilistRequest(TRENDING_ANIME_QUERY, {
      page,
      perPage,
    });

    if (data.data && data.data.Page.media) {
      return data.data.Page.media.map(mapToAnimeInterface);
    }

    return [];
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    return [];
  }
};

// Get popular anime
export const getPopularAnime = async (
  page: number = 1,
  perPage: number = 12
) => {
  try {
    const data = await anilistRequest(POPULAR_ANIME_QUERY, {
      page,
      perPage,
    });

    if (data.data && data.data.Page.media) {
      return data.data.Page.media.map(mapToAnimeInterface);
    }

    return [];
  } catch (error) {
    console.error("Error fetching popular anime:", error);
    return [];
  }
};

// Get anime by ID
export const getAnimeById = async (id: number) => {
  try {
    console.log("Fetching anime with ID:", id);

    // First try to find by AniList ID
    let data = await anilistRequest(ANIME_BY_ID_QUERY, {
      id: id,
    });

    // If not found, try to find by MyAnimeList ID
    if (!data.data || !data.data.Media) {
      console.log("Trying to find by MAL ID:", id);
      data = await anilistRequest(ANIME_BY_MAL_ID_QUERY, {
        idMal: id,
      });
    }

    if (!data.data || !data.data.Media) {
      console.warn("No media found for ID (tried both AniList and MAL):", id);
      return null;
    }

    return mapToAnimeInterface(data.data.Media);
  } catch (error) {
    console.error("Error fetching anime by ID:", id, error);
    return null;
  }
};

// Get anime by genre
export const getAnimeByGenre = async (
  genre: string,
  page: number = 1,
  perPage: number = 20
) => {
  try {
    const data = await anilistRequest(ANIME_BY_GENRE_QUERY, {
      genre,
      page,
      perPage,
    });

    if (data.data && data.data.Page.media) {
      return data.data.Page.media.map(mapToAnimeInterface);
    }

    return [];
  } catch (error) {
    console.error("Error fetching anime by genre:", error);
    return [];
  }
};

// Get top movies
export const getTopMovies = async (page: number = 1, perPage: number = 10) => {
  try {
    const data = await anilistRequest(TOP_MOVIES_QUERY, {
      page,
      perPage,
    });

    if (data.data && data.data.Page.media) {
      return data.data.Page.media.map(mapToAnimeInterface);
    }

    return [];
  } catch (error) {
    console.error("Error fetching top movies:", error);
    return [];
  }
};

// Get upcoming anime
export const getUpcomingAnime = async (
  page: number = 1,
  perPage: number = 12
) => {
  try {
    const data = await anilistRequest(UPCOMING_ANIME_QUERY, {
      page,
      perPage,
    });

    if (data.data && data.data.Page.media) {
      return data.data.Page.media.map(mapToAnimeInterface);
    }

    return [];
  } catch (error) {
    console.error("Error fetching upcoming anime:", error);
    return [];
  }
};

// Get genres
export const getGenres = async () => {
  try {
    const data = await anilistRequest(GENRES_QUERY);

    if (data.data && data.data.GenreCollection) {
      return data.data.GenreCollection.map((genre: string, index: number) => ({
        id: index,
        name: genre,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

// Get released episodes count
export const getReleasedEpisodesCount = async (
  anime: AnimeForEpisodeCount
): Promise<number> => {
  try {
    // If the anime is not currently airing, return the total episodes
    if (anime.status !== "RELEASING" || !anime.nextAiringEpisode) {
      return anime.episodes || 0;
    }

    // For currently airing anime, the next episode number minus one gives us the count of released episodes
    return anime.nextAiringEpisode.episode - 1;
  } catch (error) {
    console.error("Error calculating released episodes:", error);
    return anime.episodes || 0;
  }
};

// Define the AiringSchedule interface
interface AiringSchedule {
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
}

export const getAiringSchedule = async (
  animeId: number
): Promise<AiringSchedule[] | null> => {
  try {
    const AIRING_SCHEDULE_QUERY = `
      query ($animeId: Int) {
        Media(id: $animeId) {
          id
          airingSchedule {
            nodes {
              episode
              airingAt
              timeUntilAiring
            }
          }
        }
      }
    `;

    const data = await anilistRequest(AIRING_SCHEDULE_QUERY, {
      animeId: animeId,
    });

    if (data.data && data.data.Media && data.data.Media.airingSchedule) {
      return data.data.Media.airingSchedule.nodes;
    }

    return null;
  } catch (error) {
    console.error("Error fetching airing schedule:", error);
    return null;
  }
};
