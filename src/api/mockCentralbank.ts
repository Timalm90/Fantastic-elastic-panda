import type {
  IdentityTokenResponse,
  Stamp,
  TivoliApi,
  TransactionReceipt,
} from "./types";

const mockUser = {
  id: "user-1",
  name: "Rune Runesson",
};

function randomStamp(): Stamp {
  const animals = ["lion", "dolphin", "tucan", "beetlebug", "snake"] as const;
  const metals = ["silver", "gold", "platinum"] as const;

  const animal = animals[Math.floor(Math.random() * animals.length)];
  const hasMetal = Math.random() < 0.5;

  if (!hasMetal) return animal;

  const metal = metals[Math.floor(Math.random() * metals.length)];
  return `${metal} ${animal}`;
}

export const mockTivoliApi: TivoliApi = {
  async getIdentity(_token: string): Promise<IdentityTokenResponse> {
    return {
      user: mockUser,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  },

  async createTransaction(): Promise<TransactionReceipt> {
    return {
      id: crypto.randomUUID(),
      stamp: randomStamp(),
    };
  },

  async payOut(): Promise<void> {
    return;
  },
};
