import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play } from 'lucide-react';
import type { VideoItem } from '../../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVideo,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/videos?search=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.videos) setResults(data.videos);
        })
        .catch((err) => console.warn('Search query error:', err))
        .finally(() => setIsSearching(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 pt-16">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#12141c] p-4 shadow-2xl space-y-4">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title, creator handle, or topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {isSearching && (
            <div className="py-6 text-center text-xs text-slate-400">Searching VidZelio streams...</div>
          )}

          {!isSearching && query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No videos matching "{query}". Try searching "VFX", "Silicon", or "Blender".
            </div>
          )}

          {results.map((video) => (
            <div
              key={video.videoId}
              onClick={() => {
                onSelectVideo(video);
                onClose();
              }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition"
            >
              <div className="relative aspect-video w-24 shrink-0 rounded-lg overflow-hidden bg-slate-900">
                <img
                  src={video.thumbnailURL}
                  alt={video.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">{video.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{video.creatorName}</p>
                <p className="text-[10px] text-slate-500 font-mono tabular-nums">
                  {(video.validatedViewCount / 1000).toFixed(1)}K views · {video.category}
                </p>
              </div>
              <Play className="h-4 w-4 text-blue-400 shrink-0 opacity-60" />
            </div>
          ))}

          {!query && (
            <div className="py-6 px-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Suggested searches</span>
              <div className="flex flex-wrap gap-2">
                {['Tears of Steel', 'Cloudflare Stream', 'GPU Architecture', 'Marathon Training', 'CGI Breakdown'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
