import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, BASE_TESTNET_CHAIN_ID } from "@/lib/contractConfig";

export interface UserProfile {
  name: string;
  totalPoints: number;
}

export interface UserBalance {
  usdc: number;
  usdt: number;
}

export interface Prediction {
  asset: Asset;
  direction: PredictionDirection;
  interval: TimeInterval;
  tokenType: TokenType;
  amount: bigint; 
  threshold: bigint; 
  timestamp?: bigint;
  result?: any;
}

// --- ENUM DÖNÜŞTÜRÜCÜLERİ (Frontend -> Solidity) ---

// Solidity: enum Asset { ETH, BTC, XRP }
const getAssetEnum = (asset: Asset): number => {
  // Asset.btc değeri "BTC" stringidir (types/prediction.ts dosyasından)
  if (asset === 'ETH') return 0;
  if (asset === 'BTC') return 1;
  if (asset === 'XRP') return 2;
  return 0;
};

// Solidity: enum Direction { ABOVE, BELOW }
const getDirectionEnum = (dir: PredictionDirection): number => {
  // 'up' -> ABOVE (0), 'down' -> BELOW (1)
  return dir === 'up' ? 0 : 1; 
};

// Solidity: enum TimeInterval { ONE_HOUR, TWENTY_FOUR_HOURS }
const getIntervalEnum = (interval: TimeInterval): number => {
  // '1h' -> 0, '24h' -> 1
  return interval === '24h' ? 1 : 0; 
};

// Solidity: enum TokenType { USDC, USDT }
const getTokenEnum = (token: TokenType): number => {
  // 'usdc' -> 0, 'usdt' -> 1
  return token === 'usdt' ? 1 : 0; 
};

// Sadece createPrediction fonksiyonu için gerekli ABI
const MARKET_ABI = [
  "function createPrediction(uint8 _asset, uint256 _threshold, uint8 _direction, uint8 _interval, uint8 _tokenType, uint256 _amount) external returns (uint256)"
];

// --- HOOKS ---

export function useGetCallerUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => ({ name: "Demo Kullanıcı", totalPoints: 0 }),
  });
}

export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: { name: string }) => {
      console.log("Profil kaydedildi:", profile);
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Bakiye şimdilik statik, ileride ERC20 balanceOf ile çekilebilir
export function useGetCallerBalance() {
  return useQuery<UserBalance>({
    queryKey: ["callerBalance"],
    queryFn: async () => ({ usdc: 1500, usdt: 1200 }),
    refetchInterval: 5000,
  });
}

// --- ANA İŞLEM: TAHMİN OLUŞTURMA ---
export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prediction: Prediction) => {
      // 1. Cüzdan Kontrolü
      if (!window.ethereum) throw new Error("Cüzdan bulunamadı!");

      // 2. Bağlantı Kurulumu
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // 3. Ağ ve Adres Kontrolü
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Config dosyasından adresleri al
      // Eğer o anki ağ configde yoksa varsayılan olarak Testnet adresini al
      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID];
      
      if (!addresses || !addresses.predictionMarket) {
        throw new Error("Kontrat adresi bulunamadı! Lütfen Base Sepolia ağına geçin.");
      }

      // 4. Kontratı Hazırla
      const contract = new ethers.Contract(addresses.predictionMarket, MARKET_ABI, signer);

      // 5. Değerleri Solidity Formatına Çevir
      const assetId = getAssetEnum(prediction.asset);
      const directionId = getDirectionEnum(prediction.direction);
      const intervalId = getIntervalEnum(prediction.interval);
      const tokenId = getTokenEnum(prediction.tokenType);

      console.log("Kontrata Gönderilen Değerler:", {
        assetId,
        threshold: prediction.threshold.toString(),
        directionId,
        intervalId,
        tokenId,
        amount: prediction.amount.toString()
      });

      // 6. İşlemi Gönder (Burada Cüzdan Açılacak)
      const tx = await contract.createPrediction(
        assetId,
        prediction.threshold,
        directionId,
        intervalId,
        tokenId,
        prediction.amount
      );

      console.log("İşlem Hash:", tx.hash);
      
      // 7. İşlemin Onaylanmasını Bekle
      const receipt = await tx.wait();
      return receipt;
    },
    onSuccess: () => {
      // Başarılı olursa listeleri güncelle
      queryClient.invalidateQueries({ queryKey: ["activePredictions"] });
      queryClient.invalidateQueries({ queryKey: ["predictionHistory"] });
      console.log("Tahmin başarıyla oluşturuldu!");
    },
    onError: (error: any) => {
      console.error("Tahmin oluşturma hatası:", error);
      // Hata detayını yakalamak için
      if (error.reason) console.error("Hata Sebebi:", error.reason);
    }
  });
}

export function useGetActivePredictions() {
  return useQuery<Prediction[]>({
    queryKey: ["activePredictions"],
    queryFn: async () => [],
  });
}

export function useGetPredictionHistory() {
  return useQuery<Prediction[]>({
    queryKey: ["predictionHistory"],
    queryFn: async () => [],
  });
}

export function useGetLeaderboard() {
  return useQuery<Array<{ name: string; points: number }>>({
    queryKey: ["leaderboard"],
    queryFn: async () => [
      { name: "Ali", points: 1200 },
      { name: "Ayşe", points: 950 },
      { name: "Mehmet", points: 870 },
    ],
    refetchInterval: 30000,
  });
}

// Şimdilik boş fonksiyonlar
export function useDepositFunds() { return useMutation({ mutationFn: async () => {} }); }
export function useWithdrawFunds() { return useMutation({ mutationFn: async () => {} }); }