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
import { getEthereumProvider } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

// --- GARANTİ ADRESLER (Base Sepolia) ---
const PREDICTION_MARKET_ADDRESS = "0xC2F35E9414b7FcA3f1aCa9D980a8e1c2aF7805b7";
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const USDT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Test kolaylığı için aynı adres

// Hedef Ağ: Base Sepolia
const TARGET_CHAIN_ID = 84532;
const TARGET_CHAIN_HEX = "0x14a34"; // 84532 in hex

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
  
  const [isApproving, setIsApproving] = useState(false);

  const createPrediction = useCreatePrediction();
  const { data: balance } = useGetCallerBalance();
  const walletState = useWallet();

  // AĞ DEĞİŞTİRME YARDIMCISI
  const switchNetwork = async (provider: any) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_HEX }],
      });
    } catch (switchError: any) {
      // Ağ ekli değilse eklemeyi dene
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: TARGET_CHAIN_HEX,
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addError) {
          throw new Error("Ağ eklenemedi. Lütfen manuel olarak Base Sepolia ağına geçin.");
        }
      } else {
        throw switchError;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletState.isConnected || !walletState.address) {
      toast.error('Lütfen önce cüzdanınızı bağlayın');
      return;
    }
    if (!threshold || Number(threshold) <= 0) return toast.error('Geçerli bir eşik değeri girin');
    if (!amount || Number(amount) <= 0) return toast.error('Geçerli bir bahis miktarı girin');

    setIsApproving(true);

    try {
      const ethereum = getEthereumProvider();
      if (!ethereum) throw new Error("Cüzdan bulunamadı.");

      const provider = new ethers.BrowserProvider(ethereum);
      
      // 1. AĞ KONTROLÜ VE OTOMATİK GEÇİŞ
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== TARGET_CHAIN_ID) {
        console.log(`Yanlış ağ (${network.chainId}). Base Sepolia'ya geçiliyor...`);
        toast.info("Doğru ağa geçiliyor, lütfen cüzdanı onaylayın...");
        await switchNetwork(ethereum);
        // Ağ değişiminin tamamlanması için kısa bir bekleme
        await new Promise(r => setTimeout(r, 1000));
      }

      // Provider'ı yenile (Ağ değişince signer değişebilir)
      const updatedProvider = new ethers.BrowserProvider(getEthereumProvider());
      const signer = await updatedProvider.getSigner();

      const tokenAddress = tokenType === TokenType.usdc ? USDC_ADDRESS : USDT_ADDRESS;
      const predictionMarketAddress = PREDICTION_MARKET_ADDRESS;

      console.log(`Token: ${tokenAddress}`);
      console.log(`Market: ${predictionMarketAddress}`);

      const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
      const decimals = 6; 
      const betAmountBigInt = ethers.parseUnits(amount, decimals);
      const thresholdBigInt = BigInt(Math.floor(Number(threshold) * 100));

      // 2. Allowance Kontrolü
      const currentAllowance = await tokenContract.allowance(walletState.address, predictionMarketAddress);
      
      if (currentAllowance < betAmountBigInt) {
        toast.info("Harcama izni (Approve) bekleniyor...");
        const tx = await tokenContract.approve(predictionMarketAddress, betAmountBigInt);
        console.log("Approve Hash:", tx.hash);
        await tx.wait();
        toast.success("Onay Verildi!");
      }

      // 3. Tahmin Oluşturma
      toast.info("İşlem onayı bekleniyor...");
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
      console.error("Hata Detayı:", error);
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        toast.error("İşlem reddedildi.");
      } else if (error.code === 'BAD_DATA') {
        toast.error("Ağ hatası: Lütfen Base Sepolia ağında olduğunuza emin olun.");
      } else {
        const msg = error.reason || error.message || "Bilinmeyen hata";
        toast.error(`Hata: ${msg.slice(0, 60)}...`);
      }
    } finally {
      setIsApproving(false);
    }
  };

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Eşik Fiyat ($)</Label>
              <Input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="45000.00" />
            </div>
            <div className="space-y-2">
              <Label>Yön</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as PredictionDirection)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={PredictionDirection.above}><div className="flex items-center gap-2"><ArrowUp className="h-4 w-4 text-green-500"/> Yükselir</div></SelectItem>
                  <SelectItem value={PredictionDirection.below}><div className="flex items-center gap-2"><ArrowDown className="h-4 w-4 text-red-500"/> Düşer</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Süre</Label>
            <RadioGroup value={interval} onValueChange={(v) => setInterval(v as TimeInterval)} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value={TimeInterval.oneHour} id="1h" /><Label htmlFor="1h">1 Saat</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value={TimeInterval.twentyFourHours} id="24h" /><Label htmlFor="24h">24 Saat</Label></div>
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