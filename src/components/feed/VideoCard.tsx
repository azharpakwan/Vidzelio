import React from 'react';
import type { VideoItem } from '../../types/index.ts';
import { MoreVertical, CheckCircle, Share2, Flag } from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onSelectCreator: (creatorId: string) => void;
  onReportVideo: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelectVideo,
  onSelectCreator,
  onReportVideo,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  // Format video duration seconds -> MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format view counts into human-readable compact numbers (e.g. 14.2K)
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    }
    if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Relative time format
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800/80 bg-[#12141c] hover:border-slate-700/80 transition-all duration-200 overflow-hidden">
      {/* Thumbnail Container (16:9 Aspect Ratio) */}
      <div
        onClick={() => onSelectVideo(video)}
        className="relative aspect-video w-full cursor-pointer overflow-hidden bg-slate-900"
      >
        <img
          src={video.thumbnailURL}
          alt={video.title}
          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // High-fidelity CSS fallback if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Measured Scrim for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white shadow-sm tabular-nums">
          {formatDuration(video.duration)}
        </div>

        {/* Category quiet kicker */}
        <div className="absolute top-2 left-2 text-[10px] font-semibold tracking-wide text-white/90 uppercase drop-shadow-md">
          {video.category}
        </div>
      </div>

      {/* Video Info Section */}
      <div className="flex gap-3 p-3.5">
        {/* Creator Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectCreator(video.creatorId);
          }}
          className="flex-shrink-0 group/avatar focus:outline-none"
        >
          <img
            src={video.creatorPhotoURL}
            alt={video.creatorName}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-700 group-hover/avatar:ring-blue-500 transition"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onSelectVideo(video)}
            className="cursor-pointer text-sm font-semibold text-slate-100 line-clamp-2 leading-snug hover:text-blue-400 transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Creator Name */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectCreator(video.creatorId);
            }}
            className="mt-1 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="truncate">{video.creatorName}</span>
            <CheckCircle className="h-3 w-3 text-blue-400 shrink-0" />
          </button>

          {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 tabular-nums">
            <span>{formatViews(video.validatedViewCount)} views</span>
            <span aria-hidden="true">·</span>
            <span>{formatTimeAgo(video.publishedAt || video.createdAt)}</span>
          </div>
        </div>

        {/* Options Menu Trigger */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            aria-label="Video options"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-700 bg-[#1a1d29] p-1.5 shadow-xl"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigator.clipboard.writeText(window.location.origin + '?v=' + video.videoId);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Link</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onReportVideo(video);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Report Content</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
