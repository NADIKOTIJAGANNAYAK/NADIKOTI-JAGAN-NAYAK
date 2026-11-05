import React from 'react';
import { CloudRain, Wind, Compass, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherTickerProps {
  weather: WeatherData;
  onOpenDisasterMode?: () => void;
  onOpenSos?: () => void;
}

export const WeatherTicker: React.FC<WeatherTickerProps> = ({
  weather,
  onOpenDisasterMode,
  onOpenSos,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
      {/* Environmental micro-stats */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-medium">
        {/* City & Temp */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white text-xs">VISAKHAPATNAM (GVMC)</span>
          <span className="text-sky-300 font-bold ml-1 text-[24px]">{weather.temp}°C</span>
          <span className="text-slate-400 hidden md:inline text-xs">({weather.condition})</span>
        </div>

        {/* AQI */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-[24px]">
          <span className="text-slate-400">AQI:</span>
          <span className="font-bold text-emerald-400">{weather.aqi}</span>
          <span className="text-[10px] text-emerald-300 px-1 rounded bg-emerald-950/80 font-semibold uppercase">
            {weather.aqiStatus}
          </span>
          <span className="text-[10px] text-slate-400 hidden lg:inline">RK Beach & Siripuram Stn</span>
        </div>

        {/* Wind & Tide */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-300 text-[22px]">
          <Wind className="w-3.5 h-3.5 text-sky-400" />
          <span>{weather.windSpeed} km/h {weather.windDirection}</span>
        </div>

        {/* Rain Forecast */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-300">
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span>{weather.rainfallPrediction}</span>
        </div>

        {/* Real-time Coastal Status */}
        <div className="hidden xl:flex items-center gap-1.5 text-slate-300">
          <Compass className="w-3.5 h-3.5 text-teal-400" />
          <span>{weather.coastalSurgeStatus}</span>
        </div>
      </div>

      {/* Right controls: Disaster alert banner link & API sync */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSos || onOpenDisasterMode}
          className="flex items-center gap-1.5 bg-red-500/25 hover:bg-red-500/35 border border-red-400/60 text-red-200 hover:text-white px-2.5 py-0.5 rounded text-[11px] font-bold transition-all shadow-sm animate-pulse"
          title="Immediate Emergency SOS Trigger"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
          <span>SOS Distress Beacon</span>
        </button>

        <button
          onClick={onOpenDisasterMode}
          className="hidden sm:flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors"
          title="Open Coastal Disaster Resilience Command"
        >
          <span className="hidden md:inline">Coastal Mode:</span> Advisory
        </button>
        <span className="text-[10px] text-slate-500 hidden xl:inline">
          Sync: OpenWeather & CPCB
        </span>
      </div>
    </div>
  );
};
