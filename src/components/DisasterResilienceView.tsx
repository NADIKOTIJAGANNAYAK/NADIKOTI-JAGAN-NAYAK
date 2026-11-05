import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  PhoneCall,
  Radio,
  Share2,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { DisasterShelter, WeatherData } from '../types';
import { DISASTER_SHELTERS } from '../data/mockData';

interface DisasterResilienceViewProps {
  weather: WeatherData;
  onNavigateToMap: () => void;
}

export const DisasterResilienceView: React.FC<DisasterResilienceViewProps> = ({
  weather,
  onNavigateToMap,
}) => {
  const [selectedShelter, setSelectedShelter] = useState<DisasterShelter>(DISASTER_SHELTERS[0]);
  const [sosType, setSosType] = useState('Medical Urgent');
  const [sosPeople, setSosPeople] = useState('3');
  const [sosNotes, setSosNotes] = useState('Ground floor inundated with seawater near RK Beach road.');
  const [generatedPayload, setGeneratedPayload] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateMeshSos = (e: React.FormEvent) => {
    e.preventDefault();
    const packet = {
      protocol: 'NAGARNET-MESH-SOS-v1',
      id: `SOS-NGR-${Date.now().toString(36).toUpperCase()}`,
      emergency: sosType,
      citizenCount: Number(sosPeople),
      timestamp: new Date().toISOString(),
      approxCoords: { lat: 17.715, lng: 83.331 },
      notes: sosNotes,
      status: 'UNACKNOWLEDGED_BROADCAST',
    };
    setGeneratedPayload(JSON.stringify(packet, null, 2));
  };

  const copyToClipboard = () => {
    if (!generatedPayload) return;
    navigator.clipboard.writeText(generatedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Active Disaster Warning Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 text-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>GVMC Coastal Early Warning System • Bay of Bengal Sector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Disaster Resilience & Cyclone Evacuation Command
          </h1>
          <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-2xl">
            Live monitoring of squally coastal winds, storm surge, and localized inundation risks.
            Pre-designated multi-purpose cyclone shelters are activated across Visakhapatnam.
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-xl p-3.5 text-center sm:text-right">
          <span className="text-[10px] uppercase font-bold text-amber-200 block">
            Coast Alert Status
          </span>
          <span className="text-sm font-black text-white">ADVISORY LEVEL 2</span>
          <span className="text-[10px] text-red-200 block mt-0.5">Wind Gusts: 45-55 km/h</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Shelter Evacuation Map & Routing Directory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Designated GVMC Cyclone Relief Shelters
                </h2>
                <p className="text-xs text-slate-500">
                  Equipped with emergency power generators, RO water, and paramedic units.
                </p>
              </div>
              <button
                onClick={onNavigateToMap}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>View on GIS Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DISASTER_SHELTERS.map((shelter) => {
                const isSelected = selectedShelter.id === shelter.id;
                const percentFull = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);

                return (
                  <div
                    key={shelter.id}
                    onClick={() => setSelectedShelter(shelter)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        Active Relief Camp
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {shelter.capacity - shelter.currentOccupancy} spots free
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{shelter.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{shelter.address}</p>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                        <span>Occupancy</span>
                        <span>{percentFull}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">{shelter.contactNumber}</span>
                      <span className="text-blue-600 font-bold hover:underline">Select Shelter</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Shelter Details */}
            {selectedShelter && (
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 text-sm">{selectedShelter.name}</span>
                  <span className="text-slate-500">{selectedShelter.ward}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {selectedShelter.suppliesAvailable.map((s) => (
                    <div
                      key={s}
                      className="bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-semibold text-slate-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Offline Mesh-SOS & Emergency Hotlines */}
        <div className="space-y-6">
          {/* Offline Mesh-SOS Generator */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-600 animate-pulse" />
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Offline Mesh-SOS Packet Generator
                </h3>
                <p className="text-[11px] text-slate-500">
                  For communication when cellular towers or internet cables fail.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateMeshSos} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Urgency & Hazard Type
                </label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800"
                >
                  <option value="Medical Urgent">Medical Urgent (Elderly/Injured)</option>
                  <option value="Stranded by Surge">Stranded by Water Surge / Flood</option>
                  <option value="Food & Drinking Water Needed">Food & Drinking Water Needed</option>
                  <option value="Structural Collapse Risk">Structural Building Collapse Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Number of Citizens Stranded
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={sosPeople}
                  onChange={(e) => setSosPeople(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Landmark & Immediate Risk Notes
                </label>
                <textarea
                  rows={2}
                  value={sosNotes}
                  onChange={(e) => setSosNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Generate Offline Mesh-SOS Payload</span>
              </button>
            </form>

            {generatedPayload && (
              <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-[10px] font-mono space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Bluetooth / Wi-Fi Mesh Packet:</span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-sans text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Packet'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">{generatedPayload}</pre>
                <p className="text-emerald-400 font-sans text-[10px]">
                  ✓ Broadcast payload ready to hop peer-to-peer across nearest responder radios.
                </p>
              </div>
            )}
          </div>

          {/* Emergency Hotlines Directory */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Visakhapatnam Emergency Directory</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between">
                <span className="font-semibold text-slate-700">GVMC 24x7 Municipal Control</span>
                <span className="font-mono font-bold text-blue-700">1800-425-0001</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Unified Police & Disaster</span>
                <span className="font-mono font-bold text-red-600">112</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="font-semibold text-slate-700">District Collectorate DDMA</span>
                <span className="font-mono font-bold text-slate-800">0891-2560820</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Indian Coast Guard (Vizag)</span>
                <span className="font-mono font-bold text-slate-800">0891-2568778</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
