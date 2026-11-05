import React, { useState } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  ThumbsUp,
  Image as ImageIcon,
} from 'lucide-react';
import { Complaint, UserProfile } from '../types';
import { calculateSlaStatus, calculateHonorPoints } from '../utils/civicLogic';

interface TrackViewProps {
  complaints: Complaint[];
  currentUser: UserProfile | null;
  onVerifyProofOfWork: (complaintId: string, verified: boolean) => void;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const TrackView: React.FC<TrackViewProps> = ({
  complaints,
  currentUser,
  onVerifyProofOfWork,
  onSelectComplaint,
}) => {
  const [searchId, setSearchId] = useState('');
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(
    complaints[0] || null
  );
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const searchedComplaint = complaints.find(
    (c) => c.id.toLowerCase() === searchId.trim().toLowerCase()
  );

  const displayComplaint = searchedComplaint || activeComplaint;

  const sla = displayComplaint ? calculateSlaStatus(displayComplaint.createdAt) : null;

  const timelineSteps = [
    { key: 'submitted', label: 'Ticket Submitted', desc: 'Logged on GVMC civic portal' },
    { key: 'under_review', label: 'Under Review', desc: 'Assigned to Ward Engineer' },
    { key: 'in_progress', label: 'Field Work Dispatched', desc: 'Repair crew active on site' },
    { key: 'resolved', label: 'Work Completed', desc: 'Proof-of-work photo uploaded' },
    { key: 'verified_closed', label: 'Citizen Verified Closed', desc: 'Inspection approved by citizen' },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const order = ['submitted', 'under_review', 'in_progress', 'resolved', 'verified_closed'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Track Grievance & 72-Hour SLA Countdown
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time municipal accountability. Every ticket carries a binding countdown timer.
          </p>
        </div>

        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Ticket ID (e.g., GVMC-2026-VZG-8021)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint History List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recent Grievances ({complaints.length})
            </span>
            <span className="text-[10px] text-slate-400">Select to inspect</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {complaints.map((c) => {
              const itemSla = calculateSlaStatus(c.createdAt);
              const isSelected = displayComplaint?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveComplaint(c);
                    setSearchId('');
                    if (onSelectComplaint) onSelectComplaint(c);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[11px] font-bold text-blue-700">
                      {c.id}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
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
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{c.address}</p>

                  <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-medium">{c.ward.split(' - ')[0]}</span>
                    <span
                      className={`font-bold ${
                        itemSla.isOverdue
                          ? 'text-red-600'
                          : itemSla.urgency === 'critical'
                          ? 'text-amber-600'
                          : 'text-indigo-600'
                      }`}
                    >
                      {itemSla.formattedTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 cols): Selected Complaint Detailed Tracking Card */}
        {displayComplaint ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Top SLA Countdown Timer Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-blue-700">
                      {displayComplaint.id}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {displayComplaint.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    {displayComplaint.title}
                  </h2>
                </div>

                {/* SLA Urgency Badge */}
                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                    sla?.isOverdue
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : sla?.urgency === 'critical'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {sla?.isOverdue
                      ? 'SLA Overdue (Escalated to Zonal Commissioner)'
                      : `SLA Timer: ${sla?.formattedTime}`}
                  </span>
                </div>
              </div>

              {/* 72h SLA Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>Start: {new Date(displayComplaint.createdAt).toLocaleDateString()}</span>
                  <span>
                    {sla?.isOverdue ? 'Deadline Exceeded' : `${sla?.hoursRemaining}h remaining`}
                  </span>
                  <span>72h SLA Max</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      sla?.isOverdue
                        ? 'bg-red-600'
                        : sla?.urgency === 'critical'
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${sla?.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Officer Assignment Info */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Department:</span>
                  <span className="font-semibold text-slate-800">
                    {displayComplaint.department || 'GVMC Engineering & Maintenance'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Field Officer in Charge:</span>
                  <span className="font-semibold text-slate-800">
                    {displayComplaint.assignedOfficerName || 'Ward Junior Engineer (Assigned)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Location & Ward:</span>
                  <span className="font-semibold text-slate-800">{displayComplaint.ward}</span>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
                Lifecycle & Verification Audit Trail
              </h3>

              <div className="space-y-6">
                {timelineSteps.map((step, idx) => {
                  const status = getStepStatus(step.key, displayComplaint.status);

                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      {idx < timelineSteps.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 -bottom-6 w-0.5 ${
                            status === 'completed' ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ${
                          status === 'completed'
                            ? 'bg-blue-600 text-white'
                            : status === 'current'
                            ? 'bg-blue-100 border-2 border-blue-600 text-blue-700 animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-bold ${
                              status === 'current'
                                ? 'text-blue-700'
                                : status === 'completed'
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          {status === 'current' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage: Proof of Work Inspection & Citizen Closure Workflow */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Citizen Proof-of-Work Verification</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  Step Required Before Closure
                </span>
              </div>

              {displayComplaint.proofOfWorkUrl ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Before Photo */}
                    <div>
                      <span className="text-xs font-bold text-slate-600 block mb-1.5">
                        Before (Reported by Citizen):
                      </span>
                      <div className="h-40 rounded-lg overflow-hidden border border-slate-200 bg-black">
                        <img
                          src={displayComplaint.imageUrl}
                          alt="Before civic hazard"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After Proof-of-Work Photo uploaded by Officer */}
                    <div>
                      <span className="text-xs font-bold text-emerald-700 block mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        After (Official Proof of Work):
                      </span>
                      <div className="h-40 rounded-lg overflow-hidden border-2 border-emerald-500 bg-black">
                        <img
                          src={displayComplaint.proofOfWorkUrl}
                          alt="After repair proof of work"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {displayComplaint.proofOfWorkNotes && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-0.5">
                        Officer Resolution Note:
                      </span>
                      {displayComplaint.proofOfWorkNotes}
                    </div>
                  )}

                  {displayComplaint.status === 'resolved' && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          onVerifyProofOfWork(displayComplaint.id, false);
                          setVerificationFeedback('Dispute logged. Ticket returned to inspection.');
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-red-300 text-red-600 font-semibold text-xs hover:bg-red-50 transition-colors"
                      >
                        Dispute Repair Quality
                      </button>
                      <button
                        onClick={() => {
                          onVerifyProofOfWork(displayComplaint.id, true);
                          setVerificationFeedback(
                            'Thank you! You have verified the repair. Ticket is officially closed and +50 honor points awarded to the officer.'
                          );
                        }}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Officially Close Ticket</span>
                      </button>
                    </div>
                  )}

                  {displayComplaint.status === 'verified_closed' && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        Ticket Verified and Closed by Citizen. Official GVMC SLA fulfilled (+50 Honor Points credited).
                      </span>
                    </div>
                  )}

                  {verificationFeedback && (
                    <p className="text-xs text-blue-700 font-medium">{verificationFeedback}</p>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">
                    Awaiting Field Officer Proof-of-Work Photograph
                  </p>
                  <p className="mt-1 text-slate-400">
                    Once the field team completes site repairs, a geotagged photo will appear here
                    for your official citizen sign-off.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
