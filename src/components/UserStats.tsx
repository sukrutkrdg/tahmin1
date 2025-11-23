import { useGetCallerUserProfile, useGetCallerBalance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserStats() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: balance, isLoading: balanceLoading } = useGetCallerBalance();

  if (profileLoading || balanceLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const totalPredictions = Number(profile.successfulPredictions) + Number(profile.failedPredictions);
  const successRate = totalPredictions > 0 
    ? ((Number(profile.successfulPredictions) / totalPredictions) * 100).toFixed(1)
    : '0.0';

  return (
    <Card className="border-border bg-gradient-to-br from-card to-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          İstatistiklerim
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-background/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Toplam Puan</p>
          <p className="text-3xl font-bold text-foreground">{Number(profile.totalPoints)}</p>
        </div>

        {balance && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" />
              Bakiyeler
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <img src="/assets/generated/usdc-icon-transparent.dim_64x64.png" alt="USDC" className="h-5 w-5" />
                  <p className="text-xs text-muted-foreground">USDC</p>
                </div>
                <p className="text-lg font-bold text-foreground">{Number(balance.usdc).toLocaleString()}</p>
              </div>

              <div className="rounded-lg border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <img src="/assets/generated/usdt-icon-transparent.dim_64x64.png" alt="USDT" className="h-5 w-5" />
                  <p className="text-xs text-muted-foreground">USDT</p>
                </div>
                <p className="text-lg font-bold text-foreground">{Number(balance.usdt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <p className="text-xs text-muted-foreground">Başarılı</p>
            </div>
            <p className="text-xl font-bold text-foreground">{Number(profile.successfulPredictions)}</p>
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <p className="text-xs text-muted-foreground">Başarısız</p>
            </div>
            <p className="text-xl font-bold text-foreground">{Number(profile.failedPredictions)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Başarı Oranı</p>
          <p className="text-2xl font-bold text-foreground">{successRate}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
