/**
 * VidZelio Shared Type Definitions
 * Watch. Create. Earn.
 */

export type UserRole = 'viewer' | 'creator' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  role: UserRole;
  accountStatus: AccountStatus;
  subscribersCount: number;
  isMonetized: boolean;
  createdAt: string;
}

export type VideoCategory =
  | 'All'
  | 'Entertainment'
  | 'Technology'
  | 'Education'
  | 'Gaming'
  | 'Sports'
  | 'Documentary'
  | 'Shorts';

export type VideoStatus =
  | 'uploading'
  | 'processing'
  | 'pending_moderation'
  | 'published'
  | 'rejected'
  | 'removed';

export interface VideoItem {
  videoId: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorPhotoURL: string;
  title: string;
  description: string;
  category: VideoCategory;
  thumbnailURL: string;
  streamVideoUrl: string; // Cloudflare Stream playback URL or verified HLS stream
  streamVideoId: string;
  duration: number; // in seconds
  status: VideoStatus;
  createdAt: string;
  publishedAt?: string;
  rawPlayCount: number;
  validatedViewCount: number;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isFollowingCreator?: boolean;
}

export interface VideoComment {
  commentId: string;
  videoId: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  text: string;
  createdAt: string;
  likesCount: number;
}

export interface ViewValidationEvent {
  eventId: string;
  videoId: string;
  userIdOrSessionId: string;
  watchDuration: number;
  totalDuration: number;
  validationStatus: 'validated' | 'rejected_insufficient_duration' | 'rejected_rate_limit' | 'rejected_bot_pattern';
  rejectReason?: string;
  createdAt: string;
}

export interface CreatorEarnings {
  creatorId: string;
  period: string;
  grossEligibleRevenue: number; // Raw verified ad impressions * eCPM
  platformShare: number; // 40%
  creatorShare: number; // 60%
  payableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  verifiedAdImpressions: number;
  currency: string;
  isMonetized: boolean;
  eligibility: {
    subscribers: number;
    requiredSubscribers: number;
    watchHours: number;
    requiredWatchHours: number;
    isEligible: boolean;
  };
}

export type PayoutStatus = 'pending_review' | 'approved' | 'processing' | 'paid' | 'rejected';

export interface PayoutRequest {
  payoutId: string;
  creatorId: string;
  creatorName: string;
  amount: number;
  currency: string;
  payoutMethod: 'bank_transfer' | 'stripe' | 'paypal' | 'sandbox_manual';
  destinationAccount: string;
  status: PayoutStatus;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface AbuseReport {
  reportId: string;
  reporterId: string;
  videoId: string;
  videoTitle: string;
  reason: 'copyright' | 'harmful_content' | 'hate_speech' | 'spam_fraud' | 'misinformation';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCreators: number;
  totalVideos: number;
  videosAwaitingModeration: number;
  pendingReports: number;
  pendingPayouts: number;
  verifiedAdRevenue: number;
  totalPaidOut: number;
}

export interface AuditLog {
  logId: string;
  action: string;
  adminId: string;
  targetId: string;
  details: string;
  timestamp: string;
}
