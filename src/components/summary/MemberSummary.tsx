'use client';

import { MemberSummary } from '@/types/expense';

interface MemberSummaryTableProps {
  summaries: MemberSummary[];
}

export default function MemberSummaryTable({ summaries }: MemberSummaryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600 bg-green-100';
    if (balance < 0) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Dư +${formatCurrency(balance)}`;
    if (balance < 0) return `Nợ ${formatCurrency(Math.abs(balance))}`;
    return 'Hòa vốn';
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Bảng Tóm Tắt Chi Tiêu</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thành viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đã chi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đã tiêu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dư (+)/Nợ (-)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.map((member) => (
              <tr key={member.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium text-green-600">
                    {formatCurrency(member.totalPaid)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium text-orange-600">
                    {formatCurrency(member.totalConsumed)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBalanceColor(member.balance)}`}>
                    {getBalanceText(member.balance)}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">
                    Thanh toán
                  </button>
                </td>
              </tr>
            ))}

            {/* Total row */}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                TỔNG CỘNG
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                {formatCurrency(summaries.reduce((sum, m) => sum + m.totalPaid, 0))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                {formatCurrency(summaries.reduce((sum, m) => sum + m.totalConsumed, 0))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatCurrency(
                  summaries.reduce((sum, m) => sum + m.balance, 0)
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                -
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}