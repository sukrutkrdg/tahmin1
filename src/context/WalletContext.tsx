import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getEthereumProvider } from '@/lib/utils';

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

// HEDEF AĞ: SADECE BASE SEPOLIA (TESTNET)
const TARGET_CHAIN_ID = 84532; 
const TARGET_CHAIN_HEX = `0x${TARGET_CHAIN_ID.toString(16)}`;

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

  const checkChainAndSwitch = async (provider: any) => {
    const chainId = await provider.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);
    
    if (currentChainId !== TARGET_CHAIN_ID) {
      await switchToBase(provider);
    }
    return currentChainId;
  };

  // Başlangıç Kontrolü
  useEffect(() => {
    const checkConnection = async () => {
      const provider = getEthereumProvider();
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
            
            // Eğer yanlış ağdaysa uyar veya değiştirmeyi dene (otomatik zorlama kullanıcı deneyimi için bazen event'e bağlanır)
          }
        } catch (error) {
          console.error('Connection error:', error);
        }
      }
    };
    checkConnection();
  }, []);

  // Event Listener
  useEffect(() => {
    const provider = getEthereumProvider();
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) disconnect();
        else setWalletState(prev => ({ ...prev, isConnected: true, address: accounts[0] }));
      };
      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      };

      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      return () => {
        try {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
        } catch(e) {}
      };
    }
  }, []);

  const connect = useCallback(async () => {
    const provider = getEthereumProvider();
    if (!provider) {
      setWalletState(prev => ({ ...prev, error: 'MetaMask bulunamadı.' }));
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

      // Bağlanınca ağı kontrol et ve gerekirse değiştir
      const currentChainId = parseInt(chainId, 16);
      if (currentChainId !== TARGET_CHAIN_ID) {
        await switchToBase(provider);
      }

    } catch (error: any) {
      console.error(error);
      setWalletState(prev => ({ ...prev, isConnecting: false, error: error.message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletState({ address: null, chainId: null, isConnected: false, isConnecting: false, error: null });
  }, []);

  const switchToBase = useCallback(async (providerParam?: any) => {
    const provider = providerParam || getEthereumProvider();
    if (!provider) return;

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_HEX }],
      });
    } catch (error: any) {
      // Ağ ekli değilse ekle
      if (error.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: TARGET_CHAIN_HEX,
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      }
    }
  }, []);

  const isOnBaseNetwork = walletState.chainId === TARGET_CHAIN_ID;

  return (
    <WalletContext.Provider value={{ ...walletState, connect, disconnect, switchToBase, isOnBaseNetwork }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
}