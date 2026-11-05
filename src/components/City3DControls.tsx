import React, { useState } from 'react';
import {
  Compass,
  Sun,
  Sunset,
  Moon,
  Layers,
  Eye,
  Camera,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Radio,
  Truck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface City3DControlsProps {
  onSetCamera: (preset: 'overview' | 'coast' | 'ward12' | 'tour') => void;
  onSetLighting: (preset: 'day' | 'sunset' | 'night') => void;
  onToggleLayer: (layer: 'complaints' | 'fleet' | 'radar') => void;
  activeCam: 'overview' | 'coast' | 'ward12' | 'tour';
  activeLighting: 'day' | 'sunset' | 'night';
  layers: {
    complaints: boolean;
    fleet: boolean;
    radar: boolean;
  };
}

export const City3DControls: React.FC<City3DControlsProps> = ({
  onSetCamera,
  onSetLighting,
  onToggleLayer,
  activeCam,
  activeLighting,
  layers,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-3xl pointer-events-none select-none">
      <div className="flex flex-col items-center">
        {/* Cinema / Zen Mode Collapse Trigger */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="pointer-events-auto mb-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
          title="Toggle 3D Viewport Controls"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Show 3D City Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hide Controls (Cinema View)</span>
            </>
          )}
        </button>

        {/* Collapsible Dock Container (Solid rgba surface to avoid backdrop-filter lag on software WebGL) */}
        {!isCollapsed && (
          <div className="pointer-events-auto w-full bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-2.5 sm:p-3 text-slate-200 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
              {/* Group 1: Camera Presets */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                  Camera:
                </span>
                <button
                  type="button"
                  onClick={() => onSetCamera('overview')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeCam === 'overview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetCamera('coast')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeCam === 'coast'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Coast</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetCamera('ward12')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeCam === 'ward12'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Ward 12</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetCamera('tour')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeCam === 'tour'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Flyover Tour</span>
                </button>
              </div>

              {/* Group 2: Lighting Presets */}
              <div className="flex items-center gap-1 border-l border-slate-800 pl-2 sm:pl-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline">
                  Time:
                </span>
                <button
                  type="button"
                  onClick={() => onSetLighting('day')}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeLighting === 'day'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title="Daytime Sunlight"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSetLighting('sunset')}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeLighting === 'sunset'
                      ? 'bg-orange-500 text-white font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title="Sunset Coastal Golden Hour"
                >
                  <Sunset className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSetLighting('night')}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeLighting === 'night'
                      ? 'bg-indigo-600 text-white font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title="Night Cyber Telemetry"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

              {/* Group 3: Layer Toggles */}
              <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 sm:pl-3">
                <button
                  type="button"
                  onClick={() => onToggleLayer('complaints')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 border ${
                    layers.complaints
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title="Toggle 3D Civic Hazard Beacons"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Beacons</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleLayer('radar')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 border ${
                    layers.radar
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title="Toggle Coastal Early Warning Radar"
                >
                  <Radio className="w-3 h-3 text-cyan-400" />
                  <span>Radar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleLayer('fleet')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 border ${
                    layers.fleet
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title="Toggle Municipal Patrol Vehicle"
                >
                  <Truck className="w-3 h-3 text-amber-400" />
                  <span>Fleet</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
