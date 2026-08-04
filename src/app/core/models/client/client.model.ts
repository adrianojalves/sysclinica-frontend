export interface Client {
  id: number;
  name: string;
  socialName?: string;
  cpf: string;
  phone: string;
  email?: string;
  biologicalSex?: 'MASCULINO' | 'FEMININO';
  sexualOrientation?: 'CIS' | 'TRANS' | 'NAO_BINARIO' | 'NAO_INFORMADO';
  birthDate?: string;
  firstAppointmentDate?: string;
  lastAppointmentDate?: string;
  address?: any;
}

export interface ClientFilter {
  name?: string;
  cpf?: string|null;
}

export interface ClientReportFilter {
  birthDateStart?: string;
  birthDateEnd?: string;
}