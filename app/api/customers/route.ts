import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await listCustomers();

    return NextResponse.json({
      ok: true,
      customers
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "讀取客戶資料失敗"
      },
      {
        status: 500
      }
    );
  }
}
