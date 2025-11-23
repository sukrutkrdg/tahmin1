
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <span className="text-xl font-bold text-primary-foreground">₿</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Kripto Tahmin</h1>
            <p className="text-xs text-muted-foreground">Simülasyon Platformu</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground">{Number(userProfile.totalPoints)} Puan</p>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant={isAuthenticated ? 'outline' : 'default'}
            className="gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
