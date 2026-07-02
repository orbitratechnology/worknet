import {
  DEFAULT_RADIUS_KM,
  SEARCH_LOCATION_STORAGE_KEY,
} from '@/constants/search-defaults';
import { useLocation } from '@/context/location';
import { logger } from '@/lib/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SearchLocationSource = 'gps' | 'area' | 'map';

export interface SearchOrigin {
  latitude: number;
  longitude: number;
  label: string;
  source: SearchLocationSource;
}

interface PersistedSearchLocation {
  searchOrigin: SearchOrigin;
  radiusKm: number;
}

interface SearchLocationContextType {
  searchOrigin: SearchOrigin | null;
  radiusKm: number;
  loaded: boolean;
  coords: { latitude: number; longitude: number } | null;
  setSearchOrigin: (origin: SearchOrigin) => void;
  setRadiusKm: (km: number) => void;
  resetToCurrentLocation: () => Promise<void>;
}

const SearchLocationContext = createContext<
  SearchLocationContextType | undefined
>(undefined);

async function loadPersisted(): Promise<PersistedSearchLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(SEARCH_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSearchLocation;
  } catch (err) {
    logger.error('Failed to load search location', err);
    return null;
  }
}

async function persistState(state: PersistedSearchLocation) {
  try {
    await AsyncStorage.setItem(
      SEARCH_LOCATION_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch (err) {
    logger.error('Failed to persist search location', err);
  }
}

export function SearchLocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    coords: gpsCoords,
    city,
    district,
    loading: gpsLoading,
    refreshLocation,
  } = useLocation();

  const [searchOrigin, setSearchOriginState] = useState<SearchOrigin | null>(
    null,
  );
  const [radiusKm, setRadiusKmState] = useState(DEFAULT_RADIUS_KM);
  const [loaded, setLoaded] = useState(false);
  const hydratedRef = useRef(false);
  const userOverrideRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadPersisted().then((saved) => {
      if (cancelled) return;
      if (saved?.searchOrigin) {
        setSearchOriginState(saved.searchOrigin);
        userOverrideRef.current = saved.searchOrigin.source !== 'gps';
      }
      if (saved?.radiusKm) {
        setRadiusKmState(saved.radiusKm);
      }
      hydratedRef.current = true;
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(
    (origin: SearchOrigin | null, radius: number) => {
      if (!origin) return;
      persistState({ searchOrigin: origin, radiusKm: radius });
    },
    [],
  );

  const setSearchOrigin = useCallback(
    (origin: SearchOrigin) => {
      userOverrideRef.current = origin.source !== 'gps';
      setSearchOriginState(origin);
      persist(origin, radiusKm);
    },
    [persist, radiusKm],
  );

  const setRadiusKm = useCallback(
    (km: number) => {
      setRadiusKmState(km);
      if (searchOrigin) {
        persist(searchOrigin, km);
      }
    },
    [persist, searchOrigin],
  );

  useEffect(() => {
    if (!hydratedRef.current || !gpsCoords || gpsLoading) return;
    if (userOverrideRef.current && searchOrigin?.source !== 'gps') return;

    const label =
      city || district || searchOrigin?.label || 'Current location';

    const fromGps: SearchOrigin = {
      latitude: gpsCoords.latitude,
      longitude: gpsCoords.longitude,
      label,
      source: 'gps',
    };

    setSearchOriginState(fromGps);
    persist(fromGps, radiusKm);
  }, [
    gpsCoords,
    gpsLoading,
    city,
    district,
    searchOrigin?.label,
    searchOrigin?.source,
    radiusKm,
    persist,
  ]);

  const resetToCurrentLocation = useCallback(async () => {
    userOverrideRef.current = false;
    await refreshLocation();
  }, [refreshLocation]);

  const coords = useMemo(() => {
    if (!searchOrigin) return null;
    return {
      latitude: searchOrigin.latitude,
      longitude: searchOrigin.longitude,
    };
  }, [searchOrigin]);

  const value = useMemo(
    () => ({
      searchOrigin,
      radiusKm,
      loaded,
      coords,
      setSearchOrigin,
      setRadiusKm,
      resetToCurrentLocation,
    }),
    [
      searchOrigin,
      radiusKm,
      loaded,
      coords,
      setSearchOrigin,
      setRadiusKm,
      resetToCurrentLocation,
    ],
  );

  return (
    <SearchLocationContext.Provider value={value}>
      {children}
    </SearchLocationContext.Provider>
  );
}

export function useSearchLocation() {
  const context = useContext(SearchLocationContext);
  if (context === undefined) {
    throw new Error(
      'useSearchLocation must be used within a SearchLocationProvider',
    );
  }
  return context;
}
