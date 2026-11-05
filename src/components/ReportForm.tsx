import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { BorderBeam } from 'border-beam';
import { ThinkingOrb } from 'thinking-orbs';
import { Complaint, ComplaintCategory, ComplaintPriority, UserProfile } from '../types';
import { GVMC_WARDS } from '../data/mockData';
import { GoogleMapsCanvas } from './GoogleMapsCanvas';
import { sanitizeInput, isWithinVisakhapatnamBounds } from '../utils/civicLogic';

interface ReportFormProps {
  currentUser: UserProfile | null;
  onComplaintSubmitted: (complaint: Complaint) => void;
  onCancel?: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  currentUser,
  onComplaintSubmitted,
  onCancel,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('road_damage');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [ward, setWard] = useState(GVMC_WARDS[3]); // Default Ward 12 Siripuram
  const [address, setAddress] = useState('Siripuram Circle, Near AU Gate, Visakhapatnam');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.7225,
    lng: 83.3172,
  });

  const [citizenName, setCitizenName] = useState(currentUser?.displayName || 'Citizen Reporter');
  const [citizenEmail, setCitizenEmail] = useState(currentUser?.email || 'citizen.vizag@gmail.com');
  const [isLocating, setIsLocating] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<Complaint | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Photo selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB. Please select a smaller photo.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
      setAiAnalyzed(false);
    };
    reader.readAsDataURL(file);
  };

  // Run Gemini Multimodal AI Analysis
  const handleRunAiAnalysis = async () => {
    if (!imageBase64) {
      setErrorMsg('Please upload a photograph first to scan with Gemini AI.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          userHint: title || category,
        }),
      });

      const data = await response.json();

      if (data) {
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.category && [
          'road_damage',
          'garbage_accumulation',
          'water_leakage',
          'streetlight_failure',
          'drainage_problems',
          'other_civic',
        ].includes(data.category)) {
          setCategory(data.category as ComplaintCategory);
        }
        if (data.suggestedPriority) {
          setPriority(data.suggestedPriority as ComplaintPriority);
        }
        setAiAnalyzed(true);
      }
    } catch (err) {
      console.error('AI Scan failed:', err);
      setErrorMsg('AI scan failed to connect. You can proceed with manual entry below.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capture user GPS location with permission
  const handleGetGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAddress(`GPS Coords: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E, Visakhapatnam`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setErrorMsg('Could not fetch GPS location. Please select a location on the map below.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please enter a complaint title.');
      return;
    }

    if (!coords.lat || !coords.lng) {
      setErrorMsg('Please select or verify the issue location.');
      return;
    }

    const uniqueId = `GVMC-2026-VZG-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    // Strict 72-Hour Binding SLA
    const slaDeadlineIso = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    const newComplaint: Complaint = {
      id: uniqueId,
      citizenId: currentUser?.uid || `guest-${Date.now()}`,
      citizenName: sanitizeInput(citizenName),
      citizenEmail: sanitizeInput(citizenEmail),
      title: sanitizeInput(title),
      description: sanitizeInput(description),
      category,
      priority,
      status: 'submitted',
      lat: coords.lat,
      lng: coords.lng,
      address: sanitizeInput(address),
      ward,
      imageUrl: imagePreview || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      slaDeadline: slaDeadlineIso,
      escalated: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      upvotes: 1,
    };

    onComplaintSubmitted(newComplaint);
    setSubmissionSuccess(newComplaint);
  };

  if (submissionSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Complaint Submitted Successfully!</h2>
        <p className="text-sm text-slate-600 mt-1">
          Your report has been logged with the Greater Visakhapatnam Municipal Corporation (GVMC).
        </p>

        {/* Unique Ticket Details Card */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase">Unique Ticket ID</span>
            <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {submissionSuccess.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Binding SLA Countdown:</span>
            <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 72 Hours Guaranteed
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Category & Ward:</span>
            <span className="text-xs font-medium text-slate-800">
              {submissionSuccess.category.replace('_', ' ')} • {submissionSuccess.ward}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSubmissionSuccess(null);
              setImagePreview(null);
              setImageBase64(null);
              setTitle('');
              setDescription('');
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Submit Another Complaint
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Track on Citizen Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Official Notice Banner if user is Government Official */}
      {(currentUser?.role === 'officer' || currentUser?.role === 'admin') && (
        <div className="bg-amber-500 text-amber-950 px-6 py-2.5 text-xs font-bold flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>
              <strong>Government Official Mode (Rule 3):</strong> Official personnel inspect and upload finished proof photos. Official accounts cannot access citizen perks.
            </span>
          </div>
          <span className="text-[10px] bg-black/20 text-white px-2 py-0.5 rounded uppercase font-black">
            Official Account
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-6 py-6 text-white">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>GVMC Civic Intake Portal • 72-Hour Binding SLA</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight font-display-brand">
          Report Public Infrastructure Hazard
        </h1>
        <p className="text-xs sm:text-sm text-blue-100/90 mt-1">
          Snap a photograph of road cavities, clogged drains, leaking mains, or garbage accumulation.
          Gemini AI auto-assists with classification.
        </p>

      </div>

      {errorMsg && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Stage 1: Photograph Upload & Gemini Multimodal Scan */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-sm font-bold text-slate-800 mb-2">
            1. Upload Infrastructure Photograph
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* File Upload Box */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center bg-white transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                Click to browse photo or take camera snap
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Supports JPG, PNG, WebP (up to 8MB)
              </span>
            </div>

            {/* Photo Preview & Gemini AI Scan Button */}
            <div className="flex flex-col items-center justify-center min-h-[160px] bg-slate-100 rounded-xl border border-slate-200/80 p-3 relative overflow-hidden">
              {imagePreview ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-black">
                    <img
                      src={imagePreview}
                      alt="Civic hazard preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Gemini Multimodal Scan Trigger */}
                  <div className="w-full relative">
                    <BorderBeam size="sm" colorVariant="ocean" strength={0.8} active={isAnalyzing}>
                      <button
                        type="button"
                        onClick={handleRunAiAnalysis}
                        disabled={isAnalyzing}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-md transition-all"
                      >
                        {isAnalyzing ? (
                          <>
                            <ThinkingOrb state="working" size={20} />
                            <span>Gemini Multimodal Analyzing Photo...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Scan with Gemini AI (Auto-Classify)</span>
                          </>
                        )}
                      </button>
                    </BorderBeam>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs py-6">
                  <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span>No photo attached yet</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Result Confirmation Box */}
          {aiAnalyzed && (
            <div className="mt-4 p-3 bg-blue-50/90 border border-blue-200 rounded-lg text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gemini Civic Intelligence Result:</span>
              </div>
              <p className="text-slate-700">
                Suggested category: <strong className="capitalize">{category.replace('_', ' ')}</strong> with{' '}
                <strong className="capitalize">{priority}</strong> review priority.
              </p>
              <p className="text-[10px] text-slate-500 italic">
                Notice: AI suggestion for municipal sorting — official severity verified by GVMC field engineers.
                You can edit any field below.
              </p>
            </div>
          )}
        </div>

        {/* Stage 2: Category & Title Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complaint Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="road_damage">Road Damage (Potholes / Broken Asphalt)</option>
              <option value="drainage_problems">Drainage Problems (Clogged Drain / Overflow)</option>
              <option value="garbage_accumulation">Garbage Accumulation (Solid Waste Dump)</option>
              <option value="water_leakage">Water Leakage (Pipe Burst / Valve Damage)</option>
              <option value="streetlight_failure">Streetlight Failure (Dark Zone / Blackout)</option>
              <option value="other_civic">Other Civic Infrastructure Concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Suggested Review Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as ComplaintPriority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-lg capitalize border transition-all ${
                    priority === p
                      ? p === 'critical'
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : p === 'high'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Complaint Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Deep Pothole near Siripuram Circle AU Gate"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Detailed Description & Hazard Notes
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the visible damage, depth, pedestrian/traffic risk, or landmark details..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Stage 3: Location Capture & Google Maps Pin */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>3. Issue Location & GVMC Ward</span>
            </label>
            <button
              type="button"
              onClick={handleGetGeolocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Use Current Device GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                GVMC Ward Boundary
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
              >
                {GVMC_WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Street Address / Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Interactive Map Pin-drop */}
          <div className="mt-2">
            <p className="text-[11px] text-slate-500 mb-1.5">
              Click anywhere on the map to accurately place the hazard pin:
            </p>
            <GoogleMapsCanvas
              complaints={[]}
              selectedCategory="all"
              selectableLocation={true}
              selectedMarkerLocation={coords}
              onMapClickCoordinates={(lat, lng) => {
                setCoords({ lat, lng });
                setAddress(`Selected Location: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E, Visakhapatnam`);
              }}
            />
          </div>
        </div>

        {/* Citizen Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={citizenEmail}
              onChange={(e) => setCitizenEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
              required
            />
          </div>
        </div>

        {/* 72-Hour Binding SLA Notice */}
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Binding 72-Hour Municipal SLA:</span> Once submitted, GVMC
            field officers must resolve the hazard within 72 hours and submit geotagged proof-of-work
            photos. Failure automatically escalates ticket to the Zonal Commissioner with demerit points.
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <span>Submit Complaint & Start SLA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
