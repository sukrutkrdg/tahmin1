import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// DÜZELTME: Aşağıdaki bileşenler "export default" olduğu için süslü parantez { } KULLANILMAMALI
import PriceCards from '../components/PriceCards'; 
import PredictionForm from '../components/PredictionForm';
import PredictionHistory from '../components/PredictionHistory';
import Leaderboard from '../components/Leaderboard';
import UserStats from '../components/UserStats';
import BalanceManager from '../components/BalanceManager';

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