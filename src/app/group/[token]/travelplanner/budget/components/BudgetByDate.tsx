import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_BUDGET } from '@/graphql/mutates';
import EditBudgetModal from './EditBudgetModal';

interface Budget {
  id: number;
  activity_id?: number;
  category: string;
  amount: number;
  description?: string;
  currency: string;
  activity?: {
    id: number;
    name: string;
    type: string;
  };
}

interface BudgetByDateProps {
  date: string;
  budgets: Budget[];
  itineraryId: number;
  onUpdate: () => void;
}

const categoryLabels: { [key: string]: string } = {
  transport: '交通費',
  accommodation: '宿泊費', 
  food: '食事',
  sightseeing: '観光・アクティビティ',
  shopping: 'お土産',
  other: 'その他',
};

const categoryColors: { [key: string]: string } = {
  transport: 'bg-blue-100 text-blue-800',
  accommodation: 'bg-purple-100 text-purple-800',
  food: 'bg-green-100 text-green-800',
  sightseeing: 'bg-yellow-100 text-yellow-800',
  shopping: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
};

const BudgetByDate: React.FC<BudgetByDateProps> = ({
  date,
  budgets,
  itineraryId,
  onUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  const [deleteBudget] = useMutation(DELETE_BUDGET);

  const totalAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  const handleDelete = async (budgetId: number) => {
    if (!confirm('この予算項目を削除しますか？')) {
      return;
    }

    try {
      await deleteBudget({
        variables: { id: budgetId }
      });
      onUpdate();
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      JPY: '¥',
      USD: '$',
      EUR: '€',
    };
    return `${currencySymbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div
        className="bg-gray-50 px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <h3 className="font-medium text-gray-900">{formattedDate}</h3>
            <span className="text-sm text-gray-500">
              {budgets.length}件
            </span>
          </div>
          <div className="font-semibold text-gray-900">
            ¥{totalAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 予算項目一覧 */}
      {isExpanded && (
        <div className="divide-y divide-gray-200">
          {budgets.map((budget) => (
            <div key={budget.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        categoryColors[budget.category] || categoryColors.other
                      }`}
                    >
                      {categoryLabels[budget.category] || budget.category}
                    </span>
                    {budget.activity && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {budget.activity.name}
                      </span>
                    )}
                  </div>
                  
                  {budget.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {budget.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 ml-4">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(budget.amount, budget.currency)}
                  </span>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingBudget(budget)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="編集"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="削除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {budgets.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              この日の予算はまだ登録されていません
            </div>
          )}
        </div>
      )}

      {/* 編集モーダル */}
      {editingBudget && (
        <EditBudgetModal
          isOpen={!!editingBudget}
          onClose={() => setEditingBudget(null)}
          budget={editingBudget}
          itineraryId={itineraryId}
          onBudgetUpdated={onUpdate}
        />
      )}
    </div>
  );
};

export default BudgetByDate;