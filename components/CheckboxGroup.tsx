import { StateUpdater } from "preact/hooks";
import { CheckBox } from "./Checkbox.tsx";

export type CheckedItems = { [key: string]: boolean };

export type Option = {
  id: string;
  name: string;
};

type CheckboxListProps = {
  options: Option[];
  checkedItems: CheckedItems;
  setCheckedItems: StateUpdater<CheckedItems>;
};

export const CheckboxGroup = ({
  options,
  checkedItems,
  setCheckedItems,
}: CheckboxListProps) => {
  const handleInput = (e: Event) => {
    if (e.target) {
      const target = e.target as HTMLInputElement;
      setCheckedItems({
        ...checkedItems,
        [target.id]: target.checked,
      });
    }
  };

  return (
    <form class="flex flex-wrap gap-1">
      {options.map((option) => {
        return (
          <div class="flex items-center" key={option.id}>
            <CheckBox
              id={option.id}
              value={option.name}
              onInput={handleInput}
              checked={checkedItems[option.id]}
            />
            <label
              for={option.id}
              class="pl-1 text-sm font-medium text-gray-900 dark:text-gray-300 whitespace-nowrap"
            >
              {option.name}
            </label>
          </div>
        );
      })}
    </form>
  );
};
