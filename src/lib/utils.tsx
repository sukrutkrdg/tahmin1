import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// BU FONKSİYONU EKLEMEZSEN HATA ALIRSIN
export function getEthereumProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  
  // Birden fazla cüzdan varsa (Backpack, Phantom vb.) MetaMask'ı bul
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    const provider = window.ethereum.providers.find((p: any) => p.isMetaMask);
    if (provider) return provider;
  }

  // Tek cüzdan varsa onu döndür
  return window.ethereum;
}