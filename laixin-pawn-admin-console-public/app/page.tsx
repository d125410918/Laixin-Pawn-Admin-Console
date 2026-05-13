import AdminCustomerTable from "@/components/AdminCustomerTable";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="admin-header">
        <div>
          <h1>來新當鋪客戶審核後台</h1>
          <p className="sub-text">Laixin Pawn Admin Console。預設依照送出時間由新到舊排序。</p>
        </div>
      </header>

      <section className="card table-card">
        <AdminCustomerTable />
      </section>
    </main>
  );
}
