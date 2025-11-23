import { useWalletContext } from '../context/WalletContext';

// Artık tek satır! Bütün bileşenler aynı veriyi görecek.
export const useWallet = () => {
  return useWalletContext();
};