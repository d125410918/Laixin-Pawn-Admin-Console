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

function numberText(value: unknown) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number) || number <= 0) return "";
  return new Intl.NumberFormat("zh-TW").format(number);
}

function mapCustomer(row: Record<string, unknown>): Customer {
  const incomeRange = String(row.income_range ?? "").trim();
  const incomeType = String(row.income_type ?? "monthly");
  const incomeAmount = Number(row.income_amount ?? 0);
  const dailyIncomeAmount = Number(row.daily_income_amount ?? 0);
  const incomeText = incomeRange
    ? `月入 ${incomeRange}`
    : incomeType === "daily"
      ? `日薪 ${numberText(dailyIncomeAmount || incomeAmount)}`
      : `月入 ${numberText(incomeAmount)}`;

  const fundingAmountWan = String(row.funding_amount_wan ?? "").trim();
  const fundingNeedText = fundingAmountWan
    ? `${fundingAmountWan}萬`
    : numberText(row.funding_need);

  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    nationalId: String(row.national_id ?? ""),
    birthDate: stringOrNull(row.birth_date),
    phone: stringOrNull(row.phone),
    lineId: stringOrNull(row.line_id),
    city: String(row.city ?? ""),
    area: String(row.area ?? ""),
    incomeText,
    collateral: String(row.pawn_item ?? row.collateral ?? ""),
    fundingNeedText,
    status: row.status === "approved" ? "approved" : "pending",
    jobType: stringOrNull(row.job_type),
    workYears: stringOrNull(row.work_years),
    hasPayrollOrLaborInsurance: stringOrNull(row.has_payroll_or_labor_insurance),
    fundingPurpose: stringOrNull(row.funding_purpose),
    emergencyName: stringOrNull(row.emergency_name),
    emergencyPhone: stringOrNull(row.emergency_phone),
    emergencyRelation: stringOrNull(row.emergency_relation),
    selfieUrl: stringOrNull(row.selfie_url),
    idCardFrontUrl: stringOrNull(row.id_card_front_url),
    idCardBackUrl: stringOrNull(row.id_card_back_url),
    createdAt: isoOrNow(row.created_at),
    updatedAt: isoOrNow(row.updated_at)
  };
}

export async function listCustomers() {
  const sql = getSql();
  const rows = await sql`
    select
      id,
      name,
      national_id,
      birth_date,
      phone,
      line_id,
      city,
      area,
      job_type,
      work_years,
      income_range,
      income_type,
      income_amount,
      daily_income_amount,
      has_payroll_or_labor_insurance,
      funding_amount_wan,
      funding_need,
      funding_purpose,
      pawn_item,
      collateral,
      emergency_name,
      emergency_phone,
      emergency_relation,
      status,
      selfie_url,
      id_card_front_url,
      id_card_back_url,
      created_at,
      updated_at
    from customers
    order by created_at desc
  `;

  const resultRows = rows as Record<string, unknown>[];
  return resultRows.map((row) => mapCustomer(row));
}

export async function updateCustomerStatus(id: string, status: CustomerStatus) {
  const sql = getSql();
  const rows = await sql`
    update customers
    set status = ${status},
        updated_at = now()
    where id = ${id}
    returning
      id,
      name,
      national_id,
      birth_date,
      phone,
      line_id,
      city,
      area,
      job_type,
      work_years,
      income_range,
      income_type,
      income_amount,
      daily_income_amount,
      has_payroll_or_labor_insurance,
      funding_amount_wan,
      funding_need,
      funding_purpose,
      pawn_item,
      collateral,
      emergency_name,
      emergency_phone,
      emergency_relation,
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
