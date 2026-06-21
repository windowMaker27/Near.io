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
import type { Coordinates, Place } from '@/types/place';
import { PLACE_TYPE_LABELS } from '@/constants/placeTypes';
import { formatDistance } from '@/features/compass/utils/distance';

// Couleurs radar
const ACCENT = '#00d4aa';
const RADAR_FILL_DARK = 'rgba(0, 212, 170, 0.06)';
const RADAR_SWEEP_DARK = 'rgba(0, 212, 170, 0.18)';
const OPEN_COLOR = '#51cf66';
const CLOSED_COLOR = '#ff6b6b';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  onPlaceSelect?: (place: Place) => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyFC(): FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView({ onPlaceSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const coords = useLocationStore((s) => s.coords);
  const { filters } = useFiltersStore();
  const { places } = useNearbyPlaces();
  const sweepAngle = useRadarSweep(mapReady);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: MapLibreMap;

    (async () => {
      const { Map: MLMap } = await import('maplibre-gl');
      await import('maplibre-gl/dist/maplibre-gl.css');

      map = new MLMap({
        container: containerRef.current!,
        style: {
          version: 8,
          sources: {},
          layers: [],
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        },
        center: coords ? [coords.longitude, coords.latitude] : [2.3488, 48.8534],
        zoom: 15,
        attributionControl: false,
      });

      map.on('load', () => {
        // Sources
        map.addSource('user-dot', { type: 'geojson', data: emptyFC() });
        map.addSource('radar-circle', { type: 'geojson', data: emptyFC() });
        map.addSource('radar-sweep', { type: 'geojson', data: emptyFC() });
        map.addSource('places', { type: 'geojson', data: emptyFC(), cluster: false });

        // Radar fill
        map.addLayer({ id: 'radar-fill', type: 'fill', source: 'radar-circle', paint: { 'fill-color': RADAR_FILL_DARK, 'fill-opacity': 1 } });
        map.addLayer({ id: 'radar-stroke', type: 'line', source: 'radar-circle', paint: { 'line-color': ACCENT, 'line-width': 1.2, 'line-opacity': 0.5 } });
        map.addLayer({ id: 'radar-sweep-layer', type: 'fill', source: 'radar-sweep', paint: { 'fill-color': RADAR_SWEEP_DARK, 'fill-opacity': 1 } });

        // Places circles
        map.addLayer({
          id: 'places-circle',
          type: 'circle',
          source: 'places',
          paint: {
            'circle-radius': 7,
            'circle-color': ['case', ['==', ['get', 'openingStatus'], 'open'], OPEN_COLOR, ['==', ['get', 'openingStatus'], 'closed'], CLOSED_COLOR, '#888'],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#000',
          },
        });

        // Places labels
        map.addLayer({
          id: 'places-label',
          type: 'symbol',
          source: 'places',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 11,
            'text-offset': [0, 1.4],
            'text-anchor': 'top',
            'text-optional': true,
          },
          paint: { 'text-color': '#e8e8e8', 'text-halo-color': '#000', 'text-halo-width': 1 },
        });

        // User dot
        map.addLayer({ id: 'user-dot-layer', type: 'circle', source: 'user-dot', paint: { 'circle-radius': 8, 'circle-color': ACCENT, 'circle-stroke-width': 2, 'circle-stroke-color': '#000' } });

        mapRef.current = map;
        setMapReady(true);
      });

      // Click on place
      map.on('click', 'places-circle', (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties as Place;
        onPlaceSelect?.(props);
      });

      map.on('mouseenter', 'places-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'places-circle', () => { map.getCanvas().style.cursor = ''; });
    })();

    return () => {
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update user position ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !coords) return;

    const userFC: FeatureCollection = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', id: 'user', geometry: { type: 'Point', coordinates: [coords.longitude, coords.latitude] }, properties: {} }],
    };
    (map.getSource('user-dot') as GeoJSONSource)?.setData(userFC);

    const circleFC: FeatureCollection = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [makeCirclePolygon(coords.latitude, coords.longitude, filters.radiusMeters)] }, properties: {} }],
    };
    (map.getSource('radar-circle') as GeoJSONSource)?.setData(circleFC);
  }, [mapReady, coords, filters.radiusMeters]);

  // ── Update radar sweep ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !coords || sweepAngle == null) return;

    const ARC = 30;
    const start = ((sweepAngle - ARC / 2) * Math.PI) / 180;
    const end = ((sweepAngle + ARC / 2) * Math.PI) / 180;
    const R = filters.radiusMeters / 111320;
    const steps = 20;
    const ring: [number, number][] = [[coords.longitude, coords.latitude]];
    for (let i = 0; i <= steps; i++) {
      const a = start + ((end - start) * i) / steps;
      ring.push([coords.longitude + R * Math.sin(a), coords.latitude + R * Math.cos(a)]);
    }
    ring.push([coords.longitude, coords.latitude]);

    const sweepFC: FeatureCollection = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} }],
    };
    (map.getSource('radar-sweep') as GeoJSONSource)?.setData(sweepFC);
  }, [mapReady, coords, sweepAngle, filters.radiusMeters]);

  // ── Update places ──────────────────────────────────────────────────────────
  const updatePlaces = useCallback(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    const placesFC: FeatureCollection = {
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.coordinates.longitude, p.coordinates.latitude] },
        properties: {
          id: p.id,
          name: p.name,
          category: p.category,
          categoryLabel: PLACE_TYPE_LABELS[p.category] ?? p.category,
          openingStatus: p.openingStatus ?? 'unknown',
          distanceLabel: p.distanceMeters != null ? formatDistance(p.distanceMeters) : '',
        } satisfies Record<string, unknown>,
      })),
    };
    (map.getSource('places') as GeoJSONSource)?.setData(placesFC);
  }, [mapReady, places]);

  useEffect(() => { updatePlaces(); }, [updatePlaces]);

  // ── Center on user ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !coords) return;
    map.easeTo({ center: [coords.longitude, coords.latitude], duration: 600 });
  }, [mapReady, coords]);

  // ── Watch location ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = watchPosition(
      (c) => useLocationStore.getState().setCoords(c),
      (err) => console.warn('[MapView] location error:', err),
    );
    return unsub;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '100dvh' }}
      aria-label="Carte des commerces à proximité"
    />
  );
}
