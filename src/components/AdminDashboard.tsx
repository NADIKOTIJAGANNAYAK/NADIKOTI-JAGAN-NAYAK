import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Upload,
  UserCheck,
  Shield,
  Award,
  ArrowUpRight,
  TrendingUp,
  Camera,
  Building2,
  Info,
  Lock,
} from 'lucide-react';
import { Complaint, ComplaintStatus, UserProfile, UserRole } from '../types';
import { GVMC_WARDS } from '../data/mockData';
import { calculateSlaStatus } from '../utils/civicLogic';
import { OfficialResolutionModal } from './OfficialResolutionModal';
import { AccessRestrictedBanner } from './AccessRestrictedBanner';

interface AdminDashboardProps {
  complaints: Complaint[];
  currentUser: UserProfile | null;
  onUpdateComplaintStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    proofUrl?: string,
    proofNotes?: string
  ) => void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  currentUser,
  onUpdateComplaintStatus,
  onNavigateHome,
  onLogout,
}) => {
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected complaint for official finished photo upload modal
  const [resolutionComplaint, setResolutionComplaint] = useState<Complaint | null>(null);

  // If active user is Citizen, block access to Government Official Perks (Rule 4)
  if (currentUser?.role === 'citizen') {
    return (
      <AccessRestrictedBanner
        title="Official Municipal Console Restricted"
        description="This internal municipal workspace is reserved exclusively for Greater Visakhapatnam Municipal Corporation (GVMC) officers and field engineers to triage grievances and upload finished photos. Citizens cannot access official perks."
        targetRoleName="Government Official"
        currentRole={currentUser.role}
        onBackToAllowedView={onNavigateHome || (() => {})}
        allowedViewLabel="Return to Citizen Overview"
        onLogout={onLogout}
      />
    );
  }

  // Metrics
  const total = complaints.length;
  const submitted = complaints.filter((c) => c.status === 'submitted').length;
  const underReview = complaints.filter((c) => c.status === 'under_review').length;
  const inProgress = complaints.filter((c) => c.status === 'in_progress').length;
  const resolved = complaints.filter(
    (c) => c.status === 'resolved' || c.status === 'verified_closed'
  ).length;

  const overdueEscalated = complaints.filter((c) => {
    const sla = calculateSlaStatus(c.createdAt);
    return sla.isOverdue && c.status !== 'verified_closed' && c.status !== 'resolved';
  }).length;

  // Filtered List
  const filtered = complaints.filter((c) => {
    if (selectedWard !== 'all' && c.ward !== selectedWard) return false;
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Ward Performance Scorecard
  const wardLeaderboard = GVMC_WARDS.slice(0, 6)
    .map((wardName) => {
      const wardComplaints = complaints.filter((c) => c.ward === wardName);
      const wardResolved = wardComplaints.filter(
        (c) => c.status === 'resolved' || c.status === 'verified_closed'
      ).length;
      const wardOverdue = wardComplaints.filter((c) => {
        const sla = calculateSlaStatus(c.createdAt);
        return sla.isOverdue && c.status !== 'verified_closed';
      }).length;
      const honorScore = wardResolved * 50 - wardOverdue * 100;

      return {
        name: wardName,
        total: wardComplaints.length,
        resolved: wardResolved,
        overdue: wardOverdue,
        honorScore,
        complianceRate:
          wardComplaints.length > 0
            ? Math.round((wardResolved / wardComplaints.length) * 100)
            : 100,
      };
    })
    .sort((a, b) => b.honorScore - a.honorScore);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>GVMC Municipal Engineering & Official Resolution Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display-brand">
            Government Official Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Review assigned ward tickets across Greater Visakhapatnam, inspect citizen problem reports,
            and <strong>upload finished proof-of-work photos</strong> to officially resolve grievances.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-right">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">
            Active Official Identity
          </span>
          <span className="text-sm font-bold text-amber-300">
            {currentUser?.displayName || 'GVMC Ward Officer'} (
            {currentUser?.role.toUpperCase() || 'OFFICIAL'})
          </span>
          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
            ✓ Finished Photo Upload Authorized
          </span>
        </div>
      </div>

      {/* Official Duty Notice: Government officials only upload finished photos and cannot access citizen perks */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Official Protocol (Rule 3):</strong> Government personnel inspect field repairs and upload finished photos for civic resolution. Official accounts cannot claim citizen rewards or points.
          </span>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 whitespace-nowrap">
          Official Mode
        </span>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block">
            Total Tickets
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {total}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">All 98 Wards</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase block">
            Submitted
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {submitted}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting triage</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase block">
            Under Review
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
            {underReview}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Assigned</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase block">
            In Progress
          </span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            {inProgress}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Crew active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase block">
            Resolved / Proof Done
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {resolved}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            Finished Photos Uploaded
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm bg-red-50/40 dark:bg-red-950/20">
          <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase block">
            SLA Overdue
          </span>
          <span className="text-2xl font-black text-red-600 dark:text-red-400 mt-1 block">
            {overdueEscalated}
          </span>
          <span className="text-[10px] text-red-500 font-semibold mt-1 block">
            Commissioner Alert
          </span>
        </div>
      </div>

      {/* Main Table & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, title, address..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="all">All Wards</option>
              {GVMC_WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="all">All Categories</option>
              <option value="road_damage">Road Damage</option>
              <option value="drainage_problems">Drainage</option>
              <option value="garbage_accumulation">Garbage</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="streetlight_failure">Streetlight</option>
              <option value="other_civic">Other</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="verified_closed">Verified Closed</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing {filtered.length} of {complaints.length} tickets
          </span>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Issue Title & Ward</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">72h SLA Status</th>
                <th className="px-4 py-3">Assigned Officer</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3 text-right">Official Resolution Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((c) => {
                const sla = calculateSlaStatus(c.createdAt);
                const hasFinishedPhoto = Boolean(c.proofOfWorkUrl);

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-amber-50/30 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                      {c.id}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">
                        {c.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{c.address}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize">
                      {c.category.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          sla.isOverdue
                            ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                            : sla.urgency === 'critical'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sla.formattedTime}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {c.assignedOfficerName || 'Ward Field Engineer'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            c.status === 'verified_closed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'resolved'
                              ? 'bg-teal-100 text-teal-800'
                              : c.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                        {hasFinishedPhoto && (
                          <span
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold"
                            title="Finished photo attached"
                          >
                            📸
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {/* Prominent Official Action: Upload Finished Photos */}
                      <button
                        onClick={() => setResolutionComplaint(c)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto shadow-sm ${
                          hasFinishedPhoto
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>
                          {hasFinishedPhoto ? 'Inspect / Re-upload Photo' : 'Upload Finished Photo'}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ward Member Performance & Public Election Scorecard */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Ward Member 72-Hour SLA Municipal Audit Scorecard</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transparent rankings to guide civic elections. On-time resolution (+50 pts) vs Overdue
              penalties (-100 pts).
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
            98 Wards Audited
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wardLeaderboard.map((item, idx) => (
            <div
              key={item.name}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  #{idx + 1} {item.name}
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded ${
                    item.honorScore >= 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.honorScore >= 0 ? `+${item.honorScore}` : item.honorScore} Pts
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Compliance Rate:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {item.complianceRate}%
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${item.complianceRate}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Resolved: {item.resolved}</span>
                <span className="text-red-500 font-semibold">Overdue: {item.overdue}</span>
                <span>Total: {item.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Finished Photo Upload Modal */}
      <OfficialResolutionModal
        isOpen={Boolean(resolutionComplaint)}
        onClose={() => setResolutionComplaint(null)}
        complaint={resolutionComplaint}
        onSaveResolution={(id, status, proofUrl, proofNotes) => {
          onUpdateComplaintStatus(id, status, proofUrl, proofNotes);
          setResolutionComplaint(null);
        }}
      />
    </div>
  );
};
