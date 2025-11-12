'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExpenseFormData } from '@/types/expense';
import { getMemberColor } from '@/lib/memberColors';

const expenseSchema = z.object({
  amount: z.number().min(1000, "Số tiền tối thiểu 1.000đ"),
  description: z.string().min(1, "Nhập tên khoản chi"),
  payer: z.enum(["Trí", "Long", "Đức", "Đạt", "Toàn", "Quỹ"]),
  consumers: z.array(z.enum(["Trí", "Long", "Đức", "Đạt", "Toàn", "Quỹ"]))
    .min(1, "Chọn ít nhất 1 người tiêu"),
  date: z.string()
});

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  isLoading?: boolean;
}

const MEMBERS = ['Trí', 'Long', 'Đức', 'Đạt', 'Toàn', 'Quỹ'];

export default function ExpenseForm({ onSubmit, isLoading = false }: ExpenseFormProps) {
  const [selectedConsumers, setSelectedConsumers] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      consumers: []
    }
  });

  const handleConsumerToggle = (member: string) => {
    let updatedConsumers: string[];

    // If selecting "Quỹ", clear all other selections and only keep Quỹ
    if (member === 'Quỹ') {
      updatedConsumers = selectedConsumers.includes(member)
        ? [] // If unchecking Quỹ, clear all
        : ['Quỹ']; // If checking Quỹ, only select Quỹ (replacing all others)
    } else {
      // If selecting a regular member and Quỹ is currently selected, replace Quỹ
      if (selectedConsumers.includes('Quỹ')) {
        updatedConsumers = selectedConsumers.includes(member)
          ? [] // If unchecking member and Quỹ was selected, clear all (edge case)
          : [member]; // Replace Quỹ with this member
      } else {
        // Normal selection logic for regular members
        updatedConsumers = selectedConsumers.includes(member)
          ? selectedConsumers.filter(c => c !== member)
          : [...selectedConsumers, member];
      }
    }

    setSelectedConsumers(updatedConsumers);
    setValue('consumers', updatedConsumers);
  };

  const onFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
    reset();
    setSelectedConsumers([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nhập Khoản Chi Mới</h2>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Số tiền */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền (VNĐ)
          </label>
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100000"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Tên khoản chi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên khoản chi
          </label>
          <input
            type="text"
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: Đi ăn tối, Mua đồ ăn sáng..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Người chi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Người chi
          </label>
          <select
            {...register('payer')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn người chi</option>
            {MEMBERS.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
          {errors.payer && (
            <p className="text-red-500 text-sm mt-1">{errors.payer.message}</p>
          )}
        </div>

        {/* Người tiêu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Người tiêu (chọn nhiều)
          </label>
          <div className="text-xs text-gray-500 mb-2">
            * "Quỹ" là cho cả 5 thành viên, không thể chọn cùng lúc với thành viên cụ thể
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MEMBERS.map(member => (
              <label key={member} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConsumers.includes(member)}
                  onChange={() => handleConsumerToggle(member)}
                  disabled={
                    // Disable regular members if Quỹ is selected
                    (member !== 'Quỹ' && selectedConsumers.includes('Quỹ')) ||
                    // Disable Quỹ if any regular member is selected
                    (member === 'Quỹ' && selectedConsumers.some(c => c !== 'Quỹ'))
                  }
                  className={`w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${
                    (member !== 'Quỹ' && selectedConsumers.includes('Quỹ')) ||
                    (member === 'Quỹ' && selectedConsumers.some(c => c !== 'Quỹ'))
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
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
          {errors.consumers && (
            <p className="text-red-500 text-sm mt-1">{errors.consumers.message}</p>
          )}
        </div>

        {/* Ngày chi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày chi
          </label>
          <input
            type="date"
            {...register('date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang lưu...' : 'Lưu khoản chi'}
        </button>
      </form>
    </div>
  );
}