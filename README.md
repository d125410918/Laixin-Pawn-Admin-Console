# Laixin Pawn Admin Console

徠鑫當鋪客戶審核後台，獨立 Next.js 專案，可直接部署到 Vercel。

## 功能

- 首頁直接顯示所有 customers 資料
- 依 created_at desc 排序
- 可將狀態切換為 pending / approved
- 刪除選項只執行 DELETE，不會把 delete 寫入資料庫
- 提供 DB 健康檢查 API

## API

- GET /api/customers
- PATCH /api/customers/[id]
- DELETE /api/customers/[id]
- GET /api/health/db

## Vercel 環境變數

必須設定與前台相同的 DATABASE_URL。

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

## 本機執行

```bash
npm install
npm run dev
```

## 部署

把本專案所有檔案推到 GitHub repo，再到 Vercel 匯入該 repo，設定 DATABASE_URL 後即可部署。
