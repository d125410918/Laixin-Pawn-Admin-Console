import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAIWAN_ID_CODES: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
  K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
  U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};

const cities = [
  "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
  "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣",
  "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
  "台東縣", "澎湖縣", "金門縣", "連江縣"
];

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(databaseUrl);
}

function asText(value: unknown) {
  return String(value ?? "").trim();
}

function asNullableText(value: unknown) {
  const text = asText(value);
  return text.length > 0 ? text : null;
}

function isValidTaiwanId(value: string) {
  const id = String(value || "").toUpperCase();
  if (!/^[A-Z][12]\d{8}$/.test(id)) return false;

  const code = TAIWAN_ID_CODES[id[0]];
  if (!code) return false;

  const digits = [
    Math.floor(code / 10),
    code % 10,
    ...id.slice(1).split("").map((x) => Number(x)),
  ];

  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
  const sum = digits.reduce((total, digit, index) => total + digit * weights[index], 0);

  return sum % 10 === 0;
}

function isValidBirthDate(value: string) {
  if (!/^\d{8}$/.test(value || "")) return false;

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));

  if (year < 1911 || year > new Date().getFullYear()) return false;

  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

function parseFundingNeed(value: unknown) {
  const text = asText(value);
  if (!/^\d{1,4}$/.test(text)) return 0;
  return Number(text) * 10000;
}

function validate(body: any) {
  if (!asText(body.name)) return "請填寫姓名";
  if (!isValidBirthDate(asText(body.birthDate))) return "出生年月日請輸入 8 位西元日期，例如 19990101";
  if (!isValidTaiwanId(asText(body.identityNumber))) return "請填寫正確的身分證字號";
  if (!/^09\d{8}$/.test(asText(body.phone))) return "手機號碼格式不正確";
  if (!/^[A-Za-z0-9._@-]{2,50}$/.test(asText(body.lineId))) return "LINE ID 格式不正確，不能輸入中文";
  if (!cities.includes(asText(body.city))) return "請選擇現居縣市";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s\-]{1,30}$/.test(asText(body.area))) return "現居區域格式不正確";
  if (!["正職", "兼職", "自營", "臨時工", "其他"].includes(asText(body.jobType))) return "請選擇工作類型";
  if (!/^[A-Za-z0-9._@\-\/\s]{1,20}$/.test(asText(body.workYears))) return "任職年資格式不正確，不能輸入中文";
  if (!["2萬以下", "2萬至4萬", "4萬至6萬", "6萬以上"].includes(asText(body.incomeRange))) return "請選擇月收入區間";
  if (!["都有", "只有薪轉", "只有勞保", "都沒有"].includes(asText(body.hasPayrollOrLaborInsurance))) return "請選擇是否有薪轉／勞保";
  if (!/^\d{1,4}$/.test(asText(body.fundingAmountWan))) return "資金需求請輸入數字";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s，。,.、；;：:（）()\-／/]{2,200}$/.test(asText(body.fundingPurpose))) return "資金用途格式不正確";
  if (!["汽車", "機車", "無當", "其他"].includes(asText(body.pawnItem))) return "請選擇當品";
  if (!asText(body.emergencyName)) return "請填寫緊急聯絡人姓名";
  if (!/^09\d{8}$/.test(asText(body.emergencyPhone))) return "緊急聯絡人電話格式不正確";
  if (!asText(body.emergencyRelation)) return "請填寫緊急聯絡人關係";
  if (body.agreeFollowUp !== true) return "請同意後續補件審核";
  if (body.agreePrivacy !== true) return "請同意個資蒐集與使用";
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const error = validate(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 }
      );
    }

    const sql = getSql();
    const identityNumber = asText(body.identityNumber).toUpperCase();
    const fundingAmountWan = asText(body.fundingAmountWan);
    const fundingNeed = parseFundingNeed(fundingAmountWan);

    const rows = await sql`
      insert into customers (
        name,
        national_id,
        birth_date,
        phone,
        line_id,
        city,
        area,
        job_type,
        work_years,
        income_range,
        income_type,
        income_amount,
        daily_income_amount,
        has_payroll_or_labor_insurance,
        funding_amount_wan,
        funding_need,
        funding_purpose,
        pawn_item,
        collateral,
        emergency_name,
        emergency_phone,
        emergency_relation,
        status,
        selfie_url,
        id_card_front_url,
        id_card_back_url
      ) values (
        ${asText(body.name)},
        ${identityNumber},
        ${asText(body.birthDate)},
        ${asText(body.phone)},
        ${asText(body.lineId)},
        ${asText(body.city)},
        ${asText(body.area)},
        ${asText(body.jobType)},
        ${asText(body.workYears)},
        ${asText(body.incomeRange)},
        ${"monthly"},
        ${0},
        ${0},
        ${asText(body.hasPayrollOrLaborInsurance)},
        ${fundingAmountWan},
        ${fundingNeed},
        ${asText(body.fundingPurpose)},
        ${asText(body.pawnItem)},
        ${asText(body.pawnItem)},
        ${asText(body.emergencyName)},
        ${asText(body.emergencyPhone)},
        ${asText(body.emergencyRelation)},
        ${"pending"},
        ${asNullableText(body.selfieUrl)},
        ${asNullableText(body.idCardFrontUrl)},
        ${asNullableText(body.idCardBackUrl)}
      )
      returning id, status, created_at
    `;

    const saved = rows[0] as { id: string; status: string; created_at: string } | undefined;
    if (!saved?.id) {
      return NextResponse.json(
        { success: false, message: "資料寫入失敗" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "申請成功",
      data: {
        id: saved.id,
        status: saved.status,
        createdAt: saved.created_at,
      },
    });
  } catch (error) {
    console.error("Application submit failed:", error);

    return NextResponse.json(
      { success: false, message: "系統錯誤，資料未寫入" },
      { status: 500 }
    );
  }
}
