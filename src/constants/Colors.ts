/**
 * Near.io — Semantic colour palette
 *
 * Documented independently of `theme` so the design system is
 * self-explanatory without reading the full theme object.
 *
 * Import `theme` for runtime style values.
 * Import `Colors` for documentation, tests, or Storybook references.
 */
export const Colors = {
  // Brand
  brand:       '#E8392A',
  brandDim:    '#7A1A10',
  brandBg:     '#E8392A14',
  brandBorder: '#E8392A44',

  // Neutral surfaces
  bgDeep:      '#080808',
  surface:     '#111111',
  surfaceAlt:  '#161616',
  border:      '#1E1E1E',

  // Text
  textPrimary: '#F0F0F0',
  textMuted:   '#666666',
  textFaint:   '#333333',

  // Semantic
  open:        '#4CAF72',
  closed:      '#333333',
  danger:      '#E84444',
  success:     '#4CAF72',
  warning:     '#C8A020',
  info:        '#4A9EFF',

  // Warning banner
  warningBg:     '#1A1200',
  warningBorder: '#3A2A00',
} as const;

export type ColorKey = keyof typeof Colors;
