// Base Network Contract Configuration
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84532;

// Contract Addresses (Deploy sonrası güncelleme yapıldı)
export const CONTRACT_ADDRESSES = {
  [BASE_MAINNET_CHAIN_ID]: {
    predictionMarket: '0x0000000000000000000000000000000000000000', // Henüz mainnet deploy yapılmadı
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet USDC
    usdt: '0x0000000000000000000000000000000000000000', // Base Mainnet USDT (deploy sonrası güncelle)
  },
  [BASE_TESTNET_CHAIN_ID]: {
    predictionMarket: '0x69868918e7Bd1117e90fbf27d0dD92010A13Cc8d', // Deploy edilen kontrat
    usdc: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // Testnet USDC
    usdt: '0xb20a893fb1ef6d46d97e6dafb0a3d2e0a6af6c3e', // Testnet USDT
  },
};

// RPC Endpoints
export const RPC_URLS = {
  [BASE_MAINNET_CHAIN_ID]: 'https://mainnet.base.org',
  [BASE_TESTNET_CHAIN_ID]: 'https://sepolia.base.org',
};

// Block Explorer URLs
export const EXPLORER_URLS = {
  [BASE_MAINNET_CHAIN_ID]: 'https://basescan.org',
  [BASE_TESTNET_CHAIN_ID]: 'https://sepolia.basescan.org',
};

// Helper function to get contract address for current chain
export function getContractAddress(chainId: number, contractName: 'predictionMarket' | 'usdc' | 'usdt'): string {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses[contractName];
}

// Helper function to get RPC URL for chain
export function getRpcUrl(chainId: number): string {
  const url = RPC_URLS[chainId as keyof typeof RPC_URLS];
  if (!url) {
    throw new Error(`No RPC URL for chain ID: ${chainId}`);
  }
  return url;
}

// Helper function to get explorer URL for chain
export function getExplorerUrl(chainId: number): string {
  const url = EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS];
  if (!url) {
    throw new Error(`No explorer URL for chain ID: ${chainId}`);
  }
  return url;
}