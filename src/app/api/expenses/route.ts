import { NextRequest, NextResponse } from 'next/server'

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Lazy load Prisma client to avoid build-time issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      throw new Error('Database connection not available');
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const payer = searchParams.get('payer');
    const consumers = searchParams.get('consumers');
    const limit = searchParams.get('limit');

    let whereClause: any = {};

    if (month && year) {
      const startDate = new Date(`${year}-${parseInt(month).toString().padStart(2, '0')}-01`);
      const endDate = new Date(`${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01`);

      whereClause = {
        ...whereClause,
        expenseDate: {
          gte: startDate,
          lt: endDate
        }
      };
    }

    if (payer && payer !== 'all' && payer !== 'Tất cả') {
      whereClause = { ...whereClause, payer };
    }

    if (consumers) {
      const consumerList = consumers.split(',');
      whereClause = {
        ...whereClause,
        consumers: {
          hasSome: consumerList
        }
      };
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { expenseDate: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    // Convert Decimal to number for JSON serialization
    const serializedExpenses = expenses.map(expense => ({
      ...expense,
      amount: Number(expense.amount)
    }));

    // Add Cache-Control headers for better caching
    return NextResponse.json(serializedExpenses, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Lazy load Prisma client to avoid build-time issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      throw new Error('Database connection not available');
    }

    const body = await request.json();

    const expense = await prisma.expense.create({
      data: {
        amount: body.amount,
        description: body.description,
        payer: body.payer,
        consumers: body.consumers,
        expenseDate: new Date(body.date)
      }
    });

    // Convert Decimal to number for JSON serialization
    const serializedExpense = {
      ...expense,
      amount: Number(expense.amount)
    };

    return NextResponse.json(serializedExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}