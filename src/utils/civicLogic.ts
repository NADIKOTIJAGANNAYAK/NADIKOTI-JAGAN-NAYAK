/**
 * Pure civic intelligence and municipal governance logic for NagarNet
 */

export interface SlaStatus {
  hoursRemaining: number;
  isOverdue: boolean;
  progressPercent: number;
  formattedTime: string;
  urgency: 'normal' | 'warning' | 'critical' | 'escalated';
}

export function calculateSlaStatus(createdAtIso: string | number, slaHours = 72, nowMs: number = Date.now()): SlaStatus {
  const createdTime = typeof createdAtIso === 'string' ? new Date(createdAtIso).getTime() : createdAtIso;
  const deadline = createdTime + slaHours * 3600 * 1000;
  const msRemaining = deadline - nowMs;
  const hoursRemaining = msRemaining / (3600 * 1000);

  const elapsedMs = Math.max(0, nowMs - createdTime);
  const totalSlaMs = slaHours * 3600 * 1000;
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalSlaMs) * 100));

  if (hoursRemaining <= 0) {
    const overdueHours = Math.abs(Math.floor(hoursRemaining));
    return {
      hoursRemaining: 0,
      isOverdue: true,
      progressPercent: 100,
      formattedTime: `Overdue by ${overdueHours}h`,
      urgency: 'escalated',
    };
  }

  const roundedHours = Math.floor(hoursRemaining);
  const minutes = Math.floor((msRemaining % (3600 * 1000)) / (60 * 1000));
  const formattedTime = `${roundedHours}h ${minutes}m left`;

  let urgency: SlaStatus['urgency'] = 'normal';
  if (hoursRemaining <= 12) {
    urgency = 'critical';
  } else if (hoursRemaining <= 24) {
    urgency = 'warning';
  }

  return {
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    isOverdue: false,
    progressPercent: Math.round(progressPercent),
    formattedTime,
    urgency,
  };
}

export function calculateHonorPoints(isResolved: boolean, resolvedInHours: number, slaHours = 72): number {
  if (!isResolved) return 0;
  if (resolvedInHours <= slaHours) {
    return 50; // +50 Honor points for timely civic repair
  }
  return -100; // -100 penalty for overdue municipal negligence
}

export interface HotspotCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  count: number;
  category: string;
  radiusMeters: number;
  severity: 'low' | 'medium' | 'high' | 'severe';
  sampleTitle: string;
}

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function clusterComplaints(
  complaints: Array<{ id: string; lat: number; lng: number; category: string; title: string }>,
  thresholdDistanceMeters = 150
): HotspotCluster[] {
  const clusters: HotspotCluster[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < complaints.length; i++) {
    const c1 = complaints[i];
    if (visited.has(c1.id)) continue;

    visited.add(c1.id);
    const group = [c1];

    for (let j = i + 1; j < complaints.length; j++) {
      const c2 = complaints[j];
      if (visited.has(c2.id)) continue;
      if (c1.category === c2.category) {
        const dist = haversineDistanceMeters(c1.lat, c1.lng, c2.lat, c2.lng);
        if (dist <= thresholdDistanceMeters) {
          visited.add(c2.id);
          group.push(c2);
        }
      }
    }

    const avgLat = group.reduce((acc, c) => acc + c.lat, 0) / group.length;
    const avgLng = group.reduce((acc, c) => acc + c.lng, 0) / group.length;

    let severity: HotspotCluster['severity'] = 'low';
    if (group.length >= 5) severity = 'severe';
    else if (group.length >= 3) severity = 'high';
    else if (group.length >= 2) severity = 'medium';

    clusters.push({
      id: `cluster-${c1.category}-${i}`,
      centerLat: Math.round(avgLat * 100000) / 100000,
      centerLng: Math.round(avgLng * 100000) / 100000,
      count: group.length,
      category: c1.category,
      radiusMeters: Math.min(300, Math.max(50, group.length * 40)),
      severity,
      sampleTitle: c1.title,
    });
  }

  return clusters.sort((a, b) => b.count - a.count);
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 2000);
}

