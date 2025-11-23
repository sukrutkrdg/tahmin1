import Header from "./components/Header";
import Footer from "./components/Footer";
import ProfileSetupModal from "./components/ProfileSetupModal";
import Dashboard from "./pages/Dashboard";
import BaseIntegration from "./pages/BaseIntegration";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
                <div className="rounded-lg border border-border bg-card p-6">
                  <p className="text-muted-foreground">
                    Lütfen devam etmek için yukarıdaki "Giriş Yap" butonuna tıklayın.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="container mx-auto px-4 py-8">
              <Tabs defaultValue="base" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto">
                  <TabsTrigger value="base">Base Network</TabsTrigger>
                </TabsList>

                <TabsContent value="base">
                  <BaseIntegration />
                </TabsContent>

                <TabsContent value="ic">
                  <Dashboard />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
        <Footer />
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}