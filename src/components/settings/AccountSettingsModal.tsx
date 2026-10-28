import React, { useState } from 'react';
import { X, User, Trash2, LogOut, Check, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToAdmin: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onSwitchToAdmin,
}) => {
  const { currentUser, updateProfile, deleteAccount, logout, availableAccounts, switchAccount } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ displayName, bio });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#12141c] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Account Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Demo Fast Account Switcher */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Switch Test Role &amp; Identity
          </span>
          <div className="grid grid-cols-2 gap-2">
            {availableAccounts.map((acc) => (
              <button
                key={acc.uid}
                onClick={() => {
                  switchAccount(acc.uid);
                  setDisplayName(acc.displayName);
                  setBio(acc.bio);
                  if (acc.role === 'admin') onSwitchToAdmin();
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition text-xs ${
                  currentUser.uid === acc.uid
                    ? 'border-blue-500 bg-blue-950/40 text-white font-semibold'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <img
                  src={acc.photoURL}
                  alt={acc.displayName}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="truncate font-medium">{acc.displayName}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{acc.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Channel Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm transition"
            >
              {isSaved ? <Check className="h-3.5 w-3.5" /> : null}
              <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </form>

        {/* Account Deletion Workflow (Requirement 11) */}
        <div className="pt-3 border-t border-slate-800">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Account &amp; Content</span>
            </button>
          ) : (
            <div className="rounded-xl border border-red-800/80 bg-red-950/40 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-red-300 font-semibold text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>Confirm Account Deletion</span>
              </div>
              <p className="text-[11px] text-red-200/90 leading-relaxed">
                This will purge your profile, remove active video streams, and cancel all unconfirmed ad balance. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
