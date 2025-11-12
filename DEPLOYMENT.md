# 🚀 Deployment Guide

## Environments

### 1. **Development (Local)**
```bash
# Setup
npm install
cp .env.example .env.local
# Edit .env.local with local DATABASE_URL

# Run
npm run dev
```

### 2. **Staging (Vercel Preview)**
- **URL**: `https://your-app-staging.vercel.app`
- **Database**: Staging database
- **Environment Variables**:
  ```
  NODE_ENV=staging
  DATABASE_URL=postgresql://staging-user:password@staging-host:5432/staging_db
  NEXT_PUBLIC_APP_NAME="Quản Lý Chi Tiêu (Staging)"
  ```

### 3. **Production (Vercel Main)**
- **URL**: `https://your-app.vercel.app`
- **Database**: Production database
- **Environment Variables**:
  ```
  NODE_ENV=production
  DATABASE_URL=postgresql://prod-user:password@prod-host:5432/prod_db
  NEXT_PUBLIC_APP_NAME="Quản Lý Chi Tiêu"
  ```

## 🛠️ Platform Deployment

### **Vercel (Recommended)**
1. Connect GitHub repository
2. Set Environment Variables in Vercel Dashboard
3. Auto-deploy on push to main branch

**Required Environment Variables:**
```
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### **Netlify**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Environment variables in Netlify UI

### **DigitalOcean App Platform**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Run command: `npm run start`
4. Environment variables in App Settings

### **AWS Amplify**
1. Connect GitHub repository
2. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

## 🗄️ Database Setup

### **Development**
```bash
npx prisma db push
npx prisma studio
```

### **Production/Staging**
1. Create separate PostgreSQL databases
2. Update DATABASE_URL for each environment
3. Run: `npx prisma db push` on first deploy

## 🔄 CI/CD Pipeline

### **GitHub Actions (Optional)**
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📋 Deployment Checklist

### Before Deploy:
- [ ] Environment variables set correctly
- [ ] Database schema is up to date
- [ ] Build process works locally
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`

### After Deploy:
- [ ] Test all API endpoints
- [ ] Test database connectivity
- [ ] Test user interface
- [ ] Check error logs
- [ ] Monitor performance

## 🔍 Environment Detection

The app automatically detects environment:
- `process.env.NODE_ENV` for server-side
- `process.env.NEXT_PUBLIC_*` for client-side

## 🐛 Debugging

### Common Issues:
1. **Database Connection**: Check DATABASE_URL format
2. **Build Failures**: Verify Prisma client generation
3. **Environment Variables**: Ensure correct naming convention
4. **API Routes**: Check dynamic route configuration

### Commands:
```bash
# Test build locally
npm run build

# Test production build locally
npm run build:prod
npm run start:prod

# Check Prisma client
npm run db:generate
```