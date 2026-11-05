import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Gift,
  Shield,
  Tag,
  Compass,
  X,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface CitizenPerksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenSettings: () => void;
}

export const CitizenPerksModal: React.FC<CitizenPerksModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenSettings,
}) => {
  const [claimedPerks, setClaimedPerks] = useState<string[]>([]);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOfficial = currentUser?.role === 'officer' || currentUser?.role === 'admin';
  const honorPoints = currentUser?.honorPoints || 150;

  const perksList = [
    {
      id: 'tax_rebate',
      title: '10% Rebate on GVMC Property Tax',
      pointsRequired: 100,
      category: 'Municipal Rebate',
      description: 'Exclusive 10% deduction on annual Greater Visakhapatnam property or water tax assessment.',
      code: 'GVMC-CITIZEN-TAX10',
      icon: <Tag className="w-5 h-5 text-emerald-500" />,
    },
    {
      id: 'transit_pass',
      title: 'Vizag BRTS & RTC Free Weekly Pass',
      pointsRequired: 75,
      category: 'Public Transit',
      description: '7-day unlimited green transit pass on Visakhapatnam BRTS corridor and coastal electric buses.',
      code: 'VZG-GREEN-TRANSIT7',
      icon: <Compass className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'cafe_discount',
      title: '15% Beach Road Merchant & Cafe Voucher',
      pointsRequired: 50,
      category: 'Local Commerce',
      description: 'Redeemable at 45+ registered local cafes and beachside eateries across RK Beach & Rushikonda.',
      code: 'VIZAG-BEACH-HERO15',
      icon: <Gift className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'civic_medal',
      title: 'Mayor’s Clean City Ambassador Certificate',
      pointsRequired: 120,
      category: 'Civic Recognition',
      description: 'Officially signed digital badge and civic honor recognition by GVMC Municipal Commissioner.',
      code: 'GVMC-HONOR-MEDAL',
      icon: <Award className="w-5 h-5 text-purple-500" />,
    },
  ];

  const handleClaim = (id: string, required: number, title: string) => {
    if (isOfficial) return;
    if (honorPoints < required) {
      alert(`You need ${required} honor points to claim this perk. Current balance: ${honorPoints} points.`);
      return;
    }
    setClaimedPerks((prev) => [...prev, id]);
    setSuccessNotice(`🎉 Successfully claimed: ${title}! Use voucher code during checkout.`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight">Citizen Perks & Rewards</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/20 text-blue-100 uppercase">
                  Citizen Only
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Exclusive benefits for Visakhapatnam residents contributing to civic reporting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Warning if user is Government Official */}
        {isOfficial ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                Access Restricted • Citizen Perk Only
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Government Officials Cannot Access Citizen Perks
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                As a verified GVMC Government Official, your account is authorized to inspect complaints and upload finished photos. Officials cannot claim citizen rewards or points.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                Return to Official Console
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
            {/* Citizen Honor Points Balance Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                  Your Civic Honor Points
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                  {honorPoints} Pts Available
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Earn +25 Pts per verified report & +50 Pts on quality sign-off
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Citizen Tier: Gold
                </span>
              </div>
            </div>

            {successNotice && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Perks Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Available Citizen Rewards & Vouchers
              </span>

              {perksList.map((perk) => {
                const isClaimed = claimedPerks.includes(perk.id);
                const canAfford = honorPoints >= perk.pointsRequired;

                return (
                  <div
                    key={perk.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isClaimed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                        : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        {perk.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {perk.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                            {perk.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                          {perk.description}
                        </p>
                        {isClaimed && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold">
                            <span>Voucher: {perk.code}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {perk.pointsRequired} Points
                      </span>
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Claimed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(perk.id, perk.pointsRequired, perk.title)}
                          disabled={!canAfford}
                          className="mt-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                        >
                          {canAfford ? 'Claim Perk' : 'Need More Points'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
