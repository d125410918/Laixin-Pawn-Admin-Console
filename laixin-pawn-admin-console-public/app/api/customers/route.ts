import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await listCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "讀取客戶資料失敗" }, { status: 500 });
  }
}
