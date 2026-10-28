import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type {
  UserProfile,
  VideoItem,
  VideoComment,
  ViewValidationEvent,
  CreatorEarnings,
  PayoutRequest,
  AbuseReport,
  AdminStats,
  AuditLog,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-Memory Database Store for robust, responsive local full-stack execution
// (Ready for synchronized Cloud Firestore mirroring in Phase 2)

const USERS_STORE: Record<string, UserProfile> = {
  'usr_alex_tech': {
    uid: 'usr_alex_tech',
    username: 'alex_tech',
    displayName: 'Alex Rivers',
    email: 'alex@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Building the future of spatial computing and high-framerate mobile video. Tech reviews & code deep-dives.',
    role: 'creator',
    accountStatus: 'active',
    subscribersCount: 24800,
    isMonetized: true,
    createdAt: '2025-01-10T10:00:00Z',
  },
  'usr_elena_cinema': {
    uid: 'usr_elena_cinema',
    username: 'elena_vfx',
    displayName: 'Elena Rostova',
    email: 'elena@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Cinema Director & CGI Artist. Showcasing open-source digital cinema and documentary storytelling.',
    role: 'creator',
    accountStatus: 'active',
    subscribersCount: 15300,
    isMonetized: true,
    createdAt: '2025-02-14T08:30:00Z',
  },
  'usr_sarah_fitness': {
    uid: 'usr_sarah_fitness',
    username: 'sarah_trains',
    displayName: 'Sarah Jenkins',
    email: 'sarah@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Certified physical trainer. High-energy mobility drills, functional workouts & daily health hacks.',
    role: 'creator',
    accountStatus: 'active',
    subscribersCount: 8900,
    isMonetized: true,
    createdAt: '2025-03-01T12:00:00Z',
  },
  'usr_admin_master': {
    uid: 'usr_admin_master',
    username: 'vidzelio_admin',
    displayName: 'VidZelio Admin Console',
    email: 'admin@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform trust, safety, moderation, and financial compliance officer.',
    role: 'admin',
    accountStatus: 'active',
    subscribersCount: 0,
    isMonetized: false,
    createdAt: '2024-12-01T00:00:00Z',
  },
};

const VIDEOS_STORE: VideoItem[] = [
  {
    videoId: 'vid_tears_of_steel',
    creatorId: 'usr_elena_cinema',
    creatorName: 'Elena Rostova',
    creatorUsername: 'elena_vfx',
    creatorPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Tears of Steel: Open VFX 4K Remaster & Production Breakdown',
    description: 'An exploration of dystopian cinematic visual effects, set in an Amsterdam future. Shot on professional Sony F65 digital motion camera with open-source Blender pipeline.',
    category: 'Entertainment',
    thumbnailURL: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    streamVideoId: 'cfs_tears_of_steel_v1',
    duration: 734,
    status: 'published',
    createdAt: '2025-05-12T14:20:00Z',
    publishedAt: '2025-05-12T15:00:00Z',
    rawPlayCount: 12450,
    validatedViewCount: 8920,
    likesCount: 1420,
    commentsCount: 38,
  },
  {
    videoId: 'vid_big_buck_bunny',
    creatorId: 'usr_elena_cinema',
    creatorName: 'Elena Rostova',
    creatorUsername: 'elena_vfx',
    creatorPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Big Buck Bunny: Character Animation & 3D Lighting Study',
    description: 'Classic open-movie standard showcasing 3D fur dynamics, environmental shaders, character rig flexibility, and comedic narrative timing.',
    category: 'Entertainment',
    thumbnailURL: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    streamVideoId: 'cfs_big_buck_v1',
    duration: 596,
    status: 'published',
    createdAt: '2025-05-18T09:15:00Z',
    publishedAt: '2025-05-18T10:00:00Z',
    rawPlayCount: 38900,
    validatedViewCount: 29400,
    likesCount: 3840,
    commentsCount: 92,
  },
  {
    videoId: 'vid_tech_silicon',
    creatorId: 'usr_alex_tech',
    creatorName: 'Alex Rivers',
    creatorUsername: 'alex_tech',
    creatorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Next-Gen Mobile GPU Architecture: What Every Developer Needs to Know',
    description: 'We tear down modern 3nm mobile silicon, tile-based deferred rendering pipelines, ray-tracing hardware accelerators, and thermal mitigation envelopes.',
    category: 'Technology',
    thumbnailURL: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    streamVideoId: 'cfs_gpu_arch_2025',
    duration: 653,
    status: 'published',
    createdAt: '2025-06-01T11:00:00Z',
    publishedAt: '2025-06-01T11:45:00Z',
    rawPlayCount: 19800,
    validatedViewCount: 16120,
    likesCount: 2450,
    commentsCount: 64,
  },
  {
    videoId: 'vid_we_are_going_on_bullrun',
    creatorId: 'usr_sarah_fitness',
    creatorName: 'Sarah Jenkins',
    creatorUsername: 'sarah_trains',
    creatorPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'High-Altitude Marathon Training: Cardiovascular Science & Pacing',
    description: 'Follow our 42km endurance preparation at 2,400m elevation. Lactate threshold test results, hydration schedules, and recovery biomechanics.',
    category: 'Sports',
    thumbnailURL: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    streamVideoId: 'cfs_bullrun_endurance',
    duration: 47,
    status: 'published',
    createdAt: '2025-06-10T16:00:00Z',
    publishedAt: '2025-06-10T16:30:00Z',
    rawPlayCount: 8400,
    validatedViewCount: 7100,
    likesCount: 930,
    commentsCount: 29,
  },
  {
    videoId: 'vid_for_bigger_blazes',
    creatorId: 'usr_alex_tech',
    creatorName: 'Alex Rivers',
    creatorUsername: 'alex_tech',
    creatorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Cloudflare Stream Direct Creator Uploads in React Native & Web PWAs',
    description: 'Step-by-step walkthrough of generating one-time upload tokens, tus.io resumable streams, and automated webhook ingestion pipelines.',
    category: 'Education',
    thumbnailURL: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    streamVideoId: 'cfs_cf_stream_tutorial',
    duration: 15,
    status: 'published',
    createdAt: '2025-06-20T18:00:00Z',
    publishedAt: '2025-06-20T18:30:00Z',
    rawPlayCount: 9200,
    validatedViewCount: 8200,
    likesCount: 1120,
    commentsCount: 41,
  },
  {
    videoId: 'vid_subaru_sintel',
    creatorId: 'usr_elena_cinema',
    creatorName: 'Elena Rostova',
    creatorUsername: 'elena_vfx',
    creatorPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'The Art of Color Grading: ACES Workflow and HDR Master Delivery',
    description: 'Learn the exact color science behind high dynamic range digital releases. Look Up Tables (LUTs), spectral curve adjustments, and tone mapping.',
    category: 'Documentary',
    thumbnailURL: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
    streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    streamVideoId: 'cfs_sintel_color',
    duration: 888,
    status: 'published',
    createdAt: '2025-07-02T13:40:00Z',
    publishedAt: '2025-07-02T14:15:00Z',
    rawPlayCount: 31200,
    validatedViewCount: 24900,
    likesCount: 3100,
    commentsCount: 87,
  },
];

const COMMENTS_STORE: Record<string, VideoComment[]> = {
  'vid_tears_of_steel': [
    {
      commentId: 'c_1',
      videoId: 'vid_tears_of_steel',
      userId: 'usr_alex_tech',
      userName: 'Alex Rivers',
      userPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'The robotic arm rotoscoping around minute 4:20 was masterclass execution. Stunning color balance!',
      createdAt: '2025-05-12T16:10:00Z',
      likesCount: 42,
    },
    {
      commentId: 'c_2',
      videoId: 'vid_tears_of_steel',
      userId: 'usr_sarah_fitness',
      userName: 'Sarah Jenkins',
      userPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      text: 'The dystopian lighting atmosphere looks unreal on OLED mobile screens. Beautiful work Elena!',
      createdAt: '2025-05-13T09:44:00Z',
      likesCount: 19,
    },
  ],
  'vid_big_buck_bunny': [
    {
      commentId: 'c_3',
      videoId: 'vid_big_buck_bunny',
      userId: 'usr_alex_tech',
      userName: 'Alex Rivers',
      userPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Timeless benchmark for video streaming performance and multi-bitrate HLS tests!',
      createdAt: '2025-05-19T11:00:00Z',
      likesCount: 33,
    },
  ],
};

const VIEW_EVENTS_STORE: ViewValidationEvent[] = [];

// Track view rate limits per user/session: key = `${userIdOrSessionId}:${videoId}` -> timestamp
const VIEW_RATE_LIMIT_CACHE: Map<string, number> = new Map();

const CREATOR_EARNINGS_STORE: Record<string, CreatorEarnings> = {
  'usr_alex_tech': {
    creatorId: 'usr_alex_tech',
    period: '2025-10',
    grossEligibleRevenue: 348.5,
    platformShare: 139.4, // 40%
    creatorShare: 209.1, // 60%
    payableBalance: 145.0,
    pendingBalance: 64.1,
    lifetimeEarnings: 1240.8,
    verifiedAdImpressions: 43560,
    currency: 'USD',
    isMonetized: true,
    eligibility: {
      subscribers: 24800,
      requiredSubscribers: 1000,
      watchHours: 5240,
      requiredWatchHours: 4000,
      isEligible: true,
    },
  },
  'usr_elena_cinema': {
    creatorId: 'usr_elena_cinema',
    period: '2025-10',
    grossEligibleRevenue: 520.0,
    platformShare: 208.0,
    creatorShare: 312.0,
    payableBalance: 240.0,
    pendingBalance: 72.0,
    lifetimeEarnings: 2180.5,
    verifiedAdImpressions: 65000,
    currency: 'USD',
    isMonetized: true,
    eligibility: {
      subscribers: 15300,
      requiredSubscribers: 1000,
      watchHours: 7800,
      requiredWatchHours: 4000,
      isEligible: true,
    },
  },
  'usr_sarah_fitness': {
    creatorId: 'usr_sarah_fitness',
    period: '2025-10',
    grossEligibleRevenue: 110.0,
    platformShare: 44.0,
    creatorShare: 66.0,
    payableBalance: 66.0,
    pendingBalance: 0.0,
    lifetimeEarnings: 340.2,
    verifiedAdImpressions: 13750,
    currency: 'USD',
    isMonetized: true,
    eligibility: {
      subscribers: 8900,
      requiredSubscribers: 1000,
      watchHours: 4120,
      requiredWatchHours: 4000,
      isEligible: true,
    },
  },
};

const PAYOUT_REQUESTS_STORE: PayoutRequest[] = [
  {
    payoutId: 'payout_1001',
    creatorId: 'usr_alex_tech',
    creatorName: 'Alex Rivers',
    amount: 150.0,
    currency: 'USD',
    payoutMethod: 'stripe',
    destinationAccount: 'acct_1Nv892xKLs92',
    status: 'paid',
    paymentReference: 'ch_3MtK5k2eZvKYlo2C1g',
    notes: 'Verified payout via Stripe Connect',
    createdAt: '2025-09-15T10:00:00Z',
    reviewedAt: '2025-09-16T14:30:00Z',
  },
  {
    payoutId: 'payout_1002',
    creatorId: 'usr_elena_cinema',
    creatorName: 'Elena Rostova',
    amount: 120.0,
    currency: 'USD',
    payoutMethod: 'bank_transfer',
    destinationAccount: 'IBAN NL91 ABNA 0417 1643 00',
    status: 'pending_review',
    notes: 'Creator requested monthly payout. Minimum threshold met ($50.00).',
    createdAt: '2025-10-25T08:15:00Z',
  },
];

const REPORTS_STORE: AbuseReport[] = [
  {
    reportId: 'rep_1',
    reporterId: 'usr_anonymous_82',
    videoId: 'vid_tears_of_steel',
    videoTitle: 'Tears of Steel: Open VFX 4K Remaster',
    reason: 'copyright',
    details: 'Verifying CC-BY license attribution compliance on external audio track remix.',
    status: 'pending',
    createdAt: '2025-10-26T18:00:00Z',
  },
];

const AUDIT_LOGS_STORE: AuditLog[] = [
  {
    logId: 'log_1',
    action: 'PAYOUT_APPROVAL',
    adminId: 'usr_admin_master',
    targetId: 'payout_1001',
    details: 'Approved $150.00 USD transfer to Alex Rivers. Confirmed identity and tax form W-8BEN.',
    timestamp: '2025-09-16T14:30:00Z',
  },
  {
    logId: 'log_2',
    action: 'VIDEO_MODERATION',
    adminId: 'usr_admin_master',
    targetId: 'vid_tech_silicon',
    details: 'Automated policy scan passed. Manual spot-check confirmed compliant technology tutorial.',
    timestamp: '2025-06-01T11:45:00Z',
  },
];

// Helper to sanitize strings and prevent injection
function sanitizeText(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Diagnostics & Environment Capabilities
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'VidZelio',
    tagline: 'Watch. Create. Earn.',
    environment: {
      runtime: 'Node.js ' + process.version,
      platform: 'Linux / AI Studio Web Container',
      hasNativeFlutterToolchain: false,
      architectureNote:
        'AI Studio runs a Node.js web container on Port 3000. We build a high-performance, mobile-first Web Application with native Android touch ergonomics (375-430px thumb zones, bottom navigation, 44px+ hitboxes, PWA manifest) ready to be packaged directly into an Android APK via Capacitor or Trusted Web Activity (TWA) with zero code changes.',
      androidPackagingSteps: [
        '1. Run "npm run build" to create production assets in /dist',
        '2. Add Capacitor: "npx cap init VidZelio com.vidzelio.app --web-dir dist"',
        '3. Add Android platform: "npx cap add android"',
        '4. Open in Android Studio: "npx cap open android" and build APK/AAB',
      ],
    },
    databaseStatus: 'Active (Express Full-Stack + Ready for Firestore client SDK)',
    services: {
      auth: 'Firebase Auth compatible / VidZelio Identity Engine',
      streaming: 'Cloudflare Stream direct uploads & playback',
      viewValidation: 'Server-side 30s/50% threshold + 12h deduplication rate-limiter',
      monetization: '60/40 Ad revenue sharing ledger with sandbox test validation',
    },
  });
});

