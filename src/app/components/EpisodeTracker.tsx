// components/EpisodeTracker.tsx
"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface EpisodeTrackerProps {
  anime: {
    id: string;
    title: string;
    totalEpisodes: number;
  };
  episodesWatched: number[];
  onToggleEpisode: (episode: number) => void;
  onClose: () => void;
}

export default function EpisodeTracker({
  anime,
  episodesWatched,
  onToggleEpisode,
  onClose,
}: EpisodeTrackerProps) {
  const [visibleEpisodes, setVisibleEpisodes] = useState(50);
  const totalEpisodes = anime.totalEpisodes || 100;

  const loadMoreEpisodes = () => {
    setVisibleEpisodes((prev) => Math.min(prev + 50, totalEpisodes));
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-5 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{anime.title}</h2>
            <p className="text-sm text-gray-400">Mark episodes as watched</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-4">
          <div className="mb-4 bg-gray-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-white">Your Progress</h3>
                <p className="text-sm text-gray-400">
                  {episodesWatched.length} of {totalEpisodes} episodes watched
                </p>
              </div>
              <div className="text-xl font-bold text-indigo-400">
                {Math.round((episodesWatched.length / totalEpisodes) * 100)}%
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                style={{
                  width: `${(episodesWatched.length / totalEpisodes) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {Array.from({ length: visibleEpisodes }, (_, i) => i + 1).map(
              (ep) => (
                <button
                  key={ep}
                  onClick={() => onToggleEpisode(ep)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    episodesWatched.includes(ep)
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {ep}
                </button>
              )
            )}
          </div>

          {visibleEpisodes < totalEpisodes && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMoreEpisodes}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Load More Episodes
              </button>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 text-center">
          <button
            onClick={() => {
              // Mark all episodes as watched
              for (let ep = 1; ep <= visibleEpisodes; ep++) {
                if (!episodesWatched.includes(ep)) {
                  onToggleEpisode(ep);
                }
              }
            }}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            Mark all visible as watched
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
