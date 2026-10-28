import React from 'react';
import { Search, Sun, Moon, Shield, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';

interface TopBarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenAuth: () => void;
  unreadNotificationsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  setActiveScreen,
  onOpenSearch,
  onOpenUpload,
  onOpenAuth,
  unreadNotificationsCount = 2,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090a0f]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark (Single text element + Logo Mark) */}
        <button
          onClick={() => setActiveScreen('home')}
          className="group flex items-center gap-2.5 text-left focus:outline-none shrink-0"
        >
          <img src="/logo.svg" alt="VidZelio" className="h-8 w-8 rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors whitespace-nowrap">
              VidZelio
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop / Tablet) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveScreen('home')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              activeScreen === 'home' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveScreen('studio')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              activeScreen === 'studio' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Creator Studio
          </button>
          <button
            onClick={() => setActiveScreen('monetization')}
            className={`transition-colors whitespace-nowrap hover:text-white ${
              activeScreen === 'monetization' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Earnings &amp; Monetization
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveScreen('admin')}
              className={`flex items-center gap-1.5 transition-colors whitespace-nowrap hover:text-amber-300 ${
                activeScreen === 'admin' ? 'text-amber-400 font-semibold' : 'text-amber-400/80'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Search, Notifications, Theme, Upload & Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            aria-label="Search videos"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveScreen('notifications')}
            aria-label="View notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#090a0f]" />
            )}
          </button>

          {/* Primary CTA: Upload Button (Desktop) */}
          <button
            onClick={onOpenUpload}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 transition-all whitespace-nowrap"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Upload</span>
          </button>

          {/* User Profile Avatar or Sign In */}
          {currentUser ? (
            <button
              onClick={() => setActiveScreen('settings')}
              aria-label="User account settings"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-2 ring-blue-500/50 hover:ring-blue-400 transition"
            >
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="rounded-xl border border-slate-700 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