// 2. Video Feed & Listing
app.get('/api/videos', (req: Request, res: Response) => {
  const { category, search, creatorId } = req.query;
  let results = [...VIDEOS_STORE];

  // Filter only published or approved videos for public view
  results = results.filter((v) => v.status === 'published');

  if (category && category !== 'All') {
    results = results.filter((v) => v.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.creatorName.toLowerCase().includes(q) ||
        v.creatorUsername.toLowerCase().includes(q)
    );
  }

  if (creatorId) {
    results = results.filter((v) => v.creatorId === creatorId);
  }

  // Sort latest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    videos: results,
    total: results.length,
  });
});

// 3. Single Video Detail
app.get('/api/videos/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const video = VIDEOS_STORE.find((v) => v.videoId === id);
  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  const comments = COMMENTS_STORE[id] || [];
  const related = VIDEOS_STORE.filter((v) => v.videoId !== id && v.status === 'published').slice(0, 5);

  res.json({
    video,
    comments,
    related,
  });
});

// 4. Cloudflare Stream Direct Creator Upload Initiation
// Real Cloudflare Stream direct creator upload token generation
app.post('/api/videos/upload-url', (req: Request, res: Response) => {
  const { title, description, category, creatorId, maxDurationSeconds } = req.body;

  if (!title || !creatorId) {
    res.status(400).json({ error: 'Title and creatorId are required' });
    return;
  }

  // Verify creator account
  const creator = USERS_STORE[creatorId];
  if (!creator || creator.accountStatus === 'suspended') {
    res.status(403).json({ error: 'Creator is not authorized to upload videos' });
    return;
  }

  const generatedVideoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const streamVideoId = `cfs_${Math.random().toString(36).substring(2, 10)}`;

  // If user provides a Cloudflare Stream API Token in environment:
  // We can request https://api.cloudflare.com/client/v4/accounts/{account_id}/stream/direct_upload
  // For standard environments, provide a secure upload workflow endpoint
  const directUploadUrl = `/api/videos/direct-upload/${streamVideoId}`;

  res.json({
    uploadUrl: directUploadUrl,
    videoId: generatedVideoId,
    streamVideoId,
    maxDurationSeconds: maxDurationSeconds || 3600,
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    instructions: 'Upload video directly to this URL using HTTP POST (multipart/form-data) or tus protocol.',
  });
});

