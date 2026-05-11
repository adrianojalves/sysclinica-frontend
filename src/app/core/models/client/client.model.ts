// client.model.ts
export interface Client {
  id: number;
  name: string;
  socialName?: string;
  cpf: string;
  phone: string;
}

export interface ClientFilter {
  name?: string;
  cpf?: string|null;
}