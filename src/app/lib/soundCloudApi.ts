import { PostDto } from "../types/Post";

interface SoundCloudTrack {
    id: number;
    title: string;
    user: { username: string; avatar_url: string };
    artwork_url?: string;
    stream_url?: string;
    media?: { transcodings: { url: string; format: { protocol: string; mime_type: string } }[] };
  }
  
  // Fetch from your new SoundCloud endpoint
  export async function fetchSoundCloudPosts(searchTerm: string): Promise<PostDto[]> {
    const response = await fetch(
      `https://trasora-backend-e03193d24a86.herokuapp.com/api/soundcloud/search?q=${encodeURIComponent(
        searchTerm
      )}`
    );
  
    if (!response.ok) throw new Error("SoundCloud API error");
  
    const data: { collection: SoundCloudTrack[] } = await response.json();
  
    // Map SoundCloud tracks to your PostDto
    const posts: PostDto[] = data.collection.map((track) => ({
      id: track.id,
      authorUsername: track.user.username,
      title: track.title,
      text: "", // optional caption from user if you want
      trackId: track.id.toString(),
      trackName: track.title,
      artistName: track.user.username,
      albumArtUrl: track.artwork_url ?? undefined,
      customImageUrl: undefined,
      customVideoUrl: undefined,
      likesCount: 0,
      likedByCurrentUser: false,
      comments: [],
      createdAt: new Date().toISOString(),
      branchCount: 0,
      trackVolume: 1,
    }));
  
    return posts;
  }
  