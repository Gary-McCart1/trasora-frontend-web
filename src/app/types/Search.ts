// Local types for search results

export interface SearchUser {
    id: number;
    username: string;
    profilePictureUrl: string | null;
  }
  
  export interface SearchTrack {
    id: string;
    title: string;
    user: {
      id: string;
      username: string;
      avatar_url?: string | null;
    };
    artwork_url?: string | null;
    stream_url?: string;
  }
  