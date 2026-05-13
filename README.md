# Laixin Pawn Admin Console

公開版後台，不使用登入模式。首頁直接顯示客戶資料表格。

## 功能

- 從 PostgreSQL `customers` 表讀取客戶資料
- 預設依 `created_at desc` 排序
- 顯示姓名、身分證、縣市、月入或日薪、當品、資金需求、送出時間
- 狀態可切換為未審核或已審核
- 選擇刪除會先跳出確認視窗

## Vercel 環境變數

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

前台與後台必須使用同一組 `DATABASE_URL`。

## 部署設定

- Framework Preset: Next.js
- Root Directory: 留空，除非你的 GitHub repo 外層又包了一層資料夾
- Install Command: `npm install --legacy-peer-deps --no-audit --no-fund`
- Build Command: `npm run build`
- Output Directory: 留空
- Node.js Version: 20.x

## 資料庫

先在 Neon 或 Supabase PostgreSQL 執行：

```txt
scripts/schema.sql
```
