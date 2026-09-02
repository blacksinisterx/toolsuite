// Low-poly continent outlines (rough lat/long vertex lists) -- deliberately
// not a real tile-server map (would mean a network dependency + breaks the
// "nothing leaves your browser" story for a purely decorative element).
// Good enough to be recognizable at the size this renders, not meant to be
// survey-accurate.
export const CONTINENTS: [number, number][][] = [
  // North America
  [[70, -165], [70, -95], [60, -65], [45, -52], [25, -80], [18, -95], [15, -92], [8, -77], [18, -95], [30, -115], [48, -125], [60, -140]],
  // South America
  [[12, -72], [5, -52], [-5, -35], [-23, -43], [-34, -58], [-55, -68], [-33, -72], [-18, -70], [-4, -81], [5, -77]],
  // Europe
  [[71, 25], [60, 30], [55, 38], [45, 40], [37, 23], [36, -6], [43, -9], [51, -10], [60, 5]],
  // Africa
  [[37, 10], [32, 32], [12, 43], [-1, 42], [-26, 33], [-34, 20], [-17, 12], [4, 9], [15, -17], [35, -6]],
  // Asia
  [[77, 105], [66, 170], [52, 140], [35, 140], [22, 120], [10, 105], [1, 104], [7, 80], [24, 68], [30, 48], [41, 29], [55, 37], [70, 60]],
  // Australia
  [[-11, 131], [-17, 146], [-38, 147], [-35, 117], [-20, 114]],
  // Greenland
  [[83, -35], [77, -20], [60, -45], [70, -55]],
]

export interface CityCoord { timeZone: string; lat: number; lon: number }

// Approximate coordinates for the popular-zone list (city the zone is
// named for, or its capital when the zone covers a whole country-ish area).
export const ZONE_COORDS: Record<string, [number, number]> = {
  'Asia/Karachi': [24.86, 67.01],
  'Asia/Kolkata': [28.61, 77.21],
  'Asia/Dubai': [25.2, 55.27],
  'Asia/Dhaka': [23.81, 90.41],
  'Asia/Shanghai': [31.23, 121.47],
  'Asia/Tokyo': [35.68, 139.69],
  'Asia/Jakarta': [-6.21, 106.85],
  'Europe/London': [51.51, -0.13],
  'Europe/Paris': [48.85, 2.35],
  'Europe/Berlin': [52.52, 13.4],
  'Europe/Moscow': [55.76, 37.62],
  'Africa/Cairo': [30.04, 31.24],
  'America/New_York': [40.71, -74.01],
  'America/Chicago': [41.88, -87.63],
  'America/Denver': [39.74, -104.99],
  'America/Los_Angeles': [34.05, -118.24],
  'America/Sao_Paulo': [-23.55, -46.63],
  'Australia/Sydney': [-33.87, 151.21],
  'Australia/Perth': [-31.95, 115.86],
  'Pacific/Auckland': [-36.85, 174.76],
  UTC: [51.48, 0],
}

export function coordFor(timeZone: string): [number, number] {
  return ZONE_COORDS[timeZone] ?? [0, 0]
}

export function project(lat: number, lon: number, w: number, h: number): [number, number] {
  return [((lon + 180) / 360) * w, ((90 - lat) / 180) * h]
}

/** Rough current subsolar longitude, from UTC time -- used to shade the
 * night side of the map. Not meant to be precise (ignores equation of
 * time / axial tilt), just enough to visibly show "roughly where it's
 * dark right now." */
export function subsolarLongitude(date: Date): number {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60
  return -(utcHours - 12) * 15
}
