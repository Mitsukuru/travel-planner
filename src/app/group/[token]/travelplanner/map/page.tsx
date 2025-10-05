"use client";

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GoogleMap, useJsApiLoader, Marker, OverlayView, Polyline } from '@react-google-maps/api';
import { GET_ACTIVITIES } from '@/graphql/queries';
import Image from 'next/image';

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

const MapPage = () => {
  const selectedDay = 1; // デフォルト値
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activitiesByDay, setActivitiesByDay] = useState<{[key: number]: Activity[]}>({});
  const [map, setMap] = useState<google.maps.Map | null>(null);

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

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // 選択された日のアクティビティに合わせてマップの表示範囲を調整
  const fitBoundsToActivities = useCallback(() => {
    if (!map || !activitiesByDay[selectedDay] || activitiesByDay[selectedDay].length === 0) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    activitiesByDay[selectedDay].forEach(activity => {
      if (activity.lat && activity.lng) {
        bounds.extend(new window.google.maps.LatLng(activity.lat, activity.lng));
      }
    });

    // アクティビティが1つの場合は適切なズームレベルを設定
    if (activitiesByDay[selectedDay].length === 1) {
      const activity = activitiesByDay[selectedDay][0];
      map.setCenter({ lat: activity.lat!, lng: activity.lng! });
      map.setZoom(15);
    } else {
      // 複数のアクティビティがある場合は全て表示
      map.fitBounds(bounds, 50); // 50px のパディング
    }
  }, [map, selectedDay, activitiesByDay]);

  // selectedDayまたはactivitiesByDayが変更された時にfitBoundsを実行
  useEffect(() => {
    if (map && activitiesByDay[selectedDay]) {
      // 少し遅延させてマーカーが描画されてから実行
      setTimeout(() => {
        fitBoundsToActivities();
      }, 100);
    }
  }, [selectedDay, activitiesByDay, fitBoundsToActivities, map]);

  const handleMarkerClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };


  // アクティビティタイプに基づくマーカーの色を取得
  const getMarkerColor = (type: string) => {
    const colors: {[key: string]: string} = {
      'transport': '#3B82F6', // 青
      'sightseeing': '#10B981', // 緑
      'restaurant': '#F59E0B', // オレンジ
      'hotel': '#8B5CF6', // 紫
      'activity': '#EF4444', // 赤
      'area': '#6B7280', // グレー
    };
    return colors[type] || '#6B7280';
  };

  // 番号付きマーカーのSVGアイコンを生成
  const createNumberedMarkerIcon = (number: number, type: string) => {
    const color = getMarkerColor(type);
    const svg = `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="15" r="12" fill="white"/>
        <text x="15" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${color}">${number}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
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
            center={defaultCenter}
            zoom={10}
            onLoad={onLoad}
          >
            {/* 順番でソートされたアクティビティのマーカー */}
            {activitiesByDay[selectedDay]
              ?.sort((a, b) => a.time.localeCompare(b.time))
              .map((activity, index) => (
                <Marker
                  key={activity.id}
                  position={{ lat: activity.lat!, lng: activity.lng! }}
                  onClick={() => handleMarkerClick(activity)}
                  title={`${index + 1}. ${activity.name} (${activity.time})`}
                  icon={createNumberedMarkerIcon(index + 1, activity.type)}
                />
              ))}

            {/* アクティビティ間の移動ルート */}
            {activitiesByDay[selectedDay] && activitiesByDay[selectedDay].length > 1 && (
              <Polyline
                path={activitiesByDay[selectedDay]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(activity => ({ lat: activity.lat!, lng: activity.lng! }))}
                options={{
                  strokeColor: '#4285F4',
                  strokeOpacity: 0.8,
                  strokeWeight: 3,
                  geodesic: true
                }}
              />
            )}

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
                    <div className="flex items-center mb-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2"
                        style={{ backgroundColor: getMarkerColor(selectedActivity.type) }}
                      >
                        {activitiesByDay[selectedDay]
                          ?.sort((a, b) => a.time.localeCompare(b.time))
                          .findIndex(activity => activity.id === selectedActivity.id) + 1}
                      </div>
                      <h3 className="font-bold text-lg pr-6">{selectedActivity.name}</h3>
                    </div>
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
                      <Image
                        src={selectedActivity.photo_url}
                        alt={selectedActivity.name}
                        width={400}
                        height={128}
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