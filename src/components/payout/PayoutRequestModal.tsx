import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('100.00');
  const [payoutMethod, setPayoutMethod] = useState<'stripe' | 'bank_transfer' | 'paypal'>('stripe');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setError(null);
    setSuccessMessage(null);
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < 50.0) {
      setError('Minimum payout request threshold is $50.00 USD.');
      return;
    }

    if (!destinationAccount.trim()) {
      setError('Please provide your recipient account or routing identifier.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: currentUser.uid,
          amount: numAmount,
          payoutMethod,
          destinationAccount: destinationAccount.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payout request.');
      }

      setSuccessMessage(data.message || 'Payout request submitted successfully.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred submitting request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#12141c] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Request Earnings Payout</h2>
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

        {successMessage ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Request Submitted</h3>
            <p className="text-xs text-slate-300">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Payout Amount (USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-7 pr-3 py-2 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Minimum threshold: $50.00 USD</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Settlement Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="stripe">Stripe Connect (Direct Deposit)</option>
                <option value="bank_transfer">Wire / SEPA Bank Transfer</option>
                <option value="paypal">PayPal Verified Payout</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Recipient Account / Email / IBAN *
              </label>
              <input
                type="text"
                required
                placeholder={
                  payoutMethod === 'paypal'
                    ? 'your-paypal@email.com'
                    : payoutMethod === 'bank_transfer'
                    ? 'IBAN / Routing & Account #'
                    : 'acct_1Nv...'
                }
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-slate-900/60 p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Compliance Review: All payouts are audited against verified ad revenue ledger records to prevent fraudulent activity.
              </span>
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
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-sm"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
