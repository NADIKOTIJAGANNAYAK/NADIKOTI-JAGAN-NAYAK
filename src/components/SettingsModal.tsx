import React from 'react';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  User,
  Shield,
  Building2,
  X,
  LogOut,
  Info,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentTheme,
  onThemeChange,
  onLogout,
}) => {
  if (!isOpen) return null;

  const isOfficial = currentUser?.role === 'officer' || currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Platform Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appearance, Theme Mode & Account Session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: LIGHT AND DARK MODE SWITCHING */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500 dark:hidden" />
                  <Moon className="w-4 h-4 text-blue-400 hidden dark:inline" />
                  <span>Display Theme (Light / Dark Mode)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose your preferred color theme for high-contrast viewing
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 capitalize bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                Active: {currentTheme}
              </span>
            </div>

            {/* 3 Theme Options */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  currentTheme === 'light'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Light Mode</span>
                  <span className="text-[10px] text-slate-400">Daytime civic</span>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  currentTheme === 'dark'
                    ? 'border-blue-500 bg-blue-950/40 text-blue-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Dark Mode</span>
                  <span className="text-[10px] text-slate-400">Night / High-contrast</span>
                </div>
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={() => onThemeChange('system')}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                  currentTheme === 'system'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">System Auto</span>
                  <span className="text-[10px] text-slate-400">Follow OS setting</span>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: CURRENT AUTHENTICATED SESSION (READ-ONLY) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Active Account & Role Status</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Role authentication is set exclusively at starting state login. In-session role switching is disabled.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isOfficial
                ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isOfficial
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  }`}>
                    {isOfficial ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {currentUser?.displayName || 'Active User'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentUser?.email}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                  isOfficial
                    ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                    : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700'
                }`}>
                  {isOfficial ? '🛡️ Govt Official' : '🏛️ Public Citizen'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Jurisdiction: {currentUser?.ward}</span>
                <span>{isOfficial ? 'Official Proof Upload' : `${currentUser?.honorPoints || 0} Honor Pts`}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: PERKS AND PRIVILEGES MATRIX */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Governance Access Matrix
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Upload Finished Resolution Photos:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  🛡️ Government Official Only
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Claim Citizen Rewards & Vouchers:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  🏛️ Citizen Only (Officials Blocked)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Municipal Ticket Resolution:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  🛡️ Government Official Only
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Report Public Civic Grievances:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  🏛️ Citizen Only
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: LOGOUT & SWITCH ACCOUNT */}
          {currentUser && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-slate-400" />
                <span>To log in with a different role, please sign out.</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
