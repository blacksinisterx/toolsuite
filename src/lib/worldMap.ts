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
  // Japan
  [[45, 142], [43, 146], [35, 140], [31, 131], [33, 130], [38, 141]],
  // British Isles (UK + Ireland, combined for scale)
  [[59, -3], [54, -3], [51, -9], [50, -5], [52, 1], [58, -3]],
  // Madagascar
  [[-12, 49], [-25, 47], [-25, 44], [-15, 43]],
  // New Zealand
  [[-34, 173], [-41, 175], [-46, 168], [-44, 166], [-40, 174]],
  // Indonesia (Sumatra/Java hint)
  [[-6, 95], [-8, 115], [-3, 119], [3, 98]],
  // Philippines
  [[19, 121], [14, 121], [9, 123], [13, 125]],
  // Iceland
  [[66, -24], [65, -14], [63, -20]],
]

/** 30-degree lat/long graticule, for the "this is a map" cue -- the
 * continents alone read as an abstract blob without reference lines. */
export const GRATICULE_LATS = [-60, -30, 0, 30, 60]
export const GRATICULE_LONS = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]

export interface CityCoord { timeZone: string; lat: number; lon: number }

export { ZONE_COORDS } from './zoneCoords'
import { ZONE_COORDS } from './zoneCoords'

/** Falls back to parsing the zone name itself (e.g. "Some_Region/A_City"
 * -> "A City") only to report "unknown" honestly -- callers use the null
 * to skip the pin rather than plotting a wrong guess at (0,0). Every zone
 * this app actually offers has a real entry in ZONE_COORDS, so this path
 * is normally unreachable; it's a safety net, not a first resort. */
export function coordFor(timeZone: string): [number, number] | null {
  return ZONE_COORDS[timeZone] ?? null
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
