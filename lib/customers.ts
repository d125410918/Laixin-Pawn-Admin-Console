import { getSql } from "@/lib/db";
import type { Customer, CustomerStatus } from "@/types/customer";

type CustomerRow = {
  id: unknown;
  name: unknown;
  birth_date: unknown;
  national_id: unknown;
  phone: unknown;
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

type DeletedCustomerRow = {
  id: unknown;
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
    birthDate: stringOrNull(row.birth_date),
    nationalId: stringOrNull(row.national_id),
    phone: stringOrNull(row.phone),
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

async function hasCustomerColumn(columnName: string) {
  const sql = getSql();

  const rows = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'customers'
      AND column_name = ${columnName}
    LIMIT 1
  `;

  return (rows as unknown[]).length > 0;
}

export async function listCustomers() {
  const sql = getSql();
  const hasPhone = await hasCustomerColumn("phone");

  const rows = hasPhone
    ? await sql`
        SELECT
          id,
          name,
          birth_date,
          national_id,
          phone,
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
      `
    : await sql`
        SELECT
          id,
          name,
          birth_date,
          national_id,
          NULL AS phone,
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
  const hasPhone = await hasCustomerColumn("phone");

  const rows = hasPhone
    ? await sql`
        UPDATE customers
        SET
          status = ${status},
          updated_at = NOW()
        WHERE id::text = ${id}
        RETURNING
          id,
          name,
          birth_date,
          national_id,
          phone,
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
      `
    : await sql`
        UPDATE customers
        SET
          status = ${status},
          updated_at = NOW()
        WHERE id::text = ${id}
        RETURNING
          id,
          name,
          birth_date,
          national_id,
          NULL AS phone,
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

  const resultRows = rows as DeletedCustomerRow[];
  return resultRows.length > 0;
}
