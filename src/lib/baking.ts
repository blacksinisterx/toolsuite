// Grams per US cup, per ingredient -- these genuinely differ by density
// (a cup of flour and a cup of honey are very different weights), which is
// exactly why a generic volume<->weight converter would give wrong answers
// for baking. Figures are standard baking-reference values.
export const INGREDIENTS: { id: string; label: string; gramsPerCup: number }[] = [
  { id: 'flour', label: 'All-purpose flour', gramsPerCup: 120 },
  { id: 'bread-flour', label: 'Bread flour', gramsPerCup: 127 },
  { id: 'cake-flour', label: 'Cake flour', gramsPerCup: 114 },
  { id: 'sugar', label: 'Granulated sugar', gramsPerCup: 200 },
  { id: 'brown-sugar', label: 'Brown sugar (packed)', gramsPerCup: 220 },
  { id: 'powdered-sugar', label: 'Powdered / icing sugar', gramsPerCup: 120 },
  { id: 'butter', label: 'Butter', gramsPerCup: 227 },
  { id: 'honey', label: 'Honey', gramsPerCup: 340 },
  { id: 'milk', label: 'Milk', gramsPerCup: 240 },
  { id: 'water', label: 'Water', gramsPerCup: 240 },
  { id: 'oil', label: 'Vegetable oil', gramsPerCup: 218 },
  { id: 'cocoa', label: 'Cocoa powder', gramsPerCup: 90 },
  { id: 'rice', label: 'Rice, uncooked', gramsPerCup: 185 },
  { id: 'oats', label: 'Rolled oats', gramsPerCup: 90 },
  { id: 'yogurt', label: 'Yogurt', gramsPerCup: 245 },
]

// Volume units, in milliliters -- fixed regardless of ingredient.
export const ML_PER_UNIT: Record<string, number> = {
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  ml: 1,
  floz: 29.5735,
}
export const VOLUME_UNITS = [
  { id: 'cup', label: 'Cups' },
  { id: 'tbsp', label: 'Tablespoons' },
  { id: 'tsp', label: 'Teaspoons' },
  { id: 'ml', label: 'Milliliters' },
  { id: 'floz', label: 'Fluid ounces' },
]

export function volumeToGrams(amount: number, unit: string, gramsPerCup: number): number {
  const ml = amount * ML_PER_UNIT[unit]
  const cups = ml / ML_PER_UNIT.cup
  return cups * gramsPerCup
}

export function gramsToVolume(grams: number, unit: string, gramsPerCup: number): number {
  const cups = grams / gramsPerCup
  const ml = cups * ML_PER_UNIT.cup
  return ml / ML_PER_UNIT[unit]
}

export function gramsToOz(g: number): number {
  return g / 28.3495
}
export function ozToGrams(oz: number): number {
  return oz * 28.3495
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32
}
export function fToC(f: number): number {
  return ((f - 32) * 5) / 9
}

// Common gas-mark equivalents used on UK/AU/NZ oven dials.
const GAS_MARKS: { mark: number | string; c: number }[] = [
  { mark: '¼', c: 110 }, { mark: '½', c: 120 }, { mark: 1, c: 140 }, { mark: 2, c: 150 },
  { mark: 3, c: 160 }, { mark: 4, c: 180 }, { mark: 5, c: 190 }, { mark: 6, c: 200 },
  { mark: 7, c: 220 }, { mark: 8, c: 230 }, { mark: 9, c: 240 },
]
export function closestGasMark(c: number): number | string {
  let best = GAS_MARKS[0]
  let bestDiff = Math.abs(c - best.c)
  for (const g of GAS_MARKS) {
    const diff = Math.abs(c - g.c)
    if (diff < bestDiff) { best = g; bestDiff = diff }
  }
  return best.mark
}
