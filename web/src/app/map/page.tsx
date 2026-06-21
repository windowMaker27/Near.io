import { MapViewDynamic } from '@/features/maplibre/MapViewDynamic';
import { BottomNav } from '@/components/BottomNav';

export default function MapPage() {
  return (
    <main style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <MapViewDynamic />
      <BottomNav />
    </main>
  );
}
