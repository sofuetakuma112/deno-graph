import { Head } from "$fresh/runtime.ts";
import Header from "../components/Header.tsx";
import { Handlers } from "$fresh/server.ts";

import { Chart } from "$fresh_charts/mod.ts";

import "dotenv/load.ts";
import { sliceByNumber } from "../utils/array.ts";
import { sleep } from "../utils/time.ts";
import { colors } from "../consts/color.ts";

const BASE_API_URL = "https://opendata.resas-portal.go.jp";
const apiKey = Deno.env.get("RESAS_API_KEY") || "";

const fetchPrefs = (apiKey: string) => {
  return fetch(`${BASE_API_URL}/api/v1/prefectures`, {
    method: "GET",
    headers: apiKey
      ? {
          "X-API-KEY": apiKey,
        }
      : undefined,
  }).then((response) => response.json());
};

export const handler: Handlers<any> = {
  async GET(_, ctx) {
    // 都道府県を読み込む
    const prefs = await fetchPrefs(apiKey);
    return ctx.render({ prefs });
  },
  async POST(req, ctx) {
    // フォームデータの入力値を取得
    const formData = await req.formData();
    const prefIds = formData
      .get("prefIds")
      ?.toString()
      .split(",")
      .filter(Boolean);
    if (!prefIds || !prefIds.length || prefIds.length > 10) {
      return ctx.render({ error: "prefIdsが不正" });
    }

    const urlAndPrefIds = prefIds.map((prefId) => ({
      url: `${BASE_API_URL}/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefId}`,
      prefId,
    }));

    const jsons = [];
    for (const subUrls of sliceByNumber(urlAndPrefIds, 5)) {
      const subResults = await Promise.all(
        subUrls.map(({ url, prefId }) =>
          fetch(url, {
            method: "GET",
            headers: apiKey
              ? {
                  "X-API-KEY": apiKey,
                }
              : undefined,
          })
            .then((response) => response.json())
            .then((json) => ({ prefId, ...json }))
        )
      );
      jsons.push(...subResults);
      await sleep(1);
    }

    const prefs = await fetchPrefs(apiKey);

    const totalPopulations = jsons.map(({ prefId, result }) => {
      const totalPopulation = result.data.find(
        ({ label }: { label: string }) => label === "総人口"
      );
      return { prefId, totalPopulation };
    });

    return ctx.render({
      checkedIds: prefIds,
      totalPopulations: totalPopulations,
      prefs,
    });
  },
};

type Props = {
  prefs: {
    message: string | null;
    result: {
      prefCode: number;
      prefName: string;
    }[];
  };
  checkedIds: string[];
  totalPopulations: {
    prefId: string;
    totalPopulation: { label: string; data: { year: number; value: number }[] };
  }[];
};

export default function Home({ data }: { data: Props }) {
  const options = data?.prefs.result.map(({ prefCode, prefName }) => ({
    id: String(prefCode),
    name: prefName,
  }));

  const checkedIds: string[] = data?.checkedIds || [];

  const totalPopulations = data?.totalPopulations ?? [];
  const xLabels = totalPopulations.length
    ? totalPopulations[0].totalPopulation.data.map(({ year }) => year)
    : [];
  const datasets = totalPopulations.map(({ prefId, totalPopulation }) => {
    const prefName =
      options.find(({ id }) => id === prefId)?.name || "不明な県";
    const values = totalPopulation.data.map(({ value }) => value);
    return {
      label: prefName,
      values,
      prefId,
    };
  });

  return (
    <>
      <Head>
        <title>Graph App</title>
      </Head>
      <Header />
      <div class="p-4 mx-auto max-w-screen-md">
        <form method="POST">
          {options.map(({ id, name }, i) => {
            return (
              <>
                <label htmlFor={id} class="whitespace-nowrap">
                  <button
                    type="submit"
                    value={
                      checkedIds.includes(id)
                        ? `${checkedIds.filter((cid) => cid !== id).join(",")}`
                        : `${id},${checkedIds.join(",")}`
                    }
                    name="prefIds"
                  >
                    {checkedIds.includes(id) ? (
                      <input type="checkbox" checked class="relative z-[-1]" />
                    ) : (
                      <input type="checkbox" class="relative z-[-1]" />
                    )}
                  </button>
                  {name}
                </label>
              </>
            );
          })}
        </form>
        {totalPopulations && (
          <Chart
            type="line"
            data={{
              labels: xLabels,
              datasets: datasets.map(({ label, values, prefId }) => ({
                label,
                data: values,
                borderColor: colors[parseInt(prefId, 10) - 1],
                borderWidth: 1,
                fill: false,
              })),
            }}
          />
        )}
      </div>
    </>
  );
}
