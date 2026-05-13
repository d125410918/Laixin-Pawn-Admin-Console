import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer, updateCustomerStatus } from "@/lib/customers";
import type { CustomerStatus } from "@/types/customer";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isStatus(value: unknown): value is CustomerStatus {
  return value === "pending" || value === "approved";
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => null) as { status?: unknown } | null;

    if (!body || !isStatus(body.status)) {
      return NextResponse.json({ message: "審核狀態不正確" }, { status: 400 });
    }

    const customer = await updateCustomerStatus(id, body.status);
    if (!customer) {
      return NextResponse.json({ message: "找不到客戶資料" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新狀態失敗";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteCustomer(id);

    if (!deleted) {
      return NextResponse.json({ message: "找不到客戶資料" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "刪除客戶資料失敗";
    return NextResponse.json({ message }, { status: 500 });
  }
}
