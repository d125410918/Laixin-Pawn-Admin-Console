import { getSql } from "@/lib/db";
import type { Customer, CustomerStatus } from "@/types/customer";

type CustomerRow = {
  id: unknown;
  name: unknown;
  national_id: unknown;
  city: unknown;
  district: unknown;
  income_type: unknown;
  income_amount: unknown;
  income_label: unknown;
  collateral: unknown;
  funding_need: unknown;
  status: unknown;
  selfie_url: unknown;
  id_card_front_url: unknown;
  id_card_back_url: unknown;
  created_at: unknown;
  updated_at: unknown;
};

function stringOrNull(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isoOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeStatus(value: unknown): CustomerStatus {
  return value === "approved" ? "approved" : "pending";
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: String(row.id),
    name: stringOrNull(row.name),
    nationalId: stringOrNull(row.national_id),
    city: stringOrNull(row.city),
    district: stringOrNull(row.district),
    incomeType: stringOrNull(row.income_type),
    incomeAmount: numberOrNull(row.income_amount),
    incomeLabel: stringOrNull(row.income_label),
    collateral: stringOrNull(row.collateral),
    fundingNeed: stringOrNull(row.funding_need),
    status: normalizeStatus(row.status),
    selfieUrl: stringOrNull(row.selfie_url),
    idCardFrontUrl: stringOrNull(row.id_card_front_url),
    idCardBackUrl: stringOrNull(row.id_card_back_url),
    createdAt: isoOrNull(row.created_at),
    updatedAt: isoOrNull(row.updated_at)
  };
}

export async function listCustomers() {
  const sql = getSql();

  const rows = await sql`
    SELECT
      id,
      name,
      national_id,
      city,
      district,
      income_type,
      income_amount,
      income_label,
      collateral,
      funding_need,
      status,
      selfie_url,
      id_card_front_url,
      id_card_back_url,
      created_at,
      updated_at
    FROM customers
    ORDER BY created_at DESC
  `;

  return (rows as CustomerRow[]).map(mapCustomer);
}

export async function updateCustomerStatus(id: string, status: CustomerStatus) {
  const sql = getSql();

  const rows = await sql`
    UPDATE customers
    SET
      status = ${status},
      updated_at = NOW()
    WHERE id::text = ${id}
    RETURNING
      id,
      name,
      national_id,
      city,
      district,
      income_type,
      income_amount,
      income_label,
      collateral,
      funding_need,
      status,
      selfie_url,
      id_card_front_url,
      id_card_back_url,
      created_at,
      updated_at
  `;

  const resultRows = rows as CustomerRow[];

  if (resultRows.length === 0) {
    return null;
  }

  return mapCustomer(resultRows[0]);
}

export async function deleteCustomer(id: string) {
  const sql = getSql();

  const rows = await sql`
    DELETE FROM customers
    WHERE id::text = ${id}
    RETURNING id
  `;

  return rows.length > 0;
}
