'use client';

import { useState } from 'react';
import ExpenseForm from '@/components/forms/ExpenseForm';
import { ExpenseFormData } from '@/types/expense';

export default function AddExpensePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage('Khoản chi đã được lưu thành công!');
        setTimeout(() => {
          window.location.href = '/expenses';
        }, 1500);
      } else {
        throw new Error('Failed to save expense');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra. Vui lòng thử lại!');
      console.error('Error saving expense:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nhập Khoản Chi</h1>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Quay lại
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <ExpenseForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}