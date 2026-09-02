import { EditorView } from '@codemirror/view'

/** Pulls colors from the app's own CSS custom properties instead of a
 * separate light/dark CodeMirror theme pair -- since those variables
 * already flip with the site's theme (system/light/dark), the editor
 * re-themes itself for free with zero extra theme-detection code. */
export const appEditorTheme = EditorView.theme({
  '&': {
    color: 'var(--text)',
    backgroundColor: 'var(--bg-sunken)',
    height: '100%',
    fontSize: '13px',
  },
  '.cm-content': { caretColor: 'var(--accent)', fontFamily: 'var(--font-mono, ui-monospace, monospace)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
  },
  '.cm-gutters': { backgroundColor: 'var(--bg-sunken)', color: 'var(--text-faint)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--text) 5%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'color-mix(in srgb, var(--text) 8%, transparent)' },
  '.cm-matchingBracket, .cm-nonmatchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
    outline: '1px solid var(--accent)',
  },
}, { dark: false })
