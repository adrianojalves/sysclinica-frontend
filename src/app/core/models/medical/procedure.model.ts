// Enum matching the Backend ProcedureType
export enum ProcedureType {
  EXAME = 'EXAME',
  CONSULTA = 'CONSULTA'
}

// Interface representing the ProcedureResponseDTO
export interface MedicalProcedure {
  id: number;
  name: string;
  description?: string;
  type: ProcedureType;
  active: boolean;
}