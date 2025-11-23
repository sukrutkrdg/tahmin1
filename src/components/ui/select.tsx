export const Select = ({ children }: any) => <select className="border p-2 rounded-md w-full">{children}</select>;
export const SelectItem = ({ children, value }: any) => <option value={value}>{children}</option>;
export const SelectTrigger = ({ children }: any) => <div>{children}</div>;
export const SelectContent = ({ children }: any) => <div>{children}</div>;
export const SelectValue = ({ children }: any) => <span>{children}</span>;