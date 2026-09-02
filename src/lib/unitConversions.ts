// Conversion factors are all relative to a base unit per group (SI where
// applicable). Temperature is the one non-linear group, handled separately.
export type UnitGroup = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data'

export const UNIT_GROUPS: { id: UnitGroup; label: string; units: Record<string, string> }[] = [
  {
    id: 'length',
    label: 'Length',
    units: { m: 'Meters', km: 'Kilometers', cm: 'Centimeters', mm: 'Millimeters', mi: 'Miles', yd: 'Yards', ft: 'Feet', in: 'Inches', nmi: 'Nautical miles' },
  },
  {
    id: 'weight',
    label: 'Weight',
    units: { kg: 'Kilograms', g: 'Grams', mg: 'Milligrams', lb: 'Pounds', oz: 'Ounces', t: 'Metric tons', st: 'Stone' },
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' },
  },
  {
    id: 'area',
    label: 'Area',
    units: { sqm: 'Square meters', sqkm: 'Square kilometers', sqft: 'Square feet', sqmi: 'Square miles', acre: 'Acres', hectare: 'Hectares' },
  },
  {
    id: 'volume',
    label: 'Volume',
    units: { l: 'Liters', ml: 'Milliliters', gal: 'Gallons (US)', qt: 'Quarts (US)', cup: 'Cups (US)', flOz: 'Fluid ounces (US)', m3: 'Cubic meters' },
  },
  {
    id: 'speed',
    label: 'Speed',
    units: { mps: 'Meters/second', kmh: 'Km/hour', mph: 'Miles/hour', knot: 'Knots' },
  },
  {
    id: 'time',
    label: 'Time',
    units: { s: 'Seconds', min: 'Minutes', hr: 'Hours', day: 'Days', week: 'Weeks', month: 'Months (30d)', year: 'Years (365d)' },
  },
  {
    id: 'data',
    label: 'Data Size',
    units: { b: 'Bytes', kb: 'Kilobytes', mb: 'Megabytes', gb: 'Gigabytes', tb: 'Terabytes' },
  },
]

// Factor to convert 1 of that unit into the group's base unit.
const FACTORS: Record<UnitGroup, Record<string, number>> = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254, nmi: 1852 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125, t: 1000, st: 6.35029318 },
  area: { sqm: 1, sqkm: 1e6, sqft: 0.09290304, sqmi: 2589988.110336, acre: 4046.8564224, hectare: 10000 },
  volume: { l: 1, ml: 0.001, gal: 3.785411784, qt: 0.946352946, cup: 0.2365882365, flOz: 0.0295735295625, m3: 1000 },
  speed: { mps: 1, kmh: 1 / 3.6, mph: 0.44704, knot: 0.5144444444 },
  time: { s: 1, min: 60, hr: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 },
  data: { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 },
  temperature: {}, // handled separately below
}

function toCelsius(value: number, unit: string): number {
  if (unit === 'c') return value
  if (unit === 'f') return ((value - 32) * 5) / 9
  return value - 273.15 // k
}

function fromCelsius(value: number, unit: string): number {
  if (unit === 'c') return value
  if (unit === 'f') return (value * 9) / 5 + 32
  return value + 273.15 // k
}

export function convertUnit(group: UnitGroup, value: number, from: string, to: string): number {
  if (group === 'temperature') return fromCelsius(toCelsius(value, from), to)
  const factors = FACTORS[group]
  const base = value * factors[from]
  return base / factors[to]
}
