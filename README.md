# Quản Lý Tiền Trọ

Hệ thống quản lý chi tiêu chung cho phòng trọ với Next.js, Prisma và Neon Database.

## Tính năng

- ✅ Nhập khoản chi nhanh chóng
- ✅ Bảng tổng hợp theo tháng với bộ lọc
- ✅ Bảng tóm tắt chi tiêu của từng thành viên
- ✅ Biểu đồ trực quan (Bar chart, Pie chart)
- ✅ Gợi ý thanh toán tự động

## Thành viên

- Trí
- Long
- Đức
- Đạt
- Toàn
- Quỹ (cho khoản chi chung)

## Công nghệ

- **Frontend**: Next.js 14 (App Router)
- **UI**: Tailwind CSS
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## Cài đặt

1. Clone repository
```bash
git clone <your-repo-url>
cd tientro
```

2. Cài đặt dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env.local
# Thêm DATABASE_URL vào .env.local
```

4. Generate Prisma client
```bash
npx prisma generate
```

5. Chạy development server
```bash
npm run dev
```

6. Mở [http://localhost:3000](http://localhost:3000)

## Database Schema

- **Expense**: Khoản chi (số tiền, mô tả, người chi, người tiêu, ngày)
- **SettlementTransaction**: Giao dịch thanh toán

## API Routes

- `GET/POST /api/expenses` - Quản lý khoản chi
- `GET /api/summary` - Tóm tắt chi tiêu

## Pages

- `/` - Trang chủ (nhập nhanh, 5 khoản chi gần nhất)
- `/expenses/add` - Nhập khoản chi
- `/expenses` - Bảng tổng hợp với bộ lọc
- `/summary` - Bảng tóm tắt và thống kê

## Deployment

Deploy to Vercel:
1. Push code to GitHub
2. Connect repo to Vercel
3. Add DATABASE_URL environment variable
4. Deploy

## Todo

- [ ] Xóa/sửa khoản chi
- [ ] Export CSV/Excel
- [ ] User authentication
- [ ] Real-time updates
- [ ] Mobile app