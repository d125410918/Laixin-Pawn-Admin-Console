export type CustomerStatus = "pending" | "approved";

export type Customer = {
  id: string;
  name: string;
  nationalId: string;
  birthDate: string | null;
  phone: string | null;
  lineId: string | null;
  city: string;
  area: string;
  incomeText: string;
  collateral: string;
  fundingNeedText: string;
  status: CustomerStatus;
  jobType: string | null;
  workYears: string | null;
  hasPayrollOrLaborInsurance: string | null;
  fundingPurpose: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  emergencyRelation: string | null;
  selfieUrl: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
