import React from 'react';

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
  onAddBudget?: () => void;
}

const categoryLabels: { [key: string]: string } = {
  transport: '交通費',
  accommodation: '宿泊費', 
  food: '食事',
  sightseeing: '観光・アクティビティ',
  shopping: 'お土産',
  other: 'その他',
  expense: '支出',
};

const categoryColors: { [key: string]: string } = {
  transport: 'bg-blue-100 text-blue-800',
  accommodation: 'bg-purple-100 text-purple-800',
  food: 'bg-green-100 text-green-800',
  sightseeing: 'bg-yellow-100 text-yellow-800',
  shopping: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
  expense: 'bg-orange-100 text-orange-800',
};

const BudgetByDate: React.FC<BudgetByDateProps> = ({
  date,
  budgets,
  itineraryId,
  onUpdate,
  onAddBudget
}) => {
  const totalAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  // カテゴリ別の合計を計算
  const categoryTotals = budgets.reduce((acc, budget) => {
    const category = budget.category;
    acc[category] = (acc[category] || 0) + budget.amount;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{formattedDate}</h3>
            <p className="text-sm text-gray-600">
              {Object.keys(categoryTotals).length}個のカテゴリ • {budgets.length}件の支出
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ¥{totalAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">合計支出</div>
          </div>
        </div>
      </div>

      {/* カテゴリ別内訳 */}
      {Object.keys(categoryTotals).length > 0 ? (
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        categoryColors[category] || categoryColors.other
                      }`}
                    >
                      {categoryLabels[category] || category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ¥{amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((amount / totalAmount) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p>この日の予算データがありません</p>
        </div>
      )}
    </div>
  );
};

export default BudgetByDate;