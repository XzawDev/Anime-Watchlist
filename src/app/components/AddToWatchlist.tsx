// components/AddToWatchlist.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { Button } from "../components/ui/button";
import { Plus, Check } from "lucide-react";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";

// Define TypeScript interface for the anime object
interface Anime {
  mal_id: number;
  title?: string;
  images?: {
    jpg?: {
      image_url: string;
    };
  };
  episodes?: number;
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
      const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.mal_id}`);
      const docSnap = await getDoc(animeRef);
      setIsInWatchlist(docSnap.exists());
      setLoading(false);
    };

    checkWatchlist();
  }, [user, anime.mal_id]);

  const toggleWatchlist = async () => {
    if (!user) {
      toast.info("Please sign in to add to watchlist");
      return;
    }

    try {
      if (isInWatchlist) {
        const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.mal_id}`);
        await deleteDoc(animeRef);
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      } else {
        const animeRef = doc(db, `users/${user.uid}/watchlist/${anime.mal_id}`);
        await setDoc(animeRef, {
          title: anime.title,
          image: anime.images?.jpg?.image_url || "",
          totalEpisodes: anime.episodes,
          episodesWatched: [],
          malId: anime.mal_id, // Add this line to store the MAL ID
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
