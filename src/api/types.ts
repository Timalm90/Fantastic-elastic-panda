export type UUID = string;

export type Animal = "lion" | "dolphin" | "tucan" | "beetlebug" | "snake";
export type Metal = "silver" | "gold" | "platinum";
export type Stamp = Animal | `${Metal} ${Animal}`;

export interface User {
  readonly uuid: UUID;
  firstname: string;
  lastname: string;
  saldo: number;
  stamps: Stamp[];
  github?: string;
  url?: string;
}

export interface TransactionRequest {
  seller: UUID;
  buyer: UUID;
  amount: number;
}

export interface TransactionReceipt {
  readonly uuid: UUID;
  seller: UUID;
  buyer: UUID;
  amount: number;
  stamp: Stamp;
}

export interface CentralbankApi {
  getCurrentUser(): Promise<User>;
  getUser(id: UUID): Promise<User>;
  createTransaction(request: TransactionRequest): Promise<TransactionReceipt>;
}
