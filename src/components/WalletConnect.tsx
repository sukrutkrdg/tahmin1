import { Button } from '@/components/ui/button';
import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function WalletConnect() {
  const { address, isConnected, isConnecting, error, connect, disconnect, isOnBaseNetwork, switchToBase } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && !isOnBaseNetwork) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Lütfen Base network'e geçin
          </AlertDescription>
        </Alert>
        <Button onClick={switchToBase} className="w-full">
          Base Network'e Geç
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isConnected ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Bağlı Cüzdan</p>
              <p className="text-xs text-muted-foreground">{address && formatAddress(address)}</p>
            </div>
          </div>
          <Button onClick={disconnect} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Bağlantıyı Kes
          </Button>
        </div>
      ) : (
        <Button onClick={connect} disabled={isConnecting} className="w-full gap-2">
          <Wallet className="h-4 w-4" />
          {isConnecting ? 'Bağlanıyor...' : 'Cüzdan Bağla'}
        </Button>
      )}
    </div>
  );
}
