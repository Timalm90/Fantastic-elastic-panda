import { centralbankApi } from "./centralbank";
import { mockCentralbankApi } from "./mockCentralbank";
import type { CentralbankApi } from "./types";

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

export const api: CentralbankApi = useMockApi
  ? mockCentralbankApi
  : centralbankApi;
