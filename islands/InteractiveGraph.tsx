import { useEffect, useRef, useState } from "preact/hooks";
import {
  CheckboxGroup,
  CheckedItems,
  Option,
} from "../components/CheckboxGroup.tsx";

import Chart from "chart.js";
import { colors } from "../consts/color.ts";
import { ApiResponse } from "../routes/api/population-composition.ts";
import { Loading } from "../components/Loading.tsx";

type Dataset = {
  label: string;
  values: number[];
  prefId: string;
};

type Props = {
  options: Option[];
  apiKey?: string;
};

export default function InteractiveGraph({ options }: Props) {
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
  const [xLabels, setXLabels] = useState<number[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const chartRef = useRef<Chart>();
  const canvasRef = useRef(null);

  useEffect(() => {
    const asyncFunc = async () => {
      const prefIds = Object.entries(checkedItems)
        .filter(([_, bool]) => bool)
        .map(([prefId, _]) => prefId);
      if (prefIds.length > 0) {
        setIsFetching(true);

        const totalPopulationAndPrefIds: ApiResponse = await fetch(
          `/api/population-composition?prefIds=${prefIds}`,
          {
            method: "GET",
          }
        ).then((res) => res.json());

        if (totalPopulationAndPrefIds.length > 0) {
          const xLabels =
            totalPopulationAndPrefIds[0].totalPopulation?.data.map(
              ({ year }) => year
            ) || [];
          const datasets: Dataset[] = totalPopulationAndPrefIds.map(
            ({ prefId, totalPopulation }) => {
              const prefName =
                options.find(({ id }) => id === prefId)?.name || "不明な県";
              const values =
                totalPopulation?.data.map(({ value }) => value) || [];
              return {
                label: prefName,
                values,
                prefId,
              };
            }
          );
          setXLabels(xLabels);
          setDatasets(datasets);
          setIsFetching(false);
        }
      } else {
        setDatasets([]);
        setXLabels([]);
      }
    };
    asyncFunc();
  }, [checkedItems]);

  useEffect(() => {
    const chartDataSets = datasets.map(({ label, values, prefId }) => ({
      label,
      data: values,
      borderColor: colors[parseInt(prefId, 10) - 1],
      borderWidth: 1,
      fill: false,
    }));

    if (chartRef.current) {
      // すでにインスタンスは生成している
      chartRef.current.data.datasets = chartDataSets;
      chartRef.current.data.labels = xLabels;
      chartRef.current.update();
    } else if (canvasRef.current) {
      // インスタンス未生成
      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: xLabels,
          datasets: chartDataSets,
        },
      });
    }
  }, [canvasRef.current, xLabels, datasets]);

  return (
    <div>
      {(isFetching || false) && <Loading />}
      <CheckboxGroup
        options={options}
        checkedItems={checkedItems}
        setCheckedItems={setCheckedItems}
      />
      <canvas ref={canvasRef} />
    </div>
  );
}