export function isWithinVisakhapatnamBounds(lat: number, lng: number): boolean {
  // GVMC coordinates approximately: 17.40°N to 18.00°N, 83.05°E to 83.50°E
  return lat >= 17.40 && lat <= 18.00 && lng >= 83.05 && lng <= 83.50;
}

export function getWardNumberFromName(wardName: string): number {
  const match = wardName.match(/Ward\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

export interface WardComputedStats {
  wardName: string;
  wardNumber: number;
  totalComplaints: number;
  solvedCount: number;
  inProgressCount: number;
  overdueCount: number;
  successRate: number; // 0 - 100
  onTimeSlaRate: number; // 0 - 100
  avgResolutionHours: number;
  solvedByCategory: Record<string, number>;
  solvedComplaints: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    address: string;
    proofOfWorkNotes?: string;
    proofOfWorkUrl?: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export function computeWardStats(
  complaints: Array<{
    id: string;
    ward: string;
    status: string;
    category: string;
    priority: string;
    title: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    slaDeadline?: string;
    proofOfWorkNotes?: string;
    proofOfWorkUrl?: string;
    imageUrl?: string;
  }>,
  wardName: string
): WardComputedStats {
  const wardNumber = getWardNumberFromName(wardName);
  const wardList = complaints.filter(
    (c) => c.ward.toLowerCase().includes(`ward ${wardNumber}`) || c.ward.toLowerCase() === wardName.toLowerCase()
  );

  const total = wardList.length;
  const solved = wardList.filter((c) => c.status === 'resolved' || c.status === 'verified_closed');
  const inProgress = wardList.filter((c) => c.status === 'in_progress' || c.status === 'under_review' || c.status === 'submitted');

  let onTimeCount = 0;
  let totalResolutionHours = 0;
  const solvedByCategory: Record<string, number> = {};

  for (const s of solved) {
    solvedByCategory[s.category] = (solvedByCategory[s.category] || 0) + 1;

    const createdMs = new Date(s.createdAt).getTime();
    const resolvedMs = new Date(s.updatedAt).getTime();
    const diffHours = Math.max(1, (resolvedMs - createdMs) / (3600 * 1000));
    totalResolutionHours += diffHours;

    if (diffHours <= 72) {
      onTimeCount++;
    }
  }

  // Count overdue active tickets
  const now = Date.now();
  let overdueCount = 0;
  for (const ip of inProgress) {
    const createdMs = new Date(ip.createdAt).getTime();
    if (now - createdMs > 72 * 3600 * 1000) {
      overdueCount++;
    }
  }

  const successRate = total > 0 ? Math.round((solved.length / total) * 100) : 0;
  const onTimeSlaRate = solved.length > 0 ? Math.round((onTimeCount / solved.length) * 100) : 100;
  const avgResolutionHours = solved.length > 0 ? Math.round((totalResolutionHours / solved.length) * 10) / 10 : 0;

  return {
    wardName,
    wardNumber,
    totalComplaints: total,
    solvedCount: solved.length,
    inProgressCount: inProgress.length,
    overdueCount,
    successRate,
    onTimeSlaRate,
    avgResolutionHours,
    solvedByCategory,
    solvedComplaints: solved,
  };
}

/**
 * Access control validation functions (Rules 3 & 4)
 */
export function canAccessCitizenPerks(role: 'citizen' | 'officer' | 'admin' | string): boolean {
  return role === 'citizen';
}

export function canUploadFinishedPhotos(role: 'citizen' | 'officer' | 'admin' | string): boolean {
  return role === 'officer' || role === 'admin';
}

export function canAccessOfficialConsole(role: 'citizen' | 'officer' | 'admin' | string): boolean {
  return role === 'officer' || role === 'admin';
}

