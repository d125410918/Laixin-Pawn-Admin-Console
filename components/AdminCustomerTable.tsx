"use client";

import { useEffect, useMemo, useState } from "react";
import type { Customer, CustomerStatus } from "@/types/customer";

type ApiListResponse = {
  customers: Customer[];
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function compactDetails(customer: Customer) {
  const parts = [
    customer.phone ? `手機 ${customer.phone}` : "",
    customer.lineId ? `LINE ${customer.lineId}` : "",
    customer.jobType ? `工作 ${customer.jobType}` : "",
    customer.workYears ? `年資 ${customer.workYears}` : "",
    customer.hasPayrollOrLaborInsurance ? `薪轉／勞保 ${customer.hasPayrollOrLaborInsurance}` : ""
  ].filter(Boolean);

  return parts.join("｜");
}

export default function AdminCustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => customers.filter((customer) => customer.status === "pending").length,
    [customers]
  );

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/customers", { cache: "no-store" });
      const data = await response.json().catch(() => null) as ({ message?: string } & Partial<ApiListResponse>) | null;

      if (!response.ok) {
        setError(data?.message || "讀取客戶資料失敗");
        return;
      }

      setCustomers(data?.customers || []);
    } catch {
      setError("讀取客戶資料失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function changeStatus(customer: Customer, nextValue: string) {
    if (nextValue === "delete") {
      const confirmed = window.confirm(`確定要刪除「${customer.name}」這筆客戶資料嗎？`);
      if (!confirmed) return;

      setWorkingId(customer.id);
      try {
        const response = await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
        if (!response.ok) {
          alert("刪除失敗");
          return;
        }

        setCustomers((current) => current.filter((item) => item.id !== customer.id));
      } catch {
        alert("刪除失敗");
      } finally {
        setWorkingId(null);
      }
      return;
    }

    const nextStatus = nextValue as CustomerStatus;
    if (nextStatus !== "pending" && nextStatus !== "approved") return;
    if (nextStatus === customer.status) return;

    const previousCustomers = customers;
    setCustomers((current) =>
      current.map((item) => item.id === customer.id ? { ...item, status: nextStatus } : item)
    );
    setWorkingId(customer.id);

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!response.ok) {
        setCustomers(previousCustomers);
        alert("更新狀態失敗");
        return;
      }

      const data = await response.json() as { customer: Customer };
      setCustomers((current) =>
        current.map((item) => item.id === customer.id ? data.customer : item)
      );
    } catch {
      setCustomers(previousCustomers);
      alert("更新狀態失敗");
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) {
    return <div className="loading-box">讀取中</div>;
  }

  if (error) {
    return <div className="empty-box">{error}</div>;
  }

  if (customers.length === 0) {
    return <div className="empty-box">目前沒有客戶資料。</div>;
  }

  return (
    <div>
      <div className="table-summary">
        <span>總筆數：{customers.length}</span>
        <span>未審核：{pendingCount}</span>
        <button type="button" onClick={() => void loadCustomers()}>重新整理</button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>姓名 / 身分證</th>
              <th>縣市</th>
              <th>月入 / 日薪</th>
              <th>當品</th>
              <th>資金需求</th>
              <th>送出時間</th>
              <th>審核狀態</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="name-cell">
                  <strong>{customer.name}</strong>
                  <span>{customer.nationalId}</span>
                  {compactDetails(customer) ? <small>{compactDetails(customer)}</small> : null}
                </td>
                <td>{customer.city}{customer.area}</td>
                <td className="money-text">{customer.incomeText}</td>
                <td>
                  <div>{customer.collateral}</div>
                  <div className="image-links inline-links">
                    {customer.selfieUrl ? <a href={customer.selfieUrl} target="_blank" rel="noreferrer">自拍</a> : null}
                    {customer.idCardFrontUrl ? <a href={customer.idCardFrontUrl} target="_blank" rel="noreferrer">身分證正面</a> : null}
                    {customer.idCardBackUrl ? <a href={customer.idCardBackUrl} target="_blank" rel="noreferrer">身分證反面</a> : null}
                  </div>
                </td>
                <td>
                  <strong>{customer.fundingNeedText}</strong>
                  {customer.fundingPurpose ? <small className="block-muted">用途：{customer.fundingPurpose}</small> : null}
                </td>
                <td className="time-text">{formatDateTime(customer.createdAt)}</td>
                <td>
                  <select
                    className="status-select"
                    value={customer.status}
                    disabled={workingId === customer.id}
                    onChange={(event) => void changeStatus(customer, event.target.value)}
                  >
                    <option value="pending">未審核</option>
                    <option value="approved">已審核</option>
                    <option value="delete">刪除</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
