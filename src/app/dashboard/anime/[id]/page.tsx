"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatSynopsis } from "../../../lib/utils";
import { Star, ChevronLeft, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../../../components/LoadingSpinner";
import EpisodeDialog from "../../../components/EpisodeDialog";
import { getAnimeByAnilistId } from "../../../lib/anilist-service";

// Type definitions matching AniList API structure
// Update the AniListAnime interface to match the actual API response
interface AniListAnime {
  id: number;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  description?: string;
  averageScore?: number;
  format?: string;
  status?: string;
  season?: string;
  seasonYear?: number;
  episodes?: number;
  duration?: number;
  genres?: string[];
  coverImage: {
    large?: string;
    extraLarge?: string;
    color?: string;
  };
  bannerImage?: string;
  studios?: Array<{
    id: number;
    name: string;
  }>;
  source?: string;
  isAdult?: boolean;
  nextAiringEpisode?: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  };
}

interface WatchlistAnime {
  id: string;
  title: string;
  image: string;
  totalEpisodes: number;
  episodesWatched: number[];
  anilistId: number;
}

interface AiringSchedule {
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
}

export default function WatchlistAnimeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [anime, setAnime] = useState<WatchlistAnime | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [anilistData, setAnilistData] = useState<AniListAnime | null>(null);
  const [releasedEpisodes, setReleasedEpisodes] = useState<number>(0);
  const [nextAiringEpisode, setNextAiringEpisode] =
    useState<AiringSchedule | null>(null);

  // Get id from params
  const id = params.id as string;

  // Format time until next episode
  const formatTimeUntilAiring = (seconds: number) => {
    if (!seconds) return "";

    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ${hours} hour${
        hours > 1 ? "s" : ""
      }`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
        minutes > 1 ? "s" : ""
      }`;
    } else {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
  };

  // Fetch anime from Firestore and AniList
  useEffect(() => {
    if (!user) return;

    const fetchAnime = async () => {
      setLoading(true);
      try {
        // First get the watchlist item from Firestore
        const docRef = doc(db, `users/${user.uid}/watchlist/${id}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as WatchlistAnime;
          setAnime({
            ...data,
            id: id,
          });

          // Then fetch detailed info from AniList
          if (data.anilistId) {
            try {
              const anilistAnime = await getAnimeByAnilistId(data.anilistId);
              if (anilistAnime) {
                setAnilistData(anilistAnime);

                // Set released episodes based on status
                if (
                  anilistAnime.status === "RELEASING" &&
                  anilistAnime.nextAiringEpisode
                ) {
                  // For airing anime, released episodes = next episode - 1
                  setReleasedEpisodes(
                    anilistAnime.nextAiringEpisode.episode - 1
                  );
                  setNextAiringEpisode({
                    episode: anilistAnime.nextAiringEpisode.episode,
                    airingAt: anilistAnime.nextAiringEpisode.airingAt,
                    timeUntilAiring:
                      anilistAnime.nextAiringEpisode.timeUntilAiring,
                  });
                } else {
                  // For completed anime, use total episodes
                  setReleasedEpisodes(
                    anilistAnime.episodes || data.totalEpisodes || 0
                  );
                }

                // Update Firestore with accurate episode count if different
                if (
                  anilistAnime.episodes &&
                  anilistAnime.episodes !== data.totalEpisodes
                ) {
                  await updateDoc(docRef, {
                    totalEpisodes: anilistAnime.episodes,
                  });
                  setAnime((prev) =>
                    prev
                      ? { ...prev, totalEpisodes: anilistAnime.episodes || 0 }
                      : null
                  );
                }
              }
            } catch (error) {
              console.error(
                "Error fetching anime details from AniList:",
                error
              );
              // Fallback to stored data
              setReleasedEpisodes(data.totalEpisodes || 0);
            }
          } else {
            // No AniList ID available, use stored data
            setReleasedEpisodes(data.totalEpisodes || 0);
          }
        } else {
          toast.error("Anime not found in your watchlist");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching anime:", error);
        toast.error("Failed to load anime details");
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [user, id, router]);

  // Handle episode toggle
  const handleEpisodeToggle = async (episode: number) => {
    if (!anime || !user) return;

    const newEpisodes = [...anime.episodesWatched];
    const index = newEpisodes.indexOf(episode);

    if (index > -1) {
      newEpisodes.splice(index, 1); // Remove if watched
    } else {
      newEpisodes.push(episode); // Add if not watched
      newEpisodes.sort((a, b) => a - b);
    }

    try {
      const animeRef = doc(db, `users/${user.uid}/watchlist/${id}`);
      await updateDoc(animeRef, {
        episodesWatched: newEpisodes,
      });

      setAnime({
        ...anime,
        episodesWatched: newEpisodes,
      });

      toast.success(
        `Episode ${episode} marked as ${index > -1 ? "unwatched" : "watched"}`
      );
    } catch (error) {
      console.error("Error updating episode:", error);
      toast.error("Failed to update episode status");
    } finally {
      setShowDialog(false);
      setSelectedEpisode(null);
    }
  };

  // Calculate progress based on released episodes
  const progressPercentage =
    releasedEpisodes > 0 && anime
      ? (anime.episodesWatched.length / releasedEpisodes) * 100
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f] p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Anime Not Found
          </h1>
          <p className="text-zinc-300 mb-6">
            This anime is not in your watchlist
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Back to Watchlist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-white">
      {/* Background Banner */}
      {anilistData?.bannerImage && (
        <div className="absolute inset-0">
          <Image
            src={anilistData.bannerImage}
            alt={anime.title}
            fill
            priority
            className="object-cover opacity-20 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
        </div>
      )}

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-300 hover:text-white mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Watchlist</span>
        </button>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Poster */}
          <div className="w-full md:w-1/3">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]">
              <Image
                src={
                  anilistData?.coverImage?.large ||
                  anime.image ||
                  "/placeholder-image.jpg"
                }
                alt={anime.title}
                width={400}
                height={600}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/50 px-4 py-1.5 text-sm font-medium text-amber-400 hover:shadow-[0_0_12px_rgba(251,191,36,0.6)] transition">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {anilistData?.averageScore || "N/A"}
              </div>
              <div className="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm text-sky-300 hover:shadow-[0_0_12px_rgba(56,189,248,0.6)] transition">
                {anilistData?.format || "Unknown"}
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300 hover:shadow-[0_0_12px_rgba(52,211,153,0.6)] transition">
                {releasedEpisodes || "?"} episodes
              </div>
              <div className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 hover:shadow-[0_0_12px_rgba(167,139,250,0.6)] transition">
                {anilistData?.status || "Unknown"}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {anime.title}
            </h1>
            {anilistData?.title?.native && (
              <h2 className="text-xl text-zinc-400 mb-8 italic">
                {anilistData.title.native}
              </h2>
            )}

            {/* Synopsis */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-4 text-indigo-300">
                Synopsis
              </h3>
              <p className="text-lg leading-relaxed text-zinc-300 max-w-3xl whitespace-pre-line">
                {anilistData?.description
                  ? formatSynopsis(anilistData.description)
                  : "No synopsis available."}
              </p>
            </div>

            {/* Information + Genres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300">
                  Information
                </h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li>
                    <span className="font-medium text-white">Status:</span>{" "}
                    {anilistData?.status || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium text-white">Premiered:</span>{" "}
                    {anilistData?.season} {anilistData?.seasonYear}
                  </li>
                  <li>
                    <span className="font-medium text-white">Studio:</span>{" "}
                    {anilistData?.studios?.[0]?.name || "N/A"}
                  </li>
                  <li>
                    <span className="font-medium text-white">Source:</span>{" "}
                    {anilistData?.source || "Unknown"}
                  </li>
                  <li>
                    <span className="font-medium text-white">Duration:</span>{" "}
                    {anilistData?.duration || "Unknown"} min
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {anilistData?.genres?.map((genre, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs text-pink-200 hover:shadow-[0_0_8px_rgba(236,72,153,0.6)] transition"
                    >
                      {genre}
                    </span>
                  )) || (
                    <span className="text-zinc-400 text-sm">
                      No genres listed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md mb-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-indigo-300">
                  Episode Progress
                </h2>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {anime.episodesWatched.length}
                    </div>
                    <div className="text-xs text-zinc-400">Watched</div>
                  </div>

                  <div className="h-8 w-px bg-zinc-700"></div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(progressPercentage)}%
                    </div>
                    <div className="text-xs text-zinc-400">Completed</div>
                  </div>
                </div>
              </div>

              <div className="w-full bg-zinc-700 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-zinc-400">
                <span>Start</span>
                <span>{releasedEpisodes || "?"} episodes</span>
              </div>
            </motion.div>

            {/* Episodes grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-indigo-300">
                  Episodes
                </h2>
                <div className="text-zinc-400">
                  {releasedEpisodes > 0
                    ? `${releasedEpisodes} released`
                    : "No episodes released yet"}
                  {anilistData?.episodes && ` of ${anilistData.episodes} total`}
                </div>
              </div>

              {/* Next episode airing info */}
              {nextAiringEpisode && (
                <div className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-4 mb-6 flex items-center">
                  <Clock className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-blue-300">
                    Episode {nextAiringEpisode.episode} airing in{" "}
                    {formatTimeUntilAiring(nextAiringEpisode.timeUntilAiring)}
                  </span>
                </div>
              )}

              {releasedEpisodes > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {Array.from(
                    { length: releasedEpisodes },
                    (_, i) => i + 1
                  ).map((episode) => (
                    <motion.div
                      key={episode}
                      whileHover={{ y: -3 }}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                        anime.episodesWatched.includes(episode)
                          ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => {
                        setSelectedEpisode(episode);
                        setShowDialog(true);
                      }}
                    >
                      <div className="p-4 flex flex-col items-center">
                        <div className="text-lg font-bold text-white mb-1">
                          {episode}
                        </div>
                        <div className="text-xs text-zinc-400">Episode</div>

                        {anime.episodesWatched.includes(episode) && (
                          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-zinc-400">
                  {nextAiringEpisode ? (
                    <div>
                      <p>No episodes released yet.</p>
                      <p className="mt-2">
                        Episode 1 airing in{" "}
                        {formatTimeUntilAiring(
                          nextAiringEpisode.timeUntilAiring
                        )}
                      </p>
                    </div>
                  ) : (
                    "Episode information not available for this anime"
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Episode dialog */}
      {showDialog && selectedEpisode !== null && (
        <EpisodeDialog
          episode={selectedEpisode}
          isWatched={anime.episodesWatched.includes(selectedEpisode)}
          onConfirm={() => handleEpisodeToggle(selectedEpisode)}
          onCancel={() => {
            setShowDialog(false);
            setSelectedEpisode(null);
          }}
        />
      )}
    </div>
  );
}
