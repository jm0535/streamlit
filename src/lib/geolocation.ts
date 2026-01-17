'use client';

/**
 * Geolocation Service
 *
 * Captures location data for field recordings:
 * - GPS coordinates
 * - Accuracy and altitude
 * - Reverse geocoding (optional)
 * - Timezone detection
 *
 * Critical for ethnomusicology and sound ecology research
 * where location context is essential for analysis
 */

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: Date;
  placeName?: string;
  timezone?: string;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';
  message: string;
}

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Get current position with promise wrapper
 */
export async function getCurrentPosition(
  options: PositionOptions = {}
): Promise<GeolocationResult> {
  if (!isGeolocationAvailable()) {
    throw {
      code: 'UNSUPPORTED',
      message: 'Geolocation is not supported by this browser',
    } as GeolocationError;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000, // 30 seconds
    maximumAge: 60000, // 1 minute cache
    ...options,
  };

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result: GeolocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date(position.timestamp),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // Try to get place name (optional)
        try {
          result.placeName = await getPlaceName(result.latitude, result.longitude);
        } catch {
          // Place name is optional, continue without it
        }

        resolve(result);
      },
      (error) => {
        let code: GeolocationError['code'] = 'POSITION_UNAVAILABLE';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            break;
        }
        reject({
          code,
          message: error.message,
        } as GeolocationError);
      },
      defaultOptions
    );
  });
}

/**
 * Reverse geocode coordinates to place name
 * Uses Nominatim (OpenStreetMap) - free and no API key required
 */
export async function getPlaceName(
  latitude: number,
  longitude: number
): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'StreamlitAudioResearch/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();

  // Build a sensible place name from components
  const parts: string[] = [];
  const address = data.address || {};

  if (address.village) parts.push(address.village);
  else if (address.town) parts.push(address.town);
  else if (address.city) parts.push(address.city);
  else if (address.locality) parts.push(address.locality);

  if (address.state) parts.push(address.state);
  if (address.country) parts.push(address.country);

  return parts.join(', ') || data.display_name || 'Unknown location';
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number,
  longitude: number,
  format: 'decimal' | 'dms' = 'decimal'
): string {
  if (format === 'decimal') {
    return `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
  }

  // DMS format
  const latDMS = toDMS(latitude);
  const lonDMS = toDMS(longitude);
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';

  return `${latDMS}${latDir}, ${lonDMS}${lonDir}`;
}

/**
 * Convert decimal degrees to DMS string
 */
function toDMS(decimal: number): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(1);

  return `${deg}°${min}'${sec}"`;
}

/**
 * Calculate distance between two points (Haversine)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Generate a Google Maps URL for coordinates
 */
export function getMapUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Generate an OpenStreetMap URL for coordinates
 */
export function getOSMUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
}

/**
 * Watch position for continuous updates
 */
export function watchPosition(
  callback: (result: GeolocationResult) => void,
  errorCallback?: (error: GeolocationError) => void,
  options: PositionOptions = {}
): number | null {
  if (!isGeolocationAvailable()) {
    errorCallback?.({
      code: 'UNSUPPORTED',
      message: 'Geolocation is not supported by this browser',
    });
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0,
    ...options,
  };

  return navigator.geolocation.watchPosition(
    async (position) => {
      const result: GeolocationResult = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date(position.timestamp),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      callback(result);
    },
    (error) => {
      let code: GeolocationError['code'] = 'POSITION_UNAVAILABLE';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          code = 'PERMISSION_DENIED';
          break;
        case error.TIMEOUT:
          code = 'TIMEOUT';
          break;
      }
      errorCallback?.({
        code,
        message: error.message,
      });
    },
    defaultOptions
  );
}

/**
 * Stop watching position
 */
export function clearWatch(watchId: number): void {
  if (isGeolocationAvailable() && watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
}

export default {
  isGeolocationAvailable,
  getCurrentPosition,
  getPlaceName,
  formatCoordinates,
  calculateDistance,
  getMapUrl,
  getOSMUrl,
  watchPosition,
  clearWatch,
};
