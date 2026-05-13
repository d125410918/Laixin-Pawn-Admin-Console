# Laixin Pawn Admin Console

獨立後台網站，用於直接瀏覽與審核前台客戶送出的資料。此版本不使用登入頁，打開網站即可查看資料。

## 功能

- 客戶資料列表
- 預設依照送出時間由新到舊排序
- 欄位依序顯示：姓名／身分證、縣市、月入或日薪、當品、資金需求、送出時間、審核狀態
- 狀態可切換為未審核或已審核
- 選擇刪除時會先跳出確認視窗
- 支援自拍與身分證照片網址欄位

## 環境變數

請在 Vercel Project Settings 的 Environment Variables 設定：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

## 資料庫

到 Neon 或 Supabase 的 SQL Editor 執行：

```sql
create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  national_id text not null,
  birth_date text,
  phone text,
  line_id text,
  city text not null,
  area text not null default '',
  job_type text,
  work_years text,
  income_range text,
  income_type text not null default 'monthly' check (income_type in ('monthly', 'daily')),
  income_amount integer not null default 0 check (income_amount >= 0),
  daily_income_amount integer not null default 0 check (daily_income_amount >= 0),
  has_payroll_or_labor_insurance text,
  funding_amount_wan text,
  funding_need integer not null default 0 check (funding_need >= 0),
  funding_purpose text,
  pawn_item text,
  collateral text,
  emergency_name text,
  emergency_phone text,
  emergency_relation text,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  selfie_url text,
  id_card_front_url text,
  id_card_back_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_created_at_desc_idx on customers (created_at desc);
create index if not exists customers_status_idx on customers (status);
create index if not exists customers_national_id_idx on customers (national_id);
```

完整 SQL 已放在 `scripts/schema.sql`。

## 本機執行

```bash
npm install
npm run dev
```

瀏覽：

```txt
http://localhost:3000
```

## 部署到 Vercel

1. 將本專案上傳到 GitHub。
2. 到 Vercel 新增 Project。
3. 選擇此 GitHub Repository。
4. 設定 `DATABASE_URL`。
5. Deploy。

## 前台需要改的地方

你目前前台的 `/api/applications` 只會驗證並回傳成功，不會寫入資料庫。請把前台的 `app/api/applications/route.ts` 改成會寫入同一個 `customers` 資料表，範例已放在：

```txt
frontend-example/app/api/applications/route.ts
```

前台專案也要安裝 Neon 套件：

```bash
npm install @neondatabase/serverless
```

前台與後台的 Vercel 環境變數都要設定同一組 `DATABASE_URL`。
