import * as React from "react";
import { cn } from "@/lib/utils";

// Basit ve Hızlı State Yönetimi
const TabsContext = React.createContext<{ 
  activeTab: string; 
  setActiveTab: (v: string) => void 
} | null>(null);

export const Tabs = ({ defaultValue, children, className }: any) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: any) => (
  <div className={cn(
    "inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full",
    className
  )}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, children, className }: any) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  
  const isActive = context.activeTab === value;
  
  return (
    <button
      type="button" // KRİTİK: Form submit etmesini engeller
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        isActive 
          ? "bg-background text-foreground shadow-md font-bold scale-[1.02] duration-200" 
          : "hover:bg-background/50 hover:text-foreground duration-200",
        className
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className }: any) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;

  // Sadece aktif olan içeriği render et (DOM'u temiz tutar)
  if (context.activeTab !== value) return null;

  return (
    <div 
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none animate-in fade-in-50 zoom-in-95 duration-200", 
        className
      )}
    >
      {children}
    </div>
  );
};