import { type StyleSpecification } from '@maplibre/maplibre-react-native';

// Tuiles vectorielles OpenFreeMap — 100% gratuit, sans clé API
const TILES_URL = 'https://tiles.openfreemap.org/planet';
const GLYPHS_URL = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
// NOTE: pas de sprite — le style Near.io n'utilise aucune icône symbol (fill + line + text uniquement)
// L'URL sprite OFM bright retourne 404, supprimée pour éviter les erreurs MapLibre.

// ─────────────────────────────────────────────────────────────────────────────
// DARK
// ─────────────────────────────────────────────────────────────────────────────
export const nearMapStyleDark: StyleSpecification = {
  version: 8,
  name: 'Near.io Dark',
  glyphs: GLYPHS_URL,
  sources: {
    ofm: {
      type: 'vector',
      url: TILES_URL,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#080808' } },
    {
      id: 'water', type: 'fill', source: 'ofm', 'source-layer': 'water',
      paint: { 'fill-color': '#0D1A26' },
    },
    {
      id: 'landcover-wood', type: 'fill', source: 'ofm', 'source-layer': 'landcover',
      filter: ['match', ['get', 'class'], ['wood', 'forest'], true, false],
      paint: { 'fill-color': '#0F1E14', 'fill-opacity': 0.9 },
    },
    {
      id: 'park', type: 'fill', source: 'ofm', 'source-layer': 'landuse',
      filter: ['match', ['get', 'class'], ['park', 'garden', 'grass', 'pitch'], true, false],
      paint: { 'fill-color': '#131F16', 'fill-opacity': 0.85 },
    },
    {
      id: 'landuse-urban', type: 'fill', source: 'ofm', 'source-layer': 'landuse',
      filter: ['match', ['get', 'class'], ['residential', 'commercial', 'industrial'], true, false],
      paint: { 'fill-color': '#0E0E0E', 'fill-opacity': 0.6 },
    },
    {
      id: 'building', type: 'fill', source: 'ofm', 'source-layer': 'building',
      paint: { 'fill-color': '#161616', 'fill-outline-color': '#242424' },
    },
    {
      id: 'road-path', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      filter: ['match', ['get', 'class'], ['path', 'pedestrian', 'footway'], true, false],
      paint: { 'line-color': '#2A2A2A', 'line-width': 0.8, 'line-dasharray': [1, 1.2] },
    },
    {
      id: 'road-minor', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      filter: ['match', ['get', 'class'], ['minor', 'service', 'track', 'residential'], true, false],
      paint: { 'line-color': '#2E2E2E', 'line-width': 1.2 },
    },
    {
      id: 'road-major', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      filter: ['match', ['get', 'class'], ['primary', 'secondary', 'tertiary', 'trunk', 'motorway'], true, false],
      paint: { 'line-color': '#484848', 'line-width': 2 },
    },
    {
      id: 'place-label', type: 'symbol', source: 'ofm',
      'source-layer': 'place_label',
      layout: {
        'text-field': ['coalesce', ['get', 'name:fr'], ['get', 'name']],
        'text-size': 11,
        'text-font': ['Noto Sans Regular'],
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#999693',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    },
    {
      id: 'road-label', type: 'symbol', source: 'ofm', 'source-layer': 'transportation_name',
      layout: {
        'text-field': ['coalesce', ['get', 'name:fr'], ['get', 'name']],
        'text-size': 10,
        'text-font': ['Noto Sans Regular'],
      },
      paint: {
        'text-color': '#666462',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LIGHT
// ─────────────────────────────────────────────────────────────────────────────
export const nearMapStyleLight: StyleSpecification = {
  ...nearMapStyleDark,
  name: 'Near.io Light',
  layers: nearMapStyleDark.layers.map((layer) => {
    switch (layer.id) {
      case 'background': return { ...layer, paint: { 'background-color': '#F2F0EB' } };
      case 'water': return { ...layer, paint: { 'fill-color': '#C5D8EA' } };
      case 'landcover-wood': return { ...layer, paint: { 'fill-color': '#C8D8BE', 'fill-opacity': 0.9 } };
      case 'park': return { ...layer, paint: { 'fill-color': '#D4E4CC', 'fill-opacity': 0.85 } };
      case 'landuse-urban': return { ...layer, paint: { 'fill-color': '#EBE9E4', 'fill-opacity': 0.6 } };
      case 'building': return { ...layer, paint: { 'fill-color': '#E0DDD8', 'fill-outline-color': '#C8C5C0' } };
      case 'road-path': return { ...layer, paint: { 'line-color': '#C8C5BF', 'line-width': 0.8, 'line-dasharray': [1, 1.2] } };
      case 'road-minor': return { ...layer, paint: { 'line-color': '#BFBCB6', 'line-width': 1.2 } };
      case 'road-major': return { ...layer, paint: { 'line-color': '#A8A5A0', 'line-width': 2 } };
      case 'place-label':
        return { ...layer, paint: { 'text-color': '#4A4844', 'text-halo-color': '#F2F0EB', 'text-halo-width': 1 } };
      case 'road-label':
        return { ...layer, paint: { 'text-color': '#7A7874', 'text-halo-color': '#F2F0EB', 'text-halo-width': 1 } };
      default: return layer;
    }
  }),
};
