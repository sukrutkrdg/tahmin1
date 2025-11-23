import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, BASE_TESTNET_CHAIN_ID } from "@/lib/contractConfig";

// Interface güncellemeleri
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
  amount: bigint; // number yerine bigint olmalı
  threshold: bigint; // number yerine bigint olmalı
  timestamp?: bigint;
  result?: any;
}

// --- ENUM Dönüştürücüler ---
const getAssetEnum = (asset: Asset): number => {
  if (asset === 'ETH') return 0;
  if (asset === 'BTC') return 1;
  if (asset === 'XRP') return 2;
  return 0;
};

const getDirectionEnum = (dir: PredictionDirection): number => {
  return dir === 'up' ? 0 : 1; // 0: ABOVE, 1: BELOW
};

const getIntervalEnum = (interval: TimeInterval): number => {
  return interval === '24h' ? 1 : 0; // 0: 1H, 1: 24H
};

const getTokenEnum = (token: TokenType): number => {
  return token === 'usdt' ? 1 : 0; // 0: USDC, 1: USDT
};

const MARKET_ABI = [
  "function createPrediction(uint8 _asset, uint256 _threshold, uint8 _direction, uint8 _interval, uint8 _tokenType, uint256 _amount) external returns (uint256)"
];

// --- HOOKS ---

export function useCreatePrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prediction: Prediction) => {
      console.log("🚀 Tahmin süreci başladı...");

      if (!window.ethereum) throw new Error("Cüzdan bulunamadı!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      console.log(`🔗 Ağ ID: ${chainId}`);

      // Adresleri al
      const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID];
      
      if (!addresses || !addresses.predictionMarket) {
        throw new Error("Kontrat adresi yapılandırılamadı.");
      }

      console.log(`📝 Kontrat Adresi: ${addresses.predictionMarket}`);

      const contract = new ethers.Contract(addresses.predictionMarket, MARKET_ABI, signer);

      // Parametreleri hazırla
      const params = {
        asset: getAssetEnum(prediction.asset),
        threshold: prediction.threshold,
        direction: getDirectionEnum(prediction.direction),
        interval: getIntervalEnum(prediction.interval),
        tokenType: getTokenEnum(prediction.tokenType),
        amount: prediction.amount
      };

      console.log("📦 Gönderilen Parametreler:", params);

      // İşlemi gönder
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
      console.log("🎉 Tahmin başarıyla oluşturuldu!");
    },
    onError: (error: any) => {
      console.error("❌ Tahmin hatası:", error);
    }
  });
}

// Diğer hooklar (Placeholder veya Mock)
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