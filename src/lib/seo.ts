import { CATEGORIES, TOOLS, toolsByCategory } from './registry'
import type { ToolMeta } from '../types/tool'

// One source of truth for every page's title, description and URL. The build
// (scripts/build-seo.mjs) bakes these into static HTML for crawlers, and the
// app calls seoFor() on navigation so the tab title stays right.

export const SITE = 'https://multitoolsuite.vercel.app'
export const SITE_NAME = 'ToolSuite'
export const OG_IMAGE = `${SITE}/og-image.png`

export interface PageSeo {
  path: string
  kind: 'home' | 'category' | 'tool' | 'info'
  title: string
  description: string
  h1: string
  noindex?: boolean
  tool?: ToolMeta
}

const PRIVACY_LOCAL = 'Runs in your browser, so nothing you add is uploaded.'
const PRIVACY_SERVER = 'Your input is processed on a server and deleted right after.'

// Keep descriptions inside what search results usually show (about 160 characters).
function fit(text: string, max = 160): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:\-\s]+$/, '') + '…'
}

function toolSeo(t: ToolMeta): PageSeo {
  const privacy = t.processing === 'client' ? PRIVACY_LOCAL : PRIVACY_SERVER
  const base = t.description.replace(/\s*--\s*/g, ', ').replace(/\.$/, '')
  return {
    path: t.path,
    kind: 'tool',
    title: `${t.name} Online, Free and Private | ${SITE_NAME}`,
    description: fit(`${base}. Free, no sign-up. ${privacy}`),
    h1: t.name,
    tool: t,
  }
}

export function allPages(): PageSeo[] {
  const pages: PageSeo[] = [
    {
      path: '/',
      kind: 'home',
      title: `${SITE_NAME}: ${TOOLS.length} Free Online Tools That Run in Your Browser`,
      description: fit(`${TOOLS.length} free tools for PDFs, images, video, audio, code and more. Every one runs in your browser, so nothing you add is uploaded. No account needed.`),
      h1: 'Convert anything. Upload nothing.',
    },
  ]
  for (const c of CATEGORIES) {
    const n = toolsByCategory(c.id).length
    pages.push({
      path: `/category/${c.id}`,
      kind: 'category',
      title: `${c.label}: Free Online Tools, No Upload | ${SITE_NAME}`,
      description: fit(`${n} free online ${n === 1 ? 'tool' : 'tools'} in ${c.label}: ${c.description.replace(/\s*--\s*/g, ', ').replace(/\.$/, '')}. Runs in your browser, no sign-up.`),
      h1: `${c.label} tools`,
    })
  }
  for (const t of TOOLS) if (!t.comingSoon) pages.push(toolSeo(t))
  pages.push(
    { path: '/suggest', kind: 'info', title: `Suggest a Tool | ${SITE_NAME}`, description: 'Tell us which free tool you would like to see added to ToolSuite.', h1: 'Suggest a tool', noindex: true },
    { path: '/roadmap', kind: 'info', title: `Roadmap | ${SITE_NAME}`, description: 'What ToolSuite is building next and what it deliberately does not build.', h1: 'Roadmap', noindex: true },
  )
  return pages
}

let index: Map<string, PageSeo> | undefined
export function seoFor(pathname: string): PageSeo | undefined {
  index ??= new Map(allPages().map((p) => [p.path, p]))
  return index.get(pathname.replace(/\/+$/, '') || '/')
}
