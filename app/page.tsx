import AdminCustomerTable from "@/components/AdminCustomerTable";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="admin-header">
        <div>
          <h1 className="admin-title">徠鑫當鋪客戶審核後台</h1>
          <p className="admin-subtitle">
            Laixin Pawn Admin Console。首頁直接顯示所有客戶資料，依送出時間由新到舊排序。
          </p>
        </div>
      </header>

      <section className="card">
        <AdminCustomerTable />
      </section>
    </main>
  );
}
