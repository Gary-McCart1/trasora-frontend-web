// types/spotify.ts

export interface SpotifyImage {
    url: string;
    height?: number;
    width?: number;
  }
  
  export interface SpotifyArtist {
    id?: string;
    name: string;
    images?: SpotifyImage[]; // Only included for full artist objects
  }
  
  export interface SpotifyAlbum {
    id?: string;
    name?: string;
    images: SpotifyImage[];
  }
  
  export interface Track {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
  }

  export interface SpotifyArtist {
    name: string;
  }
  
  // export interface SpotifyAlbum {
  //   images: { url: string }[];
  // }
  
  export interface SpotifyTrack {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
  }
  
  export interface SpotifySearchResponse {
    tracks: {
      items: SpotifyTrack[];
    };
  }
  