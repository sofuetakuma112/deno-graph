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
    <form>
      {options.map((option, index) => {
        index = index + 1;
        return (
          <label htmlFor={`id_${index}`} key={`key_${index}`}>
            <CheckBox
              id={option.id}
              value={option.name}
              onInput={handleInput}
              checked={checkedItems[option.id]}
            />
            {option.name}
          </label>
        );
      })}
    </form>
  );
};
