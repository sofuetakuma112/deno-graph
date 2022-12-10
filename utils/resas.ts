import { ApiPrefectures } from "../types/resas.ts";

export const createPrefOptions = (apiResult: ApiPrefectures) => {
  return apiResult.result.map(({ prefCode, prefName }) => ({
    id: String(prefCode),
    name: prefName,
  }));
};
