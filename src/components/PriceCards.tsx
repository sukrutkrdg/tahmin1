import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
}

export default function PriceCards() {
  const [prices, setPrices] = useState<CryptoPrice[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 45230.50, change24h: 2.34, icon: '/assets/generated/btc-icon-transparent.dim_64x64.png' },
    { symbol: 'ETH', name: 'Ethereum', price: 2845.75, change24h: -1.23, icon: '/assets/generated/eth-icon-transparent.dim_64x64.png' },
    { symbol: 'XRP', name: 'Ripple', price: 0.6234, change24h: 5.67, icon: '/assets/generated/xrp-icon-transparent.dim_64x64.png' },
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

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {prices.map((crypto) => (
        <Card key={crypto.symbol} className="overflow-hidden border-border bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={crypto.icon} alt={crypto.name} className="h-10 w-10" />
                <div>
                  <CardTitle className="text-lg">{crypto.symbol}</CardTitle>
                  <p className="text-xs text-muted-foreground">{crypto.name}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">
                ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center gap-1 text-sm font-medium ${crypto.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(crypto.change24h).toFixed(2)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
