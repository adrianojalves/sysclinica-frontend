import { AddressData } from "../address-data";

// Interface for doctor data matching DoctorResponseDTO
export interface Doctor {
  id: number;
  name: string;
  crm: string;
  status: boolean; // Maps to 'status' in ResponseDTO
  address: AddressData;
}