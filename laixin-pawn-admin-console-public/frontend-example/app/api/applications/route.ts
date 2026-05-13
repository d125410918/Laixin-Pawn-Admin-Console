import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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

let cachedSql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (cachedSql) return cachedSql;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }
  cachedSql = neon(databaseUrl);
  return cachedSql;
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

function validate(body: any) {
  if (!String(body.name || "").trim()) return "請填寫姓名";
  if (!isValidBirthDate(body.birthDate)) return "出生年月日請輸入 8 位西元日期，例如 19990101";
  if (!isValidTaiwanId(body.identityNumber)) return "請填寫正確的身分證字號";
  if (!/^09\d{8}$/.test(body.phone || "")) return "手機號碼格式不正確";
  if (!/^[A-Za-z0-9._@-]{2,50}$/.test(body.lineId || "")) return "LINE ID 格式不正確，不能輸入中文";
  if (!cities.includes(body.city)) return "請選擇現居縣市";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s\-]{1,30}$/.test(body.area || "")) return "現居區域格式不正確";
  if (!["正職", "兼職", "自營", "臨時工", "其他"].includes(body.jobType)) return "請選擇工作類型";
  if (!/^[A-Za-z0-9._@\-\/\s]{1,20}$/.test(body.workYears || "")) return "任職年資格式不正確，不能輸入中文";
  if (!["2萬以下", "2萬至4萬", "4萬至6萬", "6萬以上"].includes(body.incomeRange)) return "請選擇月收入區間";
  if (!["都有", "只有薪轉", "只有勞保", "都沒有"].includes(body.hasPayrollOrLaborInsurance)) return "請選擇是否有薪轉／勞保";
  if (!/^\d{1,4}$/.test(body.fundingAmountWan || "")) return "資金需求請輸入數字";
  if (!/^[\u4e00-\u9fa5A-Za-z0-9\s，。,.、；;：:（）()\-／/]{2,200}$/.test(body.fundingPurpose)) return "資金用途格式不正確";
  if (!["汽車", "機車", "無當", "其他"].includes(body.pawnItem)) return "請選擇當品";
  if (!String(body.emergencyName || "").trim()) return "請填寫緊急聯絡人姓名";
  if (!/^09\d{8}$/.test(body.emergencyPhone || "")) return "緊急聯絡人電話格式不正確";
  if (!String(body.emergencyRelation || "").trim()) return "請填寫緊急聯絡人關係";
  if (body.agreeFollowUp !== true) return "請同意後續補件審核";
  if (body.agreePrivacy !== true) return "請同意個資蒐集與使用";
  return "";
}

function numberFromWan(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return amount * 10000;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const error = validate(body);
    if (error) {
      return NextResponse.json({ success: false, message: error }, { status: 400 });
    }

    const sql = getSql();
    const identityNumber = String(body.identityNumber).toUpperCase();
    const fundingNeed = numberFromWan(String(body.fundingAmountWan));

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
        ${String(body.name).trim()},
        ${identityNumber},
        ${String(body.birthDate)},
        ${String(body.phone)},
        ${String(body.lineId)},
        ${String(body.city)},
        ${String(body.area)},
        ${String(body.jobType)},
        ${String(body.workYears)},
        ${String(body.incomeRange)},
        ${"monthly"},
        ${0},
        ${String(body.hasPayrollOrLaborInsurance)},
        ${String(body.fundingAmountWan)},
        ${fundingNeed},
        ${String(body.fundingPurpose)},
        ${String(body.pawnItem)},
        ${String(body.pawnItem)},
        ${String(body.emergencyName)},
        ${String(body.emergencyPhone)},
        ${String(body.emergencyRelation)},
        ${"pending"},
        ${body.selfieUrl ? String(body.selfieUrl) : null},
        ${body.idCardFrontUrl ? String(body.idCardFrontUrl) : null},
        ${body.idCardBackUrl ? String(body.idCardBackUrl) : null}
      )
      returning id, status
    `;

    return NextResponse.json({
      success: true,
      message: "申請成功",
      data: {
        id: rows[0].id,
        status: rows[0].status,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "系統錯誤" }, { status: 500 });
  }
}
