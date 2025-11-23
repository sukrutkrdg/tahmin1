import Header from "./components/Header";
import Footer from "./components/Footer";
import ProfileSetupModal from "./components/ProfileSetupModal";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { useWallet } from "./hooks/useWallet";

export default function App() {
  // Cüzdan bağlantı durumunu gerçek hook'tan alıyoruz
  const { isConnected } = useWallet();
  
  // Profil verisini çekiyoruz (Backend olmadığı için mock dönecektir)
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  // Profil kurulum modalı: Bağlıysa, yükleme bittiyse ve profil verisi yoksa gösterilir
  const showProfileSetup = isConnected && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {!isConnected ? (
            // DURUM 1: Cüzdan Bağlı Değil -> Karşılama Ekranı (Landing Page)
            <div className="container mx-auto px-4 py-16 text-center">
              <div className="mx-auto max-w-2xl">
                <img
                  src="/assets/generated/crypto-dashboard-hero.dim_800x400.png"
                  alt="Kripto Dashboard"
                  className="mb-8 rounded-lg shadow-2xl mx-auto"
                />
                <h1 className="mb-4 text-4xl font-bold text-foreground">
                  Kripto Tahmin Simülasyonu
                </h1>
                <p className="mb-8 text-lg text-muted-foreground">
                  ETH, BTC ve XRP fiyat hareketleri üzerine tahminler yapın ve puanlar kazanın.
                  Tamamen Base Network üzerinde çalışır.
                </p>
                <div className="rounded-lg border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4">
                  <p className="text-muted-foreground font-medium">
                    🚀 Başlamak için sağ üst köşedeki <span className="text-primary">"Cüzdan Bağla"</span> butonuna tıklayın.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // DURUM 2: Cüzdan Bağlı -> Ana Uygulama (Dashboard)
            <Dashboard />
          )}
        </main>

        <Footer />
        
        {/* Gerekirse Profil Modalını Göster */}
        {showProfileSetup && <ProfileSetupModal />}
        
        {/* Bildirim Baloncukları */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}