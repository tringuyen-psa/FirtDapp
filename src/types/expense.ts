export interface ExpenseFormData {
  amount: number;
  description: string;
  payer: 'Trí' | 'Long' | 'Đức' | 'Đạt' | 'Toàn' | 'Quỹ';
  consumers: string[];
  date: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  payer: string;
  consumers: string[];
  expenseDate: string;
  createdAt: string;
}

export interface MemberSummary {
  name: string;
  totalPaid: number;
  totalConsumed: number;
  balance: number;
}

export interface ExpenseFilters {
  month: string;
  year: string;
  payer: string;
  consumers: string[];
  minAmount?: number;
  maxAmount?: number;
}