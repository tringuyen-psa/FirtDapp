import { NextResponse } from 'next/server'

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MEMBERS = ['Trí', 'Long', 'Đức', 'Đạt', 'Toàn'];

export async function GET() {
  try {
    // Lazy load Prisma client to avoid build-time issues
    const { prisma } = await import('@/lib/prisma');

    const expenses = await prisma.expense.findMany();

    const summaries = MEMBERS.map(member => {
      const paidExpenses = expenses.filter(e => e.payer === member);
      const consumedExpenses = expenses.filter(e => e.consumers.includes(member));

      const totalPaid = paidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      const totalConsumed = consumedExpenses.reduce((sum, e) => {
        return sum + (Number(e.amount) / e.consumers.length);
      }, 0);

      return {
        name: member,
        totalPaid,
        totalConsumed,
        balance: totalPaid - totalConsumed
      };
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}