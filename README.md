# Laixin Pawn Admin Console

來新當鋪客戶審核後台。這是一個獨立後台網站，不使用登入模式，打開首頁後直接讀取 PostgreSQL `customers` 資料表並顯示客戶資料。

## 功能

- 從 PostgreSQL `customers` 表讀取客戶資料
- 預設依 `created_at desc` 排序
- 顯示姓名與身分證、縣市與區域、月入或日薪、當品、資金需求、送出時間、審核狀態
- 狀態只允許 `pending` 與 `approved`
- `pending` 顯示為未審核
- `approved` 顯示為已審核
- 下拉選到刪除時會先跳出確認視窗，確認後才會執行 DELETE
- `delete` 不會存入資料庫

## API

### GET /api/customers

讀取全部客戶資料，依 `created_at desc` 排序。

### PATCH /api/customers/[id]

更新單筆資料狀態，只允許：

```json
{
  "status": "pending"
}
```

或：

```json
{
  "status": "approved"
}
```

### DELETE /api/customers/[id]

刪除單筆資料。

### GET /api/health/db

測試資料庫連線。成功時回傳：

```json
{
  "ok": true
}
```

### POST /api/applications

前台送出申請資料用。成功寫入 PostgreSQL 後才會回傳：

```json
{
  "success": true
}
```

## 環境變數

前台與後台 Vercel 必須設定同一組：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

## Vercel 部署設定

- Framework Preset: Next.js
- Root Directory: 留空
- Install Command: `npm ci --legacy-peer-deps --no-audit --no-fund`
- Build Command: `npm run build`
- Output Directory: 留空
- Node.js Version: 20.x

如果 GitHub 第一層直接看到 `package.json` 和 `app/`，Root Directory 留空。

## 建立資料表

在 Neon PostgreSQL SQL Editor 執行：

```txt
database/customers.sql
```

## 驗收流程

1. Neon 建立 `customers` 資料表
2. 前台 Vercel 設定 `DATABASE_URL`
3. 後台 Vercel 設定同一組 `DATABASE_URL`
4. 打開後台 `/api/health/db`，確認回傳 `{ "ok": true }`
5. 前台送出一筆測試資料
6. 後台首頁重新整理
7. 後台列表出現該筆資料
8. 後台切換成已審核
9. 重新整理後仍顯示已審核
10. 後台選刪除
11. 跳出確認視窗
12. 按確定後資料消失
