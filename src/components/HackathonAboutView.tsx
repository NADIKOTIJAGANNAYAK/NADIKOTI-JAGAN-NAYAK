import React from 'react';
import {
  Compass,
  Award,
  Layers,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  HelpCircle,
  ExternalLink,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import nagernetLogoImg from '../assets/images/nagernet_logo_1793901289370.jpg';

export const HackathonAboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Hero Presentation Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-600/40 text-blue-300 border border-blue-400/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Local2Global Hackathon • GDG Vizag
            </span>
            <span className="text-xs font-bold text-slate-400">
              Track: Civic Tech & Municipal Governance
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-wide leading-tight font-display-brand">
            Nagar<span className="text-blue-400">Net</span>
          </h1>

          <p className="text-lg sm:text-xl font-bold text-sky-200">
            "One City. One Platform. Every Problem Matters."
          </p>

          <p className="text-sm text-slate-300 leading-relaxed">
            An end-to-end AI-powered municipal intelligence and disaster resilience ecosystem designed
            for the Greater Visakhapatnam Municipal Corporation (GVMC), built to scale globally to all
            smart cities.
          </p>
        </div>

        {/* Official NagarNet Logo Emblem */}
        <div className="relative z-10 shrink-0 flex flex-col items-center gap-2.5">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/25 bg-slate-950 ring-4 ring-blue-500/30 group">
            <img
              src={nagernetLogoImg}
              alt="NagarNet Official Civic Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-300 bg-slate-900/90 border border-cyan-500/30 px-2.5 py-1 rounded-md">
            Official Brand Emblem
          </span>
        </div>
      </div>

      {/* Official NagarNet Logo & Brand Asset Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-black text-cyan-600 uppercase tracking-wider block">
              Official Brand Identity
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              <span className="font-display-brand text-blue-600">NagarNet</span> Logo & Visual Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-definition vector asset designed for Greater Visakhapatnam Municipal Corporation Civic OS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={nagernetLogoImg}
              download="nagernet-civic-logo.jpg"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res Logo</span>
            </a>
            <a
              href="/nagernet-logo.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Raw Image</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex justify-center md:justify-start">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-xl bg-slate-950">
              <img
                src={nagernetLogoImg}
                alt="NagarNet High-Res Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Emblem Symbology & Design Rationale</h4>
              <p className="leading-relaxed">
                The NagarNet emblem synthesizes a <strong>digital navigational compass</strong> representing rapid 72h SLA accountability and GIS incident direction, overlaid with an <strong>interconnected urban mesh graph</strong> denoting ward-level community sensors and citizen participatory governance.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="h-3.5 rounded bg-[#00D2FF] mb-1" />
                <span className="font-bold text-slate-900 block text-[11px]">#00D2FF</span>
                <span className="text-[10px] text-slate-500">Electric Cyan</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="h-3.5 rounded bg-[#1D4ED8] mb-1" />
                <span className="font-bold text-slate-900 block text-[11px]">#1D4ED8</span>
                <span className="text-[10px] text-slate-500">Civic Blue</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="h-3.5 rounded bg-[#0B192C] mb-1" />
                <span className="font-bold text-slate-900 block text-[11px]">#0B192C</span>
                <span className="text-[10px] text-slate-500">Oceanic Navy</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="h-3.5 rounded bg-[#10B981] mb-1" />
                <span className="font-bold text-slate-900 block text-[11px]">#10B981</span>
                <span className="text-[10px] text-slate-500">SLA Emerald</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem vs Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
          <span className="text-xs font-black text-red-600 uppercase tracking-wider block">
            The Civic Challenge
          </span>
          <h2 className="text-lg font-bold text-slate-950">
            Unaccountable Complaints & Coastal Vulnerability
          </h2>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>No Binding SLAs:</strong> Citizens submit grievances that linger for months
                with zero municipal accountability or escalation mechanism.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>Fake Closures:</strong> Officers mark tickets "solved" on paper without
                objective proof of work, leaving citizens frustrated.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>Cyclone Disconnection:</strong> During Bay of Bengal coastal storms, cellular
                towers drop, leaving families stranded without shelter routing or mesh SOS.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider block">
            The NagarNet Innovation
          </span>
          <h2 className="text-lg font-bold text-slate-950">
            AI Intake, 72h Binding SLA & Citizen Sign-off
          </h2>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>Gemini Multimodal Intake:</strong> Citizens simply photograph the hazard;
                Gemini classifies category, severity, and damage notes automatically.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>Binding 72-Hour SLA Contract:</strong> Automatic escalation to Zonal
                Commissioners and demerit points on ward officer election scorecards.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>Citizen Proof-of-Work Verification:</strong> Tickets only officially close
                when the citizen inspects the officer's geotagged repair photograph.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>
                <strong>Offline Mesh-SOS & GEE:</strong> Satellite groundwater / flood monitoring and
                Bluetooth mesh packets for zero-cellular disaster relief.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Google Technology Stack */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Google Technology Architecture</h2>
          <p className="text-xs text-slate-500 mt-1">
            Production integration of Google's flagship cloud, AI, and geospatial developer stack.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              AI
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Google Gemini API</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Gemini 2.5 Flash powers both server-side multimodal image hazard classification and the
              Mitra multilingual conversational voice/text assistant (Telugu, Hindi, English).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              MAP
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Google Maps Platform</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Official `@vis.gl/react-google-maps` SDK, `DEMO_MAP_ID`, Advanced Markers, 50m hotspot
              clustering, and cyclone shelter evacuation routing across Visakhapatnam.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              FB
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Firebase Backend</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Firebase Authentication (Google Sign-In) and Cloud Firestore fortified with the 8
              Pillars of Hardened Security Rules, RBAC, and server timestamps.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              GEE
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Google Earth Engine (GEE)</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              NASA GRACE satellite groundwater telemetry, Copernicus Sentinel-1 radar coastal surge,
              and NDMI topsoil saturation indexes.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Minute Pitch Script for Judges */}
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black tracking-tight">2-Minute Judge Demonstration Script</h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800">
          <p>
            <strong className="text-sky-300">[0:00 - 0:30] Hook:</strong> "Respected judges, in
            Visakhapatnam, during monsoons, thousands of potholes and blocked drains threaten lives.
            Citizens file complaints, but there is no deadline. Today, we present NagarNet:
            One City, One Platform, Every Problem Matters."
          </p>
          <p>
            <strong className="text-sky-300">[0:30 - 1:00] Live Demo:</strong> "Watch as I snap a photo
            of broken road asphalt. Our server calls Gemini 2.5 Flash, which immediately identifies
            the pothole, sets category 'Road Damage', and starts a strict 72-hour binding countdown
            timer. The ticket appears live on our Google Map of Visakhapatnam."
          </p>
          <p>
            <strong className="text-sky-300">[1:00 - 1:30] Governance Loop:</strong> "Here in the Admin
            dashboard, the ward engineer resolves the repair and uploads a geotagged before/after photo.
            Notice the ticket doesn't close yet! The reporting citizen must inspect the proof of work
            and click 'Verify & Close', earning the officer +50 honor points."
          </p>
          <p>
            <strong className="text-sky-300">[1:30 - 2:00] Coastal Resilience:</strong> "Finally,
            during Bay of Bengal cyclones, our platform switches into Disaster Mode: routing citizens
            to Andhra University shelters, providing Google Earth Engine groundwater monitoring, and
            generating offline Mesh-SOS distress packets. Thank you!"
          </p>
        </div>
      </div>

      {/* Frequently Asked Judge Questions (FAQ) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-black text-slate-900">Judge Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3 text-xs text-slate-700 divide-y divide-slate-100">
          <div className="pt-2">
            <h3 className="font-bold text-slate-900 mb-1">
              Q1: How do you prevent citizens from spamming or submitting duplicate tickets?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              We implemented spatial deduplication with a 50-meter radius clustering algorithm. If a
              citizen photographs the same drain or pothole within 50m of an existing ticket, the
              system merges it as an upvote to the existing complaint rather than creating duplicate
              tickets.
            </p>
          </div>

          <div className="pt-3">
            <h3 className="font-bold text-slate-900 mb-1">
              Q2: What prevents field officers from uploading fake or stock photos as proof-of-work?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Two gates: First, the original reporting citizen must inspect the before/after photos and
              click 'Verify & Close'. Second, the system requires geolocation verification matching the
              ticket coordinates. Unverified tickets remain open and escalate after 72 hours.
            </p>
          </div>

          <div className="pt-3">
            <h3 className="font-bold text-slate-900 mb-1">
              Q3: Can this platform expand to other cities like Vijayawada, Hyderabad, or Bengaluru?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Yes! NagarNet is built with modular ward configurations, dynamic GIS coordinate
              bounding, and multi-tenant Firestore structures, allowing instant onboarding of any
              Indian or international municipal corporation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
