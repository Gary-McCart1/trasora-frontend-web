export interface Branch {
  id: number;
  trackId: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  position: number;
  addedByUsername: string;
}

export interface newTrunk {
  id: number;
  username: string;
  name: string;
  description?: string;
  isPublic: boolean;
  branches: Branch[];
}
export interface Trunk {
  id: number;
  username: string;
  name: string;
  description?: string;
  publicFlag: boolean;
  branches: Branch[];
}

export interface User {
  id: number;
  fullName?: string | null;
  email: string;
  username: string;
  password?: string;
  bio?: string | null;
  joinedAt?: string | null;
  profilePictureUrl?: string | null;
  role: "USER" | "ADMIN";
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean; // if current logged-in user is following this user
  accentColor?: string;
  spotifyConnected?: boolean;
  profilePublic?: boolean;

  // New field for trunks
  trunks?: Trunk[];
  branchCount: number;
  spotifyPremium: boolean;
  referredBy: User;
}
