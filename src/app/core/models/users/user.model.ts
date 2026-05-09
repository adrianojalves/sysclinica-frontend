import { Role } from "./role-model";

/**
 * Representation of the User entity matching UserResponseDTO.
 */
export interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  phone: string;
  active: boolean;
  roles: Role[];
}