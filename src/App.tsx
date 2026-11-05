import React, { useState, useEffect } from 'react';
import { WeatherTicker } from './components/WeatherTicker';
import { Navbar } from './components/Navbar';
import { FeatureSearchModal } from './components/FeatureSearchModal';
import { MitraChatModal } from './components/MitraChatModal';
import { HomeOverview } from './components/HomeOverview';
import { ReportForm } from './components/ReportForm';
import { TrackView } from './components/TrackView';
import { GoogleMapsCanvas } from './components/GoogleMapsCanvas';
import { AdminDashboard } from './components/AdminDashboard';
import { DisasterResilienceView } from './components/DisasterResilienceView';
import { SatelliteIntelligenceView } from './components/SatelliteIntelligenceView';
import { HackathonAboutView } from './components/HackathonAboutView';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { QuickSosModal } from './components/QuickSosModal';
import { BrandAssetModal } from './components/BrandAssetModal';
import { WardSuccessPortal } from './components/WardSuccessPortal';
import { FirebaseLoginGate } from './components/FirebaseLoginGate';
import { SettingsModal } from './components/SettingsModal';
import { CitizenPerksModal } from './components/CitizenPerksModal';
import nagernetLogoImg from './assets/images/nagernet_logo_1793901289370.jpg';
import {
  Complaint,
  ComplaintStatus,
  UserProfile,
  UserRole,
  WeatherData,
} from './types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_WEATHER,
  DISASTER_SHELTERS,
} from './data/mockData';
import {
  auth,
  db,
  signOut,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  handleFirestoreError,
  OperationType,
} from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMitraOpen, setIsMitraOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Workflow Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCitizenPerksOpen, setIsCitizenPerksOpen] = useState(false);

  // Theme State: Light / Dark / System Mode (Rule 5)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('nagernet_theme') as 'light' | 'dark' | 'system') || 'light';
  });

  // User State: Starts null to mandate Firebase Login (Rule 1)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Complaints State (Initialized with realistic Visakhapatnam records)
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [weather, setWeather] = useState<WeatherData>(INITIAL_WEATHER);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    INITIAL_COMPLAINTS[0] || null
  );

  // Map Filter State
  const [mapCategory, setMapCategory] = useState<string>('all');
  const [showSheltersOnMap, setShowSheltersOnMap] = useState<boolean>(true);
  const [showHotspotsOnMap, setShowHotspotsOnMap] = useState<boolean>(true);

  // Manage Theme (Light/Dark/System)
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nagernet_theme', theme);
  }, [theme]);

  // Listen to Google Maps Platform quota event as mandated by GMP skill
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setMapsQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedRole = localStorage.getItem('nagernet_role') as UserRole | null;
        const role = storedRole || 'citizen';
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          displayName:
            role === 'officer'
              ? `Officer ${firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'GVMC'}`
              : firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Authenticated Citizen',
          email: firebaseUser.email || (role === 'officer' ? 'officer@vizag.gov' : 'citizen@vizag.gov'),
          role,
          ward: 'Ward 12 - Siripuram & AU Campus',
          honorPoints: role === 'officer' ? 200 : 120,
        };
        setCurrentUser(profile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore complaints collection if online
  useEffect(() => {
    try {
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreItems: Complaint[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              firestoreItems.push({
                id: docSnap.id,
                ...(data as any),
              });
            });
            if (firestoreItems.length > 0) {
              setComplaints(firestoreItems);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'complaints');
        }
      );
      return () => unsubscribe();
    } catch {
      // Retain mock data in dev environment
    }
  }, []);

  // Handle Login Success from FirebaseLoginGate (Role is selected directly in starting state)
  const handleLoginSuccess = async (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem('nagernet_role', profile.role);

    // Save to Firestore users collection if authenticated with Firebase Auth
    if (auth.currentUser) {
      try {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(
          doc(db, 'users', auth.currentUser.uid),
          {
            uid: auth.currentUser.uid,
            email: profile.email,
            role: profile.role,
            displayName: profile.displayName,
            ward: profile.ward,
            honorPoints: profile.honorPoints || 100,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('User profile sync to firestore:', err);
      }
    }

    // Direct routing to designated workspace
    if (profile.role === 'officer' || profile.role === 'admin') {
      setCurrentTab('admin'); // Government official lands directly on Official Resolution Console
    } else {
      setCurrentTab('home'); // Citizen lands on overview & public civic portal
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Signout local
    }
    localStorage.removeItem('nagernet_role');
    setCurrentUser(null);
    setCurrentTab('home');
  };

  // Complaint submission handler
  const handleComplaintSubmitted = async (newComplaint: Complaint) => {
    // 1. Optimistic update in state
    setComplaints((prev) => [newComplaint, ...prev]);
    setSelectedComplaint(newComplaint);

    // 2. Persist to Cloud Firestore
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'complaints', newComplaint.id), {
        ...newComplaint,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `complaints/${newComplaint.id}`);
    }
  };

  // Status and Proof-of-Work update by Government Official (Rule 3)
  const handleUpdateComplaintStatus = async (
    complaintId: string,
    newStatus: ComplaintStatus,
    proofUrl?: string,
    proofNotes?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: newStatus,
            proofOfWorkUrl: proofUrl || c.proofOfWorkUrl,
            proofOfWorkNotes: proofNotes || c.proofOfWorkNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // Update in Firestore
    try {
      const docRef = doc(db, 'complaints', complaintId);
      await updateDoc(docRef, {
        status: newStatus,
        ...(proofUrl ? { proofOfWorkUrl: proofUrl } : {}),
        ...(proofNotes ? { proofOfWorkNotes: proofNotes } : {}),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `complaints/${complaintId}`);
    }
  };

  // Citizen Proof of Work Verification (Closes ticket & awards Honor points)
  const handleVerifyProofOfWork = async (complaintId: string, verified: boolean) => {
    const targetStatus: ComplaintStatus = verified ? 'verified_closed' : 'in_progress';

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: targetStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    try {
      const docRef = doc(db, 'complaints', complaintId);
      await updateDoc(docRef, {
        status: targetStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `complaints/${complaintId}`);
    }
  };

  // Rapid Emergency SOS Broadcast Handler
  const handleEmergencySos = async (payload: {
    type: string;
    details: string;
    peopleCount: number;
    lat: number;
    lng: number;
  }) => {
    const sosComplaint: Complaint = {
      id: `GVMC-SOS-${Date.now().toString(36).toUpperCase()}`,
      citizenId: currentUser?.uid || 'sos-citizen',
      citizenName: currentUser?.displayName || 'Citizen Distress Beacon',
      citizenEmail: currentUser?.email || 'emergency@vizag.gov',
      title: `🚨 EMERGENCY SOS: ${payload.type}`,
      description: payload.details,
      category: 'other_civic',
      priority: 'critical',
      status: 'submitted',
      lat: payload.lat,
      lng: payload.lng,
      address: `Bay of Bengal Coastal Sector (${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)})`,
      ward: 'Ward 12 - Disaster Sector',
      department: 'GVMC Disaster Management & Fire Services',
      slaDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      escalated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 24,
    };

    setComplaints((prev) => [sosComplaint, ...prev]);

    try {
      await addDoc(collection(db, 'complaints'), {
        ...sosComplaint,
        serverTimestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Fallback offline SOS stored locally', err);
    }
  };

  // STEP 1 ENFORCEMENT: First it should ask the firebase login
  if (!currentUser) {
    return <FirebaseLoginGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Mandatory GMP Quota Warning Banner per Google Maps skill */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 dark:text-amber-100 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Starting Environmental Header showing Temp, AQI, and Weather */}
      <WeatherTicker
        weather={weather}
        onOpenDisasterMode={() => setCurrentTab('disaster')}
        onOpenSos={() => setIsSosOpen(true)}
      />

      {/* Main Navbar with prominent SOS trigger & Settings button */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMitra={() => setIsMitraOpen(true)}
        onOpenFirebaseLogin={() => setIsAuthModalOpen(true)}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenCitizenPerks={() => setIsCitizenPerksOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* STEP 5: Dedicated Settings Modal (Light and Dark Mode Switching) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        currentTheme={theme}
        onThemeChange={setTheme}
        onLogout={handleLogout}
      />

      {/* Citizen Perks & Rewards Modal (Rule 3 & 4: Officials blocked, citizens rewarded) */}
      <CitizenPerksModal
        isOpen={isCitizenPerksOpen}
        onClose={() => setIsCitizenPerksOpen(false)}
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Dedicated Quick SOS Distress Beacon Modal */}
      <QuickSosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onNavigateToDisaster={() => {
          setIsSosOpen(false);
          setCurrentTab('disaster');
        }}
        currentUser={currentUser}
        onSubmitEmergencySos={handleEmergencySos}
      />

      {/* Dedicated Firebase Authentication Details Modal */}
      <FirebaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(profile) => setCurrentUser(profile)}
        onLogout={handleLogout}
      />

      {/* Command Palette Feature Search Modal */}
      <FeatureSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectFeature={(route) => {
          if (route === 'mitra') {
            setIsMitraOpen(true);
          } else if (route === 'sos') {
            setIsSosOpen(true);
          } else if (route === 'brand-logo') {
            setIsBrandModalOpen(true);
          } else if (route === 'settings') {
            setIsSettingsOpen(true);
          } else if (route === 'perks') {
            setIsCitizenPerksOpen(true);
          } else {
            setCurrentTab(route);
          }
        }}
      />

      {/* Mitra Multilingual AI Voice & Text Assistant */}
      <MitraChatModal
        isOpen={isMitraOpen}
        onClose={() => setIsMitraOpen(false)}
        onNavigateToReport={() => {
          setIsMitraOpen(false);
          setCurrentTab('report');
        }}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'home' && (
          <HomeOverview
            weather={weather}
            complaints={complaints}
            onNavigate={setCurrentTab}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenMitra={() => setIsMitraOpen(true)}
            onOpenSos={() => setIsSosOpen(true)}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        )}

        {currentTab === 'report' && (
          <ReportForm
            currentUser={currentUser}
            onComplaintSubmitted={handleComplaintSubmitted}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'track' && (
          <TrackView
            complaints={complaints}
            currentUser={currentUser}
            onVerifyProofOfWork={handleVerifyProofOfWork}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        )}

        {currentTab === 'ward-success' && (
          <WardSuccessPortal
            complaints={complaints}
            onNavigateToReport={() => setCurrentTab('report')}
            onSelectComplaint={(c) => {
              setSelectedComplaint(c);
              setCurrentTab('track');
            }}
          />
        )}

        {currentTab === 'map' && (
          <div className="space-y-4">
            {/* Map Header & Filter Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white font-display-brand">
                  Visakhapatnam Civic Issue & Hotspot Map
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Interactive GIS visualization across 98 GVMC municipal wards.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <select
                  value={mapCategory}
                  onChange={(e) => setMapCategory(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
                >
                  <option value="all">All Civic Categories</option>
                  <option value="road_damage">Road Damage</option>
                  <option value="drainage_problems">Drainage Problems</option>
                  <option value="garbage_accumulation">Garbage Accumulation</option>
                  <option value="water_leakage">Water Leakage</option>
                  <option value="streetlight_failure">Streetlight Failure</option>
                  <option value="other_civic">Other Concerns</option>
                </select>

                {/* Hotspot Toggle */}
                <button
                  onClick={() => setShowHotspotsOnMap(!showHotspotsOnMap)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                    showHotspotsOnMap
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50'
                  }`}
                >
                  {showHotspotsOnMap ? '✓ Hotspots Visible' : '+ Show Hotspots'}
                </button>

                {/* Shelters Toggle */}
                <button
                  onClick={() => setShowSheltersOnMap(!showSheltersOnMap)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                    showSheltersOnMap
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  {showSheltersOnMap ? '✓ Shelters Visible' : '+ Show Shelters'}
                </button>
              </div>
            </div>

            {/* Google Maps Full Canvas */}
            <GoogleMapsCanvas
              complaints={complaints}
              shelters={DISASTER_SHELTERS}
              selectedCategory={mapCategory}
              showShelters={showSheltersOnMap}
              showHotspots={showHotspotsOnMap}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
            />
          </div>
        )}

        {currentTab === 'disaster' && (
          <DisasterResilienceView
            weather={weather}
            onNavigateToMap={() => {
              setShowSheltersOnMap(true);
              setCurrentTab('map');
            }}
          />
        )}

        {currentTab === 'satellite' && <SatelliteIntelligenceView />}

        {/* STEP 3 & 4: Admin Dashboard with strict Government Official Perk vs Citizen Access Block */}
        {currentTab === 'admin' && (
          <AdminDashboard
            complaints={complaints}
            currentUser={currentUser}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            onNavigateHome={() => setCurrentTab('home')}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'about' && <HackathonAboutView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 shadow-sm">
                <img
                  src={nagernetLogoImg}
                  alt="NagarNet Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-white text-base font-display-brand tracking-wide">
                Nagar<span className="text-blue-400">Net</span>
              </span>
              <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                Civic OS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              "One City. One Platform. Every Problem Matters." • Greater Visakhapatnam Municipal Corporation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1"
            >
              <span>⚙️ Settings & Theme</span>
            </button>
            <button
              onClick={() => setIsCitizenPerksOpen(true)}
              className="text-purple-400 hover:text-purple-300 font-bold transition-colors flex items-center gap-1"
            >
              <span>🎁 Citizen Perks</span>
            </button>
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1"
            >
              <span>Official Logo & Assets</span>
            </button>
            <button
              onClick={() => setCurrentTab('ward-success')}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1"
            >
              <span>Ward Success Portal</span>
            </button>
            <button onClick={() => setCurrentTab('about')} className="hover:text-white transition-colors">
              Hackathon Presentation
            </button>
            <button onClick={() => setCurrentTab('map')} className="hover:text-white transition-colors">
              GIS Issue Map
            </button>
          </div>
        </div>
      </footer>

      {/* Official NagarNet Brand Asset & Logo Preview / Download Modal */}
      <BrandAssetModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />
    </div>
  );
}
