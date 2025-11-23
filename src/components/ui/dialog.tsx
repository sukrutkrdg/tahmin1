import React from "react";

export const Dialog = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

export const DialogTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

export const DialogContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 bg-white rounded-md shadow-md">{children}</div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

export const DialogClose = ({ children }: { children: React.ReactNode }) => (
  <button className="mt-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition">{children}</button>
);

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>
);