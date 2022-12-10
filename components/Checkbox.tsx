type Props = {
  id?: string;
  value: string;
  checked: boolean;
  onInput: (e: Event) => void;
};

export const CheckBox = ({ id, value, checked, onInput }: Props) => {
  return (
    <input
      id={id}
      type="checkbox"
      name="inputNames"
      checked={checked}
      onInput={onInput}
      value={value}
      class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    />
  );
};
