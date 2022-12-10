import "dotenv/load.ts";
import { ApiPopulationComposition } from "../types/resas.ts";

const BASE_API_URL = "https://opendata.resas-portal.go.jp";
export const API_KEY = Deno.env.get("RESAS_API_KEY") || "";

export const fetchPrefs = (apiKey = API_KEY) => {
  return fetch(`${BASE_API_URL}/api/v1/prefectures`, {
    method: "GET",
    headers: apiKey
      ? {
          "X-API-KEY": apiKey,
        }
      : undefined,
  }).then((response) => response.json());
};

export const fetchPopulation = (
  prefId: string,
  apiKey = API_KEY
): Promise<ApiPopulationComposition> => {
  const url = `${BASE_API_URL}/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefId}`;
  return fetch(url, {
    method: "GET",
    headers: apiKey
      ? {
          "X-API-KEY": apiKey,
        }
      : undefined,
  }).then((response) => response.json());
};
