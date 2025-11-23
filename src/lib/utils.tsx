import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// GÜVENLİ PROVIDER SEÇİCİ
export function getEthereumProvider() {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  
  // Eğer birden fazla cüzdan varsa (window.ethereum.providers dizisi),
  // bunların arasından MetaMask olanı bulup döndürür.
  if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
    const provider = window.ethereum.providers.find((p: any) => p.isMetaMask);
    if (provider) return provider;
  }

  // Tek cüzdan varsa direkt onu döndürür
  return window.ethereum;
}