// ─── Near.io Design System ──────────────────────────────────────────────────
// Source of truth for every visual token used in the app.
// Never hardcode colors, font sizes, spacing or radii outside this file.

// ─── DARK theme (default) ───────────────────────────────────────────────────
export const theme = {
  // Surfaces
  bg:              '#080808',
  surface:         '#111111',
  surfaceAlt:      '#161616',
  border:          '#1E1E1E',

  // Text
  text:            '#F0F0F0',
  textMuted:       '#666666',
  textFaint:       '#333333',

  // Brand accent
  accent:          '#E8392A',
  accentDim:       '#7A1A10',
  accentBg:        '#E8392A14',
  accentBorder:    '#E8392A44',

  // Semantic status
  colorOpen:       '#4CAF72',
  colorClosed:     '#333333',
  colorDanger:     '#E84444',
  colorSuccess:    '#4CAF72',
  colorWarning:    '#C8A020',
  colorInfo:       '#4A9EFF',

  // Warning banner surfaces
  warningBg:       '#1A1200',
  warningBorder:   '#3A2A00',

  // Typography
  fontMono:        'JetBrainsMono_400Regular',
  fontMonoBold:    'JetBrainsMono_700Bold',
  fontMonoMedium:  'JetBrainsMono_500Medium',

  // Named type scale
  textXs:   10,
  textSm:   11,
  textBase: 13,
  textMd:   14,
  textLg:   15,
  textXl:   18,
  text2xl:  22,
  text3xl:  26,

  // Letter spacing
  trackingWide:  1,
  trackingXl:    2,
  trackingTitle: 3,

  // Spacing (4 pt grid)
  sp1:  4,
  sp2:  8,
  sp3:  12,
  sp4:  16,
  sp5:  20,
  sp6:  24,
  sp8:  32,
  sp10: 40,
  sp12: 48,
  pagePad: 20,

  // Border radius
  radiusSm:   6,
  radius:     12,
  radiusLg:   20,
  radiusFull: 9999,

  // Shadows
  shadowSm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius:  4,
    elevation:     2,
  },
  shadowMd: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius:  12,
    elevation:     6,
  },
} as const;

// ─── LIGHT theme ─────────────────────────────────────────────────────────────
// Même structure, surfaces beige chaudes + accent teal lisible.
export const themeLight: typeof theme = {
  ...theme,

  // Surfaces (Nexus Beige)
  bg:              '#F7F6F2',
  surface:         '#FAFAF7',
  surfaceAlt:      '#F0EFE9',
  border:          '#DCD9D0',

  // Text
  text:            '#28251D',
  textMuted:       '#7A7870',
  textFaint:       '#B8B5AD',

  // Accent — teal légèrement saturé pour le light (lisible sur beige)
  accent:          '#E8392A',   // brand rouge inchangé
  accentDim:       '#F5C9C4',
  accentBg:        '#E8392A14',
  accentBorder:    '#E8392A44',

  // Status
  colorOpen:       '#3A8F5C',
  colorClosed:     '#B8B5AD',
  colorDanger:     '#C0392B',
  colorSuccess:    '#3A8F5C',
  colorWarning:    '#A0720A',
  colorInfo:       '#1A6EC7',

  // Warning banner
  warningBg:       '#FDF3DC',
  warningBorder:   '#E8D49C',

  // Shadows
  shadowSm: {
    shadowColor:   '#28251D',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius:  4,
    elevation:     2,
  },
  shadowMd: {
    shadowColor:   '#28251D',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius:  12,
    elevation:     6,
  },
};

export type Theme = typeof theme;
