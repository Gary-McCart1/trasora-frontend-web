import Image from "next/image";

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface ArtistResultItemProps {
  artist: Artist;
}

export default function ArtistResultItem({ artist }: ArtistResultItemProps) {
  return (
    <li key={artist.id} className="flex items-center gap-4 px-4 py-2 hover:bg-zinc-800 transition cursor-pointer">
      <Image
        src={artist.images?.[0]?.url || "/default-profilepic.png"}
        alt={artist.name}
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <span className="font-medium">{artist.name}</span>
    </li>
  );
}
