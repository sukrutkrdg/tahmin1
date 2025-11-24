import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ÇAKIŞMA ÖNLEYİCİ FONKSİYON
export function getEthereumProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  
  // Eğer birden fazla cüzdan varsa MetaMask'ı seç
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    const provider = window.ethereum.providers.find((p: any) => p.isMetaMask);
    if (provider) return provider;
  }

  // Tek cüzdan varsa onu döndür
  return window.ethereum;
}