import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer, updateCustomerStatus } from "@/lib/customers";
import type { CustomerStatus } from "@/types/customer";

const allowedStatuses: CustomerStatus[] = ["pending", "approved"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as { status?: string } | null;
  const status = body?.status;

  if (!status || !allowedStatuses.includes(status as CustomerStatus)) {
    return NextResponse.json({ message: "狀態不正確" }, { status: 400 });
  }

  try {
    const customer = await updateCustomerStatus(id, status as CustomerStatus);
    if (!customer) {
      return NextResponse.json({ message: "找不到資料" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "更新狀態失敗" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const deleted = await deleteCustomer(id);
    if (!deleted) {
      return NextResponse.json({ message: "找不到資料" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "刪除失敗" }, { status: 500 });
  }
}
