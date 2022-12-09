import { useEffect, useState } from "preact/hooks";
import {
  CheckboxGroup,
  CheckedItems,
  Option,
} from "../components/CheckboxGroup.tsx";

type Props = {
  options: Option[];
};

export default function InteractiveGraph({ options }: Props) {
  const [checkedItems, setCheckedItems] = useState<CheckedItems>({});

  useEffect(() => {
    console.log(checkedItems);
    const shouldFetch = Object.values(checkedItems).some(Boolean);
    if (shouldFetch) {
      // TODO: APIにリクエストを送信して人口データをfetchする
    //   const formData = new FormData();
    //   formData.append("id", "3");
    //   const request = new Request("/", {
    //     method: "POST",
    //     headers: {},
    //     body: formData,
    //   });
    //   fetch(request);
    }
  }, [checkedItems]);

  return (
    <div>
      <CheckboxGroup
        options={options}
        checkedItems={checkedItems}
        setCheckedItems={setCheckedItems}
      />
    </div>
  );
}
