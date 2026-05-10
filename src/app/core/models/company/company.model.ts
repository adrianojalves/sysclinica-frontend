import { AddressData } from '../address-data';

export interface Company {
  id?: number;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email: string;
  logoUrl?: string;
  address: AddressData;
}