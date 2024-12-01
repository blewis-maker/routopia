import React, { useEffect, useRef } from 'react';
import { Marker, Popup } from 'mapbox-gl';
import { PlaceDetails } from '@/services/location/GeocodingService';
import { useMap } from '@/hooks/useMap';
import { PlaceDetailsService } from '@/services/location/PlaceDetailsService';
import PlaceReviews from '../places/PlaceReviews';
import ReactDOMServer from 'react-dom/server';

interface POIMarkersProps {
  places: PlaceDetails[];
  onMarkerClick?: (place: PlaceDetails) => void;
  selectedPlace?: PlaceDetails | null;
}

const POIMarkers: React.FC<POIMarkersProps> = ({
  places,
  onMarkerClick,
  selectedPlace
}) => {
  const { map } = useMap();
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const popupRef = useRef<Popup | null>(null);
  const placeDetailsService = new PlaceDetailsService();

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new markers
    places.forEach(place => {
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.innerHTML = `
        <div class="marker-icon ${place.type || 'default'}">
          ${getMarkerIcon(place.type)}
        </div>
      `;

      const marker = new Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([place.coordinates.lng, place.coordinates.lat])
        .addTo(map);

      // Add click handler
      marker.getElement().addEventListener('click', () => {
        onMarkerClick?.(place);
        showPopup(place, marker);
      });

      markersRef.current.set(place.placeId, marker);
    });

    // Show popup for selected place
    if (selectedPlace) {
      const marker = markersRef.current.get(selectedPlace.placeId);
      if (marker) {
        showPopup(selectedPlace, marker);
      }
    }

    return () => {
      // Cleanup
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      popupRef.current?.remove();
    };
  }, [map, places, selectedPlace]);

  const showPopup = async (place: PlaceDetails, marker: Marker) => {
    // Remove existing popup
    popupRef.current?.remove();

    // Fetch additional details
    const details = await placeDetailsService.getPlaceDetails(place.placeId);
    const reviews = await placeDetailsService.getPlaceReviews(place.placeId, 3);

    // Create enhanced popup content
    const popupContent = `
      <div class="poi-popup-content">
        <h3>${place.name}</h3>
        ${details.rating ? `
          <div class="rating">
            ${details.rating} ⭐ (${details.userRatingsTotal})
          </div>
        ` : ''}
        ${place.businessHours?.[0]?.isOpen ? 
          '<span class="open">Open Now</span>' : 
          '<span class="closed">Closed</span>'
        }
        <div class="address">${place.address}</div>
        ${details.photos?.[0] ? `
          <img src="${details.photos[0].url}" alt="${place.name}" />
        ` : ''}
        ${reviews.length ? `
          <div class="reviews-section">
            ${ReactDOMServer.renderToString(<PlaceReviews reviews={reviews} />)}
          </div>
        ` : ''}
      </div>
    `;

    // Create new popup
    popupRef.current = new Popup({
      offset: 25,
      closeButton: true,
      className: 'poi-popup'
    })
      .setLngLat([place.coordinates.lng, place.coordinates.lat])
      .setHTML(popupContent)
      .addTo(map!);
  };

  const getMarkerIcon = (type?: string) => {
    // Return appropriate SVG based on place type
    switch (type) {
      case 'restaurant':
        return '<svg>...</svg>'; // Restaurant icon
      case 'hotel':
        return '<svg>...</svg>'; // Hotel icon
      // Add more types as needed
      default:
        return '<svg>...</svg>'; // Default icon
    }
  };

  return null; // Markers are added directly to the map
};

export default POIMarkers; 