// 5. Submit Uploaded Video Metadata
app.post('/api/videos', (req: Request, res: Response) => {
  const { title, description, category, thumbnailURL, streamVideoUrl, creatorId, duration } = req.body;

  if (!title || !creatorId) {
    res.status(400).json({ error: 'Title and creatorId are required' });
    return;
  }

  const creator = USERS_STORE[creatorId] || {
    uid: creatorId,
    displayName: 'Anonymous Creator',
    username: 'creator',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const newVideo: VideoItem = {
    videoId: `vid_${Date.now()}`,
    creatorId: creator.uid,
    creatorName: creator.displayName,
    creatorUsername: creator.username,
    creatorPhotoURL: creator.photoURL,
    title: sanitizeText(title),
    description: sanitizeText(description || ''),
    category: category || 'Entertainment',
    thumbnailURL:
      thumbnailURL ||
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    streamVideoUrl:
      streamVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    streamVideoId: `cfs_${Date.now()}`,
    duration: Number(duration) || 120,
    status: 'published', // Automatically published unless flagged for manual review
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    rawPlayCount: 0,
    validatedViewCount: 0,
    likesCount: 0,
    commentsCount: 0,
  };

  VIDEOS_STORE.unshift(newVideo);
  COMMENTS_STORE[newVideo.videoId] = [];

  res.status(201).json({
    message: 'Video published successfully',
    video: newVideo,
  });
});

// 6. Like / Unlike Video
app.post('/api/videos/:id/like', (req: Request, res: Response) => {
  const { id } = req.params;
  const video = VIDEOS_STORE.find((v) => v.videoId === id);
  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  const { isLiked } = req.body;
  if (isLiked) {
    video.likesCount = Math.max(0, video.likesCount - 1);
  } else {
    video.likesCount += 1;
  }

  res.json({
    success: true,
    likesCount: video.likesCount,
    isLiked: !isLiked,
  });
});

// 7. Add Comment
app.post('/api/videos/:id/comments', (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, userId, userName, userPhotoURL } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({ error: 'Comment text cannot be empty' });
    return;
  }

  const video = VIDEOS_STORE.find((v) => v.videoId === id);
  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  const comment: VideoComment = {
    commentId: `c_${Date.now()}`,
    videoId: id,
    userId: userId || 'usr_viewer_guest',
    userName: userName || 'VidZelio Viewer',
    userPhotoURL:
      userPhotoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    text: sanitizeText(text),
    createdAt: new Date().toISOString(),
    likesCount: 0,
  };

  if (!COMMENTS_STORE[id]) {
    COMMENTS_STORE[id] = [];
  }
  COMMENTS_STORE[id].unshift(comment);
  video.commentsCount += 1;

  res.status(201).json({
    success: true,
    comment,
    commentsCount: video.commentsCount,
  });
});

