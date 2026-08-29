export const STATUS_OPTIONS: { label: string, value: boolean }[] = [
  { label: 'Ativo', value: true },
  { label: 'Inativo', value: false }
];

export const PROCEDURE_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Consulta', value: 'CONSULTA' },
  { label: 'Exame', value: 'EXAME' },
  { label: 'Cirurgia', value: 'CIRURGIA' },
  { label: 'Medicação', value: 'MEDICACAO' }
];

export const PROCEDURE_TYPE_FILTER_OPTIONS: { label: string; value: string | undefined }[] = [
  { label: 'Todos os Tipos', value: undefined },
  ...PROCEDURE_TYPE_OPTIONS
];

export const PAYMENT_PERIOD_OPTIONS: { label: string; value: string }[] = [
  { label: 'Diário', value: 'DIARIO' },
  { label: 'Semanal', value: 'SEMANAL' },
  { label: 'Quinzenal', value: 'QUINZENAL' },
  { label: 'Mensal', value: 'MENSAL' }
];

export const YES_NO_OPTIONS: { label: string; value: boolean }[] = [
  { label: 'Sim', value: true },
  { label: 'Não', value: false }
];