import React from "react";

export const Avatar = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
    {children}
  </div>
);

export const AvatarImage = ({ src, alt }: { src?: string; alt?: string }) => (
  <img src={src} alt={alt} className="h-full w-full object-cover" />
);

export const AvatarFallback = ({ children }: { children: React.ReactNode }) => (
  <span className="flex h-full w-full items-center justify-center bg-gray-300 text-sm font-medium text-gray-700">
    {children}
  </span>
);