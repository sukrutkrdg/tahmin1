import { useGetPredictionHistory } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Asset, PredictionDirection, TimeInterval, TokenType } from '@/types/prediction';

import { ArrowUp, ArrowDown, Clock, CheckCircle2, XCircle, Loader2, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PredictionHistory() {
  const { data: predictions, isLoading } = useGetPredictionHistory();

  const getAssetName = (asset: Asset) => {
    switch (asset) {
      case Asset.btc: return 'Bitcoin';
      case Asset.eth: return 'Ethereum';
      case Asset.xrp: return 'Ripple';
    }
  };

  const getIntervalText = (interval: TimeInterval) => {
    switch (interval) {
      case TimeInterval.oneHour: return '1 Saat';
      case TimeInterval.twentyFourHours: return '24 Saat';
    }
  };

  const getTokenIcon = (tokenType: TokenType) => {
    return tokenType === TokenType.usdc 
      ? '/assets/generated/usdc-icon-transparent.dim_64x64.png'
      : '/assets/generated/usdt-icon-transparent.dim_64x64.png';
  };

  const getTokenName = (tokenType: TokenType) => {
    return tokenType === TokenType.usdc ? 'USDC' : 'USDT';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tahmin Geçmişi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tahmin Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Henüz tahmin yapmadınız</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tahmin Geçmişi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{getAssetName(prediction.asset)}</span>
                    <Badge variant="outline" className="gap-1">
                      {prediction.direction === PredictionDirection.above ? (
                        <>
                          <ArrowUp className="h-3 w-3 text-success" />
                          Üstünde
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-3 w-3 text-destructive" />
                          Altında
                        </>
                      )}
                    </Badge>
                    <Badge variant="secondary">{getIntervalText(prediction.interval)}</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Eşik: ${(Number(prediction.threshold) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>

                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <img src={getTokenIcon(prediction.tokenType)} alt={getTokenName(prediction.tokenType)} className="h-4 w-4" />
                    <span className="text-sm font-medium text-foreground">
                      {Number(prediction.amount).toLocaleString()} {getTokenName(prediction.tokenType)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(prediction.timestamp)).toLocaleString('tr-TR')}
                  </p>
                </div>

                <div>
                  {prediction.result === undefined ? (
                    <Badge variant="outline" className="gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Beklemede
                    </Badge>
                  ) : prediction.result ? (
                    <Badge className="gap-1 bg-success/20 text-success hover:bg-success/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Başarılı
                    </Badge>
                  ) : (
                    <Badge className="gap-1 bg-destructive/20 text-destructive hover:bg-destructive/30">
                      <XCircle className="h-3 w-3" />
                      Başarısız
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
