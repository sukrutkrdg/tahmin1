import { useState } from 'react';
import { useCreatePrediction, useGetCallerBalance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";

import { toast } from 'sonner';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function PredictionForm() {
  const [asset, setAsset] = useState<Asset>(Asset.btc);
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<PredictionDirection>(PredictionDirection.above);
  const [interval, setInterval] = useState<TimeInterval>(TimeInterval.oneHour);
  const [tokenType, setTokenType] = useState<TokenType>(TokenType.usdc);
  const [amount, setAmount] = useState('');

  const createPrediction = useCreatePrediction();
  const { data: balance } = useGetCallerBalance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!threshold || isNaN(Number(threshold)) || Number(threshold) <= 0) {
      toast.error('Lütfen geçerli bir eşik değeri girin');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Lütfen geçerli bir bahis miktarı girin');
      return;
    }

    const betAmount = BigInt(Math.floor(Number(amount)));

    // Check balance
    if (balance) {
      const currentBalance = tokenType === TokenType.usdc ? balance.usdc : balance.usdt;
      if (currentBalance < betAmount) {
        toast.error(`Yetersiz ${tokenType === TokenType.usdc ? 'USDC' : 'USDT'} bakiye`);
        return;
      }
    }

    try {
      await createPrediction.mutateAsync({
        asset,
        threshold: BigInt(Math.floor(Number(threshold) * 100)),
        direction,
        interval,
        timestamp: BigInt(Date.now()),
        amount: betAmount,
        tokenType,
        result: undefined,
      });

      toast.success('Tahmin oluşturuldu!');
      setThreshold('');
      setAmount('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Tahmin oluşturulurken hata oluştu';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const availableBalance = balance 
    ? Number(tokenType === TokenType.usdc ? balance.usdc : balance.usdt)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Tahmin Oluştur</CardTitle>
        <CardDescription>
          Bir kripto varlık seçin ve fiyat tahmininizi yapın
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="asset">Kripto Varlık</Label>
            <Select value={asset} onValueChange={(value) => setAsset(value as Asset)}>
              <SelectTrigger id="asset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Asset.btc}>Bitcoin (BTC)</SelectItem>
                <SelectItem value={Asset.eth}>Ethereum (ETH)</SelectItem>
                <SelectItem value={Asset.xrp}>Ripple (XRP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="threshold">Eşik Fiyat ($)</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              placeholder="Örn: 45000"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tahmin Yönü</Label>
            <RadioGroup value={direction} onValueChange={(value) => setDirection(value as PredictionDirection)}>
              <div className="grid grid-cols-2 gap-4">
                <label
                  htmlFor="above"
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                    direction === PredictionDirection.above
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-success/50'
                  }`}
                >
                  <RadioGroupItem value={PredictionDirection.above} id="above" />
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-5 w-5 text-success" />
                    <span className="font-medium">Üstünde</span>
                  </div>
                </label>

                <label
                  htmlFor="below"
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                    direction === PredictionDirection.below
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border hover:border-destructive/50'
                  }`}
                >
                  <RadioGroupItem value={PredictionDirection.below} id="below" />
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-5 w-5 text-destructive" />
                    <span className="font-medium">Altında</span>
                  </div>
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Zaman Aralığı</Label>
            <Select value={interval} onValueChange={(value) => setInterval(value as TimeInterval)}>
              <SelectTrigger id="interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TimeInterval.oneHour}>1 Saat</SelectItem>
                <SelectItem value={TimeInterval.twentyFourHours}>24 Saat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tokenType">Token</Label>
              <Select value={tokenType} onValueChange={(value) => setTokenType(value as TokenType)}>
                <SelectTrigger id="tokenType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TokenType.usdc}>
                    <div className="flex items-center gap-2">
                      <img src="/assets/generated/usdc-icon-transparent.dim_64x64.png" alt="USDC" className="h-4 w-4" />
                      USDC
                    </div>
                  </SelectItem>
                  <SelectItem value={TokenType.usdt}>
                    <div className="flex items-center gap-2">
                      <img src="/assets/generated/usdt-icon-transparent.dim_64x64.png" alt="USDT" className="h-4 w-4" />
                      USDT
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Bahis Miktarı</Label>
              <Input
                id="amount"
                type="number"
                step="1"
                min="1"
                placeholder="Örn: 100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Mevcut Bakiye: <span className="font-semibold text-foreground">{availableBalance.toLocaleString()}</span> {tokenType === TokenType.usdc ? 'USDC' : 'USDT'}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={createPrediction.isPending}>
            {createPrediction.isPending ? 'Oluşturuluyor...' : 'Tahmin Oluştur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
