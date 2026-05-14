"use client";

import { useEffect, useMemo, useState } from "react";
import type { Customer, CustomerStatus } from "@/types/customer";

type CustomerListResponse = {
  ok: boolean;
  customers?: Customer[];
  message?: string;
};

type CustomerMutationResponse = {
  ok: boolean;
  customer?: Customer;
  message?: string;
};

const statusLabels: Record<CustomerStatus, string> = {
  pending: "未審核",
  approved: "已審核"
};

function text(value: string | number | null | undefined) {
  const result = String(value ?? "").trim();
  return result || "-";
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function parseBirthDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const dateText = String(value).trim();

  if (/^\d{8}$/.test(dateText)) {
    const year = Number(dateText.slice(0, 4));
    const month = Number(dateText.slice(4, 6));
    const day = Number(dateText.slice(6, 8));
    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatAgeInYears(value: string | null | undefined) {
  const birthDate = parseBirthDate(value);

  if (!birthDate) {
    return "";
  }

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassedThisYear) {
    years -= 1;
  }

  if (years < 0) {
    return "";
  }

  return `（${years}歲）`;
}

function formatIncome(customer: Customer) {
  if (customer.incomeLabel) {
    return customer.incomeLabel;
  }

  if (customer.incomeAmount !== null && customer.incomeAmount !== undefined) {
    const amount = new Intl.NumberFormat("zh-TW").format(customer.incomeAmount);

    if (customer.incomeType === "daily") {
      return `日薪 ${amount}`;
    }

    return `月收入 ${amount}`;
  }

  return "-";
}

export default function AdminCustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");

  const pendingCount = useMemo(
    () => customers.filter((customer) => customer.status === "pending").length,
    [customers]
  );

  const approvedCount = useMemo(
    () => customers.filter((customer) => customer.status === "approved").length,
    [customers]
  );

  async function loadCustomers() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/customers", {
        method: "GET",
        cache: "no-store"
      });

      const data = (await response.json().catch(() => null)) as CustomerListResponse | null;

      if (!response.ok || !data?.ok) {
        setMessage(data?.message || "讀取客戶資料失敗");
        setCustomers([]);
        return;
      }

      setCustomers(data.customers || []);
    } catch {
      setMessage("讀取客戶資料失敗");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function changeStatus(customer: Customer, nextValue: string) {
    const id = customer.id;
    const currentStatus = customer.status;

    if (nextValue === "delete") {
      const confirmed = window.confirm(`確定要刪除「${text(customer.name)}」這筆客戶資料嗎？`);

      if (!confirmed) {
        setCustomers((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: currentStatus
                }
              : item
          )
        );

        return;
      }

      setWorkingId(id);
      setMessage("");

      try {
        const response = await fetch(`/api/customers/${encodeURIComponent(id)}`, {
          method: "DELETE"
        });

        const data = (await response.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
        } | null;

        if (!response.ok || !data?.ok) {
          setMessage(data?.message || "刪除客戶資料失敗");
          return;
        }

        setCustomers((current) => current.filter((item) => item.id !== id));
      } catch {
        setMessage("刪除客戶資料失敗");
      } finally {
        setWorkingId("");
      }

      return;
    }

    if (nextValue !== "pending" && nextValue !== "approved") {
      setMessage("狀態只允許 pending 或 approved");
      return;
    }

    if (nextValue === currentStatus) {
      return;
    }

    const nextStatus = nextValue as CustomerStatus;
    const previousCustomers = customers;

    setCustomers((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus
            }
          : item
      )
    );

    setWorkingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/customers/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus
        })
      });

      const data = (await response.json().catch(() => null)) as CustomerMutationResponse | null;

      if (!response.ok || !data?.ok || !data.customer) {
        setCustomers(previousCustomers);
        setMessage(data?.message || "更新審核狀態失敗");
        return;
      }

      setCustomers((current) =>
        current.map((item) => (item.id === id ? data.customer as Customer : item))
      );
    } catch {
      setCustomers(previousCustomers);
      setMessage("更新審核狀態失敗");
    } finally {
      setWorkingId("");
    }
  }

  if (loading) {
    return <div className="loading-box">讀取中</div>;
  }

  return (
    <div>
      <div className="table-summary">
        <span>總筆數：{customers.length}</span>
        <span>未審核：{pendingCount}</span>
        <span>已審核：{approvedCount}</span>
        <button
          type="button"
          className="refresh-button"
          onClick={() => void loadCustomers()}
          disabled={loading}
        >
          重新整理
        </button>
      </div>

      {message ? <div className="error-box">{message}</div> : null}

      {customers.length === 0 ? (
        <div className="empty-box">目前沒有客戶資料。</div>
      ) : (
        <div className="table-scroll">
          <table className="customer-table">
            <thead>
              <tr>
                <th>姓名與身分證</th>
                <th>手機號碼</th>
                <th>縣市與區域</th>
                <th>月入或日薪</th>
                <th>當品/自拍/身分證</th>
                <th>資金需求</th>
                <th>審核狀態</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span className="primary-text">
                      {text(customer.name)}
                      {formatAgeInYears(customer.birthDate)}
                    </span>
                    <span className="muted-text">{text(customer.nationalId)}</span>
                    <div className="time-text">送出：{formatDateTime(customer.createdAt)}</div>
                  </td>

                  <td>
                    <span className="primary-text">{text(customer.phone)}</span>
                    <span className="muted-text">LINE ID：{text(customer.lineId)}</span>
                  </td>

                  <td>
                    <span className="primary-text">{text(customer.city)}</span>
                    <span className="muted-text">{text(customer.district)}</span>
                  </td>

                  <td>
                    <span className="primary-text">{formatIncome(customer)}</span>
                    <span className="muted-text">{text(customer.incomeType)}</span>
                  </td>

                  <td>
                    <span className="primary-text">{text(customer.collateral)}</span>
                    <ImageLinks customer={customer} />
                  </td>

                  <td>
                    <span className="primary-text">{text(customer.fundingNeed)}</span>
                  </td>

                  <td>
                    <select
                      className={`status-select status-select-${customer.status}`}
                      value={customer.status}
                      disabled={workingId === customer.id}
                      onChange={(event) => void changeStatus(customer, event.target.value)}
                    >
                      <option value="pending">{statusLabels.pending}</option>
                      <option value="approved">{statusLabels.approved}</option>
                      <option value="delete">刪除</option>
                    </select>

                    <div className="time-text">更新：{formatDateTime(customer.updatedAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ImageLinks({
  customer
}: {
  customer: Customer;
}) {
  const links = [
    {
      label: "自拍照",
      url: customer.selfieUrl
    },
    {
      label: "正面",
      url: customer.idCardFrontUrl
    },
    {
      label: "反面",
      url: customer.idCardBackUrl
    }
  ].filter((item) => Boolean(item.url));

  if (links.length === 0) {
    return <span className="muted-text">無照片</span>;
  }

  return (
    <div className="image-links">
      {links.map((item) => (
        <a
          key={item.label}
          href={item.url || "#"}
          target="_blank"
          rel="noreferrer"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
