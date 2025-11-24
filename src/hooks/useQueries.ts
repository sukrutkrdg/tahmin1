import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";
import { ethers } from "ethers";
import { getEthereumProvider } from "@/lib/utils";

// --- SABİT DEĞERLER (GÜNCELLENDİ) ---
// Az önce deploy ettiğimiz YENİ kontrat adresi
const MARKET_ADDRESS = "0xC2F35E9414b7FcA3f1aCa9D980a8e1c2aF7805b7";

export interface UserProfile { name: string; totalPoints: number; }
export interface UserBalance { usdc: number; usdt: number; }
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
const getDirectionEnum = (dir: PredictionDirection): number => (dir === 'up' ? 0 : 1);
const getIntervalEnum = (interval: TimeInterval): number => (interval === '24h' ? 1 : 0);
const getTokenEnum = (token: TokenType): number => (token === 'usdt' ? 1 : 0);

const MARKET_ABI = [
  "function createPrediction(uint8 _asset, uint256 _threshold, uint8 _direction, uint8 _interval, uint8 _tokenType, uint256 _amount) external returns (uint256)"
];

// --- HOOKS ---

export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prediction: Prediction) => {
      console.log("🚀 Tahmin süreci başladı...");

      const ethereum = getEthereumProvider();
      if (!ethereum) throw new Error("Cüzdan bulunamadı!");

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      console.log(`📝 Hedef Kontrat: ${MARKET_ADDRESS}`);

      const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, signer);

      const params = {
        asset: getAssetEnum(prediction.asset),
        threshold: prediction.threshold,
        direction: getDirectionEnum(prediction.direction),
        interval: getIntervalEnum(prediction.interval),
        tokenType: getTokenEnum(prediction.tokenType),
        amount: prediction.amount
      };

      console.log("📦 Parametreler:", params);

      // Gaz limiti ekleyerek işlemi garantiye alıyoruz
      const tx = await contract.createPrediction(
        params.asset,
        params.threshold,
        params.direction,
        params.interval,
        params.tokenType,
        params.amount,
        { gasLimit: 500000 } // Manuel Gas Limiti
      );

      console.log("✅ İşlem Hash:", tx.hash);
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePredictions"] });
      queryClient.invalidateQueries({ queryKey: ["predictionHistory"] });
      console.log("🎉 Tahmin başarıyla oluşturuldu!");
    },
    onError: (error: any) => {
      console.error("❌ Hata:", error);
    }
  });
}

// Placeholder Functions (Derleme hatası almamak için gerekli)
export function useGetCallerUserProfile() { 
  return useQuery({ queryKey: ["profile"], queryFn: async () => ({ name: "Kullanıcı", totalPoints: 0 }) }); 
}
export function useSaveCallerUserProfile() { return useMutation({ mutationFn: async () => {} }); }
export function useGetCallerBalance() { 
  return useQuery({ queryKey: ["balance"], queryFn: async () => ({ usdc: 1000, usdt: 1000 }) }); 
}
export function useGetActivePredictions() { return useQuery({ queryKey: ["active"], queryFn: async () => [] }); }
export function useGetPredictionHistory() { return useQuery({ queryKey: ["history"], queryFn: async () => [] }); }
export function useGetLeaderboard() { return useQuery({ queryKey: ["leaderboard"], queryFn: async () => [] }); }
export function useDepositFunds() { return useMutation({ mutationFn: async () => {} }); }
export function useWithdrawFunds() { return useMutation({ mutationFn: async () => {} }); }