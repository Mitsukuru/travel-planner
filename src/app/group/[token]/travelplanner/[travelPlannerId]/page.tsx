"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Link from "next/link";
import Image from "next/image";
import MapPage from "../map/page";
import BudgetPage from "../budget/page";
import { GET_ITINERARIES, GET_ACTIVITIES } from "@/graphql/queries";
import { UPDATE_ACTIVITY, DELETE_ACTIVITY } from "@/graphql/mutates";
import {
  MapPin,
  ThumbsUp,
  Clock3,
  Coffee,
  Camera,
  Navigation,
  Map as MapIcon,
  Utensils,
  Hotel,
  Sunrise,
  Globe,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  Star,
  Tag,
  Search,
  Filter,
} from "lucide-react";
import AddActivityModal from "../components/AddActivityModal";

interface TripInfo {
  destination: string;
  startDate: string;
  endDate: string;
  participants: string[];
  days: number;
}

interface Activity {
  id?: number;
  time: string;
  type: string;
  name: string;
  notes?: string;
  date:  Date;
}

interface DayPlan {
  day: number;
  activities: Activity[];
}

interface Suggestion {
  type: string;
  name: string;
  photo: string;
  rating: number;
  distance?: string;
  price?: string;
  visitTime?: string;
  bestTime?: string;
  description: string;
  tags?: string[];
}

