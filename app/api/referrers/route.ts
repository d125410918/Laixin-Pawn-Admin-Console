import { NextResponse } from "next/server";
import { listReferrers } from "@/lib/referrers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const referrers = await listReferrers();

    return NextResponse.json({
      ok: true,
      referrers
    });
  } catch (error) {
    console.error("GET /api/referrers error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "讀取介紹人資料失敗"
      },
      {
        status: 500
      }
    );
  }
}
