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
    />
  );
};
