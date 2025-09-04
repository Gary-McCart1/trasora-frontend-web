export interface Comment {
    id: number;
    authorUsername: string;
    authorProfilePictureUrl: string;
    commentText: string;
    createdAt: string;
  }
  
  
  export interface Post {
    id: number;
    authorUsername: string;
    text: string;           // caption or post text
    trackId: string;        // Spotify track ID
    trackName: string;
    artistName?: string;
    albumArtUrl?: string;   // Spotify album art URL
    customImageUrl?: string; // optional uploaded image URL
    customVideoUrl?: string;
    likesCount?: number;
    likedByCurrentUser?: boolean;
    comments?: Comment[];
    createdAt?: string;
  }

  export interface PostDto {
    id?: number;
    authorUsername?: string;
    authorProfilePictureUrl?: string;
    title: string;
    text: string;
    trackId: string;
    trackName: string;
    artistName?: string;
    albumArtUrl?: string;
    likedByCurrentUser?: boolean;
    likesCount?: number;
    comments?: Comment[];
    customImageUrl?: string;
    customVideoUrl?: string;
    createdAt?: string;
    branchCount: number;
    trackVolume?: number;
  }
  