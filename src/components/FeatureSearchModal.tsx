import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, AlertTriangle, Shield, ShieldAlert, Activity, BarChart3, Bot, Compass, CloudSun, FileText, Sparkles, Award } from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  category: 'Citizen Services' | 'Maps & Hotspots' | 'Disaster & Safety' | 'Administration' | 'AI Assistant' | 'Brand & Identity';
  description: string;
  route: string;
  icon: React.ReactNode;
  shortcut?: string;
}

interface FeatureSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (route: string) => void;
}

export const FeatureSearchModal: React.FC<FeatureSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
}) => {
  const [query, setQuery] = useState('');

  const features: FeatureItem[] = [
    {
      id: 'emergency-sos-beacon',
      title: '🚨 Emergency SOS Distress Beacon',
      category: 'Disaster & Safety',
      description: 'Trigger immediate 1-tap rescue beacon with GPS coordinates and offline Mesh packet.',
      route: 'sos',
      icon: <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />,
      shortcut: 'SOS',
    },
    {
      id: 'report-pothole',
      title: 'Report Road Damage / Pothole',
      category: 'Citizen Services',
      description: 'Snap a photo, AI auto-classifies issue and binds a 72-hour repair countdown.',
      route: 'report',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'report-drain',
      title: 'Report Clogged Monsoon Drain',
      category: 'Citizen Services',
      description: 'Report stagnant water or blocked drainage canals before flash floods.',
      route: 'report',
      icon: <Activity className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'report-garbage',
      title: 'Report Overflowing Solid Waste',
      category: 'Citizen Services',
      description: 'Notify GVMC sanitary supervisor to dispatch immediate garbage compactor.',
      route: 'report',
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'track-sla',
      title: 'Track Complaint & 72-Hour Binding SLA',
      category: 'Citizen Services',
      description: 'Real-time countdown timer, officer assignment, and citizen proof-of-work closure.',
      route: 'track',
      icon: <Activity className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'ward-success-portal',
      title: 'Ward Success Rate & Solved Problems Portal',
      category: 'Citizen Services',
      description: 'Check resolution success percentage by ward number, 72h SLA compliance, and what problems were solved.',
      route: 'ward-success',
      icon: <Award className="w-4 h-4 text-emerald-600" />,
      shortcut: 'W',
    },
    {
      id: 'civic-map',
      title: 'Interactive Civic GIS Map of Visakhapatnam',
      category: 'Maps & Hotspots',
      description: 'Explore live reports across 98 GVMC wards with category filters.',
      route: 'map',
      icon: <MapPin className="w-4 h-4 text-rose-500" />,
    },
    {
      id: 'hotspot-clusters',
      title: 'Civic Hotspot Intelligence (50m Clustering)',
      category: 'Maps & Hotspots',
      description: 'View recurrence clusters and chronic infrastructure defect zones.',
      route: 'map',
      icon: <Compass className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'weather-aqi',
      title: 'Live Visakhapatnam Weather & AQI Radar',
      category: 'Disaster & Safety',
      description: 'Temperature, PM2.5 AQI stations, coastal surge, and wind speeds.',
      route: 'disaster',
      icon: <CloudSun className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'cyclone-shelters',
      title: 'Emergency Cyclone Shelters & Evacuation Routes',
      category: 'Disaster & Safety',
      description: 'Directions to Andhra University, Swarna Bharathi, and GVMC relief camps.',
      route: 'disaster',
      icon: <Shield className="w-4 h-4 text-amber-600" />,
    },
    {
      id: 'mesh-sos',
      title: 'Offline Mesh-SOS Distress Generator',
      category: 'Disaster & Safety',
      description: 'Broadcast emergency rescue packets without active internet/cellular network.',
      route: 'disaster',
      icon: <Shield className="w-4 h-4 text-red-500" />,
    },
    {
      id: 'satellite-gee',
      title: 'Google Earth Engine (GEE) Satellite Intelligence',
      category: 'Maps & Hotspots',
      description: 'NASA GRACE groundwater storage and Sentinel-1 coastal flood rasters.',
      route: 'satellite',
      icon: <Compass className="w-4 h-4 text-cyan-500" />,
    },
    {
      id: 'mitra-ai',
      title: 'Mitra AI Civic Assistant (Voice & Chat)',
      category: 'AI Assistant',
      description: 'Telugu, Hindi, and English multilingual guidance for taxes and tickets.',
      route: 'mitra',
      icon: <Bot className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'admin-dashboard',
      title: 'GVMC Administrator Command Center',
      category: 'Administration',
      description: 'Manage complaints, assign officers, and upload resolution proof-of-work.',
      route: 'admin',
      icon: <BarChart3 className="w-4 h-4 text-slate-700" />,
    },
    {
      id: 'ward-leaderboard',
      title: 'Ward Member Performance Election Scorecard',
      category: 'Administration',
      description: 'Public rankings of on-time resolution rates across all 98 wards.',
      route: 'admin',
      icon: <BarChart3 className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'about-pitch',
      title: 'About NagarNet – GDG Hackathon Presentation',
      category: 'Administration',
      description: 'System architecture, Google tech stack, 2-minute demo script & judge FAQs.',
      route: 'about',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'brand-logo',
      title: 'Official NagarNet Logo & High-Res Brand Asset',
      category: 'Brand & Identity',
      description: 'View and download the high-definition vector logo image and civic brand colors.',
      route: 'brand-logo',
      icon: <Sparkles className="w-4 h-4 text-cyan-500" />,
    },
  ];

  const filtered = features.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features (e.g., Pothole, 72h SLA, AQI, Cyclone Shelter, Mitra AI)..."
            className="w-full bg-transparent text-slate-800 text-sm focus:outline-none placeholder:text-slate-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 mr-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p className="font-semibold text-slate-700">No feature found matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for "report", "map", "SLA", "weather", or "shelter".
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectFeature(item.route);
                  onClose();
                }}
                className="w-full text-left px-3.5 py-3 hover:bg-sky-50/80 rounded-lg transition-colors flex items-start gap-3 group"
              >
                <div className="mt-0.5 p-2 rounded-md bg-slate-100 group-hover:bg-white group-hover:shadow-sm border border-slate-200/60 transition-all">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-700">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal Footer / Keyboard hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click any feature to navigate immediately</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
