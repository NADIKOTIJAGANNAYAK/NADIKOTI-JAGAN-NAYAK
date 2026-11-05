import React, { useState } from 'react';
import { Compass, Layers, Droplets, Mountain, CloudRain, Info, ShieldCheck, Activity } from 'lucide-react';

export const SatelliteIntelligenceView: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'groundwater' | 'inundation' | 'moisture'>('groundwater');

  const layers = [
    {
      id: 'groundwater',
      name: 'Groundwater Storage (NASA GRACE)',
      sensor: 'NASA GRACE & GRACE-FO Satellite Constellation',
      metric: 'Aquifer Water Mass Equivalent (cm anomaly)',
      colorRamp: 'from-amber-600 via-yellow-400 to-emerald-500',
      description:
        'Measures monthly variations in deep groundwater mass. Identifies acute depletion zones across Greater Visakhapatnam industrial aquifers (Gajuwaka/Kurmannapalem).',
    },
    {
      id: 'inundation',
      name: 'Coastal Inundation & Subsidence (Sentinel-1 SAR)',
      sensor: 'Copernicus Sentinel-1 Synthetic Aperture Radar',
      metric: 'Interferometric Land Subsidence (mm/yr) & Surge Mask',
      colorRamp: 'from-blue-600 via-sky-400 to-rose-500',
      description:
        'Penetrates cloud cover to track coastal wave surge, wetland buffer absorption along RK Beach, and low-lying coastal land subsidence.',
    },
    {
      id: 'moisture',
      name: 'Soil Moisture & Drain Saturation (NDMI)',
      sensor: 'Sentinel-2 & Landsat-9 Multi-Spectral',
      metric: 'Normalized Difference Moisture Index (-1.0 to +1.0)',
      colorRamp: 'from-orange-500 via-teal-400 to-indigo-600',
      description:
        'Evaluates soil water absorption capacity. Predicts urban flash floods when monsoon drains are blocked and topsoil is 95%+ saturated.',
    },
  ];

  const current = layers.find((l) => l.id === activeLayer)!;

  const wardRiskGrades = [
    { ward: 'Ward 12 - Siripuram', risk: 'Low', score: 88, note: 'Elevated topography, adequate drainage gradient.' },
    { ward: 'Ward 28 - Jagadamba', risk: 'High', score: 42, note: 'Low-lying basin, chronic monsoon stormwater stagnation.' },
    { ward: 'Ward 17 - MVP Colony', risk: 'Moderate', score: 68, note: 'Moderate coastal proximity, well-recharged groundwater.' },
    { ward: 'Ward 45 - Gajuwaka', risk: 'High', score: 39, note: 'Industrial extraction stress, low aquifer recharge rate.' },
    { ward: 'Ward 4 - Rushikonda', risk: 'Low', score: 91, note: 'Natural runoff into ocean, pristine soil moisture index.' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 text-white rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-cyan-300" />
            <span>Google Earth Engine (GEE) REST Telemetry Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Environmental Satellite & Aquifer Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 max-w-2xl">
            Orbital remote sensing raster data over Visakhapatnam to predict chronic waterlogging,
            aquifer depletion, and coastal storm resilience before civic crises emerge.
          </p>
        </div>

        <div className="bg-cyan-900/40 border border-cyan-500/30 rounded-xl p-3 text-right">
          <span className="text-[10px] text-cyan-300 font-semibold uppercase block">
            Satellite Telemetry
          </span>
          <span className="text-sm font-bold text-white">Copernicus & GRACE-FO Active</span>
          <span className="text-[10px] text-cyan-400 block mt-0.5">Cloud-masked composite</span>
        </div>
      </div>

      {/* Layer Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id as any)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeLayer === l.id
                ? 'bg-white border-cyan-500 shadow-md ring-2 ring-cyan-500/20'
                : 'bg-slate-50 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">{l.name.split(' (')[0]}</span>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                {l.sensor.split(' ')[0]}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{l.description}</p>
          </button>
        ))}
      </div>

      {/* Satellite Imagery Canvas Simulation */}
      <div className="bg-slate-950 rounded-2xl shadow-xl border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Raster Mesh Background Simulation */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
              Active Sensor: {current.sensor}
            </span>
            <h2 className="text-xl sm:text-2xl font-black">{current.name}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {current.description}
            </p>

            {/* Color Ramp Legend */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Color Ramp Index ({current.metric}):
              </span>
              <div className={`w-full h-3 rounded-full bg-gradient-to-r ${current.colorRamp}`} />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Severe Depletion / High Flood Risk</span>
                <span>Normal Buffer</span>
                <span>Surplus Water Storage</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Vizag Coastal Basin Metrics
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Mean Groundwater Depth:</span>
                <span className="font-bold text-cyan-400">14.2 meters bgl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coastal Inundation Buffer:</span>
                <span className="font-bold text-emerald-400">92% Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stormwater Topsoil Saturation:</span>
                <span className="font-bold text-amber-400">46% (Dry Margin Safe)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Environmental Risk Grades */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600" />
          <span>GVMC Ward Environmental & Hydrological Risk Grading</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wardRiskGrades.map((w) => (
            <div
              key={w.ward}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{w.ward}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    w.risk === 'Low'
                      ? 'bg-emerald-100 text-emerald-800'
                      : w.risk === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {w.risk} Risk ({w.score}/100)
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{w.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
