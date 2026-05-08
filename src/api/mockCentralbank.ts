import type {
  CentralbankApi,
  Stamp,
  TransactionReceipt,
  TransactionRequest,
  User,
} from "./types.ts";

const mockUser: User = {
  uuid: "user-1",
  firstname: "Rune",
  lastname: "Runesson",
  saldo: 100,
  stamps: [],
};

const mockGroupId = "group-fantastic-elastic-panda";

function randomStamp(): Stamp {
  const animals = ["lion", "dolphin", "tucan", "beetlebug", "snake"] as const;
  const metals = ["silver", "gold", "platinum"] as const;

  const animal = animals[Math.floor(Math.random() * animals.length)];
  const hasMetal = Math.random() < 0.5;

  if (!hasMetal) return animal;

  const metal = metals[Math.floor(Math.random() * metals.length)];
  return `${metal} ${animal}`;
}

export const mockCentralbankApi: CentralbankApi = {
  async getCurrentUser(): Promise<User> {
    return structuredClone(mockUser);
  },

  async getUser(id: string): Promise<User> {
    if (id !== mockUser.uuid) {
      throw {
        message: "User not found",
        status: 404,
      };
    }

    return structuredClone(mockUser);
  },

  async createTransaction(
    request: TransactionRequest,
  ): Promise<TransactionReceipt> {
    if (request.buyer === mockUser.uuid) {
      mockUser.saldo -= request.amount;
    }

    if (request.seller === mockUser.uuid) {
      mockUser.saldo += request.amount;
    }

    const stamp = randomStamp();
    mockUser.stamps.push(stamp);

    return {
      uuid: crypto.randomUUID(),
      seller: request.seller,
      buyer: request.buyer,
      amount: request.amount,
      stamp,
    };
  },
};

export { mockGroupId };
