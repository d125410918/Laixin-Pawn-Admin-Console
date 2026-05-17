import { getSql } from "@/lib/db";
import type { Referrer } from "@/types/referrer";

type ReferrerRow = {
  id: unknown;
  name: unknown;
  phone: unknown;
  identity_number: unknown;
  created_at: unknown;
};

function stringOrNull(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
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

function mapReferrer(row: ReferrerRow): Referrer {
  return {
    id: String(row.id),
    name: stringOrNull(row.name),
    phone: stringOrNull(row.phone),
    identityNumber: stringOrNull(row.identity_number),
    createdAt: isoOrNull(row.created_at)
  };
}

export async function listReferrers() {
  const sql = getSql();

  const rows = await sql`
    SELECT
      id,
      name,
      phone,
      identity_number,
      created_at
    FROM referrers
    ORDER BY created_at DESC
  `;

  return (rows as ReferrerRow[]).map(mapReferrer);
}
