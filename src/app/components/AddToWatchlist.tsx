// components/AddToWatchlist.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { Button } from "../components/ui/button";
import { Plus, Check } from "lucide-react";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { getAnimeByAnilistId } from "../lib/anilist-service";

// Define TypeScript interface for the anime object
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
  episodes?: number;
  status?: string;
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
    timeUntilAiring: number;
  };
}

export default function AddToWatchlist({
  anime,
  large = false,
}: {
  anime: Anime;
  large?: boolean;
}) {
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkWatchlist = async () => {
      const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.id}`);
      const docSnap = await getDoc(animeRef);
      setIsInWatchlist(docSnap.exists());
      setLoading(false);
    };

    checkWatchlist();
  }, [user, anime.id]);

  const toggleWatchlist = async () => {
    if (!user) {
      toast.info("Please sign in to add to watchlist");
      return;
    }

    try {
      if (isInWatchlist) {
        const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.id}`);
        await deleteDoc(animeRef);
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        // Fetch detailed anime info from AniList
        const detailedAnime = await getAnimeByAnilistId(anime.id);

        const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.id}`);
        await setDoc(animeRef, {
          title:
            anime.title.english ||
            anime.title.romaji ||
            anime.title.native ||
            "Unknown Title",
          image: anime.coverImage.large || "/placeholder-image.jpg",
          totalEpisodes: detailedAnime?.episodes || anime.episodes || 0,
          episodesWatched: [],
          anilistId: anime.id, // Store AniList ID for future reference
        });
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
      toast.error("Failed to update watchlist");
    }
  };

  if (loading && user) return null;

  return large ? (
    <Button
      onClick={toggleWatchlist}
      className="w-full md:w-auto"
      variant={isInWatchlist ? "outline" : "default"}
    >
      {isInWatchlist ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          In Watchlist
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Add to Watchlist
        </>
      )}
    </Button>
  ) : (
    <button
      onClick={toggleWatchlist}
      className={`p-2 rounded-full shadow-md ${
        isInWatchlist
          ? "bg-indigo-100 text-indigo-700"
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
      aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isInWatchlist ? (
        <Check className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </button>
  );
}
