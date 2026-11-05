export type ComplaintCategory =
  | 'road_damage'
  | 'garbage_accumulation'
  | 'water_leakage'
  | 'streetlight_failure'
  | 'drainage_problems'
  | 'other_civic';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'verified_closed';

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  phone?: string;
  ward?: string;
  honorPoints?: number;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  lat: number;
  lng: number;
  address: string;
  ward: string;
  imageUrl?: string;
  proofOfWorkUrl?: string;
  proofOfWorkNotes?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  department?: string;
  slaDeadline: string; // ISO string
  escalated: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  upvotes?: number;
}

export interface ActivityLogItem {
  id: string;
  complaintId: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  details: string;
  timestamp: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  aqi: number;
  aqiStatus: string;
  rainfallPrediction: string;
  coastalSurgeStatus: string;
  lastUpdated: string;
}

export interface DisasterShelter {
  id: string;
  name: string;
  address: string;
  ward: string;
  capacity: number;
  currentOccupancy: number;
  lat: number;
  lng: number;
  contactNumber: string;
  suppliesAvailable: string[];
}

export interface CivicNewsItem {
  id: string;
  title: string;
  tier: 'local' | 'district' | 'state' | 'national';
  source: string;
  timestamp: string;
  summary: string;
  url?: string;
  category: 'governance' | 'weather' | 'infrastructure' | 'advisory';
}

export interface WardMetadata {
  wardNumber: number;
  wardName: string;
  zone: 'Zone 1 (Bheemili & Rushikonda)' | 'Zone 2 (Madhurawada & Yendada)' | 'Zone 3 (Central Vizag & AU)' | 'Zone 4 (Old Town & Port)' | 'Zone 5 (Gajuwaka Industrial)' | 'Zone 6 (Steel Plant & South)';
  corporatorName: string;
  assistantEngineer: string;
  contactPhone: string;
  sanitationFleetCount: number;
  population: number;
  keyLandmarks: string[];
}

