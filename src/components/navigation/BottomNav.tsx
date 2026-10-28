import React from 'react';
import { Home, Compass, PlusCircle, DollarSign, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface BottomNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onOpenUpload: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  setActiveScreen,
  onOpenUpload,
}) => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-800 bg-[#090a0f]/95 backdrop-blur-lg pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveScreen('home')}
          className={`flex min-h-[44px] flex-col items-center justify-center py-1 transition-colors ${
            activeScreen === 'home' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Home</span>
        </button>

        {/* Tab 2: Studio / Categories */}
        <button
          onClick={() => setActiveScreen('studio')}
          className={`flex min-h-[44px] flex-col items-center justify-center py-1 transition-colors ${
            activeScreen === 'studio' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Studio</span>
        </button>

        {/* Tab 3: Upload Center (Prominent CTA) */}
        <button
          onClick={onOpenUpload}
          aria-label="Upload Video"
          className="flex min-h-[44px] flex-col items-center justify-center py-1 text-slate-300 hover:text-white group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-md shadow-blue-500/25 group-active:scale-95 transition-transform">
            <PlusCircle className="h-6 w-6" />
          </div>
        </button>

        {/* Tab 4: Monetization / Earn */}
        <button
          onClick={() => setActiveScreen('monetization')}
          className={`flex min-h-[44px] flex-col items-center justify-center py-1 transition-colors ${
            activeScreen === 'monetization' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="h-5 w-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Earn</span>
        </button>

        {/* Tab 5: Profile / Admin */}
        {isAdmin ? (
          <button
            onClick={() => setActiveScreen('admin')}
            className={`flex min-h-[44px] flex-col items-center justify-center py-1 transition-colors ${
              activeScreen === 'admin' ? 'text-amber-400' : 'text-amber-400/70 hover:text-amber-300'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveScreen('settings')}
            className={`flex min-h-[44px] flex-col items-center justify-center py-1 transition-colors ${
              activeScreen === 'settings' ? 'text-blue-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
            <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">You</span>
          </button>
        )}
      </div>
    </nav>
  );
};
