import { ServiceProvider } from '@/types/database';
import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
} from 'firebase/firestore';
import * as geofire from 'geofire-common';
import { db } from './firebase';

/**
 * Calculates the distance between two points in kilometers using the Haversine formula.
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return geofire.distanceBetween([lat1, lon1], [lat2, lon2]);
}

/**
 * Formats a distance into a human-readable string.
 * @param km Distance in kilometers
 * @returns Formatted string (e.g., "1.2 km", "850 m")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Generates a geohash for a given location.
 * @param latitude
 * @param longitude
 * @returns 10-character geohash string
 */
export function getGeohash(latitude: number, longitude: number): string {
  return geofire.geohashForLocation([latitude, longitude]);
}

/**
 * Calculates the bounding boxes for a query around a location and radius.
 * @param latitude
 * @param longitude
 * @param radiusInMeters
 * @returns Array of [start, end] geohash pairs
 */
export function getQueryBounds(
  latitude: number,
  longitude: number,
  radiusInMeters: number
): [string, string][] {
  return geofire.geohashQueryBounds([latitude, longitude], radiusInMeters);
}

/**
 * Fetches service providers within a given radius of a location.
 * @param latitude
 * @param longitude
 * @param radiusInKm
 * @returns List of providers with calculated distance
 */
export async function getNearbyProviders(
  latitude: number,
  longitude: number,
  radiusInKm: number = 20
): Promise<(ServiceProvider & { distance: number })[]> {
  const radiusInMeters = radiusInKm * 1000;
  const bounds = getQueryBounds(latitude, longitude, radiusInMeters);
  const promises = [];

  for (const b of bounds) {
    const q = query(
      collection(db, 'service_providers'),
      orderBy('location.geohash'),
      startAt(b[0]),
      endAt(b[1])
    );
    promises.push(getDocs(q));
  }

  // Collect all the matching docs
  const snapshots = await Promise.all(promises);
  const matchingDocs: ServiceProvider[] = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data() as ServiceProvider;
      // We have to filter out false positives due to geohash precision
      const distanceInKm = calculateDistance(
        latitude,
        longitude,
        data.location.latitude,
        data.location.longitude
      );
      const distanceInM = distanceInKm * 1000;

      if (distanceInM <= radiusInMeters) {
        matchingDocs.push({ ...data, id: doc.id });
      }
    }
  }

  // Sort by distance and return
  return matchingDocs
    .map((doc) => ({
      ...doc,
      distance: calculateDistance(
        latitude,
        longitude,
        doc.location.latitude,
        doc.location.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
}
