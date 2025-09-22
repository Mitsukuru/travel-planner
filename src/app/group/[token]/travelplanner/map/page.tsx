"use client";

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { GET_ACTIVITIES } from '@/graphql/queries';

interface Activity {
  id: number;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  type: string;
  date: string;
  time: string;
  notes?: string;
  photo_url?: string;
}

const containerStyle = {
  width: 'auto',
  height: '100%'
};

const defaultCenter = {
  lat: 35.6762, // 東京の緯度
  lng: 139.6503 // 東京の経度
};

interface MapPageProps {
  selectedDay?: number;
}

const MapPage: React.FC<MapPageProps> = ({ selectedDay = 1 }) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activitiesByDay, setActivitiesByDay] = useState<{[key: number]: Activity[]}>({});

  const { data: activitiesData, loading, error } = useQuery(GET_ACTIVITIES);

  // アクティビティデータを日付別に整理
  useEffect(() => {
    if (activitiesData?.activities) {
      const grouped: {[key: number]: Activity[]} = {};

      activitiesData.activities.forEach((activity: Activity) => {
        // 日付から日数を計算（簡単のため、最初の日から何日目かを計算）
        const activityDate = new Date(activity.date);
        const firstDate = new Date(Math.min(...activitiesData.activities.map((a: Activity) => new Date(a.date).getTime())));
        const dayNumber = Math.floor((activityDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (!grouped[dayNumber]) {
          grouped[dayNumber] = [];
        }

        // 緯度・経度がある場合のみ追加
        if (activity.lat && activity.lng) {
          grouped[dayNumber].push(activity);
        }
      });

      setActivitiesByDay(grouped);
    }
  }, [activitiesData]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places']
  });

  const onLoad = useCallback(() => {
    // マップの初期設定をここで行えます
  }, []);

  const handleMarkerClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  // 選択された日のアクティビティの中心座標を計算
  const getMapCenter = () => {
    const dayActivities = activitiesByDay[selectedDay];
    if (!dayActivities || dayActivities.length === 0) {
      return defaultCenter;
    }

    const avgLat = dayActivities.reduce((sum, activity) => sum + (activity.lat || 0), 0) / dayActivities.length;
    const avgLng = dayActivities.reduce((sum, activity) => sum + (activity.lng || 0), 0) / dayActivities.length;

    return { lat: avgLat, lng: avgLng };
  };

  // アクティビティタイプに基づくマーカーの色を取得
  const getMarkerIcon = (type: string) => {
    const icons: {[key: string]: string} = {
      'transport': '#3B82F6', // 青
      'sightseeing': '#10B981', // 緑
      'restaurant': '#F59E0B', // オレンジ
      'hotel': '#8B5CF6', // 紫
      'activity': '#EF4444', // 赤
      'area': '#6B7280', // グレー
    };

    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: icons[type] || '#6B7280',
      fillOpacity: 1,
      stroke: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
    };
  };

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error loading activities: {error.message}</div>;

  return (
    <div className="w-full h-screen">
      {/* マップ */}
      <div className="w-full h-full">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={getMapCenter()}
            zoom={13}
            onLoad={onLoad}
          >
            {activitiesByDay[selectedDay]?.map(activity => (
              <Marker
                key={activity.id}
                position={{ lat: activity.lat!, lng: activity.lng! }}
                onClick={() => handleMarkerClick(activity)}
                title={activity.name}
                icon={getMarkerIcon(activity.type)}
              />
            ))}

            {selectedActivity && (
              <InfoWindow
                position={{ lat: selectedActivity.lat!, lng: selectedActivity.lng! }}
                onCloseClick={() => setSelectedActivity(null)}
              >
                <div className="max-w-xs">
                  <h3 className="font-bold text-lg">{selectedActivity.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedActivity.location}</p>
                  <p className="text-sm"><span className="font-medium">Time:</span> {selectedActivity.time}</p>
                  <p className="text-sm"><span className="font-medium">Type:</span> {selectedActivity.type}</p>
                  {selectedActivity.notes && (
                    <p className="text-sm mt-2">{selectedActivity.notes}</p>
                  )}
                  {selectedActivity.photo_url && (
                    <img
                      src={selectedActivity.photo_url}
                      alt={selectedActivity.name}
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : <div>Loading map...</div>}
      </div>
    </div>
  );
}

export default MapPage;