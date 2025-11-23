import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getEthereumProvider } from '@/lib/utils'; // EKLENDİ

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToBase: () => Promise<void>;
  isOnBaseNetwork: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

const BASE_CHAIN_ID = 8453; 
const BASE_TESTNET_CHAIN_ID = 84532;

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // Bağlantı Kontrolü
  useEffect(() => {
    const checkConnection = async () => {
      const provider = getEthereumProvider(); // GÜNCELLENDİ
      
      if (provider) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const chainId = await provider.request({ method: 'eth_chainId' });
            
            setWalletState({
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              isConnected: true,
              isConnecting: false,
              error: null,
            });
          }
        } catch (error: any) {
          console.error('Connection check error:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Olay Dinleyicileri
  useEffect(() => {
    const provider = getEthereumProvider(); // GÜNCELLENDİ

    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setWalletState(prev => ({ ...prev, isConnected: true, address: accounts[0] }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      return () => {
        // Bazı providerlarda removeListener sorunlu olabilir, try-catch içine alalım
        try {
            provider.removeListener('accountsChanged', handleAccountsChanged);
            provider.removeListener('chainChanged', handleChainChanged);
        } catch (e) { console.warn("Listener remove error", e)}
      };
    }
  }, []);

  const connect = useCallback(async () => {
    const provider = getEthereumProvider(); // GÜNCELLENDİ

    if (!provider) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask (veya uyumlu bir cüzdan) bulunamadı.',
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const chainId = await provider.request({ method: 'eth_chainId' });

      setWalletState({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      const currentChainId = parseInt(chainId, 16);
      if (currentChainId !== BASE_CHAIN_ID && currentChainId !== BASE_TESTNET_CHAIN_ID) {
        await switchToBase();
      }
    } catch (error: any) {
      console.error('Connect error:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Bağlantı hatası',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const switchToBase = useCallback(async () => {
    const provider = getEthereumProvider(); // GÜNCELLENDİ
    if (!provider) return;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      }
    }
  }, []);

  const isOnBaseNetwork = walletState.chainId === BASE_CHAIN_ID || walletState.chainId === BASE_TESTNET_CHAIN_ID;

  return (
    <WalletContext.Provider value={{ ...walletState, connect, disconnect, switchToBase, isOnBaseNetwork }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}