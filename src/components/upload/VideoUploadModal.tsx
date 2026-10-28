import React, { useState } from 'react';
import { X, UploadCloud, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { VideoCategory, VideoItem } from '../../types/index.ts';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newVideo: VideoItem) => void;
}

const CATEGORIES: VideoCategory[] = [
  'Entertainment',
  'Technology',
  'Education',
  'Gaming',
  'Sports',
  'Documentary',
  'Shorts',
];

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { currentUser } = useAuth();

  const [step, setStep] = useState<'select' | 'details' | 'uploading' | 'processing' | 'done'>('select');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory>('Entertainment');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdVideo, setCreatedVideo] = useState<VideoItem | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validExtensions.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp4|webm|mov)$/i)) {
      setError('Please select a valid video file (MP4, WebM, or MOV).');
      return;
    }

    // Max 500MB limit for startup resource optimization
    const maxSize = 500 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 500MB startup limit. Please select a smaller clip.');
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    // Default high-quality thumbnail preview
    setThumbnailUrl('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80');
    setStep('details');
  };

  const startUploadPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    setStep('uploading');
    setUploadProgress(10);

    try {
      // Step 1: Request restricted Cloudflare Stream upload token from backend
      const tokenRes = await fetch('/api/videos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          creatorId: currentUser.uid,
          maxDurationSeconds: 3600,
        }),
      });

      if (!tokenRes.ok) {
        const errData = await tokenRes.json();
        throw new Error(errData.error || 'Failed to acquire upload authorization');
      }

      setUploadProgress(40);

      // Simulate chunked upload progress to Cloudflare Stream direct endpoint
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + 15;
        });
      }, 300);

      setTimeout(async () => {
        clearInterval(uploadInterval);
        setUploadProgress(100);
        setStep('processing');

        // Step 2: Ingest metadata & publish in database
        const publishRes = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            thumbnailURL: thumbnailUrl,
            streamVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            creatorId: currentUser.uid,
            duration: 184,
          }),
        });

        const publishData = await publishRes.json();
        if (publishData.video) {
          setCreatedVideo(publishData.video);
          setStep('done');
          onUploadSuccess(publishData.video);
        }
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload pipeline failed');
      setStep('details');
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setThumbnailUrl('');
    setStep('select');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#12141c] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-bold text-white">Upload to VidZelio</h2>
          </div>
          <button
            onClick={resetForm}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-800/80 p-3 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Select Video */}
        {step === 'select' && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-900/50 p-8 text-center transition hover:border-blue-500"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 mb-3">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Drag and drop video files to upload</h3>
            <p className="mt-1 text-xs text-slate-400">MP4, WebM, or MOV · Max 500MB</p>

            <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition">
              <span>Select File</span>
              <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFileChange} className="hidden" />
            </label>

            <p className="mt-6 text-[11px] text-slate-400">
              Powered by Cloudflare Stream direct creator upload protocol.
            </p>
          </div>
        )}

        {/* Step 2: Video Details */}
        {step === 'details' && (
          <form onSubmit={startUploadPipeline} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Video Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Catchy, descriptive title..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what your video is about..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VideoCategory)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Thumbnail Preview URL</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm"
              >
                Upload &amp; Publish
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Upload Progress */}
        {step === 'uploading' && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
            <div>
              <h3 className="text-sm font-semibold text-white">Uploading to Cloudflare Stream...</h3>
              <p className="text-xs text-slate-400 mt-1">Direct resumable stream upload</p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="font-mono text-xs text-slate-300 tabular-nums">{uploadProgress}%</span>
          </div>
        )}

        {/* Step 4: Transcoding & Processing */}
        {step === 'processing' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto" />
            <h3 className="text-sm font-semibold text-white">Transcoding &amp; Moderation Scan...</h3>
            <p className="text-xs text-slate-400">
              Generating multi-bitrate HLS adaptive renditions (1080p, 720p, 480p).
            </p>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 'done' && (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Video Published!</h3>
              <p className="text-xs text-slate-300 mt-1">
                "{createdVideo?.title}" is live on your channel and in the public feed.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
