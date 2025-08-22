// lib/anilist-queries.ts
export const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
          color
        }
        bannerImage
        description
        season
        seasonYear
        type
        format
        status
        episodes
        duration
        chapters
        volumes
        genres
        isAdult
        averageScore
        popularity
        studios {
          edges {
            node {
              id
              name
            }
          }
        }
        source
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const TRENDING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
          color
        }
        bannerImage
        description
        season
        seasonYear
        type
        format
        status
        episodes
        duration
        genres
        averageScore
        popularity
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const POPULAR_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
          color
        }
        bannerImage
        description
        season
        seasonYear
        type
        format
        status
        episodes
        duration
        genres
        averageScore
        popularity
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const ANIME_BY_MAL_ID_QUERY = `
  query ($idMal: Int) {
    Media(idMal: $idMal, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        extraLarge
        color
      }
      bannerImage
      description
      season
      seasonYear
      type
      format
      status
      episodes
      duration
      chapters
      volumes
      genres
      isAdult
      averageScore
      popularity
      studios {
        edges {
          node {
            id
            name
          }
        }
      }
      source
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      relations {
        edges {
          relationType
          node {
            id
            idMal
            title {
              romaji
              english
              native
            }
            type
            format
            status
            episodes
            duration
            chapters
            volumes
            coverImage {
              large
            }
            bannerImage
            averageScore
          }
        }
      }
    }
  }
`;

export const ANIME_BY_ID_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        large
        extraLarge
        color
      }
      bannerImage
      description
      season
      seasonYear
      type
      format
      status
      episodes
      duration
      chapters
      volumes
      genres
      isAdult
      averageScore
      popularity
      studios {
        edges {
          node {
            id
            name
          }
        }
      }
      source
      nextAiringEpisode {
        airingAt
        timeUntilAiring
        episode
      }
      relations {
        edges {
          relationType
          node {
            id
            idMal
            title {
              romaji
              english
              native
            }
            type
            format
            status
            episodes
            duration
            chapters
            volumes
            coverImage {
              large
            }
            bannerImage
            averageScore
          }
        }
      }
    }
  }
`;

export const ANIME_BY_GENRE_QUERY = `
  query ($genre: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
          color
        }
        bannerImage
        description
        season
        seasonYear
        type
        format
        status
        episodes
        duration
        genres
        averageScore
        popularity
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const TOP_MOVIES_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME, format: MOVIE, sort: SCORE_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
          color
        }
        bannerImage
        description
        season
        seasonYear
        type
        format
        status
        episodes
        duration
        genres
        averageScore
        popularity
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const UPCOMING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
          color
        }
        bannerImage
        description
        season
        seasonYear
        type
        format
        status
        episodes
        duration
        genres
        averageScore
        popularity
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

export const GENRES_QUERY = `
  query {
    GenreCollection
  }
`;
