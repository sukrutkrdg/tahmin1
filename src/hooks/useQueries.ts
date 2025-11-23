import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, BASE_TESTNET_CHAIN_ID } from "@/lib/contractConfig";
import { getEthereumProvider } from "@/lib/utils";

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

// --- ENUM DÖNÜŞTÜRÜCÜLERİ ---
const getAssetEnum = (asset: Asset): number => {
  if (asset === 'ETH') return 0;
  if (asset === 'BTC') return 1;
  if (asset === 'XRP') return 2;
  return 0;
};

const getDirectionEnum = (dir: PredictionDirection): number => {
  return dir === 'up' ? 0 : 1; 
};

const getIntervalEnum = (interval: TimeInterval): number => {
  return interval === '24h' ? 1 : 0; 
};

const getTokenEnum = (token: TokenType): number => {
  return token === 'usdt' ? 1 : 0; 
};

// ABI
const MARKET_ABI = [
  "function createPrediction(uint8 _asset, uint256 _threshold, uint8 _direction, uint8 _interval, uint8 _tokenType, uint256 _amount) external returns (uint256)"
];

// --- HOOKS (TAM LİSTE) ---

// 1. Tahmin Oluşturma (Ana Fonksiyon)
export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prediction: Prediction) => {
      console.log("🚀 Tahmin süreci başladı...");

      const ethereum = getEthereumProvider();
      if (!ethereum) throw new Error("Cüzdan bulunamadı!");

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID];
      
      if (!addresses || !addresses.predictionMarket) {
        throw new Error("Kontrat adresi bulunamadı!");
      }

      const contract = new ethers.Contract(addresses.predictionMarket, MARKET_ABI, signer);

      const params = {
        asset: getAssetEnum(prediction.asset),
        threshold: prediction.threshold,
        direction: getDirectionEnum(prediction.direction),
        interval: getIntervalEnum(prediction.interval),
        tokenType: getTokenEnum(prediction.tokenType),
        amount: prediction.amount
      };

      console.log("📦 Parametreler:", params);

      const tx = await contract.createPrediction(
        params.asset,
        params.threshold,
        params.direction,
        params.interval,
        params.tokenType,
        params.amount
      );

      console.log("✅ İşlem Hash:", tx.hash);
      const receipt = await tx.wait();
      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePredictions"] });
      queryClient.invalidateQueries({ queryKey: ["predictionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["callerBalance"] });
    },
    onError: (error: any) => {
      console.error("❌ Hata:", error);
    }
  });
}

// 2. Profil Getir (Placeholder)
export function useGetCallerUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => ({ name: "Demo Kullanıcı", totalPoints: 1250 }),
  });
}

// 3. Profil Kaydet (Placeholder)
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

// 4. Bakiye Getir (Placeholder)
export function useGetCallerBalance() {
  return useQuery<UserBalance>({
    queryKey: ["callerBalance"],
    queryFn: async () => ({ usdc: 1500, usdt: 1200 }),
    refetchInterval: 5000,
  });
}

// 5. Para Yatır (Placeholder)
export function useDepositFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tokenType, amount }: { tokenType: TokenType; amount: bigint }) => {
      console.log(`${amount} ${tokenType.toUpperCase()} yatırıldı`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerBalance"] });
    },
  });
}

// 6. Para Çek (Placeholder)
export function useWithdrawFunds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tokenType, amount }: { tokenType: TokenType; amount: bigint }) => {
      console.log(`${amount} ${tokenType.toUpperCase()} çekildi`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerBalance"] });
    },
  });
}

// 7. Aktif Tahminler (Placeholder)
export function useGetActivePredictions() {
  return useQuery<Prediction[]>({
    queryKey: ["activePredictions"],
    queryFn: async () => [],
  });
}

// 8. Tahmin Geçmişi (Placeholder)
export function useGetPredictionHistory() {
  return useQuery<Prediction[]>({
    queryKey: ["predictionHistory"],
    queryFn: async () => [],
  });
}

// 9. Liderlik Tablosu (Placeholder)
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