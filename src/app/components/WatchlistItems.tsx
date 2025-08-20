"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import EpisodeTracker from "../components/EpisodeTracker";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { motion } from "framer-motion";
import { Play, MoreVertical } from "lucide-react";
import Link from "next/link";

interface WatchlistAnime {
  id: string;
  title: string;
  image: string;
  totalEpisodes: number;
  episodesWatched: number[];
}

export default function WatchlistItem({ anime }: { anime?: WatchlistAnime }) {
  // Always call hooks at the top level
  const { user } = useAuth();
  const [showTracker, setShowTracker] = useState(false);
  const [episodesWatched, setEpisodesWatched] = useState<number[]>(
    anime?.episodesWatched || []
  );
  const [menuOpen, setMenuOpen] = useState(false);

  // Use useEffect to handle updates when anime changes
  useEffect(() => {
    if (anime) {
      setEpisodesWatched(anime.episodesWatched || []);
    }
  }, [anime]);

  // Add safeguard for undefined anime - moved after hooks
  if (!anime) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-20 h-28 rounded-lg bg-gray-700 animate-pulse"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
            <div className="h-3 bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const toggleEpisode = async (episode: number) => {
    const newEpisodes = [...episodesWatched];
    const index = newEpisodes.indexOf(episode);

    if (index > -1) {
      newEpisodes.splice(index, 1);
    } else {
      newEpisodes.push(episode);
      newEpisodes.sort((a, b) => a - b);
    }

    setEpisodesWatched(newEpisodes);

    if (user) {
      try {
        const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.id}`);
        await updateDoc(animeRef, {
          episodesWatched: newEpisodes,
        });
      } catch (error) {
        console.error("Error updating episode:", error);
      }
    }
  };

  const progressPercentage =
    anime.totalEpisodes > 0
      ? (episodesWatched.length / anime.totalEpisodes) * 100
      : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-900/20 transition-all"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Make the image and title clickable */}
          <Link
            href={`/dashboard/anime/${anime.id}`}
            className="relative flex-shrink-0"
          >
            <div className="w-20 h-28 relative rounded-lg overflow-hidden">
              <Image
                src={anime.image || "/placeholder-image.jpg"}
                alt={anime.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-image.jpg";
                }}
              />
            </div>
          </Link>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              {/* Make the title clickable */}
              <Link href={`/dashboard/anime/${anime.id}`}>
                <h3 className="font-semibold text-white line-clamp-2 hover:text-indigo-300 transition-colors">
                  {anime.title}
                </h3>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-36">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      Remove from list
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                      Mark all as watched
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-400">
                  {episodesWatched.length} of {anime.totalEpisodes || "?"}{" "}
                  episodes
                </div>
                <div className="text-xs font-medium text-indigo-400">
                  {Math.round(progressPercentage)}%
                </div>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowTracker(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Track Episodes</span>
              </button>

              <Link
                href={`/dashboard/anime/${anime.id}`}
                className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showTracker && (
        <EpisodeTracker
          anime={anime}
          episodesWatched={episodesWatched}
          onToggleEpisode={toggleEpisode}
          onClose={() => setShowTracker(false)}
        />
      )}
    </motion.div>
  );
}
