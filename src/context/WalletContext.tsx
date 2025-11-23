import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Tipler
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

// Context Oluşturma
const WalletContext = createContext<WalletContextType | null>(null);

// Sabitler
const BASE_CHAIN_ID = 8453; // Base Mainnet
const BASE_TESTNET_CHAIN_ID = 84532; // Base Sepolia

// Global Window arayüzü
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

  // Başlangıçta bağlantı kontrolü
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            setWalletState({
              address: accounts[0],
              chainId: parseInt(chainId, 16),
              isConnected: true,
              isConnecting: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Olay dinleyicileri (Account/Chain changes)
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setWalletState(prev => ({
            ...prev,
            isConnected: true,
            address: accounts[0],
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16),
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask yüklü değil. Lütfen MetaMask yükleyin.',
      }));
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      setWalletState({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      // Base ağına geçiş kontrolü
      const currentChainId = parseInt(chainId, 16);
      if (currentChainId !== BASE_CHAIN_ID && currentChainId !== BASE_TESTNET_CHAIN_ID) {
        await switchToBase();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Cüzdan bağlantısı başarısız',
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
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Base network:', addError);
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

// Hook'u buradan export edelim
export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}