import { PostDto } from "./Post";

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  FOLLOW = "FOLLOW",
  FOLLOW_REQUEST = "FOLLOW_REQUEST",
  FOLLOW_ACCEPTED = "FOLLOW_ACCEPTED",
}

export interface AppUser {
  id: number;
  username: string;
  profilePictureUrl?: string; 
}


export interface Notification {
    id: number;
    recipient: AppUser;
    sender: AppUser;
    post?: PostDto; 
    type: NotificationType;
    read: boolean;
    createdAt: string; 
    followId?: number;
  }