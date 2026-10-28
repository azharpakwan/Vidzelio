import React, { useState } from 'react';
import { X, Flag, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { VideoItem } from '../../types/index.ts';

interface ReportModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ video, onClose }) => {
  const [reason, setReason] = useState<'copyright' | 'harmful_content' | 'hate_speech' | 'spam_fraud' | 'misinformation'>('copyright');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.videoId,
          reason,
          details,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit report');
      setIsDone(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#12141c] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-400" />
            <h2 className="text-base font-bold text-white">Report Video</h2>
          </div>
          <button
            onClick={onClose}
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

        {isDone ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Report Received</h3>
            <p className="text-xs text-slate-300">
              Our Trust &amp; Safety team has flagged this video for compliance review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs text-slate-300 font-semibold mb-2 line-clamp-1">
                "{video.title}"
              </p>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reason for report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="copyright">Copyright or Intellectual Property Infringement</option>
                <option value="harmful_content">Harmful or Dangerous Content</option>
                <option value="hate_speech">Hate Speech or Harassment</option>
                <option value="spam_fraud">Spam, Phishing, or Fraud</option>
                <option value="misinformation">Misleading Information</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Additional Details</label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe timestamps, source ownership, or violation details..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition shadow-sm"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Submit Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
