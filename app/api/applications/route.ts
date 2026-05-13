import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;

    if (!body) {
      return NextResponse.json({ success: false, message: "資料格式錯誤" }, { status: 400 });
    }

    const name = text(body.name);
    const nationalId = text(body.nationalId);
    const city = text(body.city);
    const district = text(body.district) || null;
    const incomeType = text(body.incomeType) || "monthly";
    const incomeAmount = Number(body.incomeAmount ?? 0);
    const incomeLabel = text(body.incomeLabel);
    const collateral = text(body.collateral);
    const fundingNeed = text(body.fundingNeed);
    const selfieUrl = text(body.selfieUrl) || null;
    const idCardFrontUrl = text(body.idCardFrontUrl) || null;
    const idCardBackUrl = text(body.idCardBackUrl) || null;

    if (!name || !nationalId || !city || !collateral || !fundingNeed) {
      return NextResponse.json({ success: false, message: "缺少必要欄位" }, { status: 400 });
    }

    const sql = getSql();

    await sql`
      insert into customers (
        name,
        national_id,
        city,
        district,
        income_type,
        income_amount,
        income_label,
        collateral,
        funding_need,
        status,
        selfie_url,
        id_card_front_url,
        id_card_back_url,
        created_at,
        updated_at
      ) values (
        ${name},
        ${nationalId},
        ${city},
        ${district},
        ${incomeType},
        ${incomeAmount},
        ${incomeLabel},
        ${collateral},
        ${fundingNeed},
        ${"pending"},
        ${selfieUrl},
        ${idCardFrontUrl},
        ${idCardBackUrl},
        now(),
        now()
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "資料寫入失敗";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
