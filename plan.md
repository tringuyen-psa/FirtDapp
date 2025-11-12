# Kế hoạch Phát triển Hệ thống Quản lý Tiền Trọ (Next.js)

## Mục tiêu
Xây dựng ứng dụng web quản lý chi tiêu chung cho phòng trọ với 5 thành viên (Trí, Long, Đức, Đạt, Toàn) và quỹ chung sử dụng Next.js.

## Công nghệ
- **Frontend Framework:** Next.js 14 (App Router)
- **UI Components:** Tailwind CSS + Headless UI
- **State Management:** Zustand/Context API
- **Database:** Neon PostgreSQL
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Chart.js/Recharts

## Cấu trúc thư mục
```
/app
  /api
    /expenses
  /components
    /forms
    /tables
    /charts
  /lib
    /db
    /validations
  /hooks
  /types
  /dashboard
  /expenses
  /summary
```

### 1. Trang nhập khoản chi nhanh chóng (/expenses/add)
**URL:** `/expenses/add`

**Components:**
```tsx
// app/components/forms/ExpenseForm.tsx
interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
}

interface ExpenseFormData {
  amount: number;
  description: string;
  payer: 'Trí' | 'Long' | 'Đức' | 'Đạt' | 'Toàn' | 'Quỹ';
  consumers: string[];
  date: string;
}
```

**Fields:**
- Số tiền tổng (number input)
- Tên khoản chi (text input)
- Người chi (select dropdown: Trí, Long, Đức, Đạt, Toàn, Quỹ)
- Người tiêu (checkboxes multi-select: Trí, Long, Đức, Đạt, Toàn, Quỹ)
- Ngày chi tiêu (date picker, default: today)
- Button: "Lưu khoản chi"

### 2. Bảng tổng hợp theo tháng (/expenses)
**URL:** `/expenses`

**Components:**
```tsx
// app/components/tables/ExpensesTable.tsx
// app/components/filters/ExpenseFilters.tsx

interface ExpenseFilters {
  month: string;
  year: string;
  payer: string;
  consumers: string[];
  minAmount: number;
  maxAmount: number;
}
```

**Features:**
- Filter theo tháng/năm
- Filter theo người chi
- Filter theo người tiêu (multi-select)
- Filter theo khoảng tiền
- Sort by date, amount, payer
- Export to CSV/Excel
- Pagination

**Columns:**
- Ngày
- Tên khoản chi
- Số tiền
- Người chi
- Người tiêu
- Actions (edit, delete)

### 3. Bảng tóm tắt chi tiêu (/summary)
**URL:** `/summary`

**Components:**
```tsx
// app/components/summary/MemberSummary.tsx
// app/components/charts/BalanceChart.tsx

interface MemberSummary {
  name: string;
  totalPaid: number;
  totalConsumed: number;
  balance: number;
}
```

**Sections:**
- **Tổng quan:**
  - Tổng tiền đã chi
  - Tổng số khoản chi
  - Trung bình/khoản chi

- **Bảng chi tiết thành viên:**
  | Thành viên | Đã chi | Đã tiêu | Dư (+)/Nợ (-) | Thao tác |
  |------------|--------|---------|----------------|----------|
  | Trí | 1.500k | 800k | +700k | [Thanh toán] |
  | Long | 800k | 900k | -100k | [Thanh toán] |
  | Đức | 1.200k | 1.100k | +100k | [Thanh toán] |
  | Đạt | 600k | 800k | -200k | [Thanh toán] |
  | Toàn | 900k | 1.200k | -300k | [Thanh toán] |

- **Biểu đồ:**
  - Pie chart: Tỷ lệ chi tiêu
  - Bar chart: So sánh đã chi vs đã tiêu

## Database Schema (Neon PostgreSQL + Prisma)

### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Expense {
  id           String   @id @default(cuid())
  amount       Float    @db.Decimal(10, 2)
  description  String
  payer        String   // 'Trí' | 'Long' | 'Đức' | 'Đạt' | 'Toàn' | 'Quỹ'
  consumers    String[] // array of consumers
  expenseDate  DateTime @db.Date
  createdAt    DateTime @default(now())

  @@map("expenses")
}

