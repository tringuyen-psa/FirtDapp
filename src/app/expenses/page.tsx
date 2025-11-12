'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExpenseFilters from '@/components/filters/ExpenseFilters';
import ExpensesTable from '@/components/tables/ExpensesTable';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseFilters as ExpenseFiltersType } from '@/types/expense';

export default function ExpensesPage() {
  const router = useRouter();

  // Initial filters for current month
  const initialFilters: ExpenseFiltersType = {
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    payer: 'Tất cả',
    consumers: []
  };

  const { expenses, loading, error, fetchExpenses, clearCache } = useExpenses(initialFilters);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bảng Tổng Hợp Chi Tiêu</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: <span className="font-semibold">{expenses.length}</span> khoản chi
              {expenses.length > 0 && (
                <span> - {formatCurrency(totalAmount)}</span>
              )}
            </p>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Trang chủ
            </button>
            <button
              onClick={() => router.push('/expenses/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Nhập khoản chi
            </button>
          </div>
        </div>

        {/* Filters */}
        <ExpenseFilters onFiltersChange={fetchExpenses} />

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <button
                    onClick={() => fetchExpenses(initialFilters)}
                    className="text-sm font-medium text-red-600 hover:text-red-500 underline"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : !error ? (
          /* Table */
          <ExpensesTable expenses={expenses} />
        ) : null}
      </div>
    </div>
  );
}