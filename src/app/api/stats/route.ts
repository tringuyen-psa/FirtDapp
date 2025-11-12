import { NextResponse } from 'next/server'

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Lazy load Prisma client to avoid build-time issues
    const { prisma } = await import('@/lib/prisma');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all expenses
    const allExpenses = await prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' }
    });

    // Calculate today's expenses
    const todayExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      expenseDate.setHours(0, 0, 0, 0);
      return expenseDate.getTime() === today.getTime();
    });

    // Calculate this week's expenses
    const weekExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= startOfWeek;
    });

    // Calculate this month's expenses
    const monthExpenses = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= startOfMonth;
    });

    const stats = {
      today: {
        total: todayExpenses.reduce((sum, e) => {
          const amount = parseFloat(e.amount.toString());
          return sum + amount;
        }, 0),
        count: todayExpenses.length
      },
      week: {
        total: weekExpenses.reduce((sum, e) => {
          const amount = parseFloat(e.amount.toString());
          return sum + amount;
        }, 0),
        count: weekExpenses.length
      },
      month: {
        total: monthExpenses.reduce((sum, e) => {
          const amount = parseFloat(e.amount.toString());
          return sum + amount;
        }, 0),
        count: monthExpenses.length
      }
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}