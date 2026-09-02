// Rule-based prompt-engineering checklist -- regex/heuristic checks
// against well-documented prompt-engineering advice (be explicit about
// role, task, format, and constraints; avoid vague qualifiers; give
// examples for anything subjective). Deliberately NOT an LLM call: no
// backend, no API key, works the same for everyone, and never invents a
// verdict about content it can't actually understand.

export interface Check {
  id: string
  label: string
  pass: boolean
  detail: string
}

const VAGUE_WORDS = [
  'good', 'nice', 'appropriate', 'some', 'several', 'a bit', 'kind of', 'sort of',
  'just', 'stuff', 'things', 'etc', 'reasonable', 'proper', 'suitable', 'various', 'better',
]

export interface PromptAnalysis {
  checks: Check[]
  vagueHits: { word: string; count: number }[]
  wordCount: number
  charCount: number
}

export function analyzePrompt(text: string): PromptAnalysis {
  const lower = text.toLowerCase()
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const hasRole = /\b(you are|act as|as an? |your role is|assume the (role|persona) of)\b/i.test(text)
  const hasFormat = /\b(format|respond with|return (only|a|the)|output (as|should)|as (a )?(json|list|table|bullet|markdown)|in the following format)\b/i.test(text)
  const hasConstraints = /\b(must|must not|do not|don't|never|only|avoid|should not|shouldn't|no more than|at least|exactly|limit)\b/i.test(text)
  const hasExamples = /\b(example|e\.g\.|for instance|for example)\b/i.test(text) || /\binput:.*output:/is.test(text)
  const hasTaskVerb = /^\s*(write|generate|create|summarize|rewrite|translate|explain|analyze|classify|extract|convert|list|compare|review|fix|debug|format|answer|respond)\b/im.test(text)

  const checks: Check[] = [
    { id: 'role', label: 'Defines a role or persona', pass: hasRole, detail: hasRole ? 'Found role language ("you are...", "act as...").' : 'No role/persona found -- "You are a [X] who [does Y]" gives the model a consistent frame.' },
    { id: 'task', label: 'States a clear task', pass: hasTaskVerb, detail: hasTaskVerb ? 'Starts with (or contains) a clear action verb.' : 'No clear imperative task found near the start -- lead with what you actually want done.' },
    { id: 'format', label: 'Specifies an output format', pass: hasFormat, detail: hasFormat ? 'Found format guidance.' : 'No output format specified -- say exactly how the answer should be structured (plain text, JSON, a list, length).' },
    { id: 'constraints', label: 'Includes constraints or rules', pass: hasConstraints, detail: hasConstraints ? 'Found constraint language (must/avoid/only/etc.).' : 'No explicit constraints -- rules like "don\'t invent facts" or "under 200 words" narrow the output a lot.' },
    { id: 'examples', label: 'Gives at least one example', pass: hasExamples, detail: hasExamples ? 'Found example language or an input/output pair.' : 'No examples -- one concrete example is often worth several sentences of instruction.' },
    { id: 'length', label: 'Reasonable length', pass: wordCount >= 15, detail: wordCount < 15 ? `Only ${wordCount} word${wordCount === 1 ? '' : 's'} -- very short prompts leave a lot to guesswork.` : `${wordCount} words.` },
  ]

  const vagueHits = VAGUE_WORDS
    .map((word) => {
      const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      const count = (lower.match(re) ?? []).length
      return { word, count }
    })
    .filter((v) => v.count > 0)
    .sort((a, b) => b.count - a.count)

  return { checks, vagueHits, wordCount, charCount: text.length }
}
