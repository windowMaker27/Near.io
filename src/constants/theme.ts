// ─── Near.io Design System ───────────────────────────────────────────────────
// Source of truth for every visual token used in the app.
// Never hardcode colors, font sizes, spacing or radii outside this file.

export const theme = {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  bg:              '#080808',
  surface:         '#111111',
  surfaceAlt:      '#161616',
  border:          '#1E1E1E',

  // ── Text ──────────────────────────────────────────────────────────────────
  text:            '#F0F0F0',
  textMuted:       '#666666',
  textFaint:       '#333333',

  // ── Brand accent ──────────────────────────────────────────────────────────
  accent:          '#E8392A',
  accentDim:       '#7A1A10',
  accentBg:        '#E8392A14',   // accent @ 8 % opacity  → chip backgrounds
  accentBorder:    '#E8392A44',   // accent @ 27 % opacity → chip borders

  // ── Semantic status ───────────────────────────────────────────────────────
  colorOpen:       '#4CAF72',     // green  — ouvert
  colorClosed:     '#333333',     // == textFaint — fermé
  colorDanger:     '#E84444',     // red    — erreurs destructives
  colorSuccess:    '#4CAF72',     // green  — confirmations
  colorWarning:    '#C8A020',     // amber  — avertissements
  colorInfo:       '#4A9EFF',     // blue   — informations neutres

  // Warning banner surfaces (index.tsx heading banner)
  warningBg:       '#1A1200',
  warningBorder:   '#3A2A00',

  // ── Typography ────────────────────────────────────────────────────────────
  fontMono:        'JetBrainsMono_400Regular',
  fontMonoBold:    'JetBrainsMono_700Bold',
  fontMonoMedium:  'JetBrainsMono_500Medium',

  // Named type scale (px — use these instead of raw numbers)
  textXs:   10,
  textSm:   11,
  textBase: 13,
  textMd:   14,
  textLg:   15,
  textXl:   18,
  text2xl:  22,
  text3xl:  26,

  // Letter spacing presets
  trackingWide:  1,
  trackingXl:    2,
  trackingTitle: 3,

  // ── Spacing (4 pt grid) ────────────────────────────────────────────────────
  sp1:  4,
  sp2:  8,
  sp3:  12,
  sp4:  16,
  sp5:  20,
  sp6:  24,
  sp8:  32,
  sp10: 40,
  sp12: 48,

  // Page-level horizontal padding (used in every screen header)
  pagePad: 20,

  // ── Border radius ─────────────────────────────────────────────────────────
  radiusSm:   6,
  radius:     12,
  radiusLg:   20,
  radiusFull: 9999,

  // ── Shadows (React Native shadow props — spread as {...theme.shadowSm}) ───
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
