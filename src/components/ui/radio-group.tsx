export const RadioGroup = ({ children }: any) => <div>{children}</div>;
export const RadioGroupItem = ({ value, checked, onChange }: any) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input type="radio" value={value} checked={checked} onChange={onChange} />
    <span>{value}</span>
  </label>
);