import { ProcedureType } from "./procedure.model";

export interface ProcedureFilter {
  name?: string;
  type?: ProcedureType | string;
  status?: boolean | null;
}