// Base Network Contract Configuration
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84532;

export const CONTRACT_ADDRESSES = {
  [BASE_MAINNET_CHAIN_ID]: {
    predictionMarket: '0x0000000000000000000000000000000000000000',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet USDC
    usdt: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // Base Mainnet USDT
  },
  [BASE_TESTNET_CHAIN_ID]: {
    // Senin deploy ettiğin kontrat adresi (Değiştirme)
    predictionMarket: '0x69868918e7Bd1117e90fbf27d0dD92010A13Cc8d', 
    // Base Sepolia için Test Tokenları (Faucet Tokenları)
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Resmi Base Sepolia USDC
    usdt: '0x4b25367895206936D4D95693293967941913e9F9', // Testnet USDT (Örnek)
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
  return addresses[contractName];
}