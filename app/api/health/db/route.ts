import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();

    await sql`
      SELECT 1 AS ok
    `;

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    console.error("GET /api/health/db error:", error);

    return NextResponse.json(
      {
        ok: false
      },
      {
        status: 500
      }
    );
  }
}
