import { HandlerContext } from "$fresh/server.ts";
import { fetchPopulation } from "../../api/resas.ts";
import { ApiPopulationComposition } from "../../types/resas.ts";
import { sliceByNumber } from "../../utils/array.ts";
import { sleep } from "../../utils/time.ts";

type ApiPopulationCompositionWithPrefId = ApiPopulationComposition & {
  prefId: string;
};

export type ApiResponse = {
  prefId: string;
  totalPopulation:
    | {
        label: string;
        data: [
          {
            year: number;
            value: number;
          }
        ];
      }
    | undefined;
}[];

export const handler = async (
  _req: Request,
  _ctx: HandlerContext
): Promise<Response> => {
  const u = new URL(_req.url);
  const searchParams = u.searchParams;
  const prefIds = Array.from(searchParams).flatMap(([key, value]) =>
    key === "prefIds" ? value.split(",") : []
  );

  const apiPopulationCompositions: ApiPopulationCompositionWithPrefId[] = [];
  const slicedPrefIds = sliceByNumber(prefIds, 5);

  for (const subArrayIndex in slicedPrefIds) {
    const index = parseInt(subArrayIndex, 10);
    const subPrefIds = slicedPrefIds[index];
    const subResults = await Promise.all(
      subPrefIds.map((prefId) =>
        fetchPopulation(prefId).then((json) => ({
          prefId,
          ...json,
        }))
      )
    );
    apiPopulationCompositions.push(...subResults);

    const isLast = slicedPrefIds.length - 1 === index;
    if (!isLast) {
      await sleep(1);
    }
  }
  const totalPopulationAndPrefIds = apiPopulationCompositions.map(
    ({ prefId, result }) => {
      const totalPopulation = result.data.find(
        ({ label }: { label: string }) => label === "総人口"
      );
      return { prefId, totalPopulation };
    }
  );

  return new Response(JSON.stringify(totalPopulationAndPrefIds, null, 2));
};
