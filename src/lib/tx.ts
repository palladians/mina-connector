export enum TransactionKind {
  PAYMENT = "payment",
  STAKE_DELEGATION = "delegation",
  ZK_APP = "zkApp",
}

export type TransactionBody = {
  type: "payment" | "delegation" | "zkApp";
  to: string;
  from: string;
  fee: number;
  nonce: number;
  amount?: number;
  memo?: string;
  validUntil?: number;
  blockHeight?: number;
  token?: string;
  hash?: string;
  failureReason?: string;
  dateTime?: string;
  isDelegation?: boolean;
  kind?: TransactionKind;
};

export function constructPaymentTx(payment: TransactionBody) {
  const sendFee = payment.fee;
  const sendAmount = payment.amount ?? 0;
  const memo = payment.memo || "";
  const validUntil = payment.validUntil ? payment.validUntil : 4294967295; // Mina Signer has a defaultValidUntil = '4294967295';

  return {
    to: payment.to,
    from: payment.from,
    amount: sendAmount,
    fee: sendFee,
    nonce: payment.nonce,
    memo: memo,
    validUntil: validUntil,
    type: TransactionKind.PAYMENT,
  };
}
