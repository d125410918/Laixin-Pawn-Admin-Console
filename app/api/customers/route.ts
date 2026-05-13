import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await listCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "讀取客戶資料失敗";
    return NextResponse.json({ message }, { status: 500 });
  }
}
