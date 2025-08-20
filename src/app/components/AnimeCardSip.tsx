import AnimeImage from "./AnimeImage";

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: { image_url: string };
  };
}

export default function AnimeCardSip({ anime }: { anime: Anime }) {
  return (
    <div className="rounded overflow-hidden shadow-md">
      <AnimeImage
        src={anime.images.jpg.image_url}
        alt={anime.title}
        className="object-cover"
      />
      <div className="p-2 text-sm font-semibold truncate">{anime.title}</div>
    </div>
  );
}