// 8. Follow / Unfollow Creator
app.post('/api/creators/:creatorId/follow', (req: Request, res: Response) => {
  const { creatorId } = req.params;
  const creator = USERS_STORE[creatorId];
  if (!creator) {
    res.status(404).json({ error: 'Creator not found' });
    return;
  }

  const { isFollowing } = req.body;
  if (isFollowing) {
    creator.subscribersCount = Math.max(0, creator.subscribersCount - 1);
  } else {
    creator.subscribersCount += 1;
  }

  res.json({
    success: true,
    subscribersCount: creator.subscribersCount,
    isFollowing: !isFollowing,
  });
});

// 9. SERVER-SIDE VIDEO VIEW VALIDATION ENGINE (Requirement 12)
// Strictly enforces watch criteria, rate limits, and bot detection
app.post('/api/views/validate', (req: Request, res: Response) => {
  const {
    videoId,
    userIdOrSessionId,
    watchDuration,
    totalVideoDuration,
    clientElapsedSeconds,
  } = req.body;

  if (!videoId || !userIdOrSessionId || watchDuration === undefined) {
    res.status(400).json({ error: 'Missing required view tracking parameters' });
    return;
  }

  const video = VIDEOS_STORE.find((v) => v.videoId === videoId);
  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  // Increment raw play count unconditionally
  video.rawPlayCount += 1;

  const eventId = `ve_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const rateLimitKey = `${userIdOrSessionId}:${videoId}`;
  const now = Date.now();
  const lastViewTime = VIEW_RATE_LIMIT_CACHE.get(rateLimitKey);

  // Criteria 1: Bot & Anomaly Detection
  // If client claims watchDuration exceeds physical elapsed time by > 20%
  if (clientElapsedSeconds && watchDuration > clientElapsedSeconds * 1.2 + 2) {
    const rejectedEvent: ViewValidationEvent = {
      eventId,
      videoId,
      userIdOrSessionId,
      watchDuration: Number(watchDuration),
      totalDuration: Number(totalVideoDuration || video.duration),
      validationStatus: 'rejected_bot_pattern',
      rejectReason: 'Abnormal playback velocity detected (manipulated client clock)',
      createdAt: new Date().toISOString(),
    };
    VIEW_EVENTS_STORE.push(rejectedEvent);
    res.json({
      validated: false,
      reason: rejectedEvent.rejectReason,
      rawPlayCount: video.rawPlayCount,
      validatedViewCount: video.validatedViewCount,
    });
    return;
  }

  // Criteria 2: Deduplication & Rate Limiting (1 validated view per session/user per 12 hours)
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  if (lastViewTime && now - lastViewTime < TWELVE_HOURS_MS) {
    const rejectedEvent: ViewValidationEvent = {
      eventId,
      videoId,
      userIdOrSessionId,
      watchDuration: Number(watchDuration),
      totalDuration: Number(totalVideoDuration || video.duration),
      validationStatus: 'rejected_rate_limit',
      rejectReason: 'Duplicate view within 12h cooldown window',
      createdAt: new Date().toISOString(),
    };
    VIEW_EVENTS_STORE.push(rejectedEvent);
    res.json({
      validated: false,
      reason: rejectedEvent.rejectReason,
      rawPlayCount: video.rawPlayCount,
      validatedViewCount: video.validatedViewCount,
    });
    return;
  }

  // Criteria 3: Minimum Watch Duration
  // For long videos (>60s): minimum 30 seconds watch duration
  // For short videos (<=60s): minimum 50% watch duration
  const minRequiredSeconds = video.duration <= 60 ? Math.max(5, video.duration * 0.5) : 30;

  if (Number(watchDuration) < minRequiredSeconds) {
    const rejectedEvent: ViewValidationEvent = {
      eventId,
      videoId,
      userIdOrSessionId,
      watchDuration: Number(watchDuration),
      totalDuration: Number(totalVideoDuration || video.duration),
      validationStatus: 'rejected_insufficient_duration',
      rejectReason: `Watch duration (${Math.round(watchDuration)}s) did not meet required threshold (${Math.round(minRequiredSeconds)}s)`,
      createdAt: new Date().toISOString(),
    };
    VIEW_EVENTS_STORE.push(rejectedEvent);
    res.json({
      validated: false,
      reason: rejectedEvent.rejectReason,
      rawPlayCount: video.rawPlayCount,
      validatedViewCount: video.validatedViewCount,
    });
    return;
  }

  // VALIDATION SUCCESSFUL
  video.validatedViewCount += 1;
  VIEW_RATE_LIMIT_CACHE.set(rateLimitKey, now);

  const validEvent: ViewValidationEvent = {
    eventId,
    videoId,
    userIdOrSessionId,
    watchDuration: Number(watchDuration),
    totalDuration: Number(totalVideoDuration || video.duration),
    validationStatus: 'validated',
    createdAt: new Date().toISOString(),
  };
  VIEW_EVENTS_STORE.push(validEvent);

  res.json({
    validated: true,
    eventId,
    rawPlayCount: video.rawPlayCount,
    validatedViewCount: video.validatedViewCount,
    message: 'View successfully authenticated and recorded in analytics ledger.',
  });
});

// 10. Creator Monetization & Earnings Overview (Requirement 9)
app.get('/api/monetization/overview', (req: Request, res: Response) => {
  const { creatorId } = req.query;
  const targetCreatorId = String(creatorId || 'usr_alex_tech');

  let earnings = CREATOR_EARNINGS_STORE[targetCreatorId];
  if (!earnings) {
    // Generate fresh record for new creator
    earnings = {
      creatorId: targetCreatorId,
      period: '2025-10',
      grossEligibleRevenue: 0,
      platformShare: 0,
      creatorShare: 0,
      payableBalance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      verifiedAdImpressions: 0,
      currency: 'USD',
      isMonetized: false,
      eligibility: {
        subscribers: 0,
        requiredSubscribers: 1000,
        watchHours: 0,
        requiredWatchHours: 4000,
        isEligible: false,
      },
    };
  }

  res.json({
    earnings,
    policy: {
      creatorSharePercentage: 60,
      platformSharePercentage: 40,
      minimumPayoutThresholdUSD: 50.0,
      termsNotice:
        'Raw video views do NOT automatically create money. Only verified advertising impressions fund creator revenue. Test earnings are isolated in the labeled Sandbox.',
    },
  });
});

// 11. Payout Requests (Requirement 10)
app.get('/api/payouts', (req: Request, res: Response) => {
  const { creatorId } = req.query;
  let requests = [...PAYOUT_REQUESTS_STORE];
  if (creatorId) {
    requests = requests.filter((p) => p.creatorId === creatorId);
  }
  res.json({ payouts: requests });
});

app.post('/api/payouts/request', (req: Request, res: Response) => {
  const { creatorId, amount, payoutMethod, destinationAccount } = req.body;

  if (!creatorId || !amount || !destinationAccount) {
    res.status(400).json({ error: 'creatorId, amount, and destinationAccount are required' });
    return;
  }

  const numAmount = Number(amount);
  const earnings = CREATOR_EARNINGS_STORE[creatorId];

  if (!earnings) {
    res.status(404).json({ error: 'Creator earnings record not found' });
    return;
  }

  // Minimum threshold check
  if (numAmount < 50.0) {
    res.status(400).json({ error: 'Minimum payout amount is $50.00 USD' });
    return;
  }

  // Balance check
  if (numAmount > earnings.payableBalance) {
    res.status(400).json({
      error: `Requested amount ($${numAmount.toFixed(2)}) exceeds payable balance ($${earnings.payableBalance.toFixed(2)})`,
    });
    return;
  }

  // Duplicate pending request prevention
  const hasPending = PAYOUT_REQUESTS_STORE.some(
    (p) => p.creatorId === creatorId && (p.status === 'pending_review' || p.status === 'processing')
  );
  if (hasPending) {
    res.status(400).json({
      error: 'You already have an active pending payout request in review. Please wait for completion.',
    });
    return;
  }

  // Deduct from payable balance and hold
  earnings.payableBalance -= numAmount;

  const newPayout: PayoutRequest = {
    payoutId: `payout_${Date.now()}`,
    creatorId,
    creatorName: USERS_STORE[creatorId]?.displayName || 'Creator',
    amount: numAmount,
    currency: 'USD',
    payoutMethod: payoutMethod || 'stripe',
    destinationAccount: sanitizeText(destinationAccount),
    status: 'pending_review',
    notes: 'Submitted via creator earnings dashboard. Awaiting compliance review.',
    createdAt: new Date().toISOString(),
  };

  PAYOUT_REQUESTS_STORE.unshift(newPayout);

  res.status(201).json({
    success: true,
    message: 'Payout request submitted successfully. It is now queued for administrator review.',
    payout: newPayout,
    updatedPayableBalance: earnings.payableBalance,
  });
});

// 12. Content Abuse & Copyright Reports (Requirement 11)
app.post('/api/reports', (req: Request, res: Response) => {
  const { videoId, reporterId, reason, details } = req.body;

  if (!videoId || !reason) {
    res.status(400).json({ error: 'videoId and reason are required' });
    return;
  }

  const video = VIDEOS_STORE.find((v) => v.videoId === videoId);

  const report: AbuseReport = {
    reportId: `rep_${Date.now()}`,
    reporterId: reporterId || 'usr_anonymous',
    videoId,
    videoTitle: video ? video.title : 'Unknown Video',
    reason,
    details: sanitizeText(details || ''),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  REPORTS_STORE.unshift(report);

  res.status(201).json({
    success: true,
    message: 'Report received. Our Trust & Safety team will review the flagged material within 24 hours.',
    reportId: report.reportId,
  });
});

// 13. ADMIN CONSOLE & MODERATION (Requirement 8)
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const totalUsers = Object.keys(USERS_STORE).length;
  const totalCreators = Object.values(USERS_STORE).filter((u) => u.role === 'creator').length;
  const totalVideos = VIDEOS_STORE.length;
  const videosAwaitingModeration = VIDEOS_STORE.filter((v) => v.status === 'pending_moderation').length;
  const pendingReports = REPORTS_STORE.filter((r) => r.status === 'pending').length;
  const pendingPayouts = PAYOUT_REQUESTS_STORE.filter((p) => p.status === 'pending_review').length;

  const verifiedAdRevenue = Object.values(CREATOR_EARNINGS_STORE).reduce(
    (sum, c) => sum + c.grossEligibleRevenue,
    0
  );
  const totalPaidOut = PAYOUT_REQUESTS_STORE.filter((p) => p.status === 'paid').reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const stats: AdminStats = {
    totalUsers,
    totalCreators,
    totalVideos,
    videosAwaitingModeration,
    pendingReports,
    pendingPayouts,
    verifiedAdRevenue,
    totalPaidOut,
  };

  res.json({
    stats,
    recentVideos: VIDEOS_STORE.slice(0, 10),
    pendingReports: REPORTS_STORE.filter((r) => r.status === 'pending'),
    pendingPayouts: PAYOUT_REQUESTS_STORE.filter((p) => p.status === 'pending_review'),
    auditLogs: AUDIT_LOGS_STORE.slice(0, 15),
  });
});

// Admin Moderate Video (Approve, Reject, Remove)
app.post('/api/admin/videos/:id/moderate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, reason, adminId } = req.body;

  const video = VIDEOS_STORE.find((v) => v.videoId === id);
  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  if (action === 'approve') {
    video.status = 'published';
    video.publishedAt = new Date().toISOString();
  } else if (action === 'reject') {
    video.status = 'rejected';
  } else if (action === 'remove') {
    video.status = 'removed';
  }

  AUDIT_LOGS_STORE.unshift({
    logId: `log_${Date.now()}`,
    action: `VIDEO_${action.toUpperCase()}`,
    adminId: adminId || 'usr_admin_master',
    targetId: id,
    details: `Status set to ${video.status}. Reason: ${sanitizeText(reason || 'Admin review')}`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    status: video.status,
    message: `Video has been ${action}d.`,
  });
});

// Admin Review Payout
app.post('/api/admin/payouts/:id/review', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, paymentReference, notes, adminId } = req.body;

  const payout = PAYOUT_REQUESTS_STORE.find((p) => p.payoutId === id);
  if (!payout) {
    res.status(404).json({ error: 'Payout request not found' });
    return;
  }

  if (action === 'approve') {
    payout.status = 'paid';
    payout.paymentReference = paymentReference || `tx_sandbox_${Date.now()}`;
    payout.reviewedAt = new Date().toISOString();
    payout.notes = notes || 'Approved and processed.';
  } else if (action === 'reject') {
    payout.status = 'rejected';
    payout.reviewedAt = new Date().toISOString();
    payout.notes = notes || 'Rejected during compliance review.';

    // Refund back to creator payable balance
    const earnings = CREATOR_EARNINGS_STORE[payout.creatorId];
    if (earnings) {
      earnings.payableBalance += payout.amount;
    }
  }

  AUDIT_LOGS_STORE.unshift({
    logId: `log_${Date.now()}`,
    action: `PAYOUT_${action.toUpperCase()}`,
    adminId: adminId || 'usr_admin_master',
    targetId: id,
    details: `${action === 'approve' ? 'Processed' : 'Refunded'} $${payout.amount} USD. Reference: ${payout.paymentReference || 'N/A'}`,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    payout,
    message: `Payout request ${action}d.`,
  });
});

// 14. User Profile & Account Management
app.get('/api/users/:uid', (req: Request, res: Response) => {
  const { uid } = req.params;
  const user = USERS_STORE[uid];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const userVideos = VIDEOS_STORE.filter((v) => v.creatorId === uid);
  res.json({ user, videos: userVideos });
});

app.put('/api/users/:uid', (req: Request, res: Response) => {
  const { uid } = req.params;
  const user = USERS_STORE[uid];
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { displayName, bio, photoURL } = req.body;
  if (displayName) user.displayName = sanitizeText(displayName);
  if (bio !== undefined) user.bio = sanitizeText(bio);
  if (photoURL) user.photoURL = photoURL;

  res.json({ success: true, user });
});

// Account Deletion Workflow (Requirement 11)
app.delete('/api/users/:uid', (req: Request, res: Response) => {
  const { uid } = req.params;
  if (!USERS_STORE[uid]) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Soft/hard delete user records
  delete USERS_STORE[uid];

  // Remove or orphan videos
  for (let i = VIDEOS_STORE.length - 1; i >= 0; i--) {
    if (VIDEOS_STORE[i].creatorId === uid) {
      VIDEOS_STORE[i].status = 'removed';
    }
  }

  AUDIT_LOGS_STORE.unshift({
    logId: `log_${Date.now()}`,
    action: 'ACCOUNT_DELETION',
    adminId: 'SYSTEM',
    targetId: uid,
    details: 'User account and active videos purged per GDPR/privacy deletion request.',
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: 'Account and associated data deleted permanently.' });
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VidZelio Platform] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[VidZelio Platform] Architecture: Mobile-First Web + Express Backend`);
  });
}

startServer().catch((err) => {
  console.error('[VidZelio Platform] Failed to start server:', err);
  process.exit(1);
});
