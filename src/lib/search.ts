import type { ToolMeta } from '../types/tool'
import { TOOLS } from './registry'

/** Ranked substring search over name/keywords/description. Good enough for
 * ~35 tools; swap for a real fuzzy/NL matcher only if the catalog grows
 * enough to need it (Phase 3's "natural-language tool search"). */
export function searchTools(query: string, limit = 8): ToolMeta[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)

  const scored = TOOLS.map((tool) => {
    const name = tool.name.toLowerCase()
    const desc = tool.description.toLowerCase()
    const keywords = tool.keywords.join(' ').toLowerCase()
    let score = 0
    if (name === q) score += 100
    if (name.startsWith(q)) score += 40
    for (const term of terms) {
      if (name.includes(term)) score += 20
      if (keywords.includes(term)) score += 12
      if (desc.includes(term)) score += 4
    }
    return { tool, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.tool)
}
