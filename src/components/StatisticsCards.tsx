"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, DollarSign, Loader2 } from "lucide-react";

interface StatsData {
  today: {
    total: number;
    count: number;
  };
  week: {
    total: number;
    count: number;
  };
  month: {
    total: number;
    count: number;
  };
}

export default function StatisticsCards() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-600">Lỗi thống kê: {error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Hôm nay</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.today.total || 0)}</p>
            <p className="text-xs text-gray-500">{stats?.today.count || 0} giao dịch</p>
          </div>
          <Calendar className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tuần này</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats?.week.total || 0)}</p>
            <p className="text-xs text-gray-500">{stats?.week.count || 0} giao dịch</p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tháng này</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.month.total || 0)}</p>
            <p className="text-xs text-gray-500">{stats?.month.count || 0} giao dịch</p>
          </div>
          <TrendingUp className="h-8 w-8 text-orange-600" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Trung bình/GD</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats?.today.count && stats.today.count > 0
                ? formatCurrency(stats.today.total / stats.today.count)
                : formatCurrency(0)
              }
            </p>
            <p className="text-xs text-gray-500">Hôm nay</p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    </div>
  );
}