model SettlementTransaction {
  id        String   @id @default(cuid())
  fromUser  String   // người trả tiền
  toUser    String   // người nhận tiền
  amount    Float    @db.Decimal(10, 2)
  date      DateTime @db.Date
  settled   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("settlement_transactions")
}
```

### Migration Commands
```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

## API Routes với Prisma

### Setup Prisma Client
```tsx
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### GET /api/expenses
```tsx
// app/api/expenses/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const payer = searchParams.get('payer');

  let whereClause = {};

  if (month && year) {
    whereClause = {
      ...whereClause,
      expenseDate: {
        gte: new Date(`${year}-${month}-01`),
        lt: new Date(`${year}-${parseInt(month) + 1}-01`)
      }
    };
  }

  if (payer) {
    whereClause = { ...whereClause, payer };
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    orderBy: { expenseDate: 'desc' }
  });

  return NextResponse.json(expenses);
}

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
```

### GET /api/summary
```tsx
// app/api/summary/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const MEMBERS = ['Trí', 'Long', 'Đức', 'Đạt', 'Toàn'];

export async function GET() {
  const expenses = await prisma.expense.findMany();

  const summaries = MEMBERS.map(member => {
    const paidExpenses = expenses.filter(e => e.payer === member);
    const consumedExpenses = expenses.filter(e => e.consumers.includes(member));

    const totalPaid = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalConsumed = consumedExpenses.reduce((sum, e) => {
      return sum + (e.amount / e.consumers.length);
    }, 0);

    return {
      name: member,
      totalPaid,
      totalConsumed,
      balance: totalPaid - totalConsumed
    };
  });

  return NextResponse.json(summaries);
}
```

## Hooks tùy chỉnh

```tsx
// hooks/useExpenses.ts
export function useExpenses(filters: ExpenseFilters) {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  // fetch logic
}

// hooks/useSummary.ts
export function useSummary() {
  const [summaries, setSummaries] = useState<MemberSummary[]>([]);
  // calculate summaries
}
```

## Validations (Zod)

```tsx
// lib/validations/expense.ts
export const expenseSchema = z.object({
  amount: z.number().min(1000, "Số tiền tối thiểu 1.000đ"),
  description: z.string().min(1, "Nhập tên khoản chi"),
  payer: z.enum(["Trí", "Long", "Đức", "Đạt", "Toàn", "Quỹ"]),
  consumers: z.array(z.enum(["Trí", "Long", "Đức", "Đạt", "Toàn", "Quỹ"]))
    .min(1, "Chọn ít nhất 1 người tiêu"),
  date: z.string()
});
```

## Package Dependencies

```json
// package.json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "@headlessui/react": "^1.7.0",
    "@hookform/resolvers": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "lucide-react": "^0.292.0",
    "recharts": "^2.8.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "postcss": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Lộ trình phát triển

### Phase 1: Core Features (1-2 tuần)
1. Setup Next.js + Tailwind + Prisma + Neon
2. Database schema setup
3. Form nhập khoản chi
4. API CRUD cho expenses
5. Bảng tổng hợp cơ bản

### Phase 2: Filtering & Summary (1 tuần)
1. Bộ lọc nâng cao
2. Bảng tóm tắt chi tiêu
3. Validation
4. Responsive design

### Phase 3: Advanced Features (1 tuần)
1. Charts và visualizations
2. Export CSV/Excel
3. Thanh toán tự động
4. User preferences

### Phase 4: Polish & Deploy (1 tuần)
1. UI/UX improvements
2. Testing
3. Performance optimization
4. Deployment (Vercel)

## Deployment
- **Platform:** Vercel (recommended cho Next.js)
- **Database:** Neon PostgreSQL (có free tier)
- **Environment Variables:**
  ```
  DATABASE_URL=postgresql://neondb_owner:npg_KUIV7JcTFX5t@ep-old-star-aem18tbu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
  ```
- **ORM:** Prisma (recommended cho Neon)