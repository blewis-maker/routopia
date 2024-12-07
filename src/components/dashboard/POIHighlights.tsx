import { MapPin, Star, Navigation, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePOIData } from '@/hooks/usePOIData';

// Helper function to construct Google Places photo URL
function getGooglePhotoUrl(photoReference: string): string {
  const maxWidth = 400; // Adjust size as needed
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
}

export function POIHighlights() {
  const { pois, loading, error } = usePOIData(3);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-w-16 aspect-h-9 rounded-lg bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-indigo-600 hover:text-indigo-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Featured Places</h2>
        <Link
          href="/poi"
          className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
        >
          Explore more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pois.map((poi) => (
          <div
            key={poi.id}
            className="relative group"
          >
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              {poi.photoReference ? (
                <Image
                  src={getGooglePhotoUrl(poi.photoReference)}
                  alt={poi.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg">
              <div className="absolute bottom-0 p-4 text-white">
                <div className="flex items-center space-x-1 text-yellow-400 mb-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{poi.rating}</span>
                </div>
                <h3 className="font-medium mb-1">{poi.name}</h3>
                <div className="flex items-center text-sm text-gray-200">
                  <MapPin className="h-4 w-4 mr-1" />
                  {poi.location}
                </div>
                <div className="flex items-center mt-2 space-x-4 text-sm">
                  <span className="text-gray-200">{poi.category}</span>
                  <span className="flex items-center text-gray-200">
                    <Navigation className="h-4 w-4 mr-1" />
                    {poi.distance}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 