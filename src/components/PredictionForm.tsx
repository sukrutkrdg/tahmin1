import { useState } from 'react';
import { ethers, Contract } from 'ethers';
import { useCreatePrediction, useGetCallerBalance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_ADDRESSES, BASE_TESTNET_CHAIN_ID } from '../lib/contractConfig';
import { getEthereumProvider } from '@/lib/utils'; // GÜVENLİ PROVIDER IMPORTU
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

// Standart ERC20 ABI
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function PredictionForm() {
  // Varsayılan değerler
  const [asset, setAsset] = useState<Asset>(Asset.btc);
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<PredictionDirection>(PredictionDirection.above);
  const [interval, setInterval] = useState<TimeInterval>(TimeInterval.oneHour);
  const [tokenType, setTokenType] = useState<TokenType>(TokenType.usdc);
  const [amount, setAmount] = useState('');
  
  const [isApproving, setIsApproving] = useState(false); // Loading state

  const createPrediction = useCreatePrediction();
  const { data: balance } = useGetCallerBalance();
  const walletState = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🟢 Butona basıldı. İşlem başlıyor...");

    // Validasyonlar
    if (!walletState.isConnected || !walletState.address) {
      toast.error('Lütfen önce cüzdanınızı bağlayın');
      return;
    }
    if (!threshold || Number(threshold) <= 0) {
      toast.error('Geçerli bir eşik değeri girin');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Geçerli bir bahis miktarı girin');
      return;
    }

    setIsApproving(true);

    try {
      // --- GÜVENLİ PROVIDER SEÇİMİ (Çakışmayı Önler) ---
      const ethereum = getEthereumProvider();
      if (!ethereum) throw new Error("Cüzdan bulunamadı. Lütfen MetaMask yükleyin.");

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Config'den adresleri çek
      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID];
      
      // Token adresini belirle
      const tokenAddress = tokenType === TokenType.usdc ? addresses.usdc : addresses.usdt;
      const predictionMarketAddress = addresses.predictionMarket;

      console.log(`🔍 Token: ${tokenType}, Adres: ${tokenAddress}`);
      console.log(`🏭 Market Adresi: ${predictionMarketAddress}`);

      // Token kontratını bağla
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

      // Miktarı hesapla (6 decimal varsayımıyla)
      const decimals = 6; 
      const betAmountBigInt = ethers.parseUnits(amount, decimals);
      
      // Threshold'u da scale edelim (x100)
      const thresholdBigInt = BigInt(Math.floor(Number(threshold) * 100));

      // 1. ADIM: Allowance Kontrolü
      console.log("Checking allowance...");
      const currentAllowance = await tokenContract.allowance(walletState.address, predictionMarketAddress);
      console.log(`Mevcut İzin: ${currentAllowance}, Gerekli: ${betAmountBigInt}`);

      if (currentAllowance < betAmountBigInt) {
        toast.info("Harcama izni (Approve) bekleniyor...");
        const tx = await tokenContract.approve(predictionMarketAddress, betAmountBigInt);
        console.log("Approve tx gönderildi:", tx.hash);
        await tx.wait();
        toast.success("Onay verildi! Şimdi tahmin oluşturuluyor...");
      }

      // 2. ADIM: Tahmin Oluşturma
      toast.info("Cüzdan onayı bekleniyor...");
      
      // Hook içindeki fonksiyonu çağırırken parametreleri gönderiyoruz
      await createPrediction.mutateAsync({
        asset,
        threshold: thresholdBigInt,
        direction,
        interval,
        amount: betAmountBigInt,
        tokenType,
      });

      toast.success('Tahmin başarıyla oluşturuldu! 🚀');
      setThreshold('');
      setAmount('');

    } catch (error: any) {
      console.error("🚨 Hata oluştu:", error);
      // Kullanıcı reddettiyse
      if (error.code === 'ACTION_REJECTED' || (error.info && error.info.error && error.info.error.code === 4001)) {
        toast.error("İşlem kullanıcı tarafından reddedildi.");
      } else {
        toast.error(`Hata: ${error.reason || error.message || "Bilinmeyen hata"}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  // Bakiye gösterimi
  const availableBalance = balance 
    ? Number(tokenType === TokenType.usdc ? balance.usdc : balance.usdt)
    : 0;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Yeni Tahmin Oluştur</CardTitle>
        <CardDescription>Seçtiğiniz varlığın fiyat hareketini tahmin edin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Varlık Seçimi */}
          <div className="space-y-2">
            <Label>Kripto Varlık</Label>
            <Select value={asset} onValueChange={(v) => setAsset(v as Asset)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={Asset.btc}>Bitcoin (BTC)</SelectItem>
                <SelectItem value={Asset.eth}>Ethereum (ETH)</SelectItem>
                <SelectItem value={Asset.xrp}>Ripple (XRP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fiyat ve Yön */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Eşik Fiyat ($)</Label>
              <Input 
                type="number" 
                placeholder="45000.00" 
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Yön</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as PredictionDirection)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={PredictionDirection.above}>
                    <div className="flex items-center gap-2"><ArrowUp className="h-4 w-4 text-green-500"/> Yükselir (Above)</div>
                  </SelectItem>
                  <SelectItem value={PredictionDirection.below}>
                    <div className="flex items-center gap-2"><ArrowDown className="h-4 w-4 text-red-500"/> Düşer (Below)</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Token ve Miktar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Token</Label>
              <Select value={tokenType} onValueChange={(v) => setTokenType(v as TokenType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={TokenType.usdc}>USDC</SelectItem>
                  <SelectItem value={TokenType.usdt}>USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Miktar</Label>
              <Input 
                type="number" 
                placeholder="100" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Süre */}
          <div className="space-y-2">
            <Label>Süre</Label>
            <RadioGroup value={interval} onValueChange={(v) => setInterval(v as TimeInterval)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={TimeInterval.oneHour} id="1h" />
                <Label htmlFor="1h">1 Saat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={TimeInterval.twentyFourHours} id="24h" />
                <Label htmlFor="24h">24 Saat</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            Bakiye: <span className="font-bold">{availableBalance} {tokenType.toUpperCase()}</span>
          </div>

          <Button type="submit" className="w-full" disabled={isApproving || createPrediction.isPending}>
            {(isApproving || createPrediction.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isApproving ? 'İşlem Yapılıyor...' : 'Tahmin Oluştur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}