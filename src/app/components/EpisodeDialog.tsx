// components/EpisodeDialog.tsx
"use client";

import { motion } from "framer-motion";
import { Play, Check, X } from "lucide-react";

interface EpisodeDialogProps {
  episode: number;
  isWatched: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EpisodeDialog({
  episode,
  isWatched,
  onConfirm,
  onCancel,
}: EpisodeDialogProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Episode {episode}</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center py-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-indigo-900/20 flex items-center justify-center mb-4">
              {isWatched ? (
                <Check className="h-10 w-10 text-green-400" />
              ) : (
                <Play className="h-10 w-10 text-indigo-400" />
              )}
            </div>

            <p className="text-gray-300 mb-6">
              {isWatched
                ? "You've already watched this episode."
                : "Mark this episode as watched?"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isWatched
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              }`}
            >
              {isWatched ? (
                <>
                  <X className="h-5 w-5" />
                  <span>Mark Unwatched</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  <span>Mark Watched</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
