export type StoryType = "IMAGE" | "VIDEO" | "TRACK";

export interface StoryDto {
  id: number;
  authorId: number;
  authorUsername: string;
  authorProfilePictureUrl: string;
  contentUrl: string;         
  s3Key?: string;            
  type: StoryType;
  caption?: string;

  // Track info (for TRACK type)
  trackId?: string;
  trackName?: string;
  artistName?: string;
  albumArtUrl?: string;

  createdAt: string;
  expiresAt: string;
  viewers: number[];
}

