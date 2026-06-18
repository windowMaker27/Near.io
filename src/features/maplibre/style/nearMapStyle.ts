import { type StyleSpecification } from '@maplibre/maplibre-react-native';

const TILES_URL = 'https://tiles.openfreemap.org/planet';
const GLYPHS_URL = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

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
    // Fond
    { id: 'background', type: 'background', paint: { 'background-color': '#080808' } },

    // Eau
    {
      id: 'water', type: 'fill', source: 'ofm', 'source-layer': 'water',
      paint: { 'fill-color': '#0D1A26' },
    },
    {
      id: 'waterway', type: 'line', source: 'ofm', 'source-layer': 'waterway',
      minzoom: 10,
      paint: { 'line-color': '#0D1A26', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 16, 3] },
    },

    // Espaces verts
    {
      id: 'landcover-wood', type: 'fill', source: 'ofm', 'source-layer': 'landcover',
      filter: ['match', ['get', 'class'], ['wood', 'forest'], true, false],
      paint: { 'fill-color': '#0F1E14', 'fill-opacity': 0.9 },
    },
    {
      id: 'park', type: 'fill', source: 'ofm', 'source-layer': 'landuse',
      filter: ['match', ['get', 'class'], ['park', 'garden', 'grass', 'pitch', 'cemetery'], true, false],
      paint: { 'fill-color': '#131F16', 'fill-opacity': 0.85 },
    },
    {
      id: 'landuse-urban', type: 'fill', source: 'ofm', 'source-layer': 'landuse',
      filter: ['match', ['get', 'class'], ['residential', 'commercial', 'industrial', 'retail'], true, false],
      paint: { 'fill-color': '#0E0E0E', 'fill-opacity': 0.5 },
    },

    // Bâtiments
    {
      id: 'building', type: 'fill', source: 'ofm', 'source-layer': 'building',
      minzoom: 13,
      paint: { 'fill-color': '#181818', 'fill-outline-color': '#282828' },
    },

    // Routes — fond (casing)
    {
      id: 'road-motorway-casing', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      minzoom: 10,
      filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#1A1A1A', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 16, 10] },
    },
    {
      id: 'road-major-casing', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      minzoom: 11,
      filter: ['match', ['get', 'class'], ['primary', 'secondary', 'tertiary'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#1A1A1A', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2, 16, 8] },
    },

    // Routes — surface
    {
      id: 'road-path', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      minzoom: 14,
      filter: ['match', ['get', 'class'], ['path', 'pedestrian', 'footway', 'steps'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#2A2A2A', 'line-width': 1, 'line-dasharray': [1, 1.5] },
    },
    {
      id: 'road-minor', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      minzoom: 13,
      filter: ['match', ['get', 'class'], ['minor', 'service', 'track', 'residential', 'unclassified', 'living_street'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#303030', 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1, 16, 3] },
    },
    {
      id: 'road-major', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      minzoom: 10,
      filter: ['match', ['get', 'class'], ['primary', 'secondary', 'tertiary'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#484848', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 16, 6] },
    },
    {
      id: 'road-motorway', type: 'line', source: 'ofm', 'source-layer': 'transportation',
      minzoom: 10,
      filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#3A3A3A', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 16, 8] },
    },

    // Labels routes
    {
      id: 'road-label', type: 'symbol', source: 'ofm', 'source-layer': 'transportation_name',
      minzoom: 14,
      layout: {
        'text-field': ['coalesce', ['get', 'name:fr'], ['get', 'name']],
        'text-size': 10,
        'text-font': ['Noto Sans Regular'],
        'symbol-placement': 'line',
        'text-max-angle': 30,
      },
      paint: {
        'text-color': '#666462',
        'text-halo-color': '#080808',
        'text-halo-width': 1.5,
      },
    },

    // Labels lieux
    {
      id: 'place-label-small', type: 'symbol', source: 'ofm', 'source-layer': 'place',
      minzoom: 12,
      filter: ['match', ['get', 'class'], ['neighbourhood', 'suburb', 'quarter'], true, false],
      layout: {
        'text-field': ['coalesce', ['get', 'name:fr'], ['get', 'name']],
        'text-size': 10,
        'text-font': ['Noto Sans Regular'],
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#666462',
        'text-halo-color': '#080808',
        'text-halo-width': 1,
      },
    },
    {
      id: 'place-label-city', type: 'symbol', source: 'ofm', 'source-layer': 'place',
      filter: ['match', ['get', 'class'], ['city', 'town', 'village'], true, false],
      layout: {
        'text-field': ['coalesce', ['get', 'name:fr'], ['get', 'name']],
        'text-size': ['interpolate', ['linear'], ['zoom'], 8, 11, 14, 15],
        'text-font': ['Noto Sans Regular'],
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#999693',
        'text-halo-color': '#080808',
        'text-halo-width': 1.5,
      },
    },
  ],
};

export const nearMapStyleLight: StyleSpecification = {
  ...nearMapStyleDark,
  name: 'Near.io Light',
  layers: nearMapStyleDark.layers.map((layer) => {
    switch (layer.id) {
      case 'background': return { ...layer, paint: { 'background-color': '#F2F0EB' } };
      case 'water': return { ...layer, paint: { 'fill-color': '#C5D8EA' } };
      case 'waterway': return { ...layer, paint: { 'line-color': '#A8C4D8', 'line-width': (layer as any).paint['line-width'] } };
      case 'landcover-wood': return { ...layer, paint: { 'fill-color': '#C8D8BE', 'fill-opacity': 0.9 } };
      case 'park': return { ...layer, paint: { 'fill-color': '#D4E4CC', 'fill-opacity': 0.85 } };
      case 'landuse-urban': return { ...layer, paint: { 'fill-color': '#EBE9E4', 'fill-opacity': 0.5 } };
      case 'building': return { ...layer, paint: { 'fill-color': '#E0DDD8', 'fill-outline-color': '#C8C5C0' } };
      case 'road-motorway-casing': return { ...layer, paint: { 'line-color': '#E8E5E0', 'line-width': (layer as any).paint['line-width'] } };
      case 'road-major-casing': return { ...layer, paint: { 'line-color': '#E8E5E0', 'line-width': (layer as any).paint['line-width'] } };
      case 'road-path': return { ...layer, paint: { 'line-color': '#C8C5BF', 'line-width': 1, 'line-dasharray': [1, 1.5] } };
      case 'road-minor': return { ...layer, paint: { 'line-color': '#D8D5CF', 'line-width': (layer as any).paint['line-width'] } };
      case 'road-major': return { ...layer, paint: { 'line-color': '#B8B5AF', 'line-width': (layer as any).paint['line-width'] } };
      case 'road-motorway': return { ...layer, paint: { 'line-color': '#C0BDB7', 'line-width': (layer as any).paint['line-width'] } };
      case 'road-label': return { ...layer, paint: { 'text-color': '#7A7874', 'text-halo-color': '#F2F0EB', 'text-halo-width': 1.5 } };
      case 'place-label-small': return { ...layer, paint: { 'text-color': '#7A7874', 'text-halo-color': '#F2F0EB', 'text-halo-width': 1 } };
      case 'place-label-city': return { ...layer, paint: { 'text-color': '#4A4844', 'text-halo-color': '#F2F0EB', 'text-halo-width': 1.5 } };
      default: return layer;
    }
  }),
};
