import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';

// Dynamically import Map component to avoid SSR issues with mapbox-gl
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => {
    console.log('Map is loading...');
    return (
      <div className="h-screen flex items-center justify-center bg-stone-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
});

export default function RoutesPage() {
  console.log('Rendering RoutesPage');
  return (
    <div className="h-screen pt-16">
      <Map />
    </div>
  );
}
