// Base Network Contract Configuration
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84532;

export const CONTRACT_ADDRESSES = {
  [BASE_MAINNET_CHAIN_ID]: {
    predictionMarket: '0x0000000000000000000000000000000000000000',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    usdt: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  },
  [BASE_TESTNET_CHAIN_ID]: {
    // YENİ KONTRA ADRESİNİ BURAYA YAPIŞTIRDIK
    predictionMarket: '0xC2F35E9414b7FcA3f1aCa9D980a8e1c2aF7805b7', 
    
    // Token adresleri zaten doğru (Test USDC)
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', 
    usdt: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', 
  },
};

export const RPC_URLS = {
  [BASE_MAINNET_CHAIN_ID]: 'https://mainnet.base.org',
  [BASE_TESTNET_CHAIN_ID]: 'https://sepolia.base.org',
};

export const EXPLORER_URLS = {
  [BASE_MAINNET_CHAIN_ID]: 'https://basescan.org',
  [BASE_TESTNET_CHAIN_ID]: 'https://sepolia.basescan.org',
};

export function getContractAddress(chainId: number, contractName: 'predictionMarket' | 'usdc' | 'usdt'): string {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID];
  
  if (chainId === BASE_MAINNET_CHAIN_ID && contractName === 'predictionMarket') {
      return CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID][contractName];
  }

  return addresses[contractName];
}

export function getRpcUrl(chainId: number): string {
  const url = RPC_URLS[chainId as keyof typeof RPC_URLS];
  return url || RPC_URLS[BASE_TESTNET_CHAIN_ID];
}

export function getExplorerUrl(chainId: number): string {
  const url = EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS];
  return url || EXPLORER_URLS[BASE_TESTNET_CHAIN_ID];
}