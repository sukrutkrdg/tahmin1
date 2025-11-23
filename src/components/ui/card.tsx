export const Card = ({ children }: any) => <div className="border p-4 rounded-md">{children}</div>;
export const CardHeader = ({ children }: any) => <div className="font-bold">{children}</div>;
export const CardTitle = ({ children }: any) => <h2 className="text-lg font-semibold">{children}</h2>;
export const CardDescription = ({ children }: any) => <p className="text-sm text-gray-500">{children}</p>;
export const CardContent = ({ children }: any) => <div>{children}</div>;
export const CardFooter = ({ children }: any) => <div className="mt-2">{children}</div>;