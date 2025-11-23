import { Header } from "./components/Header"; // DÜZELTİLDİ: { } eklendi
import { Footer } from "./components/Footer"; // DÜZELTİLDİ: { } eklendi
import { ProfileSetupModal } from "./components/ProfileSetupModal"; // DÜZELTİLDİ: { } eklendi
import Dashboard from "./pages/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useGetCallerUserProfile } from "./hooks/useQueries";

export default function App() {
  // Simülasyon ortamında giriş durumu varsayılan olarak true
  const isAuthenticated = true;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1">
          {!isAuthenticated ? (
            <div className="container mx-auto px-4 py-16 text-center">
              <div className="mx-auto max-w-2xl">
                <img
                  src="/assets/generated/crypto-dashboard-hero.dim_800x400.png"
                  alt="Kripto Dashboard"
                  className="mb-8 rounded-lg shadow-2xl"
                />
                <h1 className="mb-4 text-4xl font-bold text-foreground">
                  Kripto Tahmin Simülasyonu
                </h1>
                <p className="mb-8 text-lg text-muted-foreground">
                  ETH, BTC ve XRP fiyat hareketleri üzerine tahminler yapın ve puanlar kazanın.
                  Base Network üzerinden başlayın.
                </p>
              </div>
            </div>
          ) : (
            /* ICP Tabs kaldırıldı, direkt Dashboard gösteriliyor */
            <Dashboard />
          )}
        </main>
        <Footer />
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}