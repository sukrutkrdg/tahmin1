export const Button = ({ children, onClick, type = "button" }: any) => (
  <button type={type} onClick={onClick} className="px-4 py-2 bg-blue-600 text-white rounded-md">{children}</button>
);