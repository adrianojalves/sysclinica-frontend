export interface ClinicDoctorProcedure {
  id?: number;
  clinicId: number;
  clinicName?: string;
  doctorId: number;
  doctorName?: string;
  medicalProcedureId: number;
  procedureName?: string;
  procedureType?: string;
  transferValue: number;
  price: number;
  transferValueCard: number;
  priceCard: number;
  pricePartner?: number;
}

export interface ClinicDoctorProcedureFilter {
  clinicId?: number;
  clinicName?: string;
  doctorId?: number;
  doctorName?: string;
  medicalProcedureId?: number;
  procedureName?: string;
}