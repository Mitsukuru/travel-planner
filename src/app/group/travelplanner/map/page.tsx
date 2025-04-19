"use client";

import { useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MapPage = () => {
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
      });

      const google = await loader.load();
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: { lat: 35.0116, lng: 135.7681 }, // 京都の座標
        zoom: 12,
      });
    };

    initMap();
  }, []);

  return (
    <div className="w-full h-screen">
      <div id="map" className="w-full h-full"></div>
    </div>
  );
}

export default MapPage;