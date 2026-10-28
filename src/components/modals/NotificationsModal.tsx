import React from 'react';
import { X, Bell, DollarSign, Film, MessageSquare, ShieldCheck } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  type: 'earnings' | 'upload' | 'comment' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'earnings',
    title: 'Ad Revenue Ledger Finalized',
    message: '$64.10 USD has cleared verification and been transferred to your payable balance.',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: 'notif_2',
    type: 'comment',
    title: 'New Comment on Tears of Steel',
    message: 'Alex Rivers: "The robotic arm rotoscoping around minute 4:20 was masterclass execution."',
    time: '1 day ago',
    isRead: false,
  },
  {
    id: 'notif_3',
    type: 'system',
    title: 'Stream Transcoding Completed',
    message: 'Your Cloudflare Stream video renditions (1080p, 720p, 480p) are ready for global edge playback.',
    time: '3 days ago',
    isRead: true,
  },
  {
    id: 'notif_4',
    type: 'upload',
    title: 'New Video from Alex Rivers',
    message: 'Alex Rivers uploaded "Next-Gen Mobile GPU Architecture".',
    time: '5 days ago',
    isRead: true,
  },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm p-4 pt-16">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#12141c] p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {SAMPLE_NOTIFICATIONS.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                n.isRead
                  ? 'border-slate-800/80 bg-slate-900/40 text-slate-300'
                  : 'border-blue-800/50 bg-blue-950/20 text-white'
              }`}
            >
              <div className="mt-0.5 rounded-lg p-1.5 bg-slate-800 shrink-0">
                {n.type === 'earnings' && <DollarSign className="h-4 w-4 text-emerald-400" />}
                {n.type === 'comment' && <MessageSquare className="h-4 w-4 text-blue-400" />}
                {n.type === 'system' && <ShieldCheck className="h-4 w-4 text-purple-400" />}
                {n.type === 'upload' && <Film className="h-4 w-4 text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold">{n.title}</span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
