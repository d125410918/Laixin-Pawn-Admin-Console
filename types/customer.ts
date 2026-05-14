export type CustomerStatus = "pending" | "approved";

export type Customer = {
  id: string;
  name: string | null;
  birthDate: string | null;
  nationalId: string | null;
  phone: string | null;
  lineId: string | null;
  city: string | null;
  district: string | null;
  jobType: string | null;
  incomeType: string | null;
  incomeAmount: number | null;
  incomeLabel: string | null;
  collateral: string | null;
  fundingNeed: string | null;
  fundingPurpose: string | null;
  status: CustomerStatus;
  selfieUrl: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
