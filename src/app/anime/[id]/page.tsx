// src/app/anime/[id]/page.tsx
"use client";

import { getAnimeById } from "../../lib/anilist-service";
import AddToWatchlist from "../../components/AddToWatchlist";
import { useRouter } from "next/navigation";
import { formatSynopsis } from "../../lib/utils";
import {
  Star,
  Calendar,
  Users,
  Film,
  Award,
  ArrowLeft,
  Clock,
  Play,
  Heart,
  Share,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

// Updated Anime interface with additional properties
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
  duration?: number;
  popularity?: number;
  meanScore?: number;
  favourites?: number;
  relations?: {
    edges?: Array<{
      relationType: string;
      node: {
        id: number;
        title: {
          romaji?: string;
          english?: string;
          native?: string;
        };
        format?: string;
        type?: string;
        coverImage: {
          large?: string;
        };
      };
    }>;
  };
  characters?: {
    edges?: Array<{
      role: string;
      node: {
        id: number;
        name: {
          full: string;
        };
        image: {
          large: string;
        };
      };
    }>;
  };
}

export default function AnimeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        // Check if id is undefined or not a number
        if (!id || isNaN(parseInt(id))) {
          console.error("Invalid ID parameter:", id);
          setError("Invalid anime ID");
          setLoading(false);
          return;
        }

        const animeData = await getAnimeById(parseInt(id));

        // Handle case where anime is not found
        if (!animeData) {
          setError("Anime not found");
          setLoading(false);
          return;
        }

        setAnime(animeData);
      } catch (err) {
        console.error("Error fetching anime:", err);
        setError("Failed to load anime data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [id]);

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
    return isAdult ? "R+" : "PG-13";
  };

  // Format duration
  const formatDuration = (duration?: number) => {
    if (!duration) return "Unknown";
    return `${duration} min/ep`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a18] to-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a18] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-300">{error || "Anime not found"}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 mt-6 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-purple-900/30 transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // Calculate score percentage for radial progress
  const scorePercentage = anime.averageScore ? anime.averageScore / 100 : 0;

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

  // Format studio names
  const studioNames =
    anime.studios
      ?.map((studio: { id: number; name: string }) => studio.name)
      .join(", ") || "Unknown";

  // Truncate synopsis
  const truncatedSynopsis = anime.description
    ? anime.description.length > 500
      ? `${anime.description.substring(0, 500)}...`
      : anime.description
    : "No synopsis available.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a18] to-[#0a0a0f] text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-20 opacity-30">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-900/40 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-700/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Background pattern */}
      <div className="fixed inset-0 -z-10 opacity-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-16">
        {/* Header with back button */}
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/anime/");
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-purple-900/30 transition-all duration-300 group shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 hover:bg-purple-900/30 transition-all">
              <Share className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 hover:bg-purple-900/30 transition-all">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero section with banner image */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-purple-500/10 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10"></div>

          {anime.bannerImage ? (
            <Image
              src={anime.bannerImage}
              alt={displayTitle}
              width={1200}
              height={400}
              className="w-full h-[400px] object-cover"
              priority
            />
          ) : (
            <div className="w-full h-[400px] bg-gradient-to-r from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">{displayTitle}</h1>
                <p className="text-purple-200">No banner available</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 drop-shadow-2xl">
              {displayTitle}
            </h1>
            {japaneseTitle && (
              <h2 className="text-xl md:text-2xl text-purple-300 font-medium mb-4 drop-shadow-md">
                {japaneseTitle}
              </h2>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-amber-500/30">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-300">
                  {anime.averageScore || "N/A"}
                </span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-indigo-500/30 text-indigo-300">
                {anime.format || "Unknown"}
              </div>

              <div className="px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-emerald-500/30 text-emerald-300">
                {anime.episodes || "?"} episodes
              </div>

              <div className="px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-pink-500/30 text-pink-300">
                {formatAiringInfo(anime)}
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - poster and actions */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Poster */}
              <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-purple-500/10 transform transition-all hover:scale-[1.02] hover:shadow-purple-500/20">
                <Image
                  src={
                    anime.coverImage.extraLarge ||
                    anime.coverImage.large ||
                    "/placeholder-cover.jpg"
                  }
                  alt={displayTitle}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Action buttons */}
              <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6 space-y-4">
                <AddToWatchlist anime={anime} large />

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/30">
                    <Play className="w-5 h-5" />
                    <span>Trailer</span>
                  </button>

                  <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all">
                    <Heart className="w-5 h-5" />
                    <span>Like</span>
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6">
                <h3 className="text-lg font-bold mb-4 text-purple-300">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  {/* Score with radial progress */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4A5568"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#scoreGradient)"
                          strokeWidth="3"
                          strokeDasharray={`${scorePercentage * 100}, 100`}
                        />
                        <defs>
                          <linearGradient
                            id="scoreGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#9333EA" />
                            <stop offset="100%" stopColor="#7C3AED" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {anime.averageScore || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">Average Score</p>
                      <p className="text-sm text-gray-400">Based on ratings</p>
                    </div>
                  </div>

                  {/* Popularity */}
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium">Popularity</p>
                      <p className="text-gray-400">
                        #{anime.popularity || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Favorites */}
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium">Favorites</p>
                      <p className="text-gray-400">
                        {anime.favourites?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  {anime.duration && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-400">
                          {formatDuration(anime.duration)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-3 text-sm">
                    <Film className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="font-medium">Rating</p>
                      <p className="text-gray-400">
                        {formatRating(anime.isAdult)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - details */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Tab navigation */}
            <div className="flex border-b border-white/10">
              <button
                className={`px-4 py-2 font-medium transition-all ${
                  activeTab === "details"
                    ? "text-purple-300 border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                className={`px-4 py-2 font-medium transition-all ${
                  activeTab === "characters"
                    ? "text-purple-300 border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("characters")}
              >
                Characters
              </button>
              <button
                className={`px-4 py-2 font-medium transition-all ${
                  activeTab === "relations"
                    ? "text-purple-300 border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("relations")}
              >
                Relations
              </button>
            </div>

            {/* Synopsis */}
            <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6">
              <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                Synopsis
              </h3>
              <p className="text-lg leading-relaxed text-gray-300 whitespace-pre-line">
                {showFullSynopsis
                  ? formatSynopsis(
                      anime.description || "No synopsis available."
                    )
                  : formatSynopsis(truncatedSynopsis)}
              </p>
              {anime.description && anime.description.length > 500 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="mt-4 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showFullSynopsis ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Read more
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6">
                <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-3">
                  {anime.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/70 to-pink-600/70 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 border border-white/10"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Broadcast info */}
                <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6">
                  <h3 className="text-xl font-bold mb-4 text-purple-300 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Broadcast
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="font-medium">
                        {formatAiringInfo(anime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Episodes:</span>
                      <span className="font-medium">
                        {anime.episodes || "Unknown"}
                      </span>
                    </div>
                    {anime.season && anime.seasonYear && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Aired:</span>
                        <span className="font-medium">{`${anime.season} ${anime.seasonYear}`}</span>
                      </div>
                    )}
                    {anime.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-medium">
                          {formatDuration(anime.duration)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Production info */}
                <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6">
                  <h3 className="text-xl font-bold mb-4 text-purple-300 flex items-center gap-2">
                    <Film className="h-5 w-5" />
                    Production
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Studios:</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {studioNames}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Source:</span>
                      <span className="font-medium">
                        {anime.source || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Format:</span>
                      <span className="font-medium">
                        {anime.format || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating:</span>
                      <span className="font-medium">
                        {formatRating(anime.isAdult)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next airing episode (if applicable) */}
            {anime.nextAiringEpisode && (
              <div className="rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-md border border-white/10 p-6">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Next Episode
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      Episode {anime.nextAiringEpisode.episode}
                    </p>
                    <p className="text-gray-300">
                      Airing in{" "}
                      {Math.floor(
                        anime.nextAiringEpisode.timeUntilAiring / 86400
                      )}{" "}
                      days
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                    <Clock className="h-5 w-5 inline mr-2" />
                    <span>
                      {new Date(
                        anime.nextAiringEpisode.airingAt * 1000
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations/Related Anime */}
            {anime.relations?.edges && anime.relations.edges.length > 0 && (
              <div className="rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 p-6">
                <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                  Related Anime
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {anime.relations.edges.slice(0, 4).map((relation, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden bg-black/40 border border-white/10 transition-transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      <div className="relative h-40">
                        <Image
                          src={
                            relation.node.coverImage.large ||
                            "/placeholder-cover.jpg"
                          }
                          alt={relation.node.title.romaji || "Related anime"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-xs text-purple-300 font-semibold">
                            {relation.relationType.replace(/_/g, " ")}
                          </p>
                          <p className="text-sm font-medium truncate">
                            {relation.node.title.romaji}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating action button for mobile */}
      <div className="fixed bottom-6 right-6 z-30 lg:hidden">
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg hover:shadow-purple-500/40 transition-all">
          <Play className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
