import React from 'react';

interface Budget {
  category: string;
  amount: number;
  currency: string;
}

interface DailyTotal {
  date: string;
  total: number;
  count: number;
}

interface BudgetSummaryProps {
  totalAmount: number;
  dailyTotals: DailyTotal[];
  budgets: Budget[];
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
  transport: 'bg-blue-500',
  accommodation: 'bg-purple-500',
  food: 'bg-green-500',
  sightseeing: 'bg-yellow-500',
  shopping: 'bg-pink-500',
  other: 'bg-gray-500',
};

const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  totalAmount,
  dailyTotals,
  budgets
}) => {
  // カテゴリ別集計
  const categoryTotals = budgets.reduce((acc: { [key: string]: number }, budget) => {
    acc[budget.category] = (acc[budget.category] || 0) + budget.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5); // トップ5カテゴリ

  // 平均日額
  const averageDaily = dailyTotals.length > 0 ? totalAmount / dailyTotals.length : 0;

  // 最高・最低支出日
  const sortedDays = [...dailyTotals].sort((a, b) => b.total - a.total);
  const maxDay = sortedDays[0];
  const minDay = sortedDays[sortedDays.length - 1];

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* 総予算カード */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">予算サマリー</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">総予算</span>
            <span className="text-2xl font-bold text-gray-900">
              ¥{totalAmount.toLocaleString()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">平均日額</div>
              <div className="font-semibold text-gray-900">
                ¥{Math.round(averageDaily).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">記録日数</div>
              <div className="font-semibold text-gray-900">
                {dailyTotals.length}日
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリ別内訳 */}
      {sortedCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別内訳</h3>
          <div className="space-y-3">
            {sortedCategories.map(([category, amount]) => {
              const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {categoryLabels[category] || category}
                    </span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ¥{amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryColors[category] || categoryColors.other}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 日別統計 */}
      {dailyTotals.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">日別統計</h3>
          <div className="space-y-4">
            {maxDay && minDay && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">最高支出日</span>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">
                      ¥{maxDay.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(maxDay.date)}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">最低支出日</span>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ¥{minDay.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(minDay.date)}
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* 日別グラフ（簡易版） */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-3">日別支出推移</div>
              <div className="space-y-2">
                {dailyTotals
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((day) => {
                    const maxAmount = Math.max(...dailyTotals.map(d => d.total));
                    const percentage = maxAmount > 0 ? (day.total / maxAmount) * 100 : 0;
                    return (
                      <div key={day.date} className="flex items-center space-x-2 text-sm">
                        <div className="w-12 text-xs text-gray-500 text-right">
                          {formatDate(day.date)}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div
                            className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <span className="text-xs text-white font-medium">
                              {percentage > 20 ? `¥${day.total.toLocaleString()}` : ''}
                            </span>
                          </div>
                          {percentage <= 20 && (
                            <span className="absolute right-2 top-0.5 text-xs text-gray-600">
                              ¥{day.total.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 空の状態 */}
      {budgets.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">まだ予算が登録されていません</p>
          <p className="text-sm text-gray-400 mt-1">「予算を追加」ボタンから始めましょう</p>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;