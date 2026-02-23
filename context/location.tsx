import { logger } from '@/lib/logger';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocationState {
  coords: Location.LocationObjectCoords | null;
  city: string | null;
  district: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
}

interface LocationContextType extends LocationState {
  refreshLocation: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocationState>({
    coords: null,
    city: null,
    district: null,
    country: null,
    loading: true,
    error: null,
  });

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((prev) => ({
          ...prev,
          error: 'Permission to access location was denied',
          loading: false,
        }));
        return false;
      }
      return true;
    } catch (err) {
      logger.error('Error requesting location permissions', err);
      return false;
    }
  };

  const fetchLocation = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city/district
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setState({
        coords: location.coords,
        city: address?.city || address?.subregion || 'Unknown Location',
        district: address?.district || address?.subregion || null,
        country: address?.country || null,
        loading: false,
        error: null,
      });
    } catch (err) {
      logger.error('Error fetching location', err);
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch location',
        loading: false,
      }));
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        ...state,
        refreshLocation: fetchLocation,
        requestPermissions,
      }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
