import React from 'react';
import { Lock, ArrowRight, Shield, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface AccessRestrictedBannerProps {
  title: string;
  description: string;
  targetRoleName: 'Government Official' | 'Citizen';
  currentRole: UserRole;
  onBackToAllowedView: () => void;
  allowedViewLabel: string;
  onLogout?: () => void;
}

export const AccessRestrictedBanner: React.FC<AccessRestrictedBannerProps> = ({
  title,
  description,
  targetRoleName,
  currentRole,
  onBackToAllowedView,
  allowedViewLabel,
  onLogout,
}) => {
  const isCitizenTryingOfficial = targetRoleName === 'Government Official';

  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-200 dark:border-red-900/60 shadow-xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
          Access Restricted • {targetRoleName} Portal Only
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Role explanation */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs text-left max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
          <span>Your Active Login Role:</span>
          <span className="text-blue-600 dark:text-blue-400 uppercase font-black">
            ● {currentRole.toUpperCase()}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {isCitizenTryingOfficial
            ? 'Citizens cannot access official municipal perks, alter grievance statuses, or upload internal proof photos. Roles are configured at initial login only.'
            : 'Government Officials cannot access citizen perks, point redemption store, or citizen discount vouchers.'}
        </p>
      </div>

      {/* Action Buttons: Return to Allowed Workspace or Sign Out to change role */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onBackToAllowedView}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <span>{allowedViewLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out to Starting Screen</span>
          </button>
        )}
      </div>
    </div>
  );
};
