"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BUDGETS, GET_ITINERARIES } from '@/graphql/queries';
import BudgetByDate from './components/BudgetByDate';
import AddBudgetModal from './components/AddBudgetModal';

type Nullable<T> = T | null | undefined;

interface GraphQLBudgetActivity {
  id: number;
  name: string;
  type: string;
}

interface GraphQLBudget {
  id: number;
  itinerary_id: number;
  date: string; // ISO date (YYYY-MM-DD)
  activity_id: Nullable<number>;
  category: string;
  amount: string; // numeric from GraphQL is string in TS runtime
  description: Nullable<string>;
  currency: Nullable<string>;
  created_at: string;
  activity?: Nullable<GraphQLBudgetActivity>;
}

interface BudgetPageProps {
  selectedDay?: number;
}

const BudgetPage: React.FC<BudgetPageProps> = ({ selectedDay = 1 }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [tripBudget, setTripBudget] = useState<number>(0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetValue, setEditBudgetValue] = useState<string>('');

  const { data: itinerariesData, loading: itinerariesLoading } = useQuery(GET_ITINERARIES);
  
  // 最初の旅行プランを自動選択
  const currentItinerary = itinerariesData?.itineraries?.[0];
  const itineraryId = currentItinerary?.id;

  // 選択された日の日付を計算してstateを更新
  useEffect(() => {
    if (currentItinerary && selectedDay) {
      const startDate = new Date(currentItinerary.start_date);
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + selectedDay - 1);
      const dateString = targetDate.toISOString().split('T')[0];
      setSelectedDate(dateString);
    }
  }, [currentItinerary?.start_date, selectedDay]);

  // 旅の予算をlocalStorageから読み込み
  useEffect(() => {
    if (itineraryId) {
      const savedBudget = localStorage.getItem(`trip-budget-${itineraryId}`);
      if (savedBudget) {
        setTripBudget(parseFloat(savedBudget));
      }
    }
  }, [itineraryId]);

  const { data: budgetsData, loading: budgetsLoading, refetch: refetchBudgets } = useQuery(GET_BUDGETS, {
    variables: { itinerary_id: itineraryId },
    skip: !itineraryId,
  });

  // 全予算データ（メモ化）
  const budgets: GraphQLBudget[] = useMemo(() => 
    (budgetsData?.budgets ?? []) as GraphQLBudget[], 
    [budgetsData?.budgets]
  );
  
  // 選択された日の予算のみをフィルタ（メモ化）
  const selectedDayBudgets = useMemo(() =>
    budgets.filter(budget => budget.date === selectedDate),
    [budgets, selectedDate]
  );

  // 選択された日までの累計金額を計算（メモ化）
  const selectedDayTotal: number = useMemo(() => {
    if (!selectedDate) return 0;

    return budgets
      .filter(budget => budget.date <= selectedDate)
      .reduce((sum: number, budget: GraphQLBudget) => {
        return sum + parseFloat(budget.amount);
      }, 0);
  }, [budgets, selectedDate]);

  // 全体の合計金額を計算（メモ化）
  const totalAmount: number = useMemo(() =>
    budgets.reduce((sum: number, budget: GraphQLBudget) => {
      return sum + parseFloat(budget.amount);
    }, 0),
    [budgets]
  );

  // 予算残高を計算（メモ化）
  const budgetBalance: number = useMemo(() =>
    tripBudget - selectedDayTotal,
    [tripBudget, selectedDayTotal]
  );

  // 予算オーバーかどうかを判定（メモ化）
  const isOverBudget: boolean = useMemo(() =>
    budgetBalance < 0,
    [budgetBalance]
  );


  const handleAddBudget = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const onBudgetAdded = useCallback(() => {
    refetchBudgets();
  }, [refetchBudgets]);

  const handleEditBudget = useCallback(() => {
    setEditBudgetValue(tripBudget.toString());
    setIsEditingBudget(true);
  }, [tripBudget]);

  const handleSaveBudget = useCallback(() => {
    const newBudget = parseFloat(editBudgetValue) || 0;
    setTripBudget(newBudget);
    if (itineraryId) {
      localStorage.setItem(`trip-budget-${itineraryId}`, newBudget.toString());
    }
    setIsEditingBudget(false);
  }, [editBudgetValue, itineraryId]);

  const handleCancelEditBudget = useCallback(() => {
    setIsEditingBudget(false);
    setEditBudgetValue('');
  }, []);

  if (itinerariesLoading) {
    return <div className="p-6">読み込み中...</div>;
  }

  if (!currentItinerary) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">旅行プランが見つかりませんでした</h2>
          <p className="text-gray-600">支出を管理するための旅行プランが存在しません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* ヘッダーセクション */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">            
            {/* 統計とボタン */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center lg:text-left">
                  <div className="text-sm text-gray-600 mb-1">本日までの支出</div>
                  <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                    ¥{selectedDayTotal.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center lg:text-left">
                  <div className="text-sm text-gray-600 mb-1">旅の予算</div>
                  {isEditingBudget ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editBudgetValue}
                        onChange={(e) => setEditBudgetValue(e.target.value)}
                        className="text-xl font-semibold border rounded px-2 py-1 w-32"
                        placeholder="予算を入力"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveBudget}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancelEditBudget}
                        className="bg-gray-600 text-white px-2 py-1 rounded text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-semibold text-gray-900">
                        ¥{tripBudget.toLocaleString()}
                      </div>
                      <button
                        onClick={handleEditBudget}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        編集
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center lg:text-left">
                  <div className="text-sm text-gray-600 mb-1">残予算</div>
                  <div className={`text-xl font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverBudget ? '-' : ''}¥{Math.abs(budgetBalance).toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddBudget}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors"
              >
                + 支出を追加
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        {!budgetsLoading && (
          <>
            {selectedDayBudgets.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedDay}日目の支出がありません
                </h3>
                <p className="text-gray-500 mb-6">
                  この日の支出を記録してください
                </p>
                <button
                  onClick={handleAddBudget}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  最初の支出を追加
                </button>
              </div>
            ) : (
              <BudgetByDate
                date={selectedDate}
                budgets={selectedDayBudgets.map(b => ({
                  id: b.id,
                  activity_id: b.activity_id ?? undefined,
                  category: b.category,
                  amount: parseFloat(b.amount),
                  description: b.description ?? undefined,
                  currency: (b.currency ?? 'JPY') as string,
                  activity: b.activity ? {
                    id: b.activity.id,
                    name: b.activity.name,
                    type: b.activity.type,
                  } : undefined,
                }))}
                itineraryId={itineraryId as number}
                onUpdate={onBudgetAdded}
                onAddBudget={handleAddBudget}
              />
            )}
          </>
        )}

        {budgetsLoading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">支出データを読み込み中...</p>
          </div>
        )}

      {/* 支出追加モーダル */}
      {isAddModalOpen && (
        <AddBudgetModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          itineraryId={itineraryId!}
          onBudgetAdded={onBudgetAdded}
          defaultDate={selectedDate}
        />
      )}
      </div>
    </div>
  );
};

export default BudgetPage;