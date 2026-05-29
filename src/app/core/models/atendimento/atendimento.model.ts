export type TipoPagamento = 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';
export type StatusAtendimento = 'ABERTO' | 'ENCAMINHADO';

export interface AtendimentoItemRequest {
  codMedico?: number;
  codMedicalProcedure: number;
  transferValue?: number;
  price: number;
  transferValueCard?: number;
  priceCard: number;
}

export interface AtendimentoItemResponse {
  id: number;
  codAtendimento: number;
  codMedico?: number;
  nomeMedico?: string;
  codMedicalProcedure: number;
  nomeMedicalProcedure: string;
  transferValue?: number;
  price: number;
  transferValueCard?: number;
  priceCard: number;
}

export interface AtendimentoRequest {
  dataConsultaExame: string;
  codCliente: number;
  codClinica: number;
  parcelas: number;
  itens: AtendimentoItemRequest[];
}

export interface AtendimentoResponse {
  id: number;
  dataEmissao: string;
  codUsuario: number;
  nomeUsuario: string;
  dataConsultaExame: string;
  codCliente: number;
  nomeCliente: string;
  codClinica: number;
  nomeClinica: string;
  parcelas: number;
  status: StatusAtendimento;
  totalTransferValue: number;
  totalPrice: number;
  totalTransferValueCard: number;
  totalPriceCard: number;
  valorDesconto: number;
  valorAcrescimo: number;
}

export interface AtendimentoFilter {
  id?: number;
  nomeCliente?: string;
  clienteId?: number;
  nomeClinica?: string;
  clinicaId?: number;
  nomeUsuario?: string;
  usuarioId?: number;
  status?: StatusAtendimento;
  dataConsultaExameInicio?: string;
  dataConsultaExameFim?: string;
}

export interface AtendimentoPagamentoRequest {
  tipoPagamento: TipoPagamento;
  valor: number;
  parcelas?: number;
  valorDesconto?: number;
}

export interface AtendimentoPagamentoResponse {
  id: number;
  codAtendimento: number;
  tipoPagamento: TipoPagamento;
  valor: number;
  parcelas?: number;
  valorDesconto?: number;
}

export interface AtendimentoItemLocal {
  clinicId: number;
  clinicName: string;
  codMedico?: number;
  nomeMedico?: string;
  codMedicalProcedure: number;
  nomeMedicalProcedure: string;
  transferValue: number;
  price: number;
  transferValueCard: number;
  priceCard: number;
}
