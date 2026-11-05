import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../types';

interface OfficialResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSaveResolution: (
    complaintId: string,
    newStatus: ComplaintStatus,
    proofUrl: string,
    proofNotes: string
  ) => void;
}

export const OfficialResolutionModal: React.FC<OfficialResolutionModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSaveResolution,
}) => {
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [materialsUsed, setMaterialsUsed] = useState('Cold bituminous asphalt mix, roller compaction');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setSelectedFilePreview(dataUrl);
      setProofUrl(dataUrl);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Sample quick presets for proof photos
  const presetPhotos = [
    {
      label: 'Road Resurfaced',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f9?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Drain Cleaned & Desilted',
      url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Streetlight Repaired & LED Replaced',
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = proofUrl.trim() || selectedFilePreview;

    if (!finalUrl) {
      setErrorMsg('A finished proof-of-work photograph is mandatory for government officials to resolve this ticket.');
      return;
    }

    setIsSubmitting(true);
    const combinedNotes = proofNotes.trim()
      ? `${proofNotes.trim()} [Materials: ${materialsUsed}]`
      : `Official repair completed as per GVMC municipal specifications. [Materials: ${materialsUsed}]`;

    setTimeout(() => {
      onSaveResolution(complaint.id, 'resolved', finalUrl, combinedNotes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-200 bg-black/20 px-2 py-0.5 rounded">
                  {complaint.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-amber-950 uppercase">
                  Official Perk
                </span>
              </div>
              <h3 className="font-black text-lg text-white mt-0.5 leading-tight">
                Upload Finished Proof-of-Work Photo
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Target Complaint Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {complaint.title}
              </span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {complaint.ward}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {complaint.description}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{complaint.address}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Side by side Before and After Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                <span>1. Problem Intake (Before)</span>
                <span className="text-[10px] text-slate-400 font-normal">Reported Photo</span>
              </div>
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700">
                <img
                  src={
                    complaint.imageUrl ||
                    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
                  }
                  alt="Before repair"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                  HAZARD REPORTED
                </div>
              </div>
            </div>

            {/* After Photo (Finished Photo) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                <span>2. Finished Photo (After Repair)</span>
                <span className="text-[10px] text-emerald-500 font-bold">Official Proof</span>
              </div>
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-emerald-400 dark:border-emerald-600 flex items-center justify-center">
                {selectedFilePreview || proofUrl ? (
                  <img
                    src={selectedFilePreview || proofUrl}
                    alt="Finished repair proof"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 space-y-1 text-slate-400 dark:text-slate-500">
                    <Camera className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <span className="text-xs font-bold block">No photo selected</span>
                    <span className="text-[10px]">Upload or select a photo below</span>
                  </div>
                )}
                {(selectedFilePreview || proofUrl) && (
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                    ✓ FINISHED PROOF
                  </div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload or Preset Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Upload Finished Photo from Device
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>Choose Finished Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Or Paste URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Or Photo Web URL
              </label>
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => {
                  setProofUrl(e.target.value);
                  setSelectedFilePreview(null);
                }}
                placeholder="https://... (or select a preset sample below)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Quick Demo Photo Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Demonstration Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {presetPhotos.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setProofUrl(p.url);
                      setSelectedFilePreview(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      proofUrl === p.url
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials Used */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Materials & Equipment Deployed
              </label>
              <input
                type="text"
                value={materialsUsed}
                onChange={(e) => setMaterialsUsed(e.target.value)}
                placeholder="e.g. Bituminous asphalt, compactor, reinforced drainage mesh..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Officer Resolution Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Officer Resolution Summary
              </label>
              <textarea
                rows={2}
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                placeholder="e.g. Repair completed and inspected by Ward Assistant Engineer. Surface cured and traffic resumed safely."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Finished Proof & Mark Resolved</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
