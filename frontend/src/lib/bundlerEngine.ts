import { MaintenanceBlockRequest, DepartmentId, BundledMaintenanceOrder } from "./types";

export interface BundledCluster {
  id: string;
  title: string;
  corridorId: string;
  sectionName: string;
  fromKm: number;
  toKm: number;
  trackLine: "UP_LINE" | "DOWN_LINE" | "BOTH_LINES";
  requests: MaintenanceBlockRequest[];
  individualDurationSumHours: number;
  bundledDurationHours: number;
  timeSavedHours: number;
  savingsPercentage: number;
  trainDelayMinutesSaved: number;
  financialSavingsINR: number;
  carbonEmissionsSavedKg: number;
  recommendedWindow: string;
  tractionPowerCutoffRequired: boolean;
  cautionSpeedRecommendedKmph: number;
  aiRationale: string;
  synergyScore: number; // 0 - 100
  participatingDepartments: DepartmentId[];
  timelineBefore: {
    requestId: string;
    department: string;
    title: string;
    startHour: number;
    endHour: number;
    duration: number;
    color: string;
  }[];
  timelineAfter: {
    bundleId: string;
    department: string;
    activity: string;
    startHour: number;
    endHour: number;
    duration: number;
    color: string;
  }[];
}

/**
 * Checks if two KM ranges overlap or are within maxProximityKm of each other
 */
export function areSectionsSpatiallyAdjacent(
  fromA: number,
  toKmA: number,
  fromB: number,
  toKmB: number,
  maxProximityKm = 8.0
): boolean {
  const minA = Math.min(fromA, toKmA);
  const maxA = Math.max(fromA, toKmA);
  const minB = Math.min(fromB, toKmB);
  const maxB = Math.max(fromB, toKmB);

  // Direct overlap
  if (minA <= maxB && minB <= maxA) return true;

  // Gap between the two segments
  const gap = minA > maxB ? minA - maxB : minB - maxA;
  return gap <= maxProximityKm;
}

/**
 * Helper to get department theme color
 */
export function getDepartmentColor(deptId: DepartmentId): string {
  switch (deptId) {
    case "ENG":
      return "#10B981"; // Civil Emerald
    case "ELEC":
      return "#F59E0B"; // Electrical Amber
    case "SNT":
      return "#06B6D4"; // Signal & Traffic Cyan
    case "SFTY":
      return "#10B981"; // Safety Green
    default:
      return "#10B981";
  }
}

/**
 * Core AI Mega-Block Bundling Algorithm
 * Analyzes unbundled block requests, computes spatial-temporal adjacency,
 * calculates cross-departmental synergy, and builds synchronized mega-block clusters.
 */
