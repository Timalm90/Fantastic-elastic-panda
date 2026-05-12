import type {
  IdentityTokenResponse,
  TivoliApi,
  TransactionReceipt,
  CreateTransactionRequest,
  PayoutRequest,
  UUID,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_CENTRALBANK_API_URL;
const API_KEY = import.meta.env.VITE_TIVOLI_API_KEY;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw {
      message: `Request failed with status ${response.status}`,
      status: response.status,
    };
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const tivoliApi: TivoliApi = {
  getIdentity(token: string): Promise<IdentityTokenResponse> {
    return request<IdentityTokenResponse>(`/identity-tokens/${token}`);
  },

  createTransaction(
    requestBody: CreateTransactionRequest,
  ): Promise<TransactionReceipt> {
    return request<TransactionReceipt>("/transactions", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  },

  payOut(transactionId: UUID, requestBody: PayoutRequest): Promise<void> {
    return request<void>(`/transactions/${transactionId}/payout`, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  },
};
