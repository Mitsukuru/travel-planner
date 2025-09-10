"use client";

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BUDGETS, GET_ITINERARIES } from '@/graphql/queries';
import BudgetByDate from './components/BudgetByDate';
import BudgetSummary from './components/BudgetSummary';
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

const BudgetPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: itinerariesData, loading: itinerariesLoading } = useQuery(GET_ITINERARIES);
  
  // 最初の旅行プランを自動選択
  const currentItinerary = itinerariesData?.itineraries?.[0];
  const itineraryId = currentItinerary?.id;

  const { data: budgetsData, loading: budgetsLoading, refetch: refetchBudgets } = useQuery(GET_BUDGETS, {
    variables: { itinerary_id: itineraryId },
    skip: !itineraryId,
  });

  // 日付別にグループ化
  const budgets: GraphQLBudget[] = (budgetsData?.budgets ?? []) as GraphQLBudget[];
  const budgetsByDate: Record<string, GraphQLBudget[]> = budgets.reduce<Record<string, GraphQLBudget[]>>((acc, budget) => {
    const dateKey = budget.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(budget);
    return acc;
  }, {});

  // 合計金額を計算
  const totalAmount: number = budgets.reduce((sum: number, budget: GraphQLBudget) => {
    return sum + parseFloat(budget.amount);
  }, 0);

  // 日付別の合計を計算
  const dailyTotals = Object.keys(budgetsByDate).map(date => ({
    date,
    total: budgetsByDate[date].reduce((sum: number, budget: GraphQLBudget) => sum + parseFloat(budget.amount), 0),
    count: budgetsByDate[date].length
  }));

  const handleAddBudget = () => {
    setIsAddModalOpen(true);
  };

  const onBudgetAdded = () => {
    refetchBudgets();
  };

  if (itinerariesLoading) {
    return <div className="p-6">読み込み中...</div>;
  }

  if (!currentItinerary) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">旅行プランが見つかりませんでした</h2>
          <p className="text-gray-600">予算を管理するための旅行プランが存在しません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">予算管理</h1>
              <p className="text-gray-600 mt-1">
                {currentItinerary.title} ({currentItinerary.destination})
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleAddBudget}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                + 予算を追加
              </button>
              <div className="text-sm text-gray-600">
                合計予算: <span className="font-bold text-lg text-gray-900">¥{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {!budgetsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左側: 日付別予算一覧 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">日付別予算</h2>
                {Object.keys(budgetsByDate).length === 0 ? (
                  <p className="text-gray-500">まだ予算が登録されていません</p>
                ) : (
                  <div className="space-y-4">
                    {Object.keys(budgetsByDate)
                      .sort()
                      .map(date => (
                        <BudgetByDate
                          key={date}
                          date={date}
                          budgets={budgetsByDate[date].map(b => ({
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
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右側: サマリー */}
            <div className="space-y-6">
              <BudgetSummary
                totalAmount={totalAmount}
                dailyTotals={dailyTotals}
                budgets={budgets.map(b => ({
                  category: b.category,
                  amount: parseFloat(b.amount),
                  currency: (b.currency ?? 'JPY') as string,
                }))}
              />
            </div>
          </div>
        )}

        {budgetsLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">予算データを読み込み中...</p>
          </div>
        )}

      {/* 予算追加モーダル */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        itineraryId={itineraryId!}
        onBudgetAdded={onBudgetAdded}
        defaultDate={selectedDate}
      />
      </div>
    </div>
  );
};

export default BudgetPage;