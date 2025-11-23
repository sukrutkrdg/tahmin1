import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Asset, PredictionDirection, TimeInterval, TokenType } from "@/types/prediction";

export interface UserProfile {
  name: string;
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
  amount: number;
}

export function useGetCallerUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => ({ name: "Demo Kullanıcı" }),
  });
}

export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      console.log("Profil kaydedildi:", profile);
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetCallerBalance() {
  return useQuery<UserBalance>({
    queryKey: ["callerBalance"],
    queryFn: async () => ({ usdc: 1500, usdt: 1200 }),
    refetchInterval: 5000,
  });
}

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

export function useCreatePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prediction: Prediction) => {
      console.log("Yeni tahmin:", prediction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activePredictions"] });
      queryClient.invalidateQueries({ queryKey: ["predictionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["callerBalance"] });
    },
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