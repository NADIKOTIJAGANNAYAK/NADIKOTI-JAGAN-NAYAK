import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  PhoneCall,
  Radio,
  MapPin,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../types';

interface QuickSosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDisaster: () => void;
  currentUser: UserProfile | null;
  onSubmitEmergencySos?: (payload: {
    type: string;
    details: string;
    peopleCount: number;
    lat: number;
    lng: number;
  }) => Promise<void> | void;
}

export const QuickSosModal: React.FC<QuickSosModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDisaster,
  currentUser,
  onSubmitEmergencySos,
}) => {
  const [emergencyType, setEmergencyType] = useState('Medical Urgent');
  const [peopleCount, setPeopleCount] = useState(2);
  const [locationName, setLocationName] = useState('Beach Road, near RK Beach / Siripuram, Visakhapatnam');
  const [notes, setNotes] = useState('High coastal surge water entering ground floor. Immediate assistance required.');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 17.7144, lng: 83.3235 });
  const [isLocating, setIsLocating] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [meshPacket, setMeshPacket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setLocationName(`Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)} (GVMC Coastal Sector)`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const packetId = `SOS-NGR-${Date.now().toString(36).toUpperCase()}`;
    const packet = {
      protocol: 'NAGARNET-MESH-SOS-v1',
      id: packetId,
      type: emergencyType,
      peopleCount,
      notes,
      coords,
      location: locationName,
      citizen: currentUser?.displayName || 'Citizen',
      citizenEmail: currentUser?.email || 'citizen@vizag.gov',
      timestamp: new Date().toISOString(),
      priority: 'CRITICAL_DISASTER',
    };

    setMeshPacket(JSON.stringify(packet, null, 2));
    setDispatched(true);

    if (onSubmitEmergencySos) {
      try {
        await onSubmitEmergencySos({
          type: emergencyType,
          details: `${notes} [People trapped/affected: ${peopleCount}]`,
          peopleCount,
          lat: coords.lat,
          lng: coords.lng,
        });
      } catch (err) {
        console.error('Failed to dispatch SOS to Firestore', err);
      }
    }
  };

  const copyMeshPacket = () => {
    if (!meshPacket) return;
    navigator.clipboard.writeText(meshPacket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden my-8">
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
            <ShieldAlert className="w-5 h-5 text-amber-200" />
            <span>GVMC Disaster Early Warning • Emergency SOS</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight mt-1">
            Emergency Distress & Rescue Beacon
          </h2>
          <p className="text-xs text-red-100 mt-1">
            Immediate dispatch for flash floods, cyclone surges, structural collapse, or trapped residents.
          </p>
        </div>

        {/* Speed-dial hotlines */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <PhoneCall className="w-4 h-4 text-red-600 animate-pulse" />
            <span>Direct Emergency Lines:</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 font-black">
            <a
              href="tel:112"
              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs shadow-sm flex items-center gap-1"
            >
              <span>112 (National)</span>
            </a>
            <a
              href="tel:18004250001"
              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-xs shadow-sm flex items-center gap-1"
            >
              <span>1800-425-0001 (GVMC)</span>
            </a>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {!dispatched ? (
            <form onSubmit={handleDispatch} className="space-y-4">
              {/* Emergency Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nature of Emergency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Medical Urgent',
                    'Coastal Surge / Flood',
                    'Building Structural',
                    'Trapped / Stranded',
                    'Live Power Wire / Fire',
                    'Tree Fall / Road Block',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEmergencyType(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all ${
                        emergencyType === cat
                          ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* People affected */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    People Affected / Trapped
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location GPS
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>{isLocating ? 'Locating...' : 'Auto-Capture GPS'}</span>
                  </button>
                </div>
              </div>

              {/* Location details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Landmark / Exact Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. Near RK Beach Kali Temple, Ward 20"
                  />
                </div>
              </div>

              {/* Situation Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Urgent Situation Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  placeholder="Describe trapped people, water depth, medical urgency..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-200" />
                  <span>Broadcast Emergency SOS Beacon</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToDisaster();
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  View Shelters Map
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center animate-bounce">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  SOS Distress Beacon Active!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Your emergency alert has been logged into the GVMC Disaster Control Queue and assigned highest priority.
                </p>
              </div>

              {/* Mesh Packet Payload */}
              <div className="bg-slate-900 text-left p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                    <Radio className="w-3.5 h-3.5" />
                    <span>NAGARNET-MESH-SOS-PACKET</span>
                  </div>
                  <button
                    onClick={copyMeshPacket}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-32">
                  {meshPacket}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDisaster();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Open Cyclone Shelters & Evacuation Command</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
