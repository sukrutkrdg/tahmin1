import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Wallet, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet'; // ICP yerine useWallet kullanıyoruz
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Header() {
  // ICP hook'unu sildik. Yerine Base cüzdan hook'unu ekledik.
  const { connect, disconnect, address, isConnected, isConnecting } = useWallet();
  
  // Bu kısım backend olmadığı için şimdilik mock (sahte) veri dönebilir
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Alanı */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <span className="text-xl font-bold text-white">₿</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Base Tahmin</h1>
            <p className="text-xs text-muted-foreground">Kripto Simülasyonu</p>
          </div>
        </div>

        {/* Sağ Taraf: Cüzdan ve Profil */}
        <div className="flex items-center gap-4">
          {isConnected && address && (
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                   {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                {userProfile && (
                  <p className="text-xs text-muted-foreground">{Number(userProfile.totalPoints || 0)} Puan</p>
                )}
              </div>
            </div>
          )}
          
          {isConnected ? (
            <Button
              onClick={disconnect}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          ) : (
            <Button
              onClick={connect}
              disabled={isConnecting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isConnecting ? (
                <span>Bağlanıyor...</span>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Cüzdan Bağla</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}