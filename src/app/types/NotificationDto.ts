export interface NotificationDto {
  id: number;
  type: string; // FOLLOW, FOLLOW_REQUEST, FOLLOW_ACCEPTED, LIKE, COMMENT, etc.
  read: boolean;

  // Sender info
  senderUsername: string;
  senderProfilePictureUrl?: string;

  // Recipient info (optional, might not be needed on frontend)
  recipientUsername?: string;

  // Only set if this notification is related to a follow request
  followId?: number;

  // Post info (optional, only for likes/comments)
  postId?: number;
  postAlbumArtUrl?: string;
  postCustomImageUrl?: string;

  // Branch/trunk notifications
  trunkName?: string;
  songTitle?: string;
  songArtist?: string;
  albumArtUrl?: string;

  createdAt: string; // ISO string, e.g., "2025-08-14T16:22:00Z"
}
