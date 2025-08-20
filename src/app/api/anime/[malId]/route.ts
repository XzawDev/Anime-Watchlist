// app/api/anime/[malId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAnimeById } from "../../../lib/jikan";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ malId: string }> } // Change params to Promise
) {
  try {
    const { malId } = await params; // Await the params Promise
    const id = parseInt(malId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid MAL ID" }, { status: 400 });
    }

    // Use the function from jikan.ts
    const animeData = await getAnimeById(id);

    if (!animeData) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 });
    }

    return NextResponse.json(animeData);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
