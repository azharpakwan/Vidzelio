import React, { useRef, useState, useEffect } from 'react';
import type { VideoItem, VideoComment } from '../../types/index.ts';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ThumbsUp,
  Share2,
  Flag,
  CheckCircle,
  ArrowLeft,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface VideoPlayerViewProps {
  video: VideoItem;
  onBack: () => void;
  onSelectCreator: (creatorId: string) => void;
  onSelectRelatedVideo: (video: VideoItem) => void;
  onReportVideo: (video: VideoItem) => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  video,
  onBack,
  onSelectCreator,
  onSelectRelatedVideo,
  onReportVideo,
}) => {
  const { currentUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [hasValidatedView, setHasValidatedView] = useState(false);
  const [watchAccumulator, setWatchAccumulator] = useState(0);
  const [playbackStartTime] = useState(Date.now());

  // Interactive metrics state
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(24800);
  const [validatedViewCount, setValidatedViewCount] = useState(video.validatedViewCount);

  // Comments state
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Related videos
  const [relatedVideos, setRelatedVideos] = useState<VideoItem[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch comments and related videos
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/videos/${video.videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.comments) setComments(data.comments);
          if (data.related) setRelatedVideos(data.related);
          if (data.video) {
            setValidatedViewCount(data.video.validatedViewCount);
            setLikesCount(data.video.likesCount);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch video details:', err));

    return () => {
      isMounted = false;
    };
  }, [video.videoId]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Video Time Update & View Validation Engine
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Accumulate actual watch duration
    setWatchAccumulator((prev) => {
      const next = prev + 0.25;

      // Threshold check: 30 seconds for standard, 50% for shorts
      const threshold = video.duration <= 60 ? Math.max(5, video.duration * 0.5) : 30;

      if (!hasValidatedView && next >= threshold) {
        setHasValidatedView(true);
        triggerServerViewValidation(next);
      }
      return next;
    });
  };

  const triggerServerViewValidation = async (watchedSecs: number) => {
    try {
      const elapsedRealSecs = (Date.now() - playbackStartTime) / 1000;
      const res = await fetch('/api/views/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.videoId,
          userIdOrSessionId: currentUser?.uid || 'sess_' + window.navigator.userAgent.substring(0, 20),
          watchDuration: watchedSecs,
          totalVideoDuration: duration || video.duration,
          clientElapsedSeconds: elapsedRealSecs,
        }),
      });
      const data = await res.json();
      if (data.validated) {
        setValidatedViewCount(data.validatedViewCount);
      }
    } catch (err) {
      console.warn('View validation network call:', err);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || video.duration);
      videoRef.current.volume = volume;
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Like Toggle
  const handleToggleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/videos/${video.videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLiked }),
      });
    } catch (e) {
      console.warn('Like call failed:', e);
    }
  };

  // Follow Creator
  const handleToggleFollow = async () => {
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setSubscribersCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/creators/${video.creatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFollowing }),
      });
    } catch (e) {
      console.warn('Follow call failed:', e);
    }
  };

  // Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isPostingComment) return;

    setIsPostingComment(true);
    const commentPayload = {
      text: newCommentText.trim(),
      userId: currentUser?.uid || 'usr_guest',
      userName: currentUser?.displayName || 'VidZelio Viewer',
      userPhotoURL: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    try {
      const res = await fetch(`/api/videos/${video.videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentPayload),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewCommentText('');
      }
    } catch (err) {
      console.warn('Failed to post comment:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '?v=' + video.videoId);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 pb-24">
      {/* Back button */}
      <div className="mb-3 flex items-center">
        <button
          onClick={onBack}
          className="flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </button>
      </div>

      {/* Main Grid: Player on left (desktop), Related on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Custom Video Player Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-slate-800">
            <video
              ref={videoRef}
              src={video.streamVideoUrl}
              poster={video.thumbnailURL}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              playsInline
              className="h-full w-full object-contain cursor-pointer"
            />

            {/* Custom Overlaid Player Controls */}
            <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
              {/* Top Bar: Cloudflare Stream badge */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                  <Sparkles className="h-3 w-3 text-blue-400" />
                  <span>Cloudflare Stream 1080p HD</span>
                </span>
                {hasValidatedView && (
                  <span className="text-[11px] font-medium text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                    Verified View Counted
                  </span>
                )}
              </div>

              {/* Center Play/Pause Large Trigger */}
              <div className="flex items-center justify-center pointer-events-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md">
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
                </div>
              </div>

              {/* Bottom Scrubber & Action Controls */}
              <div className="space-y-2">
                {/* Seek Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek video playback"
                  className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="p-1 hover:text-blue-400">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={toggleMute} aria-label="Toggle mute" className="p-1 hover:text-blue-400">
                        {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        aria-label="Volume slider"
                        className="w-14 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                      {formatSeconds(currentTime)} / {formatSeconds(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={toggleFullscreen} aria-label="Fullscreen" className="p-1 hover:text-blue-400">
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Title */}
          <h1 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
            {video.title}
          </h1>

          {/* Action Row: Creator Info, Subscribe, Likes, Share, Report */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            {/* Creator Left Block */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectCreator(video.creatorId)}
                className="flex items-center gap-2.5 focus:outline-none"
              >
                <img
                  src={video.creatorPhotoURL}
                  alt={video.creatorName}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-700 hover:ring-blue-500 transition"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                      {video.creatorName}
                    </span>
                    <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {(subscribersCount / 1000).toFixed(1)}K subscribers
                  </span>
                </div>
              </button>

              <button
                onClick={handleToggleFollow}
                className={`ml-2 min-h-[40px] px-4 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                  isFollowing
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-slate-900 hover:bg-slate-200 active:scale-95'
                }`}
              >
                {isFollowing ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Action Buttons Right Block */}
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={handleToggleLike}
                className={`flex min-h-[40px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors ${
                  isLiked
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="tabular-nums">{likesCount.toLocaleString()}</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex min-h-[40px] items-center gap-1.5 rounded-xl bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>

              {/* Report Button */}
              <button
                onClick={() => onReportVideo(video)}
                aria-label="Report video"
                className="flex min-h-[40px] h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Description Card (Zero-pill metadata) */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#12141c] p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-400 tabular-nums">
              <span>{validatedViewCount.toLocaleString()} verified views</span>
              <span aria-hidden="true">·</span>
              <span>Category: {video.category}</span>
              <span aria-hidden="true">·</span>
              <span>Published {video.publishedAt?.substring(0, 10) || 'Recently'}</span>
            </div>

            <p className={`whitespace-pre-line leading-relaxed ${showFullDescription ? '' : 'line-clamp-2'}`}>
              {video.description}
            </p>

            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="font-semibold text-blue-400 hover:underline"
            >
              {showFullDescription ? 'Show less' : '...more'}
            </button>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-slate-100 tabular-nums">
              {comments.length} Comments
            </h3>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-3 items-start">
              <img
                src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt="Your avatar"
                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0 mt-1"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Add a comment on this video..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim() || isPostingComment}
                    className="flex min-h-[36px] items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {comments.map((comment) => (
                <div key={comment.commentId} className="flex gap-3 text-xs">
                  <img
                    src={comment.userPhotoURL}
                    alt={comment.userName}
                    className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{comment.userName}</span>
                      <span className="text-[11px] text-slate-500">
                        {comment.createdAt?.substring(0, 10)}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-normal">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Related Videos */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Recommended Videos</h3>
          <div className="space-y-3">
            {relatedVideos.map((item) => (
              <div
                key={item.videoId}
                onClick={() => onSelectRelatedVideo(item)}
                className="group flex gap-3 cursor-pointer rounded-xl border border-transparent p-1.5 hover:border-slate-800 hover:bg-[#12141c] transition"
              >
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                  <img
                    src={item.thumbnailURL}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1 font-mono text-[10px] text-white tabular-nums">
                    {Math.floor(item.duration / 60)}:{item.duration % 60 < 10 ? '0' : ''}{item.duration % 60}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-400 truncate">{item.creatorName}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    {(item.validatedViewCount / 1000).toFixed(1)}K views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
