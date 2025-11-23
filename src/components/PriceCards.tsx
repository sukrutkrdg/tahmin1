import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Bitcoin, Activity, Zap } from 'lucide-react';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export default function PriceCards() {
  const [prices, setPrices] = useState<CryptoPrice[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 45230.50, change24h: 2.34 },
    { symbol: 'ETH', name: 'Ethereum', price: 2845.75, change24h: -1.23 },
    { symbol: 'XRP', name: 'Ripple', price: 0.6234, change24h: 5.67 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(crypto => ({
        ...crypto,
        price: crypto.price * (1 + (Math.random() - 0.5) * 0.002),
        change24h: crypto.change24h + (Math.random() - 0.5) * 0.5,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (symbol: string) => {
    if (symbol === 'BTC') return <Bitcoin className="h-8 w-8 text-orange-500" />;
    if (symbol === 'ETH') return <Activity className="h-8 w-8 text-blue-500" />;
    return <Zap className="h-8 w-8 text-yellow-400" />;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {prices.map((crypto) => (
        <Card key={crypto.symbol} className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 shadow-lg group">
          {/* Arka plan efekti */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
            <div className="flex flex-col">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {crypto.name}
              </CardTitle>
              <span className="text-2xl font-bold tracking-tight mt-1">
                {crypto.symbol}
              </span>
            </div>
            <div className="p-2 bg-background/50 rounded-full ring-1 ring-border shadow-sm">
              {getIcon(crypto.symbol)}
            </div>
          </CardHeader>
          
          <CardContent className="z-10 relative">
            <div className="text-3xl font-bold text-foreground">
              ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center text-sm font-medium mt-2 ${crypto.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              <div className={`flex items-center px-2 py-0.5 rounded-full ${crypto.change24h >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4" />
                )}
                {Math.abs(crypto.change24h).toFixed(2)}%
              </div>
              <span className="ml-2 text-muted-foreground text-xs">son 24s</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}