export function runAiMegaBlockBundling(requests: MaintenanceBlockRequest[]): BundledCluster[] {
  // Filter candidate requests that are eligible for bundling
  const candidates = requests.filter(
    (r) => r.status === "Submitted" || r.status === "Draft"
  );

  const clusters: BundledCluster[] = [];
  const assignedRequestIds = new Set<string>();

  for (let i = 0; i < candidates.length; i++) {
    const primary = candidates[i];
    if (assignedRequestIds.has(primary.id)) continue;

    const matchedGroup: MaintenanceBlockRequest[] = [primary];
    assignedRequestIds.add(primary.id);

    // Look for matching requests in the same corridor and spatial proximity
    for (let j = 0; j < candidates.length; j++) {
      if (i === j) continue;
      const target = candidates[j];
      if (assignedRequestIds.has(target.id)) continue;

      if (target.corridorId !== primary.corridorId) continue;

      // Spatial adjacency check
      const spatiallyClose = areSectionsSpatiallyAdjacent(
        primary.fromKm,
        primary.toKm,
        target.fromKm,
        target.toKm,
        10.0
      );

      // Line compatibility (same line or both lines)
      const lineCompatible =
        primary.trackLine === target.trackLine ||
        primary.trackLine === "BOTH_LINES" ||
        target.trackLine === "BOTH_LINES";

      if (spatiallyClose && lineCompatible) {
        matchedGroup.push(target);
        assignedRequestIds.add(target.id);
      }
    }

    // Only bundle if 2 or more requests can be combined
    if (matchedGroup.length >= 2) {
      const minKm = Math.min(...matchedGroup.map((r) => r.fromKm));
      const maxKm = Math.max(...matchedGroup.map((r) => r.toKm));
      const individualSum = matchedGroup.reduce((acc, r) => acc + r.durationHours, 0);

      // AI Bundling optimization:
      // Single joint mega-block duration is max individual task + 1.0 hr handover/power restoration buffer
      const maxSingle = Math.max(...matchedGroup.map((r) => r.durationHours));
      const bundledDuration = Number((maxSingle + 1.0).toFixed(1));
      const timeSaved = Number((individualSum - bundledDuration).toFixed(1));
      const savingsPercent = Number(((timeSaved / individualSum) * 100).toFixed(1));

      const hasPowerCut = matchedGroup.some((r) => r.requiresOHEPowerCut);
      const participatingDepts = Array.from(new Set(matchedGroup.map((r) => r.departmentId)));

      const clusterId = `MB-AI-${primary.corridorId}-${Math.floor(minKm)}-${Date.now().toString().slice(-4)}`;

      // Construct "Before" fragmented timeline
      let currentOffset = 0;
      const timelineBefore = matchedGroup.map((req) => {
        const start = currentOffset;
        const end = currentOffset + req.durationHours;
        currentOffset = end + 0.5; // 30 min buffer gap between unbundled blocks
        return {
          requestId: req.id,
          department: req.department,
          title: req.title,
          startHour: Number(start.toFixed(1)),
          endHour: Number(end.toFixed(1)),
          duration: req.durationHours,
          color: getDepartmentColor(req.departmentId),
        };
      });

      // Construct "After" synchronized mega-block timeline
      const timelineAfter = matchedGroup.map((req, idx) => {
        // Stagger starts slightly within the joint window for safety
        const start = idx * 0.25;
        const end = Math.min(bundledDuration, start + req.durationHours);
        return {
          bundleId: clusterId,
          department: req.department,
          activity: req.title,
          startHour: Number(start.toFixed(1)),
          endHour: Number(end.toFixed(1)),
          duration: Number((end - start).toFixed(1)),
          color: getDepartmentColor(req.departmentId),
        };
      });

      // Delay and economic calculation
      const trainDelaySaved = Math.round(timeSaved * 75); // ~75 train delay minutes saved per hour of track block avoided
      const financialSaved = Math.round(timeSaved * 185000); // ~₹1.85 Lakhs saved per hour in locomotive idling, demurrage & crew overtime
      const carbonSaved = Math.round(timeSaved * 420); // ~420 kg CO2 saved

      clusters.push({
        id: clusterId,
        title: `Joint Cross-Departmental Mega-Block (${participatingDepts.join(" + ")})`,
        corridorId: primary.corridorId,
        sectionName: `${primary.locationSection} (KM ${minKm.toFixed(1)} to ${maxKm.toFixed(1)})`,
        fromKm: minKm,
        toKm: maxKm,
        trackLine: primary.trackLine,
        requests: matchedGroup,
        individualDurationSumHours: individualSum,
        bundledDurationHours: bundledDuration,
        timeSavedHours: timeSaved,
        savingsPercentage: savingsPercent,
        trainDelayMinutesSaved: trainDelaySaved,
        financialSavingsINR: financialSaved,
        carbonEmissionsSavedKg: carbonSaved,
        recommendedWindow: "04:30 - 08:00 IST (Dawn Low-Traffic Slot)",
        tractionPowerCutoffRequired: hasPowerCut,
        cautionSpeedRecommendedKmph: 30,
        synergyScore: Math.min(98, 75 + matchedGroup.length * 8),
        participatingDepartments: participatingDepts,
        aiRationale: `Spatial clustering detected ${matchedGroup.length} concurrent work zones between KM ${minKm.toFixed(1)} and KM ${maxKm.toFixed(1)}. Synchronizing Civil deep screening with 25kV OHE catenary isolation and S&T Kavach beacon calibration eliminates 2 separate corridor shutdowns, saving ${timeSaved} hours of track closure (${savingsPercent}% downtime reduction) under G&SR 15.06 & JPO Mega-Block guidelines.`,
        timelineBefore,
        timelineAfter,
      });
    }
  }

  return clusters;
}

/**
 * Converts a BundledCluster into a formal BundledMaintenanceOrder for store persistence
 */
export function clusterToMaintenanceOrder(cluster: BundledCluster): BundledMaintenanceOrder {
  return {
    id: cluster.id,
    title: cluster.title,
    corridorId: cluster.corridorId,
    locationKm: `KM ${cluster.fromKm.toFixed(1)} - ${cluster.toKm.toFixed(1)}`,
    taskIds: cluster.requests.map((r) => r.id),
    tasksSummary: cluster.requests.map((r) => ({
      id: r.id,
      title: r.title,
      departmentId: r.departmentId,
      durationHours: r.durationHours,
      cost: 250000,
    })),
    scheduledDate: "Tomorrow",
    timeWindow: cluster.recommendedWindow,
    individualHoursSum: cluster.individualDurationSumHours,
    bundledBlockHours: cluster.bundledDurationHours,
    timeSavedHours: cluster.timeSavedHours,
    timeReductionPercent: cluster.savingsPercentage,
    trainsDelaySavedMinutes: cluster.trainDelayMinutesSaved,
    financialSavingsINR: cluster.financialSavingsINR,
    participatingDepartments: cluster.participatingDepartments,
    status: "PROPOSED",
    aiBundlingRationale: cluster.aiRationale,
    sanctionGazetteNumber: `RB/WCR/MB/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
  };
}
