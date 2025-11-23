import React from "react";
import clsx from "clsx";

export const Alert = ({ variant = "default", children }: { variant?: "default" | "destructive"; children: React.ReactNode }) => {
  return (
    <div
      className={clsx(
        "rounded-md border p-4",
        variant === "default" && "bg-blue-50 border-blue-300 text-blue-800",
        variant === "destructive" && "bg-red-50 border-red-300 text-red-800"
      )}
    >
      {children}
    </div>
  );
};

export const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-semibold mb-1">{children}</h4>
);

export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm text-gray-700">{children}</div>
);