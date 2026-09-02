export const SYMBOL_GROUPS: { label: string; chars: { ch: string; name: string }[] }[] = [
  {
    label: 'Arrows',
    chars: [
      { ch: '→', name: 'Right arrow' }, { ch: '←', name: 'Left arrow' }, { ch: '↑', name: 'Up arrow' }, { ch: '↓', name: 'Down arrow' },
      { ch: '↔', name: 'Left-right arrow' }, { ch: '↕', name: 'Up-down arrow' }, { ch: '⇒', name: 'Double right arrow' }, { ch: '⇐', name: 'Double left arrow' },
      { ch: '⇔', name: 'Double left-right arrow' }, { ch: '↗', name: 'Up-right arrow' }, { ch: '↘', name: 'Down-right arrow' }, { ch: '↙', name: 'Down-left arrow' },
      { ch: '↖', name: 'Up-left arrow' }, { ch: '↩', name: 'Return arrow' }, { ch: '↪', name: 'Forward arrow' }, { ch: '⟳', name: 'Clockwise' },
      { ch: '⟲', name: 'Counterclockwise' }, { ch: '➜', name: 'Heavy right arrow' }, { ch: '➤', name: 'Triangle arrow' }, { ch: '▶', name: 'Play' },
    ],
  },
  {
    label: 'Math',
    chars: [
      { ch: '±', name: 'Plus-minus' }, { ch: '×', name: 'Multiply' }, { ch: '÷', name: 'Divide' }, { ch: '≈', name: 'Approx equal' },
      { ch: '≠', name: 'Not equal' }, { ch: '≤', name: 'Less or equal' }, { ch: '≥', name: 'Greater or equal' }, { ch: '∞', name: 'Infinity' },
      { ch: '√', name: 'Square root' }, { ch: '∑', name: 'Sum' }, { ch: '∏', name: 'Product' }, { ch: '∫', name: 'Integral' },
      { ch: '∂', name: 'Partial' }, { ch: '∆', name: 'Delta' }, { ch: 'π', name: 'Pi' }, { ch: 'θ', name: 'Theta' },
      { ch: '°', name: 'Degree' }, { ch: '‰', name: 'Per mille' }, { ch: '¹', name: 'Superscript 1' }, { ch: '²', name: 'Superscript 2' },
      { ch: '³', name: 'Superscript 3' }, { ch: '½', name: 'One half' }, { ch: '¼', name: 'One quarter' }, { ch: '¾', name: 'Three quarters' },
    ],
  },
  {
    label: 'Currency',
    chars: [
      { ch: '$', name: 'Dollar' }, { ch: '€', name: 'Euro' }, { ch: '£', name: 'Pound' }, { ch: '¥', name: 'Yen' },
      { ch: '₹', name: 'Rupee' }, { ch: '₨', name: 'Rupee sign' }, { ch: '₩', name: 'Won' }, { ch: '₽', name: 'Ruble' },
      { ch: '¢', name: 'Cent' }, { ch: '₺', name: 'Lira' }, { ch: '₴', name: 'Hryvnia' }, { ch: '฿', name: 'Baht' },
    ],
  },
  {
    label: 'Punctuation & typography',
    chars: [
      { ch: '“', name: 'Left double quote' }, { ch: '”', name: 'Right double quote' }, { ch: '‘', name: 'Left single quote' }, { ch: '’', name: 'Right single quote' },
      { ch: '—', name: 'Em dash' }, { ch: '–', name: 'En dash' }, { ch: '…', name: 'Ellipsis' }, { ch: '§', name: 'Section' },
      { ch: '¶', name: 'Pilcrow' }, { ch: '†', name: 'Dagger' }, { ch: '‡', name: 'Double dagger' }, { ch: '•', name: 'Bullet' },
      { ch: '·', name: 'Middle dot' }, { ch: '‹', name: 'Left angle quote' }, { ch: '›', name: 'Right angle quote' }, { ch: '«', name: 'Left guillemet' },
      { ch: '»', name: 'Right guillemet' }, { ch: '¡', name: 'Inverted exclamation' }, { ch: '¿', name: 'Inverted question' }, { ch: '#', name: 'Hash' },
    ],
  },
  {
    label: 'Symbols & stars',
    chars: [
      { ch: '★', name: 'Star' }, { ch: '☆', name: 'Star outline' }, { ch: '♥', name: 'Heart' }, { ch: '♦', name: 'Diamond' },
      { ch: '♣', name: 'Club' }, { ch: '♠', name: 'Spade' }, { ch: '✓', name: 'Check' }, { ch: '✗', name: 'Cross' },
      { ch: '✔', name: 'Heavy check' }, { ch: '✘', name: 'Heavy cross' }, { ch: '⚠', name: 'Warning' }, { ch: '☀', name: 'Sun' },
      { ch: '☁', name: 'Cloud' }, { ch: '☂', name: 'Umbrella' }, { ch: '☎', name: 'Phone' }, { ch: '✉', name: 'Envelope' },
      { ch: '⌘', name: 'Command' }, { ch: '⌥', name: 'Option' }, { ch: '⚡', name: 'Bolt' }, { ch: '♻', name: 'Recycle' },
      { ch: '☯', name: 'Yin yang' }, { ch: '☮', name: 'Peace' }, { ch: '✂', name: 'Scissors' }, { ch: '⏎', name: 'Enter' },
    ],
  },
  {
    label: 'Boxes & lines',
    chars: [
      { ch: '□', name: 'Box' }, { ch: '■', name: 'Filled box' }, { ch: '▢', name: 'Rounded box' }, { ch: '○', name: 'Circle' },
      { ch: '●', name: 'Filled circle' }, { ch: '△', name: 'Triangle' }, { ch: '▲', name: 'Filled triangle' }, { ch: '◆', name: 'Filled diamond' },
      { ch: '─', name: 'Horizontal line' }, { ch: '│', name: 'Vertical line' }, { ch: '┌', name: 'Corner' }, { ch: '└', name: 'Corner' },
      { ch: '├', name: 'T-junction' }, { ch: '═', name: 'Double line' }, { ch: '░', name: 'Light shade' }, { ch: '▓', name: 'Dark shade' },
    ],
  },
]
