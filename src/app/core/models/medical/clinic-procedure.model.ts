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
}

export interface ClinicDoctorProcedureFilter {
  clinicId?: number;
  doctorId?: number;
  medicalProcedureId?: number;
}