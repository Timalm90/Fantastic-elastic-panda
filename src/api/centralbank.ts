import type {
  CentralbankApi,
  TransactionReceipt,
  TransactionRequest,
  User,
  UUID,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_CENTRALBANK_API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw {
      message: `Request failed with status ${response.status}`,
      status: response.status,
    };
  }

  return response.json() as Promise<T>;
}

export const centralbankApi: CentralbankApi = {
  async getCurrentUser(): Promise<User> {
    const userId = localStorage.getItem("tivoli-user-id");

    if (!userId) {
      throw {
        message: "No user id found in localStorage",
      };
    }

    return request<User>(`/users/${userId}`);
  },

  getUser(id: UUID): Promise<User> {
    return request<User>(`/users/${id}`);
  },

  createTransaction(
    requestBody: TransactionRequest,
  ): Promise<TransactionReceipt> {
    return request<TransactionReceipt>("/transactions", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  },
};
