// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Play, MoreVertical, Plus, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WatchlistAnime {
  id: string;
  title: string;
  image: string;
  totalEpisodes: number;
  episodesWatched: number[];
  malId?: number;
}

function WatchlistItem({
  anime,
  onRemove,
  onMarkAllWatched,
}: {
  anime?: WatchlistAnime;
  onRemove: (id: string) => void;
  onMarkAllWatched: (id: string, totalEpisodes: number) => void;
}) {
  // Move hooks to the top level - always call hooks unconditionally
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const progressPercentage =
    anime?.totalEpisodes && anime.totalEpisodes > 0
      ? (anime.episodesWatched.length / anime.totalEpisodes) * 100
      : 0;

  const handleRemove = async () => {
    if (!user || !anime) return;

    try {
      const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.id}`);
      await deleteDoc(animeRef);
      onRemove(anime.id);
      toast.success("Removed from watchlist");
    } catch (error) {
      console.error("Error removing anime:", error);
      toast.error("Failed to remove from watchlist");
    }
    setMenuOpen(false);
  };

  const handleMarkAllWatched = async () => {
    if (!user || !anime) return;

    try {
      const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.id}`);
      const allEpisodes = Array.from(
        { length: anime.totalEpisodes },
        (_, i) => i + 1
      );
      await updateDoc(animeRef, {
        episodesWatched: allEpisodes,
      });
      onMarkAllWatched(anime.id, anime.totalEpisodes);
      toast.success("Marked all episodes as watched");
    } catch (error) {
      console.error("Error marking all as watched:", error);
      toast.error("Failed to mark all as watched");
    }
    setMenuOpen(false);
  };

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
                    <button
                      onClick={handleRemove}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Remove from list
                    </button>
                    <button
                      onClick={handleMarkAllWatched}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Mark all as watched
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-400">
                  {anime.episodesWatched.length} of {anime.totalEpisodes || "?"}{" "}
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
              <Link
                href={`/dashboard/anime/${anime.id}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>View Details</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const watchlistRef = collection(db, `users/${user.uid}/watchlist`);
        const snapshot = await getDocs(watchlistRef);
        const animeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WatchlistAnime[];

        setWatchlist(animeList);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  const handleRemoveAnime = (id: string) => {
    setWatchlist(watchlist.filter((anime) => anime.id !== id));
  };

  const handleMarkAllWatched = (id: string, totalEpisodes: number) => {
    setWatchlist(
      watchlist.map((anime) => {
        if (anime.id === id) {
          return {
            ...anime,
            episodesWatched: Array.from(
              { length: totalEpisodes },
              (_, i) => i + 1
            ),
          };
        }
        return anime;
      })
    );
  };

  const filteredWatchlist = watchlist.filter((anime) =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please sign in</h1>
          <p className="text-gray-300 mb-6">
            You need to be signed in to access your watchlist
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 py-8 px-4 sm:px-6">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-indigo-700/10 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-700/10 blur-[120px] animate-pulse-slow"></div>
      </div>
      <Navbar />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              My Watchlist
            </h1>
            <p className="text-gray-300">
              {watchlist.length} anime{watchlist.length !== 1 ? "s" : ""} in
              your collection
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Anime</span>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Watchlist */}
        {filteredWatchlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No matches found" : "Your watchlist is empty"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? `No anime found matching "${searchQuery}"`
                : "Start building your anime collection by adding some series!"}
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Browse Anime</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWatchlist.map((anime) => (
              <WatchlistItem
                key={anime.id}
                anime={anime}
                onRemove={handleRemoveAnime}
                onMarkAllWatched={handleMarkAllWatched}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
