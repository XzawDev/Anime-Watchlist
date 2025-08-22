import { getAnimeById } from "../../lib/anilist-service";
import AddToWatchlist from "../../components/AddToWatchlist";
import { formatSynopsis } from "../../lib/utils";
import { Star, Calendar, Users, Film, Award, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";

// Define the Anime interface based on AniList structure
// Update the Anime interface in page.tsx
interface Anime {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage: {
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
  studios?: Array<{
    id: number;
    name: string;
  }>;
  source?: string;
  isAdult?: boolean;
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  };
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check if id is undefined or not a number
  if (!id || isNaN(parseInt(id))) {
    console.error("Invalid ID parameter:", id);
    notFound();
  }

  const anime = await getAnimeById(parseInt(id));

  // Handle case where anime is not found
  if (!anime) {
    notFound();
  }

  // Format studio names
  const studioNames =
    anime.studios
      ?.map((studio: { id: number; name: string }) => studio.name)
      .join(", ") || "Unknown";

  // Get the display title
  const displayTitle =
    anime.title.english ||
    anime.title.romaji ||
    anime.title.native ||
    "Unknown Title";

  // Get the Japanese title if available
  const japaneseTitle =
    anime.title.native && anime.title.native !== displayTitle
      ? anime.title.native
      : null;

  // Format the airing information for display
  const formatAiringInfo = (anime: Anime) => {
    if (anime.status === "RELEASING") {
      return "Currently Airing";
    } else if (anime.status === "FINISHED") {
      return "Completed";
    } else if (anime.status === "NOT_YET_RELEASED") {
      return "Upcoming";
    } else if (anime.status === "CANCELLED") {
      return "Cancelled";
    } else if (anime.status === "HIATUS") {
      return "On Hiatus";
    }
    return anime.status || "Unknown";
  };

  // Format the rating based on isAdult
  const formatRating = (isAdult?: boolean) => {
    return isAdult ? "R+" : "PG";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] text-white overflow-hidden">
      {/* Background with gradient overlay and subtle pattern */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-indigo-900/20 to-black/70"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-16">
        {/* Header with back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Browse
          </Link>
        </div>

        {/* Hero section with banner image */}
        <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-purple-900/20">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10"></div>

          {anime.bannerImage && (
            <Image
              src={anime.bannerImage}
              alt={displayTitle}
              width={1200}
              height={400}
              className="w-full h-[400px] object-cover"
              priority
            />
          )}

          <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 drop-shadow-xl">
              {displayTitle}
            </h1>
            {japaneseTitle && (
              <h2 className="text-xl md:text-2xl text-purple-200 font-medium mb-4 drop-shadow-md">
                {japaneseTitle}
              </h2>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-300">
                  {anime.averageScore || "N/A"}
                </span>
              </div>

              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-indigo-500/30 text-indigo-300">
                {anime.format || "Unknown"}
              </div>

              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-emerald-500/30 text-emerald-300">
                {anime.episodes || "?"} episodes
              </div>

              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-pink-500/30 text-pink-300">
                {formatAiringInfo(anime)}
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - poster and actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-purple-900/10 mb-6 transform transition-transform hover:scale-[1.02]">
                <Image
                  src={anime.coverImage.large || "/placeholder-cover.jpg"}
                  alt={displayTitle}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-md border border-white/10 p-6">
                <AddToWatchlist anime={anime} large />

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <span className="text-zinc-300">
                      {anime.season && anime.seasonYear
                        ? `${anime.season} ${anime.seasonYear}`
                        : "Airing information not available"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Film className="h-5 w-5 text-purple-400" />
                    <span className="text-zinc-300">
                      Source: {anime.source || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span className="text-zinc-300">Studio: {studioNames}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-5 w-5 text-purple-400" />
                    <span className="text-zinc-300">
                      Rating: {formatRating(anime.isAdult)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - details */}
          <div className="lg:col-span-2">
            {/* Synopsis */}
            <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-md border border-white/10 p-6 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                Synopsis
              </h3>
              <p className="text-lg leading-relaxed text-zinc-300 whitespace-pre-line">
                {anime.description
                  ? formatSynopsis(anime.description)
                  : "No synopsis available."}
              </p>
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-md border border-white/10 p-6 mb-8">
                <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-3">
                  {anime.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-md border border-white/10 p-6">
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-purple-300">
                    Broadcast
                  </h4>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {formatAiringInfo(anime)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Episodes:</span>
                      {anime.episodes || "Unknown"}
                    </li>
                    {anime.season && anime.seasonYear && (
                      <li className="flex items-center gap-2">
                        <span className="font-medium">Aired:</span>
                        {`${anime.season} ${anime.seasonYear}`}
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-purple-300">
                    Production
                  </h4>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Studios:</span>
                      {studioNames}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Source:</span>
                      {anime.source || "Unknown"}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="font-medium">Format:</span>
                      {anime.format || "Unknown"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/30 to-transparent -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-full h-96 bg-gradient-to-t from-indigo-900/30 to-transparent -z-10 pointer-events-none"></div>
    </div>
  );
}
