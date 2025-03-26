import "dotenv/load.ts";
import { ApiPopulationComposition } from "../types/resas.ts";

const BASE_API_URL = "https://opendata.resas-portal.go.jp";
export const API_KEY = Deno.env.get("RESAS_API_KEY") || "";

// キャッシュ用のMap
const populationCache = new Map<string, ApiPopulationComposition>();

// 乱数生成のヘルパー関数
function generateRandomPopulation(baseValue: number, variance: number): number {
  const randomFactor = 1 + (Math.random() * variance * 2 - variance);
  return Math.round(baseValue * randomFactor);
}

export const fetchPrefs = async () => {
  const prefData = await Deno.readTextFile("./mock/prefectures.json");
  return JSON.parse(prefData);
};

export const fetchPopulation = async (
  prefId: string
): Promise<ApiPopulationComposition> => {
  // キャッシュにデータがあれば、それを返す
  if (populationCache.has(prefId)) {
    return populationCache.get(prefId)!;
  }

  // 基準となる人口データを読み込む
  const baseData = await Deno.readTextFile("./mock/population.json");
  const basePopulation = JSON.parse(baseData) as ApiPopulationComposition;

  // 新しい人口データを生成
  const newData = {
    ...basePopulation,
    result: {
      ...basePopulation.result,
      data: basePopulation.result.data.map(series => ({
        ...series,
        data: series.data.map(yearData => ({
          year: yearData.year,
          // 基準値から±30%の範囲で乱数を生成
          value: generateRandomPopulation(yearData.value, 0.3)
        }))
      }))
    }
  };

  // 生成したデータをキャッシュに保存
  populationCache.set(prefId, newData);

  return newData;
};
