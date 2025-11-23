import { useState } from 'react';
import { useDepositFunds, useWithdrawFunds, useGetCallerBalance } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TokenType } from '@/types/token';
import { toast } from 'sonner';
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function BalanceManager() {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositToken, setDepositToken] = useState<TokenType>(TokenType.usdc);
  const [withdrawToken, setWithdrawToken] = useState<TokenType>(TokenType.usdc);

  const depositFunds = useDepositFunds();
  const withdrawFunds = useWithdrawFunds();
  const { data: balance } = useGetCallerBalance();

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      toast.error('Lütfen geçerli bir miktar girin');
      return;
    }

    try {
      await depositFunds.mutateAsync({
        tokenType: depositToken,
        amount: BigInt(Math.floor(Number(depositAmount))),
      });

      toast.success(`${Number(depositAmount).toLocaleString()} ${depositToken === TokenType.usdc ? 'USDC' : 'USDT'} yatırıldı`);
      setDepositAmount('');
    } catch (error: any) {
      toast.error('Para yatırma işlemi başarısız');
      console.error(error);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      toast.error('Lütfen geçerli bir miktar girin');
      return;
    }

    try {
      await withdrawFunds.mutateAsync({
        tokenType: withdrawToken,
        amount: BigInt(Math.floor(Number(withdrawAmount))),
      });

      toast.success(`${Number(withdrawAmount).toLocaleString()} ${withdrawToken === TokenType.usdc ? 'USDC' : 'USDT'} çekildi`);
      setWithdrawAmount('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Para çekme işlemi başarısız';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const usdcBalance = balance ? Number(balance.usdc) : 0;
  const usdtBalance = balance ? Number(balance.usdt) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Bakiye Yönetimi
        </CardTitle>
        <CardDescription>
          Demo USDC ve USDT yatırın veya çekin (Simülasyon)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Para Yatır</TabsTrigger>
            <TabsTrigger value="withdraw">Para Çek</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit">
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-2">
                <Label>Token Seçin</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositToken(TokenType.usdc)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                      depositToken === TokenType.usdc
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src="/assets/generated/usdc-icon-transparent.dim_64x64.png" alt="USDC" className="h-6 w-6" />
                    <div className="text-left">
                      <p className="font-medium text-sm">USDC</p>
                      <p className="text-xs text-muted-foreground">{usdcBalance.toLocaleString()}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositToken(TokenType.usdt)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                      depositToken === TokenType.usdt
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src="/assets/generated/usdt-icon-transparent.dim_64x64.png" alt="USDT" className="h-6 w-6" />
                    <div className="text-left">
                      <p className="font-medium text-sm">USDT</p>
                      <p className="text-xs text-muted-foreground">{usdtBalance.toLocaleString()}</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAmount">Miktar</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Örn: 1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={depositFunds.isPending}>
                <ArrowDownToLine className="h-4 w-4" />
                {depositFunds.isPending ? 'Yatırılıyor...' : 'Para Yatır'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="withdraw">
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label>Token Seçin</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawToken(TokenType.usdc)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                      withdrawToken === TokenType.usdc
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src="/assets/generated/usdc-icon-transparent.dim_64x64.png" alt="USDC" className="h-6 w-6" />
                    <div className="text-left">
                      <p className="font-medium text-sm">USDC</p>
                      <p className="text-xs text-muted-foreground">{usdcBalance.toLocaleString()}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawToken(TokenType.usdt)}
                    className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                      withdrawToken === TokenType.usdt
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src="/assets/generated/usdt-icon-transparent.dim_64x64.png" alt="USDT" className="h-6 w-6" />
                    <div className="text-left">
                      <p className="font-medium text-sm">USDT</p>
                      <p className="text-xs text-muted-foreground">{usdtBalance.toLocaleString()}</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Miktar</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Örn: 500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={withdrawFunds.isPending}>
                <ArrowUpFromLine className="h-4 w-4" />
                {withdrawFunds.isPending ? 'Çekiliyor...' : 'Para Çek'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
