import { tivoliApi } from "./centralbank";
import { mockTivoliApi } from "./mockCentralbank";
import type { TivoliApi } from "./types";

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

export const api: TivoliApi = useMockApi ? mockTivoliApi : tivoliApi;
