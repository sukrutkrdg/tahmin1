// Import ekle
import { parseUnits, Contract } from "ethers"; 

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // ... Validasyonlar ...

  // 1. DECIMALS DUZELTMESI
  // USDC ve USDT genellikle 6 decimaldir (Base ağında kontrol etmen gerekebilir, genelde 6)
  const decimals = 6; 
  const betAmountRaw = parseUnits(amount, decimals); // Örn: "100" -> 100000000n

  try {
    // 2. APPROVE MEKANIZMASI
    // Burada cüzdanın signer'ını ve token kontratını almalısın
    if (walletState.isConnected && walletState.address) {
       const provider = new ethers.BrowserProvider(window.ethereum);
       const signer = await provider.getSigner();
       
       // Seçilen tokenın kontrat adresi
       const tokenAddress = tokenType === TokenType.usdc ? USDC_ADDRESS : USDT_ADDRESS;
       const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
       
       // Kullanıcının mevcut iznini (allowance) kontrol et
       const currentAllowance = await tokenContract.allowance(walletState.address, PREDICTION_MARKET_ADDRESS);
       
       if (currentAllowance < betAmountRaw) {
           toast.info("Lütfen cüzdanınızdan harcama iznini onaylayın...");
           const tx = await tokenContract.approve(PREDICTION_MARKET_ADDRESS, betAmountRaw);
           await tx.wait(); // İşlemin blokzincire yazılmasını bekle
           toast.success("Onay verildi! Bahis oluşturuluyor...");
       }
    }

    // 3. CREATE PREDICTION
    await createPrediction.mutateAsync({
      // ... diğer parametreler
      amount: betAmountRaw, // Düzeltilmiş miktar gönderiliyor
      // ...
    });

  } catch (error: any) {
     // ... Hata yönetimi
  }
};