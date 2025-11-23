import * as React from "react";

// Basit bir Context oluşturup aktif sekmeyi yönetelim
const TabsContext = React.createContext<{ activeTab: string; setActiveTab: (v: string) => void } | null>(null);

export const Tabs = ({ defaultValue, children, className }: any) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, children }: any) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const isActive = context.activeTab === value;
  
  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? "bg-background text-foreground shadow-sm" : ""
      }`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }: any) => {
  const context = React.useContext(TabsContext);
  if (!context || context.activeTab !== value) return null;
  return <div className="mt-2 ring-offset-background focus-visible:outline-none">{children}</div>;
};