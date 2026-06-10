// Enum matching the Backend ProcedureType
export enum ProcedureType {
  CONSULTA = 'CONSULTA',
  EXAME = 'EXAME',
  CIRURGIA = 'CIRURGIA',
  MEDICACAO = 'MEDICACAO'
}

// Interface representing the ProcedureResponseDTO
export interface MedicalProcedure {
  id: number;
  name: string;
  description?: string;
  type: ProcedureType;
  active: boolean;
}