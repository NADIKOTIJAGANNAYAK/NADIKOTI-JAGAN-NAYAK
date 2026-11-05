import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSlaStatus,
  calculateHonorPoints,
  clusterComplaints,
  sanitizeInput,
  isWithinVisakhapatnamBounds,
  getWardNumberFromName,
  computeWardStats,
  canAccessCitizenPerks,
  canUploadFinishedPhotos,
  canAccessOfficialConsole,
} from './civicLogic.ts';


test('calculateSlaStatus correctly calculates remaining time when on track', () => {
  const baseTime = 1700000000000;
  // 10 hours after creation
  const now = baseTime + 10 * 3600 * 1000;
  const status = calculateSlaStatus(baseTime, 72, now);

  assert.equal(status.isOverdue, false);
  assert.equal(status.hoursRemaining, 62);
  assert.equal(status.urgency, 'normal');
  assert.equal(status.progressPercent, 14);
});

test('calculateSlaStatus identifies critical and overdue state', () => {
  const baseTime = 1700000000000;
  // 68 hours after creation -> 4 hours left
  const nearDeadline = baseTime + 68 * 3600 * 1000;
  const criticalStatus = calculateSlaStatus(baseTime, 72, nearDeadline);
  assert.equal(criticalStatus.isOverdue, false);
  assert.equal(criticalStatus.urgency, 'critical');

  // 75 hours after creation -> 3 hours overdue
  const overdueTime = baseTime + 75 * 3600 * 1000;
  const overdueStatus = calculateSlaStatus(baseTime, 72, overdueTime);
  assert.equal(overdueStatus.isOverdue, true);
  assert.equal(overdueStatus.urgency, 'escalated');
  assert.match(overdueStatus.formattedTime, /Overdue by 3h/);
});

test('calculateHonorPoints enforces +50 reward vs -100 penalty', () => {
  assert.equal(calculateHonorPoints(true, 48, 72), 50);
  assert.equal(calculateHonorPoints(true, 74, 72), -100);
  assert.equal(calculateHonorPoints(false, 10, 72), 0);
});

test('clusterComplaints merges nearby civic complaints of same category', () => {
  const sampleComplaints = [
    { id: '1', lat: 17.6868, lng: 83.2185, category: 'drainage_problems', title: 'Clogged Drain A' },
    { id: '2', lat: 17.6870, lng: 83.2187, category: 'drainage_problems', title: 'Clogged Drain B' },
    { id: '3', lat: 17.6869, lng: 83.2186, category: 'drainage_problems', title: 'Clogged Drain C' },
    { id: '4', lat: 17.7200, lng: 83.3000, category: 'drainage_problems', title: 'Distant Drain' },
    { id: '5', lat: 17.6868, lng: 83.2185, category: 'road_damage', title: 'Pothole at same spot' },
  ];

  const clusters = clusterComplaints(sampleComplaints, 100);
  // The first 3 should cluster together (same category & within 100m)
  const drainageCluster = clusters.find((c) => c.category === 'drainage_problems' && c.count === 3);
  assert.ok(drainageCluster, 'Should form a 3-complaint drainage cluster');
  assert.equal(drainageCluster?.severity, 'high');
});

test('sanitizeInput strips tags and limits string length', () => {
  const dirty = '  <script>alert("hack")</script>Dangerous Pothole!  ';
  const clean = sanitizeInput(dirty);
  assert.equal(clean, 'scriptalert("hack")/scriptDangerous Pothole!');
});

test('isWithinVisakhapatnamBounds validates GVMC coastal jurisdiction', () => {
  assert.equal(isWithinVisakhapatnamBounds(17.6868, 83.2185), true); // Siripuram
  assert.equal(isWithinVisakhapatnamBounds(17.7290, 83.3150), true); // Madhurawada
  assert.equal(isWithinVisakhapatnamBounds(12.9716, 77.5946), false); // Bengaluru
  assert.equal(isWithinVisakhapatnamBounds(28.6139, 77.2090), false); // New Delhi
});

test('getWardNumberFromName extracts correct ward number integer', () => {
  assert.equal(getWardNumberFromName('Ward 12 - Siripuram & AU Campus'), 12);
  assert.equal(getWardNumberFromName('Ward 4 - Rushikonda'), 4);
  assert.equal(getWardNumberFromName('Ward 28'), 28);
  assert.equal(getWardNumberFromName('Unassigned'), 0);
});

test('computeWardStats correctly computes success rate and solved problems breakdown', () => {
  const now = Date.now();
  const mockComplaints = [
    {
      id: 'c1',
      ward: 'Ward 12 - Siripuram & AU Campus',
      status: 'resolved',
      category: 'road_damage',
      priority: 'high',
      title: 'Pothole Fixed',
      address: 'Siripuram Circle',
      createdAt: new Date(now - 30 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 6 * 3600 * 1000).toISOString(), // took 24 hrs
    },
    {
      id: 'c2',
      ward: 'Ward 12 - Siripuram & AU Campus',
      status: 'verified_closed',
      category: 'drainage_problems',
      priority: 'critical',
      title: 'Drain Desilted',
      address: 'AU Gate',
      createdAt: new Date(now - 48 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 12 * 3600 * 1000).toISOString(), // took 36 hrs
    },
    {
      id: 'c3',
      ward: 'Ward 12 - Siripuram & AU Campus',
      status: 'in_progress',
      category: 'water_leakage',
      priority: 'medium',
      title: 'Pipe Leak Under Work',
      address: 'Waltair Uplands',
      createdAt: new Date(now - 10 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'c4',
      ward: 'Ward 28 - Jagadamba',
      status: 'resolved',
      category: 'garbage_accumulation',
      priority: 'low',
      title: 'Poorna Market Cleaned',
      address: 'Poorna Market',
      createdAt: new Date(now - 20 * 3600 * 1000).toISOString(),
      updatedAt: new Date(now - 5 * 3600 * 1000).toISOString(),
    },
  ];

  const stats = computeWardStats(mockComplaints, 'Ward 12 - Siripuram & AU Campus');
  assert.equal(stats.wardNumber, 12);
  assert.equal(stats.totalComplaints, 3);
  assert.equal(stats.solvedCount, 2);
  assert.equal(stats.inProgressCount, 1);
  assert.equal(stats.successRate, 67); // 2 out of 3 = 67%
  assert.equal(stats.onTimeSlaRate, 100); // both solved under 72h
  assert.equal(stats.solvedByCategory['road_damage'], 1);
  assert.equal(stats.solvedByCategory['drainage_problems'], 1);
  assert.equal(stats.solvedComplaints.length, 2);
});

test('canAccessCitizenPerks allows only citizens and blocks government officials', () => {
  assert.equal(canAccessCitizenPerks('citizen'), true);
  assert.equal(canAccessCitizenPerks('officer'), false);
  assert.equal(canAccessCitizenPerks('admin'), false);
});

test('canUploadFinishedPhotos and canAccessOfficialConsole allow only officials and block citizens', () => {
  assert.equal(canUploadFinishedPhotos('citizen'), false);
  assert.equal(canUploadFinishedPhotos('officer'), true);
  assert.equal(canUploadFinishedPhotos('admin'), true);

  assert.equal(canAccessOfficialConsole('citizen'), false);
  assert.equal(canAccessOfficialConsole('officer'), true);
  assert.equal(canAccessOfficialConsole('admin'), true);
});


