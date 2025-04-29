"use client";

import { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface Place {
  id: number;
  name: string;
  lat: number;
  lng: number;
  details: string;
}

const containerStyle = {
  width: 'auto',
  height: '100%'
};

const center = {
  lat: 35.6762, // 東京の緯度
  lng: 139.6503 // 東京の経度
};

// サンプルデータ（実際のデータに置き換えてください）
const sampleLocations = [
  {
    day: 1,
    places: [
      {
        id: 1,
        name: '東京スカイツリー',
        lat: 35.7100,
        lng: 139.8107,
        details: '高さ634mの電波塔。展望台からの眺めが素晴らしい。'
      },
      {
        id: 2,
        name: '浅草寺',
        lat: 35.7147,
        lng: 139.7966,
        details: '東京都内最古の寺院。雷門と仲見世通りが有名。'
      }
    ]
  },
  // 他の日のデータも同様に追加できます
];

const MapPage = () => {
  const [selectedDay] = useState(1);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const onLoad = useCallback(() => {
    // マップの初期設定をここで行えます
  }, []);

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
  };

  return (
    <div className="w-full h-screen">
      <div className="w-full h-[calc(100vh-4rem)]">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
          >
            {sampleLocations
              .find(location => location.day === selectedDay)
              ?.places.map(place => (
                <Marker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => handleMarkerClick(place)}
                />
              ))}
            
            {selectedPlace && (
              <InfoWindow
                position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div>
                  <h3 className="font-bold">{selectedPlace.name}</h3>
                  <p>{selectedPlace.details}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default MapPage;