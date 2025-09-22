"use client";

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
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
  width: '100%',
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

  // アクティビティタイプの日本語表示
  const getTypeLabel = (type: string) => {
    const typeLabels: {[key: string]: string} = {
      'transport': '交通',
      'sightseeing': '観光スポット',
      'restaurant': '飲食店',
      'hotel': 'ホテル',
      'activity': 'アクティビティ',
      'area': 'エリア',
    };
    return typeLabels[type] || type;
  };

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error loading activities: {error.message}</div>;

  return (
    <div className="w-full h-full">
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
              <OverlayView
                position={{ lat: selectedActivity.lat!, lng: selectedActivity.lng! }}
                mapPaneName='overlayMouseTarget'
              >
                <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs min-w-64 transform -translate-x-1/2 -translate-y-full mb-2">
                  {/* 閉じるボタン */}
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="absolute top-2 right-2 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm z-10"
                  >
                    ×
                  </button>

                  {/* コンテンツ */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg pr-8 mb-2">{selectedActivity.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedActivity.location}</p>

                    <div className="space-y-1 mb-3">
                      <p className="text-sm">
                        <span className="font-medium">時間:</span> {selectedActivity.time}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">タイプ:</span> {getTypeLabel(selectedActivity.type)}
                      </p>
                    </div>

                    {selectedActivity.notes && (
                      <p className="text-sm text-gray-700 mb-3">{selectedActivity.notes}</p>
                    )}

                    {selectedActivity.photo_url && (
                      <img
                        src={selectedActivity.photo_url}
                        alt={selectedActivity.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>

                  {/* 吹き出しの三角形 */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white filter drop-shadow-sm"></div>
                  </div>
                </div>
              </OverlayView>
            )}
          </GoogleMap>
        ) : <div>Loading map...</div>}
      </div>
    </div>
  );
}

export default MapPage;