'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExpenseForm from '@/components/forms/ExpenseForm';
import { ExpenseFormData, Expense } from '@/types/expense';
import { getMemberColor } from '@/lib/memberColors';

interface StatsData {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
}

export default function HomePage() {
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<StatsData>({
    today: { total: 0, count: 0 },
    week: { total: 0, count: 0 },
    month: { total: 0, count: 0 }
  });
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRecentExpenses();
    fetchStats();
  }, []);

  const fetchRecentExpenses = async () => {
    try {
      // Add cache-busting timestamp to force refresh when needed
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/expenses?limit=5&_t=${timestamp}`);
      if (response.ok) {
        const data = await response.json();
        setRecentExpenses(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent expenses:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmitExpense = async (data: ExpenseFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowForm(false);
        fetchRecentExpenses(); // Refresh recent expenses
        fetchStats(); // Refresh stats
      } else {
        throw new Error('Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculatePerPersonAmount = (amount: number, consumers: string[]) => {
    return amount / consumers.length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">💰 Quản Lý Tiền Trọ</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => router.push('/expenses')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Tổng hợp
              </button>
              <button
                onClick={() => router.push('/summary')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Tóm tắt
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Add Form */}
          <div className="lg:col-span-1">
            {!showForm ? (
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Nhập Khoản Chi Nhanh</h2>
                <p className="text-gray-600 mb-4">Thêm khoản chi mới cho nhóm trọ</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  + Nhập khoản chi mới
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Nhập Khoản Chi Mới</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <ExpenseForm onSubmit={handleSubmitExpense} isLoading={isLoading} />
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white shadow-md rounded-lg p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thống Kê Nhanh</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hôm nay</span>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {formatCurrency(stats.today.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.today.count} khoản chi
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tuần này</span>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(stats.week.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.week.count} khoản chi
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tháng này</span>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">
                      {formatCurrency(stats.month.total)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.month.count} khoản chi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Expenses */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">5 Khoản Chi Gần Nhất</h3>
                  <button
                    onClick={() => router.push('/expenses')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Xem tất cả →
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {recentExpenses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p>Chưa có khoản chi nào</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Nhập khoản chi đầu tiên
                    </button>
                  </div>
                ) : (
                  recentExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">{expense.description}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getMemberColor(expense.payer).bg} ${getMemberColor(expense.payer).text} ${getMemberColor(expense.payer).border}`}>
                              {expense.payer}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDate(expense.expenseDate)}</span>
                            <span className="flex flex-wrap gap-1">
                              Người tiêu:
                              {expense.consumers.map((consumer, index) => (
                                <span
                                  key={index}
                                  className={`inline-block px-2 py-1 text-xs leading-4 font-medium rounded-full border ${getMemberColor(consumer).bg} ${getMemberColor(consumer).text} ${getMemberColor(consumer).border}`}
                                >
                                  {consumer}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </div>
                          <div className="text-xs text-indigo-600">
                            {formatCurrency(calculatePerPersonAmount(expense.amount, expense.consumers))}/người
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/expenses')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V4a2 2 0 00-2-2H8a2 2 0 00-2 2v3m3 6h6" />
                </svg>
                Xem tất cả khoản chi
              </button>
              <button
                onClick={() => router.push('/summary')}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Xem thống kê
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}