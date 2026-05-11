import { AddressData } from "../address-data";

export interface Clinic {
  id: number;
  name: string;
  cnpj: string;
  fone1: string;
  fone2?: string;
  site?: string;
  email: string;
  active: boolean;
  percentual: number;
  address: AddressData;
}

export interface ClinicFilter {
  name?: string;
  cnpj?: string;
}