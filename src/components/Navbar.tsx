import React from 'react';
import {
  Compass,
  AlertTriangle,
  MapPin,
  Clock,
  Shield,
  ShieldAlert,
  BarChart3,
  Search,
  Bot,
  User,
  LogIn,
  LogOut,
  Info,
  Flame,
  Award,
  Settings,
  Gift,
  Building2,
  Camera,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { NagarNetLogo } from './NagarNetLogo';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onOpenSearch: () => void;
  onOpenMitra: () => void;
  onOpenFirebaseLogin: () => void;
  onOpenSos: () => void;
  onOpenCitizenPerks: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenSearch,
  onOpenMitra,
  onOpenFirebaseLogin,
  onOpenSos,
  onOpenCitizenPerks,
  onOpenSettings,
  onLogout,
}) => {
  const isOfficial = currentUser?.role === 'officer' || currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Logo & Platform Branding */}
          <NagarNetLogo
            size="md"
            onClick={() => onSelectTab('home')}
          />

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'home'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Overview
            </button>

            {/* Report Issue (Citizen Primary action) */}
            <button
              onClick={() => onSelectTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'report'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Report Issue</span>
            </button>

            {/* Track 72h SLA */}
            <button
              onClick={() => onSelectTab('track')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'track'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Track 72h SLA</span>
            </button>

            {/* Citizen Perks Link */}
            <button
              onClick={onOpenCitizenPerks}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                !isOfficial
                  ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-80'
              }`}
              title={
                isOfficial
                  ? 'Citizen Perks (Restricted for Government Officials)'
                  : 'Claim Citizen Rewards & Vouchers'
              }
            >
              <Gift className="w-3.5 h-3.5 text-purple-500" />
              <span>Citizen Perks</span>
              {isOfficial && (
                <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-1 py-0.2 rounded font-black">
                  LOCKED
                </span>
              )}
            </button>

            {/* Ward Success Portal */}
            <button
              onClick={() => onSelectTab('ward-success')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'ward-success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ward Success</span>
            </button>

            {/* GIS Map */}
            <button
              onClick={() => onSelectTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'map'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>GIS Map</span>
            </button>

            {/* Disaster SOS */}
            <button
              onClick={() => onSelectTab('disaster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'disaster'
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>Disaster SOS</span>
            </button>

            {/* Government Official Console (Admin) */}
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentTab === 'admin'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-black border border-amber-300 dark:border-amber-700'
                  : isOfficial
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={
                isOfficial
                  ? 'Official Console: Inspect & Upload Finished Photos'
                  : 'Government Official Console (Restricted)'
              }
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{isOfficial ? 'Official Console' : 'Official Portal'}</span>
              {!isOfficial && (
                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1 py-0.2 rounded font-bold">
                  OFFICIAL ONLY
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Feature Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              title="Search features"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search</span>
            </button>

            {/* Mitra AI Chatbot launcher */}
            <button
              onClick={onOpenMitra}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mitra AI</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black shadow-md shadow-red-500/25 transition-all border border-red-400/50 animate-pulse"
              title="Immediate Emergency SOS & Disaster Distress Beacon"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
              <span>SOS</span>
            </button>

            {/* DEDICATED SETTINGS BUTTON (Light/Dark Mode & Role Management) */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              title="Platform Settings & Light/Dark Mode"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* USER ROLE BADGE & STATUS */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenSettings}
                  className={`hidden xl:flex flex-col text-right px-2.5 py-1 rounded-xl border transition-all ${
                    isOfficial
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                      : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                  }`}
                  title="Active session profile & theme settings"
                >
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {currentUser.displayName}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider ${
                      isOfficial
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    ● {isOfficial ? 'Gov Official' : 'Citizen'}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  title="Sign Out of Firebase"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenFirebaseLogin}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-orange-500/20 transition-all border border-amber-400/40"
              >
                <Flame className="w-4 h-4 text-yellow-200" />
                <span>Firebase Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 scrollbar-none gap-2">
          <button
            onClick={() => onSelectTab('home')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              currentTab === 'home' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('report')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              currentTab === 'report' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold' : ''
            }`}
          >
            Report Issue
          </button>
          <button
            onClick={() => onSelectTab('track')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              currentTab === 'track' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold' : ''
            }`}
          >
            Track SLA
          </button>
          <button
            onClick={onOpenCitizenPerks}
            className="whitespace-nowrap px-2.5 py-1 rounded-md text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1"
          >
            <Gift className="w-3 h-3" />
            <span>Perks</span>
          </button>
          <button
            onClick={() => onSelectTab('ward-success')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              currentTab === 'ward-success' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : ''
            }`}
          >
            Ward Success
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              currentTab === 'admin' ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold' : ''
            }`}
          >
            {isOfficial ? 'Official Console' : 'Official Portal'}
          </button>
          <button
            onClick={onOpenSettings}
            className="whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
