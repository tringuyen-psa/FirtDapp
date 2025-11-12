'use client';

import { useState, useEffect } from 'react';
import type { ExpenseFilters } from '@/types/expense';
import { useDebounce } from '@/hooks/useDebounce';
import { getMemberColor } from '@/lib/memberColors';

interface ExpenseFiltersProps {
  onFiltersChange: (filters: ExpenseFilters) => void;
}

const MEMBERS = ['Tất cả', 'Trí', 'Long', 'Đức', 'Đạt', 'Toàn', 'Quỹ'];

export default function ExpenseFilters({ onFiltersChange }: ExpenseFiltersProps) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    payer: 'Tất cả',
    consumers: []
  });

  // Debounce filters to avoid too many API calls
  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    onFiltersChange(debouncedFilters);
  }, [debouncedFilters, onFiltersChange]);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Tháng ${i + 1}`
  }));

  const years = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() - 1 + i;
    return { value: year, label: `Năm ${year}` };
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Bộ Lọc</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tháng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tháng
          </label>
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Năm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Năm
          </label>
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>

        {/* Người chi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Người chi
          </label>
          <select
            value={filters.payer}
            onChange={(e) => setFilters({ ...filters, payer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MEMBERS.map(member => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        {/* Người tiêu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Người tiêu
          </label>
          <div className="text-xs text-gray-500 mb-2">
            * Mặc định: Hiển thị tất cả
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.consumers.length === 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters({ ...filters, consumers: [] });
                  }
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 font-medium">Tất cả</span>
            </label>
            <div className="grid grid-cols-2 gap-1">
              {MEMBERS.filter(m => m !== 'Tất cả').map(member => (
                <label key={member} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.consumers.includes(member)}
                    onChange={(e) => {
                      const updatedConsumers = e.target.checked
                        ? [...filters.consumers, member]
                        : filters.consumers.filter(c => c !== member);
                      setFilters({ ...filters, consumers: updatedConsumers });
                    }}
                    disabled={filters.consumers.length === 0}
                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                      filters.consumers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <span className={`text-sm font-medium ${
                    member === 'Quỹ' ? getMemberColor('Quỹ').text : getMemberColor(member).text
                  }`}>
                    {member}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}