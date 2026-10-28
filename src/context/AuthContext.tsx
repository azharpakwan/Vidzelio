import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types/index.ts';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (username: string, displayName: string, email: string) => Promise<boolean>;
  logout: () => void;
  switchAccount: (uid: string) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  availableAccounts: UserProfile[];
}

const DEFAULT_ACCOUNTS: UserProfile[] = [
  {
    uid: 'usr_alex_tech',
    username: 'alex_tech',
    displayName: 'Alex Rivers',
    email: 'alex@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Building the future of spatial computing and mobile video. Tech reviews & code deep-dives.',
    role: 'creator',
    accountStatus: 'active',
    subscribersCount: 24800,
    isMonetized: true,
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    uid: 'usr_elena_cinema',
    username: 'elena_vfx',
    displayName: 'Elena Rostova',
    email: 'elena@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Cinema Director & CGI Artist. Showcasing open-source digital cinema and documentary storytelling.',
    role: 'creator',
    accountStatus: 'active',
    subscribersCount: 15300,
    isMonetized: true,
    createdAt: '2025-02-14T08:30:00Z',
  },
  {
    uid: 'usr_sarah_fitness',
    username: 'sarah_trains',
    displayName: 'Sarah Jenkins',
    email: 'sarah@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Certified physical trainer. High-energy mobility drills, functional workouts & daily health hacks.',
    role: 'creator',
    accountStatus: 'active',
    subscribersCount: 8900,
    isMonetized: true,
    createdAt: '2025-03-01T12:00:00Z',
  },
  {
    uid: 'usr_admin_master',
    username: 'vidzelio_admin',
    displayName: 'VidZelio Admin Console',
    email: 'admin@vidzelio.internal',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Platform trust, safety, moderation, and financial compliance officer.',
    role: 'admin',
    accountStatus: 'active',
    subscribersCount: 0,
    isMonetized: false,
    createdAt: '2024-12-01T00:00:00Z',
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vidzelio_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ACCOUNTS[0];
      }
    }
    return DEFAULT_ACCOUNTS[0]; // Default logged in as creator for rich instant preview
  });

  const [availableAccounts, setAvailableAccounts] = useState<UserProfile[]>(DEFAULT_ACCOUNTS);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vidzelio_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vidzelio_user');
    }
  }, [currentUser]);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Find matching account or create viewer
    const existing = availableAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      return true;
    }

    // Login as custom user
    const newUser: UserProfile = {
      uid: `usr_${Date.now()}`,
      username: email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
      displayName: email.split('@')[0],
      email,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'VidZelio community member.',
      role: 'viewer',
      accountStatus: 'active',
      subscribersCount: 0,
      isMonetized: false,
      createdAt: new Date().toISOString(),
    };

    setAvailableAccounts((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const signup = async (username: string, displayName: string, email: string): Promise<boolean> => {
    const newUser: UserProfile = {
      uid: `usr_${Date.now()}`,
      username: username.toLowerCase().trim(),
      displayName: displayName.trim(),
      email: email.toLowerCase().trim(),
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'New creator on VidZelio.',
      role: 'creator',
      accountStatus: 'active',
      subscribersCount: 0,
      isMonetized: false,
      createdAt: new Date().toISOString(),
    };

    setAvailableAccounts((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchAccount = (uid: string) => {
    const target = availableAccounts.find((a) => a.uid === uid);
    if (target) {
      setCurrentUser(target);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAvailableAccounts((prev) => prev.map((a) => (a.uid === updated.uid ? updated : a)));

    try {
      await fetch(`/api/users/${currentUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('Backend sync deferred:', e);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      await fetch(`/api/users/${currentUser.uid}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend deletion call:', e);
    }

    setAvailableAccounts((prev) => prev.filter((a) => a.uid !== currentUser.uid));
    setCurrentUser(null);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        isCreator: currentUser?.role === 'creator',
        login,
        signup,
        logout,
        switchAccount,
        updateProfile,
        deleteAccount,
        availableAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
