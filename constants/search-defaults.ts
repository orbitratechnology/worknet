export const DEFAULT_RADIUS_KM = 25;

export const RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const;

export type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];

export const SEARCH_LOCATION_STORAGE_KEY = '@worknet/search-location';

export function getNextRadiusKm(current: number): number | null {
  const idx = RADIUS_OPTIONS_KM.indexOf(current as RadiusKm);
  if (idx === -1) {
    const next = RADIUS_OPTIONS_KM.find((r) => r > current);
    return next ?? null;
  }
  if (idx >= RADIUS_OPTIONS_KM.length - 1) return null;
  return RADIUS_OPTIONS_KM[idx + 1];
}
