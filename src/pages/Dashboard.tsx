import { PriceCards } from '../components/PriceCards'; // DÜZELTİLDİ
import PredictionForm from '../components/PredictionForm'; // Bu "export default" olduğu için { } gerekmez
import { PredictionHistory } from '../components/PredictionHistory'; // DÜZELTİLDİ
import { Leaderboard } from '../components/Leaderboard'; // DÜZELTİLDİ
import { UserStats } from '../components/UserStats'; // DÜZELTİLDİ
import { BalanceManager } from '../components/BalanceManager'; // DÜZELTİLDİ
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Base Tahmin Paneli</h2>
        <p className="text-muted-foreground">Kripto fiyatlarını takip edin ve tahminlerinizi yapın</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <PriceCards />
        </div>
        <div>
          <UserStats />
        </div>
      </div>

      <Tabs defaultValue="predict" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predict">Tahmin Yap</TabsTrigger>
          <TabsTrigger value="balance">Bakiye</TabsTrigger>
          <TabsTrigger value="history">Geçmiş</TabsTrigger>
          <TabsTrigger value="leaderboard">Liderlik</TabsTrigger>
        </TabsList>

        <TabsContent value="predict" className="space-y-6">
          <PredictionForm />
        </TabsContent>

        <TabsContent value="balance">
          <BalanceManager />
        </TabsContent>

        <TabsContent value="history">
          <PredictionHistory />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}