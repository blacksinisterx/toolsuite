export type ToolCategory =
  | 'pdf'
  | 'images'
  | 'developer'
  | 'text'
  | 'utilities'
  | 'analyzer'
  | 'ocr'
  | 'archives'
  | 'data'
  | 'web'
  | 'video'
  | 'audio'

export interface ToolMeta {
  id: string
  name: string
  description: string
  category: ToolCategory
  path: string
  keywords: string[]
  processing: 'client' | 'server'
  /** Marks a tool referenced by the spec but not yet built -- shown as
   * "coming later" instead of a fake working page. */
  comingSoon?: boolean
}

export interface CategoryMeta {
  id: ToolCategory
  label: string
  description: string
}
