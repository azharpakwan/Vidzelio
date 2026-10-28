import React, { useState, useEffect } from 'react';
import { Film, Eye, Users, Plus, Play, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { VideoItem } from '../../types/index.ts';

interface CreatorStudioProps {
  onOpenUpload: () => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  onOpenUpload,
  onSelectVideo,
}) => {
  const { currentUser } = useAuth();
  const [creatorVideos, setCreatorVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);
    fetch(`/api/videos?creatorId=${currentUser.uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.videos) {
          setCreatorVideos(data.videos);
        }
      })
      .catch((err) => console.warn('Could not load creator videos:', err))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const totalValidatedViews = creatorVideos.reduce((acc, v) => acc + v.validatedViewCount, 0);
  const totalWatchHoursEstimated = Math.round(
    creatorVideos.reduce((acc, v) => acc + (v.validatedViewCount * v.duration) / 3600, 0)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 pb-24">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Creator Studio</span>
            <span className="text-xs font-normal text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded-lg">
              Channel Dashboard
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Manage your content, monitor verified playback duration, and grow your audience.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Channel Analytics Strip (Tabular numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Subscribers */}
        <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Subscribers</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {(currentUser?.subscribersCount || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 inline-block">+140 this month</span>
        </div>

        {/* Metric 2: Validated Views */}
        <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Verified Views</span>
            <Eye className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalValidatedViews.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Strict 30s/50% authenticated plays
          </span>
        </div>

        {/* Metric 3: Estimated Watch Time */}
        <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Est. Watch Time</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalWatchHoursEstimated.toLocaleString()} hrs
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">4,000 hrs required for Partner</span>
        </div>

        {/* Metric 4: Cloudflare Stream Status */}
        <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Stream CDN</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">Operational</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Direct creator uploads active
          </span>
        </div>
      </div>

      {/* Videos Management Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#12141c] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Film className="h-4 w-4 text-blue-400" />
            <span>Uploaded Videos ({creatorVideos.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Click any video to test playback</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading videos...</div>
        ) : creatorVideos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Film className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No videos uploaded yet</h3>
            <p className="text-xs text-slate-500">
              Publish your first video to start growing your audience and earning ad revenue.
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <tr>
                  <th className="px-5 py-3">Video</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Verified Views</th>
                  <th className="px-5 py-3 text-right">Likes</th>
                  <th className="px-5 py-3 text-right">Comments</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {creatorVideos.map((vid) => (
                  <tr key={vid.videoId} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={vid.thumbnailURL}
                          alt={vid.title}
                          className="h-10 w-16 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <p className="font-semibold text-white truncate">{vid.title}</p>
                          <p className="text-[11px] text-slate-500">
                            {vid.publishedAt?.substring(0, 10) || vid.createdAt?.substring(0, 10)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>Published</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                      {vid.category}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-200 tabular-nums">
                      {vid.validatedViewCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-200 tabular-nums">
                      {vid.likesCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-200 tabular-nums">
                      {vid.commentsCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectVideo(vid)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-blue-400 hover:bg-slate-700 transition"
                      >
                        <Play className="h-3 w-3" />
                        <span>Play</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
