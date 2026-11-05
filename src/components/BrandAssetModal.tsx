import React from 'react';
import { X, Download, Copy, Check, Sparkles, Shield, Palette } from 'lucide-react';
import nagernetLogoImg from '../assets/images/nagernet_logo_1793901289370.jpg';

interface BrandAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandAssetModal: React.FC<BrandAssetModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/nagernet-logo.jpg');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = nagernetLogoImg;
    link.download = 'nagernet-civic-intelligence-logo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="font-bold text-sm tracking-tight text-white">
              <span className="font-display-brand text-cyan-400">NagarNet</span> Official Brand Asset
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logo Presentation Area */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
          <div className="relative group w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl shadow-cyan-500/20 bg-slate-950 ring-4 ring-blue-500/20">
            <img
              src={nagernetLogoImg}
              alt="Official NagarNet Civic Intelligence Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-cyan-300 bg-slate-950/80 backdrop-blur-md py-1 px-2.5 rounded-lg border border-cyan-500/30">
              1024 × 1024 • High-Definition Vector Emblem
            </div>
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h4 className="text-2xl font-black text-white tracking-wide font-display-brand">
              Nagar<span className="text-cyan-400">Net</span> Emblem
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Featuring the geometric digital compass, interconnected smart city mesh nodes, and oceanic Visakhapatnam cyan-azure palette.
            </p>
          </div>

          {/* Color Palette Indicators */}
          <div className="grid grid-cols-4 gap-2 w-full pt-2">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <div className="w-full h-4 rounded-md bg-[#00D2FF] mb-1.5 shadow-sm" />
              <span className="text-[10px] font-mono text-slate-300 font-bold block">#00D2FF</span>
              <span className="text-[9px] text-slate-400">Electric Cyan</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <div className="w-full h-4 rounded-md bg-[#1D4ED8] mb-1.5 shadow-sm" />
              <span className="text-[10px] font-mono text-slate-300 font-bold block">#1D4ED8</span>
              <span className="text-[9px] text-slate-400">Civic Blue</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <div className="w-full h-4 rounded-md bg-[#0F172A] mb-1.5 shadow-sm border border-slate-600" />
              <span className="text-[10px] font-mono text-slate-300 font-bold block">#0F172A</span>
              <span className="text-[9px] text-slate-400">Deep Navy</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <div className="w-full h-4 rounded-md bg-[#10B981] mb-1.5 shadow-sm" />
              <span className="text-[10px] font-mono text-slate-300 font-bold block">#10B981</span>
              <span className="text-[9px] text-slate-400">SLA Emerald</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full pt-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Image</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
              title="Copy Image URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
