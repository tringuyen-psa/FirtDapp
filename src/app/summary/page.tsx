'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MemberSummary from '@/components/summary/MemberSummary';
import BalanceChart from '@/components/charts/BalanceChart';
import StatisticsCards from '@/components/StatisticsCards';
import { MemberSummary as MemberSummaryType } from '@/types/expense';

export default function SummaryPage() {
  const [summaries, setSummaries] = useState<MemberSummaryType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/summary');
        if (response.ok) {
          const data = await response.json();
          setSummaries(data);
        } else {
          console.error('Failed to fetch summary');
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const totalPaid = summaries.reduce((sum, member) => sum + member.totalPaid, 0);
  const totalConsumed = summaries.reduce((sum, member) => sum + member.totalConsumed, 0);
  const totalExpenses = summaries.length; // This would be actual count from API

  // Calculate who owes who
  const calculateSettlements = () => {
    const creditors = summaries.filter(m => m.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = summaries.filter(m => m.balance < 0).sort((a, b) => a.balance - b.balance);

    const settlements: { from: string; to: string; amount: number }[] = [];

    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const settleAmount = Math.min(Math.abs(debtor.balance), creditor.balance);

      if (settleAmount > 0.01) { // Only add if there's a meaningful amount
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: settleAmount
        });
      }

      debtor.balance += settleAmount;
      creditor.balance -= settleAmount;

      if (Math.abs(debtor.balance) < 0.01) debtorIndex++;
      if (Math.abs(creditor.balance) < 0.01) creditorIndex++;
    }

    return settlements;
  };

  const settlements = calculateSettlements();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tóm Tắt Chi Tiêu</h1>
            <p className="text-gray-600 mt-1">
              Tổng các khoản chi: <span className="font-semibold">{totalExpenses}</span> -
              Tổng tiền: <span className="font-semibold">{formatCurrency(totalPaid)}</span>
            </p>
          </div>
          <div className="space-x-3">
            <button
              onClick={() => router.push('/expenses')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Xem chi tiết
            </button>
            <button
              onClick={() => router.push('/expenses/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Nhập khoản chi
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white shadow-md rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <StatisticsCards />

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng đã chi</p>
                    <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng đã tiêu</p>
                    <p className="text-2xl font-semibold text-orange-600">{formatCurrency(totalConsumed)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Số khoản chi</p>
                    <p className="text-2xl font-semibold text-blue-600">{totalExpenses}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <BalanceChart summaries={summaries} />

            {/* Member Summary Table */}
            <MemberSummary summaries={summaries} />

            {/* Settlement Suggestions */}
            {settlements.length > 0 && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Gợi ý thanh toán</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {settlements.map((settlement, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{settlement.from}</span>
                          <span className="text-gray-500">→</span>
                          <span className="font-medium text-gray-900">{settlement.to}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-600">{formatCurrency(settlement.amount)}</span>
                          <button className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200">
                            Đã thanh toán
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}