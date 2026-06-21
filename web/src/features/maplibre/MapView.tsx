'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
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

type TooltipState = { place: Place; x: number; y: number } | null;

export function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [selectedId, setSelectedId] = useState('');

  const coords = useLocationStore((s) => s.coords);
  const { filters } = useFiltersStore();
  const userCoords: Coordinates | undefined = coords
    ? { latitude: coords.latitude, longitude: coords.longitude }
    : undefined;

  const { places } = useNearbyPlaces(userCoords);
  const sweepGeoJSON = useRadarSweep(
    coords?.longitude ?? null,
    coords?.latitude ?? null,
    filters.radiusMeters,
  );

  // Init localisation
  useEffect(() => {
    const stop = watchPosition(() => {});
    return stop;
  }, []);

  // Init carte MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    import('maplibre-gl').then(({ Map, NavigationControl }) => {
      const map = new Map({
        container: mapContainerRef.current!,
        style: getMapStyle(),
        center: coords ? [coords.longitude, coords.latitude] : [2.3522, 48.8566],
        zoom: 14,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('load', () => {
        // Sources
        map.addSource('radar-circle', { type: 'geojson', data: emptyFC() });
        map.addSource('radar-sweep', { type: 'geojson', data: emptyFC() });
        map.addSource('places', { type: 'geojson', data: emptyFC() });
        map.addSource('user-location', { type: 'geojson', data: emptyFC() });

        // Layers
        map.addLayer({
          id: 'radar-fill',
          type: 'fill',
          source: 'radar-circle',
          paint: { 'fill-color': RADAR_FILL_DARK, 'fill-opacity': 1 },
        });
        map.addLayer({
          id: 'radar-border',
          type: 'line',
          source: 'radar-circle',
          paint: { 'line-color': ACCENT, 'line-width': 1.5, 'line-opacity': 0.6, 'line-dasharray': [4, 3] },
        });
        map.addLayer({
          id: 'radar-sweep-fill',
          type: 'fill',
          source: 'radar-sweep',
          paint: { 'fill-color': RADAR_SWEEP_DARK, 'fill-opacity': 1 },
        });
        map.addLayer({
          id: 'places-dot',
          type: 'circle',
          source: 'places',
          paint: {
            'circle-radius': ['case', ['==', ['get', 'id'], ''], 11, 8],
            'circle-color': ['match', ['get', 'status'], 'open', OPEN_COLOR, CLOSED_COLOR],
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#0a0a0a',
          },
        });
        map.addLayer({
          id: 'user-dot',
          type: 'circle',
          source: 'user-location',
          paint: {
            'circle-radius': 7,
            'circle-color': ACCENT,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        // Click sur un lieu
        map.on('click', 'places-dot', (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const props = feature.properties as { id: string; name: string; category: string; status: string; distanceMeters?: number };
          const found = places.find((p) => p.id === props.id);
          if (!found) return;
          setSelectedId(found.id);
          setTooltip({ place: found, x: e.point.x, y: e.point.y });
        });

        map.on('click', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['places-dot'] });
          if (!features.length) { setTooltip(null); setSelectedId(''); }
        });

        map.getCanvas().style.cursor = '';
        map.on('mouseenter', 'places-dot', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'places-dot', () => { map.getCanvas().style.cursor = ''; });

        setMapReady(true);
      });
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour position utilisateur + cercle radar
  useEffect(() => {
    if (!mapReady || !mapRef.current || !coords) return;
    const map = mapRef.current;

    const userFC: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', id: 'user', geometry: { type: 'Point', coordinates: [coords.longitude, coords.latitude] }, properties: {} }],
    };
    (map.getSource('user-location') as GeoJSONSource)?.setData(userFC);

    const circleFC: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [makeCirclePolygon(coords.longitude, coords.latitude, filters.radiusMeters)],
    };
    (map.getSource('radar-circle') as GeoJSONSource)?.setData(circleFC);
  }, [mapReady, coords, filters.radiusMeters]);

  // Animation sweep radar
  useEffect(() => {
    if (!mapReady || !mapRef.current || !sweepGeoJSON) return;
    (mapRef.current.getSource('radar-sweep') as GeoJSONSource)?.setData(sweepGeoJSON);
  }, [mapReady, sweepGeoJSON]);

  // Mise à jour des lieux
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const placesFC: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        id: p.id,
        geometry: { type: 'Point', coordinates: [p.coordinates.longitude, p.coordinates.latitude] },
        properties: { id: p.id, name: p.name, category: p.category, status: p.openingStatus, distanceMeters: p.distanceMeters },
      })),
    };
    (mapRef.current.getSource('places') as GeoJSONSource)?.setData(placesFC);

    // Mise à jour du cercle selected
    if (mapRef.current.getLayer('places-dot')) {
      mapRef.current.setPaintProperty('places-dot', 'circle-radius', [
        'case', ['==', ['get', 'id'], selectedId], 11, 8,
      ]);
      mapRef.current.setPaintProperty('places-dot', 'circle-stroke-width', [
        'case', ['==', ['get', 'id'], selectedId], 2.5, 1.5,
      ]);
    }
  }, [mapReady, places, selectedId]);

  const recenter = useCallback(() => {
    if (!mapRef.current || !coords) return;
    mapRef.current.flyTo({
      center: [coords.longitude, coords.latitude],
      zoom: 14,
      duration: 800,
      essential: true,
    });
  }, [coords]);

  const statusLabel = (p: Place) => {
    if (p.openingStatus === 'open') return `● Ouvert${p.closingTime ? ` jusqu'à ${p.closingTime}` : ''}`;
    if (p.openingStatus === 'closed') return '● Fermé';
    return '● Horaires inconnus';
  };
  const statusColor = (p: Place) =>
    p.openingStatus === 'open' ? OPEN_COLOR
    : p.openingStatus === 'closed' ? CLOSED_COLOR
    : '#888';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      {/* Map container */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
        aria-label="Carte des commerces"
      />

      {/* Recenter button */}
      <button
        onClick={recenter}
        aria-label="Recentrer sur ma position"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 44, height: 44, borderRadius: '50%',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--color-primary)',
          fontSize: '20px',
        }}
      >
        ◎
      </button>

      {/* Tooltip lieu */}
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 16,
            right: 16,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            animation: 'fadeSlideUp 180ms cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text)', margin: 0 }}>
            {tooltip.place.name}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>
            {PLACE_TYPE_LABELS[tooltip.place.category]}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: statusColor(tooltip.place) }}>
              {statusLabel(tooltip.place)}
            </span>
            {tooltip.place.distanceMeters != null && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {formatDistance(tooltip.place.distanceMeters)}
              </span>
            )}
          </div>
          <button
            style={{
              marginTop: 'var(--space-2)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              width: '100%',
            }}
            onClick={() => {
              useAppStore.getState().setSelectedPlace(tooltip.place);
              setTooltip(null);
            }}
          >
            Voir détails
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function emptyFC(): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

function getMapStyle(): string {
  // MapTiler Streets Dark — remplacez par nearMapStyleDark inline si besoin
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? '';
  if (key) return `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${key}`;
  // Fallback : style OpenFreeMap
  return 'https://tiles.openfreemap.org/styles/dark';
}
