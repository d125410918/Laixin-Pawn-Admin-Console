import { NextRequest, NextResponse } from "next/server";
import { deleteCustomer, updateCustomerStatus } from "@/lib/customers";
import type { CustomerStatus } from "@/types/customer";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isCustomerStatus(value: unknown): value is CustomerStatus {
  return value === "pending" || value === "approved";
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();

    if (!cleanId) {
      return NextResponse.json(
        {
          ok: false,
          message: "缺少客戶 ID"
        },
        {
          status: 400
        }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      status?: unknown;
    } | null;

    if (!body || !isCustomerStatus(body.status)) {
      return NextResponse.json(
        {
          ok: false,
          message: "狀態只允許 pending 或 approved"
        },
        {
          status: 400
        }
      );
    }

    const customer = await updateCustomerStatus(cleanId, body.status);

    if (!customer) {
      return NextResponse.json(
        {
          ok: false,
          message: "找不到客戶資料"
        },
        {
          status: 404
        }
      );
    }

    return NextResponse.json({
      ok: true,
      customer
    });
  } catch (error) {
    console.error("PATCH /api/customers/[id] error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "更新審核狀態失敗"
      },
      {
        status: 500
      }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();

    if (!cleanId) {
      return NextResponse.json(
        {
          ok: false,
          message: "缺少客戶 ID"
        },
        {
          status: 400
        }
      );
    }

    const deleted = await deleteCustomer(cleanId);

    if (!deleted) {
      return NextResponse.json(
        {
          ok: false,
          message: "找不到客戶資料"
        },
        {
          status: 404
        }
      );
    }

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "刪除客戶資料失敗"
      },
      {
        status: 500
      }
    );
  }
}
