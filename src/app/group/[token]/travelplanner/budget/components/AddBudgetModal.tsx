import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { INSERT_BUDGET } from '@/graphql/mutates';
import { GET_ACTIVITIES_BY_DATE, GET_ITINERARIES } from '@/graphql/queries';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: number;
  onBudgetAdded: () => void;
  defaultDate?: string;
}

const budgetCategories = [
  { label: '交通費', value: 'transport' },
  { label: '宿泊費', value: 'accommodation' },
  { label: '食事', value: 'food' },
  { label: '観光・アクティビティ', value: 'sightseeing' },
  { label: 'お土産', value: 'shopping' },
  { label: 'その他', value: 'other' },
];

// アクティビティタイプの日本語マッピング
const activityTypeLabels: { [key: string]: string } = {
  transport: '交通',
  sightseeing: '観光スポット',
  restaurant: '飲食店',
  hotel: 'ホテル',
  activity: 'アクティビティ',
  area: 'エリア',
};

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  itineraryId,
  onBudgetAdded,
  defaultDate = ''
}) => {
  const [formData, setFormData] = useState({
    dayNumber: 1,
    activityId: '',
    category: budgetCategories[0].value,
    amount: '',
    description: '',
    currency: 'JPY'
  });

  // 旅行プラン情報を取得
  const { data: itinerariesData } = useQuery(GET_ITINERARIES);
  const currentItinerary = itinerariesData?.itineraries?.[0];
  
  // 旅行の日程計算
  const startDate = currentItinerary ? new Date(currentItinerary.start_date) : null;
  const endDate = currentItinerary ? new Date(currentItinerary.end_date) : null;
  const totalDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;

  // 日程から日付を取得
  const getDayDate = (dayNumber: number): string => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date.toISOString().split('T')[0];
  };

  // 選択された日程の日付
  const selectedDate = getDayDate(formData.dayNumber);

  const { data: activitiesData } = useQuery(GET_ACTIVITIES_BY_DATE, {
    variables: { 
      itinerary_id: itineraryId,
      date: selectedDate 
    },
    skip: !selectedDate || !itineraryId,
  });

  const [insertBudget, { loading: isSubmitting }] = useMutation(INSERT_BUDGET);

  useEffect(() => {
    // デフォルトの日付から日程を計算
    if (defaultDate && startDate) {
      const defaultDateObj = new Date(defaultDate);
      const diffTime = defaultDateObj.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays >= 1 && diffDays <= totalDays) {
        setFormData(prev => ({ ...prev, dayNumber: diffDays }));
      }
    }
  }, [defaultDate, startDate, totalDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount) {
      alert('金額は必須です');
      return;
    }

    try {
      await insertBudget({
        variables: {
          itinerary_id: itineraryId,
          date: selectedDate,
          activity_id: formData.activityId ? parseInt(formData.activityId) : null,
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description,
          currency: formData.currency,
        },
      });

      onBudgetAdded();
      onClose();
      setFormData({
        dayNumber: 1,
        activityId: '',
        category: budgetCategories[0].value,
        amount: '',
        description: '',
        currency: 'JPY'
      });
    } catch (error) {
      console.error('予算の追加に失敗しました:', error);
      alert('予算の追加に失敗しました');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'dayNumber') {
      setFormData(prev => ({ ...prev, [field]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (!isOpen) return null;

  // 日程選択肢を生成
  const dayOptions = Array.from({ length: totalDays }, (_, i) => {
    const dayNumber = i + 1;
    const dayDate = getDayDate(dayNumber);
    const formattedDate = new Date(dayDate + 'T00:00:00').toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
    return {
      value: dayNumber,
      label: `${dayNumber}日目 (${formattedDate})`
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">予算を追加</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 日程選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              日程 <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.dayNumber}
              onChange={(e) => handleInputChange('dayNumber', e.target.value)}
              required
            >
              {dayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* アクティビティ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              関連するアクティビティ（任意）
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.activityId}
              onChange={(e) => handleInputChange('activityId', e.target.value)}
            >
              <option value="">アクティビティを選択（任意）</option>
              {activitiesData?.activities?.map((activity: any) => {
                const typeLabel = activity.type 
                  ? (activityTypeLabels[activity.type] || activity.type)
                  : '未分類';
                return (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} ({typeLabel})
                  </option>
                );
              })}
            </select>
            {selectedDate && activitiesData?.activities?.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                この日のアクティビティはありません
              </p>
            )}
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            >
              {budgetCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              金額 <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="number"
                step="0.01"
                min="0"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
              <select
                className="border border-l-0 border-gray-300 rounded-r-md px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
              >
                <option value="JPY">¥ JPY</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明（任意）
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="支出の詳細..."
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;