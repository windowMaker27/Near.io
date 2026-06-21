'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { makeCirclePolygon } from '@/utils/geoCircle';
import { useRadarSweep } from '@/hooks/useRadarSweep';
import { useNearbyPlaces } from '@/features/places/hooks/useNearbyPlaces';
import { useFiltersStore } from '@/store/filtersStore';
import { useLocationStore } from '@/store/locationStore';
import { watchPosition } from '@/services/locationService';
import { nearMapStyleDark, nearMapStyleLight } from './style/nearMapStyle';
import type { Coordinates, Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';

const ACCENT = '#e63946';
const OPEN_COLOR = '#51cf66';
const CLOSED_COLOR = '#ff6b6b';

type Props = { onPlaceSelect?: (place: Place) => void };

function emptyFC(): FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function isDarkTheme() {
  if (typeof document === 'undefined') return true;
  return document.documentElement.getAttribute('data-theme') !== 'light';
}

let activeMapContainer: HTMLDivElement | null = null;

export default function MapView({ onPlaceSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const coords = useLocationStore((s) => s.coords);
  const { filters } = useFiltersStore();

  // Pass coords so the hook actually fetches places
  const userCoords: Coordinates | undefined = coords
    ? { latitude: coords.latitude, longitude: coords.longitude }
    : undefined;
  const { places } = useNearbyPlaces(userCoords);

  const sweepGeoJSON = useRadarSweep(
    coords?.longitude ?? null,
    coords?.latitude ?? null,
    filters.radiusMeters,
  );

  // ── Init map ─────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (activeMapContainer && activeMapContainer !== container) return;
    if (mapRef.current) return;

    activeMapContainer = container;
    let map: MapLibreMap;
    let cancelled = false;

    (async () => {
      const { Map: MLMap } = await import('maplibre-gl');
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (cancelled || !containerRef.current) return;

      const dark = isDarkTheme();
      map = new MLMap({
        container: containerRef.current,
        style: dark ? nearMapStyleDark : nearMapStyleLight,
        center: coords ? [coords.longitude, coords.latitude] : [2.3488, 48.8534],
        zoom: 15,
        attributionControl: true,
      });

      map.on('load', () => {
        if (cancelled) { map.remove(); return; }
        addOverlayLayers(map);
        mapRef.current = map;
        setMapReady(true);
      });

      map.on('click', 'places-circle', (e) => {
        if (!e.features?.length) return;
        onPlaceSelect?.(e.features[0].properties as Place);
      });
      map.on('mouseenter', 'places-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'places-circle', () => { map.getCanvas().style.cursor = ''; });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      if (activeMapContainer === container) activeMapContainer = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to theme changes ────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const observer = new MutationObserver(() => {
      const dark = isDarkTheme();
      map.setStyle(dark ? nearMapStyleDark : nearMapStyleLight);
      map.once('style.load', () => addOverlayLayers(map));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [mapReady]);

  // ── Update user dot + radar circle ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !coords) return;
    (map.getSource('user-dot') as GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', id: 'user', geometry: { type: 'Point', coordinates: [coords.longitude, coords.latitude] }, properties: {} }],
    });
    (map.getSource('radar-circle') as GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: [makeCirclePolygon(coords.longitude, coords.latitude, filters.radiusMeters)],
    });
  }, [mapReady, coords, filters.radiusMeters]);

  // ── Update radar sweep ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !sweepGeoJSON) return;
    (map.getSource('radar-sweep') as GeoJSONSource)?.setData(sweepGeoJSON);
  }, [mapReady, sweepGeoJSON]);

  // ── Update places ──────────────────────────────────────────────────
  const updatePlaces = useCallback(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    (map.getSource('places') as GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.coordinates.longitude, p.coordinates.latitude] },
        properties: {
          id: p.id, name: p.name, category: p.category,
          categoryLabel: PLACE_TYPE_LABELS[p.category] ?? p.category,
          openingStatus: p.openingStatus ?? 'unknown',
          distanceLabel: p.distanceMeters != null ? formatDistance(p.distanceMeters) : '',
        },
      })),
    });
  }, [mapReady, places]);

  useEffect(() => { updatePlaces(); }, [updatePlaces]);

  // ── Center on user ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !coords) return;
    map.easeTo({ center: [coords.longitude, coords.latitude], duration: 600 });
  }, [mapReady, coords]);

  // ── Watch location ───────────────────────────────────────────────
  useEffect(() => {
    return watchPosition((c: Coordinates) => useLocationStore.getState().setCoords(c));
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '100dvh' }}
      aria-label="Carte des commerces \u00e0 proximit\u00e9"
    />
  );
}

// ── Helper: add all overlay sources + layers ────────────────────────────────
function addOverlayLayers(map: MapLibreMap) {
  const dark = isDarkTheme();
  const rf = dark ? 'rgba(231,76,60,0.04)' : 'rgba(231,76,60,0.03)';
  const sf = dark ? 'rgba(231,76,60,0.18)' : 'rgba(231,76,60,0.12)';

  const emptyFC: FeatureCollection = { type: 'FeatureCollection', features: [] };

  if (!map.getSource('user-dot'))    map.addSource('user-dot',     { type: 'geojson', data: emptyFC });
  if (!map.getSource('radar-circle')) map.addSource('radar-circle', { type: 'geojson', data: emptyFC });
  if (!map.getSource('radar-sweep'))  map.addSource('radar-sweep',  { type: 'geojson', data: emptyFC });
  if (!map.getSource('places'))       map.addSource('places',        { type: 'geojson', data: emptyFC });

  if (!map.getLayer('radar-fill'))        map.addLayer({ id: 'radar-fill',        type: 'fill',   source: 'radar-circle', paint: { 'fill-color': rf } });
  if (!map.getLayer('radar-stroke'))      map.addLayer({ id: 'radar-stroke',      type: 'line',   source: 'radar-circle', paint: { 'line-color': ACCENT, 'line-width': 1.2, 'line-opacity': 0.6 } });
  if (!map.getLayer('radar-sweep-layer')) map.addLayer({ id: 'radar-sweep-layer', type: 'fill',   source: 'radar-sweep',  paint: { 'fill-color': sf } });

  if (!map.getLayer('places-circle')) {
    map.addLayer({
      id: 'places-circle', type: 'circle', source: 'places',
      paint: {
        'circle-radius': 7,
        'circle-color': ['case',
          ['==', ['get', 'openingStatus'], 'open'],   OPEN_COLOR,
          ['==', ['get', 'openingStatus'], 'closed'], CLOSED_COLOR,
          '#888',
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    });
  }

  if (!map.getLayer('places-label')) {
    map.addLayer({
      id: 'places-label', type: 'symbol', source: 'places',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
        'text-optional': true,
        'text-font': ['Noto Sans Regular'],
      },
      paint: {
        'text-color':       dark ? '#cccccc' : '#111111',
        'text-halo-color':  dark ? '#080808' : '#ffffff',
        'text-halo-width': 1.5,
      },
    });
  }

  if (!map.getLayer('user-dot-layer')) {
    map.addLayer({ id: 'user-dot-layer', type: 'circle', source: 'user-dot', paint: { 'circle-radius': 8, 'circle-color': ACCENT, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
  }
}
