"use client";

import { useEffect, useState } from "react";
import AdminCustomerTable from "@/components/AdminCustomerTable";
import type { Referrer } from "@/types/referrer";

type ReferrerResponse = {
  ok: boolean;
  referrers?: Referrer[];
  message?: string;
};

function text(value: string | null | undefined) {
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

export default function AdminModeSwitcher() {
  const [mode, setMode] = useState<"customers" | "referrers">("customers");
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReferrers() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/referrers", {
        method: "GET",
        cache: "no-store"
      });

      const data = (await response.json().catch(() => null)) as ReferrerResponse | null;

      if (!response.ok || !data?.ok) {
        setMessage(data?.message || "讀取介紹人資料失敗");
        setReferrers([]);
        return;
      }

      setReferrers(data.referrers || []);
    } catch {
      setMessage("讀取介紹人資料失敗");
      setReferrers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mode === "referrers") {
      void loadReferrers();
    }
  }, [mode]);

  return (
    <div>
      <div className="mode-switch-row">
        <button
          type="button"
          className={`mode-switch-button ${mode === "customers" ? "mode-switch-button-active" : ""}`}
          onClick={() => setMode("customers")}
        >
          客戶模式
        </button>

        <button
          type="button"
          className={`mode-switch-button ${mode === "referrers" ? "mode-switch-button-active" : ""}`}
          onClick={() => setMode("referrers")}
        >
          介紹人模式
        </button>
      </div>

      {mode === "customers" ? (
        <AdminCustomerTable />
      ) : (
        <div>
          {message ? <div className="error-box">{message}</div> : null}

          {loading ? (
            <div className="loading-box">讀取中</div>
          ) : referrers.length === 0 ? (
            <div className="empty-box">目前沒有介紹人資料。</div>
          ) : (
            <div className="table-scroll">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>手機號碼</th>
                    <th>身分證</th>
                    <th>建立時間</th>
                  </tr>
                </thead>

                <tbody>
                  {referrers.map((referrer) => (
                    <tr key={referrer.id}>
                      <td>
                        <span className="primary-text">{text(referrer.name)}</span>
                      </td>

                      <td>
                        <span className="primary-text">{text(referrer.phone)}</span>
                      </td>

                      <td>
                        <span className="primary-text">{text(referrer.identityNumber)}</span>
                      </td>

                      <td>
                        <span className="primary-text">{formatDateTime(referrer.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
