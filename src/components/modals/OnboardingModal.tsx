import React from 'react';
import { X, Play, Film, DollarSign, Smartphone, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-[#12141c] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header with App Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="VidZelio" className="h-10 w-10 rounded-xl shadow-lg" />
            <div>
              <h2 className="text-xl font-extrabold text-white">Welcome to VidZelio</h2>
              <p className="text-xs font-semibold text-blue-400">Watch. Create. Earn.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3 Pillars */}
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 shrink-0">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">1. Watch High-Bitrate Video</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Adaptive HLS multi-bitrate streaming powered by Cloudflare Stream edge CDN with responsive mobile playback.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 shrink-0">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">2. Direct Creator Uploads</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Resumable uploads via temporary restricted backend tokens. Uploads are transcoded and screened for policy safety.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">3. Verified Monetization Ledger</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                No fake views. 60% of verified net advertising revenue is credited directly to creator accounts with auditable payout settlement.
              </p>
            </div>
          </div>
        </div>

        {/* Android Packaging Note */}
        <div className="rounded-2xl border border-slate-800 bg-[#090a0f] p-3.5 text-xs text-slate-400 flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">Android Packaging Ready:</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Built with mobile touch zones (375px–430px) and PWA manifest. To generate an Android APK, run <code className="text-blue-300 font-mono">npm run build</code> and <code className="text-blue-300 font-mono">npx cap add android</code>.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onClose}
          className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 active:scale-98 transition"
        >
          <span>Explore VidZelio</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
