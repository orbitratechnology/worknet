import {
  SRI_LANKA_AREAS,
  type SriLankaArea,
} from '@/constants/sri-lanka-areas';
import { calculateDistance } from '@/lib/geo';

export function filterAreas(query: string): SriLankaArea[] {
  const q = query.toLowerCase().trim();
  if (!q) return SRI_LANKA_AREAS;
  return SRI_LANKA_AREAS.filter(
    (area) =>
      area.name.toLowerCase().includes(q) ||
      area.district.toLowerCase().includes(q),
  );
}

export function findNearestArea(
  latitude: number,
  longitude: number,
): SriLankaArea {
  let nearest = SRI_LANKA_AREAS[0];
  let minDist = Infinity;

  for (const area of SRI_LANKA_AREAS) {
    const dist = calculateDistance(
      latitude,
      longitude,
      area.latitude,
      area.longitude,
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = area;
    }
  }

  return nearest;
}

/** Suggest a larger hub when local search is empty — skip if already at that area. */
export function suggestFallbackArea(
  latitude: number,
  longitude: number,
  currentLabel: string,
): SriLankaArea | null {
  const hubs = ['colombo', 'kandy', 'galle', 'negombo', 'kurunegala'];
  const normalized = currentLabel.toLowerCase();

  for (const hubId of hubs) {
    const hub = SRI_LANKA_AREAS.find((a) => a.id === hubId);
    if (!hub) continue;
    if (normalized.includes(hub.name.toLowerCase())) continue;
    return hub;
  }

  const nearest = findNearestArea(latitude, longitude);
  if (nearest.name.toLowerCase() === normalized) {
    const colombo = SRI_LANKA_AREAS.find((a) => a.id === 'colombo');
    return colombo ?? null;
  }
  return nearest;
}
