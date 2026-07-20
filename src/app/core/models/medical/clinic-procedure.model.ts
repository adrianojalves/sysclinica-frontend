export interface ClinicDoctorProcedure {
  id?: number;
  clinicId: number;
  clinicName?: string;
  doctorId: number;
  doctorName?: string;
  medicalProcedureId: number;
  procedureName?: string;
  procedureType?: string;
  procedureTag?: string;
  transferValue: number;
  price: number;
  transferValueCard: number;
  priceCard: number;
  pricePartner?: number;
  codigoClinica?: string;
}

export interface ClinicDoctorProcedureFilter {
  clinicId?: number;
  clinicName?: string;
  doctorId?: number;
  doctorName?: string;
  medicalProcedureId?: number;
  procedureName?: string;
}