const hre = require("hardhat");

async function main() {
  console.log("🚀 PredictionMarket kontratı Base Sepolia ağına (YENİDEN) deploy ediliyor...");

  // --- KESİN DOĞRU TEST ADRESLERİ ---
  // Base Sepolia ağındaki resmi USDC Faucet Token adresi
  // Bu adresi hem USDC hem USDT olarak kullanacağız ki elindeki tek tokenla iki tarafı da test edebilesin.
  const testTokenAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  console.log("Kullanılan Token Adresi (USDC & USDT):", testTokenAddress);

  // Kontrat fabrikasını çağır
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  
  // Deploy işlemini başlat (İki parametreye de aynı adresi veriyoruz)
  const predictionMarket = await PredictionMarket.deploy(testTokenAddress, testTokenAddress);

  // Deploy'un bitmesini bekle
  await predictionMarket.waitForDeployment();

  // Yeni adresi al
  const address = await predictionMarket.getAddress();

  console.log("✅ PredictionMarket başarıyla deploy edildi!");
  console.log("----------------------------------------------------");
  console.log("📜 YENİ KONTRA ADRESİ:", address);
  console.log("----------------------------------------------------");
  console.log("⚠️  LÜTFEN BU ADRESİ KOPYALA VE FRONTEND DOSYALARINA YAPIŞTIR!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy hatası:", error);
    process.exit(1);
  });