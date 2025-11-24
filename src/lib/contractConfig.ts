// Zincir ID'leri
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84532;

export const CONTRACT_ADDRESSES = {
  // Mainnet olsa bile kodun kırılmaması için şimdilik boş string yerine
  // Testnet adreslerini koyuyoruz veya kullanıcıyı uyarıyoruz.
  [BASE_MAINNET_CHAIN_ID]: {
    predictionMarket: '0x0000000000000000000000000000000000000000', // Mainnet'te yok
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 
    usdt: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  },
  [BASE_TESTNET_CHAIN_ID]: {
    // Senin deploy ettiğin kontrat (BU ÇOK ÖNEMLİ)
    predictionMarket: '0x69868918e7Bd1117e90fbf27d0dD92010A13Cc8d', 
    
    // Base Sepolia Resmi Test Tokenları
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', 
    usdt: '0x4b25367895206936D4D95693293967941913e9F9', 
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
  // Eğer kullanıcı Mainnet'teyse ve biz Testnet'i zorunlu kılıyorsak,
  // yine de uygulamanın çökmemesi için varsayılan olarak Testnet adresini döndürelim.
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || CONTRACT_ADDRESSES[BASE_TESTNET_CHAIN_ID];
  
  // Eğer Mainnet'te isek ve predictionMarket 0x000... ise, Testnet'i kullanmaya zorlayalım
  if (chainId === BASE_MAINNET_CHAIN_ID && contractName === 'predictionMarket') {
      console.warn("Mainnet üzerindesiniz ancak kontrat Testnet'te. Adresler Testnet'ten çekiliyor.");
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