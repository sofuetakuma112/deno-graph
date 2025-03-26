import "dotenv/load.ts";
import { ApiPopulationComposition } from "../types/resas.ts";

const BASE_API_URL = "https://opendata.resas-portal.go.jp";
export const API_KEY = Deno.env.get("RESAS_API_KEY") || "";

// キャッシュ用のMap
const populationCache = new Map<string, ApiPopulationComposition>();

// 県ごとの人口規模に基づく変動係数
const PREF_POPULATION_FACTORS = {
  // 大都市圏（変動幅小）
  13: 0.05,  // 東京都
  27: 0.05,  // 大阪府
  23: 0.05,  // 愛知県
  14: 0.05,  // 神奈川県
  // 地方都市（変動幅中）
  11: 0.08,  // 埼玉県
  12: 0.08,  // 千葉県
  28: 0.08,  // 兵庫県
  34: 0.08,  // 広島県
  // その他（変動幅大）
} as const;

// 年ごとの人口変動率（1980年を基準とした場合の年次変化率）
const YEARLY_CHANGE_RATES = {
  1980: 1.0,
  1985: 1.03,
  1990: 1.02,
  1995: 1.02,
  2000: 1.01,
  2005: 1.01,
  2010: 1.00,
  2015: 0.99,
  2020: 0.98,
  2025: 0.97,
  2030: 0.96,
  2035: 0.95,
  2040: 0.94,
  2045: 0.93,
} as const;

// 乱数生成のヘルパー関数
function generateRandomPopulation(
  baseValue: number,
  prefCode: number,
  year: number
): number {
  // 県ごとの変動係数を取得（デフォルト0.1）
  const variance = PREF_POPULATION_FACTORS[prefCode as keyof typeof PREF_POPULATION_FACTORS] ?? 0.1;
  
  // 年による変動を考慮
  const yearFactor = YEARLY_CHANGE_RATES[year as keyof typeof YEARLY_CHANGE_RATES] ?? 0.95;
  
  // ランダムな変動を生成（より小さな変動幅）
  const randomFactor = 1 + (Math.random() * variance - variance / 2);
  
  // 人口規模に応じた調整（より小さな調整）
  const scaleFactor = baseValue > 1000000 ? 0.995 : 1.005;
  
  return Math.round(baseValue * randomFactor * yearFactor * scaleFactor);
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
          value: generateRandomPopulation(yearData.value, parseInt(prefId), yearData.year)
        }))
      }))
    }
  };

  // 生成したデータをキャッシュに保存
  populationCache.set(prefId, newData);

  return newData;
};
