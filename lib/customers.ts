import { getSql } from "./db";
import type { Customer, CustomerStatus } from "@/types/customer";

function stringOrNull(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function isoOrNow(value: unknown) {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    nationalId: String(row.national_id ?? ""),
    birthDate: null,
    phone: null,
    lineId: null,
    city: String(row.city ?? ""),
    area: String(row.district ?? ""),
    incomeText: String(row.income_label ?? ""),
    collateral: String(row.collateral ?? ""),
    fundingNeedText: String(row.funding_need ?? ""),
    status: row.status === "approved" ? "approved" : "pending",
    jobType: String(row.income_type ?? ""),
    workYears: String(row.income_amount ?? ""),
    hasPayrollOrLaborInsurance: null,
    fundingPurpose: null,
    emergencyName: null,
    emergencyPhone: null,
    emergencyRelation: null,
    selfieUrl: stringOrNull(row.selfie_url),
    idCardFrontUrl: stringOrNull(row.id_card_front_url),
    idCardBackUrl: stringOrNull(row.id_card_back_url),
    createdAt: isoOrNow(row.created_at),
    updatedAt: isoOrNow(row.updated_at)
  };
}

const customerSelect = `
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

export async function listCustomers() {
  const sql = getSql();
  const rows = await sql(customerSelect + " from customers order by created_at desc");
  const resultRows = rows as Record<string, unknown>[];
  return resultRows.map((row) => mapCustomer(row));
}

export async function updateCustomerStatus(id: string, status: CustomerStatus) {
  const sql = getSql();
  const rows = await sql`
    update customers
    set status = ${status}, updated_at = now()
    where id = ${id}
    returning
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

  const resultRows = rows as Record<string, unknown>[];
  if (resultRows.length === 0) return null;
  return mapCustomer(resultRows[0]);
}

export async function deleteCustomer(id: string) {
  const sql = getSql();
  const rows = await sql`
    delete from customers
    where id = ${id}
    returning id
  `;

  const resultRows = rows as Record<string, unknown>[];
  return resultRows.length > 0;
}
