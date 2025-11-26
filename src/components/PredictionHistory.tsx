import { useGetPredictionHistory } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

export default function PredictionHistory() {
  const { data: predictions, isLoading, isError } = useGetPredictionHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Geçmiş yükleniyor...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-red-500 flex flex-col items-center gap-2">
        <AlertCircle className="h-8 w-8" />
        <p>Veriler yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card className="glass-card border-dashed">
        <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
          <Clock className="h-12 w-12 opacity-20" />
          <p>Henüz bir tahmin geçmişiniz bulunmuyor.</p>
          <p className="text-sm opacity-60">İlk tahmininizi yaparak başlayın!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {predictions.map((pred, i) => (
        <Card key={i} className="glass-card overflow-hidden hover:border-primary/50 transition-all">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Sol: Varlık ve Yön */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full shadow-lg ${
                pred.direction === 'up' 
                  ? 'bg-green-500/10 text-green-500 ring-1 ring-green-500/20' 
                  : 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
              }`}>
                {pred.direction === 'up' ? <ArrowUp className="h-6 w-6" /> : <ArrowDown className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-bold text-xl flex items-center gap-2">
                  {pred.asset}
                  <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                    {pred.interval === '1h' ? '1 Saat' : '24 Saat'}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Eşik: <span className="font-mono text-foreground">${(Number(pred.threshold) / 100).toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Orta: Tutar */}
            <div className="flex flex-col sm:items-end">
              <p className="text-2xl font-bold tracking-tight">
                {ethers.formatUnits(pred.amount, 6)} 
                <span className="text-sm font-medium text-muted-foreground ml-1">{pred.tokenType.toUpperCase()}</span>
              </p>
              <p className="text-xs text-muted-foreground">Bahis Tutarı</p>
            </div>

            {/* Sağ: Durum */}
            <div className="flex items-center sm:justify-end min-w-[100px]">
              {pred.result === 'pending' && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 px-3 py-1">
                  <Clock className="w-3 h-3 mr-2 animate-pulse" /> Bekliyor
                </Badge>
              )}
              {pred.result === 'win' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 px-3 py-1">
                  <CheckCircle className="w-3 h-3 mr-2" /> Kazandı
                </Badge>
              )}
              {pred.result === 'loss' && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30 px-3 py-1">
                  <XCircle className="w-3 h-3 mr-2" /> Kaybetti
                </Badge>
              )}
            </div>

          </div>
          
          {/* Detay Barı (Opsiyonel: Kazanılan miktar vb. buraya eklenebilir) */}
          {pred.finalPrice && (
            <div className="bg-muted/30 px-4 py-2 text-xs flex justify-between border-t border-border/50">
              <span>Bitiş Fiyatı: <strong>${(Number(pred.finalPrice) / 100).toFixed(2)}</strong></span>
              <span className="text-muted-foreground">Pool ID: #{pred.poolId}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}