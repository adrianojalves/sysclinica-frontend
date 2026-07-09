export interface Log {
  id: number;
  dataHora: string;
  log: string;
  codUsuario: number;
  nomeUsuario: string;
}

export interface LogFilter {
  id?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  userId?: number;
  userName?: string;
  log?: string;
}

export interface LogRequest {
  log: string;
  codUsuario: number;
}

export interface LogUpdate {
  log: string;
}