export default function TravelPlanner() {
  const { data: itinerariesData, loading, error } = useQuery(GET_ITINERARIES);
  const { data: activitiesData, refetch: refetchActivities } = useQuery(GET_ACTIVITIES);
  const [updateActivity] = useMutation(UPDATE_ACTIVITY);
  const [deleteActivity] = useMutation(DELETE_ACTIVITY);

  const [activeTab, setActiveTab] = useState("plan");
  const [selectedDay, setSelectedDay] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recommendationType, setRecommendationType] = useState("nearby");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentActivity] = useState<Activity | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [localActivities] = useState<Activity[]>([]);
  const [isMobileParticipantsOpen, setIsMobileParticipantsOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{time: string, name: string, notes: string}>({time: '', name: '', notes: ''});
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("GraphQL Error Details:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
          <p>{error.message}</p>
          <p className="mt-4">
            <Link href="/group" className="text-blue-600 hover:underline">
              グループ一覧に戻る
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (!itinerariesData?.itineraries?.[0]) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            旅行プランが見つかりませんでした
          </h2>
          <p className="text-gray-600 mb-4">
            指定されたトークンに対応する旅行プランは存在しません。
          </p>
          <p>
            <Link href="/group" className="text-blue-600 hover:underline">
              グループ一覧に戻る
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const travelPlan = itinerariesData.itineraries[0];
  const startDate: Date = new Date(travelPlan.start_date);
  const endDate: Date = new Date(travelPlan.end_date);
  const termDay = Math.ceil((endDate.getTime() - startDate.getTime() + 1) / 86400000);

  const tripInfo: TripInfo = {
    destination: travelPlan.destination,
    startDate: travelPlan.start_date,
    endDate: travelPlan.end_date,
    participants: ["まさあき", "たまよ", "こうすけ", "るり"],
    days: termDay,
  };

  // AIおすすめカテゴリとデータ
  const aiRecommendationCategories = [
    { id: "nearby", name: "近くのスポット", icon: <MapPin size={16} /> },
    { id: "popular", name: "人気スポット", icon: <ThumbsUp size={16} /> },
    { id: "timeframe", name: "時間帯にぴったり", icon: <Clock3 size={16} /> },
    { id: "local", name: "地元の穴場", icon: <Coffee size={16} /> },
    { id: "photo", name: "写真映えスポット", icon: <Camera size={16} /> },
  ];

  // 何日目か計算
  const day = (date: string | Date) => {
    const targetDate = new Date(date);
    const start = new Date(travelPlan.start_date);
    // 1日目を1としてカウント
    const diff =
      Math.floor(
        (targetDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    // 範囲外の場合の調整
    if (diff < 1) return 1;
    if (diff > termDay) return termDay;
    return diff;
  };

  // 旅行日数分の空配列を用意
  const groupedActivities: DayPlan[] = Array.from({ length: tripInfo.days }, (_, i) => ({
    day: i + 1,
    activities: [],
  }));

  if (activitiesData?.activities) {
    activitiesData.activities.forEach((activity: Activity) => {
      const d = day(activity.date);
      if (groupedActivities[d - 1]) {
        groupedActivities[d - 1].activities.push({
          id: activity.id,
          time: activity.time,
          type: activity.type,
          name: activity.name,
          notes: activity.notes,
          date: activity.date,
        });
      }
    });
  }

  const activities: DayPlan[] = groupedActivities;

  // アクティビティタイプに応じたアイコン取得
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "transport":
        return <Navigation className="text-blue-500" size={16} />;
      case "sightseeing":
        return <MapIcon className="text-green-500" size={16} />;
      case "restaurant":
        return <Utensils className="text-orange-500" size={16} />;
      case "hotel":
        return <Hotel className="text-purple-500" size={16} />;
      case "activity":
        return <Sunrise className="text-yellow-500" size={16} />;
      case "area":
        return <Globe className="text-indigo-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  // 時間フォーマット関数（HH:MM:SS -> HH:MM）
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM:SS から HH:MM を取得
  };

  // 編集開始
  const startEditActivity = (index: number, activity: Activity) => {
    setEditingActivity(index);
    setEditForm({
      time: formatTime(activity.time),
      name: activity.name,
      notes: activity.notes || ''
    });
  };

  // 編集保存
  const saveActivityEdit = async () => {
    try {
      const selectedDayActivities = activities.find((day) => day.day === selectedDay)?.activities || [];
      const currentActivity = selectedDayActivities.concat(
        localActivities.filter(a => day(a.date) === selectedDay)
      )
      .sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      })[editingActivity!];

      if (currentActivity?.id) {
        await updateActivity({
          variables: {
            id: currentActivity.id,
            name: editForm.name,
            notes: editForm.notes,
            time: editForm.time + ':00' // HH:MM to HH:MM:SS
          }
        });

        // データを再取得
        await refetchActivities();

        setEditingActivity(null);
        setEditForm({time: '', name: '', notes: ''});
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('アクティビティの更新に失敗しました');
    }
  };

  // 編集キャンセル
  const cancelActivityEdit = () => {
    setEditingActivity(null);
    setEditForm({time: '', name: '', notes: ''});
  };

  // アクティビティ削除
  const handleDeleteActivity = async (index: number) => {
    try {
      const selectedDayActivities = activities.find((day) => day.day === selectedDay)?.activities || [];
      const currentActivity = selectedDayActivities.concat(
        localActivities.filter(a => day(a.date) === selectedDay)
      )
      .sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      })[index];

      if (currentActivity?.id && confirm('このアクティビティを削除しますか？')) {
        await deleteActivity({
          variables: {
            id: currentActivity.id
          }
        });

        // データを再取得
        await refetchActivities();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('アクティビティの削除に失敗しました');
    }
  };

  // おすすめ情報の取得（サンプル）
  const getRecommendations = (): Suggestion[] => {
    return [
      {
        type: "sightseeing",
        name: "金閣寺",
        photo: "/images/hawai.jpg",
        rating: 4.8,
        distance: "2.5km",
        price: "¥400",
        visitTime: "1時間",
        description: "京都を代表する金色の寺院。美しい庭園と池の景色が魅力。",
        tags: ["世界遺産", "寺院", "庭園"],
      },
    ];
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* タブナビゲーション */}
      <nav className="bg-white border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center">
          {/* ロゴ部分 */}
          <div className="flex items-center px-4 py-2 sm:py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/header_logo-removebg-preview.png"
                alt="ヘッダー画像"
                width={80}
                height={60}
                className="img-header h-8 w-auto sm:h-10"
              />
            </Link>
          </div>

          {/* タブボタン部分 */}
          <div className="flex overflow-x-auto sm:flex-1 px-4 sm:px-0">
            <div className="flex space-x-2 sm:space-x-0 min-w-full sm:min-w-0">
              <button
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 font-bold text-sm sm:text-base ${
                  activeTab === "plan"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("plan")}
              >
                旅行プラン
              </button>
              <button
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 font-bold text-sm sm:text-base ${
                  activeTab === "map"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("map")}
              >
                マップ
              </button>
              <button
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 font-bold text-sm sm:text-base ${
                  activeTab === "budget"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("budget")}
              >
                予算
              </button>
              <button
                className={`flex-shrink-0 px-3 py-2 sm:px-4 sm:py-3 font-bold text-sm sm:text-base ${
                  activeTab === "settings"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                設定
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* モバイル用日程選択 */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
          {/* モバイル用日程タブ */}
          <div className="px-4 py-3">
            <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex space-x-3 min-w-full">
                {Array.from({ length: tripInfo.days }, (_, i) => {
                  const dayNumber = i + 1;
                  const dayDate = new Date(startDate);
                  dayDate.setDate(dayDate.getDate() + i);
                  const formattedDate = dayDate.toLocaleDateString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric'
                  });

                  return (
                    <button
                      key={i}
                      className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedDay === dayNumber
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedDay(dayNumber)}
                    >
                      {dayNumber}日目 {formattedDate}日
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* モバイル用参加者メニュー */}
          {isMobileParticipantsOpen && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileParticipantsOpen(false)} />
              <div className="absolute top-[64px] right-4 w-64 bg-white border border-gray-200 shadow-lg rounded-lg">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">参加者</h3>
                  <div className="space-y-2">
                    {tripInfo.participants.map((person, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {person}
                      </div>
                    ))}
                    <button className="text-blue-600 text-sm flex items-center mt-2">
                      + 参加者を追加
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* デスクトップ用サイドバー */}
          <div className="hidden lg:block w-48 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h2 className="font-semibold text-gray-700 mb-2">日程</h2>
              <div className="space-y-1">
                {Array.from({ length: tripInfo.days }, (_, i) => {
                  const dayNumber = i + 1;
                  const dayDate = new Date(startDate);
                  dayDate.setDate(dayDate.getDate() + i);
                  const formattedDate = dayDate.toLocaleDateString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric'
                  });
                  
                  return (
                    <button
                      key={i}
                      className={`w-full text-left px-3 py-2 rounded-md ${
                        selectedDay === dayNumber
                          ? "bg-blue-100 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedDay(dayNumber)}
                    >
                      <div className="font-medium">
                        {dayNumber}日目 {formattedDate}日
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <h2 className="font-semibold text-gray-700 mb-2">参加者</h2>
              <div className="space-y-2">
                {tripInfo.participants.map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {person}
                  </div>
                ))}
                <button className="text-blue-600 text-sm flex items-center mt-2">
                  + 参加者を追加
                </button>
              </div>
            </div>
          </div>
          {activeTab === "map" ? (
            <MapPage />
          ) : activeTab === "budget" ? (
            <BudgetPage selectedDay={selectedDay} />
          ) : (
            <>
              {/* メインエリア：日程詳細 */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 lg:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 hidden lg:block">
                      {selectedDay}日目
                    </h2>
                  </div>

                  {/* タイムライン */}
                  <div className="space-y-4 lg:space-y-6">
                    {activities.find((day) => day.day === selectedDay)?.activities.concat(
                      localActivities.filter(a => day(a.date) === selectedDay)
                    )
                    .sort((a, b) => {
                      const timeA = a.time.split(':').map(Number);
                      const timeB = b.time.split(':').map(Number);
                      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                    })
                    .map((activity, index) => (
                      <div key={index} className="flex group">
                        {/* 時間列 */}
                        <div className="w-20 pt-1 text-right pr-4 text-gray-500 font-medium">
                          {editingActivity === index ? (
                            <input
                              type="time"
                              value={editForm.time}
                              onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                              className="w-full text-sm border border-gray-300 rounded px-1 py-1"
                            />
                          ) : (
                            formatTime(activity.time)
                          )}
                        </div>

                        {/* タイムラインの縦線 */}
                        <div className="relative flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 aspect-square flex-shrink-0"></div>
                          {index <
                            (activities.find((day) => day.day === selectedDay)?.activities?.length ?? 0) -
                            1 && (
                            <div className="w-px bg-gray-300 h-full"></div>
                          )}
                        </div>

                        {/* 内容 */}
                        <div className="ml-4 bg-white rounded-lg border border-gray-200 p-4 flex-1 shadow-sm group-hover:shadow">
                          {editingActivity === index ? (
                            <div className="space-y-3">
                              <div className="flex items-start">
                                <div className="mr-3 pt-1">
                                  {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full font-medium text-gray-800 border border-gray-300 rounded px-2 py-1"
                                    placeholder="アクティビティ名"
                                  />
                                  <textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                    className="w-full text-gray-600 text-sm border border-gray-300 rounded px-2 py-1 resize-none"
                                    rows={2}
                                    placeholder="メモ"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={cancelActivityEdit}
                                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  キャンセル
                                </button>
                                <button
                                  onClick={saveActivityEdit}
                                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between">
                              <div className="flex items-start">
                                <div className="mr-3">
                                  {getActivityIcon(activity.type)}
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-800">
                                    {activity.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {activity.notes}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditActivity(index, activity)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="編集"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(index)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  title="削除"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* アクティビティ追加ボタン */}
                    <div className="flex">
                      <div className="w-20"></div>
                      <div className="relative flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      </div>
                      <button
                        className="ml-4 border border-dashed border-gray-300 rounded-lg p-4 flex-1 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                        onClick={() => setAddModalOpen(true)}
                      >
                        <span className="text-blue-600">
                          + アクティビティを追加
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* サイドバー開閉ボタン */}
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-l-md shadow-md hidden sm:block"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>

              {/* 右サイドバー：AIおすすめ - 開閉可能 */}
              <div
                className={`${
                  sidebarOpen ? "w-90" : "w-0"
                } bg-white border-l border-gray-200 overflow-y-auto transition-all duration-300 hidden sm:block`}
              >
                {sidebarOpen && (
                  <div className="p-4">
                    <h2 className="font-semibold text-gray-700 mb-2">
                      AIおすすめ
                    </h2>

                    {/* 現在の場所コンテキスト */}
                    {currentActivity && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">
                            {currentActivity.name}
                          </span>{" "}
                          周辺のおすすめです
                        </p>
                      </div>
                    )}

                    {/* 検索バー */}
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="場所やキーワードを検索..."
                          className="w-full border border-gray-300 rounded-md py-2 pl-8 pr-2 text-sm"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* AIおすすめカテゴリ */}
                    <div
                      className="mb-4 overflow-x-auto"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <div className="flex space-x-2">
                        {aiRecommendationCategories.map((category) => (
                          <button
                            key={category.id}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${
                              recommendationType === category.id
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setRecommendationType(category.id)}
                          >
                            <span className="mr-1">{category.icon}</span>
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AIフィルター */}
                    <div className="mb-4 flex items-center text-sm">
                      <Filter className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-gray-700 mr-2">フィルター:</span>
                      <select className="border border-gray-300 rounded px-2 py-1 text-xs">
                        <option>すべてのタイプ</option>
                        <option>観光スポット</option>
                        <option>飲食店</option>
                        <option>アクティビティ</option>
                      </select>
                      <button className="ml-auto text-blue-600 text-xs">
                        AI分析
                      </button>
                    </div>

                    {/* おすすめリスト */}
                    <div className="space-y-4">
                      {getRecommendations().map((suggestion, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow cursor-pointer transition-all"
                        >
                          <div className="flex">
                            {/* サムネイル画像 */}
                            <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0 mr-3">
                              <Image
                                src={suggestion.photo}
                                alt={suggestion.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-800 flex items-center">
                                    {getActivityIcon(suggestion.type)}
                                    <span className="ml-1">
                                      {suggestion.name}
                                    </span>
                                  </h3>
                                  <div className="flex items-center mt-1">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    <span className="text-xs text-gray-600 ml-1">
                                      {suggestion.rating}
                                    </span>

                                    {suggestion.distance && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        • {suggestion.distance}
                                      </span>
                                    )}

                                    {suggestion.price && (
                                      <span className="text-xs text-gray-600 ml-2">
                                        {suggestion.price}
                                      </span>
                                    )}

                                    {suggestion.visitTime && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        • {suggestion.visitTime}
                                      </span>
                                    )}

                                    {suggestion.bestTime && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        • {suggestion.bestTime}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  追加
                                </button>
                              </div>

                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {suggestion.description}
                              </p>

                              {/* タグ */}
                              {suggestion.tags && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {suggestion.tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                                    >
                                      <Tag className="w-2 h-2 mr-1" />
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* AIパーソナライズド提案 */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                        <span className="mr-2">✨</span>
                        あなただけのAI提案
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        現在の旅程分析から、以下のプランをおすすめします：
                      </p>
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="font-medium text-gray-800">
                          嵐山&rarr;金閣寺&rarr;銀閣寺コース
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          効率的な移動で京都の名所を網羅できるルートです。所要時間は約6時間です。
                        </p>
                        <button className="mt-2 w-full bg-blue-100 text-blue-700 text-xs font-medium py-1 rounded">
                          詳細を見る
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <AddActivityModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        itinerary_id={travelPlan.id}
        defaultDate={travelPlan.start_date}
      />
    </div>
  );
}
