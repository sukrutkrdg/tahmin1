import { useGetCallerUserProfile, useGetCallerBalance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

export default function UserStats() {
  const { data: userProfile, isLoading: isProfileLoading } = useGetCallerUserProfile();
  const { data: balance, isLoading: isBalanceLoading } = useGetCallerBalance();

  // Güvenli sayı formatlama fonksiyonu
  const formatNumber = (val: any) => {
    if (val === undefined || val === null || isNaN(Number(val))) return "0";
    return Number(val).toLocaleString('en-US');
  };

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">İstatistiklerim</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Toplam Puan */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="p-2 bg-primary/20 rounded-full">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Toplam Puan</p>
            <p className="text-xl font-bold text-foreground">
              {isProfileLoading ? "..." : formatNumber(userProfile?.totalPoints)}
            </p>
          </div>
        </div>

        {/* Bakiyeler */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span>Bakiyeler</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-card border border-border/50">
              <p className="text-xs text-muted-foreground">USDC</p>
              <p className="text-lg font-semibold">
                {isBalanceLoading ? "..." : formatNumber(balance?.usdc)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border/50">
              <p className="text-xs text-muted-foreground">USDT</p>
              <p className="text-lg font-semibold">
                {isBalanceLoading ? "..." : formatNumber(balance?.usdt)}
              </p>
            </div>
          </div>
        </div>

        {/* Başarı Oranı (Mock Veri) */}
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Başarı Oranı
            </span>
            <span className="text-sm font-bold text-green-500">0.0%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}