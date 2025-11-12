'use client';

import { Expense } from '@/types/expense';
import { getMemberColor } from '@/lib/memberColors';

interface ExpensesTableProps {
  expenses: Expense[];
}

export default function ExpensesTable({ expenses }: ExpensesTableProps) {
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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên khoản chi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số tiền mỗi người
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người chi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người tiêu
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Chưa có khoản chi nào. <a href="/expenses/add" className="text-blue-600 hover:text-blue-700">Nhập khoản chi mới</a>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="text-indigo-600 font-medium">
                        {formatCurrency(calculatePerPersonAmount(expense.amount, expense.consumers))}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({expense.consumers.length} người)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMemberColor(expense.payer).bg} ${getMemberColor(expense.payer).text} ${getMemberColor(expense.payer).border} border`}>
                      {expense.payer}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.consumers.map((consumer, index) => {
                      const color = getMemberColor(consumer);
                      return (
                        <span
                          key={index}
                          className={`inline-block px-3 py-1 mr-2 mb-1 text-xs leading-5 font-medium rounded-full border ${color.bg} ${color.text} ${color.border}`}
                          title={consumer} // Tooltip for better UX
                        >
                          {consumer}
                        </span>
                      );
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}