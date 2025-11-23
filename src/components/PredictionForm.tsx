import { useState } from 'react';
import { ethers, Contract } from 'ethers'; // ethers importu düzeltildi
import { useCreatePrediction, useGetCallerBalance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";
import { useWallet } from '../hooks/useWallet'; // Wallet hook eklendi
import { CONTRACT_ADDRESSES, BASE_TESTNET_CHAIN_ID } from '../lib/contractConfig'; // Config import edildi

import { toast } from 'sonner';
import { ArrowUp, ArrowDown } from 'lucide-react';

// Minimal ERC20 ABI (Sadece approve ve allowance için gerekli)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function PredictionForm() {
  const [asset, setAsset] = useState<Asset>(Asset.btc);
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<PredictionDirection>(PredictionDirection.above);
  const [interval, setInterval] = useState<TimeInterval>(TimeInterval.oneHour);
  const [tokenType, setTokenType] = useState<TokenType>(TokenType.usdc);
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false); // Buton loading durumu için

  const createPrediction = useCreatePrediction();
  const { data: balance } = useGetCallerBalance();
  const walletState = useWallet(); // Cüzdan bilgisini al

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletState.isConnected || !walletState.address) {
      toast.error('Lütfen önce cüzdanınızı bağlayın');
      return;
    }

    if (!threshold || isNaN(Number(threshold)) || Number(threshold) <= 0) {
      toast.error('Lütfen geçerli bir eşik değeri girin');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Lütfen geçerli bir bahis miktarı girin');
      return;
    }

    setIsApproving(true); // İşlem başladı

    try {
      // 1. Adresleri Belirle (Base Sepolia için hardcoded veya configden)
      const chainId = walletState.chainId || BASE_TESTNET_CHAIN_ID;
      
      // Eğer configde o chain yoksa hata vermesin diye güvenli erişim
      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID];
      
      const tokenAddress = tokenType === TokenType.usdc ? addresses.usdc : addresses.usdt;
      const predictionMarketAddress = addresses.predictionMarket;

      // 2. Ethers Provider Kurulumu
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

      // 3. Miktarı Ayarla (6 Decimal varsayımıyla)
      // Not: USDC ve USDT genelde 6 decimaldir. Garanti olsun istersen contracttan çekebilirsin.
      const decimals = 6; 
      const betAmountRaw = ethers.parseUnits(amount, decimals);

      // 4. Allowance (İzin) Kontrolü
      console.log("Allowance kontrol ediliyor...");
      const currentAllowance = await tokenContract.allowance(walletState.address, predictionMarketAddress);
      
      if (currentAllowance < betAmountRaw) {
          toast.info("Lütfen cüzdanınızdan harcama iznini (Approve) onaylayın...");
          const tx = await tokenContract.approve(predictionMarketAddress, betAmountRaw);
          console.log("Approve gönderildi, bekleniyor...");
          await tx.wait(); // Blokzincire yazılmasını bekle
          toast.success("Onay başarılı! Şimdi bahis oluşturuluyor...");
      }

      // 5. Tahmini Oluştur
      await createPrediction.mutateAsync({
        asset,
        threshold: BigInt(Math.floor(Number(threshold) * 100)), // Kuruş hassasiyeti için x100 (backend ile uyumlu olmalı)
        direction,
        interval,
        // timestamp: BigInt(Date.now()), // Bunu frontendde değil kontratta `block.timestamp` ile yapmak daha güvenli, ama hook istiyorsa kalsın
        amount: Number(betAmountRaw), // Hook number bekliyorsa dönüşüm yapın, BigInt bekliyorsa betAmountRaw kullanın
        tokenType,
      });

      toast.success('Tahmin başarıyla oluşturuldu!');
      setThreshold('');
      setAmount('');

    } catch (error: any) {
      console.error("İşlem Hatası:", error);
      const errorMessage = error?.reason || error?.message || 'İşlem sırasında hata oluştu';
      
      // Kullanıcı reject ettiyse
      if (errorMessage.includes("rejected")) {
        toast.error("İşlem iptal edildi.");
      } else {
        toast.error("Hata: " + errorMessage);
      }
    } finally {
      setIsApproving(false);
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
          {/* Varlık Seçimi */}
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

          {/* Eşik Fiyat */}
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

          {/* Yön Seçimi */}
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

          {/* Zaman Aralığı */}
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

          {/* Token ve Miktar */}
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
                      USDC
                    </div>
                  </SelectItem>
                  <SelectItem value={TokenType.usdt}>
                    <div className="flex items-center gap-2">
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

          {/* Bakiye Bilgisi */}
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              Mevcut Bakiye: <span className="font-semibold text-foreground">{availableBalance.toLocaleString()}</span> {tokenType === TokenType.usdc ? 'USDC' : 'USDT'}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createPrediction.isPending || isApproving}
          >
            {isApproving ? 'Onaylanıyor...' : createPrediction.isPending ? 'Oluşturuluyor...' : 'Tahmin Oluştur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}