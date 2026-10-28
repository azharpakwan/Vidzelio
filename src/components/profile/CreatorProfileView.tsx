import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft, Film } from 'lucide-react';
import type { UserProfile, VideoItem } from '../../types/index.ts';
import { VideoCard } from '../feed/VideoCard.tsx';

interface CreatorProfileViewProps {
  creatorId: string;
  onBack: () => void;
  onSelectVideo: (video: VideoItem) => void;
  onReportVideo: (video: VideoItem) => void;
}

export const CreatorProfileView: React.FC<CreatorProfileViewProps> = ({
  creatorId,
  onBack,
  onSelectVideo,
  onReportVideo,
}) => {
  const [creator, setCreator] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/users/${creatorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCreator(data.user);
          setSubscribersCount(data.user.subscribersCount);
        }
        if (data.videos) {
          setVideos(data.videos);
        }
      })
      .catch((err) => console.warn('Could not load creator profile:', err))
      .finally(() => setIsLoading(false));
  }, [creatorId]);

  const toggleFollow = async () => {
    const next = !isFollowing;
    setIsFollowing(next);
    setSubscribersCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await fetch(`/api/creators/${creatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFollowing }),
      });
    } catch (e) {
      console.warn('Follow error:', e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-6 pb-24">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      {/* Channel Header Banner */}
      <div className="relative h-36 sm:h-52 w-full rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
      </div>

      {/* Creator Info Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 px-4">
        <div className="flex items-end gap-4">
          <img
            src={creator?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={creator?.displayName}
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-[#090a0f] shadow-xl"
            referrerPolicy="no-referrer"
          />
          <div className="pb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1.5">
              <span>{creator?.displayName || 'Creator'}</span>
              <CheckCircle className="h-4 w-4 text-blue-400" />
            </h1>
            <p className="text-xs text-slate-400 font-mono">@{creator?.username || creatorId}</p>
            <p className="text-xs text-slate-300 mt-0.5 tabular-nums">
              {(subscribersCount / 1000).toFixed(1)}K subscribers · {videos.length} videos
            </p>
          </div>
        </div>

        <button
          onClick={toggleFollow}
          className={`min-h-[44px] px-6 rounded-xl text-xs font-semibold transition-all shadow-md ${
            isFollowing
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-white text-slate-900 hover:bg-slate-200 active:scale-95'
          }`}
        >
          {isFollowing ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      {/* Creator Bio */}
      {creator?.bio && (
        <div className="px-4 text-xs text-slate-300 max-w-2xl leading-relaxed">
          {creator.bio}
        </div>
      )}

      {/* Channel Video Grid */}
      <div className="pt-4 border-t border-slate-800">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Film className="h-4 w-4 text-blue-400" />
          <span>Videos</span>
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading channel videos...</div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No videos available on this channel.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((vid) => (
              <VideoCard
                key={vid.videoId}
                video={vid}
                onSelectVideo={onSelectVideo}
                onSelectCreator={() => {}}
                onReportVideo={onReportVideo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
