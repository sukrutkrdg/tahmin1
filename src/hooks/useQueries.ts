import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";
import { ethers } from "ethers";
import { getEthereumProvider } from "@/lib/utils";

// --- SABİT DEĞERLER ---
const MARKET_ADDRESS = "0xC2F35E9414b7FcA3f1aCa9D980a8e1c2aF7805b7"; 

// Contract ABI (Pool Detaylarını çekmek için güncellendi)
const MARKET_ABI = [
  "function createPrediction(uint8 _asset, uint256 _threshold, uint8 _direction, uint8 _interval, uint8 _tokenType, uint256 _amount) external returns (uint256)",
  "function getUserPredictions(address _user) external view returns (tuple(address user, uint8 asset, uint256 threshold, uint8 direction, uint8 interval, uint8 tokenType, uint256 amount, uint256 timestamp, uint256 poolId)[])",
  "function getUserPoints(address _user) external view returns (uint256)",
  "function getPoolDetails(uint256 _poolId) external view returns (uint8 asset, uint256 threshold, uint256 abovePool, uint256 belowPool, bool resolved, uint256 finalPrice)"
];

// Tipler
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
  result?: 'win' | 'loss' | 'pending'; // Sonuç durumu
}

// --- DÖNÜŞTÜRÜCÜLER ---
const parseAsset = (val: number): Asset => {
  if (val === 0) return 'ETH';
  if (val === 1) return 'BTC';
  return 'XRP';
};
const parseDirection = (val: number): PredictionDirection => (val === 0 ? 'up' : 'down');
const parseInterval = (val: number): TimeInterval => (val === 0 ? '1h' : '24h');
const parseToken = (val: number): TokenType => (val === 0 ? 'usdc' : 'usdt');

// --- ENUM DÖNÜŞTÜRÜCÜLERİ (Frontend -> Solidity) ---
const getAssetEnum = (asset: Asset) => (asset === 'ETH' ? 0 : asset === 'BTC' ? 1 : 2);
const getDirectionEnum = (dir: PredictionDirection) => (dir === 'up' ? 0 : 1);
const getIntervalEnum = (interval: TimeInterval) => (interval === '24h' ? 1 : 0);
const getTokenEnum = (token: TokenType) => (token === 'usdt' ? 1 : 0);

// --- HOOKS ---

export function useCreatePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prediction: Prediction) => {
      const ethereum = getEthereumProvider();
      if (!ethereum) throw new Error("Cüzdan bulunamadı!");
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, signer);

      const tx = await contract.createPrediction(
        getAssetEnum(prediction.asset),
        prediction.threshold,
        getDirectionEnum(prediction.direction),
        getIntervalEnum(prediction.interval),
        getTokenEnum(prediction.tokenType),
        prediction.amount,
        { gasLimit: 500000 }
      );
      return await tx.wait();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePredictions"] });
      queryClient.invalidateQueries({ queryKey: ["predictionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    }
  });
}

// --- AKILLI TAHMİN ÇEKME FONKSİYONU ---
export function useGetActivePredictions() {
  return useQuery<Prediction[]>({
    queryKey: ["activePredictions"],
    queryFn: async () => {
      const ethereum = getEthereumProvider();
      if (!ethereum) return [];
      
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, signer);
        const userAddress = await signer.getAddress();

        // 1. Kullanıcının tüm tahminlerini çek
        const userPredictions = await contract.getUserPredictions(userAddress);
        
        // 2. Her bir tahmin için Havuz (Pool) detaylarını sorgula
        // Promise.all kullanarak hepsini paralel yapıyoruz (Hız için)
        const enrichedPredictions = await Promise.all(userPredictions.map(async (item: any) => {
            const poolId = item.poolId;
            const pool = await contract.getPoolDetails(poolId);
            
            const resolved = pool.resolved;      // Havuz bitti mi?
            const finalPrice = pool.finalPrice;  // Bitiş fiyatı ne?
            const threshold = item.threshold;    // Kullanıcının girdiği eşik
            const direction = Number(item.direction); // 0: UP, 1: DOWN

            let result: 'win' | 'loss' | 'pending' = 'pending';

            if (resolved) {
                // Kazananı belirleme mantığı
                const isPriceAbove = finalPrice > threshold;
                
                if (direction === 0 && isPriceAbove) {
                    result = 'win'; // Yukarı dedi ve yukarı çıktı
                } else if (direction === 1 && !isPriceAbove) {
                    result = 'win'; // Aşağı dedi ve aşağı indi
                } else {
                    result = 'loss';
                }
            }

            return {
                asset: parseAsset(Number(item.asset)),
                threshold: item.threshold,
                direction: parseDirection(Number(item.direction)),
                interval: parseInterval(Number(item.interval)),
                tokenType: parseToken(Number(item.tokenType)),
                amount: item.amount,
                timestamp: item.timestamp,
                result: result // Hesaplanan sonuç
            };
        }));

        return enrichedPredictions.reverse(); // En yeniler üstte

      } catch (error) {
        console.error("Tahminler çekilemedi:", error);
        return [];
      }
    },
    refetchInterval: 10000 // 10 saniyede bir güncelle
  });
}

export function useGetPredictionHistory() {
  return useGetActivePredictions();
}

export function useGetCallerUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const ethereum = getEthereumProvider();
      if (!ethereum) return { name: "Misafir", totalPoints: 0 };
      
      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, signer);
        const userAddress = await signer.getAddress();
        
        const points = await contract.getUserPoints(userAddress);
        
        return { 
          name: `${userAddress.slice(0,6)}...${userAddress.slice(-4)}`, 
          totalPoints: Number(points) 
        };
      } catch (e) {
        return { name: "Hata", totalPoints: 0 };
      }
    },
  });
}

// --- PLACEHOLDERLAR ---
export function useSaveCallerUserProfile() { return useMutation({ mutationFn: async () => {} }); }
export function useGetCallerBalance() { 
  return useQuery({ queryKey: ["balance"], queryFn: async () => ({ usdc: 1000, usdt: 1000 }) }); 
}
export function useGetLeaderboard() { return useQuery({ queryKey: ["leaderboard"], queryFn: async () => [] }); }
export function useDepositFunds() { return useMutation({ mutationFn: async () => {} }); }
export function useWithdrawFunds() { return useMutation({ mutationFn: async () => {} }); }