export type CustomerStatus = "pending" | "approved";

export type Customer = {
  id: string;
  name: string | null;
  nationalId: string | null;
  city: string | null;
  district: string | null;
  incomeType: string | null;
  incomeAmount: number | null;
  incomeLabel: string | null;
  collateral: string | null;
  fundingNeed: string | null;
  status: CustomerStatus;
  selfieUrl: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
