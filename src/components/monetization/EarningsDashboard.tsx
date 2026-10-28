import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, ShieldCheck, ArrowUpRight, History, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { CreatorEarnings, PayoutRequest } from '../../types/index.ts';

interface EarningsDashboardProps {
  onOpenPayoutModal: () => void;
}

export const EarningsDashboard: React.FC<EarningsDashboardProps> = ({
  onOpenPayoutModal,
}) => {
  const { currentUser } = useAuth();
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSandboxMode, setIsSandboxMode] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);

    Promise.all([
      fetch(`/api/monetization/overview?creatorId=${currentUser.uid}`).then((r) => r.json()),
      fetch(`/api/payouts?creatorId=${currentUser.uid}`).then((r) => r.json()),
    ])
      .then(([monetizationData, payoutsData]) => {
        if (monetizationData.earnings) setEarnings(monetizationData.earnings);
        if (payoutsData.payouts) setPayouts(payoutsData.payouts);
      })
      .catch((err) => console.warn('Monetization data load error:', err))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const eligibility = earnings?.eligibility || {
    subscribers: 0,
    requiredSubscribers: 1000,
    watchHours: 0,
    requiredWatchHours: 4000,
    isEligible: false,
  };

  const subPercent = Math.min(100, Math.round((eligibility.subscribers / eligibility.requiredSubscribers) * 100));
  const watchPercent = Math.min(100, Math.round((eligibility.watchHours / eligibility.requiredWatchHours) * 100));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Monetization &amp; Ad Revenue Ledger</h1>
            {isSandboxMode && (
              <span className="rounded-lg border border-amber-600/40 bg-amber-950/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                Sandbox Test Mode
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Transparent revenue-sharing ledger funded by verified advertising impressions.
          </p>
        </div>

        {/* Sandbox Switch */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isSandboxMode}
              onChange={(e) => setIsSandboxMode(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0"
            />
            <span>Simulate Sandbox Ledger</span>
          </label>

          <button
            onClick={onOpenPayoutModal}
            disabled={!earnings || earnings.payableBalance < 50}
            className="flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <DollarSign className="h-4 w-4" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Transparency Callout */}
      <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-4 text-xs text-blue-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white">Auditable Revenue-Sharing Policy:</span>
          <p className="leading-relaxed text-blue-200/90">
            Raw video views do NOT automatically generate earnings. Payouts are exclusively funded by verified advertising impressions (60% Creator Share / 40% Platform Infrastructure Reserve). Suspicious or automated traffic is purged before ledger finalization. Minimum payout threshold is $50.00 USD.
          </p>
        </div>
      </div>

      {/* Financial Overview Cards (Tabular figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Confirmed Payable Balance */}
        <div className="rounded-2xl border border-emerald-800/60 bg-[#12141c] p-4 relative overflow-hidden">
          <div className="text-xs font-medium text-emerald-400 flex items-center justify-between">
            <span>Payable Balance</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="mt-2 text-3xl font-bold font-mono text-white tabular-nums">
            ${(earnings?.payableBalance || 0).toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Ready for payout withdrawal</p>
        </div>

        {/* Card 2: Pending Ad Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4">
          <div className="text-xs font-medium text-amber-400 flex items-center justify-between">
            <span>Pending Clearance</span>
            <History className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            ${(earnings?.pendingBalance || 0).toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Current cycle impressions (Net 30)</p>
        </div>

        {/* Card 3: 60% Creator Split */}
        <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4">
          <div className="text-xs font-medium text-blue-400 flex items-center justify-between">
            <span>Creator Revenue Share</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">60.0%</div>
          <p className="mt-1 text-[11px] text-slate-400">40% platform CDN &amp; encoding fee</p>
        </div>

        {/* Card 4: Lifetime Verified Ad Impressions */}
        <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-4">
          <div className="text-xs font-medium text-purple-400 flex items-center justify-between">
            <span>Verified Ad Impressions</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {(earnings?.verifiedAdImpressions || 0).toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">eCPM dynamic rate: ~$4.80</p>
        </div>
      </div>

      {/* Monetization Partner Eligibility Progress */}
      <div className="rounded-2xl border border-slate-800 bg-[#12141c] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">VidZelio Partner Program Eligibility</h2>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-lg">
            Eligible &amp; Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Requirement 1: Subscribers */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Audience Subscribers</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {eligibility.subscribers.toLocaleString()} / {eligibility.requiredSubscribers.toLocaleString()} ({subPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${subPercent}%` }} />
            </div>
          </div>

          {/* Requirement 2: Watch Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Public Watch Hours (Last 365 Days)</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {eligibility.watchHours.toLocaleString()} / {eligibility.requiredWatchHours.toLocaleString()} hrs ({watchPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${watchPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Payout History Ledger */}
      <div className="rounded-2xl border border-slate-800 bg-[#12141c] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" />
            <span>Payout History &amp; Settlement Ledger</span>
          </h2>
          <span className="text-xs text-slate-400">Auditable transaction log</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading payout records...</div>
        ) : payouts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No payout requests submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <tr>
                  <th className="px-5 py-3">Payout ID</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Reference / Notes</th>
                  <th className="px-5 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {payouts.map((p) => (
                  <tr key={p.payoutId} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{p.payoutId}</td>
                    <td className="px-5 py-3 font-mono font-bold text-white tabular-nums">
                      ${p.amount.toFixed(2)} {p.currency}
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-300">{p.payoutMethod.replace('_', ' ')}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {p.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Paid</span>
                        </span>
                      )}
                      {p.status === 'pending_review' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          <span>In Review</span>
                        </span>
                      )}
                      {p.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                      {p.paymentReference || p.notes || '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-500">
                      {p.createdAt.substring(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
