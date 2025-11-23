import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WalletConnect from '../components/WalletConnect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Code, Rocket, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BaseIntegration() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Base Network Entegrasyonu</h2>
        <p className="text-muted-foreground">
          Ethereum Layer 2 çözümü Base üzerinde kripto tahmin sistemi
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Bu sayfa Base network entegrasyonu için hazırlanmıştır. Solidity kontratı ve Farcaster Frame 
          desteği dahildir. Deployment için kontrat dosyasını kullanabilirsiniz.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Cüzdan Bağlantısı
            </CardTitle>
            <CardDescription>
              MetaMask veya uyumlu cüzdan ile Base network'e bağlanın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Smart Contract
            </CardTitle>
            <CardDescription>
              Solidity kontrat şablonu hazır
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-2">Kontrat Dosyası:</p>
              <code className="text-xs text-foreground">
                frontend/src/contracts/PredictionMarket.sol
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Özellikler:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>ERC20 token desteği (USDC/USDT)</li>
                <li>Havuz mekanizması ve komisyon sistemi</li>
                <li>Admin kontrolleri</li>
                <li>Event-based güncellemeler</li>
                <li>Reentrancy koruması</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deployment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="farcaster">Farcaster Frame</TabsTrigger>
          <TabsTrigger value="integration">Entegrasyon</TabsTrigger>
        </TabsList>

        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle>Base Network'e Deploy</CardTitle>
              <CardDescription>
                Kontratı Base network'e deploy etmek için adımlar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">1. Gereksinimler</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Hardhat veya Foundry kurulumu</li>
                    <li>Base network RPC endpoint</li>
                    <li>Deploy için ETH (Base network)</li>
                    <li>USDC ve USDT kontrat adresleri</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">2. Kontrat Deploy</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// Hardhat ile deploy
npx hardhat run scripts/deploy.js --network base

// Foundry ile deploy
forge create PredictionMarket \\
  --rpc-url https://mainnet.base.org \\
  --private-key $PRIVATE_KEY \\
  --constructor-args $USDC_ADDRESS $USDT_ADDRESS`}
                  </pre>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">3. Verify</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`npx hardhat verify --network base \\
  DEPLOYED_CONTRACT_ADDRESS \\
  USDC_ADDRESS USDT_ADDRESS`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farcaster">
          <Card>
            <CardHeader>
              <CardTitle>Farcaster Frame Entegrasyonu</CardTitle>
              <CardDescription>
                Warpcast üzerinde çalışacak Frame yapılandırması
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Frame metadata index.html dosyasına eklenmiştir. Farcaster standartlarına uygun 
                  Open Graph ve fc:frame etiketleri içerir.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">Frame Özellikleri</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Tahmin oluşturma butonu</li>
                    <li>Havuz durumu görüntüleme</li>
                    <li>Kazanç dağıtımı bilgisi</li>
                    <li>Wallet bağlantı desteği</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">Test Etme</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Frame'i test etmek için:
                  </p>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Uygulamayı deploy edin</li>
                    <li>URL'i Warpcast Frame Validator'da test edin</li>
                    <li>Warpcast'te cast olarak paylaşın</li>
                  </ol>
                </div>
              </div>

              <Button className="w-full gap-2">
                <Rocket className="h-4 w-4" />
                Frame Validator'da Aç
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration">
          <Card>
            <CardHeader>
              <CardTitle>Frontend Entegrasyonu</CardTitle>
              <CardDescription>
                Smart contract ile frontend bağlantısı
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">Web3 Provider Kullanımı</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// MetaMask provider ile etkileşim
const provider = window.ethereum;

// Tahmin oluştur
const tx = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: address,
    to: CONTRACT_ADDRESS,
    data: encodedData, // Contract method call
  }],
});`}
                  </pre>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">Event Dinleme</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// Contract event'lerini dinle
const filter = {
  address: CONTRACT_ADDRESS,
  topics: [
    // PredictionCreated event signature
    '0x...'
  ]
};

provider.on('logs', (log) => {
  console.log('Yeni event:', log);
});`}
                  </pre>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="font-medium mb-2">React Query Entegrasyonu</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`import { useQuery, useMutation } from '@tanstack/react-query';

// Pool detaylarını getir
const { data: poolDetails } = useQuery({
  queryKey: ['pool', poolId],
  queryFn: async () => {
    // Contract call ile pool detaylarını al
    return await fetchPoolDetails(poolId);
  }
});

// Tahmin oluştur
const createPrediction = useMutation({
  mutationFn: async (params) => {
    const tx = await sendTransaction(params);
    return tx;
  }
});`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
