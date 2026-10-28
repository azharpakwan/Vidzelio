/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * VidZelio Video Sharing & Creator Monetization Platform
 * Tagline: Watch. Create. Earn.
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { TopBar } from './components/navigation/TopBar.tsx';
import { BottomNav } from './components/navigation/BottomNav.tsx';
import { VideoCard } from './components/feed/VideoCard.tsx';
import { VideoPlayerView } from './components/player/VideoPlayerView.tsx';
import { CreatorStudio } from './components/studio/CreatorStudio.tsx';
import { EarningsDashboard } from './components/monetization/EarningsDashboard.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { CreatorProfileView } from './components/profile/CreatorProfileView.tsx';
import { VideoUploadModal } from './components/upload/VideoUploadModal.tsx';
import { SearchModal } from './components/modals/SearchModal.tsx';
import { NotificationsModal } from './components/modals/NotificationsModal.tsx';
import { ReportModal } from './components/modals/ReportModal.tsx';
import { AuthModal } from './components/modals/AuthModal.tsx';
import { OnboardingModal } from './components/modals/OnboardingModal.tsx';
import { PayoutRequestModal } from './components/payout/PayoutRequestModal.tsx';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt.tsx';
import { AccountSettingsModal } from './components/settings/AccountSettingsModal.tsx';
import type { VideoCategory, VideoItem } from './types/index.ts';
import { RefreshCw, Sparkles, Smartphone, Layers, CheckCircle2 } from 'lucide-react';

const CATEGORIES: VideoCategory[] = [
  'All',
  'Entertainment',
  'Technology',
  'Education',
  'Gaming',
  'Sports',
  'Documentary',
  'Shorts',
];

function MainApp() {
  const { currentUser, isAdmin } = useAuth();

  // Screen router state
  const [activeScreen, setActiveScreen] = useState<'home' | 'studio' | 'monetization' | 'admin' | 'settings' | 'watch' | 'creator-profile'>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reportingVideo, setReportingVideo] = useState<VideoItem | null>(null);

  // Video feed state
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Videos Feed
  const fetchFeed = (category: VideoCategory = selectedCategory) => {
    setIsLoading(true);
    const catQuery = category !== 'All' ? `?category=${category}` : '';
    fetch(`/api/videos${catQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.videos) {
          setVideos(data.videos);
        }
      })
      .catch((err) => console.warn('Feed load error:', err))
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchFeed(selectedCategory);
  }, [selectedCategory]);

  // Check URL query parameters for direct video playback links (e.g. ?v=vid_tears_of_steel)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    if (videoId) {
      fetch(`/api/videos/${videoId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.video) {
            setSelectedVideo(data.video);
            setActiveScreen('watch');
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setActiveScreen('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCreator = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    setActiveScreen('creator-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadSuccess = (newVideo: VideoItem) => {
    setVideos((prev) => [newVideo, ...prev]);
    // Switch to studio or open video
    setActiveScreen('home');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFeed(selectedCategory);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Bar with Top Bar Contract */}
      <TopBar
        activeScreen={activeScreen}
        setActiveScreen={(s) => {
          if (s === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveScreen(s as any);
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* SCREEN 1: VIDEO PLAYER */}
        {activeScreen === 'watch' && selectedVideo && (
          <VideoPlayerView
            video={selectedVideo}
            onBack={() => setActiveScreen('home')}
            onSelectCreator={handleSelectCreator}
            onSelectRelatedVideo={handleSelectVideo}
            onReportVideo={(v) => setReportingVideo(v)}
          />
        )}

        {/* SCREEN 2: CREATOR CHANNEL PROFILE */}
        {activeScreen === 'creator-profile' && selectedCreatorId && (
          <CreatorProfileView
            creatorId={selectedCreatorId}
            onBack={() => setActiveScreen('home')}
            onSelectVideo={handleSelectVideo}
            onReportVideo={(v) => setReportingVideo(v)}
          />
        )}

        {/* SCREEN 3: CREATOR STUDIO */}
        {activeScreen === 'studio' && (
          <CreatorStudio
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {/* SCREEN 4: MONETIZATION & EARNINGS DASHBOARD */}
        {activeScreen === 'monetization' && (
          <EarningsDashboard
            onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
          />
        )}

        {/* SCREEN 5: ADMIN CONSOLE */}
        {activeScreen === 'admin' && (
          <AdminDashboard />
        )}

        {/* SCREEN 6: HOME FEED */}
        {activeScreen === 'home' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-4 pb-24">
            {/* Top Info Banner for Android & Architecture Notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-900/40 bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900/50 p-3.5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0">
                  VZ
                </span>
                <div>
                  <span className="font-bold text-white">VidZelio Platform</span>
                  <span className="text-slate-400"> — Mobile-First Video &amp; Verified Ad Revenue Sharing</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PWAInstallPrompt />
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Architecture &amp; Docs
                </button>
              </div>
            </div>

            {/* Interactive Category Segmented Filter Bar */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Refresh control */}
              <button
                onClick={handleRefresh}
                title="Refresh Feed"
                className="flex min-h-[38px] h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white transition shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>

            {/* Video Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-slate-900/60 p-3 space-y-3">
                    <div className="aspect-video w-full rounded-xl bg-slate-800" />
                    <div className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-800 rounded w-5/6" />
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="p-16 text-center space-y-3 rounded-2xl border border-slate-800 bg-[#12141c]">
                <Sparkles className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No videos in this category</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Be the first creator to upload a video in {selectedCategory}.
                </p>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm"
                >
                  Upload Video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                {videos.map((vid) => (
                  <VideoCard
                    key={vid.videoId}
                    video={vid}
                    onSelectVideo={handleSelectVideo}
                    onSelectCreator={handleSelectCreator}
                    onReportVideo={(v) => setReportingVideo(v)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Mobile Bottom Tab Bar (Ergonomic Thumb Zone) */}
      <BottomNav
        activeScreen={activeScreen}
        setActiveScreen={(s) => {
          if (s === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveScreen(s as any);
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Modals */}
      <VideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectVideo={handleSelectVideo}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <ReportModal
        video={reportingVideo}
        onClose={() => setReportingVideo(null)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <PayoutRequestModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onSuccess={() => fetchFeed()}
      />

      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSwitchToAdmin={() => setActiveScreen('admin')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
