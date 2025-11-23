import { Wallet } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 font-bold text-xl">
        <span className="text-blue-600">Tahmin</span>App
      </div>
      <div className="flex items-center gap-4">
        {/* Buraya cüzdan butonu veya kullanıcı bilgisi gelebilir */}
        <div className="flex items-center gap-2 text-sm font-medium bg-muted px-3 py-1 rounded-full">
          <Wallet className="h-4 w-4" />
          <span>Demo Modu</span>
        </div>
      </div>
    </header>
  );
}