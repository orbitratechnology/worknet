import { ServiceProvider } from '@/types/database';
import {
  collection,
  endAt,
  getDocs,
  orderBy,
  query,
  startAt,
} from '@react-native-firebase/firestore';
import * as geofire from 'geofire-common';
import { db } from './firebase';

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return geofire.distanceBetween([lat1, lon1], [lat2, lon2]);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function getGeohash(latitude: number, longitude: number): string {
  return geofire.geohashForLocation([latitude, longitude]);
}

export function getQueryBounds(
  latitude: number,
  longitude: number,
  radiusInMeters: number,
): [string, string][] {
  return geofire.geohashQueryBounds([latitude, longitude], radiusInMeters);
}

export async function getNearbyProviders(
  latitude: number,
  longitude: number,
  radiusInKm: number = 50,
): Promise<(ServiceProvider & { distance: number })[]> {
  const radiusInMeters = radiusInKm * 1000;
  const bounds = getQueryBounds(latitude, longitude, radiusInMeters);
  const promises = [];

  for (const b of bounds) {
    const q = query(
      collection(db, 'service_providers'),
      orderBy('location.geohash'),
      startAt(b[0]),
      endAt(b[1]),
    );
    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);
  const matchingDocs: ServiceProvider[] = [];

  for (const snap of snapshots) {
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as ServiceProvider;
      if (!data.location?.latitude || !data.location?.longitude) continue;

      const distanceInKm = calculateDistance(
        latitude,
        longitude,
        data.location.latitude,
        data.location.longitude,
      );
      const distanceInM = distanceInKm * 1000;

      if (distanceInM <= radiusInMeters) {
        matchingDocs.push({ ...data, id: docSnap.id });
      }
    }
  }

  return matchingDocs
    .map((doc) => ({
      ...doc,
      distance: calculateDistance(
        latitude,
        longitude,
        doc.location.latitude,
        doc.location.longitude,
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
}
