import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Search,
  Filter,
  TrendingUp,
  User,
  Phone,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BarChart3,
  ThumbsUp,
  SlidersHorizontal,
  Flame,
  Droplets,
  Zap,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Complaint, WardMetadata } from '../types';
import { GVMC_WARD_METADATA } from '../data/mockData';
import { computeWardStats, WardComputedStats, getWardNumberFromName } from '../utils/civicLogic';

interface WardSuccessPortalProps {
  complaints: Complaint[];
  onNavigateToReport?: (ward?: string) => void;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const WardSuccessPortal: React.FC<WardSuccessPortalProps> = ({
  complaints,
  onNavigateToReport,
  onSelectComplaint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'successRate' | 'solvedCount' | 'wardNumber' | 'avgSpeed'>('successRate');
  const [selectedWardNumber, setSelectedWardNumber] = useState<number>(12); // Default to Ward 12 (Siripuram)
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeProofModal, setActiveProofModal] = useState<any | null>(null);

  // Compute live stats for all GVMC wards
  const wardStatsList = useMemo(() => {
    return GVMC_WARD_METADATA.map((meta) => {
      const stats = computeWardStats(complaints as any, meta.wardName);
      return {
        meta,
        stats,
      };
    });
  }, [complaints]);

  // Overall Citywide Success Rate
  const citywideTotals = useMemo(() => {
    const total = complaints.length;
    const solved = complaints.filter((c) => c.status === 'resolved' || c.status === 'verified_closed').length;
    const rate = total > 0 ? Math.round((solved / total) * 100) : 0;
    const onTime = complaints.filter((c) => {
      if (c.status !== 'resolved' && c.status !== 'verified_closed') return false;
      const createdMs = new Date(c.createdAt).getTime();
      const updatedMs = new Date(c.updatedAt).getTime();
      return (updatedMs - createdMs) <= 72 * 3600 * 1000;
    }).length;
    const onTimeRate = solved > 0 ? Math.round((onTime / solved) * 100) : 100;
    return { total, solved, rate, onTimeRate };
  }, [complaints]);

  // Filtered and sorted wards
  const filteredWards = useMemo(() => {
    return wardStatsList
      .filter(({ meta, stats }) => {
        const matchesQuery =
          meta.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meta.wardNumber.toString().includes(searchQuery.trim()) ||
          meta.corporatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meta.keyLandmarks.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesZone = selectedZone === 'all' || meta.zone === selectedZone;
        return matchesQuery && matchesZone;
      })
      .sort((a, b) => {
        if (sortBy === 'successRate') {
          return b.stats.successRate - a.stats.successRate || b.stats.solvedCount - a.stats.solvedCount;
        }
        if (sortBy === 'solvedCount') {
          return b.stats.solvedCount - a.stats.solvedCount;
        }
        if (sortBy === 'avgSpeed') {
          return a.stats.avgResolutionHours - b.stats.avgResolutionHours;
        }
        return a.meta.wardNumber - b.meta.wardNumber;
      });
  }, [wardStatsList, searchQuery, selectedZone, sortBy]);

  // Selected ward details
  const currentWardData = useMemo(() => {
    return wardStatsList.find((w) => w.meta.wardNumber === selectedWardNumber) || wardStatsList[0];
  }, [wardStatsList, selectedWardNumber]);

  // Solved complaints for selected ward (filtered by category if selected)
  const filteredSolvedComplaints = useMemo(() => {
    if (!currentWardData) return [];
    const list = currentWardData.stats.solvedComplaints;
    if (categoryFilter === 'all') return list;
    return list.filter((c) => c.category === categoryFilter);
  }, [currentWardData, categoryFilter]);

  // Category labels and icons helper
  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'road_damage':
        return { label: 'Road Repair', icon: <Wrench className="w-3.5 h-3.5 text-amber-500" />, badge: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'drainage_problems':
        return { label: 'Storm Drainage', icon: <Droplets className="w-3.5 h-3.5 text-cyan-600" />, badge: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'water_leakage':
        return { label: 'Water Supply', icon: <Droplets className="w-3.5 h-3.5 text-blue-600" />, badge: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'streetlight_failure':
        return { label: 'Streetlighting', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" />, badge: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
      case 'garbage_accumulation':
        return { label: 'Sanitation & Waste', icon: <Trash2 className="w-3.5 h-3.5 text-emerald-600" />, badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Public Civic', icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />, badge: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 85) {
      return { grade: 'A+ Elite', color: 'text-emerald-700 bg-emerald-50 border-emerald-300 ring-emerald-500/20' };
    }
    if (rate >= 70) {
      return { grade: 'B+ Satisfactory', color: 'text-blue-700 bg-blue-50 border-blue-300 ring-blue-500/20' };
    }
    if (rate >= 50) {
      return { grade: 'C Action Needed', color: 'text-amber-700 bg-amber-50 border-amber-300 ring-amber-500/20' };
    }
    return { grade: 'D Escalated', color: 'text-red-700 bg-red-50 border-red-300 ring-red-500/20' };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Ward Resolution & Success Rate Intelligence */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-black text-cyan-300 uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>GVMC Public Accountability Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ward Success Rate & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-300">
                Solved Problems Intelligence
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transparent, real-time municipal scorecard: inspect each Visakhapatnam ward's resolution success percentage, 72h SLA compliance, and explore verified before/after proof of what problems were solved.
            </p>
          </div>

          {/* Citywide Benchmark Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 backdrop-blur-md text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Citywide Solved Rate
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {citywideTotals.rate}%
              </div>
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">
                {citywideTotals.solved} of {citywideTotals.total} Solved
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 backdrop-blur-md text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                72h SLA On-Time
              </span>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {citywideTotals.onTimeRate}%
              </div>
              <span className="text-[10px] text-cyan-200/80 block mt-0.5">
                Binding SLA Adherence
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 backdrop-blur-md text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Wards Monitored
              </span>
              <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
                98
              </div>
              <span className="text-[10px] text-slate-300/80 block mt-0.5">
                GVMC Municipal Zones
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Ward Leaderboard on Left (1/3) + Selected Ward "Solved Problems" Deep-Dive on Right (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Ward Leaderboard & Filtering Toolbar (5 cols on large screens) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                  Ward Rankings & Success Rates
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {filteredWards.length} Wards
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ward number (e.g. 12, 28) or area..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Zone Filter Pill Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setSelectedZone('all')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-colors ${
                  selectedZone === 'all' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                All Zones
              </button>
              <button
                onClick={() => setSelectedZone('Zone 3 (Central Vizag & AU)')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-colors ${
                  selectedZone === 'Zone 3 (Central Vizag & AU)' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Central Vizag
              </button>
              <button
                onClick={() => setSelectedZone('Zone 4 (Old Town & Port)')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-colors ${
                  selectedZone === 'Zone 4 (Old Town & Port)' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Old Town
              </button>
              <button
                onClick={() => setSelectedZone('Zone 1 (Bheemili & Rushikonda)')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-colors ${
                  selectedZone === 'Zone 1 (Bheemili & Rushikonda)' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                North Beach
              </button>
              <button
                onClick={() => setSelectedZone('Zone 5 (Gajuwaka Industrial)')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg transition-colors ${
                  selectedZone === 'Zone 5 (Gajuwaka Industrial)' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Gajuwaka
              </button>
            </div>

            {/* Sort Dropdown / Toggle */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="font-medium">Sort Wards By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="successRate">Highest Success Rate (%)</option>
                <option value="solvedCount">Most Problems Solved</option>
                <option value="avgSpeed">Fastest Turnaround</option>
                <option value="wardNumber">Ward Number (Ascending)</option>
              </select>
            </div>
          </div>

          {/* Interactive Ward Card List */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredWards.map(({ meta, stats }, idx) => {
              const isSelected = meta.wardNumber === selectedWardNumber;
              const badge = getSuccessRateBadge(stats.successRate);

              return (
                <div
                  key={meta.wardNumber}
                  onClick={() => setSelectedWardNumber(meta.wardNumber)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Ward Number Badge */}
                      <div
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono font-black text-sm shrink-0 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                            : 'bg-slate-900 text-white border-slate-800'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider text-slate-300 font-sans font-bold leading-none">
                          Ward
                        </span>
                        <span>{meta.wardNumber}</span>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight leading-snug">
                          {meta.wardName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{meta.zone.split('(')[0].trim()}</span>
                          <span>•</span>
                          <span>{meta.corporatorName.split('(')[0].trim()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Success Rate Percentage Indicator */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-lg font-black text-slate-900 font-mono">
                          {stats.successRate}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Solved
                        </span>
                      </div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.grade.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar of Solved vs In-Progress */}
                  <div className="mt-3 space-y-1">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${stats.successRate}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                        title={`${stats.solvedCount} Solved`}
                      />
                      <div
                        style={{ width: `${100 - stats.successRate}%` }}
                        className="bg-amber-400 h-full"
                        title={`${stats.inProgressCount} In Progress`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span className="text-emerald-700 font-bold">
                        ✓ {stats.solvedCount} Solved Problems
                      </span>
                      <span>
                        {stats.inProgressCount} in progress • {stats.totalComplaints} total
                      </span>
                    </div>
                  </div>

                  {/* Categorical solved tags preview */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Object.entries(stats.solvedByCategory).slice(0, 3).map(([cat, count]) => {
                        const info = getCategoryInfo(cat);
                        return (
                          <span
                            key={cat}
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${info.badge}`}
                          >
                            {info.icon}
                            <span>{count} {info.label.split(' ')[0]}</span>
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-blue-600 font-bold flex items-center gap-0.5 shrink-0 text-[10px]">
                      View Dossier <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: "What Problems They Solved" - Ward Dossier & Solved Proof Feed (7 cols on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Ward Profile Header */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex flex-col items-center justify-center font-mono font-black text-xl shrink-0 shadow-md shadow-blue-500/20">
                  <span className="text-[10px] uppercase font-sans font-bold text-cyan-200">
                    WARD
                  </span>
                  <span>{currentWardData.meta.wardNumber}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {currentWardData.meta.wardName}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                      {currentWardData.meta.zone.split('(')[0].trim()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Elected Corporator: <strong>{currentWardData.meta.corporatorName}</strong> • Assistant Engineer: <strong>{currentWardData.meta.assistantEngineer}</strong>
                  </p>
                </div>
              </div>

              {/* Action Button: File Ticket in this Ward */}
              {onNavigateToReport && (
                <button
                  onClick={() => onNavigateToReport(currentWardData.meta.wardName)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                  <span>Report in Ward {currentWardData.meta.wardNumber}</span>
                </button>
              )}
            </div>

            {/* Ward Success Rate KPI Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Success Rate
                </span>
                <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                  {currentWardData.stats.successRate}%
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {currentWardData.stats.solvedCount} of {currentWardData.stats.totalComplaints} Resolved
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200">
                <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">
                  72h SLA Compliance
                </span>
                <div className="text-2xl font-black text-cyan-700 font-mono mt-0.5">
                  {currentWardData.stats.onTimeSlaRate}%
                </div>
                <span className="text-[10px] text-cyan-600 font-medium">
                  Resolved on time
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                  Avg Resolution Time
                </span>
                <div className="text-2xl font-black text-indigo-700 font-mono mt-0.5">
                  {currentWardData.stats.avgResolutionHours}h
                </div>
                <span className="text-[10px] text-indigo-600 font-medium">
                  Rapid intervention speed
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  Sanitation Fleet
                </span>
                <div className="text-2xl font-black text-slate-800 font-mono mt-0.5">
                  {currentWardData.meta.sanitationFleetCount}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Vehicles & crews active
                </span>
              </div>
            </div>

            {/* Key Landmarks in this ward */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 pt-1">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Coverage Landmarks:
              </span>
              {currentWardData.meta.keyLandmarks.map((landmark) => (
                <span key={landmark} className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium text-[11px]">
                  {landmark}
                </span>
              ))}
            </div>
          </div>

          {/* Section: "WHAT THEY SOLVED" - Comprehensive Proof-of-Work Showcase */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    What Problems They Solved in Ward {currentWardData.meta.wardNumber}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Auditable municipal records with citizen before-intake and official geotagged proof of work.
                </p>
              </div>

              {/* Category Filter for Solved Problems */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({currentWardData.stats.solvedComplaints.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('road_damage')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    categoryFilter === 'road_damage'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Roads
                </button>
                <button
                  onClick={() => setCategoryFilter('drainage_problems')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    categoryFilter === 'drainage_problems'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Drains
                </button>
                <button
                  onClick={() => setCategoryFilter('water_leakage')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    categoryFilter === 'water_leakage'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Water
                </button>
                <button
                  onClick={() => setCategoryFilter('streetlight_failure')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    categoryFilter === 'streetlight_failure'
                      ? 'bg-yellow-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Lights
                </button>
                <button
                  onClick={() => setCategoryFilter('garbage_accumulation')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    categoryFilter === 'garbage_accumulation'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sanitation
                </button>
              </div>
            </div>

            {/* Solved Problems List */}
            {filteredSolvedComplaints.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No resolved issues matching this category</h4>
                <p className="text-xs text-slate-500">
                  Switch the category filter to 'All' to view all resolved problems for this ward.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSolvedComplaints.map((item) => {
                  const info = getCategoryInfo(item.category);
                  const createdMs = new Date(item.createdAt).getTime();
                  const updatedMs = new Date(item.updatedAt).getTime();
                  const hoursToSolve = Math.max(1, Math.round((updatedMs - createdMs) / (3600 * 1000)));

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all space-y-4"
                    >
                      {/* Ticket Header & Status Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {item.id}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${info.badge}`}>
                            {info.icon}
                            <span>{info.label}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{item.status === 'verified_closed' ? 'Citizen Verified & Closed' : 'Officially Solved'}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Solved in {hoursToSolve} hours</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({72 - hoursToSolve}h ahead of SLA)
                          </span>
                        </div>
                      </div>

                      {/* Problem Title & Address */}
                      <div>
                        <h4 className="font-black text-slate-900 text-base tracking-tight">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.address}</span>
                        </div>
                      </div>

                      {/* Before / After Proof-of-Work Side-by-Side Comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {/* Before Photo */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-red-600 uppercase">
                            <span>1. Problem Intake (Before)</span>
                            <span className="text-[10px] text-slate-400 font-normal">Citizen Photo</span>
                          </div>
                          <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                            <img
                              src={item.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'}
                              alt="Before repair"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                              HAZARD REPORTED
                            </div>
                          </div>
                        </div>

                        {/* After Photo (Proof of Work) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 uppercase">
                            <span>2. Geotagged Proof (After)</span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              ✓ Verified Done
                            </span>
                          </div>
                          <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-emerald-200 group">
                            <img
                              src={item.proofOfWorkUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=800&auto=format&fit=crop&q=80'}
                              alt="After repair proof of work"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                              ENGINEER PROOF-OF-WORK
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Official Officer Resolution Notes */}
                      {item.proofOfWorkNotes && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Municipal Action Taken:</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed italic">
                            "{item.proofOfWorkNotes}"
                          </p>
                        </div>
                      )}

                      {/* Citizen Sign-off verification strip */}
                      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Citizen signed-off and verified resolution</span>
                        </div>

                        {onSelectComplaint && (
                          <button
                            onClick={() => onSelectComplaint(item as any)}
                            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 hover:underline"
                          >
                            <span>Inspect Full Audit Log</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
