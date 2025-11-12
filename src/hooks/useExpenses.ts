import { useState, useEffect, useCallback, useRef } from 'react';
import { Expense, ExpenseFilters } from '@/types/expense';

export function useExpenses(initialFilters: ExpenseFilters) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache để tránh gọi API trùng lặp
  const cache = useRef<Map<string, Expense[]>>(new Map());
  const lastRequestRef = useRef<string>('');

  const getCacheKey = (filters: ExpenseFilters): string => {
    return JSON.stringify({
      month: filters.month,
      year: filters.year,
      payer: filters.payer,
      consumers: filters.consumers.sort()
    });
  };

  const fetchExpenses = useCallback(async (filters: ExpenseFilters) => {
    const cacheKey = getCacheKey(filters);

    // Check cache first
    if (cache.current.has(cacheKey) && lastRequestRef.current === cacheKey) {
      setExpenses(cache.current.get(cacheKey)!);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month.toString());
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.payer && filters.payer !== 'Tất cả') params.append('payer', filters.payer);
      if (filters.consumers.length > 0) params.append('consumers', filters.consumers.join(','));

      const response = await fetch(`/api/expenses?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();

      // Cache the result
      cache.current.set(cacheKey, data);
      lastRequestRef.current = cacheKey;

      setExpenses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache when needed
  const clearCache = useCallback(() => {
    cache.current.clear();
    lastRequestRef.current = '';
  }, []);

  // Refetch without clearing cache
  const refetch = useCallback(() => {
    if (lastRequestRef.current) {
      const filters = JSON.parse(lastRequestRef.current);
      fetchExpenses(filters);
    }
  }, [fetchExpenses]);

  // Initial load
  useEffect(() => {
    fetchExpenses(initialFilters);
  }, []);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    clearCache,
    refetch
  };
}